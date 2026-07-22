/* Banco de questões — treino + simulado estilo residência */

const APROVA_QUESTION_FILES = [
  "data/questions-sample.json",
  "data/questions-clinica.json",
  "data/questions-cirurgia.json",
  "data/questions-pediatria.json",
  "data/questions-go.json",
  "data/questions-preventiva.json",
  "data/questions-sus-sp.json",
  "data/questions-enare.json",
  "data/questions-fmabc.json",
  "data/questions-einstein.json",
  "data/questions-revalida.json",
  "data/questions-santa-casa.json",
  "data/questions-unifesp.json",
  "data/questions-usp-sp.json",
  "data/questions-unitau.json",
  "data/questions-cirurgia-staging.json"
];

const APROVA_QUESTION_SPECIALTIES = [
  { id: "clinica", label: "Clínica médica" },
  { id: "cirurgia", label: "Cirurgia" },
  { id: "pediatria", label: "Pediatria" },
  { id: "go", label: "Ginecologia e obstetrícia" },
  { id: "preventiva", label: "Preventiva" }
];

const APROVA_QUESTION_CACHE_VER = "20260722cirstage6";
const APROVA_TREINO_SAVE_KEY = "medhub-aprova-treino-v1";
const APROVA_PROVAS_CATALOG_FILE = "data/provas/catalog.json";

function aprovaIsProvaPackGroupLabel (group) {
  const g = String(group || "").trim();
  return /^(SUS-SP|ENARE|ENAMED|USP-SP|USP|UNITAU|FMABC|Einstein|Revalida|Santa Casa|UNIFESP)\b/i.test(g) ||
    /^ENARE\s*\/\s*ENAMED\b/i.test(g) ||
    /^Einstein\s*\(HIAE\)\b/i.test(g) ||
    /^Santa Casa SP\b/i.test(g);
}

/** Espelha provas ready no treino só com grupo de banco (não "FMABC YYYY"). */
async function aprovaAppendProvasIntegraToBag (bag, seen) {
  try {
    const catUrl = APROVA_PROVAS_CATALOG_FILE + "?v=" + APROVA_QUESTION_CACHE_VER;
    const catRes = await fetch(catUrl);
    if (!catRes.ok) return;
    const catData = await catRes.json();
    const provas = Array.isArray(catData) ? catData : (catData.provas || []);
    for (const prova of provas) {
      if (!prova || prova.status !== "ready" || !prova.file || prova.areasReady !== true) continue;
      if (/^(sus-sp|enare|fmabc|einstein|revalida|santa-casa|unifesp|usp-sp|usp|unitau)/i.test(String(prova.exam || prova.id || ""))) continue;
      try {
        const url = String(prova.file) +
          (String(prova.file).indexOf("?") >= 0 ? "&" : "?") +
          "v=" + APROVA_QUESTION_CACHE_VER;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.questions) ? data.questions : []);
        const hint = String(prova.id || "prova");
        list.forEach((raw) => {
          const q = aprovaNormalizeQuestion(raw, hint);
          if (!q || seen[q.id]) return;
          if (q.annulled) return;
          if (aprovaIsProvaPackGroupLabel(q.group)) return;
          seen[q.id] = true;
          bag.push(q);
        });
      } catch (e) { /* pacote ausente */ }
    }
  } catch (e) { /* catálogo ausente */ }
}

