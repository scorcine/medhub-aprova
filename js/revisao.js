/* Revisões direcionadas a provas R1 */

const AprovaRevisao = {
  neo: null,
  activeProfileId: "geral",

  async loadNeonatologia () {
    if (this.neo) return this.neo;
    try {
      const res = await fetch("data/revisao-neonatologia.json?v=20260718e");
      if (!res.ok) throw new Error("fail");
      this.neo = await res.json();
      return this.neo;
    } catch {
      this.neo = null;
      return null;
    }
  },

  async getProfiles () {
    const data = await this.loadNeonatologia();
    return data && Array.isArray(data.profiles) ? data.profiles : [];
  },

  async getProfile (id) {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === id) || profiles[0] || null;
  },

  setActiveProfile (id) {
    this.activeProfileId = id || "geral";
  }
};

function aprovaEscapeHtml (str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function aprovaYieldClass (yieldLabel) {
  if (yieldLabel === "Máximo") return "max";
  if (yieldLabel === "Alto") return "high";
  if (yieldLabel === "Médio-alto") return "mid";
  return "low";
}

async function aprovaRenderRevisaoNeo (profileId) {
  const root = document.getElementById("revisao-neo-root");
  const titleEl = document.getElementById("rev-neo-title");
  const subEl = document.getElementById("rev-neo-sub");
  if (!root) return;

  root.innerHTML = "<p class=\"muted\">Carregando revisão…</p>";
  const data = await AprovaRevisao.loadNeonatologia();
  if (!data) {
    root.innerHTML = "<p class=\"muted\">Não foi possível carregar a revisão.</p>";
    return;
  }

  const pid = profileId || AprovaRevisao.activeProfileId || "geral";
  AprovaRevisao.setActiveProfile(pid);
  const profile = await AprovaRevisao.getProfile(pid);
  if (!profile) {
    root.innerHTML = "<p class=\"muted\">Perfil de prova não encontrado.</p>";
    return;
  }

  if (titleEl) titleEl.textContent = "Neonatologia · " + profile.label;
  if (subEl) {
    subEl.textContent = profile.id === "geral"
      ? "Estatística geral das principais provas R1."
      : ("Foco em " + profile.label + " — " + profile.estilo);
  }

  const maxScore = Math.max(...profile.priorities.map(p => p.score), 1);
  const priorities = profile.priorities.map(p => {
    const pct = Math.round((p.score / maxScore) * 100);
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + aprovaEscapeHtml(p.tema) + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + pct + "%\"></i></div>" +
        "<em>" + p.score + "</em>" +
      "</div>"
    );
  }).join("");

  const checklist = (profile.checklist || []).map(key => {
    const item = data.checklistItems[key];
    if (!item) return "";
    return (
      "<article class=\"rev-item\">" +
        "<div class=\"rev-item-head\">" +
          "<strong>" + aprovaEscapeHtml(item.tema) + "</strong>" +
          "<span class=\"rev-yield rev-yield--" + aprovaYieldClass(item.yield) + "\">" +
            aprovaEscapeHtml(item.yield) +
          "</span>" +
        "</div>" +
        "<p>" + aprovaEscapeHtml(item.pegar) + "</p>" +
      "</article>"
    );
  }).join("");

  const list = items => items.map(t => "<li>" + aprovaEscapeHtml(t) + "</li>").join("");

  const sessoes = (profile.sessoes || []).map(s => (
    "<article class=\"rev-session\">" +
      "<strong>" + aprovaEscapeHtml(s.titulo) + "</strong>" +
      "<p>" + aprovaEscapeHtml(s.texto) + "</p>" +
    "</article>"
  )).join("");

  root.innerHTML =
    "<div class=\"rev-callout\">" +
      "<strong>" + aprovaEscapeHtml(profile.label) + "</strong> — " +
      aprovaEscapeHtml(profile.verdict) +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Foco desta prova</div>" +
      "<p class=\"rev-focus-line\"><strong>Conteúdo:</strong> " + aprovaEscapeHtml(profile.foco) + "</p>" +
      "<p class=\"rev-focus-line\"><strong>Estilo:</strong> " + aprovaEscapeHtml(profile.estilo) + "</p>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Prioridade relativa</div>" +
      "<div class=\"rev-bars\">" + priorities + "</div>" +
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

    "<div class=\"rev-callout rev-callout--warn\">" + aprovaEscapeHtml(profile.lacuna) + "</div>" +

    "<div class=\"actions-row\" style=\"margin-top:1rem\">" +
      "<button type=\"button\" class=\"btn btn-primary\" id=\"rev-open-ped\">Estudar pelos subtemas</button>" +
      "<button type=\"button\" class=\"btn btn-ghost\" id=\"rev-change-focus\">Trocar prova</button>" +
    "</div>";

  document.getElementById("rev-open-ped")?.addEventListener("click", () => {
    if (typeof aprovaOpenPediatriaStudy === "function") {
      aprovaOpenPediatriaStudy(AprovaRevisao.activeProfileId);
    }
  });

  document.getElementById("rev-change-focus")?.addEventListener("click", () => {
    if (typeof aprovaOpenPediatriaFocus === "function") aprovaOpenPediatriaFocus();
  });
}
