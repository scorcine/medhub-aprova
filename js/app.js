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
let aprovaActivePedOverviewFocus = "geral";
let aprovaPedOverviewStatsCache = null;
let aprovaGoOverviewStatsCache = null;
let aprovaObsOverviewStatsCache = null;
let aprovaCirOverviewStatsCache = null;

function aprovaIsRichSpecialty (specialty) {
  return specialty === "pediatria" || specialty === "go" || specialty === "cirurgia";
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
        ? "data/stats-obstetricia-geral.json?v=20260718al"
        : "data/stats-ginecologia-geral.json?v=20260718ak",
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
      overviewUrl: "data/stats-cirurgia-geral.json?v=20260718ba",
      countNoun: "Cirurgia",
      openRoot: () => aprovaOpenCirurgia(),
      openModule: id => aprovaOpenCirurgiaModule(id)
    };
  }
  return {
    id: "pediatria",
    label: "Pediatria",
    shortLabel: "Pediatria",
    overviewCacheKey: "pediatria",
    overviewUrl: "data/stats-pediatria-geral.json?v=20260718v",
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
  aprovaActivePedModule = null;
}

function aprovaRenderEspecialidades () {
  aprovaShowSpecialtyList();
  const ped = document.getElementById("esp-count-pediatria");
  const go = document.getElementById("esp-count-go");
  const cli = document.getElementById("esp-count-clinica");
  const pedN = AprovaFlashcards.countBySpecialty("pediatria");
  const goN = AprovaFlashcards.countBySpecialty("go");
  const cliN = AprovaFlashcards.countBySpecialty("clinica");
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
  if (id.indexOf("nut-") === 0) return "Avaliação nutricional";
  if (id.indexOf("imu-") === 0) return "Imunizações";
  if (id.indexOf("dm-") === 0) return "Diabetes";
  if (id.indexOf("itu-") === 0) return "Nefro · ITU/RVU";
  if (id.indexOf("nef-") === 0) return "Nefro · SN/GNA";
  if (id.indexOf("exa-") === 0) return "Infecto · Exantemas";
  if (id.indexOf("inf-") === 0) return "Infecto · Dengue/Sepse";
  if (id.indexOf("crd-") === 0) return "Cardio pediátrica";
  if (id.indexOf("resp-") === 0) return "Respiratório";
  if (id.indexOf("gast-") === 0) return "Gastro";
  if (id.indexOf("neu-") === 0) return "Neuro";
  if (id.indexOf("hem-") === 0) return "Hemato";
  if (id.indexOf("ort-") === 0) return "Orto / Reumato";
  if (id.indexOf("cir-") === 0) return "Cirurgia pediátrica";
  if (id.indexOf("par-") === 0) return "Parasitoses";
  if (id.indexOf("alg-") === 0) return "Alergia";
  if (id.indexOf("soc-") === 0) return "Maus-tratos";
  if (id.indexOf("end-") === 0) return "Endócrino";
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
  if (meta.id === "go") {
    const obs = aprovaActiveGoArea === "obstetricia";
    if (obs) {
      if (aprovaObsOverviewStatsCache) return aprovaObsOverviewStatsCache;
      try {
        const res = await fetch(meta.overviewUrl);
        if (!res.ok) throw new Error("fail");
        aprovaObsOverviewStatsCache = await res.json();
      } catch {
        aprovaObsOverviewStatsCache = null;
      }
      return aprovaObsOverviewStatsCache;
    }
    if (aprovaGoOverviewStatsCache) return aprovaGoOverviewStatsCache;
    try {
      const res = await fetch(meta.overviewUrl);
      if (!res.ok) throw new Error("fail");
      aprovaGoOverviewStatsCache = await res.json();
    } catch {
      aprovaGoOverviewStatsCache = null;
    }
    return aprovaGoOverviewStatsCache;
  }
  if (meta.id === "cirurgia") {
    if (aprovaCirOverviewStatsCache) return aprovaCirOverviewStatsCache;
    try {
      const res = await fetch(meta.overviewUrl);
      if (!res.ok) throw new Error("fail");
      aprovaCirOverviewStatsCache = await res.json();
    } catch {
      aprovaCirOverviewStatsCache = null;
    }
    return aprovaCirOverviewStatsCache;
  }
  if (aprovaPedOverviewStatsCache) return aprovaPedOverviewStatsCache;
  try {
    const res = await fetch(meta.overviewUrl);
    if (!res.ok) throw new Error("fail");
    aprovaPedOverviewStatsCache = await res.json();
  } catch {
    aprovaPedOverviewStatsCache = null;
  }
  return aprovaPedOverviewStatsCache;
}

