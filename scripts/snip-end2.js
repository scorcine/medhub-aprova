/** Snips End2 chapters for flashcard deepening. */
const fs = require("fs");
const path = require("path");
const t = fs.readFileSync(path.join(__dirname, "..", "data/_extract_endo/End2-full.txt"), "utf8");

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

// Find chapter starts
const re = /CAP[IÍ]TULO\s+(\d+)/gi;
const matches = [...t.matchAll(re)];
console.log("chapters found:", matches.map((m) => m[0] + " @" + m.index).join(" | "));

const outDir = path.join(__dirname, "..", "data/_extract_endo/snips-end2");
fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < matches.length; i++) {
  const start = matches[i].index;
  const end = i + 1 < matches.length ? matches[i + 1].index : t.length;
  const chunk = clean(t.slice(start, end));
  const name = "cap" + matches[i][1] + ".txt";
  fs.writeFileSync(path.join(outDir, name), chunk, "utf8");
  // first meaningful title line
  const title = chunk.split(/\n/).slice(0, 8).join(" ").replace(/\s+/g, " ").slice(0, 120);
  console.log(name, "chars", chunk.length, "·", title);
}

const keys = [
  "CRH", "dexametasona", "ectópico", "cortisol salivar", "petrosal",
  "crise adrenal", "hidrocortisona", "fludrocortisona", "Waterhouse",
  "metanefrina", "fenoxibenzamina", "MIBG", "regra dos 10",
  "CAP/ARP", "espironolactona", "Conn", "cateterismo",
  "sestamibi", "hipocalciúrica", "calcitriol", "Hungry bone",
  "cabergolina", "efeito gancho", "TOTG", "octreotide", "SIADH",
  "diabetes insipidus", "Sheehan", "apoplexia"
];
console.log("\n=== keyword presence ===");
for (const k of keys) {
  const n = (t.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
  console.log(String(n).padStart(3), k);
}
