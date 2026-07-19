/* Plano de estudo até a data da prova — fases por horizonte de tempo */

const APROVA_DAY_MS_PLAN = 24 * 60 * 60 * 1000;

function aprovaParseIsoDate (value) {
  const s = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function aprovaFormatDateBr (isoOrDate) {
  const dt = isoOrDate instanceof Date ? isoOrDate : aprovaParseIsoDate(isoOrDate);
  if (!dt) return "";
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function aprovaDaysUntil (iso, now = Date.now()) {
  const dt = aprovaParseIsoDate(iso);
  if (!dt) return null;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Math.ceil((dt.getTime() - start.getTime()) / APROVA_DAY_MS_PLAN);
}

function aprovaProfileHasExamDates (profile) {
  const filled = typeof aprovaProfileFilled === "function"
    ? aprovaProfileFilled(profile)
    : [];
  return filled.some(s => s && s.date && aprovaParseIsoDate(s.date));
}

/** Âncora do plano: 1ª prioridade com data, senão a data mais próxima. */
function aprovaPlanAnchor (profile, now = Date.now()) {
  const filled = typeof aprovaProfileFilled === "function"
    ? aprovaProfileFilled(profile)
    : [];
  const withDates = [];
  filled.forEach((slot, index) => {
    if (!slot || !slot.date) return;
    const days = aprovaDaysUntil(slot.date, now);
    if (days == null) return;
    withDates.push({
      rank: index,
      label: typeof aprovaPriorityLabel === "function" ? aprovaPriorityLabel(slot) : ("Prova " + (index + 1)),
      date: slot.date,
      days,
      kind: slot.kind,
      id: slot.id || null
    });
  });
  if (!withDates.length) return null;

  const primary = withDates.find(x => x.rank === 0 && x.days >= 0);
  if (primary) return primary;

  const upcoming = withDates.filter(x => x.days >= 0).sort((a, b) => a.days - b.days || a.rank - b.rank);
  if (upcoming.length) return upcoming[0];

  return withDates.sort((a, b) => b.days - a.days)[0];
}

/**
 * Horizonte → ritmo de estudo novo vs revisão e quantos temas priorizar.
 * Funciona para prova daqui a semanas ou só no ano que vem.
 */
function aprovaPlanHorizon (daysLeft) {
  if (daysLeft == null) return null;
  if (daysLeft < 0) {
    return {
      id: "passada",
      label: "Data já passou",
      tone: "Ajuste a data ou registre a próxima edição.",
      studyPct: 20,
      reviewPct: 80,
      themeCount: 3,
      dailyMin: 20,
      dailyMax: 40,
      pace: "leve"
    };
  }
  if (daysLeft <= 21) {
    return {
      id: "sprint",
      label: "Sprint final",
      tone: "Poucas semanas: foque no que mais cai e revise todo dia.",
      studyPct: 30,
      reviewPct: 70,
      themeCount: 3,
      dailyMin: 60,
      dailyMax: 100,
      pace: "alto"
    };
  }
  if (daysLeft <= 60) {
    return {
      id: "intensivo",
      label: "Intensivo",
      tone: "Janela curta: priorize temas de alto rendimento e mantenha a fila SRS em dia.",
      studyPct: 45,
      reviewPct: 55,
      themeCount: 5,
      dailyMin: 50,
      dailyMax: 80,
      pace: "alto"
    };
  }
  if (daysLeft <= 150) {
    return {
      id: "construcao",
      label: "Construção",
      tone: "Bom prazo: avance nos temas fortes e revise com cadência estável.",
      studyPct: 60,
      reviewPct: 40,
      themeCount: 7,
      dailyMin: 40,
      dailyMax: 70,
      pace: "medio"
    };
  }
  if (daysLeft <= 300) {
    return {
      id: "base",
      label: "Base sólida",
      tone: "Vários meses: cubra as áreas com calma e deixe a revisão programada trabalhar.",
      studyPct: 70,
      reviewPct: 30,
      themeCount: 8,
      dailyMin: 30,
      dailyMax: 55,
      pace: "sustentavel"
    };
  }
  return {
    id: "maratona",
    label: "Maratona (prova no horizonte longo)",
    tone: "Mesmo com prova só no ano que vem: ritmo leve e constante evita acúmulo no final.",
    studyPct: 75,
    reviewPct: 25,
    themeCount: 10,
    dailyMin: 20,
    dailyMax: 45,
    pace: "leve"
  };
}

/** Divide o tempo restante em fases de estudo → revisão. */
function aprovaPlanPhases (daysLeft, examDate) {
  const exam = aprovaParseIsoDate(examDate);
  if (!exam || daysLeft == null || daysLeft < 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function addDays (base, n) {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + n);
    return d;
  }

  function phase (id, label, startOffset, endOffset, studyPct, reviewPct, tip) {
    const start = addDays(today, Math.max(0, startOffset));
    const end = addDays(today, Math.min(daysLeft, endOffset));
    if (end < start) return null;
    return {
      id,
      label,
      startIso: start.toISOString().slice(0, 10),
      endIso: end.toISOString().slice(0, 10),
      startLabel: aprovaFormatDateBr(start),
      endLabel: aprovaFormatDateBr(end),
      studyPct,
      reviewPct,
      tip,
      current: today >= start && today <= end
    };
  }

  const phases = [];
  if (daysLeft > 300) {
    const a = Math.floor(daysLeft * 0.45);
    const b = Math.floor(daysLeft * 0.75);
    phases.push(phase("fundacao", "Fundação ampla", 0, a, 80, 20, "Gire as grandes áreas sem pressão de velocidade."));
    phases.push(phase("consolidacao", "Consolidação", a + 1, b, 60, 40, "Aprofunde o que mais cai nas suas bancas."));
    phases.push(phase("afinamento", "Afinamento + revisão", b + 1, daysLeft, 35, 65, "Feche lacunas e aumente a revisão SRS."));
  } else if (daysLeft > 150) {
    const mid = Math.floor(daysLeft * 0.55);
    phases.push(phase("cobertura", "Cobertura dirigida", 0, mid, 70, 30, "Priorize temas de alto peso nas suas provas."));
    phases.push(phase("revisao", "Revisão crescente", mid + 1, daysLeft, 40, 60, "Menos conteúdo novo, mais retenção."));
  } else if (daysLeft > 60) {
    const mid = Math.floor(daysLeft * 0.5);
    phases.push(phase("alta", "Alta rendimento", 0, mid, 55, 45, "Foque nos top temas e mantenha a fila do dia."));
    phases.push(phase("fechamento", "Fechamento", mid + 1, daysLeft, 30, 70, "Revise o que já viu; só abra tema novo se for crítico."));
  } else if (daysLeft > 21) {
    const mid = Math.floor(daysLeft * 0.4);
    phases.push(phase("corte", "Corte fino", 0, mid, 45, 55, "Só o que mais cai · revisão diária."));
    phases.push(phase("prova", "Modo prova", mid + 1, daysLeft, 25, 75, "SRS + questões · evite abrir frentes novas."));
  } else {
    phases.push(phase("final", "Retenção final", 0, daysLeft, 25, 75, "Revise os temas-chave todos os dias até a prova."));
  }

  return phases.filter(Boolean);
}

function aprovaPlanWeeksLeft (daysLeft) {
  if (daysLeft == null || daysLeft < 0) return 0;
  return Math.max(1, Math.ceil(daysLeft / 7));
}

/**
 * Monta o plano a partir do perfil + (opcional) pacote de foco já calculado.
 * @param {object} profile
 * @param {object|null} focusPack resultado de aprovaBuildPersonalizedFocus
 */
function aprovaBuildStudyPlan (profile, focusPack, now = Date.now()) {
  const anchor = aprovaPlanAnchor(profile, now);
  if (!anchor) {
    return {
      ok: false,
      reason: "Informe a data provável da sua prova principal para montarmos o plano até o dia D."
    };
  }

  const horizon = aprovaPlanHorizon(anchor.days);
  const phases = aprovaPlanPhases(anchor.days, anchor.date);
  const currentPhase = phases.find(p => p.current) || phases[0] || null;
  const weeks = aprovaPlanWeeksLeft(anchor.days);

  let themes = [];
  if (focusPack && focusPack.ok && Array.isArray(focusPack.areas) && focusPack.areas.length) {
    const area = focusPack.areas.find(a => a.id === "clinica") || focusPack.areas[0];
    themes = (area.themes || area.focus || []).slice(0, horizon.themeCount);
  }

  const filled = typeof aprovaProfileFilled === "function" ? aprovaProfileFilled(profile) : [];
  const dated = filled
    .map((slot, i) => {
      if (!slot || !slot.date) return null;
      const days = aprovaDaysUntil(slot.date, now);
      return {
        rank: i + 1,
        label: typeof aprovaPriorityLabel === "function" ? aprovaPriorityLabel(slot) : ("Prova " + (i + 1)),
        date: slot.date,
        dateLabel: aprovaFormatDateBr(slot.date),
        days
      };
    })
    .filter(Boolean);

  const daysLabel = anchor.days < 0
    ? ("passou há " + Math.abs(anchor.days) + " dia" + (Math.abs(anchor.days) === 1 ? "" : "s"))
    : (anchor.days === 0
      ? "é hoje"
      : (anchor.days + " dia" + (anchor.days === 1 ? "" : "s") + " · ~" + weeks + " semana" + (weeks === 1 ? "" : "s")));

  return {
    ok: true,
    anchor,
    horizon,
    phases,
    currentPhase,
    weeks,
    themes,
    dated,
    headline: anchor.label + " · " + aprovaFormatDateBr(anchor.date),
    daysLine: daysLabel,
    mixLine: horizon.studyPct + "% conteúdo novo · " + horizon.reviewPct + "% revisão",
    dailyLine: horizon.dailyMin + "–" + horizon.dailyMax + " min/dia (ritmo " + horizon.pace + ")"
  };
}
