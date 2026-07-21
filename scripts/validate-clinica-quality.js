/**
 * Valida parts Clínica ou data/questions-clinica.json
 * Uso: node scripts/validate-clinica-quality.js [arquivo]
 */
const fs = require("fs");
const path = require("path");
const { hasBlacklist, looksLikeCliVignette, L } = require("./_parts/_cli_gold_lib.cjs");

const target = path.resolve(process.argv[2] || path.join(__dirname, "..", "data", "questions-clinica.json"));

function loadItems (file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  return raw.map((q, i) => {
    if (q.stem && Array.isArray(q.choices)) {
      return {
        id: q.id || ("q-" + i),
        stem: q.stem,
        choices: q.choices,
        explain: q.explain,
        trap: q.trap
      };
    }
    return {
      id: (q.idPrefix || "item") + "-" + String(q.n).padStart(3, "0"),
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
    if (hasBlacklist(q.stem) || (q.choices || []).some(hasBlacklist)) errs.push("boilerplate");
    if (!looksLikeCliVignette(q.stem)) errs.push("sem-vinheta");
    if (!q.choices || q.choices.length !== 5) errs.push("opts≠5");
    if ((q.choices || []).some((c) => /neste$| no$| ou$| com$| do$| da$/i.test(String(c).trim()))) {
      errs.push("opção-truncada");
    }
    if (L(q.explain || "") < 80) errs.push("explain-curto");
    if (errs.length) problems.push({ id: q.id, errs });
    else ok += 1;
  }
  console.log("Arquivo:", target);
  console.log("Total:", items.length, "| OK:", ok, "| Problemas:", problems.length);
  console.log("Taxa OK:", items.length ? ((100 * ok) / items.length).toFixed(1) + "%" : "n/a");
  problems.slice(0, 20).forEach((p) => console.log("-", p.id, p.errs.join(",")));
  if (problems.length > 20) console.log("... +" + (problems.length - 20) + " problemas");
  process.exit(problems.length ? 1 : 0);
}

main();
