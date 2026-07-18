const fs = require("fs");
const t = fs.readFileSync("data/_extract_pneumo/Pneumo2-full.txt", "utf8");
function clean(s) {
  return s
    .replace(/t\.me\/medicinalivre2/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function snip(label, reOrIdx, n = 1600) {
  let idx = typeof reOrIdx === "number" ? reOrIdx : -1;
  if (typeof reOrIdx !== "number") {
    const m = t.match(reOrIdx);
    idx = m ? t.indexOf(m[0]) : -1;
  }
  console.log("\n## " + label + " @" + idx);
  if (idx < 0) {
    console.log("MISS");
    return;
  }
  console.log(clean(t.slice(idx, idx + n)).slice(0, 1550));
}
const U = t.toLowerCase();
console.log("len", t.length);
console.log("pages", (t.match(/-- \d+ of \d+ --/g) || []).slice(-3));

const keys = [
  ["sumario", /SUMÁRIO|SUMARIO/i],
  ["tuberc", /TUBERCULOSE/i],
  ["RHZE", /RHZE|esquema b[aá]sico/i],
  ["baciloscopia", /baciloscopia/i],
  ["cultura BK", /cultura.*BK|Löwenstein|Lowenstein/i],
  ["IGRA", /IGRA|interferon/i],
  ["PPD", /PPD|prova tubercul[ií]nica/i],
  ["latente", /infec[cç][aã]o latente|ILTB/i],
  ["MDR", /multirresistente|MDR-TB|XDR/i],
  ["pneumotorax", /PNEUMOT[OÓ]RAX/i],
  ["bronquiectasia", /BRONQUIECTAS/i],
  ["abscesso", /abscesso pulmonar/i],
  ["HP", /hipertens[aã]o pulmonar/i],
  ["SAHOS", /apneia|SAHOS|Pickwick/i],
  ["pneumonia", /PNEUMONIA COMUNIT/i],
  ["nosocomial", /pneumonia hospitalar|PAV|NAV/i]
];
for (const [label, re] of keys) snip(label, re, 1400);

// chapter-like headings
const re = /(?:CAP[IÍ]TULO|AP[EÊ]NDICE|BLOCO)\s*[.\d]*/gi;
let m;
const seen = new Set();
while ((m = re.exec(t))) {
  const s = clean(t.slice(m.index, m.index + 120));
  if (seen.has(s.slice(0, 50))) continue;
  seen.add(s.slice(0, 50));
  console.log("HEAD", m.index, s.slice(0, 100));
}
