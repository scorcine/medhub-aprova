/* Revisão programada (SRS simples) — progresso no localStorage */

const APROVA_SRS_KEY = 'medhub-aprova-srs-v1';

function aprovaLoadSrs () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_SRS_KEY) || '{}');
  } catch {
    return {};
  }
}

function aprovaSaveSrs (data) {
  localStorage.setItem(APROVA_SRS_KEY, JSON.stringify(data));
}

function aprovaScheduleCard (cardId, knewIt) {
  const map = aprovaLoadSrs();
  const now = Date.now();
  const days = knewIt ? 3 : 1;
  map[cardId] = {
    due: now + days * 24 * 60 * 60 * 1000,
    last: now,
    ease: knewIt ? 'easy' : 'hard'
  };
  aprovaSaveSrs(map);
  return map[cardId];
}

function aprovaDueCount (cardIds) {
  const map = aprovaLoadSrs();
  const now = Date.now();
  let due = 0;
  let newCards = 0;
  cardIds.forEach(id => {
    const entry = map[id];
    if (!entry) newCards += 1;
    else if (entry.due <= now) due += 1;
  });
  return { due, newCards, total: cardIds.length };
}

function aprovaTodaySummary (cardIds, questionCount) {
  const { due, newCards, total } = aprovaDueCount(cardIds);
  const pending = due + newCards;
  return {
    prompt: pending
      ? `${pending} item(ns) na fila de hoje (${due} revisão · ${newCards} novos).`
      : 'Nada pendente na agenda — revise questões ou avance nos cards.',
    stats: [
      `${total} cards no deck amostra`,
      `${questionCount} questões amostra`,
      `${due} para revisar`
    ]
  };
}
