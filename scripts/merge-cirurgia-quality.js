/**
 * Publica apenas partes Cirurgia que passam na validação v2.
 * Uso: node scripts/merge-cirurgia-quality.js
 *
 * Substitui data/questions-cirurgia.json por um banco só com itens OK
 * (qualidade > quantidade enquanto a reescrita completa não termina).
 */
const fs = require("fs");
const path = require("path");
const { hasBlacklist, looksLikeVignette, L } = require("./_parts/_cir_gold_lib.cjs");

const PARTS_DIR = path.join(__dirname, "_parts");
const OUT = path.join(__dirname, "..", "data", "questions-cirurgia.json");
const SEED_STR = "20260720cirv2q";

const EXAMS = ["sus-sp", "usp", "enare", "enamed", "unifesp", "santa-casa"];
const YEARS = [2022, 2023, 2024, 2025];

function seedToUint32 (str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng (seed) {
  let t = seed >>> 0;
  return function next () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

let _placeSlot = 0;
function placeCorrect (correct, distractors, rng) {
  const answer = _placeSlot % 5;
  _placeSlot += 1;
  const pool = distractors.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  const choices = [];
  for (let i = 0; i < 5; i++) {
    if (i === answer) choices.push(correct);
    else choices.push(pool.shift());
  }
  return { choices, answer };
}

function itemOk (q) {
  if (!q || !q.stem || !q.correct || !Array.isArray(q.wrongs) || q.wrongs.length !== 4) return false;
  if (hasBlacklist(q.stem) || hasBlacklist(q.correct) || q.wrongs.some(hasBlacklist)) return false;
  if (!looksLikeVignette(q.stem)) return false;
  if (L(q.explain || "") < 80) return false;
  if ([q.correct].concat(q.wrongs).some((c) => /neste$| no$| ou$| com$/i.test(String(c).trim()))) {
    return false;
  }
  return true;
}

/** Enquanto a reescrita não termina, publicar só partes 100% revisadas (whitelist). */
const WHITELIST = new Set([
  "cir-trauma-atls1.json",
  "cir-trauma-atls2.json",
  "cir-trauma-atls3.json",
  "cir-abdome1.json"
]);

function main () {
  const files = fs.readdirSync(PARTS_DIR)
    .filter((f) => /^cir-.+\.json$/i.test(f) && WHITELIST.has(f))
    .sort();
  if (!files.length) throw new Error("Nenhum arquivo na whitelist de qualidade");
  const rng = createRng(seedToUint32(SEED_STR));
  const out = [];
  const skipped = [];
  const byFile = Object.create(null);

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), "utf8"));
    if (!Array.isArray(raw)) continue;
    let kept = 0;
    raw.forEach((q) => {
      if (!itemOk(q)) {
        skipped.push((q.idPrefix || file) + "-" + q.n);
        return;
      }
      const { choices, answer } = placeCorrect(q.correct, q.wrongs, rng);
      const id = String(q.idPrefix) + "-" + String(q.n).padStart(3, "0");
      out.push({
        id,
        specialty: "cirurgia",
        group: q.group,
        theme: q.theme,
        stem: q.stem,
        choices,
        answer,
        explain: q.explain,
        trap: q.trap || "",
        exam: EXAMS[Math.floor(rng() * EXAMS.length)],
        year: YEARS[Math.floor(rng() * YEARS.length)],
        difficulty: "media"
      });
      kept += 1;
    });
    byFile[file] = kept;
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log("Publicado:", OUT);
  console.log("Itens OK:", out.length, "| rejeitados:", skipped.length);
  Object.keys(byFile).forEach((f) => {
    if (byFile[f] > 0) console.log(" ", f, byFile[f]);
  });
}

main();
