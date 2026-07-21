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
  const m = text.match(/\b(\d{1,2})\s*anos(?:\s+de\s+idade)?/i);
  return m ? Number(m[1]) : null;
}

function isPediatricPatient (text) {
  if (/lactente|rec[eé]m-nasc|\bRN\b|neonatal|puericultura|caderneta da crian|aleitamento materno|bronquiolite|pronto.?atendimento pedi|desenvolvimento no primeiro ano|retinopatia da prematuridade|membrana hialina/i.test(text)) return true;
  if (/\b\d{1,2}\s*meses(?:\s+e\s+\d+\s*dias)?(?:\s+de\s+idade)?\b/i.test(text) && /\b(filho|filha|crian[cç]a|lactente|menino|menina|beb[eê])\b/i.test(text)) return true;
  if (/meses de (idade|vida)/i.test(text)) return true;
  if (/\b(menina|menino)\b.{0,40}\b\d{1,2}\s*(anos|meses)\b/i.test(text)) return true;
  if (/\bcrian[cç]a de\s+\d{1,2}\s*anos\b/i.test(text)) return true;
  if (/\bescolar de\s+\d{1,2}\s*anos\b/i.test(text)) return true;
  const a = ageYears(text);
  if (a != null && a <= 12 && /\b(menina|menino|crian[cç]a|escolar|lactente)\b/i.test(text)) return true;
  if (a != null && a <= 17 && /\b(levad[oa] ao|pronto-atendimento pedi|pediatr|m[aã]e|pai)\b/i.test(text)) return true;
  return false;
}

function isObstetricCase (text) {
  if (/n[aã]o gestantes?/i.test(text) && !/primigesta|pr[eé]-?natal|pu[ée]rpera/i.test(text)) return false;
  // vacinação de criança / puericultura NÃO é obstetrícia
  if (/\b(menino|menina|crian[cç]a|lactente|meses de idade)\b/i.test(text) && /vacina|BCG|calend[aá]rio|puericultura|escore-z|peso adequado/i.test(text) && !/gestante|pr[eé]-natal/i.test(text)) {
    return false;
  }
  if (/primigesta|secundigesta|mult[ií]para|gestante|pr[eé]-?natal|trabalho de parto|parto pr[eé]-termo|pu[ée]rpera|semanas de gesta[cç][aã]o|pronto.?socorro obst|hipertonia uterina|\bBCF\b|clampeamento.*cord[aã]o|assist[eê]ncia ao parto|diabetes mellitus gestacional|VDRL.*gesta|IG\s*=\s*\d|durante a gesta[cç][aã]o|na gesta[cç][aã]o|G\dP\d/i.test(text)) return true;
  return false;
}

function isStrongGO (text) {
  const t = text
    .replace(/n[aã]o gestantes?/gi, " ")
    .replace(/nega corrimento vaginal/gi, " ");
  return /gestante|primigesta|pu[ée]rpera|pr[eé]-?natal|ces[aá]rea|ecl[aâ]mpsia|pr[eé]-ecl|\bNIC\b|Papanicolaou|colo do [uú]tero|mioma|endometriose|menopausa|climat[eé]rio|\bDIU\b|sangramento uterino|metrorragia|menarca|vaginose|\bHPV\b|mamografia|BI-RADS|c[aâ]ncer de mama|ov[aá]rios polic|\bSOP\b|placenta|mola hidatiforme|\bRPMO\b|HELLP|gravidez ect|amenorreia|dismenorreia|corrimento vaginal|histerectomia|Robson|trabalho de parto|parto pr[eé]-termo|Febrasgo|m[eé]todos contraceptivos/i.test(t);
}

function isStrongPrev (text) {
  return /\bPNAB\b|\bESF\b|\bAPS\b|aten[cç][aã]o prim[aá]ria|agente comunit[aá]rio|\bACS\b|Pol[ií]tica Nacional|financiamento do SUS|\bRAPS\b|Redu[cç][aã]o de Danos|conselhos de sa[uú]de|caso-controle|coorte|meta-an[aá]lise|Swaroop|vigil[aâ]ncia|\bSINAN\b|C[oó]digo de [eÉ]tica|\bCFM\b|sigilo profissional|sa[uú]de do trabalhador|determinante social|promo[cç][aã]o da sa[uú]de|Programa Sa[uú]de na Escola|\bPSE\b|8[aª] Confer[eê]ncia|participa[cç][aã]o social|Reforma Psiqui[aá]trica|Sa[uú]de Mental/i.test(text) ||
    /Reforma Psiqui[aá]trica|pol[ií]tica de sa[uú]de mental brasileira/i.test(text);
}

function isStrongCir (text) {
  return /\bATLS\b|politraumat|abdome agudo|apendicite|diverticulite|Hartmann|colecistite|colecistectomia|obstru[cç][aã]o intestinal|queimadura|toracostomia|pneumot[oó]rax|\bTCE\b|trauma cranio|\bFAST\b|h[eé]rnia|bypass g[aá]strico|pr[eé]-operat[oó]rio|p[oó]s-operat[oó]rio|risco cir[uú]rgico|\bASA\b|anastomose|pancreatite|isquemia mesent|Forrest|hepatectomia|tireoidectomia|anest[eé]sicos inalat|queloide|cicatriza[cç][aã]o|s[ií]ndrome compartimental abdominal|laparotomia|Le Fort|cricotireoid|via a[eé]rea dif[ií]cil|trauma.*f[ií]gado|les[oõ]es hep[aá]ticas.*trauma/i.test(text);
}

