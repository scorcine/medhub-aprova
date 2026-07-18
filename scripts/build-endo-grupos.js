/**
 * Módulos de revisão · Endocrinologia (End1–3) + overview
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas End1–3 · MedHub R1 · Endocrinologia.",
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
      kicker: "Síntese Endócrino",
      blurb: temaFoco,
      verdict,
      foco: temaFoco,
      estilo: "Síntese nacional · Endocrinologia",
      priorities: [
        { tema: "Diagnóstico / lab", pct: 30 },
        { tema: "Conduta / droga", pct: 34 },
        { tema: "Urgências", pct: 18 },
        { tema: "DD / mapa", pct: 18 }
      ],
      deckOrder,
      checklist: ["dx", "conduta", "urgencia", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Diagnóstico", texto: "Hormônios e critérios." },
        { titulo: "Sessão 2 · Conduta", texto: "Drogas e algoritmos R1." },
        { titulo: "Sessão 3 · Urgências", texto: "CAD, crise tireotóxica, adrenal." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "DM, tireoide e adrenal caem bem nas provas gerais.",
      verdict: "Priorize DM/CAD, Graves/hipotireoidismo e Cushing/Addison.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Endocrinologia (síntese R1).",
      priorities: [
        { tema: "Diabetes", pct: 34 },
        { tema: "Tireoide", pct: 28 },
        { tema: "Adrenal / cálcio", pct: 20 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "urgencia", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de fisiopat e critérios diagnósticos.",
      verdict: "Eixo HHA, TSH/T4 e testes de estímulo/supressão.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Endocrinologia (síntese R1).",
      priorities: [
        { tema: "Fisiopat / lab", pct: 34 },
        { tema: "Tireoide / DM", pct: 28 },
        { tema: "Adrenal / hipófise", pct: 22 },
        { tema: "DD", pct: 16 }
      ],
      deckOrder,
      checklist: ["dx", "urgencia", "conduta", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Conduta e onco tireoidiano.",
      verdict: "Nódulos/câncer, DM tratamento e feocromocitoma.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Endocrinologia (síntese R1).",
      priorities: [
        { tema: "DM / obesidade", pct: 30 },
        { tema: "Tireoide onco", pct: 26 },
        { tema: "Adrenal", pct: 24 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "urgencia", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "CAD, hipotireoidismo e hipoglicemia primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Endocrinologia.",
      priorities: [
        { tema: "Urgências DM", pct: 34 },
        { tema: "Tireoide", pct: 28 },
        { tema: "Adrenal", pct: 20 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "urgencia", "dd"]
    })
  ];
}

const checklistItems = {
  dx: {
    tema: "Diagnóstico / lab",
    yield: "Alto",
    pegar: "TSH/T4; HbA1c; cortisol/ACTH; cálcio/PTH; metanefrinas."
  },
  conduta: {
    tema: "Conduta / droga",
    yield: "Máximo",
    pegar: "Metformina; levotiroxina; metimazol; insulina na CAD; hidrocortisona."
  },
  urgencia: {
    tema: "Urgências",
    yield: "Alto",
    pegar: "CAD/HHNS; crise tireotóxica; insuficiência adrenal aguda; hipoglicemia."
  },
  dd: {
    tema: "Diagnóstico diferencial / mapa",
    yield: "Alto",
    pegar: "Graves×tireoidite; Cushing ACTH-dep×indep; DM1×DM2; nódulo benigno×câncer."
  }
};

write(
  "revisao-endo-tireoide.json",
  "Tireoide · hipertireoidismo · Graves",
  "endo-tireoide",
  bankSet(
    ["endo-tireoide-basico", "endo-hipertireoidismo", "endo-graves"],
    "Fisiologia · hipertireoidismo · Graves",
    "TSH baixo + T4 alto e Graves (TRAb/órbita) são o núcleo."
  ),
  {
    checklistItems,
    oneLiners: ["TSH guia a tireoide", "Graves = TRAb + oftalmopatia", "Metimazol / PTU"]
  }
);

write(
  "revisao-endo-hipotireo.json",
  "Hipotireoidismo · tireoidites",
  "endo-hipotireo",
  bankSet(
    ["endo-hipotireoidismo", "endo-tireoidites"],
    "Hipo · Hashimoto · tireoidites",
    "Hashimoto é a causa #1 de hipo em área com iodo suficiente."
  ),
  {
    checklistItems,
    oneLiners: ["Hipo = TSH alto", "Hashimoto = anti-TPO", "Levotiroxina = reposição"]
  }
);

write(
  "revisao-endo-nodulos.json",
  "Nódulos · câncer de tireoide",
  "endo-nodulos",
  bankSet(
    ["endo-nodulos-cancer-tireoide"],
    "Nódulo · PAAF · câncer",
    "USG + PAAF e tipos histológicos (papilífero etc.)."
  ),
  {
    checklistItems,
    oneLiners: ["PAAF decide nódulo", "Papilífero = mais comum", "Calcitonina no medular"]
  }
);

write(
  "revisao-endo-adrenal.json",
  "Suprarrenal · Cushing · Addison · feo · Conn",
  "endo-adrenal",
  bankSet(
    [
      "endo-cushing",
      "endo-addison-insuficiencia-adrenal",
      "endo-feocromocitoma",
      "endo-hiperaldosteronismo"
    ],
    "Cushing · Addison · feocromocitoma · hiperaldosteronismo",
    "Cortisol/ACTH, crise adrenal e metanefrinas."
  ),
  {
    checklistItems,
    oneLiners: ["Cushing = hipercortisolismo", "Addison = crise + Na↓ K↑", "Feo = metanefrinas", "Conn = aldo/renina"]
  }
);

write(
  "revisao-endo-paratireoide.json",
  "Paratireoide · cálcio",
  "endo-paratireoide",
  bankSet(
    ["endo-paratireoide"],
    "HIPER/HIPO PTH · vitamina D",
    "Cálcio + PTH juntos fecham o mapa."
  ),
  {
    checklistItems,
    oneLiners: ["HiperPTH = Ca↑ PTH↑", "HipoPTH = Ca↓ PTH↓", "Vit D na osteomalácia"]
  }
);

write(
  "revisao-endo-hipofise.json",
  "Hipófise · hipotálamo",
  "endo-hipofise",
  bankSet(
    ["endo-hipofise"],
    "Acromegalia · prolactinoma · DI/SIADH",
    "Adenomas secretores e distúrbios da água."
  ),
  {
    checklistItems,
    oneLiners: ["Prolactinoma = cabergolina", "Acromegalia = IGF-1/GH", "DI × SIADH"]
  }
);

write(
  "revisao-endo-dm.json",
  "Diabetes · diagnóstico · tratamento",
  "endo-dm",
  bankSet(
    ["endo-dm-basico", "endo-dm-tratamento"],
    "DM1×DM2 · HbA1c · metformina · insulina",
    "Critérios diagnósticos e 1ª linha do DM2."
  ),
  {
    checklistItems,
    oneLiners: ["HbA1c ≥6,5%", "Metformina 1ª linha DM2", "DM1 = insulina"]
  }
);

write(
  "revisao-endo-dm-complicacoes.json",
  "DM · complicações crônicas · pé",
  "endo-dm-complicacoes",
  bankSet(
    ["endo-dm-cronicas", "endo-pe-diabetico"],
    "Retino · nefro · neuro · pé",
    "Microvasculares e pé diabético."
  ),
  {
    checklistItems,
    oneLiners: ["Retino/nefro/neuro", "Pé = neuropatia + isquemia", "Rastreio anual"]
  }
);

write(
  "revisao-endo-urgencias-dm.json",
  "CAD · HHNS · hipoglicemia",
  "endo-urgencias-dm",
  bankSet(
    ["endo-dm-agudas", "endo-hipoglicemia"],
    "Complicações agudas · hipoglicemia",
    "CAD vs estado hiperosmolar e correção da hipoglicemia."
  ),
  {
    checklistItems,
    oneLiners: ["CAD = cetonas + acidose", "HHNS = osmolaridade alta", "Hipoglicemia = glicose imediata"]
  }
);

write(
  "revisao-endo-obesidade.json",
  "Obesidade",
  "endo-obesidade",
  bankSet(
    ["endo-obesidade"],
    "IMC · conduta clínica",
    "Classificação e abordagem clínica da obesidade."
  ),
  {
    checklistItems,
    oneLiners: ["IMC classifica", "Mudança de estilo de vida", "Fármacos/cirurgia selecionados"]
  }
);

const stats = {
  title: "Endocrinologia · o que mais cai (R1) — End1–3 completa",
  unitLabel: "% relativo no bloco",
  note: "Síntese R1 + apostilas End1–3 (série completa MedHub).",
  gaps: {
    summary: "Endocrinologia coberta em 10 grupos (End1–3 completa).",
    missingHighYield: [],
    covered: [
      { tema: "Tireoide / Graves", grupo: "endo-tireoide" },
      { tema: "Hipotireoidismo / tireoidites", grupo: "endo-hipotireo" },
      { tema: "Nódulos / câncer tireoide", grupo: "endo-nodulos" },
      { tema: "Adrenal", grupo: "endo-adrenal" },
      { tema: "Paratireoide", grupo: "endo-paratireoide" },
      { tema: "Hipófise", grupo: "endo-hipofise" },
      { tema: "Diabetes", grupo: "endo-dm" },
      { tema: "DM crônicas / pé", grupo: "endo-dm-complicacoes" },
      { tema: "CAD / hipoglicemia", grupo: "endo-urgencias-dm" },
      { tema: "Obesidade", grupo: "endo-obesidade" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Síntese R1 + apostilas End1–3 MedHub.",
      verdict: "Série completa: tireoide, DM e adrenal/cálcio.",
      foco: "DM · tireoide · adrenal",
      estilo: "Síntese R1",
      priorities: [
        { tema: "Diabetes", pct: 32, n: 32 },
        { tema: "Tireoide", pct: 28, n: 28 },
        { tema: "Adrenal / cálcio / hipófise", pct: 24, n: 24 },
        { tema: "Obesidade", pct: 16, n: 16 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Endocrinologia (síntese End1–3).",
      verdict: "DM e tireoide dominam; CAD nas urgências.",
      foco: "DM · Graves · CAD",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "DM / CAD", pct: 40 },
        { tema: "Tireoide", pct: 28 },
        { tema: "Adrenal", pct: 18 },
        { tema: "Outros", pct: 14 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Endocrinologia (síntese End1–3).",
      verdict: "Eixos hormonais e testes dinâmicos.",
      foco: "Cushing · hipófise · tireoide",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Lab / eixos", pct: 34 },
        { tema: "Tireoide / DM", pct: 28 },
        { tema: "Adrenal / hipófise", pct: 22 },
        { tema: "Outros", pct: 16 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Endocrinologia (síntese End1–3).",
      verdict: "Nódulos tireoidianos e tratamento do DM.",
      foco: "Nódulo · metformina/GLP1 · feo",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "DM / obesidade", pct: 32 },
        { tema: "Tireoide onco", pct: 28 },
        { tema: "Adrenal", pct: 22 },
        { tema: "Outros", pct: 18 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Endocrinologia End1–3.",
      verdict: "Urgências: CAD, hipoglicemia e crise adrenal.",
      foco: "CAD · hipoglicemia · Addison",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Urgências", pct: 40 },
        { tema: "Tireoide / DM", pct: 30 },
        { tema: "Adrenal", pct: 16 },
        { tema: "Outros", pct: 14 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-endocrinologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-endocrinologia-geral.json");
require("./expand-endo-bancas.js");
