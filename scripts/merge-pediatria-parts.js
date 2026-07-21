/**
 * Junta scripts/_parts/ped-*.json (whitelist v2) → data/questions-pediatria.json
 * Só publica itens que passam no gate de qualidade.
 * Uso: node scripts/merge-pediatria-parts.js
 */
const fs = require("fs");
const path = require("path");
const { hasBlacklist, looksLikePedVignette, L } = require("./_parts/_ped_gold_lib.cjs");

const PARTS_DIR = path.join(__dirname, "_parts");
const OUT = path.join(__dirname, "..", "data", "questions-pediatria.json");
const SEED_STR = "20260721pedv2";

/** Parts reescritas no padrão R1 (não misturar ped-part* antigo). */
const WHITELIST = [
  "ped-neo1.json",
  "ped-neo2.json",
  "ped-pueri1.json",
  "ped-pueri2.json",
  "ped-inf1.json",
  "ped-pnm1.json",
  "ped-gast1.json",
  "ped-emer1.json",
  "ped-nefro1.json",
  "ped-endo1.json",
  "ped-cardio1.json",
  "ped-neuro1.json",
  "ped-hemo1.json",
  "ped-reuma1.json",
  "ped-maus1.json"
];

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
  if (!looksLikePedVignette(q.stem)) return false;
  if (L(q.explain || "") < 80) return false;
  if ([q.correct].concat(q.wrongs).some((c) => /neste$| no$| ou$| com$/i.test(String(c).trim()))) {
    return false;
  }
  return true;
}

function main () {
  const files = WHITELIST.filter((f) => fs.existsSync(path.join(PARTS_DIR, f)));
  if (!files.length) throw new Error("Nenhum ped-*.json da whitelist encontrado em scripts/_parts");

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
        specialty: "pediatria",
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
