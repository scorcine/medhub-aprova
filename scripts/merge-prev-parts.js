/**
 * Junta scripts/_parts/prev-*.json → data/questions-preventiva.json (gate v2).
 * Uso: node scripts/merge-prev-parts.js
 */
const fs = require("fs");
const path = require("path");
const { hasBlacklist, looksLikePrevVignette, L } = require("./_parts/_prev_gold_lib.cjs");

const PARTS_DIR = path.join(__dirname, "_parts");
const OUT = path.join(__dirname, "..", "data", "questions-preventiva.json");
const SEED_STR = "20260720prevv2";

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
  if (!looksLikePrevVignette(q.stem)) return false;
  if (L(q.explain || "") < 80) return false;
  if ([q.correct].concat(q.wrongs).some((c) => /neste$| no$| ou$| com$/i.test(String(c).trim()))) {
    return false;
  }
  return true;
}

function main () {
  const files = fs.readdirSync(PARTS_DIR)
    .filter((f) => /^prev-(sus|epi|vig|ind).*\.json$/i.test(f))
    .sort();
  if (!files.length) throw new Error("Nenhum prev-sus/epi/vig/ind*.json em scripts/_parts");

  const rng = createRng(seedToUint32(SEED_STR));
  const out = [];
  let rejected = 0;

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), "utf8"));
    if (!Array.isArray(raw)) continue;
    let kept = 0;
    raw.forEach((q) => {
      if (!itemOk(q)) {
        rejected += 1;
        return;
      }
      const { choices, answer } = placeCorrect(q.correct, q.wrongs, rng);
      out.push({
        id: String(q.idPrefix) + "-" + String(q.n).padStart(3, "0"),
        specialty: "preventiva",
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
    console.log(file, kept);
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log("Publicado:", OUT, "| OK:", out.length, "| rejeitados:", rejected);
}

main();
