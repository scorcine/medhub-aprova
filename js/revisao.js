/* Revisões direcionadas a provas R1 */

const AprovaRevisao = {
  neo: null,

  async loadNeonatologia () {
    if (this.neo) return this.neo;
    try {
      const res = await fetch("data/revisao-neonatologia.json?v=20260718c");
      if (!res.ok) throw new Error("fail");
      this.neo = await res.json();
      return this.neo;
    } catch {
      this.neo = null;
      return null;
    }
  }
};

function aprovaEscapeHtml (str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function aprovaRenderRevisaoNeo () {
  const root = document.getElementById("revisao-neo-root");
  if (!root) return;

  root.innerHTML = "<p class=\"muted\">Carregando revisão…</p>";
  const data = await AprovaRevisao.loadNeonatologia();
  if (!data) {
    root.innerHTML = "<p class=\"muted\">Não foi possível carregar a revisão.</p>";
    return;
  }

  const maxScore = Math.max(...data.priorities.map(p => p.score), 1);

  const priorities = data.priorities.map(p => {
    const pct = Math.round((p.score / maxScore) * 100);
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + aprovaEscapeHtml(p.tema) + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + pct + "%\"></i></div>" +
        "<em>" + p.score + "</em>" +
      "</div>"
    );
  }).join("");

  const bancas = data.bancas.map(b => (
    "<tr>" +
      "<td><strong>" + aprovaEscapeHtml(b.banca) + "</strong></td>" +
      "<td>" + aprovaEscapeHtml(b.foco) + "</td>" +
      "<td>" + aprovaEscapeHtml(b.estilo) + "</td>" +
    "</tr>"
  )).join("");

  const checklist = data.checklist.map(item => (
    "<article class=\"rev-item\">" +
      "<div class=\"rev-item-head\">" +
        "<strong>" + aprovaEscapeHtml(item.tema) + "</strong>" +
        "<span class=\"rev-yield rev-yield--" + aprovaYieldClass(item.yield) + "\">" +
          aprovaEscapeHtml(item.yield) +
        "</span>" +
      "</div>" +
      "<p>" + aprovaEscapeHtml(item.pegar) + "</p>" +
      "<p class=\"muted\">Bancas: " + aprovaEscapeHtml(item.bancas) + "</p>" +
    "</article>"
  )).join("");

  const list = items => items.map(t => "<li>" + aprovaEscapeHtml(t) + "</li>").join("");

  const sessoes = data.sessoes.map(s => (
    "<article class=\"rev-session\">" +
      "<strong>" + aprovaEscapeHtml(s.titulo) + "</strong>" +
      "<p>" + aprovaEscapeHtml(s.texto) + "</p>" +
    "</article>"
  )).join("");

  root.innerHTML =
    "<div class=\"rev-callout\">" + aprovaEscapeHtml(data.verdict) + "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Prioridade relativa</div>" +
      "<div class=\"rev-bars\">" + priorities + "</div>" +
      "<p class=\"muted rev-note\">Escala 0–100 (síntese de incidências públicas + padrão das bancas).</p>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">O que cada banca costuma pedir</div>" +
      "<div class=\"rev-table-wrap\">" +
        "<table class=\"rev-table\">" +
          "<thead><tr><th>Banca</th><th>Foco</th><th>Estilo</th></tr></thead>" +
          "<tbody>" + bancas + "</tbody>" +
        "</table>" +
      "</div>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Checklist — o que decorar</div>" +
      "<div class=\"rev-checklist\">" + checklist + "</div>" +
    "</div>" +

    "<div class=\"rev-two\">" +
      "<div class=\"study-card rev-block\">" +
        "<div class=\"label\">Números que caem</div>" +
        "<ul class=\"rev-list\">" + list(data.numeros) + "</ul>" +
      "</div>" +
      "<div class=\"study-card rev-block\">" +
        "<div class=\"label\">Pegadinhas clássicas</div>" +
        "<ul class=\"rev-list\">" + list(data.pegadinhas) + "</ul>" +
      "</div>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Baixo ROI nesta apostila</div>" +
      "<ul class=\"rev-list\">" + list(data.baixoRoi) + "</ul>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Plano em 3 sessões</div>" +
      "<div class=\"rev-sessions\">" + sessoes + "</div>" +
    "</div>" +

    "<div class=\"rev-callout rev-callout--warn\">" + aprovaEscapeHtml(data.lacuna) + "</div>" +

    "<div class=\"actions-row\" style=\"margin-top:1rem\">" +
      "<button type=\"button\" class=\"btn btn-primary\" data-goto=\"especialidades\" id=\"rev-open-ped\">Abrir decks de Pediatria</button>" +
      "<button type=\"button\" class=\"btn btn-ghost\" data-goto=\"flashcards\">Ir aos flashcards</button>" +
    "</div>";

  document.getElementById("rev-open-ped")?.addEventListener("click", () => {
    aprovaGoTo("especialidades");
    aprovaOpenSpecialty("pediatria");
  });

  root.querySelectorAll("[data-goto]").forEach(btn => {
    if (btn.id === "rev-open-ped") return;
    btn.addEventListener("click", () => aprovaGoTo(btn.dataset.goto));
  });
}

function aprovaYieldClass (yieldLabel) {
  if (yieldLabel === "Máximo") return "max";
  if (yieldLabel === "Alto") return "high";
  if (yieldLabel === "Médio-alto") return "mid";
  return "low";
}
