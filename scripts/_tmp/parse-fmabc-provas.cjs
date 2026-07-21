/**
 * Parse FMABC PDFs (text extracts) → packs + area overrides + auditoria.
 * NÃO escreve no banco de questões — só Prova na íntegra + relatório de áreas.
 */
const fs = require("fs");
const path = require("path");

const EXTRACT_DIR = path.join(__dirname, "fmabc-extract");
const OUT_DIR = path.join(__dirname, "..", "..", "data", "provas");
const OVR_DIR = path.join(OUT_DIR, "area-overrides");
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const MANUAL_PATH = path.join(__dirname, "fmabc-manual-areas.json");
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
  /^FMABC\s+\d{4}/i,
  /^FMACB\s+\d{4}/i,
  /^SP\s*-\s*Faculdade/i,
  /^Faculdade de Medicina do ABC/i,
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
    .replace(/\bdi1cul/gi, "dificul")
    .replace(/\bpro1ss/gi, "profiss")
    .replace(/\b1nitude\b/gi, "finitude")
    .replace(/\binSuenza\b/gi, "influenza")
    .replace(/\bSuido\b/gi, "fluido")
    .replace(/\bposo\b/gi, "peso")
    .replace(/\bCAPES\b/g, "CAPS")
    .replace(/\barresponsiva\b/gi, "arresponsiva")
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
  if (/Fundação VUNESP|Faculdade de Medicina do ABC|Não se aplica|Acesso Direto \(R1\)|Residência \(Acesso Direto\)|Privado/i.test(t)) return true;
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
  return Number(year) <= 2024 && Number(year) >= 2022 ? 5 : 4;
}

const SPEC_TAG =
  /^(?:Ginecologia(?: e Obstetrícia)?|Obstetrícia|Psiquiatria|Cirurgia(?: Geral| Básica| Cardiovascular| Pediátrica)?|Ortopedia(?: e Traumatologia)?|Oftalmologia|Otorrinolaringologia|Pediatria|Patologia|Medicina da Família(?: e Comunidade)?|Medicina de Família|Medicina do Trabalho|Neurocirurgia|Neurologia|Anestesiologia|Infectologia|Radiologia(?: e Diagnóstico por Imagem)?|Cardiologia|Hepatologia|Hematologia(?: Pediátrica)?|Pneumologia|Clínica Médica|Dermatologia|Urologia|Endocrinologia|Nefrologia|Reumatologia|Saúde Pública|Público\s*-\s*Municipal|Público\s*-\s*Estadual|\d+\s*anos)\b\s*/i;

function stripSpecialtyDump (stem) {
  let s = String(stem || "").replace(/\s+/g, " ").trim();
  // Remove prefixo de tags de especialidade (comum no material 2021)
  for (let i = 0; i < 40; i++) {
    const m = s.match(SPEC_TAG);
    if (!m) break;
    s = s.slice(m[0].length).trim();
  }
  return s;
}

function findClinicalStart (s) {
  const re =
    /\b(?:Sobre|Qual|Assinale|Observe|Em qual|Em relação|Um|Uma|Homem|Mulher|Paciente|Criança|Menino|Menina|Recém-nasc|\bRN\b|Dona|Lactente|Gestante|Primigesta|Adolescente|Escolar|João|Maria|Cleiton|Na |No |A política|A correta|Durante|Você está|O tratamento|As hérnias|Lesões)\b/i;
  const m = re.exec(s);
  return m ? m.index : -1;
}

