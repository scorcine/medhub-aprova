/** Snips End3 chapters for flashcard deepening. */
const fs = require("fs");
const path = require("path");
const t = fs.readFileSync(path.join(__dirname, "..", "data/_extract_endo/End3-full.txt"), "utf8");

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

const re = /CAP[IÍ]TULO\s+(\d+)/gi;
const matches = [...t.matchAll(re)];
const starts = [];
const seen = new Set();
for (const m of matches) {
  if (seen.has(m[1])) continue;
  seen.add(m[1]);
  starts.push({ n: m[1], i: m.index });
}
starts.sort((a, b) => a.i - b.i);

const outDir = path.join(__dirname, "..", "data/_extract_endo/snips-end3");
fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < starts.length; i++) {
  const start = starts[i].i;
  const end = i + 1 < starts.length ? starts[i + 1].i : t.length;
  const chunk = clean(t.slice(start, end));
  const name = "cap" + starts[i].n + ".txt";
  fs.writeFileSync(path.join(outDir, name), chunk, "utf8");
  const title = chunk.split(/\n/).slice(0, 6).join(" ").replace(/\s+/g, " ").slice(0, 140);
  console.log(name, "chars", chunk.length, "·", title);
}

const keys = [
  "metformina", "SGLT2", "GLP-1", "sulfoni", "pioglitazona", "DPP-4",
  "cetoacidose", "hiperosmolar", "Wagner", "monofilamento",
  "microalbuminúria", "retinopatia", "neuropatia",
  "glucagon", "HbA1c", "orlistate", "liraglutida", "bariátrica",
  "charcot", "osteomielite", "IECA"
];
console.log("\n=== keywords ===");
for (const k of keys) {
  const n = (t.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
  console.log(String(n).padStart(3), k);
}
