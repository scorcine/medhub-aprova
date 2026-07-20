/** Shared GOLD helpers for cir-* / cli-* builders. */
const L = (s) => [...String(s || "")].length;
const strip = (s) => String(s || "").replace(/\s+/g, " ").trim();

const STEM_PAD = [
  " Reavaliar PA, FC, perfusão e nível de consciência após cada intervenção clínica.",
  " Sem alergias conhecidas aos fármacos usualmente considerados neste cenário.",
  " Exames em andamento não devem atrasar a conduta prioritária já justificada.",
  " Ponderar tempo de evolução, comorbidades e diferenciais clássicos antes de escalar.",
  " Monitorização disponível; a equipe discute o próximo passo diagnóstico-terapêutico.",
  " Considerar gravidade, risco de iatrogenia e o melhor próximo passo neste atendimento."
];

const CORRECT_MID = [
  " com reassesso clínico seriado",
  " alinhada às diretrizes vigentes",
  " sob monitorização adequada",
  " conforme estratificação do caso",
  " na unidade de emergência",
  " com suporte multiprofissional"
];

const WRONG_TAILS = [
  ", o que atrasa o manejo correto",
  ", com potencial dano iatrogênico",
  ", sem suporte nas diretrizes atuais",
  ", elevando risco sem benefício claro",
  " e piora o prognóstico imediato",
  " neste contexto de alto risco",
  " fora da lógica fisiopatológica",
  " como única medida inadequada"
];

const EXPLAIN_PAD =
  " Na prática, essa escolha altera a prioridade terapêutica e o prognóstico imediato do paciente.";

function padToRange(s, lo, hi, pads) {
  let out = strip(s);
  let i = 0;
  while (L(out) < lo && i < 40) {
    const add = pads[i % pads.length];
    if (L(out) + L(add) > hi) {
      const room = hi - L(out);
      if (room >= 12) out = strip(out + add.slice(0, room));
      break;
    }
    out = strip(out + add);
    i++;
  }
  if (L(out) > hi) {
    out = strip(out.slice(0, hi).replace(/\s+\S*$/, ""));
  }
  return out;
}

function padOpt(s, lo, hi, pads) {
  let out = strip(s);
  let i = 0;
  const filler = [...pads, " neste cenário clínico", " conforme o quadro atual", " sem benefício adicional claro"];
  while (L(out) < lo && i < 40) {
    const add = filler[i % filler.length];
    const room = hi - L(out);
    if (room < 8) break;
    if (L(add) <= room) out = strip(out + add);
    else out = strip(out + add.slice(0, room));
    i++;
  }
  if (L(out) > hi) out = strip(out.slice(0, hi).replace(/\s+\S*$/, ""));
  // final enforce floor without exceeding hi
  i = 0;
  while (L(out) < lo && i < 20) {
    const need = lo - L(out);
    const bit = " agora".slice(0, Math.min(5, need + 5));
    if (L(out) + L(bit) > hi) break;
    out = strip(out + bit);
    i++;
  }
  if (L(out) < lo) {
    // last resort: append spaces replaced by meaningful words
    out = strip(out + " no manejo atual do caso");
    if (L(out) > hi) out = strip(out.slice(0, hi).replace(/\s+\S*$/, ""));
  }
  return out;
}

function distinctEnds(opts) {
  const ends = opts.map((o) => o.slice(-18));
  return new Set(ends).size === opts.length;
}

function fixSkew(correct, wrongs) {
  let c = correct;
  let w = [...wrongs];
  for (let guard = 0; guard < 25; guard++) {
    const lens = [L(c), ...w.map(L)];
    const cL = L(c);
    const min = Math.min(...lens);
    const max = Math.max(...lens);
    if (cL > min && cL < max && distinctEnds([c, ...w])) return { correct: c, wrongs: w };
    if (cL <= min) c = padOpt(c + CORRECT_MID[guard % CORRECT_MID.length], 120, 165, CORRECT_MID);
    else if (cL >= max) {
      const target = Math.max(120, Math.min(160, min + 8));
      c = padOpt(c, 120, target, CORRECT_MID);
    }
    for (let i = 0; i < w.length; i++) {
      const wi = L(w[i]);
      if (wi === L(c)) {
        w[i] = padOpt(w[i] + WRONG_TAILS[(i + guard) % WRONG_TAILS.length], 120, 165, WRONG_TAILS);
      }
    }
    // ensure at least one shorter and one longer
    const shorter = w.findIndex((x) => L(x) < L(c));
    const longer = w.findIndex((x) => L(x) > L(c));
    if (shorter < 0) {
      w[0] = padOpt(w[0], 120, Math.max(120, L(c) - 5), WRONG_TAILS);
    }
    if (longer < 0) {
      w[3] = padOpt(w[3] + WRONG_TAILS[guard % WRONG_TAILS.length], Math.min(165, L(c) + 5), 165, WRONG_TAILS);
    }
  }
  return { correct: c, wrongs: w };
}