function cleanStemText (stem) {
  let s = String(stem || "").replace(/\s+/g, " ").trim();
  for (let i = 0; i < 8; i++) {
    const next = s
      .replace(/^(?:Não se aplica|Privado|Acesso Direto \(R1\)|Residência \(Acesso Direto\)|\d+\s+anos)\s+/i, "")
      .replace(/^\d{4}\s+/, "")
      .replace(/^SP\s*-\s*Faculdade[^.]*\.?\s*/i, "")
      .replace(/^Fundação VUNESP\s*/i, "")
      .trim();
    if (next === s) break;
    s = next;
  }
  s = stripSpecialtyDump(s);
  const at = findClinicalStart(s);
  // se ainda sobrou título temático curto antes do caso clínico, corta
  if (at > 0 && at <= 120) {
    const before = s.slice(0, at).trim();
    if (before && !/[.?]$/.test(before) && before.split(/\s+/).length <= 12) {
      s = s.slice(at).trim();
    }
  }
  s = s.replace(
    /^(Reforma Psiquiátrica[^\n.]{0,80}|Sumário dos Tóxicos[^\n.]{0,40}|Apresentação Clínica|Retinopatia da Prematuridade|Síndrome do desconforto[^\n.]{0,60}|Anafilaxia|Bradiarritmias|Colecistectomia|Colecistite Aguda[^\n.]{0,40}|na Infância(?: Tratamento)?|Doença de Kawasaki|Exantema Súbito|Classificação e Tratamento da Crise)\s+/i,
    ""
  );
  return s.replace(/\s+/g, " ").trim();
}

function ageYears (text) {
  const m = text.match(/\b(\d{1,2})\s*anos?(?:\s+de\s+idade)?\b/i);
  return m ? Number(m[1]) : null;
}

function ageMonths (text) {
  const t = String(text || "").replace(/\bhá\s+\d{1,2}\s*meses\b/gi, " ");
  const m = t.match(/\b(\d{1,2})\s*meses(?:\s+e\s+\d+\s*dias)?\s+de\s+(?:idade|vida)\b/i);
  return m ? Number(m[1]) : null;
}

function isPediatricPatient (text) {
  const t = String(text || "");
  if (/\b(mulher|gestante|pu[ée]rpera|primigesta)\b/i.test(t) &&
      /parto|pr[eé]-natal|puerp[eé]rio|n[oó]dulo de mama|sangramento vaginal|menopausa/i.test(t) &&
      !/^(RN|Rec[eé]m-nasc|Lactente|Crian|Menino|Menina)/i.test(t.trim())) {
    return false;
  }
  if (/lactente|puericultura|caderneta da crian|aleitamento materno|bronquiolite|pronto.?atendimento pedi|retinopatia da prematuridade|membrana hialina|Kawasaki|escore-z|consulta com pediatra|primeira consulta com pediatra|Sociedade Brasileira de Pediatria|matura[cç][aã]o sexual|puberdade|tempo de tela entre crian/i.test(t)) return true;
  if (/^(RN\b|Rec[eé]m-nasc)/i.test(t.trim())) return true;
  if (ageMonths(t) != null) return true;
  if (/meses de (idade|vida)/i.test(t)) return true;
  if (/\b(menina|menino)\b.{0,50}\b\d{1,2}\s*(anos|meses)\b/i.test(t)) return true;
  if (/\bcrian[cç]a(?:\s+do\s+sexo)?\b.{0,40}\b\d{1,2}\s*anos?\b/i.test(t)) return true;
  if (/\b(?:seis|cinco|quatro|tr[eê]s|dois)\s*anos\b/i.test(t) && /\b(crian|avalia[cç][aã]o de uma crian|adolescente)/i.test(t)) return true;
  if (/\badolescente\b.{0,40}\bpediatra\b|\badolescente,?\s*1[0-7]\s*anos\b/i.test(t)) return true;
  const a = ageYears(t);
  if (a != null && a >= 18) return false;
  if (a != null && a <= 12 && /\b(menina|menino|crian[cç]a|escolar|lactente|pediatr)\b/i.test(t)) return true;
  if (a != null && a <= 17 && /\b(pediatr|acidente of[ií]dico)\b/i.test(t)) return true;
  return false;
}

