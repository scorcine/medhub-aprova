/**
 * Expande abreviações clínicas nos flashcards.
 * Forma na 1ª ocorrência do campo: "termo completo (SIGLA)".
 * Abreviações ambíguas só entram no arquivo da especialidade certa.
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");

const GLOBAL = [
  ["SMX-TMP", "sulfametoxazol-trimetoprima (SMX-TMP)"],
  ["SatO₂", "saturação de oxigênio (SatO₂)"],
  ["SatO2", "saturação de oxigênio (SatO₂)"],
  ["HbA1c", "hemoglobina glicada (HbA1c)"],
  ["CURB-65", "escore CURB-65"],
  ["rtPA", "ativador do plasminogênio tecidual recombinante / trombólise (rtPA)"],
  ["CRVM", "cirurgia de revascularização do miocárdio (CRVM)"],
  ["IAMCSST", "infarto agudo do miocárdio com supra de ST (IAMCSST)"],
  ["IAMSSST", "infarto agudo do miocárdio sem supra de ST (IAMSSST)"],
  ["SCASSST", "síndrome coronariana aguda sem supra de ST (SCASSST)"],
  ["ICFEr", "insuficiência cardíaca com fração de ejeção reduzida (ICFEr)"],
  ["ICFEp", "insuficiência cardíaca com fração de ejeção preservada (ICFEp)"],
  ["FEVE", "fração de ejeção do ventrículo esquerdo (FEVE)"],
  ["TVP", "trombose venosa profunda (TVP)"],
  ["TEP", "tromboembolismo pulmonar (TEP)"],
  ["TARV", "terapia antirretroviral (TARV)"],
  ["HBPM", "heparina de baixo peso molecular (HBPM)"],
  ["HNF", "heparina não fracionada (HNF)"],
  ["DOAC", "anticoagulante oral direto (DOAC)"],
  ["ATIII", "antitrombina III (ATIII)"],
  ["AINEs", "anti-inflamatórios não esteroides (AINEs)"],
  ["AINE", "anti-inflamatório não esteroide (AINE)"],
  ["DRC", "doença renal crônica (DRC)"],
  ["TFG", "taxa de filtração glomerular (TFG)"],
  ["LRA", "lesão renal aguda (LRA)"],
  ["PAVM", "pneumonia associada à ventilação mecânica (PAVM)"],
  ["DPOC", "doença pulmonar obstrutiva crônica (DPOC)"],
  ["SDRA", "síndrome do desconforto respiratório agudo (SDRA)"],
  ["AVCi", "acidente vascular cerebral isquêmico (AVCi)"],
  ["AVCh", "acidente vascular cerebral hemorrágico (AVCh)"],
  ["HSA", "hemorragia subaracnóidea (HSA)"],
  ["TCE", "traumatismo cranioencefálico (TCE)"],
  ["GCS", "escala de coma de Glasgow (GCS)"],
  ["CHC", "carcinoma hepatocelular (CHC)"],
  ["CBP", "colangite biliar primária (CBP)"],
  ["CEP", "colangite esclerosante primária (CEP)"],
  ["AUDC", "ácido ursodesoxicólico (AUDC)"],
  ["EPF", "exame parasitológico de fezes (EPF)"],
  ["BAAR", "bacilo álcool-ácido resistente (BAAR)"],
  ["MRSA", "Staphylococcus aureus resistente à meticilina (MRSA)"],
  ["CIUR", "crescimento intrauterino restrito (CIUR)"],
  ["RCIU", "restrição de crescimento intrauterino (RCIU)"],
  ["TTRN", "taquipneia transitória do recém-nascido (TTRN)"],
  ["HPPN", "hipertensão pulmonar persistente do recém-nascido (HPPN)"],
  ["VPP", "ventilação com pressão positiva (VPP)"],
  ["IOT", "intubação orotraqueal (IOT)"],
  ["USG", "ultrassonografia (USG)"],
  ["ECG", "eletrocardiograma (ECG)"],
  ["SGLT2", "inibidor do cotransportador sódio-glicose 2 (SGLT2)"],
  ["GLP-1", "agonista do peptídeo semelhante ao glucagon tipo 1 (GLP-1)"],
  ["iSGLT2", "inibidor de SGLT2"],
  ["DM2", "diabetes mellitus tipo 2 (DM2)"],
  ["DM1", "diabetes mellitus tipo 1 (DM1)"],
  ["SOP", "síndrome dos ovários policísticos (SOP)"],
  ["SUA", "sangramento uterino anormal (SUA)"],
  ["DIU", "dispositivo intrauterino (DIU)"],
  ["LARC", "contracepção de longa duração (LARC)"],
  ["DIP", "doença inflamatória pélvica (DIP)"],
  ["IST", "infecção sexualmente transmissível (IST)"],
  ["HPV", "papilomavírus humano (HPV)"],
  ["DHEG", "doença hipertensiva específica da gestação (DHEG)"],
  ["HPP", "hemorragia pós-parto (HPP)"],
  ["RPMO", "rotura prematura de membranas ovulares (RPMO)"],
  ["TPP", "trabalho de parto prematuro (TPP)"],
  ["CTG", "cardiotocografia (CTG)"],
  ["NASF", "Núcleo Ampliado de Saúde da Família (NASF)"],
  ["UBS", "Unidade Básica de Saúde (UBS)"],
  ["ESF", "Estratégia Saúde da Família (ESF)"],
  ["MFC", "medicina de família e comunidade (MFC)"],
  ["APS", "atenção primária à saúde (APS)"],
  ["SUS", "Sistema Único de Saúde (SUS)"],
  ["AAS", "ácido acetilsalicílico (AAS)"],
  ["INR", "razão normalizada internacional (INR)"],
  ["Hb", "hemoglobina (Hb)"],
  ["Ht", "hematócrito (Ht)"],
  ["SYNTAX", "SYNTAX"],
  ["UTI", "unidade de terapia intensiva (UTI)"],
  ["VO", "via oral (VO)"],
  ["IM", "via intramuscular (IM)"],
  // Não expandir "IV" sozinho: conflita com grau/classe IV (Fontaine, hemorroidas, ASA).
  ["DD", "diagnóstico diferencial (DD)"],
  ["Dx", "diagnóstico"],
  ["Tx", "tratamento"],
  ["ATB", "antibiótico (ATB)"],
  ["ITU", "infecção do trato urinário (ITU)"],
  ["ICP", "intervenção coronária percutânea (ICP)"],
  ["SCA", "síndrome coronariana aguda (SCA)"],
  ["HAS", "hipertensão arterial sistêmica (HAS)"],
  ["ICC", "insuficiência cardíaca (ICC)"],
  ["IAM", "infarto agudo do miocárdio (IAM)"],
  ["DAC", "doença arterial coronariana (DAC)"],
  ["FE", "fração de ejeção (FE)"],
  ["TC", "tomografia computadorizada (TC)"],
  ["RM", "ressonância magnética (RM)"],
  ["RX", "radiografia (RX)"],
  ["HIV", "vírus da imunodeficiência humana (HIV)"],
  ["OMS", "Organização Mundial da Saúde (OMS)"]
];

const BY_FILE = {
  "flashcards-cardio.json": [
    ["ICP", "intervenção coronária percutânea (ICP)"],
    ["SCA", "síndrome coronariana aguda (SCA)"],
    ["SCC", "síndrome coronariana crônica (SCC)"],
    ["DAC", "doença arterial coronariana (DAC)"],
    ["HAS", "hipertensão arterial sistêmica (HAS)"],
    ["ICC", "insuficiência cardíaca (ICC)"],
    ["IAM", "infarto agudo do miocárdio (IAM)"],
    ["FA", "fibrilação atrial (FA)"],
    ["TV", "taquicardia ventricular (TV)"],
    ["FV", "fibrilação ventricular (FV)"],
    ["BAV", "bloqueio atrioventricular (BAV)"],
    ["FE", "fração de ejeção (FE)"],
    ["PA", "pressão arterial (PA)"],
    ["FC", "frequência cardíaca (FC)"],
    ["PCR", "parada cardiorrespiratória (PCR)"],
    ["ECO", "ecocardiograma (ECO)"]
  ],
  "flashcards-infecto.json": [
    ["ITU", "infecção do trato urinário (ITU)"],
    ["PAC", "pneumonia adquirida na comunidade (PAC)"],
    ["HIV", "vírus da imunodeficiência humana (HIV)"],
    ["CMV", "citomegalovírus (CMV)"],
    ["HSV", "herpes-vírus simples (HSV)"],
    ["HBV", "vírus da hepatite B (HBV)"],
    ["HCV", "vírus da hepatite C (HCV)"],
    ["PCP", "pneumonia por Pneumocystis (PCP)"],
    ["PML", "leucoencefalopatia multifocal progressiva (PML)"],
    ["MAC", "complexo Mycobacterium avium (MAC)"],
    ["TB", "tuberculose (TB)"],
    ["ATB", "antibiótico (ATB)"],
    ["FQ", "fluoroquinolona (FQ)"],
    ["OI", "infecção oportunista (OI)"],
    ["CD4", "linfócitos T CD4"],
    ["TDF", "tenofovir (TDF)"],
    ["FA", "febre amarela (FA)"]
  ],
  "flashcards-nefro.json": [
    ["IRA", "insuficiência renal aguda (IRA)"],
    ["SN", "síndrome nefrótica (SN)"],
    ["HAS", "hipertensão arterial sistêmica (HAS)"]
  ],
  "flashcards-neuro.json": [
    ["AVC", "acidente vascular cerebral (AVC)"],
    ["AIT", "ataque isquêmico transitório (AIT)"],
    ["LEV", "levetiracetam (LEV)"],
    ["VPA", "valproato (VPA)"],
    ["AED", "antiepiléptico (AED)"],
    ["ACTH", "hormônio adrenocorticotrófico (ACTH)"],
    ["TC", "tomografia computadorizada (TC)"],
    ["RM", "ressonância magnética (RM)"]
  ],
  "flashcards-pneumo.json": [
    ["PAC", "pneumonia adquirida na comunidade (PAC)"],
    ["TB", "tuberculose (TB)"],
    ["VM", "ventilação mecânica (VM)"],
    ["FR", "frequência respiratória (FR)"]
  ],
  "flashcards-endo.json": [
    ["DM", "diabetes mellitus (DM)"],
    ["HAS", "hipertensão arterial sistêmica (HAS)"],
    ["SU", "sulfonilureia (SU)"]
  ],
  "flashcards-hemato.json": [
    ["LMA", "leucemia mieloide aguda (LMA)"],
    ["LMC", "leucemia mieloide crônica (LMC)"],
    ["LLA", "leucemia linfoblástica aguda (LLA)"],
    ["LLC", "leucemia linfocítica crônica (LLC)"],
    ["LNH", "linfoma não Hodgkin (LNH)"],
    ["SMD", "síndrome mielodisplásica (SMD)"],
    ["DvW", "doença de von Willebrand (DvW)"],
    ["PTI", "púrpura trombocitopênica imune (PTI)"],
    ["PTT", "púrpura trombocitopênica trombótica (PTT)"],
    ["CIVD", "coagulação intravascular disseminada (CIVD)"],
    ["ADC", "anemia de doença crônica (ADC)"],
    ["RDW", "amplitude de distribuição dos eritrócitos (RDW)"],
    ["CTF", "capacidade total de fixação do ferro (CTF)"]
  ],
  "flashcards-hepato.json": [
    ["HTP", "hipertensão portal (HTP)"],
    ["HBV", "vírus da hepatite B (HBV)"],
    ["HCV", "vírus da hepatite C (HCV)"]
  ],
  "flashcards-reu1.json": [
    ["AR", "artrite reumatoide (AR)"],
    ["FAN", "fator antinuclear (FAN)"]
  ],
  "flashcards-reu2.json": [
    ["AR", "artrite reumatoide (AR)"]
  ],
  "flashcards-reu3.json": [
    ["LES", "lúpus eritematoso sistêmico (LES)"],
    ["SAF", "síndrome antifosfolípide (SAF)"],
    ["FAN", "fator antinuclear (FAN)"]
  ],
  "flashcards-neonatologia.json": [
    ["RN", "recém-nascido (RN)"],
    ["IG", "idade gestacional (IG)"],
    ["PIG", "pequeno para a idade gestacional (PIG)"],
    ["AIG", "adequado para a idade gestacional (AIG)"],
    ["GIG", "grande para a idade gestacional (GIG)"],
    ["SDR", "síndrome do desconforto respiratório (SDR)"],
    ["SAM", "síndrome de aspiração meconial (SAM)"],
    ["DBP", "displasia broncopulmonar (DBP)"],
    ["GBS", "estreptococo do grupo B (GBS)"],
    ["CMV", "citomegalovírus (CMV)"],
    ["SBP", "Sociedade Brasileira de Pediatria (SBP)"],
    ["FC", "frequência cardíaca (FC)"],
    ["PC", "perímetro cefálico (PC)"],
    ["FR", "frequência respiratória (FR)"]
  ],
  "flashcards-gin1.json": [
    ["LAM", "método da lactação e amenorreia (LAM)"]
  ],
  "flashcards-obs1.json": [
    ["PE", "pré-eclâmpsia"]
  ],
  "flashcards-prev1.json": [],
  "flashcards-prev2.json": [],
  "flashcards-prev3.json": [],
  "flashcards-prev4.json": []
};

// Aplicar mapa de obstetrícia/ginecologia a todos obs/gin
for (const f of [
  "flashcards-obs1.json",
  "flashcards-obs2.json",
  "flashcards-obs3.json",
  "flashcards-obs4.json",
  "flashcards-obs5.json",
  "flashcards-gin1.json",
  "flashcards-gin2.json",
  "flashcards-gin3.json",
  "flashcards-gin4.json",
  "flashcards-gin5.json",
  "flashcards-gin6.json"
]) {
  BY_FILE[f] = [
    ...(BY_FILE[f] || []),
    ["HAS", "hipertensão arterial sistêmica (HAS)"],
    ["DM", "diabetes mellitus (DM)"]
  ];
}

for (const f of [
  "flashcards-cir1.json",
  "flashcards-cir2.json",
  "flashcards-cir3.json",
  "flashcards-cir-r1.json",
  "flashcards-ciresp.json",
  "flashcards-cir-lacunas.json"
]) {
  BY_FILE[f] = [
    ["TVP", "trombose venosa profunda (TVP)"],
    ["TEP", "tromboembolismo pulmonar (TEP)"],
    ["TC", "tomografia computadorizada (TC)"],
    ["USG", "ultrassonografia (USG)"],
    ["IOT", "intubação orotraqueal (IOT)"]
  ];
}

function expandField(text, pairs) {
  if (!text || typeof text !== "string") return text;
  let out = text;
  const used = new Set();

  for (const [abbr, full] of pairs) {
    // já expandido neste campo?
    if (full.includes("(") && out.includes(full.split(" (")[0]) && out.includes(`(${abbr})`)) {
      continue;
    }
    const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^A-Za-z0-9Á-ú])(${escaped})(?=[^A-Za-z0-9Á-ú]|$)`, "g");
    out = out.replace(re, (match, pre) => {
      if (used.has(abbr)) return match;
      used.add(abbr);
      return `${pre}${full}`;
    });
  }
  return out;
}

function processFile(file) {
  const full = path.join(DATA, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  const decks = Array.isArray(data) ? data : data.decks || [];
  const pairs = [...GLOBAL, ...(BY_FILE[file] || [])].sort(
    (a, b) => b[0].length - a[0].length
  );

  let n = 0;
  for (const deck of decks) {
    for (const card of deck.cards || []) {
      const f0 = card.front;
      const b0 = card.back;
      card.front = expandField(card.front, pairs);
      card.back = expandField(card.back, pairs);
      if (card.front !== f0 || card.back !== b0) n += 1;
    }
  }

  fs.writeFileSync(
    full,
    JSON.stringify(Array.isArray(data) ? decks : { ...data, decks }, null, 2) + "\n",
    "utf8"
  );
  return n;
}

const files = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith("flashcards-") && f.endsWith(".json"));

let total = 0;
for (const f of files) {
  const n = processFile(f);
  if (n) console.log(f, "→", n, "cards");
  total += n;
}
console.log("total cards touched:", total);

const cardio = JSON.parse(
  fs.readFileSync(path.join(DATA, "flashcards-cardio.json"), "utf8")
);
for (const d of cardio) {
  for (const c of d.cards || []) {
    if (/favorece/.test(c.front)) {
      console.log("\nEXAMPLE FRONT:", c.front);
      console.log("EXAMPLE BACK:", c.back);
    }
  }
}
