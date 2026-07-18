const fs = require("fs");
const t = fs.readFileSync("data/_extract_infecto/Inf3-full.txt", "utf8");
function c(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
console.log("START", c(t.slice(0, 2500)));
console.log("\n---\n");
const keys = [
  "HIV",
  "TARV",
  "CD4",
  "jirovec",
  "TMP",
  "toxoplasmose",
  "criptococo",
  "MAC",
  "profilaxia primária",
  "claritromicina",
  "azitromicina",
  "histoplasmose",
  "paracoccidioidomicose",
  "Kaposi",
  "linfoma",
  "carcinoma cervical",
  "retinite",
  "ganciclovir",
  "valganciclovir",
  "CMV",
  "candidíase",
  "esofagite",
  "Cryptosporidium",
  "Isospora",
  "Microsporidia",
  "reconstituição",
  "tenofovir",
  "lamivudina",
  "encefalopatia",
  "mielopatia vacuolar",
  "Chagas",
  "Rhodococcus",
  "PCM",
  "aspergilose",
  "HHV-8",
  "pirimetamina",
  "sulfadiazina",
  "anfotericina",
  "fluconazol",
  "enteropatia",
  "hepatite B",
  "hepatite C"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n##", k, "@" + i);
  if (i < 0) continue;
  console.log(c(t.slice(Math.max(0, i - 40), i + 380)));
}
