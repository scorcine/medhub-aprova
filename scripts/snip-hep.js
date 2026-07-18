/**
 * Recorta trechos por âncora → data/_extract_hepato/snip-*.txt
 */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_hepato");

function load(base) {
  return fs.readFileSync(path.join(DIR, base + "-full.txt"), "utf8");
}

function snip(text, startRe, endRe, max = 4500) {
  const m = startRe.exec(text);
  if (!m) return null;
  const from = m.index;
  let to = text.length;
  if (endRe) {
    endRe.lastIndex = 0;
    const rest = text.slice(from + m[0].length);
    const e = endRe.exec(rest);
    if (e) to = from + m[0].length + e.index;
  }
  return text.slice(from, Math.min(to, from + max)).replace(/\s+/g, " ").trim();
}

function write(name, content) {
  if (!content) {
    console.log("MISS", name);
    return;
  }
  fs.writeFileSync(path.join(DIR, name), content, "utf8");
  console.log("ok", name, content.length);
}

const hep1 = load("Hep1");
const hep2 = load("Hep2");
const hep3 = load("Hep3");
const hep4 = load("Hep4");

const jobs = [
  ["snip-hep1-intro.txt", hep1, /INTRODUÇÃO À HEPATOLOGIA/i, /CAPÍTULO\s*2|HEPATITES VIRAIS AGUDAS/i, 5000],
  ["snip-hep1-hav.txt", hep1, /HEPATITE\s*A\b|VÍRUS\s*A\s*DA\s*HEPATITE|HAV\b/i, /HEPATITE\s*B\b|VÍRUS\s*B/i, 6000],
  ["snip-hep1-hbv-aguda.txt", hep1, /HEPATITE\s*B\b/i, /HEPATITE\s*C\b|HEPATITE\s*D\b/i, 7000],
  ["snip-hep1-hcv-aguda.txt", hep1, /HEPATITE\s*C\b/i, /HEPATITE\s*D\b|HEPATITE\s*E\b|CAPÍTULO\s*3/i, 5000],
  ["snip-hep1-cronica.txt", hep1, /HEPATITES VIRAIS CRÔNICAS/i, /INSUFICIÊNCIA HEPÁTICA FULMINANTE|APÊNDICE\s*1/i, 8000],
  ["snip-hep1-fulminante.txt", hep1, /INSUFICIÊNCIA HEPÁTICA FULMINANTE/i, null, 6000],
  ["snip-hep2-cirrose.txt", hep2, /INTRODUÇÃO À CIRROSE/i, /DOENÇA HEPÁTICA ALCOÓLICA/i, 6000],
  ["snip-hep2-dha.txt", hep2, /DOENÇA HEPÁTICA ALCOÓLICA/i, /DHGNA|DOENÇA HEPÁTICA GORDUROSA/i, 6000],
  ["snip-hep2-dhgna.txt", hep2, /DOENÇA HEPÁTICA GORDUROSA NÃO ALCOÓLICA|DHGNA/i, /HEPATITE AUTOIMUNE/i, 6000],
  ["snip-hep2-hai.txt", hep2, /HEPATITE AUTOIMUNE/i, /COLANGITE BILIAR PRIMÁRIA|CBP/i, 6000],
  ["snip-hep2-cbp.txt", hep2, /COLANGITE BILIAR PRIMÁRIA/i, /DOENÇA DE WILSON/i, 5000],
  ["snip-hep2-wilson.txt", hep2, /DOENÇA DE WILSON/i, /HEMOCROMATOSE/i, 5000],
  ["snip-hep2-hemo.txt", hep2, /HEMOCROMATOSE HEREDITÁRIA/i, /HEPATOPATIA MEDICAMENTOSA|APÊNDICE\s*1/i, 5000],
  ["snip-hep2-dili.txt", hep2, /HEPATOPATIA MEDICAMENTOSA/i, null, 4500],
  ["snip-hep3-ihc.txt", hep3, /INSUFICIÊNCIA HEPÁTICA CRÔNICA/i, /HIPERTENSÃO PORTA/i, 7000],
  ["snip-hep3-htp.txt", hep3, /HIPERTENSÃO PORTA/i, /VARIZES ESOFAGOGÁSTRICAS/i, 6000],
  ["snip-hep3-varizes.txt", hep3, /VARIZES ESOFAGOGÁSTRICAS|VARIZES ESOFAGIANAS/i, /ASCITE/i, 7000],
  ["snip-hep3-ascite.txt", hep3, /\bASCITE\b/i, /TRANSPLANTE HEPÁTICO|APÊNDICE\s*1/i, 8000],
  ["snip-hep3-tx.txt", hep3, /TRANSPLANTE HEPÁTICO/i, /MANEJO CIRÚRGICO/i, 5000],
  ["snip-hep3-cirurgia-htp.txt", hep3, /MANEJO CIRÚRGICO DA HIPERTENSÃO PORTA/i, null, 4000],
  ["snip-hep4-cep.txt", hep4, /COLANGITE ESCLEROSANTE/i, /CISTOS DAS VIAS BILIARES/i, 6000],
  ["snip-hep4-cistos.txt", hep4, /CISTOS DAS VIAS BILIARES/i, /LESÃO IATROGÊNICA/i, 4000],
  ["snip-hep4-iatrogenia.txt", hep4, /LESÃO IATROGÊNICA DA VIA BILIAR/i, /ABSCESSO HEPÁTICO/i, 4000],
  ["snip-hep4-abscesso.txt", hep4, /ABSCESSO HEPÁTICO/i, null, 7000]
];

for (const [name, text, start, end, max] of jobs) {
  write(name, snip(text, start, end, max));
}

// keyword dump for Child/MELD/SBP/encefalopatia
function around(text, term, win = 400) {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return "";
  return text.slice(Math.max(0, i - 80), i + win).replace(/\s+/g, " ");
}
const keyTerms = [
  "Child-Pugh",
  "MELD",
  "encefalopatia hepática",
  "peritonite bacteriana espontânea",
  "síndrome hepatorrenal",
  "hepatopulmonar",
  "TIPS",
  "SAAG",
  "beta-bloqueador",
  "octreotide",
  "terlipressina",
  "lactulose",
  "rifaximina",
  "HBeAg",
  "anti-HBc",
  "tenofovir",
  "sofosbuvir",
  "AMA",
  "ANCA",
  "ceruloplasmina",
  "flebotomia",
  "prednisona",
  "azatioprina",
  "ácido ursodesoxicólico"
];
let dump = "";
for (const term of keyTerms) {
  const hits = [hep1, hep2, hep3, hep4]
    .map((t, i) => ({ n: "Hep" + (i + 1), s: around(t, term) }))
    .filter((x) => x.s);
  if (hits.length) {
    dump += `\n### ${term}\n`;
    for (const h of hits) dump += `[${h.n}] ${h.s}\n`;
  }
}
fs.writeFileSync(path.join(DIR, "snip-keywords.txt"), dump, "utf8");
console.log("keywords", dump.length);
