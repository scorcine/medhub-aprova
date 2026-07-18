const fs = require("fs");
const t = fs.readFileSync("data/_extract_infecto/Inf1-full.txt", "utf8");
function c(s) {
  return s.replace(/\0/g, "").replace(/t\.me\/\S+/g, "").replace(/-- \d+ of \d+ --/g, "").replace(/proibida venda/gi, "").replace(/\s+/g, " ").trim();
}
const keys = [
  "abscesso hepático",
  "teclozan",
  "Giardia",
  "furazolidona",
  "anemia ferropriva",
  "corticoide",
  "ivermectina",
  "prurido anal",
  "fita adesiva",
  "solium",
  "saginata",
  "praziquantel",
  "cercária",
  "Symmers",
  "Kato",
  "oxamniquina",
  "larva migrans",
  "albendazol 400"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 40), i + 900)).slice(0, 850));
}
