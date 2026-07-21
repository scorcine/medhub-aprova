/**
 * Helpers GOLD Clínica v2 — vinheta clínica adulta, sem padding.
 */
const cir = require("./_cir_gold_lib.cjs");

function looksLikeCliVignette (stem) {
  const t = String(stem || "");
  const hasPerson =
    /\b(\d{1,3}\s*anos?|homem|mulher|paciente|gestante|idos[oa]|adolescente)\b/i.test(t);
  const hasClinic =
    /\b(PA|FC|FR|SpO2|SatO2|Glasgow|dor|febre|dispneia|tosse|v[oô]mito|edema|cefaleia|convuls|ECG|troponina|BNP|creatinina|ureia|s[oó]dio|pot[aá]ssio|glicemia|HbA1c|hemograma|leuc[oó]citos|PCR|VHS|gasometria|RX|radiografia|TC|RM|USG|ecocardiograma|espirometria|LCR|urina|PS|pronto[- ]?socorro|ambulat[oó]rio|enfermaria|UTI|emerg[eê]ncia)\b/i.test(
      t
    );
  const hasAsk =
    /\b(qual|assinale|conduta|diagn[oó]stico|pr[oó]ximo passo|tratamento|classifica|indica|melhor|mais adequado|deve|primeira medida|pr[oó]xima conduta)\b/i.test(
      t
    );
  return hasPerson && hasClinic && hasAsk;
}

function buildCliItem (idPrefix, n, group, theme, stem, correct, wrongs, explain, trap) {
  const st = cir.strip(stem);
  const c = cir.strip(correct);
  const w = (wrongs || []).map(cir.strip);
  const ex = cir.strip(explain);
  const tr = cir.strip(trap);

  if (w.length !== 4) throw new Error(idPrefix + "-" + n + ": exige 4 wrongs");
  if (!st || !c) throw new Error(idPrefix + "-" + n + ": stem/correct vazios");
  if (cir.hasBlacklist(st) || cir.hasBlacklist(c) || w.some(cir.hasBlacklist)) {
    throw new Error(idPrefix + "-" + n + ": boilerplate proibido");
  }
  if (!looksLikeCliVignette(st)) {
    throw new Error(idPrefix + "-" + n + ": stem sem vinheta Clínica adequada");
  }
  if (cir.L(ex) < 80) throw new Error(idPrefix + "-" + n + ": explain curto");
  if (cir.L(tr) < 30) throw new Error(idPrefix + "-" + n + ": trap curto");

  return {
    idPrefix,
    n,
    group,
    theme: cir.strip(theme),
    stem: st,
    correct: c,
    wrongs: w,
    explain: ex,
    trap: tr
  };
}

module.exports = {
  L: cir.L,
  strip: cir.strip,
  hasBlacklist: cir.hasBlacklist,
  looksLikeCliVignette,
  buildCliItem
};
