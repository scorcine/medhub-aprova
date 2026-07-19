/* Revisão programada (SRS simples) — progresso no localStorage */

const APROVA_SRS_KEY = "medhub-aprova-srs-v1";
const APROVA_DAY_MS = 24 * 60 * 60 * 1000;

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

function aprovaScheduleCard (cardId, knewIt) {
  const map = aprovaLoadSrs();
  const now = Date.now();
  const prev = map[cardId];
  let intervalDays;

  if (!knewIt) {
    intervalDays = 1;
  } else if (prev && prev.intervalDays >= 1) {
    intervalDays = Math.min(prev.intervalDays * 2, 30);
  } else {
    intervalDays = 3;
  }

  map[cardId] = {
    due: now + intervalDays * APROVA_DAY_MS,
    last: now,
    ease: knewIt ? "easy" : "hard",
    intervalDays
  };
  aprovaSaveSrs(map);
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
