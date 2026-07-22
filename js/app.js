/* Shell do app — sidebar, dashboard e módulos de estudo */

const APROVA_PANEL_META = {
  inicio: { title: "Início", sub: "Escolha o que estudar agora" },
  hoje: { title: "Hoje", sub: "O que iremos estudar hoje?" },
  flashcards: { title: "Flashcards", sub: "Escolha a área e o tema para estudar" },
  questoes: { title: "Banco de questões", sub: "Treino no formato da prova" },
  especialidades: { title: "Flashcards", sub: "Escolha a área e o tema para estudar" },
  simulados: { title: "Simulados", sub: "Blocos no estilo R1" },
  estatisticas: { title: "Estatísticas de provas", sub: "O que mais caiu nas provas R1" },
  progresso: { title: "Meu progresso", sub: "Acompanhe sua rotina" },
  metas: { title: "Minhas metas", sub: "Diária, semanal e temas de flashcards" },
  perfil: { title: "Meu perfil", sub: "Provas e datas que você pretende prestar" },
  config: { title: "Configurações", sub: "Conta e preferências" },
  contato: { title: "Contato", sub: "medhubr1@gmail.com" }
};

/** "study" = Flashcards · "stats" = o que mais caiu nas provas */
let aprovaEspMode = "study";

function aprovaIsStatsMode () {
  return aprovaEspMode === "stats";
}

function aprovaSetWorkspaceMeta (panelId) {
  const meta = APROVA_PANEL_META[panelId];
  if (!meta) return;
  const title = document.getElementById("workspace-title");
  const sub = document.getElementById("workspace-sub");
  if (title) title.textContent = meta.title;
  if (sub) sub.textContent = meta.sub;
}

function aprovaShowPanel (id) {
  const key = APROVA_PANEL_META[id] ? id : "inicio";

  document.querySelectorAll(".panel").forEach(panel => {
    const active = panel.id === "panel-" + key;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });

  document.querySelectorAll(".side-link[data-panel]").forEach(link => {
    link.classList.toggle("active", link.dataset.panel === key);
  });

  const meta = APROVA_PANEL_META[key];
  const title = document.getElementById("workspace-title");
  const sub = document.getElementById("workspace-sub");
  if (title) title.textContent = meta.title;
  if (sub) sub.textContent = meta.sub;

  document.body.classList.remove("sidebar-open");
}

const APROVA_SPECIALTY_LABELS = {
  clinica: "Clínica médica",
  cirurgia: "Cirurgia",
  pediatria: "Pediatria",
  go: "Ginecologia e obstetrícia",
  preventiva: "Preventiva",
  urgencia: "Urgência e emergência"
};

function aprovaMarkNav (panelId) {
  document.querySelectorAll(".side-link[data-panel]").forEach(link => {
    link.classList.toggle("active", link.dataset.panel === panelId);
  });
}

function aprovaGoTo (id, options) {
  const opts = options || {};

  // Estatísticas de provas: explorer de “o que mais caiu” (reusa o painel de áreas).
  if (id === "estatisticas") {
    aprovaEspMode = "stats";
    aprovaRenderEspecialidades();
    aprovaShowPanel("especialidades");
    aprovaMarkNav("estatisticas");
    aprovaSetWorkspaceMeta("estatisticas");
    return;
  }

  // Especialidades virou só o fluxo interno dos Flashcards (sem item no menu).
  if (id === "especialidades") {
    aprovaEspMode = "study";
    aprovaRenderEspecialidades();
    aprovaShowPanel("especialidades");
    aprovaMarkNav("flashcards");
    aprovaSetWorkspaceMeta("flashcards");
    return;
  }

  if (id === "flashcards") {
    aprovaEspMode = "study";
    if (opts.study) {
      if (opts.mode === "today" || AprovaFlashcards.mode !== "deck") {
        AprovaFlashcards.rebuildTodayQueue();
      }
      aprovaShowFlashcardStudy();
      aprovaRenderFlashcard();
    } else {
      aprovaShowFlashcardBrowse();
    }
  }
  if (id === "hoje") aprovaRenderToday();
  if (id === "progresso") aprovaRenderProgress();
  if (id === "metas") aprovaRenderMetas();
  if (id === "perfil") aprovaRenderPerfil();
  if (id === "config") aprovaRenderConfig();
  if (id === "contato" && typeof aprovaPrefillContactFromSession === "function") {
    aprovaPrefillContactFromSession("app-contact-form");
  }
  if (id === "inicio") aprovaRenderDashboard();
  if (id === "questoes") {
    if (AprovaQuestions.isSimuladoFinished()) {
      aprovaRenderSimuladoResult();
    } else if (AprovaQuestions.current() && (AprovaQuestions.answered || AprovaQuestions.attempted > 0)) {
      aprovaShowQuestionViews("card");
      aprovaRenderQuestion();
    } else {
      if (!aprovaQBrowse.specialty) aprovaQBrowse.level = "areas";
      aprovaRenderQuestionBrowse();
    }
  }
  aprovaShowPanel(id);
}

function aprovaBackToEspHub () {
  if (aprovaIsStatsMode()) {
    aprovaRenderEspecialidades();
    aprovaShowPanel("especialidades");
    aprovaMarkNav("estatisticas");
    aprovaSetWorkspaceMeta("estatisticas");
    return;
  }
  aprovaGoTo("flashcards");
}

function aprovaShowFlashcardBrowse () {
  const browse = document.getElementById("fc-browse");
  const card = document.getElementById("fc-card");
  const hint = document.getElementById("fc-hint");
  if (browse) browse.hidden = false;
  if (card) card.hidden = true;
  if (hint) hint.textContent = "Escolha a área para estudar · abaixo, o que mais caiu nas provas.";
  aprovaRenderFlashcardBrowse();
  aprovaRenderFlashcardHomeStats(null, aprovaPreferredExamFocus());
}

function aprovaShowFlashcardStudy () {
  const browse = document.getElementById("fc-browse");
  const card = document.getElementById("fc-card");
  const hint = document.getElementById("fc-hint");
  if (browse) browse.hidden = true;
  if (card) card.hidden = false;
  if (hint) {
    const advance = typeof aprovaGetActivityCreditDay === "function" && aprovaGetActivityCreditDay();
    const multi = AprovaFlashcards.activeDeckIds && AprovaFlashcards.activeDeckIds.length > 1;
    if (advance) {
      hint.textContent = "Adiantando meta de amanhã · estes cards contam para amanhã.";
    } else {
      hint.textContent = AprovaFlashcards.mode === "deck"
        ? (multi
          ? "Estudo de vários subtemas · revelar · acertei / errei."
          : "Estudo por tema · revelar · acertei / errei.")
        : "Fila de hoje · revelar · acertei / errei.";
    }
  }
}

function aprovaRenderFlashcardBrowse () {
  const grid = document.getElementById("fc-browse-grid");
  if (!grid) return;

  const bySpecialty = {};
  AprovaFlashcards.decks.forEach(deck => {
    const key = deck.specialty || "geral";
    if (!bySpecialty[key]) bySpecialty[key] = [];
    bySpecialty[key].push(deck);
  });

  const keys = Object.keys(APROVA_SPECIALTY_LABELS);
  grid.innerHTML = "";

  keys.forEach(spec => {
    const label = APROVA_SPECIALTY_LABELS[spec];
    const decks = bySpecialty[spec] || [];
    const total = decks.reduce((n, d) => n + (d.cards || []).length, 0);
    const hasContent = decks.length > 0;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card" + (hasContent ? "" : " dash-card--muted");
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">Especialidade</span>" +
      "<strong>" + label + "</strong>" +
      "<span>" + (hasContent
        ? (decks.length + " tema" + (decks.length === 1 ? "" : "s") +
          " · " + total + " card" + (total === 1 ? "" : "s"))
        : "Conteúdo em breve") + "</span>";
    btn.addEventListener("click", () => {
      if (APROVA_FC_HOME_STATS_AREAS.some(a => a.id === spec)) {
        aprovaFcHomeStatsSpec = spec;
      }
      if (spec === "pediatria" && typeof aprovaOpenPediatria === "function") {
        aprovaGoTo("especialidades");
        aprovaOpenPediatria();
        return;
      }
      if (spec === "go" && typeof aprovaOpenGinecologia === "function") {
        aprovaGoTo("especialidades");
        aprovaOpenGinecologia();
        return;
      }
      if (typeof aprovaOpenSpecialty === "function") {
        aprovaGoTo("especialidades");
        aprovaOpenSpecialty(spec);
      }
    });
    grid.appendChild(btn);
  });
}

let aprovaActiveSpecialty = null;
let aprovaActiveFocusId = "geral";
let aprovaActivePedModule = null;
let aprovaActiveGoArea = null;
let aprovaActiveCliArea = null;
let aprovaActivePedOverviewFocus = "geral";
let aprovaActiveOverviewYear = "geral";
let aprovaActiveModuleYear = "geral";
let aprovaOverviewExamChooserOpen = false;
let aprovaModuleExamChooserOpen = false;
let aprovaFcHomeStatsSpec = "clinica";
let aprovaFcHomeStatsFocus = "geral";
let aprovaFcHomeStatsYear = "geral";
let aprovaFcHomeExamChooserOpen = false;
let aprovaSeuFocoAreaId = "clinica";
let aprovaSeuFocoCache = null;
/** Pack exibido no painel por área (mix do perfil ou prova isolada). */
let aprovaSeuFocoViewPack = null;
/** "perfil" | id da banca (geral, enamed, sus-sp…) */
let aprovaSeuFocoStatsMode = "perfil";
let aprovaSeuFocoStatsYear = "geral";
let aprovaSeuFocoExamChooserOpen = false;
let aprovaSeuFocoProfilesCache = null;
const aprovaOverviewStatsCache = Object.create(null);

/** Banca preferida do perfil (1ª prioridade), ou "geral". */
function aprovaPreferredExamFocus () {
  if (typeof aprovaProfilePrimaryExamId === "function") {
    const id = aprovaProfilePrimaryExamId();
    if (id) return id;
  }
  return "geral";
}

/** Ordem por volume + concorrência no ciclo 2024–2026 (mais importantes primeiro). */
const APROVA_EXAM_RANK = {
  geral: 0,
  enare: 1,
  enamed: 2,
  usp: 3,
  unifesp: 4,
  revalida: 5,
  amp: 6,
  "santa-casa": 7,
  sirio: 8,
  iamspe: 9,
  "sus-sp": 10,
  unicamp: 11,
  "puc-sp": 12,
  ufmg: 13,
  ufrgs: 14,
  consesp: 15,
  "sus-ba": 16,
  "ses-pe": 17,
  ufrj: 18,
  einstein: 19,
  fmabc: 20
};

function aprovaExamRank (id) {
  return Object.prototype.hasOwnProperty.call(APROVA_EXAM_RANK, id)
    ? APROVA_EXAM_RANK[id]
    : 50;
}

function aprovaExamLabel (profile) {
  if (!profile) return "";
  if (profile.id === "geral") return "Geral Brasil";
  if (profile.id === "enamed") return "Enamed";
  return profile.label || profile.id;
}

/**
 * Rótulo da estatística usada nas metas (1ª prioridade do perfil / foco).
 * Ex.: "SUS-SP", "Enamed", "Geral Brasil".
 */
function aprovaMetasStatsExamLabel (focusPack) {
  const pack = focusPack || aprovaSeuFocoCache;
  if (pack && pack.ok && Array.isArray(pack.exams) && pack.exams.length) {
    const primary = pack.exams[0];
    if (primary && primary.label) return primary.label;
    if (primary && primary.id && typeof aprovaExamOptionLabel === "function") {
      return aprovaExamOptionLabel(primary.id);
    }
  }
  const id = typeof aprovaPreferredExamFocus === "function"
    ? aprovaPreferredExamFocus()
    : (typeof aprovaProfilePrimaryExamId === "function" ? aprovaProfilePrimaryExamId() : null);
  if (!id || id === "geral") return "Geral Brasil";
  if (typeof aprovaExamOptionLabel === "function") return aprovaExamOptionLabel(id);
  if (id === "enamed") return "Enamed";
  if (id === "sus-sp") return "SUS-SP";
  return String(id);
}

/** Texto curto: "esse tema cai 44,1% na prova do SUS-SP". */
function aprovaMetasThemeFreqCaption (pct, focusPack) {
  if (pct == null || !Number.isFinite(Number(pct))) return "";
  const pctTxt = typeof aprovaFormatPct === "function"
    ? aprovaFormatPct(pct)
    : (String(pct).replace(".", ",") + "%");
  const exam = aprovaMetasStatsExamLabel(focusPack);
  const pack = focusPack || aprovaSeuFocoCache;
  const multi = pack && pack.ok && Array.isArray(pack.exams) && pack.exams.length > 1;
  if (multi) {
    return "esse tema cai " + pctTxt + " nas suas provas (ref. " + exam + ")";
  }
  if (exam === "Geral Brasil") {
    return "esse tema cai " + pctTxt + " no Geral Brasil";
  }
  return "esse tema cai " + pctTxt + " na prova do " + exam;
}

function aprovaYearLabel (year) {
  if (!year || year === "geral") return "2024–2026";
  return String(year);
}

function aprovaResolveYearSlice (profile, year) {
  const y = year || "geral";
  if (y !== "geral" && profile && profile.byYear && profile.byYear[y]) {
    const slice = profile.byYear[y];
    return {
      priorities: slice.priorities || profile.priorities || [],
      verdict: slice.verdict || profile.verdict || "",
      source: slice.source || profile.source || "",
      sampleSize: slice.sampleSize != null ? slice.sampleSize : profile.sampleSize,
      note: slice.note || ""
    };
  }
  return {
    priorities: (profile && profile.priorities) || [],
    verdict: (profile && profile.verdict) || "",
    source: (profile && profile.source) || "",
    sampleSize: profile && profile.sampleSize,
    note: ""
  };
}

function aprovaSortExamProfiles (profiles) {
  return (profiles || []).slice().sort((a, b) => {
    const d = aprovaExamRank(a.id) - aprovaExamRank(b.id);
    return d !== 0 ? d : String(a.label || "").localeCompare(String(b.label || ""), "pt-BR");
  });
}

/**
 * Filtros compactos: Brasil padrão + painel para escolher prova + ano 2024–2026.
 */
function aprovaRenderExamYearFilters (container, opts) {
  const options = opts || {};
  const profiles = aprovaSortExamProfiles(options.profiles || []);
  const activeId = options.activeId || "geral";
  const activeYear = options.activeYear || "geral";
  const chooserOpen = !!options.chooserOpen;
  const onExam = typeof options.onExam === "function" ? options.onExam : () => {};
  const onYear = typeof options.onYear === "function" ? options.onYear : () => {};
  const onToggleChooser = typeof options.onToggleChooser === "function"
    ? options.onToggleChooser
    : () => {};

  if (!container) return;

  const active = profiles.find(p => p.id === activeId) || profiles[0];
  const examChoices = profiles.filter(p => p.id !== "geral");
  const pickLabel = active && active.id !== "geral"
    ? aprovaExamLabel(active)
    : "Escolher prova";

  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "esp-stat-filters-row";

  const brasilBtn = document.createElement("button");
  brasilBtn.type = "button";
  brasilBtn.className = "esp-exam-btn" + (activeId === "geral" ? " active" : "");
  brasilBtn.textContent = "Geral Brasil";
  brasilBtn.title = "Síntese nacional · ciclo 2024–2026";
  brasilBtn.addEventListener("click", () => onExam("geral"));
  row.appendChild(brasilBtn);

  const pickBtn = document.createElement("button");
  pickBtn.type = "button";
  pickBtn.className = "esp-exam-pick-btn" + (activeId !== "geral" ? " esp-exam-pick-btn--set" : "") +
    (chooserOpen ? " open" : "");
  pickBtn.setAttribute("aria-expanded", chooserOpen ? "true" : "false");
  pickBtn.textContent = pickLabel + (chooserOpen ? " ▴" : " ▾");
  pickBtn.title = "Provas ordenadas por número de inscritos (2024–2026)";
  pickBtn.addEventListener("click", () => onToggleChooser());
  row.appendChild(pickBtn);

  const yearWrap = document.createElement("label");
  yearWrap.className = "esp-year-pick";
  yearWrap.innerHTML = "<span>Ano</span>";
  const yearSelect = document.createElement("select");
  yearSelect.setAttribute("aria-label", "Ano da estatística");
  [
    { id: "geral", label: "2024–2026" },
    { id: "2024", label: "2024" },
    { id: "2025", label: "2025" },
    { id: "2026", label: "2026" }
  ].forEach(y => {
    const opt = document.createElement("option");
    opt.value = y.id;
    opt.textContent = y.label;
    if (y.id === activeYear) opt.selected = true;
    yearSelect.appendChild(opt);
  });
  yearSelect.addEventListener("change", () => onYear(yearSelect.value));
  yearWrap.appendChild(yearSelect);
  row.appendChild(yearWrap);

  container.appendChild(row);

  const chooser = document.createElement("div");
  chooser.className = "esp-exam-chooser";
  chooser.hidden = !chooserOpen;
  const hint = document.createElement("p");
  hint.className = "muted esp-exam-chooser-hint";
  hint.textContent =
    "Ordenadas por inscritos e concorrência (2024–2026). CONSESP = padrão da banca (várias instituições). Toque para estudar o recorte certo.";
  chooser.appendChild(hint);

  const list = document.createElement("div");
  list.className = "esp-exam-chooser-list";
  examChoices.forEach((p, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "esp-exam-chooser-item" +
      (p.id === activeId ? " active" : "") +
      (p.id === "enamed" || p.featured ? " featured" : "");
    btn.innerHTML =
      "<span class=\"esp-exam-chooser-rank\">" + (idx + 1) + "</span>" +
      "<span class=\"esp-exam-chooser-name\">" + aprovaExamLabel(p) + "</span>" +
      "<span class=\"esp-exam-chooser-meta\">" + (p.kicker || "Ciclo 2024–2026") + "</span>";
    btn.addEventListener("click", () => onExam(p.id));
    list.appendChild(btn);
  });
  chooser.appendChild(list);
  container.appendChild(chooser);
}

function aprovaIsRichSpecialty (specialty) {
  return (
    specialty === "pediatria" ||
    specialty === "go" ||
    specialty === "cirurgia" ||
    specialty === "clinica" ||
    specialty === "preventiva"
  );
}

function aprovaRichSpecialtyMeta (specialty) {
  const spec = specialty || aprovaActiveSpecialty || "pediatria";
  if (spec === "go") {
    const obs = aprovaActiveGoArea === "obstetricia";
    return {
      id: "go",
      label: "Ginecologia e obstetrícia",
      shortLabel: obs ? "Obstetrícia" : "Ginecologia",
      overviewCacheKey: obs ? "obstetricia" : "ginecologia",
      overviewUrl: obs
        ? "data/stats-obstetricia-geral.json?v=20260718nn"
        : "data/stats-ginecologia-geral.json?v=20260718nn",
      countNoun: obs ? "Obstetrícia" : "Ginecologia",
      openRoot: () => aprovaOpenGinecologia(),
      openModule: id => aprovaOpenGinecologiaModule(id)
    };
  }
  if (spec === "cirurgia") {
    return {
      id: "cirurgia",
      label: "Cirurgia",
      shortLabel: "Cirurgia",
      overviewCacheKey: "cirurgia",
      overviewUrl: "data/stats-cirurgia-geral.json?v=20260718rr",
      countNoun: "Cirurgia",
      openRoot: () => aprovaOpenCirurgia(),
      openModule: id => aprovaOpenCirurgiaModule(id)
    };
  }
  if (spec === "preventiva") {
    return {
      id: "preventiva",
      label: "Preventiva",
      shortLabel: "Preventiva",
      overviewCacheKey: "preventiva",
      overviewUrl: "data/stats-preventiva-geral.json?v=20260718nn",
      countNoun: "Preventiva",
      openRoot: () => aprovaOpenPreventiva(),
      openModule: id => aprovaOpenPreventivaModule(id)
    };
  }
  if (spec === "clinica") {
    if (!aprovaActiveCliArea) {
      return {
        id: "clinica",
        label: "Clínica médica",
        shortLabel: "Clínica médica",
        overviewCacheKey: "clinica",
        overviewUrl: "data/stats-clinica-geral.json?v=20260718nn",
        countNoun: "Clínica médica",
        openRoot: () => aprovaOpenClinica(),
        openModule: id => aprovaOpenClinicaModule(id)
      };
    }
    const cliMeta = {
      reumatologia: {
        shortLabel: "Reumatologia",
        overviewCacheKey: "reumatologia",
        overviewUrl: "data/stats-reumatologia-geral.json?v=20260718nn",
        countNoun: "Reumatologia"
      },
      psiquiatria: {
        shortLabel: "Psiquiatria",
        overviewCacheKey: "psiquiatria",
        overviewUrl: "data/stats-psiquiatria-geral.json?v=20260718nn",
        countNoun: "Psiquiatria"
      },
      pneumologia: {
        shortLabel: "Pneumologia",
        overviewCacheKey: "pneumologia",
        overviewUrl: "data/stats-pneumologia-geral.json?v=20260718nn",
        countNoun: "Pneumologia"
      },
      neurologia: {
        shortLabel: "Neurologia",
        overviewCacheKey: "neurologia",
        overviewUrl: "data/stats-neurologia-geral.json?v=20260718nn",
        countNoun: "Neurologia"
      },
      nefrologia: {
        shortLabel: "Nefrologia",
        overviewCacheKey: "nefrologia",
        overviewUrl: "data/stats-nefrologia-geral.json?v=20260718nn",
        countNoun: "Nefrologia"
      },
      infectologia: {
        shortLabel: "Infectologia",
        overviewCacheKey: "infectologia",
        overviewUrl: "data/stats-infectologia-geral.json?v=20260718nn",
        countNoun: "Infectologia"
      },
      hepatologia: {
        shortLabel: "Hepatologia",
        overviewCacheKey: "hepatologia",
        overviewUrl: "data/stats-hepatologia-geral.json?v=20260718nn",
        countNoun: "Hepatologia"
      },
      hematologia: {
        shortLabel: "Hematologia",
        overviewCacheKey: "hematologia",
        overviewUrl: "data/stats-hematologia-geral.json?v=20260718nn",
        countNoun: "Hematologia"
      },
      endocrinologia: {
        shortLabel: "Endocrinologia",
        overviewCacheKey: "endocrinologia",
        overviewUrl: "data/stats-endocrinologia-geral.json?v=20260718nn",
        countNoun: "Endocrinologia"
      },
      cardiologia: {
        shortLabel: "Cardiologia",
        overviewCacheKey: "cardiologia",
        overviewUrl: "data/stats-cardiologia-geral.json?v=20260718nn",
        countNoun: "Cardiologia"
      }
    };
    const a = cliMeta[aprovaActiveCliArea] || cliMeta.reumatologia;
    return {
      id: "clinica",
      label: "Clínica médica",
      shortLabel: a.shortLabel,
      overviewCacheKey: a.overviewCacheKey,
      overviewUrl: a.overviewUrl,
      countNoun: a.countNoun,
      openRoot: () => aprovaOpenClinica(),
      openModule: id => aprovaOpenClinicaModule(id)
    };
  }
  return {
    id: "pediatria",
    label: "Pediatria",
    shortLabel: "Pediatria",
    overviewCacheKey: "pediatria",
    overviewUrl: "data/stats-pediatria-geral.json?v=20260718nn",
    countNoun: "Pediatria",
    openRoot: () => aprovaOpenPediatria(),
    openModule: id => aprovaOpenPediatriaModule(id)
  };
}

