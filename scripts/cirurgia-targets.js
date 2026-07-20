/**
 * Metas do banco Cirurgia (~2000), alinhadas à síntese Brasil
 * (data/stats-cirurgia-geral.json) e aos 19 grupos dos flashcards.
 *
 * Uso: node scripts/cirurgia-targets.js
 */
const fs = require("fs");
const path = require("path");

const TARGET_TOTAL = 2000;

/**
 * pct aproximado → meta (soma = 2000).
 * Trauma agregado ~23.5% repartido nos 4 módulos de flashcards.
 */
const TARGETS = [
  { group: "Abdome agudo", pct: 19.0, target: 380 },
  { group: "Trauma · ATLS e choque", pct: 7.5, target: 150 },
  { group: "Trauma torácico", pct: 5.5, target: 110 },
  { group: "Trauma abdominal e pelve", pct: 5.0, target: 100 },
  { group: "TCE · pescoço · face", pct: 4.5, target: 90 },
  { group: "Urologia", pct: 9.0, target: 180 },
  { group: "Cirurgia infantil", pct: 8.5, target: 170 },
  { group: "Pré-operatório", pct: 7.0, target: 140 },
  { group: "Colorretal e proctologia", pct: 7.0, target: 140 },
  { group: "Pós-operatório e infecção", pct: 5.0, target: 100 },
  { group: "Digestivo alto e bariátrica", pct: 5.0, target: 100 },
  { group: "Hérnias da parede", pct: 4.0, target: 80 },
  { group: "Cirurgia vascular", pct: 3.0, target: 60 },
  { group: "Queimaduras e plástica", pct: 2.5, target: 50 },
  { group: "Anestesia e técnica", pct: 2.0, target: 40 },
  { group: "Fígado e pâncreas", pct: 2.0, target: 40 },
  { group: "Cabeça/pescoço · mama · tireoide", pct: 1.5, target: 30 },
  { group: "Tórax eletivo", pct: 1.0, target: 20 },
  { group: "Sepse · nutrição · miscelânea", pct: 1.0, target: 20 }
];

function countByGroup () {
  const bankPath = path.join(__dirname, "..", "data", "questions-cirurgia.json");
  if (!fs.existsSync(bankPath)) return { total: 0, byGroup: {} };
  const q = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  const g = Object.create(null);
  q.forEach((x) => {
    // ignora scaffold
    if (String(x.theme || "").startsWith("Scaffold")) return;
    g[x.group] = (g[x.group] || 0) + 1;
  });
  const total = Object.values(g).reduce((a, b) => a + b, 0);
  return { total, byGroup: g };
}

function main () {
  const { total, byGroup } = countByGroup();
  console.log("Atual (sem scaffold):", total, "| Meta:", TARGET_TOTAL);
  console.log("");
  let needSum = 0;
  for (const t of TARGETS) {
    const cur = byGroup[t.group] || 0;
    const need = Math.max(0, t.target - cur);
    needSum += need;
    console.log(
      t.group.padEnd(36),
      String(cur).padStart(4) + " → " + String(t.target).padStart(4),
      `(~${t.pct}%)`,
      cur >= t.target ? "OK" : "+" + need
    );
  }
  const sumT = TARGETS.reduce((a, b) => a + b.target, 0);
  console.log("");
  console.log("Soma metas:", sumT, "| Faltam", needSum);
  if (sumT !== TARGET_TOTAL) console.warn("AVISO soma ≠", TARGET_TOTAL);
}

main();
module.exports = { TARGET_TOTAL, TARGETS };
