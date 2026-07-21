/* Prova na íntegra — banca → ano → íntegra ou grande área */

const APROVA_PROVAS_CATALOG_URL = "data/provas/catalog.json";
const APROVA_PROVAS_CACHE_VER = "20260721sussp4";

const APROVA_PROVAS_AREA_ORDER = ["clinica", "cirurgia", "pediatria", "go", "preventiva"];
const APROVA_PROVAS_AREA_LABELS = {
  clinica: "Clínica médica",
  cirurgia: "Cirurgia",
  pediatria: "Pediatria",
  go: "Ginecologia e obstetrícia",
  preventiva: "Preventiva"
};

/** Meta de acerto para cor do progresso (verde / amarelo / vermelho). */
const APROVA_PROVA_META_PCT = 70;

let aprovaProvasCatalogData = null;
let aprovaProvasBound = false;
let aprovaProvasPackCache = Object.create(null);
let aprovaProvasRenderSeq = 0;
let aprovaProvasView = {
  mode: "familias", // familias | anos | modo | estilo
  familyId: null,
  year: null,
  packId: null,
  area: ""
};

function aprovaProvaExamLabel (examId) {
  const id = String(examId || "").toLowerCase();
  if (typeof APROVA_TARGET_EXAMS !== "undefined") {
    const hit = APROVA_TARGET_EXAMS.find((e) => e.id === id);
    if (hit) return hit.label;
  }
  return id ? id.toUpperCase() : "Banca";
}

function aprovaProvaAreaLabel (specialty) {
  const id = String(specialty || "").toLowerCase();
  return APROVA_PROVAS_AREA_LABELS[id] || specialty || "Outras";
}

function aprovaProvaAccTone (pct) {
  const n = Number(pct);
  if (!Number.isFinite(n)) return "none";
  if (n >= APROVA_PROVA_META_PCT) return "good";
  if (n >= 50) return "mid";
  return "low";
}

/** Resumo de progresso salvo (simulado ou treino) para um recorte da prova. */
function aprovaProvaProgressSummary (packId, area, totalHint) {
  if (typeof AprovaQuestions === "undefined" || !AprovaQuestions.loadSavedProva) {
    return null;
  }
  const a = String(area || "");
  const candidates = ["simulado", "treino"]
    .map((style) => AprovaQuestions.loadSavedProva(packId, a, style))
    .filter(Boolean);
  if (!candidates.length) return null;

  candidates.sort((x, y) => {
    const ax = (x.answers || []).length;
    const ay = (y.answers || []).length;
    if (ay !== ax) return ay - ax;
    if (!!y.finished !== !!x.finished) return y.finished ? 1 : -1;
    return (y.savedAt || 0) - (x.savedAt || 0);
  });
  const snap = candidates[0];
  const total = (snap.queue && snap.queue.length) || Number(totalHint) || 0;
  const answers = (snap.answers || []).filter((row) => row && !row.annulled);
  const done = answers.length;
  const hits = answers.filter((row) => row.ok).length;
  const pct = done ? Math.round((hits / done) * 100) : null;
  return {
    done,
    total,
    hits,
    pct,
    finished: !!snap.finished,
    style: snap.style || "",
    tone: done ? aprovaProvaAccTone(pct) : "none"
  };
}

function aprovaProvaProgressHtml (summary) {
  if (!summary || !(summary.done > 0 || summary.finished)) return "";
  const total = summary.total || 0;
  const doneLabel = summary.finished
    ? ("Concluído " + (total || summary.done) + "/" + (total || summary.done))
    : ("Concluído " + summary.done + "/" + (total || "—"));
  const pctHtml = summary.pct == null
    ? ""
    : ("<span class=\"provas-prog-pct provas-prog-pct--" + summary.tone + "\">" +
        summary.pct + "% acerto</span>");
  const fill = total > 0 ? Math.min(100, Math.round((summary.done / total) * 100)) : 0;
  return (
    "<div class=\"provas-prog\">" +
      "<div class=\"provas-prog-row\">" +
        "<span class=\"provas-prog-done\">" + doneLabel + "</span>" +
        pctHtml +
      "</div>" +
      "<div class=\"provas-prog-bar\" aria-hidden=\"true\">" +
        "<span class=\"provas-prog-bar-fill provas-prog-bar-fill--" + summary.tone +
          "\" style=\"width:" + fill + "%\"></span>" +
      "</div>" +
    "</div>"
  );
}

