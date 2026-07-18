/**
 * Auditoria: capítulos das apostilas × cobertura dos flashcards
 */
const fs = require("fs");
const path = require("path");

const DIR = "data/_extract_pneumo";
const decks = require("../data/flashcards-pneumo.json");
const blob = decks
  .map((d) => [d.id, d.name, ...(d.cards || []).flatMap((c) => [c.front, c.back])].join(" "))
  .join("\n")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

function has(...needles) {
  return needles.some((n) =>
    blob.includes(
      n
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    )
  );
}

function pageAt(t, idx) {
  const before = t.slice(0, idx);
  const re = /-- (\d+) of (\d+) --/g;
  let m;
  let last = "?";
  while ((m = re.exec(before))) last = m[1];
  return last;
}

function findChapterStarts(t) {
  const out = [];
  const re = /CAP[IÍ]TULO\.?\s*(\d+)/gi;
  let m;
  while ((m = re.exec(t))) {
    const snip = t
      .slice(m.index, m.index + 180)
      .replace(/\s+/g, " ")
      .trim();
    out.push({ n: m[1], idx: m.index, p: pageAt(t, m.index), snip });
  }
  // dedupe close duplicates
  const dedup = [];
  for (const c of out) {
    if (dedup.length && Math.abs(dedup[dedup.length - 1].idx - c.idx) < 200) continue;
    dedup.push(c);
  }
  return dedup;
}

function findAppendix(t) {
  const out = [];
  const re = /AP[EÊ]NDICE\s*(\d+)/gi;
  let m;
  while ((m = re.exec(t))) {
    const snip = t
      .slice(m.index, m.index + 160)
      .replace(/\s+/g, " ")
      .trim();
    out.push({ n: m[1], idx: m.index, p: pageAt(t, m.index), snip });
  }
  const dedup = [];
  for (const c of out) {
    if (dedup.length && Math.abs(dedup[dedup.length - 1].idx - c.idx) < 200) continue;
    dedup.push(c);
  }
  return dedup;
}

/** Temas oficiais da estrutura MedHub Pneumo (manual + extract) */
const BLOCKS = [
  // —— Pneumo1 ——
  {
    apostila: "Pneumo1",
    bloco: "Cap 1 · Função respiratória / fisiologia",
    check: () =>
      has("espirometria", "obstrutivo", "restritivo", "gasometria", "shunt", "espaço morto", "hipoxemia", "gradiente")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 1 · Fisiologia avançada (PaCO2 termômetro, complacência, controle ventilatório)",
    check: () => has("PaCO2", "complacência", "quimiorreceptor", "espaço morto", "ventilação alveolar")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 2 · Asma (conceito, GINA, fármacos, crise)",
    check: () => has("asma", "GINA", "SABA", "LABA", "corticoide", "exacerb")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 2 · Asma pediátrica / fenótipos",
    check: () => has("fenótipo", "criança", "< 6", "asma alérgica", "obesidade")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 3 · DPOC (GOLD, sintomas, exacerbações)",
    check: () => has("DPOC", "GOLD", "mMRC", "CAT", "LABA", "LAMA", "exacerb")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 3 · DPOC ABE (grupos A/B/E) terapia inicial",
    check: () => has("ABE", "grupo A", "grupo B", "grupo E", "avaliação integrada")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 4 · TEP / TEV (Wells, imagem, tx)",
    check: () => has("Wells", "TEP", "angio", "D-dímero", "anticoag", "trombólise")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 5 · Câncer (histologia, Pancoast, paraneoplásicas)",
    check: () => has("Pancoast", "epidermoide", "pequenas células", "PTHrP", "paraneopl")
  },
  {
    apostila: "Pneumo1",
    bloco: "Cap 5 · Câncer (estadiamento TNM / conduta oncológica)",
    check: () => has("estadiamento", "TNM", "estádio", "ressecção", "quimioterapia", "radioterapia")
  },
  {
    apostila: "Pneumo1",
    bloco: "Apêndice 1 · IR / SDRA / VM / VNI",
    check: () => has("SDRA", "PEEP", "VNI", "BiPAP", "intuba", "volume corrente")
  },
  {
    apostila: "Pneumo1",
    bloco: "Apêndice 2 · Derrame pleural / Light",
    check: () => has("Light", "exsudato", "transudato", "empiema", "quilotórax")
  },
  {
    apostila: "Pneumo1",
    bloco: "Apêndice 3 · Intersticiais / pneumoconioses / PH",
    check: () => has("fibrose", "intersticial", "pneumoconiose", "hipersensibilidade")
  },
  {
    apostila: "Pneumo1",
    bloco: "Apêndice 3 · Hipertensão pulmonar",
    check: () => has("hipertensão pulmonar", "HP", "grupo 1", "vasodilatador pulmonar")
  },
  {
    apostila: "Pneumo1",
    bloco: "Apêndice 4 · Sarcoidose",
    check: () => has("sarcoidose", "não caseoso", "Heerfordt", "adenopatia hilar")
  },
  {
    apostila: "Pneumo1",
    bloco: "Tema transversal · Pneumotórax",
    check: () => has("pneumotórax", "hipertensivo", "dreno de tórax")
  },
  {
    apostila: "Pneumo1",
    bloco: "Tema transversal · Bronquiectasia / hemoptise (fora de TB)",
    check: () => has("bronquiectasia") && has("hemoptise")
  },
  // —— Pneumo2 ——
  {
    apostila: "Pneumo2",
    bloco: "Cap 1 · TB epidemio / patogenia / transmissão",
    check: () => has("bacilífero", "Wells", "BAAR", "caverna", "granuloma")
  },
  {
    apostila: "Pneumo2",
    bloco: "Cap 2 · TB clínica / diagnóstico / tratamento",
    check: () => has("TRM", "baciloscopia", "RIPE", "TDO", "falência")
  },
  {
    apostila: "Pneumo2",
    bloco: "Cap 3 · Contatos / ILTB / PPD / IGRA / BCG",
    check: () => has("ILTB", "PPD", "IGRA", "BCG", "contact")
  },
  {
    apostila: "Pneumo2",
    bloco: "Cap 4 · TB extrapulmonar",
    check: () => has("pleural", "ADA", "Pott", "meníngea", "pericárd")
  },
  {
    apostila: "Pneumo2",
    bloco: "Cap 5 · PCM",
    check: () => has("paracoccidio", "PCM", "itraconazol")
  },
  {
    apostila: "Pneumo2",
    bloco: "Cap 5 · Histoplasmose",
    check: () => has("histoplasma", "histoplasmose")
  },
  {
    apostila: "Pneumo2",
    bloco: "Cap 5 · Criptococose / aspergilose (além de fungus ball)",
    check: () => has("criptococ") || (has("aspergil") && has("invasiv"))
  },
  {
    apostila: "Pneumo2",
    bloco: "Apêndice · Candidíase",
    check: () => has("candid")
  }
];

