const fs = require("fs");
const t = fs.readFileSync("data/_extract_pneumo/Pneumo1-full.txt", "utf8");

function pageAt(idx) {
  const before = t.slice(0, idx);
  const ps = [...before.matchAll(/-- (\d+) of 205 --/g)];
  return ps.length ? ps[ps.length - 1][1] : "?";
}

const markers = [
  "DERRAME PLEURAL",
  "SARCOIDOSE",
  "PNEUMOTÓRAX",
  "VENTILAÇÃO MECÂNICA",
  "GASOMETRIA ARTERIAL",
  "ESPIROMETRIA",
  "HIPERTENSÃO PULMONAR",
  "BRONQUIECTASIA",
  "FIBROSE PULMONAR",
  "DOENÇA PULMONAR INTERSTICIAL",
  "PNEUMONIA",
  "SDRA",
  "APNEIA",
  "PANCOAST",
  "CRITÉRIOS DE LIGHT",
  "APÊNDICE",
  "CAPÍTULO 6",
  "CAP. 6",
  "PLEURA",
  "FUNÇÃO RESPIRATÓRIA"
];

for (const label of markers) {
  let i = 0;
  let n = 0;
  while ((i = t.indexOf(label, i)) !== -1 && n < 3) {
    console.log(label.padEnd(32), "p" + pageAt(i), "@", i);
    i += label.length;
    n++;
  }
}

// outline caps-like lines near page markers for p120-205
const lines = t.split(/\r?\n/);
let cur = 1;
const out = [];
for (const L of lines) {
  const pm = L.match(/-- (\d+) of 205 --/);
  if (pm) cur = Number(pm[1]);
  if (cur < 100) continue;
  const s = L.trim().replace(/\t.*/, "");
  if (
    s.length >= 10 &&
    s.length <= 80 &&
    s === s.toUpperCase() &&
    /[A-ZÁÉÍÓÚ]/.test(s) &&
    !s.includes("T.ME") &&
    !s.includes("PROIBIDA")
  ) {
    out.push("p" + cur + "\t" + s);
  }
}
console.log("\n--- outline p100+ ---");
[...new Set(out)].slice(0, 80).forEach((x) => console.log(x));
