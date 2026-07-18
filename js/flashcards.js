/* Flashcards — fila de hoje = cards novos + vencidos (SRS) */

function aprovaDeckSpecialty (deck) {
  if (deck.specialty) return deck.specialty;
  const id = String(deck.id || "");
  if (
    id.indexOf("neo-") === 0 ||
    id.indexOf("ali-") === 0 ||
    id.indexOf("nut-") === 0 ||
    id.indexOf("imu-") === 0 ||
    id.indexOf("dm-") === 0
  ) {
    return "pediatria";
  }
  if (id.indexOf("cardio") === 0) return "clinica";
  return "geral";
}

const AprovaFlashcards = {
  decks: [],
  catalog: [],
  queue: [],
  index: 0,
  revealed: false,
  mode: "today",
  activeDeckId: null,
  activeSpecialty: null,

  async load () {
    const files = [
      "data/flashcards-sample.json",
      "data/flashcards-neonatologia.json",
      "data/flashcards-alimentacao.json",
      "data/flashcards-avaliacao-nutricional.json",
      "data/flashcards-imunizacoes.json",
      "data/flashcards-diabetes.json"
    ];
    const decks = [];
    for (const file of files) {
      try {
        const res = await fetch(file);
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach(deck => {
            deck.specialty = aprovaDeckSpecialty(deck);
            decks.push(deck);
          });
        }
      } catch {
        /* ignora arquivo ausente */
      }
    }
    this.decks = decks;
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
          deckId: deck.id,
          deckName: deck.name,
          specialty: deck.specialty || "geral",
          front: card.front,
          back: card.back
        });
      });
    });
  },

  allIds () {
    return this.catalog.map(c => c.id);
  },

  decksBySpecialty (specialty) {
    return this.decks.filter(d => (d.specialty || "geral") === specialty);
  },

  countBySpecialty (specialty) {
    return this.decksBySpecialty(specialty).reduce((n, d) => n + (d.cards || []).length, 0);
  },

  /** Monta a fila só com cards novos ou com due <= agora. Revisões primeiro. */
  rebuildTodayQueue () {
    this.mode = "today";
    this.activeDeckId = null;
    this.activeSpecialty = null;
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

  /** Estuda todos os cards de um deck (ordem do arquivo). */
  startDeck (deckId) {
    const cards = this.catalog.filter(c => c.deckId === deckId);
    this.mode = "deck";
    this.activeDeckId = deckId;
    this.activeSpecialty = cards[0] ? cards[0].specialty : null;
    this.queue = cards.slice();
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

    // Remove da fila; o próximo ocupa o mesmo índice
    this.queue.splice(this.index, 1);
    this.revealed = false;
    return this.current();
  }
};