const p1 = fs.readFileSync(path.join(DIR, "Pneumo1-full.txt"), "utf8");
const p2 = fs.readFileSync(path.join(DIR, "Pneumo2-full.txt"), "utf8");

console.log("=== Estrutura detectada ===");
console.log("Pneumo1 caps:", findChapterStarts(p1).map((c) => `Cap${c.n}~p${c.p}`).join(" · "));
console.log("Pneumo1 apêndices:", findAppendix(p1).map((c) => `Ap${c.n}~p${c.p}`).join(" · "));
console.log("Pneumo2 caps:", findChapterStarts(p2).map((c) => `Cap${c.n}~p${c.p}`).join(" · "));
console.log("Pneumo2 apêndices:", findAppendix(p2).map((c) => `Ap${c.n}~p${c.p}`).join(" · "));

console.log("\n=== Decks atuais ===");
decks.forEach((d) => console.log(`  ${d.id} (${d.cards.length})`));
console.log("Total:", decks.length, "decks ·", decks.reduce((n, d) => n + d.cards.length, 0), "cards");

console.log("\n=== Cobertura por bloco ===");
const ok = [];
const weak = [];
for (const b of BLOCKS) {
  const pass = b.check();
  (pass ? ok : weak).push(b);
  console.log(pass ? "OK " : "GAP", `| ${b.apostila} | ${b.bloco}`);
}

console.log("\n=== RESUMO ===");
console.log(`Blocos OK: ${ok.length}/${BLOCKS.length}`);
console.log(`Lacunas: ${weak.length}`);
weak.forEach((b) => console.log(" -", b.bloco));

// Presence of major titles in apostila text (confirm they exist)
const titleChecks = [
  ["hipertensão pulmonar", p1],
  ["pneumotórax", p1],
  ["bronquiectasia", p1],
  ["grupo E", p1],
  ["ABE", p1],
  ["TNM", p1],
  ["HISTOPLASMOSE", p2],
  ["CRIPTOCOC", p2],
  ["CANDID", p2],
  ["ASPERGILOSE", p2]
];
console.log("\n=== Temas existem na apostila? ===");
for (const [k, t] of titleChecks) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log(i >= 0 ? "SIM" : "NÃO", k, i >= 0 ? `~p${pageAt(t, i)}` : "");
}
