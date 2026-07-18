/**
 * Núcleo compartilhado: expande bancas R1 com prioridades DISTINTAS.
 * SUS-SP (APS/crônicas) ≠ SUS-BA (infecto/endemias) ≠ Enamed etc.
 */
const fs = require("fs");
const path = require("path");

/** Ordem = importância por inscritos no ciclo 2024–2026. */
const BANK_META = [
  { id: "geral", label: "Brasil", kicker: "Síntese 2024–2026", featured: false, sourceType: "sintese", estilo: "Síntese das principais bancas" },
  { id: "enare", label: "Enare", kicker: "~87 mil inscritos · 2025", featured: false, sourceType: "levantamento", estilo: "Levantamento Enare" },
  { id: "enamed", label: "Enamed", kicker: "Nacional · acesso Enare", featured: true, sourceType: "levantamento", estilo: "Levantamento Enare/Enamed" },
  { id: "revalida", label: "Revalida", kicker: "INEP · alto volume", featured: false, sourceType: "estimativa", estilo: "Estimativa INEP/Revalida" },
  { id: "usp", label: "USP", kicker: "~10 mil inscritos", featured: false, sourceType: "levantamento", estilo: "Levantamento USP-SP" },
  { id: "unifesp", label: "UNIFESP", kicker: "~7,5 mil inscritos", featured: false, sourceType: "levantamento", estilo: "Levantamento UNIFESP" },
  { id: "amp", label: "AMP", kicker: "Paraná · alto volume", featured: false, sourceType: "estimativa", estilo: "Estimativa clássica R1" },
  { id: "sus-sp", label: "SUS-SP", kicker: "APS São Paulo", featured: false, sourceType: "estimativa", estilo: "Estimativa APS" },
  { id: "unicamp", label: "Unicamp", kicker: "Institucional SP", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufrgs", label: "UFRGS", kicker: "HCPA / Sul", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufmg", label: "UFMG", kicker: "Institucional MG", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "sus-ba", label: "SUS-BA", kicker: "APS + endemias", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" },
  { id: "ses-pe", label: "SES-PE", kicker: "Regional NE", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" },
  { id: "ufrj", label: "UFRJ", kicker: "Institucional RJ", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "einstein", label: "Einstein", kicker: "Guideline / privada", featured: false, sourceType: "estimativa", estilo: "Estimativa guideline" }
];

/** Bancas estimadas: sempre reconstruídas a partir da base + bias (nunca cópia idêntica). */
const CLONE_FROM = {
  revalida: "enamed",
  "sus-sp": "enamed",
  "sus-ba": "enamed",
  amp: "enamed",
  "ses-pe": "enamed",
  ufmg: "usp",
  ufrgs: "usp",
  ufrj: "usp",
  unicamp: "usp",
  einstein: "unifesp"
};

/**
 * Multiplicadores por palavra-chave no nome do tema.
 * SUS-SP = APS/crônicas/protocolo · SUS-BA = infecto/endemias/desidratação
 */
const BANK_BIAS = {
  revalida: {
    verdict:
      "Perfil Revalida: generalista de APS e urgências básicas — menos detalhe terciário.",
    foco: "APS · urgências · conduta prática",
    rules: [
      { re: /has|hipertens|aps|croni|dm|diabet|asma|dpoc|itu|desidrat|gastro|imuniz|vacin|aleit|nutri|prevenc|rastre|sus\b|princípio/i, w: 1.45 },
      { re: /urgenc|sepse|sca|iam|pcr|avc|crise|cad\b|ira\b/i, w: 1.25 },
      { re: /fisiopat|biópsia|nódulo|onco|transplante|critério|lab\b|eixo/i, w: 0.7 }
    ]
  },
  "sus-sp": {
    verdict:
      "Perfil SUS-SP: atenção primária e protocolos — crônicas, rastreamento e manejo no posto.",
    foco: "APS · crônicas · protocolos MS",
    rules: [
      { re: /has|hipertens|icc|dm|diabet|asma|dpoc|itu|nefrol|croni|aps|esf|previne|rastre|imuniz|vacin|aleit|nutri|pueric|desidrat|gastro|sua\b|anticoncep|ist\b|dip\b|sus\b|princípio|financi|programa|promo/i, w: 1.65 },
      { re: /sca|iam|pcr|acls|uti|intens|sepse|urgenc|choque/i, w: 0.9 },
      { re: /valva|miopat|transplante|onco|biópsia|fisiopat|critério duke|hemibloq|canalopat/i, w: 0.65 },
      { re: /infectolog|parasit|dengue|arbovir|tubercul|hanseni|leish|malária|malaria/i, w: 1.15 }
    ]
  },
  "sus-ba": {
    verdict:
      "Perfil SUS-BA: APS com forte peso em infectologia, endemias e desidratação — diferente do SUS-SP.",
    foco: "Infecto · endemias · desidratação",
    rules: [
      { re: /infect|dengue|arbovir|parasit|tubercul|hanseni|leish|malária|malaria|sepse|diarr|desidrat|gastro|hepat|virais|hiv|ist\b|dip\b|tropic|vigilân|notifica|sinan/i, w: 1.85 },
      { re: /has|hipertens|dm|diabet|icc|asma|dpoc|aps|esf|croni|imuniz|vacin|aleit|nutri/i, w: 1.1 },
      { re: /valva|miopat|transplante|onco tireo|nódulo|biópsia|ecg|arritm|fisiopat|eixo/i, w: 0.6 },
      { re: /cardio|sca|iam/i, w: 0.85 }
    ]
  },
  amp: {
    verdict:
      "Perfil AMP: clássicos de R1 — critérios, condutas e temas que mais se repetem nas provas tradicionais.",
    foco: "Clássicos R1 · critérios · conduta",
    rules: [
      { re: /sca|iam|icc|has|fa\b|arritm|tireo|dm|diabet|les\b|ar\b|gota|avc|epilep|ira\b|sn\b|gna|asma|dpoc|tep/i, w: 1.4 },
      { re: /raro|transplante|pesquisa|guideline novo/i, w: 0.75 }
    ]
  },
  "ses-pe": {
    verdict:
      "Perfil SES-PE: regional Nordeste — infecto, desidratação e APS, próximo ao SUS-BA e distinto do SUS-SP.",
    foco: "Infecto regional · APS · desidratação",
    rules: [
      { re: /infect|dengue|arbovir|parasit|diarr|desidrat|gastro|tubercul|hanseni|leish|vigilân|notifica/i, w: 1.7 },
      { re: /has|dm|diabet|asma|imuniz|vacin|aleit|nutri|aps|esf/i, w: 1.2 },
      { re: /valva|miopat|onco|transplante|fisiopat/i, w: 0.65 }
    ]
  },
  ufmg: {
    verdict:
      "Perfil UFMG: fisiopatologia e critérios — mais analítico que a média Enamed.",
    foco: "Fisiopat · critérios · lab",
    rules: [
      { re: /fisiopat|critério|lab\b|ecg|eixo|diagnóstico|semiolog|mecanismo/i, w: 1.5 },
      { re: /conduta|droga|guideline|protocolo|aps/i, w: 0.85 }
    ]
  },
  ufrgs: {
    verdict:
      "Perfil UFRGS: equilíbrio entre critérios e conduta, com boa cobrança de protocolo.",
    foco: "Critérios · protocolo · conduta",
    rules: [
      { re: /critério|protocolo|conduta|guideline|tratamento/i, w: 1.35 },
      { re: /fisiopat|mecanismo/i, w: 1.15 }
    ]
  },
  ufrj: {
    verdict:
      "Perfil UFRJ: fundamentos e casos clássicos — menos terciário, mais diagnóstico de base.",
    foco: "Fundamentos · diagnóstico · clássicos",
    rules: [
      { re: /básico|fundamento|diagnóstico|clássico|definição|conceito/i, w: 1.4 },
      { re: /urgenc|sepse|sca|iam/i, w: 1.15 },
      { re: /transplante|onco avanç|pesquisa/i, w: 0.7 }
    ]
  },
  unicamp: {
    verdict:
      "Perfil Unicamp: diferencial diagnóstico e protocolo — cobra nuance e números.",
    foco: "Diferencial · protocolo · nuance",
    rules: [
      { re: /diferencial|dd\b|protocolo|critério|nuance|indicação/i, w: 1.45 },
      { re: /conduta|tratamento|droga/i, w: 1.2 }
    ]
  },
  einstein: {
    verdict:
      "Perfil Einstein: guidelines atualizados e conduta com números exatos.",
    foco: "Guideline · conduta · números",
    rules: [
      { re: /conduta|guideline|tratamento|droga|meta|número|dose|indicação/i, w: 1.55 },
      { re: /fisiopat|semiolog|históric/i, w: 0.8 }
    ]
  }
};

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

function weightForTema(tema, rules) {
  let w = 1;
  const t = String(tema || "");
  for (const rule of rules || []) {
    if (rule.re.test(t)) w *= rule.w;
  }
  return w;
}

function normalizePriorities(items) {
  if (!items.length) return items;
  const sum = items.reduce((a, p) => a + p.pct, 0);
  if (sum <= 0) return items;

  const scaled = items.map((p) => ({
    ...p,
    pct: Math.round((p.pct / sum) * 1000) / 10
  }));

  let acc = scaled.reduce((a, p) => a + p.pct, 0);
  acc = Math.round(acc * 10) / 10;
  if (acc !== 100 && scaled.length) {
    scaled[0].pct = Math.round((scaled[0].pct + (100 - acc)) * 10) / 10;
  }

  return scaled.map((p) => {
    const out = { tema: p.tema, pct: p.pct };
    if (p.n != null) out.n = Math.max(1, Math.round((p.pct / 100) * (p._sample || 100)));
    return out;
  });
}

/** Offset por posição quando os temas não batem keywords — garante ranking distinto. */
const POSITION_BIAS = {
  revalida: [1.15, 1.05, 1.0, 0.95, 0.9, 0.85, 0.8, 0.8],
  "sus-sp": [0.85, 1.25, 1.05, 1.4, 1.15, 0.9, 1.1, 0.95],
  "sus-ba": [1.35, 0.8, 1.2, 0.85, 1.3, 1.1, 0.9, 1.0],
  amp: [1.2, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85, 0.8],
  "ses-pe": [1.3, 0.85, 1.25, 0.9, 1.2, 1.05, 0.95, 1.0],
  ufmg: [1.25, 1.15, 1.05, 0.95, 0.9, 0.85, 0.8, 0.8],
  ufrgs: [1.1, 1.2, 1.05, 1.0, 0.95, 0.9, 0.9, 0.85],
  ufrj: [1.05, 1.1, 1.2, 1.05, 0.95, 0.9, 0.85, 0.85],
  unicamp: [1.15, 1.05, 1.2, 1.1, 0.95, 0.9, 0.85, 0.8],
  einstein: [1.05, 1.25, 1.15, 1.0, 0.95, 0.9, 0.85, 0.8]
};

function remapPriorities(priorities, bankId) {
  const bias = BANK_BIAS[bankId];
  if (!bias || !Array.isArray(priorities) || !priorities.length) {
    return priorities ? deepClone(priorities) : [];
  }

  const sampleHint = priorities.reduce((a, p) => a + (p.n || 0), 0) || 100;
  const pos = POSITION_BIAS[bankId] || [];
  const weighted = priorities.map((p, i) => {
    const kw = weightForTema(p.tema, bias.rules);
    const pw = pos[i] != null ? pos[i] : pos[pos.length - 1] || 1;
    return {
      tema: p.tema,
      pct: Math.max(0.5, (Number(p.pct) || 1) * kw * pw),
      n: p.n,
      _sample: sampleHint
    };
  });

  weighted.sort((a, b) => b.pct - a.pct);
  return normalizePriorities(weighted);
}

function expandProfiles(profiles, moduleTitle, specialtyLabel) {
  const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const geral = byId.geral || (profiles && profiles[0]);
  if (!geral) throw new Error("sem perfil geral em " + moduleTitle);

  return BANK_META.map((meta) => {
    const isEstimativa = Object.prototype.hasOwnProperty.call(CLONE_FROM, meta.id);

    // Mantém perfis autorais (geral/enamed/usp/…) sem sobrescrever
    if (byId[meta.id] && !isEstimativa) {
      const existing = deepClone(byId[meta.id]);
      existing.label = meta.label;
      existing.kicker = existing.kicker || meta.kicker;
      if (meta.featured) existing.featured = true;
      return existing;
    }

    const baseId = CLONE_FROM[meta.id] || "geral";
    const base = deepClone(byId[baseId] || geral);
    const bias = BANK_BIAS[meta.id];

    base.id = meta.id;
    base.label = meta.label;
    base.kicker = meta.kicker;
    base.featured = !!meta.featured;
    base.sourceType = meta.sourceType;
    base.estilo = meta.estilo;
    base.blurb = bias
      ? ("Estimativa " + meta.label + " · " + (bias.foco || meta.label))
      : base.blurb || ("Padrão " + meta.label + " neste grupo.");
    base.foco = bias ? bias.foco : base.foco;
    base.verdict = bias
      ? bias.verdict + " Estimativa por padrão da banca (não é ranking oficial deste módulo)."
      : (base.verdict || "") +
        (meta.sourceType === "estimativa"
          ? " Estimativa por padrão da banca (não é ranking oficial deste módulo)."
          : "");
    base.source =
      "Estimativa " +
      meta.label +
      " · " +
      specialtyLabel +
      " · " +
      moduleTitle +
      " (recorte distinto de " +
      baseId +
      ").";
    base.priorities = remapPriorities(base.priorities || [], meta.id);
    return base;
  });
}

function expandFiles(files, specialtyLabel) {
  for (const file of files) {
    const full = path.join(__dirname, "..", "..", "data", file);
    if (!fs.existsSync(full)) {
      console.warn("skip missing", file);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    data.profiles = expandProfiles(data.profiles || [], data.title || file, specialtyLabel);
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(file, "→", data.profiles.length, "bancas");
  }
}

module.exports = {
  BANK_META,
  CLONE_FROM,
  BANK_BIAS,
  expandProfiles,
  expandFiles,
  remapPriorities
};
