/**
 * Extrai Neurologia.pdf → data/_extract_neuro/
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\CM\\Neurologia";
const OUT = path.join(__dirname, "..", "data", "_extract_neuro");

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
      /^(cap[ií]tulo|unidade|m[oó]dulo|ap[eê]ndice|pontos principais|teste seu conhecimento|sum[aá]rio)/i.test(L) ||
      /\b(avc|acidente vascular|epilep|cefale|enxaqueca|coma|delirium|dem[eê]ncia|parkinson|miastenia|guillain|esclerose|meningite|tce|trauma|vertigem|mielopat|tumor|neuropatia|status epileptic)/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 300);
}

function keywordHits(text) {
  const t = text.toLowerCase();
  const keys = [
    "avc",
    "isquêmico",
    "isquemico",
    "hemorrágico",
    "hemorragico",
    "trombólise",
    "trombolise",
    "trombectomia",
    "nihss",
    "epilepsia",
    "crise convulsiva",
    "status epilepticus",
    "fenitoína",
    "fenitoina",
    "cefaleia",
    "enxaqueca",
    "migrânea",
    "migranea",
    "salvas",
    "coma",
    "glasgow",
    "delirium",
    "demência",
    "demencia",
    "alzheimer",
    "parkinson",
    "miastenia",
    "guillain",
    "ela",
    "esclerose múltipla",
    "esclerose multipla",
    "meningite",
    "tce",
    "hipertensão intracraniana",
    "hipertensao intracraniana",
    "vertigem",
    "neuropatia",
    "mielopatia"
  ];
  const hits = {};
  for (const k of keys) hits[k] = Math.max(0, t.split(k).length - 1);
  return hits;
}

function guessPages(text) {
  const of = [...text.matchAll(/--\s*\d+\s+of\s+(\d+)\s*--/gi)];
  if (of.length) return Number(of[of.length - 1][1]);
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
    fs.writeFileSync(path.join(OUT, base + "-head.txt"), text.split(/\r?\n/).slice(0, 200).join("\n"), "utf8");
    const info = {
      file,
      chars: text.length,
      pagesEst: guessPages(text),
      chapters: chapters.slice(0, 120),
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
