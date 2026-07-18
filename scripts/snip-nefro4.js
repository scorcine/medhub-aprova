const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro4-full.txt", "utf8");
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
  "INJÚRIA RENAL AGUDA",
  "KDIGO",
  "AKIN",
  "RIFLE",
  "pré-renal",
  "intrínseca",
  "pós-renal",
  "FENa",
  "indicação de diálise",
  "AEIOU",
  "DOENÇA RENAL CRÔNICA",
  "estágios",
  "TFG",
  "albuminúria",
  "KDIGO",
  "uremia",
  "anemia",
  "eritropoetina",
  "hiperparatireoidismo",
  "CKD-MBD",
  "fósforo",
  "hemodiálise",
  "diálise peritoneal",
  "fístula",
  "transplante",
  "indicação de diálise na DRC",
  "clearance",
  "creatinina",
  "oligúria",
  "cardiorrenal"
];
const seen = new Set();
for (const k of keys) {
  if (seen.has(k.toLowerCase())) continue;
  seen.add(k.toLowerCase());
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 20), i + 1000)).slice(0, 900));
}
