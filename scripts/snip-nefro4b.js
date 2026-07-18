const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro4-full.txt", "utf8");
function c(s) {
  return s.replace(/\0/g, "").replace(/t\.me\/\S+/g, "").replace(/-- \d+ of \d+ --/g, "").replace(/proibida venda/gi, "").replace(/\s+/g, " ").trim();
}
const keys = [
  "Indicações de diálise de urgência",
  "Tab. 13",
  "Dopamina em dose",
  "ureia/creatinina",
  "CKD-EPI",
  "G3a",
  "A1",
  "A3",
  "130 x 80",
  "anemia da DRC",
  "eritropoese",
  "ferritina",
  "pericardite",
  "neuropatia",
  "sevelâmer",
  "PTH",
  "TFG < 15",
  "quando iniciar diálise",
  "diabética",
  "causas de DRC",
  "IECA"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 30), i + 950)).slice(0, 880));
}
