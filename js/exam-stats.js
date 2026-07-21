/* Estatísticas de provas — persistidas no localStorage */

const APROVA_EXAM_STATS_KEY = "medhub-aprova-exam-stats-v1";
const APROVA_Q_HISTORY_KEY = "medhub-aprova-q-history-v1";

function aprovaDefaultExamStats () {
  return {
    attempted: 0,
    correct: 0,
    wrong: 0,
    byTheme: {},
    lastAt: null,
    streakCorrect: 0,
    bestStreak: 0
  };
}

function aprovaLoadExamStats () {
  try {
    const data = JSON.parse(localStorage.getItem(APROVA_EXAM_STATS_KEY) || "null");
    if (!data || typeof data !== "object") return aprovaDefaultExamStats();
    return Object.assign(aprovaDefaultExamStats(), data, {
      byTheme: data.byTheme && typeof data.byTheme === "object" ? data.byTheme : {}
    });
  } catch {
    return aprovaDefaultExamStats();
  }
}

function aprovaSaveExamStats (stats) {
  localStorage.setItem(APROVA_EXAM_STATS_KEY, JSON.stringify(stats));
}

function aprovaDefaultQuestionHistory () {
  return { byId: {} };
}

function aprovaLoadQuestionHistory () {
  try {
    const data = JSON.parse(localStorage.getItem(APROVA_Q_HISTORY_KEY) || "null");
    if (!data || typeof data !== "object") return aprovaDefaultQuestionHistory();
    return {
      byId: data.byId && typeof data.byId === "object" ? data.byId : {}
    };
  } catch {
    return aprovaDefaultQuestionHistory();
  }
}

function aprovaSaveQuestionHistory (hist) {
  localStorage.setItem(APROVA_Q_HISTORY_KEY, JSON.stringify(hist));
}

function aprovaRecordExamAnswer (theme, ok, questionId) {
  const stats = aprovaLoadExamStats();
  const key = theme || "Geral";

  stats.attempted += 1;
  if (ok) {
    stats.correct += 1;
    stats.streakCorrect += 1;
    if (stats.streakCorrect > stats.bestStreak) stats.bestStreak = stats.streakCorrect;
  } else {
    stats.wrong += 1;
    stats.streakCorrect = 0;
  }

  if (!stats.byTheme[key]) stats.byTheme[key] = { attempted: 0, correct: 0 };
  stats.byTheme[key].attempted += 1;
  if (ok) stats.byTheme[key].correct += 1;

  stats.lastAt = Date.now();
  aprovaSaveExamStats(stats);

  if (typeof aprovaLogQuestionActivity === "function") {
    aprovaLogQuestionActivity(1);
  }

  const id = String(questionId || "").trim();
  if (id) {
    const hist = aprovaLoadQuestionHistory();
    if (!hist.byId[id]) {
      hist.byId[id] = { attempted: 0, correct: 0, wrong: 0, lastOk: null, lastAt: null };
    }
    const row = hist.byId[id];
    row.attempted += 1;
    if (ok) row.correct += 1;
    else row.wrong += 1;
    row.lastOk = !!ok;
    row.lastAt = Date.now();
    aprovaSaveQuestionHistory(hist);
  }

  return stats;
}

/** Escopo: all | new | wrong */
function aprovaQuestionMatchesScope (questionId, scope) {
  const id = String(questionId || "").trim();
  if (!id || !scope || scope === "all") return true;
  const row = aprovaLoadQuestionHistory().byId[id];
  if (scope === "new") return !row || !row.attempted;
  if (scope === "wrong") return !!(row && (row.lastOk === false || (row.wrong > 0 && row.correct === 0)));
  return true;
}

function aprovaExamStatsSummary () {
  const stats = aprovaLoadExamStats();
  const pct = stats.attempted
    ? Math.round((stats.correct / stats.attempted) * 100)
    : 0;

  const themes = Object.keys(stats.byTheme).map(name => {
    const t = stats.byTheme[name];
    const tPct = t.attempted ? Math.round((t.correct / t.attempted) * 100) : 0;
    return { name, attempted: t.attempted, correct: t.correct, pct: tPct };
  }).sort((a, b) => b.attempted - a.attempted);

  return {
    attempted: stats.attempted,
    correct: stats.correct,
    wrong: stats.wrong,
    pct,
    streak: stats.streakCorrect,
    bestStreak: stats.bestStreak,
    lastAt: stats.lastAt,
    themes
  };
}

const APROVA_THEME_MIN_ATTEMPTS = 8;
const APROVA_THEME_NEAR_BAND = 8;

/**
 * Faixa do tema vs meta de acerto da prova.
 * hit = atingiu / near = perto / far = bem abaixo / cold = poucas tentativas
 */
