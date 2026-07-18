const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const SRC = "D:\\MedHub R1\\Obstetricia";
const OUT = path.join(__dirname, "..", "data", "_extract_obs");

async function extractOne (file) {
  const buf = fs.readFileSync(path.join(SRC, file));
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = typeof result === "string" ? result : result.text || "";
  return text;
}

function pickHeadings (text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const heads = [];
  const seen = new Set();
  const re =
    /^(cap[ií]tulo|unidade|m[oó]dulo|\d+[\.\)]\s|[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s\/\-\:]{6,90}$)/i;
  const topic =
    /^(pr[eé]-?natal|parto|puerp[eé]rio|diabetes|hipertens|pr[eé]-?ecl|ecl[aâ]mpsia|sangramento|aborto|ect[oó]pica|mola|rpm|prematur|trabalho de parto|ces[aá]rea|indu[cç]|cardiotoco|vitalidade|rciu|gemelar|s[ií]filis|toxoplasmose|hiv|hepatite|cmv|listeriose|hemorragia|distocia|f[oó]rceps|ombro|apresenta[cç]|mecanismo|fisiologia|diagn[oó]stico|idade gestacional|vacina|suplement|anemia|tireoide|trombo|embolia|infec[cç]|corioamnionite|sofrimento fetal|perfil biof[ií]sico|doppler|oligo|polidr[aâ]mnio|placenta|descolamento|acreta|pr[eé]via|isoimuniza|aloimuniza|crescimento fetal|amigdala|assist[eê]ncia)/i;

  for (const L of lines) {
    if (L.length < 4 || L.length > 110) continue;
    const key = L.toLowerCase();
    if (seen.has(key)) continue;
    if (re.test(L) || topic.test(L)) {
      seen.add(key);
      heads.push(L);
    }
  }
  return heads;
}

function keywordHits (text) {
  const t = text.toLowerCase();
  const keys = [
    "pré-natal",
    "prenatal",
    "idade gestacional",
    "parto",
    "partograma",
    "cesárea",
    "cesarea",
    "indução",
    "distocia",
    "ombro",
    "puerpério",
    "puerperio",
    "hemorragia pós-parto",
    "hemorragia pos-parto",
    "pré-eclâmpsia",
    "pre-eclampsia",
    "eclâmpsia",
    "diabetes gestacional",
    "abortamento",
    "ectópica",
    "ectopica",
    "mola",
    "placenta prévia",
    "descolamento",
    "rpm",
    "rotura prematura",
    "trabalho de parto prematuro",
    "tpp",
    "cardiotocografia",
    "vitalidade",
    "rciu",
    "restrição",
    "gemelar",
    "sífilis",
    "sifilis",
    "toxoplasmose",
    "hiv",
    "cmv",
    "corioamnionite",
    "isoimunização",
    "aloimuniza",
    "doppler",
    "perfil biofísico",
    "anemia",
    "tireoide",
    "tromboembolismo",
    "fórceps",
    "forceps",
    "vácuo",
    "vacuo",
    "mecanismo de parto",
    "fisiologia da gestação"
  ];
  const hits = {};
  for (const k of keys) {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const n = (t.match(re) || []).length;
    if (n) hits[k] = n;
  }
  return hits;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = ["Obs1.pdf", "Obs2.pdf", "Obs3.pdf", "Obs4.pdf", "Obs5.pdf"];
  const summary = [];

  for (const file of files) {
    console.log("Extracting", file, "...");
    const text = await extractOne(file);
    const outFile = path.join(OUT, file.replace(".pdf", "-full.txt"));
    fs.writeFileSync(outFile, text);
    const heads = pickHeadings(text);
    const hits = keywordHits(text);
    const topHits = Object.entries(hits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25);
    summary.push({
      file,
      chars: text.length,
      pagesGuess: (text.match(/\f/g) || []).length + 1,
      heads: heads.slice(0, 80),
      topHits
    });
    console.log(
      file,
      "chars",
      text.length,
      "heads",
      heads.length,
      "top",
      topHits
        .slice(0, 8)
        .map(([k, v]) => k + ":" + v)
        .join(", ")
    );
  }

  fs.writeFileSync(
    path.join(OUT, "summary.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log("Wrote", path.join(OUT, "summary.json"));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
