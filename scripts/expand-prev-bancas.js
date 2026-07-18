/**
 * Expande bancas R1 nos módulos de Preventiva / overview.
 */
const fs = require("fs");
const path = require("path");

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
  if (!geral) throw new Error("sem perfil geral em " + moduleTitle);

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
    base.blurb = base.blurb || ("Padrão " + meta.label + " neste grupo.");
    base.verdict =
      (base.verdict || "") +
      (meta.sourceType === "estimativa"
        ? " Estimativa por padrão da banca (não é ranking oficial deste módulo)."
        : "");
    base.source =
      "Padrão " +
      meta.label +
      " · Preventiva · " +
      moduleTitle +
      (meta.sourceType === "estimativa" ? " (a partir de " + baseId + ")." : ".");
    return base;
  });
}

const FILES = [
  "revisao-prev-sus.json",
  "revisao-prev-epidemiologia.json",
  "revisao-prev-vigilancia.json",
  "revisao-prev-indicadores.json",
  "stats-preventiva-geral.json"
];

for (const file of FILES) {
  const full = path.join(__dirname, "..", "data", file);
  if (!fs.existsSync(full)) {
    console.warn("skip missing", file);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  data.profiles = expandProfiles(data.profiles || [], data.title || file);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(file, "→", data.profiles.length, "bancas");
}
