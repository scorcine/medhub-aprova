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

const { expandProfiles } = require("./lib/expand-bancas-core");

const out = path.join(__dirname, "..", "data", "stats-clinica-geral.json");
fs.writeFileSync(out, JSON.stringify(stats, null, 2) + "\n", "utf8");
console.log("wrote stats-clinica-geral.json");

const data = JSON.parse(fs.readFileSync(out, "utf8"));
data.profiles = expandProfiles(data.profiles, data.title, "Clínica médica");
fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("stats-clinica-geral.json →", data.profiles.length, "bancas");
