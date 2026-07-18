const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro5-full.txt", "utf8");
function c(s) {
  return s.replace(/\0/g, "").replace(/t\.me\/\S+/g, "").replace(/-- \d+ of \d+ --/g, "").replace(/proibida venda/gi, "").replace(/\s+/g, " ").trim();
}
const keys = [
  "padrão-ouro",
  "tomografia",
  "LOCE",
  "litíase complicada",
  "tiazídicos",
  "alcalinização",
  "Proteus",
  "radiolúcido",
  "tríade clássica",
  "hematúria indolor",
  "BCG",
  "policística autossômica",
  "PKD1",
  "Bosniak",
  "hematúria glomerular",
  "síndrome de TUR",
  "RTUP",
  "5 mm",
  "medical expulsive"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 30), i + 900)).slice(0, 850));
}
