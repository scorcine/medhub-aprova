const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro3-full.txt", "utf8");
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
  "SOLUÇÕES HIDROELETROLÍTICAS",
  "soro fisiológico",
  "0,9%",
  "Ringer",
  "lactato",
  "glicosado",
  "hipotônico",
  "hipertônico",
  "coloides",
  "albumina",
  "manitol",
  "bicarbonato",
  "KCl",
  "cloreto de potássio",
  "HIPOMAGNESEMIA",
  "HIPERMAGNESEMIA",
  "Mg <",
  "sulfato de magnésio",
  "tampão",
  "Henderson",
  "pKa",
  "ácido carbônico",
  "fosfato",
  "proteína",
  "ânion gap",
  "anion gap",
  "base excess",
  "Stewart"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 30), i + 1000)).slice(0, 900));
}
