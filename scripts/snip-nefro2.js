const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro2-full.txt", "utf8");
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
  "DOENÇAS TUBULOINTERSTICIAIS",
  "nefrite intersticial aguda",
  "NTIA",
  "pielonefrite",
  "nefropatia por refluxo",
  "necrose papilar",
  "nefropatia analgésica",
  "AINES",
  "AINEs",
  "líti",
  "lítio",
  "DOENÇA VASCULAR ISQUÊMICA",
  "estenose de artéria renal",
  "hipertensão renovascular",
  "fibrodisplasia",
  "aterosclerótica",
  "captopril",
  "IECA",
  "tromboembolismo renal",
  "infarto renal",
  "necrose cortical",
  "síndrome hemolítico",
  "SHU",
  "PTT",
  "microangiopatia",
  "escleros",
  "nefroesclerose",
  "amiloidose",
  "Fanconi",
  "acidose tubular",
  "ATR",
  "diabetes insipidus nefrogênico",
  "glicosúria renal",
  "cistinúria",
  "AMINOglicosídeo",
  "contraste",
  "rabdomiólise",
  "mioglobina"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(i, i + 1100)).slice(0, 920));
}
