const fs = require("fs");
const path = require("path");
const ids = require("../data/flashcards-ciresp.json").map((d) => d.id);

const orderGeral = [
  "ciresp-queimaduras-geral",
  "ciresp-parkland",
  "ciresp-choque-tipos",
  "ciresp-sepse",
  "ciresp-cicatrizacao",
  "ciresp-nutricao",
  "ciresp-resposta-trauma",
  "ciresp-plastica"
];

const data = {
  title: "CirEsp · Queimaduras · Cicatrização · Choque · Nutrição · Plástica",
  module: "ciresp",
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Apostila CirEsp",
      blurb: "Queimaduras, choque, cicatrização e nutrição.",
      verdict:
        "No CirEsp, o ROI está em Parkland + regra dos nove, tipos de choque (esp. séptico Sepsis-3 e neurogênico), cicatrização/queloide e nutrição enteral×NP. Ebb/Flow e enxerto×retalho fecham o bloco.",
      foco: "Parkland · Regra dos 9 · Choque · Sepse · Queloide",
      estilo: "Síntese CirEsp × estatística Brasil",
      priorities: [
        { tema: "Queimaduras", pct: 26, n: 26 },
        { tema: "Choque / sepse", pct: 24, n: 24 },
        { tema: "Cicatrização", pct: 16, n: 16 },
        { tema: "Nutrição", pct: 16, n: 16 },
        { tema: "Resposta ao trauma / plástica", pct: 18, n: 18 }
      ],
      deckOrder: orderGeral,
      checklist: ["parkland", "regra9", "sepse3", "queloide", "enteral"],
      sessoes: [
        {
          titulo: "Sessão 1 · Queimaduras",
          texto: "Regra dos nove, Parkland e escarotomia."
        },
        {
          titulo: "Sessão 2 · Choque",
          texto: "Tipos, Sepsis-3 e neurogênico (quente + bradicardia)."
        },
        {
          titulo: "Sessão 3 · Cicatriz + nutrição",
          texto: "Queloide×hipertrófica e enteral primeiro."
        }
      ],
      lacuna: "Fórmulas Brooke/Galveston: saiba que existem; foque Parkland.",
      sourceType: "sintese",
      source: "Apostila CirEsp (Medcurso) cruzada com stats-cirurgia-geral."
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional · acesso Enare",
      featured: true,
      blurb: "Enare ama Parkland e tipos de choque.",
      verdict:
        "Priorize 4 ml×kg×%SCQ (metade em 8 h), regra dos nove, escarotomia circunferencial e choque neurogênico. Sepse: ATB precoce + volume + NA.",
      foco: "Parkland · Regra dos 9 · Escarotomia · Neurogênico · Sepse",
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Padrão Enare Cirurgia aplicado ao CirEsp.",
      priorities: [
        { tema: "Queimaduras", pct: 32 },
        { tema: "Choque / sepse", pct: 28 },
        { tema: "Cicatrização", pct: 14 },
        { tema: "Nutrição", pct: 14 },
        { tema: "Plástica / Ebb-Flow", pct: 12 }
      ],
      deckOrder: [
        "ciresp-parkland",
        "ciresp-queimaduras-geral",
        "ciresp-choque-tipos",
        "ciresp-sepse",
        "ciresp-cicatrizacao",
        "ciresp-nutricao",
        "ciresp-plastica",
        "ciresp-resposta-trauma"
      ],
      checklist: ["parkland", "regra9", "escarotomia", "neurogenico", "sepse3"],
      sessoes: [
        {
          titulo: "Sessão 1 · Parkland",
          texto: "Cálculo e timing das 8 primeiras horas."
        },
        {
          titulo: "Sessão 2 · Choque quente",
          texto: "Neurogênico e séptico."
        },
        {
          titulo: "Sessão 3 · Via aérea / escarotomia",
          texto: "Inalação e tórax circunferencial."
        }
      ],
      lacuna: "Lund-Browder detalhado: saiba que existe; regra dos nove basta na maioria."
    },
    {
      id: "usp",
      label: "USP-SP",
      kicker: "Prova USP",
      blurb: "USP detalha fisiologia e definições.",
      verdict:
        "USP cobra Ebb×Flow, Sepsis-3/SOFA, queloide×hipertrófica e indicações de NP. Elétrica (iceberg) e enxerto×retalho aparecem.",
      foco: "Ebb/Flow · Sepsis-3 · Queloide · NP · Elétrica",
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Padrão USP-SP Cirurgia aplicado ao CirEsp.",
      priorities: [
        { tema: "Resposta ao trauma", pct: 18 },
        { tema: "Choque / sepse", pct: 26 },
        { tema: "Queimaduras", pct: 22 },
        { tema: "Cicatrização / plástica", pct: 18 },
        { tema: "Nutrição", pct: 16 }
      ],
      deckOrder: [
        "ciresp-resposta-trauma",
        "ciresp-sepse",
        "ciresp-choque-tipos",
        "ciresp-queimaduras-geral",
        "ciresp-parkland",
        "ciresp-cicatrizacao",
        "ciresp-nutricao",
        "ciresp-plastica"
      ],
      checklist: ["ebb", "sofa", "queloide", "np", "eletrica"],
      sessoes: [
        {
          titulo: "Sessão 1 · Ebb/Flow",
          texto: "Hipometabolismo → hipermetabolismo."
        },
        {
          titulo: "Sessão 2 · Sepse",
          texto: "SOFA ≥2 e choque séptico."
        },
        {
          titulo: "Sessão 3 · Cicatriz",
          texto: "Queloide ultrapassa; hipertrófica respeita."
        }
      ],
      lacuna: "Harris-Benedict completo: saiba conceito × fator; não decore a fórmula inteira."
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "UNIFESP gosta de choque e cicatrização.",
      verdict:
        "Foque hemodinâmica dos 4 tipos, anafilático/neurogênico, fases da cicatrização e diferença enxerto×retalho. Parkland continua obrigatório.",
      foco: "Tipos de choque · Cicatrização · Enxerto×retalho · Parkland",
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Padrão UNIFESP Cirurgia aplicado ao CirEsp.",
      priorities: [
        { tema: "Choque", pct: 30 },
        { tema: "Cicatrização / plástica", pct: 24 },
        { tema: "Queimaduras", pct: 22 },
        { tema: "Nutrição", pct: 12 },
        { tema: "Resposta ao trauma", pct: 12 }
      ],
      deckOrder: [
        "ciresp-choque-tipos",
        "ciresp-sepse",
        "ciresp-cicatrizacao",
        "ciresp-plastica",
        "ciresp-parkland",
        "ciresp-queimaduras-geral",
        "ciresp-resposta-trauma",
        "ciresp-nutricao"
      ],
      checklist: ["distributivo", "fases", "enxerto", "parkland", "queloide"],
      sessoes: [
        {
          titulo: "Sessão 1 · Hemodinâmica",
          texto: "Hipovolêmico × cardiogênico × obstrutivo × distributivo."
        },
        {
          titulo: "Sessão 2 · Cicatriz",
          texto: "Inflamação → proliferação → maturação."
        },
        {
          titulo: "Sessão 3 · Reconstrução",
          texto: "Enxerto sem vaso; retalho com pedículo."
        }
      ],
      lacuna: "Dermátomos e espessuras em mm: saiba parcial×total, não cada setting."
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo padrão nacional do Enamed.",
      verdict:
        "Conduta: calcular Parkland, intubar se via aérea ameaçada, escarotomia no circunferencial, ATB precoce na sepse e preferir enteral.",
      foco: "Parkland · Via aérea · Escarotomia · Sepse · Enteral",
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Padrão Enare Cirurgia aplicado ao CirEsp.",
      priorities: [
        { tema: "Queimaduras", pct: 30 },
        { tema: "Choque / sepse", pct: 28 },
        { tema: "Nutrição", pct: 14 },
        { tema: "Cicatrização", pct: 14 },
        { tema: "Demais CirEsp", pct: 14 }
      ],
      deckOrder: [
        "ciresp-queimaduras-geral",
        "ciresp-parkland",
        "ciresp-sepse",
        "ciresp-choque-tipos",
        "ciresp-nutricao",
        "ciresp-cicatrizacao",
        "ciresp-plastica",
        "ciresp-resposta-trauma"
      ],
      checklist: ["parkland", "viaaerea", "escarotomia", "sepse3", "enteral"],
      sessoes: [
        {
          titulo: "Sessão 1 · Queimado grave",
          texto: "ABC + Parkland + escarotomia."
        },
        {
          titulo: "Sessão 2 · Sepse",
          texto: "Cultura, ATB, volume, NA."
        },
        {
          titulo: "Sessão 3 · Nutrição",
          texto: "Enteral > parenteral quando possível."
        }
      ],
      lacuna: "Curativos tópicos (sulfadiazina/mafenida): saiba indicação geral, não cada marca."
    }
  ],
  checklistLabels: {
    parkland: "4 ml × kg × %SCQ (1/2 em 8 h)",
    regra9: "Regra dos nove de Wallace",
    sepse3: "Sepse = ΔSOFA ≥2 por infecção",
    queloide: "Queloide ultrapassa a ferida",
    enteral: "Enteral é a via preferencial",
    escarotomia: "Circunferencial → escarotomia",
    neurogenico: "Quente + bradicardia = neurogênico",
    ebb: "Ebb = hipometabolismo inicial",
    sofa: "SOFA para disfunção orgânica",
    np: "NP se intestino não usável",
    eletrica: "Elétrica = ponta do iceberg",
    distributivo: "Alto DC / baixa RVS",
    fases: "Inflamação → proliferação → maturação",
    enxerto: "Enxerto sem vaso próprio",
    viaaerea: "Inalação/face → intubar cedo"
  },
  deckTips: {
    "ciresp-parkland": {
      pegar: "4×kg×% · metade em 8 h desde o acidente · RL · diurese guia",
      evitar: "Começar as 8 h a partir da chegada ao hospital"
    },
    "ciresp-queimaduras-geral": {
      pegar: "Regra dos 9 · 1º grau fora do cálculo sistêmico · Escarotomia circunferencial",
      evitar: "Esquecer que criança tem cabeça maior"
    },
    "ciresp-choque-tipos": {
      pegar: "4 categorias · Neurogênico quente/bradicárdico · Obstrutivo = Beck/PNTX/TEP",
      evitar: "Tratar neurogênico só com volume sem vasopressor quando necessário"
    },
    "ciresp-sepse": {
      pegar: "Sepsis-3 · ATB cedo · NA 1ª linha · Controle de foco",
      evitar: "Usar “sepse grave” como termo atual"
    },
    "ciresp-cicatrizacao": {
      pegar: "Queloide ultrapassa · Hipertrófica respeita e pode regredir",
      evitar: "Tratar todo queloide com excisão isolada sem adjuvante"
    }
  },
  oneLiners: [
    "Parkland: 4 ml × kg × %SCQ (1/2 em 8 h)",
    "Regra dos nove: adulto rápido; criança ≠ adulto",
    "Neurogênico: choque + pele quente + bradicardia",
    "Sepse: disfunção (ΔSOFA≥2) por infecção",
    "Queloide ultrapassa; hipertrófica respeita",
    "Enteral primeiro; NP se intestino indisponível"
  ]
};

data.profiles.forEach((p) => {
  const miss = p.deckOrder.filter((id) => !ids.includes(id));
  if (miss.length) throw new Error(p.id + " missing " + miss.join(","));
});

const out = path.join(__dirname, "..", "data", "revisao-ciresp.json");
fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("wrote", out, "decks", ids.length);
