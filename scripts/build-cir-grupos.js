const fs = require("fs");
const path = require("path");

function profileBase(overrides) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Reorganização por grupos de prova · MedHub Cirurgia R1.",
    ...overrides
  };
}

function writeModule(file, title, module, profiles, extra = {}) {
  const data = { title, module, profiles, ...extra };
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", file, "profiles", profiles.length);
}

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
  "Abdome agudo · urgências abdominais",
  "cir-abdome-agudo",
  [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Grupo #1 Enare / #2 Brasil",
      blurb: "Urgências abdominais do adulto — o bloco que mais cai.",
      verdict:
        "Priorize apendicite (WSES 2025), colecistite/colangite (TG18), diverticulite, obstrução (ASBO) e abdome vascular. Hérnia estrangulada e volvo fecham o grupo.",
      foco: "Apendicite · Colecistite · Diverticulite · Obstrução · Vascular",
      estilo: "Síntese nacional · abdome agudo",
      priorities: [
        { tema: "Apendicite", pct: 28, n: 28 },
        { tema: "Colecistite / colangite", pct: 22, n: 22 },
        { tema: "Diverticulite", pct: 16, n: 16 },
        { tema: "Obstrução / hérnia complicada", pct: 18, n: 18 },
        { tema: "Abdome vascular", pct: 16, n: 16 }
      ],
      deckOrder: abdomeDecks,
      checklist: ["apendicite", "tg18", "diverticulite", "asbo", "estrangulada"],
      sessoes: [
        { titulo: "Sessão 1 · Inflamatório", texto: "Apendicite, colecistite e diverticulite." },
        { titulo: "Sessão 2 · Obstrutivo", texto: "ASBO, volvo e hérnia estrangulada." },
        { titulo: "Sessão 3 · Vascular", texto: "Isquemia mesentérica e AAA roto." }
      ],
      lacuna: "Não misture este bloco com urologia ou AD eletivo — são grupos separados.",
      source: "WSES 2025 · TG18 · WSES Diverticulitis · ASBO Bologna · stats Cirurgia."
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional · ~24% da Cirurgia",
      featured: true,
      blurb: "Enare é abdome agudo.",
      verdict:
        "Quase 1 em cada 4 questões de Cirurgia no Enare. Domine conduta: laparoscopia/NOM na apendicite, TG18, diverticulite sem ATB de rotina na não complicada, e quando operar obstrução.",
      foco: "Apendicite · TG18 · Diverticulite · Obstrução",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare Cirurgia · grupo Abdome agudo.",
      priorities: [
        { tema: "Apendicite", pct: 32 },
        { tema: "Colecistite / vias", pct: 24 },
        { tema: "Diverticulite", pct: 18 },
        { tema: "Obstrução / hérnia", pct: 16 },
        { tema: "Vascular", pct: 10 }
      ],
      deckOrder: [
        "cg-apendicite",
        "cg-colecistite",
        "cg-diverticulite",
        "cg-obstrucao",
        "crr-hernia-obstrucao",
        "cg-abdome-vascular"
      ],
      checklist: ["apendicite", "tg18", "diverticulite", "asbo", "estrangulada"],
      sessoes: [
        { titulo: "Sessão 1 · Top 2", texto: "Apendicite e colecistite." },
        { titulo: "Sessão 2 · Diverticulite", texto: "Não complicada sem ATB de rotina." },
        { titulo: "Sessão 3 · Obstrução", texto: "Expectante vs centro." }
      ]
    }),
    profileBase({
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "USP detalha algoritmo e imagem.",
      verdict: "Foque critérios de NOM, TC na obstrução e diferencial isquemia mesentérica × AAA.",
      foco: "NOM · TC · Isquemia · TG18",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP-SP · Abdome agudo.",
      priorities: [
        { tema: "Obstrução / ASBO", pct: 24 },
        { tema: "Apendicite / NOM", pct: 22 },
        { tema: "Vias biliares / TG18", pct: 20 },
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
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Menos dominante que vascular, mas cai.",
      verdict: "UNIFESP prioriza vascular sistêmico, mas abdome agudo ainda aparece — foque isquemia e TG18.",
      foco: "Isquemia · TG18 · Apendicite · Obstrução",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP · Abdome agudo.",
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
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo padrão Enamed neste grupo.",
      verdict: "Conduta objetiva: operar/NOM certo, drenar abscesso, não atrasar isquemia/hérnia estrangulada.",
      foco: "Conduta · Timing · Sinais de alarme",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Abdome agudo.",
      priorities: [
        { tema: "Apendicite", pct: 30 },
        { tema: "Colecistite", pct: 24 },
        { tema: "Diverticulite", pct: 16 },
        { tema: "Obstrução / hérnia", pct: 18 },
        { tema: "Vascular", pct: 12 }
      ],
      deckOrder: abdomeDecks,
      checklist: ["apendicite", "tg18", "diverticulite", "asbo", "estrangulada"]
    })
  ],
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
      "Apendicite não complicada: laparoscopia ± NOM",
      "TG18 guia colecistite e colangite",
      "Estrangulada: não insistir em reduzir"
    ]
  }
);

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
  "crr-figado-portal"
];

