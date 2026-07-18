/**
 * Módulos de revisão · Nefrologia (Nefro 1–5) + overview
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas Nefro 1–5 · MedHub R1 · Nefrologia.",
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
      kicker: "Síntese Nefro",
      blurb: temaFoco,
      verdict:
        "Priorize GNPE (incubação + C3), SN (criança=DLM / adulto=GEFS·membranosa), Berger (sem consumir C3), GNRP tipos e complicações da SN.",
      foco: temaFoco,
      estilo: "Síntese nacional · Nefrologia",
      priorities: [
        { tema: "Diagnóstico / critérios", pct: 30 },
        { tema: "Conduta", pct: 28 },
        { tema: "Histologia / sorologia", pct: 24 },
        { tema: "DD / complicações", pct: 18 }
      ],
      deckOrder,
      checklist: ["criterios", "conduta", "histo", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Síndromes", texto: "Nefrítica × nefrótica × GNRP." },
        { titulo: "Sessão 2 · Primárias", texto: "DLM, GEFS, membranosa, Berger." },
        { titulo: "Sessão 3 · Urgências", texto: "GNRP tipos + trombose/PBE na SN." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Glomerulopatias lideram o bloco de nefro nas provas gerais.",
      verdict: "GNPE/C3, SN complicações e Berger são o núcleo Enare/Enamed.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Nefrologia (síntese R1).",
      priorities: [
        { tema: "GNPE / nefrítica", pct: 28 },
        { tema: "SN / DLM-GEFS", pct: 26 },
        { tema: "Berger / GNRP", pct: 24 },
        { tema: "Outros", pct: 22 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "histo", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Gosta de DD (Berger×GNPE) e classificação de GNRP.",
      verdict: "Complemento, incubação, IFI linear/granular/pauci e anti-PLA2R caem bem.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Nefrologia (síntese R1).",
      priorities: [
        { tema: "DD / fisiopat", pct: 30 },
        { tema: "GNRP / sorologia", pct: 26 },
        { tema: "SN adulto", pct: 24 },
        { tema: "Conduta", pct: 20 }
      ],
      deckOrder,
      checklist: ["histo", "dd", "criterios", "conduta"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Membranosa, lúpus e GNRP ANCA aparecem com frequência.",
      verdict: "Secundárias da membranosa + nefrite lúpica + ANCA.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Nefrologia (síntese R1).",
      priorities: [
        { tema: "Membranosa / sistêmicas", pct: 30 },
        { tema: "GNRP", pct: 26 },
        { tema: "SN complicações", pct: 22 },
        { tema: "Outros", pct: 22 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "histo", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "GNPE + SN criança + Berger primeiro.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Nefrologia.",
      priorities: [
        { tema: "GNPE", pct: 26 },
        { tema: "SN", pct: 26 },
        { tema: "Berger", pct: 20 },
        { tema: "Outros", pct: 28 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "histo", "dd"]
    })
  ];
}

const checklistItems = {
  criterios: {
    tema: "Critérios / definição",
    yield: "Alto",
    pegar: "Nefrótica >3,5 g; incubação GNPE; C3 até 8 sem; tipos I–III da GNRP; SNCS/SNCR."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "Suporte GNPE; corticoide na DLM; anticoagulação/trombose; biópsia se C3↓>8 sem; imunossupressão na GNRP."
  },
  histo: {
    tema: "Histologia / sorologia",
    yield: "Alto",
    pegar: "Gibas GNPE; podócitos DLM; anti-PLA2R; IgA mesangial; IFI linear/granular/pauci; ANCA/anti-MBG."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Berger × GNPE; DLM × GEFS; membranosa primária × secundária; quem consome C3."
  }
};

write(
  "revisao-nef-basico.json",
  "Básico glomerular",
  "nef-basico",
  bankSet(["nef-basico"], "TFG · proteinúria · hematúria"),
  {
    checklistItems,
    oneLiners: [">2 g → pensar glomérulo", "Dismorfismo = glomerular", "Ortostática: 2 coletas"]
  }
);

write(
  "revisao-nef-nefritica.json",
  "Síndrome nefrítica · GNPE",
  "nef-nefritica",
  bankSet(["nef-nefritica-gnpe"], "Incubação · C3 · gibas · suporte"),
  {
    checklistItems,
    oneLiners: ["Faringe ~10d · pele ~21d", "C3 normaliza ≤8 sem", "Berger não consome C3"]
  }
);

write(
  "revisao-nef-nefrotica.json",
  "Síndrome nefrótica",
  "nef-nefrotica",
  bankSet(["nef-nefrotica"], "Critérios · trombose · PBE · causas"),
  {
    checklistItems,
    oneLiners: [">3,5 g + hipoalbuminemia", "ATIII↓ → trombose", "PBE: pneumococo"]
  }
);

write(
  "revisao-nef-especificas.json",
  "Glomerulopatias específicas",
  "nef-especificas",
  bankSet(
    ["nef-dlm-gefs", "nef-membranosa", "nef-berger", "nef-gnrp", "nef-sistemicas"],
    "DLM · GEFS · membranosa · Berger · GNRP · lúpus/DM"
  ),
  {
    checklistItems,
    oneLiners: [
      "Criança SN = DLM",
      "Anti-PLA2R",
      "Berger na IVAS",
      "GNRP: linear / granular / pauci"
    ]
  }
);

const checklistTubulo = {
  criterios: {
    tema: "Critérios / definição",
    yield: "Alto",
    pegar: "FENa pré-renal×NTA; ATR I/II/IV; Fanconi; EAR >70–80%."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "Volume na rabdo; suspender droga na NIA; evitar IECA na EAR bilateral; alcalinizar com critério."
  },
  histo: {
    tema: "Fisiopat / lab",
    yield: "Alto",
    pegar: "Eosinofilúria; AGu; CPK/mioglobina; fissuras de colesterol; colar de contas DFM."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "NIA×GNDA×ateroêmbolo; Bartter×Gitelman; DFM×atero; NTA tóxica×isquêmica."
  }
};

write(
  "revisao-nef-nta.json",
  "NTA · tóxicos · rabdo/SLT",
  "nef-nta",
  bankSet(["nef-nta", "nef-nta-toxicos", "nef-rabdo-slt"], "FENa · AG · contraste · rabdo · SLT"),
  {
    checklistItems: checklistTubulo,
    oneLiners: ["FENa >1% = NTA", "AG não oligúrica", "Rabdo: volume", "SLT: sem HCO3 de rotina"]
  }
);

write(
  "revisao-nef-nia-nic.json",
  "NIA · NIC · necrose de papila",
  "nef-nia-nic",
  bankSet(["nef-nia", "nef-nic-papila"], "Fármacos · AINE+DLM · papila · RVU"),
  {
    checklistItems: checklistTubulo,
    oneLiners: ["Betalactâmico ~2 sem", "AINE: NIA+DLM", "Eosinofilúria ≠ só NIA", "Papila: DM/analgésico/falciforme"]
  }
);

write(
  "revisao-nef-tubulares.json",
  "ATR · Fanconi · Bartter/Gitelman",
  "nef-tubulares",
  bankSet(["nef-atr-fanconi"], "ATR I/II/IV · Fanconi · canalopatias"),
  {
    checklistItems: checklistTubulo,
    oneLiners: ["I = pH urinário alto + litíase", "II = proximal/Fanconi", "IV = hiperK", "Gitelman = hipoMg + hipocalciúria"]
  }
);

write(
  "revisao-nef-vascular.json",
  "Vascular isquêmica · ateroêmbolo",
  "nef-vascular",
  bankSet(["nef-renovascular", "nef-ateroembolo"], "EAR · DFM · IECA · ateroembolismo"),
  {
    checklistItems: checklistTubulo,
    oneLiners: ["IECA + EAR bilateral = IRA", "DFM: colar de contas", "Livedo + eosinofilia = ateroêmbolo"]
  }
);

const checklistSol = {
  criterios: {
    tema: "Composição / definição",
    yield: "Alto",
    pegar: "SF acidificante; RL alcalinizante; Mg <1,5 / >2,5; pH ∝ HCO3/pCO2."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "Escolher SF vs RL; SG para água livre; MgSO4 na hipoMg; Ca na hiperMg; 3% vs 7,5%."
  },
  histo: {
    tema: "Fisiopat / fórmula",
    yield: "Alto",
    pegar: "Henderson-Hasselbalch; BE; ventilação salva o tampão; Mg antagoniza Ca."
  },
  dd: {
    tema: "Escolha da solução",
    yield: "Alto",
    pegar: "HiperK→SF; ATR→RL; SNC edema→cuidado com balanceado; coloide sem ganho de sobrevida."
  }
};

write(
  "revisao-nef-solucoes.json",
  "Soluções · Mg · tampões",
  "nef-solucoes",
  bankSet(["nef-cristaloides", "nef-magnesio", "nef-tampoes"], "SF · RL · SG · Mg · Henderson"),
  {
    checklistItems: checklistSol,
    oneLiners: [
      "SF → hiperCl",
      "RL na ATR",
      "SG = água livre",
      "HipoK refratária → Mg",
      "pH = HCO3/pCO2"
    ]
  }
);

const checklistIraDrc = {
  criterios: {
    tema: "Definição / estadiamento",
    yield: "Máximo",
    pegar: "KDIGO IRA; DRC ≥3 meses; G+A; azotemia×uremia."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "Pré/pós/intrínseca; diálise urgência; IECA/BRA; sem dopamina renal."
  },
  histo: {
    tema: "Fisiopat / complicações",
    yield: "Alto",
    pegar: "Hiperfiltração; EPO; PTH/DMO; pericardite; FENa."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Pré×NTA×pós; IRA×DRC; anemia Al vs ferro."
  }
};

write(
  "revisao-nef-ira.json",
  "IRA · KDIGO · conduta",
  "nef-ira",
  bankSet(["nef-ira-kdigo", "nef-ira-etiologia", "nef-ira-conduta"], "KDIGO · pré/pós · diálise"),
  {
    checklistItems: checklistIraDrc,
    oneLiners: [
      "KDIGO: +0,3/48h",
      "Pré 55–60%",
      "Sem dopamina renal",
      "Diálise = clínica (AEIOU)"
    ]
  }
);

write(
  "revisao-nef-drc.json",
  "DRC · nefroproteção · uremia",
  "nef-drc",
  bankSet(["nef-drc-estadios", "nef-drc-manejo", "nef-drc-complicacoes"], "G+A · IECA · EPO · DMO"),
  {
    checklistItems: checklistIraDrc,
    oneLiners: [
      "≥3 meses",
      "IECA/BRA + PA",
      "EPO + ferro",
      "Sevelâmer no hiperP",
      "CV = óbito"
    ]
  }
);

const checklistUro = {
  criterios: {
    tema: "Tipos / escores",
    yield: "Alto",
    pegar: "Composição do cálculo; IPSS; Gleason; Bosniak; hematúria glomerular×urológica."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "AINE na cólica; desobstruir se sepse; LOCE; tansulosina/finasterida; BCG; duplex J."
  },
  histo: {
    tema: "Fisiopat / imagem",
    yield: "Alto",
    pegar: "TC sem contraste; pH×tipo; DRPAD; RVU→cicatriz."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Cólica×pielonefrite; HPB×CA; cisto simples×CCR; hematúria com coágulo."
  }
};

write(
  "revisao-nef-litiase.json",
  "Nefrolitíase",
  "nef-litiase",
  bankSet(["nef-litiase-clinica", "nef-litiase-tratamento"], "Tipos · TC · LOCE · prevenção"),
  {
    checklistItems: checklistUro,
    oneLiners: [
      "TC sem contraste",
      "<5 mm: expulsão",
      "Sepse: desobstruir já",
      "Tiazida na hipercalciúria"
    ]
  }
);

write(
  "revisao-nef-prostata.json",
  "HPB · câncer de próstata",
  "nef-prostata",
  bankSet(["nef-hpb", "nef-ca-prostata"], "IPSS · alfa · 5-AR · PSA · Gleason"),
  {
    checklistItems: checklistUro,
    oneLiners: [
      "IPSS 0–7 / 8–19 / 20–35",
      "Tansulosina 1ª linha",
      "Finasterida se próstata grande",
      "PSA ≠ diagnóstico"
    ]
  }
);

write(
  "revisao-nef-uro-extra.json",
  "Oncouro · obstrução · cistos",
  "nef-uro-extra",
  bankSet(["nef-ca-uro", "nef-obstrucao-cistos"], "Bexiga · CCR · RVU · DRPAD · hematúria"),
  {
    checklistItems: checklistUro,
    oneLiners: [
      "Hematúria indolor → bexiga",
      "BCG no alto risco",
      "CCR tríade tardia",
      "Coágulo = urológica"
    ]
  }
);

const stats = {
  title: "Nefrologia · o que mais cai (R1) — Nefro 1–5",
  unitLabel: "% relativo no bloco",
  note: "Síntese R1 + apostilas Nefro 1–5 (série completa MedHub).",
  gaps: {
    summary: "Nefrologia coberta em 14 grupos (Nefro 1–5).",
    missingHighYield: [],
    covered: [
      { tema: "Básico glomerular", grupo: "nef-basico" },
      { tema: "Nefrítica / GNPE", grupo: "nef-nefritica" },
      { tema: "Nefrótica / complicações", grupo: "nef-nefrotica" },
      { tema: "Glomerulopatias específicas", grupo: "nef-especificas" },
      { tema: "NTA / tóxicos / rabdo", grupo: "nef-nta" },
      { tema: "NIA / NIC / papila", grupo: "nef-nia-nic" },
      { tema: "ATR / Fanconi", grupo: "nef-tubulares" },
      { tema: "Vascular / ateroêmbolo", grupo: "nef-vascular" },
      { tema: "Soluções / Mg / tampões", grupo: "nef-solucoes" },
      { tema: "IRA", grupo: "nef-ira" },
      { tema: "DRC", grupo: "nef-drc" },
      { tema: "Litíase", grupo: "nef-litiase" },
      { tema: "HPB / CA próstata", grupo: "nef-prostata" },
      { tema: "Oncouro / obstrução / cistos", grupo: "nef-uro-extra" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Síntese R1 + apostilas Nefro 1–5 MedHub.",
      verdict: "Série completa: glomérulos, túbulo, IRA/DRC, litíase e uro.",
      foco: "IRA · DRC · litíase · GNPE",
      estilo: "Síntese R1",
      priorities: [
        { tema: "IRA / DRC", pct: 24, n: 24 },
        { tema: "Glomerulopatias", pct: 20, n: 20 },
        { tema: "Litíase / HPB / uro", pct: 18, n: 18 },
        { tema: "NTA / NIA / ATR", pct: 18, n: 18 },
        { tema: "Vascular / soluções", pct: 20, n: 20 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare/Enamed · Nefrologia (síntese).",
      verdict: "IRA/DRC e cólica/HPB são o dia a dia das provas gerais.",
      foco: "IRA · DRC · litíase · HPB",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "IRA / DRC", pct: 32 },
        { tema: "Litíase / HPB", pct: 20 },
        { tema: "Glomerulares", pct: 22 },
        { tema: "Outros", pct: 26 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP · Nefrologia (síntese).",
      verdict: "DD fino + oncouro (hematúria) + prevenção da litíase.",
      foco: "Hematúria · litíase · DRC",
      estilo: "Padrão USP",
      priorities: [
        { tema: "IRA / DRC", pct: 26 },
        { tema: "Litíase / uro", pct: 24 },
        { tema: "Glomerulares / túbulo", pct: 28 },
        { tema: "Outros", pct: 22 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Nefrologia (síntese).",
      verdict: "HPB/CA próstata, bexiga e DMO/diálise.",
      foco: "Próstata · bexiga · DRC",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "HPB / oncouro", pct: 28 },
        { tema: "DRC / diálise", pct: 26 },
        { tema: "IRA / litíase", pct: 24 },
        { tema: "Outros", pct: 22 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Nefrologia.",
      verdict: "Urgências: cólica complicada, retenção, IRA e hiperK.",
      foco: "Cólica · IRA · HPB",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "IRA / DRC", pct: 30 },
        { tema: "Litíase / HPB", pct: 24 },
        { tema: "Outros", pct: 46 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-nefrologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-nefrologia-geral.json");
require("./expand-nefro-bancas.js");
