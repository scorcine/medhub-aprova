/* Compila seeds → SVG → exam-packs → data/material.json → PDFs */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { renderDiagram } = require("./svg-templates.cjs");

const root = path.resolve(__dirname, "../..");
const materialPath = path.join(root, "data", "material.json");
const seedsDir = path.join(root, "data", "material");
const assetsDir = path.join(root, "assets", "material");

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(path.join(assetsDir, "pdf"), { recursive: true });

function loadJson (file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listSeedFiles () {
  if (!fs.existsSync(seedsDir)) return [];
  return fs.readdirSync(seedsDir)
    .filter((f) => /^seeds.*\.json$/i.test(f))
    .map((f) => path.join(seedsDir, f))
    .sort();
}

function listExamPackFiles () {
  if (!fs.existsSync(seedsDir)) return [];
  return fs.readdirSync(seedsDir)
    .filter((f) => /^exam-packs.*\.json$/i.test(f))
    .map((f) => path.join(seedsDir, f))
    .sort();
}

function catalogEntry (item) {
  return {
    id: item.id,
    area: item.area,
    title: item.title,
    blurb: item.blurb || "",
    readMinutes: item.readMinutes || 4,
    tags: item.tags || []
  };
}

function writeDiagramFigure (itemId, diagram, suffix) {
  const svgName = itemId + (suffix || "") + ".svg";
  const svgRel = "/assets/material/" + svgName;
  const svgAbs = path.join(assetsDir, svgName);
  fs.writeFileSync(svgAbs, renderDiagram(diagram), "utf8");
  return {
    type: "figure",
    src: svgRel,
    caption: diagram.caption || diagram.title || "Esquema"
  };
}

function materializeSeed (seed) {
  const item = {
    id: seed.id,
    area: seed.area,
    title: seed.title,
    lead: seed.lead || "",
    pdf: "/assets/material/pdf/" + seed.id + ".pdf",
    sections: Array.isArray(seed.sections) ? seed.sections.slice() : []
  };

  if (seed.diagram && seed.diagram.type) {
    const figure = writeDiagramFigure(seed.id, seed.diagram, "");
    const idx = item.sections.findIndex((s) => s.type === "callout");
    if (idx >= 0) item.sections.splice(idx + 1, 0, figure);
    else item.sections.unshift(figure);
  }

  return item;
}

function applyExamPack (item, pack) {
  if (!item || !pack) return item;
  const out = Object.assign({}, item, {
    sections: Array.isArray(item.sections) ? item.sections.slice() : []
  });

  // Remove figuras/seções de packs anteriores (rebuild limpo)
  out.sections = out.sections.filter((s) => {
    if (s && s.type === "figure" && String(s.src || "").indexOf("-pack") >= 0) return false;
    if (s && s._examPack) return false;
    return true;
  });

  const packSections = [];
  packSections.push({
    type: "callout",
    tone: "remember",
    title: "Para a prova — escalas e macetes",
    body: pack.intro ||
      "Memorize critérios nominados, escores e tríades: caem com frequência e fecham diferencial/conduta.",
    _examPack: true
  });

  const extras = Array.isArray(pack.extraDiagrams) ? pack.extraDiagrams : [];
  extras.forEach((diag, i) => {
    if (!diag || !diag.type) return;
    const fig = writeDiagramFigure(out.id, diag, "-pack" + (i + 1));
    fig._examPack = true;
    packSections.push(fig);
  });

  (pack.sections || []).forEach((s) => {
    if (!s) return;
    const copy = Object.assign({}, s, { _examPack: true });
    packSections.push(copy);
  });

  out.sections = out.sections.concat(packSections);
  return out;
}

function loadExamPacks () {
  const map = Object.create(null);
  for (const file of listExamPackFiles()) {
    const obj = loadJson(file);
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      console.warn("Ignorado exam-pack (nao e objeto):", path.basename(file));
      continue;
    }
    Object.keys(obj).forEach((id) => {
      map[id] = obj[id];
    });
    console.log("exam-pack", path.basename(file), Object.keys(obj).length, "temas");
  }
  return map;
}

function stripInternal (item) {
  const clean = Object.assign({}, item);
  clean.sections = (item.sections || []).map((s) => {
    const o = Object.assign({}, s);
    delete o._examPack;
    return o;
  });
  return clean;
}

function main () {
  const base = fs.existsSync(materialPath)
    ? loadJson(materialPath)
    : { version: 1, disclaimer: "", catalog: [], items: {} };

  const items = Object.assign({}, base.items || {});
  for (const id of Object.keys(items)) {
    if (!items[id].pdf) items[id].pdf = "/assets/material/pdf/" + id + ".pdf";
  }

  let added = 0;
  for (const file of listSeedFiles()) {
    const arr = loadJson(file);
    if (!Array.isArray(arr)) {
      console.warn("Ignorado (nao e array):", path.basename(file));
      continue;
    }
    for (const seed of arr) {
      if (!seed || !seed.id || !seed.area) continue;
      items[seed.id] = materializeSeed(seed);
      added += 1;
      console.log("seed", seed.id, "←", path.basename(file));
    }
  }

  const packs = loadExamPacks();
  let packed = 0;
  Object.keys(items).forEach((id) => {
    if (!packs[id]) return;
    items[id] = applyExamPack(items[id], packs[id]);
    packed += 1;
  });

  const missing = Object.keys(items).filter((id) => !packs[id]);
  if (missing.length) {
    console.warn("SEM exam-pack (" + missing.length + "):", missing.join(", "));
  }

  const areaOrder = ["clinica", "cirurgia", "preventiva", "pediatria", "go"];
  const catalog = Object.values(items)
    .map(catalogEntry)
    .sort((a, b) => {
      const ai = areaOrder.indexOf(a.area);
      const bi = areaOrder.indexOf(b.area);
      if (ai !== bi) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return String(a.title).localeCompare(String(b.title), "pt-BR");
    });

  const cleanItems = Object.create(null);
  Object.keys(items).forEach((id) => {
    cleanItems[id] = stripInternal(items[id]);
  });

  const out = {
    version: (base.version || 1) + 1,
    disclaimer: base.disclaimer ||
      "Material de estudo para residência (R1). Não substitui protocolo institucional nem conduta clínica.",
    catalog,
    items: cleanItems
  };

  fs.writeFileSync(materialPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("material.json:", catalog.length, "temas · seeds:", added, "· packs:", packed);

  const pdf = spawnSync(process.execPath, [path.join(root, "scripts", "build-material-pdfs.cjs")], {
    cwd: root,
    stdio: "inherit"
  });
  if (pdf.status !== 0) process.exit(pdf.status || 1);
}

main();