function aprovaShuffleArray (arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Embaralha alternativas e recalcula o índice do gabarito (cópia rasa da questão). */
function aprovaShuffleQuestionChoices (q) {
  if (!q || !Array.isArray(q.choices) || q.choices.length < 2) return q;
  const order = q.choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  const choices = order.map((i) => q.choices[i]);
  const answer = order.indexOf(q.answer);
  return Object.assign({}, q, {
    choices,
    answer: answer >= 0 ? answer : 0
  });
}

function aprovaWithShuffledChoices (list) {
  return (list || []).map(aprovaShuffleQuestionChoices);
}

function aprovaNormalizeQuestion (raw, fileHint) {
  if (!raw || typeof raw !== "object") return null;
  const choices = Array.isArray(raw.choices)
    ? raw.choices
    : (Array.isArray(raw.alternatives) ? raw.alternatives : null);
  if (!choices || choices.length < 2) return null;

  const stem = String(raw.stem || raw.enunciado || "").trim();
  if (!stem) return null;

  let answer = Number(raw.answer);
  if (!Number.isFinite(answer) && typeof raw.gabarito === "string") {
    const letter = raw.gabarito.trim().toUpperCase();
    answer = letter.charCodeAt(0) - 65;
  }
  const annulled = !!(raw.annulled || raw.anulada || raw.annulledByBoard);
  if (!annulled && (!Number.isFinite(answer) || answer < 0 || answer >= choices.length)) return null;
  if (annulled && (!Number.isFinite(answer) || answer < 0 || answer >= choices.length)) {
    answer = 0;
  }

  const id = String(raw.id || "").trim() ||
    ((fileHint || "q") + "-" + Math.abs(aprovaHashString(stem)).toString(36));

  const specialty = String(raw.specialty || raw.area || "").trim().toLowerCase() || "clinica";
  const group = String(raw.group || raw.grupo || "").trim();
  const theme = String(raw.theme || raw.tema || "Geral").trim();
  const exam = String(raw.exam || raw.banca || "").trim().toLowerCase();
  const year = raw.year != null && raw.year !== ""
    ? Number(raw.year)
    : null;
  const difficulty = String(raw.difficulty || raw.dificuldade || "").trim().toLowerCase();
  const explain = String(raw.explain || raw.explanation || raw.comentario || "").trim();
  const trap = String(raw.trap || raw.pegadinha || "").trim();
  const images = [];
  const rawImgs = raw.images || raw.image || raw.imgs || raw.figura;
  if (Array.isArray(rawImgs)) {
    rawImgs.forEach((src) => {
      const s = String(src || "").trim();
      if (s) images.push(s);
    });
  } else if (rawImgs != null && String(rawImgs).trim()) {
    images.push(String(rawImgs).trim());
  }

  return {
    id,
    specialty,
    group: group || theme,
    theme,
    exam: exam || "",
    year: Number.isFinite(year) ? year : null,
    difficulty: difficulty || "",
    stem,
    images,
    choices: choices.map(c => String(c)),
    answer: answer | 0,
    annulled,
    explain,
    trap
  };
}

function aprovaHashString (s) {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

const AprovaQuestions = {
  catalog: [],
  queue: [],
  index: 0,
  answered: false,
  correct: 0,
  attempted: 0,
  mode: "treino", // treino | simulado
  filters: {
    specialty: "",
    group: "",
    theme: "",
    exam: "",
    year: ""
  },
  simulado: null, // { size, startedAt, finished, answers: [] }
  /** Sessão de teste (treino): respostas + metadados para Anterior e retomar. */
  session: null, // { scope, startedAt, answers: [] }

  async load () {
    const bag = [];
    const seen = Object.create(null);

    for (const file of APROVA_QUESTION_FILES) {
      try {
        const url = file + (file.indexOf("?") >= 0 ? "&" : "?") + "v=" + APROVA_QUESTION_CACHE_VER;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.questions) ? data.questions : []);
        const hint = file.replace(/^.*\//, "").replace(/\.json$/, "");
        list.forEach(raw => {
          const q = aprovaNormalizeQuestion(raw, hint);
          if (!q || seen[q.id]) return;
          seen[q.id] = true;
          bag.push(q);
        });
      } catch {
        /* arquivo ausente */
      }
    }

    await aprovaAppendProvasIntegraToBag(bag, seen);

    this.catalog = bag;
    const provaAtiva = this.mode === "simulado" && this.simulado && !this.simulado.finished && this.queue.length;
    if (!provaAtiva) {
      this.resetSession("treino");
      this.applyFilters(this.filters, { rebuild: true });
    }
    return this.catalog;
  },

  specialtyOptions () {
    const present = new Set(this.catalog.map(q => q.specialty));
    return APROVA_QUESTION_SPECIALTIES.filter(s => present.has(s.id));
  },

  groupOptions (specialty) {
    const set = new Set();
    this.catalog.forEach(q => {
      if (specialty && q.specialty !== specialty) return;
      if (q.group) set.add(q.group);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  },

  themeOptions (specialty, group) {
    const set = new Set();
    this.catalog.forEach(q => {
      if (specialty && q.specialty !== specialty) return;
      if (group && q.group !== group) return;
      if (q.theme) set.add(q.theme);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  },

  examOptions () {
    const set = new Set();
    this.catalog.forEach(q => {
      if (q.exam) set.add(q.exam);
    });
    const labels = typeof APROVA_TARGET_EXAMS !== "undefined" ? APROVA_TARGET_EXAMS : [];
    return Array.from(set).sort().map(id => {
      const hit = labels.find(e => e.id === id);
      return { id, label: hit ? hit.label : id };
    });
  },

  yearOptions () {
    const set = new Set();
    this.catalog.forEach(q => {
      if (q.year != null) set.add(q.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  },

  filteredCatalog (filters) {
    const f = filters || this.filters;
    return this.catalog.filter(q => {
      if (f.specialty && q.specialty !== f.specialty) return false;
      if (f.group && q.group !== f.group) return false;
      if (f.theme && q.theme !== f.theme) return false;
      if (f.exam && q.exam !== f.exam) return false;
      if (f.year !== "" && f.year != null) {
        const y = Number(f.year);
        if (Number.isFinite(y) && q.year !== y) return false;
      }
      return true;
    });
  },

  applyFilters (filters, opts) {
    this.filters = {
      specialty: (filters && filters.specialty) || "",
      group: (filters && filters.group) || "",
      theme: (filters && filters.theme) || "",
      exam: (filters && filters.exam) || "",
      year: filters && filters.year !== undefined && filters.year !== null
        ? String(filters.year)
        : ""
    };
    if (opts && opts.rebuild === false) return this.queue.length;

    const list = this.filteredCatalog(this.filters);
    if (this.mode === "simulado" && this.simulado && !this.simulado.finished) {
      return this.queue.length;
    }
    this.queue = aprovaWithShuffledChoices(list);
    this.index = 0;
    this.answered = false;
    return this.queue.length;
  },

  resetSession (mode) {
    this.mode = mode === "simulado" ? "simulado" : "treino";
    this.correct = 0;
    this.attempted = 0;
    this.answered = false;
    this.index = 0;
    this.simulado = null;
    this.session = null;
  },

  /** Inicia simulado com N questões (ordem e alternativas embaralhadas) do filtro atual. */
  startSimulado (size, poolOverride) {
    const pool = Array.isArray(poolOverride) ? poolOverride : this.filteredCatalog(this.filters);
    if (!pool.length) return 0;
    const n = Math.max(1, Math.min(pool.length, size | 0 || 10));
    this.clearSavedTreino();
    this.resetSession("simulado");
    this.queue = aprovaWithShuffledChoices(aprovaShuffleArray(pool).slice(0, n));
    this.simulado = {
      size: this.queue.length,
      startedAt: Date.now(),
      finished: false,
      answers: []
    };
    this.index = 0;
    this.answered = false;
    return this.queue.length;
  },

  /** Prova na íntegra: ordem preservada; só embaralha alternativas. */
  startProvaIntegra (list, meta) {
    const info = meta || {};
    const pool = [];
    (list || []).forEach((raw) => {
      const q = aprovaNormalizeQuestion(raw, info.id || "prova");
      if (q) pool.push(q);
    });
    if (!pool.length) return 0;
    this.clearSavedTreino();
    this.resetSession("simulado");
    this.queue = aprovaWithShuffledChoices(pool);
    this.simulado = {
      size: this.queue.length,
      startedAt: Date.now(),
      finished: false,
      answers: [],
      provaId: String(info.id || ""),
      provaTitle: String(info.title || "Prova na íntegra"),
      exam: String(info.exam || ""),
      year: info.year != null ? Number(info.year) : null
    };
    this.index = 0;
    this.answered = false;
    return this.queue.length;
  },

  /**
   * Continua um bloco: questões já feitas vêm anotadas; as novas ainda sem resposta.
   * priorRows: [{ q, entry: { id, choice, correct, ok } }]
   */
  startTreinoContinuing (priorRows, newPool, scope) {
    this.clearSavedTreino();
    this.resetSession("treino");

    const queue = [];
    const answers = [];
    (Array.isArray(priorRows) ? priorRows : []).forEach((row) => {
      if (!row || !row.q) return;
      const q = row.q;
      queue.push(Object.assign({}, q, {
        choices: Array.isArray(q.choices) ? q.choices.slice() : [],
        answer: q.answer
      }));
      if (row.entry) answers.push(row.entry);
    });

    const fresh = aprovaWithShuffledChoices(
      aprovaShuffleArray(Array.isArray(newPool) ? newPool.slice() : [])
    );
    fresh.forEach((q) => queue.push(q));

    if (!queue.length) return 0;

    this.queue = queue;
    this.session = {
      scope: scope || "meta-day",
      startedAt: Date.now(),
      answers: answers.slice()
    };
    this.correct = answers.filter((a) => a && a.ok).length;
    this.attempted = answers.length;

    // Começa na primeira ainda sem resposta; se todas feitas, na última.
    let startIdx = queue.findIndex((q) => q && !answers.some((a) => a && a.id === q.id));
    if (startIdx < 0) startIdx = Math.max(0, queue.length - 1);
    this.index = startIdx;
    this.landOnCurrent();
    return this.queue.length;
  },

  startTreino (poolOverride, scope) {
    this.clearSavedTreino();
    this.resetSession("treino");
    const pool = Array.isArray(poolOverride) ? poolOverride : this.filteredCatalog(this.filters);
    this.queue = aprovaWithShuffledChoices(aprovaShuffleArray(pool));
    this.session = {
      scope: scope || "all",
      startedAt: Date.now(),
      answers: []
    };
    this.index = 0;
    this.answered = false;
    return this.queue.length;
  },

  /**
   * Reabre questões já feitas: gabarito e comentário visíveis, sem nova resposta.
   * answersOverride: [{ id, choice, correct, ok }]
   */
  startReviewTreino (poolOverride, answersOverride) {
    this.clearSavedTreino();
    this.resetSession("treino");
    const pool = Array.isArray(poolOverride) ? poolOverride.slice() : [];
    // Mantém ordem das alternativas do banco (sem embaralhar) para casar com o texto salvo.
    this.queue = pool.map((q) => Object.assign({}, q, {
      choices: Array.isArray(q.choices) ? q.choices.slice() : [],
      answer: q.answer
    }));
    const answers = Array.isArray(answersOverride) ? answersOverride.slice() : [];
    this.session = {
      scope: "review",
      startedAt: Date.now(),
      answers
    };
    this.index = 0;
    this.correct = answers.filter((a) => a && a.ok).length;
    this.attempted = answers.length;
    this.landOnCurrent();
    return this.queue.length;
  },

  sessionAnswers () {
    if (this.mode === "simulado" && this.simulado && Array.isArray(this.simulado.answers)) {
      return this.simulado.answers;
    }
    if (this.session && Array.isArray(this.session.answers)) {
      return this.session.answers;
    }
    return [];
  },

  treinoKey (filters, scope) {
    const f = filters || this.filters || {};
    return [
      f.specialty || "",
      f.group || "",
      f.theme || "",
      f.exam || "",
      f.year != null ? String(f.year) : "",
      scope || "all"
    ].join("|");
  },

  /** Há progresso de teste para salvar (não simulado). */
  hasTreinoProgress () {
    return this.mode === "treino" &&
      !!this.session &&
      this.queue.length > 0 &&
      (this.attempted > 0 || this.index > 0);
  },

  snapshotTreino () {
    if (this.mode !== "treino" || !this.session || !this.queue.length) return null;
    return {
      key: this.treinoKey(this.filters, this.session.scope),
      filters: Object.assign({}, this.filters),
      scope: this.session.scope || "all",
      index: this.index,
      correct: this.correct,
      attempted: this.attempted,
      startedAt: this.session.startedAt || Date.now(),
      savedAt: Date.now(),
      answers: this.session.answers.slice(),
      queue: this.queue.map((q) => ({
        id: q.id,
        choices: q.choices.slice(),
        answer: q.answer
      }))
    };
  },

  saveTreinoProgress () {
    const snap = this.snapshotTreino();
    if (!snap) return false;
    try {
      localStorage.setItem(APROVA_TREINO_SAVE_KEY, JSON.stringify(snap));
      return true;
    } catch {
      return false;
    }
  },

  loadSavedTreino () {
    try {
      const raw = localStorage.getItem(APROVA_TREINO_SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.queue) || !data.queue.length) return null;
      return data;
    } catch {
      return null;
    }
  },

  clearSavedTreino () {
    try {
      localStorage.removeItem(APROVA_TREINO_SAVE_KEY);
    } catch {
      /* ignore */
    }
  },

  getResumableTreino (filters, scope) {
    const saved = this.loadSavedTreino();
    if (!saved) return null;
    const key = this.treinoKey(filters, scope);
    if (saved.key !== key) return null;
    if (!(saved.attempted > 0 || saved.index > 0)) return null;
    return saved;
  },

  resumeTreino (saved) {
    const snap = saved || this.loadSavedTreino();
    if (!snap || !Array.isArray(snap.queue) || !snap.queue.length) return 0;

    const byId = Object.create(null);
    this.catalog.forEach((q) => {
      byId[q.id] = q;
    });

    const queue = [];
    snap.queue.forEach((row) => {
      const base = byId[row.id];
      if (!base) return;
      queue.push(Object.assign({}, base, {
        choices: Array.isArray(row.choices) && row.choices.length
          ? row.choices.slice()
          : base.choices.slice(),
        answer: Number.isFinite(row.answer) ? row.answer : base.answer
      }));
    });
    if (!queue.length) {
      this.clearSavedTreino();
      return 0;
    }

    this.resetSession("treino");
    this.filters = {
      specialty: (snap.filters && snap.filters.specialty) || "",
      group: (snap.filters && snap.filters.group) || "",
      theme: (snap.filters && snap.filters.theme) || "",
      exam: (snap.filters && snap.filters.exam) || "",
      year: snap.filters && snap.filters.year != null ? String(snap.filters.year) : ""
    };
    this.queue = queue;
    this.index = Math.max(0, Math.min(queue.length - 1, snap.index | 0));
    this.correct = snap.correct | 0;
    this.attempted = snap.attempted | 0;
    this.session = {
      scope: snap.scope || "all",
      startedAt: snap.startedAt || Date.now(),
      answers: Array.isArray(snap.answers) ? snap.answers.slice() : []
    };
    this.landOnCurrent();
    return this.queue.length;
  },

  current () {
    if (!this.queue.length) return null;
    if (this.index < 0 || this.index >= this.queue.length) return null;
    return this.queue[this.index];
  },

  progressText () {
    if (!this.queue.length) return "Nenhuma quest\u00e3o com estes filtros.";
    if (this.mode === "simulado" && this.simulado) {
      return "Quest\u00e3o " + (this.index + 1) + " de " + this.simulado.size;
    }
    if (this.session && this.session.scope === "review") {
      return "Revis\u00e3o " + (this.index + 1) + " de " + this.queue.length;
    }
    return "Quest\u00e3o " + (this.index + 1) + " de " + this.queue.length + " (filtro)";
  },

  choose (choiceIndex) {
    const q = this.current();
    if (!q || this.answered) return null;
    if (this.session && this.session.scope === "review") return null;
    this.answered = true;
    const annulled = !!q.annulled;
    if (!annulled) this.attempted += 1;
    const ok = !annulled && choiceIndex === q.answer;
    if (ok) this.correct += 1;
    if (!annulled && typeof aprovaRecordExamAnswer === "function") {
      aprovaRecordExamAnswer(q.theme, ok, q.id, {
        specialty: q.specialty,
        group: q.group,
        choice: choiceIndex,
        choiceText: q.choices && q.choices[choiceIndex] != null
          ? q.choices[choiceIndex]
          : ""
      });
    }
    const entry = {
      id: q.id,
      theme: q.theme,
      specialty: q.specialty,
      choice: choiceIndex,
      correct: q.answer,
      ok,
      annulled
    };
    if (this.mode === "simulado" && this.simulado) {
      this.simulado.answers.push(entry);
    } else {
      if (!this.session) {
        this.session = { scope: "all", startedAt: Date.now(), answers: [] };
      }
      this.session.answers.push(entry);
      this.saveTreinoProgress();
    }
    return {
      ok,
      annulled,
      explain: q.explain,
      trap: q.trap || "",
      answer: q.answer
    };
  },

  /** Todas as questões da fila já têm resposta nesta sessão. */
  isTreinoFinished () {
    if (this.mode !== "treino" || !this.queue.length) return false;
    if (this.session && this.session.scope === "review") {
      return this.index >= this.queue.length - 1 && this.hasAnsweredCurrent();
    }
    const answered = this.sessionAnswers();
    if (!answered.length) return false;
    const seen = Object.create(null);
    answered.forEach((a) => {
      if (a && a.id) seen[a.id] = true;
    });
    return this.queue.every((q) => q && seen[q.id]);
  },

  next () {
    if (this.mode === "simulado" && this.simulado) {
      if (this.index + 1 >= this.queue.length) {
        this.simulado.finished = true;
        this.simulado.endedAt = Date.now();
        return null;
      }
      this.index += 1;
      this.landOnCurrent();
      return this.current();
    }

    if (!this.queue.length) return null;

    // Revisão: navega em ordem por todas as questões já respondidas.
    if (this.session && this.session.scope === "review") {
      if (this.index + 1 >= this.queue.length) {
        this.clearSavedTreino();
        return null;
      }
      this.index += 1;
      this.landOnCurrent();
      if (this.session) this.saveTreinoProgress();
      return this.current();
    }

    // Não volta ao início: avança só para questões ainda sem resposta.
    const answered = Object.create(null);
    this.sessionAnswers().forEach((a) => {
      if (a && a.id) answered[a.id] = true;
    });
    for (let step = 1; step <= this.queue.length; step++) {
      const idx = this.index + step;
      if (idx >= this.queue.length) break;
      const q = this.queue[idx];
      if (q && !answered[q.id]) {
        this.index = idx;
        this.landOnCurrent();
        if (this.session) this.saveTreinoProgress();
        return this.current();
      }
    }
    // Sessão concluída — limpa save para não reabrir o mesmo bloco.
    if (this.isTreinoFinished()) this.clearSavedTreino();
    return null;
  },

  prev () {
    if (!this.queue.length || this.index <= 0) return null;
    this.index -= 1;
    this.landOnCurrent();
    if (this.mode === "treino" && this.session) this.saveTreinoProgress();
    return this.current();
  },

  /**
   * Ao entrar numa questão: marca se já foi respondida e restaura o estado.
   * A ordem das alternativas fica congelada na fila (embaralha só no início).
   */
  landOnCurrent () {
    this.answered = this.hasAnsweredCurrent();
  },

  canGoPrev () {
    return this.queue.length > 0 && this.index > 0;
  },

  canGoNext () {
    if (!this.queue.length) return false;
    if (this.mode === "simulado") return true;
    if (this.session && this.session.scope === "review") {
      return true;
    }
    if (!this.answered && !this.hasAnsweredCurrent()) return false;
    const answered = Object.create(null);
    this.sessionAnswers().forEach((a) => {
      if (a && a.id) answered[a.id] = true;
    });
    for (let idx = this.index + 1; idx < this.queue.length; idx++) {
      const q = this.queue[idx];
      if (q && !answered[q.id]) return true;
    }
    // Última respondida: ainda mostra "Concluir"
    return this.isTreinoFinished() || (this.hasAnsweredCurrent() && this.index >= this.queue.length - 1);
  },

  nextLabel () {
    if (this.mode === "simulado" && this.index + 1 >= this.queue.length) {
      return "Ver resultado";
    }
    if (this.mode === "treino" && this.session && this.session.scope === "review") {
      return this.index + 1 >= this.queue.length ? "Voltar às metas" : "Pr\u00f3xima";
    }
    if (this.mode === "treino" && this.isTreinoFinished()) {
      return "Concluir";
    }
    if (this.mode === "treino") {
      const answered = Object.create(null);
      this.sessionAnswers().forEach((a) => {
        if (a && a.id) answered[a.id] = true;
      });
      let hasLater = false;
      for (let idx = this.index + 1; idx < this.queue.length; idx++) {
        if (this.queue[idx] && !answered[this.queue[idx].id]) {
          hasLater = true;
          break;
        }
      }
      if (!hasLater && this.hasAnsweredCurrent()) return "Concluir";
    }
    return "Pr\u00f3xima";
  },

  /** Indica se a questão atual já foi respondida nesta sessão (teste ou simulado). */
  hasAnsweredCurrent () {
    const q = this.current();
    if (!q) return false;
    return this.sessionAnswers().some((a) => a.id === q.id);
  },

  priorAnswer () {
    const q = this.current();
    if (!q) return null;
    const fromSession = this.sessionAnswers().find((a) => a.id === q.id);
    if (fromSession) return fromSession;
    if (!(this.session && this.session.scope === "review")) return null;
    if (typeof aprovaLoadQuestionHistory !== "function") return null;
    const row = aprovaLoadQuestionHistory().byId[q.id];
    if (!row || !row.attempted) return null;
    let choice = q.answer;
    if (row.lastChoiceText && Array.isArray(q.choices)) {
      const idx = q.choices.findIndex((c) => c === row.lastChoiceText);
      if (idx >= 0) choice = idx;
      else if (row.lastOk === false) choice = -1;
    } else if (Number.isFinite(row.lastChoice)) {
      choice = row.lastChoice | 0;
    } else if (row.lastOk === false) {
      choice = -1;
    }
    return {
      id: q.id,
      theme: q.theme,
      specialty: q.specialty,
      choice,
      correct: q.answer,
      ok: !!row.lastOk
    };
  },

  isSimuladoFinished () {
    return !!(this.mode === "simulado" && this.simulado && this.simulado.finished);
  },

  simuladoResult () {
    if (!this.simulado) return null;
    const scored = this.simulado.answers.filter((a) => a && !a.annulled);
    const annulled = this.simulado.answers.filter((a) => a && a.annulled).length;
    const total = scored.length;
    const hits = scored.filter((a) => a.ok).length;
    const pct = total ? Math.round((hits / total) * 100) : 0;
    const byTheme = Object.create(null);
    scored.forEach((a) => {
      if (!byTheme[a.theme]) byTheme[a.theme] = { ok: 0, n: 0 };
      byTheme[a.theme].n += 1;
      if (a.ok) byTheme[a.theme].ok += 1;
    });
    const themes = Object.keys(byTheme).map((theme) => ({
      theme,
      ok: byTheme[theme].ok,
      n: byTheme[theme].n,
      pct: Math.round((byTheme[theme].ok / byTheme[theme].n) * 100)
    })).sort((a, b) => a.pct - b.pct);
    const ms = (this.simulado.endedAt || Date.now()) - (this.simulado.startedAt || Date.now());
    const minutes = Math.max(1, Math.round(ms / 60000));
    return { total, hits, pct, themes, minutes, annulled };
  },

  statsText () {
    if (this.isSimuladoFinished()) {
      const r = this.simuladoResult();
      return r ? ("Simulado: " + r.hits + "/" + r.total + " (" + r.pct + "%)") : "";
    }
    if (!this.attempted) return "Ainda sem respostas nesta sess\u00e3o.";
    const pct = Math.round((this.correct / this.attempted) * 100);
    return this.correct + "/" + this.attempted + " acertos (" + pct + "%)";
  },

  /** @deprecated use catalog length via filteredCatalog */
  get items () {
    return this.catalog;
  }
};
