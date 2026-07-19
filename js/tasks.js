/* Metas de estudo do plano — diária / semanal / quinzenal / mensal */

const APROVA_CARDS_PER_MIN = 1.4;

function aprovaIsoOffset (days, now = Date.now()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function aprovaClampInt (n, min, max) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Meta diária de flashcards a partir do horizonte + fila SRS.
 * Divisão: conteúdo novo vs revisão (pesos da fase atual).
 */
function aprovaPlanCardQuota (horizon, daysLeft, srs, currentPhase) {
  const studyPct = (currentPhase && currentPhase.studyPct != null)
    ? currentPhase.studyPct
    : (horizon.studyPct || 50);
  const reviewPct = (currentPhase && currentPhase.reviewPct != null)
    ? currentPhase.reviewPct
    : (horizon.reviewPct || 50);

  const midMin = ((horizon.dailyMin || 30) + (horizon.dailyMax || 55)) / 2;
  let daily = midMin / APROVA_CARDS_PER_MIN;

  if (daysLeft != null && daysLeft > 0 && daysLeft <= 21) daily *= 1.25;
  else if (daysLeft != null && daysLeft > 0 && daysLeft <= 60) daily *= 1.1;
  else if (daysLeft != null && daysLeft > 300) daily *= 0.9;

  daily = aprovaClampInt(daily, 15, 80);

  const due = (srs && srs.due) || 0;
  const newCards = (srs && srs.newCards) || 0;

  let dailyReview = aprovaClampInt(daily * (reviewPct / 100), 5, daily);
  // Prioriza o que já está vencido na fila
  if (due > dailyReview) {
    dailyReview = Math.min(due, daily);
  }
  let dailyNew = Math.max(0, daily - dailyReview);
  if (newCards === 0) {
    dailyReview = daily;
    dailyNew = 0;
  } else if (due === 0 && studyPct >= 50) {
    dailyNew = aprovaClampInt(daily * (studyPct / 100), 5, daily);
    dailyReview = Math.max(0, daily - dailyNew);
  }

  const weekly = daily * 7;
  const biweekly = daily * 14;
  const monthly = daily * 30;

  return {
    daily,
    dailyNew,
    dailyReview,
    weekly,
    biweekly,
    monthly,
    studyPct,
    reviewPct,
    minutesMin: horizon.dailyMin,
    minutesMax: horizon.dailyMax,
    splitLine: dailyNew + " novos · " + dailyReview + " revisões (meta do dia)",
    weekLine: weekly + " cards/semana (~" + daily + "/dia)",
    how: "Faça primeiro as revisões vencidas do SRS; o restante da meta do dia abre cards novos dos temas prioritários."
  };
}

/** Revisões espaçadas sugeridas por tema até a prova (pelo peso relativo). */
function aprovaThemeReviewProgram (themes, daysLeft, weeks) {
  const list = Array.isArray(themes) ? themes : [];
  const w = Math.max(1, weeks || 1);
  return list.map((t, i) => {
    let reviewsNeeded;
    if (i < 3) reviewsNeeded = daysLeft != null && daysLeft <= 60 ? 7 : 6;
    else if (i < 6) reviewsNeeded = 4;
    else reviewsNeeded = 3;

    const perWeek = Math.min(
      reviewsNeeded,
      Math.max(1, Math.ceil(reviewsNeeded / Math.min(w, reviewsNeeded * 2)))
    );

    return {
      tema: t.tema,
      pct: t.pct,
      reviewsNeeded,
      perWeek,
      hint: reviewsNeeded + " revisões até a prova · ~" + perWeek + "/semana"
    };
  });
}

function aprovaTaskStatus (done, goal) {
  const g = Math.max(1, goal | 0);
  const d = Math.max(0, done | 0);
  const pct = Math.min(100, Math.round((d / g) * 100));
  if (d >= g) {
    return {
      status: "done",
      pct: 100,
      feedback: "Meta cumprida. Bom ritmo — mantenha a cadência."
    };
  }
  if (d <= 0) {
    return {
      status: "pending",
      pct: 0,
      feedback: "Ainda não começou neste período."
    };
  }
  return {
    status: "partial",
    pct,
    feedback: "Faltam " + (g - d) + " card" + (g - d === 1 ? "" : "s") + " para fechar a meta."
  };
}

function aprovaBuildPeriodTasks (quota, now = Date.now()) {
  const todayIso = typeof aprovaActivityDayKey === "function"
    ? aprovaActivityDayKey(now)
    : aprovaIsoOffset(0, now);

  const dayDone = typeof aprovaActivityToday === "function"
    ? aprovaActivityToday(now)
    : 0;

  const weekFrom = aprovaIsoOffset(-6, now);
  const biFrom = aprovaIsoOffset(-13, now);
  const monthFrom = aprovaIsoOffset(-29, now);

  const sum = typeof aprovaActivitySumRange === "function"
    ? aprovaActivitySumRange
    : () => 0;

  const periods = [
    {
      id: "daily",
      label: "Tarefa diária",
      window: "Hoje",
      goal: quota.daily,
      done: dayDone,
      detail: quota.splitLine
    },
    {
      id: "weekly",
      label: "Tarefa semanal",
      window: "Últimos 7 dias",
      goal: quota.weekly,
      done: sum(weekFrom, todayIso),
      detail: quota.weekLine
    },
    {
      id: "biweekly",
      label: "Tarefa quinzenal",
      window: "Últimos 14 dias",
      goal: quota.biweekly,
      done: sum(biFrom, todayIso),
      detail: "~" + quota.daily + " cards/dia em média na quinzena"
    },
    {
      id: "monthly",
      label: "Tarefa mensal",
      window: "Últimos 30 dias",
      goal: quota.monthly,
      done: sum(monthFrom, todayIso),
      detail: "Volume acumulado para sustentar o plano até a prova"
    }
  ];

  return periods.map(p => {
    const st = aprovaTaskStatus(p.done, p.goal);
    return {
      ...p,
      status: st.status,
      pct: st.pct,
      feedback: st.feedback
    };
  });
}

/**
 * Programação completa ligada ao plano personalizado.
 * @param {object} plan resultado de aprovaBuildStudyPlan
 * @param {string[]} cardIds ids de flashcards
 */
function aprovaBuildStudyProgram (plan, cardIds, now = Date.now()) {
  if (!plan || !plan.ok) return null;

  const ids = cardIds || (typeof AprovaFlashcards !== "undefined" && AprovaFlashcards.allIds
    ? AprovaFlashcards.allIds()
    : []);
  const srs = typeof aprovaSrsProgressSummary === "function"
    ? aprovaSrsProgressSummary(ids, now)
    : { due: 0, newCards: 0, studiedToday: 0, pending: 0, total: ids.length };

  const daysLeft = plan.anchor && plan.anchor.days;
  const quota = aprovaPlanCardQuota(
    plan.horizon,
    daysLeft,
    srs,
    plan.currentPhase
  );
  const themeProgram = aprovaThemeReviewProgram(
    plan.themes,
    daysLeft,
    plan.weeks
  );
  const tasks = aprovaBuildPeriodTasks(quota, now);

  const dailyTask = tasks.find(t => t.id === "daily");
  const untilExam = (daysLeft != null && daysLeft > 0)
    ? quota.daily * daysLeft
    : null;

  return {
    quota,
    tasks,
    themeProgram,
    srs: {
      due: srs.due,
      newCards: srs.newCards,
      pending: srs.pending,
      studiedToday: srs.studiedToday,
      total: srs.total
    },
    untilExamCards: untilExam,
    summaryLine: dailyTask && dailyTask.status === "done"
      ? "Meta de hoje cumprida (" + dailyTask.done + "/" + dailyTask.goal + " cards)."
      : ("Hoje: " + (dailyTask ? dailyTask.done : 0) + "/" + quota.daily +
        " cards · " + quota.splitLine),
    divisionLine: "Nesta fase: " + quota.studyPct + "% conteúdo novo · " +
      quota.reviewPct + "% revisão · " + quota.how
  };
}
