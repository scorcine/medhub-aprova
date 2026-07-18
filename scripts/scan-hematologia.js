/**
 * Extrai Hem1–Hem3.pdf → data/_extract_hemato/
 * Fonte: D:\MedHub R1\CM\Hematologia
 * Prefixo sugerido: hema- (evitar colisão com pediatria hem-anemias)
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\CM\\Hematologia";
const OUT = path.join(__dirname, "..", "data", "_extract_hemato");

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
      /^(cap[ií]tulo|unidade|m[oó]dulo|ap[eê]ndice|pontos principais|teste seu conhecimento|sum[aá]rio)/i.test(
        L
      ) ||
      /\b(anemia|leucemia|linfoma|mieloma|plaquet|coagula|hemofilia|talassemia|falciforme|neutropenia|mielodispl|policitemia|trombocit|púrpura|ptt|purg|ahai|ferropriva|megalobl)/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 320);
}

function keywordHits(text) {
  const t = text.toLowerCase();
  const keys = [
    "anemia",
    "ferropriva",
    "talassemia",
    "falciforme",
    "drepanocitose",
    "megaloblástica",
    "b12",
    "folato",
    "ahai",
    "hemólise",
    "g6pd",
    "esferocitose",
    "leucemia",
    "lma",
    "llc",
    "lmc",
    "lla",
    "linfoma",
    "hodgkin",
    "não hodgkin",
    "mieloma",
    "mgus",
    "policitemia",
    "trombocitose",
    "mielofibrose",
    "mielodisplasia",
    "neutropenia",
    "plaquetopenia",
    "pti",
    "ptt",
    "shuh",
    "cid",
    "coagulação",
    "hemofilia",
    "von willebrand",
    "trombofilia",
    "tvp",
    "hep",
    "heparina",
    "varfarina",
    "doac",
    "transfusi",
    "neutrófilo",
    "eosinofilia",
    "basofilia",
    "mononucleose",
    "aplásica",
    "pancitopenia",
    "medula óssea",
    "biopsia",
    "citometria"
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

function findCaps(text) {
  const out = [];
  const re =
    /(?:CAP[IÍ]TULO|CAP\.?|UNIDADE|M[OÓ]DULO)\s*(\d+)|AP[EÊ]NDICE\s*(\d+)/gi;
  let m;
  while ((m = re.exec(text))) {
    if (out.length && Math.abs(out[out.length - 1].idx - m.index) < 150) continue;
    const snip = text
      .slice(m.index, m.index + 180)
      .replace(/\0/g, "")
      .replace(/\s+/g, " ")
      .trim();
    out.push({
      n: m[1] || m[2] || "?",
      idx: m.index,
      snip: snip.slice(0, 120)
    });
  }
  return out;
}

function normalizeBase(file) {
  return path
    .basename(file, ".pdf")
    .replace(/\s+/g, "")
    .replace(/^hem/i, "Hem");
}

function buildMapa(mapa, summary) {
  let md = "# Hematologia · mapa (análise pré-flashcards)\n\n";
  md += "Fonte: `D:\\\\MedHub R1\\\\CM\\\\Hematologia`\n\n";
  md +=
    "**Prefixo sugerido:** `hema-` (evitar colisão com pediatria `hem-anemias`) · specialty: `clinica` · area: `hematologia`\n\n";
  for (const m of mapa) {
    md += `## ${m.file} (~${m.pagesEst}p · ${Math.round(m.chars / 1000)}k chars)\n\n`;
    if (m.caps.length) {
      for (const c of m.caps.slice(0, 25)) md += `- Cap/Ap ${c.n}: ${c.snip}\n`;
    } else if (m.topHeads && m.topHeads.length) {
      for (const h of m.topHeads) md += `- ${h}\n`;
    } else {
      md += "- (capítulos não detectados automaticamente)\n";
    }
    md += "\n";
  }
  md += "## Keywords agregadas (hits)\n\n";
  const agg = {};
  for (const s of summary) {
    for (const [k, v] of Object.entries(s.keywords || {})) agg[k] = (agg[k] || 0) + v;
  }
  Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 45)
    .forEach(([k, v]) => {
      md += `- ${k}: ${v}\n`;
    });
  return md;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs
    .readdirSync(SRC)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b, "pt", { numeric: true, sensitivity: "base" }));
  const summary = [];
  const mapa = [];

  for (const file of files) {
    console.log("extracting", file);
    const text = await extractOne(file);
    const base = normalizeBase(file);
    fs.writeFileSync(path.join(OUT, base + "-full.txt"), text, "utf8");
    const chapters = pickChapters(text);
    fs.writeFileSync(path.join(OUT, base + "-chapters.txt"), chapters.join("\n"), "utf8");
    const caps = findCaps(text);
    const info = {
      file,
      base,
      chars: text.length,
      pagesEst: guessPages(text),
      caps: caps.map((c) => ({ n: c.n, snip: c.snip })),
      keywords: keywordHits(text),
      chapterHeads: chapters.slice(0, 50)
    };
    summary.push(info);
    mapa.push({
      file,
      pagesEst: info.pagesEst,
      chars: info.chars,
      caps: info.caps,
      topHeads: chapters.filter((h) => /CAP|APÊNDICE|APENDICE|UNIDADE/i.test(h)).slice(0, 25)
    });
    console.log(file, "→", base, "chars", text.length, "pages~", info.pagesEst, "caps", caps.length);
  }

  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT, "MAPA.md"), buildMapa(mapa, summary), "utf8");
  console.log("done", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
