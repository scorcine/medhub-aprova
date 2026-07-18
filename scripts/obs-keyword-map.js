const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_obs");

const keys = [
  "fórcipe",
  "vácuo",
  "cardiotocografia",
  "doppler",
  "perfil biofísico",
  "rciu",
  "restrição de crescimento",
  "isoimunização",
  "doença hemolítica",
  "puerpério",
  "hemorragia pós-parto",
  "infecção puerperal",
  "diagnóstico de gravidez",
  "pré-natal",
  "nägele",
  "ácido fólico",
  "toxoplasmose",
  "sífilis",
  "hiv",
  "anemia",
  "parto",
  "partograma",
  "cesárea",
  "indução",
  "distocia",
  "ombro",
  "rpm",
  "rpmo",
  "trabalho de parto prematuro",
  "abortamento",
  "ectópica",
  "mola",
  "trofoblástica",
  "placenta prévia",
  "descolamento",
  "acretismo",
  "rotura uterina",
  "pré-eclâmpsia",
  "eclâmpsia",
  "hellp",
  "diabetes gestacional",
  "gemelar"
];

const out = {};
for (let n = 1; n <= 5; n++) {
  const t = fs.readFileSync(path.join(DIR, `Obs${n}-full.txt`), "utf8").toLowerCase();
  const hits = {};
  for (const k of keys) {
    const nHits = t.split(k.toLowerCase()).length - 1;
    if (nHits) hits[k] = nHits;
  }
  out[`Obs${n}`] = Object.entries(hits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  console.log("\nObs" + n);
  out[`Obs${n}`].forEach(([k, v]) => console.log(" ", String(v).padStart(4), k));
}

fs.writeFileSync(path.join(DIR, "keyword-map.json"), JSON.stringify(out, null, 2));
