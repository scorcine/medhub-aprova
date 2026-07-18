/**
 * Módulos de revisão · Infectologia (Inf1) + overview
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostila Inf1 · MedHub R1 · Infectologia.",
    ...o
  };
}

function write(file, title, module, profiles, extra = {}) {
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify({ title, module, profiles, ...extra }, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}

function bankSet(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese Infecto",
      blurb: temaFoco,
      verdict:
        "Priorize strongyloides/hiperinfecção, esquistossomose (Symmers/praziquantel), áscaris/Loeffler, amebíase/abscesso e NCC (ovos de solium).",
      foco: temaFoco,
      estilo: "Síntese nacional · Infectologia",
      priorities: [
        { tema: "Diagnóstico / ciclo", pct: 28 },
        { tema: "Conduta / droga", pct: 34 },
        { tema: "Complicações", pct: 22 },
        { tema: "DD / mapa", pct: 16 }
      ],
      deckOrder,
      checklist: ["ciclo", "conduta", "complicacao", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Protozoários", texto: "Ameba e Giardia." },
        { titulo: "Sessão 2 · Helmintos", texto: "Ascaris, ancilostoma, strongyloides, oxiúro." },
        { titulo: "Sessão 3 · Tropical", texto: "Esquistossomose, tênias/NCC, toxocara." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Parasitoses tropicais BR caem bem nas provas gerais.",
      verdict: "Strongyloides + esquistossomose + áscaris são o núcleo Enare/Enamed deste bloco.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Infectologia (síntese R1).",
      priorities: [
        { tema: "Strongyloides / esquito", pct: 32 },
        { tema: "Ascaris / ancilostoma", pct: 26 },
        { tema: "Ameba / NCC", pct: 24 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "ciclo", "complicacao", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de ciclo, droga e complicação mecânica/imune.",
      verdict: "Loeffler, hiperinfecção, Symmers e critérios de drenagem do abscesso amebiano.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Infectologia (síntese R1).",
      priorities: [
        { tema: "Fisiopat / ciclo", pct: 30 },
        { tema: "Complicações", pct: 28 },
        { tema: "Conduta", pct: 24 },
        { tema: "DD", pct: 18 }
      ],
      deckOrder,
      checklist: ["ciclo", "complicacao", "conduta", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "NCC e esquistossomose aparecem com frequência.",
      verdict: "Solium ovos×carne, praziquantel e quando NÃO tratar NCC.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Infectologia (síntese R1).",
      priorities: [
        { tema: "NCC / tênias", pct: 28 },
        { tema: "Esquistossomose", pct: 26 },
        { tema: "Strongyloides", pct: 24 },
        { tema: "Outros", pct: 22 }
      ],
      deckOrder,
      checklist: ["conduta", "ciclo", "complicacao", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "Hiperinfecção + praziquantel + albendazol primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Infectologia.",
      priorities: [
        { tema: "Strongyloides", pct: 28 },
        { tema: "Esquistossomose", pct: 26 },
        { tema: "Ascaris / ameba", pct: 24 },
        { tema: "Outros", pct: 22 }
      ],
      deckOrder,
      checklist: ["conduta", "ciclo", "complicacao", "dd"]
    })
  ];
}

const checklistItems = {
  ciclo: {
    tema: "Ciclo / transmissão",
    yield: "Alto",
    pegar: "Cisto×trofozoíto; Loss/Loeffler; autoinfecção strongyloides; cercária/Biomphalaria; ovos solium = NCC."
  },
  conduta: {
    tema: "Conduta / droga",
    yield: "Máximo",
    pegar: "Metro+luminal; albendazol; ivermectina; praziquantel 40 mg/kg; teclozan; quando drenar abscesso."
  },
  complicacao: {
    tema: "Complicações",
    yield: "Alto",
    pegar: "Abscesso amebiano; obstrução por áscaris; hiperinfecção; Symmers/HTP; NCC."
  },
  dd: {
    tema: "Diagnóstico diferencial / mapa",
    yield: "Alto",
    pegar: "Ameba×giardia; ancilostoma=anemia; enterobius=prurido; solium carne×ovos."
  }
};

write(
  "revisao-infc-protozoarios.json",
  "Protozoários intestinais",
  "infc-protozoarios",
  bankSet(["infc-amebiase", "infc-giardia"], "Amebíase · Giardia · abscesso"),
  {
    checklistItems,
    oneLiners: [
      "Histolytica invasiva",
      "Metro + luminal",
      "Abscesso: drogar primeiro",
      "Giardia = má absorção"
    ]
  }
);

write(
  "revisao-infc-helmintos.json",
  "Nematoides intestinais",
  "infc-helmintos",
  bankSet(
    ["infc-ascaris", "infc-ancilostoma", "infc-strongyloides", "infc-oxiuro-tricuris"],
    "Ascaris · ancilostoma · strongyloides · oxiúro"
  ),
  {
    checklistItems,
    oneLiners: [
      "Loeffler = áscaris",
      "Anemia = ancilostoma",
      "Corticoide → strongyloides",
      "Graham = oxiúro"
    ]
  }
);

write(
  "revisao-infc-cestoides.json",
  "Tênias · toxocaríase",
  "infc-cestoides",
  bankSet(["infc-tenias", "infc-toxocara"], "Solium · saginata · NCC · Toxocara"),
  {
    checklistItems,
    oneLiners: [
      "Carne = teníase",
      "Ovos = NCC",
      "Não tratar calcificado",
      "Toxocara = eosinofilia"
    ]
  }
);

write(
  "revisao-infc-esquisto.json",
  "Esquistossomose mansoni",
  "infc-esquisto",
  bankSet(["infc-esquisto", "infc-parasito-mapa"], "Biomphalaria · Katayama · Symmers · PZQ"),
  {
    checklistItems,
    oneLiners: [
      "Biomphalaria",
      "Symmers = HTP pré-sinusoidal",
      "Praziquantel 40 mg/kg",
      "Kato-Katz"
    ]
  }
);

function bankSetPac(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese PAC",
      blurb: temaFoco,
      verdict:
        "Priorize CURB/local de tratamento, empírico (ambulatório→enfermaria→UTI), Legionella no CTI, abscesso/anaeróbio e influenza.",
      foco: temaFoco,
      estilo: "Síntese nacional · Infectologia PAC",
      source: "Apostila Inf2 · MedHub R1 · Infectologia.",
      priorities: [
        { tema: "Conduta / empírico", pct: 36 },
        { tema: "Escore / UTI", pct: 24 },
        { tema: "Agentes / RX", pct: 22 },
        { tema: "ATB / abscesso", pct: 18 }
      ],
      deckOrder,
      checklist: ["escore", "empirico", "agente", "atb"],
      sessoes: [
        { titulo: "Sessão 1 · Onde tratar", texto: "CURB, PSI, critérios de UTI." },
        { titulo: "Sessão 2 · Empírico", texto: "Ambulatório, enfermaria, CTI, MDR." },
        { titulo: "Sessão 3 · Agentes/ATB", texto: "Pistas RX, abscesso, classes de ATB." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "PAC lidera keywords de Infectologia nas provas gerais.",
      verdict: "CURB + esquema empírico por cenário é o núcleo Enare/Enamed.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · PAC (síntese R1).",
      priorities: [
        { tema: "Empírico / CURB", pct: 40 },
        { tema: "UTI / Legionella", pct: 24 },
        { tema: "Abscesso / influenza", pct: 20 },
        { tema: "Outros", pct: 16 }
      ],
      deckOrder,
      checklist: ["empirico", "escore", "agente", "atb"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de DD (Mendelson×aspirativa) e falha terapêutica.",
      verdict: "Pistas RX, critérios de UTI e quando escalar MRSA/Pseudomonas.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · PAC (síntese R1).",
      priorities: [
        { tema: "DD / falha", pct: 28 },
        { tema: "UTI / escore", pct: 26 },
        { tema: "Empírico", pct: 26 },
        { tema: "ATB", pct: 20 }
      ],
      deckOrder,
      checklist: ["agente", "escore", "empirico", "atb"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "ATB e MDR aparecem com frequência.",
      verdict: "ESBL/carbapenem, MRSA e abscesso com duração/drenagem.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · PAC/ATB (síntese R1).",
      priorities: [
        { tema: "ATB / MDR", pct: 32 },
        { tema: "Empírico PAC", pct: 28 },
        { tema: "Abscesso", pct: 20 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["atb", "empirico", "agente", "escore"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "CURB + ceftriaxona/macrolídeo + oseltamivir na grave.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · PAC.",
      priorities: [
        { tema: "CURB / empírico", pct: 38 },
        { tema: "Influenza / UTI", pct: 24 },
        { tema: "Abscesso", pct: 18 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["empirico", "escore", "agente", "atb"]
    })
  ];
}

const checklistPac = {
  escore: {
    tema: "Escore / local",
    yield: "Máximo",
    pegar: "CURB-65; CRB-65; 1 maior ou 3 menores ATS; conversão VO; afebril ≥3d."
  },
  empirico: {
    tema: "Empírico por cenário",
    yield: "Máximo",
    pegar: "Amox/macro ambulatorial; ceftriaxona+macro enfermaria; CTI cobre Legionella; sem FQ só no grave."
  },
  agente: {
    tema: "Agentes / RX",
    yield: "Alto",
    pegar: "Pneumococo #1; lobo pesado=Klebsiella; pneumatocele=S.aureus; Mendelson≠ATB."
  },
  atb: {
    tema: "ATB / abscesso",
    yield: "Alto",
    pegar: "ESBL=carbapenem; MRSA=vanco/linezolida; abscesso=anaeróbio longo; metro só não."
  }
};

write(
  "revisao-infc-pac-clinica.json",
  "PAC · clínica · RX · agentes",
  "infc-pac-clinica",
  bankSetPac(
    ["infc-pac-basico", "infc-pac-rx", "infc-pac-agentes"],
    "Típica×atípica · RX · pneumococo · Klebsiella · S.aureus · Legionella"
  ),
  {
    checklistItems: checklistPac,
    oneLiners: [
      "Pneumococo #1",
      "PACS abandonado",
      "Lobo pesado = Klebsiella",
      "Pneumatocele = S. aureus"
    ]
  }
);

write(
  "revisao-infc-pac-conduta.json",
  "PAC · escores · empírico · influenza",
  "infc-pac-conduta",
  bankSetPac(
    ["infc-pac-escores", "infc-pac-tx", "infc-pac-influenza", "infc-pavm", "infc-pac-mapa"],
    "CURB · UTI · ambulatorial/enfermaria/CTI · oseltamivir · PN/PAVM"
  ),
  {
    checklistItems: checklistPac,
    oneLiners: [
      "CURB ≥2 → internar",
      "CTI: pneumococo + Legionella",
      "FQ só no grave: não",
      "PAVM ≠ PN · ATB 7 dias"
    ]
  }
);

write(
  "revisao-infc-abscesso.json",
  "Abscesso pulmonar · necrose",
  "infc-abscesso",
  bankSetPac(["infc-abscesso"], "Cavitação · anaeróbios · drenagem · duração"),
  {
    checklistItems: checklistPac,
    oneLiners: [
      ">2 cm + nível = abscesso",
      "ATB longo",
      "Metro isolado não",
      "Drenar se falha (~5–10%)"
    ]
  }
);

write(
  "revisao-infc-antibioticos.json",
  "Antibióticos na prática",
  "infc-antibioticos",
  bankSetPac(
    ["infc-atb-betalact", "infc-atb-outros"],
    "Betalactâmicos · macrolídeo · FQ · AG · MDR"
  ),
  {
    checklistItems: checklistPac,
    oneLiners: [
      "Beta = parede/PBP",
      "Macro = 50S / atípicos",
      "ESBL = carbapenem",
      "KPC = polimixina ± inalatória"
    ]
  }
);

function bankSetHiv(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese HIV",
      blurb: temaFoco,
      verdict:
        "Priorize MAC/CD4<50, esofagite (Candida/CMV/HSV), toxo×linfoma, retinite CMV e neoplasias definidoras.",
      foco: temaFoco,
      estilo: "Síntese nacional · HIV/OI",
      source: "Apostila Inf3 · MedHub R1 · Infectologia.",
      priorities: [
        { tema: "OI / CD4", pct: 34 },
        { tema: "SNC / olho", pct: 28 },
        { tema: "Neoplasias", pct: 20 },
        { tema: "GI / hepato", pct: 18 }
      ],
      deckOrder,
      checklist: ["cd4", "oi", "snc", "neoplasia"],
      sessoes: [
        { titulo: "Sessão 1 · OI", texto: "MAC, fungos BR, esofagite, diarreia." },
        { titulo: "Sessão 2 · SNC/olho", texto: "Toxo×linfoma, HAND, CMV retinal." },
        { titulo: "Sessão 3 · Neoplasias", texto: "Kaposi, LNH, colo." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "OI e massa cerebral caem bem nas provas gerais.",
      verdict: "MAC, esofagite e toxo×linfoma são o núcleo Enare/Enamed deste bloco.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · HIV (síntese R1).",
      priorities: [
        { tema: "OI / esofagite", pct: 34 },
        { tema: "SNC", pct: 28 },
        { tema: "Neoplasias", pct: 20 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["oi", "cd4", "snc", "neoplasia"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de DD imagem (toxo×linfoma) e fungos BR.",
      verdict: "PCM/histo, lesão única anelar e CMV “ketchup”.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · HIV (síntese R1).",
      priorities: [
        { tema: "SNC / imagem", pct: 32 },
        { tema: "Fungos BR", pct: 26 },
        { tema: "OI", pct: 24 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["snc", "oi", "cd4", "neoplasia"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Neoplasias e coinfecção viral aparecem.",
      verdict: "Kaposi/HHV-8, LNH/EBV e HIV-HBV (TDF+3TC).",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · HIV (síntese R1).",
      priorities: [
        { tema: "Neoplasias", pct: 30 },
        { tema: "Hepato / TARV", pct: 26 },
        { tema: "OI", pct: 24 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["neoplasia", "oi", "cd4", "snc"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "CD4 thresholds + conduta de OI primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · HIV Inf3.",
      priorities: [
        { tema: "OI / CD4", pct: 36 },
        { tema: "SNC / olho", pct: 28 },
        { tema: "Neoplasias", pct: 18 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["cd4", "oi", "snc", "neoplasia"]
    })
  ];
}

const checklistHiv = {
  cd4: {
    tema: "CD4 / limiares",
    yield: "Máximo",
    pegar: "MAC <50 + azitro; Chagas <200; cripto/Isospora; suspender profilaxia com recuperação."
  },
  oi: {
    tema: "Infecções oportunistas",
    yield: "Máximo",
    pegar: "MAC claritro+etambutol; esofagite Candida/CMV/HSV; PCM/histo; Isospora=SMX-TMP."
  },
  snc: {
    tema: "SNC / olho",
    yield: "Alto",
    pegar: "Toxo múltipla × linfoma única; HAND; CMV ketchup; valganciclovir até CD4>100."
  },
  neoplasia: {
    tema: "Neoplasias definidoras",
    yield: "Alto",
    pegar: "Kaposi/HHV-8; LNH; Ca colo; EBV no linfoma SNC."
  }
};

write(
  "revisao-infc-hiv-oi.json",
  "HIV · OI respiratórias e GI",
  "infc-hiv-oi",
  bankSetHiv(
    ["infc-hiv-mac", "infc-hiv-fungos", "infc-hiv-gi", "infc-hiv-hepato"],
    "MAC · PCM/histo · esofagite · diarreia · HBV/HCV"
  ),
  {
    checklistItems: checklistHiv,
    oneLiners: [
      "MAC: CD4 <50",
      "Esofagite: Candida > CMV > HSV",
      "PCM = definidora",
      "HIV-HBV: TDF + 3TC"
    ]
  }
);

write(
  "revisao-infc-hiv-snc.json",
  "HIV · SNC · olho · Chagas",
  "infc-hiv-snc",
  bankSetHiv(
    ["infc-hiv-neuro", "infc-hiv-ocular"],
    "HAND · toxo×linfoma · CMV retinal · Chagas"
  ),
  {
    checklistItems: checklistHiv,
    oneLiners: [
      "Múltiplas = toxo",
      "Única anelar = linfoma",
      "Queijo com ketchup = CMV",
      "Chagas: tripomastigota"
    ]
  }
);

write(
  "revisao-infc-hiv-neoplasias.json",
  "HIV · neoplasias · sistêmico",
  "infc-hiv-neoplasias",
  bankSetHiv(
    ["infc-hiv-neoplasias", "infc-hiv-sistema", "infc-hiv-mapa"],
    "Kaposi · LNH · colo · cardio/heme/pele"
  ),
  {
    checklistItems: checklistHiv,
    oneLiners: [
      "3 definidoras",
      "Kaposi = HHV-8",
      "Linfoma SNC = EBV ~100%",
      "Anemia = heme #1"
    ]
  }
);

function bankSetItu(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese ITU/pele",
      blurb: temaFoco,
      verdict:
        "Priorize cistite×pielonefrite, homem=complicada, gestante, erisipela×celulite e osteo (S.aureus/Salmonella/espondilodiscite).",
      foco: temaFoco,
      estilo: "Síntese nacional · ITU/pele/osteo",
      source: "Apostila Inf4 · MedHub R1 · Infectologia.",
      priorities: [
        { tema: "Conduta ITU", pct: 36 },
        { tema: "Pele / partes moles", pct: 24 },
        { tema: "Osteomielite", pct: 22 },
        { tema: "Diagnóstico / especiais", pct: 18 }
      ],
      deckOrder,
      checklist: ["itu", "pele", "osteo", "especial"],
      sessoes: [
        { titulo: "Sessão 1 · ITU", texto: "Agentes, cultura, cistite/pielonefrite, gestante." },
        { titulo: "Sessão 2 · Pele", texto: "Impetigo, erisipela, celulite." },
        { titulo: "Sessão 3 · Osso", texto: "Vias, Salmonella, espondilodiscite." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "ITU e pele são cotidianos das provas gerais.",
      verdict: "Fosfo/nitro, pielonefrite e erisipela×celulite são o núcleo.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · ITU/pele (síntese R1).",
      priorities: [
        { tema: "ITU conduta", pct: 40 },
        { tema: "Pele", pct: 26 },
        { tema: "Osteo", pct: 18 },
        { tema: "Outros", pct: 16 }
      ],
      deckOrder,
      checklist: ["itu", "pele", "especial", "osteo"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de homem=complicada e osteo falcêmico.",
      verdict: "Cultura/cortes, Salmonella e Cierny-Mader.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · ITU/osteo (síntese R1).",
      priorities: [
        { tema: "ITU especiais", pct: 30 },
        { tema: "Osteo", pct: 28 },
        { tema: "Pele", pct: 22 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["especial", "osteo", "itu", "pele"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Prostatite e osteo vertebral aparecem.",
      verdict: "30 dias na prostatite aguda; espondilodiscite + VHS.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · ITU/osteo (síntese R1).",
      priorities: [
        { tema: "ITU / próstata", pct: 32 },
        { tema: "Osteo", pct: 28 },
        { tema: "Pele", pct: 20 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["itu", "osteo", "pele", "especial"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "Cistite ambulatorial e celulite/erisipela primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Inf4.",
      priorities: [
        { tema: "ITU", pct: 38 },
        { tema: "Pele", pct: 28 },
        { tema: "Osteo", pct: 18 },
        { tema: "Outros", pct: 16 }
      ],
      deckOrder,
      checklist: ["itu", "pele", "osteo", "especial"]
    })
  ];
}

const checklistItu = {
  itu: {
    tema: "ITU conduta",
    yield: "Máximo",
    pegar: "Fosfo/nitro na cistite; pielonefrite 7–14d; homem=complicada; profilaxia 5 indicações."
  },
  pele: {
    tema: "Pele / partes moles",
    yield: "Alto",
    pegar: "Impetigo sem penicilina V; erisipela=strepto/limites nítidos; celulite cobrir S.aureus."
  },
  osteo: {
    tema: "Osteomielite",
    yield: "Alto",
    pegar: "S.aureus #1; Salmonella no falcêmico; espondilodiscite; sequestro/biofilme; 4–6 sem."
  },
  especial: {
    tema: "Especiais",
    yield: "Alto",
    pegar: "Gestante+cultura controle; cateter polimicrobiano; prostatite 30d/3 meses."
  }
};

write(
  "revisao-infc-itu.json",
  "ITU · cistite · pielonefrite",
  "infc-itu",
  bankSetItu(
    ["infc-itu-basico", "infc-itu-dx", "infc-itu-tx", "infc-itu-especiais", "infc-itu-mapa"],
    "Agentes · cultura · cistite/pielonefrite · gestante · homem"
  ),
  {
    checklistItems: checklistItu,
    oneLiners: [
      "E. coli 80–85%",
      "Homem = complicada",
      "Fosfo ou nitro",
      "Gestante: cultura controle"
    ]
  }
);

write(
  "revisao-infc-pele.json",
  "Pele e partes moles",
  "infc-pele",
  bankSetItu(
    ["infc-pele-piodermites", "infc-pele-celulite"],
    "Impetigo · furúnculo · erisipela · celulite"
  ),
  {
    checklistItems: checklistItu,
    oneLiners: [
      "Sem penicilina V no impetigo",
      "Erisipela = limites nítidos",
      "Dúvida: cobrir strepto+S.aureus",
      "Não espremer furúnculo"
    ]
  }
);

write(
  "revisao-infc-osteo.json",
  "Osteomielite",
  "infc-osteo",
  bankSetItu(["infc-osteo"], "Vias · S.aureus · Salmonella · espondilodiscite · Cierny"),
  {
    checklistItems: checklistItu,
    oneLiners: [
      "Contiguidade = mais comum",
      "Falcêmico = Salmonella",
      "Adulto hematogênico = coluna",
      "Sequestro = biofilme"
    ]
  }
);

function bankSetTrop(deckOrder, temaFoco) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese tropicais",
      blurb: temaFoco,
      verdict:
        "Priorize dengue (alarme/hidratação), malária (vivax/falciparum), lepto/Weil, calazar e febre maculosa.",
      foco: temaFoco,
      estilo: "Síntese nacional · Arboviroses/tropicais",
      source: "Apostila Inf5 · MedHub R1 · Infectologia.",
      priorities: [
        { tema: "Dengue / arbovírus", pct: 34 },
        { tema: "Malária", pct: 26 },
        { tema: "Lepto / calazar", pct: 22 },
        { tema: "Maculosa / outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["dengue", "malaria", "lepto", "outro"],
      sessoes: [
        { titulo: "Sessão 1 · Arbovírus", texto: "Dengue, Chik, Zika, FA." },
        { titulo: "Sessão 2 · Malária", texto: "Vivax, falciparum, primaquina." },
        { titulo: "Sessão 3 · Outras febres", texto: "Lepto, calazar, maculosa, tifoide." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Dengue e malária lideram o bloco tropical nas provas gerais.",
      verdict: "Sinais de alarme + hidratação e vivax/falciparum são o núcleo.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Tropicais (síntese R1).",
      priorities: [
        { tema: "Dengue", pct: 36 },
        { tema: "Malária", pct: 28 },
        { tema: "Lepto", pct: 18 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["dengue", "malaria", "lepto", "outro"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de Halstead, hipnozoíta e Weil.",
      verdict: "Patogênese dengue, G6PD/primaquina e tríade de Weil.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Tropicais (síntese R1).",
      priorities: [
        { tema: "Fisiopat / DD", pct: 32 },
        { tema: "Malária", pct: 26 },
        { tema: "Lepto / calazar", pct: 24 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["dengue", "malaria", "lepto", "outro"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Zika/SGB e calazar aparecem.",
      verdict: "Microcefalia/SGB, Glucantime e maculosa/doxi.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Tropicais (síntese R1).",
      priorities: [
        { tema: "Zika / Chik", pct: 26 },
        { tema: "Calazar", pct: 26 },
        { tema: "Dengue / malária", pct: 28 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["outro", "dengue", "malaria", "lepto"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "Dengue alarme e lepto em enchente primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Inf5.",
      priorities: [
        { tema: "Dengue", pct: 38 },
        { tema: "Lepto / malária", pct: 30 },
        { tema: "Outros", pct: 32 }
      ],
      deckOrder,
      checklist: ["dengue", "lepto", "malaria", "outro"]
    })
  ];
}

const checklistTrop = {
  dengue: {
    tema: "Dengue / arbovírus",
    yield: "Máximo",
    pegar: "Sinais de alarme; fase crítica na defervescência; sem AAS; Halstead; Chik artralgia; Zika fetal/SGB."
  },
  malaria: {
    tema: "Malária",
    yield: "Máximo",
    pegar: "Vivax 90% BR; falciparum=grave; hipnozoíta+primaquina/G6PD; Anopheles; sem cloroquina no falciparum."
  },
  lepto: {
    tema: "Lepto / calazar",
    yield: "Alto",
    pegar: "Weil; enchente; penicilina/ceftriaxona; Lutzomyia; Glucantime; anfo lipossomal especiais."
  },
  outro: {
    tema: "Maculosa / tifoide / emergentes",
    yield: "Alto",
    pegar: "Amblyomma+doxi; Typhi/roséola; COVID/mpox/Ebola (conceito)."
  }
};

write(
  "revisao-infc-dengue.json",
  "Dengue",
  "infc-dengue",
  bankSetTrop(
    ["infc-dengue-clinica", "infc-dengue-conduta"],
    "Alarme · fase crítica · Halstead · hidratação"
  ),
  {
    checklistItems: checklistTrop,
    oneLiners: [
      "Alarme na defervescência",
      "Ht↑ = extravasamento",
      "Sem AAS/AINE",
      "NS1 até D5"
    ]
  }
);

write(
  "revisao-infc-arbovirus.json",
  "Chik · Zika · febre amarela",
  "infc-arbovirus",
  bankSetTrop(
    ["infc-chik-zika", "infc-febre-amarela"],
    "Artralgia · microcefalia/SGB · vacina 17D"
  ),
  {
    checklistItems: checklistTrop,
    oneLiners: [
      "Chik = artrite",
      "Zika = exantema + fetal",
      "FA = icterícia/hemorragia",
      "Aedes comum"
    ]
  }
);

write(
  "revisao-infc-malaria.json",
  "Malária",
  "infc-malaria",
  bankSetTrop(["infc-malaria"], "Vivax · falciparum · primaquina · Anopheles"),
  {
    checklistItems: checklistTrop,
    oneLiners: [
      "Vivax ~90% BR",
      "Falciparum = grave",
      "Hipnozoíta → primaquina",
      "Checar G6PD"
    ]
  }
);

write(
  "revisao-infc-tropicais.json",
  "Lepto · calazar · maculosa · tifoide",
  "infc-tropicais",
  bankSetTrop(
    ["infc-lepto", "infc-leishmania", "infc-maculosa-tifoide", "infc-emergentes", "infc-tropicais-mapa"],
    "Weil · Lutzomyia · Amblyomma · Typhi · emergentes"
  ),
  {
    checklistItems: checklistTrop,
    oneLiners: [
      "Weil = icterícia+IRA+hemorragia",
      "Calazar = pancitopenia+baço",
      "Maculosa = doxi",
      "Enchente → lepto"
    ]
  }
);

const stats = {
  title: "Infectologia · o que mais cai (R1) — Inf1–5 completa",
  unitLabel: "% relativo no bloco",
  note: "Síntese R1 + apostilas Inf1–5 (série completa MedHub).",
  gaps: {
    summary: "Infectologia coberta em 18 grupos (Inf1–5 completa).",
    missingHighYield: [],
    covered: [
      { tema: "Protozoários intestinais", grupo: "infc-protozoarios" },
      { tema: "Nematoides intestinais", grupo: "infc-helmintos" },
      { tema: "Tênias / toxocara", grupo: "infc-cestoides" },
      { tema: "Esquistossomose", grupo: "infc-esquisto" },
      { tema: "PAC clínica / agentes", grupo: "infc-pac-clinica" },
      { tema: "PAC conduta / influenza", grupo: "infc-pac-conduta" },
      { tema: "Abscesso pulmonar", grupo: "infc-abscesso" },
      { tema: "Antibióticos", grupo: "infc-antibioticos" },
      { tema: "HIV / OI", grupo: "infc-hiv-oi" },
      { tema: "HIV / SNC-olho", grupo: "infc-hiv-snc" },
      { tema: "HIV / neoplasias", grupo: "infc-hiv-neoplasias" },
      { tema: "ITU", grupo: "infc-itu" },
      { tema: "Pele / partes moles", grupo: "infc-pele" },
      { tema: "Osteomielite", grupo: "infc-osteo" },
      { tema: "Dengue", grupo: "infc-dengue" },
      { tema: "Chik / Zika / FA", grupo: "infc-arbovirus" },
      { tema: "Malária", grupo: "infc-malaria" },
      { tema: "Lepto / calazar / maculosa", grupo: "infc-tropicais" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Síntese R1 + apostilas Inf1–5 MedHub.",
      verdict: "Série completa: PAC, tropicais BR, ITU/pele e HIV/OI.",
      foco: "PAC · dengue · malária · ITU · HIV",
      estilo: "Síntese R1",
      priorities: [
        { tema: "PAC / ITU / pele", pct: 28, n: 28 },
        { tema: "Arboviroses / malária / lepto", pct: 30, n: 30 },
        { tema: "HIV / OI", pct: 22, n: 22 },
        { tema: "Parasitoses / ATB", pct: 20, n: 20 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Infectologia (síntese Inf1–5).",
      verdict: "PAC + dengue/malária dominam o cotidiano das provas gerais.",
      foco: "PAC · dengue · malária · ITU",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "PAC / dengue / malária", pct: 42 },
        { tema: "ITU / pele", pct: 20 },
        { tema: "HIV / OI", pct: 20 },
        { tema: "Outros", pct: 18 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Infectologia (síntese Inf1–5).",
      verdict: "Fisiopat (Halstead/hipnozoíta) + DD tropicais + SNC HIV.",
      foco: "Dengue · malária · toxo×linfoma",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Tropicais / fisiopat", pct: 32 },
        { tema: "HIV SNC", pct: 24 },
        { tema: "PAC / ITU", pct: 24 },
        { tema: "Outros", pct: 20 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Infectologia (síntese Inf1–5).",
      verdict: "ATB/MDR, calazar/Zika e neoplasias HIV.",
      foco: "ATB · calazar · Kaposi",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "ATB / PAC", pct: 26 },
        { tema: "Tropicais", pct: 28 },
        { tema: "HIV", pct: 24 },
        { tema: "Outros", pct: 22 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Infectologia Inf1–5.",
      verdict: "Urgências: dengue grave, PAC, lepto e pielonefrite.",
      foco: "Dengue · PAC · lepto",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Dengue / PAC / lepto", pct: 42 },
        { tema: "Malária / ITU", pct: 24 },
        { tema: "HIV / OI", pct: 18 },
        { tema: "Outros", pct: 16 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-infectologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-infectologia-geral.json");
require("./expand-infecto-bancas.js");