function aprovaHideEspViews () {
  ["esp-list", "esp-decks", "esp-revisao"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  const stats = document.getElementById("esp-stats");
  if (stats) stats.hidden = true;
  const subtemas = document.getElementById("esp-subtemas");
  if (subtemas) subtemas.hidden = true;
  const overview = document.getElementById("esp-ped-overview");
  if (overview) overview.hidden = true;
}

function aprovaShowSpecialtyList () {
  aprovaHideEspViews();
  const list = document.getElementById("esp-list");
  const hint = document.getElementById("esp-hint");
  const title = document.getElementById("esp-title");
  if (list) list.hidden = false;
  if (title) {
    title.textContent = aprovaIsStatsMode() ? "Estatísticas de provas" : "Flashcards";
  }
  if (hint) {
    hint.textContent = aprovaIsStatsMode()
      ? "Escolha a área e veja, prova a prova, o que mais caiu."
      : "Escolha uma área e depois um subtema para estudar.";
  }
  aprovaActiveSpecialty = null;
  aprovaActiveGoArea = null;
  aprovaActiveCliArea = null;
  aprovaActivePedModule = null;
}

function aprovaRenderEspecialidades () {
  aprovaShowSpecialtyList();
  const cli = document.getElementById("esp-count-clinica");
  const cir = document.getElementById("esp-count-cirurgia");
  const ped = document.getElementById("esp-count-pediatria");
  const go = document.getElementById("esp-count-go");
  const prev = document.getElementById("esp-count-preventiva");
  const statsMode = aprovaIsStatsMode();
  const cliN = AprovaFlashcards.countBySpecialty("clinica");
  const cirN = AprovaFlashcards.countBySpecialty("cirurgia");
  const pedN = AprovaFlashcards.countBySpecialty("pediatria");
  const goN = AprovaFlashcards.countBySpecialty("go");
  const prevN = AprovaFlashcards.countBySpecialty("preventiva");
  if (cli) {
    cli.textContent = statsMode
      ? "Cardio, infecto, endo e demais áreas · o que mais caiu"
      : (cliN
        ? cliN + " flashcards · Cardio, infecto, endo e demais áreas"
        : "Cardio, infecto, endo e demais áreas.");
  }
  if (cir) {
    cir.textContent = statsMode
      ? "Trauma, abdome, pós-op e especialidades · o que mais caiu"
      : (cirN
        ? cirN + " flashcards · trauma, abdome e pós-op"
        : "Trauma, abdome agudo e pós-operatório.");
  }
  if (ped) {
    ped.textContent = statsMode
      ? "Neo, infecções, urgências e blocos clássicos · o que mais caiu"
      : (pedN
        ? pedN + " flashcards · Pediatria R1 completa"
        : "Ped1–Ped6 + blocos clássicos do R1.");
  }
  if (go) {
    go.textContent = statsMode
      ? "Ginecologia e Obstetrícia · o que mais caiu"
      : (goN
        ? goN + " flashcards · Ginecologia (+ Obstetrícia em breve)"
        : "Ginecologia e Obstetrícia.");
  }
  if (prev) {
    prev.textContent = statsMode
      ? "SUS, epidemiologia, vigilância e indicadores · o que mais caiu"
      : (prevN
        ? prevN + " flashcards · Prev1–4 · 4 grupos"
        : "Epidemiologia, vacinas e SUS.");
  }
}

async function aprovaRenderCliAreaCounts () {
  const map = [
    ["esp-count-cardio", "cardiologia", "Car1–3 · SCA, ICC, FA e HAS."],
    ["esp-count-reu", "reumatologia", "AR, LES, gota, SpA e vasculites."],
    ["esp-count-psi", "psiquiatria", "Substâncias, humor, psicose e ansiedade."],
    ["esp-count-pnm", "pneumologia", "Asma, DPOC, TEP, intensiva e TB."],
    ["esp-count-neu", "neurologia", "AVC, epilepsia, coma e cefaleia."],
    ["esp-count-nef", "nefrologia", "Nefro 1–5 completa · glomérulos à uro."],
    ["esp-count-infc", "infectologia", "Inf1–5 completa · parasitoses à tropicais."],
    ["esp-count-hep", "hepatologia", "Hep1–4 completa · virais à descompensação."],
    ["esp-count-hema", "hematologia", "Hem1–3 completa · anemias à hemostasia."],
    ["esp-count-endo", "endocrinologia", "End1–3 completa · tireoide à diabetes."]
  ];
  for (const [elId, areaId, fallback] of map) {
    const el = document.getElementById(elId);
    if (!el) continue;
    const stats = await aprovaCliAreaStats(areaId);
    el.textContent = stats.groups
      ? (stats.cards + " flashcards · " + stats.groups + " grupo" + (stats.groups === 1 ? "" : "s"))
      : fallback;
  }
}

function aprovaDeckKicker (deck) {
  const id = String(deck.id || "");
  if (id.indexOf("neo-") === 0) return "Neonatologia";
  if (id.indexOf("ali-") === 0) return "Alimentação";
  if (id.indexOf("nut-") === 0) return "Avaliação nutricional";
  if (id.indexOf("imu-") === 0) return "Imunizações";
  if (id.indexOf("dm-") === 0) return "Diabetes";
  if (id.indexOf("itu-") === 0) return "Nefro · ITU/RVU";
  if (id === "nef-sindromes") return "Nefro · SN/GNA";
  if (id === "nef-basico") return "Nefro · básico";
  if (id.indexOf("nef-nefritica") === 0) return "Nefro · nefrítica";
  if (id === "nef-nefrotica") return "Nefro · nefrótica";
  if (id === "nef-dlm-gefs") return "Nefro · DLM/GEFS";
  if (id === "nef-membranosa") return "Nefro · membranosa";
  if (id === "nef-berger") return "Nefro · Berger";
  if (id === "nef-gnrp") return "Nefro · GNRP";
  if (id === "nef-sistemicas") return "Nefro · sistêmicas";
  if (id === "nef-nta" || id.indexOf("nef-nta-") === 0) return "Nefro · NTA";
  if (id === "nef-rabdo-slt") return "Nefro · rabdo/SLT";
  if (id === "nef-nia") return "Nefro · NIA";
  if (id === "nef-nic-papila") return "Nefro · NIC/papila";
  if (id === "nef-atr-fanconi") return "Nefro · ATR";
  if (id === "nef-renovascular") return "Nefro · renovascular";
  if (id === "nef-ateroembolo") return "Nefro · ateroêmbolo";
  if (id === "nef-cristaloides") return "Nefro · cristaloides";
  if (id === "nef-magnesio") return "Nefro · Mg";
  if (id === "nef-tampoes") return "Nefro · tampões";
  if (id.indexOf("nef-ira-") === 0) return "Nefro · IRA";
  if (id.indexOf("nef-drc-") === 0) return "Nefro · DRC";
  if (id.indexOf("nef-litiase-") === 0) return "Nefro · litíase";
  if (id === "nef-hpb") return "Nefro · HPB";
  if (id === "nef-ca-prostata") return "Nefro · CA próstata";
  if (id === "nef-ca-uro") return "Nefro · oncouro";
  if (id === "nef-obstrucao-cistos") return "Nefro · obstrução/cistos";
  if (id.indexOf("nef-") === 0) return "Nefrologia";
  if (id === "infc-amebiase" || id === "infc-giardia") return "Infecto · protozoários";
  if (
    id === "infc-ascaris" ||
    id === "infc-ancilostoma" ||
    id === "infc-strongyloides" ||
    id === "infc-oxiuro-tricuris"
  ) return "Infecto · helmintos";
  if (id === "infc-tenias" || id === "infc-toxocara") return "Infecto · tênias";
  if (id === "infc-esquisto" || id === "infc-parasito-mapa") return "Infecto · esquistossomose";
  if (id === "infc-pavm") return "Infecto · PN/PAVM";
  if (id.indexOf("infc-pac-") === 0) return "Infecto · PAC";
  if (id === "infc-abscesso") return "Infecto · abscesso";
  if (id.indexOf("infc-atb-") === 0) return "Infecto · ATB";
  if (id.indexOf("infc-hiv-") === 0) return "Infecto · HIV";
  if (id.indexOf("infc-itu-") === 0) return "Infecto · ITU";
  if (id.indexOf("infc-pele-") === 0) return "Infecto · pele";
  if (id === "infc-osteo") return "Infecto · osteo";
  if (id.indexOf("infc-dengue-") === 0) return "Infecto · dengue";
  if (id === "infc-chik-zika" || id === "infc-febre-amarela") return "Infecto · arbovírus";
  if (id === "infc-malaria") return "Infecto · malária";
  if (
    id === "infc-lepto" ||
    id === "infc-leishmania" ||
    id === "infc-maculosa-tifoide" ||
    id === "infc-emergentes" ||
    id === "infc-tropicais-mapa"
  ) return "Infecto · tropicais";
  if (id.indexOf("infc-") === 0) return "Infectologia";
  if (id === "hep-histologia-circulacao" || id === "hep-hepatograma-ictericia") return "Hepato · básico";
  if (id === "hep-hav" || id === "hep-hbv-aguda" || id === "hep-hdv-hev") {
    return "Hepato · virais agudas";
  }
  if (id === "hep-hcv-aguda-cronica") return "Hepato · HCV aguda/crônica";
  if (id === "hep-hbv-cronica") return "Hepato · HBV crônica";
  if (id === "hep-fulminante") return "Hepato · fulminante";
  if (id === "hep-cirrose" || id === "hep-dha" || id === "hep-dhgna-nash") return "Hepato · esteatose";
  if (id === "hep-hai" || id === "hep-cbp" || id === "hep-cep") return "Hepato · autoimune";
  if (id === "hep-wilson" || id === "hep-hemocromatose" || id === "hep-dili") return "Hepato · metabólicas";
  if (
    id === "hep-ihc-child" ||
    id === "hep-encefalopatia" ||
    id === "hep-ascite" ||
    id === "hep-pbe-shr"
  ) return "Hepato · descompensação";
  if (
    id === "hep-hipertensao-portal" ||
    id === "hep-varizes" ||
    id === "hep-tips-cirurgia-htp"
  ) {
    return "Hepato · HTP/varizes";
  }
  if (id === "hep-transplante") return "Hepato · transplante";
  if (
    id === "hep-cistos-vias-biliares" ||
    id === "hep-lesao-iatrogenica-biliar" ||
    id === "hep-abscesso-piogenico" ||
    id === "hep-abscesso-amebiano" ||
    id === "hep-cisto-hidatico"
  ) {
    return "Hepato · biliar";
  }
  if (id.indexOf("hep-") === 0) return "Hepatologia";
  if (
    id === "hema-anemia-intro" ||
    id === "hema-ferropriva" ||
    id === "hema-anemia-doenca-cronica"
  ) {
    return "Hemato · anemias";
  }
  if (id === "hema-megaloblastica") return "Hemato · megaloblástica";
  if (
    id === "hema-hemoliticas-geral" ||
    id === "hema-ahai" ||
    id === "hema-g6pd-esferocitose" ||
    id === "hema-talassemia" ||
    id === "hema-falciforme"
  ) {
    return "Hemato · hemolíticas";
  }
  if (id === "hema-smd" || id === "hema-sideroblastica") return "Hemato · SMD";
  if (
    id === "hema-lma" ||
    id === "hema-lla" ||
    id === "hema-lmc" ||
    id === "hema-llc"
  ) {
    return "Hemato · leucemias";
  }
  if (id === "hema-pv" || id === "hema-mf" || id === "hema-te") return "Hemato · NMP";
  if (id === "hema-hodgkin" || id === "hema-lnh") return "Hemato · linfomas";
  if (id === "hema-mieloma") return "Hemato · mieloma";
  if (id === "hema-hemostasia") return "Hemato · hemostasia";
  if (id === "hema-pti" || id === "hema-ptt-shuh") return "Hemato · plaquetas";
  if (
    id === "hema-hemofilia" ||
    id === "hema-von-willebrand" ||
    id === "hema-cid" ||
    id === "hema-anticoagulacao"
  ) {
    return "Hemato · coagulação";
  }
  if (id.indexOf("hema-") === 0) return "Hematologia";
  if (
    id === "endo-tireoide-basico" ||
    id === "endo-hipertireoidismo" ||
    id === "endo-graves"
  ) {
    return "Endo · tireoide";
  }
  if (id === "endo-hipotireoidismo" || id === "endo-tireoidites") {
    return "Endo · hipotireo";
  }
  if (id === "endo-nodulos-cancer-tireoide") return "Endo · nódulos";
  if (
    id === "endo-cushing" ||
    id === "endo-addison-insuficiencia-adrenal" ||
    id === "endo-feocromocitoma" ||
    id === "endo-hiperaldosteronismo"
  ) {
    return "Endo · adrenal";
  }
  if (id === "endo-paratireoide") return "Endo · paratireoide";
  if (id === "endo-hipofise") return "Endo · hipófise";
  if (id === "endo-dm-basico" || id === "endo-dm-tratamento") return "Endo · DM";
  if (id === "endo-dm-cronicas" || id === "endo-pe-diabetico") {
    return "Endo · DM crônicas";
  }
  if (id === "endo-dm-agudas" || id === "endo-hipoglicemia") {
    return "Endo · urgências DM";
  }
  if (id === "endo-obesidade") return "Endo · obesidade";
  if (id.indexOf("endo-") === 0) return "Endocrinologia";
  if (id === "cardio-scc") return "Cardio · SCC";
  if (
    id === "cardio-sca-sem-sst" ||
    id === "cardio-sca-com-sst" ||
    id === "cardio-iam-complicacoes" ||
    id === "cardio-revasc"
  ) {
    return "Cardio · SCA";
  }
  if (id === "cardio-pericardiopatias") return "Cardio · pericárdio";
  if (id === "cardio-icc-basico" || id === "cardio-icc-tratamento") return "Cardio · ICC";
  if (id === "cardio-has") return "Cardio · HAS";
  if (id === "cardio-valvas-estenose" || id === "cardio-valvas-insuficiencia") {
    return "Cardio · valvas";
  }
  if (
    id === "cardio-cardiomiopatias" ||
    id === "cardio-semiologia-hp" ||
    id === "cardio-transplante"
  ) {
    return "Cardio · miopatias";
  }
  if (id === "cardio-fa-flutter" || id === "cardio-tvs-svt") return "Cardio · FA/TV";
  if (id === "cardio-bradi-bav" || id === "cardio-bloqueios-ecg") return "Cardio · bradi";
  if (id === "cardio-pcr" || id === "cardio-antiarrhythmicos") return "Cardio · PCR";
  if (id.indexOf("cardio-") === 0 || id.indexOf("cardio") === 0) return "Cardiologia";
  if (id.indexOf("psus-") === 0) return "Prev · SUS";
  if (id.indexOf("pepi-") === 0) return "Prev · epidemiologia";
  if (id.indexOf("pvig-") === 0) return "Prev · vigilância";
  if (id.indexOf("pind-") === 0) return "Prev · indicadores";
  if (id.indexOf("prev-") === 0) return "Preventiva";
  if (id.indexOf("exa-") === 0) return "Infecto · Exantemas";
  if (id.indexOf("inf-") === 0) return "Infecto · Dengue/Sepse";
  if (id.indexOf("crd-") === 0) return "Cardio pediátrica";
  if (id.indexOf("resp-") === 0) return "Respiratório";
  if (id.indexOf("gast-") === 0) return "Gastro";
  if (id.indexOf("neu-") === 0) return "Neuro";
  if (id.indexOf("hem-") === 0) return "Hemato pediátrica";
  if (id.indexOf("ort-") === 0) return "Orto / Reumato";
  if (id.indexOf("cir-") === 0) return "Cirurgia pediátrica";
  if (id.indexOf("par-") === 0) return "Parasitoses";
  if (id.indexOf("alg-") === 0) return "Alergia";
  if (id.indexOf("soc-") === 0) return "Maus-tratos";
  if (id.indexOf("end-") === 0) return "Endócrino pediátrico";
  if (id.indexOf("urg-") === 0) return "Urgências";
  if (id.indexOf("gin1-") === 0) return "Endócrino / ciclo";
  if (id.indexOf("gin2-") === 0) return "SUA / miomatose";
  if (id.indexOf("gin3-") === 0) return "Climatério / urogin";
  if (id.indexOf("gin4-") === 0) return "Mastologia / ovário";
  if (id.indexOf("gin5-") === 0) return "Oncoginecologia";
  if (id.indexOf("gin6-") === 0) return "Infecto / IST";
  if (id.indexOf("obs1-") === 0) return "Parto operatório · Med. fetal · Puerpério";
  if (id.indexOf("obs2-") === 0) return "Diagnóstico de gravidez · Pré-natal";
  if (id.indexOf("obs3-") === 0) return "Parto · RPMO · Prematuridade";
  if (id.indexOf("obs4-") === 0) return "Sangramentos na gestação";
  if (id.indexOf("obs5-") === 0) return "HAS · Diabetes · Gemelaridade";
  if (id.indexOf("obs-") === 0) return "Obstetrícia";
  if (id.indexOf("reu1-ar-") === 0) return "Artrite reumatoide";
  if (id === "reu1-aij-still") return "AIJ · Still";
  if (id.indexOf("reu1-") === 0) return "Espondiloartrites";
  if (id.indexOf("reu2-oa-") === 0) return "Osteoartrose";
  if (id.indexOf("reu2-gota-") === 0 || id === "reu2-pseudogota") return "Gota e cristais";
  if (id.indexOf("reu2-fr-") === 0) return "Febre reumática";
  if (id === "reu2-septica" || id === "reu2-tb-misc") return "Artrites infecciosas";
  if (id.indexOf("reu2-") === 0) return "Extras REU2";
  if (id.indexOf("reu3-les-") === 0) return "LES";
  if (id === "reu3-saf") return "SAF";
  if (id.indexOf("reu3-es-") === 0) return "Esclerose sistêmica";
  if (id === "reu3-miopatias" || id === "reu3-sjogren" || id === "reu3-dmtc") {
    return "Miopatias · Sjögren · DMTC";
  }
  if (id.indexOf("reu3-vasc-") === 0) return "Vasculites";
  if (id === "reu3-amiloidose") return "Amiloidoses";
  if (id.indexOf("reu3-") === 0) return "Reumatologia REU3";
  if (id.indexOf("psi-alcool-") === 0 || id === "psi-outras-drogas") return "Substâncias";
  if (id === "psi-depressao" || id === "psi-bipolar-litio") return "Humor";
  if (id.indexOf("psi-esquizo-") === 0) return "Psicose";
  if (id === "psi-ansiedade-toc") return "Ansiedade · TOC";
  if (id === "psi-delirium" || id === "psi-demencia") return "Orgânicos";
  if (id === "psi-alimentares") return "Alimentares";
  if (id === "psi-psico-basico" || id === "psi-personalidade") return "Psicopatologia";
  if (id.indexOf("psi-") === 0) return "Psiquiatria";
  if (id.indexOf("pnm-intensiva-") === 0) return "Intensiva";
  if (id === "pnm-tep") return "TEP";
  if (id.indexOf("pnm-asma-") === 0) return "Asma";
  if (id === "pnm-dpoc") return "DPOC";
  if (id === "pnm-derrame") return "Derrame";
  if (id === "pnm-cancer") return "Câncer de pulmão";
  if (id === "pnm-basico") return "Espirometria · gasometria";
  if (id === "pnm-intersticial") return "Intersticiais";
  if (id.indexOf("pnm-tb-extra") === 0) return "TB extrapulmonar";
  if (id.indexOf("pnm-tb-") === 0) return "Tuberculose";
  if (id === "pnm-micoses") return "Micoses";
  if (id.indexOf("pnm-") === 0) return "Pneumologia";
  if (id.indexOf("neu-avc-") === 0) return "AVC";
  if (id === "neu-epilepsia") return "Epilepsia";
  if (id === "neu-coma-hic") return "Coma · HIC";
  if (id === "neu-cefaleia") return "Cefaleias";
  if (id === "neu-neuromuscular") return "Neuromuscular";
  if (id === "neu-demencia-parkinson") return "Demências · Parkinson";
  if (id === "neu-em-tumores") return "EM · tumores";
  if (id.indexOf("neu-") === 0) return "Neurologia";
  if (
    id === "cg-apendicite" ||
    id === "cg-colecistite" ||
    id === "cg-diverticulite" ||
    id === "cg-obstrucao" ||
    id === "cg-abdome-vascular" ||
    id === "crr-hernia-obstrucao"
  ) return "Abdome agudo";
  if (
    id.indexOf("cir2-") === 0 ||
    id === "crr-trm-face" ||
    id === "ciresp-resposta-trauma" ||
    id === "ciresp-choque-tipos"
  ) return "Trauma · ATLS";
  if (id.indexOf("cir3-") === 0 || id === "crr-anestesia-avancada" || id === "crr-infeccao-cirurgica") {
    return "Pré/pós-op · Anestesia · Hérnias";
  }
  if (id.indexOf("cir1-ped-") === 0) return "Cirurgia infantil";
  if (
    id === "cir1-aaa" ||
    id === "cir1-aneurismas-perifericos" ||
    id === "cir1-dap" ||
    id === "cir1-oclusao-arterial" ||
    id === "cir1-ivc"
  ) return "Cirurgia vascular";
  if (
    id === "cg-vesicula" ||
    id === "cg-estomago" ||
    id === "cg-colon" ||
    id === "cg-pancreas" ||
    id === "cg-figado" ||
    id.indexOf("crr-esofago") === 0 ||
    id.indexOf("crr-estomago") === 0 ||
    id.indexOf("crr-colorretal") === 0 ||
    id.indexOf("crr-pancreas") === 0 ||
    id.indexOf("crr-figado") === 0 ||
    id === "cir1-hemorroidas" ||
    id === "cir1-abscesso-fistula" ||
    id === "cir1-prolapso" ||
    id === "cir1-bariatrica" ||
    id === "crr-procto-avancado"
  ) return "Aparelho digestivo";
  if (
    id === "cg-urologia" ||
    id.indexOf("crr-urologia") === 0 ||
    id === "cg-torax" ||
    id.indexOf("crr-torax") === 0 ||
    id.indexOf("ciresp-") === 0 ||
    id === "cir1-cabeca-pescoco" ||
    id === "crr-partes-moles" ||
    id === "crr-plastica-avancada" ||
    id === "crr-mama-tireoide" ||
    id === "crr-transplante-miscelanea"
  ) return "Especialidades R1";
  if (id.indexOf("cir1-") === 0) return "Cirurgia";
  if (id.indexOf("crr-") === 0) return "Especialidades R1";
  if (id.indexOf("cardio") === 0) return "Cardiologia";
  if (id.indexOf("psus-") === 0) return "Prev · SUS";
  if (id.indexOf("pepi-") === 0) return "Prev · epidemiologia";
  if (id.indexOf("pvig-") === 0) return "Prev · vigilância";
  if (id.indexOf("pind-") === 0) return "Prev · indicadores";
  if (id.indexOf("prev-") === 0) return "Preventiva";
  return "Subtema";
}

function aprovaRenderDeckCards (specialty, grid, deckOrder) {
  let decks = AprovaFlashcards.decksBySpecialty(specialty).slice();
  if (Array.isArray(deckOrder) && deckOrder.length) {
    const allow = new Set(deckOrder);
    decks = decks.filter(d => allow.has(d.id));
    decks.sort((a, b) => deckOrder.indexOf(a.id) - deckOrder.indexOf(b.id));
  } else {
    decks.sort((a, b) => {
      const rank = id => {
        const s = String(id || "");
        const order = [
          "neo-", "ali-", "nut-", "imu-", "dm-",
          "itu-", "nef-", "exa-", "inf-", "crd-",
          "resp-", "gast-", "neu-", "hem-", "ort-",
          "cir-", "par-", "alg-", "soc-", "end-", "urg-"
        ];
        for (let i = 0; i < order.length; i++) {
          if (s.indexOf(order[i]) === 0) return i;
        }
        return 99;
      };
      const d = rank(a.id) - rank(b.id);
      return d !== 0 ? d : String(a.name || "").localeCompare(String(b.name || ""), "pt-BR");
    });
  }
  grid.innerHTML = "";

  if (!decks.length) {
    grid.innerHTML = "<p class=\"muted\">Nenhum deck disponível ainda nesta especialidade.</p>";
    return;
  }

  decks.forEach(deck => {
    const n = (deck.cards || []).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card";
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">" + aprovaDeckKicker(deck) + "</span>" +
      "<strong>" + deck.name + "</strong>" +
      "<span>" + n + " card" + (n === 1 ? "" : "s") + "</span>";
    btn.addEventListener("click", () => {
      AprovaFlashcards.startDeck(deck.id);
      aprovaGoTo("flashcards", { study: true });
    });
    grid.appendChild(btn);
  });
}

function aprovaFormatPct (value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 1,
    maximumFractionDigits: 1
  }) + "%";
}

async function aprovaLoadOverviewStats (specialty) {
  const meta = aprovaRichSpecialtyMeta(specialty);
  const key = meta.overviewCacheKey || meta.id;
  if (Object.prototype.hasOwnProperty.call(aprovaOverviewStatsCache, key)) {
    return aprovaOverviewStatsCache[key];
  }
  try {
    const res = await fetch(meta.overviewUrl);
    if (!res.ok) throw new Error("fail");
    aprovaOverviewStatsCache[key] = await res.json();
  } catch {
    aprovaOverviewStatsCache[key] = null;
  }
  return aprovaOverviewStatsCache[key];
}

function aprovaLoadPedOverviewStats () {
  return aprovaLoadOverviewStats("pediatria");
}

function aprovaRenderPedOverviewStats (focusId, yearId) {
  const meta = aprovaRichSpecialtyMeta(aprovaActiveSpecialty || "pediatria");
  const root = document.getElementById("esp-ped-overview");
  const options = document.getElementById("esp-ped-overview-options");
  const bars = document.getElementById("esp-ped-overview-bars");
  const title = document.getElementById("esp-ped-overview-title");
  const sub = document.getElementById("esp-ped-overview-sub");
  const verdict = document.getElementById("esp-ped-overview-verdict");
  const unitEl = document.getElementById("esp-ped-overview-unit");
  const sourceEl = document.getElementById("esp-ped-overview-source");
  const banner = document.getElementById("esp-ped-enamed-banner");
  if (!root || !options || !bars) return Promise.resolve();

  if (focusId != null) aprovaActivePedOverviewFocus = focusId;
  if (yearId != null) aprovaActiveOverviewYear = yearId;

  return aprovaLoadOverviewStats(meta.id).then(data => {
    if (!data || !Array.isArray(data.profiles) || !data.profiles.length) {
      root.hidden = true;
      return;
    }

    root.hidden = false;
    const requested = aprovaActivePedOverviewFocus || "geral";
    const profile = data.profiles.find(p => p.id === requested)
      || data.profiles.find(p => p.id === "geral")
      || data.profiles[0];
    aprovaActivePedOverviewFocus = profile.id;
    if (!aprovaActiveOverviewYear) aprovaActiveOverviewYear = "geral";

    aprovaRenderExamYearFilters(options, {
      profiles: data.profiles,
      activeId: profile.id,
      activeYear: aprovaActiveOverviewYear,
      chooserOpen: aprovaOverviewExamChooserOpen,
      onExam: id => {
        aprovaOverviewExamChooserOpen = false;
        aprovaRenderPedOverviewStats(id, aprovaActiveOverviewYear);
      },
      onYear: y => {
        aprovaRenderPedOverviewStats(aprovaActivePedOverviewFocus, y);
      },
      onToggleChooser: () => {
        aprovaOverviewExamChooserOpen = !aprovaOverviewExamChooserOpen;
        aprovaRenderPedOverviewStats(aprovaActivePedOverviewFocus, aprovaActiveOverviewYear);
      }
    });

    if (banner) banner.hidden = profile.id !== "enamed";

    const slice = aprovaResolveYearSlice(profile, aprovaActiveOverviewYear);
    const sourceType = profile.sourceType || "estimativa";
    const typeLabel = sourceType === "levantamento"
      ? "Levantamento público (cursinho)"
      : (sourceType === "sintese" ? "Síntese de levantamentos públicos" : "Estimativa por padrão de banca");
    const yearTxt = aprovaYearLabel(aprovaActiveOverviewYear);
    const countLabel = sourceType === "estimativa"
      ? (" questões de " + meta.countNoun + " (base ilustrativa)")
      : (" questões de " + meta.countNoun + " analisadas");

    if (title) {
      title.textContent = profile.id === "geral"
        ? ("O que mais caiu em " + meta.shortLabel + " · Geral Brasil · " + yearTxt)
        : ("O que mais caiu em " + meta.shortLabel + " · " + aprovaExamLabel(profile) + " · " + yearTxt);
    }
    if (sub) {
      sub.textContent = typeLabel + " · ciclo " + yearTxt +
        (slice.sampleSize ? (" · " + slice.sampleSize + countLabel) : "");
    }
    if (verdict) verdict.textContent = slice.verdict || "";

    if (unitEl) {
      unitEl.hidden = false;
      unitEl.textContent = "Cada barra = % do tema · ao lado, quantas questões caíram (ou a estimativa proporcional). " +
        (data.note || "Recorte 2024–2026.") +
        (slice.note ? (" " + slice.note) : "");
    }

    bars.innerHTML = (slice.priorities || []).map(p => {
      const pct = Number(p.pct);
      const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
      const detail = p.n != null ? (" · " + p.n + " quest.") : "";
      return (
        "<div class=\"rev-bar-row\">" +
          "<span>" + p.tema + detail + "</span>" +
          "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
          "<em>" + aprovaFormatPct(pct) + "</em>" +
        "</div>"
      );
    }).join("");

    if (sourceEl) {
      sourceEl.textContent = slice.source ? ("Fonte: " + slice.source) : "";
    }
  });
}

const APROVA_FC_HOME_STATS_AREAS = [
  { id: "clinica", label: "Clínica" },
  { id: "cirurgia", label: "Cirurgia" },
  { id: "pediatria", label: "Pediatria" },
  { id: "go", label: "GO" },
  { id: "preventiva", label: "Preventiva" }
];

function aprovaRenderFlashcardHomeStats (specId, focusId, yearId) {
  const root = document.getElementById("fc-home-stats");
  const areasEl = document.getElementById("fc-home-stats-areas");
  const options = document.getElementById("fc-home-stats-options");
  const bars = document.getElementById("fc-home-stats-bars");
  const title = document.getElementById("fc-home-stats-title");
  const sub = document.getElementById("fc-home-stats-sub");
  const verdict = document.getElementById("fc-home-stats-verdict");
  const unitEl = document.getElementById("fc-home-stats-unit");
  const sourceEl = document.getElementById("fc-home-stats-source");
  if (!root || !areasEl || !options || !bars) return Promise.resolve();

  if (specId) aprovaFcHomeStatsSpec = specId;
  if (focusId != null) aprovaFcHomeStatsFocus = focusId;
  if (yearId != null) aprovaFcHomeStatsYear = yearId;
  if (!aprovaFcHomeStatsSpec) aprovaFcHomeStatsSpec = "clinica";
  if (!aprovaFcHomeStatsFocus) aprovaFcHomeStatsFocus = "geral";
  if (!aprovaFcHomeStatsYear) aprovaFcHomeStatsYear = "geral";

  areasEl.innerHTML = "";
  APROVA_FC_HOME_STATS_AREAS.forEach(area => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "esp-exam-btn" + (area.id === aprovaFcHomeStatsSpec ? " active" : "");
    btn.textContent = area.label;
    btn.addEventListener("click", () => {
      aprovaFcHomeExamChooserOpen = false;
      const preferred = aprovaPreferredExamFocus();
      aprovaFcHomeStatsFocus = preferred;
      aprovaFcHomeStatsYear = "geral";
      aprovaRenderFlashcardHomeStats(area.id, preferred, "geral");
    });
    areasEl.appendChild(btn);
  });

  const prevSpec = aprovaActiveSpecialty;
  const prevCli = aprovaActiveCliArea;
  const prevGo = aprovaActiveGoArea;
  aprovaActiveSpecialty = aprovaFcHomeStatsSpec;
  aprovaActiveCliArea = null;
  aprovaActiveGoArea = aprovaFcHomeStatsSpec === "go" ? "ginecologia" : null;

  return aprovaLoadOverviewStats(aprovaFcHomeStatsSpec).then(data => {
    const shortLabel = APROVA_SPECIALTY_LABELS[aprovaFcHomeStatsSpec]
      || (aprovaFcHomeStatsSpec === "go" ? "Ginecologia" : "área");
    aprovaActiveSpecialty = prevSpec;
    aprovaActiveCliArea = prevCli;
    aprovaActiveGoArea = prevGo;

    if (!data || !Array.isArray(data.profiles) || !data.profiles.length) {
      bars.innerHTML = "<p class=\"muted\">Estatísticas desta área em breve.</p>";
      return;
    }

    const profile = data.profiles.find(p => p.id === aprovaFcHomeStatsFocus)
      || data.profiles.find(p => p.id === "geral")
      || data.profiles[0];
    aprovaFcHomeStatsFocus = profile.id;

    aprovaRenderExamYearFilters(options, {
      profiles: data.profiles,
      activeId: profile.id,
      activeYear: aprovaFcHomeStatsYear,
      chooserOpen: aprovaFcHomeExamChooserOpen,
      onExam: id => {
        aprovaFcHomeExamChooserOpen = false;
        aprovaRenderFlashcardHomeStats(aprovaFcHomeStatsSpec, id, aprovaFcHomeStatsYear);
      },
      onYear: y => {
        aprovaRenderFlashcardHomeStats(aprovaFcHomeStatsSpec, aprovaFcHomeStatsFocus, y);
      },
      onToggleChooser: () => {
        aprovaFcHomeExamChooserOpen = !aprovaFcHomeExamChooserOpen;
        aprovaRenderFlashcardHomeStats(aprovaFcHomeStatsSpec, aprovaFcHomeStatsFocus, aprovaFcHomeStatsYear);
      }
    });

    const slice = aprovaResolveYearSlice(profile, aprovaFcHomeStatsYear);
    const sourceType = profile.sourceType || "estimativa";
    const typeLabel = sourceType === "levantamento"
      ? "Levantamento público (cursinho)"
      : (sourceType === "sintese" ? "Síntese de levantamentos públicos" : "Estimativa por padrão de banca");
    const yearTxt = aprovaYearLabel(aprovaFcHomeStatsYear);

    if (title) {
      title.textContent = profile.id === "geral"
        ? ("O que mais caiu em " + shortLabel + " · Geral Brasil · " + yearTxt)
        : ("O que mais caiu em " + shortLabel + " · " + aprovaExamLabel(profile) + " · " + yearTxt);
    }
    if (sub) {
      sub.textContent = typeLabel + " · ciclo " + yearTxt +
        (slice.sampleSize ? (" · " + slice.sampleSize + " questões analisadas") : "");
    }
    if (verdict) verdict.textContent = slice.verdict || "";
    if (unitEl) {
      unitEl.hidden = false;
      unitEl.textContent = "Cada barra = % do tema · ao lado, quantas questões caíram (ou a estimativa proporcional).";
    }
    bars.innerHTML = (slice.priorities || []).map(p => {
      const pct = Number(p.pct);
      const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
      const detail = p.n != null ? (" · " + p.n + " quest.") : "";
      return (
        "<div class=\"rev-bar-row\">" +
          "<span>" + p.tema + detail + "</span>" +
          "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
          "<em>" + aprovaFormatPct(pct) + "</em>" +
        "</div>"
      );
    }).join("");
    if (sourceEl) sourceEl.textContent = slice.source ? ("Fonte: " + slice.source) : "";
  }).catch(() => {
    aprovaActiveSpecialty = prevSpec;
    aprovaActiveCliArea = prevCli;
    aprovaActiveGoArea = prevGo;
    bars.innerHTML = "<p class=\"muted\">Não foi possível carregar as estatísticas.</p>";
  });
}

async function aprovaPedModuleStats (moduleId) {
  if (typeof AprovaRevisao === "undefined") {
    return { decks: 0, cards: 0, deckOrder: [] };
  }
  const profile = await AprovaRevisao.getProfile("geral", moduleId);
  const deckOrder = (profile && profile.deckOrder) || [];
  let cards = 0;
  deckOrder.forEach(id => {
    const deck = AprovaFlashcards.decks.find(d => d.id === id);
    cards += (deck && deck.cards ? deck.cards.length : 0);
  });
  return { decks: deckOrder.length, cards, deckOrder };
}

async function aprovaSpecialtyAreaStats (specialty, areaId) {
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(specialty, areaId)
    : [];
  let cards = 0;
  let decks = 0;
  for (const m of modules) {
    const stats = await aprovaPedModuleStats(m.id);
    cards += stats.cards;
    decks += stats.decks;
  }
  return { cards, decks, groups: modules.length, modules };
}

async function aprovaGoAreaStats (areaId) {
  return aprovaSpecialtyAreaStats("go", areaId);
}

