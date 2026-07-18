/* Flashcards — fila de hoje = cards novos + vencidos (SRS) */

function aprovaDeckSpecialty (deck) {
  if (deck.specialty) return deck.specialty;
  const id = String(deck.id || "");
  const pedPrefixes = [
    "neo-", "ali-", "nut-", "imu-", "dm-", "itu-", "exa-", "crd-", "urg-",
    "resp-", "gast-", "neu-", "nef-", "inf-", "hem-", "ort-", "end-",
    "cir-", "par-", "alg-", "soc-"
  ];
  if (pedPrefixes.some(p => id.indexOf(p) === 0)) return "pediatria";
  if (
    id.indexOf("gin1-") === 0 ||
    id.indexOf("gin2-") === 0 ||
    id.indexOf("gin3-") === 0 ||
    id.indexOf("gin4-") === 0 ||
    id.indexOf("gin5-") === 0 ||
    id.indexOf("gin6-") === 0 ||
    id.indexOf("obs1-") === 0 ||
    id.indexOf("obs2-") === 0 ||
    id.indexOf("obs3-") === 0 ||
    id.indexOf("obs4-") === 0 ||
    id.indexOf("obs5-") === 0 ||
    id.indexOf("obs-") === 0 ||
    id.indexOf("go-") === 0
  ) return "go";
  if (
    id.indexOf("cg-") === 0 ||
    id.indexOf("cir1-") === 0 ||
    id.indexOf("cir2-") === 0 ||
    id.indexOf("cir3-") === 0 ||
    id.indexOf("ciresp-") === 0 ||
    id.indexOf("crr-") === 0
  ) return "cirurgia";
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
      "data/flashcards-diabetes.json",
      "data/flashcards-ped6.json",
      "data/flashcards-r1-complementar.json",
      "data/flashcards-r1-lacunas.json",
      "data/flashcards-gin1.json",
      "data/flashcards-gin2.json",
      "data/flashcards-gin3.json",
      "data/flashcards-gin4.json",
      "data/flashcards-gin5.json",
      "data/flashcards-gin6.json",
      "data/flashcards-obs1.json",
      "data/flashcards-obs2.json",
      "data/flashcards-obs3.json",
      "data/flashcards-obs4.json",
      "data/flashcards-obs5.json",
      "data/flashcards-cir-lacunas.json",
      "data/flashcards-cir1.json",
      "data/flashcards-cir2.json",
      "data/flashcards-cir3.json",
      "data/flashcards-ciresp.json",
      "data/flashcards-cir-r1.json"
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

  /** Embaralha a fila (Fisher–Yates). */
  shuffleQueue (cards) {
    const arr = cards.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  },

  /** Estuda todos os cards de um deck (ordem aleatória). */
  startDeck (deckId) {
    return this.startDecks([deckId]);
  },

  /** Estuda um ou mais decks com cards embaralhados. */
  startDecks (deckIds) {
    const ids = (deckIds || []).filter(Boolean);
    const cards = [];
    ids.forEach(id => {
      this.catalog.filter(c => c.deckId === id).forEach(c => cards.push(c));
    });
    this.mode = "deck";
    this.activeDeckId = ids.length === 1 ? ids[0] : null;
    this.activeDeckIds = ids.slice();
    this.activeSpecialty = cards[0] ? cards[0].specialty : null;
    this.queue = this.shuffleQueue(cards);
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
