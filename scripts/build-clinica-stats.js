/**
 * Overview da Clínica médica (raiz) + expansão de bancas R1.
 */
const fs = require("fs");
const path = require("path");

const stats = {
  title: "Clínica médica · o que mais cai (R1)",
  unitLabel: "% relativo no bloco de Clínica",
  note: "Síntese das áreas da Clínica (Cardio → Endo). Ao abrir uma área, as estatísticas mudam para o recorte daquela especialidade.",
  gaps: {
    summary: "Clínica médica com 10 áreas (Car1–3, Reu, Psi, Pneumo, Neuro, Nefro, Infecto, Hepato, Hemato, Endo).",
    missingHighYield: [],
    covered: [
      { tema: "Cardiologia", grupo: "cardiologia" },
      { tema: "Infectologia", grupo: "infectologia" },
      { tema: "Endocrinologia", grupo: "endocrinologia" },
      { tema: "Nefrologia", grupo: "nefrologia" },
      { tema: "Neurologia", grupo: "neurologia" },
      { tema: "Pneumologia", grupo: "pneumologia" },
      { tema: "Hematologia", grupo: "hematologia" },
      { tema: "Hepatologia", grupo: "hepatologia" },
      { tema: "Reumatologia", grupo: "reumatologia" },
      { tema: "Psiquiatria", grupo: "psiquiatria" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese Clínica",
      featured: false,
      sourceType: "sintese",
      source: "Síntese ponderada das áreas da Clínica médica nas bancas R1 (Enare/Enamed/USP e correlatas).",
      verdict: "Cardio, infecto e endócrino concentram boa parte do bloco; complete com nefro, neuro e pneumo.",
      foco: "Cardio · Infecto · Endo · Nefro",
      estilo: "Síntese R1 · Clínica",
      priorities: [
        { tema: "Cardiologia", pct: 18, n: 18 },
        { tema: "Infectologia", pct: 14, n: 14 },
        { tema: "Endocrinologia", pct: 12, n: 12 },
        { tema: "Nefrologia", pct: 10, n: 10 },
        { tema: "Neurologia", pct: 10, n: 10 },
        { tema: "Pneumologia", pct: 10, n: 10 },
        { tema: "Hematologia", pct: 8, n: 8 },
        { tema: "Hepatologia", pct: 6, n: 6 },
        { tema: "Reumatologia", pct: 6, n: 6 },
        { tema: "Psiquiatria", pct: 6, n: 6 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Clínica médica (síntese por áreas).",
      verdict: "Perfil generalista: SCA/ICC, infecções comuns, DM/tireoide e IRA/IRC.",
      foco: "Cardio · Infecto · Endo",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Cardiologia", pct: 20 },
        { tema: "Infectologia", pct: 16 },
        { tema: "Endocrinologia", pct: 14 },
        { tema: "Nefrologia", pct: 12 },
        { tema: "Pneumologia", pct: 12 },
        { tema: "Demais áreas", pct: 26 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Clínica médica (síntese por áreas).",
      verdict: "Mais fisiopatologia e critérios diagnósticos; cardio e neuro pesam.",
      foco: "Cardio · Neuro · Nefro",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Cardiologia", pct: 18 },
        { tema: "Neurologia", pct: 14 },
        { tema: "Nefrologia", pct: 14 },
        { tema: "Infectologia", pct: 12 },
        { tema: "Endocrinologia", pct: 12 },
        { tema: "Demais áreas", pct: 30 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Clínica médica (síntese por áreas).",
      verdict: "Conduta e guidelines: SCA, antibioticoterapia e DM.",
      foco: "Cardio · Infecto · Endo",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Cardiologia", pct: 18 },
        { tema: "Infectologia", pct: 16 },
        { tema: "Endocrinologia", pct: 14 },
        { tema: "Hematologia", pct: 12 },
        { tema: "Pneumologia", pct: 12 },
        { tema: "Demais áreas", pct: 28 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Clínica médica (síntese por áreas).",
      verdict: "Urgências clínicas: SCA, sepse, CAD e IRA.",
      foco: "Urgências · Cardio · Infecto",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Cardiologia", pct: 22 },
        { tema: "Infectologia", pct: 18 },
        { tema: "Endocrinologia", pct: 12 },
        { tema: "Nefrologia", pct: 12 },
        { tema: "Pneumologia", pct: 12 },
        { tema: "Demais áreas", pct: 24 }
      ]
    }
  ]
};

const out = path.join(__dirname, "..", "data", "stats-clinica-geral.json");
fs.writeFileSync(out, JSON.stringify(stats, null, 2) + "\n", "utf8");
console.log("wrote stats-clinica-geral.json");

const BANK_META = [
  { id: "geral", label: "Brasil", kicker: "Síntese nacional", featured: false, sourceType: "sintese", estilo: "Síntese das principais bancas" },
  { id: "enamed", label: "Enamed", kicker: "Nacional · acesso Enare", featured: true, sourceType: "levantamento", estilo: "Levantamento Enare/Enamed" },
  { id: "enare", label: "Enare", kicker: "2021–2024", featured: false, sourceType: "levantamento", estilo: "Levantamento Enare" },
  { id: "revalida", label: "Revalida", kicker: "INEP", featured: false, sourceType: "estimativa", estilo: "Estimativa INEP/Revalida" },
  { id: "usp", label: "USP", kicker: "Prova USP", featured: false, sourceType: "levantamento", estilo: "Levantamento USP-SP" },
  { id: "unifesp", label: "UNIFESP", kicker: "Série recente", featured: false, sourceType: "levantamento", estilo: "Levantamento UNIFESP" },
  { id: "sus-sp", label: "SUS-SP", kicker: "Padrão APS", featured: false, sourceType: "estimativa", estilo: "Estimativa APS" },
  { id: "sus-ba", label: "SUS-BA", kicker: "Padrão regional", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" },
  { id: "ufmg", label: "UFMG", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufrgs", label: "UFRGS", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufrj", label: "UFRJ", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "unicamp", label: "Unicamp", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "einstein", label: "Einstein", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa guideline" },
  { id: "amp", label: "AMP", kicker: "Padrão clássico R1", featured: false, sourceType: "estimativa", estilo: "Estimativa clássica R1" },
  { id: "ses-pe", label: "SES-PE", kicker: "Padrão regional", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" }
];

const CLONE_FROM = {
  revalida: "enamed",
  "sus-sp": "enamed",
  "sus-ba": "enamed",
  amp: "enamed",
  "ses-pe": "enamed",
  ufmg: "usp",
  ufrgs: "usp",
  ufrj: "usp",
  unicamp: "usp",
  einstein: "unifesp"
};

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function expandProfiles(profiles, moduleTitle) {
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const geral = byId.geral || profiles[0];
  return BANK_META.map((meta) => {
    if (byId[meta.id]) {
      const existing = deepClone(byId[meta.id]);
      existing.label = meta.label;
      existing.kicker = existing.kicker || meta.kicker;
      if (meta.featured) existing.featured = true;
      return existing;
    }
    const baseId = CLONE_FROM[meta.id] || "geral";
    const base = deepClone(byId[baseId] || geral);
    base.id = meta.id;
    base.label = meta.label;
    base.kicker = meta.kicker;
    base.featured = !!meta.featured;
    base.sourceType = meta.sourceType;
    base.estilo = meta.estilo;
    base.verdict =
      (base.verdict || "") +
      (meta.sourceType === "estimativa"
        ? " Estimativa por padrão da banca (não é ranking oficial deste módulo)."
        : "");
    base.source =
      "Padrão " +
      meta.label +
      " · Clínica médica · " +
      moduleTitle +
      (meta.sourceType === "estimativa" ? " (a partir de " + baseId + ")." : ".");
    return base;
  });
}

const data = JSON.parse(fs.readFileSync(out, "utf8"));
data.profiles = expandProfiles(data.profiles, data.title);
fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("stats-clinica-geral.json →", data.profiles.length, "bancas");
