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

/* REU2 */
const oaDecks = ["reu2-oa-basico", "reu2-oa-tratamento"];
const cristaisDecks = ["reu2-gota-basico", "reu2-gota-clinica-tx", "reu2-pseudogota"];
const frDecks = ["reu2-fr-clinica", "reu2-fr-tratamento"];
const infecDecks = ["reu2-septica", "reu2-tb-misc"];
const extras2Decks = ["reu2-policondrite", "reu2-ffm", "reu2-fibromialgia"];

const checklistReu2 = {
  criterios: {
    tema: "Critérios / diagnóstico",
    yield: "Alto",
    pegar: "Jones na FR; cristal no líquido na gota/CPPD; OA = clínica + Rx."
  },
  sorologia: {
    tema: "Exames-chave",
    yield: "Alto",
    pegar: "Uricemia ≠ diagnóstico isolado; ASLO/evidência estreptocócica na FR; líquido + Gram na séptica."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "OA: não farmacológico 1º; crise gotosa: AINE/colchicina/GC; FR: penicilina + profilaxia; séptica: drenar+ATB."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Gota × pseudogota × séptica × OA × FR migratória."
  }
};

write(
  "revisao-reu-oa.json",
  "Osteoartrose · REU2",
  "reu-oa",
  bankSet(oaDecks, "OA · Rx · não farmacológico · artroplastia"),
  { checklistItems: checklistReu2, oneLiners: ["Não farmacológico 1º", "Heberden/Bouchard", "AINE só sintoma"] }
);

write(
  "revisao-reu-cristais.json",
  "Gota e cristais · REU2",
  "reu-cristais",
  bankSet(cristaisDecks, "Gota · pseudogota · hipouricemiantes"),
  {
    checklistItems: checklistReu2,
    oneLiners: ["Podagra", "Não iniciar alopurinol na crise sem cobertura", "CPPD = joelho + condrocalcinose"]
  }
);

write(
  "revisao-reu-fr.json",
  "Febre reumática · REU2",
  "reu-fr",
  bankSet(frDecks, "Jones · cardite · profilaxia secundária"),
  {
    checklistItems: checklistReu2,
    oneLiners: ["Só após faringite (não pele)", "Profilaxia secundária salva valva", "Artrite migratória"]
  }
);

write(
  "revisao-reu-infecciosa.json",
  "Artrites infecciosas · REU2",
  "reu-infecciosa",
  bankSet(infecDecks, "Séptica · gonocócica · TB · viral"),
  {
    checklistItems: checklistReu2,
    oneLiners: ["Artrocentese antes do ATB", "Séptica = emergência", "Anti-TNF ↑ TB osteoarticular"]
  }
);

write(
  "revisao-reu-extras2.json",
  "Extras REU2 · FFM · fibromialgia · policondrite",
  "reu-extras2",
  bankSet(extras2Decks, "FFM · fibromialgia · policondrite"),
  {
    checklistItems: checklistReu2,
    oneLiners: ["FFM: colchicina + MEFV", "Fibro: exames normais", "Policondrite: orelha sem lóbulo"]
  }
);

/* REU3 */
const lesDecks = [
  "reu3-les-basico",
  "reu3-les-clinica",
  "reu3-les-lab-crit",
  "reu3-les-tratamento",
  "reu3-les-gravidez-dil"
];
const safDecks = ["reu3-saf"];
const esDecks = ["reu3-es-basico", "reu3-es-clinica-tx"];
const outrasColagDecks = ["reu3-miopatias", "reu3-sjogren", "reu3-dmtc"];
const vascDecks = [
  "reu3-vasc-acg-pmr",
  "reu3-vasc-takayasu",
  "reu3-vasc-anca",
  "reu3-vasc-pan-behcet"
];
const amilDecks = ["reu3-amiloidose"];

const checklistReu3 = {
  criterios: {
    tema: "Critérios / classificação",
    yield: "Alto",
    pegar: "EULAR/ACR 2019 no LES (FAN + ≥10); calibre/ANCA nas vasculites; anti-RNP na DMTC."
  },
  sorologia: {
    tema: "Autoanticorpos",
    yield: "Máximo",
    pegar: "Anti-dsDNA/Sm (LES); aFL (SAF); Scl-70/centrômero (ES); Jo-1 (antissintetase); Ro/La (Sjögren); ANCA."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "HCQ base no LES; anticoagular SAF; IECA na crise renal da ES; GC imediato na ACG com ameaça visual."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Flare × infecção no LES; PAN × PAM no rim; ACG × Takayasu por idade/vaso; DM × LES cutâneo."
  }
};

write(
  "revisao-reu-les.json",
  "LES · REU3",
  "reu-les",
  bankSet(lesDecks, "LES · EULAR/ACR · Ac · HCQ · nefrite"),
  {
    checklistItems: checklistReu3,
    oneLiners: ["FAN ≥1:80 + ≥10 pontos", "HCQ quase sempre", "Strongyloides antes do pulso"]
  }
);

write(
  "revisao-reu-saf.json",
  "SAF · REU3",
  "reu-saf",
  bankSet(safDecks, "SAF · trombose · obstétrico · aFL"),
  {
    checklistItems: checklistReu3,
    oneLiners: ["TVP mais comum", "aFL persistente ×2", "Morte fetal >10 sem = específico"]
  }
);

write(
  "revisao-reu-es.json",
  "Esclerose sistêmica · REU3",
  "reu-es",
  bankSet(esDecks, "ES · Raynaud · CREST · DIP/HAP · crise renal"),
  {
    checklistItems: checklistReu3,
    oneLiners: ["Limitada ≠ só pele", "IECA na crise renal", "Scl-70 ↔ DIP"]
  }
);

