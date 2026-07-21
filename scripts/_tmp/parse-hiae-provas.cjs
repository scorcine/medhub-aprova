/**
 * Parse HIAE / Einstein PDFs (text extracts) → packs + area overrides + auditoria.
 * NÃO escreve no banco de questões — só Prova na íntegra + relatório de áreas.
 *
 * Contagens esperadas: 2021 = 50 Q (A–E); 2022–2026 = 75 Q (A–D).
 */
const fs = require("fs");
const path = require("path");

const EXTRACT_DIR = path.join(__dirname, "hiae-extract");
const OUT_DIR = path.join(__dirname, "..", "..", "data", "provas");
const OVR_DIR = path.join(OUT_DIR, "area-overrides");
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const EXAM_ID = "einstein";
const EXAM_LABEL = "Einstein (HIAE)";
const MANUAL_PATH = path.join(__dirname, "einstein-manual-areas.json");
let MANUAL = Object.create(null);
try {
  const raw = JSON.parse(fs.readFileSync(MANUAL_PATH, "utf8"));
  Object.keys(raw || {}).forEach((k) => {
    if (k.startsWith("_")) return;
    MANUAL[k] = raw[k];
  });
} catch {
  MANUAL = Object.create(null);
}

const THEME_LABEL = {
  clinica: "Clínica médica",
  cirurgia: "Cirurgia",
  pediatria: "Pediatria",
  go: "GO",
  preventiva: "Preventiva"
};

const NOISE = [
  /^Fernando Walendzus/i,
  /^Acessar Lista/i,
  /^HIAE\s+\d{4}/i,
  /^HIAE\s+\d{4}\s+R1/i,
  /^SP\s*-\s*Hospital Israelita/i,
  /^Hospital Israelita Albert Einstein/i,
  /^Fundação Carlos Chagas/i,
  /^Fundação VUNESP/i,
  /^Resid[eê]ncia \(Acesso Direto\)/i,
  /^Acesso Direto \(R1\)/i,
  /^N[aã]o se aplica/i,
  /^Privado$/i,
  /^\d+\s+anos$/i,
  /^Essa quest[aã]o possui coment/i,
  /^--\s*\d+\s+of\s+\d+\s*--/
];

