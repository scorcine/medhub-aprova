/* Revisões direcionadas a provas R1 */

const APROVA_REVISAO_MODULES = {
  neonatologia: {
    label: "Neonatologia",
    file: "data/revisao-neonatologia.json?v=20260718t",
    specialty: "pediatria"
  },
  alimentacao: {
    label: "Alimentação",
    file: "data/revisao-alimentacao.json?v=20260718t",
    specialty: "pediatria"
  },
  "avaliacao-nutricional": {
    label: "Avaliação nutricional",
    file: "data/revisao-avaliacao-nutricional.json?v=20260718t",
    specialty: "pediatria"
  },
  imunizacoes: {
    label: "Imunizações",
    file: "data/revisao-imunizacoes.json?v=20260718t",
    specialty: "pediatria"
  },
  diabetes: {
    label: "Diabetes",
    file: "data/revisao-diabetes.json?v=20260718t",
    specialty: "pediatria"
  },
  ped6: {
    label: "Nefro / Infecto / Cardio",
    file: "data/revisao-ped6.json?v=20260718t",
    specialty: "pediatria"
  },
  respiratorio: {
    label: "Respiratório",
    file: "data/revisao-respiratorio.json?v=20260718t",
    specialty: "pediatria"
  },
  "gastro-neuro": {
    label: "Gastro / Neuro",
    file: "data/revisao-gastro-neuro.json?v=20260718t",
    specialty: "pediatria"
  },
  "nefro-extra": {
    label: "Nefro (SN / GNA)",
    file: "data/revisao-nefro-extra.json?v=20260718t",
    specialty: "pediatria"
  },
  "r1-extra": {
    label: "Dengue / Hemato / Orto",
    file: "data/revisao-r1-extra.json?v=20260718t",
    specialty: "pediatria"
  },
  "r1-lacunas": {
    label: "Cirurgia / Alergia / Abuso",
    file: "data/revisao-r1-lacunas.json?v=20260718t",
    specialty: "pediatria"
  },
  ginecologia: {
    label: "Ginecologia",
    file: "data/revisao-ginecologia.json?v=20260718ag",
    specialty: "go"
  },
  obstetricia: {
    label: "Obstetrícia",
    file: "data/revisao-obstetricia.json?v=20260718ag",
    specialty: "go"
  }
};

const AprovaRevisao = {
  cache: {},
  activeModuleId: "neonatologia",
  activeProfileId: "geral",

  async loadModule (moduleId) {
    const id = moduleId || this.activeModuleId || "neonatologia";
    if (this.cache[id]) return this.cache[id];
    const meta = APROVA_REVISAO_MODULES[id];
    if (!meta) {
      this.cache[id] = null;
      return null;
    }
    try {
      const res = await fetch(meta.file);
      if (!res.ok) throw new Error("fail");
      this.cache[id] = await res.json();
      return this.cache[id];
    } catch {
      this.cache[id] = null;
      return null;
    }
  },

  async loadNeonatologia () {
    return this.loadModule("neonatologia");
  },

  moduleSpecialty (moduleId) {
    const meta = APROVA_REVISAO_MODULES[moduleId];
    return (meta && meta.specialty) || "pediatria";
  },

  listModules (specialty) {
    return Object.keys(APROVA_REVISAO_MODULES)
      .filter(id => {
        if (!specialty) return true;
        return this.moduleSpecialty(id) === specialty;
      })
      .map(id => ({
        id,
        label: APROVA_REVISAO_MODULES[id].label,
        specialty: this.moduleSpecialty(id)
      }));
  },

  setActiveModule (id) {
    this.activeModuleId = APROVA_REVISAO_MODULES[id] ? id : "neonatologia";
  },

  async getProfiles (moduleId) {
    const data = await this.loadModule(moduleId || this.activeModuleId);
    return data && Array.isArray(data.profiles) ? data.profiles : [];
  },

  async getProfile (id, moduleId) {
    const profiles = await this.getProfiles(moduleId || this.activeModuleId);
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

async function aprovaRenderRevisaoNeo (profileId, moduleId) {
  const root = document.getElementById("revisao-neo-root");
  const titleEl = document.getElementById("rev-neo-title");
  const subEl = document.getElementById("rev-neo-sub");
  if (!root) return;

  const mid = moduleId || AprovaRevisao.activeModuleId || "neonatologia";
  AprovaRevisao.setActiveModule(mid);
  const moduleSpec = AprovaRevisao.moduleSpecialty(mid);
  const moduleLabel = (APROVA_REVISAO_MODULES[mid] && APROVA_REVISAO_MODULES[mid].label) ||
    (moduleSpec === "go" ? "Ginecologia" : "Pediatria");

  root.innerHTML = "<p class=\"muted\">Carregando revisão…</p>";
  const data = await AprovaRevisao.loadModule(mid);
  if (!data) {
    root.innerHTML = "<p class=\"muted\">Não foi possível carregar a revisão.</p>";
    return;
  }

  const pid = profileId || AprovaRevisao.activeProfileId || "geral";
  AprovaRevisao.setActiveProfile(pid);
  const profile = await AprovaRevisao.getProfile(pid, mid);
  if (!profile) {
    root.innerHTML = "<p class=\"muted\">Perfil de prova não encontrado.</p>";
    return;
  }

  if (titleEl) titleEl.textContent = moduleLabel + " · " + profile.label;
  if (subEl) {
    subEl.textContent = profile.id === "geral"
      ? "Estatística geral das principais provas R1."
      : ("Foco em " + profile.label + " — " + profile.estilo);
  }

  const priorities = (profile.priorities || []).map(p => {
    const pct = Number(p.pct != null ? p.pct : p.score);
    const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    const label = Number.isFinite(pct)
      ? pct.toLocaleString("pt-BR", {
        minimumFractionDigits: Number.isInteger(pct) ? 0 : 1,
        maximumFractionDigits: 1
      }) + "%"
      : "—";
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + aprovaEscapeHtml(p.tema) + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
        "<em>" + label + "</em>" +
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

  const list = items => (items || []).map(t => "<li>" + aprovaEscapeHtml(t) + "</li>").join("");

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
      "<button type=\"button\" class=\"btn btn-primary\" id=\"rev-open-ped\">Voltar aos subtemas</button>" +
    "</div>";

  document.getElementById("rev-open-ped")?.addEventListener("click", () => {
    const activeId = AprovaRevisao.activeModuleId;
    const spec = activeId ? AprovaRevisao.moduleSpecialty(activeId) : "pediatria";
    if (spec === "go") {
      if (typeof aprovaOpenGinecologiaModule === "function" && activeId) {
        aprovaOpenGinecologiaModule(activeId);
        return;
      }
      if (typeof aprovaOpenGinecologia === "function") aprovaOpenGinecologia();
      return;
    }
    if (typeof aprovaOpenPediatriaModule === "function" && activeId) {
      aprovaOpenPediatriaModule(activeId);
      return;
    }
    if (typeof aprovaOpenPediatria === "function") aprovaOpenPediatria();
  });
}
