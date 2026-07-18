/**
 * Garante a lista completa de provas/bancas em todos os módulos de Cirurgia
 * (mesmo conjunto usado em Ginecologia).
 */
const fs = require("fs");
const path = require("path");

const BANK_META = [
  { id: "geral", label: "Brasil", kicker: "Síntese nacional", featured: false, sourceType: "sintese", estilo: "Síntese das principais bancas" },
  { id: "enamed", label: "Enamed", kicker: "Nacional · acesso Enare", featured: true, sourceType: "levantamento", estilo: "Levantamento Enare/Enamed" },
  { id: "enare", label: "Enare", kicker: "2021–2024", featured: false, sourceType: "levantamento", estilo: "Levantamento Enare" },
  { id: "revalida", label: "Revalida", kicker: "INEP 2011–2025", featured: false, sourceType: "estimativa", estilo: "Estimativa INEP/Revalida" },
  { id: "usp", label: "USP", kicker: "2017–2023", featured: false, sourceType: "levantamento", estilo: "Levantamento USP-SP" },
  { id: "unifesp", label: "UNIFESP", kicker: "Série recente", featured: false, sourceType: "levantamento", estilo: "Levantamento UNIFESP" },
  { id: "sus-sp", label: "SUS-SP", kicker: "Padrão APS", featured: false, sourceType: "estimativa", estilo: "Estimativa APS" },
  { id: "sus-ba", label: "SUS-BA", kicker: "Padrão APS + endemias", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" },
  { id: "ufmg", label: "UFMG", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufrgs", label: "UFRGS", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufrj", label: "UFRJ", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "unicamp", label: "Unicamp", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "einstein", label: "Einstein", kicker: "Padrão recorrente", featured: false, sourceType: "estimativa", estilo: "Estimativa guideline" },
  { id: "amp", label: "AMP", kicker: "Padrão clássico R1", featured: false, sourceType: "estimativa", estilo: "Estimativa clássica R1" },
  { id: "ses-pe", label: "SES-PE", kicker: "Padrão regional", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" }
];

/** Qual perfil existente usar como base de prioridades/deckOrder */
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
  if (!geral) throw new Error("sem perfil geral");

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
      " · Cirurgia R1 · " +
      moduleTitle +
      (meta.sourceType === "estimativa"
        ? " (estimativa a partir do perfil " + baseId + ")."
        : ".");
    return base;
  });
}

const FILES = [
  "revisao-cir-abdome-agudo.json",
  "revisao-cir-trauma.json",
  "revisao-cir-perioperatorio.json",
  "revisao-cir-infantil.json",
  "revisao-cir-vascular.json",
  "revisao-cir-ad.json",
  "revisao-cir-especialidades.json",
  "stats-cirurgia-geral.json"
];

for (const file of FILES) {
  const full = path.join(__dirname, "..", "data", file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  const title = data.title || file;
  data.profiles = expandProfiles(data.profiles || [], title);
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(file, "→", data.profiles.map((p) => p.id).join(", "));
}

console.log("done ·", BANK_META.length, "bancas");
