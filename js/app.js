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
    hint.textContent = AprovaFlashcards.mode === "deck"
      ? "Estudo por tema · revelar · acertei / errei."
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
let aprovaActivePedModule = "neonatologia";

function aprovaHideEspViews () {
  ["esp-list", "esp-decks", "esp-revisao"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  const stats = document.getElementById("esp-stats");
  if (stats) stats.hidden = true;
}

function aprovaShowSpecialtyList () {
  aprovaHideEspViews();
  const list = document.getElementById("esp-list");
  const hint = document.getElementById("esp-hint");
  if (list) list.hidden = false;
  if (hint) hint.textContent = "Escolha uma área para focar o estudo.";
  aprovaActiveSpecialty = null;
}

function aprovaRenderEspecialidades () {
  aprovaShowSpecialtyList();
  const ped = document.getElementById("esp-count-pediatria");
  const cli = document.getElementById("esp-count-clinica");
  const pedN = AprovaFlashcards.countBySpecialty("pediatria");
  const cliN = AprovaFlashcards.countBySpecialty("clinica");
  if (ped) {
    ped.textContent = pedN
      ? pedN + " flashcards · Neonatologia + Alimentação"
      : "Neonatologia, alimentação e mais.";
  }
  if (cli) {
    cli.textContent = cliN
      ? cliN + " flashcards · toque para ver os subtemas"
      : "Cardiologia, infecto, endocrino e mais.";
  }
}

function aprovaDeckKicker (deck) {
  const id = String(deck.id || "");
  if (id.indexOf("neo-") === 0) return "Neonatologia";
  if (id.indexOf("ali-") === 0) return "Alimentação";
  if (id.indexOf("cardio") === 0) return "Cardiologia";
  return "Subtema";
}

function aprovaRenderDeckCards (specialty, grid) {
  const decks = AprovaFlashcards.decksBySpecialty(specialty).slice().sort((a, b) => {
    const rank = id => {
      const s = String(id || "");
      if (s.indexOf("neo-") === 0) return 0;
      if (s.indexOf("ali-") === 0) return 1;
      return 2;
    };
    const d = rank(a.id) - rank(b.id);
    return d !== 0 ? d : String(a.name || "").localeCompare(String(b.name || ""), "pt-BR");
  });
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

async function aprovaRenderPediatriaStats (focusId, moduleId) {
  const stats = document.getElementById("esp-stats");
  const bars = document.getElementById("esp-stats-bars");
  const title = document.getElementById("esp-stats-title");
  const sub = document.getElementById("esp-stats-sub");
  const options = document.getElementById("esp-exam-options");
  const modulesEl = document.getElementById("esp-module-options");
  if (!stats || !bars || !options) return;

  stats.hidden = false;
  aprovaActivePedModule = moduleId || aprovaActivePedModule || "neonatologia";
  aprovaActiveFocusId = focusId || "geral";

  if (typeof AprovaRevisao !== "undefined") {
    AprovaRevisao.setActiveModule(aprovaActivePedModule);
    AprovaRevisao.setActiveProfile(aprovaActiveFocusId);
  }

  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules()
    : [];
  const profiles = typeof AprovaRevisao !== "undefined"
    ? await AprovaRevisao.getProfiles(aprovaActivePedModule)
    : [];
  const profile = typeof AprovaRevisao !== "undefined"
    ? await AprovaRevisao.getProfile(aprovaActiveFocusId, aprovaActivePedModule)
    : null;

  if (modulesEl) {
    modulesEl.innerHTML = "";
    modules.forEach(m => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "esp-exam-btn" + (m.id === aprovaActivePedModule ? " active" : "");
      btn.textContent = m.label;
      btn.addEventListener("click", () => aprovaRenderPediatriaStats("geral", m.id));
      modulesEl.appendChild(btn);
    });
  }

  if (!profile) {
    bars.innerHTML = "<p class=\"muted\">Estatísticas indisponíveis.</p>";
    return;
  }

  const moduleLabel = (modules.find(m => m.id === aprovaActivePedModule) || {}).label || "Pediatria";
  const chartTitle = profile.id === "geral"
    ? ("O que mais cai no Brasil · " + moduleLabel)
    : ("O que mais cai · " + profile.label + " · " + moduleLabel);

  if (title) title.textContent = chartTitle;
  if (sub) {
    sub.textContent = profile.id === "geral"
      ? ("Prioridade relativa dos assuntos de " + moduleLabel + " nas provas R1.")
      : (profile.foco || profile.blurb);
  }

  const maxScore = Math.max(...profile.priorities.map(p => p.score), 1);
  bars.innerHTML = profile.priorities.map(p => {
    const pct = Math.round((p.score / maxScore) * 100);
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + p.tema + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + pct + "%\"></i></div>" +
        "<em>" + p.score + "</em>" +
      "</div>"
    );
  }).join("");

  options.innerHTML = "";
  profiles.forEach(p => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "esp-exam-btn" + (p.id === aprovaActiveFocusId ? " active" : "");
    btn.textContent = p.id === "geral" ? "Brasil" : p.label;
    btn.addEventListener("click", () => aprovaRenderPediatriaStats(p.id, aprovaActivePedModule));
    options.appendChild(btn);
  });
}

async function aprovaOpenPediatria () {
  aprovaActiveSpecialty = "pediatria";
  aprovaActiveFocusId = "geral";
  if (!aprovaActivePedModule) aprovaActivePedModule = "neonatologia";

  const decksWrap = document.getElementById("esp-decks");
  const grid = document.getElementById("esp-deck-grid");
  const title = document.getElementById("esp-decks-title");
  const hint = document.getElementById("esp-hint");
  if (!grid || !decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;
  if (title) title.textContent = "Pediatria · subtemas";
  if (hint) hint.textContent = "Escolha um subtema. Abaixo, veja o que mais cai nas provas.";

  aprovaRenderDeckCards("pediatria", grid);
  await aprovaRenderPediatriaStats(aprovaActiveFocusId, aprovaActivePedModule);
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

  if (specialty === "pediatria") {
    aprovaOpenPediatria();
    return;
  }

  const decksWrap = document.getElementById("esp-decks");
  const grid = document.getElementById("esp-deck-grid");
  const title = document.getElementById("esp-decks-title");
  const hint = document.getElementById("esp-hint");
  if (!grid || !decksWrap) return;

  aprovaHideEspViews();
  decksWrap.hidden = false;

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
    btn.addEventListener("click", () => aprovaOpenSpecialty(btn.dataset.specialty));
  });

  document.getElementById("esp-back")?.addEventListener("click", () => {
    aprovaShowSpecialtyList();
  });

  document.getElementById("esp-rev-back")?.addEventListener("click", () => {
    aprovaOpenPediatria();
  });

  document.getElementById("esp-open-revisao")?.addEventListener("click", () => {
    aprovaOpenSpecialtyReview(aprovaActiveFocusId || "geral");
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
