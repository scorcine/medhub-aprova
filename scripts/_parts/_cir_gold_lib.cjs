/**
 * Helpers GOLD Cirurgia v2 — SEM padding mecânico / SEM truncar opções.
 * Conteúdo clínico real deve nascer completo no stem e nas alternativas.
 */
function L (s) {
  return [...String(s || "")].length;
}

function strip (s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

/** Frases proibidas (boilerplate da geração antiga). */
const BLACKLIST = [
  /Reavaliar PA,\s*FC,\s*perfus/i,
  /Sem alergias conhecidas aos f/i,
  /Exames em andamento n[aã]o devem atrasar/i,
  /A equipe discute o pr[oó]ximo passo/i,
  /Sinais vitais, exame dirigido e exames dispon/i,
  /o que atrasa o manejo correto/i,
  /com potencial dano iatrog[eê]nico/i,
  /sem suporte nas diretrizes atuais/i,
  /elevando risco sem benef[ií]cio claro/i,
  /com reassessoramento cl[ií]nico seriado neste$/i
];

function hasBlacklist (s) {
  const t = String(s || "");
  return BLACKLIST.some((re) => re.test(t));
}

function looksLikeVignette (stem) {
  const t = String(stem || "");
  const hasPerson =
    /\b(\d{1,3}\s*anos?|neonato|rec[eé]m-nascido|RN\b|lactente|escolar|adolescente|homem|mulher|paciente|gestante|crian[cç]a)\b/i.test(t);
  const hasClinic =
    /\b(PA|FC|FR|SpO2|Glasgow|dor|febre|v[oô]mito|trauma|cirurgia|abdome|t[oó]rax|PS|pronto[- ]?socorro|sala de trauma|exame|TC|USG|hemoglobina|leuc[oó]citos)\b/i.test(t);
  const hasAsk =
    /\b(qual|assinale|conduta|diagn[oó]stico|pr[oó]ximo passo|tratamento|classifica)/i.test(t);
  return hasPerson && hasClinic && hasAsk;
}

function buildItem (idPrefix, n, group, theme, stem, correct, wrongs, explain, trap) {
  const st = strip(stem);
  const c = strip(correct);
  const w = (wrongs || []).map(strip);
  const ex = strip(explain);
  const tr = strip(trap);

  if (w.length !== 4) throw new Error(idPrefix + "-" + n + ": exige 4 wrongs");
  if (!st || !c) throw new Error(idPrefix + "-" + n + ": stem/correct vazios");
  if (hasBlacklist(st) || hasBlacklist(c) || w.some(hasBlacklist)) {
    throw new Error(idPrefix + "-" + n + ": boilerplate proibido detectado");
  }
  if (!looksLikeVignette(st)) {
    throw new Error(idPrefix + "-" + n + ": stem sem vinheta clínica adequada");
  }
  if (L(ex) < 80) throw new Error(idPrefix + "-" + n + ": explain curto");
  if (L(tr) < 30) throw new Error(idPrefix + "-" + n + ": trap curto");

  return {
    idPrefix,
    n,
    group,
    theme: strip(theme),
    stem: st,
    correct: c,
    wrongs: w,
    explain: ex,
    trap: tr
  };
}

module.exports = {
  L,
  strip,
  BLACKLIST,
  hasBlacklist,
  looksLikeVignette,
  buildItem
};