function isStrongClin (text) {
  return /insufici[eê]ncia card[ií]aca|infarto|angina|fibrila[cç]|hipertens[aã]o arterial|diabetes mellitus|\bDPOC\b|pneumonia|cirrose|\bAVC\b|l[uú]pus|\bHIV\b|di[aá]lise|tireoid|cetoacidose|artrite reumatoide|depress[aã]o|esquizofr|delirium|transtorno bipolar|litio|l[ií]tio|sertralina|fluoxetina/i.test(text);
}

function resolveSpecialty (stem) {
  const text = String(stem || "");
  const ped = isPediatricPatient(text);
  const go = isStrongGO(text);
  const prev = isStrongPrev(text);
  const cir = isStrongCir(text);
  const clin = isStrongClin(text);
  const obst = isObstetricCase(text);

  if (/\bNIC\b|Papanicolaou|colo do [uú]tero|colposcop/i.test(text)) return { specialty: "go", why: "oncogin" };

  // RN / neonato como protagonista (antes de obstetrícia da mãe)
  if (/^(RN|Rec[eé]m-nasc)/i.test(text) ||
      /retinopatia da prematuridade|membrana hialina|seguimento desse lactente/i.test(text) ||
      (/rec[eé]m-nasc|\bRN\b/i.test(text) && /apgar|taquipne|icter|aleitamento|choro forte|tônus|pele a pele/i.test(text) && !/gestante|trabalho de parto|pronto-socorro obst/i.test(text))) {
    return { specialty: "pediatria", why: "rn-neonatal" };
  }
  // Sepse neonatal / agentes — ped, mesmo com contexto obstétrico
  if (/sepse neonatal|risco de sepse neonatal|agentes mais frequentes dessa condi[cç]/i.test(text)) {
    return { specialty: "pediatria", why: "rn-neonatal" };
  }

  if (/trabalho de parto|primigesta|assist[eê]ncia ao parto|clampeamento.*cord[aã]o|diabetes mellitus gestacional/i.test(text) &&
      !/^(RN|Rec[eé]m-nasc)/i.test(text)) {
    return { specialty: "go", why: "obstetric-case" };
  }

  if (/e-SUS|sistemas de informa[cç][aã]o do SUS|falhas no cuidado e nos sistemas/i.test(text)) {
    return { specialty: "preventiva", why: "prev-audit" };
  }

  // Método epidemiológico (não ensaio clínico só como cenário de fármaco/doença)
  if (/caso-controle|meta-an[aá]lise|revis[aã]o sistem[aá]tica|Bradford Hill|delineamento|surto de casos|vi[eé]s de sele[cç]|valor preditivo|sensibilidade e especificidade/i.test(text)) {
    return { specialty: "preventiva", why: "prev-epi-method" };
  }
  if (/\bestudo de coorte\b|\bcoorte prospectiv|\bensaios? cl[ií]nicos?\b.*\b(aleatoriz|randomiz|placebo|grupo controle)\b/i.test(text) &&
      !/esquizofr|antipsic[oó]t|antibi[oó]tico|tratamento da|prescrev/i.test(text)) {
    return { specialty: "preventiva", why: "prev-epi-method" };
  }

  if (/princ[ií]pios bio[eé]ticos|C[oó]digo de [eÉ]tica|Parecer CFM|Reforma Psiqui[aá]trica|RAPS|Redu[cç][aã]o de Danos|PNAB|participa[cç][aã]o social|Confer[eê]ncia Nacional de Sa[uú]de|Programa Sa[uú]de na Escola/i.test(text)) {
    return { specialty: "preventiva", why: "prev-policy" };
  }

  // criança clara vence (vacina/puericultura/escore-z)
  if (ped) return { specialty: "pediatria", why: "pediatric-patient" };
  if (/\b(crian[cç]as? menores de|escore-z|peso adequado para a idade|vacina BCG|Calend[aá]rio Nacional de Vacina[cç])/i.test(text)) {
    return { specialty: "pediatria", why: "pediatric-theme" };
  }
  if (obst) return { specialty: "go", why: "obstetric-case" };
  if (/durante a gesta[cç][aã]o|na gesta[cç][aã]o|vacinas?.*gesta[cç]|gesta[cç].*vacina/i.test(text)) {
    return { specialty: "go", why: "go-gestation" };
  }
  if (prev && !ped && !obst) return { specialty: "preventiva", why: "prev-strong" };
  if (go && !ped) return { specialty: "go", why: "go-strong" };
  if (cir && !clin) return { specialty: "cirurgia", why: "cir-strong" };
  if (cir && clin) {
    return { specialty: /h[eé]rnia|abdome agudo|apendic|colecist|trauma|ATLS|queimadura|anest[eé]sico/i.test(text) ? "cirurgia" : "clinica", why: "cir-clin-tie" };
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

    const { specialty, why } = resolveSpecialty(stem);
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
