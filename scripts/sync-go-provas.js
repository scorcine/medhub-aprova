const fs = require("fs");

const pedStats = require("../data/stats-pediatria-geral.json");
const ginStats = require("../data/stats-ginecologia-geral.json");
const ginRev = require("../data/revisao-ginecologia.json");
const obsRev = require("../data/revisao-obstetricia.json");

const byId = (arr) => Object.fromEntries(arr.map((p) => [p.id, p]));
const existingStats = byId(ginStats.profiles);
const existingRev = byId(ginRev.profiles);

function scaleN(priorities, sample) {
  return priorities.map((p) => ({
    ...p,
    n: Math.max(1, Math.round((p.pct / 100) * sample))
  }));
}

const ESTIMATIVAS = {
  revalida: {
    sampleSize: 200,
    verdict:
      "No Revalida, Ginecologia privilegia conduta de APS/MS: infecções, anticoncepção, rastreamento de colo/mama e SUA prática.",
    foco: "Infecções · Anticoncepção · Rastreamento · SUA",
    estilo: "Estimativa INEP/Revalida",
    priorities: [
      { tema: "Infecções (vulvovaginite, IST, DIP)", pct: 22 },
      { tema: "Anticoncepção / planejamento familiar", pct: 18 },
      { tema: "Oncoginecologia (colo, endométrio)", pct: 18 },
      { tema: "Sangramento uterino / SUA", pct: 14 },
      { tema: "Mastologia / rastreamento", pct: 12 },
      { tema: "Ginecologia endócrina básica", pct: 10 },
      { tema: "Uroginecologia / climatério", pct: 6 }
    ]
  },
  "sus-sp": {
    sampleSize: 180,
    verdict:
      "No SUS-SP, Ginecologia pesa protocolo de APS: IST/DIP, anticoncepção, rastreio colo/mama e condução de SUA no posto.",
    foco: "IST/DIP · Anticoncepção · Rastreio · SUA",
    estilo: "Estimativa APS",
    priorities: [
      { tema: "Infecções (vulvovaginite, IST, DIP)", pct: 24 },
      { tema: "Anticoncepção / planejamento familiar", pct: 18 },
      { tema: "Rastreamento colo / mama", pct: 16 },
      { tema: "Sangramento uterino / SUA", pct: 14 },
      { tema: "Ginecologia endócrina (SOP, amenorreia)", pct: 12 },
      { tema: "Climatério / TH básica", pct: 10 },
      { tema: "Uroginecologia", pct: 6 }
    ]
  },
  "sus-ba": {
    sampleSize: 180,
    verdict:
      "No SUS-BA, infecções e anticoncepção sobem; endócrino básico e rastreamento completam o núcleo de APS.",
    foco: "Infecções · Anticoncepção · Endócrino · Rastreio",
    estilo: "Estimativa regional",
    priorities: [
      { tema: "Infecções (vulvovaginite, IST, DIP)", pct: 26 },
      { tema: "Anticoncepção / planejamento familiar", pct: 16 },
      { tema: "Ginecologia endócrina", pct: 14 },
      { tema: "Oncoginecologia / rastreio colo", pct: 14 },
      { tema: "Sangramento uterino / SUA", pct: 12 },
      { tema: "Mastologia", pct: 10 },
      { tema: "Uroginecologia", pct: 8 }
    ]
  },
  ufmg: {
    sampleSize: 160,
    verdict:
      "Na UFMG, endócrino e oncoginecologia concentram o retorno; mastologia e urogin aparecem em segunda linha.",
    foco: "Endócrino · Onco · Mama · Uro",
    estilo: "Estimativa por padrão recorrente",
    priorities: [
      { tema: "Ginecologia endócrina", pct: 30 },
      { tema: "Oncoginecologia", pct: 26 },
      { tema: "Mastologia", pct: 14 },
      { tema: "Infecções", pct: 12 },
      { tema: "Uroginecologia", pct: 10 },
      { tema: "Anticoncepção", pct: 8 }
    ]
  },
  ufrgs: {
    sampleSize: 160,
    verdict:
      "Na UFRGS, o padrão é equilibrado entre endócrino, onco e mama, com boa cobrança de protocolo.",
    foco: "Endócrino · Onco · Mama · Infecto",
    estilo: "Estimativa por padrão recorrente",
    priorities: [
      { tema: "Ginecologia endócrina", pct: 28 },
      { tema: "Oncoginecologia", pct: 24 },
      { tema: "Mastologia", pct: 16 },
      { tema: "Infecções", pct: 14 },
      { tema: "Anticoncepção", pct: 10 },
      { tema: "Uroginecologia", pct: 8 }
    ]
  },
  ufrj: {
    sampleSize: 160,
    verdict:
      "Na UFRJ, o ganho está nos fundamentos: ciclo/amenorreia, infecções, anticoncepção e rastreamento.",
    foco: "Endócrino · Infecções · Anticoncepção · Rastreio",
    estilo: "Estimativa por padrão recorrente",
    priorities: [
      { tema: "Ginecologia endócrina / ciclo", pct: 26 },
      { tema: "Infecções", pct: 20 },
      { tema: "Anticoncepção", pct: 16 },
      { tema: "Oncoginecologia / rastreio", pct: 16 },
      { tema: "Mastologia", pct: 12 },
      { tema: "SUA / mioma", pct: 10 }
    ]
  },
  unicamp: {
    sampleSize: 160,
    verdict:
      "Unicamp cobra diferencial e protocolo: onco (colo/endométrio), endócrino e casos clássicos de SUA/mama.",
    foco: "Onco · Endócrino · SUA · Mama",
    estilo: "Estimativa por padrão recorrente",
    priorities: [
      { tema: "Oncoginecologia", pct: 28 },
      { tema: "Ginecologia endócrina", pct: 24 },
      { tema: "Sangramento uterino / SUA", pct: 14 },
      { tema: "Mastologia", pct: 14 },
      { tema: "Infecções", pct: 12 },
      { tema: "Uroginecologia", pct: 8 }
    ]
  },
  einstein: {
    sampleSize: 160,
    verdict:
      "No Einstein, cobram guideline atualizado: rastreamento, TH, BI-RADS e condutas Febrasgo/MS com números exatos.",
    foco: "Rastreamento · TH · BI-RADS · Protocolos",
    estilo: "Estimativa guideline",
    priorities: [
      { tema: "Oncoginecologia / rastreio colo", pct: 22 },
      { tema: "Mastologia / BI-RADS", pct: 20 },
      { tema: "Climatério / TH", pct: 18 },
      { tema: "Ginecologia endócrina", pct: 16 },
      { tema: "Infecções / IST", pct: 14 },
      { tema: "Anticoncepção", pct: 10 }
    ]
  },
  amp: {
    sampleSize: 160,
    verdict:
      "Na AMP, o clássico R1 de Ginecologia prevalece: endócrino, SUA/mioma, colo e infecções.",
    foco: "Endócrino · SUA · Colo · Infecções",
    estilo: "Estimativa clássica R1",
    priorities: [
      { tema: "Ginecologia endócrina", pct: 30 },
      { tema: "Sangramento uterino / mioma", pct: 18 },
      { tema: "Oncoginecologia (colo)", pct: 18 },
      { tema: "Infecções", pct: 16 },
      { tema: "Mastologia", pct: 10 },
      { tema: "Anticoncepção", pct: 8 }
    ]
  },
  "ses-pe": {
    sampleSize: 160,
    verdict:
      "No SES-PE, o perfil regional privilegia APS: infecções, anticoncepção, rastreamento e endócrino prático.",
    foco: "Infecções · Anticoncepção · Rastreio · Endócrino",
    estilo: "Estimativa regional",
    priorities: [
      { tema: "Infecções", pct: 24 },
      { tema: "Anticoncepção", pct: 18 },
      { tema: "Oncoginecologia / rastreio", pct: 16 },
      { tema: "Ginecologia endócrina", pct: 16 },
      { tema: "Sangramento uterino / SUA", pct: 14 },
      { tema: "Mastologia", pct: 12 }
    ]
  }
};

