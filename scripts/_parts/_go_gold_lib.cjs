/**
 * Helpers GOLD GO v2 — vinheta clínica, sem padding.
 */
const cir = require("./_cir_gold_lib.cjs");

function looksLikeGoVignette (stem) {
  const t = String(stem || "");
  const hasPerson =
    /\b(\d{1,3}\s*anos?|mulher|gestante|pu[eé]rpera|adolescente|paciente|rec[eé]m-nascida?|RN\b|neonato)\b/i.test(t);
  const hasClinic =
    /\b(PA|FC|FR|SpO2|dor|febre|sangramento|amenorreia|menstrua|ciclo|colo|vagina|mamas?|ov[aá]rio|utero|útero|SOP|HPV|parto|pr[eé]-?natal|beta-?hCG|USG|ultrassom|toco|contra[cç]|dilata[cç]|protein[uú]ria|glicemia|hemoglobina|leuc[oó]citos|PS|pronto[- ]?socorro|ambulat[oó]rio|enfermaria|DIU|contracep)\b/i.test(t);
  const hasAsk =
    /\b(qual|assinale|conduta|diagn[oó]stico|pr[oó]ximo passo|tratamento|classifica|rastreamento|esquema)\b/i.test(t);
  return hasPerson && hasClinic && hasAsk;
}

function buildGoItem (idPrefix, n, group, theme, stem, correct, wrongs, explain, trap) {
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
  if (!looksLikeGoVignette(st)) {
    throw new Error(idPrefix + "-" + n + ": stem sem vinheta GO adequada");
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
  BLACKLIST: cir.BLACKLIST,
  hasBlacklist: cir.hasBlacklist,
  looksLikeGoVignette,
  buildGoItem
};