async function aprovaCliAreaStats (areaId) {
  return aprovaSpecialtyAreaStats("clinica", areaId);
}

async function aprovaRenderGoAreaCards () {
  const grid = document.getElementById("esp-group-grid");
  const groups = document.getElementById("esp-groups");
  if (!grid || !groups) return;

  groups.hidden = false;
  const areas = typeof AprovaRevisao !== "undefined" && typeof AprovaRevisao.listGoAreas === "function"
    ? AprovaRevisao.listGoAreas()
    : [
      { id: "ginecologia", label: "Ginecologia", blurb: "" },
      { id: "obstetricia", label: "Obstetrícia", blurb: "" }
    ];

  grid.innerHTML = "";
  for (const area of areas) {
    const stats = await aprovaGoAreaStats(area.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card";
    const detail = aprovaIsStatsMode()
      ? "Ver o que mais caiu nesta área"
      : (stats.groups
        ? (stats.cards + " card" + (stats.cards === 1 ? "" : "s") +
          " · " + stats.groups + " grupo" + (stats.groups === 1 ? "" : "s"))
        : "Em breve");
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">Área</span>" +
      "<strong>" + area.label + "</strong>" +
      "<span>" + detail + "</span>";
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      aprovaOpenGoArea(area.id).catch(err => {
        console.error("Falha ao abrir área", area.id, err);
      });
    });
    grid.appendChild(btn);
  }
}

async function aprovaRenderCliAreaCards () {
  const grid = document.getElementById("esp-group-grid");
  const groups = document.getElementById("esp-groups");
  if (!grid || !groups) return;

  groups.hidden = false;
  const areas = typeof AprovaRevisao !== "undefined" && typeof AprovaRevisao.listCliAreas === "function"
    ? AprovaRevisao.listCliAreas()
    : [
      { id: "cardiologia", label: "Cardiologia", blurb: "" },
      { id: "reumatologia", label: "Reumatologia", blurb: "" },
      { id: "psiquiatria", label: "Psiquiatria", blurb: "" },
      { id: "pneumologia", label: "Pneumologia", blurb: "" },
      { id: "neurologia", label: "Neurologia", blurb: "" },
      { id: "nefrologia", label: "Nefrologia", blurb: "" },
      { id: "infectologia", label: "Infectologia", blurb: "" },
      { id: "hepatologia", label: "Hepatologia", blurb: "" },
      { id: "hematologia", label: "Hematologia", blurb: "" },
      { id: "endocrinologia", label: "Endocrinologia", blurb: "" }
    ];

  grid.innerHTML = "";
  for (const area of areas) {
    const stats = await aprovaCliAreaStats(area.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card";
    const detail = aprovaIsStatsMode()
      ? "Ver o que mais caiu nesta área"
      : (stats.groups
        ? (stats.cards + " card" + (stats.cards === 1 ? "" : "s") +
          " · " + stats.groups + " grupo" + (stats.groups === 1 ? "" : "s"))
        : "Em breve");
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">Área</span>" +
      "<strong>" + area.label + "</strong>" +
      "<span>" + detail + "</span>";
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      aprovaOpenCliArea(area.id).catch(err => {
        console.error("Falha ao abrir área", area.id, err);
      });
    });
    grid.appendChild(btn);
  }
}

async function aprovaRenderPedGroupCards (activeModuleId, options) {
  const opts = options || {};
  const grid = document.getElementById("esp-group-grid");
  const groups = document.getElementById("esp-groups");
  if (!grid || !groups) return;

  groups.hidden = false;
  const specialty = aprovaActiveSpecialty || "pediatria";
  const area = opts.area || null;
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(specialty, area)
    : [];
  grid.innerHTML = "";

  if (!modules.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = specialty === "go"
      ? "Grupos desta área entram em breve."
      : "Nenhum grupo disponível.";
    grid.appendChild(empty);
    return;
  }

  const statsMode = aprovaIsStatsMode();
  for (const m of modules) {
    const stats = await aprovaPedModuleStats(m.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card" + (m.id === activeModuleId ? " dash-card--active" : "");
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">" + (statsMode ? "Tema" : "Grupo") + "</span>" +
      "<strong>" + m.label + "</strong>" +
      "<span>" + (statsMode
        ? "Ver o que mais caiu neste tema"
        : (stats.cards + " card" + (stats.cards === 1 ? "" : "s") +
          " · " + stats.decks + " subtema" + (stats.decks === 1 ? "" : "s"))) + "</span>";
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      if (statsMode) {
        const meta = aprovaRichSpecialtyMeta(aprovaActiveSpecialty || "pediatria");
        Promise.resolve(meta.openModule(m.id)).catch(err => {
          console.error("Falha ao abrir estatísticas", m.id, err);
        });
        return;
      }
      aprovaOpenPedDeckPicker(m.id).catch(err => {
        console.error("Falha ao abrir subtemas", m.id, err);
      });
    });
    grid.appendChild(btn);
  }
}

let aprovaDeckModalIgnoreCloseUntil = 0;

function aprovaClosePedDeckModal () {
  if (Date.now() < aprovaDeckModalIgnoreCloseUntil) return;
  const modal = document.getElementById("esp-deck-modal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function aprovaShowPedDeckModal () {
  const modal = document.getElementById("esp-deck-modal");
  if (!modal) return;
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  aprovaDeckModalIgnoreCloseUntil = Date.now() + 400;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function aprovaPedModalSelectedIds () {
  return Array.from(document.querySelectorAll("#esp-deck-modal-list input[type=checkbox]:checked"))
    .map(el => el.value)
    .filter(Boolean);
}

function aprovaUpdatePedModalCount () {
  const countEl = document.getElementById("esp-deck-modal-count");
  const startBtn = document.getElementById("esp-deck-modal-start");
  const allBox = document.getElementById("esp-deck-modal-all");
  const boxes = Array.from(document.querySelectorAll("#esp-deck-modal-list input[type=checkbox]"));
  const selected = boxes.filter(b => b.checked);
  let cards = 0;
  selected.forEach(box => {
    const deck = AprovaFlashcards.decks.find(d => d.id === box.value);
    cards += deck && deck.cards ? deck.cards.length : 0;
  });
  if (countEl) {
    countEl.textContent = selected.length
      ? (selected.length + " subtema" + (selected.length === 1 ? "" : "s") +
        " · " + cards + " card" + (cards === 1 ? "" : "s"))
      : "Nenhum subtema selecionado.";
  }
  if (startBtn) startBtn.disabled = selected.length === 0;
  if (allBox) {
    allBox.checked = boxes.length > 0 && selected.length === boxes.length;
    allBox.indeterminate = selected.length > 0 && selected.length < boxes.length;
  }
}

const APROVA_PED_MODULE_PREFIXES = {
  neonatologia: ["neo-"],
  alimentacao: ["ali-"],
  "avaliacao-nutricional": ["nut-"],
  imunizacoes: ["imu-"],
  diabetes: ["dm-"],
  ped6: ["itu-", "exa-", "crd-", "urg-"],
  respiratorio: ["resp-"],
  "gastro-neuro": ["gast-", "neu-"],
  "nefro-extra": ["nef-sindromes"],
  "r1-extra": ["inf-", "hem-", "ort-", "end-", "urg-"],
  "r1-lacunas": ["cir-", "par-", "alg-", "soc-", "ort-"],
  gin1: ["gin1-"],
  gin2: ["gin2-"],
  gin3: ["gin3-"],
  gin4: ["gin4-"],
  gin5: ["gin5-"],
  gin6: ["gin6-"],
  obs1: ["obs1-"],
  obs2: ["obs2-"],
  obs3: ["obs3-"],
  obs4: ["obs4-"],
  obs5: ["obs5-"],
  "cir-abdome-agudo": [],
  "cir-trauma-atls": [],
  "cir-trauma-torax": [],
  "cir-trauma-abdome": [],
  "cir-trauma-neuro": [],
  "cir-preop": [],
  "cir-posop": [],
  "cir-hernias": [],
  "cir-anestesia": [],
  "cir-infantil": [],
  "cir-vascular": [],
  "cir-digestivo-alto": [],
  "cir-colorretal": [],
  "cir-hepato-pancreas": [],
  "cir-urologia": [],
  "cir-torax-eletivo": [],
  "cir-queimaduras-plastica": [],
  "cir-cabeca-mama": [],
  "cir-suporte": [],
  "reu-ar": ["reu1-ar-"],
  "reu-aij": ["reu1-aij-"],
  "reu-spa": ["reu1-spa-", "reu1-ea", "reu1-artrite-", "reu1-psoriasica", "reu1-enteropatica", "reu1-aines"],
  "reu-oa": ["reu2-oa-"],
  "reu-cristais": ["reu2-gota-", "reu2-pseudogota"],
  "reu-fr": ["reu2-fr-"],
  "reu-infecciosa": ["reu2-septica", "reu2-tb-"],
  "reu-extras2": ["reu2-policondrite", "reu2-ffm", "reu2-fibromialgia"],
  "reu-les": ["reu3-les-"],
  "reu-saf": ["reu3-saf"],
  "reu-es": ["reu3-es-"],
  "reu-outras-colag": ["reu3-miopatias", "reu3-sjogren", "reu3-dmtc"],
  "reu-vasculites": ["reu3-vasc-"],
  "reu-amiloidose": ["reu3-amiloidose"],
  "psi-substancias": ["psi-alcool-", "psi-outras-drogas"],
  "psi-humor": ["psi-depressao", "psi-bipolar-litio"],
  "psi-psicose": ["psi-esquizo-"],
  "psi-ansiedade": ["psi-ansiedade-toc"],
  "psi-organicos": ["psi-delirium", "psi-demencia"],
  "psi-alimentares": ["psi-alimentares"],
  "psi-basico": ["psi-psico-basico", "psi-personalidade"],
  "pnm-intensiva": ["pnm-intensiva-"],
  "pnm-tep": ["pnm-tep"],
  "pnm-asma": ["pnm-asma-"],
  "pnm-dpoc": ["pnm-dpoc"],
  "pnm-derrame": ["pnm-derrame"],
  "pnm-cancer": ["pnm-cancer"],
  "pnm-basico": ["pnm-basico"],
  "pnm-intersticial": ["pnm-intersticial"],
  "pnm-tb": ["pnm-tb-basico", "pnm-tb-clinica", "pnm-tb-tratamento", "pnm-tb-contatos"],
  "pnm-tb-extra": ["pnm-tb-extra"],
  "pnm-micoses": ["pnm-micoses"],
  "neu-avc": ["neu-avc-"],
  "neu-epilepsia": ["neu-epilepsia"],
  "neu-coma": ["neu-coma-"],
  "neu-cefaleia": ["neu-cefaleia"],
  "neu-neuromuscular": ["neu-neuromuscular"],
  "neu-demencia": ["neu-demencia-"],
  "neu-em": ["neu-em-"],
  "nef-basico": ["nef-basico"],
  "nef-nefritica": ["nef-nefritica-"],
  "nef-nefrotica": ["nef-nefrotica"],
  "nef-especificas": ["nef-dlm-", "nef-membranosa", "nef-berger", "nef-gnrp", "nef-sistemicas"],
  "nef-nta": ["nef-nta", "nef-nta-", "nef-rabdo-"],
  "nef-nia-nic": ["nef-nia", "nef-nic-"],
  "nef-tubulares": ["nef-atr-"],
  "nef-vascular": ["nef-renovascular", "nef-ateroembolo"],
  "nef-solucoes": ["nef-cristaloides", "nef-magnesio", "nef-tampoes"],
  "nef-ira": ["nef-ira-"],
  "nef-drc": ["nef-drc-"],
  "nef-litiase": ["nef-litiase-"],
  "nef-prostata": ["nef-hpb", "nef-ca-prostata"],
  "nef-uro-extra": ["nef-ca-uro", "nef-obstrucao-"],
  "infc-protozoarios": ["infc-amebiase", "infc-giardia"],
  "infc-helmintos": ["infc-ascaris", "infc-ancilostoma", "infc-strongyloides", "infc-oxiuro-tricuris"],
  "infc-cestoides": ["infc-tenias", "infc-toxocara"],
  "infc-esquisto": ["infc-esquisto", "infc-parasito-mapa"],
  "infc-pac-clinica": ["infc-pac-basico", "infc-pac-rx", "infc-pac-agentes"],
  "infc-pac-conduta": ["infc-pac-escores", "infc-pac-tx", "infc-pac-influenza", "infc-pavm", "infc-pac-mapa"],
  "infc-abscesso": ["infc-abscesso"],
  "infc-antibioticos": ["infc-atb-"],
  "infc-hiv-oi": ["infc-hiv-mac", "infc-hiv-fungos", "infc-hiv-gi", "infc-hiv-hepato"],
  "infc-hiv-snc": ["infc-hiv-neuro", "infc-hiv-ocular"],
  "infc-hiv-neoplasias": ["infc-hiv-neoplasias", "infc-hiv-sistema", "infc-hiv-mapa"],
  "infc-itu": ["infc-itu-"],
  "infc-pele": ["infc-pele-"],
  "infc-osteo": ["infc-osteo"],
  "infc-dengue": ["infc-dengue-"],
  "infc-arbovirus": ["infc-chik-zika", "infc-febre-amarela"],
  "infc-malaria": ["infc-malaria"],
  "infc-tropicais": ["infc-lepto", "infc-leishmania", "infc-maculosa-", "infc-emergentes", "infc-tropicais-"],
  "hep-basico": ["hep-histologia-circulacao", "hep-hepatograma-ictericia"],
  "hep-virais-agudas": ["hep-hav", "hep-hbv-aguda", "hep-hcv-aguda-cronica", "hep-hdv-hev"],
  "hep-virais-cronicas": ["hep-hbv-cronica", "hep-hcv-aguda-cronica"],
  "hep-fulminante": ["hep-fulminante"],
  "hep-esteatose": ["hep-cirrose", "hep-dha", "hep-dhgna-nash"],
  "hep-autoimune": ["hep-hai", "hep-cbp", "hep-cep"],
  "hep-metabolicas": ["hep-wilson", "hep-hemocromatose", "hep-dili"],
  "hep-descompensacao": ["hep-ihc-child", "hep-encefalopatia", "hep-ascite", "hep-pbe-shr"],
  "hep-htp-varizes": ["hep-hipertensao-portal", "hep-varizes", "hep-tips-cirurgia-htp"],
  "hep-transplante": ["hep-transplante"],
  "hep-biliar": [
    "hep-cistos-vias-biliares",
    "hep-lesao-iatrogenica-biliar",
    "hep-abscesso-piogenico",
    "hep-abscesso-amebiano",
    "hep-cisto-hidatico"
  ],
  "hema-anemias": ["hema-anemia-intro", "hema-ferropriva", "hema-anemia-doenca-cronica"],
  "hema-megaloblastica": ["hema-megaloblastica"],
  "hema-hemoliticas": [
    "hema-hemoliticas-geral",
    "hema-ahai",
    "hema-g6pd-esferocitose",
    "hema-talassemia",
    "hema-falciforme"
  ],
  "hema-smd": ["hema-smd", "hema-sideroblastica"],
  "hema-leucemias": ["hema-lma", "hema-lla", "hema-lmc", "hema-llc"],
  "hema-nmp": ["hema-pv", "hema-mf", "hema-te"],
  "hema-linfomas": ["hema-hodgkin", "hema-lnh"],
  "hema-mieloma": ["hema-mieloma"],
  "hema-hemostasia": ["hema-hemostasia"],
  "hema-plaquetas": ["hema-pti", "hema-ptt-shuh"],
  "hema-coagulacao": ["hema-hemofilia", "hema-von-willebrand", "hema-cid", "hema-anticoagulacao"],
  "endo-tireoide": ["endo-tireoide-basico", "endo-hipertireoidismo", "endo-graves"],
  "endo-hipotireo": ["endo-hipotireoidismo", "endo-tireoidites"],
  "endo-nodulos": ["endo-nodulos-cancer-tireoide"],
  "endo-adrenal": [
    "endo-cushing",
    "endo-addison-insuficiencia-adrenal",
    "endo-feocromocitoma",
    "endo-hiperaldosteronismo"
  ],
  "endo-paratireoide": ["endo-paratireoide"],
  "endo-hipofise": ["endo-hipofise"],
  "endo-dm": ["endo-dm-basico", "endo-dm-tratamento"],
  "endo-dm-complicacoes": ["endo-dm-cronicas", "endo-pe-diabetico"],
  "endo-urgencias-dm": ["endo-dm-agudas", "endo-hipoglicemia"],
  "endo-obesidade": ["endo-obesidade"],
  "cardio-scc": ["cardio-scc"],
  "cardio-sca": [
    "cardio-sca-sem-sst",
    "cardio-sca-com-sst",
    "cardio-iam-complicacoes",
    "cardio-revasc"
  ],
  "cardio-pericardio": ["cardio-pericardiopatias"],
  "cardio-icc": ["cardio-icc-basico", "cardio-icc-tratamento"],
  "cardio-has": ["cardio-has"],
  "cardio-valvas": ["cardio-valvas-estenose", "cardio-valvas-insuficiencia"],
  "cardio-miopatias": [
    "cardio-cardiomiopatias",
    "cardio-semiologia-hp",
    "cardio-transplante"
  ],
  "cardio-fa": ["cardio-fa-flutter", "cardio-tvs-svt"],
  "cardio-bradi": ["cardio-bradi-bav", "cardio-bloqueios-ecg"],
  "cardio-pcr": ["cardio-pcr", "cardio-antiarrhythmicos"],
  "prev-sus": ["psus-"],
  "prev-epidemiologia": ["pepi-"],
  "prev-vigilancia": ["pvig-"],
  "prev-indicadores": ["pind-"]
};

function aprovaPedDecksForModule (moduleId, deckOrder) {
  const byId = id => AprovaFlashcards.decks.find(d => d.id === id);
  let decks = (deckOrder || []).map(byId).filter(Boolean);
  if (decks.length) return decks;

  const prefixes = APROVA_PED_MODULE_PREFIXES[moduleId] || [];
  if (!prefixes.length) return [];
  return AprovaFlashcards.decks
    .filter(d => prefixes.some(p => String(d.id || "").indexOf(p) === 0))
    .slice()
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "pt-BR"));
}

function aprovaAppendDeckCheckbox (list, deck) {
  const n = (deck.cards || []).length;
  const label = document.createElement("label");
  label.className = "aprova-check";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = deck.id;
  input.checked = true;
  input.addEventListener("change", aprovaUpdatePedModalCount);

  const text = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = deck.name || deck.id;
  const small = document.createElement("small");
  small.textContent = n + " card" + (n === 1 ? "" : "s");
  text.appendChild(strong);
  text.appendChild(small);

  label.appendChild(input);
  label.appendChild(text);
  list.appendChild(label);
}

async function aprovaCollectAllPedDecks () {
  const specialty = aprovaActiveSpecialty || "pediatria";
  const area = specialty === "go"
    ? aprovaActiveGoArea
    : specialty === "clinica"
      ? aprovaActiveCliArea
      : null;
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(specialty, area || undefined)
    : [];
  const seen = new Set();
  const decks = [];

  for (const m of modules) {
    const stats = await aprovaPedModuleStats(m.id);
    const moduleDecks = aprovaPedDecksForModule(m.id, stats.deckOrder || []);
    moduleDecks.forEach(deck => {
      if (!deck || seen.has(deck.id)) return;
      seen.add(deck.id);
      decks.push(deck);
    });
  }

  if (!decks.length) {
    return AprovaFlashcards.decksBySpecialty(specialty).slice();
  }
  return decks;
}

async function aprovaOpenPedDeckPicker (moduleId, options) {
  const opts = options || {};
  const selectAll = !!opts.selectAll;
  const modal = document.getElementById("esp-deck-modal");
  const title = document.getElementById("esp-deck-modal-title");
  const sub = document.getElementById("esp-deck-modal-sub");
  const list = document.getElementById("esp-deck-modal-list");
  const allBox = document.getElementById("esp-deck-modal-all");
  if (!modal || !list) return;
  if (!selectAll && !moduleId) return;

  const meta = aprovaRichSpecialtyMeta(aprovaActiveSpecialty || "pediatria");
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(meta.id)
    : [];
  let moduleLabel = meta.shortLabel;

  if (selectAll) {
    aprovaActivePedModule = null;
    if (meta.id === "go" && aprovaActiveGoArea && typeof APROVA_GO_AREAS !== "undefined") {
      moduleLabel = (APROVA_GO_AREAS[aprovaActiveGoArea].label || meta.shortLabel) + " · todos os grupos";
    } else if (meta.id === "clinica" && aprovaActiveCliArea && typeof APROVA_CLI_AREAS !== "undefined") {
      moduleLabel = (APROVA_CLI_AREAS[aprovaActiveCliArea].label || meta.shortLabel) + " · todos os grupos";
    } else {
      moduleLabel = meta.shortLabel + " · todos os grupos";
    }
  } else {
    aprovaActivePedModule = moduleId;
    if (typeof AprovaRevisao !== "undefined") {
      AprovaRevisao.setActiveModule(moduleId);
    }
    moduleLabel = (modules.find(m => m.id === moduleId) || {}).label || meta.shortLabel;
  }

  if (title) title.textContent = moduleLabel;
  if (sub) sub.textContent = "Carregando subtemas…";
  list.replaceChildren();
  if (allBox) {
    allBox.checked = false;
    allBox.indeterminate = true;
  }
  aprovaUpdatePedModalCount();
  aprovaShowPedDeckModal();

  let decks = [];
  try {
    if (selectAll) {
      decks = await aprovaCollectAllPedDecks();
    } else {
      const stats = await aprovaPedModuleStats(moduleId);
      decks = aprovaPedDecksForModule(moduleId, stats.deckOrder || []);
    }
  } catch (err) {
    console.error("Falha ao carregar subtemas do grupo", moduleId, err);
    decks = aprovaPedDecksForModule(moduleId, []);
  }

  if (sub) {
    sub.textContent = decks.length
      ? (selectAll
        ? ("Todos os subtemas de " + meta.shortLabel + " estão marcados. Desmarque o que não quiser estudar.")
        : "Marque um ou mais subtemas. Dá para estudar vários de uma vez.")
      : "Nenhum subtema disponível neste grupo.";
  }

  list.replaceChildren();
  decks.forEach(deck => {
    try {
      aprovaAppendDeckCheckbox(list, deck);
    } catch (err) {
      console.error("Falha ao montar subtema", deck && deck.id, err);
    }
  });

  if (allBox) {
    allBox.checked = decks.length > 0;
    allBox.indeterminate = false;
  }

  aprovaUpdatePedModalCount();
  aprovaShowPedDeckModal();
}

async function aprovaRenderPediatriaStats (focusId, moduleId, yearId) {
  const stats = document.getElementById("esp-stats");
  const bars = document.getElementById("esp-stats-bars");
  const title = document.getElementById("esp-stats-title");
  const sub = document.getElementById("esp-stats-sub");
  const unitEl = document.getElementById("esp-stats-unit");
  const sourceEl = document.getElementById("esp-stats-source");
  const banner = document.getElementById("esp-module-enamed-banner");
  const options = document.getElementById("esp-exam-options");
  const subtemas = document.getElementById("esp-subtemas");
  const grid = document.getElementById("esp-deck-grid");
  if (!stats || !bars || !options || !moduleId) return;

  const statsMode = aprovaIsStatsMode();
  stats.hidden = false;
  if (subtemas) subtemas.hidden = statsMode;
  const revBtn = document.getElementById("esp-open-revisao");
  if (revBtn) revBtn.hidden = statsMode;
  aprovaActivePedModule = moduleId;
  if (focusId != null) aprovaActiveFocusId = focusId || "geral";
  if (yearId != null) aprovaActiveModuleYear = yearId;
  if (!aprovaActiveFocusId) aprovaActiveFocusId = "geral";
  if (!aprovaActiveModuleYear) aprovaActiveModuleYear = "geral";

  if (typeof AprovaRevisao !== "undefined") {
    AprovaRevisao.setActiveModule(aprovaActivePedModule);
    AprovaRevisao.setActiveProfile(aprovaActiveFocusId);
  }

  const meta = aprovaRichSpecialtyMeta(aprovaActiveSpecialty || "pediatria");
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(meta.id)
    : [];
  const profiles = typeof AprovaRevisao !== "undefined"
    ? await AprovaRevisao.getProfiles(aprovaActivePedModule)
    : [];
  const moduleData = typeof AprovaRevisao !== "undefined"
    ? await AprovaRevisao.loadModule(aprovaActivePedModule)
    : null;
  const profile = typeof AprovaRevisao !== "undefined"
    ? await AprovaRevisao.getProfile(aprovaActiveFocusId, aprovaActivePedModule)
    : null;

  const groupArea = meta.id === "go"
    ? (aprovaActiveGoArea || (typeof AprovaRevisao !== "undefined"
      ? AprovaRevisao.moduleArea(aprovaActivePedModule)
      : null))
    : meta.id === "clinica"
      ? (aprovaActiveCliArea || (typeof AprovaRevisao !== "undefined"
        ? AprovaRevisao.moduleArea(aprovaActivePedModule)
        : null))
      : null;
  await aprovaRenderPedGroupCards(aprovaActivePedModule, groupArea ? { area: groupArea } : {});

  aprovaRenderExamYearFilters(options, {
    profiles,
    activeId: aprovaActiveFocusId,
    activeYear: aprovaActiveModuleYear,
    chooserOpen: aprovaModuleExamChooserOpen,
    onExam: id => {
      aprovaModuleExamChooserOpen = false;
      aprovaRenderPediatriaStats(id, aprovaActivePedModule, aprovaActiveModuleYear);
    },
    onYear: y => {
      aprovaRenderPediatriaStats(aprovaActiveFocusId, aprovaActivePedModule, y);
    },
    onToggleChooser: () => {
      aprovaModuleExamChooserOpen = !aprovaModuleExamChooserOpen;
      aprovaRenderPediatriaStats(aprovaActiveFocusId, aprovaActivePedModule, aprovaActiveModuleYear);
    }
  });

  if (banner) banner.hidden = aprovaActiveFocusId !== "enamed";

  if (!profile) {
    bars.innerHTML = "<p class=\"muted\">Estatísticas indisponíveis.</p>";
    if (unitEl) unitEl.hidden = true;
    if (sourceEl) sourceEl.textContent = "";
    return;
  }

  const slice = aprovaResolveYearSlice(profile, aprovaActiveModuleYear);
  const yearTxt = aprovaYearLabel(aprovaActiveModuleYear);
  const moduleLabel = (modules.find(m => m.id === aprovaActivePedModule) || {}).label || meta.shortLabel;
  const chartTitle = profile.id === "geral"
    ? ("O que mais caiu · Geral Brasil · " + moduleLabel + " · " + yearTxt)
    : ("O que mais caiu · " + aprovaExamLabel(profile) + " · " + moduleLabel + " · " + yearTxt);

  const sourceType = profile.sourceType || "estimativa";
  const typeLabel = sourceType === "levantamento"
    ? "Levantamento público (cursinho)"
    : (sourceType === "sintese" ? "Síntese de levantamentos públicos" : "Estimativa por padrão de banca");

  if (title) title.textContent = chartTitle;
  if (sub) {
    sub.textContent = typeLabel + " · ciclo " + yearTxt + (profile.foco ? (" — " + profile.foco) : "");
  }

  const unitLabel = (moduleData && moduleData.unitLabel) || "% das questões deste tema";
  if (unitEl) {
    unitEl.hidden = false;
    unitEl.textContent = "Cada barra = " + unitLabel +
      ((moduleData && moduleData.note) ? ". " + moduleData.note : "");
  }

  bars.innerHTML = (slice.priorities || []).map(p => {
    const pct = Number(p.pct != null ? p.pct : p.score);
    const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    const detail = p.n ? (" · " + p.n + " quest.") : "";
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + p.tema + detail + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
        "<em>" + aprovaFormatPct(pct) + "</em>" +
      "</div>"
    );
  }).join("");

  if (sourceEl) {
    sourceEl.textContent = slice.source
      ? ("Fonte: " + slice.source)
      : "";
  }

  if (grid) aprovaRenderDeckCards(meta.id, grid, profile.deckOrder || []);
  const decksTitle = document.getElementById("esp-decks-title");
  const subtemasTitle = document.getElementById("esp-subtemas-title");
  if (decksTitle) decksTitle.textContent = meta.shortLabel + " · " + moduleLabel;
  if (subtemasTitle) subtemasTitle.textContent = "Subtemas · " + moduleLabel;
}

