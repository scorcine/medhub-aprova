/**
 * Junta scripts/_parts/cli-*.json → data/questions-clinica.json
 * Uso: node scripts/merge-clinica-parts.js
 */
const fs = require("fs");
const path = require("path");

const SEED_STR = "20260720cliv1";
const PARTS_DIR = path.join(__dirname, "_parts");
const OUT = path.join(__dirname, "..", "data", "questions-clinica.json");

const EXAMS = [
  "sus-sp", "sus-sp", "sus-sp", "sus-sp", "sus-sp",
  "sus-sp", "sus-sp",
  "usp", "enare", "enamed", "unifesp", "santa-casa"
];
const YEARS = [2022, 2023, 2024, 2025];
const DIFF_POOL = [
  "dificil", "dificil", "dificil", "dificil", "dificil",
  "dificil", "media", "media"
];

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
  if (!Array.isArray(distractors) || distractors.length !== 4) {
    throw new Error("placeCorrect exige 4 distratores");
  }
  const answer = _placeSlot % 5;
  _placeSlot += 1;
  void rng;
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

function meta (rng) {
  return {
    exam: EXAMS[Math.floor(rng() * EXAMS.length)],
    year: YEARS[Math.floor(rng() * YEARS.length)],
    difficulty: DIFF_POOL[Math.floor(rng() * DIFF_POOL.length)]
  };
}

function main () {
  const files = fs.readdirSync(PARTS_DIR)
    .filter((f) => /^cli-.+\.json$/i.test(f))
    .sort();
  if (!files.length) throw new Error("Nenhum cli-*.json em scripts/_parts");

  const raw = [];
  for (const f of files) {
    const chunk = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, f), "utf8"));
    if (!Array.isArray(chunk)) throw new Error(f + " não é array");
    raw.push(...chunk);
  }

  const rng = createRng(seedToUint32(SEED_STR));
  const usedIds = new Set();
  const questions = raw.map((q, idx) => {
    const tag = `${q.idPrefix || "cli"}-${q.n || idx + 1}`;
    if (!q.group || !q.theme || !q.stem || !q.correct || !q.explain || !q.trap) {
      throw new Error("Campos faltando em " + tag);
    }
    if (!Array.isArray(q.wrongs) || q.wrongs.length !== 4) {
      throw new Error("wrongs != 4 em " + tag);
    }
    if (q.stem.length < 280) {
      throw new Error(`Stem curto (${q.stem.length}) em ${tag}`);
    }
    if (/\bIVAS\b/i.test(q.theme) || /\bIVAS\b/i.test(q.stem)) {
      throw new Error("IVAS opaca em " + tag);
    }
    if (q.explain.length < 120) throw new Error("explain curto em " + tag);
    if (q.trap.length < 40) throw new Error("trap curta em " + tag);

    const { choices, answer } = placeCorrect(q.correct, q.wrongs, rng);
    const m = meta(rng);
    const num = String(q.n || idx + 1).padStart(3, "0");
    let id = `${q.idPrefix || "cli"}-${num}`;
    if (usedIds.has(id)) id = `${q.idPrefix || "cli"}-${num}-${idx}`;
    usedIds.add(id);

    return {
      id,
      specialty: "clinica",
      group: q.group,
      theme: q.theme,
      exam: m.exam,
      year: m.year,
      difficulty: m.difficulty,
      stem: q.stem,
      choices,
      answer,
      explain: q.explain,
      trap: q.trap
    };
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(questions, null, 2) + "\n", "utf8");

  const byGroup = Object.create(null);
  questions.forEach((q) => {
    byGroup[q.group] = (byGroup[q.group] || 0) + 1;
  });
  const lens = questions.map((q) => q.stem.length).sort((a, b) => a - b);
  const mid = lens[(lens.length / 2) | 0];
  console.log("Wrote", OUT);
  console.log("Total", questions.length);
  console.log("Stem min/median/max", lens[0], mid, lens[lens.length - 1]);
  console.log("Groups", Object.entries(byGroup).map(([k, v]) => v + " " + k).join(" | "));
  console.log("Parts", files.join(", "));
}

main();
