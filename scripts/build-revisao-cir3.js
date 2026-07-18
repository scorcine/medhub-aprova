const fs = require("fs");
const path = require("path");
const ids = require("../data/flashcards-cir3.json").map((d) => d.id);

const orderGeral = [
  "cir3-asa",
  "cir3-risco-cardiaco",
  "cir3-jejum-atb",
  "cir3-hernia-inguinal",
  "cir3-hernia-outras",
  "cir3-isc",
  "cir3-posop-febre",
  "cir3-anestesia",
  "cir3-suturas-hemostasia",
  "cir3-posop-anastomose"
];

const data = {
  title: "Cir3 · Pré/pós-op · Hérnias · Anestesia",
  module: "cir3",
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Apostila Cir3",
      blurb: "Pré/pós-op, hérnias e anestesia — o que mais cai.",
      verdict:
        "No Cir3, o ROI está em hérnia inguinal (Hesselbach, direta×indireta, Lichtenstein), antibioticoprofilaxia/classes de ferida, ASA/IRCR e ISC/deiscência. Jejuno ERAS, TVP/TEP e toxicidade de AL fecham a cauda de alta frequência.",
      foco: "Hérnia inguinal · ATB/classes · ASA/IRCR · ISC · Deiscência",
      estilo: "Síntese Cir3 × estatística Brasil",
      priorities: [
        { tema: "Hérnias", pct: 26, n: 26 },
        { tema: "Pré-operatório (ASA/IRCR/jejum/ATB)", pct: 22, n: 22 },
        { tema: "ISC / deiscência / febre", pct: 20, n: 20 },
        { tema: "Anestesia", pct: 16, n: 16 },
        { tema: "TVP-TEP / suturas / anastomose", pct: 16, n: 16 }
      ],
      deckOrder: orderGeral,
      checklist: ["hesselbach", "atb60", "asa", "isc", "lichtenstein"],
      sessoes: [
        {
          titulo: "Sessão 1 · Hérnias",
          texto: "Hesselbach, direta×indireta, femoral e Richter."
        },
        {
          titulo: "Sessão 2 · Pré-op",
          texto: "ASA, IRCR, jejum ERAS e cefazolina 30–60 min."
        },
        {
          titulo: "Sessão 3 · Pós-op",
          texto: "ISC, água de carne e TVP/TEP."
        }
      ],
      lacuna: "Classificação Nyhus completa: saiba direta/indireta/femoral e recidiva conceitualmente.",
      sourceType: "sintese",
      source: "Apostila Cir3 (Medcurso) cruzada com stats-cirurgia-geral."
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional · acesso Enare",
      featured: true,
      blurb: "Enare ama conduta objetiva de hérnia e profilaxia.",
      verdict:
        "Priorize direta×indireta (epigástricos), Lichtenstein, classes de ferida + cefazolina e deiscência (água de carne). ASA/E e jejum de líquidos claros (2 h) caem fácil.",
      foco: "Direta×indireta · Lichtenstein · ATB · Deiscência · Jejuno 2 h",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare Cirurgia aplicado ao Cir3.",
      priorities: [
        { tema: "Hérnias", pct: 30 },
        { tema: "ATB / classes", pct: 20 },
        { tema: "ISC / deiscência", pct: 20 },
        { tema: "ASA / jejum", pct: 16 },
        { tema: "Anestesia / TVP", pct: 14 }
      ],
      deckOrder: [
        "cir3-hernia-inguinal",
        "cir3-hernia-outras",
        "cir3-jejum-atb",
        "cir3-isc",
        "cir3-asa",
        "cir3-posop-febre",
        "cir3-risco-cardiaco",
        "cir3-anestesia",
        "cir3-suturas-hemostasia",
        "cir3-posop-anastomose"
      ],
      checklist: ["hesselbach", "lichtenstein", "atb60", "deiscencia", "jejum2h"],
      sessoes: [
        {
          titulo: "Sessão 1 · Virilha",
          texto: "Hesselbach e Lichtenstein."
        },
        {
          titulo: "Sessão 2 · Profilaxia",
          texto: "Classes + cefazolina no horário certo."
        },
        {
          titulo: "Sessão 3 · Ferida",
          texto: "ISC e água de carne."
        }
      ],
      lacuna: "TEP vs TAPP detalhes de portas: saiba conceito extraperitoneal × intraperitoneal."
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "USP gosta de IRCR e especiais de hérnia.",
      verdict:
        "USP cobra preditores do IRCR, Richter/Amyand/Littré, toxicidade de anestésico local e critérios de ISC (30 dias / 1 ano com prótese).",
      foco: "IRCR · Richter · Toxicidade AL · ISC · Femoral",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP-SP Cirurgia aplicado ao Cir3.",
      priorities: [
        { tema: "Risco cardíaco / ASA", pct: 22 },
        { tema: "Hérnias (incl. especiais)", pct: 28 },
        { tema: "Anestesia", pct: 18 },
        { tema: "ISC / deiscência", pct: 18 },
        { tema: "ATB / suturas", pct: 14 }
      ],
      deckOrder: [
        "cir3-risco-cardiaco",
        "cir3-hernia-outras",
        "cir3-hernia-inguinal",
        "cir3-anestesia",
        "cir3-isc",
        "cir3-asa",
        "cir3-jejum-atb",
        "cir3-suturas-hemostasia",
        "cir3-posop-febre",
        "cir3-posop-anastomose"
      ],
      checklist: ["ircr", "richter", "toxicidade", "isc30", "femoral"],
      sessoes: [
        {
          titulo: "Sessão 1 · Cardíaco",
          texto: "Seis preditores do IRCR."
        },
        {
          titulo: "Sessão 2 · Especiais",
          texto: "Richter sem obstrução; Amyand/Garengeot/Littré."
        },
        {
          titulo: "Sessão 3 · AL",
          texto: "Gosto metálico → convulsão."
        }
      ],
      lacuna: "Goldman/Detsky históricos: foque IRCR; saiba que provas antigas ainda citam Goldman."
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "UNIFESP mistura anestesia e parede.",
      verdict:
        "Foque raqui×peridural, Mallampati, Hesselbach e suspensão de AAS/clopidogrel/varfarina. Deiscência e anastomose aparecem como complicação.",
      foco: "Raqui · Mallampati · Hesselbach · Antiagregação · Deiscência",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP Cirurgia aplicado ao Cir3.",
      priorities: [
        { tema: "Anestesia", pct: 24 },
        { tema: "Hérnias", pct: 24 },
        { tema: "Pré-op / drogas", pct: 20 },
        { tema: "Complicações de ferida", pct: 18 },
        { tema: "TVP / anastomose", pct: 14 }
      ],
      deckOrder: [
        "cir3-anestesia",
        "cir3-hernia-inguinal",
        "cir3-suturas-hemostasia",
        "cir3-isc",
        "cir3-asa",
        "cir3-risco-cardiaco",
        "cir3-hernia-outras",
        "cir3-jejum-atb",
        "cir3-posop-anastomose",
        "cir3-posop-febre"
      ],
      checklist: ["raqui", "mallampati", "hesselbach", "aas", "deiscencia"],
      sessoes: [
        {
          titulo: "Sessão 1 · Anestesia",
          texto: "Raqui, peridural e Mallampati."
        },
        {
          titulo: "Sessão 2 · Parede",
          texto: "Hesselbach e Lichtenstein."
        },
        {
          titulo: "Sessão 3 · Drogas",
          texto: "Quando suspender AAS e DOAC."
        }
      ],
      lacuna: "Farmacologia volátil/CAM: saiba nomes e toxicidade de AL, não tabelas inteiras de CAM."
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo padrão nacional do Enamed.",
      verdict:
        "Conduta: cefazolina 30–60 min antes, tela na incisional, operar femoral sintomática (risco de estrangulamento) e reconhecer água de carne.",
      foco: "ATB · Incisional/tela · Femoral · Deiscência · ASA",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare Cirurgia aplicado ao Cir3.",
      priorities: [
        { tema: "Hérnias", pct: 28 },
        { tema: "Pré-op / ATB", pct: 24 },
        { tema: "ISC / deiscência", pct: 22 },
        { tema: "Anestesia", pct: 14 },
        { tema: "Demais Cir3", pct: 12 }
      ],
      deckOrder: [
        "cir3-jejum-atb",
        "cir3-hernia-inguinal",
        "cir3-hernia-outras",
        "cir3-isc",
        "cir3-asa",
        "cir3-posop-febre",
        "cir3-risco-cardiaco",
        "cir3-anestesia",
        "cir3-suturas-hemostasia",
        "cir3-posop-anastomose"
      ],
      checklist: ["atb60", "tela", "femoral", "deiscencia", "asa"],
      sessoes: [
        {
          titulo: "Sessão 1 · Profilaxia",
          texto: "Classes e timing da cefazolina."
        },
        {
          titulo: "Sessão 2 · Hérnias",
          texto: "Inguinal + femoral + incisional."
        },
        {
          titulo: "Sessão 3 · Ferida",
          texto: "ISC e evisceração."
        }
      ],
      lacuna: "Protocolos locais de tromboprofilaxia: saiba risco alto → heparina + mecânica."
    }
  ],
  checklistLabels: {
    hesselbach: "Hesselbach: inguinal · reto · epigástricos",
    atb60: "ATB 30–60 min antes da incisão",
    asa: "ASA + E de emergência",
    isc: "ISC: 30 dias / 1 ano com prótese",
    lichtenstein: "Lichtenstein = tela tension-free",
    deiscencia: "Água de carne = deiscência",
    jejum2h: "Líquidos claros: 2 h",
    ircr: "6 preditores do IRCR",
    richter: "Richter: estrangula sem obstruir",
    toxicidade: "Toxicidade de AL: metálico → convulsão",
    isc30: "Janela 30 dias / 1 ano",
    femoral: "Femoral: ↑ estrangulamento",
    raqui: "Raqui = subaracnoide",
    mallampati: "Mallampati prediz via aérea difícil",
    aas: "AAS 7–10 d / clopi 5–6 d",
    tela: "Incisional: tela quase sempre"
  },
  deckTips: {
    "cir3-hernia-inguinal": {
      pegar: "Medial aos epigástricos = direta · Lichtenstein · TEP/TAPP em bilateral/recidiva",
      evitar: "Achar que a hérnia mais comum na mulher é a femoral"
    },
    "cir3-jejum-atb": {
      pegar: "Claros 2 h · Cefazolina 30–60 min · Não prolongar à toa",
      evitar: "Jejum de 12 h para líquidos claros"
    },
    "cir3-isc": {
      pegar: "Água de carne · 7–10º dia · ISC até 1 ano com tela",
      evitar: "Tratar evisceração só com curativo ambulatorial"
    },
    "cir3-risco-cardiaco": {
      pegar: "Vascular/aberto + DAC/ICC/AVC/DM insulina/Cr>2",
      evitar: "Memorizar só Goldman e esquecer IRCR"
    },
    "cir3-anestesia": {
      pegar: "Raqui subaracnoide · AL: metálico/tinido · Mallampati",
      evitar: "Confundir raqui com peridural"
    }
  },
  oneLiners: [
    "Direta = medial aos epigástricos (Hesselbach)",
    "Cefazolina 30–60 min antes da incisão",
    "Líquidos claros: jejum de 2 h",
    "Água de carne = deiscência aponeurótica",
    "Femoral: maior risco de estrangulamento",
    "Richter estrangula sem obstruir"
  ]
};

data.profiles.forEach((p) => {
  const miss = p.deckOrder.filter((id) => !ids.includes(id));
  if (miss.length) throw new Error(p.id + " missing " + miss.join(","));
});

const out = path.join(__dirname, "..", "data", "revisao-cir3.json");
fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("wrote", out, "decks", ids.length);