async function aprovaOpenRichSpecialtyRoot (specialty) {
  const meta = aprovaRichSpecialtyMeta(specialty);
  aprovaActiveSpecialty = meta.id;
  aprovaActiveFocusId = "geral";
  aprovaActivePedModule = null;
  aprovaActiveGoArea = null;
  aprovaActiveCliArea = null;

  const decksWrap = document.getElementById("esp-decks");
  const title = document.getElementById("esp-decks-title");
  const sub = document.getElementById("esp-decks-sub");
  const hint = document.getElementById("esp-hint");
  const back = document.getElementById("esp-back");
  const stats = document.getElementById("esp-stats");
  const subtemas = document.getElementById("esp-subtemas");
  const overview = document.getElementById("esp-ped-overview");
  const selectAll = document.getElementById("esp-groups-select-all");
  if (!decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;
  if (stats) stats.hidden = true;
  if (subtemas) subtemas.hidden = true;

  const statsMode = aprovaIsStatsMode();
  const total = AprovaFlashcards.countBySpecialty(meta.id);
  const isGo = meta.id === "go";
  const isCli = meta.id === "clinica";
  const hasAreas = isGo || isCli;
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(meta.id)
    : [];
  const areas = isGo && typeof AprovaRevisao !== "undefined" && typeof AprovaRevisao.listGoAreas === "function"
    ? AprovaRevisao.listGoAreas()
    : isCli && typeof AprovaRevisao !== "undefined" && typeof AprovaRevisao.listCliAreas === "function"
      ? AprovaRevisao.listCliAreas()
      : [];

  if (title) title.textContent = meta.label;
  if (sub) {
    sub.hidden = false;
    if (statsMode) {
      sub.textContent = hasAreas
        ? ("O que mais caiu em " + meta.shortLabel + " · toque em uma área para detalhar")
        : ("O que mais caiu em " + meta.shortLabel + " · escolha a prova e, se quiser, um tema");
    } else if (hasAreas) {
      sub.textContent = total
        ? (total + " flashcards · " + areas.length + " áreas · toque em uma área para ver os grupos")
        : "Escolha uma área para estudar.";
    } else {
      sub.textContent = total
        ? (total + " flashcards · " + modules.length + " grupo" + (modules.length === 1 ? "" : "s") +
          " · toque em um grupo para escolher o que estudar")
        : "Escolha um grupo para estudar.";
    }
  }
  if (hint) {
    if (statsMode) {
      hint.textContent = hasAreas
        ? "Veja o panorama da área e abra cada especialidade para o detalhe por prova."
        : "Filtre por banca e ano · toque em um tema para ver o recorte mais fino.";
    } else {
      hint.textContent = isGo
        ? "Primeiro escolha Ginecologia ou Obstetrícia; depois um grupo; depois os subtemas. Abaixo: o que mais caiu na prova."
        : isCli
          ? "Veja as estatísticas da Clínica e escolha uma área (ex.: Cardiologia) para aprofundar."
          : "Toque em um grupo para estudar · abaixo, o que mais caiu na prova (banca e ano).";
    }
  }
  if (back) {
    back.textContent = statsMode ? "← Voltar às estatísticas" : "← Voltar aos flashcards";
  }

  const groupsLabel = document.getElementById("esp-groups-label");
  if (groupsLabel) {
    groupsLabel.textContent = hasAreas ? "Áreas" : (statsMode ? "Temas" : "Grupos");
  }
  if (selectAll) {
    selectAll.hidden = statsMode || hasAreas;
    selectAll.textContent = "Selecionar todos";
  }

  // Flashcards (áreas/grupos) no topo · estatísticas abaixo.
  const groupsEl = document.getElementById("esp-groups");
  if (overview && groupsEl && overview.parentNode === groupsEl.parentNode) {
    groupsEl.parentNode.insertBefore(groupsEl, overview);
  }

  const preferred = aprovaPreferredExamFocus();
  aprovaActivePedOverviewFocus = preferred;
  aprovaActiveOverviewYear = "geral";
  aprovaOverviewExamChooserOpen = false;
  await aprovaRenderPedOverviewStats(preferred, "geral");
  if (isGo) {
    await aprovaRenderGoAreaCards();
  } else if (isCli) {
    await aprovaRenderCliAreaCards();
  } else {
    await aprovaRenderPedGroupCards(null);
  }
}

async function aprovaOpenGoArea (areaId) {
  const meta = aprovaRichSpecialtyMeta("go");
  aprovaActiveSpecialty = "go";
  aprovaActiveGoArea = areaId || null;
  aprovaActivePedModule = null;
  if (!aprovaActiveGoArea) {
    await aprovaOpenRichSpecialtyRoot("go");
    return;
  }

  const areaMeta = (typeof APROVA_GO_AREAS !== "undefined" && APROVA_GO_AREAS[aprovaActiveGoArea])
    || { label: aprovaActiveGoArea };
  const decksWrap = document.getElementById("esp-decks");
  const title = document.getElementById("esp-decks-title");
  const sub = document.getElementById("esp-decks-sub");
  const hint = document.getElementById("esp-hint");
  const back = document.getElementById("esp-back");
  const stats = document.getElementById("esp-stats");
  const subtemas = document.getElementById("esp-subtemas");
  const overview = document.getElementById("esp-ped-overview");
  const selectAll = document.getElementById("esp-groups-select-all");
  const groupsLabel = document.getElementById("esp-groups-label");
  if (!decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;
  if (stats) stats.hidden = true;
  if (subtemas) subtemas.hidden = true;
  const statsMode = aprovaIsStatsMode();
  const showOverview =
    aprovaActiveGoArea === "ginecologia" || aprovaActiveGoArea === "obstetricia";

  const areaStats = await aprovaGoAreaStats(aprovaActiveGoArea);
  if (title) title.textContent = areaMeta.label;
  if (sub) {
    sub.hidden = false;
    if (statsMode) {
      sub.textContent = "O que mais caiu nesta área · toque em um tema para detalhar.";
    } else {
      sub.textContent = areaStats.groups
        ? (areaStats.cards + " flashcards · " + areaStats.groups + " grupo" +
          (areaStats.groups === 1 ? "" : "s") + " · toque em um grupo para escolher os subtemas")
        : "Grupos desta área entram em breve.";
    }
  }
  if (hint) {
    hint.textContent = statsMode
      ? "Escolha a banca e o ano · depois um tema para o recorte fino."
      : "Toque em um grupo para estudar · abaixo, o que mais caiu nesta área.";
  }
  if (back) back.textContent = "← Voltar a Ginecologia e obstetrícia";
  if (groupsLabel) groupsLabel.textContent = statsMode ? "Temas" : "Grupos";
  if (selectAll) {
    selectAll.hidden = statsMode || !areaStats.groups;
    selectAll.textContent = "Selecionar todos";
  }

  const groupsEl = document.getElementById("esp-groups");
  if (overview && groupsEl && overview.parentNode === groupsEl.parentNode) {
    groupsEl.parentNode.insertBefore(groupsEl, overview);
  }

  if (showOverview) {
    const preferred = aprovaPreferredExamFocus();
    aprovaActivePedOverviewFocus = preferred;
    aprovaActiveOverviewYear = "geral";
    aprovaOverviewExamChooserOpen = false;
    await aprovaRenderPedOverviewStats(preferred, "geral");
  } else if (overview) {
    overview.hidden = true;
  }
  await aprovaRenderPedGroupCards(null, { area: aprovaActiveGoArea });
}

async function aprovaOpenCliArea (areaId) {
  const meta = aprovaRichSpecialtyMeta("clinica");
  aprovaActiveSpecialty = "clinica";
  aprovaActiveCliArea = areaId || null;
  aprovaActivePedModule = null;
  if (!aprovaActiveCliArea) {
    await aprovaOpenRichSpecialtyRoot("clinica");
    return;
  }

  const areaMeta = (typeof APROVA_CLI_AREAS !== "undefined" && APROVA_CLI_AREAS[aprovaActiveCliArea])
    || { label: aprovaActiveCliArea };
  const decksWrap = document.getElementById("esp-decks");
  const title = document.getElementById("esp-decks-title");
  const sub = document.getElementById("esp-decks-sub");
  const hint = document.getElementById("esp-hint");
  const back = document.getElementById("esp-back");
  const stats = document.getElementById("esp-stats");
  const subtemas = document.getElementById("esp-subtemas");
  const overview = document.getElementById("esp-ped-overview");
  const selectAll = document.getElementById("esp-groups-select-all");
  const groupsLabel = document.getElementById("esp-groups-label");
  if (!decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;
  if (stats) stats.hidden = true;
  if (subtemas) subtemas.hidden = true;

  const statsMode = aprovaIsStatsMode();
  const areaStats = await aprovaCliAreaStats(aprovaActiveCliArea);
  if (title) title.textContent = areaMeta.label;
  if (sub) {
    sub.hidden = false;
    if (statsMode) {
      sub.textContent = "O que mais caiu nesta área · toque em um tema para detalhar.";
    } else {
      sub.textContent = areaStats.groups
        ? (areaStats.cards + " flashcards · " + areaStats.groups + " grupo" +
          (areaStats.groups === 1 ? "" : "s") + " · toque em um grupo para escolher os subtemas")
        : "Grupos desta área entram em breve.";
    }
  }
  if (hint) {
    hint.textContent = statsMode
      ? "Escolha a banca e o ano · depois um tema para o recorte fino."
      : "Toque em um grupo para estudar · abaixo, o que mais caiu nesta área.";
  }
  if (back) back.textContent = "← Voltar à Clínica médica";
  if (groupsLabel) groupsLabel.textContent = statsMode ? "Temas" : "Grupos";
  if (selectAll) {
    selectAll.hidden = statsMode || !areaStats.groups;
    selectAll.textContent = "Selecionar todos";
  }

  const groupsEl = document.getElementById("esp-groups");
  if (overview && groupsEl && overview.parentNode === groupsEl.parentNode) {
    groupsEl.parentNode.insertBefore(groupsEl, overview);
  }

  const preferred = aprovaPreferredExamFocus();
  aprovaActivePedOverviewFocus = preferred;
  aprovaActiveOverviewYear = "geral";
  aprovaOverviewExamChooserOpen = false;
  await aprovaRenderPedOverviewStats(preferred, "geral");
  await aprovaRenderPedGroupCards(null, { area: aprovaActiveCliArea });
}

async function aprovaOpenRichSpecialtyModule (specialty, moduleId) {
  const meta = aprovaRichSpecialtyMeta(specialty);
  aprovaActiveSpecialty = meta.id;
  aprovaActivePedModule = moduleId || aprovaActivePedModule;
  if (!aprovaActivePedModule) {
    if (meta.id === "go" && aprovaActiveGoArea) {
      await aprovaOpenGoArea(aprovaActiveGoArea);
      return;
    }
    if (meta.id === "clinica" && aprovaActiveCliArea) {
      await aprovaOpenCliArea(aprovaActiveCliArea);
      return;
    }
    await aprovaOpenRichSpecialtyRoot(meta.id);
    return;
  }

  if (typeof AprovaRevisao !== "undefined") {
    const modArea = AprovaRevisao.moduleArea(aprovaActivePedModule);
    if (meta.id === "go" && modArea) aprovaActiveGoArea = modArea;
    if (meta.id === "clinica" && modArea) aprovaActiveCliArea = modArea;
  }

  const decksWrap = document.getElementById("esp-decks");
  const hint = document.getElementById("esp-hint");
  const back = document.getElementById("esp-back");
  const sub = document.getElementById("esp-decks-sub");
  const overview = document.getElementById("esp-ped-overview");
  const selectAll = document.getElementById("esp-groups-select-all");
  if (!decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;
  if (overview) overview.hidden = true;
  const statsMode = aprovaIsStatsMode();
  if (sub) {
    sub.hidden = false;
    sub.textContent = statsMode
      ? "Temas no topo · gráfico do que mais caiu abaixo."
      : "Grupos no topo · subtemas e o que mais caiu abaixo.";
  }
  if (hint) {
    hint.textContent = statsMode
      ? "Filtre por banca e ano para ver o recorte deste tema."
      : "Escolha um subtema ou mude de grupo. O gráfico mostra o que mais caiu na prova.";
  }
  if (back) {
    if (meta.id === "go" && aprovaActiveGoArea) {
      back.textContent = "← Voltar a " + ((typeof APROVA_GO_AREAS !== "undefined" && APROVA_GO_AREAS[aprovaActiveGoArea]
        ? APROVA_GO_AREAS[aprovaActiveGoArea].label
        : "área"));
    } else if (meta.id === "clinica" && aprovaActiveCliArea) {
      back.textContent = "← Voltar a " + ((typeof APROVA_CLI_AREAS !== "undefined" && APROVA_CLI_AREAS[aprovaActiveCliArea]
        ? APROVA_CLI_AREAS[aprovaActiveCliArea].label
        : "área"));
    } else {
      back.textContent = "← Voltar à " + meta.shortLabel;
    }
  }

  const groupsLabel = document.getElementById("esp-groups-label");
  if (groupsLabel) groupsLabel.textContent = statsMode ? "Temas" : "Grupos";
  if (selectAll) {
    selectAll.hidden = statsMode;
    selectAll.textContent = "Selecionar todos";
  }

  aprovaActiveFocusId = "geral";
  aprovaActiveModuleYear = "geral";
  aprovaModuleExamChooserOpen = false;
  await aprovaRenderPediatriaStats("geral", aprovaActivePedModule, "geral");
}

async function aprovaOpenPediatria () {
  await aprovaOpenRichSpecialtyRoot("pediatria");
}

async function aprovaOpenPediatriaModule (moduleId) {
  await aprovaOpenRichSpecialtyModule("pediatria", moduleId);
}

async function aprovaOpenGinecologia () {
  await aprovaOpenRichSpecialtyRoot("go");
}

async function aprovaOpenGinecologiaModule (moduleId) {
  await aprovaOpenRichSpecialtyModule("go", moduleId);
}

async function aprovaOpenCirurgia () {
  await aprovaOpenRichSpecialtyRoot("cirurgia");
}

async function aprovaOpenCirurgiaModule (moduleId) {
  await aprovaOpenRichSpecialtyModule("cirurgia", moduleId);
}

async function aprovaOpenClinica () {
  await aprovaOpenRichSpecialtyRoot("clinica");
}

async function aprovaOpenPreventiva () {
  await aprovaOpenRichSpecialtyRoot("preventiva");
}

async function aprovaOpenPreventivaModule (moduleId) {
  await aprovaOpenRichSpecialtyModule("preventiva", moduleId);
}

async function aprovaOpenClinicaModule (moduleId) {
  await aprovaOpenRichSpecialtyModule("clinica", moduleId);
}

function aprovaOpenSpecialtyReview (profileId) {
  const decksWrap = document.getElementById("esp-decks");
  const revisao = document.getElementById("esp-revisao");
  const hint = document.getElementById("esp-hint");
  if (decksWrap) decksWrap.hidden = true;
  if (revisao) revisao.hidden = false;
  if (hint) hint.textContent = "Revisão da prova selecionada.";
  if (typeof aprovaRenderRevisaoNeo === "function") {
    aprovaRenderRevisaoNeo(
      profileId || aprovaActiveFocusId || "geral",
      aprovaActivePedModule || "neonatologia"
    );
  }
}

function aprovaOpenSpecialty (specialty) {
  aprovaActiveSpecialty = specialty;
  aprovaActivePedModule = null;

  if (specialty === "pediatria") {
    aprovaOpenPediatria();
    return;
  }
  if (specialty === "go") {
    aprovaOpenGinecologia();
    return;
  }
  if (specialty === "cirurgia") {
    aprovaOpenCirurgia();
    return;
  }
  if (specialty === "clinica") {
    aprovaOpenClinica();
    return;
  }
  if (specialty === "preventiva") {
    aprovaOpenPreventiva();
    return;
  }

  const decksWrap = document.getElementById("esp-decks");
  const grid = document.getElementById("esp-deck-grid");
  const title = document.getElementById("esp-decks-title");
  const sub = document.getElementById("esp-decks-sub");
  const hint = document.getElementById("esp-hint");
  const back = document.getElementById("esp-back");
  const groups = document.getElementById("esp-groups");
  const subtemas = document.getElementById("esp-subtemas");
  const stats = document.getElementById("esp-stats");
  if (!grid || !decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;
  const overview = document.getElementById("esp-ped-overview");
  if (groups) groups.hidden = true;
  if (overview) overview.hidden = true;
  if (subtemas) subtemas.hidden = false;
  if (stats) stats.hidden = true;
  if (sub) sub.hidden = true;
  if (back) back.textContent = "← Voltar aos flashcards";

  const label = APROVA_SPECIALTY_LABELS[specialty] || specialty;
  if (title) title.textContent = label + " · subtemas";
  if (hint) {
    const decks = AprovaFlashcards.decksBySpecialty(specialty);
    hint.textContent = decks.length
      ? "Escolha um subtema para estudar."
      : "Ainda sem flashcards nesta área — em breve.";
  }

  aprovaRenderDeckCards(specialty, grid);
}

function aprovaRenderExamStats () {
  if (typeof aprovaExamStatsSummary !== "function") return;
  const s = aprovaExamStatsSummary();

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set("stat-attempted", String(s.attempted));
  set("stat-correct", String(s.correct));
  set("stat-wrong", String(s.wrong));
  set("stat-pct", s.pct + "%");
  set("stat-streak", String(s.streak));
  set("stat-best-streak", String(s.bestStreak));

  const preview = document.getElementById("dash-exam-stats-preview");
  if (preview) {
    preview.textContent = "O que mais caiu nas principais provas de R1.";
  }
  const progPreview = document.getElementById("dash-progress-preview");
  if (progPreview) {
    progPreview.textContent = s.attempted
      ? s.correct + "/" + s.attempted + " acertos · " + s.pct + "% de aproveitamento"
      : "Resumo do que você já revisou e o desempenho nas questões.";
  }

  const themes = document.getElementById("stat-themes");
  if (!themes) return;
  if (!s.themes.length) {
    themes.innerHTML = "<p class=\"muted\">Responda questões para ver o desempenho por tema.</p>";
    return;
  }

  themes.innerHTML = s.themes.map(t => (
    "<div class=\"stat-theme-row\">" +
      "<div><strong>" + t.name + "</strong><span>" + t.correct + "/" + t.attempted + " acertos</span></div>" +
      "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + t.pct + "%\"></i></div>" +
      "<em>" + t.pct + "%</em>" +
    "</div>"
  )).join("");
}

function aprovaRefreshSeuPlanoForArea (pack, areaId) {
  if (typeof aprovaBuildStudyPlan !== "function") return;
  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const complete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete(profile);
  if (!complete) {
    aprovaRenderSeuPlano(null, false, null);
    return;
  }
  // Metas usam todas as áreas; areaId só atualiza o detalhe do foco
  aprovaRenderSeuPlano(
    aprovaBuildStudyPlan(profile, pack && pack.ok ? pack : null, Date.now(), areaId || aprovaSeuFocoAreaId),
    true,
    pack
  );
}

function aprovaRenderSeuFocoArea (pack, areaId) {
  const moreEl = document.getElementById("dash-seu-foco-more");
  const lessEl = document.getElementById("dash-seu-foco-less");
  const areasEl = document.getElementById("dash-seu-foco-areas");
  const view = pack || aprovaSeuFocoViewPack || aprovaSeuFocoCache;
  if (!view || !view.ok || !moreEl || !lessEl) return;

  const area = view.areas.find(a => a.id === areaId) || view.areas[0];
  if (!area) return;
  aprovaSeuFocoAreaId = area.id;

  if (areasEl) {
    areasEl.querySelectorAll(".esp-exam-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.area === area.id);
    });
  }

  const maxPct = Math.max.apply(null, area.focus.map(t => Number(t.pct) || 0).concat([1]));
  moreEl.innerHTML = area.focus.map(t => {
    const pct = Number(t.pct);
    const width = Number.isFinite(pct) ? Math.max(8, Math.round((pct / maxPct) * 100)) : 0;
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + t.tema + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
        "<em>" + (typeof aprovaFormatPct === "function" ? aprovaFormatPct(pct) : (pct + "%")) + "</em>" +
      "</div>"
    );
  }).join("");

  if (!area.less.length) {
    lessEl.innerHTML = "<li><span>Sem contraste claro nesta área</span></li>";
  } else {
    lessEl.innerHTML = area.less.map(t => {
      const pct = Number(t.pct);
      const label = typeof aprovaFormatPct === "function" ? aprovaFormatPct(pct) : (pct + "%");
      return "<li><span>" + t.tema + "</span><em>" + label + "</em></li>";
    }).join("");
  }
}

async function aprovaSeuFocoLoadExamProfiles () {
  if (aprovaSeuFocoProfilesCache) return aprovaSeuFocoProfilesCache;
  if (typeof aprovaFocusLoadArea !== "function" || typeof APROVA_FOCUS_AREAS === "undefined") {
    return [];
  }
  const data = await aprovaFocusLoadArea(APROVA_FOCUS_AREAS[0]);
  aprovaSeuFocoProfilesCache = (data && Array.isArray(data.profiles)) ? data.profiles : [];
  return aprovaSeuFocoProfilesCache;
}

function aprovaRenderSeuFocoExamFilters (profiles) {
  const container = document.getElementById("dash-seu-foco-exam-filters");
  if (!container) return;

  const list = (Array.isArray(profiles) ? profiles : [])
    .filter((p) => p && p.id && p.id !== "__perfil__");
  const examChoices = list.filter((p) => p.id !== "geral");
  const mode = aprovaSeuFocoStatsMode || "perfil";
  const activeExam = list.find((p) => p.id === mode);
  const pickLabel = mode !== "perfil" && mode !== "geral" && activeExam
    ? (activeExam.label || mode)
    : "Escolher prova";

  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "esp-stat-filters-row";

  function addModeBtn (id, label, title) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "esp-exam-btn" + (mode === id ? " active" : "");
    btn.textContent = label;
    if (title) btn.title = title;
    btn.addEventListener("click", () => {
      aprovaSeuFocoExamChooserOpen = false;
      aprovaSeuFocoStatsMode = id;
      aprovaRefreshSeuFocoStatsView();
    });
    row.appendChild(btn);
  }

  addModeBtn(
    "perfil",
    "Minhas provas",
    "Mistura das provas do seu perfil (pesos 50% / 30% / 20%)"
  );
  addModeBtn(
    "geral",
    "Geral Brasil",
    "Síntese nacional · ciclo 2024–2026"
  );

  const pickBtn = document.createElement("button");
  pickBtn.type = "button";
  pickBtn.className = "esp-exam-pick-btn" +
    (mode !== "perfil" && mode !== "geral" ? " esp-exam-pick-btn--set" : "") +
    (aprovaSeuFocoExamChooserOpen ? " open" : "");
  pickBtn.setAttribute("aria-expanded", aprovaSeuFocoExamChooserOpen ? "true" : "false");
  pickBtn.textContent = pickLabel + (aprovaSeuFocoExamChooserOpen ? " ▴" : " ▾");
  pickBtn.title = "Ver estatística de outra prova (SUS-SP, Enamed, USP…)";
  pickBtn.addEventListener("click", () => {
    aprovaSeuFocoExamChooserOpen = !aprovaSeuFocoExamChooserOpen;
    aprovaRenderSeuFocoExamFilters(profiles);
  });
  row.appendChild(pickBtn);

  const yearWrap = document.createElement("label");
  yearWrap.className = "esp-year-pick";
  yearWrap.innerHTML = "<span>Ano</span>";
  const yearSelect = document.createElement("select");
  yearSelect.setAttribute("aria-label", "Ano da estatística");
  yearSelect.disabled = mode === "perfil";
  [
    { id: "geral", label: "2024–2026" },
    { id: "2024", label: "2024" },
    { id: "2025", label: "2025" },
    { id: "2026", label: "2026" }
  ].forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y.id;
    opt.textContent = y.label;
    if (y.id === (aprovaSeuFocoStatsYear || "geral")) opt.selected = true;
    yearSelect.appendChild(opt);
  });
  yearSelect.addEventListener("change", () => {
    aprovaSeuFocoStatsYear = yearSelect.value || "geral";
    aprovaRefreshSeuFocoStatsView();
  });
  yearWrap.appendChild(yearSelect);
  row.appendChild(yearWrap);
  container.appendChild(row);

  if (aprovaSeuFocoExamChooserOpen) {
    const chooser = document.createElement("div");
    chooser.className = "esp-exam-chooser";
    chooser.setAttribute("role", "listbox");
    chooser.setAttribute("aria-label", "Provas com estatística");
    const sorted = typeof aprovaSortExamProfiles === "function"
      ? aprovaSortExamProfiles(examChoices)
      : examChoices.slice().sort((a, b) =>
        String(a.label || "").localeCompare(String(b.label || ""), "pt-BR"));
    sorted.forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "esp-exam-chooser-btn" + (mode === p.id ? " active" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", mode === p.id ? "true" : "false");
      btn.textContent = p.label || p.id;
      btn.addEventListener("click", () => {
        aprovaSeuFocoExamChooserOpen = false;
        aprovaSeuFocoStatsMode = p.id;
        aprovaRefreshSeuFocoStatsView();
      });
      chooser.appendChild(btn);
    });
    if (!sorted.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Nenhuma outra prova com estatística neste ciclo.";
      chooser.appendChild(empty);
    }
    container.appendChild(chooser);
  }
}

async function aprovaRefreshSeuFocoStatsView () {
  const weightsEl = document.getElementById("dash-seu-foco-weights");
  const noteEl = document.getElementById("dash-seu-foco-note");
  const areasEl = document.getElementById("dash-seu-foco-areas");
  const moreEl = document.getElementById("dash-seu-foco-more");

  let view = null;
  if (aprovaSeuFocoStatsMode === "perfil") {
    view = aprovaSeuFocoCache;
  } else if (typeof aprovaBuildFocusPackForSingleExam === "function") {
    if (moreEl) moreEl.innerHTML = "<p class=\"muted\">Carregando estatística…</p>";
    view = await aprovaBuildFocusPackForSingleExam(
      aprovaSeuFocoStatsMode,
      aprovaSeuFocoStatsYear
    );
  }

  aprovaSeuFocoViewPack = view && view.ok ? view : aprovaSeuFocoCache;

  const profiles = await aprovaSeuFocoLoadExamProfiles();
  aprovaRenderSeuFocoExamFilters(profiles);

  if (!aprovaSeuFocoViewPack || !aprovaSeuFocoViewPack.ok) {
    if (weightsEl) {
      weightsEl.textContent = (view && view.reason) ||
        "Não há estatística desta prova nesta área.";
    }
    return;
  }

  if (weightsEl) {
    weightsEl.textContent = aprovaSeuFocoStatsMode === "perfil"
      ? ("Pesos: " + (aprovaSeuFocoViewPack.weightLine || "") +
        (aprovaSeuFocoViewPack.others && aprovaSeuFocoViewPack.others.length
          ? " · “Outra” sem estatística no app"
          : ""))
      : (aprovaSeuFocoViewPack.weightLine || "");
  }
  if (noteEl) {
    noteEl.hidden = false;
    noteEl.textContent = aprovaSeuFocoStatsMode === "perfil"
      ? "Consulta por área com o mix do seu perfil. Use os filtros acima para ver outra prova (SUS-SP, Enamed, Brasil…)."
      : "Consulta por área nesta prova. As metas do dia continuam com o mix do seu perfil.";
  }

  if (areasEl) {
    areasEl.innerHTML = "";
    aprovaSeuFocoViewPack.areas.forEach((area) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "esp-exam-btn" + (area.id === aprovaSeuFocoAreaId ? " active" : "");
      btn.dataset.area = area.id;
      btn.textContent = area.label;
      btn.addEventListener("click", () => {
        aprovaRenderSeuFocoArea(aprovaSeuFocoViewPack, area.id);
      });
      areasEl.appendChild(btn);
    });
  }

  const startId = aprovaSeuFocoViewPack.areas.some((a) => a.id === aprovaSeuFocoAreaId)
    ? aprovaSeuFocoAreaId
    : aprovaSeuFocoViewPack.areas[0].id;
  aprovaRenderSeuFocoArea(aprovaSeuFocoViewPack, startId);
}

function aprovaFulfillDailyMeta () {
  if (typeof aprovaClearActivityCreditDay === "function") {
    aprovaClearActivityCreditDay();
  }
  aprovaGoTo("flashcards", { study: true, mode: "today" });
}

function aprovaFulfillTomorrowMeta () {
  const tomorrowIso = typeof aprovaIsoOffset === "function" ? aprovaIsoOffset(1) : null;
  if (typeof aprovaSetActivityCreditDay === "function" && tomorrowIso) {
    aprovaSetActivityCreditDay(tomorrowIso);
  }
  aprovaGoTo("flashcards", { study: true, mode: "today" });
}

