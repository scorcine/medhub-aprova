/* Revisão programada (SRS simples) — progresso no localStorage */

const APROVA_SRS_KEY = "medhub-aprova-srs-v1";
const APROVA_ACTIVITY_KEY = "medhub-aprova-activity-v1";
const APROVA_DAY_MS = 24 * 60 * 60 * 1000;

function aprovaActivityDayKey (now = Date.now()) {
  const d = new Date(now);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function aprovaLoadActivity () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_ACTIVITY_KEY) || "{}");
  } catch {
    return {};
  }
}

function aprovaSaveActivity (map) {
  localStorage.setItem(APROVA_ACTIVITY_KEY, JSON.stringify(map || {}));
}

/** Soma revisões/estudos registrados entre duas datas (inclusive, YYYY-MM-DD). */
function aprovaActivitySumRange (fromIso, toIso) {
  const map = aprovaLoadActivity();
  const from = String(fromIso || "");
  const to = String(toIso || "");
  let total = 0;
  Object.keys(map).forEach(key => {
    if (key >= from && key <= to) total += Number(map[key]) || 0;
  });
  return total;
}

function aprovaActivityToday (now = Date.now()) {
  const map = aprovaLoadActivity();
  return Number(map[aprovaActivityDayKey(now)]) || 0;
}

function aprovaActivityOnDay (iso) {
  if (!iso) return 0;
  const map = aprovaLoadActivity();
  return Number(map[String(iso)]) || 0;
}

/** Dia ISO (YYYY-MM-DD) para creditar estudo adiantado; null = hoje. */
let aprovaActivityCreditDay = null;

function aprovaSetActivityCreditDay (iso) {
  const s = String(iso || "").trim();
  aprovaActivityCreditDay = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  return aprovaActivityCreditDay;
}

function aprovaClearActivityCreditDay () {
  aprovaActivityCreditDay = null;
}

function aprovaGetActivityCreditDay () {
  return aprovaActivityCreditDay;
}

function aprovaLogStudyActivity (count = 1, now = Date.now()) {
  const n = Math.max(1, count | 0);
  const map = aprovaLoadActivity();
  const key = aprovaActivityCreditDay || aprovaActivityDayKey(now);
  map[key] = (Number(map[key]) || 0) + n;

  // Mantém ~14 meses
  const keys = Object.keys(map).sort();
  while (keys.length > 420) {
    delete map[keys.shift()];
  }
  aprovaSaveActivity(map);
  return map[key];
}

function aprovaLoadSrs () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_SRS_KEY) || "{}");
  } catch {
    return {};
  }
}

function aprovaSaveSrs (data) {
  localStorage.setItem(APROVA_SRS_KEY, JSON.stringify(data));
}

/** @returns {'new'|'due'|'later'} */
function aprovaCardStatus (cardId, now = Date.now()) {
  const entry = aprovaLoadSrs()[cardId];
  if (!entry || typeof entry.due !== "number") return "new";
  if (entry.due <= now) return "due";
  return "later";
}

function aprovaPendingIds (cardIds, now = Date.now()) {
  return cardIds.filter(id => {
    const status = aprovaCardStatus(id, now);
    return status === "new" || status === "due";
  });
}

function aprovaScheduleCard (cardId, knewIt, opts) {
  const map = aprovaLoadSrs();
  const now = Date.now();
  const prev = map[cardId];
  let intervalDays;

  // Errou → 3 dias · Acertou → 7 · Acertou de novo → 14 → 28 → … (máx. 60)
  if (!knewIt) {
    intervalDays = 3;
  } else if (prev && prev.intervalDays >= 7) {
    intervalDays = Math.min(prev.intervalDays * 2, 60);
  } else {
    intervalDays = 7;
  }

  // Ajuste fino pelo desempenho do tema vs meta de acerto da prova
  const o = opts || {};
  let mult = Number(o.spacingMult);
  if (!Number.isFinite(mult) || mult <= 0) {
    const tema = o.tema || o.deckName || "";
    if (tema && typeof aprovaThemeAccuracyBand === "function") {
      const target = typeof aprovaProfileTargetAccuracy === "function"
        ? aprovaProfileTargetAccuracy()
        : (typeof APROVA_DEFAULT_TARGET_ACCURACY !== "undefined" ? APROVA_DEFAULT_TARGET_ACCURACY : 75);
      const band = aprovaThemeAccuracyBand(tema, target);
      const weights = typeof aprovaThemeBandWeights === "function"
        ? aprovaThemeBandWeights(band.band)
        : null;
      mult = weights && weights.srsMult ? weights.srsMult : 1;
    } else {
      mult = 1;
    }
  }

  if (knewIt && mult !== 1) {
    intervalDays = Math.max(3, Math.round(intervalDays * mult));
    intervalDays = Math.min(intervalDays, mult > 1 ? 60 : 45);
  }

  map[cardId] = {
    due: now + intervalDays * APROVA_DAY_MS,
    last: now,
    ease: knewIt ? "easy" : "hard",
    intervalDays
  };
  aprovaSaveSrs(map);
  aprovaLogStudyActivity(1, now);
  return map[cardId];
}

