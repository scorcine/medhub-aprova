/* Metas de estudo — diária / semanal / quinzenal / mensal + temas */

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

  let dailyReview = 0;
  let dailyNew = daily;

  if (due > 0) {
    // Só conta "revisões" quando há cards vencidos na fila SRS
    dailyReview = aprovaClampInt(daily * (reviewPct / 100), 1, daily);
    if (due > dailyReview) dailyReview = Math.min(due, daily);
    dailyNew = Math.max(0, daily - dailyReview);
    if (newCards === 0) {
      dailyReview = daily;
      dailyNew = 0;
    }
  } else if (newCards === 0) {
    dailyReview = 0;
    dailyNew = daily;
  }

  const weekly = daily * 7;
  const biweekly = daily * 14;
  const monthly = daily * 30;

  const splitLine = dailyReview > 0
    ? ("meta " + dailyNew + " novos · " + dailyReview + " revisões na fila")
    : ("meta " + dailyNew + " cards novos · sem revisões vencidas hoje");

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
    splitLine,
    weekLine: weekly + " cards/semana (~" + daily + "/dia)",
    how: due > 0
      ? "Faça primeiro as revisões vencidas do SRS; o restante abre cards novos nos temas abaixo."
      : "Toque em um tema abaixo para estudar. Revisões aparecem quando houver cards vencidos no SRS."
  };
}

/** Temas prioritários de todas as áreas (não exige clicar em cada uma). */
function aprovaCollectCrossAreaThemes (focusPack, maxTotal) {
  const limit = maxTotal || 10;
  if (!focusPack || !focusPack.ok || !Array.isArray(focusPack.areas)) return [];

  const bag = [];
  focusPack.areas.forEach(area => {
    const list = area.focus || area.themes || [];
    list.slice(0, 3).forEach((t, i) => {
      const tema = String(t.tema || "").trim();
      if (!tema) return;
      bag.push({
        tema,
        pct: Number(t.pct) || 0,
        areaId: area.id,
        areaLabel: area.label || area.id,
        rankInArea: i
      });
    });
  });

  bag.sort((a, b) => b.pct - a.pct || a.rankInArea - b.rankInArea);
  return bag.slice(0, limit);
}

/** Distribui N cards entre temas pelo peso relativo (soma = total). */
function aprovaDistributeThemeCards (themes, totalCards) {
  const list = Array.isArray(themes) ? themes : [];
  const total = Math.max(0, totalCards | 0);
  if (!list.length || !total) return [];

  const weights = list.map(t => Math.max(0.5, Number(t.pct) || 1));
  const sumW = weights.reduce((a, b) => a + b, 0) || 1;

  const raw = weights.map(w => (w / sumW) * total);
  const floors = raw.map(x => Math.floor(x));
  let assigned = floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, frac: x - floors[i] }))
    .sort((a, b) => b.frac - a.frac);

  let left = total - assigned;
  const cards = floors.slice();
  let k = 0;
  while (left > 0 && order.length) {
    cards[order[k % order.length].i] += 1;
    left -= 1;
    k += 1;
  }

  // Garante pelo menos 1 nos primeiros temas se a meta for grande o bastante
  if (total >= list.length) {
    for (let i = 0; i < list.length; i++) {
      if (cards[i] < 1) {
        const donor = cards.indexOf(Math.max.apply(null, cards));
        if (donor >= 0 && cards[donor] > 1) {
          cards[donor] -= 1;
          cards[i] = 1;
        }
      }
    }
  }

  return list.map((t, i) => ({
    tema: t.tema,
    areaLabel: t.areaLabel || "",
    areaId: t.areaId || "",
    pct: t.pct,
    cards: cards[i] || 0
  })).filter(t => t.cards > 0);
}

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
      areaLabel: t.areaLabel || "",
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

function aprovaBuildPeriodTasks (quota, themes, now = Date.now()) {
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
      label: "Meta diária",
      window: "Hoje",
      goal: quota.daily,
      done: dayDone,
      detail: quota.splitLine,
      themeCards: aprovaDistributeThemeCards(themes, quota.daily),
      newCards: quota.dailyNew,
      reviewCards: quota.dailyReview,
      cta: "Cumprir agora"
    },
    {
      id: "weekly",
      label: "Meta semanal",
      window: "Últimos 7 dias",
      goal: quota.weekly,
      done: sum(weekFrom, todayIso),
      detail: quota.weekLine,
      themeCards: aprovaDistributeThemeCards(themes, quota.weekly),
      newCards: quota.dailyNew * 7,
      reviewCards: quota.dailyReview * 7,
      cta: "Estudar temas"
    },
    {
      id: "biweekly",
      label: "Meta quinzenal",
      window: "Últimos 14 dias",
      goal: quota.biweekly,
      done: sum(biFrom, todayIso),
      detail: "~" + quota.daily + " cards/dia em média na quinzena",
      themeCards: aprovaDistributeThemeCards(themes, quota.biweekly),
      newCards: quota.dailyNew * 14,
      reviewCards: quota.dailyReview * 14,
      cta: "Estudar temas"
    },
    {
      id: "monthly",
      label: "Meta mensal",
      window: "Últimos 30 dias",
      goal: quota.monthly,
      done: sum(monthFrom, todayIso),
      detail: "Volume acumulado para sustentar o ritmo até a prova",
      themeCards: aprovaDistributeThemeCards(themes, quota.monthly),
      newCards: quota.dailyNew * 30,
      reviewCards: quota.dailyReview * 30,
      cta: "Estudar temas"
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
 * @param {object|null} focusPack pacote do Seu foco (todas as áreas)
 */
function aprovaBuildStudyProgram (plan, cardIds, now = Date.now(), focusPack = null) {
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

  const crossThemes = aprovaCollectCrossAreaThemes(focusPack, 10);
  const themesForGoals = crossThemes.length
    ? crossThemes
    : (plan.themes || []).map(t => ({
      tema: t.tema,
      pct: t.pct,
      areaLabel: plan.areaLabel || "",
      areaId: plan.areaId || ""
    }));

  const themeProgram = aprovaThemeReviewProgram(
    themesForGoals,
    daysLeft,
    plan.weeks
  );
  const tasks = aprovaBuildPeriodTasks(quota, themesForGoals, now);

  const dailyTask = tasks.find(t => t.id === "daily");
  const untilExam = (daysLeft != null && daysLeft > 0)
    ? quota.daily * daysLeft
    : null;

  return {
    quota,
    tasks,
    themeProgram,
    themesForGoals,
    srs: {
      due: srs.due,
      newCards: srs.newCards,
      pending: srs.pending,
      studiedToday: srs.studiedToday,
      total: srs.total
    },
    untilExamCards: untilExam,
    summaryLine: dailyTask && dailyTask.status === "done"
      ? "Meta de hoje cumprida (" + dailyTask.done + "/" + dailyTask.goal + " flashcards)."
      : ("Hoje: " + (dailyTask ? dailyTask.done : 0) + "/" + quota.daily +
        " flashcards · " + quota.splitLine),
    divisionLine: "Nesta fase: " + quota.studyPct + "% conteúdo novo · " +
      quota.reviewPct + "% revisão · " + quota.how
  };
}
