/**
 * Helpers GOLD Preventiva v2 — vinheta de decisão em APS/vigilância.
 */
const cir = require("./_cir_gold_lib.cjs");

function looksLikePrevVignette (stem) {
  const t = String(stem || "");
  const hasActor =
    /\b(\d{1,3}\s*anos?|m[eé]dico|enfermeir[oa]|gestor|equipe|paciente|mulher|homem|crian[cç]a|adolescente|gestante|ACS|agente comunit)\b/i.test(t);
  const hasSetting =
    /\b(UBS|APS|ESF|eSF|unidade b[aá]sica|pronto[- ]?atendimento|vigil[aâ]ncia|surto|epidem|notifica[cç]|vacina|cobertura|SUS|munic[ií]pio|conselheiro|sala de situa[cç]|inqu[eé]rito|estudo|sensibilidade|especificidade|valor preditivo|raz[aã]o de chances|risco relativo|letalidade|mortalidade|Swaroop|indicador)\b/i.test(t);
  const hasAsk =
    /\b(qual|assinale|conduta|pr[oó]ximo passo|interpreta|classifica|indica|melhor|mais adequado|deve)\b/i.test(t);
  return hasActor && hasSetting && hasAsk;
}

function buildPrevItem (idPrefix, n, group, theme, stem, correct, wrongs, explain, trap) {
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
  if (!looksLikePrevVignette(st)) {
    throw new Error(idPrefix + "-" + n + ": stem sem vinheta Preventiva adequada");
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
  looksLikePrevVignette,
  buildPrevItem
};