function aprovaStartOfLocalDay (now = Date.now()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function aprovaDueCount (cardIds) {
  const now = Date.now();
  let due = 0;
  let newCards = 0;
  cardIds.forEach(id => {
    const status = aprovaCardStatus(id, now);
    if (status === "new") newCards += 1;
    else if (status === "due") due += 1;
  });
  return { due, newCards, total: cardIds.length, pending: due + newCards };
}

/** Resumo do SRS: fila + o que já foi estudado (hoje e na agenda). */
function aprovaSrsProgressSummary (cardIds, now = Date.now()) {
  const map = aprovaLoadSrs();
  const dayStart = aprovaStartOfLocalDay(now);
  let due = 0;
  let newCards = 0;
  let scheduled = 0;
  let studiedToday = 0;
  let easyToday = 0;
  let hardToday = 0;
  let reviewedTotal = 0;

  (cardIds || []).forEach(id => {
    const status = aprovaCardStatus(id, now);
    if (status === "new") newCards += 1;
    else if (status === "due") due += 1;
    else scheduled += 1;

    const entry = map[id];
    if (!entry || typeof entry.last !== "number") return;
    reviewedTotal += 1;
    if (entry.last >= dayStart) {
      studiedToday += 1;
      if (entry.ease === "easy") easyToday += 1;
      else hardToday += 1;
    }
  });

  return {
    due,
    newCards,
    scheduled,
    studiedToday,
    easyToday,
    hardToday,
    reviewedTotal,
    total: (cardIds || []).length,
    pending: due + newCards
  };
}

function aprovaTodaySummary (cardIds, questionCount) {
  const s = aprovaSrsProgressSummary(cardIds);
  const { due, newCards, total, pending, studiedToday, scheduled } = s;
  let prompt;
  if (studiedToday) {
    prompt = studiedToday === 1
      ? "1 card estudado hoje."
      : studiedToday + " cards estudados hoje.";
    if (pending) {
      prompt += " Ainda " + pending + " na fila (" + due + " revisão · " + newCards +
        " novo" + (newCards === 1 ? "" : "s") + ").";
    } else {
      prompt += " Fila de hoje em dia.";
    }
  } else if (pending) {
    prompt = pending + " card(s) na fila de hoje (" + due + " revisão · " + newCards +
      " novo" + (newCards === 1 ? "" : "s") + ").";
  } else {
    prompt = "Fila de hoje vazia — volte amanhã ou treine questões.";
  }

  return {
    pending,
    studiedToday,
    scheduled,
    prompt,
    stats: [
      total + " cards no deck",
      scheduled
        ? scheduled + " na agenda (próximas revisões)"
        : "nenhum ainda na agenda",
      studiedToday
        ? studiedToday + " estudado" + (studiedToday === 1 ? "" : "s") + " hoje"
        : (pending ? pending + " pendente" + (pending === 1 ? "" : "s") : "agenda em dia"),
      questionCount + " questões amostra"
    ]
  };
}

/* ——— Revisões de questões por tema (questões similares, nunca as mesmas) ——— */

const APROVA_Q_SRS_KEY = "medhub-aprova-q-srs-v1";

function aprovaLoadQSrs () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_Q_SRS_KEY) || "{}");
  } catch {
    return {};
  }
}

function aprovaSaveQSrs (data) {
  localStorage.setItem(APROVA_Q_SRS_KEY, JSON.stringify(data || {}));
}