function cleanLine (line) {
  return String(line || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    // OCR: % no lugar de fi/fl
    .replace(/insu%ci/gi, "insufici")
    .replace(/%bromialgia/gi, "fibromialgia")
    .replace(/%ssi/gi, "fisi")
    .replace(/%gur/gi, "figur")
    .replace(/de%ni/gi, "defini")
    .replace(/re%n/gi, "refin")
    .replace(/co%rm/gi, "confirm")
    .replace(/a%rm/gi, "afirm")
    .replace(/(%ci[eê]ncia|%ci[eê]ncia)/gi, "ciência")
    .replace(/\bdi1cul/gi, "dificul")
    .replace(/\bpro1ss/gi, "profiss")
    .replace(/\b1nitude\b/gi, "finitude")
    .replace(/\binSuenza\b/gi, "influenza")
    .replace(/\bSuido\b/gi, "fluido")
    .replace(/\bposo\b/gi, "peso")
    .replace(/\bCAPES\b/g, "CAPS")
    .replace(/\barresponsiva\b/gi, "arresponsiva")
    .replace(/\bBlho\b/g, "filho")
    .replace(/\bBlha\b/g, "filha")
    .replace(/\bp[oó]snatais\b/gi, "pós-natais")
    .replace(/\bmultiprofisional\b/gi, "multiprofissional")
    .trim();
}

function isNoise (line) {
  const s = cleanLine(line);
  if (!s) return true;
  if (/^\d{4}$/.test(s)) return true;
  if (NOISE.some((re) => re.test(s))) return true;
  if (/^https?:\/\//i.test(s)) return true;
  if ((s.match(/\b202[1-6]\b/g) || []).length >= 3) return true;
  return false;
}

function isMetaDumpLine (s) {
  const t = String(s || "");
  if (/Fundação VUNESP|Fundação Carlos Chagas|Hospital Israelita|Albert Einstein|\bHIAE\b|Não se aplica|Acesso Direto \(R1\)|Residência \(Acesso Direto\)|Privado/i.test(t)) return true;
  if (/^(?:\d{4}\s*)+$/.test(t)) return true;
  return false;
}

function parseGabarito (text) {
  const idx = text.lastIndexOf("Respostas:");
  if (idx < 0) return {};
  const gab = text.slice(idx);
  const map = Object.create(null);
  const re = /(\d+)\s+([A-EX*]|Anulad\w*)/gi;
  let m;
  while ((m = re.exec(gab))) {
    const n = Number(m[1]);
    let letter = String(m[2]).trim().toUpperCase();
    let annulled = false;
    if (/^ANULAD/i.test(letter) || letter === "X" || letter === "*") {
      annulled = true;
      letter = "";
    }
    map[n] = { letter, annulled };
  }
  return map;
}

function splitQuestions (text) {
  const body = text.split(/Respostas:/i)[0] || text;
  const parts = body.split(/Quest[ãa]o\s+(\d+)\s*/i);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    const num = Number(parts[i]);
    const content = parts[i + 1] || "";
    if (Number.isFinite(num)) out.push({ num, content });
  }
  return out;
}

function matchChoiceLine (line) {
  // Exige tab (evita falso positivo em "A abordagem…")
  return line.match(/^([A-E])(?: \t|\t)(.+)$/);
}

function extractChoices (block) {
  const rawLines = String(block || "").split(/\n/);
  let start = -1;
  for (let i = 0; i < rawLines.length; i++) {
    const m = matchChoiceLine(rawLines[i].replace(/\r$/, ""));
    if (m && m[1] === "A") {
      start = i;
      break;
    }
  }
  if (start < 0) {
    return {
      stemLines: rawLines.map(cleanLine).filter((l) => !isNoise(l) && !isMetaDumpLine(l)),
      choices: []
    };
  }

  const stemLines = [];
  for (let i = 0; i < start; i++) {
    const s = cleanLine(rawLines[i]);
    if (!isNoise(s) && !isMetaDumpLine(s)) stemLines.push(s);
  }

  const alt = [];
  let curLetter = null;
  let curText = "";
  const flush = () => {
    if (!curLetter) return;
    let text = curText.replace(/\s+/g, " ").trim();
    text = text.replace(/\s*Essa quest[aã]o possui coment[\s\S]*$/i, "").trim();
    if (text) alt.push({ letter: curLetter, text });
    curLetter = null;
    curText = "";
  };

  for (const raw of rawLines.slice(start)) {
    const lineRaw = raw.replace(/\r$/, "");
    const line = cleanLine(lineRaw);
    if (/^Essa quest[aã]o possui coment/i.test(line)) break;
    const hm = matchChoiceLine(lineRaw);
    if (hm) {
      flush();
      curLetter = hm[1];
      curText = cleanLine(hm[2]);
      continue;
    }
    if (curLetter && !isNoise(line) && !isMetaDumpLine(line)) {
      curText += " " + line;
    }
  }
  flush();

  const choices = [];
  for (let i = 0; i < alt.length; i++) {
    const expected = String.fromCharCode(65 + i);
    if (alt[i].letter !== expected) break;
    choices.push(alt[i].text);
  }
  return { stemLines, choices };
}

function expectedAltCount (year, gabMap) {
  let max = 0;
  Object.keys(gabMap || {}).forEach((k) => {
    const L = gabMap[k] && gabMap[k].letter;
    if (L && L >= "A" && L <= "E") max = Math.max(max, L.charCodeAt(0) - 64);
  });
  if (max >= 5) return 5;
  if (max === 4) return 4;
  // Einstein: 2021 = 5 alts; demais anos = 4
  return Number(year) === 2021 ? 5 : 4;
}

const SPEC_TAG =
  /^(?:Ginecologia(?: e Obstetrícia)?|Obstetrícia|Psiquiatria|Cirurgia(?: Geral| Básica| Cardiovascular| Pediátrica| Vascular)?|Ortopedia(?: e Traumatologia)?|Oftalmologia|Otorrinolaringologia|Pediatria|Patologia|Medicina de Emergência|Medicina Preventiva|Medicina da Família(?: e Comunidade)?|Medicina de Família|Medicina do Trabalho|Neurocirurgia|Neurologia|Anestesiologia|Infectologia|Radiologia(?: e Diagnóstico por Imagem)?|Cardiologia|Hepatologia|Hematologia(?: Pediátrica)?|Pneumologia|Clínica Médica|Dermatologia|Urologia|Endocrinologia|Nefrologia|Reumatologia|Saúde Pública|Epidemiologia|Mastologia|Público\s*-\s*Municipal|Público\s*-\s*Estadual|\d+\s+anos)\b\s*/i;

const TOPIC_PREFIX =
  /^(?:Diagnóstico diferencial|Doen[cç]a de Kawasaki|Programa Nacional de Imuniza[cç][oõ]es|NR6[^\n]{0,60}|Outras Vigilâncias[^\n]{0,80}|Sistemas de Informa[cç][aã]o[^\n]{0,80}|Vigilância em Sa[uú]de|Índice de Vulnerabilidade[^\n]{0,40}|Hierarquia das Evidências|O sistema GRADE|Medidas de Desempenho[^\n]{0,80}|Medidas de Performance[^\n]{0,80}|Anatomia do Assoalho[^\n]{0,40}|Tratamento cir[uú]rgico|Poliarterite nodosa[^\n]{0,20}|Acidentes Vasculares[^\n]{0,60}|Manejo da Nefropatia[^\n]{0,40}|Indica[cç][oõ]es de rastreio[^\n]{0,40}|Vias A[eé]reas[^\n]{0,60}|Profilaxia do Tromboembolismo[^\n]{0,40}|Trauma Cervical|Doa[cç][aã]o e transplante[^\n]{0,40}|Cardiopatias cong[eê]nitas|Cuidados p[oó]s-?natais|Quadro cl[ií]nico[^\n]{0,60}|Tratamento[^\n]{0,50}|Patologias Auditivas|Audiologia|Exames Audiol[oó]gicos|Transtorno do Humor[^\n]{0,40}|Diagn[oó]stico da Depress[aã]o|Depress[aã]o)\s+/i;

function stripSpecialtyDump (stem) {
  let s = String(stem || "").replace(/\s+/g, " ").trim();
  for (let i = 0; i < 50; i++) {
    const m = s.match(SPEC_TAG);
    if (!m) break;
    s = s.slice(m[0].length).trim();
  }
  return s;
}

function findClinicalStart (s) {
  const re =
    /\b(?:Sobre|Qual|Assinale|Observe|Em qual|Em rela[cç][aã]o|Um|Uma|Homem|Mulher|Paciente|Crian[cç]a|Menino|Menina|Rec[eé]m-nasc|\bRN\b|Neonato|Dona|Lactente|Gestante|Primigesta|Adolescente|Escolar|Jo[aã]o|Maria|Cleiton|Cec[ií]lia|Felipe|L[uú]cia|Christian|Aurora|Susi|Na |No |A pol[ií]tica|A correta|Durante|Voc[eê] est[aá]|O tratamento|As h[eé]rnias|Les[oõ]es|Dentre|Considere|Analise|De acordo)\b/i;
  const m = re.exec(s);
  return m ? m.index : -1;
}

function cleanStemText (stem) {
  let s = String(stem || "")
    .replace(/\s+/g, " ")
    .replace(/InGamatória/gi, "Inflamatória")
    .replace(/inGuenza/gi, "influenza")
    .replace(/modiBca/gi, "modifica")
    .replace(/signiBc/gi, "signific")
    .replace(/ultrassonograBa/gi, "ultrassonografia")
    .replace(/Guxo/gi, "fluxo")
    .replace(/8xas/gi, "fixas")
    .replace(/re>exos/gi, "reflexos")
    .replace(/>car/gi, "ficar")
    .replace(/hipo%sário/gi, "hipofisário")
    .replace(/cardiotocograMa/gi, "cardiotocografia")
    .replace(/core-biposy/gi, "core-biopsy")
    .replace(/parceiro 8xo/gi, "parceiro fixo")
    .trim();
  for (let i = 0; i < 10; i++) {
    const next = s
      .replace(/^(?:Não se aplica|Privado|Acesso Direto \(R1\)|Residência \(Acesso Direto\)|\d+\s+anos)\s+/i, "")
      .replace(/^\d{4}\s+/, "")
      .replace(/^SP\s*-\s*Hospital Israelita[^.]*\.?\s*/i, "")
      .replace(/^Hospital Israelita Albert Einstein[^.]*\.?\s*/i, "")
      .replace(/^Fundação Carlos Chagas[^.]*\.?\s*/i, "")
      .replace(/^Fundação VUNESP\s*/i, "")
      .replace(/^HIAE\s+\d{4}(?:\s+R1)?\s*/i, "")
      .trim();
    if (next === s) break;
    s = next;
  }
  s = stripSpecialtyDump(s);
  for (let i = 0; i < 6; i++) {
    const next = s.replace(TOPIC_PREFIX, "").trim();
    if (next === s) break;
    s = next;
  }
  const at = findClinicalStart(s);
  if (at > 0 && at <= 160) {
    const before = s.slice(0, at).trim();
    if (before && !/[.?]$/.test(before) && before.split(/\s+/).length <= 16) {
      s = s.slice(at).trim();
    }
  }
  return s.replace(/\s+/g, " ").trim();
}

function ageYears (text) {
  const m = text.match(/\b(\d{1,2})\s*anos?(?:\s+de\s+idade)?\b/i);
  return m ? Number(m[1]) : null;
}

function ageMonths (text) {
  // Não usar "há 3 meses" (duração da queixa).
  const t = String(text || "").replace(/\bhá\s+\d{1,2}\s*meses\b/gi, " ");
  const m = t.match(
    /\b(\d{1,2})\s*meses(?:\s+e\s+\d+\s*dias)?(?:\s+de\s+(?:idade|vida))?\b|\b(?:com|de)\s+(\d{1,2})\s*meses(?:\s+de\s+(?:idade|vida))?\b/i
  );
  if (!m) return null;
  const n = Number(m[1] || m[2]);
  // Exige contexto de idade se não veio "de idade/vida"
  if (!/meses(?:\s+e\s+\d+\s*dias)?\s+de\s+(?:idade|vida)/i.test(t) &&
      !/\b(?:lactente|beb[eê]|crian[cç]a|menino|menina).{0,30}\b\d{1,2}\s*meses\b/i.test(t) &&
      !/\b\d{1,2}\s*meses(?:\s+e\s+\d+\s*dias)?\s+de\s+idade\b/i.test(text)) {
    if (!/\b(?:Cec[ií]lia|lactente).{0,40}\b\d{1,2}\s*meses\b/i.test(text)) return null;
  }
  return n;
}

function isPediatricPatient (text) {
  const t = String(text || "");
  // Caso obstétrico da mãe (com menção a RN) ≠ pediatria
  if (/\b(mulher|gestante|pu[ée]rpera|primigesta|tercigesta|nuligesta)\b/i.test(t) &&
      /parto|pr[eé]-natal|puerp[eé]rio|f[oó]rcipe|ces[aá]rea|n[oó]dulo de mama|sangramento vaginal|menopausa|climat/i.test(t) &&
      !/^(RN|Rec[eé]m-nasc|Neonato|Lactente|Crian|Menino|Menina)/i.test(t.trim())) {
    return false;
  }
  if (/lactente|puericultura|caderneta da crian|aleitamento materno|bronquiolite|pronto.?atendimento pedi|desenvolvimento no primeiro ano|retinopatia da prematuridade|membrana hialina|Doen[cç]a de Kawasaki|S[ií]ndrome Inflamat[oó]ria Multissist[eê]mica|Henoch|P[uú]rpura de Henoch|escore-z|consulta de \d+ anos de idade/i.test(t)) return true;
  // RN/neonato como protagonista (não só citado no parto da mãe)
  if (/^(RN|Rec[eé]m-nasc|Neonato)\b/i.test(t.trim()) ||
      /\b(rec[eé]m-nasc|\bRN\b|neonato)\b.{0,80}\b(apgar|peso|choro|icter|aleitamento|taquipne|t[oô]nus)/i.test(t)) {
    return true;
  }
  const months = ageMonths(t);
  if (months != null && months <= 24) return true;
  if (/meses de (idade|vida)/i.test(t)) return true;
  if (/\b(menina|menino)\b.{0,50}\b\d{1,2}\s*(anos|meses)\b/i.test(t)) return true;
  if (/\bcrian[cç]a(?:\s+do\s+sexo)?\b.{0,40}\b\d{1,2}\s*(anos|meses)\b/i.test(t)) return true;
  if (/\bcrian[cç]a de\s+\d{1,2}\s*anos?\b/i.test(t)) return true;
  if (/\b(?:crian[cç]a|menino|menina|Maria|Fernando).{0,40}\b(?:dois|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s*anos\b/i.test(t)) return true;
  if (/\b(?:seis|cinco|quatro|tr[eê]s|dois)\s*anos de idade\b/i.test(t) && !/\b(mulher|homem|paciente sexo)\b/i.test(t)) return true;
  if (/\blevado pela m[aã]e ao pronto-socorro\b|\bsua m[aã]e, com hist[oó]ria de dores articulares\b/i.test(t)) return true;
  if (/\b(?:PFJ|[A-Z]{2,4}),\s*(?:dois|tr[eê]s|quatro|cinco|seis|\d{1,2})\s*anos/i.test(t)) return true;
  if (/\bescolar de\s+\d{1,2}\s*anos?\b/i.test(t)) return true;
  if (/\b(levad[oa] (?:à|a|ao|para)).{0,40}pediatra/i.test(t)) return true;
  if (/\brelatado pela m[aã]e que a crian[cç]a\b/i.test(t)) return true;
  if (/\bno RN\b|\bRec[eé]m-nascido pr[eé]-termo/i.test(t)) return true;
  const a = ageYears(t);
  if (a != null && a >= 18) return false;
  if (a != null && a <= 12 && /\b(menina|menino|crian[cç]a|escolar|lactente|pediatra|Fernando)\b/i.test(t)) return true;
  if (a != null && a <= 17 && /\b(levad[oa] ao|pronto-atendimento pedi|pediatr|acidente of[ií]dico|insufici[eê]ncia card[ií]aca pedi)/i.test(t)) return true;
  if (a != null && a <= 17 && /\badolescente\b/i.test(t) && !/gestante|contracep|DIU|colo|HPV|gravidez|ginecol|n[oó]dulo de mama/i.test(t)) return true;
  return false;
}

function isObstetricCase (text) {
  if (/n[aã]o gestantes?/i.test(text) && !/primigesta|pr[eé]-?natal|pu[ée]rpera/i.test(text)) return false;
  if (/\b(menino|menina|crian[cç]a|lactente|meses de idade)\b/i.test(text) && /vacina|BCG|calend[aá]rio|puericultura|escore-z|peso adequado/i.test(text) && !/gestante|pr[eé]-natal/i.test(text)) {
    return false;
  }
  if (/primigesta|secundigesta|tercigesta|mult[ií]para|nuligesta|gestante|pr[eé]-?natal|trabalho de parto|parto pr[eé]-termo|pu[ée]rpera|puerp[eé]rio|semanas de gesta[cç][aã]o|pronto.?socorro obst|hipertonia uterina|\bBCF\b|clampeamento.*cord[aã]o|assist[eê]ncia ao parto|diabetes mellitus gestacional|VDRL.*gesta|IG\s*=\s*\d|durante a gesta[cç][aã]o|na gesta[cç][aã]o|G\dP\d|parto (?:vaginal|ces[aá]reo|normal)|l[ií]quido amni[oó]tico/i.test(text)) return true;
  return false;
}

function isStrongGO (text) {
  const t = text
    .replace(/n[aã]o gestantes?/gi, " ")
    .replace(/nega corrimento vaginal/gi, " ");
  return /gestante|primigesta|pu[ée]rpera|puerp[eé]rio|pr[eé]-?natal|ces[aá]rea|ecl[aâ]mpsia|pr[eé]-ecl|\bNIC\b|Papanicolaou|papanicolau|colo do [uú]tero|mioma|endometriose|menopausa|climat[eé]rio|ondas de calor|sudorese noturna.{0,40}ins[oô]nia|\bDIU\b|sangramento uterino|metrorragia|menarca|vaginose|vulvovaginit|\bHPV\b|mamografia|BI-RADS|c[aâ]ncer de mama|n[oó]dulo de mama|core-biopsy|ov[aá]rios polic|\bSOP\b|placenta|mola hidatiforme|\bRPMO\b|HELLP|gravidez ect|amenorreia|oligomenorreia|dismenorreia|corrimento vaginal|histerectomia|Robson|trabalho de parto|parto pr[eé]-termo|Febrasgo|m[eé]todos contraceptivos|contraceptivo hormonal|assoalho p[eé]lvico|ginecol[oó]gic|prolapso|bola na vagina|sangramento ap[oó]s rela[cç][aã]o|ciclos menstruais|PS da Ginecologia|dispareunia|fluxo menstrual|infertilidade|abortamentos espont|urge-incontin|incontin[eê]ncia urin[aá]ria|profissional do sexo|sa[uú]de da fam[ií]lia.{0,40}vida sexual|antifosfol[ií]pide/i.test(t);
}

/** Acronym match that does not treat accented letters as word-boundaries (avoids SIM⊂simétricos). */
function hasAcronym (text, ac) {
  const re = new RegExp("(?:^|[^A-Za-zÀ-ÖØ-öø-ÿ])" + ac + "(?:[^A-Za-zÀ-ÖØ-öø-ÿ]|$)", "i");
  return re.test(String(text || ""));
}

function isStrongPrev (text) {
  const t = String(text || "");
  if (hasAcronym(t, "PNAB") || hasAcronym(t, "ESF") || hasAcronym(t, "APS") ||
      hasAcronym(t, "ACS") || hasAcronym(t, "RAPS") || hasAcronym(t, "CAPS") ||
      hasAcronym(t, "PSE") || hasAcronym(t, "SINAN") || hasAcronym(t, "CFM") ||
      hasAcronym(t, "IVS") || hasAcronym(t, "GRADE") || hasAcronym(t, "USPSTF")) {
    return true;
  }
  return /aten[cç][aã]o prim[aá]ria|agente comunit[aá]rio|Pol[ií]tica Nacional|financiamento do SUS|princ[ií]pios.{0,20}SUS|Redu[cç][aã]o de Danos|conselhos de sa[uú]de|caso-controle|\bestudo de coorte\b|meta-an[aá]lise|Swaroop|vigil[aâ]ncia|C[oó]digo de [eÉ]tica|sigilo profissional|sa[uú]de do trabalhador|determinante social|promo[cç][aã]o da sa[uú]de|Programa Sa[uú]de na Escola|8[aª] Confer[eê]ncia|participa[cç][aã]o social|Reforma Psiqui[aá]trica|Medicina Preventiva|Epidemiologia|Boletins Epidemiol|[IÍ]ndice de Vulnerabilidade|hierarquia das evid|medicina baseada em evid|rastreio|triagem da osteoporose|valor preditivo|sensibilidade e especificidade|raz[aã]o de verossimilhan|likelihood|agrupadas por sorteio|dois tipos distintos de interven|Calend[aá]rio Vacinal Nacional|doa[cç][aã]o.{0,30}[oó]rg[aã]os|NR6|Equipamento de Prote[cç][aã]o Individual|notifica[cç][aã]o compuls/i.test(t);
}

function isStrongCir (text) {
  return /\bATLS\b|politraumat|abdome agudo|apendicite|diverticulite|Hartmann|colecistite|colecistectomia|obstru[cç][aã]o intestinal|queimadura|toracostomia|pneumot[oó]rax|\bTCE\b|trauma (?:cranio|cervical|abdominal|tor[aá]cico|dom[eé]stico)|traumatismo cranio|\bFAST\b|h[eé]rnia|bypass g[aá]strico|pr[eé]-operat[oó]rio|p[oó]s-operat[oó]rio|risco cir[uú]rgico|anastomose|isquemia mesent|Forrest|hepatectomia|tireoidectomia|anest[eé]sicos?(?: locais| inalat)|queloide|s[ií]ndrome compartimental|laparotomia|Le Fort|cricotireoid|via a[eé]rea dif[ií]cil|ferimento por arma|ferimento.{0,20}cervical|hemorroidectomia|colectomia|eviscera[cç]|[uú]lcera (?:g[aá]strica|duodenal)|patch de omento|quirod[aá]ctilo|perda de subst[aâ]ncia|intuba[cç][aã]o orotraqueal|vias a[eé]reas definitivas|profilaxia.{0,30}trombo|art[eé]ria e veia femorais|tri[aâ]ngulo femoral|jato urin[aá]rio fraco|noct[uú]ria e esfor[cç]o miccional|laparosc|v[ií]tima de (?:colis[aã]o|acidente de moto|ferimento)/i.test(text);
}

function isStrongClin (text) {
  return /insufici[eê]ncia card[ií]aca|infarto|angina|fibrila[cç]|hipertens[aã]o arterial|diabetes mellitus|\bDPOC\b|pneumonia|cirrose|\bAVC\b|l[uú]pus|\bHIV\b|di[aá]lise|tireoid|cetoacidose|artrite reumatoide|depress[aã]o|esquizofr|delirium|transtorno bipolar|litio|l[ií]tio|sertralina|fluoxetina|poliarterite|nefropatia diab|s[ií]ndrome colin[eé]rgica|fibromialgia/i.test(text);
}

function resolveSpecialty (stem, rawStem) {
  // Usa só o enunciado limpo. O raw do PDF traz dump de TODAS as especialidades e polui.
  void rawStem;
  const text = String(stem || "");
  const ped = isPediatricPatient(text);
  const go = isStrongGO(text);
  const prev = isStrongPrev(text);
  const cir = isStrongCir(text);
  const clin = isStrongClin(text);
  const obst = isObstetricCase(text);

  if (/\bNIC\b|Papanicolaou|colo do [uú]tero|colposcop|vulvovaginit|assoalho p[eé]lvico/i.test(text)) {
    return { specialty: "go", why: "oncogin" };
  }

  // Neonato protagonista (não usar \b após "nasc" — a palavra é "nascido")
  if (/^(RN\b|Rec[eé]m-nasc|Neonato\b)/i.test(text.trim()) ||
      /retinopatia da prematuridade|membrana hialina|seguimento desse lactente|Recep[cç][aã]o do neonato/i.test(text) ||
      (/\b(rec[eé]m-nascido|rec[eé]m-nasc|\bRN\b|neonato)\b/i.test(text) &&
        /apgar|taquipne|icter|aleitamento|choro forte|t[oô]nus|pele a pele|meconial|boa vitalidade|per[ií]odo neonatal|pr[eé]-termo/i.test(text) &&
        !/\b(mulher|gestante|primigesta|pu[ée]rpera).{0,40}\b(teve parto|em trabalho de parto)\b/i.test(text))) {
    return { specialty: "pediatria", why: "rn-neonatal" };
  }
  if (/sepse neonatal|Kawasaki|Multissist[eê]mica em crian/i.test(text)) {
    return { specialty: "pediatria", why: "ped-theme" };
  }

  // Obstetrícia da mãe (mesmo se citar RN)
  if (obst || (/trabalho de parto|primigesta|puerp[eé]rio|assist[eê]ncia ao parto|parto f[oó]rcipe|bloqueio de pudendo/i.test(text) &&
      !/^(RN\b|Rec[eé]m-nasc|Neonato\b|Lactente|Crian)/i.test(text.trim()))) {
    return { specialty: "go", why: "obstetric-case" };
  }

  // Pediatria antes de preventiva (caso clínico pediátrico > tags de epi/SUS)
  if (ped) return { specialty: "pediatria", why: "pediatric-patient" };
  if (/\b(crian[cç]as? menores de|escore-z|peso adequado para a idade|vacina BCG)\b/i.test(text)) {
    return { specialty: "pediatria", why: "pediatric-theme" };
  }

  // Preventiva / epi / SUS
  if (/e-SUS|sistemas de informa[cç][aã]o do SUS|Boletins Epidemiol|[IÍ]ndice de Vulnerabilidade|hierarquia das evid|valor preditivo|sensibilidade e especificidade|agrupadas por sorteio|triagem da osteoporose|Calend[aá]rio Vacinal Nacional|NR6|Equipamento de Prote[cç][aã]o|princ[ií]pios filos[oó]ficos do SUS|[oó]rg[aã]os e tecidos|doa[cç][aã]o.{0,40}[oó]rg[aã]os|efic[aá]cia de uma vacina|estudo sobre a efic|estudo com lavradores|surto de meningite|Sistema [UÚ]nico de Sa[uú]de|usu[aá]rio idoso do Sistema|[IÍ]ndice de Swaroop|dados do IBGE|taxa desde 2015|overall survival with neoadjuvant|publicaram recentemente|Preven[cç][aã]o Quatern[aá]ria|[Nn][ií]veis de Preven[cç][aã]o|foram noti[Oóf]cados \d|munic[ií]pio.{0,40}\d{1,3}\.?000 habitantes|100\.000 habitantes/i.test(text) ||
      hasAcronym(text, "IVS") || hasAcronym(text, "GRADE") || hasAcronym(text, "USPSTF")) {
    return { specialty: "preventiva", why: "prev-core" };
  }
  if (/caso-controle|meta-an[aá]lise|revis[aã]o sistem[aá]tica|Bradford Hill|delineamento|vi[eé]s de sele[cç]|likelihood|raz[aã]o de chances|odds ratio|testes diagn[oó]sticos/i.test(text)) {
    return { specialty: "preventiva", why: "prev-epi-method" };
  }
  if (/\bestudo de coorte\b|\bcoorte prospectiv|\bensaios? cl[ií]nicos?\b.*\b(aleatoriz|randomiz|placebo|grupo controle|sorteio)\b/i.test(text)) {
    return { specialty: "preventiva", why: "prev-epi-method" };
  }
  if (/princ[ií]pios bio[eé]ticos|C[oó]digo de [eÉ]tica|Parecer CFM|Reforma Psiqui[aá]trica|Redu[cç][aã]o de Danos|PNAB|participa[cç][aã]o social|Confer[eê]ncia Nacional de Sa[uú]de|medicina baseada em evid/i.test(text) ||
      hasAcronym(text, "RAPS") || hasAcronym(text, "CAPS")) {
    return { specialty: "preventiva", why: "prev-policy" };
  }

  if (/durante a gesta[cç][aã]o|na (?:pr[eé]-?)?ecl[aâ]mpsia|na gesta[cç][aã]o/i.test(text)) {
    return { specialty: "go", why: "go-gestation" };
  }
  if (go) return { specialty: "go", why: "go-strong" };

  if (prev) return { specialty: "preventiva", why: "prev-strong" };

  if (/p[oó]s-operat[oó]rio|hemorroidectomia|colectomia|eviscera|patch de omento|trauma cervical|ferimento por arma|queimadura|quirod[aá]ctilo|anest[eé]sicos? locais|intuba[cç][aã]o orotraqueal|vias a[eé]reas definitivas|art[eé]ria e veia femorais|profilaxia.{0,30}trombo|jato urin[aá]rio fraco|hemot[oó]rax|drenagem de t[oó]rax|queda de (?:motocicleta|aproximadamente)|abdominoplastia|dor abdominal em andar superior|[Oo]leo Biliar|[Óó]leo Biliar|c[oó]lica.{0,40}andar superior|obstru[cç][aã]o arterial aguda|embolec|parada de elimina[cç][aã]o|distens[aã]o abdominal.{0,40}parada|hipoc[oô]ndrio direito.{0,40}irradia|dor abdominal intensa e distens/i.test(text)) {
    return { specialty: "cirurgia", why: "cir-core" };
  }
  if (cir && !clin) return { specialty: "cirurgia", why: "cir-strong" };
  if (cir && clin) {
    return {
      specialty: /h[eé]rnia|abdome agudo|apendic|colecist|trauma |ATLS|queimadura|anest[eé]sico|p[oó]s-operat|pr[eé]-operat|ferimento|intuba/i.test(text)
        ? "cirurgia"
        : "clinica",
      why: "cir-clin-tie"
    };
  }

  if (clin) return { specialty: "clinica", why: "clin-strong" };
  return { specialty: "clinica", why: "default" };
}

function buildExplain (year, letter, choiceText, annulled) {
  if (annulled) {
    return "Questão anulada pela banca no gabarito oficial do Einstein (HIAE) " + year + ".";
  }
  const alt = letter || "?";
  const snippet = String(choiceText || "").replace(/\s+/g, " ").trim();
  const short = snippet.length > 220 ? snippet.slice(0, 217) + "…" : snippet;
  return (
    "Conforme o gabarito oficial do Einstein (HIAE) " + year + ", a alternativa correta é " + alt +
    (short ? (" — “" + short + "”.") : ".")
  );
}

function parseYear (year) {
  const text = fs.readFileSync(path.join(EXTRACT_DIR, year + ".txt"), "utf8");
  const gab = parseGabarito(text);
  const expectedN = expectedAltCount(year, gab);
  const blocks = splitQuestions(text);
  const questions = [];
  const issues = [];
  const byNumber = {};
  const samples = { clinica: [], cirurgia: [], pediatria: [], go: [], preventiva: [] };

  for (const { num, content } of blocks) {
    const { stemLines, choices } = extractChoices(content);
    const rawStem = stemLines.join(" ").replace(/\s+/g, " ").trim();
    let stem = cleanStemText(rawStem);
    const g = gab[num] || { letter: "", annulled: false };
    const annulled = !!g.annulled;

    let finalChoices = choices.slice();
    if (finalChoices.length > expectedN) finalChoices = finalChoices.slice(0, expectedN);

    let answer = -1;
    if (!annulled && g.letter && g.letter >= "A" && g.letter <= "E") {
      answer = g.letter.charCodeAt(0) - 65;
    }

    if (!stem) {
      issues.push({ year, num, issue: "stem vazio" });
      continue;
    }
    if (finalChoices.length < 4) {
      issues.push({ year, num, issue: "alts incompletas (" + finalChoices.length + ", esperado ~" + expectedN + ")" });
      continue;
    }
    if (!annulled && (answer < 0 || answer >= finalChoices.length)) {
      issues.push({ year, num, issue: "gabarito inválido " + g.letter + " vs " + finalChoices.length + " alts" });
      continue;
    }

    let { specialty, why } = resolveSpecialty(stem, rawStem);
    const manualKey = year + "-" + num;
    if (MANUAL[manualKey]) {
      specialty = MANUAL[manualKey];
      why = "manual";
    }
    byNumber[String(num)] = specialty;
    if (samples[specialty] && samples[specialty].length < 4) {
      samples[specialty].push({
        n: num,
        why,
        stem: stem.slice(0, 140)
      });
    }

    questions.push({
      id: "pi-" + EXAM_ID + "-" + year + "-" + String(num).padStart(3, "0"),
      specialty,
      group: EXAM_LABEL + " " + year,
      theme: THEME_LABEL[specialty],
      exam: EXAM_ID,
      year,
      difficulty: "media",
      stem,
      choices: finalChoices,
      answer: annulled ? 0 : answer,
      annulled,
      explain: buildExplain(year, g.letter, finalChoices[annulled ? 0 : answer], annulled),
      trap: annulled
        ? "Item anulado — não pontua."
        : "Marcar alternativa diferente do gabarito oficial da banca.",
      _why: why
    });
  }

  return { questions, issues, gabCount: Object.keys(gab).length, blockCount: blocks.length, byNumber, samples, expectedN };
}

function updateCatalog (provasEntries) {
  const catPath = path.join(OUT_DIR, "catalog.json");
  const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
  const familias = Array.isArray(cat.familias) ? cat.familias.filter((f) => f.id !== EXAM_ID) : [];
  familias.push({
    id: EXAM_ID,
    label: EXAM_LABEL,
    examIds: [EXAM_ID],
    years: YEARS,
    blurb: "Escolha o ano da prova"
  });
  const other = (cat.provas || []).filter((p) => !(new RegExp("^" + EXAM_ID + "-")).test(p.id || ""));
  cat.familias = familias;
  cat.provas = other.concat(provasEntries);
  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), "utf8");
}

