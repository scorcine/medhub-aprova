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

function aprovaTodaySummary (cardIds, questionCount) {
  const { due, newCards, total, pending } = aprovaDueCount(cardIds);
  return {
    pending,
    prompt: pending
      ? `${pending} card(s) na fila de hoje (${due} revisão · ${newCards} novo${newCards === 1 ? "" : "s"}).`
      : "Fila de hoje vazia — volte amanhã ou treine questões.",
    stats: [
      `${total} cards no deck`,
      `${questionCount} questões amostra`,
      pending ? `${pending} pendente${pending === 1 ? "" : "s"}` : "agenda em dia"
    ]
  };
}
