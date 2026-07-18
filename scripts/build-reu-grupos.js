/**
 * Módulos de revisão · Reumatologia REU1 + overview stats
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostila REU1 · MedHub R1 · Reumatologia.",
    ...o
  };
}

function write(file, title, module, profiles, extra = {}) {
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify({ title, module, profiles, ...extra }, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}

const arDecks = ["reu1-ar-basico", "reu1-ar-clinica", "reu1-ar-diagnostico", "reu1-ar-tratamento"];
const aijDecks = ["reu1-aij-still"];
const spaDecks = [
  "reu1-spa-geral",
  "reu1-ea",
  "reu1-artrite-reativa",
  "reu1-psoriasica",
  "reu1-enteropatica",
  "reu1-aines"
];

function bankSet(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese REU1",
      blurb: temaFoco,
      verdict: "Priorize critérios, sorologia e conduta treat-to-target / AINE→biológico conforme o grupo.",
      foco: temaFoco,
      estilo: "Síntese nacional · Reumatologia",
      priorities: [
        { tema: "Critérios / classificação", pct: 28 },
        { tema: "Clínica e DD", pct: 26 },
        { tema: "Tratamento", pct: 28 },
        { tema: "Complicações / extras", pct: 18 }
      ],
      deckOrder,
      checklist: ["criterios", "sorologia", "conduta", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Diagnóstico", texto: "Critérios e sorologia." },
        { titulo: "Sessão 2 · Clínica", texto: "Padrões e diferenciais." },
        { titulo: "Sessão 3 · Conduta", texto: "Escada terapêutica." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Conduta objetiva.",
      verdict: "Foque jeitão clínico, critérios e 1ª linha terapêutica.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare/Enamed · Reumatologia REU1.",
      priorities: [
        { tema: "Conduta", pct: 34 },
        { tema: "Critérios", pct: 28 },
        { tema: "Clínica", pct: 24 },
        { tema: "Extras", pct: 14 }
      ],
      deckOrder,
      checklist: ["criterios", "conduta", "sorologia", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Detalhe de critérios e DD.",
      verdict: "ACR/EULAR, HLA-B27 e diferenciais AR × SpA caem bem.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP · Reumatologia.",
      priorities: [
        { tema: "Critérios / sorologia", pct: 32 },
        { tema: "DD", pct: 28 },
        { tema: "Tratamento", pct: 24 },
        { tema: "Clínica", pct: 16 }
      ],
      deckOrder,
      checklist: ["criterios", "sorologia", "dd", "conduta"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Fisiopatologia + conduta.",
      verdict: "Patogênese (sinovite, êntese, HLA) e escada terapêutica.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP · Reumatologia.",
      priorities: [
        { tema: "Fisiopatologia", pct: 28 },
        { tema: "Tratamento", pct: 28 },
        { tema: "Critérios", pct: 24 },
        { tema: "Clínica", pct: 20 }
      ],
      deckOrder,
      checklist: ["sorologia", "conduta", "criterios", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "Respostas curtas de conduta e critérios.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Reumatologia.",
      priorities: [
        { tema: "Conduta", pct: 36 },
        { tema: "Critérios", pct: 30 },
        { tema: "Clínica", pct: 34 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "sorologia", "dd"]
    })
  ];
}

const checklistItems = {
  criterios: {
    tema: "Critérios de classificação",
    yield: "Alto",
    pegar: "ACR/EULAR na AR (≥6); jeitão clínico SpA/AIJ quando não houver escore decorado."
  },
  sorologia: {
    tema: "FR / ACPA / HLA-B27",
    yield: "Alto",
    pegar: "Anti-CCP mais específico; HLA-B27 associa SpA mas não diagnostica sozinho."
  },
  conduta: {
    tema: "Escada terapêutica",
    yield: "Máximo",
    pegar: "AR: MTX precoce ± ponte GC; SpA axial: AINE → anti-TNF; Still: AINE/GC/anti-IL-1/6."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "AR × SpA × psoriásica × séptica × OA — padrão articular e sorologia decidem."
  }
};

write(
  "revisao-reu-ar.json",
  "Artrite reumatoide · REU1",
  "reu-ar",
  bankSet(arDecks, "AR · critérios · sorologia · treat-to-target"),
  { checklistItems, oneLiners: ["ACR/EULAR ≥6", "Anti-CCP > FR em especificidade", "MTX âncora"] }
);

write(
  "revisao-reu-aij.json",
  "AIJ · Still · REU1",
  "reu-aij",
  bankSet(aijDecks, "AIJ oligo · uveíte · Still sistêmico"),
  { checklistItems, oneLiners: ["Oligo → rastrear uveíte", "Still: febre + rash + artrite", "Ferritina alta"] }
);

write(
  "revisao-reu-spa.json",
  "Espondiloartrites · REU1",
  "reu-spa",
  bankSet(spaDecks, "EA · reativa · psoriásica · enteropática · AINE"),
  {
    checklistItems,
    oneLiners: ["Entesite + HLA-B27", "AINE 1ª linha axial", "Reiter: artrite+uretrite+conjuntivite"]
  }
);

/* Overview Clínica / Reumatologia (REU1 por enquanto) */
const stats = {
  title: "Reumatologia · o que mais cai (REU1)",
  unitLabel: "% relativo neste bloco (REU1)",
  note: "Primeiro grupo de Clínica médica no app. Base: apostila REU1 (AR, AIJ/Still, espondiloartrites, AINEs). REU2/REU3 entram em seguida.",
  gaps: {
    summary: "REU1 coberto em 3 grupos: AR, AIJ/Still, Espondiloartrites (+AINEs). REU2 (OA, gota, FR, infecciosas) e REU3 (LES, vasculites) ainda não no app.",
    missingHighYield: [
      { tema: "Gota / osteoartrite / febre reumática", status: "pendente", detalhe: "REU2" },
      { tema: "LES / SAF / vasculites", status: "pendente", detalhe: "REU3" }
    ],
    covered: [
      { tema: "Artrite reumatoide", grupo: "reu-ar" },
      { tema: "AIJ / Still", grupo: "reu-aij" },
      { tema: "Espondiloartrites + AINEs", grupo: "reu-spa" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese REU1",
      featured: false,
      sourceType: "sintese",
      source: "Estrutura da apostila REU1 + padrão de cobrança R1 em Reumatologia.",
      verdict: "No REU1, AR e espondiloartrites concentram o ROI. Critérios ACR/EULAR, anti-CCP, HLA-B27 e escada AINE→biológico são o núcleo.",
      foco: "AR · SpA · AIJ/Still · AINE",
      estilo: "Síntese REU1",
      priorities: [
        { tema: "Artrite reumatoide", pct: 42, n: 42 },
        { tema: "Espondiloartrites", pct: 36, n: 36 },
        { tema: "AIJ / Still", pct: 12, n: 12 },
        { tema: "AINEs (farmacologia)", pct: 10, n: 10 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "estimativa",
      source: "Estimativa por padrão Enare/Enamed em Reumatologia (REU1).",
      verdict: "Conduta e critérios: MTX na AR, AINE na EA, tríade de Reiter, Still febril.",
      foco: "AR · EA · Reiter · Still",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Artrite reumatoide", pct: 40 },
        { tema: "Espondiloartrites", pct: 38 },
        { tema: "AIJ / Still", pct: 14 },
        { tema: "AINEs", pct: 8 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "estimativa",
      source: "Estimativa padrão USP · REU1.",
      verdict: "ACR/EULAR detalhado, ACPA e DD AR×SpA×psoriásica.",
      foco: "Critérios · Sorologia · DD",
      estilo: "Padrão USP",
      priorities: [
        { tema: "AR (critérios/sorologia)", pct: 44 },
        { tema: "SpA / HLA-B27", pct: 34 },
        { tema: "AIJ", pct: 12 },
        { tema: "AINE", pct: 10 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "estimativa",
      source: "Estimativa padrão UNIFESP · REU1.",
      verdict: "Patogênese (sinovite, epítopo, êntese) + biológicos.",
      foco: "Fisiopatologia · Biológicos",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "AR", pct: 40 },
        { tema: "SpA", pct: 35 },
        { tema: "AIJ/Still", pct: 15 },
        { tema: "AINE", pct: 10 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "2021–2024",
      sourceType: "estimativa",
      source: "Estimativa padrão Enare · REU1.",
      verdict: "Mesmo eixo Enamed: conduta clara.",
      foco: "Conduta · Critérios",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "AR", pct: 42 },
        { tema: "SpA", pct: 36 },
        { tema: "AIJ/Still", pct: 14 },
        { tema: "AINE", pct: 8 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-reumatologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-reumatologia-geral.json");

require("./expand-reu-bancas.js");
