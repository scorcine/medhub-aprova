/* Shell do app — sidebar, dashboard e módulos de estudo */

const APROVA_PANEL_META = {
  inicio: { title: "Início", sub: "Escolha o que estudar agora" },
  hoje: { title: "Revisão de hoje", sub: "Fila SRS · novos e vencidos" },
  flashcards: { title: "Flashcards", sub: "Memória ativa para o R1" },
  questoes: { title: "Banco de questões", sub: "Treino no formato da prova" },
  especialidades: { title: "Especialidades", sub: "Foque por área clínica" },
  "revisao-neo": { title: "Revisão Neonatologia", sub: "Alto rendimento para provas R1" },
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

function aprovaGoTo (id) {
  if (id === "flashcards") {
    if (AprovaFlashcards.mode !== "deck") {
      AprovaFlashcards.rebuildTodayQueue();
    }
    aprovaRenderFlashcard();
  }
  if (id === "hoje") aprovaRenderToday();
  if (id === "progresso") aprovaRenderProgress();
  if (id === "estatisticas") aprovaRenderExamStats();
  if (id === "config") aprovaRenderConfig();
  if (id === "inicio") aprovaRenderDashboard();
  if (id === "especialidades") aprovaRenderEspecialidades();
  if (id === "revisao-neo") aprovaRenderRevisaoNeo();
  aprovaShowPanel(id);
}

function aprovaShowSpecialtyList () {
  const list = document.getElementById("esp-list");
  const decks = document.getElementById("esp-decks");
  const hint = document.getElementById("esp-hint");
  if (list) list.hidden = false;
  if (decks) decks.hidden = true;
  if (hint) hint.textContent = "Escolha uma área e depois um subtema para estudar os flashcards.";
}

function aprovaRenderEspecialidades () {
  aprovaShowSpecialtyList();
  const ped = document.getElementById("esp-count-pediatria");
  const cli = document.getElementById("esp-count-clinica");
  const pedN = AprovaFlashcards.countBySpecialty("pediatria");
  const cliN = AprovaFlashcards.countBySpecialty("clinica");
  if (ped) {
    ped.textContent = pedN
      ? pedN + " flashcards · toque para ver os subtemas"
      : "Neonatologia, infecções e urgências.";
  }
  if (cli) {
    cli.textContent = cliN
      ? cliN + " flashcards · toque para ver os subtemas"
      : "Cardiologia, infecto, endocrino e mais.";
  }
}

function aprovaOpenSpecialty (specialty) {
  const list = document.getElementById("esp-list");
  const decksWrap = document.getElementById("esp-decks");
  const grid = document.getElementById("esp-deck-grid");
  const title = document.getElementById("esp-decks-title");
  const hint = document.getElementById("esp-hint");
  if (!grid || !decksWrap) return;

  const decks = AprovaFlashcards.decksBySpecialty(specialty);
  const label = APROVA_SPECIALTY_LABELS[specialty] || specialty;

  if (list) list.hidden = true;
  decksWrap.hidden = false;
  if (title) title.textContent = label + " · subtemas";
  if (hint) {
    hint.textContent = decks.length
      ? "Escolha um subtema para estudar."
      : "Ainda sem flashcards nesta área — em breve.";
  }

  grid.innerHTML = "";

  if (specialty === "pediatria") {
    const revBtn = document.createElement("button");
    revBtn.type = "button";
    revBtn.className = "dash-card dash-card--featured";
    revBtn.innerHTML =
      "<span class=\"dash-card-kicker\">Provas R1</span>" +
      "<strong>Revisão Neonatologia</strong>" +
      "<span>O que mais cai em USP, Unifesp, SUS-SP/BA, Einstein, PUC, Unicamp e UFRJ.</span>";
    revBtn.addEventListener("click", () => aprovaGoTo("revisao-neo"));
    grid.appendChild(revBtn);
  }

  if (!decks.length) {
    if (specialty !== "pediatria") {
      grid.innerHTML = "<p class=\"muted\">Nenhum deck disponível ainda nesta especialidade.</p>";
    }
    return;
  }

  decks.forEach(deck => {
    const n = (deck.cards || []).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dash-card";
    btn.innerHTML =
      "<span class=\"dash-card-kicker\">Subtema</span>" +
      "<strong>" + deck.name + "</strong>" +
      "<span>" + n + " card" + (n === 1 ? "" : "s") + "</span>";
    btn.addEventListener("click", () => {
      AprovaFlashcards.startDeck(deck.id);
      aprovaGoTo("flashcards");
    });
    grid.appendChild(btn);
  });
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
  const card = AprovaFlashcards.current();
  const front = document.getElementById("fc-front");
  const back = document.getElementById("fc-back");
  const label = document.getElementById("fc-deck-label");
  const hint = document.getElementById("fc-hint");
  const revealBtn = document.getElementById("fc-reveal");
  const easyBtn = document.getElementById("fc-easy");
  const hardBtn = document.getElementById("fc-hard");
  const backHoje = document.getElementById("fc-back-hoje");
  const backEsp = document.getElementById("fc-back-esp");
  if (!front || !label) return;

  const fromDeck = AprovaFlashcards.mode === "deck";

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
    if (backHoje) backHoje.hidden = fromDeck;
    if (backEsp) backEsp.hidden = !fromDeck;
    if (hint) {
      hint.textContent = fromDeck
        ? "Volte às especialidades para escolher outro subtema."
        : "Volte amanhã ou treine questões.";
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
  if (backEsp) backEsp.hidden = !fromDeck;
  if (hint) {
    hint.textContent = fromDeck
      ? "Estudo por especialidade · revelar · acertei / errei."
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
    aprovaRenderFlashcard();
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
  aprovaRenderFlashcard();
  aprovaRenderQuestion();
  aprovaRenderProgress();
  aprovaRenderExamStats();
  aprovaRenderEspecialidades();
  aprovaRenderConfig();
};
