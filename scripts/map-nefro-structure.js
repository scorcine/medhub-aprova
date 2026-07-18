const fs = require("fs");
const path = require("path");
const DIR = "data/_extract_nefro";

function pageAt(t, idx) {
  const before = t.slice(0, idx);
  const re = /-- (\d+) of (\d+) --/g;
  let m;
  let last = "?";
  while ((m = re.exec(before))) last = m[1];
  return last;
}

function clean(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

const files = ["Nefro1", "Nefro2", "Nefro3", "Nefro4", "Nefro5"];
let md = "# Nefrologia · mapa (análise pré-flashcards)\n\nFonte: `D:\\\\MedHub R1\\\\CM\\\\Nefrologia`\n\n";

for (const base of files) {
  const t = fs.readFileSync(path.join(DIR, base + "-full.txt"), "utf8");
  const pages = (t.match(/-- \d+ of (\d+) --/) || [])[1] || "?";
  console.log("\n====", base, "p", pages, "====");
  md += `## ${base}.pdf (~${pages}p)\n\n`;

  const re = /(?:CAP\.\s*|CAP[IÍ]TULO\.?\s*|AP[EÊ]NDICE\s*)(\d+)/gi;
  let m;
  const hits = [];
  while ((m = re.exec(t))) {
    if (hits.length && Math.abs(hits[hits.length - 1].idx - m.index) < 100) continue;
    const snip = clean(t.slice(m.index, m.index + 160)).slice(0, 120);
    hits.push({ label: m[0].replace(/\s+/g, " "), p: pageAt(t, m.index), idx: m.index, snip });
  }
  for (const h of hits) {
    console.log(h.label.padEnd(18), "p~" + h.p, h.snip);
    md += `- **${h.label}** (p~${h.p}): ${h.snip}\n`;
  }
  md += "\n";
}

fs.writeFileSync(path.join(DIR, "MAPA.md"), md, "utf8");
console.log("\nwrote MAPA.md");
