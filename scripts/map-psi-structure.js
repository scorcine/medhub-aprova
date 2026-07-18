const fs = require("fs");
const t = fs.readFileSync("data/_extract_psi/Psi-full.txt", "utf8");

// page index
const pageAt = (idx) => {
  const before = t.slice(0, idx);
  const ms = [...before.matchAll(/-- (\d+) of 81 --/g)];
  return ms.length ? ms[ms.length - 1][1] : "?";
};

const markers = [
  "CAPÍTULO 1",
  "CAPÍTULO 2",
  "CAPÍTULO 3",
  "CAPÍTULO 4",
  "CAPÍTULO 5",
  "CAPÍTULO 6",
  "CAPÍTULO 7",
  "CAPÍTULO 8",
  "CAPÍTULO 9",
  "CAPÍTULO 10",
  "DELIRIUM",
  "DEMÊNCIA",
  "SUBSTÂNCIAS PSICOATIVAS",
  "ÁLCOOL",
  "ESQUIZOFRENIA",
  "TRANSTORNOS DO HUMOR",
  "TRANSTORNO BIPOLAR",
  "TRANSTORNOS DEPRESSIVOS",
  "TRANSTORNOS DE ANSIEDADE",
  "TRANSTORNO DO PÂNICO",
  "TRANSTORNO OBSESSIVO-COMPULSIVO",
  "TRANSTORNOS ALIMENTARES",
  "TRANSTORNOS DE PERSONALIDADE",
  "ANTIDEPRESSIVOS",
  "ANTIPSICÓTICOS",
  "ESTABILIZADORES DO HUMOR",
  "LÍTIO",
  "BENZODIAZEPÍNICOS",
  "SUICÍDIO",
  "PROCHASKA"
];

for (const label of markers) {
  let idx = 0;
  let n = 0;
  while ((idx = t.indexOf(label, idx)) !== -1 && n < 2) {
    console.log(label.padEnd(36), "p", pageAt(idx), "@", idx);
    idx += label.length;
    n++;
  }
  if (n === 0) console.log(label.padEnd(36), "MISS");
}

// dump TOC-like lines with page numbers for first occurrence of ALLCAPS headers 20-80 chars on own line
const lines = t.split(/\r?\n/);
let curPage = 1;
const out = [];
for (const L of lines) {
  const pm = L.match(/-- (\d+) of 81 --/);
  if (pm) curPage = Number(pm[1]);
  const s = L.trim();
  if (
    s.length >= 12 &&
    s.length <= 90 &&
    s === s.toUpperCase() &&
    /[A-ZÁÉÍÓÚ]/.test(s) &&
    !s.includes("T.ME") &&
    !s.includes("PROIBIDA")
  ) {
    out.push("p" + curPage + "\t" + s.replace(/\t.*/, ""));
  }
}
fs.writeFileSync("data/_extract_psi/Psi-outline.txt", [...new Set(out)].join("\n"));
console.log("outline lines", new Set(out).size);
