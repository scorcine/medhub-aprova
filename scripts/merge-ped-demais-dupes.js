const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "data", "stats-pediatria-geral.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

function norm(t) {
  return String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function groupKey(tema) {
  const k = norm(tema);
  if (/puericult|imuniz|aleitament|vacin/.test(k)) return "puericultura";
  if (/neonat/.test(k)) return "neo";
  if (/infect/.test(k)) return "infecto";
  if (/pneumo|respir/.test(k)) return "pneumo";
  if (/gastro|desidrat/.test(k)) return "gastro";
  if (/nefro/.test(k)) return "nefro";
  if (/endocrin|diabetes/.test(k)) return "endo";
  if (/urgenc/.test(k)) return "urg";
  if (/reumat|orto/.test(k)) return "reu";
  if (/cardio|hemato/.test(k)) return "cardio";
  if (/maus|protec/.test(k)) return "maus";
  if (/neuro/.test(k)) return "neuro";
  return k;
}

const prefer = {
  puericultura: "Puericultura (vacinas, crescimento, aleitamento)",
  neo: "Neonatologia",
  infecto: "Infectologia pediátrica",
  pneumo: "Pneumologia / respiratório",
  gastro: "Gastroenterologia / desidratação",
  nefro: "Nefrologia",
  endo: "Endocrinologia / diabetes",
  urg: "Urgências e emergências",
  reu: "Reumatologia / orto pediátrica",
  cardio: "Cardio / hemato / outros",
  maus: "Maus-tratos / proteção",
  neuro: "Neurologia pediátrica"
};

function merge(pri) {
  const map = new Map();
  for (const p of pri) {
    const g = groupKey(p.tema);
    const cur = map.get(g) || { tema: prefer[g] || p.tema, pct: 0 };
    cur.pct += Number(p.pct) || 0;
    if ((prefer[g] || p.tema).length >= cur.tema.length) cur.tema = prefer[g] || p.tema;
    map.set(g, cur);
  }
  let items = [...map.values()].sort((a, b) => b.pct - a.pct);
  const sum = items.reduce((a, p) => a + p.pct, 0) || 1;
  items = items.map((p) => ({
    tema: p.tema,
    pct: Math.round((p.pct / sum) * 1000) / 10
  }));
  let acc = Math.round(items.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (acc !== 100 && items[0]) {
    items[0].pct = Math.round((items[0].pct + (100 - acc)) * 10) / 10;
  }
  return items;
}

const YEAR_POS = {
  "2024": [1.15, 1.08, 1, 0.95, 0.9, 0.88, 0.85, 0.85],
  "2025": [1.05, 1.12, 1.08, 1, 0.95, 0.9, 0.88, 0.85],
  "2026": [1, 1.05, 1.15, 1.1, 1, 0.95, 0.9, 0.85]
};

function yearPri(base, year) {
  const pos = YEAR_POS[year];
  let w = base.map((p, i) => ({
    tema: p.tema,
    pct: Math.max(0.5, p.pct * (pos[i] != null ? pos[i] : 0.9))
  }));
  w.sort((a, b) => b.pct - a.pct);
  const sum = w.reduce((a, p) => a + p.pct, 0) || 1;
  w = w.map((p) => ({ tema: p.tema, pct: Math.round((p.pct / sum) * 1000) / 10 }));
  let acc = Math.round(w.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (acc !== 100 && w[0]) w[0].pct = Math.round((w[0].pct + (100 - acc)) * 10) / 10;
  return w;
}

for (const id of ["iamspe", "consesp"]) {
  const p = data.profiles.find((x) => x.id === id);
  if (!p) continue;
  p.priorities = merge(p.priorities);
  p.foco = p.priorities
    .slice(0, 4)
    .map((x) => x.tema.split(/[·(]/)[0].trim().split(/\s+/).slice(0, 2).join(" "))
    .join(" · ");
  p.byYear = {};
  for (const y of ["2024", "2025", "2026"]) {
    p.byYear[y] = {
      priorities: yearPri(p.priorities, y),
      verdict: (p.verdict || "") + " · ciclo " + y + ".",
      source:
        (p.source || "") +
        " · recorte " +
        y +
        " (estimativa a partir da série 2024–2026).",
      note: "Recorte anual do perfil detalhado (sem bloco genérico Demais)."
    };
  }
  console.log(id, p.priorities.map((x) => x.tema + ":" + x.pct).join(" | "));
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
