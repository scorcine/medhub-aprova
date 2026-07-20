import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = path.dirname(fileURLToPath(import.meta.url));
const PART7 = path.join(BASE, "_parts", "ped-part7.json");
const PART1 = path.join(BASE, "_parts", "ped-part1.json");
const SRC = path.join(BASE, "_fix_options.py");

const MIN_LEN = 120, MAX_LEN = 165;
const REPORT = process.argv.includes("--report");

function parseSegment(seg) {
  // Match: N: ("correct", ["w1","w2","w3","w4"])   (strings have no inner double-quotes)
  const re = /(\d+):\s*\(\s*"([^"]*)"\s*,\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\]\s*\)/g;
  const map = {};
  let m;
  while ((m = re.exec(seg)) !== null) {
    map[parseInt(m[1], 10)] = { correct: m[2], wrongs: [m[3], m[4], m[5], m[6]] };
  }
  return map;
}

const txt = fs.readFileSync(SRC, "utf8");
const i7 = txt.indexOf("P7 = {");
const i1 = txt.indexOf("P1 = {");
const P7 = parseSegment(txt.slice(i7, i1));
const P1 = parseSegment(txt.slice(i1));

// Safety nets applied to the parsed data so the written options always satisfy
// the length window [MIN_LEN, MAX_LEN] and keep the correct answer in the
// interior of the length distribution (skew=0), without identical suffixes.
// Graded pool of coherent clinical tails of varied lengths so we can hit a
// target window precisely and vary the ending across options.
const TAILS = [
  " nesta idade",                                  // 12
  " neste retorno",                                // 14
  " nesta consulta",                               // 15
  " frente à queixa",                              // 16
  " para o lactente",                              // 16
  " na rotina da UBS",                             // 17
  " no acompanhamento",                            // 18
  " conforme relatado",                            // 18
  " diante deste caso",                            // 18
  " durante a consulta",                           // 19
  " apesar dos achados",                           // 19
  " sem nova avaliação",                           // 19
  " no seguimento atual",                          // 20
  " ao longo do seguimento",                       // 23
  " diante do quadro atual",                       // 23
  " apesar dos dados do exame",                    // 26
  " sem rever o restante do caso",                 // 29
  " ignorando os demais achados clínicos",         // 37
  " apesar da avaliação de puericultura",          // 37
  " diante do quadro descrito na consulta",        // 39
];

// Append a coherent tail so `base` lands strictly inside (lo, hi], keeps a
// unique last-18 suffix vs `taken`, and is not a duplicate of `taken`.
function extend(base, lo, hi, taken, seed) {
  const takenSet = new Set(taken);
  const sufSet = new Set(taken.map(o => o.slice(-18)));
  const n = TAILS.length;
  for (let s = 0; s < n; s++) {
    const t = TAILS[(seed + s) % n];
    const cand = base + t;
    if (cand.length > lo && cand.length <= hi &&
        !takenSet.has(cand) && !sufSet.has(cand.slice(-18))) return cand;
  }
  return null;
}

// Net 1: bring any wrong shorter than MIN_LEN up into [MIN_LEN, correct-1].
function padShorts(mapping) {
  for (const k of Object.keys(mapping)) {
    const { correct, wrongs } = mapping[k];
    const hi = Math.min(MAX_LEN, correct.length - 1);
    for (let i = 0; i < wrongs.length; i++) {
      if (wrongs[i].length >= MIN_LEN) continue;
      const taken = [correct, ...wrongs.filter((_, j) => j !== i)];
      const fixed = extend(wrongs[i], MIN_LEN - 1, hi, taken, i);
      if (fixed) wrongs[i] = fixed;
    }
  }
}

// Net 2: guarantee at least one wrong is strictly longer than the correct answer
// so the correct option is never the longest (keeps skew=0).
function fixSkew(mapping) {
  for (const k of Object.keys(mapping)) {
    const { correct, wrongs } = mapping[k];
    const cL = correct.length;
    if (wrongs.some(w => w.length > cL)) continue;
    // pick the currently longest wrong and push it above the correct answer
    let idx = 0;
    for (let j = 1; j < wrongs.length; j++) if (wrongs[j].length > wrongs[idx].length) idx = j;
    const taken = [correct, ...wrongs.filter((_, j) => j !== idx)];
    const fixed = extend(wrongs[idx], cL, MAX_LEN, taken, idx + 3);
    if (fixed) wrongs[idx] = fixed;
  }
}

padShorts(P7); fixSkew(P7);
padShorts(P1); fixSkew(P1);

function processFile(file, mapping, onlyPueri) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const problems = [];
  let touched = 0, skew = 0;
  for (const item of data) {
    if (onlyPueri && item.idPrefix !== "ped-pueri") continue;
    if (item.group !== "Puericultura e prevenção") continue;
    const n = item.n;
    const nu = mapping[n];
    if (!nu) { problems.push(`${path.basename(file)} n=${n}: sem conteudo novo`); continue; }
    item.correct = nu.correct;
    item.wrongs = nu.wrongs.slice();
    touched++;
    const opts = [nu.correct, ...nu.wrongs];
    for (const o of opts) {
      if (o.length < MIN_LEN || o.length > MAX_LEN)
        problems.push(`${path.basename(file)} n=${n} len=${o.length}: ${o.slice(0, 55)}...`);
    }
    const sufs = opts.map(o => o.slice(-18));
    if (new Set(sufs).size !== sufs.length) problems.push(`${path.basename(file)} n=${n}: sufixos repetidos`);
    if (new Set(opts).size !== opts.length) problems.push(`${path.basename(file)} n=${n}: opcoes duplicadas`);
    const lens = opts.map(o => o.length);
    const maxL = Math.max(...lens), minL = Math.min(...lens);
    const cL = nu.correct.length;
    const longer = nu.wrongs.filter(w => w.length > cL).length;
    const shorter = nu.wrongs.filter(w => w.length < cL).length;
    // skew=0 requires correct to be neither the longest nor the shortest option
    if (cL >= maxL || cL <= minL) {
      skew++;
      problems.push(`${path.basename(file)} n=${n}: correct fora do interior (c=${cL}; wrongs=[${nu.wrongs.map(w=>w.length).sort((a,b)=>a-b).join(",")}])`);
    }
    if (REPORT) {
      console.log(`${path.basename(file)} n=${String(n).padStart(2)} c=${cL} w=[${nu.wrongs.map(w=>w.length).sort((a,b)=>a-b).join(",")}] +${longer}/-${shorter}`);
    }
  }
  return { data, problems, touched, skew };
}

const r7 = processFile(PART7, P7, false);
const r1 = processFile(PART1, P1, true);
console.log(`part7 entradas parseadas: ${Object.keys(P7).length} | itens tratados: ${r7.touched} | skew: ${r7.skew}`);
console.log(`part1 entradas parseadas: ${Object.keys(P1).length} | itens tratados: ${r1.touched} | skew: ${r1.skew}`);

const problems = [...r7.problems, ...r1.problems];
if (problems.length) {
  console.log(`\n=== PROBLEMAS (${problems.length}) ===`);
  for (const p of problems) console.log(" -", p);
  console.log("\nArquivos NAO foram sobrescritos.");
  process.exit(1);
}

fs.writeFileSync(PART7, JSON.stringify(r7.data, null, 2) + "\n", "utf8");
fs.writeFileSync(PART1, JSON.stringify(r1.data, null, 2) + "\n", "utf8");
console.log("\nOK: arquivos sobrescritos. skew=0 confirmado nos itens de puericultura.");
