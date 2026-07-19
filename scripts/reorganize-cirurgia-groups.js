/**
 * Reorganiza Cirurgia em grupos menores por afinidade temática.
 * Gera/atualiza revisao-cir-*.json e imprime o bloco para revisao.js.
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const TEMPLATE = JSON.parse(
  fs.readFileSync(path.join(DATA, "revisao-cir-abdome-agudo.json"), "utf8")
);

const GROUPS = [
  {
    id: "cir-abdome-agudo",
    label: "Abdome agudo",
    title: "Abdome agudo",
    blurb: "Apendicite, vias biliares agudas, diverticulite, obstrução e isquemia.",
    foco: "Apendicite · Colecistite · Obstrução · Diverticulite · Vascular",
    decks: [
      "cg-apendicite",
      "cg-colecistite",
      "cg-diverticulite",
      "cg-obstrucao",
      "cg-abdome-vascular",
      "crr-hernia-obstrucao"
    ],
    priorities: [
      { tema: "Apendicite", pct: 28 },
      { tema: "Colecistite / colangite", pct: 22 },
      { tema: "Obstrução / hérnia", pct: 18 },
      { tema: "Diverticulite", pct: 16 },
      { tema: "Abdome vascular", pct: 16 }
    ]
  },
  {
    id: "cir-trauma-atls",
    label: "Trauma · ATLS e choque",
    title: "Trauma · ATLS e choque",
    blurb: "ABCDE, resposta ao trauma, choque e controle de danos.",
    foco: "ATLS · Choque · Damage control",
    decks: ["cir2-atls", "ciresp-resposta-trauma", "ciresp-choque-tipos", "cir2-damage-control"],
    priorities: [
      { tema: "ATLS / ABCDE", pct: 35 },
      { tema: "Choque / reanimação", pct: 30 },
      { tema: "Damage control", pct: 20 },
      { tema: "Resposta ao trauma", pct: 15 }
    ]
  },
  {
    id: "cir-trauma-torax",
    label: "Trauma torácico",
    title: "Trauma torácico",
    blurb: "Pneumotórax, hemotórax, parede e coração/aorta.",
    foco: "Pneumotórax · Hemotórax · Tamponamento",
    decks: ["cir2-pneumotorax", "cir2-hemotorax", "cir2-torax-parede", "cir2-coracao-aorta"],
    priorities: [
      { tema: "Pneumotórax", pct: 30 },
      { tema: "Hemotórax", pct: 28 },
      { tema: "Parede / contusão", pct: 22 },
      { tema: "Coração / aorta", pct: 20 }
    ]
  },
  {
    id: "cir-trauma-abdome",
    label: "Trauma abdominal e pelve",
    title: "Trauma abdominal e pelve",
    blurb: "FAST, baço/fígado, vísceras ocas e pelve/GU.",
    foco: "FAST · Baço/fígado · Vísceras · Pelve",
    decks: ["cir2-abdome-inicial", "cir2-figado-baco", "cir2-visceras", "cir2-gu-pelve"],
    priorities: [
      { tema: "Abdome / FAST", pct: 30 },
      { tema: "Baço / fígado", pct: 28 },
      { tema: "Vísceras ocas", pct: 22 },
      { tema: "Pelve / GU", pct: 20 }
    ]
  },
  {
    id: "cir-trauma-neuro",
    label: "TCE · pescoço · face",
    title: "TCE · pescoço · face",
    blurb: "Trauma cranioencefálico, cervical e raquimedular/face.",
    foco: "TCE · Pescoço · TRM / face",
    decks: ["cir2-tce", "cir2-pescoco", "crr-trm-face"],
    priorities: [
      { tema: "TCE", pct: 45 },
      { tema: "Pescoço", pct: 30 },
      { tema: "TRM / face", pct: 25 }
    ]
  },
  {
    id: "cir-preop",
    label: "Pré-operatório",
    title: "Pré-operatório",
    blurb: "ASA, risco cardíaco, jejum e antibioticoprofilaxia.",
    foco: "ASA · Risco cardíaco · Jejum / ATB",
    decks: ["cir3-asa", "cir3-risco-cardiaco", "cir3-jejum-atb"],
    priorities: [
      { tema: "ASA / exames", pct: 35 },
      { tema: "Risco cardíaco", pct: 35 },
      { tema: "Jejum / profilaxia", pct: 30 }
    ]
  },
  {
    id: "cir-posop",
    label: "Pós-operatório e infecção",
    title: "Pós-operatório e infecção",
    blurb: "Febre, ISC, deiscência e infecção cirúrgica.",
    foco: "Febre · ISC · Anastomose · Infecção",
    decks: ["cir3-posop-febre", "cir3-isc", "cir3-posop-anastomose", "crr-infeccao-cirurgica"],
    priorities: [
      { tema: "Febre / TVP-TEP", pct: 30 },
      { tema: "ISC / deiscência", pct: 30 },
      { tema: "Anastomose", pct: 20 },
      { tema: "Infecção / ATB", pct: 20 }
    ]
  },
  {
    id: "cir-hernias",
    label: "Hérnias da parede",
    title: "Hérnias da parede",
    blurb: "Inguinal, femoral, umbilical, incisional e especiais.",
    foco: "Inguinal · Femoral · Umbilical / incisional",
    decks: ["cir3-hernia-inguinal", "cir3-hernia-outras"],
    priorities: [
      { tema: "Hérnia inguinal", pct: 55 },
      { tema: "Outras hérnias", pct: 45 }
    ]
  },
  {
    id: "cir-anestesia",
    label: "Anestesia e técnica",
    title: "Anestesia e técnica",
    blurb: "Anestesia, via aérea, suturas e hemostasia.",
    foco: "Anestesia · Via aérea · Suturas",
    decks: ["cir3-anestesia", "cir3-suturas-hemostasia", "crr-anestesia-avancada"],
    priorities: [
      { tema: "Anestesia", pct: 45 },
      { tema: "Suturas / hemostasia", pct: 30 },
      { tema: "Via aérea / fármacos", pct: 25 }
    ]
  },
  {
    id: "cir-infantil",
    label: "Cirurgia infantil",
    title: "Cirurgia infantil",
    blurb: "Abdome, digestivo e parede/vias biliares pediátricos.",
    foco: "Invaginação · AE/piloro · Parede / biliar",
    decks: ["cir1-ped-abdome", "cir1-ped-digestivo", "cir1-ped-parede-biliar"],
    priorities: [
      { tema: "Abdome pediátrico", pct: 35 },
      { tema: "Digestivo pediátrico", pct: 35 },
      { tema: "Parede / biliar", pct: 30 }
    ]
  },
  {
    id: "cir-vascular",
    label: "Cirurgia vascular",
    title: "Cirurgia vascular",
    blurb: "AAA, DAP, oclusão arterial, aneurismas e IVC.",
    foco: "AAA · DAP · OAA · IVC",
    decks: [
      "cir1-aaa",
      "cir1-aneurismas-perifericos",
      "cir1-dap",
      "cir1-oclusao-arterial",
      "cir1-ivc"
    ],
    priorities: [
      { tema: "AAA", pct: 25 },
      { tema: "DAP", pct: 25 },
      { tema: "Oclusão arterial", pct: 25 },
      { tema: "IVC / aneurismas", pct: 25 }
    ]
  },
  {
    id: "cir-digestivo-alto",
    label: "Digestivo alto e bariátrica",
    title: "Digestivo alto e bariátrica",
    blurb: "Esôfago, estômago, vesícula eletiva e bariátrica.",
    foco: "Esôfago · Estômago · Vesícula · Bariátrica",
    decks: ["crr-esofago", "cg-estomago", "crr-estomago-onco", "cg-vesicula", "cir1-bariatrica"],
    priorities: [
      { tema: "Estômago / úlcera / CA", pct: 30 },
      { tema: "Esôfago", pct: 25 },
      { tema: "Vesícula eletiva", pct: 25 },
      { tema: "Bariátrica", pct: 20 }
    ]
  },
  {
    id: "cir-colorretal",
    label: "Colorretal e proctologia",
    title: "Colorretal e proctologia",
    blurb: "Cólon/reto, hemorroidas, fístula, prolapso e ânus.",
    foco: "Colorretal · Hemorroidas · Fístula · CA anal",
    decks: [
      "cg-colon",
      "crr-colorretal",
      "cir1-hemorroidas",
      "cir1-abscesso-fistula",
      "cir1-prolapso",
      "crr-procto-avancado"
    ],
    priorities: [
      { tema: "Colorretal / CA", pct: 35 },
      { tema: "Hemorroidas", pct: 20 },
      { tema: "Abscesso / fístula", pct: 20 },
      { tema: "Procto avançado", pct: 25 }
    ]
  },
  {
    id: "cir-hepato-pancreas",
    label: "Fígado e pâncreas",
    title: "Fígado e pâncreas",
    blurb: "Pancreatite/CA, portal, HCC e vias.",
    foco: "Pâncreas · Portal · HCC",
    decks: ["cg-pancreas", "crr-pancreas", "cg-figado", "crr-figado-portal"],
    priorities: [
      { tema: "Pâncreas", pct: 40 },
      { tema: "Fígado / portal", pct: 35 },
      { tema: "HCC / vias", pct: 25 }
    ]
  },
  {
    id: "cir-urologia",
    label: "Urologia",
    title: "Urologia",
    blurb: "Torção, infecção, litíase e oncourologia R1.",
    foco: "Torção · Infecção · Onco uro",
    decks: ["cg-urologia", "crr-urologia"],
    priorities: [
      { tema: "Urgências urológicas", pct: 55 },
      { tema: "Oncourologia R1", pct: 45 }
    ]
  },
  {
    id: "cir-torax-eletivo",
    label: "Tórax eletivo",
    title: "Tórax eletivo",
    blurb: "Derrame, empiema e câncer de pulmão no R1.",
    foco: "Derrame · Empiema · CA pulmão",
    decks: ["cg-torax", "crr-torax-eletivo"],
    priorities: [
      { tema: "Derrame / empiema", pct: 55 },
      { tema: "CA / tórax eletivo", pct: 45 }
    ]
  },
  {
    id: "cir-queimaduras-plastica",
    label: "Queimaduras e plástica",
    title: "Queimaduras e plástica",
    blurb: "Queimaduras, Parkland, cicatrização, enxertos e partes moles.",
    foco: "Queimaduras · Parkland · Enxertos · Fascite",
    decks: [
      "ciresp-queimaduras-geral",
      "ciresp-parkland",
      "ciresp-cicatrizacao",
      "ciresp-plastica",
      "crr-plastica-avancada",
      "crr-partes-moles"
    ],
    priorities: [
      { tema: "Queimaduras", pct: 30 },
      { tema: "Parkland", pct: 20 },
      { tema: "Plástica / enxertos", pct: 30 },
      { tema: "Partes moles", pct: 20 }
    ]
  },
  {
    id: "cir-cabeca-mama",
    label: "Cabeça/pescoço · mama · tireoide",
    title: "Cabeça/pescoço · mama · tireoide",
    blurb: "Salivares, mama cirúrgica e tireoide no R1.",
    foco: "Cabeça/pescoço · Mama · Tireoide",
    decks: ["cir1-cabeca-pescoco", "crr-mama-tireoide"],
    priorities: [
      { tema: "Cabeça e pescoço", pct: 40 },
      { tema: "Mama / tireoide", pct: 60 }
    ]
  },
  {
    id: "cir-suporte",
    label: "Sepse · nutrição · miscelânea",
    title: "Sepse · nutrição · miscelânea",
    blurb: "Sepse cirúrgica, nutrição e temas residuais de R1.",
    foco: "Sepse · Nutrição · Transplante",
    decks: ["ciresp-sepse", "ciresp-nutricao", "crr-transplante-miscelanea"],
    priorities: [
      { tema: "Sepse", pct: 45 },
      { tema: "Nutrição cirúrgica", pct: 30 },
      { tema: "Transplante / misc", pct: 25 }
    ]
  }
];

function remapYear(priorities, year) {
  const bias = {
    "2024": [1.12, 1.05, 1.0, 0.95, 0.9],
    "2025": [1.05, 1.1, 1.05, 1.0, 0.95],
    "2026": [1.0, 1.05, 1.1, 1.05, 1.0]
  }[year] || [1, 1, 1, 1, 1];
  const weighted = priorities.map((p, i) => ({
    tema: p.tema,
    pct: Math.max(0.5, p.pct * (bias[i] != null ? bias[i] : 0.9))
  }));
  const sum = weighted.reduce((a, p) => a + p.pct, 0) || 1;
  const scaled = weighted
    .map((p) => ({ tema: p.tema, pct: Math.round((p.pct / sum) * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
  let acc = Math.round(scaled.reduce((a, p) => a + p.pct, 0) * 10) / 10;
  if (acc !== 100 && scaled[0]) {
    scaled[0].pct = Math.round((scaled[0].pct + (100 - acc)) * 10) / 10;
  }
  return scaled;
}

function buildFile(group) {
  const data = JSON.parse(JSON.stringify(TEMPLATE));
  data.title = group.title;
  data.module = group.id;
  data.unitLabel = "% relativo no bloco";
  data.note =
    "Grupo temático de Cirurgia R1 · ciclo 2024–2026. Subtemas agrupados por afinidade para estudo dirigido.";

  data.profiles = (data.profiles || []).map((profile) => {
    const next = { ...profile };
    next.deckOrder = group.decks.slice();
    next.blurb = group.blurb;
    next.foco = group.foco;
    if (profile.id === "geral") {
      next.priorities = group.priorities.map((p) => ({ ...p }));
      next.verdict =
        "Foque neste bloco temático: " +
        group.foco +
        ". Depois refine pela banca no seletor.";
    } else {
      // Mantém pesos relativos do template, mas com temas do grupo
      const base = group.priorities;
      next.priorities = base.map((p, i) => ({
        tema: p.tema,
        pct: base[i].pct
      }));
      next.verdict =
        (profile.verdict || "").replace(/Urgências abdominais|urgências abdominais/gi, "Abdome agudo") ||
        ("Estude " + group.title + " no padrão desta banca.");
    }
    next.byYear = {
      "2024": {
        priorities: remapYear(next.priorities, "2024"),
        verdict: (next.verdict || "") + " · ciclo 2024.",
        source: (next.source || "") + " · recorte 2024.",
        note: "Recorte anual do grupo " + group.title + "."
      },
      "2025": {
        priorities: remapYear(next.priorities, "2025"),
        verdict: (next.verdict || "") + " · ciclo 2025.",
        source: (next.source || "") + " · recorte 2025.",
        note: "Recorte anual do grupo " + group.title + "."
      },
      "2026": {
        priorities: remapYear(next.priorities, "2026"),
        verdict: (next.verdict || "") + " · ciclo 2026.",
        source: (next.source || "") + " · recorte 2026.",
        note: "Recorte anual do grupo " + group.title + "."
      }
    };
    return next;
  });

  return data;
}

// Coverage check
const allDecks = new Set();
GROUPS.forEach((g) => g.decks.forEach((d) => allDecks.add(d)));
const flashFiles = [
  "flashcards-cir1.json",
  "flashcards-cir2.json",
  "flashcards-cir3.json",
  "flashcards-ciresp.json",
  "flashcards-cir-r1.json",
  "flashcards-cir-lacunas.json"
];
const available = new Set();
for (const f of flashFiles) {
  const arr = JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
  arr.forEach((d) => available.add(d.id));
}
const missing = [...allDecks].filter((d) => !available.has(d));
const orphan = [...available].filter((d) => !allDecks.has(d));
if (missing.length) {
  console.error("Missing decks in groups:", missing);
  process.exit(1);
}
if (orphan.length) {
  console.warn("Orphan decks (not in any group):", orphan.join(", "));
}

for (const group of GROUPS) {
  const file = path.join(DATA, "revisao-" + group.id + ".json");
  fs.writeFileSync(file, JSON.stringify(buildFile(group), null, 2) + "\n", "utf8");
  console.log("wrote", path.basename(file), "·", group.decks.length, "decks");
}

// Rename in stats
const statsFile = path.join(DATA, "stats-cirurgia-geral.json");
let statsRaw = fs.readFileSync(statsFile, "utf8");
statsRaw = statsRaw
  .replace(/Urgências abdominais/g, "Abdome agudo")
  .replace(/urgências abdominais/g, "abdome agudo")
  .replace(/Urgencia abdominal/g, "Abdome agudo")
  .replace(/Trauma e urgências abdominais/gi, "Trauma e abdome agudo")
  .replace(/trauma e urgências abdominais/gi, "trauma e abdome agudo");
fs.writeFileSync(statsFile, statsRaw, "utf8");
console.log("updated stats-cirurgia-geral.json labels");

// Emit registry snippet
const registry = GROUPS.map(
  (g) =>
    `  "${g.id}": {\n` +
    `    label: "${g.label}",\n` +
    `    file: "data/revisao-${g.id}.json?v=20260718rr",\n` +
    `    specialty: "cirurgia"\n` +
    `  }`
).join(",\n");
fs.writeFileSync(
  path.join(__dirname, "_cirurgia-modules-snippet.txt"),
  registry + "\n",
  "utf8"
);
console.log("groups:", GROUPS.length);
console.log("done");
