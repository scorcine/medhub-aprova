/** Metas Preventiva (~350) alinhadas aos grupos dos flashcards. */
const TARGET_TOTAL = 350;
const TARGETS = [
  { group: "SUS · APS · programas", target: 140, file: "prev-sus1.json" },
  { group: "Epidemiologia · estudos · testes", target: 90, file: "prev-epi1.json" },
  { group: "Vigilância · HND · ética", target: 70, file: "prev-vig1.json" },
  { group: "Indicadores · mortalidade · Swaroop-Uemura", target: 50, file: "prev-ind1.json" }
];

console.log("Meta total:", TARGET_TOTAL, "soma:", TARGETS.reduce((a, t) => a + t.target, 0));
TARGETS.forEach((t) => console.log(t.file.padEnd(16), t.group, "→", t.target));
module.exports = { TARGET_TOTAL, TARGETS };