function aprovaProvasClickEl (target) {
  if (!target) return null;
  if (target instanceof Element) return target;
  return target.parentElement || null;
}

async function aprovaLoadProvasCatalogData () {
  if (aprovaProvasCatalogData) return aprovaProvasCatalogData;
  const url = APROVA_PROVAS_CATALOG_URL + "?v=" + APROVA_PROVAS_CACHE_VER;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Catálogo de provas indisponível");
  const data = await res.json();
  aprovaProvasCatalogData = {
    familias: Array.isArray(data.familias) ? data.familias : [],
    provas: Array.isArray(data.provas) ? data.provas : (Array.isArray(data) ? data : [])
  };
  return aprovaProvasCatalogData;
}

async function aprovaLoadProvaFile (file) {
  const key = String(file || "");
  if (aprovaProvasPackCache[key]) return aprovaProvasPackCache[key];
  const url = key + (key.indexOf("?") >= 0 ? "&" : "?") + "v=" + APROVA_PROVAS_CACHE_VER;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Arquivo da prova não encontrado (" + res.status + ")");
  const pack = await res.json();
  aprovaProvasPackCache[key] = pack;
  return pack;
}

function aprovaProvasQuestionsFromPack (pack) {
  if (Array.isArray(pack)) return pack;
  if (pack && Array.isArray(pack.questions)) return pack.questions;
  return [];
}

