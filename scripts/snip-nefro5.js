const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro5-full.txt", "utf8");
function c(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
console.log("LEN", t.length);
const keys = [
  "NEFROLITÍASE",
  "oxalato de cálcio",
  "estruvita",
  "ácido úrico",
  "cistina",
  "cólica",
  "TC",
  "LECO",
  "ureteroscopia",
  "HIPERPLASIA PROSTÁTICA",
  "IPSS",
  "alfa-bloqueador",
  "finasterida",
  "PSA",
  "CÂNCER DE PRÓSTATA",
  "Gleason",
  "bexiga",
  "rim",
  "células renais",
  "testículo",
  "OBSTRUÇÃO URINÁRIA",
  "refluxo",
  "DOENÇAS CÍSTICAS",
  "ADPKD",
  "policística",
  "HEMATÚRIA",
  "TURP",
  "tansulosina"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 20), i + 1000)).slice(0, 900));
}
