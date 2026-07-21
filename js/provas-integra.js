/* Prova na íntegra — catálogo por banca/ano + início de simulado ordenado */

const APROVA_PROVAS_CATALOG_URL = "data/provas/catalog.json";
const APROVA_PROVAS_CACHE_VER = "20260721prova3";

let aprovaProvasCatalog = null;
let aprovaProvasBound = false;

function aprovaProvaExamLabel (examId) {
  const id = String(examId || "").toLowerCase();
  if (typeof APROVA_TARGET_EXAMS !== "undefined") {
    const hit = APROVA_TARGET_EXAMS.find((e) => e.id === id);
    if (hit) return hit.label;
  }
  return id ? id.toUpperCase() : "Banca";
}

function aprovaProvaSpecialtyLabel (specialty) {
  const map = {
    clinica: "Clínica médica",
    cirurgia: "Cirurgia",
    pediatria: "Pediatria",
    go: "GO",
    preventiva: "Preventiva",
    mista: "Mista"
  };
  return map[String(specialty || "").toLowerCase()] || specialty || "Geral";
}

async function aprovaLoadProvasCatalog () {
  if (aprovaProvasCatalog) return aprovaProvasCatalog;
  const url = APROVA_PROVAS_CATALOG_URL + "?v=" + APROVA_PROVAS_CACHE_VER;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Catálogo de provas indisponível");
  const data = await res.json();
  aprovaProvasCatalog = Array.isArray(data) ? data : (data.provas || []);
  return aprovaProvasCatalog;
}

async function aprovaLoadProvaFile (file) {
  const url = String(file || "") + (String(file).indexOf("?") >= 0 ? "&" : "?") + "v=" + APROVA_PROVAS_CACHE_VER;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Arquivo da prova não encontrado");
  return res.json();
}

function aprovaBindProvasIntegra () {
  if (aprovaProvasBound) return;
  aprovaProvasBound = true;
  const list = document.getElementById("provas-integra-list");
  if (!list) return;
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-prova-start]");
    if (!btn) return;
    const id = btn.getAttribute("data-prova-start");
    if (id) aprovaStartProvaIntegraById(id);
  });
}

function aprovaRenderProvasIntegra () {
  aprovaBindProvasIntegra();
  const root = document.getElementById("provas-integra-list");
  if (!root) return;
  root.innerHTML = "<p class=\"muted\">Carregando provas…</p>";

  aprovaLoadProvasCatalog()
    .then((provas) => {
      if (!provas.length) {
        root.innerHTML =
          "<div class=\"study-card\">" +
            "<div class=\"label\">Em montagem</div>" +
            "<p class=\"prompt\">Nenhuma prova publicada ainda. Vamos montar do zero com critério (banca, ano, reescrita e espelho no treino).</p>" +
          "</div>";
        return;
      }
      root.innerHTML = provas.map((p) => {
        const exam = aprovaProvaExamLabel(p.exam);
        const year = p.year != null ? String(p.year) : "—";
        const area = aprovaProvaSpecialtyLabel(p.specialty);
        const n = p.count != null ? p.count : "?";
        const status = p.status === "ready" ? "Disponível" : "Em breve";
        const disabled = p.status !== "ready" ? " disabled" : "";
        return (
          "<article class=\"study-card provas-integra-card\">" +
            "<div class=\"label\">" + exam + " · " + year + "</div>" +
            "<p class=\"prompt\" style=\"margin:0.35rem 0 0.55rem\"><strong>" +
              String(p.title || "Prova") +
            "</strong></p>" +
            "<p class=\"muted\" style=\"margin:0 0 0.85rem\">" +
              area + " · " + n + " questões · " + status +
              (p.blurb ? (" · " + String(p.blurb)) : "") +
            "</p>" +
            "<div class=\"actions-row\">" +
              "<button type=\"button\" class=\"btn btn-primary\" data-prova-start=\"" +
                String(p.id) + "\"" + disabled + ">Iniciar prova</button>" +
            "</div>" +
          "</article>"
        );
      }).join("");
    })
    .catch(() => {
      root.innerHTML = "<p class=\"muted\">Não foi possível carregar o catálogo de provas.</p>";
    });
}

async function aprovaStartProvaIntegraById (provaId) {
  try {
    const catalog = await aprovaLoadProvasCatalog();
    const meta = catalog.find((p) => p.id === provaId);
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
      title: meta.title,
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