function isObstetricCase (text) {
  if (/n[aã]o gestantes?/i.test(text) && !/primigesta|pr[eé]-?natal|pu[ée]rpera/i.test(text)) return false;
  if (/\b(menino|menina|crian[cç]a|lactente)\b/i.test(text) && /vacina|BCG|puericultura|escore-z/i.test(text) && !/gestante|pr[eé]-natal/i.test(text)) {
    return false;
  }
  if (/primigesta|secundigesta|mult[ií]para|gestante|pr[eé]-?natal|trabalho de parto|parto pr[eé]-termo|pu[ée]rpera|puerp[eé]rio|semanas de gesta[cç]|partograma|parturiente|mecanismo de parto|p[oó]s-parto|\bHPP\b|G\dA\d|G\dP\d|atraso menstrual|Beta-hCG|parto p[eé]lvico|f[oó]rcipe|prematuridad/i.test(text)) return true;
  return false;
}

function isStrongGO (text) {
  const t = text
    .replace(/n[aã]o gestantes?/gi, " ")
    .replace(/nega corrimento vaginal/gi, " ");
  return /gestante|primigesta|pu[ée]rpera|puerp[eé]rio|pr[eé]-?natal|ces[aá]rea|ecl[aâ]mpsia|pr[eé]-ecl|\bNIC\b|Papanicolaou|papanicolau|colo do [uú]tero|mioma|endometriose|menopausa|climat[eé]rio|\bDIU\b|sangramento uterino|metrorragia|menarca|vaginose|vulvovaginit|\bHPV\b|mamografia|BI-RADS|c[aâ]ncer de mama|ov[aá]rios polic|\bSOP\b|placenta|mola hidatiforme|\bRPMO\b|HELLP|gravidez ect|amenorreia|dismenorreia|corrimento vaginal|histerectomia|Robson|trabalho de parto|parto pr[eé]-termo|Febrasgo|m[eé]todos contraceptivos|contraceptivo|ciclo menstrual|ovula[cç][aã]o|infertilidade|prolapso de [oó]rg[aã]os p[eé]lvicos|\bPOP\b|sangramento vaginal|nuligesta|nul[ií]para|ginecolog/i.test(t);
}

function isStrongPrev (text) {
  return /\bPNAB\b|\bESF\b|\bAPS\b|aten[cç][aã]o prim[aá]ria|agente comunit[aá]rio|\bACS\b|Pol[ií]tica Nacional|financiamento do SUS|princ[ií]pios.{0,30}SUS|\bRAPS\b|Redu[cç][aã]o de Danos|conselhos de sa[uú]de|caso-controle|coorte|meta-an[aá]lise|Swaroop|vigil[aâ]ncia|\bSINAN\b|C[oó]digo de [eÉ]tica|\bCFM\b|sigilo profissional|sa[uú]de do trabalhador|determinante social|Determina[cç][aã]o Social|promo[cç][aã]o da sa[uú]de|Programa Sa[uú]de na Escola|\bPSE\b|8[aª] Confer[eê]ncia|participa[cç][aã]o social|Reforma Psiqui[aá]trica|Medicina Preventiva|Tipos de Estudos Epidemiol|N[ií]veis de Preven[cç][aã]o|Preven[cç][aã]o Quatern[aá]ria|Preven[cç][aã]o Secund[aá]ria|Sistema de Informa[cç][aã]o sobre Mortalidade|\bSIM\b|notifica[cç][aã]o compuls|Lista Nacional de Notifica[cç]|Guia Alimentar|rastreio|USPSTF|valor preditivo|sensibilidade e especificidade|indicadores de sa[uacute]de|indicadores de sa[uú]de|participa[cç][aã]o popular|Lei n.? ?8\.?142|Lei n.? ?8\.?080|mudan[cç]as epidemiol|Agravos de Notifica[cç]|cobertura vacinal|calend[aá]rio vacinal/i.test(text);
}

