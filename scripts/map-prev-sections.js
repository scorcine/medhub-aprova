const fs = require("fs");
const path = require("path");

function sections(n) {
  const t = fs.readFileSync(path.join(__dirname, `../data/_extract_prev/Prev${n}-full.txt`), "utf8");
  const lines = t
    .split(/\n/)
    .map((l) => l.replace(/\t/g, " ").trim())
    .filter(Boolean);
  const out = [];
  for (const L of lines) {
    const m = L.match(/^([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 /\-()]{8,80})\s+\1$/);
    if (m) {
      out.push(m[1].trim());
      continue;
    }
    if (
      L === L.toUpperCase() &&
      L.length >= 12 &&
      L.length <= 90 &&
      /[A-ZÁÉÍÓÚ]{3}/.test(L) &&
      !/T\.ME|PROIBIDA|PÁGINA|FIGURA|TABELA|MEDHUB|QUEST|TESTE SEU|SAIBA MAIS|HTTP|WWW/.test(L)
    ) {
      if (((L.match(/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g) || []).length) < 8) continue;
      out.push(L);
    }
  }
  const seen = new Set();
  const uniq = [];
  for (const x of out) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(x);
  }
  console.log(`\n==== Prev${n} sections (${uniq.length}) ====`);
  uniq.slice(0, 100).forEach((x) => console.log(x));
}

[1, 2, 3, 4].forEach(sections);