function aprovaQSrsThemeKey (theme, specialty) {
  const t = String(theme || "").trim().toLowerCase();
  const s = String(specialty || "").trim().toLowerCase();
  return s + "|" + t;
}

/** Mesmos intervalos dos flashcards: errou 3 · acertou 7 → 14 → 28… */
function aprovaScheduleThemeReview (theme, specialty, knewIt, questionId) {
  const tema = String(theme || "").trim();
  if (!tema) return null;
  const key = aprovaQSrsThemeKey(tema, specialty);
  const map = aprovaLoadQSrs();
  const now = Date.now();
  const prev = map[key];
  let intervalDays;
  if (!knewIt) {
    intervalDays = 3;
  } else if (prev && prev.intervalDays >= 7) {
    intervalDays = Math.min(prev.intervalDays * 2, 60);
  } else {
    intervalDays = 7;
  }

  const seedIds = Array.isArray(prev?.seedIds) ? prev.seedIds.slice() : [];
  const qid = String(questionId || "").trim();
  if (qid) {
    seedIds.unshift(qid);
  }
  const uniq = [];
  const seen = Object.create(null);
  seedIds.forEach((id) => {
    const s = String(id || "");
    if (!s || seen[s]) return;
    seen[s] = true;
    uniq.push(s);
  });

  map[key] = {
    theme: tema,
    specialty: String(specialty || "").trim(),
    due: now + intervalDays * APROVA_DAY_MS,
    last: now,
    ease: knewIt ? "easy" : "hard",
    intervalDays,
    seedIds: uniq.slice(0, 60)
  };
  aprovaSaveQSrs(map);
  return map[key];
}

function aprovaQSrsDueList (now = Date.now()) {
  const map = aprovaLoadQSrs();
  return Object.keys(map)
    .map((k) => map[k])
    .filter((row) => row && row.theme && typeof row.due === "number" && row.due <= now)
    .sort((a, b) => a.due - b.due);
}

function aprovaQSrsUpcoming (now = Date.now(), days = 14) {
  const map = aprovaLoadQSrs();
  const until = now + Math.max(1, days | 0) * APROVA_DAY_MS;
  return Object.keys(map)
    .map((k) => map[k])
    .filter((row) => row && row.theme && typeof row.due === "number" && row.due > now && row.due <= until)
    .sort((a, b) => a.due - b.due);
}

/**
 * Questões semelhantes ao tema (mesmo assunto), excluindo as IDs já feitas que geraram a revisão.
 */
function aprovaBuildSimilarQuestionPool (theme, specialty, seedIds, n) {
  const want = Math.max(1, Math.min(40, n | 0 || 10));
  if (typeof aprovaQPoolForTema !== "function") return [];
  const pool = aprovaQPoolForTema(specialty, theme);
  const exclude = Object.create(null);
  (Array.isArray(seedIds) ? seedIds : []).forEach((id) => {
    const s = String(id || "");
    if (s) exclude[s] = true;
  });

  let candidates = pool.filter((q) => q && q.id && !exclude[String(q.id)]);
  if (!candidates.length && specialty) {
    // Fallback: mesmo specialty, outros temas — ainda sem as IDs iguais
    if (typeof AprovaQuestions !== "undefined" && AprovaQuestions.catalog) {
      candidates = AprovaQuestions.catalog.filter((q) =>
        q && q.id && !exclude[String(q.id)] && q.specialty === specialty
      );
    }
  }

  const hist = typeof aprovaLoadQuestionHistory === "function"
    ? aprovaLoadQuestionHistory()
    : { byId: {} };

  candidates = candidates.slice().sort((a, b) => {
    const aa = hist.byId[a.id]?.attempted | 0;
    const ba = hist.byId[b.id]?.attempted | 0;
    if (aa !== ba) return aa - ba;
    return Math.random() - 0.5;
  });

  if (typeof aprovaShuffleArray === "function") {
    const fresh = candidates.filter((q) => !(hist.byId[q.id]?.attempted));
    const rest = candidates.filter((q) => hist.byId[q.id]?.attempted);
    return aprovaShuffleArray(fresh).concat(aprovaShuffleArray(rest)).slice(0, want);
  }
  return candidates.slice(0, want);
}
