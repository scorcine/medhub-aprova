/* Flashcards — carrega data/flashcards-sample.json */

const AprovaFlashcards = {
  decks: [],
  queue: [],
  index: 0,
  revealed: false,

  async load () {
    const res = await fetch("data/flashcards-sample.json");
    this.decks = await res.json();
    this.rebuildQueue();
    return this.decks;
  },

  rebuildQueue () {
    this.queue = [];
    this.decks.forEach(deck => {
      (deck.cards || []).forEach((card, i) => {
        this.queue.push({
          id: deck.id + "-" + i,
          deckName: deck.name,
          front: card.front,
          back: card.back
        });
      });
    });
    this.index = 0;
    this.revealed = false;
  },

  current () {
    if (!this.queue.length) return null;
    return this.queue[this.index % this.queue.length];
  },

  allIds () {
    return this.queue.map(c => c.id);
  },

  reveal () {
    this.revealed = true;
  },

  rate (knewIt) {
    const card = this.current();
    if (card && typeof aprovaScheduleCard === "function") {
      aprovaScheduleCard(card.id, knewIt);
    }
    this.index = (this.index + 1) % Math.max(this.queue.length, 1);
    this.revealed = false;
    return this.current();
  }
};
