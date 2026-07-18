/**
 * Extrai Prev1–Prev4.pdf → data/_extract_prev/
 * Fonte: D:\MedHub R1\Preventiva
 * Modelo: Pediatria (4 grupos temáticos · specialty: preventiva)
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\Preventiva";
const OUT = path.join(__dirname, "..", "data", "_extract_prev");

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
      !/^PÁG|^FIG|^TAB|^HTTP|^WWW|^T\.ME|^MEDHUB|^APOSTILA|^PROIBIDA|^QUESTÕES/.test(L);
    const isMarker =
      /^(cap[ií]tulo|unidade|m[oó]dulo|ap[eê]ndice|pontos principais|sum[aá]rio)/i.test(L) ||
      /\b(epidemiologia|bioestat|sus|sistema [uú]nico|vigil[aâ]ncia|vacina|imuniza|programa nacional|aten[cç][aã]o prim[aá]ria|psf|esf|indicador|mortalidade|morbidade|ensaio|coorte|caso.?controle|preval[eê]ncia|incid[eê]ncia|rastreamento|screening|etica|bio[eé]tica|medicina preventiva|sa[uú]de coletiva|pol[ií]tica|n[uú]cleo ampliado|nasf)/i.test(
        L
      );
    if (isCaps || isMarker) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads.slice(0, 500);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs
    .readdirSync(SRC)
    .filter((f) => /^prev\d+\.pdf$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const map = [];
  for (const file of files) {
    const base = path.basename(file, ".pdf");
    console.log("extracting", file, "...");
    const text = await extractOne(file);
    const fullPath = path.join(OUT, `${base}-full.txt`);
    fs.writeFileSync(fullPath, text, "utf8");
    const heads = pickChapters(text);
    fs.writeFileSync(path.join(OUT, `${base}-heads.txt`), heads.join("\n") + "\n", "utf8");
    map.push({
      file,
      base,
      chars: text.length,
      lines: text.split(/\n/).length,
      heads: heads.slice(0, 80)
    });
    console.log(`  ${base}: ${text.length} chars · ${heads.length} heads`);
  }
  fs.writeFileSync(path.join(OUT, "MAPA.md"), renderMap(map), "utf8");
  console.log("wrote", path.join(OUT, "MAPA.md"));
}

function renderMap(map) {
  const lines = [
    "# Preventiva · mapa Prev1–Prev4",
    "",
    "Fonte: `D:\\\\MedHub R1\\\\Preventiva`",
    "Modelo UX: Pediatria (4 grupos · vários subtemas/decks).",
    "Prefixo sugerido: `prev-` · specialty: `preventiva`.",
    ""
  ];
  for (const m of map) {
    lines.push(`## ${m.base} (${m.chars} chars · ${m.lines} lines)`);
    lines.push("");
    for (const h of m.heads) lines.push(`- ${h}`);
    lines.push("");
  }
  return lines.join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
