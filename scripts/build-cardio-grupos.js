/**
 * Módulos de revisão · Cardiologia (Car1–3) + overview
 * Atenção especial: SCA, ICC, FA e HAS no núcleo.
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas Car1–3 · MedHub R1 · Cardiologia.",
    ...o
  };
}

function write(file, title, module, profiles, extra = {}) {
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify({ title, module, profiles, ...extra }, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}

function bankSet(deckOrder, temaFoco, verdict) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese Cardio",
      blurb: temaFoco,
      verdict,
      foco: temaFoco,
      estilo: "Síntese nacional · Cardiologia",
      priorities: [
        { tema: "SCA / IAM", pct: 28 },
        { tema: "ICC / HAS", pct: 24 },
        { tema: "Arritmias / PCR", pct: 24 },
        { tema: "Valvas / outros", pct: 24 }
      ],
      deckOrder,
      checklist: ["urgencia", "conduta", "dx", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Urgência", texto: "SCA, PCR, tamponamento, crise HAS." },
        { titulo: "Sessão 2 · Conduta", texto: "Reperfusão, DAPT, IECA/BB, anticoagulação." },
        { titulo: "Sessão 3 · Diagnóstico", texto: "ECG, troponina, eco, critérios clínicos." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "SCA, ICC e FA dominam provas gerais.",
      verdict: "Priorize STEMI/NSTEMI, ICC com FE reduzida e FA (CHA2DS2-VASc).",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Cardiologia (síntese R1).",
      priorities: [
        { tema: "SCA / IAM", pct: 32 },
        { tema: "ICC", pct: 22 },
        { tema: "FA / arritmias", pct: 22 },
        { tema: "HAS / valvas", pct: 24 }
      ],
      deckOrder,
      checklist: ["urgencia", "conduta", "dx", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "ECG, fisiopat e critérios.",
      verdict: "STEMI critérios, Killip, BAV e sopros com localização.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Cardiologia (síntese R1).",
      priorities: [
        { tema: "ECG / arritmias", pct: 30 },
        { tema: "SCA", pct: 28 },
        { tema: "ICC / valvas", pct: 24 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["dx", "urgencia", "conduta", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Conduta de SCA e ICC.",
      verdict: "Reperfusão, DAPT, IECA/BB/ARM e anticoagulação na FA.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Cardiologia (síntese R1).",
      priorities: [
        { tema: "Conduta SCA/ICC", pct: 34 },
        { tema: "FA / PCR", pct: 24 },
        { tema: "HAS / valvas", pct: 22 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["conduta", "urgencia", "dx", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "IAM com SST, ICC descompensada e PCR primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Cardiologia.",
      priorities: [
        { tema: "Urgências cardio", pct: 34 },
        { tema: "SCA", pct: 26 },
        { tema: "ICC / FA", pct: 22 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["urgencia", "conduta", "dx", "dd"]
    })
  ];
}

const checklistItems = {
  urgencia: {
    tema: "Urgências",
    yield: "Máximo",
    pegar: "STEMI reperfusão; PCR ACLS; tamponamento; crise hipertensiva/dissecção; TV/FV."
  },
  conduta: {
    tema: "Conduta / droga",
    yield: "Máximo",
    pegar: "DAPT; heparina; IECA/BB/ARM; anticoagulação FA; trombólise×ICP."
  },
  dx: {
    tema: "Diagnóstico / ECG",
    yield: "Alto",
    pegar: "Critérios SST; troponina; Killip; CHA2DS2-VASc; Duke; Beck."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "AI×NSTEMI×STEMI; pericardite×IAM; FEPEF×FEREF; sopros."
  }
};

write(
  "revisao-cardio-scc.json",
  "Síndrome coronariana crônica",
  "cardio-scc",
  bankSet(
    ["cardio-scc"],
    "Angina estável · tratamento clínico · revascularização",
    "CCS, anti-isquêmicos e quando revascularizar."
  ),
  { checklistItems, oneLiners: ["AAS + estatina base", "BB anti-isquêmico", "Revasc se alto risco"] }
);

write(
  "revisao-cardio-sca.json",
  "SCA · NSTEMI · STEMI",
  "cardio-sca",
  bankSet(
    ["cardio-sca-sem-sst", "cardio-sca-com-sst", "cardio-iam-complicacoes", "cardio-revasc"],
    "SCA sem/com SST · complicações · CRM",
    "Reperfusão e antiplaquetários são o núcleo da Car1."
  ),
  {
    checklistItems,
    oneLiners: ["STEMI = reperfusão já", "DAPT sempre", "Killip estratifica", "Complicações mecânicas"]
  }
);

write(
  "revisao-cardio-pericardio.json",
  "Pericardiopatias",
  "cardio-pericardio",
  bankSet(
    ["cardio-pericardiopatias"],
    "Pericardite · tamponamento",
    "Dor pleurítica, ECG difuso e tríade de Beck."
  ),
  { checklistItems, oneLiners: ["Pericardite ≠ SST focal", "Beck = tamponamento", "AINE na aguda"] }
);

write(
  "revisao-cardio-icc.json",
  "Insuficiência cardíaca",
  "cardio-icc",
  bankSet(
    ["cardio-icc-basico", "cardio-icc-tratamento"],
    "ICC · diagnóstico · tratamento",
    "IECA/BB/ARM (± ARNI/SGLT2) e congestão."
  ),
  {
    checklistItems,
    oneLiners: ["NYHA + FE", "Tríplice/quádrupla terapia", "Diurético na congestão"]
  }
);

write(
  "revisao-cardio-has.json",
  "Hipertensão arterial",
  "cardio-has",
  bankSet(
    ["cardio-has"],
    "HAS · metas · crise · dissecção",
    "Diagnóstico, drogas e emergência hipertensiva."
  ),
  { checklistItems, oneLiners: ["Meta individualizar", "Emergência = dano de órgão", "Dissecção = β primeiro"] }
);

write(
  "revisao-cardio-valvas.json",
  "Valvopatias · endocardite",
  "cardio-valvas",
  bankSet(
    ["cardio-valvas-estenose", "cardio-valvas-insuficiencia"],
    "Estenoses · insuficiências · endocardite",
    "Sopros, eco e indicação cirúrgica."
  ),
  { checklistItems, oneLiners: ["EA = sopro ejeção", "IM aguda pós-IAM", "Duke na endocardite"] }
);

write(
  "revisao-cardio-miopatias.json",
  "Cardiomiopatias · semiologia · HP",
  "cardio-miopatias",
  bankSet(
    ["cardio-cardiomiopatias", "cardio-semiologia-hp", "cardio-transplante"],
    "MCD · MCH · restritiva · HP · Tx",
    "Fenótipos e pistas semiológicas."
  ),
  { checklistItems, oneLiners: ["MCH = sopro ↑ Valsalva", "HP grupos WHO", "Semiologia localiza sopro"] }
);

write(
  "revisao-cardio-fa.json",
  "FA · flutter · taquicardias",
  "cardio-fa",
  bankSet(
    ["cardio-fa-flutter", "cardio-tvs-svt"],
    "FA · flutter · SVT/TV",
    "Anticoagular FA e distinguir taquicardias de QRS."
  ),
  {
    checklistItems,
    oneLiners: ["CHA2DS2-VASc decide ACO", "FC×ritmo", "Adenosina na SVT", "TV instável = cardioversão"]
  }
);

write(
  "revisao-cardio-bradi.json",
  "Bradiarritmias · BAV · marca-passo",
  "cardio-bradi",
  bankSet(
    ["cardio-bradi-bav", "cardio-bloqueios-ecg"],
    "BAV · BRE/BRD · MP",
    "Quando indicar marca-passo e padrões de ECG."
  ),
  { checklistItems, oneLiners: ["BAV 3 = MP", "BRE novo + dor = SCA", "Hemibloqueios"] }
);

write(
  "revisao-cardio-pcr.json",
  "PCR · antiarrítmicos",
  "cardio-pcr",
  bankSet(
    ["cardio-pcr", "cardio-antiarrhythmicos"],
    "PCR · ACLS · drogas",
    "Ritmos chocáveis e amiodarona/adrenalina."
  ),
  { checklistItems, oneLiners: ["FV/TVSP = choque", "RCP contínua", "Amiodarona no refratário"] }
);

const stats = {
  title: "Cardiologia · o que mais cai (R1)",
  unitLabel: "% relativo no bloco",
  note: "Síntese Enare/USP/UNIFESP + apostilas Car1–3. SCA e ICC lideram; FA/PCR e HAS fecham o núcleo.",
  gaps: {
    summary: "Cardiologia Car1–3 coberta em 10 grupos com atenção especial a SCA, ICC e arritmias.",
    missingHighYield: [],
    covered: [
      { tema: "SCA / IAM / complicações", grupo: "cardio-sca" },
      { tema: "Angina crônica", grupo: "cardio-scc" },
      { tema: "Pericárdio", grupo: "cardio-pericardio" },
      { tema: "ICC", grupo: "cardio-icc" },
      { tema: "HAS", grupo: "cardio-has" },
      { tema: "Valvas / endocardite", grupo: "cardio-valvas" },
      { tema: "Cardiomiopatias / HP", grupo: "cardio-miopatias" },
      { tema: "FA / taquicardias", grupo: "cardio-fa" },
      { tema: "Bradi / BAV / ECG", grupo: "cardio-bradi" },
      { tema: "PCR / antiarrítmicos", grupo: "cardio-pcr" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Levantamentos Enare + USP + UNIFESP + apostilas Car1–3.",
      verdict: "Monte o núcleo em SCA/IAM, ICC e FA; complete com HAS, valvas e PCR.",
      foco: "SCA · ICC · FA · HAS",
      estilo: "Síntese R1",
      priorities: [
        { tema: "SCA / IAM", pct: 28, n: 28 },
        { tema: "ICC", pct: 18, n: 18 },
        { tema: "FA / arritmias / PCR", pct: 22, n: 22 },
        { tema: "HAS", pct: 12, n: 12 },
        { tema: "Valvas / pericárdio", pct: 12, n: 12 },
        { tema: "Miopatias / outros", pct: 8, n: 8 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Cardiologia (síntese Car1–3).",
      verdict: "SCA e ICC lideram; FA e HAS fecham o núcleo generalista.",
      foco: "SCA · ICC · FA",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "SCA / IAM", pct: 32 },
        { tema: "ICC", pct: 22 },
        { tema: "FA / arritmias", pct: 22 },
        { tema: "HAS / valvas", pct: 24 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Cardiologia (síntese Car1–3).",
      verdict: "ECG, critérios de STEMI e fisiopatologia valvar/arritmia.",
      foco: "ECG · SCA · valvas",
      estilo: "Padrão USP",
      priorities: [
        { tema: "ECG / arritmias", pct: 30 },
        { tema: "SCA", pct: 28 },
        { tema: "ICC / valvas", pct: 24 },
        { tema: "Outros", pct: 18 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Cardiologia (síntese Car1–3).",
      verdict: "Conduta de SCA/ICC e anticoagulação na FA.",
      foco: "Conduta · SCA · FA",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Conduta SCA/ICC", pct: 34 },
        { tema: "FA / PCR", pct: 24 },
        { tema: "HAS / valvas", pct: 22 },
        { tema: "Outros", pct: 20 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Cardiologia Car1–3.",
      verdict: "Urgências: STEMI, ICC descompensada e PCR primeiro.",
      foco: "Urgências · SCA · PCR",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Urgências cardio", pct: 34 },
        { tema: "SCA", pct: 26 },
        { tema: "ICC / FA", pct: 22 },
        { tema: "Outros", pct: 18 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-cardiologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-cardiologia-geral.json");
require("./expand-cardio-bancas.js");
