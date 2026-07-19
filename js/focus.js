/* Foco personalizado — mistura estatísticas das provas-alvo (50% / 30% / 20%) */

const APROVA_FOCUS_CACHE = Object.create(null);
const APROVA_FOCUS_WEIGHTS = [0.5, 0.3, 0.2];
const APROVA_FOCUS_CACHE_VER = "20260718ww";

const APROVA_FOCUS_AREAS = [
  {
    id: "clinica",
    label: "Clínica médica",
    url: "data/stats-clinica-geral.json?v=" + APROVA_FOCUS_CACHE_VER
  },
  {
    id: "cirurgia",
    label: "Cirurgia",
    url: "data/stats-cirurgia-geral.json?v=" + APROVA_FOCUS_CACHE_VER
  },
  {
    id: "pediatria",
    label: "Pediatria",
    url: "data/stats-pediatria-geral.json?v=" + APROVA_FOCUS_CACHE_VER
  },
  {
    id: "go",
    label: "Ginecologia e obstetrícia",
    url: "data/stats-ginecologia-geral.json?v=" + APROVA_FOCUS_CACHE_VER
  },
  {
    id: "preventiva",
    label: "Preventiva",
    url: "data/stats-preventiva-geral.json?v=" + APROVA_FOCUS_CACHE_VER
  }
];

function aprovaFocusNormKey (tema) {
  return String(tema || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function aprovaFocusExamSlots (profile) {
  const filled = typeof aprovaProfileFilled === "function"
    ? aprovaProfileFilled(profile)
    : [];
  const exams = [];
  const others = [];
  filled.forEach((slot, index) => {
    if (!slot) return;
    if (slot.kind === "exam" && slot.id) {
      exams.push({
        id: slot.id,
        label: typeof aprovaPriorityLabel === "function" ? aprovaPriorityLabel(slot) : slot.id,
        rank: index
      });
    } else if (slot.kind === "other" && slot.label) {
      others.push({
        label: slot.label,
        rank: index
      });
    }
  });
  return { exams, others };
}

/** Pesos 50/30/20 renormalizados pelo número de provas com estatística. */
function aprovaFocusNormalizedWeights (count) {
  const n = Math.max(0, Math.min(3, count | 0));
  if (!n) return [];
  const raw = APROVA_FOCUS_WEIGHTS.slice(0, n);
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  return raw.map(w => w / sum);
}

async function aprovaFocusLoadArea (area) {
  const key = area.id;
  if (Object.prototype.hasOwnProperty.call(APROVA_FOCUS_CACHE, key)) {
    return APROVA_FOCUS_CACHE[key];
  }
  try {
    const res = await fetch(area.url);
    if (!res.ok) throw new Error("fail");
    APROVA_FOCUS_CACHE[key] = await res.json();
  } catch {
    APROVA_FOCUS_CACHE[key] = null;
  }
  return APROVA_FOCUS_CACHE[key];
}

function aprovaFocusBlendArea (data, examSlots) {
  if (!data || !examSlots.length) return null;

  const usable = [];
  examSlots.forEach(slot => {
    const profile = data.profiles.find(p => p.id === slot.id);
    if (profile && Array.isArray(profile.priorities) && profile.priorities.length) {
      usable.push({ slot, profile });
    }
  });
  if (!usable.length) return null;

  const weights = aprovaFocusNormalizedWeights(usable.length);
  const bag = Object.create(null);
  const display = Object.create(null);
  const usedExams = [];

  usable.forEach((item, i) => {
    const w = weights[i];
    usedExams.push({
      id: item.slot.id,
      label: item.slot.label,
      weight: Math.round(w * 100)
    });
    (item.profile.priorities || []).forEach(p => {
      const tema = String(p.tema || "").trim();
      if (!tema) return;
      const key = aprovaFocusNormKey(tema);
      const pct = Number(p.pct);
      if (!Number.isFinite(pct)) return;
      bag[key] = (bag[key] || 0) + pct * w;
      if (!display[key] || pct > display[key].pct) {
        display[key] = { tema, pct };
      }
    });
  });

  const blended = Object.keys(bag).map(key => ({
    tema: display[key].tema,
    pct: Math.round(bag[key] * 10) / 10
  })).sort((a, b) => b.pct - a.pct);

  const sum = blended.reduce((a, p) => a + p.pct, 0) || 1;
  const normalized = blended.map(p => ({
    tema: p.tema,
    pct: Math.round((p.pct / sum) * 1000) / 10
  }));
  let acc = Math.round(normalized.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (normalized[0] && acc !== 100) {
    normalized[0].pct = Math.round((normalized[0].pct + (100 - acc)) * 10) / 10;
  }

  const focus = normalized.slice(0, 4);
  const less = normalized.length > 5
    ? normalized.slice(-3).reverse()
    : normalized.slice(Math.max(0, normalized.length - 2)).reverse();

  return {
    themes: normalized,
    focus,
    less: less.filter(t => !focus.some(f => aprovaFocusNormKey(f.tema) === aprovaFocusNormKey(t.tema))),
    usedExams,
    title: data.title || ""
  };
}

async function aprovaBuildPersonalizedFocus (profile) {
  const { exams, others } = aprovaFocusExamSlots(profile);
  if (!exams.length) {
    return {
      ok: false,
      reason: others.length
        ? "A prova em Outra ainda não tem estatística no app. Escolha ao menos uma banca da lista na 1ª prioridade."
        : "Defina suas provas-alvo para montar o foco personalizado."
    };
  }

  const areas = [];
  for (const area of APROVA_FOCUS_AREAS) {
    const data = await aprovaFocusLoadArea(area);
    const blend = aprovaFocusBlendArea(data, exams);
    if (!blend) continue;
    areas.push({
      id: area.id,
      label: area.label,
      ...blend
    });
  }

  if (!areas.length) {
    return {
      ok: false,
      reason: "Não encontramos estatísticas das bancas escolhidas nestas áreas ainda."
    };
  }

  const weights = aprovaFocusNormalizedWeights(exams.length);
  const weightLine = exams.map((e, i) => {
    const pct = Math.round((weights[i] || 0) * 100);
    return e.label + " " + pct + "%";
  }).join(" · ");

  return {
    ok: true,
    weightLine,
    others,
    exams,
    areas,
    primaryExamId: exams[0].id
  };
}
