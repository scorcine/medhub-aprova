const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro1-full.txt", "utf8");
function c(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const keys = [
  "DOENÇA POR LESÃO MÍNIMA",
  "Glomeruloesclerose focal",
  "doença de Berger",
  "GLOMERULONEFRITE RAPIDAMENTE",
  "Goodpasture",
  "nefropatia diabética",
  "corticossensível",
  "Alport",
  "membranoproliferativa",
  "incubação"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(i, i + 1100)).slice(0, 980));
}