function aprovaQPoolForTema (specialty, tema) {
  if (typeof AprovaQuestions === "undefined" || !AprovaQuestions.catalog) return [];
  const spec = String(specialty || "");
  const key = typeof aprovaFocusNormKey === "function"
    ? aprovaFocusNormKey(tema)
    : String(tema || "").toLowerCase();
  let pool = AprovaQuestions.catalog.filter((q) => !spec || q.specialty === spec);
  if (!key || !pool.length) return pool;

  const score = (q) => {
    const g = typeof aprovaFocusNormKey === "function" ? aprovaFocusNormKey(q.group) : String(q.group || "").toLowerCase();
    const t = typeof aprovaFocusNormKey === "function" ? aprovaFocusNormKey(q.theme) : String(q.theme || "").toLowerCase();
    if (g === key || t === key) return 3;
    if ((g && (g.indexOf(key) >= 0 || key.indexOf(g) >= 0)) ||
        (t && (t.indexOf(key) >= 0 || key.indexOf(t) >= 0))) return 2;
    const words = key.split(" ").filter((w) => w.length > 3);
    if (words.some((w) => g.indexOf(w) >= 0 || t.indexOf(w) >= 0)) return 1;
    return 0;
  };

  const ranked = pool
    .map((q) => ({ q, s: score(q) }))
    .filter((row) => row.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((row) => row.q);

  return ranked.length >= Math.min(5, pool.length) ? ranked : pool;
}

/** Sessão aberta a partir de Minhas metas → Encerrar/Concluir volta às metas. */
let aprovaQFromMetas = false;

function aprovaReturnFromQuestionSession () {
  AprovaQuestions.clearSavedTreino();
  if (typeof aprovaClearMateriaCreditTarget === "function") {
    aprovaClearMateriaCreditTarget();
  }
  AprovaQuestions.resetSession("treino");
  AprovaQuestions.queue = [];
  const toMetas = aprovaQFromMetas;
  aprovaQFromMetas = false;
  if (toMetas) {
    aprovaGoTo("metas");
    return;
  }
  aprovaRenderQuestionBrowse();
}

async function aprovaFulfillMetaQuestions (specialty, tema, n, opts) {
  const options = opts || {};
  const mode = options.mode || "continue";
  aprovaQFromMetas = true;
  aprovaGoTo("questoes");
  if (typeof AprovaQuestions === "undefined") return;
  if (!AprovaQuestions.catalog.length) {
    try { await AprovaQuestions.load(); } catch (e) { /* ignore */ }
  }

  const want = Math.max(1, n | 0 || 10);
  const pool = aprovaQPoolForTema(specialty, tema);
  if (!pool.length) {
    aprovaQBrowse.specialty = specialty || "";
    aprovaQBrowse.level = specialty ? "groups" : "areas";
    aprovaQBrowse.group = "";
    aprovaQBrowse.theme = "";
    aprovaRenderQuestionBrowse();
    return;
  }

  AprovaQuestions.filters = {
    specialty: specialty || "",
    group: "",
    theme: String(tema || ""),
    exam: "",
    year: ""
  };
  aprovaQBrowse.specialty = specialty || "";
  aprovaQBrowse.group = "";
  aprovaQBrowse.theme = String(tema || "");
  aprovaQBrowse.level = specialty ? "groups" : "areas";

  // Banco completo do tema: aluno escolhe modo, escopo e quantidade.
  if (mode === "more") {
    if (typeof aprovaClearMateriaCreditTarget === "function") {
      aprovaClearMateriaCreditTarget();
    }
    aprovaQBankPoolOverride = pool.slice();
    aprovaQModalMode = "treino";
    aprovaQModalScope = "all";
    aprovaQModalForceSetup = true;
    aprovaShowQuestionViews("browse");
    aprovaRenderQuestionBrowse();
    aprovaShowQuestionLaunch();
    aprovaSyncQuestionModalUI();
    return;
  }

  if (typeof aprovaSetMateriaCreditTarget === "function") {
    aprovaSetMateriaCreditTarget({ tema, specialty });
  }

  if (mode === "review") {
    const idList = typeof aprovaMateriaAnsweredIdList === "function"
      ? aprovaMateriaAnsweredIdList(specialty, tema)
      : [];
    const byId = Object.create(null);
    pool.forEach((q) => {
      if (q && q.id) byId[q.id] = q;
    });
    const reviewPool = [];
    idList.forEach((id) => {
      if (byId[id]) reviewPool.push(byId[id]);
    });
    if (!reviewPool.length) {
      const hist = typeof aprovaLoadQuestionHistory === "function"
        ? aprovaLoadQuestionHistory()
        : { byId: {} };
      pool.forEach((q) => {
        const row = hist.byId[q.id];
        if (row && row.attempted) reviewPool.push(q);
      });
    }
    if (!reviewPool.length) {
      return aprovaFulfillMetaQuestions(specialty, tema, want, { mode: "more" });
    }
    const answers = reviewPool.map((q) => {
      const hist = typeof aprovaLoadQuestionHistory === "function"
        ? aprovaLoadQuestionHistory().byId[q.id]
        : null;
      let choice = q.answer;
      let ok = true;
      if (hist && hist.attempted) {
        ok = !!hist.lastOk;
        if (hist.lastChoiceText && Array.isArray(q.choices)) {
          const idx = q.choices.findIndex((c) => c === hist.lastChoiceText);
          choice = idx >= 0 ? idx : (ok ? q.answer : -1);
        } else if (Number.isFinite(hist.lastChoice)) {
          choice = hist.lastChoice | 0;
        } else if (!ok) {
          choice = -1;
        }
      }
      return {
        id: q.id,
        theme: q.theme,
        specialty: q.specialty,
        choice,
        correct: q.answer,
        ok
      };
    });
    const nRev = AprovaQuestions.startReviewTreino(reviewPool, answers);
    if (!nRev) {
      aprovaRenderQuestionBrowse();
      return;
    }
    aprovaShowQuestionViews("card");
    aprovaRenderQuestion();
    return;
  }

  const saved = AprovaQuestions.getResumableTreino(AprovaQuestions.filters, "meta");
  if (saved) {
    const resumed = AprovaQuestions.resumeTreino(saved);
    if (resumed) {
      aprovaShowQuestionViews("card");
      aprovaRenderQuestion();
      return;
    }
  }

  const used = typeof aprovaMateriaAnsweredIds === "function"
    ? aprovaMateriaAnsweredIds(specialty, tema)
    : Object.create(null);
  const fresh = pool.filter((q) => {
    if (!q || !q.id) return false;
    if (used[q.id]) return false;
    if (typeof aprovaQuestionMatchesScope === "function" &&
        !aprovaQuestionMatchesScope(q.id, "new")) {
      return false;
    }
    return true;
  });
  const source = fresh.length ? fresh : pool.filter((q) => q && !used[q.id]);
  const bag = source.length ? source : [];
  if (!bag.length) {
    return aprovaFulfillMetaQuestions(specialty, tema, want, { mode: "review" });
  }
  const shuffled = typeof aprovaShuffleArray === "function"
    ? aprovaShuffleArray(bag.slice())
    : bag.slice();
  const size = Math.min(want, shuffled.length);
  if (!size) {
    aprovaRenderQuestionBrowse();
    return;
  }
  AprovaQuestions.startTreino(shuffled.slice(0, size), "meta");
  aprovaShowQuestionViews("card");
  aprovaRenderQuestion();
}

/** Monta entrada de resposta a partir do histórico (para anotar no bloco). */
function aprovaPriorAnswerEntryFromHistory (q) {
  if (!q || !q.id || typeof aprovaLoadQuestionHistory !== "function") return null;
  const hist = aprovaLoadQuestionHistory().byId[q.id];
  if (!hist || !hist.attempted) return null;
  let choice = q.answer;
  const ok = !!hist.lastOk;
  if (hist.lastChoiceText && Array.isArray(q.choices)) {
    const idx = q.choices.findIndex((c) => c === hist.lastChoiceText);
    choice = idx >= 0 ? idx : (ok ? q.answer : -1);
  } else if (Number.isFinite(hist.lastChoice)) {
    choice = hist.lastChoice | 0;
  } else if (!ok) {
    choice = -1;
  }
  return {
    id: q.id,
    theme: q.theme,
    specialty: q.specialty,
    choice,
    correct: q.answer,
    ok
  };
}

async function aprovaFulfillMetaQuestionsDay () {
  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const focus = aprovaSeuFocoCache;
  const plan = typeof aprovaBuildStudyPlan === "function"
    ? aprovaBuildStudyPlan(profile, focus && focus.ok ? focus : null)
    : null;
  const program = plan && plan.ok && typeof aprovaBuildStudyProgram === "function"
    ? aprovaBuildStudyProgram(plan, null, Date.now(), focus)
    : null;
  const themes = (program && program.qThemes) || [];
  if (!themes.length) {
    aprovaGoTo("questoes");
    return;
  }

  aprovaQFromMetas = true;
  aprovaGoTo("questoes");
  if (!AprovaQuestions.catalog.length) {
    try { await AprovaQuestions.load(); } catch (e) { /* ignore */ }
  }

  AprovaQuestions.filters = {
    specialty: "",
    group: "",
    theme: "bloco-hoje",
    exam: "",
    year: ""
  };

  const saved = AprovaQuestions.getResumableTreino(AprovaQuestions.filters, "meta-day");
  if (saved) {
    const resumed = AprovaQuestions.resumeTreino(saved);
    if (resumed) {
      aprovaShowQuestionViews("card");
      aprovaRenderQuestion();
      return;
    }
  }

  const priorRows = [];
  const freshBag = [];
  const seen = Object.create(null);

  themes.forEach((th) => {
    const part = aprovaQPoolForTema(th.specialty, th.tema);
    const idList = typeof aprovaMateriaAnsweredIdList === "function"
      ? aprovaMateriaAnsweredIdList(th.specialty, th.tema)
      : [];
    const used = Object.create(null);
    idList.forEach((id) => { used[id] = true; });

    const byId = Object.create(null);
    part.forEach((q) => {
      if (q && q.id) byId[q.id] = q;
    });

    // Já feitas neste tema → entram anotadas
    idList.forEach((id) => {
      if (seen[id]) return;
      const q = byId[id];
      if (!q) return;
      const entry = typeof aprovaPriorAnswerEntryFromHistory === "function"
        ? aprovaPriorAnswerEntryFromHistory(q)
        : null;
      if (!entry) return;
      seen[id] = true;
      priorRows.push({ q, entry });
    });

    const done = th.progressDone | 0;
    const goal = th.progressGoal | 0 || th.n | 0;
    const remain = Math.max(0, goal - done);
    if (remain <= 0) return;

    const fresh = part.filter((q) => {
      if (!q || !q.id || used[q.id] || seen[q.id]) return false;
      if (typeof aprovaQuestionMatchesScope === "function" &&
          !aprovaQuestionMatchesScope(q.id, "new")) {
        return false;
      }
      return true;
    });
    const shuffled = typeof aprovaShuffleArray === "function"
      ? aprovaShuffleArray(fresh.slice())
      : fresh.slice();
    const take = Math.min(remain, shuffled.length);
    for (let i = 0; i < take; i++) {
      if (seen[shuffled[i].id]) continue;
      seen[shuffled[i].id] = true;
      freshBag.push(shuffled[i]);
    }
  });

  if (!priorRows.length && !freshBag.length) {
    // Tudo do dia já feito — abre revisão do que foi respondido
    const reviewQs = [];
    const reviewAns = [];
    themes.forEach((th) => {
      const part = aprovaQPoolForTema(th.specialty, th.tema);
      const byId = Object.create(null);
      part.forEach((q) => { if (q && q.id) byId[q.id] = q; });
      const idList = typeof aprovaMateriaAnsweredIdList === "function"
        ? aprovaMateriaAnsweredIdList(th.specialty, th.tema)
        : [];
      idList.forEach((id) => {
        if (!byId[id] || seen[id + "::rev"]) return;
        seen[id + "::rev"] = true;
        const entry = aprovaPriorAnswerEntryFromHistory(byId[id]);
        if (!entry) return;
        reviewQs.push(byId[id]);
        reviewAns.push(entry);
      });
    });
    if (reviewQs.length && AprovaQuestions.startReviewTreino) {
      AprovaQuestions.startReviewTreino(reviewQs, reviewAns);
      aprovaShowQuestionViews("card");
      aprovaRenderQuestion();
      return;
    }
    aprovaGoTo("metas");
    return;
  }

  const n = AprovaQuestions.startTreinoContinuing
    ? AprovaQuestions.startTreinoContinuing(priorRows, freshBag, "meta-day")
    : AprovaQuestions.startTreino(freshBag, "meta-day");
  if (!n) {
    aprovaRenderQuestionBrowse();
    return;
  }
  aprovaShowQuestionViews("card");
  aprovaRenderQuestion();
}

function aprovaApplyMetaCredit (credit) {
  if (credit === "tomorrow") {
    const tomorrowIso = typeof aprovaIsoOffset === "function" ? aprovaIsoOffset(1) : null;
    if (typeof aprovaSetActivityCreditDay === "function" && tomorrowIso) {
      aprovaSetActivityCreditDay(tomorrowIso);
    }
    return;
  }
  if (typeof aprovaClearActivityCreditDay === "function") {
    aprovaClearActivityCreditDay();
  }
}

function aprovaFindDecksForMetaTheme (areaId, tema) {
  if (typeof AprovaFlashcards === "undefined") return [];
  const norm = typeof aprovaFocusNormKey === "function"
    ? aprovaFocusNormKey
    : s => String(s || "").toLowerCase();
  const key = norm(tema);
  if (!key) return [];

  const decks = areaId && AprovaFlashcards.decksBySpecialty
    ? AprovaFlashcards.decksBySpecialty(areaId)
    : (AprovaFlashcards.decks || []);

  const scored = [];
  decks.forEach(deck => {
    const nameKey = norm(deck.name || "");
    const idKey = norm(deck.id || "");
    if (!nameKey && !idKey) return;
    let score = 0;
    if (nameKey === key) score = 5;
    else if (nameKey.indexOf(key) !== -1 || key.indexOf(nameKey) !== -1) score = 3;
    else {
      const tokens = key.split(" ").filter(t => t.length > 2);
      const hits = tokens.filter(t => nameKey.indexOf(t) !== -1 || idKey.indexOf(t) !== -1).length;
      if (hits && hits >= Math.min(2, tokens.length)) score = hits;
      else if (tokens.length === 1 && hits === 1) score = 1;
    }
    if (score) scored.push({ id: deck.id, score });
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.id);
}

function aprovaFulfillMetaTheme (areaId, tema, cardsGoal) {
  const deckIds = aprovaFindDecksForMetaTheme(areaId, tema);
  if (deckIds.length && typeof AprovaFlashcards !== "undefined" && AprovaFlashcards.startDecks) {
    // Só novos + vencidos, embaralhados; não repete o que já foi feito e ainda não venceu
    AprovaFlashcards.startDecks(deckIds.slice(0, 6), {
      limit: cardsGoal > 0 ? cardsGoal : 0
    });
    aprovaGoTo("flashcards", { study: true });
    return;
  }

  aprovaEspMode = "study";
  aprovaGoTo("especialidades");
  const openers = {
    pediatria: () => typeof aprovaOpenPediatria === "function" && aprovaOpenPediatria(),
    go: () => typeof aprovaOpenGinecologia === "function" && aprovaOpenGinecologia(),
    cirurgia: () => typeof aprovaOpenCirurgia === "function" && aprovaOpenCirurgia(),
    preventiva: () => typeof aprovaOpenPreventiva === "function" && aprovaOpenPreventiva(),
    clinica: () => typeof aprovaOpenClinica === "function" && aprovaOpenClinica()
  };
  const open = openers[areaId];
  if (open) {
    Promise.resolve(open()).catch(err => console.error("Falha ao abrir área da meta", areaId, err));
  } else if (typeof aprovaOpenSpecialty === "function") {
    aprovaOpenSpecialty(areaId || "clinica");
  }
}

function aprovaEscapeHtml (s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function aprovaBuildMetasQThemesHtml (program, focusPack) {
  const themes = (program && program.qThemes) || [];
  if (!themes.length) {
    return "<li class=\"muted\" style=\"list-style:none;padding:0.35rem 0\">Cadastre as provas no perfil para priorizar temas.</li>";
  }
  const esc = aprovaEscapeHtml;
  return themes.map((th) => {
    const freqCaption = typeof aprovaMetasThemeFreqCaption === "function"
      ? aprovaMetasThemeFreqCaption(th.pct, focusPack || aprovaSeuFocoCache)
      : (th.pct != null
        ? (typeof aprovaFormatPct === "function"
          ? aprovaFormatPct(th.pct)
          : (String(th.pct).replace(".", ",") + "%"))
        : "");
    const status = th.status || "todo";
    const done = th.progressDone | 0;
    const goal = th.progressGoal | 0 || th.n | 0;
    const targetAcc = (program.qQuota && program.qQuota.targetAccuracy) ||
      (typeof APROVA_DEFAULT_TARGET_ACCURACY !== "undefined" ? APROVA_DEFAULT_TARGET_ACCURACY : 75);
    const tone = status === "done" && typeof aprovaMetaProgressTone === "function"
      ? aprovaMetaProgressTone(th.progressPct, targetAcc)
      : (status === "partial" ? "near" : (status === "done" ? "hit" : "todo"));
    let statusTxt = "Não feito · 0/" + goal;
    let cta = "Responder";
    let warn = "";
    if (status === "done") {
      const pctBit = th.progressPct != null ? (" · " + th.progressPct + "% acerto") : "";
      statusTxt = "Feito" + pctBit;
      cta = "Revisar";
      if (tone === "far") {
        statusTxt += " · revisar o quanto antes";
        warn = "<span class=\"metas-q-warn\">Consulte material de apoio</span>";
      } else if (tone === "near") {
        statusTxt += " · pouco abaixo da meta";
      }
    } else if (status === "partial") {
      statusTxt = "Em andamento · " + done + "/" + goal +
        (th.progressPct != null ? (" · " + th.progressPct + "%") : "");
      cta = "Continuar";
    }
    const remain = status === "done"
      ? Math.max(5, goal)
      : Math.max(1, goal - done);
    const toneClass = status === "todo"
      ? "is-todo"
      : (status === "partial"
        ? "is-partial"
        : ("is-done is-acc-" + tone));
    const areaBit = th.areaLabel
      ? (esc(th.areaLabel) + (freqCaption ? " — " : ""))
      : "";
    return (
      "<li>" +
        "<button type=\"button\" class=\"dash-task-theme-btn " + toneClass + "\"" +
          " data-meta-q-spec=\"" + esc(th.specialty) + "\"" +
          " data-meta-q-tema=\"" + esc(th.tema) + "\"" +
          " data-meta-q-n=\"" + remain + "\"" +
          " data-meta-q-mode=\"" + (status === "done" ? "review" : "continue") + "\">" +
          "<strong>" + (th.n | 0) + "</strong>" +
          "<span class=\"dash-task-theme-copy\">" +
            esc(th.tema) +
            ((areaBit || freqCaption)
              ? (" <span class=\"metas-q-freq\">" + areaBit + esc(freqCaption) + "</span>")
              : "") +
            "<span class=\"metas-q-status\">" + esc(statusTxt) + "</span>" +
            warn +
          "</span>" +
          "<span class=\"dash-task-theme-go\">" + cta + "</span>" +
        "</button>" +
        (status === "done"
          ? ("<button type=\"button\" class=\"dash-task-theme-more\"" +
              " data-meta-q-spec=\"" + esc(th.specialty) + "\"" +
              " data-meta-q-tema=\"" + esc(th.tema) + "\"" +
              " data-meta-q-n=\"" + Math.max(5, goal) + "\"" +
              " data-meta-q-mode=\"more\">Praticar mais no banco</button>")
          : "") +
      "</li>"
    );
  }).join("");
}

function aprovaBindMetasQThemesClicks (el) {
  if (!el || el.dataset.metaQBound) return;
  el.dataset.metaQBound = "1";
  el.addEventListener("click", (evt) => {
    const btn = evt.target.closest("[data-meta-q-tema]");
    if (!btn) return;
    evt.preventDefault();
    const mode = btn.getAttribute("data-meta-q-mode") || "continue";
    if (typeof aprovaFulfillMetaQuestions === "function") {
      aprovaFulfillMetaQuestions(
        btn.getAttribute("data-meta-q-spec"),
        btn.getAttribute("data-meta-q-tema"),
        Number(btn.getAttribute("data-meta-q-n")) || 10,
        { mode }
      );
    }
  });
}

function aprovaRenderHojeMetas () {
  const emptyEl = document.getElementById("hoje-metas-empty");
  const bodyEl = document.getElementById("hoje-metas-body");
  const summaryEl = document.getElementById("hoje-metas-summary");
  const quotaEl = document.getElementById("hoje-metas-quota");
  const themesEl = document.getElementById("hoje-metas-themes");
  const overdueWrap = document.getElementById("hoje-metas-overdue-wrap");
  const overdueEl = document.getElementById("hoje-metas-overdue");
  if (!emptyEl && !bodyEl) return;

  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const complete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete(profile);

  if (!complete) {
    if (emptyEl) emptyEl.hidden = false;
    if (bodyEl) bodyEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (bodyEl) bodyEl.hidden = false;

  let program = null;
  if (typeof aprovaBuildStudyPlan === "function" && typeof aprovaBuildStudyProgram === "function") {
    const plan = aprovaBuildStudyPlan(profile, aprovaSeuFocoCache, Date.now(), aprovaSeuFocoAreaId);
    if (plan && plan.ok) {
      program = aprovaBuildStudyProgram(plan, null, Date.now(), aprovaSeuFocoCache);
    }
  }

  if (program && program.qProgress && program.qQuota) {
    const qp = program.qProgress.daily;
    if (summaryEl) {
      summaryEl.textContent = qp.done + "/" + qp.goal + " questões hoje · meta " +
        ((program.qQuota.targetAccuracy != null
          ? program.qQuota.targetAccuracy
          : (typeof APROVA_DEFAULT_TARGET_ACCURACY !== "undefined" ? APROVA_DEFAULT_TARGET_ACCURACY : 75))) +
        "% de acerto";
    }
    if (quotaEl) {
      const ag = program.accuracyGoal || {};
      quotaEl.innerHTML =
        "<span class=\"dash-seu-plano-chip\">" + program.qQuota.daily + " questões/dia</span>" +
        "<span class=\"dash-seu-plano-chip\">" + program.qQuota.minutesHint + "</span>" +
        (ag.target != null
          ? ("<span class=\"dash-seu-plano-chip\">Meta " + ag.target + "%</span>")
          : "");
    }
  } else if (summaryEl) {
    summaryEl.textContent = "Monte o perfil com provas para liberar o bloco do dia.";
  }

  if (themesEl) {
    themesEl.innerHTML = aprovaBuildMetasQThemesHtml(program, aprovaSeuFocoCache);
    aprovaBindMetasQThemesClicks(themesEl);
  }

  if (overdueWrap && overdueEl && typeof aprovaBuildMateriaBoard === "function") {
    const board = aprovaBuildMateriaBoard(Date.now(), { lookbackDays: 14 });
    const late = board.overdue || [];
    if (!late.length) {
      overdueWrap.hidden = true;
      overdueEl.innerHTML = "";
    } else {
      overdueWrap.hidden = false;
      const esc = aprovaEscapeHtml;
      overdueEl.innerHTML = late.slice(0, 8).map((row) => {
        const status = (row.daysLate === 1 ? "1 dia atrasado" : (row.daysLate + " dias atrasados")) +
          " · " + row.done + "/" + row.goal;
        return (
          "<li class=\"prog-materia-row is-late\">" +
            "<div class=\"prog-materia-main\">" +
              "<span class=\"prog-materia-name\">" + esc(row.tema) + "</span>" +
              "<span class=\"prog-materia-meta\">" +
                (row.areaLabel ? esc(row.areaLabel) + " · " : "") + status +
              "</span>" +
            "</div>" +
            "<button type=\"button\" class=\"linkish\"" +
              " data-meta-q-spec=\"" + esc(row.specialty) + "\"" +
              " data-meta-q-tema=\"" + esc(row.tema) + "\"" +
              " data-meta-q-n=\"" + (row.remaining || row.goal || 10) + "\"" +
              " data-meta-q-mode=\"continue\">Recuperar</button>" +
          "</li>"
        );
      }).join("");
      aprovaBindMetasQThemesClicks(overdueEl);
    }
  }
}

function aprovaRenderSeuPlano (plan, profileComplete, focusPack) {
  const root = document.getElementById("dash-seu-plano");
  if (!root) return;

  const body = document.getElementById("dash-seu-plano-body");
  const empty = document.getElementById("dash-seu-plano-empty");
  const headline = document.getElementById("dash-seu-plano-headline");
  const daysEl = document.getElementById("dash-seu-plano-days");
  const toneEl = document.getElementById("dash-seu-plano-tone");
  const metaEl = document.getElementById("dash-seu-plano-meta");
  const phasesEl = document.getElementById("dash-seu-plano-phases");

  if (!profileComplete) {
    root.hidden = true;
    return;
  }

  root.hidden = false;

  if (!plan || !plan.ok) {
    if (body) body.hidden = true;
    if (empty) empty.hidden = false;
    if (headline) headline.textContent = "Falta configurar o perfil";
    if (daysEl) daysEl.textContent = "Salve a 1ª prova em Meu perfil";
    if (toneEl) {
      toneEl.textContent = (plan && plan.reason) ||
        "Com as provas salvas, montamos as metas de flashcards automaticamente.";
    }
    if (metaEl) metaEl.innerHTML = "";
    if (phasesEl) phasesEl.innerHTML = "";
    aprovaRenderCurriculumMap(null);
    return;
  }

  if (body) body.hidden = false;
  if (empty) empty.hidden = true;

  if (headline) headline.textContent = plan.headline;
  if (daysEl) {
    daysEl.textContent = plan.horizon.label + " · " + plan.daysLine;
  }
  if (toneEl) {
    toneEl.textContent = "";
    toneEl.hidden = true;
  }
  if (metaEl) {
    metaEl.innerHTML = plan.assumed
      ? "<span class=\"dash-seu-plano-chip\">Data padrão: fim do ano</span>"
      : "";
  }

  const program = typeof aprovaBuildStudyProgram === "function"
    ? aprovaBuildStudyProgram(plan, null, Date.now(), focusPack || aprovaSeuFocoCache)
    : null;
  const progSum = document.getElementById("dash-seu-plano-program-summary");
  const divisionEl = document.getElementById("dash-seu-plano-division");
  const quotaEl = document.getElementById("dash-seu-plano-quota");
  const tasksEl = document.getElementById("dash-seu-plano-tasks");
  const tasksMoreEl = document.getElementById("dash-seu-plano-tasks-more");
  const fcSummary = document.getElementById("metas-fc-summary");
  const qSummary = document.getElementById("metas-q-summary");
  const qBar = document.getElementById("metas-q-bar");
  const qQuotaEl = document.getElementById("metas-q-quota");
  const qThemesEl = document.getElementById("metas-q-themes");
  const qWeekEl = document.getElementById("metas-q-week");
  const qPeriodsEl = document.getElementById("metas-q-periods");
  const reviewAlert = document.getElementById("metas-review-alert");
  const reviewAlertTitle = document.getElementById("metas-review-alert-title");
  const reviewAlertBody = document.getElementById("metas-review-alert-body");
  const reviewAlertActions = document.getElementById("metas-review-alert-actions");

  if (program) {
    const daily = (program.tasks || []).find((t) => t.id === "daily");
    if (fcSummary && daily) {
      fcSummary.textContent = daily.done + "/" + daily.goal + " hoje";
    } else if (fcSummary && program.quota) {
      fcSummary.textContent = "0/" + program.quota.daily + " hoje";
    }

    if (program.qProgress && program.qQuota) {
      const qp = program.qProgress.daily;
      if (qSummary) qSummary.textContent = qp.done + "/" + qp.goal + " hoje";
      if (qBar) qBar.style.width = Math.min(100, qp.pct || 0) + "%";
      if (qQuotaEl) {
        const ag = program.accuracyGoal || {};
        qQuotaEl.innerHTML =
          "<span class=\"dash-seu-plano-chip\">" + program.qQuota.daily + " questões/dia</span>" +
          "<span class=\"dash-seu-plano-chip\">~" +
            (program.qQuota.annualTarget || 15000).toLocaleString("pt-BR") +
            "/ano</span>" +
          "<span class=\"dash-seu-plano-chip\">" + program.qQuota.minutesHint + "</span>" +
          (ag.target != null
            ? ("<span class=\"dash-seu-plano-chip\">Meta " + ag.target + "%</span>")
            : "");
      }
      if (qPeriodsEl) {
        const rows = [
          ["Hoje", program.qProgress.daily.done, program.qProgress.daily.goal],
          ["Semana", program.qProgress.weekly.done, program.qProgress.weekly.goal],
          ["Quinzena", program.qProgress.biweekly.done, program.qProgress.biweekly.goal],
          ["Mês", program.qProgress.monthly.done, program.qProgress.monthly.goal]
        ];
        qPeriodsEl.innerHTML = rows.map((r) => (
          "<li><strong>" + r[0] + "</strong><em>" + r[1] + "/" + r[2] + "</em></li>"
        )).join("");
      }
      // Aviso só quando precisa revisar (abaixo da meta) — sem lista de 3 ondas
      if (reviewAlert) {
        const weak = program.weakThemes || [];
        const wave = program.reviewWaves && program.reviewWaves.current;
        if (weak.length) {
          reviewAlert.hidden = false;
          if (reviewAlertTitle) reviewAlertTitle.textContent = "Revisão recomendada";
          if (reviewAlertBody) {
            reviewAlertBody.textContent = weak.slice(0, 3).map((w) => w.tema + " (" + w.pct + "%)").join(", ") +
              " — abaixo da sua meta. Reforce com questões e flashcards.";
          }
          if (reviewAlertActions) {
            reviewAlert.dataset.weakTema = weak[0].tema || "";
            reviewAlertActions.innerHTML =
              "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-goto=\"flashcards\">Abrir flashcards</button>" +
              "<button type=\"button\" class=\"btn btn-primary btn-compact\" data-metas-weak-start=\"1\">Responder fracos</button>";
          }
        } else if (wave && wave.id === "afinamento") {
          reviewAlert.hidden = false;
          if (reviewAlertTitle) reviewAlertTitle.textContent = "Reta final · 3ª revisão";
          if (reviewAlertBody) {
            reviewAlertBody.textContent = "Priorize drill nos temas que mais caem e combine com flashcards.";
          }
          if (reviewAlertActions) reviewAlertActions.innerHTML = "";
        } else {
          reviewAlert.hidden = true;
        }
        if (!reviewAlert.dataset.bound) {
          reviewAlert.dataset.bound = "1";
          reviewAlert.addEventListener("click", (evt) => {
            const startWeak = evt.target.closest("[data-metas-weak-start]");
            if (!startWeak) return;
            evt.preventDefault();
            const tema = reviewAlert.dataset.weakTema || "";
            if (tema) aprovaFulfillMetaQuestions("", tema, 15);
          });
        }
      }
      if (qWeekEl) {
        const t = program.qQuota.targetAccuracy;
        const examRef = typeof aprovaMetasStatsExamLabel === "function"
          ? aprovaMetasStatsExamLabel(focusPack || aprovaSeuFocoCache)
          : "";
        const freqBit = examRef
          ? ("Frequência = quanto o tema cai na estatística de " + examRef + ".")
          : "Frequência = quanto o tema cai nas provas de residência.";
        qWeekEl.textContent = (t
          ? ("Volume para meta de " + t + "% · temas rotacionam todo dia. ")
          : "Temas do dia com base no que mais caiu. ") + freqBit;
      }
      if (qThemesEl) {
        qThemesEl.innerHTML = aprovaBuildMetasQThemesHtml(program, focusPack || aprovaSeuFocoCache);
        aprovaBindMetasQThemesClicks(qThemesEl);
      }
    }

    if (progSum) {
      progSum.textContent = daily
        ? ("Hoje: " + daily.done + "/" + daily.goal)
        : "";
    }
    if (divisionEl) {
      divisionEl.textContent = "";
      divisionEl.hidden = true;
    }
    if (quotaEl) {
      const q = program.quota;
      quotaEl.innerHTML =
        "<span class=\"dash-seu-plano-chip\">" + q.daily + " cards/dia</span>" +
        "<span class=\"dash-seu-plano-chip\">" + q.minutesMin + "–" + q.minutesMax + " min</span>";
    }

    const renderTaskLi = (t) => {
      const esc = (s) => String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
      let themesBlock = "";
      if (t.showThemes && t.themeCards && t.themeCards.length) {
        const fulfillId = t.id === "daily" || t.id === "tomorrow" ? t.id : "";
        themesBlock =
          "<div class=\"dash-task-themes-head\">" +
            "<div class=\"label\" style=\"margin:0\">" + esc(t.themesLabel || "Temas") + "</div>" +
            (fulfillId
              ? ("<button type=\"button\" class=\"btn " +
                (t.id === "tomorrow" ? "btn-ghost" : "btn-primary") +
                " btn-compact\" data-meta-fulfill=\"" + fulfillId + "\">" +
                esc(t.cta || "Estudar") + "</button>")
              : "") +
          "</div>" +
          "<ul class=\"dash-task-themes\">" + t.themeCards.map((th) => (
            "<li>" +
              "<button type=\"button\" class=\"dash-task-theme-btn\"" +
                " data-meta-area=\"" + esc(th.areaId) + "\"" +
                " data-meta-tema=\"" + esc(th.tema) + "\"" +
                " data-meta-cards=\"" + (th.cards | 0) + "\"" +
                " data-meta-credit=\"" + esc(t.credit || "today") + "\">" +
                "<strong>" + th.cards + "</strong>" +
                "<span class=\"dash-task-theme-copy\">" + esc(th.tema) +
                  (th.areaLabel ? (" <span>· " + esc(th.areaLabel) + "</span>") : "") +
                "</span>" +
                "<span class=\"dash-task-theme-go\">Estudar</span>" +
              "</button>" +
            "</li>"
          )).join("") + "</ul>";
      }

      return (
        "<li class=\"dash-task dash-task--" + t.status +
          (t.id === "tomorrow" ? " dash-task--advance" : "") + "\">" +
          "<div class=\"dash-task-top\">" +
            "<strong>" + t.label + "</strong>" +
            "<em>" + t.done + "/" + t.goal + " cards</em>" +
          "</div>" +
          "<div class=\"dash-task-bar\" aria-hidden=\"true\"><i style=\"width:" + t.pct + "%\"></i></div>" +
          themesBlock +
        "</li>"
      );
    };

    const primary = (program.tasks || []).filter((t) => t.id === "daily" || t.id === "tomorrow");
    const secondary = (program.tasks || []).filter((t) => t.id !== "daily" && t.id !== "tomorrow");

    if (tasksEl) {
      tasksEl.innerHTML = primary.map(renderTaskLi).join("");
      if (!tasksEl.dataset.metaBound) {
        tasksEl.dataset.metaBound = "1";
        const onTaskClick = (evt) => {
          const fulfill = evt.target.closest("[data-meta-fulfill]");
          if (fulfill) {
            evt.preventDefault();
            const kind = fulfill.getAttribute("data-meta-fulfill");
            if (kind === "tomorrow") aprovaFulfillTomorrowMeta();
            else aprovaFulfillDailyMeta();
            return;
          }
          const themeBtn = evt.target.closest("[data-meta-area]");
          if (themeBtn) {
            evt.preventDefault();
            aprovaApplyMetaCredit(themeBtn.getAttribute("data-meta-credit"));
            aprovaFulfillMetaTheme(
              themeBtn.getAttribute("data-meta-area"),
              themeBtn.getAttribute("data-meta-tema"),
              Number(themeBtn.getAttribute("data-meta-cards")) || 0
            );
          }
        };
        tasksEl.addEventListener("click", onTaskClick);
        if (tasksMoreEl) tasksMoreEl.addEventListener("click", onTaskClick);
      }
    }
    if (tasksMoreEl) {
      tasksMoreEl.innerHTML = secondary.map(renderTaskLi).join("");
    }

    aprovaRenderCurriculumMap(program.curriculum);
  } else {
    if (progSum) progSum.textContent = "";
    if (divisionEl) divisionEl.textContent = "";
    if (quotaEl) quotaEl.innerHTML = "";
    if (tasksEl) tasksEl.innerHTML = "";
    if (tasksMoreEl) tasksMoreEl.innerHTML = "";
    aprovaRenderCurriculumMap(null);
  }

  if (phasesEl) {
    phasesEl.innerHTML = (plan.phases || []).map(p => (
      "<li class=\"" + (p.current ? "is-current" : "") + "\">" +
        "<strong>" + (p.current ? "Agora · " : "") + p.label + "</strong>" +
        "<span>" + p.startLabel + " → " + p.endLabel +
        " · " + p.studyPct + "% estudo / " + p.reviewPct + "% revisão</span>" +
        (p.tip ? ("<span style=\"display:block;margin-top:0.2rem\">" + p.tip + "</span>") : "") +
      "</li>"
    )).join("");
  }
}

function aprovaRenderCurriculumMap (curriculum) {
  const root = document.getElementById("dash-curriculum");
  const noteEl = document.getElementById("dash-curriculum-note");
  const body = document.getElementById("dash-curriculum-body");
  if (!root || !body) return;

  if (!curriculum || !curriculum.ok || !curriculum.areas || !curriculum.areas.length) {
    root.hidden = true;
    body.innerHTML = "";
    if (noteEl) noteEl.textContent = "";
    return;
  }

  root.hidden = false;
  if (noteEl) {
    noteEl.textContent = curriculum.untilExamCards
      ? ("~" + curriculum.untilExamCards + " cards até a prova neste ritmo")
      : "";
  }

  const esc = s => String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

  body.innerHTML = curriculum.areas.map(area => {
    if (!area.themes || !area.themes.length) return "";
    const rows = area.themes.map(t => {
      const pctLabel = typeof aprovaFormatPct === "function"
        ? aprovaFormatPct(t.pct)
        : (t.pct + "%");
      const cardsBit = t.cardsUntil
        ? ("~" + t.cardsUntil + " cards")
        : pctLabel;
      return (
        "<li>" +
          "<button type=\"button\" class=\"dash-curriculum-theme\"" +
            " data-meta-area=\"" + esc(area.id) + "\"" +
            " data-meta-tema=\"" + esc(t.tema) + "\"" +
            " data-meta-cards=\"" + (t.cardsUntil || 0) + "\">" +
            "<span class=\"dash-curriculum-tier dash-curriculum-tier--" + t.tier + "\">" +
              esc(t.tierLabel) +
            "</span>" +
            "<strong>" + esc(t.tema) + "</strong>" +
            "<em>" + cardsBit + " · " + pctLabel + "</em>" +
            "<span class=\"dash-task-theme-go\">Estudar</span>" +
          "</button>" +
        "</li>"
      );
    }).join("");

    return (
      "<details class=\"dash-curriculum-area\"" +
        (area.id === "clinica" || area.id === "cirurgia" || area.id === "pediatria" ? " open" : "") +
      ">" +
        "<summary>" + esc(area.label) +
          " <span>" + area.themes.length + " tema" +
          (area.themes.length === 1 ? "" : "s") + "</span></summary>" +
        "<ul class=\"dash-curriculum-list\">" + rows + "</ul>" +
      "</details>"
    );
  }).join("");

  if (!body.dataset.metaBound) {
    body.dataset.metaBound = "1";
    body.addEventListener("click", evt => {
      const themeBtn = evt.target.closest("[data-meta-area]");
      if (!themeBtn) return;
      evt.preventDefault();
      aprovaApplyMetaCredit("today");
      aprovaFulfillMetaTheme(
        themeBtn.getAttribute("data-meta-area"),
        themeBtn.getAttribute("data-meta-tema"),
        Number(themeBtn.getAttribute("data-meta-cards")) || 0
      );
    });
  }
}

function aprovaRenderMetas () {
  const empty = document.getElementById("metas-empty");
  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const complete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete(profile);
  if (empty) empty.hidden = complete;

  document.querySelectorAll("#panel-metas details.metas-track, #panel-metas details.metas-details, #panel-metas details.dash-seu-foco-wrap").forEach((el) => {
    el.open = false;
  });

  const preview = document.getElementById("dash-metas-preview");
  if (preview) {
    if (!complete) {
      preview.textContent = "Configure o perfil para liberar metas diárias e por tema.";
    } else if (typeof aprovaProfileSummary === "function") {
      const summary = aprovaProfileSummary(profile);
      preview.textContent = summary.line + " · toque para ver suas metas";
    }
  }

  return aprovaRenderSeuFoco();
}

function aprovaRenderSeuFoco () {
  const root = document.getElementById("dash-seu-foco");
  const wrap = document.getElementById("dash-seu-foco-wrap");
  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const complete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete(profile);

  // Metas no topo — já com rascunho; depois enriquecemos com o foco de todas as áreas
  if (typeof aprovaBuildStudyPlan === "function") {
    aprovaRenderSeuPlano(
      complete ? aprovaBuildStudyPlan(profile, null) : null,
      complete,
      null
    );
  }

  if (!complete) {
    if (root) root.hidden = true;
    if (wrap) wrap.hidden = true;
    aprovaSeuFocoCache = null;
    return Promise.resolve();
  }

  if (wrap) wrap.hidden = false;

  const focusPromise = typeof aprovaBuildPersonalizedFocus === "function"
    ? aprovaBuildPersonalizedFocus(profile)
    : Promise.resolve(null);

  if (root) {
    root.hidden = false;
    const moreEl = document.getElementById("dash-seu-foco-more");
    if (moreEl) moreEl.innerHTML = "<p class=\"muted\">Carregando o que mais caiu…</p>";
  }

  return focusPromise.then(pack => {
    aprovaSeuFocoCache = pack;

    // Atualiza metas com temas de todas as áreas (não depende do clique)
    if (typeof aprovaBuildStudyPlan === "function") {
      aprovaRenderSeuPlano(
        aprovaBuildStudyPlan(profile, pack && pack.ok ? pack : null),
        true,
        pack
      );
    }
    if (typeof aprovaRenderHojeMetas === "function") {
      aprovaRenderHojeMetas();
    }

    if (root && typeof aprovaBuildPersonalizedFocus === "function") {
      const weightsEl = document.getElementById("dash-seu-foco-weights");
      const moreEl = document.getElementById("dash-seu-foco-more");
      const noteEl = document.getElementById("dash-seu-foco-note");

      if (!pack || !pack.ok) {
        if (weightsEl) {
          weightsEl.textContent = (pack && pack.reason) || "Defina ao menos uma banca da lista no perfil.";
        }
        if (moreEl) moreEl.innerHTML = "";
        const lessEl = document.getElementById("dash-seu-foco-less");
        if (lessEl) lessEl.innerHTML = "";
        const areasEl = document.getElementById("dash-seu-foco-areas");
        if (areasEl) areasEl.innerHTML = "";
        if (wrap) wrap.hidden = true;
      } else {
        aprovaSeuFocoViewPack = pack;
        if (aprovaSeuFocoStatsMode === "perfil") {
          // mantém modo perfil ao recarregar
        }
        aprovaRefreshSeuFocoStatsView();

        if (pack.primaryExamId) {
          aprovaFcHomeStatsFocus = pack.primaryExamId;
        }
      }
    }
  }).catch(() => {
    if (root) {
      const moreEl = document.getElementById("dash-seu-foco-more");
      if (moreEl) moreEl.innerHTML = "<p class=\"muted\">Não foi possível carregar o detalhe por área.</p>";
    }
  });
}

function aprovaRenderDashboard () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const hello = document.getElementById("dash-hello");
  if (hello) hello.textContent = (session && (session.name || session.login)) || "estudante";

  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const summary = typeof aprovaProfileSummary === "function"
    ? aprovaProfileSummary(profile)
    : { complete: false, line: "Escolha as provas que você pretende prestar.", detail: "", hasDates: false };

  // Início: aviso de personalização; metas em Minhas metas / cadastro em Meu perfil
  const banner = document.getElementById("dash-profile-banner");
  const bannerTitle = document.getElementById("dash-profile-banner-title");
  const bannerText = document.getElementById("dash-profile-banner-text");
  const bannerBtn = document.getElementById("dash-profile-banner-btn");
  if (banner) banner.hidden = false;
  if (summary.complete) {
    if (bannerTitle) bannerTitle.textContent = "Experiência personalizada";
    if (bannerText) {
      bannerText.textContent = "Perfil configurado (" + summary.line +
        "). Veja as metas de flashcards em Minhas metas ou ajuste provas e datas em Meu perfil.";
    }
    if (bannerBtn) {
      bannerBtn.textContent = "Abrir minhas metas";
      bannerBtn.setAttribute("data-goto", "metas");
    }
  } else {
    if (bannerTitle) bannerTitle.textContent = "Personalize seu estudo";
    if (bannerText) {
      bannerText.textContent = "Para uma experiência personalizada, configure seu perfil com as provas que você pretende prestar (até 3, por prioridade) e a data — ou “Não sei”. As metas aparecem em Minhas metas.";
    }
    if (bannerBtn) {
      bannerBtn.textContent = "Configurar meu perfil";
      bannerBtn.setAttribute("data-goto", "perfil");
    }
  }

  const metasPreview = document.getElementById("dash-metas-preview");
  if (metasPreview) {
    metasPreview.textContent = summary.complete
      ? (summary.line + " · toque para ver suas metas")
      : "Configure o perfil para liberar metas diárias e por tema.";
  }

  const sideUser = document.getElementById("sidebar-user-label");
  if (sideUser && session) {
    const base = session.name || session.login || "Estudante";
    sideUser.textContent = summary.complete ? (base + " · " + summary.line) : base;
  }

  aprovaRenderToday();
  aprovaRenderExamStats();
}

let aprovaPerfilActiveTab = 0;
let aprovaPerfilDraft = [null, null, null];

function aprovaPerfilSlotFromControls () {
  const select = document.getElementById("perfil-slot-select");
  const other = document.getElementById("perfil-slot-other");
  const dateEl = document.getElementById("perfil-slot-date");
  const accEl = document.getElementById("perfil-slot-accuracy");
  if (!select) return null;
  const value = select.value;
  const date = dateEl && dateEl.value
    ? (typeof aprovaNormalizeExamDate === "function"
      ? aprovaNormalizeExamDate(dateEl.value)
      : dateEl.value)
    : null;
  const rawAcc = accEl ? String(accEl.value || "").trim() : "";
  const targetAccuracy = rawAcc === ""
    ? null
    : (typeof aprovaNormalizeTargetAccuracy === "function"
      ? aprovaNormalizeTargetAccuracy(rawAcc)
      : Math.max(50, Math.min(95, Math.round(Number(rawAcc) || 75))));
  if (!value || value === "") return null;
  if (value === "__other__") {
    const label = other ? String(other.value || "").trim() : "";
    if (!label) {
      const incomplete = { kind: "other", label: "", incomplete: true };
      if (date) incomplete.date = date;
      if (targetAccuracy != null) incomplete.targetAccuracy = targetAccuracy;
      return incomplete;
    }
    const slot = { kind: "other", label };
    if (date) slot.date = date;
    if (targetAccuracy != null) slot.targetAccuracy = targetAccuracy;
    return slot;
  }
  const slot = { kind: "exam", id: value };
  if (date) slot.date = date;
  if (targetAccuracy != null) slot.targetAccuracy = targetAccuracy;
  return slot;
}

function aprovaPerfilCommitActiveSlot () {
  const slot = aprovaPerfilSlotFromControls();
  if (slot && slot.incomplete) {
    const keep = { kind: "other", label: "" };
    if (slot.date) keep.date = slot.date;
    if (slot.targetAccuracy != null) keep.targetAccuracy = slot.targetAccuracy;
    aprovaPerfilDraft[aprovaPerfilActiveTab] = keep;
    return;
  }
  aprovaPerfilDraft[aprovaPerfilActiveTab] = slot;
}

function aprovaPerfilUpdateSummary () {
  const list = document.getElementById("perfil-priority-summary");
  if (!list) return;
  const labels = ["1ª", "2ª", "3ª"];
  list.innerHTML = aprovaPerfilDraft.map((slot, i) => {
    const name = slot && typeof aprovaPriorityLabel === "function"
      ? aprovaPriorityLabel(slot)
      : "";
    let dateTxt = "";
    if (slot && slot.date && typeof aprovaFormatDateBr === "function") {
      dateTxt = " · " + aprovaFormatDateBr(slot.date);
    } else if (slot && name && typeof aprovaYearEndExamIso === "function") {
      dateTxt = " · fim do ano (padrão)";
    }
    const acc = slot && slot.targetAccuracy != null
      ? (" · meta " + (typeof aprovaNormalizeTargetAccuracy === "function"
        ? aprovaNormalizeTargetAccuracy(slot.targetAccuracy)
        : slot.targetAccuracy) + "%")
      : "";
    return "<li><strong>" + labels[i] + "</strong> — " +
      (name || "não definida") + dateTxt + acc + "</li>";
  }).join("");

  const preview = document.getElementById("perfil-plan-preview");
  if (preview && typeof aprovaBuildStudyPlan === "function") {
    const plan = aprovaBuildStudyPlan({ priorities: aprovaPerfilDraft }, null);
    const primary = aprovaPerfilDraft.find(Boolean);
    const target = primary && primary.targetAccuracy != null && String(primary.targetAccuracy).trim() !== ""
      ? (typeof aprovaNormalizeTargetAccuracy === "function"
        ? aprovaNormalizeTargetAccuracy(primary.targetAccuracy)
        : primary.targetAccuracy)
      : (typeof APROVA_DEFAULT_TARGET_ACCURACY !== "undefined" ? APROVA_DEFAULT_TARGET_ACCURACY : 75);
    if (plan && plan.ok) {
      preview.textContent = "Após salvar, veja em Minhas metas: " + plan.horizon.label +
        " · " + plan.daysLine +
        " · meta de acerto " + target + "%" +
        (plan.assumed ? " · data fim do ano." : ".");
    } else {
      preview.textContent = "Escolha a 1ª prova e a % de acerto esperada — as metas aparecem em Minhas metas.";
    }
  }
}

function aprovaRenderPerfilSlot () {
  const select = document.getElementById("perfil-slot-select");
  const other = document.getElementById("perfil-slot-other");
  const labelEl = document.getElementById("perfil-slot-label");
  const hintEl = document.getElementById("perfil-slot-hint");
  const exams = typeof APROVA_TARGET_EXAMS !== "undefined" ? APROVA_TARGET_EXAMS : [];
  if (!select) return;

  const idx = aprovaPerfilActiveTab;
  const titles = ["Prioridade 1", "Prioridade 2", "Prioridade 3"];
  const hints = [
    "Prova principal que você pretende prestar. Deixe em branco e salve para limpar o perfil.",
    "Segunda opção — opcional.",
    "Terceira opção — opcional."
  ];
  if (labelEl) labelEl.textContent = titles[idx];
  if (hintEl) hintEl.textContent = hints[idx];

  const used = new Set();
  aprovaPerfilDraft.forEach((slot, i) => {
    if (i === idx) return;
    if (slot && slot.kind === "exam" && slot.id) used.add(slot.id);
  });

  const current = aprovaPerfilDraft[idx];
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = idx === 0 ? "Selecione a prova principal…" : "Nenhuma (opcional)";
  select.appendChild(empty);

  exams.forEach(exam => {
    if (used.has(exam.id) && !(current && current.kind === "exam" && current.id === exam.id)) {
      return;
    }
    const opt = document.createElement("option");
    opt.value = exam.id;
    opt.textContent = exam.label;
    select.appendChild(opt);
  });

  const otherOpt = document.createElement("option");
  otherOpt.value = "__other__";
  otherOpt.textContent = "Outra (escrever nome)";
  select.appendChild(otherOpt);

  const dateEl = document.getElementById("perfil-slot-date");

  if (current && current.kind === "exam") {
    select.value = current.id;
    if (other) {
      other.hidden = true;
      other.value = "";
    }
  } else if (current && current.kind === "other") {
    select.value = "__other__";
    if (other) {
      other.hidden = false;
      other.value = current.label || "";
    }
  } else {
    select.value = "";
    if (other) {
      other.hidden = true;
      other.value = "";
    }
  }

  if (dateEl) {
    dateEl.value = current && current.date ? current.date : "";
    dateEl.disabled = false;
  }

  const accEl = document.getElementById("perfil-slot-accuracy");
  if (accEl) {
    const def = typeof APROVA_DEFAULT_TARGET_ACCURACY !== "undefined"
      ? APROVA_DEFAULT_TARGET_ACCURACY
      : 75;
    accEl.placeholder = String(def);
    // Em branco = padrão; só preenche se o aluno cadastrou um valor.
    if (current && current.targetAccuracy != null && String(current.targetAccuracy).trim() !== "") {
      accEl.value = String(typeof aprovaNormalizeTargetAccuracy === "function"
        ? aprovaNormalizeTargetAccuracy(current.targetAccuracy)
        : current.targetAccuracy);
    } else {
      accEl.value = "";
    }
    accEl.disabled = !current;
  }

  document.querySelectorAll("[data-perfil-tab]").forEach(btn => {
    const active = Number(btn.dataset.perfilTab) === idx;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  aprovaPerfilUpdateSummary();
}

function aprovaRenderPerfil () {
  const msg = document.getElementById("perfil-save-msg");
  const profile = typeof aprovaLoadProfile === "function"
    ? aprovaLoadProfile()
    : { priorities: [null, null, null] };
  aprovaPerfilDraft = [
    profile.priorities[0] || null,
    profile.priorities[1] || null,
    profile.priorities[2] || null
  ];
  aprovaPerfilActiveTab = 0;
  if (msg) {
    msg.hidden = true;
    msg.textContent = "";
  }
  aprovaRenderPerfilSlot();
}

function aprovaSavePerfilFromForm () {
  const msg = document.getElementById("perfil-save-msg");
  if (typeof aprovaSaveProfile !== "function") return null;

  aprovaPerfilCommitActiveSlot();
  const draft = aprovaPerfilDraft.slice();

  for (let i = 0; i < 3; i++) {
    const slot = draft[i];
    if (slot && slot.kind === "other" && !String(slot.label || "").trim()) {
      if (msg) {
        msg.hidden = false;
        msg.textContent = "Na " + (i + 1) + "ª prioridade, escreva o nome da prova em Outra.";
        msg.classList.remove("profile-msg--ok");
        msg.classList.add("profile-msg--err");
      }
      aprovaPerfilActiveTab = i;
      aprovaRenderPerfilSlot();
      return null;
    }
  }

  // Em branco na 1ª = limpar personalização (volta ao estado inicial)
  if (!draft[0]) {
    const cleared = aprovaSaveProfile({ priorities: [null, null, null] });
    aprovaPerfilDraft = [null, null, null];
    aprovaPerfilActiveTab = 0;
    if (msg) {
      msg.hidden = false;
      msg.textContent = "Perfil limpo. Escolha de novo a 1ª prioridade quando quiser personalizar.";
      msg.classList.remove("profile-msg--err");
      msg.classList.add("profile-msg--ok");
    }
    aprovaSeuFocoCache = null;
    aprovaRenderPerfilSlot();
    aprovaPerfilUpdateSummary();
    aprovaRenderDashboard();
    return cleared;
  }

  // Não permitir 2ª/3ª preenchida se a anterior estiver vazia
  if (!draft[1] && draft[2]) {
    draft[1] = draft[2];
    draft[2] = null;
  }

  const ids = draft
    .filter(s => s && s.kind === "exam")
    .map(s => s.id);
  if (new Set(ids).size !== ids.length) {
    if (msg) {
      msg.hidden = false;
      msg.textContent = "Não repita a mesma prova em mais de uma prioridade.";
      msg.classList.remove("profile-msg--ok");
      msg.classList.add("profile-msg--err");
    }
    return null;
  }

  const saved = aprovaSaveProfile({ priorities: draft });
  aprovaPerfilDraft = saved.priorities.slice();
  const hasDates = typeof aprovaProfileHasExamDates === "function"
    ? aprovaProfileHasExamDates(saved)
    : saved.priorities.some(s => s && s.date);
  if (msg) {
    msg.hidden = false;
    msg.textContent = hasDates
      ? "Perfil salvo. Abra Minhas metas para ver o que estudar hoje."
      : "Perfil salvo. Sem data, Minhas metas usa o fim deste ano — abra a aba Minhas metas.";
    msg.classList.remove("profile-msg--err");
    msg.classList.add("profile-msg--ok");
  }
  aprovaPerfilUpdateSummary();
  aprovaSeuFocoCache = null;
  aprovaRenderDashboard();
  // Recalcula metas/temas com a mistura 50/30/20 das prioridades salvas
  if (typeof aprovaRenderMetas === "function") {
    aprovaRenderMetas();
  }
  return saved;
}

function aprovaRenderToday () {
  const prompt = document.getElementById("today-prompt");
  const stats = document.getElementById("today-stats");
  const startBtn = document.getElementById("today-start");
  const cardIds = AprovaFlashcards.allIds();
  const summary = aprovaTodaySummary(cardIds, AprovaQuestions.items.length);
  const srs = typeof aprovaSrsProgressSummary === "function"
    ? aprovaSrsProgressSummary(cardIds)
    : {
      pending: summary.pending,
      due: 0,
      newCards: summary.pending,
      studiedToday: summary.studiedToday || 0
    };

  aprovaRenderHojeMetas();

  if (prompt) prompt.textContent = summary.prompt;
  if (stats) {
    stats.innerHTML = summary.stats.map(s => "<span>" + s + "</span>").join("");
  }

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set("hoje-stat-pending", String(srs.pending));
  set("hoje-stat-due", String(srs.due));
  set("hoje-stat-new", String(srs.newCards));
  set("hoje-stat-done", String(srs.studiedToday));

  const dashPreview = document.getElementById("dash-hoje-preview");
  if (dashPreview) {
    let metaBit = "";
    let goalBit = "";
    if (typeof aprovaBuildStudyPlan === "function" && typeof aprovaBuildStudyProgram === "function" &&
        typeof aprovaLoadProfile === "function" && typeof aprovaProfileIsComplete === "function") {
      const profile = aprovaLoadProfile();
      if (aprovaProfileIsComplete(profile)) {
        const plan = aprovaBuildStudyPlan(profile, aprovaSeuFocoCache, Date.now(), aprovaSeuFocoAreaId);
        const prog = plan && plan.ok ? aprovaBuildStudyProgram(plan, null, Date.now(), aprovaSeuFocoCache) : null;
        if (prog && prog.qProgress && prog.qProgress.daily) {
          metaBit = "Questões " + prog.qProgress.daily.done + "/" + prog.qProgress.daily.goal;
        }
        if (prog && prog.quota) {
          const done = typeof aprovaActivityToday === "function" ? aprovaActivityToday() : (srs.studiedToday || 0);
          goalBit = " · cards " + done + "/" + prog.quota.daily;
        }
      }
    }
    let lateBit = "";
    if (typeof aprovaBuildMateriaBoard === "function") {
      const board = aprovaBuildMateriaBoard(Date.now(), { lookbackDays: 14 });
      const nLate = (board.overdue || []).length;
      if (nLate) lateBit = " · " + nLate + " atrasada" + (nLate === 1 ? "" : "s");
    }
    if (metaBit) {
      dashPreview.textContent = metaBit + lateBit +
        (srs.pending ? (" · " + srs.pending + " cards na fila") : " · cards em dia") + goalBit;
    } else if (!cardIds.length) {
      dashPreview.textContent = "Carregando flashcards…";
    } else if (srs.pending) {
      dashPreview.textContent = srs.pending + " na fila · " + srs.due + " revisão · " +
        srs.newCards + " novo" + (srs.newCards === 1 ? "" : "s") +
        (srs.studiedToday ? (" · " + srs.studiedToday + " feitos hoje") : "") +
        goalBit;
    } else {
      dashPreview.textContent = (srs.studiedToday
        ? ("Fila em dia · " + srs.studiedToday + " estudados hoje")
        : "Fila em dia — nada pendente agora.") + goalBit;
    }
  }

  if (startBtn) {
    startBtn.disabled = srs.pending === 0;
    startBtn.textContent = srs.pending
      ? "Começar revisão (" + srs.pending + ")"
      : "Fila vazia";
  }
}

function aprovaRenderProgress () {
  const prompt = document.getElementById("progress-prompt");
  const stats = document.getElementById("progress-stats");
  const cardIds = AprovaFlashcards.allIds();
  const summary = aprovaTodaySummary(cardIds, AprovaQuestions.items.length);
  const srs = typeof aprovaSrsProgressSummary === "function"
    ? aprovaSrsProgressSummary(cardIds)
    : null;

  if (prompt) prompt.textContent = summary.prompt;
  if (stats) stats.innerHTML = summary.stats.map(s => "<span>" + s + "</span>").join("");

  const setFc = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  if (srs) {
    setFc("fc-stat-today", String(srs.studiedToday));
    setFc("fc-stat-easy", String(srs.easyToday));
    setFc("fc-stat-hard", String(srs.hardToday));
    setFc("fc-stat-scheduled", String(srs.scheduled));
    setFc("fc-stat-pending", String(srs.pending));
    setFc("fc-stat-reviewed", String(srs.reviewedTotal));
  }

  const progPreview = document.getElementById("dash-progress-preview");
  if (progPreview && srs) {
    if (srs.studiedToday) {
      progPreview.textContent = srs.studiedToday + " flashcard" +
        (srs.studiedToday === 1 ? "" : "s") + " hoje · " +
        srs.scheduled + " na agenda · " + srs.pending + " na fila";
    } else if (srs.reviewedTotal) {
      progPreview.textContent = srs.reviewedTotal + " já revisados · " +
        srs.pending + " ainda na fila de hoje";
    }
  }

  aprovaRenderExamStats();
  aprovaRenderMateriaProgress();
}

function aprovaRenderMateriaProgress () {
  const onEl = document.getElementById("prog-materia-onday");
  const lateEl = document.getElementById("prog-materia-late");
  if (!onEl && !lateEl) return;

  const esc = (s) => String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

  let board = { onTrack: [], pendingToday: [], overdue: [] };
  if (typeof aprovaBuildMateriaBoard === "function") {
    board = aprovaBuildMateriaBoard(Date.now(), { lookbackDays: 14 });
  }

  const rowHtml = (row, late) => {
    const ok = !late && (row.done | 0) >= (row.goal | 0);
    const status = late
      ? ((row.daysLate === 1 ? "1 dia atrasado" : (row.daysLate + " dias atrasados")) +
        " · " + row.done + "/" + row.goal)
      : (ok
        ? ("Cumprido · " + row.done + "/" + row.goal +
          (row.pct != null ? (" · " + row.pct + "% acerto") : ""))
        : (row.done + "/" + row.goal + " · faltam " + row.remaining +
          (row.pct != null ? (" · " + row.pct + "%") : "")));
    return (
      "<li class=\"prog-materia-row" + (late ? " is-late" : (ok ? " is-ok" : "")) + "\">" +
        "<div class=\"prog-materia-main\">" +
          "<span class=\"prog-materia-name\">" + esc(row.tema) + "</span>" +
          "<span class=\"prog-materia-meta\">" +
            (row.areaLabel ? esc(row.areaLabel) + " · " : "") + status +
          "</span>" +
        "</div>" +
        ((!ok || late)
          ? ("<button type=\"button\" class=\"linkish\"" +
            " data-meta-q-spec=\"" + esc(row.specialty) + "\"" +
            " data-meta-q-tema=\"" + esc(row.tema) + "\"" +
            " data-meta-q-n=\"" + (row.remaining || row.goal || 10) + "\">" +
            (late ? "Recuperar" : "Responder") + "</button>")
          : "") +
      "</li>"
    );
  };

  if (onEl) {
    const onDay = [].concat(board.onTrack || [], board.pendingToday || []);
    onEl.innerHTML = onDay.length
      ? onDay.map((r) => rowHtml(r, false)).join("")
      : "<li class=\"prog-materia-empty muted\">Nenhuma matéria do dia ainda — abra Minhas metas.</li>";
  }
  if (lateEl) {
    const late = board.overdue || [];
    lateEl.innerHTML = late.length
      ? late.slice(0, 10).map((r) => rowHtml(r, true)).join("")
      : "<li class=\"prog-materia-empty muted\">Nenhuma matéria atrasada.</li>";
  }

  const root = document.querySelector(".prog-materia");
  if (root && !root.dataset.metaQBound) {
    root.dataset.metaQBound = "1";
    root.addEventListener("click", (evt) => {
      const btn = evt.target.closest("[data-meta-q-tema]");
      if (!btn) return;
      evt.preventDefault();
      if (typeof aprovaFulfillMetaQuestions === "function") {
        aprovaFulfillMetaQuestions(
          btn.getAttribute("data-meta-q-spec"),
          btn.getAttribute("data-meta-q-tema"),
          Number(btn.getAttribute("data-meta-q-n")) || 10
        );
      }
    });
  }
}

function aprovaRenderConfig () {
  const el = document.getElementById("config-user");
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  if (el) {
    el.textContent = session
      ? ((session.name || session.login) + " · " + session.login)
      : "Nenhuma sessão ativa";
  }

  const hint = document.getElementById("config-plan-hint");
  if (hint && typeof aprovaLoadProfile === "function") {
    const profile = aprovaLoadProfile();
    const hasDates = typeof aprovaProfileHasExamDates === "function" && aprovaProfileHasExamDates(profile);
    const complete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete(profile);
    if (hasDates && typeof aprovaBuildStudyPlan === "function") {
      const plan = aprovaBuildStudyPlan(profile, null);
      hint.textContent = plan && plan.ok
        ? ("Metas ativas: " + plan.headline + " · " + plan.horizon.label + " (" + plan.daysLine + "). Veja Minhas metas; datas em Meu perfil.")
        : "Datas salvas no perfil. Abra Minhas metas para ver o ritmo de estudo.";
    } else if (complete) {
      hint.textContent = "Provas salvas. Sem data, Minhas metas usa o fim do ano. Ajuste a data em Meu perfil se quiser.";
    } else {
      hint.textContent = "Cadastre as provas em Meu perfil. As metas diárias e por tema ficam em Minhas metas.";
    }
  }
}

function aprovaRenderFlashcard () {
  const studyCard = document.getElementById("fc-card");
  if (studyCard && studyCard.hidden) return;

  const card = AprovaFlashcards.current();
  const front = document.getElementById("fc-front");
  const back = document.getElementById("fc-back");
  const label = document.getElementById("fc-deck-label");
  const hint = document.getElementById("fc-hint");
  const revealBtn = document.getElementById("fc-reveal");
  const easyBtn = document.getElementById("fc-easy");
  const hardBtn = document.getElementById("fc-hard");
  const backHoje = document.getElementById("fc-back-hoje");
  const backBrowse = document.getElementById("fc-back-browse");
  const backEsp = document.getElementById("fc-back-esp");
  if (!front || !label) return;

  const fromDeck = AprovaFlashcards.mode === "deck";
  const fromToday = AprovaFlashcards.mode === "today";

  if (!card) {
    label.textContent = fromDeck ? "Tema em dia" : "Fila de hoje";
    front.textContent = fromDeck
      ? "Sem cards novos ou vencidos neste tema agora. Os que você já fez voltam só na data de revisão."
      : "Nada pendente — agenda em dia.";
    back.hidden = true;
    back.textContent = "";
    revealBtn.hidden = true;
    easyBtn.hidden = true;
    hardBtn.hidden = true;
    if (backHoje) backHoje.hidden = !fromToday;
    if (backBrowse) backBrowse.hidden = false;
    if (backEsp) backEsp.hidden = !fromDeck;
    if (hint) {
      hint.textContent = fromDeck
        ? "Escolha outro tema ou volte amanhã para novos/revisões."
        : "Volte amanhã ou escolha um tema.";
    }
    return;
  }

  const left = AprovaFlashcards.remaining();
  label.textContent = card.deckName + " · " + left + " restante" + (left === 1 ? "" : "s");
  front.textContent = card.front;
  back.textContent = card.back;
  back.hidden = !AprovaFlashcards.revealed;
  revealBtn.hidden = AprovaFlashcards.revealed;
  easyBtn.hidden = !AprovaFlashcards.revealed;
  hardBtn.hidden = !AprovaFlashcards.revealed;
  if (backHoje) backHoje.hidden = true;
  if (backBrowse) backBrowse.hidden = false;
  if (backEsp) backEsp.hidden = !fromDeck;
  if (hint) {
    hint.textContent = fromDeck
      ? "Estudo por tema · revelar · acertei / errei."
      : "Fila de hoje · revelar · acertei / errei.";
  }
}

let aprovaQBrowse = {
  level: "areas", // areas | groups (themes removido do fluxo)
  specialty: "",
  group: "",
  theme: "",
  exam: "",
  year: ""
};

let aprovaQBrowseStatsFocus = "";
let aprovaQBrowseStatsYear = "geral";
let aprovaQBrowseExamChooserOpen = false;
/** @type {Record<string, number>} */
let aprovaQBrowseGroupWeights = Object.create(null);

function aprovaQNormKey (text) {
  if (typeof aprovaFocusNormKey === "function") return aprovaFocusNormKey(text);
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Associa nome de grupo/subtema do banco ao tema das estatísticas de prova. */
function aprovaQMatchStatPct (label, priorities) {
  const key = aprovaQNormKey(label);
  if (!key || !Array.isArray(priorities) || !priorities.length) return null;
  let best = null;
  priorities.forEach((p) => {
    const tema = String(p.tema || "");
    const tKey = aprovaQNormKey(tema);
    if (!tKey) return;
    const hit = key === tKey
      || key.indexOf(tKey) >= 0
      || tKey.indexOf(key) >= 0
      || key.split(" ").some((w) => w.length > 4 && tKey.indexOf(w) >= 0)
      || tKey.split(" ").some((w) => w.length > 4 && key.indexOf(w) >= 0);
    if (!hit) return;
    const pct = Number(p.pct);
    if (!Number.isFinite(pct)) return;
    if (!best || pct > best.pct) best = { tema, pct, n: p.n };
  });
  return best;
}

function aprovaQHideBrowseStats () {
  const root = document.getElementById("q-browse-stats");
  if (root) root.hidden = true;
  aprovaQBrowseGroupWeights = Object.create(null);
}

function aprovaRenderQuestionBrowseStats (specialty) {
  const root = document.getElementById("q-browse-stats");
  const options = document.getElementById("q-browse-stats-options");
  const bars = document.getElementById("q-browse-stats-bars");
  const title = document.getElementById("q-browse-stats-title");
  const sub = document.getElementById("q-browse-stats-sub");
  const verdict = document.getElementById("q-browse-stats-verdict");
  const unitEl = document.getElementById("q-browse-stats-unit");
  const sourceEl = document.getElementById("q-browse-stats-source");
  if (!root || !options || !bars) return Promise.resolve(null);

  if (!specialty) {
    root.hidden = true;
    return Promise.resolve(null);
  }

  if (!aprovaQBrowseStatsFocus) {
    aprovaQBrowseStatsFocus = aprovaPreferredExamFocus();
  }
  if (!aprovaQBrowseStatsYear) aprovaQBrowseStatsYear = "geral";

  const prevSpec = aprovaActiveSpecialty;
  const prevCli = aprovaActiveCliArea;
  const prevGo = aprovaActiveGoArea;
  aprovaActiveSpecialty = specialty;
  if (specialty !== "clinica") aprovaActiveCliArea = null;
  aprovaActiveGoArea = specialty === "go" ? (aprovaActiveGoArea || "ginecologia") : null;

  return aprovaLoadOverviewStats(specialty).then((data) => {
    aprovaActiveSpecialty = prevSpec;
    aprovaActiveCliArea = prevCli;
    aprovaActiveGoArea = prevGo;

    if (!data || !Array.isArray(data.profiles) || !data.profiles.length) {
      root.hidden = false;
      bars.innerHTML = "<p class=\"muted\">Estatísticas desta área em breve — os grupos abaixo já estão disponíveis para treino.</p>";
      if (title) title.textContent = "O que mais caiu · " + aprovaQSpecialtyLabel(specialty);
      if (sub) sub.textContent = "Quando houver levantamento, ele aparece aqui para orientar o foco.";
      if (verdict) verdict.textContent = "";
      if (unitEl) unitEl.hidden = true;
      if (sourceEl) sourceEl.textContent = "";
      options.innerHTML = "";
      return null;
    }

    root.hidden = false;
    const profile = data.profiles.find((p) => p.id === aprovaQBrowseStatsFocus)
      || data.profiles.find((p) => p.id === "geral")
      || data.profiles[0];
    aprovaQBrowseStatsFocus = profile.id;

    aprovaRenderExamYearFilters(options, {
      profiles: data.profiles,
      activeId: profile.id,
      activeYear: aprovaQBrowseStatsYear,
      chooserOpen: aprovaQBrowseExamChooserOpen,
      onExam: (id) => {
        aprovaQBrowseExamChooserOpen = false;
        aprovaQBrowseStatsFocus = id;
        aprovaRenderQuestionBrowse();
      },
      onYear: (y) => {
        aprovaQBrowseStatsYear = y;
        aprovaRenderQuestionBrowse();
      },
      onToggleChooser: () => {
        aprovaQBrowseExamChooserOpen = !aprovaQBrowseExamChooserOpen;
        aprovaRenderQuestionBrowse();
      }
    });

    const slice = aprovaResolveYearSlice(profile, aprovaQBrowseStatsYear);
    const sourceType = profile.sourceType || "estimativa";
    const typeLabel = sourceType === "levantamento"
      ? "Levantamento público (cursinho)"
      : (sourceType === "sintese" ? "Síntese de levantamentos públicos" : "Estimativa por padrão de banca");
    const yearTxt = aprovaYearLabel(aprovaQBrowseStatsYear);
    const shortLabel = aprovaQSpecialtyLabel(specialty);

    if (title) {
      title.textContent = profile.id === "geral"
        ? ("O que mais caiu em " + shortLabel + " · Geral Brasil · " + yearTxt)
        : ("O que mais caiu em " + shortLabel + " · " + aprovaExamLabel(profile) + " · " + yearTxt);
    }
    if (sub) {
      sub.textContent = typeLabel + " · ciclo " + yearTxt +
        (slice.sampleSize ? (" · " + slice.sampleSize + " questões analisadas") : "") +
        " — priorize os grupos com maior % no gráfico.";
    }
    if (verdict) verdict.textContent = slice.verdict || profile.foco || "";
    if (unitEl) {
      unitEl.hidden = false;
      unitEl.textContent = "Cada barra = % do tema na área. Os cards de grupo acima mostram o peso estimado para ajudar a escolher o foco.";
    }
    bars.innerHTML = (slice.priorities || []).map((p) => {
      const pct = Number(p.pct);
      const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
      const detail = p.n != null ? (" · " + p.n + " quest.") : "";
      return (
        "<div class=\"rev-bar-row\">" +
          "<span>" + p.tema + detail + "</span>" +
          "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
          "<em>" + aprovaFormatPct(pct) + "</em>" +
        "</div>"
      );
    }).join("") || "<p class=\"muted\">Sem recorte para esta prova/ano.</p>";

    if (sourceEl) {
      sourceEl.textContent = slice.source ? ("Fonte: " + slice.source) : "";
    }

    return slice;
  }).catch(() => {
    aprovaActiveSpecialty = prevSpec;
    aprovaActiveCliArea = prevCli;
    aprovaActiveGoArea = prevGo;
    root.hidden = false;
    bars.innerHTML = "<p class=\"muted\">Não foi possível carregar as estatísticas agora.</p>";
    return null;
  });
}

function aprovaQSpecialtyLabel (id) {
  if (typeof APROVA_SPECIALTY_LABELS !== "undefined" && APROVA_SPECIALTY_LABELS[id]) {
    return APROVA_SPECIALTY_LABELS[id];
  }
  const hit = typeof APROVA_QUESTION_SPECIALTIES !== "undefined"
    ? APROVA_QUESTION_SPECIALTIES.find(s => s.id === id)
    : null;
  return hit ? hit.label : id;
}

function aprovaReadQuestionFilters () {
  const examEl = document.getElementById("q-filter-exam");
  const yearEl = document.getElementById("q-filter-year");
  if (examEl) aprovaQBrowse.exam = examEl.value || "";
  if (yearEl) aprovaQBrowse.year = yearEl.value || "";
  return {
    specialty: aprovaQBrowse.specialty || "",
    group: aprovaQBrowse.group || "",
    theme: aprovaQBrowse.theme || "",
    exam: aprovaQBrowse.exam || "",
    year: aprovaQBrowse.year || ""
  };
}

function aprovaSyncQuestionBankFilters () {
  const examEl = document.getElementById("q-filter-exam");
  const yearEl = document.getElementById("q-filter-year");
  if (typeof AprovaQuestions === "undefined" || !AprovaQuestions.catalog) return;
  const exams = typeof AprovaQuestions.examOptions === "function"
    ? AprovaQuestions.examOptions()
    : [];
  const preferred = ["revalida", "santa-casa", "sus-sp", "enare", "enamed", "fmabc", "einstein", "usp-sp"];
  exams.sort((a, b) => {
    const ia = preferred.indexOf(a.id);
    const ib = preferred.indexOf(b.id);
    if (ia >= 0 || ib >= 0) {
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    }
    return String(a.label || a.id).localeCompare(String(b.label || b.id), "pt-BR");
  });
  aprovaFillQuestionFilterSelect(examEl, exams, "Todas as bancas", aprovaQBrowse.exam);
  const yearSet = new Set();
  AprovaQuestions.catalog.forEach((q) => {
    if (aprovaQBrowse.exam && q.exam !== aprovaQBrowse.exam) return;
    if (q.year != null) yearSet.add(q.year);
  });
  const years = Array.from(yearSet).sort((a, b) => b - a);
  aprovaFillQuestionFilterSelect(yearEl, years, "Todos os anos", aprovaQBrowse.year);
}

function aprovaFillQuestionFilterSelect (el, options, allLabel, selected) {
  if (!el) return;
  const prev = selected != null ? selected : el.value;
  el.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  el.appendChild(all);
  options.forEach(opt => {
    const o = document.createElement("option");
    if (typeof opt === "string" || typeof opt === "number") {
      o.value = String(opt);
      o.textContent = String(opt);
    } else {
      o.value = opt.id;
      o.textContent = opt.label;
    }
    el.appendChild(o);
  });
  if (prev && Array.from(el.options).some(o => o.value === prev)) {
    el.value = prev;
  } else {
    el.value = "";
  }
}

function aprovaCountQuestions (partial) {
  const base = aprovaReadQuestionFilters();
  return AprovaQuestions.filteredCatalog({
    specialty: (partial && partial.specialty != null) ? partial.specialty : base.specialty,
    group: (partial && partial.group != null) ? partial.group : "",
    theme: (partial && partial.theme != null) ? partial.theme : "",
    exam: (partial && partial.exam != null) ? partial.exam : base.exam,
    year: (partial && partial.year != null) ? partial.year : base.year
  }).length;
}

let aprovaQModalMode = "treino";
let aprovaQModalScope = "all";
/** Quando true, o modal mostra setup normal mesmo com save (após "Começar de novo"). */
let aprovaQModalForceSetup = false;
/** Pool completo do tema (metas → Praticar mais no banco). */
let aprovaQBankPoolOverride = null;

const APROVA_Q_UI_KEY = "medhub-aprova-q-ui-v1";
const APROVA_Q_FONT_STEPS = ["sm", "md", "lg"];
let aprovaQUi = { fontScale: "md", answerMode: "instant", highlighter: false };
let aprovaQPendingChoice = null;
let aprovaQUiBound = false;

function aprovaLoadQuestionUiPrefs () {
  try {
    const raw = JSON.parse(localStorage.getItem(APROVA_Q_UI_KEY) || "null");
    if (!raw || typeof raw !== "object") return;
    if (APROVA_Q_FONT_STEPS.includes(raw.fontScale)) aprovaQUi.fontScale = raw.fontScale;
    if (raw.answerMode === "instant" || raw.answerMode === "confirm") {
      aprovaQUi.answerMode = raw.answerMode;
    }
    aprovaQUi.highlighter = !!raw.highlighter;
  } catch (_) { /* ignore */ }
}

function aprovaSaveQuestionUiPrefs () {
  try {
    localStorage.setItem(APROVA_Q_UI_KEY, JSON.stringify({
      fontScale: aprovaQUi.fontScale,
      answerMode: aprovaQUi.answerMode,
      highlighter: !!aprovaQUi.highlighter
    }));
  } catch (_) { /* ignore */ }
}

function aprovaApplyQuestionUiPrefs () {
  const card = document.getElementById("q-card");
  const hlBtn = document.getElementById("q-hl-toggle");
  const confirmRow = document.getElementById("q-confirm-row");
  if (card) {
    card.setAttribute("data-q-font", aprovaQUi.fontScale);
    card.classList.toggle("q-hl-on", !!aprovaQUi.highlighter);
  }
  if (hlBtn) {
    hlBtn.classList.toggle("active", !!aprovaQUi.highlighter);
    hlBtn.setAttribute("aria-pressed", aprovaQUi.highlighter ? "true" : "false");
  }
  if (confirmRow) {
    confirmRow.hidden = aprovaQUi.answerMode !== "confirm" || AprovaQuestions.answered;
  }
}

function aprovaSetQuestionFont (step) {
  if (!APROVA_Q_FONT_STEPS.includes(step)) return;
  aprovaQUi.fontScale = step;
  aprovaSaveQuestionUiPrefs();
  aprovaApplyQuestionUiPrefs();
}

function aprovaNudgeQuestionFont (delta) {
  const i = APROVA_Q_FONT_STEPS.indexOf(aprovaQUi.fontScale);
  const next = Math.max(0, Math.min(APROVA_Q_FONT_STEPS.length - 1, (i < 0 ? 1 : i) + delta));
  aprovaSetQuestionFont(APROVA_Q_FONT_STEPS[next]);
}

function aprovaSetQuestionAnswerMode (mode) {
  if (mode !== "instant" && mode !== "confirm") return;
  aprovaQUi.answerMode = mode;
  aprovaSaveQuestionUiPrefs();
  aprovaApplyQuestionUiPrefs();
}

function aprovaToggleQuestionHighlighter () {
  aprovaQUi.highlighter = !aprovaQUi.highlighter;
  aprovaSaveQuestionUiPrefs();
  aprovaApplyQuestionUiPrefs();
}

function aprovaHighlightStemSelection () {
  if (!aprovaQUi.highlighter) return;
  const stem = document.getElementById("q-stem");
  if (!stem) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!stem.contains(range.commonAncestorContainer)) return;
  if (!String(range.toString() || "").trim()) return;
  try {
    const mark = document.createElement("mark");
    mark.className = "q-hl";
    range.surroundContents(mark);
  } catch (_) {
    const mark = document.createElement("mark");
    mark.className = "q-hl";
    mark.appendChild(range.extractContents());
    range.insertNode(mark);
  }
  sel.removeAllRanges();
}

function aprovaClearStemHighlight (mark) {
  if (!mark || !mark.parentNode) return;
  const parent = mark.parentNode;
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
  parent.removeChild(mark);
  parent.normalize();
}

function aprovaEnsureQuestionToolbar () {
  const card = document.getElementById("q-card");
  if (!card) return null;
  let toolbar = card.querySelector(".q-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "q-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "Ferramentas da quest\u00e3o");
    toolbar.innerHTML =
      '<div class="q-toolbar-group" role="group" aria-label="Tamanho do texto">' +
      '<button type="button" class="btn btn-ghost btn-compact q-tool" id="q-font-dec" title="Texto menor" aria-label="Texto menor">A-</button>' +
      '<button type="button" class="btn btn-ghost btn-compact q-tool" id="q-font-inc" title="Texto maior" aria-label="Texto maior">A+</button>' +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-compact q-tool" id="q-hl-toggle" title="Marca-texto: selecione trechos do enunciado" aria-pressed="false">Marca-texto</button>';
    const stem = document.getElementById("q-stem");
    if (stem && stem.parentNode === card) card.insertBefore(toolbar, stem);
    else {
      const meta = card.querySelector(".q-card-meta");
      if (meta && meta.nextSibling) card.insertBefore(toolbar, meta.nextSibling);
      else card.insertBefore(toolbar, card.firstChild);
    }
  }

  let confirmRow = document.getElementById("q-confirm-row");
  if (!confirmRow) {
    confirmRow = document.createElement("div");
    confirmRow.className = "actions-row";
    confirmRow.id = "q-confirm-row";
    confirmRow.hidden = true;
    confirmRow.innerHTML =
      '<button type="button" class="btn btn-primary" id="q-confirm" disabled>Confirmar resposta</button>';
    const choices = document.getElementById("q-choices");
    if (choices && choices.parentNode === card) {
      choices.insertAdjacentElement("afterend", confirmRow);
    } else {
      card.appendChild(confirmRow);
    }
  }

  let answerMode = document.getElementById("q-modal-answer-mode");
  if (!answerMode) {
    const setup = document.getElementById("q-modal-setup");
    if (setup) {
      const wrap = document.createElement("div");
      wrap.innerHTML =
        '<div class="label" style="margin:1rem 0 0.45rem">Como responder</div>' +
        '<div class="q-modal-chips" id="q-modal-answer-mode" role="group" aria-label="Modo de resposta">' +
        '<button type="button" class="q-modal-chip active" data-q-answer="instant">Clique direto</button>' +
        '<button type="button" class="q-modal-chip" data-q-answer="confirm">Selecionar e confirmar</button>' +
        "</div>" +
        '<p class="muted" style="margin:0.45rem 0 0;font-size:0.85rem">Clique direto revela na hora. Em confirmar, voc\u00ea marca a op\u00e7\u00e3o e depois confirma.</p>';
      const actions = setup.querySelector(".aprova-modal-actions");
      if (actions) setup.insertBefore(wrap, actions);
      else setup.appendChild(wrap);
    }
  }

  return toolbar;
}

function aprovaBindQuestionUiControls () {
  if (aprovaQUiBound) return;
  aprovaQUiBound = true;
  aprovaEnsureQuestionToolbar();

  document.addEventListener("click", (e) => {
    if (e.target.closest("#q-font-dec")) {
      aprovaNudgeQuestionFont(-1);
      return;
    }
    if (e.target.closest("#q-font-inc")) {
      aprovaNudgeQuestionFont(1);
      return;
    }
    if (e.target.closest("#q-hl-toggle")) {
      aprovaToggleQuestionHighlighter();
      return;
    }
    if (e.target.closest("#q-confirm")) {
      if (aprovaQPendingChoice == null) return;
      const chosen = aprovaQPendingChoice;
      aprovaQPendingChoice = null;
      const result = AprovaQuestions.choose(chosen);
      if (!result) return;
      aprovaRenderQuestion();
      return;
    }
    const answerBtn = e.target.closest("[data-q-answer]");
    if (answerBtn && answerBtn.closest("#q-modal-answer-mode")) {
      aprovaSetQuestionAnswerMode(answerBtn.getAttribute("data-q-answer") || "instant");
      aprovaSyncQuestionModalUI();
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (e.target.closest("#q-stem")) aprovaHighlightStemSelection();
  });
  document.addEventListener("touchend", (e) => {
    if (e.target.closest("#q-stem")) {
      window.setTimeout(() => aprovaHighlightStemSelection(), 0);
    }
  });
  document.addEventListener("click", (e) => {
    const mark = e.target.closest("#q-stem mark.q-hl");
    if (!mark) return;
    e.preventDefault();
    aprovaClearStemHighlight(mark);
  });
}

function aprovaQModalPool (filters, scope) {
  const base = Array.isArray(aprovaQBankPoolOverride) && aprovaQBankPoolOverride.length
    ? aprovaQBankPoolOverride.slice()
    : AprovaQuestions.filteredCatalog(filters || aprovaReadQuestionFilters());
  if (!scope || scope === "all" || typeof aprovaQuestionMatchesScope !== "function") {
    return base;
  }
  return base.filter((q) => aprovaQuestionMatchesScope(q.id, scope));
}

function aprovaSyncQuestionModalUI () {
  const modeWrap = document.getElementById("q-modal-mode");
  const scopeWrap = document.getElementById("q-modal-scope");
  const sizeWrap = document.getElementById("q-modal-size-wrap");
  const countEl = document.getElementById("q-start-modal-count");
  const titleEl = document.getElementById("q-start-modal-title");
  const resumeEl = document.getElementById("q-modal-resume");
  const setupEl = document.getElementById("q-modal-setup");
  const resumeDetail = document.getElementById("q-modal-resume-detail");

  modeWrap?.querySelectorAll("[data-q-mode]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-q-mode") === aprovaQModalMode);
  });
  scopeWrap?.querySelectorAll("[data-q-scope]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-q-scope") === aprovaQModalScope);
  });
  document.getElementById("q-modal-answer-mode")?.querySelectorAll("[data-q-answer]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-q-answer") === aprovaQUi.answerMode);
  });
  if (sizeWrap) sizeWrap.hidden = aprovaQModalMode !== "simulado";

  const filters = aprovaReadQuestionFilters();
  const pool = aprovaQModalPool(filters, aprovaQModalScope);
  const path = aprovaQBankPoolOverride && aprovaQBankPoolOverride.length
    ? ([
        aprovaQSpecialtyLabel(aprovaQBrowse.specialty),
        aprovaQBrowse.theme || aprovaQBrowse.group
      ].filter(Boolean).join(" · ") || "Banco do tema")
    : [
        aprovaQSpecialtyLabel(aprovaQBrowse.specialty),
        aprovaQBrowse.group,
        aprovaQBrowse.theme
      ].filter(Boolean).join(" · ");
  if (titleEl) {
    titleEl.textContent = path
      ? (aprovaQBankPoolOverride ? ("Banco · " + path) : path)
      : "Iniciar estudo";
  }

  const saved = !aprovaQModalForceSetup
    ? AprovaQuestions.getResumableTreino(filters, aprovaQModalScope)
    : null;
  const showResume = !!saved;

  if (resumeEl) resumeEl.hidden = !showResume;
  if (setupEl) setupEl.hidden = showResume;
  if (countEl) countEl.hidden = showResume;

  if (showResume && resumeDetail && saved) {
    const total = saved.queue.length;
    const pos = Math.min(total, (saved.index | 0) + 1);
    const answered = saved.attempted | 0;
    resumeDetail.textContent =
      "Questão " + pos + " de " + total +
      (answered ? (" · " + answered + " respondida" + (answered === 1 ? "" : "s")) : "") +
      ". Deseja continuar ou recomeçar do zero?";
  }

  if (!showResume) {
    const scopeLabel = aprovaQModalScope === "new"
      ? "novas"
      : (aprovaQModalScope === "wrong" ? "erradas" : "neste recorte");
    if (countEl) {
      if (!pool.length) {
        countEl.textContent = "Nenhuma questão " + scopeLabel + " com estes filtros.";
      } else if (aprovaQBankPoolOverride && aprovaQBankPoolOverride.length) {
        countEl.textContent = pool.length +
          (pool.length === 1 ? " questão" : " questões") +
          " no banco deste tema (" + scopeLabel + "). Escolha treino ou simulado.";
      } else {
        countEl.textContent = pool.length +
          (pool.length === 1 ? " questão" : " questões") + " " + scopeLabel;
      }
    }
  }
  return pool.length;
}

