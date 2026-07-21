/**
 * Helpers GOLD Pediatria v2 — vinheta clínica pediátrica, sem padding.
 */
const cir = require("./_cir_gold_lib.cjs");

function looksLikePedVignette (stem) {
  const t = String(stem || "");
  const hasPerson =
    /\b(\d{1,3}\s*(anos?|meses?|dias?(?:\s+de\s+vida)?)\b|rec[eé]m-nascid[oa]|RN\b|neonato|lactente|escolar|pré[- ]?escolar|adolescente|crian[cç]a|menino|menina|paciente|primigesta|pu[eé]rpera|m[aã]e)\b/i.test(
      t
    );
  const hasClinic =
    /\b(PA|FC|FR|SpO2|SatO2|Glasgow|dor|febre|v[oô]mito|diarreia|tosse|dispneia|icter[ií]cia|peso|estatura|percentil|vacina|aleitamento|peito|f[oó]rmula|exantema|convuls|PS|pronto[- ]?socorro|UBS|ambulat[oó]rio|enfermaria|sala de parto|UTI|UTINeo|exame|RX|radiografia|TC|USG|hemograma|leuc[oó]citos|PCR|prote[ií]na C|gasometria|glicemia|s[oó]dio|pot[aá]ssio|creatinina|urina|LCR|cultura)\b/i.test(
      t
    );
  const hasAsk =
    /\b(qual|assinale|conduta|diagn[oó]stico|pr[oó]ximo passo|tratamento|classifica|indica|melhor|mais adequado|deve|primeira medida|pr[oó]xima conduta)\b/i.test(
      t
    );
  return hasPerson && hasClinic && hasAsk;
}

function buildPedItem (idPrefix, n, group, theme, stem, correct, wrongs, explain, trap) {
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
  if (!looksLikePedVignette(st)) {
    throw new Error(idPrefix + "-" + n + ": stem sem vinheta Pediatria adequada");
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
  looksLikePedVignette,
  buildPedItem
};
