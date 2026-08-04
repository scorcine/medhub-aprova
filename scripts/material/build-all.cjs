/* Compila seeds → SVG → data/material.json → PDFs */
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
    const svgName = seed.id + ".svg";
    const svgRel = "/assets/material/" + svgName;
    const svgAbs = path.join(assetsDir, svgName);
    const svg = renderDiagram(seed.diagram);
    fs.writeFileSync(svgAbs, svg, "utf8");

    const figure = {
      type: "figure",
      src: svgRel,
      caption: seed.diagram.caption || seed.diagram.title || "Esquema"
    };
    // Insere figura após o 1º callout, ou no início
    const idx = item.sections.findIndex((s) => s.type === "callout");
    if (idx >= 0) item.sections.splice(idx + 1, 0, figure);
    else item.sections.unshift(figure);
  }

  return item;
}

function main () {
  const base = fs.existsSync(materialPath)
    ? loadJson(materialPath)
    : { version: 1, disclaimer: "", catalog: [], items: {} };

  const items = Object.assign({}, base.items || {});
  // Mantém itens já existentes (ex.: lote 1 manual com SVGs artesanais)
  for (const id of Object.keys(items)) {
    if (!items[id].pdf) items[id].pdf = "/assets/material/pdf/" + id + ".pdf";
  }

  const seedFiles = listSeedFiles();
  let added = 0;
  for (const file of seedFiles) {
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

  const areaOrder = ["clinica", "cirurgia", "preventiva", "pediatria", "go"];
  const catalog = Object.values(items)
    .map(catalogEntry)
    .sort((a, b) => {
      const ai = areaOrder.indexOf(a.area);
      const bi = areaOrder.indexOf(b.area);
      if (ai !== bi) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return String(a.title).localeCompare(String(b.title), "pt-BR");
    });

  const out = {
    version: (base.version || 1) + 1,
    disclaimer: base.disclaimer ||
      "Material de estudo para residência (R1). Não substitui protocolo institucional nem conduta clínica.",
    catalog,
    items
  };

  fs.writeFileSync(materialPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("material.json:", catalog.length, "temas · seeds processados:", added);

  const pdf = spawnSync(process.execPath, [path.join(root, "scripts", "build-material-pdfs.cjs")], {
    cwd: root,
    stdio: "inherit"
  });
  if (pdf.status !== 0) process.exit(pdf.status || 1);
}

main();