function aprovaPopulateLaunchFilters () {
  return aprovaSyncQuestionModalUI();
}

function aprovaCloseQuestionModal () {
  const modal = document.getElementById("q-start-modal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("modal-open");
  aprovaQModalForceSetup = false;
  aprovaQBankPoolOverride = null;
}

function aprovaShowQuestionLaunch () {
  const modal = document.getElementById("q-start-modal");
  if (!modal) return;
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  aprovaQModalMode = "treino";
  aprovaQModalScope = "all";
  aprovaQModalForceSetup = false;

  const filters = aprovaReadQuestionFilters();
  const saved = AprovaQuestions.loadSavedTreino();
  if (saved && saved.filters &&
      (saved.filters.specialty || "") === (filters.specialty || "") &&
      (saved.filters.group || "") === (filters.group || "") &&
      (saved.filters.theme || "") === (filters.theme || "") &&
      (saved.attempted > 0 || saved.index > 0)) {
    aprovaQModalScope = saved.scope || "all";
  }

  aprovaPopulateLaunchFilters();
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function aprovaStartFromQuestionModal () {
  const filters = aprovaReadQuestionFilters();
  AprovaQuestions.applyFilters(filters, { rebuild: true });
  const pool = aprovaQModalPool(filters, aprovaQModalScope);
  if (!pool.length) {
    aprovaSyncQuestionModalUI();
    return;
  }

  let n = 0;
  if (aprovaQModalMode === "simulado") {
    const size = Number(document.getElementById("q-filter-size")?.value) || 10;
    n = AprovaQuestions.startSimulado(size, pool);
  } else {
    n = AprovaQuestions.startTreino(pool, aprovaQModalScope);
  }
  if (!n) {
    aprovaSyncQuestionModalUI();
    return;
  }
  aprovaCloseQuestionModal();
  aprovaRenderQuestion();
}

function aprovaResumeSavedTreino () {
  const filters = aprovaReadQuestionFilters();
  const saved = AprovaQuestions.getResumableTreino(filters, aprovaQModalScope);
  if (!saved) {
    aprovaQModalForceSetup = true;
    aprovaSyncQuestionModalUI();
    return;
  }
  const n = AprovaQuestions.resumeTreino(saved);
  if (!n) {
    aprovaQModalForceSetup = true;
    aprovaSyncQuestionModalUI();
    return;
  }
  aprovaCloseQuestionModal();
  aprovaRenderQuestion();
}

function aprovaRestartTreinoFromModal () {
  AprovaQuestions.clearSavedTreino();
  aprovaQModalForceSetup = true;
  aprovaQModalMode = "treino";
  aprovaSyncQuestionModalUI();
}

function aprovaLeaveTreinoSession () {
  if (AprovaQuestions.hasTreinoProgress() &&
      !(AprovaQuestions.session && AprovaQuestions.session.scope === "review")) {
    AprovaQuestions.saveTreinoProgress();
  }
  aprovaReturnFromQuestionSession();
}

function aprovaShowQuestionViews (view) {
  const browse = document.getElementById("q-browse");
  const card = document.getElementById("q-card");
  const result = document.getElementById("q-result");
  if (browse) browse.hidden = view !== "browse";
  if (card) card.hidden = view !== "card";
  if (result) result.hidden = view !== "result";
}

function aprovaQBrowseBack () {
  if (aprovaQBrowse.level === "themes") {
    // Legado: subtemas foram removidos do fluxo.
    aprovaQBrowse.theme = "";
    aprovaQBrowse.level = "groups";
  } else if (aprovaQBrowse.level === "groups") {
    aprovaQBrowse.group = "";
    aprovaQBrowse.specialty = "";
    aprovaQBrowse.level = "areas";
  }
  aprovaRenderQuestionBrowse();
}

function aprovaRenderQuestionBrowse () {
  const grid = document.getElementById("q-browse-grid");
  const hint = document.getElementById("q-browse-hint");
  const back = document.getElementById("q-browse-back");
  const launch = document.getElementById("q-launch");
  if (!grid) return;

  aprovaShowQuestionViews("browse");
  aprovaSyncQuestionBankFilters();
  grid.innerHTML = "";
  if (launch) launch.hidden = true;
  if (back) back.hidden = aprovaQBrowse.level === "areas";

  const bankFilters = aprovaReadQuestionFilters();
  const examLabel = bankFilters.exam
    ? ((typeof AprovaQuestions.examOptions === "function"
      ? AprovaQuestions.examOptions()
      : []).find((e) => e.id === bankFilters.exam)?.label || bankFilters.exam)
    : "";
  const yearLabel = bankFilters.year ? String(bankFilters.year) : "";
  const bankScope = [examLabel, yearLabel].filter(Boolean).join(" · ");

  if (aprovaQBrowse.level === "areas") {
    aprovaQHideBrowseStats();
    if (hint) {
      hint.textContent = bankScope
        ? ("Banco · " + bankScope + " — escolha a área.")
        : "Escolha a banca (ex.: Revalida) e a área para estudar.";
    }
    const specs = AprovaQuestions.specialtyOptions();
    const order = typeof APROVA_SPECIALTY_LABELS !== "undefined"
      ? Object.keys(APROVA_SPECIALTY_LABELS)
      : specs.map(s => s.id);
    const ids = order.filter(id => specs.some(s => s.id === id));
    specs.forEach(s => {
      if (!ids.includes(s.id)) ids.push(s.id);
    });

    ids.forEach(id => {
      const n = aprovaCountQuestions({ specialty: id, group: "", theme: "" });
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dash-card" + (n ? "" : " dash-card--muted");
      btn.innerHTML =
        "<span class=\"dash-card-kicker\">Área</span>" +
        "<strong>" + aprovaQSpecialtyLabel(id) + "</strong>" +
        "<span>" + (n
          ? (n + (n === 1 ? " questão" : " questões"))
          : "Em breve") + "</span>";
      btn.disabled = !n;
      btn.addEventListener("click", () => {
        aprovaQBrowse.specialty = id;
        aprovaQBrowse.group = "";
        aprovaQBrowse.theme = "";
        aprovaQBrowse.level = "groups";
        aprovaQBrowseStatsFocus = aprovaPreferredExamFocus();
        aprovaQBrowseStatsYear = "geral";
        aprovaQBrowseExamChooserOpen = false;
        aprovaRenderQuestionBrowse();
      });
      grid.appendChild(btn);
    });
    return;
  }

  if (aprovaQBrowse.level === "groups") {
    if (hint) {
      hint.textContent = [
        aprovaQSpecialtyLabel(aprovaQBrowse.specialty),
        bankScope,
        "veja o que mais caiu e escolha o grupo para focar"
      ].filter(Boolean).join(" · ") + ".";
    }

    const groups = AprovaQuestions.groupOptions(aprovaQBrowse.specialty)
      .filter((group) => aprovaCountQuestions({
        specialty: aprovaQBrowse.specialty,
        group,
        theme: ""
      }) > 0);
    const allN = aprovaCountQuestions({
      specialty: aprovaQBrowse.specialty,
      group: "",
      theme: ""
    });

    const paintGroups = (slice) => {
      grid.innerHTML = "";
      const priorities = (slice && slice.priorities) || [];
      const ranked = groups.map((group) => {
        const match = aprovaQMatchStatPct(group, priorities);
        return {
          group,
          n: aprovaCountQuestions({
            specialty: aprovaQBrowse.specialty,
            group,
            theme: ""
          }),
          pct: match ? match.pct : 0,
          match
        };
      }).sort((a, b) => (b.pct - a.pct) || a.group.localeCompare(b.group, "pt-BR"));

      aprovaQBrowseGroupWeights = Object.create(null);
      ranked.forEach((row) => {
        if (row.pct > 0) aprovaQBrowseGroupWeights[row.group] = row.pct;
      });

      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "dash-card dash-card--featured";
      allBtn.innerHTML =
        "<span class=\"dash-card-kicker\">Atalho</span>" +
        "<strong>Todos os grupos</strong>" +
        "<span>" + allN + (allN === 1 ? " questão" : " questões") + " da área</span>";
      allBtn.addEventListener("click", () => {
        aprovaQBrowse.group = "";
        aprovaQBrowse.theme = "";
        aprovaShowQuestionLaunch();
      });
      grid.appendChild(allBtn);

      ranked.forEach((row, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dash-card" + (idx < 3 && row.pct > 0 ? " dash-card--focus" : "");
        const focusLine = row.match
          ? (" · cai ~" + aprovaFormatPct(row.pct) + " nas provas")
          : "";
        const kicker = idx < 3 && row.pct > 0 ? "Prioridade" : "Grupo";
        btn.innerHTML =
          "<span class=\"dash-card-kicker\">" + kicker + "</span>" +
          "<strong>" + row.group + "</strong>" +
          "<span>" + row.n + (row.n === 1 ? " questão" : " questões") + focusLine + "</span>";
        btn.addEventListener("click", () => {
          aprovaQBrowse.group = row.group;
          aprovaQBrowse.theme = "";
          aprovaShowQuestionLaunch();
        });
        grid.appendChild(btn);
      });
    };

    paintGroups(null);
    aprovaRenderQuestionBrowseStats(aprovaQBrowse.specialty).then((slice) => {
      if (aprovaQBrowse.level !== "groups") return;
      paintGroups(slice);
    });
    return;
  }

  // Nível "themes" descontinuado: abre direto o lançamento do grupo/área.
  aprovaQBrowse.level = "groups";
  aprovaQBrowse.theme = "";
  aprovaRenderQuestionBrowse();
  aprovaShowQuestionLaunch();
}

function aprovaRenderQuestoesPanel () {
  if (AprovaQuestions.isSimuladoFinished()) {
    aprovaRenderSimuladoResult();
    return;
  }
  if (AprovaQuestions.current() && (AprovaQuestions.answered || AprovaQuestions.attempted > 0)) {
    aprovaShowQuestionViews("card");
    aprovaRenderQuestion();
    return;
  }
  if (!aprovaQBrowse.level) aprovaQBrowse.level = "areas";
  aprovaRenderQuestionBrowse();
}

function aprovaRenderSimuladoResult () {
  const score = document.getElementById("q-result-score");
  const timeEl = document.getElementById("q-result-time");
  const themesEl = document.getElementById("q-result-themes");
  const r = AprovaQuestions.simuladoResult();
  aprovaShowQuestionViews("result");
  if (!r) return;
  if (score) {
    score.textContent = r.hits + "/" + r.total + " acertos (" + r.pct + "%)" +
      (r.annulled ? (" · " + r.annulled + " anulada(s) fora do cálculo") : "");
  }
  if (timeEl) timeEl.textContent = "Tempo aproximado: " + r.minutes + " min";
  if (themesEl) {
    themesEl.innerHTML = r.themes.length
      ? r.themes.map(t => (
        "<li><span>" + t.theme + "</span><em>" + t.ok + "/" + t.n + " · " + t.pct + "%</em></li>"
      )).join("")
      : "<li><span>Sem detalhe por tema</span></li>";
  }
}

function aprovaSyncQuestionNav () {
  const nextBtn = document.getElementById("q-next");
  const prevBtn = document.getElementById("q-prev");
  if (prevBtn) {
    const showPrev = AprovaQuestions.canGoPrev();
    prevBtn.hidden = !showPrev;
    prevBtn.disabled = !showPrev;
    prevBtn.setAttribute("aria-hidden", showPrev ? "false" : "true");
  }
  if (nextBtn) {
    const showNext = AprovaQuestions.canGoNext();
    nextBtn.hidden = !showNext;
    nextBtn.disabled = !showNext;
    nextBtn.textContent = AprovaQuestions.nextLabel();
    nextBtn.setAttribute("aria-hidden", showNext ? "false" : "true");
  }
}

function aprovaRenderQuestion () {
  const q = AprovaQuestions.current();
  const theme = document.getElementById("q-theme");
  const stem = document.getElementById("q-stem");
  const choices = document.getElementById("q-choices");
  const feedback = document.getElementById("q-feedback");
  const verdictEl = document.getElementById("q-feedback-verdict");
  const explain = document.getElementById("q-explain");
  const trapWrap = document.getElementById("q-trap-wrap");
  const trapEl = document.getElementById("q-trap");
  const abortBtn = document.getElementById("q-abort");
  const backMetasBtn = document.getElementById("q-back-metas");
  const stats = document.getElementById("q-stats");
  const progress = document.getElementById("q-progress");
  const confirmRow = document.getElementById("q-confirm-row");
  const confirmBtn = document.getElementById("q-confirm");

  if (!stem || !choices) return;

  if (AprovaQuestions.isSimuladoFinished()) {
    aprovaRenderSimuladoResult();
    return;
  }

  if (!q) {
    aprovaRenderQuestionBrowse();
    return;
  }

  aprovaShowQuestionViews("card");
  aprovaEnsureQuestionToolbar();
  aprovaApplyQuestionUiPrefs();
  aprovaQPendingChoice = null;

  const letters = ["A", "B", "C", "D", "E"];
  const meta = [];
  if (q.group && q.group !== q.theme) meta.push(q.group);
  meta.push(q.theme);
  if (q.exam) {
    const examHit = typeof APROVA_TARGET_EXAMS !== "undefined"
      ? APROVA_TARGET_EXAMS.find(e => e.id === q.exam)
      : null;
    meta.push(examHit ? examHit.label : q.exam);
  }
  if (q.year) meta.push(String(q.year));

  if (theme) theme.textContent = meta.join(" · ");
  if (progress) progress.textContent = AprovaQuestions.progressText();
  stem.textContent = q.stem;
  if (feedback) feedback.hidden = true;
  if (verdictEl) {
    verdictEl.textContent = "";
    verdictEl.className = "q-feedback-verdict";
  }
  if (explain) explain.textContent = "";
  if (trapWrap) trapWrap.hidden = true;
  if (trapEl) trapEl.textContent = "";
  if (abortBtn) abortBtn.hidden = false;
  if (backMetasBtn) backMetasBtn.hidden = false;
  if (confirmBtn) confirmBtn.disabled = true;
  aprovaSyncQuestionNav();
  choices.innerHTML = "";

  function aprovaShowQuestionFeedback (result, chosenIndex) {
    if (!result) return;
    if (confirmRow) confirmRow.hidden = true;
    if (confirmBtn) confirmBtn.disabled = true;
    choices.querySelectorAll(".choice").forEach((el, idx) => {
      el.disabled = true;
      el.classList.remove("selected");
      if (idx === result.answer) el.classList.add("correct");
      if (chosenIndex != null && idx === chosenIndex && !result.ok) el.classList.add("wrong");
    });
    if (feedback) feedback.hidden = false;
    if (verdictEl) {
      const review = AprovaQuestions.session && AprovaQuestions.session.scope === "review";
      verdictEl.textContent = review
        ? (result.ok
          ? "Revisão — você tinha acertado. Releia o raciocínio."
          : "Revisão — você tinha errado. Veja a correta e a pegadinha.")
        : (result.ok
          ? "Acertou — veja o raciocínio e a pegadinha."
          : "Errou — veja por que a correta é outra e onde está a pegadinha.");
      verdictEl.className = "q-feedback-verdict " +
        (result.ok ? "q-feedback-verdict--ok" : "q-feedback-verdict--err");
    }
    if (explain) {
      explain.textContent = result.explain ||
        (result.ok ? "Correto." : "Revise o comentário desta questão.");
    }
    if (trapWrap && trapEl) {
      if (result.trap) {
        trapEl.textContent = result.trap;
        trapWrap.hidden = false;
      } else {
        trapWrap.hidden = true;
      }
    }
    aprovaSyncQuestionNav();
    if (stats) stats.textContent = AprovaQuestions.statsText();
    if (progress) progress.textContent = AprovaQuestions.progressText();
    aprovaRenderExamStats();
  }

  const prior = AprovaQuestions.priorAnswer();
  if (prior) AprovaQuestions.answered = true;

  const confirmMode = aprovaQUi.answerMode === "confirm";
  if (confirmRow) confirmRow.hidden = !confirmMode || !!prior;

  q.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.textContent = (letters[i] || String(i + 1)) + ") " + text;
    if (prior) {
      btn.disabled = true;
      if (i === prior.correct) btn.classList.add("correct");
      if (i === prior.choice && !prior.ok) btn.classList.add("wrong");
    } else if (confirmMode) {
      btn.addEventListener("click", () => {
        aprovaQPendingChoice = i;
        choices.querySelectorAll(".choice").forEach((el, idx) => {
          el.classList.toggle("selected", idx === i);
        });
        if (confirmBtn) confirmBtn.disabled = false;
      });
    } else {
      btn.addEventListener("click", () => {
        const result = AprovaQuestions.choose(i);
        if (!result) return;
        aprovaShowQuestionFeedback(result, i);
      });
    }
    choices.appendChild(btn);
  });

  if (prior) {
    aprovaShowQuestionFeedback({
      ok: prior.ok,
      explain: q.explain,
      trap: q.trap || "",
      answer: prior.correct
    }, prior.choice);
  }

  if (stats) stats.textContent = AprovaQuestions.statsText();
}

