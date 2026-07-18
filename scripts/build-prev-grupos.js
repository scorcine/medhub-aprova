/**
 * Módulos de revisão · Preventiva (Prev1–4) + overview
 * Modelo UX: Pediatria (4 grupos · vários subtemas).
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas Prev1–4 · MedHub R1 · Preventiva.",
    ...o
  };
}

function write(file, title, module, profiles, extra = {}) {
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify({ title, module, profiles, ...extra }, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}

function bankSet(deckOrder, temaFoco, verdict, priorities) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese Preventiva",
      blurb: temaFoco,
      verdict,
      foco: temaFoco,
      estilo: "Síntese nacional · Preventiva",
      priorities,
      deckOrder,
      checklist: ["conceito", "calculo", "sistema", "conduta"],
      sessoes: [
        { titulo: "Sessão 1 · Conceitos", texto: "Definições e princípios que mais caem." },
        { titulo: "Sessão 2 · Aplicação", texto: "Cálculos, sistemas e interpretação." },
        { titulo: "Sessão 3 · Prova", texto: "Pegadinhas clássicas das bancas R1." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "SUS, estudos e indicadores dominam.",
      verdict: "Priorize princípios do SUS, RR/OR/testes dx e mortalidade infantil/ISU.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Preventiva (síntese R1).",
      priorities,
      deckOrder,
      checklist: ["conceito", "calculo", "sistema", "conduta"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Cálculo epidemiológico e SUS fino.",
      verdict: "Desenhos de estudo, sensibilidade/especificidade e financiamento/APS.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Preventiva (síntese R1).",
      priorities,
      deckOrder,
      checklist: ["conceito", "calculo", "sistema"]
    })
  ];
}

const checklistItems = ["conceito", "calculo", "sistema", "conduta"];

write(
  "revisao-prev-sus.json",
  "SUS · APS · programas",
  "prev-sus",
  bankSet(
    [
      "psus-reforma",
      "psus-principios",
      "psus-legislacao",
      "psus-financiamento",
      "psus-programas",
      "psus-aps-esf",
      "psus-promocao"
    ],
    "SUS · princípios · APS/ESF · promoção",
    "Universalidade, integralidade, equidade, ESF e níveis de prevenção são o núcleo do Prev1.",
    [
      { tema: "Princípios do SUS", pct: 26 },
      { tema: "APS / ESF", pct: 24 },
      { tema: "Financiamento / Previne", pct: 22 },
      { tema: "Programas / promoção", pct: 28 }
    ]
  ),
  {
    checklistItems,
    oneLiners: [
      "Art. 196 CF/88",
      "Leis 8.080 e 8.142",
      "EC 29 = pisos",
      "ESF = porta de entrada",
      "Primária ↓ incidência",
      "Previne = 4 componentes"
    ]
  }
);

write(
  "revisao-prev-epidemiologia.json",
  "Epidemiologia · estudos · testes",
  "prev-epidemiologia",
  bankSet(
    [
      "pepi-desenhos",
      "pepi-associacao",
      "pepi-estatistica",
      "pepi-testes-dx",
      "pepi-roc-lr"
    ],
    "Desenhos · RR/OR · testes diagnósticos",
    "Coorte/caso-controle, associação e sensibilidade/especificidade.",
    [
      { tema: "Desenhos de estudo", pct: 28 },
      { tema: "RR / OR / RP", pct: 26 },
      { tema: "Testes diagnósticos", pct: 28 },
      { tema: "Estatística / ROC", pct: 18 }
    ]
  ),
  {
    checklistItems,
    oneLiners: [
      "Coorte → RR",
      "Caso-controle → OR",
      "VPP depende da prevalência",
      "Alta sensibilidade = afastar",
      "Paralelo ↑ sens · série ↑ espec",
      "Fases I–IV do ensaio"
    ]
  }
);

write(
  "revisao-prev-vigilancia.json",
  "Vigilância · HND · ética",
  "prev-vigilancia",
  bankSet(
    [
      "pvig-vigilancia",
      "pvig-sistemas",
      "pvig-notificacao",
      "pvig-epidemias",
      "pvig-hnd-prevencao",
      "pvig-trabalhador",
      "pvig-etica"
    ],
    "VE · sistemas · prevenção · ética",
    "SINAN/SIM, notificação, Leavell & Clark e CEM.",
    [
      { tema: "Sistemas de informação", pct: 24 },
      { tema: "Notificação / epidemias", pct: 26 },
      { tema: "HND / prevenção", pct: 24 },
      { tema: "Trabalho / ética", pct: 26 }
    ]
  ),
  {
    checklistItems,
    oneLiners: [
      "SINAN = agravos",
      "SIM = óbitos",
      "SISVAN / SISAGUA",
      "Emergente × reemergente × negligenciada",
      "Primária no pré-patogênico",
      "CAT no acidente de trabalho"
    ]
  }
);

write(
  "revisao-prev-indicadores.json",
  "Indicadores · mortalidade · ISU",
  "prev-indicadores",
  bankSet(
    [
      "pind-conceitos",
      "pind-demografia",
      "pind-morbidade",
      "pind-mortalidade",
      "pind-infantil-isu"
    ],
    "Indicadores · MI · ISU",
    "Prevalência/incidência, mortalidade infantil e Swaroop-Uemura.",
    [
      { tema: "Morbidade", pct: 26 },
      { tema: "Mortalidade / padronização", pct: 26 },
      { tema: "MI / perinatal", pct: 24 },
      { tema: "ISU / demografia", pct: 24 }
    ]
  ),
  {
    checklistItems,
    oneLiners: [
      "Prevalência ≠ incidência",
      "CMI = <1 ano",
      "ISU alto = melhor saúde",
      "Morte materna / 100 mil NV",
      "Nelson Moraes I–IV",
      "Padronizar para comparar"
    ]
  }
);

const stats = {
  title: "Preventiva · o que mais cai (R1)",
  unitLabel: "% relativo no bloco",
  note: "Síntese Enare/USP + apostilas Prev1–4. SUS e epidemiologia lideram; vigilância e indicadores fecham.",
  gaps: {
    summary: "Preventiva Prev1–4 em 4 grupos (modelo Pediatria) com subtemas por apostila.",
    missingHighYield: [],
    covered: [
      { tema: "SUS / APS / programas", grupo: "prev-sus" },
      { tema: "Epidemiologia / testes dx", grupo: "prev-epidemiologia" },
      { tema: "Vigilância / HND / ética", grupo: "prev-vigilancia" },
      { tema: "Indicadores / MI / ISU", grupo: "prev-indicadores" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Levantamentos Enare + USP + apostilas Prev1–4.",
      verdict: "Monte o núcleo em SUS + desenhos/testes dx; complete com indicadores e vigilância.",
      foco: "SUS · Epidemiologia · Indicadores · Vigilância",
      estilo: "Síntese R1",
      priorities: [
        { tema: "SUS / APS", pct: 30, n: 30 },
        { tema: "Epidemiologia / testes", pct: 28, n: 28 },
        { tema: "Indicadores", pct: 22, n: 22 },
        { tema: "Vigilância / ética", pct: 20, n: 20 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-preventiva-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-preventiva-geral.json");
