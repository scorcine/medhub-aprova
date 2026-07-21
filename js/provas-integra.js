/* Prova na íntegra — banca → ano → íntegra ou grande área */

const APROVA_PROVAS_CATALOG_URL = "data/provas/catalog.json";
const APROVA_PROVAS_CACHE_VER = "20260721enare6";

const APROVA_PROVAS_AREA_ORDER = ["clinica", "cirurgia", "pediatria", "go", "preventiva"];
const APROVA_PROVAS_AREA_LABELS = {
  clinica: "Clínica médica",
  cirurgia: "Cirurgia",
  pediatria: "Pediatria",
  go: "Ginecologia e obstetrícia",
  preventiva: "Preventiva"
};

let aprovaProvasCatalogData = null;
let aprovaProvasBound = false;
let aprovaProvasPackCache = Object.create(null);
let aprovaProvasRenderSeq = 0;
let aprovaProvasView = {
  mode: "familias", // familias | anos | modo
  familyId: null,
  year: null,
  packId: null
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
  aprovaProvasView = { mode: "familias", familyId: null, year: null, packId: null };
  aprovaRenderProvasIntegra();
}

function aprovaProvasGoAnos (familyId) {
  const id = String(familyId || "").trim();
  if (!id) return;
  aprovaProvasView = { mode: "anos", familyId: id, year: null, packId: null };
  aprovaRenderProvasIntegra();
}

function aprovaProvasGoModo (familyId, year) {
  const id = String(familyId || "").trim();
  const y = Number(year);
  if (!id || !Number.isFinite(y)) return;
  aprovaProvasView = { mode: "modo", familyId: id, year: y, packId: null };
  aprovaRenderProvasIntegra();
}

function aprovaProvasBack () {
  if (aprovaProvasView.mode === "modo") {
    aprovaProvasView.mode = "anos";
    aprovaProvasView.packId = null;
    aprovaRenderProvasIntegra();
    return;
  }
  aprovaProvasGoFamilias();
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
      if (to === "anos") {
        aprovaProvasView.mode = "anos";
        aprovaProvasView.packId = null;
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

    const startBtn = el.closest("[data-prova-start]");
    if (startBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (startBtn.disabled) return;
      const packId = startBtn.getAttribute("data-prova-start");
      const area = startBtn.getAttribute("data-prova-area") || "";
      if (packId) aprovaStartProvaIntegraById(packId, area || null);
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

    const byArea = aprovaProvasCountByArea(questions);
    const areas = APROVA_PROVAS_AREA_ORDER
      .filter((id) => (byArea[id] || 0) > 0)
      .concat(Object.keys(byArea).filter((id) => APROVA_PROVAS_AREA_ORDER.indexOf(id) < 0 && byArea[id] > 0));

    const areaBtns = areas.map((id) => {
      const n = byArea[id] || 0;
      return (
        "<button type=\"button\" class=\"provas-area-chip\" data-prova-start=\"" +
          String(meta.id) + "\" data-prova-area=\"" + id + "\">" +
          "<span class=\"provas-area-chip-label\">" + aprovaProvaAreaLabel(id) + "</span>" +
          "<span class=\"provas-area-chip-count\">" + n + " questões</span>" +
        "</button>"
      );
    }).join("");

    root.innerHTML =
      "<div class=\"provas-integra-year-wrap\">" +
        "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back=\"anos\">← Voltar</button>" +
        "<article class=\"study-card\" style=\"margin-top:0.75rem\">" +
          "<div class=\"label\">" + String(family.label) + " · " + year + "</div>" +
          "<p class=\"prompt\" style=\"margin:0.35rem 0 0.55rem\"><strong>Como deseja fazer?</strong></p>" +
          "<p class=\"muted\" style=\"margin:0 0 0.85rem\">Prova completa na ordem da banca, ou um recorte por grande área.</p>" +
          "<div class=\"actions-row\" style=\"margin-bottom:1rem\">" +
            "<button type=\"button\" class=\"btn btn-primary\" data-prova-start=\"" +
              String(meta.id) + "\" data-prova-area=\"\">Prova na íntegra (" + total + ")</button>" +
          "</div>" +
          "<div class=\"label\" style=\"margin-bottom:0.35rem\">Por grande área</div>" +
          "<p class=\"muted\" style=\"margin:0 0 0.65rem;font-size:0.85rem\">Classificação automática MedHub R1 (aproximada). A prova na íntegra mantém a ordem oficial.</p>" +
          "<div class=\"provas-area-grid\">" + areaBtns + "</div>" +
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

function aprovaRenderProvasIntegra () {
  aprovaBindProvasIntegra();
  const root = document.getElementById("provas-integra-list");
  if (!root) return;

  const seq = ++aprovaProvasRenderSeq;
  root.innerHTML = "<p class=\"muted\">Carregando…</p>";

  aprovaLoadProvasCatalogData()
    .then((data) => {
      if (seq !== aprovaProvasRenderSeq) return null;
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

async function aprovaStartProvaIntegraById (provaId, areaFilter) {
  try {
    const data = await aprovaLoadProvasCatalogData();
    const meta = (data.provas || []).find((p) => p.id === provaId);
    if (!meta || meta.status !== "ready" || !meta.file) {
      window.alert("Esta prova ainda não está disponível.");
      return;
    }
    const pack = await aprovaLoadProvaFile(meta.file);
    let questions = aprovaProvasQuestionsFromPack(pack);
    const area = String(areaFilter || "").trim().toLowerCase();
    if (area) {
      questions = questions.filter((q) => String((q && q.specialty) || "").toLowerCase() === area);
    }
    if (!questions.length) {
      window.alert(area
        ? ("Não há questões de " + aprovaProvaAreaLabel(area) + " nesta prova.")
        : "A prova está vazia.");
      return;
    }
    if (typeof AprovaQuestions === "undefined" || typeof AprovaQuestions.startProvaIntegra !== "function") {
      window.alert("Módulo de questões indisponível. Recarregue a página (Ctrl+Shift+R).");
      return;
    }
    const title = area
      ? (String(meta.title || "Prova") + " · " + aprovaProvaAreaLabel(area))
      : String(meta.title || (aprovaProvaExamLabel(meta.exam) + " " + meta.year));
    const n = AprovaQuestions.startProvaIntegra(questions, {
      id: meta.id + (area ? ("-" + area) : ""),
      title,
      exam: meta.exam,
      year: meta.year
    });
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
window.aprovaProvasBack = aprovaProvasBack;

function aprovaProvasBootBind () {
  aprovaBindProvasIntegra();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aprovaProvasBootBind);
} else {
  aprovaProvasBootBind();
}