function isStrongCir (text) {
  return /\bATLS\b|politraumat|abdome agudo|apendicite|diverticulite|Hartmann|colecistite|colecistectomia|obstru[cç][aã]o intestinal|queimadura|toracostomia|pneumot[oó]rax|\bTCE\b|trauma cranio|traumatismo|\bFAST\b|h[eé]rnia|bypass g[aá]strico|pr[eé]-operat[oó]rio|p[oó]s-operat[oó]rio|risco cir[uú]rgico|anastomose|pancreatite|isquemia mesent|Forrest|hepatectomia|tireoidectomia|anest[eé]sicos?(?: locais| inalat)|queloide|s[ií]ndrome compartimental|laparotomia|Le Fort|cricotireoid|via a[eé]rea dif[ií]cil|ferimento por arma|hemorroid|colectomia|eviscera|REMIT|Resposta End[oó]crino|jato urin[aá]rio|f[ií]stulas intestinais|cirurgias anteriores|tipo de anestesia/i.test(text);
}

function isStrongClin (text) {
  return /insufici[eê]ncia card[ií]aca|infarto|angina|fibrila[cç]|hipertens[aã]o arterial|diabetes mellitus|\bDPOC\b|pneumonia|cirrose|\bAVC\b|l[uú]pus|\bHIV\b|di[aá]lise|tireoid|cetoacidose|artrite reumatoide|depress[aã]o|esquizofr|delirium|transtorno bipolar/i.test(text);
}

