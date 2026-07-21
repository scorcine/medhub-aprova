/* Prova na íntegra — banca → ano → prova */

const APROVA_PROVAS_CATALOG_URL = "data/provas/catalog.json";
const APROVA_PROVAS_CACHE_VER = "20260721enare2";

let aprovaProvasCatalogData = null;
let aprovaProvasBound = false;
let aprovaProvasView = { mode: "familias", familyId: null };

function aprovaProvaExamLabel (examId) {
  const id = String(examId || "").toLowerCase();
  if (typeof APROVA_TARGET_EXAMS !== "undefined") {
    const hit = APROVA_TARGET_EXAMS.find((e) => e.id === id);
    if (hit) return hit.label;
  }
  return id ? id.toUpperCase() : "Banca";
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
  const url = String(file || "") + (String(file).indexOf("?") >= 0 ? "&" : "?") + "v=" + APROVA_PROVAS_CACHE_VER;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Arquivo da prova não encontrado");
  return res.json();
}

function aprovaProvasFindFamily (familyId, data) {
  return (data.familias || []).find((f) => f.id === familyId) || null;
}

/** Prova ready para a família + ano (bate em qualquer examId da família). */
function aprovaProvasFindPack (family, year, data) {
  const exams = new Set((family.examIds || []).map((e) => String(e).toLowerCase()));
  const y = Number(year);
  return (data.provas || []).find((p) => {
    if (!p || p.status !== "ready" || !p.file) return false;
    if (Number(p.year) !== y) return false;
    return exams.has(String(p.exam || "").toLowerCase());
  }) || null;
}

function aprovaBindProvasIntegra () {
  if (aprovaProvasBound) return;
  aprovaProvasBound = true;
  const list = document.getElementById("provas-integra-list");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const back = e.target.closest("[data-prova-back]");
    if (back) {
      aprovaProvasView = { mode: "familias", familyId: null };
      aprovaRenderProvasIntegra();
      return;
    }

    const familyBtn = e.target.closest("[data-prova-family]");
    if (familyBtn) {
      const id = familyBtn.getAttribute("data-prova-family");
      if (!id) return;
      aprovaProvasView = { mode: "anos", familyId: id };
      aprovaRenderProvasIntegra();
      return;
    }

    const yearBtn = e.target.closest("[data-prova-year]");
    if (yearBtn) {
      if (yearBtn.disabled) return;
      const year = yearBtn.getAttribute("data-prova-year");
      const familyId = yearBtn.getAttribute("data-prova-family");
      if (year && familyId) aprovaStartProvaIntegraByFamilyYear(familyId, year);
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
    aprovaProvasView = { mode: "familias", familyId: null };
    aprovaRenderProvasFamilias(root, data);
    return;
  }

  const years = Array.isArray(family.years) ? family.years.slice() : [];
  years.sort((a, b) => b - a);

  const chips = years.map((y) => {
    const pack = aprovaProvasFindPack(family, y, data);
    const ready = !!pack;
    const title = ready
      ? ("Iniciar " + String(family.label) + " " + y)
      : (String(family.label) + " " + y + " — em breve");
    return (
      "<button type=\"button\" class=\"provas-year-chip" + (ready ? " is-ready" : "") + "\"" +
        " data-prova-year=\"" + y + "\"" +
        " data-prova-family=\"" + String(family.id) + "\"" +
        (ready ? "" : " disabled") +
        " title=\"" + title + "\">" +
        "<span class=\"provas-year-chip-year\">" + y + "</span>" +
        "<span class=\"provas-year-chip-status\">" + (ready ? "Disponível" : "Em breve") + "</span>" +
      "</button>"
    );
  }).join("");

  root.innerHTML =
    "<div class=\"provas-integra-year-wrap\">" +
      "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-prova-back>← Voltar</button>" +
      "<article class=\"study-card\" style=\"margin-top:0.75rem\">" +
        "<div class=\"label\">" + String(family.label) + "</div>" +
        "<p class=\"prompt\" style=\"margin:0.35rem 0 0.85rem\"><strong>Escolha o ano</strong></p>" +
        "<p class=\"muted\" style=\"margin:0 0 0.85rem\">De 2021 a 2026. Anos sem conteúdo ficam como “Em breve”.</p>" +
        "<div class=\"provas-year-grid\" role=\"list\">" + chips + "</div>" +
      "</article>" +
    "</div>";
}

function aprovaRenderProvasIntegra () {
  aprovaBindProvasIntegra();
  const root = document.getElementById("provas-integra-list");
  if (!root) return;
  root.innerHTML = "<p class=\"muted\">Carregando…</p>";

  aprovaLoadProvasCatalogData()
    .then((data) => {
      if (aprovaProvasView.mode === "anos" && aprovaProvasView.familyId) {
        aprovaRenderProvasAnos(root, data, aprovaProvasView.familyId);
      } else {
        aprovaRenderProvasFamilias(root, data);
      }
    })
    .catch(() => {
      root.innerHTML = "<p class=\"muted\">Não foi possível carregar o catálogo de provas.</p>";
    });
}

async function aprovaStartProvaIntegraByFamilyYear (familyId, year) {
  try {
    const data = await aprovaLoadProvasCatalogData();
    const family = aprovaProvasFindFamily(familyId, data);
    if (!family) {
      window.alert("Banca não encontrada.");
      return;
    }
    const meta = aprovaProvasFindPack(family, year, data);
    if (!meta) {
      window.alert("A prova de " + year + " ainda está em montagem.");
      return;
    }
    await aprovaStartProvaIntegraById(meta.id);
  } catch (e) {
    window.alert("Falha ao abrir a prova. Tente de novo.");
  }
}

async function aprovaStartProvaIntegraById (provaId) {
  try {
    const data = await aprovaLoadProvasCatalogData();
    const meta = (data.provas || []).find((p) => p.id === provaId);
    if (!meta || meta.status !== "ready" || !meta.file) {
      window.alert("Esta prova ainda não está disponível.");
      return;
    }
    const pack = await aprovaLoadProvaFile(meta.file);
    const questions = Array.isArray(pack)
      ? pack
      : (pack && Array.isArray(pack.questions) ? pack.questions : []);
    if (!questions.length) {
      window.alert("A prova está vazia.");
      return;
    }
    if (typeof AprovaQuestions === "undefined" || typeof AprovaQuestions.startProvaIntegra !== "function") {
      window.alert("Módulo de questões indisponível.");
      return;
    }
    const n = AprovaQuestions.startProvaIntegra(questions, {
      id: meta.id,
      title: meta.title || (aprovaProvaExamLabel(meta.exam) + " " + meta.year),
      exam: meta.exam,
      year: meta.year
    });
    if (!n) {
      window.alert("Não foi possível iniciar a prova.");
      return;
    }
    if (typeof aprovaGoTo === "function") aprovaGoTo("questoes");
    else if (typeof aprovaShowPanel === "function") aprovaShowPanel("questoes");
    if (typeof aprovaShowQuestionViews === "function") aprovaShowQuestionViews("card");
    if (typeof aprovaRenderQuestion === "function") aprovaRenderQuestion();
  } catch (e) {
    window.alert("Falha ao abrir a prova. Tente de novo.");
  }
}

window.aprovaRenderProvasIntegra = aprovaRenderProvasIntegra;
window.aprovaStartProvaIntegraById = aprovaStartProvaIntegraById;

document.addEventListener("DOMContentLoaded", () => {
  aprovaBindProvasIntegra();
});
