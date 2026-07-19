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

/**
 * Temas priorizados entre áreas.
 * @param {object} focusPack
 * @param {number} maxTotal
 * @param {{ perArea?: number }} [opts] quantos temas garantir por área antes de completar
 */
function aprovaCollectCrossAreaThemes (focusPack, maxTotal, opts) {
  const limit = maxTotal || 10;
  const perArea = Math.max(1, (opts && opts.perArea) || 2);
  if (!focusPack || !focusPack.ok || !Array.isArray(focusPack.areas)) return [];

  const norm = typeof aprovaFocusNormKey === "function"
    ? aprovaFocusNormKey
    : s => String(s || "").toLowerCase();
  const picked = [];
  const seen = Object.create(null);

  const pushTheme = (area, t, rankInArea) => {
    const tema = String(t && t.tema || "").trim();
    if (!tema) return false;
    const key = (area.id || "") + "::" + norm(tema);
    if (seen[key]) return false;
    seen[key] = true;
    picked.push({
      tema,
      pct: Number(t.pct) || 0,
      areaId: area.id,
      areaLabel: area.label || area.id,
      rankInArea: rankInArea
    });
    return true;
  };

  for (let depth = 0; depth < perArea; depth++) {
    focusPack.areas.forEach(area => {
      if (picked.length >= limit) return;
      const list = area.themes || area.focus || [];
      if (list[depth]) pushTheme(area, list[depth], depth);
    });
  }

  const pool = [];
  focusPack.areas.forEach(area => {
    const list = area.themes || area.focus || [];
    list.forEach((t, i) => {
      const tema = String(t && t.tema || "").trim();
      if (!tema) return;
      const key = (area.id || "") + "::" + norm(tema);
      if (seen[key]) return;
      pool.push({ area, t, i, pct: Number(t.pct) || 0 });
    });
  });
  pool.sort((a, b) => b.pct - a.pct || a.i - b.i);
  for (let i = 0; i < pool.length && picked.length < limit; i++) {
    pushTheme(pool[i].area, pool[i].t, pool[i].i);
  }

  picked.sort((a, b) => b.pct - a.pct || a.rankInArea - b.rankInArea);
  return picked.slice(0, limit);
}

/**
 * Mapa completo até a prova: todos os temas das estatísticas, por área.
 * A prova pode cobrar qualquer coisa — isto é a cobertura sugerida (alto → base).
 */
