/**
 * Metas do banco Clínica médica (~2000), alinhadas à síntese Brasil
 * em data/stats-clinica-geral.json (pct relativo no bloco de Clínica).
 *
 * Uso: node scripts/clinica-targets.js
 */
const fs = require("fs");
const path = require("path");

const TARGET_TOTAL = 2000;

/** pct da síntese → meta arredondada (soma = 2000) */
const TARGETS = [
  { group: "Infectologia", pct: 18.3, target: 370 },
  { group: "Cardiologia", pct: 14.5, target: 290 },
  { group: "Pneumologia", pct: 12.5, target: 250 },
  { group: "Neurologia", pct: 11.7, target: 230 },
  { group: "Endocrinologia", pct: 10.3, target: 210 },
  { group: "Psiquiatria", pct: 10.2, target: 200 },
  { group: "Hematologia", pct: 7.7, target: 150 },
  { group: "Reumatologia", pct: 6.3, target: 130 },
  { group: "Nefrologia", pct: 5.1, target: 100 },
  { group: "Hepatologia", pct: 3.4, target: 70 }
];

function countByGroup () {
  const bankPath = path.join(__dirname, "..", "data", "questions-clinica.json");
  if (!fs.existsSync(bankPath)) return {};
  const q = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  const g = Object.create(null);
  q.forEach((x) => {
    g[x.group] = (g[x.group] || 0) + 1;
  });
  return { total: q.length, byGroup: g };
}

function main () {
  const { total, byGroup } = countByGroup();
  console.log("Atual:", total, "| Meta:", TARGET_TOTAL);
  console.log("");
  let needSum = 0;
  for (const t of TARGETS) {
    const cur = byGroup[t.group] || 0;
    const need = Math.max(0, t.target - cur);
    needSum += need;
    const bar = cur >= t.target ? "OK" : "+" + need;
    console.log(
      t.group.padEnd(16),
      String(cur).padStart(4) + " → " + String(t.target).padStart(4),
      `(${t.pct}%)`,
      bar
    );
  }
  console.log("");
  console.log("Faltam", needSum, "questões para bater as metas.");
  const sumT = TARGETS.reduce((a, b) => a + b.target, 0);
  if (sumT !== TARGET_TOTAL) {
    console.warn("AVISO: soma das metas =", sumT, "≠", TARGET_TOTAL);
  }
}

main();

module.exports = { TARGET_TOTAL, TARGETS };