write(
  "revisao-reu-outras-colag.json",
  "Miopatias · Sjögren · DMTC · REU3",
  "reu-outras-colag",
  bankSet(outrasColagDecks, "PM/DM · Sjögren · DMTC"),
  {
    checklistItems: checklistReu3,
    oneLiners: ["Gottron + heliótropo", "Anti-Ro/La + Schirmer", "Anti-RNP = DMTC"]
  }
);

write(
  "revisao-reu-vasculites.json",
  "Vasculites · REU3",
  "reu-vasculites",
  bankSet(vascDecks, "ACG/PMR · Takayasu · ANCA · PAN · Behçet"),
  {
    checklistItems: checklistReu3,
    oneLiners: ["ACG: GC antes da biópsia se ameaça visual", "GPA = ORL+pulmão+rim", "Behçet: afta oral obrigatória"]
  }
);

write(
  "revisao-reu-amiloidose.json",
  "Amiloidoses · REU3",
  "reu-amiloidose",
  bankSet(amilDecks, "AA · AL · Congo-red"),
  {
    checklistItems: checklistReu3,
    oneLiners: ["AA = inflamação crônica", "AL = cadeia leve", "Congo-red + verde"]
  }
);

/* Overview Clínica / Reumatologia (REU1–REU3) */
const stats = {
  title: "Reumatologia · o que mais cai (REU1–REU3)",
  unitLabel: "% relativo no bloco atual",
  note: "Clínica médica · Reumatologia completa (REU1–REU3): artropatias, cristais, colagenoses e vasculites.",
  gaps: {
    summary: "Cobertura REU1–REU3 no app (14 grupos). Bloco de Reumatologia da apostila MedHub R1 fechado.",
    missingHighYield: [],
    covered: [
      { tema: "Artrite reumatoide", grupo: "reu-ar" },
      { tema: "AIJ / Still", grupo: "reu-aij" },
      { tema: "Espondiloartrites + AINEs", grupo: "reu-spa" },
      { tema: "Osteoartrose", grupo: "reu-oa" },
      { tema: "Gota e cristais", grupo: "reu-cristais" },
      { tema: "Febre reumática", grupo: "reu-fr" },
      { tema: "Artrites infecciosas", grupo: "reu-infecciosa" },
      { tema: "Extras REU2", grupo: "reu-extras2" },
      { tema: "LES", grupo: "reu-les" },
      { tema: "SAF", grupo: "reu-saf" },
      { tema: "Esclerose sistêmica", grupo: "reu-es" },
      { tema: "Miopatias / Sjögren / DMTC", grupo: "reu-outras-colag" },
      { tema: "Vasculites", grupo: "reu-vasculites" },
      { tema: "Amiloidoses", grupo: "reu-amiloidose" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese REU1–3",
      featured: false,
      sourceType: "sintese",
      source: "Apostilas REU1–REU3 + padrão de cobrança R1 em Reumatologia.",
      verdict: "AR, LES, SpA, gota, FR, séptica e ACG/ANCA concentram ROI. Colagenoses e vasculites fecham o bloco.",
      foco: "AR · LES · SpA · Gota · Vasculites · FR",
      estilo: "Síntese REU1–3",
      priorities: [
        { tema: "Artrite reumatoide", pct: 16, n: 16 },
        { tema: "LES / SAF", pct: 18, n: 18 },
        { tema: "Espondiloartrites", pct: 12, n: 12 },
        { tema: "Gota / cristais", pct: 12, n: 12 },
        { tema: "Vasculites", pct: 14, n: 14 },
        { tema: "Febre reumática / séptica", pct: 12, n: 12 },
        { tema: "ES / miopatias / OA / extras", pct: 16, n: 16 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "estimativa",
      source: "Estimativa Enare/Enamed · REU1–3.",
      verdict: "Conduta: MTX, HCQ, crise gotosa, Jones, drenar séptica, GC na ACG, anticoagular SAF.",
      foco: "AR · LES · Gota · Vasculites · FR",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "AR / LES", pct: 28 },
        { tema: "Gota / FR / séptica", pct: 24 },
        { tema: "Vasculites", pct: 20 },
        { tema: "SpA / ES", pct: 16 },
        { tema: "OA / extras", pct: 12 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "estimativa",
      source: "Estimativa USP · REU1–3.",
      verdict: "Critérios EULAR/ACR, Ac específicos, ANCA e DD fino de colagenoses.",
      foco: "Critérios · Ac · Vasculites · DD",
      estilo: "Padrão USP",
      priorities: [
        { tema: "LES / colagenoses", pct: 30 },
        { tema: "AR / SpA", pct: 22 },
        { tema: "Vasculites", pct: 20 },
        { tema: "Cristais / FR", pct: 16 },
        { tema: "OA / extras", pct: 12 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "estimativa",
      source: "Estimativa UNIFESP · REU1–3.",
      verdict: "Fisiopatologia (imunocomplexos, fibrose, ANCA) + conduta por órgão.",
      foco: "Fisiopatologia · Conduta",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "LES / ES / miopatias", pct: 30 },
        { tema: "AR / SpA", pct: 22 },
        { tema: "Vasculites", pct: 20 },
        { tema: "Gota / FR", pct: 16 },
        { tema: "Infecciosas / extras", pct: 12 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "estimativa",
      source: "Estimativa Enare · REU1–3.",
      verdict: "Mesmo eixo Enamed: respostas curtas de conduta e critérios.",
      foco: "Conduta · Critérios",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "AR / LES", pct: 28 },
        { tema: "Gota / FR / séptica", pct: 24 },
        { tema: "Vasculites / SAF", pct: 22 },
        { tema: "SpA / ES / extras", pct: 26 }
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
