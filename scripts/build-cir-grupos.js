/**
 * Grandes grupos de Cirurgia ordenados pela cobrança nas provas R1
 * (Enare/Enamed + média Brasil Estratégia MED).
 */
const fs = require("fs");
const path = require("path");

function profileBase(overrides) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Grupos por cobrança · stats Cirurgia R1 (Enare/USP/UNIFESP).",
    ...overrides
  };
}

function writeModule(file, title, module, profiles, extra = {}) {
  const data = { title, module, profiles, ...extra };
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", file, "·", profiles[0].deckOrder.length, "decks");
}

function bankProfiles(deckOrder, banks) {
  return banks.map((b) =>
    profileBase({
      ...b,
      deckOrder: b.deckOrder || deckOrder
    })
  );
}

/* ── 1. Abdome agudo (~12% Brasil · ~24% Enare) ── */
const abdomeDecks = [
  "cg-apendicite",
  "cg-colecistite",
  "cg-diverticulite",
  "cg-obstrucao",
  "cg-abdome-vascular",
  "crr-hernia-obstrucao"
];

writeModule(
  "revisao-cir-abdome-agudo.json",
  "Abdome agudo · urgências (~12–24%)",
  "cir-abdome-agudo",
  bankProfiles(abdomeDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "#2 Brasil · ~12%",
      blurb: "Urgências abdominais do adulto — grupo próprio.",
      verdict:
        "Apendicite, colecistite/colangite (TG18), diverticulite, obstrução (ASBO), abdome vascular e hérnia estrangulada. Não misture com urologia nem AD eletivo.",
      foco: "Apendicite · TG18 · Diverticulite · Obstrução · Vascular",
      estilo: "Síntese · abdome agudo",
      priorities: [
        { tema: "Apendicite", pct: 28 },
        { tema: "Colecistite / colangite", pct: 22 },
        { tema: "Obstrução / hérnia", pct: 18 },
        { tema: "Diverticulite", pct: 16 },
        { tema: "Abdome vascular", pct: 16 }
      ],
      checklist: ["apendicite", "tg18", "diverticulite", "asbo", "estrangulada"],
      sessoes: [
        { titulo: "Sessão 1 · Inflamatório", texto: "Apendicite, colecistite e diverticulite." },
        { titulo: "Sessão 2 · Obstrutivo", texto: "ASBO, volvo e hérnia estrangulada." },
        { titulo: "Sessão 3 · Vascular", texto: "Isquemia mesentérica e AAA roto." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "#1 Enare · ~24%",
      blurb: "Quase 1 em 4 questões de Cirurgia no Enare.",
      verdict: "Domine conduta: laparoscopia/NOM, TG18, diverticulite sem ATB de rotina, quando operar obstrução.",
      foco: "Apendicite · TG18 · Diverticulite · Obstrução",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare Cirurgia 2021–2024 · urgências abdominais.",
      priorities: [
        { tema: "Apendicite", pct: 32 },
        { tema: "Colecistite / vias", pct: 24 },
        { tema: "Diverticulite", pct: 18 },
        { tema: "Obstrução / hérnia", pct: 16 },
        { tema: "Vascular", pct: 10 }
      ],
      checklist: ["apendicite", "tg18", "diverticulite", "asbo", "estrangulada"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "~11% USP",
      blurb: "USP detalha algoritmo e imagem.",
      verdict: "NOM, TC na obstrução e diferencial isquemia × AAA.",
      foco: "NOM · TC · Isquemia · TG18",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP-SP · abdome agudo.",
      priorities: [
        { tema: "Obstrução / ASBO", pct: 24 },
        { tema: "Apendicite / NOM", pct: 22 },
        { tema: "Vias / TG18", pct: 20 },
        { tema: "Diverticulite", pct: 16 },
        { tema: "Vascular / hérnia", pct: 18 }
      ],
      deckOrder: [
        "cg-obstrucao",
        "cg-apendicite",
        "cg-colecistite",
        "cg-abdome-vascular",
        "cg-diverticulite",
        "crr-hernia-obstrucao"
      ],
      checklist: ["asbo", "apendicite", "tg18", "isquemia", "estrangulada"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "~8% Unifesp",
      blurb: "Menos dominante que vascular, mas cai.",
      verdict: "Foque isquemia mesentérica e TG18.",
      foco: "Isquemia · TG18 · Apendicite",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · abdome agudo.",
      priorities: [
        { tema: "Abdome vascular", pct: 26 },
        { tema: "Colecistite / TG18", pct: 22 },
        { tema: "Apendicite", pct: 20 },
        { tema: "Obstrução", pct: 18 },
        { tema: "Diverticulite / hérnia", pct: 14 }
      ],
      deckOrder: [
        "cg-abdome-vascular",
        "cg-colecistite",
        "cg-apendicite",
        "cg-obstrucao",
        "crr-hernia-obstrucao",
        "cg-diverticulite"
      ],
      checklist: ["isquemia", "tg18", "apendicite", "asbo", "estrangulada"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso · ~24%",
      blurb: "Mesmo padrão Enamed.",
      verdict: "Conduta objetiva: timing de cirurgia e sinais de alarme.",
      foco: "Conduta · Timing · Alarme",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · abdome agudo.",
      priorities: [
        { tema: "Apendicite", pct: 30 },
        { tema: "Colecistite", pct: 24 },
        { tema: "Obstrução / hérnia", pct: 18 },
        { tema: "Diverticulite", pct: 16 },
        { tema: "Vascular", pct: 12 }
      ],
      checklist: ["apendicite", "tg18", "diverticulite", "asbo", "estrangulada"]
    }
  ]),
  {
    checklistLabels: {
      apendicite: "Apendicite WSES 2025",
      tg18: "Colecistite/colangite TG18",
      diverticulite: "Diverticulite — ATB seletiva",
      asbo: "Obstrução por brida ASBO",
      estrangulada: "Hérnia estrangulada = urgência",
      isquemia: "Isquemia mesentérica / AAA"
    },
    oneLiners: [
      "Enare: ~24% de Cirurgia = abdome agudo",
      "Grupo separado de urologia e AD eletivo"
    ]
  }
);

/* ── 2. Trauma (~14% Brasil · #1 USP) ── */
const traumaDecks = [
  "cir2-atls",
  "cir2-pneumotorax",
  "cir2-hemotorax",
  "cir2-torax-parede",
  "cir2-coracao-aorta",
  "cir2-abdome-inicial",
  "cir2-figado-baco",
  "cir2-gu-pelve",
  "cir2-damage-control",
  "cir2-tce",
  "cir2-pescoco",
  "cir2-visceras",
  "crr-trm-face",
  "ciresp-resposta-trauma",
  "ciresp-choque-tipos"
];

writeModule(
  "revisao-cir-trauma.json",
  "Trauma · ATLS (~14%)",
  "cir-trauma",
  bankProfiles(traumaDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "#1 Brasil · ~14%",
      blurb: "Trauma e ATLS — o bloco que mais cai na média nacional.",
      verdict:
        "ABCDE/choque, PNTX hipertensivo, hemotórax, FAST, TCE, pelve/GU, damage control e TRM. Fisiologia do choque e resposta ao trauma fecham o grupo.",
      foco: "ATLS · Tórax · FAST · TCE · Damage control",
      estilo: "Síntese · Trauma",
      priorities: [
        { tema: "ATLS / choque", pct: 20 },
        { tema: "Trauma de tórax", pct: 18 },
        { tema: "Trauma abdominal / FAST", pct: 16 },
        { tema: "TCE / TRM", pct: 16 },
        { tema: "Pelve / damage control", pct: 16 },
        { tema: "Pescoço / vísceras", pct: 14 }
      ],
      checklist: ["abcde", "pntx", "fast", "glasgow", "damage"],
      sessoes: [
        { titulo: "Sessão 1 · Primário + tórax", texto: "ABCDE, PNTX e hemotórax." },
        { titulo: "Sessão 2 · Abdome + TCE", texto: "FAST, baço/fígado e Glasgow." },
        { titulo: "Sessão 3 · Especial", texto: "Pelve, TRM e damage control." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "~6% Enare",
      blurb: "Menos que abdome no Enare, mas clássicos caem.",
      verdict: "PNTX hipertensivo, FAST no instável e classes de choque.",
      foco: "PNTX · FAST · Choque · TCE",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare · Trauma.",
      priorities: [
        { tema: "Tórax / PNTX", pct: 28 },
        { tema: "ATLS / choque", pct: 26 },
        { tema: "Abdome / FAST", pct: 22 },
        { tema: "TCE / TRM", pct: 24 }
      ],
      checklist: ["abcde", "pntx", "fast", "glasgow", "trm"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "#1 USP · ~18%",
      blurb: "USP é trauma-pesada com muita imagem.",
      verdict: "TC, FAST, epidural vs subdural, tamponamento e damage control.",
      foco: "TC · FAST · TCE · Tamponamento · DC",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP-SP · Trauma.",
      priorities: [
        { tema: "Trauma / imagem", pct: 30 },
        { tema: "Tórax", pct: 22 },
        { tema: "Abdome / FAST", pct: 20 },
        { tema: "TCE / DC", pct: 28 }
      ],
      checklist: ["fast", "glasgow", "beckponamento", "damage", "abcde"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "~14% Unifesp",
      blurb: "Segundo lugar na Unifesp (atrás de vascular).",
      verdict: "ATLS sólido + tórax + abdome.",
      foco: "ATLS · Tórax · Abdome · TCE",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Trauma.",
      priorities: [
        { tema: "ATLS / choque", pct: 26 },
        { tema: "Tórax", pct: 24 },
        { tema: "Abdome", pct: 24 },
        { tema: "TCE / TRM", pct: 26 }
      ],
      checklist: ["abcde", "pntx", "fast", "glasgow", "trm"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso · ~6%",
      blurb: "Conduta de trauma.",
      verdict: "Descomprimir PNTX, FAST no instável, ABCDE sem pular.",
      foco: "PNTX · FAST · ABCDE",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · Trauma.",
      priorities: [
        { tema: "Tórax / ATLS", pct: 40 },
        { tema: "Abdome / TCE", pct: 35 },
        { tema: "Demais", pct: 25 }
      ],
      checklist: ["abcde", "pntx", "fast", "glasgow", "damage"]
    }
  ]),
  {
    checklistLabels: {
      abcde: "ABCDE sem pular etapas",
      pntx: "PNTX hipertensivo → descomprimir",
      fast: "Instável + FAST+ → centro",
      glasgow: "TCE: Glasgow + pupilas",
      damage: "Damage control se coagulopatia",
      trm: "Imobilizar · evitar hipotensão",
      tamponamento: "Beck → janela / esternotomia"
    }
  }
);

/* ── 3. Perioperatório (~20–25% somado) ── */
const periDecks = [
  "cir3-asa",
  "cir3-risco-cardiaco",
  "cir3-jejum-atb",
  "cir3-hernia-inguinal",
  "cir3-hernia-outras",
  "cir3-posop-febre",
  "cir3-isc",
  "cir3-anestesia",
  "cir3-suturas-hemostasia",
  "cir3-posop-anastomose",
  "crr-anestesia-avancada",
  "crr-infeccao-cirurgica"
];

writeModule(
  "revisao-cir-perioperatorio.json",
  "Pré/pós-op · Anestesia · Hérnias (~20%)",
  "cir-perioperatorio",
  bankProfiles(periDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Pré ~7% · Anestesia ~9% · Hérnias ~4%",
      blurb: "Bases do cirurgião — alto volume somado.",
      verdict:
        "ASA/IRCR, antibioticoprofilaxia, hérnia inguinal, ISC/deiscência, febre pós-op e anestesia (raqui, via aérea, MH).",
      foco: "ASA · Hérnia · ATB · ISC · Anestesia",
      estilo: "Síntese · perioperatório",
      priorities: [
        { tema: "Anestesia", pct: 22 },
        { tema: "Pré-operatório", pct: 20 },
        { tema: "Hérnias", pct: 20 },
        { tema: "Pós-op / ISC", pct: 22 },
        { tema: "Infecção / suturas", pct: 16 }
      ],
      checklist: ["asa", "hesselbach", "atb60", "isc", "mh"],
      sessoes: [
        { titulo: "Sessão 1 · Pré-op + hérnias", texto: "ASA, IRCR e Hesselbach." },
        { titulo: "Sessão 2 · Pós-op", texto: "Febre, ISC e deiscência." },
        { titulo: "Sessão 3 · Anestesia", texto: "Raqui, via aérea e MH." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Pré 10% + Anestesia 10% + Hérnias 6%",
      blurb: "Segundo maior bloco no Enare (depois do abdome).",
      verdict: "Pré-op, anestesia e hérnias somam ~26% no Enare — revise junto.",
      foco: "Pré-op · Anestesia · Hérnia inguinal",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare · perioperatório.",
      priorities: [
        { tema: "Pré-operatório", pct: 28 },
        { tema: "Anestesia", pct: 28 },
        { tema: "Hérnias", pct: 20 },
        { tema: "Pós-op / ISC", pct: 24 }
      ],
      checklist: ["asa", "atb60", "hesselbach", "isc", "mh"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "Pós-op ~9% USP",
      blurb: "USP cobra complicações pós-op.",
      verdict: "ISC, deiscência, TVP/TEP e hérnias com anatomia.",
      foco: "ISC · Deiscência · Hérnia · Anestesia",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP-SP · perioperatório.",
      priorities: [
        { tema: "Pós-op / ISC", pct: 30 },
        { tema: "Hérnias", pct: 24 },
        { tema: "Anestesia", pct: 22 },
        { tema: "Pré-op", pct: 24 }
      ],
      deckOrder: [
        "cir3-isc",
        "cir3-posop-febre",
        "cir3-posop-anastomose",
        "cir3-hernia-inguinal",
        "cir3-hernia-outras",
        "cir3-anestesia",
        "crr-anestesia-avancada",
        "cir3-asa",
        "cir3-risco-cardiaco",
        "cir3-jejum-atb",
        "crr-infeccao-cirurgica",
        "cir3-suturas-hemostasia"
      ],
      checklist: ["isc", "hesselbach", "asa", "mh", "atb60"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Anestesia ~13%",
      blurb: "Unifesp pesa anestesia e pré-op.",
      verdict: "Anestesia + ASA/IRCR + hérnias.",
      foco: "Anestesia · Pré-op · Hérnias",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · perioperatório.",
      priorities: [
        { tema: "Anestesia", pct: 32 },
        { tema: "Pré-op", pct: 28 },
        { tema: "Hérnias / pós-op", pct: 40 }
      ],
      checklist: ["mh", "asa", "hesselbach", "atb60", "isc"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso · ~26% somado",
      blurb: "Segundo bloco do Enare.",
      verdict: "ASA, cefazolina no tempo certo, Lichtenstein e toxicidade de AL.",
      foco: "ASA · ATB · Hérnia · Anestesia",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · perioperatório.",
      priorities: [
        { tema: "Pré + anestesia", pct: 50 },
        { tema: "Hérnias + pós-op", pct: 50 }
      ],
      checklist: ["asa", "atb60", "hesselbach", "isc", "mh"]
    }
  ]),
  {
    checklistLabels: {
      asa: "ASA + IRCR",
      hesselbach: "Triângulo de Hesselbach",
      atb60: "Cefazolina 30–60 min",
      isc: "ISC / deiscência",
      mh: "Hipertermia maligna → dantrolene"
    }
  }
);

/* ── 4. Cirurgia infantil (~9%) ── */
const infantilDecks = [
  "cir1-ped-abdome",
  "cir1-ped-digestivo",
  "cir1-ped-parede-biliar"
];

writeModule(
  "revisao-cir-infantil.json",
  "Cirurgia infantil (~9%)",
  "cir-infantil",
  bankProfiles(infantilDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "~9% Brasil",
      blurb: "Grupo próprio — alto nas três bancas.",
      verdict:
        "Invaginação, Meckel, atresia esofágica, piloro, Hirschsprung, Ladd, onfalocele/gastroschisis, atresia de vias e HDC.",
      foco: "Invaginação · AE · Piloro · Hirschsprung · Ladd",
      estilo: "Síntese · infantil",
      priorities: [
        { tema: "Abdome agudo ped", pct: 34 },
        { tema: "Digestivo / malformação", pct: 36 },
        { tema: "Parede / vias / HDC", pct: 30 }
      ],
      checklist: ["invaginacao", "piloro", "hirschsprung", "ladd", "ae"],
      sessoes: [
        { titulo: "Sessão 1 · Urgências", texto: "Invaginação e Meckel." },
        { titulo: "Sessão 2 · Digestivo", texto: "AE, piloro, Hirschsprung e Ladd." },
        { titulo: "Sessão 3 · Parede / vias", texto: "Gastrosquise, atresia biliar e HDC." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "~8% Enare",
      blurb: "Clássicos de conduta pediátrica.",
      verdict: "Invaginação (enema), piloro, AE com VACTERL e volvo/Ladd.",
      foco: "Invaginação · Piloro · AE · Ladd",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare · infantil.",
      priorities: [
        { tema: "Urgências ped", pct: 40 },
        { tema: "Malformações", pct: 35 },
        { tema: "Parede / vias", pct: 25 }
      ],
      checklist: ["invaginacao", "piloro", "ae", "ladd", "hirschsprung"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "~7% USP",
      blurb: "USP gosta de imagem e diagnóstico.",
      verdict: "Sinal do alvo, double bubble e biópsia em Hirschsprung.",
      foco: "Imagem · Hirschsprung · Vias",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP-SP · infantil.",
      priorities: [
        { tema: "Diagnóstico / imagem", pct: 40 },
        { tema: "Urgências", pct: 30 },
        { tema: "Parede / HDC", pct: 30 }
      ],
      checklist: ["invaginacao", "hirschsprung", "ae", "hdc", "ladd"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "~13% Unifesp",
      blurb: "Terceiro tema na Unifesp.",
      verdict: "Bloco forte — revise os três decks.",
      foco: "Digestivo · Urgências · Parede",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · infantil.",
      priorities: [
        { tema: "Digestivo", pct: 40 },
        { tema: "Urgências", pct: 35 },
        { tema: "Parede / vias", pct: 25 }
      ],
      checklist: ["piloro", "invaginacao", "ae", "ladd", "hirschsprung"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso · ~8%",
      blurb: "Conduta infantil.",
      verdict: "Enema na invaginação estável; piloromiotomia; Ladd no volvo.",
      foco: "Enema · Piloro · Ladd",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · infantil.",
      priorities: [
        { tema: "Urgências", pct: 45 },
        { tema: "Malformações", pct: 55 }
      ],
      checklist: ["invaginacao", "piloro", "ladd", "ae", "hirschsprung"]
    }
  ]),
  {
    checklistLabels: {
      invaginacao: "Invaginação → enema se estável",
      piloro: "Estenose hipertrófica → piloromiotomia",
      hirschsprung: "Biópsia / transição",
      ladd: "Volvo neonatal → Ladd",
      ae: "Atresia esofágica ± VACTERL",
      hdc: "Hérnia diafragmática congênita"
    }
  }
);

/* ── 5. Vascular (~8% Brasil · #1 Unifesp) ── */
const vascularDecks = [
  "cir1-aaa",
  "cir1-aneurismas-perifericos",
  "cir1-dap",
  "cir1-oclusao-arterial",
  "cir1-ivc"
];

writeModule(
  "revisao-cir-vascular.json",
  "Cirurgia vascular (~8–16%)",
  "cir-vascular",
  bankProfiles(vascularDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "~8% Brasil",
      blurb: "Grupo próprio — #1 na Unifesp (~16%).",
      verdict: "AAA (indicação/roto), DAP (Rutherford), oclusão arterial aguda (6 P), aneurisma poplíteo e IVC/varizes.",
      foco: "AAA · DAP · Oclusão aguda · Poplítea · IVC",
      estilo: "Síntese · vascular",
      priorities: [
        { tema: "AAA", pct: 28 },
        { tema: "Oclusão arterial aguda", pct: 24 },
        { tema: "DAP", pct: 22 },
        { tema: "Poplítea / IVC", pct: 26 }
      ],
      checklist: ["aaa55", "6p", "rutherford", "poplitea", "ivc"],
      sessoes: [
        { titulo: "Sessão 1 · Aorta", texto: "AAA eletivo vs roto." },
        { titulo: "Sessão 2 · Arterial", texto: "DAP e oclusão aguda." },
        { titulo: "Sessão 3 · Venoso", texto: "IVC e varizes." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Cauda Enare",
      blurb: "Cai menos no Enare, mas clássicos importam.",
      verdict: "AAA roto, 6 P e indicação de cirurgia no AAA.",
      foco: "AAA · 6 P · DAP",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare · vascular.",
      priorities: [
        { tema: "AAA / oclusão", pct: 50 },
        { tema: "DAP / IVC", pct: 50 }
      ],
      checklist: ["aaa55", "6p", "rutherford", "poplitea", "ivc"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "~5% USP",
      blurb: "USP cobra indicação e imagem.",
      verdict: "Diâmetro do AAA, Rutherford e embolectomia.",
      foco: "AAA · Rutherford · Embolectomia",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP-SP · vascular.",
      priorities: [
        { tema: "AAA", pct: 30 },
        { tema: "DAP / oclusão", pct: 40 },
        { tema: "Venoso", pct: 30 }
      ],
      checklist: ["aaa55", "6p", "rutherford", "poplitea", "ivc"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "#1 Unifesp · ~16%",
      blurb: "Banca mais vascular-pesada.",
      verdict: "Priorize os 5 decks — ROI máximo na Unifesp.",
      foco: "AAA · DAP · Oclusão · Poplítea · IVC",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · vascular.",
      priorities: [
        { tema: "AAA", pct: 30 },
        { tema: "DAP / oclusão", pct: 40 },
        { tema: "Poplítea / IVC", pct: 30 }
      ],
      checklist: ["aaa55", "6p", "rutherford", "poplitea", "ivc"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      blurb: "Conduta vascular.",
      verdict: "AAA ≥5,5 cm; 6 P → embolectomia; claudicação vs ameaça.",
      foco: "AAA · 6 P · Claudicação",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · vascular.",
      priorities: [
        { tema: "Arterial", pct: 70 },
        { tema: "Venoso", pct: 30 }
      ],
      checklist: ["aaa55", "6p", "rutherford", "poplitea", "ivc"]
    }
  ]),
  {
    checklistLabels: {
      aaa55: "AAA ≥5,5 cm ou sintomático",
      "6p": "Oclusão aguda = 6 P",
      rutherford: "DAP · classificação",
      poplitea: "Poplítea → tratar cedo",
      ivc: "IVC / varizes · indicação"
    }
  }
);

/* ── 6. Aparelho digestivo eletivo ── */
const adDecks = [
  "cg-vesicula",
  "crr-esofago",
  "cg-estomago",
  "crr-estomago-onco",
  "cg-colon",
  "crr-colorretal",
  "cg-pancreas",
  "crr-pancreas",
  "cg-figado",
  "crr-figado-portal",
  "cir1-hemorroidas",
  "cir1-abscesso-fistula",
  "cir1-prolapso",
  "crr-procto-avancado",
  "cir1-bariatrica"
];

writeModule(
  "revisao-cir-ad.json",
  "Aparelho digestivo · eletivo / onco / procto",
  "cir-ad",
  bankProfiles(adDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Vesícula ~4% + AD / procto",
      blurb: "Eletivo e oncológico — separado do abdome agudo.",
      verdict:
        "Vesícula eletiva, esôfago→reto onco, pâncreas, portal/HCC, procto e bariátrica. Urgências inflamatórias ficam no grupo Abdome agudo.",
      foco: "Colorretal · Portal · Pâncreas · Estômago · Procto",
      estilo: "Síntese · AD",
      priorities: [
        { tema: "Colorretal / procto", pct: 24 },
        { tema: "Estômago / esôfago", pct: 18 },
        { tema: "Pâncreas", pct: 16 },
        { tema: "Fígado / portal / vias", pct: 22 },
        { tema: "Bariátrica", pct: 10 },
        { tema: "Vesícula eletiva", pct: 10 }
      ],
      checklist: ["tme", "whipple", "milao", "stepup", "nigro"],
      sessoes: [
        { titulo: "Sessão 1 · Onco digestivo", texto: "Colorretal, estômago e esôfago." },
        { titulo: "Sessão 2 · Hepatopancreatobiliar", texto: "Whipple, portal e vesícula." },
        { titulo: "Sessão 3 · Procto / bariátrica", texto: "Hemorroidas, Nigro e bypass." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional",
      blurb: "Úlcera, pancreatite, CA básico e bariátrica.",
      verdict: "Perfuração, step-up, TME/Nigro e critérios bariátricos.",
      foco: "Úlcera · Pancreatite · Colorretal · Bariátrica",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare · AD.",
      priorities: [
        { tema: "Estômago / úlcera", pct: 22 },
        { tema: "Pâncreas", pct: 18 },
        { tema: "Colorretal / procto", pct: 24 },
        { tema: "Bariátrica / vias", pct: 18 },
        { tema: "Portal / esôfago", pct: 18 }
      ],
      checklist: ["perfurada", "stepup", "tme", "nigro", "bariatrica"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "Vesícula ~6% USP",
      blurb: "USP ama hepatobiliar e hereditário.",
      verdict: "Child/Milão, Whipple, FAP/Lynch e acalasia.",
      foco: "Milão · Whipple · Lynch · Acalasia",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP · AD.",
      priorities: [
        { tema: "Fígado / portal / vias", pct: 30 },
        { tema: "Pâncreas", pct: 20 },
        { tema: "Colorretal", pct: 20 },
        { tema: "Esôfago / estômago", pct: 18 },
        { tema: "Procto / bariátrica", pct: 12 }
      ],
      checklist: ["milao", "whipple", "lynch", "acalasia", "tme"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Suporte",
      blurb: "AD de suporte a vascular/trauma.",
      verdict: "Portal, vias e CA gástrico/colorretal básico.",
      foco: "Portal · Colorretal · Estômago",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · AD.",
      priorities: [
        { tema: "Portal / vias", pct: 28 },
        { tema: "Colorretal / procto", pct: 28 },
        { tema: "Estômago / pâncreas", pct: 28 },
        { tema: "Bariátrica", pct: 16 }
      ],
      checklist: ["milao", "tme", "whipple", "nigro", "bariatrica"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      blurb: "Conduta de AD eletivo.",
      verdict: "Perfuração, step-up, Nigro vs TME e bariátrica.",
      foco: "Perfuração · Step-up · Nigro · Bypass",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · AD.",
      priorities: [
        { tema: "Urgências AD eletivas", pct: 30 },
        { tema: "Onco / procto", pct: 40 },
        { tema: "Bariátrica / portal", pct: 30 }
      ],
      checklist: ["perfurada", "stepup", "nigro", "tme", "bariatrica"]
    }
  ]),
  {
    checklistLabels: {
      tme: "Reto: neo + TME",
      whipple: "Cabeça de pâncreas ressecável",
      milao: "HCC → critérios de Milão",
      stepup: "Necrose: step-up",
      nigro: "CA anal = QT+RT (Nigro)",
      perfurada: "Úlcera perfurada → cirurgia",
      lynch: "Lynch ≠ FAP",
      acalasia: "Heller + fundoplicatura",
      bariatrica: "Critérios / bypass vs sleeve"
    }
  }
);

/* ── 7. Especialidades R1 (cauda ~15–20% somada) ── */
const espDecks = [
  "cg-urologia",
  "crr-urologia",
  "cg-torax",
  "crr-torax-eletivo",
  "ciresp-queimaduras-geral",
  "ciresp-parkland",
  "ciresp-cicatrizacao",
  "ciresp-sepse",
  "ciresp-nutricao",
  "ciresp-plastica",
  "crr-plastica-avancada",
  "crr-partes-moles",
  "cir1-cabeca-pescoco",
  "crr-mama-tireoide",
  "crr-transplante-miscelanea"
];

writeModule(
  "revisao-cir-especialidades.json",
  "Especialidades R1 · uro · tórax · plástica",
  "cir-especialidades",
  bankProfiles(espDecks, [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Uro ~4% · Plástica ~6% · Tórax ~3%",
      blurb: "Cauda de prova — temas que somam pontos.",
      verdict:
        "Urologia, tórax eletivo, queimaduras/Parkland, cicatrização, nutrição, plástica, fascite/melanoma, cabeça/pescoço, mama/tireoide e Tx.",
      foco: "Uro · Tórax · Queimaduras · Plástica · Mama/tireoide",
      estilo: "Síntese · especialidades",
      priorities: [
        { tema: "Urologia", pct: 18 },
        { tema: "Plástica / partes moles", pct: 20 },
        { tema: "Queimaduras / cicatrização", pct: 16 },
        { tema: "Tórax eletivo", pct: 14 },
        { tema: "Mama / tireoide / pescoço", pct: 18 },
        { tema: "Nutrição / sepse / Tx", pct: 14 }
      ],
      checklist: ["torcao", "parkland", "pntx-esp", "fascite", "sentinela"],
      sessoes: [
        { titulo: "Sessão 1 · Uro + tórax", texto: "Torção, litíase, pneumotórax e empiema." },
        { titulo: "Sessão 2 · Pele / queimadura", texto: "Parkland, fascite e enxertos." },
        { titulo: "Sessão 3 · Pescoço / mama", texto: "Tireoide, mama e salivares." }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Cauda Enare",
      blurb: "Torção, Parkland e fascite como conduta.",
      verdict: "Explorar torção; Parkland; desbridar fascite; operar pneumotórax com critério.",
      foco: "Torção · Parkland · Fascite · Pneumotórax",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Enare · especialidades.",
      priorities: [
        { tema: "Uro / tórax", pct: 30 },
        { tema: "Queimaduras / plástica", pct: 35 },
        { tema: "Mama / tireoide / misc", pct: 35 }
      ],
      checklist: ["torcao", "parkland", "fascite", "pntx-esp", "recorrente"]
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "Plástica ~6%",
      blurb: "USP cobra plástica e onco uro.",
      verdict: "Enxerto vs retalho, Breslow, tumor testicular e mediastino.",
      foco: "Plástica · Melanoma · Uro onco · Mediastino",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "USP · especialidades.",
      priorities: [
        { tema: "Plástica / melanoma", pct: 28 },
        { tema: "Urologia", pct: 22 },
        { tema: "Tórax / mediastino", pct: 20 },
        { tema: "Demais", pct: 30 }
      ],
      checklist: ["enxerto", "melanoma", "testiculo", "mediastino", "parkland"]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Queimaduras ~5%",
      blurb: "Unifesp gosta de queimadura e tireoide.",
      verdict: "Parkland, elétrica, nervo recorrente e fasciotomia.",
      foco: "Parkland · Tireoide · Fascite · Uro",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · especialidades.",
      priorities: [
        { tema: "Queimaduras", pct: 24 },
        { tema: "Uro / tórax", pct: 28 },
        { tema: "Tireoide / plástica", pct: 28 },
        { tema: "Demais", pct: 20 }
      ],
      checklist: ["parkland", "recorrente", "torcao", "fascite", "pntx-esp"]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      blurb: "Condutas da cauda.",
      verdict: "Torção, Parkland, fascite e indicação de VATS no pneumotórax.",
      foco: "Torção · Parkland · Fascite · VATS",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Enare · especialidades.",
      priorities: [
        { tema: "Urgências especialidades", pct: 40 },
        { tema: "Plástica / queimadura", pct: 30 },
        { tema: "Onco / misc", pct: 30 }
      ],
      checklist: ["torcao", "parkland", "fascite", "pntx-esp", "sentinela"]
    }
  ]),
  {
    checklistLabels: {
      torcao: "Torção = exploração",
      parkland: "Parkland 4 mL × peso × %",
      "pntx-esp": "Quando operar pneumotórax espontâneo",
      fascite: "Dor desproporcional → centro",
      sentinela: "Axila clínica negativa",
      recorrente: "Nervo laríngeo na tireoidectomia",
      enxerto: "Enxerto sem vaso próprio",
      melanoma: "Breslow define margem",
      testiculo: "Orquiectomia inguinal",
      mediastino: "Anterior = 4 T"
    }
  }
);

console.log("done · 7 grandes grupos por cobrança");
