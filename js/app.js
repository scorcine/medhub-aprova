/* Shell do app — sidebar, dashboard e módulos de estudo */

const APROVA_PANEL_META = {
  inicio: { title: "Início", sub: "Escolha o que estudar agora" },
  hoje: { title: "Revisão de hoje", sub: "Fila SRS · novos e vencidos" },
  flashcards: { title: "Flashcards", sub: "Memória ativa para o R1" },
  questoes: { title: "Banco de questões", sub: "Treino no formato da prova" },
  especialidades: { title: "Especialidades", sub: "Foque por área clínica" },
  simulados: { title: "Simulados", sub: "Blocos no estilo R1" },
  estatisticas: { title: "Estatísticas de provas", sub: "Acertos, erros e temas" },
  progresso: { title: "Meu progresso", sub: "Acompanhe sua rotina" },
  config: { title: "Configurações", sub: "Conta e preferências" }
};

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

function aprovaGoTo (id, options) {
  const opts = options || {};

  if (id === "flashcards") {
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
  if (id === "estatisticas") aprovaRenderExamStats();
  if (id === "config") aprovaRenderConfig();
  if (id === "inicio") aprovaRenderDashboard();
  if (id === "especialidades") aprovaRenderEspecialidades();
  aprovaShowPanel(id);
}

function aprovaShowFlashcardBrowse () {
  const browse = document.getElementById("fc-browse");
  const card = document.getElementById("fc-card");
  const hint = document.getElementById("fc-hint");
  if (browse) browse.hidden = false;
  if (card) card.hidden = true;
  if (hint) hint.textContent = "Escolha um tema para estudar.";
  aprovaRenderFlashcardBrowse();
}

function aprovaShowFlashcardStudy () {
  const browse = document.getElementById("fc-browse");
  const card = document.getElementById("fc-card");
  const hint = document.getElementById("fc-hint");
  if (browse) browse.hidden = true;
  if (card) card.hidden = false;
  if (hint) {
    const multi = AprovaFlashcards.activeDeckIds && AprovaFlashcards.activeDeckIds.length > 1;
    hint.textContent = AprovaFlashcards.mode === "deck"
      ? (multi
        ? "Estudo de vários subtemas · revelar · acertei / errei."
        : "Estudo por tema · revelar · acertei / errei.")
      : "Fila de hoje · revelar · acertei / errei.";
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
const aprovaOverviewStatsCache = Object.create(null);

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
  einstein: 19
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
        ? "data/stats-obstetricia-geral.json?v=20260718dd"
        : "data/stats-ginecologia-geral.json?v=20260718dd",
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
      overviewUrl: "data/stats-cirurgia-geral.json?v=20260718dd",
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
      overviewUrl: "data/stats-preventiva-geral.json?v=20260718dd",
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
        overviewUrl: "data/stats-clinica-geral.json?v=20260718dd",
        countNoun: "Clínica médica",
        openRoot: () => aprovaOpenClinica(),
        openModule: id => aprovaOpenClinicaModule(id)
      };
    }
    const cliMeta = {
      reumatologia: {
        shortLabel: "Reumatologia",
        overviewCacheKey: "reumatologia",
        overviewUrl: "data/stats-reumatologia-geral.json?v=20260718dd",
        countNoun: "Reumatologia"
      },
      psiquiatria: {
        shortLabel: "Psiquiatria",
        overviewCacheKey: "psiquiatria",
        overviewUrl: "data/stats-psiquiatria-geral.json?v=20260718dd",
        countNoun: "Psiquiatria"
      },
      pneumologia: {
        shortLabel: "Pneumologia",
        overviewCacheKey: "pneumologia",
        overviewUrl: "data/stats-pneumologia-geral.json?v=20260718dd",
        countNoun: "Pneumologia"
      },
      neurologia: {
        shortLabel: "Neurologia",
        overviewCacheKey: "neurologia",
        overviewUrl: "data/stats-neurologia-geral.json?v=20260718dd",
        countNoun: "Neurologia"
      },
      nefrologia: {
        shortLabel: "Nefrologia",
        overviewCacheKey: "nefrologia",
        overviewUrl: "data/stats-nefrologia-geral.json?v=20260718dd",
        countNoun: "Nefrologia"
      },
      infectologia: {
        shortLabel: "Infectologia",
        overviewCacheKey: "infectologia",
        overviewUrl: "data/stats-infectologia-geral.json?v=20260718dd",
        countNoun: "Infectologia"
      },
      hepatologia: {
        shortLabel: "Hepatologia",
        overviewCacheKey: "hepatologia",
        overviewUrl: "data/stats-hepatologia-geral.json?v=20260718dd",
        countNoun: "Hepatologia"
      },
      hematologia: {
        shortLabel: "Hematologia",
        overviewCacheKey: "hematologia",
        overviewUrl: "data/stats-hematologia-geral.json?v=20260718dd",
        countNoun: "Hematologia"
      },
      endocrinologia: {
        shortLabel: "Endocrinologia",
        overviewCacheKey: "endocrinologia",
        overviewUrl: "data/stats-endocrinologia-geral.json?v=20260718dd",
        countNoun: "Endocrinologia"
      },
      cardiologia: {
        shortLabel: "Cardiologia",
        overviewCacheKey: "cardiologia",
        overviewUrl: "data/stats-cardiologia-geral.json?v=20260718dd",
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
    overviewUrl: "data/stats-pediatria-geral.json?v=20260718dd",
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
  if (list) list.hidden = false;
  if (hint) hint.textContent = "Escolha uma área para focar o estudo.";
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
  const cliN = AprovaFlashcards.countBySpecialty("clinica");
  const cirN = AprovaFlashcards.countBySpecialty("cirurgia");
  const pedN = AprovaFlashcards.countBySpecialty("pediatria");
  const goN = AprovaFlashcards.countBySpecialty("go");
  const prevN = AprovaFlashcards.countBySpecialty("preventiva");
  if (cli) {
    cli.textContent = cliN
      ? cliN + " flashcards · Cardio, infecto, endo e demais áreas"
      : "Cardio, infecto, endo e demais áreas.";
  }
  if (cir) {
    cir.textContent = cirN
      ? cirN + " flashcards · trauma, abdome e pós-op"
      : "Trauma, abdome agudo e pós-operatório.";
  }
  if (ped) {
    ped.textContent = pedN
      ? pedN + " flashcards · Pediatria R1 completa"
      : "Ped1–Ped6 + blocos clássicos do R1.";
  }
  if (go) {
    go.textContent = goN
      ? goN + " flashcards · Ginecologia (+ Obstetrícia em breve)"
      : "Ginecologia e Obstetrícia.";
  }
  if (prev) {
    prev.textContent = prevN
      ? prevN + " flashcards · Prev1–4 · 4 grupos"
      : "Epidemiologia, vacinas e SUS.";
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
      ? "Levantamento de provas"
      : (sourceType === "sintese" ? "Síntese de levantamentos" : "Estimativa por padrão de banca");
    const yearTxt = aprovaYearLabel(aprovaActiveOverviewYear);
    const countLabel = sourceType === "estimativa"
      ? (" questões de " + meta.countNoun + " (base ilustrativa)")
      : (" questões de " + meta.countNoun + " analisadas");

    if (title) {
      title.textContent = profile.id === "geral"
        ? ("O que mais cai em " + meta.shortLabel + " · Geral Brasil · " + yearTxt)
        : ("O que mais cai em " + meta.shortLabel + " · " + aprovaExamLabel(profile) + " · " + yearTxt);
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
    const detail = stats.groups
      ? (stats.cards + " card" + (stats.cards === 1 ? "" : "s") +
        " · " + stats.groups + " grupo" + (stats.groups === 1 ? "" : "s"))
      : "Em breve";
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
    const detail = stats.groups
      ? (stats.cards + " card" + (stats.cards === 1 ? "" : "s") +
        " · " + stats.groups + " grupo" + (stats.groups === 1 ? "" : "s"))
      : "Em breve";
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

  for (const m of modules) {
    const stats = await aprovaPedModuleStats(m.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card" + (m.id === activeModuleId ? " dash-card--active" : "");
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">Grupo</span>" +
      "<strong>" + m.label + "</strong>" +
      "<span>" + stats.cards + " card" + (stats.cards === 1 ? "" : "s") +
        " · " + stats.decks + " subtema" + (stats.decks === 1 ? "" : "s") + "</span>";
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
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
  "cir-trauma": [],
  "cir-perioperatorio": [],
  "cir-infantil": [],
  "cir-vascular": [],
  "cir-ad": [],
  "cir-especialidades": [],
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

  stats.hidden = false;
  if (subtemas) subtemas.hidden = false;
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
    ? ("O que mais cai · Geral Brasil · " + moduleLabel + " · " + yearTxt)
    : ("O que mais cai · " + aprovaExamLabel(profile) + " · " + moduleLabel + " · " + yearTxt);

  const sourceType = profile.sourceType || "estimativa";
  const typeLabel = sourceType === "levantamento"
    ? "Levantamento / padrão nacional"
    : (sourceType === "sintese" ? "Síntese de provas R1" : "Estimativa por padrão de banca");

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

  if (overview) overview.hidden = false;

  if (title) title.textContent = meta.label;
  if (sub) {
    sub.hidden = false;
    if (hasAreas) {
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
    hint.textContent = isGo
      ? "Primeiro escolha Ginecologia ou Obstetrícia; depois um grupo; depois os subtemas."
      : isCli
        ? "Veja as estatísticas da Clínica e escolha uma área (ex.: Cardiologia) para aprofundar."
        : "Toque em um grupo para escolher os subtemas e estudar — sem precisar rolar a página.";
  }
  if (back) back.textContent = "← Voltar às especialidades";

  const groupsLabel = document.getElementById("esp-groups-label");
  if (groupsLabel) groupsLabel.textContent = hasAreas ? "Áreas" : "Grupos";
  if (selectAll) {
    selectAll.hidden = hasAreas;
    selectAll.textContent = "Selecionar todos";
  }

  aprovaActivePedOverviewFocus = "geral";
  aprovaActiveOverviewYear = "geral";
  aprovaOverviewExamChooserOpen = false;
  await aprovaRenderPedOverviewStats("geral", "geral");
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
  const showOverview = aprovaActiveGoArea === "ginecologia" || aprovaActiveGoArea === "obstetricia";
  if (overview) overview.hidden = !showOverview;

  const areaStats = await aprovaGoAreaStats(aprovaActiveGoArea);
  if (title) title.textContent = areaMeta.label;
  if (sub) {
    sub.hidden = false;
    sub.textContent = areaStats.groups
      ? (areaStats.cards + " flashcards · " + areaStats.groups + " grupo" +
        (areaStats.groups === 1 ? "" : "s") + " · toque em um grupo para escolher os subtemas")
      : "Grupos desta área entram em breve.";
  }
  if (hint) {
    hint.textContent = "Toque em um grupo para abrir os subtemas neste quadro separado.";
  }
  if (back) back.textContent = "← Voltar a Ginecologia e obstetrícia";
  if (groupsLabel) groupsLabel.textContent = "Grupos";
  if (selectAll) {
    selectAll.hidden = !areaStats.groups;
    selectAll.textContent = "Selecionar todos";
  }

  if (showOverview) {
    aprovaActivePedOverviewFocus = "geral";
    aprovaActiveOverviewYear = "geral";
    aprovaOverviewExamChooserOpen = false;
    await aprovaRenderPedOverviewStats("geral", "geral");
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
  if (overview) overview.hidden = false;

  const areaStats = await aprovaCliAreaStats(aprovaActiveCliArea);
  if (title) title.textContent = areaMeta.label;
  if (sub) {
    sub.hidden = false;
    sub.textContent = areaStats.groups
      ? (areaStats.cards + " flashcards · " + areaStats.groups + " grupo" +
        (areaStats.groups === 1 ? "" : "s") + " · toque em um grupo para escolher os subtemas")
      : "Grupos desta área entram em breve.";
  }
  if (hint) {
    hint.textContent = "Toque em um grupo para abrir os subtemas neste quadro separado.";
  }
  if (back) back.textContent = "← Voltar à Clínica médica";
  if (groupsLabel) groupsLabel.textContent = "Grupos";
  if (selectAll) {
    selectAll.hidden = !areaStats.groups;
    selectAll.textContent = "Selecionar todos";
  }

  aprovaActivePedOverviewFocus = "geral";
  aprovaActiveOverviewYear = "geral";
  aprovaOverviewExamChooserOpen = false;
  await aprovaRenderPedOverviewStats("geral", "geral");
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
  if (sub) {
    sub.hidden = false;
    sub.textContent = "Grupos no topo · subtemas e o que mais cai abaixo.";
  }
  if (hint) hint.textContent = "Escolha um subtema ou mude de grupo. O gráfico mostra o que mais cai na prova.";
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
  if (groupsLabel) groupsLabel.textContent = "Grupos";
  if (selectAll) {
    selectAll.hidden = false;
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
  if (back) back.textContent = "← Voltar às especialidades";

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
    preview.textContent = s.attempted
      ? s.correct + "/" + s.attempted + " acertos · " + s.pct + "% de aproveitamento"
      : "Acertos, erros e desempenho por tema.";
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

function aprovaRenderDashboard () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const hello = document.getElementById("dash-hello");
  if (hello) hello.textContent = (session && (session.name || session.login)) || "estudante";
  aprovaRenderExamStats();
}

function aprovaRenderToday () {
  const prompt = document.getElementById("today-prompt");
  const stats = document.getElementById("today-stats");
  const startBtn = document.getElementById("today-start");
  if (!prompt || !stats) return;

  const summary = aprovaTodaySummary(
    AprovaFlashcards.allIds(),
    AprovaQuestions.items.length
  );
  prompt.textContent = summary.prompt;
  stats.innerHTML = summary.stats.map(s => "<span>" + s + "</span>").join("");

  if (startBtn) {
    startBtn.disabled = summary.pending === 0;
    startBtn.textContent = summary.pending
      ? "Começar revisão (" + summary.pending + ")"
      : "Fila vazia";
  }
}

function aprovaRenderProgress () {
  const prompt = document.getElementById("progress-prompt");
  const stats = document.getElementById("progress-stats");
  if (!prompt || !stats) return;
  const summary = aprovaTodaySummary(
    AprovaFlashcards.allIds(),
    AprovaQuestions.items.length
  );
  prompt.textContent = summary.prompt;
  stats.innerHTML = summary.stats.map(s => "<span>" + s + "</span>").join("");
}

function aprovaRenderConfig () {
  const el = document.getElementById("config-user");
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  if (el) {
    el.textContent = session
      ? ((session.name || session.login) + " · " + session.login)
      : "Nenhuma sessão ativa";
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
    label.textContent = fromDeck ? "Deck concluído" : "Fila de hoje";
    front.textContent = fromDeck
      ? "Você terminou este subtema."
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
        ? "Escolha outro tema para continuar."
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

function aprovaRenderQuestion () {
  const q = AprovaQuestions.current();
  const theme = document.getElementById("q-theme");
  const stem = document.getElementById("q-stem");
  const choices = document.getElementById("q-choices");
  const explain = document.getElementById("q-explain");
  const nextBtn = document.getElementById("q-next");
  const stats = document.getElementById("q-stats");
  if (!q || !stem) return;

  theme.textContent = q.theme;
  stem.textContent = q.stem;
  explain.hidden = true;
  explain.textContent = "";
  nextBtn.hidden = true;
  choices.innerHTML = "";

  q.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      const result = AprovaQuestions.choose(i);
      if (!result) return;
      choices.querySelectorAll(".choice").forEach((el, idx) => {
        el.disabled = true;
        if (idx === result.answer) el.classList.add("correct");
        if (idx === i && !result.ok) el.classList.add("wrong");
      });
      explain.textContent = result.explain;
      explain.hidden = false;
      nextBtn.hidden = false;
      stats.textContent = AprovaQuestions.statsText();
      aprovaRenderExamStats();
    });
    choices.appendChild(btn);
  });

  stats.textContent = AprovaQuestions.statsText();
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
  const logged = aprovaSyncAppAuthUI();

  if (logged) {
    await Promise.all([AprovaFlashcards.load(), AprovaQuestions.load()]);
    aprovaRenderDashboard();
    aprovaRenderToday();
    aprovaShowFlashcardBrowse();
    aprovaRenderQuestion();
    aprovaRenderProgress();
    aprovaRenderExamStats();
    aprovaRenderEspecialidades();
    aprovaRenderConfig();
  }

  document.querySelectorAll(".side-link[data-panel]").forEach(link => {
    link.addEventListener("click", () => aprovaGoTo(link.dataset.panel));
  });

  document.querySelectorAll("[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => aprovaGoTo(btn.dataset.goto));
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
    aprovaShowSpecialtyList();
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
      aprovaShowSpecialtyList();
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
    const modal = document.getElementById("esp-deck-modal");
    if (modal && !modal.hidden) aprovaClosePedDeckModal();
  });

  document.getElementById("today-start")?.addEventListener("click", () => {
    aprovaGoTo("flashcards", { study: true, mode: "today" });
  });

  document.getElementById("fc-back-browse")?.addEventListener("click", () => {
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
  });

  document.getElementById("fc-hard")?.addEventListener("click", () => {
    AprovaFlashcards.rate(false);
    aprovaRenderFlashcard();
    aprovaRenderToday();
  });

  document.getElementById("q-next")?.addEventListener("click", () => {
    AprovaQuestions.next();
    aprovaRenderQuestion();
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
  aprovaRenderQuestion();
  aprovaRenderProgress();
  aprovaRenderExamStats();
  aprovaRenderEspecialidades();
  aprovaRenderConfig();
};
