/**
 * Módulos de revisão · Pneumologia + overview stats
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostilas Pneumo1–2 · MedHub R1 · Pneumologia.",
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
      kicker: "Síntese Pneumo",
      blurb: temaFoco,
      verdict: "Priorize intensiva/TEP, asma/DPOC, derrame (Light) e câncer (Pancoast/paraneoplásicas).",
      foco: temaFoco,
      estilo: "Síntese nacional · Pneumologia",
      priorities: [
        { tema: "Diagnóstico / critérios", pct: 28 },
        { tema: "Conduta", pct: 32 },
        { tema: "Fisiopatologia", pct: 20 },
        { tema: "Extras / imagem", pct: 20 }
      ],
      deckOrder,
      checklist: ["criterios", "conduta", "fisio", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Diagnóstico", texto: "Espirometria, Light, scores de TEP." },
        { titulo: "Sessão 2 · Urgências", texto: "Exacerbação, TEP maciço, SDRA/VM, pneumotórax." },
        { titulo: "Sessão 3 · Crônico", texto: "GINA/GOLD, câncer, TB/ILTB e interstício." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "Asma GINA e câncer (Pancoast/paraneoplásicas).",
      verdict: "Enare concentra asma e câncer de pulmão; revise também DPOC e Light.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare/Enamed · Pneumologia.",
      priorities: [
        { tema: "Asma / câncer", pct: 40 },
        { tema: "Conduta", pct: 28 },
        { tema: "DPOC / derrame", pct: 20 },
        { tema: "Extras", pct: 12 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "fisio", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Intensiva, TEP e derrame.",
      verdict: "VM/SDRA/US, fluxograma de TEP e Light caem forte na USP-SP.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP · Pneumologia.",
      priorities: [
        { tema: "Intensiva / VM", pct: 34 },
        { tema: "TEP", pct: 16 },
        { tema: "Derrame / intro", pct: 25 },
        { tema: "Asma / outros", pct: 25 }
      ],
      deckOrder,
      checklist: ["fisio", "conduta", "criterios", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Intensiva + TEP + DPOC.",
      verdict: "Mecanismos de hipoxemia, ajustes de VM e TEP instável.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Pneumologia.",
      priorities: [
        { tema: "Intensiva", pct: 20 },
        { tema: "TEP", pct: 17 },
        { tema: "DPOC / asma", pct: 22 },
        { tema: "Intro / interstício / derrame", pct: 41 }
      ],
      deckOrder,
      checklist: ["fisio", "conduta", "criterios", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "GINA, Pancoast e paraneoplásicas.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Pneumologia.",
      priorities: [
        { tema: "Asma", pct: 33 },
        { tema: "Câncer", pct: 33 },
        { tema: "DPOC / derrame / outros", pct: 34 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "fisio", "dd"]
    })
  ];
}

const checklistItems = {
  criterios: {
    tema: "Critérios / classificação",
    yield: "Alto",
    pegar: "Light; GOLD/GINA; PaO2/FiO2 na SDRA; Wells/D-dímero no TEP; VEF1/CVF <0,7 na DPOC."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "Exacerbação asma/DPOC; anticoagular TEP; RIPE/TDO na TB; trombólise se choque; dreno no empiema; VNI na DPOC acidótica."
  },
  fisio: {
    tema: "Fisiopatologia",
    yield: "Alto",
    pegar: "Shunt × espaço morto × V/Q; PEEP/auto-PEEP; núcleos de Wells / caverna tuberculosa."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "Asma × DPOC; transudato × exsudato; sarcoidose × TB; PCM × TB; nódulo solitário."
  }
};

write("revisao-pnm-intensiva.json", "Pneumologia intensiva · VM · SDRA", "pnm-intensiva",
  bankSet(["pnm-intensiva-hipoxemia", "pnm-intensiva-vm"], "Hipoxemia · VM · SDRA · VNI"),
  { checklistItems, oneLiners: ["Shunt não corrige bem com O2", "VC ~6 mL/kg na SDRA", "VNI: DPOC acidótica / EAP"] });

write("revisao-pnm-tep.json", "TEP · embolia pulmonar", "pnm-tep",
  bankSet(["pnm-tep"], "Wells · angio-TC · anticoagulação · trombólise"),
  { checklistItems, oneLiners: ["D-dímero afasta se baixa prob.", "Instável: eco ± trombólise", "Anticoagular estável"] });

write("revisao-pnm-asma.json", "Asma · GINA · exacerbação", "pnm-asma",
  bankSet(["pnm-asma-basico", "pnm-asma-farmaco-crise"], "GINA · CI · crise grave · fármacos"),
  { checklistItems, oneLiners: ["CI é base", "SABA só não basta", "PaCO2 ‘normal’ na crise = alarme"] });

write("revisao-pnm-dpoc.json", "DPOC · GOLD · exacerbação", "pnm-dpoc",
  bankSet(["pnm-dpoc"], "Espirometria · LABA/LAMA · VNI"),
  { checklistItems, oneLiners: ["VEF1/CVF <0,7", "Parar de fumar", "SpO2 88–92% em hipercápnicos"] });

write("revisao-pnm-derrame.json", "Derrame pleural · Light", "pnm-derrame",
  bankSet(["pnm-derrame"], "Light · parapneumônico · empiema"),
  { checklistItems, oneLiners: ["Light = exsudato", "Pus = dreno", "US guia punção"] });

write("revisao-pnm-cancer.json", "Câncer de pulmão", "pnm-cancer",
  bankSet(["pnm-cancer"], "Histologia · Pancoast · paraneoplásicas"),
  { checklistItems, oneLiners: ["Pancoast + Horner", "SIADH/Cushing = CPC", "Hipercalcemia = escamoso"] });

write("revisao-pnm-basico.json", "Espirometria · gasometria", "pnm-basico",
  bankSet(["pnm-basico"], "Obstrutivo × restritivo · A-a"),
  { checklistItems, oneLiners: ["Obstrutivo: relação ↓", "Restritivo: CVF ↓ relação ok", "A-a separa hipoventilação"] });

write("revisao-pnm-intersticial.json", "Intersticiais · sarcoidose", "pnm-intersticial",
  bankSet(["pnm-intersticial"], "FPI · sarcoidose · PH"),
  { checklistItems, oneLiners: ["UIP na FPI", "Adenopatia hilar bilateral", "Excluir TB antes de corticoide"] });

write("revisao-pnm-tb.json", "Tuberculose · Pneumo2", "pnm-tb",
  bankSet(["pnm-tb-basico", "pnm-tb-clinica-dx", "pnm-tb-tratamento", "pnm-tb-contatos"], "SR · TRM · RIPE · ILTB · BCG"),
  { checklistItems, oneLiners: ["2 RIPE/4 RI", "TRM não acompanha cura", "PT ≥5 mm = ILTB no BR", "TDO para todos"] });

write("revisao-pnm-tb-extra.json", "TB extrapulmonar", "pnm-tb-extra",
  bankSet(["pnm-tb-extra"], "Pleural · meníngea · Pott · pericárdio"),
  { checklistItems, oneLiners: ["Pleural = mais comum", "ADA >40", "Meningite: corticoide + RIPE longo"] });

write("revisao-pnm-micoses.json", "Micoses pulmonares", "pnm-micoses",
  bankSet(["pnm-micoses"], "PCM · histo · aspergiloma"),
  { checklistItems, oneLiners: ["PCM não contagiosa", "Itraconazol", "Aspergiloma em caverna"] });

const stats = {
  title: "Pneumologia · o que mais cai (R1)",
  unitLabel: "% relativo no bloco",
  note: "Síntese Enare/USP/UNIFESP + apostilas Pneumo1–2. Intensiva/TEP dominam USP/UNIFESP; asma e câncer lideram o Enare; TB é núcleo Brasil.",
  gaps: {
    summary: "Pneumologia coberta em 11 grupos (Pneumo1 + TB/micoses da Pneumo2).",
    missingHighYield: [],
    covered: [
      { tema: "Intensiva / VM / SDRA", grupo: "pnm-intensiva" },
      { tema: "TEP", grupo: "pnm-tep" },
      { tema: "Asma", grupo: "pnm-asma" },
      { tema: "DPOC", grupo: "pnm-dpoc" },
      { tema: "Derrame pleural", grupo: "pnm-derrame" },
      { tema: "Câncer de pulmão", grupo: "pnm-cancer" },
      { tema: "Espirometria / gasometria", grupo: "pnm-basico" },
      { tema: "Intersticiais / sarcoidose", grupo: "pnm-intersticial" },
      { tema: "Tuberculose pulmonar / ILTB", grupo: "pnm-tb" },
      { tema: "TB extrapulmonar", grupo: "pnm-tb-extra" },
      { tema: "Micoses pulmonares", grupo: "pnm-micoses" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Levantamentos Enare + USP-SP + UNIFESP + apostilas Pneumo1–2.",
      verdict: "Núcleo: intensiva, TEP, asma, DPOC, Light e TB (RIPE/ILTB); complete com câncer e micoses.",
      foco: "Intensiva · TEP · Asma · DPOC · TB",
      estilo: "Síntese R1",
      priorities: [
        { tema: "Intensiva / VM / SDRA", pct: 18, n: 18 },
        { tema: "TB / ILTB", pct: 16, n: 16 },
        { tema: "TEP", pct: 12, n: 12 },
        { tema: "Asma", pct: 14, n: 14 },
        { tema: "DPOC", pct: 12, n: 12 },
        { tema: "Derrame / câncer", pct: 16, n: 16 },
        { tema: "Interstício / micoses", pct: 12, n: 12 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare 2021–2024 · Pneumologia (Estratégia).",
      verdict: "Asma ~33% e câncer ~33%; DPOC e derrame completam.",
      foco: "Asma · Câncer · Light",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Asma", pct: 33 },
        { tema: "Câncer de pulmão", pct: 33 },
        { tema: "DPOC / derrame / outros", pct: 34 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP-SP · Pneumologia (Estratégia).",
      verdict: "Intensiva ~34%, TEP ~16%, derrame ~12%.",
      foco: "VM · TEP · Derrame",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Pneumologia intensiva", pct: 34 },
        { tema: "TEP", pct: 16 },
        { tema: "Derrame / intro", pct: 25 },
        { tema: "Asma / câncer / outros", pct: 25 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP 2017–2023 · Pneumologia (Estratégia).",
      verdict: "Intensiva ~20%, TEP ~17%, DPOC ~12%.",
      foco: "Hipoxemia · TEP · DPOC",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Pneumologia intensiva", pct: 20 },
        { tema: "TEP", pct: 17 },
        { tema: "DPOC", pct: 12 },
        { tema: "Asma / intro / interstício", pct: 51 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Pneumologia.",
      verdict: "Mesmo eixo Enamed: GINA e paraneoplásicas/Pancoast.",
      foco: "Asma · Câncer",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Asma", pct: 33 },
        { tema: "Câncer", pct: 33 },
        { tema: "Outros", pct: 34 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-pneumologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-pneumologia-geral.json");
require("./expand-pneumo-bancas.js");
