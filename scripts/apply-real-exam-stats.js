/**
 * Aplica percentuais de levantamentos públicos (cursinhos) nos perfis
 * enamed / enare / usp / revalida / geral dos stats-*-geral.json.
 *
 * Fonte: data/_real-exam-stats.json
 * Depois regenera byYear com o mesmo bias de enrich-stats-years.js,
 * mas preserva o rótulo de levantamento (não marca como "estimativa da banca").
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data");
const REAL = JSON.parse(
  fs.readFileSync(path.join(DATA, "_real-exam-stats.json"), "utf8")
);

const YEARS = ["2024", "2025", "2026"];
const YEAR_BIAS = {
  "2024": {
    note: "Recorte anual derivado do levantamento (série citada na fonte).",
    pos: [1.15, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85, 0.85],
    kw: [
      { re: /clássico|critério|semiolog|fisiopat|básico|definição/i, w: 1.2 },
      { re: /guideline|novo|enamed|atualiz/i, w: 0.9 }
    ]
  },
  "2025": {
    note: "Recorte anual derivado do levantamento (pico Enare/Enamed).",
    pos: [1.05, 1.12, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85],
    kw: [
      { re: /urgenc|sca|iam|sepse|conduta|aps|protocolo|enamed|enare/i, w: 1.25 },
      { re: /raro|transplante|pesquisa/i, w: 0.85 }
    ]
  },
  "2026": {
    note: "Recorte anual derivado do levantamento (tendência 2026).",
    pos: [1.0, 1.05, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85],
    kw: [
      { re: /conduta|guideline|protocolo|meta|droga|aps|esf|previne/i, w: 1.3 },
      { re: /históric|semiolog cláss/i, w: 0.85 }
    ]
  }
};

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function normalize(items) {
  if (!items.length) return items;
  const sum = items.reduce((a, p) => a + Number(p.pct || 0), 0) || 1;
  const scaled = items.map((p) => ({
    tema: p.tema,
    pct: Math.round((Number(p.pct) / sum) * 1000) / 10,
    ...(p.n != null ? { n: p.n } : {})
  }));
  let acc = Math.round(scaled.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (acc !== 100 && scaled[0]) {
    scaled[0].pct = Math.round((scaled[0].pct + (100 - acc)) * 10) / 10;
  }
  return scaled
    .filter((p) => p.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .map((p) => {
      const out = { tema: p.tema, pct: p.pct };
      if (p.n != null) out.n = Math.max(1, Math.round((p.pct / 100) * 100));
      return out;
    });
}

function remapForYear(priorities, year) {
  const bias = YEAR_BIAS[year];
  if (!bias || !priorities?.length) return deepClone(priorities || []);
  const weighted = priorities.map((p, i) => {
    let w = bias.pos[i] != null ? bias.pos[i] : 0.9;
    for (const rule of bias.kw) {
      if (rule.re.test(String(p.tema || ""))) w *= rule.w;
    }
    return {
      tema: p.tema,
      pct: Math.max(0.5, (Number(p.pct) || 1) * w),
      n: p.n
    };
  });
  weighted.sort((a, b) => b.pct - a.pct);
  return normalize(weighted);
}

function sourceLabel(sourceKey) {
  const s = REAL.meta.sources[sourceKey];
  if (!s) return "Levantamento público (cursinho)";
  const note = s.note ? ` · ${s.note}` : "";
  return `${s.name}${note}. ${s.url}`;
}

function buildByYear(profile) {
  const byYear = {};
  const base = profile.priorities || [];
  const isLevantamento =
    profile.sourceType === "levantamento" || profile.sourceType === "sintese";
  for (const year of YEARS) {
    byYear[year] = {
      priorities: remapForYear(base, year),
      verdict: (profile.verdict || "") + " · ciclo " + year + ".",
      source: isLevantamento
        ? (profile.source || "") +
          " · recorte " +
          year +
          " (derivado do levantamento; não é ranking oficial daquele ano)."
        : (profile.source || "") +
          " · recorte " +
          year +
          " (estimativa a partir da série 2024–2026).",
      note: YEAR_BIAS[year].note
    };
  }
  return byYear;
}

function applyPatch(profile, patch) {
  const p = deepClone(profile);
  p.sourceType = patch.sourceType || p.sourceType;
  p.source = sourceLabel(patch.sourceKey);
  if (patch.kicker) p.kicker = patch.kicker;
  if (patch.estilo) p.estilo = patch.estilo;
  if (patch.foco) p.foco = patch.foco;
  if (patch.verdict) p.verdict = patch.verdict;
  p.priorities = normalize(patch.priorities || []);
  p.byYear = buildByYear(p);
  p.realStats = {
    applied: REAL.meta.updated,
    sourceKey: patch.sourceKey,
    disclaimer: REAL.meta.disclaimer
  };
  return p;
}

let filesTouched = 0;
let profilesTouched = 0;

for (const [file, profiles] of Object.entries(REAL.files)) {
  const full = path.join(DATA, file);
  if (!fs.existsSync(full)) {
    console.warn("skip missing", file);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(data.profiles)) continue;

  let n = 0;
  data.profiles = data.profiles.map((profile) => {
    const patch = profiles[profile.id];
    if (!patch) return profile;
    n += 1;
    return applyPatch(profile, patch);
  });

  if (n) {
    const noteExtra =
      " Percentuais de Enamed/Enare/Revalida/USP/Geral Brasil vêm de levantamentos públicos de cursinho (Estratégia, CleverMed, MedCof) — ver fonte em cada prova.";
    if (data.note && !/levantamentos públicos|CleverMed|Estratégia MED/.test(data.note)) {
      data.note = data.note.replace(/\s*$/, "") + noteExtra;
    }
    data.realStatsMeta = {
      updated: REAL.meta.updated,
      disclaimer: REAL.meta.disclaimer
    };
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(file, "→", n, "perfis atualizados");
    filesTouched += 1;
    profilesTouched += n;
  }
}

console.log("done:", filesTouched, "files,", profilesTouched, "profiles");