function resolveSpecialty (stem) {
  const text = String(stem || "");
  const ped = isPediatricPatient(text);
  const go = isStrongGO(text);
  const prev = isStrongPrev(text);
  const cir = isStrongCir(text);
  const clin = isStrongClin(text);
  const obst = isObstetricCase(text);

  if (/\bNIC\b|Papanicolaou|papanicolau|colo do [uú]tero|colposcop|vulvovaginit|assoalho p[eé]lvico|partograma/i.test(text)) {
    return { specialty: "go", why: "oncogin" };
  }

  if (/^(RN\b|Rec[eé]m-nasc)/i.test(text.trim()) ||
      /retinopatia da prematuridade|membrana hialina|seguimento desse lactente/i.test(text) ||
      (/\b(rec[eé]m-nascido|rec[eé]m-nasc|\bRN\b)\b/i.test(text) && /apgar|taquipne|icter|aleitamento|choro|t[oô]nus|pele a pele/i.test(text))) {
    return { specialty: "pediatria", why: "rn-neonatal" };
  }
  if (/sepse neonatal|Kawasaki/i.test(text)) return { specialty: "pediatria", why: "ped-theme" };

  if (obst || (/trabalho de parto|primigesta|puerp[eé]rio|partograma|parturiente|mecanismo de parto|p[oó]s-parto|\bHPP\b/i.test(text) &&
      !/^(RN\b|Rec[eé]m-nasc|Lactente|Crian)/i.test(text.trim()))) {
    return { specialty: "go", why: "obstetric-case" };
  }

  if (/Tipos de Estudos Epidemiol|N[ií]veis de Preven[cç]|Preven[cç][aã]o Quatern|Preven[cç][aã]o Secund|Sistema de Informa[cç].{0,20}Mortalidade|\bSIM\b|Declara[cç][aã]o de Nascido Vivo|\bDN\b.{0,40}Mortalidade|notifica[cç][aã]o compuls|Lista Nacional de Notifica[cç]|Guia Alimentar|Determina[cç][aã]o Social|participa[cç][aã]o popular|indicadores de sa[uú]de|Lei n.? ?8\.?142|Lei n.? ?8\.?080|Lei complementar|Lei Org[aâ]nica da Sa[uú]de|Agravos de Notifica[cç]|mudan[cç]as epidemiol|estudo realizado nos Estados Unidos|Framingham|acompanhadas 118|Odds Ratio|Raz[aã]o de Chances|\bNNT\b|Risco Relativo|coeficiente de mortalidade|mortalidade infantil|n[ií]veis de aten[cç][aã]o.{0,20}SUS|Tnanciamento do Sistema|[Ff]inanciamento do Sistema [UÚ]nico|Manual de Planejamento|epidemiologia cl[ií]nica|associa[cç][oõ]es revers[ií]veis/i.test(text)) {
    return { specialty: "preventiva", why: "prev-core" };
  }
  if (/caso-controle|meta-an[aá]lise|revis[aã]o sistem[aá]tica|Bradford Hill|delineamento|valor preditivo|sensibilidade e especificidade|estudos epidemiol|fatores de risco de uma forma rara|ensaio cl[ií]nico randomizado|pesquisador deseja estudar/i.test(text)) {
    return { specialty: "preventiva", why: "prev-epi-method" };
  }
  if (/\bestudo de coorte\b|\bcoorte prospectiv|\bensaios? cl[ií]nicos?\b.*\b(aleatoriz|randomiz|placebo|grupo controle)\b|estudo de 1997 que acompanhou/i.test(text)) {
    return { specialty: "preventiva", why: "prev-epi-method" };
  }
  if (/princ[ií]pios bio[eé]ticos|C[oó]digo de [eÉ]tica|Parecer CFM|Reforma Psiqui[aá]trica|\bRAPS\b|PNAB|participa[cç][aã]o social|Confer[eê]ncia Nacional|Programa Sa[uú]de na Escola|princ[ií]pios organizativos do SUS|Pol[ií]ticas de Sa[uú]de do Sistema [UÚ]nico/i.test(text)) {
    return { specialty: "preventiva", why: "prev-policy" };
  }

  if (ped) return { specialty: "pediatria", why: "pediatric-patient" };
  if (/\b(crian[cç]as? menores de|escore-z|peso adequado para a idade|vacina BCG|calend[aá]rio vacinal)\b/i.test(text) && !/prematuridade obstetr|gestante/i.test(text)) {
    return { specialty: "pediatria", why: "pediatric-theme" };
  }

  if (/durante a gesta[cç][aã]o|na gesta[cç][aã]o/i.test(text)) return { specialty: "go", why: "go-gestation" };
  if (go) return { specialty: "go", why: "go-strong" };
  if (prev) return { specialty: "preventiva", why: "prev-strong" };

  if (/p[oó]s-operat|pr[eé]-operat|ferimento por arma|queimadura|hemorroid|colectomia|tireoidectomia|REMIT|jato urin[aá]rio|f[ií]stulas intestinais|politraumat|ATLS|abdome agudo|apendic|colecist|h[eé]rnia/i.test(text)) {
    return { specialty: "cirurgia", why: "cir-core" };
  }
  if (cir && !clin) return { specialty: "cirurgia", why: "cir-strong" };
  if (cir && clin) {
    return {
      specialty: /h[eé]rnia|abdome agudo|apendic|colecist|trauma|ATLS|queimadura|anest[eé]sico|p[oó]s-operat|ferimento/i.test(text)
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
    return "Questão anulada pela banca no gabarito oficial da FMABC " + year + ".";
  }
  const alt = letter || "?";
  const snippet = String(choiceText || "").replace(/\s+/g, " ").trim();
  const short = snippet.length > 220 ? snippet.slice(0, 217) + "…" : snippet;
  return (
    "Conforme o gabarito oficial da FMABC " + year + ", a alternativa correta é " + alt +
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
    let stem = stemLines.join(" ").replace(/\s+/g, " ").trim();
    stem = cleanStemText(stem);
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

    let { specialty, why } = resolveSpecialty(stem);
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
      id: "pi-fmabc-" + year + "-" + String(num).padStart(3, "0"),
      specialty,
      group: "FMABC " + year,
      theme: THEME_LABEL[specialty],
      exam: "fmabc",
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
  const familias = Array.isArray(cat.familias) ? cat.familias.filter((f) => f.id !== "fmabc") : [];
  familias.push({
    id: "fmabc",
    label: "FMABC",
    examIds: ["fmabc"],
    years: YEARS,
    blurb: "Escolha o ano da prova"
  });
  const other = (cat.provas || []).filter((p) => !/^fmabc-/.test(p.id || ""));
  cat.familias = familias;
  cat.provas = other.concat(provasEntries);
  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), "utf8");
}

