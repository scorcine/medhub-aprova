const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\Cirurgia";
const OUT = path.join(__dirname, "..", "data", "_extract_cir");

async function extractOne(file) {
  const buf = fs.readFileSync(path.join(SRC, file));
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  return typeof result === "string" ? result : result.text || "";
}

function pickChapters(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const heads = [];
  const seen = new Set();
  for (const L of lines) {
    if (L.length < 8 || L.length > 100) continue;
    const key = L.toLowerCase();
    if (seen.has(key)) continue;
    // ALL CAPS chapter-like or known markers
    const isCaps =
      L === L.toUpperCase() &&
      /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(L) &&
      !/^PÁG|^FIG|^TAB|^HTTP|^WWW|^T\.ME/.test(L);
    const isMarker =
      /^(cap[ií]tulo|unidade|m[oó]dulo|pontos principais|teste seu conhecimento)/i.test(L) ||
      /trauma|abdome|apendic|colecist|h[eé]rnia|queimadura|pr[eé]-?oper|p[oó]s-?oper|anest|vascular|tireoide|est[oô]mago|es[oô]fago|c[oó]lon|ret[oa]|p[aâ]ncreas|ba[cç]o|f[ií]gado|pediatr|infantil|urolog|tor[aá]cic|bari[aá]tric|sutura|cicatriz|choque|atls|nutri[cç]/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 120);
}

function keywordHits(text) {
  const t = text.toLowerCase();
  const keys = [
    "trauma",
    "atls",
    "abdome agudo",
    "apendicite",
    "colecistite",
    "diverticulite",
    "obstrução intestinal",
    "hérnia",
    "hernia",
    "queimadura",
    "pré-operat",
    "pre-operat",
    "pós-operat",
    "pos-operat",
    "anestesi",
    "vascular",
    "aneurisma",
    "TVP",
    "tromboembol",
    "tireoide",
    "estômago",
    "estomago",
    "esôfago",
    "esofago",
    "cólon",
    "colon",
    "reto",
    "pâncreas",
    "pancreas",
    "baço",
    "baco",
    "fígado",
    "figado",
    "vias biliares",
    "cirurgia infantil",
    "cirurgia pediátrica",
    "urologia",
    "torácica",
    "toracica",
    "bariátrica",
    "bariatrica",
    "sutura",
    "cicatrização",
    "cicatrizacao",
    "nutrição",
    "nutricao",
    "choque",
    "hemorragia",
    "pneumotórax",
    "pneumotorax",
    "tórax",
    "torax",
  ];
  const hits = {};
  for (const k of keys) hits[k] = (t.split(k).length - 1) || 0;
  return hits;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith(".pdf"));
  const summary = [];

  for (const file of files) {
    console.log("extracting", file);
    const text = await extractOne(file);
    const base = path.basename(file, ".pdf");
    fs.writeFileSync(path.join(OUT, base + "-full.txt"), text, "utf8");
    const chapters = pickChapters(text);
    fs.writeFileSync(path.join(OUT, base + "-chapters.txt"), chapters.join("\n"), "utf8");
    const pages = (text.match(/--\s*\d+\s+of\s+(\d+)\s*--/gi) || []).pop();
    const pageMatch = pages && pages.match(/of\s+(\d+)/i);
    const info = {
      file,
      chars: text.length,
      pagesHint: pageMatch ? Number(pageMatch[1]) : null,
      chapters: chapters.slice(0, 40),
      keywords: keywordHits(text),
    };
    summary.push(info);
    console.log(file, "chars", text.length, "pages~", info.pagesHint);
  }

  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log("done", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
