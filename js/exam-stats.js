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

function aprovaRecordExamAnswer (theme, ok, questionId, meta) {
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

  if (typeof aprovaCreditMateriaProgress === "function") {
    aprovaCreditMateriaProgress(theme, meta && meta.specialty, meta && meta.group, ok);
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

/* Agenda de matéria do dia (plano travado + progresso / atraso) */
const APROVA_MATERIA_KEY = "medhub-aprova-materia-v1";

function aprovaMateriaThemeKey (specialty, tema) {
  const norm = typeof aprovaFocusNormKey === "function"
    ? aprovaFocusNormKey
    : (s) => String(s || "").toLowerCase().trim();
  return (specialty || "") + "::" + norm(tema);
}

function aprovaLoadMateriaAgenda () {
  try {
    const data = JSON.parse(localStorage.getItem(APROVA_MATERIA_KEY) || "null");
    if (!data || typeof data !== "object") return { days: {} };
    return { days: data.days && typeof data.days === "object" ? data.days : {} };
  } catch {
    return { days: {} };
  }
}

function aprovaSaveMateriaAgenda (agenda) {
  const days = (agenda && agenda.days) || {};
  const keys = Object.keys(days).sort();
  while (keys.length > 60) delete days[keys.shift()];
  localStorage.setItem(APROVA_MATERIA_KEY, JSON.stringify({ days }));
}

/**
 * Trava o plano do dia na 1ª visita (não troca no meio do dia).
 * Só marca opened=true no dia corrente — dias passados sem opened não geram atraso fantasma.
 */
function aprovaEnsureMateriaDay (iso, planned) {
  const day = String(iso || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const today = typeof aprovaActivityDayKey === "function"
    ? aprovaActivityDayKey()
    : new Date().toISOString().slice(0, 10);
  const agenda = aprovaLoadMateriaAgenda();
  const existing = agenda.days[day];

  if (existing && Array.isArray(existing.themes) && existing.themes.length) {
    if (day === today && !existing.opened) {
      existing.opened = true;
      aprovaSaveMateriaAgenda(agenda);
    }
    return existing;
  }

  // Não cria plano para dias passados (evita "atrasado" inventado)
  if (day < today) return null;

  const themes = (Array.isArray(planned) ? planned : []).map((t) => {
    const tema = String(t.tema || "").trim();
    const specialty = String(t.specialty || t.areaId || "");
    return {
      key: aprovaMateriaThemeKey(specialty, tema),
      tema,
      specialty,
      areaLabel: t.areaLabel || "",
      goal: Math.max(1, t.n | 0 || 5),
      done: 0,
      correct: 0
    };
  }).filter((t) => t.tema);

  agenda.days[day] = { themes, lockedAt: Date.now(), opened: day === today };
  aprovaSaveMateriaAgenda(agenda);
  return agenda.days[day];
}

function aprovaMateriaMatchScore (row, tema, specialty, group) {
  const norm = typeof aprovaFocusNormKey === "function"
    ? aprovaFocusNormKey
    : (s) => String(s || "").toLowerCase().trim();
  const rowKey = norm(row.tema);
  const tKey = norm(tema);
  const gKey = norm(group);
  if (!rowKey) return 0;
  let score = 0;
  if (specialty && row.specialty && specialty !== row.specialty) return 0;
  if (tKey && (tKey === rowKey || tKey.indexOf(rowKey) >= 0 || rowKey.indexOf(tKey) >= 0)) score = 3;
  else if (gKey && (gKey === rowKey || gKey.indexOf(rowKey) >= 0 || rowKey.indexOf(gKey) >= 0)) score = 2;
  else {
    const words = rowKey.split(" ").filter((w) => w.length > 3);
    const hay = (tKey + " " + gKey).trim();
    if (words.some((w) => hay.indexOf(w) >= 0)) score = 1;
  }
  return score;
}

/** Tema ativo da sessão vinda das metas — credita nele mesmo se o label do banco diferir. */
let aprovaMateriaCreditTarget = null;

function aprovaSetMateriaCreditTarget (target) {
  if (!target || !target.tema) {
    aprovaMateriaCreditTarget = null;
    return null;
  }
  aprovaMateriaCreditTarget = {
    tema: String(target.tema || "").trim(),
    specialty: String(target.specialty || "").trim()
  };
  return aprovaMateriaCreditTarget;
}

function aprovaClearMateriaCreditTarget () {
  aprovaMateriaCreditTarget = null;
}

function aprovaFindMateriaRow (agenda, day, tema, specialty) {
  const pack = agenda.days[day];
  if (!pack || !Array.isArray(pack.themes)) return null;
  const key = aprovaMateriaThemeKey(specialty, tema);
  let idx = pack.themes.findIndex((row) => row.key === key);
  if (idx < 0) {
    idx = pack.themes.findIndex((row) => aprovaMateriaMatchScore(row, tema, specialty, "") >= 2);
  }
  if (idx < 0) return null;
  return { day, idx, row: pack.themes[idx] };
}

/** Credita 1 questão na agenda (hoje primeiro; senão o atraso mais antigo do tema). */
function aprovaCreditMateriaProgress (tema, specialty, group, ok) {
  const agenda = aprovaLoadMateriaAgenda();
  const today = typeof aprovaActivityDayKey === "function"
    ? aprovaActivityDayKey()
    : new Date().toISOString().slice(0, 10);

  let best = null;

  if (aprovaMateriaCreditTarget) {
    const hit = aprovaFindMateriaRow(
      agenda,
      today,
      aprovaMateriaCreditTarget.tema,
      aprovaMateriaCreditTarget.specialty
    );
    if (hit && (hit.row.done | 0) < (hit.row.goal | 0)) {
      best = { day: hit.day, idx: hit.idx, rank: 9999 };
    }
  }

  if (!best) {
    const dayKeys = Object.keys(agenda.days).sort();
    const order = dayKeys.filter((d) => d === today)
      .concat(dayKeys.filter((d) => d < today));

    order.forEach((day) => {
      const pack = agenda.days[day];
      if (!pack || !Array.isArray(pack.themes)) return;
      pack.themes.forEach((row, idx) => {
        if ((row.done | 0) >= (row.goal | 0)) return;
        const score = aprovaMateriaMatchScore(row, tema, specialty, group);
        if (score <= 0) return;
        const rank = (day === today ? 1000 : 0) + score * 10;
        if (!best || rank > best.rank) {
          best = { day, idx, rank };
        }
      });
    });
  }

  if (!best) return null;
  const row = agenda.days[best.day].themes[best.idx];
  if (row.correct == null) row.correct = 0;
  row.done = Math.min(row.goal | 0, (row.done | 0) + 1);
  if (ok) row.correct = (row.correct | 0) + 1;
  aprovaSaveMateriaAgenda(agenda);
  return {
    day: best.day,
    tema: row.tema,
    done: row.done,
    goal: row.goal,
    correct: row.correct | 0,
    pct: row.done ? Math.round(((row.correct | 0) / row.done) * 100) : null
  };
}

function aprovaDaysBetweenIso (fromIso, toIso) {
  const a = String(fromIso || "").split("-").map(Number);
  const b = String(toIso || "").split("-").map(Number);
  if (a.length !== 3 || b.length !== 3) return 0;
  const ms = Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2]);
  return Math.max(0, Math.round(ms / 86400000));
}

/**
 * Quadro: matéria em dia (cumprida hoje) + atrasada (só dias que o aluno abriu e não fechou).
 */
function aprovaBuildMateriaBoard (now = Date.now(), opts) {
  const lookback = Math.max(1, (opts && opts.lookbackDays) || 14);
  const agenda = aprovaLoadMateriaAgenda();
  const today = typeof aprovaActivityDayKey === "function"
    ? aprovaActivityDayKey(now)
    : new Date(now).toISOString().slice(0, 10);

  // Limpa atrasos fantasmas (dias passados nunca abertos / sem progresso e sem flag opened)
  let pruned = false;
  Object.keys(agenda.days).forEach((day) => {
    if (day >= today) return;
    const pack = agenda.days[day];
    if (!pack) return;
    if (pack.opened) return;
    const anyDone = Array.isArray(pack.themes) && pack.themes.some((t) => (t.done | 0) > 0);
    if (!anyDone) {
      delete agenda.days[day];
      pruned = true;
    }
  });
  if (pruned) aprovaSaveMateriaAgenda(agenda);

  const onTrack = [];
  const pendingToday = [];
  const overdue = [];

  const todayPack = agenda.days[today];
  if (todayPack && Array.isArray(todayPack.themes)) {
    todayPack.themes.forEach((row) => {
      const done = row.done | 0;
      const goal = row.goal | 0;
      const correct = row.correct | 0;
      const status = done >= goal && goal > 0 ? "done" : (done > 0 ? "partial" : "todo");
      const item = {
        tema: row.tema,
        specialty: row.specialty || "",
        areaLabel: row.areaLabel || "",
        goal,
        done,
        correct,
        remaining: Math.max(0, goal - done),
        pct: done ? Math.round((correct / done) * 100) : null,
        status,
        day: today,
        daysLate: 0
      };
      if (status === "done") onTrack.push(item);
      else pendingToday.push(item);
    });
  }

  Object.keys(agenda.days).sort().forEach((day) => {
    if (day >= today) return;
    if (aprovaDaysBetweenIso(day, today) > lookback) return;
    const pack = agenda.days[day];
    if (!pack || !pack.opened || !Array.isArray(pack.themes)) return;
    const daysLate = aprovaDaysBetweenIso(day, today);
    pack.themes.forEach((row) => {
      if ((row.done | 0) >= (row.goal | 0)) return;
      overdue.push({
        tema: row.tema,
        specialty: row.specialty || "",
        areaLabel: row.areaLabel || "",
        goal: row.goal | 0,
        done: row.done | 0,
        remaining: Math.max(0, (row.goal | 0) - (row.done | 0)),
        day,
        daysLate
      });
    });
  });

  overdue.sort((a, b) => b.daysLate - a.daysLate || b.remaining - a.remaining);

  return {
    today,
    onTrack,
    pendingToday,
    overdue,
    overdueCount: overdue.length,
    onTrackCount: onTrack.length
  };
}

