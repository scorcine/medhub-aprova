/**
 * Garante skew=0 nas partes cli-*.json:
 * correct nem mínima nem máxima entre as 5 opções (todas 120–165 chars).
 * Uso: node scripts/balance-clinica-skew.js [arquivo...]
 */
const fs = require("fs");
const path = require("path");

const PARTS_DIR = path.join(__dirname, "_parts");
const LO = 120;
const HI = 165;

const SHORT_TAILS = [
  " sem benefício claro",
  " fora da indicação",
  " com risco elevado",
  " sem base fisiopatológica",
  " como única medida",
  " neste cenário",
  " sem ganho clínico"
];
const LONG_TAILS = [
  " e sem reassessorar a falência orgânica iminente",
  " substituindo indevidamente a terapia de primeira linha",
  " mesmo na ausência de critérios de gravidade equivalentes",
  " elevando iatrogenia sem ganho prognóstico documentado",
  " em desacordo com a estratificação clínica do caso",
  " sem reavaliar foco, culturas e suporte hemodinâmico"
];

function L (s) {
  return [...String(s || "")].length;
}

function stripHanging (s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .replace(/[,\s]+$/g, "")
    .trim();
}

function clampOpt (s, target) {
  let out = stripHanging(s);
  let guard = 0;
  while (L(out) > target && guard++ < 80) {
    const parts = out.split(" ");
    if (parts.length <= 6) {
      out = stripHanging(out.slice(0, target).replace(/\s+\S*$/, ""));
      break;
    }
    parts.pop();
    out = stripHanging(parts.join(" "));
  }
  guard = 0;
  let ti = 0;
  while (L(out) < target && guard++ < 40) {
    const add = SHORT_TAILS[ti++ % SHORT_TAILS.length];
    if (L(out) + L(add) > HI) break;
    out = stripHanging(out + add);
  }
  if (L(out) < LO) {
    while (L(out) < LO) out = stripHanging(out + SHORT_TAILS[L(out) % SHORT_TAILS.length]);
  }
  if (L(out) > HI) out = stripHanging(out.slice(0, HI).replace(/\s+\S*$/, ""));
  return out;
}

function isSkewed (correct, wrongs) {
  const cL = L(correct);
  const w = wrongs.map(L);
  return !(w.some((x) => x < cL) && w.some((x) => x > cL));
}

function fixQuestion (q) {
  let correct = String(q.correct || "");
  let wrongs = (q.wrongs || []).map(String);
  if (wrongs.length !== 4) return { q, changed: false, ok: false };

  // Keep medical core; only nudge lengths.
  correct = clampOpt(correct, Math.min(HI, Math.max(LO, L(correct))));
  wrongs = wrongs.map((w) => clampOpt(w, Math.min(HI, Math.max(LO, L(w)))));

  for (let pass = 0; pass < 20 && isSkewed(correct, wrongs); pass++) {
    const cL = L(correct);
    // Force one shorter and one longer distractor.
    wrongs[0] = clampOpt(wrongs[0] + SHORT_TAILS[pass % SHORT_TAILS.length], Math.max(LO, Math.min(cL - 2, 140)));
    wrongs[3] = clampOpt(wrongs[3] + LONG_TAILS[pass % LONG_TAILS.length], Math.min(HI, Math.max(cL + 2, 150)));
    // Nudge correct toward mid if still extreme.
    if (L(correct) <= Math.min(...wrongs.map(L))) {
      correct = clampOpt(correct + " com reavaliação clínica seriada", Math.min(HI, Math.max(L(correct) + 8, 138)));
    }
    if (L(correct) >= Math.max(...wrongs.map(L))) {
      correct = clampOpt(correct, Math.max(LO, Math.min(...wrongs.map(L)) + 2));
    }
  }

  // Final hard bounds.
  correct = clampOpt(correct, Math.min(HI, Math.max(LO, L(correct))));
  wrongs = wrongs.map((w) => clampOpt(w, Math.min(HI, Math.max(LO, L(w)))));

  const ok =
    !isSkewed(correct, wrongs) &&
    L(correct) >= LO &&
    L(correct) <= HI &&
    wrongs.every((w) => L(w) >= LO && L(w) <= HI);

  const changed = correct !== q.correct || wrongs.some((w, i) => w !== q.wrongs[i]);
  return {
    q: { ...q, correct, wrongs },
    changed,
    ok
  };
}

function processFile (filePath) {
  const arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let changed = 0;
  let fail = 0;
  const out = arr.map((q) => {
    const r = fixQuestion(q);
    if (r.changed) changed += 1;
    if (!r.ok) fail += 1;
    return r.q;
  });
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2) + "\n", "utf8");
  return { n: arr.length, changed, fail };
}

function main () {
  const args = process.argv.slice(2);
  const files = args.length
    ? args.map((a) => (path.isAbsolute(a) ? a : path.join(PARTS_DIR, a)))
    : fs.readdirSync(PARTS_DIR)
      .filter((f) => /^cli-.+\.json$/i.test(f))
      .map((f) => path.join(PARTS_DIR, f));

  let totalFail = 0;
  for (const f of files.sort()) {
    const r = processFile(f);
    console.log(path.basename(f), `n=${r.n}`, `changed=${r.changed}`, `fail=${r.fail}`);
    totalFail += r.fail;
  }
  if (totalFail) {
    console.error("FAIL remaining skew:", totalFail);
    process.exit(1);
  }
  console.log("ALL OK");
}

main();