function aprovaBuildCurriculumMap (focusPack, untilExamCards) {
  if (!focusPack || !focusPack.ok || !Array.isArray(focusPack.areas)) {
    return { ok: false, areas: [], flat: [], totalThemes: 0 };
  }

  const totalBudget = untilExamCards != null && untilExamCards > 0
    ? untilExamCards
    : 0;
  const flat = [];

  const areas = focusPack.areas.map(area => {
    const list = area.themes || area.focus || [];
    const themes = list.map((t, i) => {
      const tema = String(t.tema || "").trim();
      const pct = Number(t.pct) || 0;
      let tier = "base";
      let tierLabel = "Cobertura";
      if (i < 3) {
        tier = "alta";
        tierLabel = "Prioridade alta";
      } else if (i < 7) {
        tier = "media";
        tierLabel = "Importante";
      }
      const row = {
        tema,
        pct,
        areaId: area.id,
        areaLabel: area.label || area.id,
        rankInArea: i,
        tier,
        tierLabel,
        cardsUntil: 0
      };
      flat.push(row);
      return row;
    }).filter(t => t.tema);
    return {
      id: area.id,
      label: area.label || area.id,
      themes
    };
  });

  if (totalBudget > 0 && flat.length) {
    const distributed = aprovaDistributeThemeCards(flat, totalBudget);
    const byKey = Object.create(null);
    distributed.forEach(d => {
      byKey[(d.areaId || "") + "::" + d.tema] = d.cards;
    });
    flat.forEach(t => {
      t.cardsUntil = byKey[(t.areaId || "") + "::" + t.tema] || 0;
    });
    areas.forEach(area => {
      area.themes.forEach(t => {
        t.cardsUntil = byKey[(t.areaId || "") + "::" + t.tema] || 0;
      });
    });
  }

  return {
    ok: true,
    areas,
    flat,
    totalThemes: flat.length,
    untilExamCards: totalBudget || null,
    note: "A residência pode cobrar qualquer tema. Este mapa cobre o que mais cai nas suas provas — do essencial ao restante da estatística. Outros subtemas ficam em Flashcards."
  };
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

/**
 * @param {object} quota
 * @param {{ daily: object[], weekly: object[], monthly: object[] }} themeSets
 */
function aprovaBuildPeriodTasks (quota, themeSets, now = Date.now()) {
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

  const dailyThemes = (themeSets && themeSets.daily) || [];
  const weeklyThemes = (themeSets && themeSets.weekly) || dailyThemes;
  const monthlyThemes = (themeSets && themeSets.monthly) || weeklyThemes;

  const periods = [
    {
      id: "daily",
      label: "Meta diária",
      window: "Hoje",
      goal: quota.daily,
      done: dayDone,
      detail: quota.splitLine,
      themesLabel: "Foco de hoje (alto rendimento)",
      themesHint: "Não é tudo que cai — é o que mais rende neste dia.",
      themeCards: aprovaDistributeThemeCards(dailyThemes, quota.daily),
      newCards: quota.dailyNew,
      reviewCards: quota.dailyReview,
      cta: "Cumprir agora",
      showThemes: true,
      credit: "today"
    },
    {
      id: "weekly",
      label: "Meta semanal",
      window: "Últimos 7 dias",
      goal: quota.weekly,
      done: sum(weekFrom, todayIso),
      detail: quota.weekLine,
      themesLabel: "Ampliação da semana",
      themesHint: "Inclui mais temas que o dia — ainda priorizando o que mais cai.",
      themeCards: aprovaDistributeThemeCards(weeklyThemes, quota.weekly),
      newCards: quota.dailyNew * 7,
      reviewCards: quota.dailyReview * 7,
      cta: "Estudar temas",
      showThemes: true,
      credit: "today"
    },
    {
      id: "biweekly",
      label: "Meta quinzenal",
      window: "Últimos 14 dias",
      goal: quota.biweekly,
      done: sum(biFrom, todayIso),
      detail: "~" + quota.daily + " cards/dia em média na quinzena",
      themesLabel: "",
      themesHint: "Meta de volume. A cobertura completa dos temas está no mapa até a prova.",
      themeCards: [],
      newCards: quota.dailyNew * 14,
      reviewCards: quota.dailyReview * 14,
      cta: "Estudar temas",
      showThemes: false,
      credit: "today"
    },
    {
      id: "monthly",
      label: "Meta mensal",
      window: "Últimos 30 dias",
      goal: quota.monthly,
      done: sum(monthFrom, todayIso),
      detail: "Volume do mês + cobertura ampliada (não é só o foco diário × 30)",
      themesLabel: "Cobertura do mês",
      themesHint: "Temas além do diário. O restante da Pediatria, Cirurgia etc. está no mapa até a prova.",
      themeCards: aprovaDistributeThemeCards(monthlyThemes, quota.monthly),
      newCards: quota.dailyNew * 30,
      reviewCards: quota.dailyReview * 30,
      cta: "Estudar temas",
      showThemes: true,
      credit: "today"
    }
  ];

  const tomorrowIso = aprovaIsoOffset(1, now);
  const tomorrowDone = typeof aprovaActivityOnDay === "function"
    ? aprovaActivityOnDay(tomorrowIso)
    : 0;
  const todayComplete = dayDone >= quota.daily;

  // Só aparece depois de cumprir hoje (ou se já houver adiantamento)
  if (todayComplete || tomorrowDone > 0) {
    const stT = aprovaTaskStatus(tomorrowDone, quota.daily);
    periods.splice(1, 0, {
      id: "tomorrow",
      label: "Meta de amanhã",
      window: "Adiantamento",
      goal: quota.daily,
      done: tomorrowDone,
      detail: todayComplete
        ? ("Adiante até " + quota.daily + " cards — contam para amanhã")
        : "Continue o adiantamento de amanhã",
      themesLabel: "Foco de amanhã (mesmo ritmo)",
      themesHint: "Cada card estudado aqui entra na meta de amanhã, não na de hoje.",
      themeCards: aprovaDistributeThemeCards(dailyThemes, quota.daily),
      newCards: quota.dailyNew,
      reviewCards: quota.dailyReview,
      cta: stT.status === "done" ? "Estudar mais" : "Adiantar agora",
      showThemes: true,
      credit: "tomorrow",
      status: stT.status,
      pct: stT.pct,
      feedback: stT.status === "done"
        ? "Meta de amanhã já adiantada. Bom ritmo."
        : (tomorrowDone > 0
          ? ("Adiantados " + tomorrowDone + "/" + quota.daily + " para amanhã.")
          : "Meta de hoje ok — você pode adiantar a de amanhã.")
    });
  }

  return periods.map(p => {
    if (p.status && p.pct != null && p.feedback) return p;
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

  const fallbackThemes = (plan.themes || []).map(t => ({
    tema: t.tema,
    pct: t.pct,
    areaLabel: plan.areaLabel || "",
    areaId: plan.areaId || ""
  }));

  const dailyThemes = aprovaCollectCrossAreaThemes(focusPack, 8, { perArea: 1 });
  const weeklyThemes = aprovaCollectCrossAreaThemes(focusPack, 14, { perArea: 2 });
  const monthlyThemes = aprovaCollectCrossAreaThemes(focusPack, 22, { perArea: 3 });

  const themeSets = {
    daily: dailyThemes.length ? dailyThemes : fallbackThemes.slice(0, 8),
    weekly: weeklyThemes.length ? weeklyThemes : fallbackThemes.slice(0, 14),
    monthly: monthlyThemes.length ? monthlyThemes : fallbackThemes
  };

  const untilExam = (daysLeft != null && daysLeft > 0)
    ? quota.daily * daysLeft
    : null;

  const curriculum = aprovaBuildCurriculumMap(focusPack, untilExam);

  const themeProgram = aprovaThemeReviewProgram(
    themeSets.weekly,
    daysLeft,
    plan.weeks
  );
  const tasks = aprovaBuildPeriodTasks(quota, themeSets, now);

  const dailyTask = tasks.find(t => t.id === "daily");

  return {
    quota,
    tasks,
    themeProgram,
    themesForGoals: themeSets.daily,
    themeSets,
    curriculum,
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
      quota.reviewPct + "% revisão. As metas priorizam o que mais cai; o mapa abaixo cobre o restante até a prova."
  };
}