const all = ginRev.profiles[0].deckOrder.slice();
function pick(ids) {
  const set = new Set(ids);
  const head = ids.filter((id) => all.includes(id));
  const rest = all.filter((id) => !set.has(id));
  return head.concat(rest);
}

const DECK_SETS = {
  default: all,
  infecto: pick([
    "gin6-vulvovaginites",
    "gin6-dip",
    "gin6-sifilis",
    "gin6-ulceras",
    "gin6-cervicite",
    "gin6-violencia-pep",
    "gin1-anticoncepcao",
    "gin1-diu-lam",
    "gin5-rastreamento-colo",
    "gin5-citologia",
    "gin2-palm-coein",
    "gin2-sua-tratamento"
  ]),
  endocrino: pick([
    "gin1-amenorreia",
    "gin1-amenorreia-primaria",
    "gin1-amenorreia-secundaria",
    "gin1-sop",
    "gin1-ciclo",
    "gin1-hiperprolactinemia",
    "gin1-hiperandrogenismo",
    "gin1-anticoncepcao",
    "gin1-diu-lam",
    "gin1-spm",
    "gin2-palm-coein",
    "gin2-sua-tratamento",
    "gin3-th-indicacoes",
    "gin3-th-riscos",
    "gin3-climaterio"
  ]),
  onco: pick([
    "gin5-rastreamento-colo",
    "gin5-citologia",
    "gin5-hiperplasia",
    "gin5-ca-endometrio",
    "gin5-nic-tratamento",
    "gin5-hpv",
    "gin5-ca-colo",
    "gin4-rastreamento",
    "gin4-birads",
    "gin4-ca-mama",
    "gin4-ca-mama-tratamento",
    "gin4-massa-anexial",
    "gin4-ca-ovario"
  ]),
  mama: pick([
    "gin4-rastreamento",
    "gin4-birads",
    "gin4-ca-mama",
    "gin4-ca-mama-tratamento",
    "gin4-benignas",
    "gin5-rastreamento-colo",
    "gin5-citologia",
    "gin3-th-indicacoes",
    "gin3-th-riscos"
  ]),
  aps: pick([
    "gin6-vulvovaginites",
    "gin6-dip",
    "gin6-sifilis",
    "gin1-anticoncepcao",
    "gin1-diu-lam",
    "gin5-rastreamento-colo",
    "gin4-rastreamento",
    "gin2-palm-coein",
    "gin2-sua-investigacao",
    "gin1-sop",
    "gin1-amenorreia"
  ])
};

