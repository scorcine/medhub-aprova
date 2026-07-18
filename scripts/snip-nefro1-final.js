const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro1-full.txt", "utf8");
function c(s) {
  return s.replace(/\0/g, "").replace(/t\.me\/\S+/g, "").replace(/-- \d+ of \d+ --/g, "").replace(/\s+/g, " ").trim();
}
const keys = [
  "proteinúria nefrótica",
  "> 3,5",
  "3,5 g",
  "encapsulados",
  "Glomeruloesclerose Focal e Segmentar",
  "spikes",
  "PLA2R",
  "Goodpasture",
  "linear",
  "pauci-imune",
  "classe IV",
  "classe III",
  "diabética",
  "IECA",
  "Alport"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 80), i + 900)).slice(0, 850));
}
