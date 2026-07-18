const fs = require("fs");
const t = fs.readFileSync("data/_extract_infecto/Inf4-full.txt", "utf8");
function c(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
const keys = [
  "não complicada",
  "complicada",
  "E. coli",
  "Proteus",
  "S. saprophyticus",
  "S. aureus",
  "bacteriúria assintomática",
  "gestante",
  "homem",
  "nitrofurantoína",
  "fosfomicina",
  "TMP",
  "ciprofloxacino",
  "pielonefrite",
  "cistite",
  "prostatite",
  "105",
  "10^5",
  "urocultura",
  "piúria",
  "cateter",
  "erisipela",
  "celulite",
  "impetigo",
  "furúnculo",
  "abscesso",
  "fasciíte",
  "fascite",
  "necrotizante",
  "osteomielite",
  "hematogênica",
  "contígua",
  "Sequela",
  "sequestro",
  "involucro",
  "oxacilina",
  "vancomicina",
  "clindamicina",
  "MRSA",
  "Streptococcus",
  "APÊNDICE 2",
  "APÊNDICE 3",
  "3 dias",
  "7 dias",
  "14 dias",
  "profilaxia",
  "recurrente",
  "recorrente"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n##", k, "@" + i);
  if (i < 0) continue;
  console.log(c(t.slice(Math.max(0, i - 60), i + 400)));
}
