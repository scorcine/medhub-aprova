/** Snips high-yield stretches from End1 extract for flashcard deepening. */
const fs = require("fs");
const path = require("path");
const t = fs.readFileSync(path.join(__dirname, "..", "data/_extract_endo/End1-full.txt"), "utf8");

function clean(s) {
  return s
    .replace(/t\.me\/\S+/g, "")
    .replace(/proibida venda[^\n]*/gi, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const cuts = [
  ["cap1-fisio", "CAPÍTULO 1", "CAPÍTULO 2"],
  ["cap2-hiper-graves", "CAPÍTULO 2", "CAPÍTULO 3"],
  ["cap3-hipo", "CAPÍTULO 3", "CAPÍTULO 4"],
  ["cap4-tireoidites", "CAPÍTULO 4", "CAPÍTULO 5"],
  ["cap5-nodulos-ca", "CAPÍTULO 5", null]
];

const outDir = path.join(__dirname, "..", "data/_extract_endo/snips-end1");
fs.mkdirSync(outDir, { recursive: true });

for (const [name, a, b] of cuts) {
  const i = t.indexOf(a);
  if (i < 0) {
    console.log("MISS start", name, a);
    continue;
  }
  const j = b ? t.indexOf(b, i + 10) : t.length;
  const chunk = clean(t.slice(i, j < 0 ? t.length : j));
  const file = path.join(outDir, name + ".txt");
  fs.writeFileSync(file, chunk, "utf8");
  console.log(name, "chars", chunk.length, "→", path.basename(file));
}

// keyword windows for exam pearls
const keys = [
  "Wolff-Chaikoff",
  "Jod-Basedow",
  "tempestade tireoidiana",
  "Burch-Wartofsky",
  "TRAb",
  "oftalmo",
  "metimazol",
  "PTU",
  "radioiodo",
  "coma mixedematoso",
  "Pemberton",
  "Hashimoto",
  "Quervain",
  "Riedel",
  "Bethesda",
  "papilífero",
  "medular",
  "anaplásico",
  "TIRADS",
  "levotiroxina",
  "gestação",
  "subclínico"
];

console.log("\n=== keyword hits (first occurrence context) ===");
for (const k of keys) {
  const re = new RegExp(k, "i");
  const m = t.search(re);
  if (m < 0) {
    console.log("MISS", k);
    continue;
  }
  const snip = clean(t.slice(Math.max(0, m - 80), Math.min(t.length, m + 220))).replace(/\n/g, " ");
  console.log("\n[" + k + "]", snip.slice(0, 280));
}
