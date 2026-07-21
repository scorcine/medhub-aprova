/**
 * Mapeia packs FMABC / Einstein → banco curado (specialty do pack + group por keywords).
 * Mesmos grupos oficiais do SUS-SP / ENARE. NÃO usa "FMABC YYYY" como group do banco.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const PROVAS_DIR = path.join(ROOT, "data", "provas");
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

/** Grupos oficiais do banco (não inventar novos). */
const RULES = {
  clinica: [
    { group: "Cardiologia", re: /infarto|STEMI|NSTEMI|supradesnivel|angina|troponina|fra[cç][aã]o de eje[cç]|insufici[eê]ncia card[ií]aca|fibrila[cç][aã]o atrial|choque cardiog|marcapasso|\bIAM\b|miocardiopat|bloqueio de ramo|precordial|\bECG\b|hipertens[aã]o|HAS\b|anti-hipertens|betabloqueador|IECA|estenose a[oó]rt|dor tor[aá]cica/i },
    { group: "Pneumologia", re: /\basma\b|DPOC|GOLD|pneumonia|derrame pleural|embolia pulmonar|SpO2|dispneia|tosse|tabag|tuberculose pulmonar|ventilação mec[aâ]nica|oxig[eê]nio|broncoscop|PAVM/i },
    { group: "Infectologia", re: /\bHIV\b|aids|sepse|antibi[oó]tico|tuberculose|\bTB\b|Sars-CoV|covid|meningite|hepatite|s[ií]filis|gonorreia|clam[ií]dia|herpes|imunidade|monkeypox|dengue|chikung|zika|leptospiro|mal[aá]ria|febre amarela|infec[cç][aã]o|fung|parasito|esquistossom|raiva|hanseníase|Clostridioides/i },
    { group: "Neurologia", re: /\bAVC\b|acidente vascular|cefaleia|enxaqueca|meningite|convuls|epilep|rigidez de nuca|LCR\b|liquor|trombol|Parkinson|Alzheimer|dem[eê]ncia|neuropat|miasten|coma\b|Glasgow|hemiparesia/i },
    { group: "Endocrinologia", re: /diabetes|tireoide|\bTSH\b|n[oó]dulo de tireoide|hipotireoid|hipertireoid|cetoacidose|HbA1c|insulina|obesidade|s[ií]ndrome metab[oó]lica|cortisol|adrenal|osteoporose|vitamina D|hipoglicem|glicosúria|SGLT2|metformina/i },
    { group: "Nefrologia", re: /creatinina|insufici[eê]ncia renal|doen[cç]a renal|di[aá]lise|hipercalemia|hipocalemia|IRA\b|DRC\b|LRA\b|nefrite|protein[uú]ria|hemat[uú]ria|s[ií]ndrome nefr[oó]|lit[ií]ase urin|c[aá]lculo renal|ITU\b|pielonefr|IgA/i },
    { group: "Hematologia", re: /anemia|transfusi|plaquet|coagul|hemofilia|leucemia|linfoma|hemoglobina|ferritina|mieloma|púrpura|TVP\b|trombose|anticoagul|plasma fresco/i },
    { group: "Reumatologia", re: /artrite|l[uú]pus|\bLES\b|gota|antifosfol[ií]pide|reumatolog|vasculite|fibromialgia|esclerose sist[eê]mica|Sj[öo]gren|FAN\b|anticorpo antinuclear|psor[ií]ase|miofascial/i },
    { group: "Hepatologia", re: /cirrose|hepatite|ascite|varizes esof|Child-Pugh|encefalopatia hep|esteatose|f[ií]gado|hep[aá]tico|GASA|paracentese/i },
    { group: "Psiquiatria", re: /depress[aã]o|suic[ií]d|psicos|esquizofr|transtorno|ansiedade|burnout|CAPS|psiquiat|alcool|depend[eê]ncia|bipolar|del[ií]rio|abstin[eê]ncia/i }
  ],
  pediatria: [
    { group: "Neonatologia", re: /rec[eé]m-nasc|\bRN\b|neonatal|apgar|icter[ií]cia|l[ií]quido amni[oó]tico|prematur|sala de parto|membrana hialina|SDR\b|enterocolite|hiperbilirrubinemia|meningite neonatal/i },
    { group: "Puericultura e prevenção", re: /puericultura|aleitamento|vacina|PNI|crescimento|desenvolvimento|antropom|caderneta|acompanhamento da crian|consulta de puericultura|escore-z|mil dias/i },
    { group: "Infectologia pediátrica", re: /otite|amoxicilina|febre|coqueluche|exantema|sarampo|varicela|dengue|infec|amigdal|faringite|impetigo|escabiose|mononucleose|HIV pedi[aá]|escariativa|Kawasaki/i },
    { group: "Pneumologia pediátrica", re: /asma|bronquiolite|pneumonia|chiado|sibil|laringotrique[ií]te|crupe|tosse|dispneia/i },
    { group: "Emergências pediátricas", re: /pronto atendimento|UPA|desidrata|convuls|crise febril|reanima|choque|PCR\b|intoxica|afogamento|PSI\b/i },
    { group: "Endocrinologia pediátrica", re: /puberdade|diabetes|tireoide|crescimento|obesidade infantil|baixa estatura/i },
    { group: "Neurologia pediátrica", re: /convuls|epilep|atraso.*desenvolvimento|TEA|autismo|paralisia cerebral|meningite/i },
    { group: "Gastroenterologia pediátrica", re: /diarr|desnutri|v[oô]mito|dor abdominal|constipa|refluxo|gastro|soro de reidrata|regurgita/i },
    { group: "Cardiologia pediátrica", re: /sopro|cardiopat|cianose|insufici[eê]ncia card|Kawasaki|febre reum[aá]tica/i },
    { group: "Nefrologia pediátrica", re: /ITU|infec[cç][aã]o urin|glomerulo|s[ií]ndrome nefr[oó]|enurese|hemat[uú]ria|refuxo vesicoureteral/i },
    { group: "Hematologia e imunologia", re: /anemia|p[uú]rpura|plaquet|imunodefici[eê]ncia|alergia|anafilaxia|imunoglobulina|urtic[aá]ria/i },
    { group: "Reumatologia pediátrica", re: /artrite idiop[aá]tica|AIJ\b|l[uú]pus|Kawasaki|dor articular/i },
    { group: "Maus-tratos / proteção", re: /maus[- ]?tratos|viol[eê]ncia|abuso|conselhos tutelares|ECA\b|neglig[eê]ncia/i }
  ],
  go: [
    { group: "Diagnóstico de gravidez · Pré-natal", re: /pr[eé]-?natal|idade gestacional|β-?hCG|beta.?hcg|diagn[oó]stico de gravidez|primigesta|secundigesta|tercigesta|gestante|consulta de pr[eé]/i },
    { group: "Sangramentos na gestação", re: /sangramento.*(gest|vaginal)|descolamento|placenta pr[eé]via|amea[cç]a de aborto|mola|aborto|AMIU|abortamento/i },
    { group: "HAS · Diabetes · Gemelaridade", re: /pr[eé]-ecl|ecl[aâ]mps|diabetes gestacional|gemelar|HAS gestacional|hipertens[aã]o.*gest|glicemia.*gest|HELLP|DHEG/i },
    { group: "Parto · RPMO · Prematuridade", re: /parto|RPMO|prematur|trabalho de parto|ces[aá]rea|indução|tocol[ií]se|corticoide antenatal|distocia|prolapso.*cord/i },
    { group: "Parto operatório · Med. fetal · Puerpério", re: /pu[ée]rper|f[óo]rcipe|v[aá]cuo|p[oó]s-parto|hemorragia p[oó]s|cardiotocografia|sofrimento fetal|Apgar|transmiss[aã]o vertical/i },
    { group: "Infecto / IST", re: /HPV|papiloma|gonorreia|clam[ií]dia|s[ií]filis|herpes genital|IST\b|corrimento|vaginite|candid[ií]ase|vaginose|toxoplasmose|citomegalov[ií]rus|DIP\b|doen[cç]a inflamat[oó]ria p[eé]lvica|secre[cç][aã]o vaginal/i },
    { group: "Oncoginecologia", re: /NIC\b|colo do [uú]tero|c[aâ]ncer de colo|rastreamento.*colo|Papanicolaou|colposcop|HPV.*colo|neoplasia|ASCUS|\bAGC\b|colpocitolog/i },
    { group: "Mastologia / ovário", re: /mama|mamogra|BI-RADS|ov[aá]rio|anexial|SOP|ov[aá]rios polic|n[oó]dulo mam[aá]|cisto ovariano|caro[cç]o.*mama/i },
    { group: "SUA / miomatose", re: /SUA|mioma|metrorragia|sangramento uterino|hipermenorre/i },
    { group: "Climatério / urogin", re: /menopaus|climat[eé]rio|incontin[eê]ncia|ondas de calor|fogachos|THS|prolapso|uretrocele|distopias? genitais|adenomiose|prurido vulvar|urg[eê]ncia urin[aá]ria/i },
    { group: "Endócrino / ciclo", re: /amenorre|ciclo menstrual|dismenorre|endometri|contracep|\bDIU\b|implante|anticoncepcional|SOP|anovulat|anticoncep/i }
  ],
  cirurgia: [
    { group: "Abdome agudo", re: /apendic|abdome agudo|diverticul|obstru[cç][aã]o intestinal|perfur|periton|colecist|pancreat|[uú]lcera|hern|abdome|dor abdominal|cirurgia bari[aá]tr|ves[ií]cula|Mirizzi|Todani|Boerhaave|isquemia (?:mesent|intestinal)|iliopsoas|Sengstaken|Lauren|c[aâ]ncer (?:do )?c[oó]lon|estoma|Pringle/i },
    { group: "Trauma · ATLS e choque", re: /\bATLS\b|trauma|choque|ABCDE|via a[eé]rea|queimadura|Parkland|politrauma|START\b|tr[ií]ade letal|Gustillo/i },
    { group: "Trauma torácico", re: /pneumot[oó]rax|toracostomia|hemot[oó]rax|t[oó]rax|contus[aã]o pulmonar/i },
    { group: "Trauma abdominal e pelve", re: /trauma abdominal|lavado peritoneal|FAST\b|pelve|ba[cç]o|baço|f[ií]gado.*trauma|les[oõ]es hep[aá]ticas/i },
    { group: "TCE · pescoço · face", re: /\bTCE\b|trauma cranio|pesco[cç]o|face|Glasgow|hematoma epidural|subdural|Le Fort/i },
    { group: "Pré-operatório", re: /pr[eé]-operat|risco cir[uú]rgico|ASA\b|jejum|ACERTO|pr[eé]-habilita|antibioticoprofilaxia|anest[eé]sic|grau de contamina[cç]/i },
    { group: "Pós-operatório e infecção", re: /p[oó]s-operat|infec[cç][aã]o de s[ií]tio|ISC\b|deisc[eê]ncia|f[ií]stula|ileo|tromboprofilaxia|dreno|cicatriza[cç]|sutura|n[oó] cir[uú]rgico|curativo|jato urin[aá]rio|escrotal/i }
  ],
  preventiva: [
    { group: "SUS · APS · programas", re: /\bSUS\b|PNAB|APS\b|aten[cç][aã]o prim[aá]ria|ESF\b|ACS\b|RAPS|8080|8142|financiamento|conselhos de sa[uú]de|estrat[eé]gia sa[uú]de da fam|municipaliza|regionaliza|hierarquiza|promo[cç][aã]o da sa[uú]de|UBS\b|NASF|eMulti|Programa|Sa[uú]de da Fam[ií]lia|RENAME|MCCP|remunera[cç][aã]o em sa[uú]de|cuidados paliativos/i },
    { group: "Epidemiologia · estudos · testes", re: /ensaio cl[ií]nico|caso-controle|coorte|meta-an[aá]lise|vi[eé]s|Bradford Hill|sensibilidade|especificidade|valor preditivo|amostra|aleat[oó]ri|estudo epidemiol|delineamento|odds ratio|risco relativo|\bNNT\b|rastreamento|letalidade|Framingham|MBE|medicina baseada em evid/i },
    { group: "Vigilância · HND · ética", re: /vigil[aâ]ncia|notifica|SINAN|surto|epidemia|[eé]tica|CFM|sigilo|determinante social|intersetorialidade|bio[eé]tica|consentimento|agrot[oó]xico|sa[uú]de do trabalhador|HND|doen[cç]a de notifica|declara[cç][aã]o de [oó]bito|prontu[aá]rio|controle especial|RDC Anvisa|triagem neonatal|teste do pezinho/i },
    { group: "Indicadores · mortalidade · Swaroop-Uemura", re: /mortalidade|coeficiente|Swaroop|indicador|Nelson de Moraes|preval[eê]ncia|incid[eê]ncia|taxa de|raz[aã]o de|esperança de vida|IDH\b|DCNT|doen[cç]as cr[oó]nicas/i }
  ]
};

