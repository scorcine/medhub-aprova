/** Metas GO (~500) alinhadas aos grupos dos flashcards. */
const TARGET_TOTAL = 500;
const TARGETS = [
  { group: "Endócrino / ciclo", target: 90, file: "go-gin1.json" },
  { group: "SUA / miomatose", target: 50, file: "go-gin2.json" },
  { group: "Climatério / urogin", target: 25, file: "go-gin3.json" },
  { group: "Mastologia / ovário", target: 55, file: "go-gin4.json" },
  { group: "Oncoginecologia", target: 55, file: "go-gin5.json" },
  { group: "Infecto / IST", target: 35, file: "go-gin6.json" },
  { group: "Parto operatório · Med. fetal · Puerpério", target: 35, file: "go-obs1.json" },
  { group: "Diagnóstico de gravidez · Pré-natal", target: 35, file: "go-obs2.json" },
  { group: "Parto · RPMO · Prematuridade", target: 40, file: "go-obs3.json" },
  { group: "Sangramentos na gestação", target: 40, file: "go-obs4.json" },
  { group: "HAS · Diabetes · Gemelaridade", target: 40, file: "go-obs5.json" }
];

console.log("Meta total:", TARGET_TOTAL, "soma:", TARGETS.reduce((a, t) => a + t.target, 0));
TARGETS.forEach((t) => console.log(t.file.padEnd(14), t.group, "→", t.target));
module.exports = { TARGET_TOTAL, TARGETS };
