/**
 * Enriquece MAPA.md com foco R1 e ordem sugerida de apostilas.
 */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_infecto");
const summary = JSON.parse(fs.readFileSync(path.join(DIR, "summary.json"), "utf8"));

const plan = [
  {
    file: "Inf1.pdf",
    focus: "Parasitoses intestinais + esquistossomose",
    groups: ["Amebíase/giárdia", "Helmintos (áscaris, strongyloides, ancilo…)", "Esquistossomose"],
    bank: "Médio (BR: strongyloides, esquito, áscaris/Loeffler)"
  },
  {
    file: "Inf2.pdf",
    focus: "PAC / pneumonia + antibióticos + supurativas",
    groups: ["PAC típica/atípica", "Conduta/CURB/internação", "Antibióticos práticos", "Abscesso pulmonar"],
    bank: "Máximo (pneumonia lidera keywords; ATB cai muito)"
  },
  {
    file: "Inf3.pdf",
    focus: "HIV/AIDS e infecções oportunistas",
    groups: ["Bases HIV/CD4", "OI respiratórias (PCP, TB, PCM, histo)", "OI SNC (toxo, crypto)", "Profilaxias"],
    bank: "Alto (HIV + OI clássicas de prova)"
  },
  {
    file: "INf4.pdf",
    focus: "ITU + pele/partes moles + osteomielite",
    groups: ["ITU baixa/alta/gestante", "Celulite/erisipela", "Osteomielite"],
    bank: "Alto (ITU e pele são cotidianos R1)"
  },
  {
    file: "Inf5.pdf",
    focus: "Arboviroses e febres tropicais",
    groups: ["Dengue", "Chik/Zika/FA", "Lepto/calazar", "Malária", "Maculosa/tifoide/COVID/mpox"],
    bank: "Máximo Enare/BR (dengue, malária, lepto)"
  }
];

let md = fs.readFileSync(path.join(DIR, "MAPA.md"), "utf8");
md += "\n---\n\n## Plano de flashcards (mesmos passos da Nefro)\n\n";
md += "| Apostila | Foco | Yield R1 |\n|----------|------|----------|\n";
for (const p of plan) {
  const s = summary.find((x) => x.file.toLowerCase() === p.file.toLowerCase());
  const pages = s ? s.pagesEst : "?";
  md += `| ${p.file} (~${pages}p) | ${p.focus} | ${p.bank} |\n`;
}
md += "\n### Ordem sugerida\n\n";
md += "1. **Inf2** (pneumonia/ATB) e **Inf5** (arbovírus) — maior yield\n";
md += "2. **Inf4** (ITU/pele/osso) e **Inf3** (HIV)\n";
md += "3. **Inf1** (parasitoses) — fechar tropical\n\n";
md += "Na prática seguimos **apostila 1 → 5** como na Nefro, se você preferir a ordem do material.\n\n";
md += "### Wiring\n\n";
md += "- Prefixo decks: `infc-`\n";
md += "- specialty: `clinica` · area: `infectologia`\n";
md += "- Evitar `inf-` (já usado em Pediatria: dengue/sepse)\n";

fs.writeFileSync(path.join(DIR, "MAPA.md"), md, "utf8");
console.log("updated MAPA.md");
