/**
 * Extrai Nefro 1–5.pdf → data/_extract_nefro/
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\CM\\Nefrologia";
const OUT = path.join(__dirname, "..", "data", "_extract_nefro");

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
      /\b(glomerulo|nefr[oó]tica|nefr[ií]tica|ira|lra|drc|di[aá]lise|hiponatremia|hipercalemia|acidose|lit[ií]ase|itu|pielonefrite|transplante|hipertens[aã]o|cistinose|fanconi)/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 280);
}

function keywordHits(text) {
  const t = text.toLowerCase();
  const keys = [
    "glomerulo",
    "nefrótica",
    "nefroticas",
    "nefrítica",
    "nefritica",
    "síndrome nefrótica",
    "sindrome nefrotica",
    "síndrome nefrítica",
    "lesão renal aguda",
    "injúria renal",
    "injuria renal",
    "doença renal crônica",
    "doenca renal cronica",
    "diálise",
    "dialise",
    "hemodiálise",
    "hiponatremia",
    "hipernatremia",
    "hipercalemia",
    "hipocalemia",
    "acidose",
    "alcalose",
    "ânion gap",
    "anion gap",
    "nefrolitíase",
    "nefrolitiase",
    "cálculo",
    "itu",
    "pielonefrite",
    "transplante",
    "kdigo",
    "rifsle",
    "akín",
    "akin",
    "proteinúria",
    "proteinuria",
    "hematúria",
    "hematuria",
    "lúpus",
    "lupus",
    "iga",
    "membranosa",
    "lesões mínimas",
    "lesoes minimas"
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
  const re = /CAP[IÍ]TULO\.?\s*(\d+)/gi;
  let m;
  while ((m = re.exec(text))) {
    if (out.length && Math.abs(out[out.length - 1].idx - m.index) < 150) continue;
    const snip = text
      .slice(m.index, m.index + 160)
      .replace(/\0/g, "")
      .replace(/\s+/g, " ")
      .trim();
    out.push({ n: m[1], idx: m.index, snip: snip.slice(0, 110) });
  }
  return out;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs
    .readdirSync(SRC)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => a.localeCompare(b, "pt", { numeric: true }));
  const summary = [];
  const mapa = [];

  for (const file of files) {
    console.log("extracting", file);
    const text = await extractOne(file);
    const base = path.basename(file, ".pdf").replace(/\s+/g, "");
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
      chapterHeads: chapters.slice(0, 40)
    };
    summary.push(info);
    mapa.push({
      file,
      pagesEst: info.pagesEst,
      chars: info.chars,
      caps: info.caps
    });
    console.log(file, "chars", text.length, "pages~", info.pagesEst, "caps", caps.length);
  }

  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT, "MAPA.md"), buildMapa(mapa, summary), "utf8");
  console.log("done", OUT);
}

function buildMapa(mapa, summary) {
  let md = "# Nefrologia · mapa das apostilas (MedHub R1)\n\n";
  md += "Fonte: `D:\\\\MedHub R1\\\\CM\\\\Nefrologia`\n\n";
  for (const m of mapa) {
    md += `## ${m.file} (~${m.pagesEst}p · ${Math.round(m.chars / 1000)}k chars)\n\n`;
    if (!m.caps.length) md += "- (capítulos não detectados automaticamente)\n";
    for (const c of m.caps) md += `- Cap ${c.n}: ${c.snip}\n`;
    md += "\n";
  }
  md += "## Keywords agregadas (hits)\n\n";
  const agg = {};
  for (const s of summary) {
    for (const [k, v] of Object.entries(s.keywords || {})) agg[k] = (agg[k] || 0) + v;
  }
  Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([k, v]) => {
      md += `- ${k}: ${v}\n`;
    });
  md += "\nPrefixo sugerido: `nef-` · specialty: `clinica` · area: `nefrologia`\n";
  return md;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