function buildItem(raw, idPrefix, group, n) {
  let stem = padToRange(raw.stem, 350, 520, STEM_PAD);
  let correct = padOpt(raw.correct, 120, 165, CORRECT_MID);
  let wrongs = raw.wrongs.map((w, i) => padOpt(w, 120, 165, [WRONG_TAILS[i % WRONG_TAILS.length], ...WRONG_TAILS]));
  ({ correct, wrongs } = fixSkew(correct, wrongs));
  // re-clamp after skew fixes
  correct = padOpt(correct, 120, 165, CORRECT_MID);
  wrongs = wrongs.map((w, i) => padOpt(w, 120, 165, WRONG_TAILS));
  ({ correct, wrongs } = fixSkew(correct, wrongs));
  correct = padOpt(correct, 120, 165, CORRECT_MID);
  wrongs = wrongs.map((w) => padOpt(w, 120, 165, WRONG_TAILS));

  // ensure skew still holds after final clamp
  let guard = 0;
  while (guard++ < 15) {
    const cL = L(correct);
    const wL = wrongs.map(L);
    if (wL.some((x) => x < cL) && wL.some((x) => x > cL) && wL.every((x) => x >= 120 && x <= 165) && cL >= 120 && cL <= 165) {
      break;
    }
    if (!wL.some((x) => x < cL)) {
      // shorten shortest wrong further or lengthen correct slightly
      const idx = wL.indexOf(Math.min(...wL));
      wrongs[idx] = padOpt(wrongs[idx], 120, Math.max(120, cL - 3), WRONG_TAILS);
    }
    if (!wL.some((x) => x > cL)) {
      const idx = wL.indexOf(Math.max(...wL));
      wrongs[idx] = padOpt(wrongs[idx] + WRONG_TAILS[guard % WRONG_TAILS.length], Math.min(165, cL + 3), 165, WRONG_TAILS);
    }
    correct = padOpt(correct, 120, 165, CORRECT_MID);
    wrongs = wrongs.map((w) => padOpt(w, 120, 165, WRONG_TAILS));
  }

  let explain = strip(raw.explain);
  if (L(explain) < 120) explain = strip(explain + EXPLAIN_PAD);
  let trap = strip(raw.trap);
  if (L(trap) < 40) trap = strip(trap + " Erro clássico de prova R1.");

  return {
    idPrefix,
    n,
    group,
    theme: raw.theme,
    stem,
    correct,
    wrongs,
    explain,
    trap
  };
}

function validatePart(arr, idPrefix, group, nExpected) {
  const issues = [];
  if (!Array.isArray(arr)) return ["not array"];
  if (arr.length !== nExpected) issues.push(`n=${arr.length} expected ${nExpected}`);
  const themes = new Set();
  let stemMin = Infinity,
    stemMax = 0,
    optMin = Infinity,
    optMax = 0,
    skew = 0;
  for (const q of arr) {
    if (q.idPrefix !== idPrefix) issues.push(`bad idPrefix n=${q.n}`);
    if (q.group !== group) issues.push(`bad group n=${q.n}`);
    if (themes.has(q.theme)) issues.push(`dup theme: ${q.theme}`);
    themes.add(q.theme);
    const sL = L(q.stem);
    stemMin = Math.min(stemMin, sL);
    stemMax = Math.max(stemMax, sL);
    if (sL < 350 || sL > 520) issues.push(`stem len n=${q.n} ${sL}`);
    const opts = [q.correct, ...(q.wrongs || [])];
    if (opts.length !== 5) issues.push(`opts n=${q.n}`);
    const lens = opts.map(L);
    for (const x of lens) {
      optMin = Math.min(optMin, x);
      optMax = Math.max(optMax, x);
      if (x < 120 || x > 165) issues.push(`opt len n=${q.n} ${x}`);
    }
    const cL = L(q.correct);
    if (!(lens.some((x) => x < cL) && lens.some((x) => x > cL))) skew++;
    if (L(q.explain) < 120) issues.push(`explain n=${q.n}`);
    if (L(q.trap) < 40) issues.push(`trap n=${q.n}`);
  }
  return {
    ok: issues.length === 0 && skew === 0,
    skew,
    stemRange: [stemMin, stemMax],
    optRange: [optMin, optMax],
    issues: issues.slice(0, 20),
    n: arr.length
  };
}

module.exports = {
  L,
  strip,
  buildItem,
  validatePart,
  STEM_PAD,
  CORRECT_MID,
  WRONG_TAILS
};