function aprovaProvasCountByArea (questions) {
  const counts = Object.create(null);
  (questions || []).forEach((q) => {
    const id = String((q && q.specialty) || "clinica").toLowerCase();
    counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}

function aprovaProvasFindFamily (familyId, data) {
  return (data.familias || []).find((f) => f.id === familyId) || null;
}

function aprovaProvasFindPack (family, year, data) {
  const exams = new Set((family.examIds || []).map((e) => String(e).toLowerCase()));
  const y = Number(year);
  return (data.provas || []).find((p) => {
    if (!p || p.status !== "ready" || !p.file) return false;
    if (Number(p.year) !== y) return false;
    return exams.has(String(p.exam || "").toLowerCase());
  }) || null;
}

function aprovaProvasGoFamilias () {
  aprovaProvasView = { mode: "familias", familyId: null, year: null, packId: null, area: "" };
  aprovaRenderProvasIntegra();
}

function aprovaProvasGoAnos (familyId) {
  const id = String(familyId || "").trim();
  if (!id) return;
  aprovaProvasView = { mode: "anos", familyId: id, year: null, packId: null, area: "" };
  aprovaRenderProvasIntegra();
}

function aprovaProvasGoModo (familyId, year) {
  const id = String(familyId || "").trim();
  const y = Number(year);
  if (!id || !Number.isFinite(y)) return;
  aprovaProvasView = { mode: "modo", familyId: id, year: y, packId: null, area: "" };
  aprovaRenderProvasIntegra();
}

function aprovaProvasGoEstilo (familyId, year, packId, area) {
  const id = String(familyId || "").trim();
  const y = Number(year);
  if (!id || !Number.isFinite(y) || !packId) return;
  aprovaProvasView = {
    mode: "estilo",
    familyId: id,
    year: y,
    packId: String(packId),
    area: String(area || "")
  };
  aprovaRenderProvasIntegra();
}

function aprovaProvasBack () {
  if (aprovaProvasView.mode === "estilo") {
    aprovaProvasView.mode = "modo";
    aprovaProvasView.area = "";
    aprovaRenderProvasIntegra();
    return;
  }
  if (aprovaProvasView.mode === "modo") {
    aprovaProvasView.mode = "anos";
    aprovaProvasView.packId = null;
    aprovaRenderProvasIntegra();
    return;
  }
  aprovaProvasGoFamilias();
}

/** Volta do card de questão para a tela da prova (estilo). */
function aprovaReturnToProvaHub () {
  let familyId = aprovaProvasView.familyId;
  let year = aprovaProvasView.year;
  let packId = aprovaProvasView.packId;
  let area = aprovaProvasView.area || "";
  if (typeof AprovaQuestions !== "undefined" && AprovaQuestions.isProvaSession && AprovaQuestions.isProvaSession()) {
    const sim = AprovaQuestions.simulado || {};
    familyId = sim.familyId || familyId;
    year = sim.year != null ? sim.year : year;
    packId = sim.packId || packId;
    area = sim.area || area;
  }
  if (!familyId || !year || !packId) {
    const saved = typeof AprovaQuestions !== "undefined" && AprovaQuestions.loadSavedProva
      ? AprovaQuestions.loadSavedProva()
      : null;
    if (saved) {
      familyId = saved.familyId || familyId;
      year = saved.year != null ? saved.year : year;
      packId = saved.packId || packId;
      area = saved.area || area;
    }
  }
  if (typeof aprovaMarkNav === "function") aprovaMarkNav("provas-integra");
  if (typeof aprovaGoTo === "function") aprovaGoTo("provas-integra");
  else if (typeof aprovaShowPanel === "function") aprovaShowPanel("provas-integra");
  if (familyId && year && packId) {
    aprovaProvasGoEstilo(familyId, year, packId, area);
  } else if (familyId && year) {
    aprovaProvasGoModo(familyId, year);
  } else {
    aprovaProvasGoFamilias();
  }
}

function aprovaBindProvasIntegra () {
  if (aprovaProvasBound) return;
  const list = document.getElementById("provas-integra-list");
  if (!list) return;
  aprovaProvasBound = true;

  list.addEventListener("click", (e) => {
    const el = aprovaProvasClickEl(e.target);
    if (!el || typeof el.closest !== "function") return;

    const back = el.closest("[data-prova-back]");
    if (back) {
      e.preventDefault();
      e.stopPropagation();
      const to = back.getAttribute("data-prova-back") || "familias";
      if (to === "modo") {
        aprovaProvasView.mode = "modo";
        aprovaProvasView.area = "";
        aprovaRenderProvasIntegra();
      } else if (to === "anos") {
        aprovaProvasView.mode = "anos";
        aprovaProvasView.packId = null;
        aprovaProvasView.area = "";
        aprovaRenderProvasIntegra();
      } else {
        aprovaProvasGoFamilias();
      }
      return;
    }

    // IMPORTANTE: year antes de family — o chip do ano também tinha data-prova-family
    // e o handler de family chamava GoAnos, cancelando a abertura.
    const yearBtn = el.closest("[data-prova-year]");
    if (yearBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (yearBtn.disabled) return;
      const familyId = yearBtn.getAttribute("data-prova-year-family") ||
        aprovaProvasView.familyId ||
        yearBtn.getAttribute("data-prova-family");
      aprovaProvasGoModo(familyId, yearBtn.getAttribute("data-prova-year"));
      return;
    }

    const familyBtn = el.closest("[data-prova-family]");
    if (familyBtn) {
      e.preventDefault();
      e.stopPropagation();
      aprovaProvasGoAnos(familyBtn.getAttribute("data-prova-family"));
      return;
    }

    const scopeBtn = el.closest("[data-prova-scope]");
    if (scopeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const packId = scopeBtn.getAttribute("data-prova-scope");
      const area = scopeBtn.getAttribute("data-prova-area") || "";
      if (packId) {
        aprovaProvasGoEstilo(
          aprovaProvasView.familyId,
          aprovaProvasView.year,
          packId,
          area
        );
      }
      return;
    }

    const styleBtn = el.closest("[data-prova-style]");
    if (styleBtn) {
      e.preventDefault();
      e.stopPropagation();
      const style = styleBtn.getAttribute("data-prova-style") || "simulado";
      const action = styleBtn.getAttribute("data-prova-action") || "start";
      aprovaStartProvaIntegraById(
        aprovaProvasView.packId,
        aprovaProvasView.area || null,
        { style, action }
      );
    }
  });
}

function aprovaRenderProvasFamilias (root, data) {
  const familias = data.familias || [];
  if (!familias.length) {
    root.innerHTML =
      "<div class=\"study-card\">" +
        "<div class=\"label\">Em montagem</div>" +
        "<p class=\"prompt\">Nenhuma banca configurada ainda.</p>" +
      "</div>";
    return;
  }

  root.innerHTML = familias.map((f) => {
    const years = Array.isArray(f.years) ? f.years : [];
    const readyCount = years.filter((y) => !!aprovaProvasFindPack(f, y, data)).length;
    return (
      "<article class=\"study-card provas-integra-card\">" +
        "<div class=\"label\">Prova nacional</div>" +
        "<p class=\"prompt\" style=\"margin:0.35rem 0 0.55rem\"><strong>" +
          String(f.label || "Prova") +
        "</strong></p>" +
        "<p class=\"muted\" style=\"margin:0 0 0.85rem\">" +
          String(f.blurb || "Escolha o ano da prova") +
          " · " + years.length + " anos · " +
          (readyCount ? (readyCount + " disponível(is)") : "conteúdo em montagem") +
        "</p>" +
        "<div class=\"actions-row\">" +
          "<button type=\"button\" class=\"btn btn-primary\" data-prova-family=\"" +
            String(f.id) + "\">Escolher ano</button>" +
        "</div>" +
      "</article>"
    );
  }).join("");
}

function aprovaRenderProvasAnos (root, data, familyId) {
  const family = aprovaProvasFindFamily(familyId, data);
  if (!family) {
    aprovaProvasGoFamilias();
    return;
  }

  const years = Array.isArray(family.years) ? family.years.slice() : [];
  years.sort((a, b) => b - a);

  const chips = years.map((y) => {
    const pack = aprovaProvasFindPack(family, y, data);
    const ready = !!pack;
    const fid = String(family.id).replace(/"/g, "");
    return (
      "<button type=\"button\" class=\"provas-year-chip" + (ready ? " is-ready" : "") + "\"" +
        " data-prova-year=\"" + y + "\"" +
        " data-prova-year-family=\"" + fid + "\"" +
        (ready ? "" : " disabled") +
        " aria-label=\"" + (ready ? ("Abrir " + family.label + " " + y) : (y + " em breve")) + "\">" +
        "<span class=\"provas-year-chip-year\">" + y + "</span>" +
        "<span class=\"provas-year-chip-status\">" + (ready ? "Disponível" : "Em breve") + "</span>" +
      "</button>"
    );
  }).join("");

  root.innerHTML =
    "<div class=\"provas-integra-year-wrap\">" +
      "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"familias\">← Voltar</button>" +
      "<article class=\"study-card\" style=\"margin-top:0.75rem\">" +
        "<div class=\"label\">" + String(family.label) + "</div>" +
        "<p class=\"prompt\" style=\"margin:0.35rem 0 0.85rem\"><strong>Escolha o ano</strong></p>" +
        "<p class=\"muted\" style=\"margin:0 0 0.85rem\">Toque no ano. Em seguida escolha prova na íntegra ou por grande área.</p>" +
        "<div class=\"provas-year-grid\" role=\"list\">" + chips + "</div>" +
      "</article>" +
    "</div>";
}

async function aprovaRenderProvasModo (root, data, seq) {
  const family = aprovaProvasFindFamily(aprovaProvasView.familyId, data);
  const year = Number(aprovaProvasView.year);
  if (!family || !Number.isFinite(year)) {
    aprovaProvasGoFamilias();
    return;
  }

  const meta = aprovaProvasFindPack(family, year, data);
  if (!meta) {
    root.innerHTML =
      "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"anos\">← Voltar</button>" +
      "<p class=\"muted\" style=\"margin-top:0.85rem\">A prova de " + year + " ainda está em montagem.</p>";
    return;
  }

  aprovaProvasView.packId = meta.id;
  root.innerHTML =
    "<div class=\"provas-integra-year-wrap\">" +
      "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"anos\">← Voltar</button>" +
      "<article class=\"study-card\" style=\"margin-top:0.75rem\">" +
        "<div class=\"label\">" + String(family.label) + " · " + year + "</div>" +
        "<p class=\"prompt\" style=\"margin:0.35rem 0 0.55rem\"><strong>Como deseja fazer?</strong></p>" +
        "<p class=\"muted\">Carregando opções…</p>" +
      "</article>" +
    "</div>";

  try {
    const pack = await aprovaLoadProvaFile(meta.file);
    if (seq != null && seq !== aprovaProvasRenderSeq) return;
    if (aprovaProvasView.mode !== "modo" || Number(aprovaProvasView.year) !== year) return;

    const questions = aprovaProvasQuestionsFromPack(pack);
    const total = questions.length;
    if (!total) {
      root.innerHTML =
        "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"anos\">← Voltar</button>" +
        "<p class=\"muted\" style=\"margin-top:0.85rem\">Arquivo da prova sem questões.</p>";
      return;
    }

    // Recorte por área só quando o pacote tiver tags confiáveis (areasReady).
    const areasReady = meta.areasReady === true;
    const fullProg = aprovaProvaProgressSummary(meta.id, "", total);
    const fullProgHtml = aprovaProvaProgressHtml(fullProg);
    let areaBlock = "";
    if (areasReady) {
      const byArea = aprovaProvasCountByArea(questions);
      const areas = APROVA_PROVAS_AREA_ORDER
        .filter((id) => (byArea[id] || 0) > 0)
        .concat(Object.keys(byArea).filter((id) => APROVA_PROVAS_AREA_ORDER.indexOf(id) < 0 && byArea[id] > 0));
      const areaScopeBtns = areas.map((id) => {
        const n = byArea[id] || 0;
        const prog = aprovaProvaProgressSummary(meta.id, id, n);
        const progHtml = aprovaProvaProgressHtml(prog);
        return (
          "<button type=\"button\" class=\"provas-area-chip" +
            (prog && prog.done ? " has-progress" : "") +
            "\" data-prova-scope=\"" + String(meta.id) + "\" data-prova-area=\"" + id + "\">" +
            "<span class=\"provas-area-chip-label\">" + aprovaProvaAreaLabel(id) + "</span>" +
            "<span class=\"provas-area-chip-count\">" + n + " questões</span>" +
            progHtml +
          "</button>"
        );
      }).join("");
      areaBlock =
        "<div class=\"label\" style=\"margin:1rem 0 0.35rem\">Por grande área</div>" +
        "<p class=\"muted\" style=\"margin:0 0 0.65rem;font-size:0.85rem\">Classificação MedHub R1 por enunciado (curada). Progresso e % de acerto vêm do que você já respondeu (meta " +
          APROVA_PROVA_META_PCT + "%).</p>" +
        "<div class=\"provas-area-grid\">" + areaScopeBtns + "</div>";
    } else {
      areaBlock =
        "<p class=\"muted\" style=\"margin:1rem 0 0;font-size:0.85rem\">Recorte por grande área em curadoria.</p>";
    }

    root.innerHTML =
      "<div class=\"provas-integra-year-wrap\">" +
        "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"anos\">← Voltar</button>" +
        "<article class=\"study-card\" style=\"margin-top:0.75rem\">" +
          "<div class=\"label\">" + String(family.label) + " · " + year + "</div>" +
          "<p class=\"prompt\" style=\"margin:0.35rem 0 0.55rem\"><strong>O que deseja fazer?</strong></p>" +
          "<p class=\"muted\" style=\"margin:0 0 0.85rem\">Escolha a prova completa ou um recorte por grande área. Em seguida você define o modo (simulado ou treino).</p>" +
          "<button type=\"button\" class=\"provas-full-chip" +
            (fullProg && fullProg.done ? " has-progress" : "") +
            "\" data-prova-scope=\"" + String(meta.id) + "\" data-prova-area=\"\">" +
            "<span class=\"provas-full-chip-title\">Prova na íntegra (" + total + ")</span>" +
            fullProgHtml +
          "</button>" +
          areaBlock +
        "</article>" +
      "</div>";
  } catch (err) {
    if (aprovaProvasView.mode !== "modo") return;
    const detail = err && err.message ? String(err.message) : "erro de rede";
    root.innerHTML =
      "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"anos\">← Voltar</button>" +
      "<p class=\"muted\" style=\"margin-top:0.85rem\">Não foi possível carregar a prova de " + year +
      " (" + detail + ").</p>" +
      "<div class=\"actions-row\" style=\"margin-top:0.75rem\">" +
        "<button type=\"button\" class=\"btn btn-primary\" data-prova-year=\"" + year +
        "\" data-prova-family=\"" + String(family.id) + "\">Tentar de novo</button>" +
      "</div>";
  }
}

function aprovaRenderProvasEstilo (root, data) {
  const family = aprovaProvasFindFamily(aprovaProvasView.familyId, data);
  const year = Number(aprovaProvasView.year);
  const packId = String(aprovaProvasView.packId || "");
  const area = String(aprovaProvasView.area || "");
  const meta = (data.provas || []).find((p) => p && p.id === packId) ||
    aprovaProvasFindPack(family, year, data);
  if (!family || !meta) {
    aprovaProvasGoModo(aprovaProvasView.familyId, year);
    return;
  }

  const scopeLabel = area
    ? aprovaProvaAreaLabel(area)
    : ("Prova na íntegra (" + (meta.count || 100) + ")");
  const resumeSim = typeof AprovaQuestions !== "undefined" && AprovaQuestions.getResumableProva
    ? AprovaQuestions.getResumableProva(meta.id, area, "simulado")
    : null;
  const resumeTreino = typeof AprovaQuestions !== "undefined" && AprovaQuestions.getResumableProva
    ? AprovaQuestions.getResumableProva(meta.id, area, "treino")
    : null;

  function styleCard (style, title, blurb, resume) {
    const answers = resume && resume.answers
      ? resume.answers.filter((a) => a && !a.annulled)
      : [];
    const done = answers.length;
    const hits = answers.filter((a) => a.ok).length;
    const total = resume && resume.queue ? resume.queue.length : (meta.count || 100);
    const finished = !!(resume && resume.finished);
    const pct = done ? Math.round((hits / done) * 100) : null;
    const tone = done ? aprovaProvaAccTone(pct) : "none";
    const progHtml = (done > 0 || finished)
      ? aprovaProvaProgressHtml({
        done: finished ? total : done,
        total,
        hits,
        pct,
        finished,
        tone
      })
      : "";
    let actions = "";
    if (resume && !finished && done > 0) {
      actions =
        "<div class=\"actions-row\" style=\"margin-top:0.65rem;flex-wrap:wrap;gap:0.5rem\">" +
          "<button type=\"button\" class=\"btn btn-primary\" data-prova-style=\"" + style +
            "\" data-prova-action=\"continue\">Continuar (" + done + "/" + total + ")</button>" +
          "<button type=\"button\" class=\"btn btn-ghost\" data-prova-style=\"" + style +
            "\" data-prova-action=\"restart\">Recomeçar</button>" +
        "</div>";
    } else if (resume && finished) {
      actions =
        "<div class=\"actions-row\" style=\"margin-top:0.65rem;flex-wrap:wrap;gap:0.5rem\">" +
          "<button type=\"button\" class=\"btn btn-primary\" data-prova-style=\"" + style +
            "\" data-prova-action=\"restart\">Fazer de novo</button>" +
          "<button type=\"button\" class=\"btn btn-ghost\" data-prova-style=\"" + style +
            "\" data-prova-action=\"continue\">Ver resultado</button>" +
        "</div>";
    } else {
      actions =
        "<div class=\"actions-row\" style=\"margin-top:0.65rem\">" +
          "<button type=\"button\" class=\"btn btn-primary\" data-prova-style=\"" + style +
            "\" data-prova-action=\"start\">Começar</button>" +
        "</div>";
    }
    return (
      "<article class=\"study-card provas-style-card\" style=\"margin-top:0.75rem\">" +
        "<div class=\"label\">" + title + "</div>" +
        "<p class=\"muted\" style=\"margin:0.35rem 0 0\">" + blurb + "</p>" +
        progHtml +
        actions +
      "</article>"
    );
  }

  root.innerHTML =
    "<div class=\"provas-integra-year-wrap\">" +
      "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"modo\">← Voltar</button>" +
      "<article class=\"study-card\" style=\"margin-top:0.75rem\">" +
        "<div class=\"label\">" + String(family.label) + " · " + year + "</div>" +
        "<p class=\"prompt\" style=\"margin:0.35rem 0 0.35rem\"><strong>" + scopeLabel + "</strong></p>" +
        "<p class=\"muted\" style=\"margin:0\">Escolha o modo. Seu progresso nesta prova fica salvo neste aparelho.</p>" +
      "</article>" +
      styleCard(
        "simulado",
        "Simulado",
        "Cronômetro ligado. Você marca a alternativa sem ver certo/errado na hora — o gabarito e o feedback vêm ao final.",
        resumeSim
      ) +
      styleCard(
        "treino",
        "Treino",
        "Com comentário e pegadinha após cada resposta — ideal para estudar o raciocínio da banca.",
        resumeTreino
      ) +
    "</div>";
}

function aprovaRenderProvasIntegra () {
  aprovaBindProvasIntegra();
  const root = document.getElementById("provas-integra-list");
  if (!root) return;

  const seq = ++aprovaProvasRenderSeq;
  root.innerHTML = "<p class=\"muted\">Carregando…</p>";

  aprovaLoadProvasCatalogData()
    .then((data) => {
      if (seq !== aprovaProvasRenderSeq) return null;
      if (aprovaProvasView.mode === "estilo") {
        aprovaRenderProvasEstilo(root, data);
        return null;
      }
      if (aprovaProvasView.mode === "modo") {
        return aprovaRenderProvasModo(root, data, seq);
      }
      if (aprovaProvasView.mode === "anos" && aprovaProvasView.familyId) {
        aprovaRenderProvasAnos(root, data, aprovaProvasView.familyId);
        return null;
      }
      aprovaRenderProvasFamilias(root, data);
      return null;
    })
    .catch((err) => {
      if (seq !== aprovaProvasRenderSeq) return;
      const detail = err && err.message ? String(err.message) : "";
      root.innerHTML = "<p class=\"muted\">Não foi possível carregar o catálogo de provas." +
        (detail ? (" " + detail) : "") + "</p>";
    });
}

function aprovaOpenProvaQuestionCard () {
  if (typeof aprovaMarkNav === "function") aprovaMarkNav("questoes");
  if (typeof aprovaGoTo === "function") {
    aprovaGoTo("questoes");
  } else if (typeof aprovaShowPanel === "function") {
    aprovaShowPanel("questoes");
  }
  if (typeof aprovaShowQuestionViews === "function") aprovaShowQuestionViews("card");
  if (typeof aprovaRenderQuestion === "function") aprovaRenderQuestion();
}

async function aprovaStartProvaIntegraById (provaId, areaFilter, opts) {
  const options = opts || {};
  const style = String(options.style || "simulado").toLowerCase() === "treino" ? "treino" : "simulado";
  const action = String(options.action || "start");
  try {
    const data = await aprovaLoadProvasCatalogData();
    const meta = (data.provas || []).find((p) => p.id === provaId);
    if (!meta || meta.status !== "ready" || !meta.file) {
      window.alert("Esta prova ainda não está disponível.");
      return;
    }
    const area = String(areaFilter || "").trim().toLowerCase();
    const sessionId = meta.id + (area ? ("-" + area) : "") + "-" + style;
    const title = area
      ? (String(meta.title || "Prova") + " · " + aprovaProvaAreaLabel(area))
      : String(meta.title || (aprovaProvaExamLabel(meta.exam) + " " + meta.year));

    if (typeof AprovaQuestions === "undefined" || typeof AprovaQuestions.startProvaIntegra !== "function") {
      window.alert("Módulo de questões indisponível. Recarregue a página (Ctrl+Shift+R).");
      return;
    }

    const resume = AprovaQuestions.getResumableProva(meta.id, area, style);
    if (action === "continue" && resume) {
      const n = AprovaQuestions.startProvaIntegra(null, {
        id: sessionId,
        packId: meta.id,
        title: resume.provaTitle || title,
        exam: meta.exam,
        year: meta.year,
        familyId: aprovaProvasView.familyId || resume.familyId,
        area,
        style
      }, { resumeSnap: resume });
      if (!n) {
        window.alert("Não foi possível retomar a prova.");
        return;
      }
      if (resume.finished && typeof aprovaRenderSimuladoResult === "function") {
        AprovaQuestions.simulado.finished = true;
        aprovaOpenProvaQuestionCard();
        aprovaRenderSimuladoResult();
        return;
      }
      aprovaOpenProvaQuestionCard();
      return;
    }

    if (action === "restart" && typeof AprovaQuestions.clearSavedProva === "function") {
      AprovaQuestions.clearSavedProva(meta.id, area, style);
    }

    const pack = await aprovaLoadProvaFile(meta.file);
    let questions = aprovaProvasQuestionsFromPack(pack);
    if (area) {
      questions = questions.filter((q) => String((q && q.specialty) || "").toLowerCase() === area);
    }
    if (!questions.length) {
      window.alert(area
        ? ("Não há questões de " + aprovaProvaAreaLabel(area) + " nesta prova.")
        : "A prova está vazia.");
      return;
    }
    const n = AprovaQuestions.startProvaIntegra(questions, {
      id: sessionId,
      packId: meta.id,
      title,
      exam: meta.exam,
      year: meta.year,
      familyId: aprovaProvasView.familyId || "",
      area,
      style
    }, { restart: true });
    if (!n) {
      window.alert("Não foi possível iniciar a prova.");
      return;
    }
    aprovaOpenProvaQuestionCard();
  } catch (e) {
    const msg = e && e.message ? String(e.message) : "";
    window.alert("Falha ao abrir a prova." + (msg ? (" " + msg) : " Tente de novo."));
  }
}

window.aprovaRenderProvasIntegra = aprovaRenderProvasIntegra;
window.aprovaStartProvaIntegraById = aprovaStartProvaIntegraById;
window.aprovaProvasGoAnos = aprovaProvasGoAnos;
window.aprovaProvasGoModo = aprovaProvasGoModo;
window.aprovaProvasGoEstilo = aprovaProvasGoEstilo;
window.aprovaProvasBack = aprovaProvasBack;
window.aprovaReturnToProvaHub = aprovaReturnToProvaHub;

function aprovaProvasBootBind () {
  aprovaBindProvasIntegra();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aprovaProvasBootBind);
} else {
  aprovaProvasBootBind();
}
