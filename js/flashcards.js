/* Flashcards — fila de hoje = cards novos + vencidos (SRS) */

const AprovaFlashcards = {
  decks: [],
  catalog: [],
  queue: [],
  index: 0,
  revealed: false,

  async load () {
    const res = await fetch("data/flashcards-sample.json");
    this.decks = await res.json();
    this.rebuildCatalog();
    this.rebuildTodayQueue();
    return this.decks;
  },

  rebuildCatalog () {
    this.catalog = [];
    this.decks.forEach(deck => {
      (deck.cards || []).forEach((card, i) => {
        this.catalog.push({
          id: deck.id + "-" + i,
          deckName: deck.name,
          front: card.front,
          back: card.back
        });
      });
    });
  },

  allIds () {
    return this.catalog.map(c => c.id);
  },

  /** Monta a fila só com cards novos ou com due <= agora. Revisões primeiro. */
  rebuildTodayQueue () {
    const now = Date.now();
    const due = [];
    const neu = [];

    this.catalog.forEach(card => {
      const status = aprovaCardStatus(card.id, now);
      if (status === "due") due.push(card);
      else if (status === "new") neu.push(card);
    });

    this.queue = due.concat(neu);
    this.index = 0;
    this.revealed = false;
    return this.queue.length;
  },

  current () {
    if (!this.queue.length || this.index >= this.queue.length) return null;
    return this.queue[this.index];
  },

  remaining () {
    return Math.max(0, this.queue.length - this.index);
  },

  reveal () {
    this.revealed = true;
  },

  rate (knewIt) {
    const card = this.current();
    if (!card) return null;

    if (typeof aprovaScheduleCard === "function") {
      aprovaScheduleCard(card.id, knewIt);
    }

    // Remove da fila de hoje; o próximo ocupa o mesmo índice
    this.queue.splice(this.index, 1);
    this.revealed = false;
    return this.current();
  }
};
