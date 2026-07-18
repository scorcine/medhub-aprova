const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro3-full.txt", "utf8");
function c(s) {
  return s.replace(/\0/g, "").replace(/t\.me\/\S+/g, "").replace(/-- \d+ of \d+ --/g, "").replace(/proibida venda/gi, "").replace(/\s+/g, " ").trim();
}
const keys = [
  "CRISTALOIDES",
  "acidose metabólica hiperclorêmica",
  "hipovolemia + hiponatremia",
  "hipovolemia + hipercalemia",
  "Ringer lactato",
  "154",
  "NaCl 3%",
  "7,5%",
  "COLOIDES",
  "albumina humana",
  "síndrome nefrótica",
  "tetania",
  "torsades",
  "hipocalemia refratária",
  "gluconato de cálcio",
  "4,5 mg",
  "pH = 6,10",
  "relação [HCO3",
  "1 ponto abaixo",
  "hemoglobina",
  "tampão ósseo"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 20), i + 1100)).slice(0, 950));
}