writeModule(
  "revisao-cir-ad.json",
  "Aparelho digestivo · eletivo e oncológico",
  "cir-ad",
  [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "AD adulto",
      blurb: "Esôfago → reto, vesícula eletiva, pâncreas e portal.",
      verdict:
        "Separe do abdome agudo. Aqui caem CA colorretal/reto (TME), Whipple, HCC/Milão, úlcera perfurada/sangrante, pancreatite step-up e vesícula eletiva.",
      foco: "Colorretal · Pâncreas · Portal/HCC · Estômago · Esôfago",
      estilo: "Síntese AD R1",
      priorities: [
        { tema: "Colorretal / reto", pct: 22, n: 22 },
        { tema: "Estômago / úlcera / CA", pct: 18, n: 18 },
        { tema: "Pâncreas", pct: 18, n: 18 },
        { tema: "Fígado / portal / vias", pct: 20, n: 20 },
        { tema: "Esôfago", pct: 12, n: 12 },
        { tema: "Vesícula eletiva", pct: 10, n: 10 }
      ],
      deckOrder: adDecks,
      checklist: ["tme", "whipple", "milao", "stepup", "boerhaave"],
      sessoes: [
        { titulo: "Sessão 1 · Onco digestivo", texto: "Colorretal, estômago e esôfago." },
        { titulo: "Sessão 2 · Pancreatobiliar", texto: "Whipple, step-up e vesícula." },
        { titulo: "Sessão 3 · Portal", texto: "Child, HCC e Milão." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional",
      blurb: "Conduta de úlcera, pancreatite e CA básico.",
      verdict: "Úlcera perfurada, step-up, TME/rastreio e Boerhaave são os clássicos.",
      foco: "Úlcera · Pancreatite · Colorretal · Boerhaave",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · AD.",
      priorities: [
        { tema: "Estômago / úlcera", pct: 26 },
        { tema: "Pâncreas", pct: 22 },
        { tema: "Colorretal", pct: 22 },
        { tema: "Esôfago / vias", pct: 16 },
        { tema: "Portal", pct: 14 }
      ],
      deckOrder: [
        "crr-estomago-onco",
        "cg-estomago",
        "crr-pancreas",
        "cg-pancreas",
        "crr-colorretal",
        "cg-colon",
        "crr-esofago",
        "cg-vesicula",
        "crr-figado-portal",
        "cg-figado"
      ],
      checklist: ["perfurada", "stepup", "tme", "boerhaave", "milao"]
    }),
    profileBase({
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "USP ama hepatobiliar e hereditário.",
      verdict: "Child/Milão, Whipple, FAP/Lynch e acalasia.",
      foco: "Milão · Whipple · Lynch · Acalasia",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP · AD.",
      priorities: [
        { tema: "Fígado / portal", pct: 28 },
        { tema: "Pâncreas", pct: 22 },
        { tema: "Colorretal hereditário", pct: 20 },
        { tema: "Esôfago", pct: 16 },
        { tema: "Estômago / vesícula", pct: 14 }
      ],
      deckOrder: [
        "crr-figado-portal",
        "cg-figado",
        "crr-pancreas",
        "cg-pancreas",
        "crr-colorretal",
        "crr-esofago",
        "crr-estomago-onco",
        "cg-estomago",
        "cg-colon",
        "cg-vesicula"
      ],
      checklist: ["child", "milao", "whipple", "lynch", "acalasia"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "AD de suporte ao vascular/trauma.",
      verdict: "Portal, vias biliares iatrogênicas e CA gástrico/colorretal básico.",
      foco: "Portal · Vias · Colorretal · Estômago",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP · AD.",
      priorities: [
        { tema: "Portal / HCC", pct: 24 },
        { tema: "Vias / vesícula", pct: 20 },
        { tema: "Colorretal", pct: 20 },
        { tema: "Estômago / esôfago", pct: 20 },
        { tema: "Pâncreas", pct: 16 }
      ],
      deckOrder: adDecks,
      checklist: ["milao", "mirizzi", "tme", "whipple", "varizes"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Conduta de AD.",
      verdict: "Perfuração, step-up, Nigro vs TME e varizes/endoscopia.",
      foco: "Perfuração · Step-up · Reto · Varizes",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · AD.",
      priorities: [
        { tema: "Urgências AD eletivas", pct: 30 },
        { tema: "Onco básico", pct: 28 },
        { tema: "Pancreatobiliar", pct: 22 },
        { tema: "Portal / esôfago", pct: 20 }
      ],
      deckOrder: adDecks,
      checklist: ["perfurada", "stepup", "tme", "boerhaave", "varizes"]
    })
  ],
  {
    checklistLabels: {
      tme: "Reto: neo + TME",
      whipple: "Cabeça de pâncreas ressecável",
      milao: "HCC → critérios de Milão",
      stepup: "Necrose: step-up",
      boerhaave: "Ruptura esofágica",
      perfurada: "Úlcera perfurada → cirurgia",
      child: "Child-Pugh",
      lynch: "Lynch ≠ FAP",
      acalasia: "Heller + fundoplicatura",
      mirizzi: "Cálculo comprimindo via",
      varizes: "Endoscopia + vasoativo"
    }
  }
);

const uroDecks = ["cg-urologia", "crr-urologia"];

writeModule(
  "revisao-cir-urologia.json",
  "Urologia R1",
  "cir-urologia",
  [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "~4% Cirurgia",
      blurb: "Grupo próprio — não misturar com abdome agudo.",
      verdict:
        "Torção testicular, litíase (EAU), Fournier, retenção/HBP e onco urológico básico (próstrata/bexiga/testículo).",
      foco: "Torção · Litíase · Fournier · HBP · Onco uro",
      estilo: "Síntese Urologia R1",
      priorities: [
        { tema: "Torção / urgências escrotais", pct: 24, n: 24 },
        { tema: "Litíase / cólica", pct: 22, n: 22 },
        { tema: "Fournier / infecção", pct: 18, n: 18 },
        { tema: "HBP / retenção", pct: 16, n: 16 },
        { tema: "Onco urológico", pct: 20, n: 20 }
      ],
      deckOrder: uroDecks,
      checklist: ["torcao", "litíase", "fournier", "retenção", "testiculo"],
      sessoes: [
        { titulo: "Sessão 1 · Urgências", texto: "Torção e Fournier." },
        { titulo: "Sessão 2 · Litíase", texto: "AINE, infectado+obstruído, URS/LECO." },
        { titulo: "Sessão 3 · Onco", texto: "Próstata, bexiga e testículo." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional",
      blurb: "Torção e litíase dominam.",
      verdict: "Dúvida torção×orquite = explorar. Cólica: AINE. Infectado + dilatação: drenar já.",
      foco: "Torção · Cólica · Obstrução infectada · Fournier",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Urologia.",
      priorities: [
        { tema: "Torção", pct: 30 },
        { tema: "Litíase", pct: 28 },
        { tema: "Fournier", pct: 18 },
        { tema: "HBP / onco", pct: 24 }
      ],
      deckOrder: uroDecks,
      checklist: ["torcao", "litíase", "fournier", "drenagem", "hbp"]
    }),
    profileBase({
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "USP detalha onco e infecção.",
      verdict: "Tumor testicular (via inguinal), bexiga com hematúria e pielonefrite enfisematosa.",
      foco: "Testículo · Bexiga · Enfisematosa · Litíase",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP · Urologia.",
      priorities: [
        { tema: "Onco uro", pct: 32 },
        { tema: "Infecção complicada", pct: 24 },
        { tema: "Litíase", pct: 22 },
        { tema: "Torção / HBP", pct: 22 }
      ],
      deckOrder: ["crr-urologia", "cg-urologia"],
      checklist: ["testiculo", "bexiga", "enfisematosa", "torcao", "litíase"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "~5% na Unifesp.",
      verdict: "Uro onco + urgências escrotais e Fournier.",
      foco: "Onco · Torção · Fournier",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP · Urologia.",
      priorities: [
        { tema: "Onco", pct: 30 },
        { tema: "Urgências", pct: 30 },
        { tema: "Litíase / HBP", pct: 40 }
      ],
      deckOrder: uroDecks,
      checklist: ["torcao", "testiculo", "fournier", "litíase", "prostata"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Conduta uro.",
      verdict: "Explorar torção, desbridar Fournier, drenar rim infectado obstruído.",
      foco: "Torção · Fournier · Drenagem",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Urologia.",
      priorities: [
        { tema: "Urgências uro", pct: 40 },
        { tema: "Litíase", pct: 30 },
        { tema: "Onco / HBP", pct: 30 }
      ],
      deckOrder: uroDecks,
      checklist: ["torcao", "fournier", "drenagem", "litíase", "hbp"]
    })
  ],
  {
    checklistLabels: {
      torcao: "Torção = exploração urgente",
      "litíase": "AINE · infectado → drenar",
      fournier: "Desbridamento + ATB",
      "retenção": "Sonda ± HBP",
      testiculo: "Orquiectomia inguinal",
      drenagem: "Obstrução + infecção",
      hbp: "Retenção / cirurgia se refratário",
      bexiga: "Hematúria → cistoscopia",
      enfisematosa: "Gás no rim no DM",
      prostata: "PSA + conduta por estágio"
    }
  }
);

const toraxDecks = ["cg-torax", "crr-torax-eletivo"];

writeModule(
  "revisao-cir-torax.json",
  "Cirurgia torácica eletiva",
  "cir-torax",
  [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "~3% Cirurgia",
      blurb: "Tórax eletivo (trauma de tórax fica no Cir2).",
      verdict: "Pneumotórax espontâneo (indicação cirúrgica), empiema, derrame, nódulo/CA de pulmão e mediastino (4 T).",
      foco: "Pneumotórax · Empiema · CA pulmão · Mediastino",
      estilo: "Síntese tórax eletivo",
      priorities: [
        { tema: "Pneumotórax espontâneo", pct: 28, n: 28 },
        { tema: "Empiema / derrame", pct: 26, n: 26 },
        { tema: "CA / nódulo pulmonar", pct: 26, n: 26 },
        { tema: "Mediastino", pct: 20, n: 20 }
      ],
      deckOrder: toraxDecks,
      checklist: ["pntx-esp", "empiema", "nsclc", "mediastino"],
      sessoes: [
        { titulo: "Sessão 1 · Ar e pus", texto: "Pneumotórax e empiema." },
        { titulo: "Sessão 2 · Onco", texto: "Nódulo e NSCLC ressecável." },
        { titulo: "Sessão 3 · Mediastino", texto: "4 T do anterior." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional",
      blurb: "Indicação de VATS e dreno.",
      verdict: "Quando operar pneumotórax e como tratar empiema (dreno → VATS).",
      foco: "VATS · Empiema · Dreno",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Tórax.",
      priorities: [
        { tema: "Pneumotórax", pct: 34 },
        { tema: "Empiema", pct: 30 },
        { tema: "CA / mediastino", pct: 36 }
      ],
      deckOrder: toraxDecks,
      checklist: ["pntx-esp", "empiema", "vats", "mediastino"]
    }),
    profileBase({
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "USP gosta de mediastino e staging.",
      verdict: "4 T, critérios de Light e indicação de lobectomia.",
      foco: "Mediastino · Light · Lobectomia",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP · Tórax.",
      priorities: [
        { tema: "Mediastino / CA", pct: 40 },
        { tema: "Derrame / empiema", pct: 30 },
        { tema: "Pneumotórax", pct: 30 }
      ],
      deckOrder: ["crr-torax-eletivo", "cg-torax"],
      checklist: ["mediastino", "light", "nsclc", "pntx-esp"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "~5% com uro/tórax.",
      verdict: "Empiema, pneumotórax recidivante e massa mediastinal.",
      foco: "Empiema · Recidiva · 4 T",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP · Tórax.",
      priorities: [
        { tema: "Empiema / pneumotórax", pct: 50 },
        { tema: "Onco / mediastino", pct: 50 }
      ],
      deckOrder: toraxDecks,
      checklist: ["empiema", "pntx-esp", "mediastino", "nsclc"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Conduta tórax eletivo.",
      verdict: "Drenar empiema; operar pneumotórax com critério; não confundir com trauma (Cir2).",
      foco: "Dreno · VATS · Critérios",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Tórax.",
      priorities: [
        { tema: "Pneumotórax / empiema", pct: 55 },
        { tema: "CA / mediastino", pct: 45 }
      ],
      deckOrder: toraxDecks,
      checklist: ["pntx-esp", "empiema", "vats", "mediastino"]
    })
  ],
  {
    checklistLabels: {
      "pntx-esp": "Quando operar pneumotórax espontâneo",
      empiema: "ATB + dreno ± VATS",
      nsclc: "Lobectomia se ressecável",
      mediastino: "Anterior = 4 T",
      vats: "Videotoracoscopia",
      light: "Transudato × exsudato"
    }
  }
);

const extrasDecks = [
  "crr-procto-avancado",
  "crr-trm-face",
  "crr-partes-moles",
  "crr-plastica-avancada",
  "crr-anestesia-avancada",
  "crr-mama-tireoide",
  "crr-infeccao-cirurgica",
  "crr-transplante-miscelanea"
];

writeModule(
  "revisao-cir-extras.json",
  "Extras R1 · procto · TRM · partes moles · mama/tireoide",
  "cir-extras",
  [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Cauda de prova",
      blurb: "Temas R1 que não cabem nos grupos principais.",
      verdict:
        "Fascite/Fournier anal, CA anal (Nigro), TRM, melanoma, mama/tireoide, anestesia avançada (MH) e noções de transplante.",
      foco: "Fascite · CA anal · TRM · Mama/tireoide · Anestesia",
      estilo: "Síntese extras R1",
      priorities: [
        { tema: "Partes moles / infecção", pct: 22, n: 22 },
        { tema: "Procto avançado", pct: 16, n: 16 },
        { tema: "TRM / face", pct: 14, n: 14 },
        { tema: "Mama / tireoide", pct: 16, n: 16 },
        { tema: "Anestesia avançada", pct: 16, n: 16 },
        { tema: "Plástica / Tx / misc", pct: 16, n: 16 }
      ],
      deckOrder: extrasDecks,
      checklist: ["fascite", "nigro", "trm", "sentinela", "mh"],
      sessoes: [
        { titulo: "Sessão 1 · Infecção grave", texto: "Fascite e infecção cirúrgica." },
        { titulo: "Sessão 2 · Procto / TRM", texto: "Nigro e choque neurogênico." },
        { titulo: "Sessão 3 · Pescoço / mama", texto: "Tireoide e sentinela." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional",
      blurb: "Fascite e CA anal caem como conduta.",
      verdict: "Desbridar fascite; CA anal = Nigro (não APR de entrada).",
      foco: "Fascite · Nigro · TRM · Tireoide",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Extras.",
      priorities: [
        { tema: "Fascite / infecção", pct: 28 },
        { tema: "Procto", pct: 20 },
        { tema: "Mama / tireoide", pct: 20 },
        { tema: "TRM / anestesia", pct: 32 }
      ],
      deckOrder: extrasDecks,
      checklist: ["fascite", "nigro", "trm", "recorrente", "mh"]
    }),
    profileBase({
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "Anestesia e melanoma.",
      verdict: "Hipertermia maligna, succinilcolina, Breslow e retalhos.",
      foco: "MH · Melanoma · Retalho · Tx",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP · Extras.",
      priorities: [
        { tema: "Anestesia", pct: 26 },
        { tema: "Partes moles / melanoma", pct: 24 },
        { tema: "Plástica / Tx", pct: 24 },
        { tema: "Demais", pct: 26 }
      ],
      deckOrder: [
        "crr-anestesia-avancada",
        "crr-partes-moles",
        "crr-plastica-avancada",
        "crr-transplante-miscelanea",
        "crr-mama-tireoide",
        "crr-procto-avancado",
        "crr-trm-face",
        "crr-infeccao-cirurgica"
      ],
      checklist: ["mh", "melanoma", "enxerto", "milao-tx", "fascite"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Tireoide e compartimental.",
      verdict: "Nervo recorrente, hipopara e fasciotomia.",
      foco: "Tireoide · Compartimental · Fascite",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP · Extras.",
      priorities: [
        { tema: "Tireoide / mama", pct: 28 },
        { tema: "Partes moles", pct: 26 },
        { tema: "TRM / anestesia", pct: 24 },
        { tema: "Demais", pct: 22 }
      ],
      deckOrder: extrasDecks,
      checklist: ["recorrente", "fasciotomia", "fascite", "sentinela", "mh"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Condutas extras.",
      verdict: "Centro na fascite; Nigro no CA anal; não usar corticoide de rotina no TRM.",
      foco: "Fascite · Nigro · TRM",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare · Extras.",
      priorities: [
        { tema: "Infecção grave", pct: 30 },
        { tema: "Procto / TRM", pct: 28 },
        { tema: "Mama / tireoide / anestesia", pct: 42 }
      ],
      deckOrder: extrasDecks,
      checklist: ["fascite", "nigro", "trm", "sentinela", "mh"]
    })
  ],
  {
    checklistLabels: {
      fascite: "Dor desproporcional → centro",
      nigro: "CA anal = QT+RT",
      trm: "Imobilizar · evitar hipotensão",
      sentinela: "Axila clínica negativa",
      mh: "Dantrolene na hipertermia maligna",
      recorrente: "Nervo laríngeo na tireoidectomia",
      melanoma: "Breslow define margem",
      enxerto: "Enxerto sem vaso próprio",
      "milao-tx": "Tx hepático / critérios",
      fasciotomia: "Síndrome compartimental"
    }
  }
);

console.log("done grupos");