const FALLBACK = {
  clinica: "Infectologia",
  pediatria: "Infectologia pediátrica",
  go: "Diagnóstico de gravidez · Pré-natal",
  cirurgia: "Abdome agudo",
  preventiva: "SUS · APS · programas"
};

function mapGroup (specialty, stem) {
  const rules = RULES[specialty] || [];
  const bag = String(stem || "");
  let best = null;
  let bestScore = 0;
  for (const rule of rules) {
    const m = bag.match(rule.re);
    if (!m) continue;
    let score = 2;
    if (m.index != null && m.index < 120) score += 1;
    if (String(m[0]).length >= 8) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = rule.group;
    }
  }
  if (best) return { group: best, score: bestScore, via: "keyword" };
  return { group: FALLBACK[specialty], score: 0, via: "fallback" };
}

function buildBank (examId, sourceTag, expectedMin) {
  const kept = [];
  const bySpec = Object.create(null);
  const bySpecGroup = Object.create(null);
  const viaCount = { keyword: 0, fallback: 0 };

  for (const year of YEARS) {
    const packPath = path.join(PROVAS_DIR, examId + "-" + year + ".json");
    if (!fs.existsSync(packPath)) {
      console.warn("pack ausente", packPath);
      continue;
    }
    const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
    for (const q of pack.questions || []) {
      if (q.annulled) continue;
      const specialty = String(q.specialty || "").toLowerCase();
      if (!RULES[specialty]) {
        throw new Error("Specialty inválida em " + q.id + ": " + specialty);
      }
      const mapped = mapGroup(specialty, q.stem);
      viaCount[mapped.via] += 1;
      const item = {
        id: "banco-" + String(q.id || "").replace(/^pi-/, ""),
        specialty,
        group: mapped.group,
        theme: mapped.group,
        exam: examId,
        year: q.year || year,
        difficulty: q.difficulty || "media",
        stem: q.stem,
        choices: q.choices,
        answer: q.answer,
        explain: q.explain,
        trap: q.trap || "Marcar alternativa diferente do gabarito oficial da banca.",
        source: sourceTag
      };
      kept.push(item);
      bySpec[specialty] = (bySpec[specialty] || 0) + 1;
      const key = specialty + " · " + mapped.group;
      bySpecGroup[key] = (bySpecGroup[key] || 0) + 1;
    }
  }

  if (kept.length < expectedMin) {
    console.warn("AVISO", examId, "esperado >=", expectedMin, "veio", kept.length);
  }

  const outFile = path.join(ROOT, "data", "questions-" + examId + ".json");
  fs.writeFileSync(outFile, JSON.stringify(kept, null, 2), "utf8");
  const report = { exam: examId, kept: kept.length, viaCount, bySpec, bySpecGroup };
  fs.writeFileSync(
    path.join(__dirname, examId + "-banco-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log("Wrote", outFile, "kept", kept.length, "via", viaCount);
  console.log("bySpec", JSON.stringify(bySpec));
  return report;
}

function main () {
  buildBank("fmabc", "fmabc-prova", 590);
  buildBank("einstein", "einstein-prova", 400);
  console.log("OK banks FMABC + Einstein");
}

main();
