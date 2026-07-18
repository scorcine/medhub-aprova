/**
 * Módulos de revisão · Neurologia + overview stats
 * Yield: Enare/USP/UNIFESP (Estratégia) — AVC, epilepsia, coma, cefaleia, neuromuscular
 */
const fs = require("fs");
const path = require("path");

function profileBase(o) {
  return {
    checklist: [],
    sessoes: [],
    lacuna: "",
    sourceType: "sintese",
    source: "Apostila Neurologia · MedHub R1.",
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
      kicker: "Síntese Neuro",
      blurb: temaFoco,
      verdict: "Priorize AVC (rtPA/trombectomia), status epiléptico, coma/HIC, cefaleia com red flags e neuromuscular (MG/SGB/ELA).",
      foco: temaFoco,
      estilo: "Síntese nacional · Neurologia",
      priorities: [
        { tema: "Diagnóstico / critérios", pct: 28 },
        { tema: "Conduta", pct: 34 },
        { tema: "Semiologia / fisiopat", pct: 20 },
        { tema: "Extras / imagem", pct: 18 }
      ],
      deckOrder,
      checklist: ["criterios", "conduta", "fisio", "dd"],
      sessoes: [
        { titulo: "Sessão 1 · Urgências", texto: "AVC, status, HIC/coma." },
        { titulo: "Sessão 2 · Crônico", texto: "Cefaleia, demência, Parkinson, EM." },
        { titulo: "Sessão 3 · Neuromuscular", texto: "MG, Guillain, ELA." }
      ]
    }),
    profileBase({
      id: "enamed",
      label: "Enamed",
      featured: true,
      kicker: "Nacional · Enare",
      blurb: "AVC e epilepsia lideram (~19% cada).",
      verdict: "Enare: AVEi conduta + epilepsia/status; TCE também aparece.",
      foco: temaFoco,
      estilo: "Padrão Enamed-Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare 2021–2024 · Neurologia (Estratégia).",
      priorities: [
        { tema: "AVC / epilepsia", pct: 38 },
        { tema: "Conduta", pct: 28 },
        { tema: "TCE / tumores", pct: 18 },
        { tema: "Outros", pct: 16 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "fisio", "dd"]
    }),
    profileBase({
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      blurb: "Coma ~20% · AVC ~17% · cefaleia ~13%.",
      verdict: "USP-SP cobra semiologia do coma, delirium, trombólise/trombectomia e cefaleias.",
      foco: temaFoco,
      estilo: "Padrão USP-SP",
      sourceType: "levantamento",
      source: "Levantamento USP-SP · Neurologia (Estratégia).",
      priorities: [
        { tema: "Coma / consciência", pct: 20 },
        { tema: "AVC", pct: 17 },
        { tema: "Cefaleia / epilepsia", pct: 23 },
        { tema: "Demência / outros", pct: 40 }
      ],
      deckOrder,
      checklist: ["fisio", "conduta", "criterios", "dd"]
    }),
    profileBase({
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      blurb: "Neuromuscular ~21% · coma ~18%.",
      verdict: "MG, Guillain e ELA são o núcleo; completar com coma e cefaleia.",
      foco: temaFoco,
      estilo: "Padrão UNIFESP",
      sourceType: "levantamento",
      source: "Levantamento UNIFESP · Neurologia (Estratégia).",
      priorities: [
        { tema: "Neuromuscular", pct: 21 },
        { tema: "Coma", pct: 18 },
        { tema: "Cefaleia / demência", pct: 28 },
        { tema: "AVC / outros", pct: 33 }
      ],
      deckOrder,
      checklist: ["conduta", "criterios", "fisio", "dd"]
    }),
    profileBase({
      id: "enare",
      label: "Enare",
      kicker: "Acesso direto",
      blurb: "Mesmo eixo Enamed.",
      verdict: "AVC + epilepsia primeiro; depois TCE e miscelânea.",
      foco: temaFoco,
      estilo: "Padrão Enare",
      sourceType: "levantamento",
      source: "Levantamento Enare · Neurologia.",
      priorities: [
        { tema: "Epilepsia", pct: 19 },
        { tema: "AVC", pct: 19 },
        { tema: "TCE", pct: 12 },
        { tema: "Outros", pct: 50 }
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
    pegar: "Janela 4,5h rtPA; ABCD2; Hunt-Hess; Glasgow; critérios de migrânea/salvas."
  },
  conduta: {
    tema: "Conduta",
    yield: "Máximo",
    pegar: "rtPA/trombectomia; BZD→fenitoína no status; manitol/HIC; O2 na salvas; IgIV/plasmaférese na SGB/crise MG."
  },
  fisio: {
    tema: "Fisiopatologia / semiologia",
    yield: "Alto",
    pegar: "Penumbra; 1º×2º neurônio; fatigabilidade MG; herniação; PPC = PAM − PIC."
  },
  dd: {
    tema: "Diagnóstico diferencial",
    yield: "Alto",
    pegar: "AIT × AVEi; crise × síncope; cefaleia primária × secundária; MG × SGB × ELA; delirium × demência."
  }
};

write("revisao-neu-avc.json", "AVC · AIT · HSA", "neu-avc",
  bankSet(["neu-avc-isquemico", "neu-avc-ait-hemorragia"], "rtPA · trombectomia · ABCD2 · Hunt-Hess"),
  { checklistItems, oneLiners: ["Janela 4,5h", "PA ≤185×110 para rtPA", "ABCD2 >3 → internar", "Pior cefaleia = HSA até prova contrária"] });

write("revisao-neu-epilepsia.json", "Epilepsia · status", "neu-epilepsia",
  bankSet(["neu-epilepsia"], "Crises · status · DAE"),
  { checklistItems, oneLiners: ["Status: BZD primeiro", "Diazepam IV no BR", "Refratário: IOT + anestesia"] });

write("revisao-neu-coma.json", "Coma · HIC · neurointensiva", "neu-coma",
  bankSet(["neu-coma-hic"], "Glasgow · manitol · herniação"),
  { checklistItems, oneLiners: ["Glasgow ≤8 → via aérea", "PPC = PAM − PIC", "Manitol na HIC"] });

write("revisao-neu-cefaleia.json", "Cefaleias", "neu-cefaleia",
  bankSet(["neu-cefaleia"], "Migrânea · salvas · red flags"),
  { checklistItems, oneLiners: ["Triptano cedo", "Profilaxia se ≥3/mês", "Salvas: O2", "Idoso temporal: pensar ACG"] });

write("revisao-neu-neuromuscular.json", "Neuromuscular", "neu-neuromuscular",
  bankSet(["neu-neuromuscular"], "MG · Guillain · ELA"),
  { checklistItems, oneLiners: ["MG: fatigabilidade + piridostigmina", "SGB: ascendente arreflexa", "ELA: UMN + LMN"] });

write("revisao-neu-demencia.json", "Demências · Parkinson", "neu-demencia",
  bankSet(["neu-demencia-parkinson"], "Alzheimer · Lewy · levodopa"),
  { checklistItems, oneLiners: ["Donepezil 1x/dia", "Levodopa + inibidor periférico", "Lewy: cuidado com neuroléptico"] });

write("revisao-neu-em.json", "EM · tumores · misc", "neu-em",
  bankSet(["neu-em-tumores"], "EM · HIC tumoral · vertigem"),
  { checklistItems, oneLiners: ["Surto: corticoide", "Natalizumabe ↔ LMP", "Red flag tumoral: progressiva + focal"] });

const stats = {
  title: "Neurologia · o que mais cai (R1)",
  unitLabel: "% relativo no bloco",
  note: "Síntese Enare/USP/UNIFESP + apostila Neurologia MedHub. AVC e epilepsia lideram Enare; coma/cefaleia a USP; neuromuscular a UNIFESP.",
  gaps: {
    summary: "Neurologia da apostila coberta em 7 grupos (caps 1–6 + síntese EM/tumores).",
    missingHighYield: ["TCE detalhado (aparece pouco na apostila vs Enare)", "Neuropediatria (apêndice)"],
    covered: [
      { tema: "AVC / AIT / HSA", grupo: "neu-avc" },
      { tema: "Epilepsia / status", grupo: "neu-epilepsia" },
      { tema: "Coma / HIC", grupo: "neu-coma" },
      { tema: "Cefaleias", grupo: "neu-cefaleia" },
      { tema: "Neuromuscular", grupo: "neu-neuromuscular" },
      { tema: "Demências / Parkinson", grupo: "neu-demencia" },
      { tema: "EM / tumores / misc", grupo: "neu-em" }
    ]
  },
  profiles: [
    {
      id: "geral",
      label: "Brasil",
      kicker: "Síntese bancas",
      featured: false,
      sourceType: "sintese",
      source: "Levantamentos Enare + USP-SP + UNIFESP + apostila Neurologia.",
      verdict: "Núcleo: AVC, epilepsia/status, coma/HIC, cefaleia e neuromuscular.",
      foco: "AVC · Epilepsia · Coma · Cefaleia · MG/SGB",
      estilo: "Síntese R1",
      priorities: [
        { tema: "AVC / AIT / HSA", pct: 22, n: 22 },
        { tema: "Epilepsia / status", pct: 16, n: 16 },
        { tema: "Coma / HIC", pct: 14, n: 14 },
        { tema: "Cefaleias", pct: 12, n: 12 },
        { tema: "Neuromuscular", pct: 14, n: 14 },
        { tema: "Demência / Parkinson", pct: 12, n: 12 },
        { tema: "EM / tumores / extras", pct: 10, n: 10 }
      ]
    },
    {
      id: "enamed",
      label: "Enamed",
      kicker: "Nacional",
      featured: true,
      sourceType: "levantamento",
      source: "Enare 2021–2024 · Neurologia (Estratégia).",
      verdict: "Epilepsia ~19% e AVC ~19%; TCE ~12%.",
      foco: "AVC · Epilepsia · TCE",
      estilo: "Padrão Enamed",
      priorities: [
        { tema: "Epilepsias", pct: 19 },
        { tema: "AVC", pct: 19 },
        { tema: "TCE", pct: 12 },
        { tema: "Outros", pct: 50 }
      ]
    },
    {
      id: "usp",
      label: "USP",
      kicker: "Prova USP",
      sourceType: "levantamento",
      source: "USP-SP · Neurologia (Estratégia).",
      verdict: "Coma ~20%, AVC ~17%, cefaleia ~13%.",
      foco: "Coma · AVC · Cefaleia",
      estilo: "Padrão USP",
      priorities: [
        { tema: "Coma / consciência", pct: 20 },
        { tema: "AVC", pct: 17 },
        { tema: "Cefaleias", pct: 13 },
        { tema: "Epilepsia / demência / outros", pct: 50 }
      ]
    },
    {
      id: "unifesp",
      label: "UNIFESP",
      kicker: "Prova UNIFESP",
      sourceType: "levantamento",
      source: "UNIFESP · Neurologia (Estratégia).",
      verdict: "Neuromuscular ~21%, coma ~18%, cefaleia/demência ~14% cada.",
      foco: "MG · Guillain · ELA · Coma",
      estilo: "Padrão UNIFESP",
      priorities: [
        { tema: "Neuromuscular", pct: 21 },
        { tema: "Coma", pct: 18 },
        { tema: "Cefaleia / demência", pct: 28 },
        { tema: "AVC / outros", pct: 33 }
      ]
    },
    {
      id: "enare",
      label: "Enare",
      kicker: "Acesso",
      sourceType: "levantamento",
      source: "Enare · Neurologia.",
      verdict: "Mesmo eixo Enamed: AVC e epilepsia primeiro.",
      foco: "AVC · Epilepsia",
      estilo: "Padrão Enare",
      priorities: [
        { tema: "Epilepsia", pct: 19 },
        { tema: "AVC", pct: 19 },
        { tema: "Outros", pct: 62 }
      ]
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, "..", "data", "stats-neurologia-geral.json"),
  JSON.stringify(stats, null, 2) + "\n",
  "utf8"
);
console.log("wrote stats-neurologia-geral.json");
require("./expand-neuro-bancas.js");
