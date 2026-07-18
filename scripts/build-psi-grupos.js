/**
 * Módulos de revisão · Psiquiatria + overview stats
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostila Psi · MedHub R1 · Psiquiatria.",
    ...o
  };
}

function write(file, title, module, profiles, extra = {}) {
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify({ title, module, profiles, ...extra }, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}

function bankSet(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese Psi",
      blurb: temaFoco,
      verdict: "Priorize clínica clássica, critérios e conduta de urgência (abstinência, suicídio, SNM).",
      foco: temaFoco,
      estilo: "Síntese nacional · Psiquiatria",
      priorities: [
        { tema: "Clínica / critérios", pct: 30 },
        { tema: "Conduta", pct: 30 },
        { tema: "Farmacologia", pct: 22 },
        { tema: "DD / extras", pct: 18 }
      ],
      deckOrder,
      checklist: ["criterios", "conduta", "farmaco", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Diagnóstico", texto: "Critérios e jeitão clínico." },
        { titulo: "Sessão 2 · Urgências", texto: "Abstinência, suicídio, SNM, agitação." },
        { titulo: "Sessão 3 · Manutenção", texto: "Fármacos e seguimento." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Conduta objetiva — substâncias e toxíndromes.",
      verdict: "Enare/Enamed cobram forte dependência (álcool, Prochaska) e intoxicações.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Psiquiatria.",
      priorities: [
        { tema: "Conduta", pct: 36 },
        { tema: "Substâncias / intox", pct: 28 },
        { tema: "Critérios", pct: 20 },
        { tema: "Farmaco", pct: 16 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "farmaco", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Dependência + humor + farmaco.",
      verdict: "Prochaska, CAGE/álcool, depressão/bipolar e lítio caem bem.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Psiquiatria.",
      priorities: [
        { tema: "Substâncias", pct: 32 },
        { tema: "Humor / farmaco", pct: 28 },
        { tema: "Critérios", pct: 22 },
        { tema: "Ansiedade / extras", pct: 18 }
      ],
      deckOrder,
      checklist: ["criterios", "farmaco", "conduta", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Humor e psicose em casos clínicos.",
      verdict: "Depressão, bipolar, esquizofrenia e abstinência alcoólica.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Psiquiatria.",
      priorities: [
        { tema: "Humor", pct: 28 },
        { tema: "Psicose", pct: 24 },
        { tema: "Substâncias", pct: 22 },
        { tema: "Farmaco / ansiedade", pct: 26 }
      ],
      deckOrder,
      checklist: ["criterios", "conduta", "farmaco", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "Álcool, DT, Prochaska e efeitos do lítio.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Psiquiatria.",
      priorities: [
        { tema: "Substâncias", pct: 40 },
        { tema: "Intox / conduta", pct: 30 },
        { tema: "Farmaco", pct: 30 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "farmaco", "dd"]
    })
  ];
}

const checklistItems = {
  criterios: {
    tema: "Critérios / jeitão clínico",
    yield: "Alto",
    pegar: "Duração (depressão ≥2 sem; esquizofrenia ≥6 meses); mania vs hipomania; CAGE/AUDIT."
  },
  conduta: {
    tema: "Conduta e urgências",
    yield: "Máximo",
    pegar: "DT: BDZ+tiamina; suicídio: perguntar/plano; SNM: suspender neuroléptico; Wernicke: tiamina antes da glicose."
  },
  farmaco: {
    tema: "Psicofarmacologia",
    yield: "Alto",
    pegar: "ISRS 1ª linha; lítio (tireoide/rim/DI); EPS vs SNM; naltrexona/dissulfiram no álcool."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Delirium × demência × psicose; alucinose × DT; bipolar × depressão unipolar; TOC × TP obsessiva."
  }
};

const substDecks = ["psi-alcool-clinica", "psi-alcool-abst-tx", "psi-outras-drogas"];
const humorDecks = ["psi-depressao", "psi-bipolar-litio"];
const psicoseDecks = ["psi-esquizo-clinica", "psi-esquizo-tx"];
const ansDecks = ["psi-ansiedade-toc"];
const orgDecks = ["psi-delirium", "psi-demencia"];
const alimDecks = ["psi-alimentares"];
const basicoDecks = ["psi-psico-basico", "psi-personalidade"];

write(
  "revisao-psi-substancias.json",
  "Substâncias · álcool · drogas · Psi",
  "psi-substancias",
  bankSet(substDecks, "Álcool · abstinência/DT · Prochaska · cocaína/nicotina"),
  {
    checklistItems,
    oneLiners: ["CAGE ≥2", "DT ≠ alucinose", "Prochaska: 5 estágios", "Tiamina antes da glicose"]
  }
);

write(
  "revisao-psi-humor.json",
  "Humor · depressão · bipolar · Psi",
  "psi-humor",
  bankSet(humorDecks, "Depressão · mania · lítio · suicídio"),
  {
    checklistItems,
    oneLiners: ["Depressão ≥2 semanas", "Bipolar I = mania", "Lítio: rim + tireoide", "Perguntar suicídio"]
  }
);

write(
  "revisao-psi-psicose.json",
  "Esquizofrenia · antipsicóticos · Psi",
  "psi-psicose",
  bankSet(psicoseDecks, "Esquizofrenia · EPS · SNM"),
  {
    checklistItems,
    oneLiners: ["≥6 meses", "SNM: rigidez + febre + CK↑", "Discinesia tardia", "Clozapina: agranulocitose"]
  }
);

write(
  "revisao-psi-ansiedade.json",
  "Ansiedade · TOC · trauma · Psi",
  "psi-ansiedade",
  bankSet(ansDecks, "Pânico · TAG · TOC · TEPT"),
  {
    checklistItems,
    oneLiners: ["Pânico: ataques inesperados", "TOC: ISRS + EPR", "TEPT >1 mês", "TAG ≥6 meses"]
  }
);

write(
  "revisao-psi-organicos.json",
  "Delirium · demência · Psi",
  "psi-organicos",
  bankSet(orgDecks, "Delirium × demência · causas reversíveis"),
  {
    checklistItems,
    oneLiners: ["Delirium = agudo flutuante", "Tratar a causa", "15% demências reversíveis", "NPH: marcha + incontinência + cognição"]
  }
);

write(
  "revisao-psi-alimentares.json",
  "Transtornos alimentares · Psi",
  "psi-alimentares",
  bankSet(alimDecks, "Anorexia · bulimia"),
  {
    checklistItems,
    oneLiners: ["Anorexia = baixo peso", "Bulimia: peso ~normal + purga", "Russell / parótida", "Evitar bupropiona"]
  }
);

write(
  "revisao-psi-basico.json",
  "Psicopatologia · personalidade · Psi",
  "psi-basico",
  bankSet(basicoDecks, "Delírio · alucinação · clusters de personalidade"),
  {
    checklistItems,
    oneLiners: ["Ilusão ≠ alucinação", "Borderline = cluster B", "TP obsessiva ≠ TOC"]
  }
);

const stats = {
  title: "Psiquiatria · o que mais cai (R1)",
  unitLabel: "% relativo no bloco",
  note: "Síntese Enare/USP/UNIFESP + apostila Psi (MedHub R1). Substâncias dominam Enare/USP; humor e psicose pesam na UNIFESP.",
  gaps: {
    summary: "Psiquiatria da apostila coberta em 7 grupos. Intoxicações gerais de toxicologia (fora do Psi.pdf) ficam em Clínica/Toxicologia se houver material futuro.",
    missingHighYield: [],
    covered: [
      { tema: "Substâncias / álcool", grupo: "psi-substancias" },
      { tema: "Humor / bipolar / lítio", grupo: "psi-humor" },
      { tema: "Esquizofrenia / antipsicóticos", grupo: "psi-psicose" },
      { tema: "Ansiedade / TOC / TEPT", grupo: "psi-ansiedade" },
      { tema: "Delirium / demência", grupo: "psi-organicos" },
      { tema: "Alimentares", grupo: "psi-alimentares" },
      { tema: "Psicopatologia / personalidade", grupo: "psi-basico" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Levantamentos Enare + USP-SP + UNIFESP + apostila Psi.",
      verdict: "Priorize álcool/abstinência/Prochaska, depressão/bipolar/lítio e esquizofrenia/SNM. Ansiedade e alimentares em segundo.",
      foco: "Substâncias · Humor · Psicose · Farmaco",
      estilo: "Síntese R1",
      priorities: [
        { tema: "Substâncias / álcool", pct: 28, n: 28 },
        { tema: "Humor / bipolar", pct: 22, n: 22 },
        { tema: "Psicose / antipsicóticos", pct: 16, n: 16 },
        { tema: "Psicofarmacologia transversal", pct: 12, n: 12 },
        { tema: "Ansiedade / TOC", pct: 10, n: 10 },
        { tema: "Orgânicos / alimentares / extras", pct: 12, n: 12 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare 2021–2024 · Psiquiatria (Estratégia).",
      verdict: "Dependência ~40% + intoxicações ~30%. Prochaska, DT e lítio.",
      foco: "Álcool · Intox · Farmaco",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Dependência química", pct: 40 },
        { tema: "Intoxicações", pct: 30 },
        { tema: "Infantil / alimentares / farmaco", pct: 30 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP-SP · Psiquiatria (Estratégia).",
      verdict: "Dependência ~35%; humor, farmaco e intox ~12% cada.",
      foco: "Substâncias · Humor · Lítio",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Dependência química", pct: 35 },
        { tema: "Humor", pct: 12 },
        { tema: "Psicofarmacologia", pct: 12 },
        { tema: "Intoxicações", pct: 12 },
        { tema: "Ansiedade / personalidade / reforma", pct: 29 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP 2017–2023 · Psiquiatria (Estratégia).",
      verdict: "Humor ~24%, psicóticos ~19%, substâncias ~14%.",
      foco: "Humor · Psicose · Álcool",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Transtornos de humor", pct: 24 },
        { tema: "Transtornos psicóticos", pct: 19 },
        { tema: "Dependência química", pct: 14 },
        { tema: "Intox / farmaco / ansiedade", pct: 43 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Psiquiatria.",
      verdict: "Mesmo eixo Enamed: substâncias e intoxicações primeiro.",
      foco: "Substâncias · Conduta",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Dependência química", pct: 40 },
        { tema: "Intoxicações", pct: 30 },
        { tema: "Outros", pct: 30 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-psiquiatria-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-psiquiatria-geral.json");

require("./expand-psi-bancas.js");
