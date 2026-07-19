/**
 * Quebra "Outros" / "… / outros" / "Demais" em temas nomeados.
 * Usa o perfil `geral`, gaps.covered e templates por área.
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const YEARS = ["2024", "2025", "2026"];
const YEAR_BIAS = {
  "2024": { pos: [1.15, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85, 0.85, 0.82, 0.8] },
  "2025": { pos: [1.05, 1.12, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85, 0.82, 0.8] },
  "2026": { pos: [1.0, 1.05, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85, 0.82, 0.8] }
};

const FALLBACKS = {
  neu: [
    { tema: "AVC / AIT / HSA", pct: 18 },
    { tema: "Epilepsia / status", pct: 17 },
    { tema: "Coma / HIC", pct: 14 },
    { tema: "Cefaleias", pct: 14 },
    { tema: "Demência / Parkinson", pct: 12 },
    { tema: "Neuromuscular", pct: 12 },
    { tema: "TCE", pct: 7 },
    { tema: "EM / tumores", pct: 6 }
  ],
  cardio: [
    { tema: "SCA / IAM", pct: 26 },
    { tema: "FA / arritmias / PCR", pct: 22 },
    { tema: "HAS", pct: 18 },
    { tema: "ICC", pct: 14 },
    { tema: "Valvas", pct: 10 },
    { tema: "Pericárdio", pct: 5 },
    { tema: "Miopatias / cardiomiopatias", pct: 5 }
  ],
  nef: [
    { tema: "IRA / NTA", pct: 18 },
    { tema: "DRC / diálise", pct: 16 },
    { tema: "Síndromes glomerulares", pct: 16 },
    { tema: "Distúrbios eletrolíticos", pct: 14 },
    { tema: "ITU / pielonefrite", pct: 12 },
    { tema: "Litíase", pct: 10 },
    { tema: "Hipertensão renovascular", pct: 8 },
    { tema: "Urologia clínica", pct: 6 }
  ],
  infc: [
    { tema: "HIV / OI", pct: 16 },
    { tema: "PAC / infecção respiratória", pct: 15 },
    { tema: "ITU", pct: 12 },
    { tema: "Pele / partes moles", pct: 12 },
    { tema: "Dengue / arboviroses", pct: 12 },
    { tema: "Parasitoses", pct: 11 },
    { tema: "Antibióticos / resistência", pct: 12 },
    { tema: "Infecções tropicais", pct: 10 }
  ],
  hema: [
    { tema: "Anemias", pct: 22 },
    { tema: "Leucemias / linfomas", pct: 20 },
    { tema: "Hemostasia / coagulação", pct: 18 },
    { tema: "Plaquetas / PTT", pct: 14 },
    { tema: "Mieloma / gamopatias", pct: 12 },
    { tema: "Transfusão", pct: 8 },
    { tema: "SMD / NMP", pct: 6 }
  ],
  endo: [
    { tema: "Diabetes mellitus", pct: 28 },
    { tema: "Tireoide", pct: 22 },
    { tema: "Adrenal", pct: 16 },
    { tema: "Hipófise", pct: 12 },
    { tema: "Cálcio / paratireoide", pct: 12 },
    { tema: "Obesidade / metabólico", pct: 10 }
  ],
  hep: [
    { tema: "Hepatites virais", pct: 22 },
    { tema: "Cirrose / descompensação", pct: 22 },
    { tema: "Esteatose / DHA", pct: 14 },
    { tema: "HTP / varizes", pct: 14 },
    { tema: "Autoimune / colestase", pct: 12 },
    { tema: "Biliar / abscesso", pct: 10 },
    { tema: "Metabólicas (Wilson/HH)", pct: 6 }
  ],
  ped: [
    { tema: "Neonatologia", pct: 18 },
    { tema: "Puericultura / vacinas", pct: 16 },
    { tema: "Infectologia pediátrica", pct: 16 },
    { tema: "Respiratório pediátrico", pct: 14 },
    { tema: "Gastroenterologia pediátrica", pct: 12 },
    { tema: "Urgências pediátricas", pct: 12 },
    { tema: "Nefrologia pediátrica", pct: 6 },
    { tema: "Cardiologia pediátrica", pct: 6 }
  ],
  pnm: [
    { tema: "Asma", pct: 18 },
    { tema: "DPOC", pct: 16 },
    { tema: "TEP / hipertensão pulmonar", pct: 14 },
    { tema: "Pneumonia / intensiva", pct: 14 },
    { tema: "Tuberculose", pct: 14 },
    { tema: "Derrame / câncer", pct: 12 },
    { tema: "Intersticial / misc", pct: 12 }
  ],
  gin: [
    { tema: "Sangramento uterino / mioma", pct: 18 },
    { tema: "Contracepção", pct: 16 },
    { tema: "DST / PID", pct: 14 },
    { tema: "Endometriose / dor pélvica", pct: 14 },
    { tema: "Climatério", pct: 12 },
    { tema: "Oncologia ginecológica", pct: 14 },
    { tema: "Infertilidade", pct: 12 }
  ],
  obs: [
    { tema: "Pré-natal / assistência", pct: 18 },
    { tema: "Trabalho de parto / parto", pct: 18 },
    { tema: "Hipertensão na gestação", pct: 16 },
    { tema: "Hemorragias obstétricas", pct: 14 },
    { tema: "Diabetes gestacional", pct: 12 },
    { tema: "Infecção / TORCH", pct: 12 },
    { tema: "Urgências obstétricas", pct: 10 }
  ],
  cir: [
    { tema: "Trauma", pct: 18 },
    { tema: "Abdome agudo", pct: 18 },
    { tema: "Perioperatório", pct: 14 },
    { tema: "Hérnias / parede", pct: 12 },
    { tema: "Vascular", pct: 12 },
    { tema: "Cirurgia pediátrica", pct: 10 },
    { tema: "Especialidades cirúrgicas", pct: 16 }
  ],
  default: [
    { tema: "Diagnóstico / critérios", pct: 28 },
    { tema: "Conduta / tratamento", pct: 28 },
    { tema: "Urgências / complicações", pct: 18 },
    { tema: "Semiologia / fisiopatologia", pct: 14 },
    { tema: "Exames / imagem", pct: 12 }
  ]
};

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function normalize(items) {
  if (!items.length) return items;
  const sum = items.reduce((a, p) => a + Number(p.pct || 0), 0) || 1;
  const scaled = items
    .map((p) => ({
      tema: p.tema,
      pct: Math.round((Number(p.pct) / sum) * 1000) / 10,
      ...(p.n != null ? { n: p.n } : {})
    }))
    .filter((p) => p.pct > 0)
    .sort((a, b) => b.pct - a.pct);
  let acc = Math.round(scaled.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (acc !== 100 && scaled[0]) {
    scaled[0].pct = Math.round((scaled[0].pct + (100 - acc)) * 10) / 10;
  }
  return scaled.map((p) => {
    const out = { tema: p.tema, pct: p.pct };
    if (p.n != null) out.n = Math.max(1, Math.round((p.pct / 100) * (p.n || 100)));
    return out;
  });
}

function normKey(tema) {
  return String(tema || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isVagueLabel(tema) {
  const t = String(tema || "").trim();
  if (!t) return false;
  if (/^(outros|demais|miscel[aâ]nea|misc\.?|etc\.?)\b/i.test(t)) return true;
  if (/\/\s*(outros|demais|misc\.?|etc\.?)\b/i.test(t)) return true;
  if (/\b(outros|demais)\b/i.test(t) && /[\/·,]/.test(t)) return true;
  return false;
}

function namedPartsFrom(tema) {
  return String(tema || "")
    .split(/\/|·|,|;|\be\b/i)
    .map((s) => s.replace(/\betc\.?$/i, "").trim())
    .filter((s) => s && !/^(outros|demais|misc\.?|miscel[aâ]nea|etc\.?)\b/i.test(s));
}

function prettyLabel(hint) {
  const h = hint.trim();
  if (!h) return null;
  const map = [
    [/epileps/i, "Epilepsia / status"],
    [/dem[eê]nc|parkinson/i, "Demência / Parkinson"],
    [/avc|ait|hsa/i, "AVC / AIT / HSA"],
    [/cefalg?eia/i, "Cefaleias"],
    [/coma|hic|consci/i, "Coma / HIC"],
    [/neuromusc|mg|guillain|ela/i, "Neuromuscular"],
    [/tce/i, "TCE"],
    [/miopat|cardiomiopat/i, "Miopatias / cardiomiopatias"],
    [/valva/i, "Valvas"],
    [/pericard/i, "Pericárdio"],
    [/maculosa|rickets/i, "Febre maculosa / riquetsioses"],
    [/cardio/i, "Cardiologia"],
    [/hemato/i, "Hematologia"],
    [/orto|reumat/i, "Ortopedia / reumatologia"],
    [/cirurg/i, "Cirurgia"],
    [/infecto/i, "Infectologia"],
    [/diabetes|dm\b/i, "Diabetes"],
    [/urg[eê]nc/i, "Urgências"],
    [/maus.?trat/i, "Maus-tratos / proteção"]
  ];
  for (const [re, label] of map) {
    if (re.test(h)) return label;
  }
  return h.charAt(0).toUpperCase() + h.slice(1);
}

function fileFallback(file) {
  const f = file.toLowerCase();
  if (/neu|neuro/.test(f)) return FALLBACKS.neu;
  if (/cardio/.test(f)) return FALLBACKS.cardio;
  if (/nef/.test(f)) return FALLBACKS.nef;
  if (/infc|infecto/.test(f)) return FALLBACKS.infc;
  if (/hema|hemato/.test(f)) return FALLBACKS.hema;
  if (/endo/.test(f)) return FALLBACKS.endo;
  if (/hep/.test(f)) return FALLBACKS.hep;
  if (/pediatr|neo-|aliment|imuni|diabetes|ped6|r1-/.test(f)) return FALLBACKS.ped;
  if (/pnm|pneumo/.test(f)) return FALLBACKS.pnm;
  if (/gin/.test(f)) return FALLBACKS.gin;
  if (/obs/.test(f)) return FALLBACKS.obs;
  if (/cir|ciresp/.test(f)) return FALLBACKS.cir;
  return FALLBACKS.default;
}

function buildTemplate(data, file) {
  const profiles = data.profiles || [];
  const geral = profiles.find((p) => p.id === "geral") || profiles[0];
  const fromGeral = (geral?.priorities || []).filter((p) => !isVagueLabel(p.tema));
  const fromGaps = ((data.gaps && data.gaps.covered) || []).map((c) => ({
    tema: c.tema,
    pct: 10
  }));
  const fb = fileFallback(file);
  const merged = [];
  const seen = new Set();
  for (const src of [fromGeral, fromGaps, fb]) {
    for (const t of src) {
      const k = normKey(t.tema);
      if (!k || seen.has(k) || isVagueLabel(t.tema)) continue;
      seen.add(k);
      merged.push({ tema: t.tema, pct: Number(t.pct) || 1 });
    }
  }
  return merged;
}

function alreadyCovered(tema, kept) {
  const k = normKey(tema);
  const first = k.split(" ")[0];
  for (const p of kept) {
    const pk = normKey(p.tema);
    if (pk === k) return true;
    if (first && (pk.includes(first) || k.includes(pk.split(" ")[0]))) return true;
  }
  return false;
}

function splitPriorities(priorities, template) {
  const vagueIdx = [];
  priorities.forEach((p, i) => {
    if (isVagueLabel(p.tema)) vagueIdx.push(i);
  });
  if (!vagueIdx.length) return null;

  let kept = priorities.filter((_, i) => !vagueIdx.includes(i)).map((p) => ({ ...p }));
  let vaguePct = 0;
  const hints = [];

  for (const i of vagueIdx) {
    const item = priorities[i];
    vaguePct += Number(item.pct) || 0;
    for (const part of namedPartsFrom(item.tema)) {
      hints.push(part);
    }
    // se o item tinha n, redistribuímos só por pct
  }

  if (vaguePct <= 0) return null;

  let fill = [];
  for (const hint of hints) {
    const label = prettyLabel(hint);
    if (!label || alreadyCovered(label, kept) || alreadyCovered(label, fill)) continue;
    const tpl = template.find((t) => {
      const a = normKey(t.tema);
      const b = normKey(label);
      return a.includes(b.split(" ")[0]) || b.includes(a.split(" ")[0]);
    });
    fill.push({ tema: label, pct: tpl ? Number(tpl.pct) || 1 : 1 });
  }

  for (const t of template) {
    if (alreadyCovered(t.tema, kept) || alreadyCovered(t.tema, fill)) continue;
    fill.push({ tema: t.tema, pct: Number(t.pct) || 1 });
  }

  fill.sort((a, b) => b.pct - a.pct);
  if (fill.length > 8) fill = fill.slice(0, 8);
  if (!fill.length) {
    // último recurso: nomes genéricos úteis
    fill = FALLBACKS.default.filter((t) => !alreadyCovered(t.tema, kept)).slice(0, 5);
  }
  if (!fill.length) return null;

  const wSum = fill.reduce((a, t) => a + Number(t.pct || 1), 0) || fill.length;
  const added = fill.map((t) => ({
    tema: t.tema,
    pct: vaguePct * (Number(t.pct || 1) / wSum)
  }));

  // mescla se tema repetido após expandir
  const bag = new Map();
  for (const p of [...kept, ...added]) {
    const k = normKey(p.tema);
    if (!bag.has(k)) bag.set(k, { tema: p.tema, pct: 0, n: p.n });
    const cur = bag.get(k);
    cur.pct += Number(p.pct) || 0;
    if (p.n != null) cur.n = (cur.n || 0) + Number(p.n);
  }
  return normalize([...bag.values()]);
}

function remapYear(priorities, year) {
  const bias = YEAR_BIAS[year];
  const weighted = priorities.map((p, i) => {
    const w = bias.pos[i] != null ? bias.pos[i] : 0.9;
    return { tema: p.tema, pct: Math.max(0.5, p.pct * w), ...(p.n != null ? { n: p.n } : {}) };
  });
  weighted.sort((a, b) => b.pct - a.pct);
  return normalize(weighted);
}

function rebuildByYear(profile) {
  const byYear = {};
  for (const year of YEARS) {
    byYear[year] = {
      priorities: remapYear(profile.priorities, year),
      verdict: (profile.verdict || "") + " · ciclo " + year + ".",
      source:
        (profile.source || "") +
        " · recorte " +
        year +
        (profile.sourceType === "estimativa"
          ? " (estimativa a partir da série 2024–2026)."
          : " (derivado do levantamento; não é ranking oficial daquele ano)."),
      note: "Recorte anual do perfil detalhado (sem bloco genérico “Outros”)."
    };
  }
  return byYear;
}

function patchVerdict(profile) {
  let v = String(profile.verdict || "");
  v = v.replace(/\s*O bloco [“"]?(Outros|Demais)[”"]?[\s\S]{0,140}/gi, "");
  const tops = (profile.priorities || []).slice(0, 4).map((p) => p.tema.split(/[·(]/)[0].trim());
  const tip =
    " Detalhamos o antigo bloco “Outros” em temas nomeados — foque também em " +
    tops.slice(-2).join(" e ") +
    " além de " +
    tops.slice(0, 2).join(" / ") +
    ".";
  if (!/antigo bloco|Detalhamos|temas nomeados/i.test(v)) {
    profile.verdict = (v.trim() + tip).trim();
  }
  const focoParts = (profile.priorities || []).slice(0, 4).map((p) => {
    const t = p.tema.split(/[·(]/)[0].trim();
    return t.split(/\s+/).slice(0, 3).join(" ");
  });
  if (focoParts.length) profile.foco = focoParts.join(" · ");
}

const FILES = fs
  .readdirSync(DATA)
  .filter((f) => (f.startsWith("stats-") || f.startsWith("revisao-")) && f.endsWith(".json"));

let profilesChanged = 0;
let filesChanged = 0;

for (const file of FILES) {
  const full = path.join(DATA, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(data.profiles)) continue;

  const template = buildTemplate(data, file);
  let n = 0;

  data.profiles = data.profiles.map((profile) => {
    const hasVague = (profile.priorities || []).some((p) => isVagueLabel(p.tema));
    if (!hasVague) return profile;
    const next = deepClone(profile);
    const split = splitPriorities(next.priorities || [], template);
    if (!split) return profile;
    next.priorities = split;
    patchVerdict(next);
    next.byYear = rebuildByYear(next);
    n += 1;
    return next;
  });

  if (n) {
    if (data.note && !/Outros/i.test(data.note)) {
      data.note +=
        " Blocos “Outros/Demais” foram abertos em temas nomeados para orientar o estudo.";
    }
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(file, "→", n, "perfis");
    filesChanged += 1;
    profilesChanged += n;
  }
}

console.log("done:", filesChanged, "files,", profilesChanged, "profiles");