const DECK_BY_PROFILE = {
  geral: "default",
  enamed: "aps",
  enare: "onco",
  revalida: "aps",
  usp: "endocrino",
  unifesp: "endocrino",
  "sus-sp": "aps",
  "sus-ba": "infecto",
  ufmg: "endocrino",
  ufrgs: "default",
  ufrj: "aps",
  unicamp: "onco",
  einstein: "mama",
  amp: "endocrino",
  "ses-pe": "aps"
};

const defaultChecklist = ["endocrino", "onco", "infecto", "mama", "sua", "th"];
const defaultSessoes = ginRev.profiles[0].sessoes;
const defaultLacuna = ginRev.profiles[0].lacuna;

function buildStatsProfile(pedP) {
  const id = pedP.id;
  if (existingStats[id]) {
    return {
      ...existingStats[id],
      label: pedP.label,
      featured: !!pedP.featured
    };
  }
  const est = ESTIMATIVAS[id];
  if (!est) throw new Error("Missing estimativa for " + id);
  return {
    id,
    label: pedP.label,
    kicker: pedP.kicker,
    featured: !!pedP.featured,
    sourceType: "estimativa",
    sampleSize: est.sampleSize,
    source:
      "Estimativa por padrão recorrente da banca em Ginecologia (não é ranking oficial). Contagens proporcionais em base ilustrativa de " +
      est.sampleSize +
      " questões.",
    verdict: est.verdict,
    foco: est.foco,
    estilo: est.estilo,
    priorities: scaleN(est.priorities, est.sampleSize)
  };
}