function aprovaSyncAppAuthUI () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const gate = document.getElementById("login-gate");
  const shell = document.getElementById("app-shell");
  const sideUser = document.getElementById("sidebar-user-label");

  if (!gate || !shell) return Boolean(session);

  if (session && session.login) {
    gate.hidden = true;
    shell.hidden = false;
    if (sideUser) sideUser.textContent = session.name || session.login;
    aprovaRenderDashboard();
    return true;
  }

  gate.hidden = false;
  shell.hidden = true;
  return false;
}

async function aprovaBoot () {
  aprovaLoadQuestionUiPrefs();
  aprovaBindQuestionUiControls();
  aprovaApplyQuestionUiPrefs();

  const logged = aprovaSyncAppAuthUI();

  if (logged) {
    await Promise.all([AprovaFlashcards.load(), AprovaQuestions.load()]);
    aprovaRenderDashboard();
    aprovaRenderToday();
    aprovaShowFlashcardBrowse();
    aprovaRenderQuestoesPanel();
    aprovaRenderProgress();
    aprovaRenderExamStats();
    aprovaRenderEspecialidades();
    aprovaRenderPerfil();
    aprovaRenderConfig();
  }

  document.querySelectorAll(".side-link[data-panel]").forEach(link => {
    link.addEventListener("click", () => aprovaGoTo(link.dataset.panel));
  });

  document.querySelectorAll("[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => aprovaGoTo(btn.dataset.goto));
  });

  document.getElementById("metas-q-start-day")?.addEventListener("click", () => {
    aprovaFulfillMetaQuestionsDay();
  });
  document.getElementById("hoje-metas-start-day")?.addEventListener("click", () => {
    aprovaFulfillMetaQuestionsDay();
  });

  document.querySelectorAll("[data-perfil-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      aprovaPerfilCommitActiveSlot();
      aprovaPerfilActiveTab = Number(btn.dataset.perfilTab) || 0;
      aprovaRenderPerfilSlot();
    });
  });

  document.getElementById("perfil-slot-select")?.addEventListener("change", () => {
    const other = document.getElementById("perfil-slot-other");
    const select = document.getElementById("perfil-slot-select");
    if (other && select) {
      const isOther = select.value === "__other__";
      other.hidden = !isOther;
      if (!isOther) other.value = "";
      if (isOther) other.focus();
    }
    aprovaPerfilCommitActiveSlot();
    aprovaPerfilUpdateSummary();
  });

  document.getElementById("perfil-goto-metas")?.addEventListener("click", () => {
    aprovaPerfilCommitActiveSlot();
    const draft = aprovaPerfilDraft.slice();
    const hasExam = draft.some(s => s && (s.kind === "exam" || (s.kind === "other" && String(s.label || "").trim())));
    const savedComplete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete();
    const msg = document.getElementById("perfil-save-msg");
    const showErr = text => {
      if (!msg) return;
      msg.hidden = false;
      msg.textContent = text;
      msg.classList.remove("profile-msg--ok");
      msg.classList.add("profile-msg--err");
    };

    // Limpar o select sem salvar ainda: não ir para metas com o perfil antigo
    if (!draft[0] && savedComplete) {
      showErr("Salve o perfil em branco para limpar a personalização, ou escolha a 1ª prioridade.");
      aprovaPerfilActiveTab = 0;
      aprovaRenderPerfilSlot();
      return;
    }
    if (!hasExam && !savedComplete) {
      showErr("Escolha e salve a 1ª prioridade antes de ver as metas.");
      aprovaPerfilActiveTab = 0;
      aprovaRenderPerfilSlot();
      return;
    }
    if (hasExam && !savedComplete) {
      showErr("Salve o perfil primeiro para atualizar as metas.");
      return;
    }
    aprovaGoTo("metas");
  });

  document.getElementById("perfil-slot-other")?.addEventListener("input", () => {
    aprovaPerfilCommitActiveSlot();
    aprovaPerfilUpdateSummary();
  });

  document.getElementById("perfil-slot-date")?.addEventListener("change", () => {
    aprovaPerfilCommitActiveSlot();
    aprovaPerfilUpdateSummary();
  });

  document.getElementById("perfil-slot-accuracy")?.addEventListener("change", () => {
    aprovaPerfilCommitActiveSlot();
    aprovaPerfilUpdateSummary();
  });

  document.getElementById("perfil-slot-accuracy")?.addEventListener("input", () => {
    aprovaPerfilCommitActiveSlot();
    aprovaPerfilUpdateSummary();
  });

  document.getElementById("perfil-date-unknown")?.addEventListener("click", () => {
    const dateEl = document.getElementById("perfil-slot-date");
    if (dateEl) dateEl.value = "";
    aprovaPerfilCommitActiveSlot();
    aprovaPerfilUpdateSummary();
    const msg = document.getElementById("perfil-save-msg");
    if (msg) {
      const end = typeof aprovaYearEndExamIso === "function" ? aprovaYearEndExamIso() : "";
      const label = end && typeof aprovaFormatDateBr === "function" ? aprovaFormatDateBr(end) : "31/12";
      msg.hidden = false;
      msg.textContent = "Ok — sem data. Ao salvar, o plano usa " + label + " (fim do ano).";
      msg.classList.remove("profile-msg--err");
      msg.classList.add("profile-msg--ok");
    }
  });

  document.getElementById("perfil-save")?.addEventListener("click", () => {
    aprovaSavePerfilFromForm();
  });

  document.querySelectorAll("[data-specialty]").forEach(btn => {
    btn.addEventListener("click", () => {
      const area = btn.dataset.cliArea;
      if (btn.dataset.specialty === "clinica" && area) {
        aprovaOpenCliArea(area).catch(err => console.error("Falha ao abrir área", area, err));
        return;
      }
      aprovaOpenSpecialty(btn.dataset.specialty);
    });
  });

  document.getElementById("esp-back")?.addEventListener("click", () => {
    if (aprovaActiveSpecialty === "go" && aprovaActivePedModule) {
      aprovaOpenGoArea(aprovaActiveGoArea || AprovaRevisao.moduleArea(aprovaActivePedModule));
      return;
    }
    if (aprovaActiveSpecialty === "go" && aprovaActiveGoArea) {
      aprovaOpenGinecologia();
      return;
    }
    if (aprovaActiveSpecialty === "clinica" && aprovaActivePedModule) {
      aprovaOpenCliArea(aprovaActiveCliArea || AprovaRevisao.moduleArea(aprovaActivePedModule));
      return;
    }
    if (aprovaActiveSpecialty === "clinica" && aprovaActiveCliArea) {
      aprovaOpenClinica();
      return;
    }
    if (aprovaIsRichSpecialty(aprovaActiveSpecialty) && aprovaActivePedModule) {
      aprovaRichSpecialtyMeta(aprovaActiveSpecialty).openRoot();
      return;
    }
    aprovaBackToEspHub();
  });

  document.getElementById("esp-rev-back")?.addEventListener("click", () => {
    if (aprovaActiveSpecialty === "go") {
      if (aprovaActivePedModule) {
        aprovaOpenGoArea(aprovaActiveGoArea || AprovaRevisao.moduleArea(aprovaActivePedModule));
        return;
      }
      if (aprovaActiveGoArea) {
        aprovaOpenGinecologia();
        return;
      }
      aprovaOpenGinecologia();
      return;
    }
    if (aprovaActiveSpecialty === "clinica") {
      if (aprovaActivePedModule) {
        aprovaOpenCliArea(aprovaActiveCliArea || AprovaRevisao.moduleArea(aprovaActivePedModule));
        return;
      }
      if (aprovaActiveCliArea) {
        aprovaOpenClinica();
        return;
      }
      aprovaBackToEspHub();
      return;
    }
    if (aprovaIsRichSpecialty(aprovaActiveSpecialty)) {
      const meta = aprovaRichSpecialtyMeta(aprovaActiveSpecialty);
      if (aprovaActivePedModule) {
        meta.openModule(aprovaActivePedModule);
        return;
      }
      meta.openRoot();
      return;
    }
    if (aprovaActivePedModule) {
      aprovaOpenPediatriaModule(aprovaActivePedModule);
      return;
    }
    aprovaOpenPediatria();
  });

  document.getElementById("esp-open-revisao")?.addEventListener("click", () => {
    aprovaOpenSpecialtyReview(aprovaActiveFocusId || "geral");
  });

  document.querySelectorAll("[data-esp-modal-close]").forEach(el => {
    el.addEventListener("click", () => aprovaClosePedDeckModal());
  });

  document.getElementById("esp-groups-select-all")?.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    aprovaOpenPedDeckPicker(null, { selectAll: true }).catch(err => {
      console.error("Falha ao abrir todos os subtemas", err);
    });
  });

  document.getElementById("esp-deck-modal-all")?.addEventListener("change", e => {
    const checked = !!e.target.checked;
    document.querySelectorAll("#esp-deck-modal-list input[type=checkbox]").forEach(box => {
      box.checked = checked;
    });
    aprovaUpdatePedModalCount();
  });

  document.getElementById("esp-deck-modal-start")?.addEventListener("click", () => {
    const ids = aprovaPedModalSelectedIds();
    if (!ids.length) return;
    AprovaFlashcards.startDecks(ids);
    aprovaClosePedDeckModal();
    aprovaGoTo("flashcards", { study: true });
  });

  document.getElementById("esp-deck-modal-stats")?.addEventListener("click", () => {
    const moduleId = aprovaActivePedModule;
    aprovaClosePedDeckModal();
    if (!moduleId) return;
    if (aprovaIsRichSpecialty(aprovaActiveSpecialty)) {
      aprovaRichSpecialtyMeta(aprovaActiveSpecialty).openModule(moduleId);
      return;
    }
    aprovaOpenPediatriaModule(moduleId);
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const qModal = document.getElementById("q-start-modal");
    if (qModal && !qModal.hidden) {
      aprovaCloseQuestionModal();
      return;
    }
    const modal = document.getElementById("esp-deck-modal");
    if (modal && !modal.hidden) aprovaClosePedDeckModal();
  });

  document.getElementById("today-start")?.addEventListener("click", () => {
    if (typeof aprovaClearActivityCreditDay === "function") {
      aprovaClearActivityCreditDay();
    }
    aprovaGoTo("flashcards", { study: true, mode: "today" });
  });

  document.getElementById("fc-back-browse")?.addEventListener("click", () => {
    if (typeof aprovaClearActivityCreditDay === "function") {
      aprovaClearActivityCreditDay();
    }
    aprovaShowFlashcardBrowse();
  });

  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });

  document.getElementById("fc-reveal")?.addEventListener("click", () => {
    AprovaFlashcards.reveal();
    aprovaRenderFlashcard();
  });

  document.getElementById("fc-easy")?.addEventListener("click", () => {
    AprovaFlashcards.rate(true);
    aprovaRenderFlashcard();
    aprovaRenderToday();
    aprovaRenderProgress();
    if (aprovaSeuFocoCache) aprovaRefreshSeuPlanoForArea(aprovaSeuFocoCache, aprovaSeuFocoAreaId);
  });

  document.getElementById("fc-hard")?.addEventListener("click", () => {
    AprovaFlashcards.rate(false);
    aprovaRenderFlashcard();
    aprovaRenderToday();
    aprovaRenderProgress();
    if (aprovaSeuFocoCache) aprovaRefreshSeuPlanoForArea(aprovaSeuFocoCache, aprovaSeuFocoAreaId);
  });

  document.getElementById("q-next")?.addEventListener("click", () => {
    const next = AprovaQuestions.next();
    if (!next && AprovaQuestions.isSimuladoFinished()) {
      aprovaRenderSimuladoResult();
      return;
    }
    if (!next && AprovaQuestions.mode === "treino") {
      aprovaReturnFromQuestionSession();
      return;
    }
    aprovaRenderQuestion();
  });

  document.getElementById("q-prev")?.addEventListener("click", () => {
    if (!AprovaQuestions.prev()) return;
    aprovaRenderQuestion();
  });

  document.getElementById("q-browse-back")?.addEventListener("click", () => {
    aprovaQBrowseBack();
  });

  document.getElementById("q-abort")?.addEventListener("click", () => {
    aprovaLeaveTreinoSession();
  });

  document.getElementById("q-back-metas")?.addEventListener("click", () => {
    aprovaQFromMetas = true;
    aprovaLeaveTreinoSession();
  });

  ["q-filter-exam", "q-filter-year"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      const examEl = document.getElementById("q-filter-exam");
      const yearEl = document.getElementById("q-filter-year");
      aprovaQBrowse.exam = examEl ? (examEl.value || "") : "";
      aprovaQBrowse.year = yearEl ? (yearEl.value || "") : "";
      if (aprovaQBrowse.specialty) {
        const n = aprovaCountQuestions({
          specialty: aprovaQBrowse.specialty,
          group: "",
          theme: ""
        });
        if (!n) {
          aprovaQBrowse.specialty = "";
          aprovaQBrowse.group = "";
          aprovaQBrowse.theme = "";
          aprovaQBrowse.level = "areas";
        } else if (aprovaQBrowse.group) {
          const gn = aprovaCountQuestions({
            specialty: aprovaQBrowse.specialty,
            group: aprovaQBrowse.group,
            theme: ""
          });
          if (!gn) {
            aprovaQBrowse.group = "";
            aprovaQBrowse.theme = "";
          }
        }
      }
      aprovaRenderQuestionBrowse();
      if (!document.getElementById("q-start-modal")?.hidden) {
        aprovaSyncQuestionModalUI();
      }
    });
  });

  ["q-filter-size"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", () => aprovaSyncQuestionModalUI());
  });

  document.querySelectorAll("[data-q-modal-close]").forEach((el) => {
    el.addEventListener("click", () => aprovaCloseQuestionModal());
  });

  document.getElementById("q-modal-mode")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q-mode]");
    if (!btn) return;
    aprovaQModalMode = btn.getAttribute("data-q-mode") || "treino";
    aprovaSyncQuestionModalUI();
  });

  document.getElementById("q-modal-scope")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q-scope]");
    if (!btn) return;
    aprovaQModalScope = btn.getAttribute("data-q-scope") || "all";
    aprovaSyncQuestionModalUI();
  });

  document.getElementById("q-start-go")?.addEventListener("click", () => {
    aprovaStartFromQuestionModal();
  });

  document.getElementById("q-resume-continue")?.addEventListener("click", () => {
    aprovaResumeSavedTreino();
  });

  document.getElementById("q-resume-restart")?.addEventListener("click", () => {
    aprovaRestartTreinoFromModal();
  });

  document.getElementById("q-result-again")?.addEventListener("click", () => {
    aprovaQModalMode = "simulado";
    aprovaShowQuestionLaunch();
  });

  document.getElementById("q-result-treino")?.addEventListener("click", () => {
    AprovaQuestions.resetSession("treino");
    aprovaQBrowse.level = "areas";
    aprovaQBrowse.specialty = "";
    aprovaQBrowse.group = "";
    aprovaQBrowse.theme = "";
    aprovaRenderQuestionBrowse();
  });

  document.getElementById("config-logout")?.addEventListener("click", () => {
    document.getElementById("auth-logout")?.click();
  });
}

document.addEventListener("DOMContentLoaded", aprovaBoot);

window.aprovaSyncAppAuthUI = aprovaSyncAppAuthUI;
window.aprovaGoTo = aprovaGoTo;
window.aprovaBootStudyModules = async function () {
  await Promise.all([AprovaFlashcards.load(), AprovaQuestions.load()]);
  aprovaRenderDashboard();
  aprovaRenderToday();
  aprovaShowFlashcardBrowse();
  aprovaRenderQuestoesPanel();
  aprovaRenderProgress();
  aprovaRenderExamStats();
  aprovaRenderEspecialidades();
  aprovaRenderPerfil();
  aprovaRenderConfig();
};
