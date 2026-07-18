/* Estatísticas de provas — persistidas no localStorage */

const APROVA_EXAM_STATS_KEY = "medhub-aprova-exam-stats-v1";

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

function aprovaRecordExamAnswer (theme, ok) {
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
  return stats;
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