function buildRevProfile(pedP, statsP) {
  const id = pedP.id;
  const deckKey = DECK_BY_PROFILE[id] || "default";
  const deckOrder = DECK_SETS[deckKey] || DECK_SETS.default;

  if (existingRev[id]) {
    return {
      ...existingRev[id],
      label: pedP.label,
      featured: !!pedP.featured,
      deckOrder:
        existingRev[id].deckOrder && existingRev[id].deckOrder.length
          ? existingRev[id].deckOrder
          : deckOrder
    };
  }

  return {
    id,
    label: pedP.label,
    kicker: pedP.kicker,
    featured: !!pedP.featured,
    blurb: pedP.kicker,
    verdict: statsP.verdict,
    foco: statsP.foco,
    estilo: statsP.estilo || "Estimativa por padrão recorrente",
    priorities: statsP.priorities,
    deckOrder,
    checklist: defaultChecklist.slice(),
    sessoes: defaultSessoes.map((s) => ({ ...s })),
    lacuna: defaultLacuna,
    sourceType: "estimativa",
    source: statsP.source
  };
}

const newStatsProfiles = pedStats.profiles.map(buildStatsProfile);
ginStats.profiles = newStatsProfiles;
ginStats.note =
  "Percentuais e contagens = participação dentro das questões de Ginecologia (não da prova inteira). Levantamentos usam a série citada; estimativas usam base ilustrativa proporcional. Mesmas provas da visão Pediatria — novas bancas entram depois.";
fs.writeFileSync(
  "data/stats-ginecologia-geral.json",
  JSON.stringify(ginStats, null, 2) + "\n"
);

const newRevProfiles = pedStats.profiles.map((pedP, i) =>
  buildRevProfile(pedP, newStatsProfiles[i])
);
ginRev.profiles = newRevProfiles;
ginRev.note =
  "Percentuais = participação do tema dentro da Ginecologia (não da prova inteira). Subtemas = decks Gin1–Gin6 unificados. Lista de provas alinhada à Pediatria.";
fs.writeFileSync(
  "data/revisao-ginecologia.json",
  JSON.stringify(ginRev, null, 2) + "\n"
);

obsRev.profiles = pedStats.profiles.map((pedP) => ({
  id: pedP.id,
  label: pedP.label,
  kicker: pedP.id === "geral" ? "Em breve" : pedP.kicker,
  featured: !!pedP.featured,
  blurb: "Grupo reservado para as apostilas de Obstetrícia.",
  verdict:
    "Obstetrícia entra a seguir (pré-natal, parto, sangramentos, hipertensão, diabetes gestacional e urgências). Por enquanto o grupo está pronto na navegação, sem subtemas.",
  foco: "Pré-natal · Parto · Sangramentos · Hipertensão · Urgências",
  estilo: "Placeholder — conteúdo em construção",
  priorities: [{ tema: "Conteúdo em breve", pct: 100, n: 0 }],
  deckOrder: [],
  checklist: [],
  sessoes: [
    {
      titulo: "Em breve",
      texto: "Os subtemas de Obstetrícia serão adicionados na próxima etapa."
    }
  ],
  lacuna: "Aguardando as apostilas de Obstetrícia.",
  sourceType: "estimativa",
  source:
    "Grupo placeholder — estatísticas e decks serão preenchidos com as apostilas de Obstetrícia."
}));
fs.writeFileSync(
  "data/revisao-obstetricia.json",
  JSON.stringify(obsRev, null, 2) + "\n"
);

console.log("stats:", ginStats.profiles.map((p) => p.id).join(", "));
console.log("rev:", ginRev.profiles.map((p) => p.id).join(", "));
console.log("obs:", obsRev.profiles.map((p) => p.id).join(", "));
console.log(
  "counts",
  ginStats.profiles.length,
  ginRev.profiles.length,
  obsRev.profiles.length
);