function main () {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(OVR_DIR, { recursive: true });

  const catalogProvas = [];
  const audit = { years: {}, totals: {}, note: "Áreas por enunciado (conteúdo-first). Banco de questões AINDA NÃO gerado — aguardando ok." };
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
      id: "fmabc-" + year,
      title: "FMABC · " + year,
      exam: "fmabc",
      year,
      specialty: "mista",
      note: "Extraído do PDF oficial Provas/FMABC. Gabarito oficial. Áreas por enunciado (MedHub R1) — revisar antes do banco.",
      questions: packQuestions
    };
    fs.writeFileSync(path.join(OUT_DIR, "fmabc-" + year + ".json"), JSON.stringify(pack, null, 2), "utf8");
    fs.writeFileSync(
      path.join(OVR_DIR, "fmabc-" + year + ".json"),
      JSON.stringify({
        year,
        locked: true,
        note: "Curadoria por enunciado FMABC (conteúdo-first). Revisar antes de gerar banco.",
        byNumber
      }, null, 2),
      "utf8"
    );

    const choiceHist = {};
    questions.forEach((q) => {
      const n = q.choices.length;
      choiceHist[n] = (choiceHist[n] || 0) + 1;
    });

    catalogProvas.push({
      id: "fmabc-" + year,
      title: "FMABC · " + year,
      exam: "fmabc",
      year,
      specialty: "mista",
      count: questions.length,
      annulled: 0,
      status: questions.length >= 90 ? "ready" : "soon",
      areasReady: true,
      file: "data/provas/fmabc-" + year + ".json",
      blurb: questions.length + " questões · áreas por enunciado (revisar)"
    });

    audit.years[year] = {
      kept: questions.length,
      expectedN,
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
      "kept", questions.length,
      "alts", JSON.stringify(choiceHist),
      "areas", JSON.stringify(hist),
      "issues", issues.length
    );
    if (issues.length) console.log("  issues", issues.slice(0, 5));
  }

  updateCatalog(catalogProvas);
  fs.writeFileSync(path.join(__dirname, "fmabc-area-audit.json"), JSON.stringify(audit, null, 2), "utf8");

  // markdown legível
  let md = "# FMABC — auditoria de áreas (antes do banco)\n\n";
  md += "Total: **" + Object.values(audit.totals).reduce((a, b) => a + b, 0) + "** questões.\n\n";
  md += "| Ano | Clin | Cir | Ped | GO | Prev | Alts |\n|---|---:|---:|---:|---:|---:|---|\n";
  for (const y of YEARS) {
    const h = audit.years[y].hist;
    const ch = audit.years[y].choiceHist;
    md += `| ${y} | ${h.clinica || 0} | ${h.cirurgia || 0} | ${h.pediatria || 0} | ${h.go || 0} | ${h.preventiva || 0} | ${JSON.stringify(ch)} |\n`;
  }
  md += "\n**Totais:** clinica " + audit.totals.clinica +
    " · cirurgia " + audit.totals.cirurgia +
    " · pediatria " + audit.totals.pediatria +
    " · go " + audit.totals.go +
    " · preventiva " + audit.totals.preventiva + "\n\n";
  md += "> Packs gravados em `data/provas/fmabc-YYYY.json` para Prova na íntegra.\n";
  md += "> **Banco de questões ainda NÃO foi gerado** — confirme as áreas antes.\n\n";

  for (const y of YEARS) {
    md += "## " + y + "\n\n";
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
  fs.writeFileSync(path.join(__dirname, "fmabc-area-audit.md"), md, "utf8");
  console.log("\nWrote fmabc-area-audit.md + packs. BANK NOT written.");
  console.log("TOTALS", audit.totals);
}

main();
