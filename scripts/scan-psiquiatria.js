/**
 * Extrai Psi.pdf → data/_extract_psi/
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\CM\\Psiquiatria";
const OUT = path.join(__dirname, "..", "data", "_extract_psi");

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
    if (L.length < 4 || L.length > 140) continue;
    const key = L.toLowerCase();
    if (seen.has(key)) continue;
    const isCaps =
      L === L.toUpperCase() &&
      /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(L) &&
      !/^PÁG|^FIG|^TAB|^HTTP|^WWW|^T\.ME|^MEDHUB|^APOSTILA|^PROIBIDA/.test(L);
    const isMarker =
      /^(cap[ií]tulo|unidade|m[oó]dulo|pontos principais|teste seu conhecimento|sum[aá]rio)/i.test(L) ||
      /\b(depress|bipolar|esquizofr|psicose|ansied|p[aâ]nico|toc\b|obsess|alcool|álcool|depend[eê]ncia|abstin|tabag|coca[ií]na|cannabis|benzodiazep|l[ií]tio|antipsic|antidepress|suic[ií]dio|delirium|transtorno|personalidade|anorexia|bulimia|tdah|autismo|reforma psiqui[aá]tr)/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 250);
}

function keywordHits(text) {
  const t = text.toLowerCase();
  const keys = [
    "depressão",
    "depressao",
    "transtorno bipolar",
    "mania",
    "esquizofrenia",
    "psicose",
    "delírio",
    "delirio",
    "alucinação",
    "ansiedade",
    "pânico",
    "panico",
    "toc",
    "obsessivo",
    "álcool",
    "alcool",
    "abstinência",
    "abstinencia",
    "delirium tremens",
    "tabagismo",
    "prochaska",
    "cocaína",
    "cocaina",
    "cannabis",
    "benzodiazepínico",
    "benzodiazepinico",
    "lítio",
    "litio",
    "antipsicótico",
    "antipsicotico",
    "antidepressivo",
    "isrs",
    "ssri",
    "suicídio",
    "suicidio",
    "anorexia",
    "bulimia",
    "personalidade",
    "borderline",
    "tdah",
    "autismo",
    "reforma psiquiátrica",
    "intoxicação",
    "intoxicacao",
    "serotonina",
    "síndrome neuroléptica",
    "sindrome neuroleptica"
  ];
  const hits = {};
  for (const k of keys) hits[k] = Math.max(0, t.split(k).length - 1);
  return hits;
}

function guessPages(text) {
  const of = [...text.matchAll(/--\s*\d+\s+of\s+(\d+)\s*--/gi)];
  if (of.length) return Number(of[of.length - 1][1]);
  const markers = text.match(/\f/g);
  if (markers && markers.length > 5) return markers.length;
  return Math.round(text.length / 2200);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith(".pdf")).sort();
  const summary = [];

  for (const file of files) {
    console.log("extracting", file);
    const text = await extractOne(file);
    const base = path.basename(file, ".pdf");
    fs.writeFileSync(path.join(OUT, base + "-full.txt"), text, "utf8");
    const chapters = pickChapters(text);
    fs.writeFileSync(path.join(OUT, base + "-chapters.txt"), chapters.join("\n"), "utf8");
    const head = text.split(/\r?\n/).slice(0, 150).join("\n");
    fs.writeFileSync(path.join(OUT, base + "-head.txt"), head, "utf8");
    const info = {
      file,
      chars: text.length,
      pagesEst: guessPages(text),
      chapters: chapters.slice(0, 100),
      keywords: keywordHits(text)
    };
    summary.push(info);
    console.log(file, "chars", text.length, "pages~", info.pagesEst, "heads", chapters.length);
  }

  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log("done", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
