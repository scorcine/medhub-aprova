/**
 * Módulos de revisão · Hepatologia (Hep1–4) + overview
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas Hep1–4 · MedHub R1 · Hepatologia.",
    ...o
  };
}

function write(file, title, module, profiles, extra = {}) {
  const out = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(out, JSON.stringify({ title, module, profiles, ...extra }, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}

function bankSet(deckOrder, temaFoco, verdict) {
  return [
    profileBase({
      id: "geral",
      label: "Brasil",
      kicker: "Síntese Hepato",
      blurb: temaFoco,
      verdict,
      foco: temaFoco,
      estilo: "Síntese nacional · Hepatologia",
      priorities: [
        { tema: "Diagnóstico / marcadores", pct: 28 },
        { tema: "Conduta / drogas", pct: 34 },
        { tema: "Complicações", pct: 22 },
        { tema: "DD / mapa", pct: 16 }
      ],
      deckOrder,
      checklist: ["dx", "conduta", "complicacao", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Diagnóstico", texto: "Marcadores, critérios e imagem." },
        { titulo: "Sessão 2 · Conduta", texto: "Drogas e algoritmos R1." },
        { titulo: "Sessão 3 · Complicações", texto: "Descompensação e DD." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Hepatites, ascite/PBE e varizes caem bem nas provas gerais.",
      verdict: "Priorize HBV/HCV, Child/MELD, ascite/PBE e sangramento variceal.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Hepatologia (síntese R1).",
      priorities: [
        { tema: "Virais / crônicas", pct: 30 },
        { tema: "Ascite / PBE / varizes", pct: 32 },
        { tema: "Etiologias cirrose", pct: 20 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "complicacao", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de sorologia, fisiopat e critérios.",
      verdict: "Sorologia HBV, SAAG/PBE, Child-Pugh e Wilson/CBP.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Hepatologia (síntese R1).",
      priorities: [
        { tema: "Sorologia / fisiopat", pct: 32 },
        { tema: "Complicações HTP", pct: 28 },
        { tema: "Etiologias", pct: 22 },
        { tema: "DD", pct: 18 }
      ],
      deckOrder,
      checklist: ["dx", "complicacao", "conduta", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Conduta em descompensação e biliar.",
      verdict: "Varizes, SHR, CEP/CBP e abscesso hepático.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Hepatologia (síntese R1).",
      priorities: [
        { tema: "Descompensação", pct: 30 },
        { tema: "Biliar / abscesso", pct: 26 },
        { tema: "Virais", pct: 24 },
        { tema: "Outros", pct: 20 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "complicacao", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "PBE, ligadura de varizes, lactulose e HBV/HCV primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Hepatologia.",
      priorities: [
        { tema: "Ascite / PBE / varizes", pct: 34 },
        { tema: "Virais", pct: 28 },
        { tema: "Encefalopatia", pct: 20 },
        { tema: "Outros", pct: 18 }
      ],
      deckOrder,
      checklist: ["conduta", "dx", "complicacao", "dd"]
    })
  ];
}

const checklistItems = {
  dx: {
    tema: "Diagnóstico / marcadores",
    yield: "Alto",
    pegar: "Sorologia HBV; SAAG; Child/MELD; AMA/CBP; ceruloplasmina/Wilson."
  },
  conduta: {
    tema: "Conduta / drogas",
    yield: "Máximo",
    pegar: "DAA HCV; tenofovir/entecavir; lactulose/rifaximina; ligadura; albumina na PBE."
  },
  complicacao: {
    tema: "Complicações",
    yield: "Alto",
    pegar: "PBE; SHR; EH; sangramento variceal; fulminante."
  },
  dd: {
    tema: "Diagnóstico diferencial / mapa",
    yield: "Alto",
    pegar: "CBP×CEP; DHA×DHGNA; piogênico×amebiano; HAI×virais."
  }
};

write(
  "revisao-hep-basico.json",
  "Histologia · hepatograma · icterícia",
  "hep-basico",
  bankSet(
    ["hep-histologia-circulacao", "hep-hepatograma-ictericia"],
    "Histologia · circulação · hepatograma · icterícia",
    "Domine lóbulo/fluxo hepático, AST/ALT e padrões de icterícia antes das etiologias."
  ),
  {
    checklistItems,
    oneLiners: ["AST>ALT → álcool/cirrose", "FA+GGT ↑ → colestase", "Icterícia pré/hepato/pós"]
  }
);

write(
  "revisao-hep-virais-agudas.json",
  "Hepatites virais agudas",
  "hep-virais-agudas",
  bankSet(
    ["hep-hav", "hep-hbv-aguda", "hep-hcv-aguda-cronica", "hep-hdv-hev"],
    "HAV · HBV aguda · HCV · HDV/HEV",
    "Sorologia HBV (janela, IgM anti-HBc) e transmissão HAV/HEV são o núcleo."
  ),
  {
    checklistItems,
    oneLiners: [
      "HBsAg + IgM anti-HBc = aguda",
      "HAV = fecal-oral · não cronifica",
      "HDV precisa de HBsAg"
    ]
  }
);

write(
  "revisao-hep-virais-cronicas.json",
  "Hepatites B e C crônicas",
  "hep-virais-cronicas",
  bankSet(
    ["hep-hbv-cronica", "hep-hcv-aguda-cronica"],
    "HBV/HCV crônicas · DAA · fibrose",
    "HBsAg >6 meses, elastografia e DAA (sofosbuvir etc.) são high-yield."
  ),
  {
    checklistItems,
    oneLiners: ["HBsAg >6 meses = crônica", "DAA curam HCV", "Elastografia = fibrose"]
  }
);

write(
  "revisao-hep-fulminante.json",
  "Insuficiência hepática fulminante",
  "hep-fulminante",
  bankSet(
    ["hep-fulminante"],
    "Fulminante · causas · indicação de TX",
    "Encefalopatia + coagulopatia em hepatite aguda = fulminante — pensar TX."
  ),
  {
    checklistItems,
    oneLiners: ["EH + INR ↑ em aguda", "Paracetamol / Wilson / vírus", "TX é definitiva"]
  }
);

write(
  "revisao-hep-esteatose.json",
  "Cirrose · DHA · DHGNA",
  "hep-esteatose",
  bankSet(
    ["hep-cirrose", "hep-dha", "hep-dhgna-nash"],
    "Cirrose · alcoólica · gordurosa",
    "DHA vs DHGNA, Mallory e progressão para cirrose."
  ),
  {
    checklistItems,
    oneLiners: ["AST/ALT >2 no álcool", "EHNA = esteatose+inflamação", "Perda de peso ajuda esteatose"]
  }
);

write(
  "revisao-hep-autoimune.json",
  "HAI · CBP · CEP",
  "hep-autoimune",
  bankSet(
    ["hep-hai", "hep-cbp", "hep-cep"],
    "Autoimune · CBP · CEP",
    "IgG/HAI, AMA/CBP e CEP associada a RCU."
  ),
  {
    checklistItems,
    oneLiners: ["HAI → prednisona ± AZA", "CBP → AMA + AUDC", "CEP ↔ RCU"]
  }
);

write(
  "revisao-hep-metabolicas.json",
  "Wilson · hemocromatose · DILI",
  "hep-metabolicas",
  bankSet(
    ["hep-wilson", "hep-hemocromatose", "hep-dili"],
    "Wilson · ferro · medicamento",
    "Ceruloplasmina/KF, flebotomia e DILI por droga."
  ),
  {
    checklistItems,
    oneLiners: ["Wilson = cobre ↓ ceruloplasmina", "Hemocromatose = flebotomia", "DILI = suspender droga"]
  }
);

write(
  "revisao-hep-descompensacao.json",
  "IHC · encefalopatia · ascite · PBE · SHR",
  "hep-descompensacao",
  bankSet(
    ["hep-ihc-child", "hep-encefalopatia", "hep-ascite", "hep-pbe-shr"],
    "Child · EH · ascite · PBE · SHR",
    "Child-Pugh, lactulose, SAAG, PBE e SHR são o bloco que mais tira ponto."
  ),
  {
    checklistItems,
    oneLiners: [
      "Child = 5 parâmetros",
      "Lactulose → 2–3 ev/d",
      "PBE = >250 PMN",
      "SHR = terlipressina + albumina"
    ]
  }
);

write(
  "revisao-hep-htp-varizes.json",
  "Hipertensão portal · varizes · TIPS",
  "hep-htp-varizes",
  bankSet(
    ["hep-hipertensao-portal", "hep-varizes", "hep-tips-cirurgia-htp"],
    "HTP · ligadura · betabloqueador · TIPS",
    "Ligadura no sangramento; BB na profilaxia; TIPS no refratário."
  ),
  {
    checklistItems,
    oneLiners: [
      "Ligadura > escleroterapia",
      "BB não seletivo na profilaxia",
      "TIPS = shunt portossistêmico"
    ]
  }
);

write(
  "revisao-hep-transplante.json",
  "Transplante hepático",
  "hep-transplante",
  bankSet(
    ["hep-transplante"],
    "MELD · lista · indicação",
    "MELD organiza a fila; fulminante e descompensação avançada indicam TX."
  ),
  {
    checklistItems,
    oneLiners: ["MELD = prioridade na lista", "Fulminante = indicação urgente", "Contraindicações absolutas"]
  }
);

write(
  "revisao-hep-biliar.json",
  "Biliar · abscesso · hidático",
  "hep-biliar",
  bankSet(
    [
      "hep-cistos-vias-biliares",
      "hep-lesao-iatrogenica-biliar",
      "hep-abscesso-piogenico",
      "hep-abscesso-amebiano",
      "hep-cisto-hidatico"
    ],
    "Cistos · iatrogenia · abscessos · hidático",
    "Diferencie abscesso piogênico do amebiano e reconheça lesão biliar pós-colecistectomia."
  ),
  {
    checklistItems,
    oneLiners: [
      "Piogênico → drenar + ATB",
      "Amebiano → metro ± drenar",
      "Hidático → cirurgia + albendazol"
    ]
  }
);

const stats = {
  title: "Hepatologia · o que mais cai (R1) — Hep1–4 completa",
  unitLabel: "% relativo no bloco",
  note: "Síntese R1 + apostilas Hep1–4 (série completa MedHub).",
  gaps: {
    summary: "Hepatologia coberta em 11 grupos · Hep4 expandido em CEP, cistos, lesão biliar, abscessos e cisto hidático.",
    missingHighYield: [],
    covered: [
      { tema: "Hepatograma / icterícia", grupo: "hep-basico" },
      { tema: "Virais agudas", grupo: "hep-virais-agudas" },
      { tema: "Virais crônicas", grupo: "hep-virais-cronicas" },
      { tema: "Fulminante", grupo: "hep-fulminante" },
      { tema: "Cirrose / DHA / DHGNA", grupo: "hep-esteatose" },
      { tema: "HAI / CBP / CEP", grupo: "hep-autoimune" },
      { tema: "Wilson / hemocromatose / DILI", grupo: "hep-metabolicas" },
      { tema: "Descompensação / PBE / SHR", grupo: "hep-descompensacao" },
      { tema: "HTP / varizes / TIPS", grupo: "hep-htp-varizes" },
      { tema: "Transplante", grupo: "hep-transplante" },
      { tema: "Biliar / abscessos / hidático", grupo: "hep-biliar" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Síntese R1 + apostilas Hep1–4 MedHub.",
      verdict: "Série completa: virais, descompensação da cirrose e etiologias.",
      foco: "HBV/HCV · ascite/PBE · varizes · Child/MELD",
      estilo: "Síntese R1",
      priorities: [
        { tema: "Virais", pct: 26, n: 26 },
        { tema: "Descompensação HTP", pct: 32, n: 32 },
        { tema: "Etiologias cirrose", pct: 24, n: 24 },
        { tema: "Biliar / TX", pct: 18, n: 18 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Hepatologia (síntese Hep1–4).",
      verdict: "PBE, varizes e hepatites virais dominam provas gerais.",
      foco: "PBE · varizes · HBV/HCV",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Ascite / PBE / varizes", pct: 38 },
        { tema: "Virais", pct: 28 },
        { tema: "Etiologias", pct: 18 },
        { tema: "Outros", pct: 16 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Hepatologia (síntese Hep1–4).",
      verdict: "Sorologia HBV, critérios Child/MELD e doenças metabólicas.",
      foco: "Sorologia · Child · Wilson/CBP",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Sorologia / critérios", pct: 34 },
        { tema: "Descompensação", pct: 28 },
        { tema: "Metabólicas / autoimune", pct: 22 },
        { tema: "Outros", pct: 16 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Hepatologia (síntese Hep1–4).",
      verdict: "Conduta em varizes/SHR e doenças biliares.",
      foco: "Varizes · SHR · CEP/abscesso",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Descompensação", pct: 32 },
        { tema: "Biliar", pct: 26 },
        { tema: "Virais", pct: 22 },
        { tema: "Outros", pct: 20 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Hepatologia Hep1–4.",
      verdict: "Urgências: HDA variceal, PBE e fulminante.",
      foco: "Varizes · PBE · fulminante",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Varizes / PBE", pct: 40 },
        { tema: "EH / fulminante", pct: 24 },
        { tema: "Virais", pct: 20 },
        { tema: "Outros", pct: 16 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-hepatologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-hepatologia-geral.json");
require("./expand-hepato-bancas.js");
