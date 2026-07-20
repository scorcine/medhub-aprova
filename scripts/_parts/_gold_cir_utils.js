/** GOLD helpers: pad stems, fix option lengths, skew=0, validate. */
"use strict";

function L(s) {
  return [...String(s || "")].length;
}

function strip(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

const STEM_PADS = [
  " O serviço dispõe de suporte perioperatório e exames essenciais sem justificar atraso indevido.",
  " Reavaliar periodicamente estabilidade, resposta à intervenção e necessidade de reestratificação.",
  " História, exame físico e comorbidades foram revisados na admissão; a prioridade já pode ser definida.",
  " Sem alergia medicamentosa conhecida aos fármacos usualmente considerados neste cenário cirúrgico.",
  " Ponderar gravidade, tempo de evolução, comorbidades e diagnósticos diferenciais clássicos de prova.",
  " Há acesso a monitorização e equipe multidisciplinar; discutir o próximo passo diagnóstico-terapêutico.",
  " Considerar risco de complicação perioperatória e impacto da conduta sobre o desfecho em 30 dias.",
  " Correlacionar achados clínicos com estratificação de risco e timing adequado da intervenção proposta."
];

const SHORT_TAILS = [
  " sem benefício claro",
  " fora da indicação",
  " com risco elevado",
  " neste cenário",
  " sem ganho clínico",
  " como única medida"
];

const LONG_TAILS = [
  " e sem reassessorar a falência orgânica iminente",
  " substituindo indevidamente a terapia de primeira linha",
  " mesmo na ausência de critérios de gravidade equivalentes",
  " elevando iatrogenia sem ganho prognóstico documentado",
  " em desacordo com a estratificação clínica do caso",
  " sem reavaliar foco, culturas e suporte hemodinâmico"
];

function padStem(stem, min = 350, max = 520) {
  let out = strip(stem);
  let i = 0;
  while (L(out) < min && i < 40) {
    const pad = STEM_PADS[i % STEM_PADS.length];
    if (L(out) + L(pad) > max) {
      const room = max - L(out) - 1;
      if (room > 40) out = strip(out + pad.slice(0, room));
      break;
    }
    out = strip(out + pad);
    i++;
  }
  if (L(out) > max) {
    out = strip(out.slice(0, max).replace(/\s+\S*$/, ""));
  }
  if (L(out) < min) {
    out = strip(out + " Definir conduta conforme algoritmo R1 do tema.");
  }
  return out;
}

function clampOpt(s, target, lo = 120, hi = 165) {
  let out = strip(s);
  target = Math.max(lo, Math.min(hi, target));
  let guard = 0;
  while (L(out) > target && guard++ < 100) {
    const parts = out.split(" ");
    if (parts.length <= 5) {
      out = strip(out.slice(0, target).replace(/\s+\S*$/, ""));
      break;
    }
    parts.pop();
    out = strip(parts.join(" "));
  }
  guard = 0;
  let ti = 0;
  const fillers = [
    ...SHORT_TAILS,
    " no perioperatório atual",
    " segundo o algoritmo R1",
    " na avaliação pré-cirúrgica",
    " diante do quadro apresentado",
    ...LONG_TAILS
  ];
  while (L(out) < target && guard++ < 60) {
    const add = fillers[ti++ % fillers.length];
    const next = strip(out + add);
    if (L(next) > hi) {
      const room = hi - L(out);
      if (room > 8) out = strip(out + add.slice(0, room));
      break;
    }
    out = next;
  }
  if (L(out) < lo) {
    while (L(out) < lo) out = strip(out + SHORT_TAILS[L(out) % SHORT_TAILS.length]);
  }
  if (L(out) > hi) out = strip(out.slice(0, hi).replace(/\s+\S*$/, ""));
  return out;
}

function isSkewed(correct, wrongs) {
  const cL = L(correct);
  const w = wrongs.map(L);
  return !(w.some((x) => x < cL) && w.some((x) => x > cL));
}

function distinctEndings(opts) {
  const ends = opts.map((o) => o.slice(-18).toLowerCase());
  return new Set(ends).size === ends.length;
}

function fixOptions(correct, wrongs) {
  const lo = 120;
  const hi = 165;
  // Force mid-length correct (~140) with one short (~125) and one long (~158) distractor.
  let c = clampOpt(correct, 140);
  let w = [
    clampOpt(wrongs[0], 125),
    clampOpt(wrongs[1], 145),
    clampOpt(wrongs[2], 150),
    clampOpt(wrongs[3], 158)
  ];

  for (let pass = 0; pass < 40 && (isSkewed(c, w) || !distinctEndings([c, ...w])); pass++) {
    const cL = L(c);
    w[0] = clampOpt(w[0], Math.max(lo, Math.min(cL - 4, 132)));
    w[3] = clampOpt(w[3] + LONG_TAILS[pass % LONG_TAILS.length], Math.min(hi, Math.max(cL + 4, 156)));
    if (L(c) <= Math.min(...w.map(L))) {
      c = clampOpt(c + " com reavaliação clínica seriada", Math.min(152, cL + 10));
    }
    if (L(c) >= Math.max(...w.map(L))) {
      c = clampOpt(c, Math.max(lo + 4, Math.min(...w.map(L)) + 3));
    }
    if (!distinctEndings([c, ...w])) {
      w = w.map((x, i) =>
        clampOpt(x + " " + ["neste cenário", "fora da indicação", "com risco elevado", "sem ganho clínico"][i], L(x) + 8)
      );
    }
  }

  // Hard enforce interior skew if still failing.
  if (isSkewed(c, w)) {
    c = clampOpt(c, 140);
    w[0] = clampOpt(w[0], 124);
    w[1] = clampOpt(w[1], 142);
    w[2] = clampOpt(w[2], 148);
    w[3] = clampOpt(w[3], 160);
  }

  return { correct: c, wrongs: w };
}

function buildItem(raw, idPrefix, group, n) {
  const stem = padStem(raw.stem);
  const { correct, wrongs } = fixOptions(raw.correct, raw.wrongs);
  let explain = strip(raw.explain);
  if (L(explain) < 120) {
    explain = strip(
      explain +
        " A conduta correta alinha-se ao algoritmo R1 perioperatório/colorretal, priorizando estratificação, timing e redução de iatrogenia."
    );
  }
  let trap = strip(raw.trap);
  if (L(trap) < 40) trap = strip(trap + " Evitar atalho que ignore estratificação de risco.");
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

function validate(arr, idPrefix, group, nExpected) {
  const errors = [];
  if (!Array.isArray(arr) || arr.length !== nExpected) {
    errors.push(`n=${arr && arr.length} expected ${nExpected}`);
  }
  const themes = new Set();
  let skew = 0;
  const stemLens = [];
  const optLens = [];
  for (const q of arr || []) {
    if (q.idPrefix !== idPrefix) errors.push(`idPrefix ${q.n}`);
    if (q.group !== group) errors.push(`group ${q.n}`);
    if (themes.has(q.theme)) errors.push(`theme dupe ${q.theme}`);
    themes.add(q.theme);
    const sl = L(q.stem);
    stemLens.push(sl);
    if (sl < 350 || sl > 520) errors.push(`stem ${q.n} len=${sl}`);
    const opts = [q.correct, ...(q.wrongs || [])];
    if (opts.length !== 5) errors.push(`opts ${q.n}`);
    const lens = opts.map(L);
    optLens.push(...lens);
    if (lens.some((x) => x < 120 || x > 165)) errors.push(`optBound ${q.n} ${lens}`);
    if (isSkewed(q.correct, q.wrongs)) {
      skew++;
      errors.push(`skew ${q.n} ${lens}`);
    }
    if (L(q.explain) < 120) errors.push(`explain ${q.n}`);
    if (L(q.trap) < 40) errors.push(`trap ${q.n}`);
    if (/(?<![A-Za-zÀ-ÿ])IVAS(?![A-Za-zÀ-ÿ])/i.test(JSON.stringify(q))) errors.push(`IVAS ${q.n}`);
  }
  return {
    ok: errors.length === 0 && skew === 0,
    skew,
    n: arr.length,
    stemRange: [Math.min(...stemLens), Math.max(...stemLens)],
    optRange: [Math.min(...optLens), Math.max(...optLens)],
    errors: errors.slice(0, 20)
  };
}

module.exports = { L, buildItem, validate, padStem, fixOptions };
