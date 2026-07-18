/**
 * Fecha lacunas da auditoria Hep1–4:
 * - Profilaxia pós-exposição HBV (HBIg/IGHAHB)
 * - Classificação O’Grady (hiperaguda/aguda/subaguda)
 */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "data", "flashcards-hepato.json");
const decks = JSON.parse(fs.readFileSync(out, "utf8"));
const byId = new Map(decks.map((d) => [d.id, d]));

function addCards(id, cards) {
  const d = byId.get(id);
  if (!d) throw new Error("deck missing " + id);
  const fronts = new Set(d.cards.map((c) => c.front));
  let n = 0;
  for (const c of cards) {
    if (fronts.has(c.front)) continue;
    d.cards.push(c);
    fronts.add(c.front);
    n++;
  }
  console.log("+", n, "→", id, "(total", d.cards.length + ")");
}

addCards("hep-hbv-aguda", [
  {
    front: "Profilaxia pós-exposição ao HBV — o que usar se não vacinado?",
    back: "Imunoglobulina humana anti-HBV (IGHAHB / HBIg) · Obtida de plasma com altos títulos de anti-HBs · Associar vacinação quando indicada"
  },
  {
    front: "HBIg pós-exposição — janela de tempo?",
    back: "Percutânea: benefício até 7 dias (preferir nas primeiras 24h) · Sexual: até 14 dias"
  }
]);

addCards("hep-fulminante", [
  {
    front: "Classificação de O’Grady da insuficiência hepática aguda?",
    back: "Hiperaguda: EH nos primeiros 7 dias · Aguda: EH entre 8–28 dias · Subaguda: EH entre 4–24 semanas"
  },
  {
    front: "Hiperaguda × subaguda — prognóstico citado?",
    back: "Hiperaguda: mais edema cerebral, mas maior chance de recuperação espontânea · Subaguda/subfulminante: menos edema cerebral, maior chance de precisar de transplante"
  }
]);

const merged = Array.from(byId.values());
fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(
  "wrote",
  merged.length,
  "decks ·",
  merged.reduce((n, d) => n + d.cards.length, 0),
  "cards"
);