function aprovaLoadPedOverviewStats () {
  return aprovaLoadOverviewStats("pediatria");
}

function aprovaRenderPedOverviewStats (focusId) {
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

  return aprovaLoadOverviewStats(meta.id).then(data => {
    if (!data || !Array.isArray(data.profiles) || !data.profiles.length) {
      root.hidden = true;
      return;
    }

    root.hidden = false;
    const pid = focusId || aprovaActivePedOverviewFocus || "geral";
    const profile = data.profiles.find(p => p.id === pid) || data.profiles[0];
    aprovaActivePedOverviewFocus = profile.id;

    const ordered = data.profiles.slice().sort((a, b) => {
      const rank = p => {
        if (p.id === "geral") return 0;
        if (p.id === "enamed") return 1;
        if (p.id === "revalida") return 2;
        return 3;
      };
      const d = rank(a) - rank(b);
      return d !== 0 ? d : String(a.label || "").localeCompare(String(b.label || ""), "pt-BR");
    });

    options.innerHTML = "";
    ordered.forEach(p => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "esp-exam-btn" +
        (p.id === "enamed" || p.featured ? " esp-exam-btn--enamed" : "") +
        (p.id === profile.id ? " active" : "");
      btn.textContent = p.id === "enamed" ? "Enamed ★" : (p.id === "geral" ? "Brasil" : p.label);
      btn.title = p.kicker || p.label;
      btn.addEventListener("click", () => aprovaRenderPedOverviewStats(p.id));
      options.appendChild(btn);
    });

    if (banner) banner.hidden = profile.id !== "enamed";

    const sourceType = profile.sourceType || "estimativa";
    const typeLabel = sourceType === "levantamento"
      ? "Levantamento de provas"
      : (sourceType === "sintese" ? "Síntese de levantamentos" : "Estimativa por padrão de banca");
    const countLabel = sourceType === "estimativa"
      ? (" questões de " + meta.countNoun + " (base ilustrativa)")
      : (" questões de " + meta.countNoun + " analisadas");

    if (title) {
      title.textContent = profile.id === "geral"
        ? ("O que mais cai em " + meta.shortLabel + " · Brasil")
        : ("O que mais cai · " + profile.label);
    }
    if (sub) {
      sub.textContent = typeLabel + (profile.sampleSize
        ? (" · " + profile.sampleSize + countLabel)
        : "");
    }
    if (verdict) verdict.textContent = profile.verdict || "";

    const unitLabel = data.unitLabel || ("% das questões de " + meta.countNoun);
    if (unitEl) {
      unitEl.hidden = false;
      unitEl.textContent = "Cada barra = % do tema · ao lado, quantas questões caíram (ou a estimativa proporcional). " +
        (data.note || "");
    }

    bars.innerHTML = (profile.priorities || []).map(p => {
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
      sourceEl.textContent = profile.source
        ? ("Fonte: " + profile.source)
        : "";
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

async function aprovaGoAreaStats (areaId) {
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules("go", areaId)
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
  "nefro-extra": ["nef-"],
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
  "cir-especialidades": []
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
  const area = specialty === "go" ? aprovaActiveGoArea : null;
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

async function aprovaRenderPediatriaStats (focusId, moduleId) {
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
  aprovaActiveFocusId = focusId || "geral";

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
    : null;
  await aprovaRenderPedGroupCards(aprovaActivePedModule, groupArea ? { area: groupArea } : {});

  const orderedProfiles = profiles.slice().sort((a, b) => {
    const rank = p => {
      if (p.id === "geral") return 0;
      if (p.id === "enamed") return 1;
      return 2;
    };
    const d = rank(a) - rank(b);
    return d !== 0 ? d : String(a.label || "").localeCompare(String(b.label || ""), "pt-BR");
  });

  options.innerHTML = "";
  orderedProfiles.forEach(p => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "esp-exam-btn" +
      (p.id === "enamed" || p.featured ? " esp-exam-btn--enamed" : "") +
      (p.id === aprovaActiveFocusId ? " active" : "");
    btn.textContent = p.id === "enamed" ? "Enamed ★" : (p.id === "geral" ? "Brasil" : p.label);
    btn.addEventListener("click", () => aprovaRenderPediatriaStats(p.id, aprovaActivePedModule));
    options.appendChild(btn);
  });

  if (banner) banner.hidden = aprovaActiveFocusId !== "enamed";

  if (!profile) {
    bars.innerHTML = "<p class=\"muted\">Estatísticas indisponíveis.</p>";
    if (unitEl) unitEl.hidden = true;
    if (sourceEl) sourceEl.textContent = "";
    return;
  }

  const moduleLabel = (modules.find(m => m.id === aprovaActivePedModule) || {}).label || meta.shortLabel;
  const chartTitle = profile.id === "geral"
    ? ("O que mais cai no Brasil · " + moduleLabel)
    : ("O que mais cai · " + profile.label + " · " + moduleLabel);

  const sourceType = profile.sourceType || "estimativa";
  const typeLabel = sourceType === "levantamento"
    ? "Levantamento / padrão nacional"
    : (sourceType === "sintese" ? "Síntese de provas R1" : "Estimativa por padrão de banca");

  if (title) title.textContent = chartTitle;
  if (sub) {
    sub.textContent = typeLabel + (profile.foco ? (" — " + profile.foco) : "");
  }

  const unitLabel = (moduleData && moduleData.unitLabel) || "% das questões deste tema";
  if (unitEl) {
    unitEl.hidden = false;
    unitEl.textContent = "Cada barra = " + unitLabel +
      ((moduleData && moduleData.note) ? ". " + moduleData.note : "");
  }

  bars.innerHTML = (profile.priorities || []).map(p => {
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
    sourceEl.textContent = profile.source
      ? ("Fonte: " + profile.source)
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
  if (overview) overview.hidden = false;

  const total = AprovaFlashcards.countBySpecialty(meta.id);
  const isGo = meta.id === "go";
  const modules = typeof AprovaRevisao !== "undefined"
    ? AprovaRevisao.listModules(meta.id)
    : [];
  const areas = isGo && typeof AprovaRevisao !== "undefined" && typeof AprovaRevisao.listGoAreas === "function"
    ? AprovaRevisao.listGoAreas()
    : [];

  if (title) title.textContent = meta.label;
  if (sub) {
    sub.hidden = false;
    if (isGo) {
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
      : "Toque em um grupo para escolher os subtemas e estudar — sem precisar rolar a página.";
  }
  if (back) back.textContent = "← Voltar às especialidades";

  const groupsLabel = document.getElementById("esp-groups-label");
  if (groupsLabel) groupsLabel.textContent = isGo ? "Áreas" : "Grupos";
  if (selectAll) {
    selectAll.hidden = isGo;
    selectAll.textContent = "Selecionar todos";
  }

  await aprovaRenderPedOverviewStats(aprovaActivePedOverviewFocus || "geral");
  if (isGo) {
    await aprovaRenderGoAreaCards();
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
    await aprovaRenderPedOverviewStats(aprovaActivePedOverviewFocus || "geral");
  }
  await aprovaRenderPedGroupCards(null, { area: aprovaActiveGoArea });
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
    await aprovaOpenRichSpecialtyRoot(meta.id);
    return;
  }

  if (meta.id === "go" && typeof AprovaRevisao !== "undefined") {
    const modArea = AprovaRevisao.moduleArea(aprovaActivePedModule);
    if (modArea) aprovaActiveGoArea = modArea;
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
    back.textContent = meta.id === "go" && aprovaActiveGoArea
      ? ("← Voltar a " + ((typeof APROVA_GO_AREAS !== "undefined" && APROVA_GO_AREAS[aprovaActiveGoArea]
        ? APROVA_GO_AREAS[aprovaActiveGoArea].label
        : "área")))
      : ("← Voltar à " + meta.shortLabel);
  }

  const groupsLabel = document.getElementById("esp-groups-label");
  if (groupsLabel) groupsLabel.textContent = "Grupos";
  if (selectAll) {
    selectAll.hidden = false;
    selectAll.textContent = "Selecionar todos";
  }

  await aprovaRenderPediatriaStats("geral", aprovaActivePedModule);
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
    btn.addEventListener("click", () => aprovaOpenSpecialty(btn.dataset.specialty));
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
