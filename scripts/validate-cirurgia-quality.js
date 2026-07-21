/**
 * Valida qualidade v2 do banco Cirurgia (parts ou data/questions-cirurgia.json).
 * Uso: node scripts/validate-cirurgia-quality.js
 *      node scripts/validate-cirurgia-quality.js data/questions-cirurgia.json
 */
const fs = require("fs");
const path = require("path");
const { hasBlacklist, looksLikeVignette, L } = require("./_parts/_cir_gold_lib.cjs");

const arg = process.argv[2];
const target = arg
  ? path.resolve(arg)
  : path.join(__dirname, "..", "data", "questions-cirurgia.json");

function loadItems (file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(raw)) throw new Error("JSON deve ser array");
  // parts format vs published format
  return raw.map((q, i) => {
    if (q.stem && Array.isArray(q.choices)) {
      return {
        id: q.id || ("q-" + i),
        group: q.group,
        theme: q.theme,
        stem: q.stem,
        choices: q.choices,
        explain: q.explain,
        trap: q.trap
      };
    }
    return {
      id: (q.idPrefix || "item") + "-" + String(q.n).padStart(3, "0"),
      group: q.group,
      theme: q.theme,
      stem: q.stem,
      choices: [q.correct].concat(q.wrongs || []),
      explain: q.explain,
      trap: q.trap
    };
  });
}

function main () {
  const items = loadItems(target);
  let ok = 0;
  const problems = [];
  for (const q of items) {
    const errs = [];
    if (hasBlacklist(q.stem) || (q.choices || []).some(hasBlacklist)) {
      errs.push("boilerplate");
    }
    if (!looksLikeVignette(q.stem)) errs.push("sem-vinheta");
    if (!q.choices || q.choices.length !== 5) errs.push("opts≠5");
    if ((q.choices || []).some((c) => /neste$| no$| ou$| com$| do$| da$/i.test(String(c).trim()))) {
      errs.push("opção-truncada");
    }
    if (L(q.explain || "") < 80) errs.push("explain-curto");
    if (errs.length) problems.push({ id: q.id, errs, stem: String(q.stem || "").slice(0, 90) });
    else ok += 1;
  }
  console.log("Arquivo:", target);
  console.log("Total:", items.length, "| OK:", ok, "| Problemas:", problems.length);
  console.log("Taxa OK:", items.length ? ((100 * ok) / items.length).toFixed(1) + "%" : "n/a");
  problems.slice(0, 25).forEach((p) => {
    console.log("-", p.id, p.errs.join(","), "|", p.stem + "...");
  });
  if (problems.length > 25) console.log("... +" + (problems.length - 25) + " problemas");
  process.exit(problems.length ? 1 : 0);
}

main();
