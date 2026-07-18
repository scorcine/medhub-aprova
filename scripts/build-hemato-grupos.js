/**
 * Módulos de revisão · Hematologia (Hem1–3) + overview
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas Hem1–3 · MedHub R1 · Hematologia.",
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
      kicker: "Síntese Hemato",
      blurb: temaFoco,
      verdict,
      foco: temaFoco,
      estilo: "Síntese nacional · Hematologia",
      priorities: [
        { tema: "Diagnóstico / lab", pct: 30 },
        { tema: "Conduta / droga", pct: 32 },
        { tema: "Urgências", pct: 20 },
        { tema: "DD / mapa", pct: 18 }
      ],
      deckOrder,
      checklist: ["dx", "conduta", "urgencia", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Diagnóstico", texto: "Hemograma, esfregaço e marcadores." },
        { titulo: "Sessão 2 · Conduta", texto: "Drogas e algoritmos R1." },
        { titulo: "Sessão 3 · Urgências", texto: "Sangramento, blastos, PTT." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Anemias, PTI e leucemias caem bem nas provas gerais.",
      verdict: "Priorize ferropriva×ADC, B12, PTI e LMA/LLA urgências.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Hematologia (síntese R1).",
      priorities: [
        { tema: "Anemias", pct: 32 },
        { tema: "Hemostasia / PTI", pct: 28 },
        { tema: "Leucemias / linfomas", pct: 22 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "urgencia", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de fisiopat, morfologia e critérios.",
      verdict: "Esfregaço, citogenética e critérios de PTT/CID.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Hematologia (síntese R1).",
      priorities: [
        { tema: "Fisiopat / lab", pct: 34 },
        { tema: "Onco-hemato", pct: 28 },
        { tema: "Hemostasia", pct: 22 },
        { tema: "DD", pct: 16 }
      ],
      deckOrder,
      checklist: ["dx", "urgencia", "conduta", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Conduta em urgências e onco-hemato.",
      verdict: "LMA/LLA, mieloma e anticoagulação.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Hematologia (síntese R1).",
      priorities: [
        { tema: "Leucemias / linfomas", pct: 30 },
        { tema: "Hemostasia", pct: 28 },
        { tema: "Anemias", pct: 24 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "urgencia", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "Ferropriva, PTI, PTT e blastos primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Hematologia.",
      priorities: [
        { tema: "Anemias / PTI", pct: 36 },
        { tema: "Urgências onco", pct: 26 },
        { tema: "Coagulação", pct: 20 },
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
    pegar: "VCM/RDW; ferritina×ADC; B12; esquizócitos; blastos; BCR-ABL."
  },
  conduta: {
    tema: "Conduta / droga",
    yield: "Máximo",
    pegar: "Ferro oral; B12 IM; hidroxiureia; imatinibe; rituximabe; IGIV/corticoide PTI."
  },
  urgencia: {
    tema: "Urgências",
    yield: "Alto",
    pegar: "LMA+CIVD; PTT plasmaferese; hemofilia sangramento; CID."
  },
  dd: {
    tema: "Diagnóstico diferencial / mapa",
    yield: "Alto",
    pegar: "Ferropriva×ADC×talassemia; PTI×PTT; LNH×Hodgkin; vW×hemofilia."
  }
};

write(
  "revisao-hema-anemias.json",
  "Anemias · ferropriva · ADC",
  "hema-anemias",
  bankSet(
    ["hema-anemia-intro", "hema-ferropriva", "hema-anemia-doenca-cronica"],
    "Introdução · ferropriva · doença crônica",
    "Domine VCM/RDW, ferritina e o DD ferropriva × ADC."
  ),
  {
    checklistItems,
    oneLiners: ["Ferropriva = ↓ ferritina", "ADC = ferritina N/↑", "VCM+RDW guiam o mapa"]
  }
);

write(
  "revisao-hema-megaloblastica.json",
  "Anemia megaloblástica",
  "hema-megaloblastica",
  bankSet(
    ["hema-megaloblastica"],
    "B12 · folato · neurológico",
    "B12 vs folato e sintomas neurológicos são high-yield."
  ),
  {
    checklistItems,
    oneLiners: ["VCM alto + neutrófilos hipersegmentados", "B12: neurológico", "Tratar B12 antes do folato se dúvida"]
  }
);

write(
  "revisao-hema-hemoliticas.json",
  "Hemolíticas · hemoglobinopatias",
  "hema-hemoliticas",
  bankSet(
    ["hema-hemoliticas-geral", "hema-ahai", "hema-g6pd-esferocitose", "hema-talassemia", "hema-falciforme"],
    "Hemólise · AHAI · G6PD · talassemia · falciforme",
    "Hemólise extravascular×intravascular e crises falciformes."
  ),
  {
    checklistItems,
    oneLiners: ["↑ LDH + ↓ haptoglobina", "Coombs na AHAI", "Falciforme: vaso-oclusão / STA"]
  }
);

write(
  "revisao-hema-smd.json",
  "SMD · sideroblástica",
  "hema-smd",
  bankSet(
    ["hema-smd", "hema-sideroblastica"],
    "Mielodisplasia · sideroblastos",
    "Idoso + citopenia + displasia = pensar SMD."
  ),
  {
    checklistItems,
    oneLiners: ["SMD = idoso + citopenias", "Sideroblasto em anel", "Risco de evolução a LMA"]
  }
);

write(
  "revisao-hema-leucemias.json",
  "Leucemias · LMA · LLA · LMC · LLC",
  "hema-leucemias",
  bankSet(
    ["hema-lma", "hema-lla", "hema-lmc", "hema-llc"],
    "Agudas e crônicas",
    "Blasto≥20%, BCR-ABL e estadiamento da LLC."
  ),
  {
    checklistItems,
    oneLiners: ["LMA: Auer / CIVD na M3", "LLA: criança", "LMC: Filadélfia / TKI", "LLC: linfócitos maduros"]
  }
);

write(
  "revisao-hema-nmp.json",
  "Neoplasias mieloproliferativas",
  "hema-nmp",
  bankSet(
    ["hema-pv", "hema-mf", "hema-te"],
    "PV · TE · MF · JAK2",
    "JAK2 e critérios de PV/MF."
  ),
  {
    checklistItems,
    oneLiners: ["JAK2 nas NMP", "PV = Ht alto", "MF = fibrose + sintomas B"]
  }
);

write(
  "revisao-hema-linfomas.json",
  "Linfomas · Hodgkin · LNH",
  "hema-linfomas",
  bankSet(
    ["hema-hodgkin", "hema-lnh"],
    "Hodgkin · não Hodgkin",
    "Célula de Reed-Sternberg e subtipos agressivos×indolentes."
  ),
  {
    checklistItems,
    oneLiners: ["Hodgkin = Reed-Sternberg", "LNH = agressivo×indolente", "Sintomas B"]
  }
);

write(
  "revisao-hema-mieloma.json",
  "Mieloma · gamopatias",
  "hema-mieloma",
  bankSet(
    ["hema-mieloma"],
    "Mieloma · MGUS · Waldenström",
    "CRAB, pico monoclonal e DD com MGUS."
  ),
  {
    checklistItems,
    oneLiners: ["CRAB = mieloma", "MGUS ≠ tratar", "Cadeias leves / proteinuria"]
  }
);

write(
  "revisao-hema-hemostasia.json",
  "Hemostasia · primária · secundária · provas",
  "hema-hemostasia",
  bankSet(
    ["hema-hemostasia"],
    "Adesão · agregação · vias · provas",
    "GP Ib/FvW, GP IIb/IIIa, TAP/TPTa e interpretação inicial."
  ),
  {
    checklistItems,
    oneLiners: ["Primária = plaqueta/vaso", "Secundária = fatores", "TAP×TPTa localizam a via"]
  }
);

write(
  "revisao-hema-plaquetas.json",
  "Plaquetas · PTI · PTT · SHU",
  "hema-plaquetas",
  bankSet(
    ["hema-pti", "hema-ptt-shuh"],
    "PTI · PTT · SHU",
    "PTI isolada × PTT com ADAMTS13 e esquizócitos · SHU pós-diarréia."
  ),
  {
    checklistItems,
    oneLiners: ["PTI = plaquetopenia isolada", "PTT = plasmaferese", "Esquizócitos na MAT"]
  }
);

write(
  "revisao-hema-coagulacao.json",
  "Coagulação · hemofilia · vW · CIVD · anticoagulação",
  "hema-coagulacao",
  bankSet(
    ["hema-hemofilia", "hema-von-willebrand", "hema-cid", "hema-anticoagulacao"],
    "Hemofilias · vW · CIVD · anticoagulantes",
    "Hemofilia A/B, DvW, CIVD e reversão de heparina, varfarina e DOAC."
  ),
  {
    checklistItems,
    oneLiners: ["Hemofilia A = VIII", "vW = mais comum", "CID = consumo", "Varfarina = INR"]
  }
);

const stats = {
  title: "Hematologia · o que mais cai (R1) — Hem1–3 completa",
  unitLabel: "% relativo no bloco",
  note: "Síntese R1 + apostilas Hem1–3 (série completa MedHub).",
  gaps: {
    summary: "Hematologia coberta em 11 grupos (Hem1–3 completa).",
    missingHighYield: [],
    covered: [
      { tema: "Anemias / ferropriva / ADC", grupo: "hema-anemias" },
      { tema: "Megaloblástica", grupo: "hema-megaloblastica" },
      { tema: "Hemolíticas / hemoglobinopatias", grupo: "hema-hemoliticas" },
      { tema: "SMD / sideroblástica", grupo: "hema-smd" },
      { tema: "Leucemias", grupo: "hema-leucemias" },
      { tema: "NMP", grupo: "hema-nmp" },
      { tema: "Linfomas", grupo: "hema-linfomas" },
      { tema: "Mieloma", grupo: "hema-mieloma" },
      { tema: "Hemostasia", grupo: "hema-hemostasia" },
      { tema: "PTI / PTT", grupo: "hema-plaquetas" },
      { tema: "Coagulação / anticoagulação", grupo: "hema-coagulacao" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Síntese R1 + apostilas Hem1–3 MedHub.",
      verdict: "Série completa: anemias, onco-hemato e hemostasia.",
      foco: "Ferropriva · leucemias · PTI/PTT · coagulação",
      estilo: "Síntese R1",
      priorities: [
        { tema: "Anemias", pct: 28, n: 28 },
        { tema: "Onco-hemato", pct: 30, n: 30 },
        { tema: "Hemostasia", pct: 26, n: 26 },
        { tema: "Outros", pct: 16, n: 16 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Hematologia (síntese Hem1–3).",
      verdict: "Anemias + PTI dominam provas gerais; leucemias nas urgências.",
      foco: "Ferropriva · PTI · LMA/LLA",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Anemias / PTI", pct: 40 },
        { tema: "Leucemias", pct: 24 },
        { tema: "Coagulação", pct: 20 },
        { tema: "Outros", pct: 16 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Hematologia (síntese Hem1–3).",
      verdict: "Morfologia, citogenética e microangiopatias.",
      foco: "Esfregaço · BCR-ABL · PTT",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Lab / fisiopat", pct: 34 },
        { tema: "Onco-hemato", pct: 28 },
        { tema: "Hemostasia", pct: 22 },
        { tema: "Outros", pct: 16 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Hematologia (síntese Hem1–3).",
      verdict: "Onco-hemato e anticoagulação.",
      foco: "LMA · mieloma · DOAC/varfarina",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Onco-hemato", pct: 34 },
        { tema: "Anticoagulação", pct: 26 },
        { tema: "Anemias", pct: 22 },
        { tema: "Outros", pct: 18 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Hematologia Hem1–3.",
      verdict: "Urgências: PTT, LMA/CIVD e sangramento em hemofilia.",
      foco: "PTT · LMA · hemofilia",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Urgências", pct: 38 },
        { tema: "Anemias / PTI", pct: 28 },
        { tema: "Coagulação", pct: 20 },
        { tema: "Outros", pct: 14 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-hematologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-hematologia-geral.json");
require("./expand-hemato-bancas.js");
