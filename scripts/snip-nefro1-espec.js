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
  "LESÃO MÍNIMA",
  "lesão mínima",
  "GEFS",
  "focal e segmentar",
  "GLOMERULOPATIA MEMBRANOSA",
  "nefropatia membranosa",
  "anti-PLA2R",
  "CLASSES DE NEFRITE LÚPICA",
  "nefrite lúpica",
  "Kimmelstiel-Wilson",
  "nefropatia diabética",
  "microalbuminúria",
  "Henoch-Schönlein",
  "ANCA",
  "crescêntica"
];
for (const k of keys) {
  const i = t.indexOf(k);
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(i, i + 1200)).slice(0, 1000));
}
