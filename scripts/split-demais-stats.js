/**
 * Quebra "Demais áreas/temas" em temas nomeados para o aluno não estudar um bloco opaco.
 * Usa pesos do perfil `geral` do mesmo arquivo (ou nomes entre parênteses, quando houver).
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const YEARS = ["2024", "2025", "2026"];
const YEAR_BIAS = {
  "2024": { pos: [1.15, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85, 0.85] },
  "2025": { pos: [1.05, 1.12, 1.08, 1.0, 0.95, 0.9, 0.88, 0.85] },
  "2026": { pos: [1.0, 1.05, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85] }
};

const ALIAS = [
  [/pneumo/i, /pneumolog/i],
  [/neuro/i, /neurolog/i],
  [/nefro/i, /nefrolog/i],
  [/endocrin|endócrino|endocrino/i, /endocrin/i],
  [/cardio/i, /cardio/i],
  [/urg[eê]nc/i, /urg[eê]nc/i],
  [/hemato/i, /hematolog/i],
  [/hepato/i, /hepatolog/i],
  [/reumat|orto/i, /reumat|orto/i],
  [/psiquiatr/i, /psiquiatr/i],
  [/queimadur/i, /queimadur/i],
  [/procto/i, /procto/i],
  [/urolog/i, /urolog/i],
  [/tor[aá]cic/i, /tor[aá]cic/i],
  [/cabe[cç]a|pesco[cç]o/i, /cabe[cç]a|pesco[cç]o/i],
  [/vascular/i, /vascular/i],
  [/anestesi/i, /anestesi/i],
  [/pl[aá]stic/i, /pl[aá]stic/i],
  [/bari[aá]tric/i, /bari[aá]tric/i],
  [/nutri[cç]/i, /nutri[cç]/i],
  [/maus.?trat|prote[cç]/i, /maus.?trat|prote[cç]/i],
  [/gastro/i, /gastro/i],
  [/infecto/i, /infect/i]
];

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
    if (p.n != null) out.n = Math.max(1, Math.round((p.pct / 100) * 100));
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

function matchTemplate(hint, template) {
  const h = normKey(hint);
  if (!h) return null;
  for (const t of template) {
    const k = normKey(t.tema);
    if (k.includes(h) || h.includes(k.split(" ")[0])) return t;
  }
  for (const [hintRe, temaRe] of ALIAS) {
    if (hintRe.test(hint)) {
      const hit = template.find((t) => temaRe.test(t.tema));
      if (hit) return hit;
    }
  }
  return null;
}

function labelFromHint(hint) {
  const h = hint.trim();
  if (!h) return null;
  // capitaliza de forma simples
  return h.charAt(0).toUpperCase() + h.slice(1);
}

function parseParenHints(tema) {
  const m = String(tema).match(/\(([^)]+)\)/);
  if (!m) return [];
  return m[1]
    .split(/,|\/|·|;|\be\b/i)
    .map((s) => s.replace(/\betc\.?$/i, "").trim())
    .filter((s) => s && !/^etc$/i.test(s));
}

function splitPriorities(priorities, template) {
  const idx = priorities.findIndex((p) => /demais/i.test(p.tema || ""));
  if (idx < 0) return null;
  const dem = priorities[idx];
  const kept = priorities.filter((_, i) => i !== idx);
  const present = new Set(kept.map((p) => normKey(p.tema)));
  function alreadyCovered(tema) {
    const k = normKey(tema);
    if (present.has(k)) return true;
    for (const p of present) {
      if (p.includes(k.split(" ")[0]) || k.includes(p.split(" ")[0])) return true;
    }
    // overlap por alias
    for (const [hintRe, temaRe] of ALIAS) {
      if (temaRe.test(tema)) {
        for (const keptTema of kept) {
          if (temaRe.test(keptTema.tema) || hintRe.test(keptTema.tema)) return true;
        }
      }
    }
    return false;
  }

  const hints = parseParenHints(dem.tema);
  let fill = [];

  if (hints.length) {
    for (const hint of hints) {
      const matched = matchTemplate(hint, template);
      if (matched && !alreadyCovered(matched.tema)) {
        fill.push({ tema: matched.tema, pct: matched.pct || 1 });
        present.add(normKey(matched.tema));
      } else if (!matched) {
        // temas citados no rótulo mas fora do template (ex.: cirurgia torácica)
        const label =
          /tor[aá]cic/i.test(hint)
            ? "Cirurgia torácica"
            : /cabe[cç]a|pesco[cç]o/i.test(hint)
              ? "Cirurgia de cabeça e pescoço"
              : /neuro/i.test(hint)
                ? "Neurologia pediátrica"
                : labelFromHint(hint);
        if (label && !present.has(normKey(label))) {
          fill.push({ tema: label, pct: 1 });
          present.add(normKey(label));
        }
      }
    }
  }

  // completa com o que falta no template (sempre, para não ficar genérico)
  for (const t of template) {
    if (!alreadyCovered(t.tema)) {
      fill.push({ tema: t.tema, pct: Number(t.pct) || 1 });
      present.add(normKey(t.tema));
    }
  }

  // evita fragmentar demais: no máximo 8 pedaços a partir do Demais
  fill.sort((a, b) => b.pct - a.pct);
  if (fill.length > 8) fill = fill.slice(0, 8);

  if (!fill.length) return null;

  const wSum = fill.reduce((a, t) => a + Number(t.pct || 1), 0) || fill.length;
  const added = fill.map((t) => ({
    tema: t.tema,
    pct: (Number(dem.pct) || 0) * (Number(t.pct || 1) / wSum)
  }));

  return normalize([...kept, ...added]);
}

function remapYear(priorities, year) {
  const bias = YEAR_BIAS[year];
  const weighted = priorities.map((p, i) => {
    const w = bias.pos[i] != null ? bias.pos[i] : 0.9;
    return { tema: p.tema, pct: Math.max(0.5, p.pct * w) };
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
      note: "Recorte anual do perfil detalhado (sem bloco genérico “Demais”)."
    };
  }
  return byYear;
}

function patchVerdict(profile) {
  let v = String(profile.verdict || "");
  v = v.replace(/\s*O bloco [“"]?Demais[”"]?[\s\S]{0,120}/gi, "");
  const tops = (profile.priorities || []).slice(0, 4).map((p) => p.tema.split(/[·(]/)[0].trim());
  const tip =
    " Para não se perder: detalhamos o antigo bloco “Demais” — foque também em " +
    tops.slice(-2).join(" e ") +
    " além do núcleo " +
    tops.slice(0, 2).join(" / ") +
    ".";
  if (!/antigo bloco|Detalhamos|sem bloco genérico/i.test(v)) {
    profile.verdict = (v.trim() + tip).trim();
  }
  const focoParts = (profile.priorities || []).slice(0, 4).map((p) => {
    const t = p.tema.split(/[·(]/)[0].trim();
    return t.split(/\s+/).slice(0, 2).join(" ");
  });
  if (focoParts.length) profile.foco = focoParts.join(" · ");
}

const FILES = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith("stats-") && f.endsWith(".json"));

let profiles = 0;
for (const file of FILES) {
  const full = path.join(DATA, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(data.profiles)) continue;
  const geral = data.profiles.find((p) => p.id === "geral") || data.profiles[0];
  const template = geral?.priorities || [];
  let n = 0;

  data.profiles = data.profiles.map((profile) => {
    const hasDemais = (profile.priorities || []).some((p) => /demais/i.test(p.tema || ""));
    if (!hasDemais) return profile;
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
    if (data.note && !/Demais/i.test(data.note)) {
      data.note +=
        " Quando uma banca tinha “Demais áreas/temas”, esse bloco foi aberto em temas nomeados para orientar o estudo.";
    }
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(file, "→", n, "perfis detalhados");
    profiles += n;
  }
}

console.log("done:", profiles, "profiles");
