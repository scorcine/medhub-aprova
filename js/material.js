/* Material de apoio — resumos e esquemas por grande área */

const AprovaMaterial = {
  url: "/data/material.json?v=20260803mat5",
  data: null,
  loading: null,
  areaId: null,
  itemId: null,

  async load () {
    if (this.data) return this.data;
    if (this.loading) return this.loading;
    this.loading = fetch(this.url)
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar material");
        return r.json();
      })
      .then((json) => {
        this.data = json;
        this.loading = null;
        return json;
      })
      .catch((err) => {
        this.loading = null;
        throw err;
      });
    return this.loading;
  },

  areaLabel (areaId) {
    const map = {
      clinica: "Clínica médica",
      cirurgia: "Cirurgia",
      preventiva: "Preventiva",
      pediatria: "Pediatria",
      go: "Ginecologia e obstetrícia"
    };
    return map[areaId] || areaId;
  },

  listByArea (areaId) {
    const cat = (this.data && this.data.catalog) || [];
    return cat.filter((m) => m.area === areaId);
  },

  getItem (id) {
    if (!this.data || !this.data.items) return null;
    return this.data.items[id] || null;
  }
};

function aprovaEscapeMaterialHtml (s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function aprovaMaterialSectionHtml (section) {
  const esc = aprovaEscapeMaterialHtml;
  const type = section && section.type;

  if (type === "figure") {
    let src = String(section.src || "");
    if (src && src.charAt(0) !== "/" && !/^https?:/i.test(src)) {
      src = "/" + src.replace(/^\.\//, "");
    }
    return (
      "<figure class=\"material-figure\">" +
        "<img src=\"" + esc(src) + "\" alt=\"" + esc(section.caption || "Esquema") + "\" loading=\"lazy\">" +
        (section.caption ? "<figcaption>" + esc(section.caption) + "</figcaption>" : "") +
      "</figure>"
    );
  }

  if (type === "bullets") {
    const items = (section.items || []).map((it) => "<li>" + esc(it) + "</li>").join("");
    return (
      "<section class=\"material-block\">" +
        (section.title ? "<h4 class=\"material-block-title\">" + esc(section.title) + "</h4>" : "") +
        "<ul class=\"material-list\">" + items + "</ul>" +
      "</section>"
    );
  }

  if (type === "callout") {
    const tone = section.tone === "alert" || section.tone === "tip" || section.tone === "remember"
      ? section.tone
      : "tip";
    return (
      "<aside class=\"material-callout material-callout--" + tone + "\">" +
        (section.title ? "<strong>" + esc(section.title) + "</strong>" : "") +
        "<p>" + esc(section.body) + "</p>" +
      "</aside>"
    );
  }

  if (type === "table") {
    const headers = (section.headers || [])
      .map((h) => "<th>" + esc(h) + "</th>")
      .join("");
    const rows = (section.rows || [])
      .map((row) => "<tr>" + row.map((cell) => "<td>" + esc(cell) + "</td>").join("") + "</tr>")
      .join("");
    return (
      "<section class=\"material-block\">" +
        (section.title ? "<h4 class=\"material-block-title\">" + esc(section.title) + "</h4>" : "") +
        "<div class=\"material-table-wrap\">" +
          "<table class=\"material-table\">" +
            (headers ? "<thead><tr>" + headers + "</tr></thead>" : "") +
            "<tbody>" + rows + "</tbody>" +
          "</table>" +
        "</div>" +
      "</section>"
    );
  }

  if (type === "text") {
    return (
      "<section class=\"material-block\">" +
        (section.title ? "<h4 class=\"material-block-title\">" + esc(section.title) + "</h4>" : "") +
        "<p class=\"material-text\">" + esc(section.body) + "</p>" +
      "</section>"
    );
  }

  return "";
}

function aprovaMaterialRenderThemeList (areaId) {
  const grid = document.getElementById("material-theme-grid");
  const empty = document.getElementById("material-theme-empty");
  const countEl = document.getElementById("material-area-count");
  if (!grid) return;

  const list = AprovaMaterial.listByArea(areaId);
  if (countEl) {
    countEl.textContent = list.length
      ? (list.length + " tema" + (list.length === 1 ? "" : "s") + " disponível" + (list.length === 1 ? "" : "eis"))
      : "Nenhum tema ainda";
  }

  if (!list.length) {
    grid.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  const esc = aprovaEscapeMaterialHtml;
  grid.innerHTML = list.map((m) => {
    const tags = (m.tags || [])
      .map((t) => "<span class=\"material-tag\">" + esc(t) + "</span>")
      .join("");
    const mins = m.readMinutes ? (m.readMinutes + " min") : "";
    return (
      "<button type=\"button\" class=\"dash-card material-theme-card\" data-material-item=\"" + esc(m.id) + "\">" +
        "<span class=\"dash-card-kicker\">" + esc(mins || "Resumo") + "</span>" +
        "<strong>" + esc(m.title) + "</strong>" +
        "<span>" + esc(m.blurb || "") + "</span>" +
        (tags ? "<span class=\"material-tags\">" + tags + "</span>" : "") +
      "</button>"
    );
  }).join("");
}

function aprovaMaterialRenderItem (itemId) {
  const article = document.getElementById("material-article");
  if (!article) return;
  const item = AprovaMaterial.getItem(itemId);
  if (!item) {
    article.innerHTML = "<p class=\"prompt\">Material não encontrado.</p>";
    return;
  }

  const esc = aprovaEscapeMaterialHtml;
  const disclaimer = (AprovaMaterial.data && AprovaMaterial.data.disclaimer) || "";
  const body = (item.sections || []).map(aprovaMaterialSectionHtml).join("");

  const pdfHref = item.pdf
    ? (item.pdf.charAt(0) === "/" ? item.pdf : "/" + item.pdf)
    : ("/assets/material/pdf/" + encodeURIComponent(item.id) + ".pdf");
  const pdfName = (item.id || "material") + "-medhub-r1.pdf";

  article.innerHTML =
    "<header class=\"material-article-head\">" +
      "<p class=\"material-kicker\">" + esc(AprovaMaterial.areaLabel(item.area)) + "</p>" +
      "<h3 class=\"material-article-title\">" + esc(item.title) + "</h3>" +
      (item.lead ? "<p class=\"material-lead\">" + esc(item.lead) + "</p>" : "") +
    "</header>" +
    "<div class=\"material-article-body\">" + body + "</div>" +
    (disclaimer
      ? "<p class=\"material-disclaimer\">" + esc(disclaimer) + "</p>"
      : "");

  ["material-pdf-top", "material-pdf-bottom"].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.href = pdfHref;
    link.setAttribute("download", pdfName);
    link.hidden = false;
  });
  const bar = document.getElementById("material-download-bar");
  if (bar) bar.hidden = false;
}

async function aprovaMaterialShowList () {
  AprovaMaterial.itemId = null;
  const list = document.getElementById("material-area-list");
  const detail = document.getElementById("material-area-detail");
  const articleWrap = document.getElementById("material-article-wrap");
  if (list) list.hidden = false;
  if (detail) detail.hidden = true;
  if (articleWrap) articleWrap.hidden = true;
}

async function aprovaMaterialOpenArea (areaId) {
  const id = String(areaId || "");
  if (!["clinica", "cirurgia", "preventiva", "pediatria", "go"].includes(id)) return;
  const label = AprovaMaterial.areaLabel(id);

  AprovaMaterial.areaId = id;
  AprovaMaterial.itemId = null;

  const list = document.getElementById("material-area-list");
  const detail = document.getElementById("material-area-detail");
  const articleWrap = document.getElementById("material-article-wrap");
  const title = document.getElementById("material-area-title");
  if (list) list.hidden = true;
  if (detail) detail.hidden = false;
  if (articleWrap) articleWrap.hidden = true;
  if (title) title.textContent = label;

  const wsSub = document.getElementById("workspace-sub");
  if (wsSub) wsSub.textContent = label;

  const grid = document.getElementById("material-theme-grid");
  if (grid && !AprovaMaterial.data) {
    grid.innerHTML = "<p class=\"muted\">Carregando temas…</p>";
  }

  try {
    await AprovaMaterial.load();
    aprovaMaterialRenderThemeList(id);
  } catch (e) {
    if (grid) {
      grid.innerHTML = "<p class=\"prompt\">Não foi possível carregar o material. Tente de novo.</p>";
    }
  }
}

async function aprovaMaterialOpenItem (itemId) {
  const id = String(itemId || "");
  try {
    await AprovaMaterial.load();
  } catch (e) {
    return;
  }
  const item = AprovaMaterial.getItem(id);
  if (!item) return;

  AprovaMaterial.itemId = id;
  AprovaMaterial.areaId = item.area;

  const list = document.getElementById("material-area-list");
  const detail = document.getElementById("material-area-detail");
  const articleWrap = document.getElementById("material-article-wrap");
  if (list) list.hidden = true;
  if (detail) detail.hidden = true;
  if (articleWrap) articleWrap.hidden = false;

  aprovaMaterialRenderItem(id);

  const wsTitle = document.getElementById("workspace-title");
  const wsSub = document.getElementById("workspace-sub");
  if (wsTitle) wsTitle.textContent = "Material de apoio";
  if (wsSub) wsSub.textContent = item.title;
}

function aprovaMaterialBackFromArticle () {
  const areaId = AprovaMaterial.areaId;
  if (areaId) aprovaMaterialOpenArea(areaId);
  else aprovaMaterialShowList();
}
