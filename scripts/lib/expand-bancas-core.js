/**
 * Núcleo compartilhado: expande bancas R1 com prioridades DISTINTAS.
 * Inclui provas de alto volume/concorrência + padrão CONSESP (várias instituições).
 */
const fs = require("fs");
const path = require("path");

/** Ordem = importância (inscritos + concorrência) no ciclo 2024–2026. */
const BANK_META = [
  { id: "geral", label: "Brasil", kicker: "Síntese 2024–2026", featured: false, sourceType: "sintese", estilo: "Síntese das principais bancas" },
  { id: "enare", label: "Enare", kicker: "~87 mil inscritos · 2025", featured: false, sourceType: "levantamento", estilo: "Levantamento Enare" },
  { id: "enamed", label: "Enamed", kicker: "Nacional · acesso Enare", featured: true, sourceType: "levantamento", estilo: "Levantamento Enare/Enamed" },
  { id: "usp", label: "USP", kicker: "Alta concorrência · ~10 mil", featured: false, sourceType: "levantamento", estilo: "Levantamento USP-SP" },
  { id: "unifesp", label: "UNIFESP", kicker: "Alta concorrência · ~7,5 mil", featured: false, sourceType: "levantamento", estilo: "Levantamento UNIFESP" },
  { id: "revalida", label: "Revalida", kicker: "INEP · alto volume", featured: false, sourceType: "estimativa", estilo: "Estimativa INEP/Revalida" },
  { id: "amp", label: "AMP", kicker: "Paraná · alto volume", featured: false, sourceType: "estimativa", estilo: "Estimativa clássica R1" },
  { id: "santa-casa", label: "Santa Casa SP", kicker: "Altíssima concorrência", featured: false, sourceType: "estimativa", estilo: "Estimativa institucional SP" },
  { id: "sirio", label: "Sírio-Libanês", kicker: "Alta concorrência · privada", featured: false, sourceType: "estimativa", estilo: "Estimativa guideline" },
  { id: "iamspe", label: "IAMSPE", kicker: "HSPE · alta demanda SP", featured: false, sourceType: "estimativa", estilo: "Estimativa APS/institucional" },
  { id: "sus-sp", label: "SUS-SP", kicker: "APS São Paulo", featured: false, sourceType: "estimativa", estilo: "Estimativa APS" },
  { id: "unicamp", label: "Unicamp", kicker: "Alta concorrência · SP", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "puc-sp", label: "PUC-SP", kicker: "Alta concorrência · SP", featured: false, sourceType: "estimativa", estilo: "Estimativa institucional" },
  { id: "ufmg", label: "UFMG", kicker: "Institucional MG", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "ufrgs", label: "UFRGS", kicker: "HCPA / Sul", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "consesp", label: "CONSESP", kicker: "Padrão da banca · várias instituições", featured: false, sourceType: "estimativa", estilo: "Estimativa padrão CONSESP" },
  { id: "sus-ba", label: "SUS-BA", kicker: "APS + endemias", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" },
  { id: "ses-pe", label: "SES-PE", kicker: "Regional NE", featured: false, sourceType: "estimativa", estilo: "Estimativa regional" },
  { id: "ufrj", label: "UFRJ", kicker: "Institucional RJ", featured: false, sourceType: "estimativa", estilo: "Estimativa por padrão recorrente" },
  { id: "einstein", label: "Einstein", kicker: "Guideline / privada", featured: false, sourceType: "estimativa", estilo: "Estimativa guideline" }
];

/** Bancas estimadas: sempre reconstruídas a partir da base + bias. */
const CLONE_FROM = {
  revalida: "enamed",
  amp: "enamed",
  "santa-casa": "usp",
  sirio: "unifesp",
  iamspe: "enamed",
  "sus-sp": "enamed",
  unicamp: "usp",
  "puc-sp": "usp",
  ufmg: "usp",
  ufrgs: "usp",
  consesp: "enamed",
  "sus-ba": "enamed",
  "ses-pe": "enamed",
  ufrj: "usp",
  einstein: "unifesp"
};

/**
 * Multiplicadores + orientação de estudo por prova.
 * O veredito deve deixar claro O QUE estudar naquela banca.
 */
const BANK_BIAS = {
  revalida: {
    verdict:
      "Estude como Revalida: APS, crônicas e urgências básicas com conduta prática — menos terciário e menos “pegadinha” laboratorial.",
    foco: "APS · urgências · conduta prática",
    rules: [
      { re: /has|hipertens|aps|croni|dm|diabet|asma|dpoc|itu|desidrat|gastro|imuniz|vacin|aleit|nutri|prevenc|rastre|sus\b|princípio/i, w: 1.5 },
      { re: /urgenc|sepse|sca|iam|pcr|avc|crise|cad\b|ira\b/i, w: 1.3 },
      { re: /fisiopat|biópsia|nódulo|onco|transplante|critério|lab\b|eixo/i, w: 0.65 }
    ]
  },
  amp: {
    verdict:
      "Estude como AMP: clássicos de R1 que se repetem — critérios diagnósticos, condutas e temas “prova tradicional”.",
    foco: "Clássicos R1 · critérios · conduta",
    rules: [
      { re: /sca|iam|icc|has|fa\b|arritm|tireo|dm|diabet|les\b|ar\b|gota|avc|epilep|ira\b|sn\b|gna|asma|dpoc|tep/i, w: 1.45 },
      { re: /raro|transplante|pesquisa|guideline novo/i, w: 0.7 }
    ]
  },
  "santa-casa": {
    verdict:
      "Estude como Santa Casa SP: prova densa e concorrida — fisiopatologia, critérios e diferenciais; cobre bem o núcleo clínico-cirúrgico clássico.",
    foco: "Fisiopat · critérios · diferenciais",
    rules: [
      { re: /fisiopat|critério|diferencial|dd\b|lab\b|ecg|semiolog|diagnóstico|mecanismo/i, w: 1.55 },
      { re: /sca|iam|icc|avc|sepse|ira\b|tireo|dm/i, w: 1.25 },
      { re: /aps|rastre|previne|imuniz/i, w: 0.75 }
    ]
  },
  sirio: {
    verdict:
      "Estude como Sírio-Libanês: guideline atualizado, números de meta/dose e conduta hospitalar — perfil próximo a instituições privadas de alta complexidade.",
    foco: "Guideline · metas · conduta hospitalar",
    rules: [
      { re: /conduta|guideline|tratamento|droga|meta|número|dose|indicação|protocolo/i, w: 1.6 },
      { re: /uti|intens|sepse|sca|iam|onco|transplante/i, w: 1.25 },
      { re: /aps|esf|aleit|imuniz básica/i, w: 0.7 }
    ]
  },
  iamspe: {
    verdict:
      "Estude como IAMSPE/HSPE: serviço público de SP — APS + urgências + crônicas; forte em protocolo assistencial e clínica do dia a dia.",
    foco: "APS · urgências · crônicas SP",
    rules: [
      { re: /has|icc|dm|diabet|asma|dpoc|itu|aps|esf|croni|rastre|imuniz|desidrat|gastro/i, w: 1.55 },
      { re: /urgenc|sepse|sca|iam|avc|pcr/i, w: 1.25 },
      { re: /transplante|onco raro|pesquisa/i, w: 0.65 }
    ]
  },
  "sus-sp": {
    verdict:
      "Estude como SUS-SP: atenção primária e protocolos MS — crônicas, rastreamento e manejo no posto, com menos peso terciário.",
    foco: "APS · crônicas · protocolos MS",
    rules: [
      { re: /has|hipertens|icc|dm|diabet|asma|dpoc|itu|nefrol|croni|aps|esf|previne|rastre|imuniz|vacin|aleit|nutri|pueric|desidrat|gastro|sua\b|anticoncep|ist\b|dip\b|sus\b|princípio|financi|programa|promo/i, w: 1.7 },
      { re: /sca|iam|pcr|acls|uti|intens|sepse|urgenc|choque/i, w: 0.9 },
      { re: /valva|miopat|transplante|onco|biópsia|fisiopat|canalopat/i, w: 0.6 }
    ]
  },
  "sus-ba": {
    verdict:
      "Estude como SUS-BA: APS com infectologia/endemias (dengue, parasitoses) e desidratação — perfil diferente do SUS-SP.",
    foco: "Infecto · endemias · desidratação",
    rules: [
      { re: /infect|dengue|arbovir|parasit|tubercul|hanseni|leish|malária|malaria|sepse|diarr|desidrat|gastro|hepat|virais|hiv|ist\b|tropic|vigilân|notifica|sinan/i, w: 1.9 },
      { re: /has|hipertens|dm|diabet|icc|asma|dpoc|aps|esf|croni|imuniz|vacin|aleit|nutri/i, w: 1.1 },
      { re: /valva|miopat|transplante|nódulo|biópsia|ecg|arritm|fisiopat|eixo/i, w: 0.55 }
    ]
  },
  "ses-pe": {
    verdict:
      "Estude como SES-PE: regional Nordeste — infecto, desidratação e APS; próximo ao SUS-BA.",
    foco: "Infecto regional · APS · desidratação",
    rules: [
      { re: /infect|dengue|arbovir|parasit|diarr|desidrat|gastro|tubercul|hanseni|leish|vigilân|notifica/i, w: 1.75 },
      { re: /has|dm|diabet|asma|imuniz|vacin|aleit|nutri|aps|esf/i, w: 1.2 },
      { re: /valva|miopat|onco|transplante|fisiopat/i, w: 0.6 }
    ]
  },
  ufmg: {
    verdict:
      "Estude como UFMG: prova analítica — fisiopatologia, critérios e lab; menos “decorar guideline” e mais mecanismo.",
    foco: "Fisiopat · critérios · lab",
    rules: [
      { re: /fisiopat|critério|lab\b|ecg|eixo|diagnóstico|semiolog|mecanismo/i, w: 1.55 },
      { re: /conduta|droga|guideline|protocolo|aps/i, w: 0.8 }
    ]
  },
  ufrgs: {
    verdict:
      "Estude como UFRGS/HCPA: equilíbrio entre critérios e conduta, com boa cobrança de protocolo assistencial.",
    foco: "Critérios · protocolo · conduta",
    rules: [
      { re: /critério|protocolo|conduta|guideline|tratamento/i, w: 1.4 },
      { re: /fisiopat|mecanismo/i, w: 1.15 }
    ]
  },
  ufrj: {
    verdict:
      "Estude como UFRJ: fundamentos e casos clássicos — diagnóstico de base e urgências comuns.",
    foco: "Fundamentos · diagnóstico · clássicos",
    rules: [
      { re: /básico|fundamento|diagnóstico|clássico|definição|conceito/i, w: 1.45 },
      { re: /urgenc|sepse|sca|iam/i, w: 1.2 },
      { re: /transplante|onco avanç|pesquisa/i, w: 0.65 }
    ]
  },
  unicamp: {
    verdict:
      "Estude como Unicamp: alta concorrência — diferencial diagnóstico, protocolo e nuance numérica.",
    foco: "Diferencial · protocolo · nuance",
    rules: [
      { re: /diferencial|dd\b|protocolo|critério|nuance|indicação/i, w: 1.5 },
      { re: /conduta|tratamento|droga/i, w: 1.25 }
    ]
  },
  "puc-sp": {
    verdict:
      "Estude como PUC-SP: prova institucional concorrida — clássicos clínicos + conduta; bom equilíbrio entre critério e prática.",
    foco: "Clássicos · conduta · critérios",
    rules: [
      { re: /clássico|critério|conduta|diagnóstico|sca|iam|icc|dm|tireo|avc/i, w: 1.4 },
      { re: /aps|imuniz|aleit/i, w: 0.85 },
      { re: /transplante|pesquisa/i, w: 0.7 }
    ]
  },
  consesp: {
    verdict:
      "Estude o padrão CONSESP (vale para as várias instituições que usam a banca): prova objetiva direta, clínica prática e urgências; foque no que se repete no estilo CONSESP, sem decorar edital de hospital específico.",
    foco: "Objetiva · clínica prática · urgências",
    rules: [
      { re: /urgenc|sepse|sca|iam|has|icc|dm|diabet|asma|dpoc|itu|avc|conduta|protocolo|clássico/i, w: 1.5 },
      { re: /aps|croni|rastre|imuniz/i, w: 1.15 },
      { re: /fisiopat profunda|pesquisa|transplante|onco raro|eixo dinâmico/i, w: 0.65 }
    ]
  },
  einstein: {
    verdict:
      "Estude como Einstein: guidelines atualizados e conduta com números exatos (metas, doses, indicações).",
    foco: "Guideline · conduta · números",
    rules: [
      { re: /conduta|guideline|tratamento|droga|meta|número|dose|indicação/i, w: 1.6 },
      { re: /fisiopat|semiolog|históric/i, w: 0.75 }
    ]
  }
};

const POSITION_BIAS = {
  revalida: [1.15, 1.05, 1.0, 0.95, 0.9, 0.85, 0.8, 0.8],
  amp: [1.2, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85, 0.8],
  "santa-casa": [1.3, 1.2, 1.1, 1.0, 0.9, 0.85, 0.8, 0.75],
  sirio: [1.05, 1.3, 1.2, 1.1, 0.95, 0.9, 0.85, 0.8],
  iamspe: [0.95, 1.25, 1.15, 1.35, 1.1, 0.95, 1.0, 0.9],
  "sus-sp": [0.85, 1.25, 1.05, 1.4, 1.15, 0.9, 1.1, 0.95],
  "sus-ba": [1.35, 0.8, 1.2, 0.85, 1.3, 1.1, 0.9, 1.0],
  "ses-pe": [1.3, 0.85, 1.25, 0.9, 1.2, 1.05, 0.95, 1.0],
  ufmg: [1.25, 1.15, 1.05, 0.95, 0.9, 0.85, 0.8, 0.8],
  ufrgs: [1.1, 1.2, 1.05, 1.0, 0.95, 0.9, 0.9, 0.85],
  ufrj: [1.05, 1.1, 1.2, 1.05, 0.95, 0.9, 0.85, 0.85],
  unicamp: [1.15, 1.05, 1.2, 1.1, 0.95, 0.9, 0.85, 0.8],
  "puc-sp": [1.2, 1.1, 1.15, 1.05, 0.95, 0.9, 0.85, 0.85],
  consesp: [1.25, 1.15, 1.2, 1.05, 1.0, 0.9, 0.85, 0.8],
  einstein: [1.05, 1.25, 1.15, 1.0, 0.95, 0.9, 0.85, 0.8]
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

/** Guia curto para perfis autorais (geral / enamed / enare / usp / unifesp). */
const AUTHORED_STUDY_GUIDE = {
  geral: {
    kicker: "Síntese 2024–2026",
    studyLine:
      "Use Geral Brasil se ainda não definiu a prova: é a média ponderada do ciclo 2024–2026 (Enare/Enamed + USP/UNIFESP + AMP e correlatas). Depois refine pela banca escolhida."
  },
  enamed: {
    kicker: "Nacional · acesso Enare · 2024–2026",
    studyLine:
      "Estude como Enamed: perfil generalista nacional — o que o formando encontra no dia a dia e no acesso direto Enare."
  },
  enare: {
    kicker: "~87 mil inscritos · 2025",
    studyLine:
      "Estude como Enare: urgências e condutas de alto rendimento; priorize o que decide prova nacional de grande volume."
  },
  usp: {
    kicker: "Alta concorrência · 2024–2026",
    studyLine:
      "Estude como USP: fisiopatologia, critérios e diferenciais — prova densa; foque mecanismo + indicação."
  },
  unifesp: {
    kicker: "Alta concorrência · 2024–2026",
    studyLine:
      "Estude como UNIFESP: conduta e guidelines com números; bom equilíbrio entre clínica e protocolo."
  }
};

function patchAuthoredProfile(profile) {
  const guide = AUTHORED_STUDY_GUIDE[profile.id];
  if (!guide) return profile;
  const p = deepClone(profile);
  p.kicker = guide.kicker;
  const baseVerdict = String(p.verdict || "").replace(/\s*Use Geral Brasil[\s\S]*$/i, "").trim();
  const baseStudy = String(guide.studyLine || "").trim();
  if (!baseVerdict.includes("Estude como") && !baseVerdict.includes("Use Geral Brasil")) {
    p.verdict = (baseStudy + (baseVerdict ? " " + baseVerdict : "")).trim();
  } else if (p.id === "geral" && !/Use Geral Brasil/i.test(baseVerdict)) {
    p.verdict = (baseVerdict + " " + baseStudy).trim();
  }
  if (p.id === "geral") {
    p.source =
      "Síntese ponderada ciclo 2024–2026 (Enare/Enamed + USP/UNIFESP + AMP e correlatas de alto volume/concorrência).";
    p.estilo = "Síntese 2024–2026";
  }
  return p;
}

function prioritiesEqual(a, b) {
  return JSON.stringify(a || []) === JSON.stringify(b || []);
}

function expandProfiles(profiles, moduleTitle, specialtyLabel) {
  const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const geral = byId.geral || (profiles && profiles[0]);
  if (!geral) throw new Error("sem perfil geral em " + moduleTitle);

  return BANK_META.map((meta) => {
    const isEstimativa = Object.prototype.hasOwnProperty.call(CLONE_FROM, meta.id);
    const baseId = CLONE_FROM[meta.id] || "geral";
    const baseSrc = byId[baseId] || geral;
    const bias = BANK_BIAS[meta.id];

    // Perfis autorais (geral/enamed/usp/…)
    if (byId[meta.id] && !isEstimativa) {
      const existing = patchAuthoredProfile(deepClone(byId[meta.id]));
      existing.label = meta.label;
      existing.kicker = existing.kicker || meta.kicker;
      if (meta.featured) existing.featured = true;
      return existing;
    }

    // Mantém estimativa já calibrada (ex.: Pediatria SUS-SP) se for distinta da base
    if (
      byId[meta.id] &&
      isEstimativa &&
      !prioritiesEqual(byId[meta.id].priorities, baseSrc.priorities)
    ) {
      const existing = deepClone(byId[meta.id]);
      existing.label = meta.label;
      existing.kicker = meta.kicker;
      existing.sourceType = meta.sourceType;
      existing.estilo = meta.estilo;
      if (bias) {
        existing.foco = bias.foco;
        existing.blurb = "Estudo dirigido · " + meta.label + " · " + bias.foco;
        if (!/Estude como|Estude o padrão/i.test(String(existing.verdict || ""))) {
          existing.verdict =
            bias.verdict +
            " Estimativa por padrão da prova/banca no ciclo 2024–2026 (não é ranking oficial deste módulo).";
        }
      }
      delete existing.byYear;
      // Evita manter bloco opaco "Demais" — o split fino roda em scripts/split-demais-stats.js
      return existing;
    }

    const base = deepClone(baseSrc);
    base.id = meta.id;
    base.label = meta.label;
    base.kicker = meta.kicker;
    base.featured = !!meta.featured;
    base.sourceType = meta.sourceType;
    base.estilo = meta.estilo;
    base.blurb = bias
      ? ("Estudo dirigido · " + meta.label + " · " + (bias.foco || meta.label))
      : base.blurb || ("Padrão " + meta.label + " neste grupo.");
    base.foco = bias ? bias.foco : base.foco;
    base.verdict = bias
      ? bias.verdict + " Estimativa por padrão da prova/banca no ciclo 2024–2026 (não é ranking oficial deste módulo)."
      : (base.verdict || "") +
        (meta.sourceType === "estimativa"
          ? " Estimativa por padrão da prova/banca no ciclo 2024–2026."
          : "");
    base.source =
      "Estimativa " +
      meta.label +
      " · " +
      specialtyLabel +
      " · " +
      moduleTitle +
      " · ciclo 2024–2026 (recorte distinto de " +
      baseId +
      ").";
    delete base.byYear;
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
    if (data.note && !/2024|2025|2026/.test(data.note)) {
      data.note += " Recorte principal: provas 2024–2026.";
    }
    fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(file, "→", data.profiles.length, "bancas");
  }
}

module.exports = {
  BANK_META,
  CLONE_FROM,
  BANK_BIAS,
  AUTHORED_STUDY_GUIDE,
  expandProfiles,
  expandFiles,
  remapPriorities,
  patchAuthoredProfile
};
