/* Banco de questões — carrega data/questions-sample.json */

const AprovaQuestions = {
  items: [],
  index: 0,
  answered: false,
  correct: 0,
  attempted: 0,

  async load () {
    const res = await fetch("data/questions-sample.json");
    this.items = await res.json();
    this.index = 0;
    this.answered = false;
    return this.items;
  },

  current () {
    if (!this.items.length) return null;
    return this.items[this.index % this.items.length];
  },

  choose (choiceIndex) {
    const q = this.current();
    if (!q || this.answered) return null;
    this.answered = true;
    this.attempted += 1;
    const ok = choiceIndex === q.answer;
    if (ok) this.correct += 1;
    return { ok, explain: q.explain, answer: q.answer };
  },

  next () {
    this.index = (this.index + 1) % Math.max(this.items.length, 1);
    this.answered = false;
    return this.current();
  },

  statsText () {
    if (!this.attempted) return "Ainda sem respostas nesta sessão.";
    const pct = Math.round((this.correct / this.attempted) * 100);
    return this.correct + "/" + this.attempted + " acertos (" + pct + "%)";
  }
};