function main () {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(OVR_DIR, { recursive: true });

  const catalogProvas = [];
  const audit = {
    years: {},
    totals: {},
    note: "Einstein/HIAE — áreas por enunciado (conteúdo-first). Banco AINDA NÃO gerado — aguardando ok."
  };
  ["clinica", "cirurgia", "pediatria", "go", "preventiva"].forEach((a) => { audit.totals[a] = 0; });

  for (const year of YEARS) {
    const { questions, issues, gabCount, blockCount, byNumber, samples, expectedN } =
      parseYear(year);

    const hist = {};
    questions.forEach((q) => {
      hist[q.specialty] = (hist[q.specialty] || 0) + 1;
      audit.totals[q.specialty] += 1;
    });

    const packQuestions = questions.map(({ _why, ...q }) => q);
    const pack = {
      id: EXAM_ID + "-" + year,
      title: EXAM_LABEL + " · " + year,
      exam: EXAM_ID,
      year,
      specialty: "mista",
      note: "Extraído do PDF oficial Provas/HIAE. Gabarito oficial. Áreas por enunciado (MedHub R1) — revisar antes do banco.",
      questions: packQuestions
    };
    fs.writeFileSync(path.join(OUT_DIR, EXAM_ID + "-" + year + ".json"), JSON.stringify(pack, null, 2), "utf8");
    fs.writeFileSync(
      path.join(OVR_DIR, EXAM_ID + "-" + year + ".json"),
      JSON.stringify({
        year,
        locked: true,
        note: "Curadoria por enunciado Einstein/HIAE (conteúdo-first). Revisar antes de gerar banco.",
        byNumber
      }, null, 2),
      "utf8"
    );

    const choiceHist = {};
    questions.forEach((q) => {
      const n = q.choices.length;
      choiceHist[n] = (choiceHist[n] || 0) + 1;
    });

    const expectedKeep = year === 2021 ? 50 : 75;
    catalogProvas.push({
      id: EXAM_ID + "-" + year,
      title: EXAM_LABEL + " · " + year,
      exam: EXAM_ID,
      year,
      specialty: "mista",
      count: questions.length,
      annulled: questions.filter((q) => q.annulled).length,
      status: questions.length >= expectedKeep - 2 ? "ready" : "soon",
      areasReady: true,
      file: "data/provas/" + EXAM_ID + "-" + year + ".json",
      blurb: questions.length + " questões · áreas por enunciado (revisar)"
    });

    audit.years[year] = {
      kept: questions.length,
      expectedN,
      expectedKeep,
      blockCount,
      gabCount,
      hist,
      choiceHist,
      issues: issues.length,
      sampleIssues: issues.slice(0, 10),
      samples
    };

    console.log(
      "OK", year,
      "kept", questions.length + "/" + expectedKeep,
      "alts", JSON.stringify(choiceHist),
      "areas", JSON.stringify(hist),
      "issues", issues.length
    );
    if (issues.length) console.log("  issues", issues.slice(0, 8));
  }

  updateCatalog(catalogProvas);
  fs.writeFileSync(path.join(__dirname, "einstein-area-audit.json"), JSON.stringify(audit, null, 2), "utf8");

  let md = "# Einstein (HIAE) — auditoria de áreas (antes do banco)\n\n";
  md += "Total: **" + Object.values(audit.totals).reduce((a, b) => a + b, 0) + "** questões.\n\n";
  md += "| Ano | Clin | Cir | Ped | GO | Prev | Alts | Kept |\n|---|---:|---:|---:|---:|---:|---|---:|\n";
  for (const y of YEARS) {
    const h = audit.years[y].hist;
    const ch = audit.years[y].choiceHist;
    md += `| ${y} | ${h.clinica || 0} | ${h.cirurgia || 0} | ${h.pediatria || 0} | ${h.go || 0} | ${h.preventiva || 0} | ${JSON.stringify(ch)} | ${audit.years[y].kept} |\n`;
  }
  md += "\n**Totais:** clinica " + audit.totals.clinica +
    " · cirurgia " + audit.totals.cirurgia +
    " · pediatria " + audit.totals.pediatria +
    " · go " + audit.totals.go +
    " · preventiva " + audit.totals.preventiva + "\n\n";
  md += "> Packs em `data/provas/einstein-YYYY.json` (Prova na íntegra).\n";
  md += "> **Banco de questões ainda NÃO foi gerado** — confirme as áreas antes.\n\n";

  for (const y of YEARS) {
    md += "## " + y + "\n\n";
    if (audit.years[y].issues) {
      md += "_Issues de parse: " + audit.years[y].issues + "_\n\n";
      (audit.years[y].sampleIssues || []).forEach((iss) => {
        md += "- Q" + iss.num + ": " + iss.issue + "\n";
      });
      if (audit.years[y].sampleIssues?.length) md += "\n";
    }
    const samples = audit.years[y].samples;
    for (const area of ["preventiva", "pediatria", "go", "clinica", "cirurgia"]) {
      const list = samples[area] || [];
      if (!list.length) continue;
      md += "### " + area + "\n";
      list.forEach((s) => {
        md += "- **Q" + s.n + "** (" + s.why + "): " + s.stem.replace(/\n/g, " ") + "\n";
      });
      md += "\n";
    }
  }
  fs.writeFileSync(path.join(__dirname, "einstein-area-audit.md"), md, "utf8");
  console.log("\nWrote einstein-area-audit.md + packs. BANK NOT written.");
  console.log("TOTALS", audit.totals);
}

main();