function aprovaThemeAccuracyBand (tema, targetAccuracy, statsSummary) {
  const target = typeof aprovaNormalizeTargetAccuracy === "function"
    ? aprovaNormalizeTargetAccuracy(targetAccuracy)
    : Math.max(50, Math.min(95, Math.round(Number(targetAccuracy) || 70)));
  const summary = statsSummary || (typeof aprovaExamStatsSummary === "function"
    ? aprovaExamStatsSummary()
    : null);
  const norm = typeof aprovaFocusNormKey === "function"
    ? aprovaFocusNormKey
    : (s) => String(s || "").toLowerCase();
  const key = norm(tema);
  if (!key || !summary || !Array.isArray(summary.themes)) {
    return { band: "cold", pct: null, attempted: 0, target, gap: target };
  }

  let best = null;
  summary.themes.forEach((t) => {
    const n = norm(t.name);
    if (!n) return;
    let score = 0;
    if (n === key) score = 3;
    else if (n.indexOf(key) >= 0 || key.indexOf(n) >= 0) score = 2;
    else {
      const words = key.split(" ").filter((w) => w.length > 3);
      if (words.some((w) => n.indexOf(w) >= 0)) score = 1;
    }
    if (score && (!best || score > best.score || (score === best.score && t.attempted > best.attempted))) {
      best = { score, attempted: t.attempted, pct: t.pct };
    }
  });

  if (!best || best.attempted < APROVA_THEME_MIN_ATTEMPTS) {
    return {
      band: "cold",
      pct: best ? best.pct : null,
      attempted: best ? best.attempted : 0,
      target,
      gap: target
    };
  }

  const gap = target - best.pct;
  let band = "near";
  if (best.pct >= target) band = "hit";
  else if (gap > APROVA_THEME_NEAR_BAND) band = "far";

  return { band, pct: best.pct, attempted: best.attempted, target, gap };
}

/** Multiplicador de peso em questões / SRS conforme faixa. */
function aprovaThemeBandWeights (band) {
  if (band === "hit") return { qWeight: 0.55, srsMult: 1.65, label: "Meta atingida — espaçar" };
  if (band === "far") return { qWeight: 1.85, srsMult: 0.55, label: "Abaixo da meta — reforçar" };
  if (band === "cold") return { qWeight: 1.25, srsMult: 0.8, label: "Poucas tentativas — medir" };
  return { qWeight: 1, srsMult: 1, label: "Perto da meta" };
}

function aprovaWeakThemesVsTarget (targetAccuracy, limit, statsSummary) {
  const summary = statsSummary || aprovaExamStatsSummary();
  const target = typeof aprovaNormalizeTargetAccuracy === "function"
    ? aprovaNormalizeTargetAccuracy(targetAccuracy)
    : Math.max(50, Math.min(95, Math.round(Number(targetAccuracy) || 70)));
  const max = Math.max(1, limit | 0 || 5);
  const rows = (summary.themes || [])
    .filter((t) => t.attempted >= APROVA_THEME_MIN_ATTEMPTS && t.pct < target - 2)
    .map((t) => ({
      tema: t.name,
      pct: t.pct,
      attempted: t.attempted,
      gap: target - t.pct,
      band: t.pct < target - APROVA_THEME_NEAR_BAND ? "far" : "near"
    }))
    .sort((a, b) => b.gap - a.gap || b.attempted - a.attempted);
  return rows.slice(0, max);
}

/* Atividade diária de questões (metas) */
const APROVA_Q_ACTIVITY_KEY = "medhub-aprova-q-activity-v1";

function aprovaLoadQActivity () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_Q_ACTIVITY_KEY) || "{}");
  } catch {
    return {};
  }
}

function aprovaSaveQActivity (map) {
  localStorage.setItem(APROVA_Q_ACTIVITY_KEY, JSON.stringify(map || {}));
}

function aprovaLogQuestionActivity (count = 1, now = Date.now()) {
  const n = Math.max(1, count | 0);
  const map = aprovaLoadQActivity();
  const dayKey = typeof aprovaActivityDayKey === "function"
    ? aprovaActivityDayKey(now)
    : new Date(now).toISOString().slice(0, 10);
  map[dayKey] = (Number(map[dayKey]) || 0) + n;
  const keys = Object.keys(map).sort();
  while (keys.length > 420) delete map[keys.shift()];
  aprovaSaveQActivity(map);
  return map[dayKey];
}

function aprovaQActivityToday (now = Date.now()) {
  const map = aprovaLoadQActivity();
  const dayKey = typeof aprovaActivityDayKey === "function"
    ? aprovaActivityDayKey(now)
    : new Date(now).toISOString().slice(0, 10);
  return Number(map[dayKey]) || 0;
}

function aprovaQActivitySumRange (fromIso, toIso) {
  const map = aprovaLoadQActivity();
  const from = String(fromIso || "");
  const to = String(toIso || "");
  let total = 0;
  Object.keys(map).forEach((key) => {
    if (key >= from && key <= to) total += Number(map[key]) || 0;
  });
  return total;
}
