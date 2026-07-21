/**
 * Valida parts Preventiva ou data/questions-preventiva.json
 * Uso: node scripts/validate-prev-quality.js [arquivo]
 */
const fs = require("fs");
const path = require("path");
const { hasBlacklist, looksLikePrevVignette, L } = require("./_parts/_prev_gold_lib.cjs");

const target = path.resolve(process.argv[2] || path.join(__dirname, "..", "data", "questions-preventiva.json"));

function loadItems (file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  return raw.map((q, i) => {
    if (q.stem && Array.isArray(q.choices)) {
      return {
        id: q.id || ("q-" + i),
        stem: q.stem,
        choices: q.choices,
        answer: q.answer | 0,
        explain: q.explain,
        trap: q.trap
      };
    }
    return {
      id: (q.idPrefix || "item") + "-" + String(q.n).padStart(3, "0"),
      stem: q.stem,
      choices: [q.correct].concat(q.wrongs || []),
      answer: 0,
      explain: q.explain,
      trap: q.trap
    };
  });
}

function uniqueLongestIsAnswer (choices, answer) {
  const lens = (choices || []).map((c) => String(c || "").length);
  if (lens.length !== 5) return false;
  const max = Math.max.apply(null, lens);
  return lens.filter((l) => l === max).length === 1 && lens[answer] === max;
}

function main () {
  const items = loadItems(target);
  let ok = 0;
  let longestBias = 0;
  const problems = [];
  for (const q of items) {
    const errs = [];
    if (hasBlacklist(q.stem) || (q.choices || []).some(hasBlacklist)) errs.push("boilerplate");
    if (!looksLikePrevVignette(q.stem)) errs.push("sem-vinheta");
    if (!q.choices || q.choices.length !== 5) errs.push("opts≠5");
    if ((q.choices || []).some((c) => /neste$| no$| ou$| com$| do$| da$/i.test(String(c).trim()))) {
      errs.push("opção-truncada");
    }
    if (L(q.explain || "") < 80) errs.push("explain-curto");
    if (uniqueLongestIsAnswer(q.choices, q.answer)) {
      longestBias += 1;
      errs.push("viés-tamanho");
    }
    if (errs.length) problems.push({ id: q.id, errs });
    else ok += 1;
  }
  const biasPct = items.length ? (100 * longestBias) / items.length : 0;
  console.log("Arquivo:", target);
  console.log("Total:", items.length, "| OK:", ok, "| Problemas:", problems.length);
  console.log("Taxa OK:", items.length ? ((100 * ok) / items.length).toFixed(1) + "%" : "n/a");
  console.log("Viés tamanho (única mais longa = gabarito):", longestBias, "(" + biasPct.toFixed(1) + "%)");
  // Gate de banco: até 15% ainda pode ocorrer por acaso; acima disso falha
  if (biasPct > 15) {
    console.log("FALHA: viés de tamanho acima de 15%.");
    process.exit(1);
  }
  problems.slice(0, 20).forEach((p) => console.log("-", p.id, p.errs.join(",")));
  // Problemas individuais de viés-tamanho não derrubam se o % global passou
  const hard = problems.filter((p) => p.errs.some((e) => e !== "viés-tamanho"));
  process.exit(hard.length ? 1 : 0);
}

main();
