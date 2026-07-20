/**
 * Anti-duplicata local (sem Pinecone): similaridade de stems por bigramas.
 * Uso:
 *   node scripts/audit-clinica-dupes.js
 *   node scripts/audit-clinica-dupes.js scripts/_parts/cli-infecto4.json
 *
 * Saída: pares com Jaccard ≥ limiar (default 0.55) para revisão.
 */
const fs = require("fs");
const path = require("path");

const BANK = path.join(__dirname, "..", "data", "questions-clinica.json");
const PARTS = path.join(__dirname, "_parts");
const DEFAULT_THRESHOLD = 0.55;

function normalize (s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams (s) {
  const t = normalize(s);
  const set = new Set();
  if (t.length < 2) {
    set.add(t);
    return set;
  }
  for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2));
  return set;
}

function jaccard (a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function loadBank () {
  if (!fs.existsSync(BANK)) return [];
  return JSON.parse(fs.readFileSync(BANK, "utf8")).map((q) => ({
    id: q.id,
    group: q.group,
    theme: q.theme,
    stem: q.stem,
    source: "bank"
  }));
}

function loadPart (filePath) {
  const arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return arr.map((q, i) => ({
    id: `${q.idPrefix || "part"}-${q.n || i + 1}`,
    group: q.group,
    theme: q.theme,
    stem: q.stem,
    source: path.basename(filePath)
  }));
}

function findDupes (items, threshold) {
  const grams = items.map((q) => bigrams(q.stem));
  const hits = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].group && items[j].group && items[i].group !== items[j].group) continue;
      const score = jaccard(grams[i], grams[j]);
      if (score >= threshold) {
        hits.push({
          score: Number(score.toFixed(3)),
          a: { id: items[i].id, theme: items[i].theme, source: items[i].source },
          b: { id: items[j].id, theme: items[j].theme, source: items[j].source }
        });
      }
    }
  }
  hits.sort((x, y) => y.score - x.score);
  return hits;
}

function main () {
  const threshold = Number(process.env.DUP_THRESHOLD || DEFAULT_THRESHOLD);
  const extra = process.argv.slice(2);
  let items = loadBank();

  if (extra.length) {
    for (const f of extra) {
      const p = path.isAbsolute(f) ? f : path.join(process.cwd(), f);
      items = items.concat(loadPart(p));
    }
  }

  console.log("Itens:", items.length, "| limiar Jaccard:", threshold);
  const hits = findDupes(items, threshold);
  console.log("Pares suspeitos:", hits.length);
  hits.slice(0, 40).forEach((h) => {
    console.log(
      h.score,
      h.a.id,
      "(" + h.a.source + ")",
      "<->",
      h.b.id,
      "(" + h.b.source + ")",
      "|",
      (h.a.theme || "").slice(0, 40)
    );
  });
  if (hits.length > 40) console.log("... +" + (hits.length - 40) + " pares");

  const out = path.join(__dirname, "..", "data", "_clinica-dupes-report.json");
  fs.writeFileSync(out, JSON.stringify({ threshold, count: hits.length, hits }, null, 2));
  console.log("Relatório:", out);
}

main();
