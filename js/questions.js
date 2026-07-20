/* Banco de questões — treino + simulado estilo residência */

const APROVA_QUESTION_FILES = [
  "data/questions-sample.json",
  "data/questions-clinica.json",
  "data/questions-cirurgia.json",
  "data/questions-pediatria.json",
  "data/questions-go.json",
  "data/questions-preventiva.json"
];

const APROVA_QUESTION_SPECIALTIES = [
  { id: "clinica", label: "Clínica médica" },
  { id: "cirurgia", label: "Cirurgia" },
  { id: "pediatria", label: "Pediatria" },
  { id: "go", label: "Ginecologia e obstetrícia" },
  { id: "preventiva", label: "Preventiva" }
];

const APROVA_QUESTION_CACHE_VER = "20260719q5";

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
  if (!Number.isFinite(answer) || answer < 0 || answer >= choices.length) return null;

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

  return {
    id,
    specialty,
    group: group || theme,
    theme,
    exam: exam || "",
    year: Number.isFinite(year) ? year : null,
    difficulty: difficulty || "",
    stem,
    choices: choices.map(c => String(c)),
    answer: answer | 0,
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

    this.catalog = bag;
    this.resetSession("treino");
    this.applyFilters(this.filters, { rebuild: true });
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
    this.queue = list.slice();
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
  },

  /** Inicia simulado com N questões (embaralhadas) do filtro atual. */
  startSimulado (size) {
    const pool = this.filteredCatalog(this.filters);
    if (!pool.length) return 0;
    const n = Math.max(1, Math.min(pool.length, size | 0 || 10));
    this.resetSession("simulado");
    this.queue = aprovaShuffleArray(pool).slice(0, n);
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

  startTreino () {
    this.resetSession("treino");
    this.queue = aprovaShuffleArray(this.filteredCatalog(this.filters));
    return this.queue.length;
  },

  current () {
    if (!this.queue.length) return null;
    if (this.index < 0 || this.index >= this.queue.length) return null;
    return this.queue[this.index];
  },

  progressText () {
    if (!this.queue.length) return "Nenhuma questão com estes filtros.";
    if (this.mode === "simulado" && this.simulado) {
      return "Questão " + (this.index + 1) + " de " + this.simulado.size;
    }
    return "Questão " + (this.index + 1) + " de " + this.queue.length + " (filtro)";
  },

  choose (choiceIndex) {
    const q = this.current();
    if (!q || this.answered) return null;
    this.answered = true;
    this.attempted += 1;
    const ok = choiceIndex === q.answer;
    if (ok) this.correct += 1;
    if (typeof aprovaRecordExamAnswer === "function") {
      aprovaRecordExamAnswer(q.theme, ok);
    }
    if (this.mode === "simulado" && this.simulado) {
      this.simulado.answers.push({
        id: q.id,
        theme: q.theme,
        specialty: q.specialty,
        choice: choiceIndex,
        correct: q.answer,
        ok
      });
    }
    return {
      ok,
      explain: q.explain,
      trap: q.trap || "",
      answer: q.answer
    };
  },

  next () {
    if (this.mode === "simulado" && this.simulado) {
      if (this.index + 1 >= this.queue.length) {
        this.simulado.finished = true;
        this.simulado.endedAt = Date.now();
        return null;
      }
      this.index += 1;
      this.answered = false;
      return this.current();
    }

    if (!this.queue.length) return null;
    this.index = (this.index + 1) % this.queue.length;
    this.answered = false;
    return this.current();
  },

  isSimuladoFinished () {
    return !!(this.mode === "simulado" && this.simulado && this.simulado.finished);
  },

  simuladoResult () {
    if (!this.simulado) return null;
    const total = this.simulado.answers.length;
    const hits = this.simulado.answers.filter(a => a.ok).length;
    const pct = total ? Math.round((hits / total) * 100) : 0;
    const byTheme = Object.create(null);
    this.simulado.answers.forEach(a => {
      if (!byTheme[a.theme]) byTheme[a.theme] = { ok: 0, n: 0 };
      byTheme[a.theme].n += 1;
      if (a.ok) byTheme[a.theme].ok += 1;
    });
    const themes = Object.keys(byTheme).map(theme => ({
      theme,
      ok: byTheme[theme].ok,
      n: byTheme[theme].n,
      pct: Math.round((byTheme[theme].ok / byTheme[theme].n) * 100)
    })).sort((a, b) => a.pct - b.pct);
    const ms = (this.simulado.endedAt || Date.now()) - (this.simulado.startedAt || Date.now());
    const minutes = Math.max(1, Math.round(ms / 60000));
    return { total, hits, pct, themes, minutes };
  },

  statsText () {
    if (this.isSimuladoFinished()) {
      const r = this.simuladoResult();
      return r ? ("Simulado: " + r.hits + "/" + r.total + " (" + r.pct + "%)") : "";
    }
    if (!this.attempted) return "Ainda sem respostas nesta sessão.";
    const pct = Math.round((this.correct / this.attempted) * 100);
    return this.correct + "/" + this.attempted + " acertos (" + pct + "%)";
  },

  /** @deprecated use catalog length via filteredCatalog */
  get items () {
    return this.catalog;
  }
};
