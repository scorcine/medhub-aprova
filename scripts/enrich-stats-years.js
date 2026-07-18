/**
 * Acrescenta recorte por ano (2024 / 2025 / 2026) em stats e revisões.
 * priorities raiz = síntese dos 3 anos; byYear.* = estimativa do ciclo.
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const YEARS = ["2024", "2025", "2026"];

const YEAR_BIAS = {
  "2024": {
    label: "2024",
    note: "Recorte estimado do ciclo 2024 (provas R1 / Enare-Enamed e correlatas).",
    pos: [1.15, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85, 0.85],
    kw: [
      { re: /clássico|critério|semiolog|fisiopat|básico|definição/i, w: 1.2 },
      { re: /guideline|novo|enamed|atualiz/i, w: 0.9 }
    ]
  },
  "2025": {
    label: "2025",
    note: "Recorte estimado do ciclo 2025 (pico Enare/Enamed e grandes bancas).",
    pos: [1.05, 1.12, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85],
    kw: [
      { re: /urgenc|sca|iam|sepse|conduta|aps|protocolo|enamed|enare/i, w: 1.25 },
      { re: /raro|transplante|pesquisa/i, w: 0.85 }
    ]
  },
  "2026": {
    label: "2026",
    note: "Recorte estimado do ciclo 2026 (tendência Enare/Enamed + provas institucionais).",
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
  const sum = items.reduce((a, p) => a + p.pct, 0) || 1;
  const scaled = items.map((p) => ({
    tema: p.tema,
    pct: Math.round((p.pct / sum) * 1000) / 10,
    ...(p.n != null ? { n: p.n } : {})
  }));
  let acc = Math.round(scaled.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (acc !== 100 && scaled[0]) {
    scaled[0].pct = Math.round((scaled[0].pct + (100 - acc)) * 10) / 10;
  }
  return scaled.map((p) => {
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

function enrichProfile(profile) {
  const p = deepClone(profile);
  const base = p.priorities || [];
  if (!p.byYear) p.byYear = {};
  for (const year of YEARS) {
    const existing = p.byYear[year];
    p.byYear[year] = {
      priorities: remapForYear(base, year),
      verdict: (p.verdict || "") + " · ciclo " + year + ".",
      source:
        (p.source || "Síntese MedHub R1") +
        " · recorte " +
        year +
        " (estimativa a partir da série 2024–2026).",
      sampleSize: existing?.sampleSize || p.sampleSize || null,
      note: YEAR_BIAS[year].note
    };
    if (!p.byYear[year].sampleSize) delete p.byYear[year].sampleSize;
  }
  if (p.kicker && /2021|2017|série antiga/i.test(p.kicker)) {
    p.kicker = "Ciclo 2024–2026";
  }
  if (p.source && /2021|2017–2023/i.test(p.source)) {
    p.source = String(p.source).replace(/2017–2023|2021–2024/g, "2024–2026");
  }
  return p;
}

function enrichFile(file) {
  const full = path.join(DATA, file);
  if (!fs.existsSync(full)) return;
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(data.profiles) || !data.profiles.length) return;

  data.profiles = data.profiles.map(enrichProfile);
  data.years = YEARS;
  data.yearLabel = "2024–2026";
  if (data.note) {
    if (!/2024|2025|2026/.test(data.note)) {
      data.note = data.note + " Recorte principal: provas 2024–2026.";
    }
  } else {
    data.note = "Síntese das provas R1 do ciclo 2024–2026.";
  }

  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("years →", file);
}

const files = fs.readdirSync(DATA).filter(
  (f) =>
    (f.startsWith("stats-") && f.endsWith("-geral.json")) ||
    (f.startsWith("revisao-") && f.endsWith(".json"))
);

for (const f of files) enrichFile(f);
console.log("done", files.length, "files");
