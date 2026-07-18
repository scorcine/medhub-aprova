const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\CM\\Reumatologia";
const OUT = path.join(__dirname, "..", "data", "_extract_reu");

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
    if (L.length < 6 || L.length > 120) continue;
    const key = L.toLowerCase();
    if (seen.has(key)) continue;
    const isCaps =
      L === L.toUpperCase() &&
      /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(L) &&
      !/^PÁG|^FIG|^TAB|^HTTP|^WWW|^T\.ME|^MEDHUB|^APOSTILA/.test(L);
    const isMarker =
      /^(cap[ií]tulo|unidade|m[oó]dulo|pontos principais|teste seu conhecimento|sum[aá]rio)/i.test(L) ||
      /\b(artrite|artralg|l[uú]pus|les\b|gota|escleroderm|esclerose sist|sj[oö]gren|miopat|dermatomios|polimios|vasculit|beh[cç]et|wegener|granulomatose|churg|poliarterite|arterite|takayasu|rheumat|reumat|osteopor|fibromial|espondil|psor[ií]as|ainda|osteoartr|osteoartrose|AR\b|FR\b|FAN|anti-CCP|metotrex|biologicos|biólog)/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 200);
}

function keywordHits(text) {
  const t = text.toLowerCase();
  const keys = [
    "artrite reumatoide",
    "lúpus",
    "lupus",
    "gota",
    "ácido úrico",
    "acido urico",
    "osteoartrite",
    "osteoartrose",
    "espondilite",
    "psoríase",
    "psoriase",
    "esclerose sistêmica",
    "esclerodermia",
    "sjögren",
    "sjogren",
    "dermatomiosite",
    "polimiosite",
    "vasculite",
    "arterite temporal",
    "arterite de células gigantes",
    "polimialgia",
    "wegener",
    "granulomatose",
    "churg-strauss",
    "poliangiíte",
    "poliarterite",
    "behçet",
    "behcet",
    "fibromialgia",
    "osteoporose",
    "anti-ccp",
    "fator reumatoide",
    "fan",
    "anti-dsdna",
    "anti-sm",
    "anca",
    "metotrexato",
    "hidroxicloroquina",
    "biológico",
    "biologico",
    "corticoide",
    "colchicina",
    "alopurinol",
    "febuxostate",
    "safb",
    "ainda",
    "espondiloartrite",
    "hla-b27",
    "crioglobulinemia",
    "anticorpo antifosfolípide",
    "antifosfolipide",
    "saf",
    "síndrome antifosfolípide"
  ];
  const hits = {};
  for (const k of keys) hits[k] = Math.max(0, t.split(k).length - 1);
  return hits;
}

function guessPages(text) {
  const m = text.match(/\/Type\s*\/Page\b/g);
  // fallback: form feed or page markers in extract
  const markers = text.match(/\f/g);
  if (markers && markers.length > 5) return markers.length;
  const of = [...text.matchAll(/--\s*\d+\s+of\s+(\d+)\s*--/gi)];
  if (of.length) return Number(of[of.length - 1][1]);
  // estimate ~1800 chars/page
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
    // first ~80 lines often = sumario
    const head = text.split(/\r?\n/).slice(0, 120).join("\n");
    fs.writeFileSync(path.join(OUT, base + "-head.txt"), head, "utf8");
    const info = {
      file,
      chars: text.length,
      pagesEst: guessPages(text),
      chapters: chapters.slice(0, 80),
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
