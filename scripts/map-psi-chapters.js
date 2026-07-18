const fs = require("fs");
const t = fs.readFileSync("data/_extract_psi/Psi-full.txt", "utf8");

const re = /CAP[IÍ]TULO\s+(\d+)/g;
let m;
const caps = [];
while ((m = re.exec(t))) {
  const after = t.slice(m.index, m.index + 300).replace(/\s+/g, " ");
  const before = t.slice(Math.max(0, m.index - 100), m.index);
  const pg = (before.match(/-- (\d+) of 81 --/) || [])[1];
  caps.push({ n: m[1], pg, snippet: after.slice(0, 160) });
}
console.log("CAP markers", caps.length);
caps.forEach((c) => console.log("Cap", c.n, "p~" + c.pg, c.snippet));

const titles = [
  "TRANSTORNOS MENTAIS ORGÂNICOS",
  "TRANSTORNOS DO HUMOR",
  "TRANSTORNOS DEPRESSIVOS",
  "TRANSTORNO BIPOLAR",
  "ESQUIZOFRENIA",
  "TRANSTORNOS DE ANSIEDADE",
  "TRANSTORNO DO PÂNICO",
  "TRANSTORNO OBSESSIVO",
  "TRANSTORNOS RELACIONADOS A SUBSTÂNCIAS",
  "ÁLCOOL",
  "DEPENDÊNCIA",
  "TRANSTORNOS ALIMENTARES",
  "TRANSTORNOS DE PERSONALIDADE",
  "PSICOFARMACOLOGIA",
  "ANTIDEPRESSIVOS",
  "ANTIPSICÓTICOS",
  "ESTABILIZADORES",
  "SUICÍDIO",
  "INTOXICAÇÕES"
];
const U = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
for (const title of titles) {
  const kn = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const i = U.indexOf(kn);
  if (i < 0) {
    console.log("MISS", title);
    continue;
  }
  const before = t.slice(Math.max(0, i - 120), i);
  const pg = (before.match(/-- (\d+) of 81 --/) || [])[1];
  console.log("HIT", title, "p~" + pg, "@", i);
}
