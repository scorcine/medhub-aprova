/** Snip Car1–3 chapters for flashcard deepening. */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data/_extract_cardio");

function clean(s) {
  return s
    .replace(/t\.me\/\S+/g, "")
    .replace(/proibida venda[^\n]*/gi, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function snipApo(base, cuts) {
  const t = fs.readFileSync(path.join(DIR, base + "-full.txt"), "utf8");
  const outDir = path.join(DIR, "snips-" + base.toLowerCase());
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, a, b] of cuts) {
    const i = t.search(a);
    if (i < 0) {
      console.log(base, "MISS", name);
      continue;
    }
    let j = t.length;
    if (b) {
      const m = t.slice(i + 20).search(b);
      j = m < 0 ? t.length : i + 20 + m;
    }
    const chunk = clean(t.slice(i, j));
    fs.writeFileSync(path.join(outDir, name + ".txt"), chunk, "utf8");
    console.log(base, name, chunk.length);
  }
}

snipApo("Car1", [
  ["scc", /CAPÍTULO\s*1[\s\S]{0,80}SÍNDROME CORONARIANA CRÔNICA/i, /CAPÍTULO\s*2/i],
  ["sca-sem-sst", /CAPÍTULO\s*2[\s\S]{0,80}SEM SUPRADESNÍVEL/i, /CAPÍTULO\s*3/i],
  ["sca-com-sst", /CAPÍTULO\s*3[\s\S]{0,80}COM SUPRADESNÍVEL/i, /APÊNDICE\s*1/i],
  ["aterosclerose", /APÊNDICE\s*1[\s\S]{0,40}ATEROSCLEROSE/i, /APÊNDICE\s*2/i],
  ["iam-complicacoes", /APÊNDICE\s*2[\s\S]{0,40}COMPLICAÇÕES DO IAM/i, /APÊNDICE\s*3/i],
  ["crm", /APÊNDICE\s*3[\s\S]{0,40}REVASCULARIZAÇÃO/i, /APÊNDICE\s*4/i],
  ["pericardio", /APÊNDICE\s*4[\s\S]{0,40}PERICARDIOPATIAS/i, null]
]);

snipApo("Car2", [
  ["icc", /CAPÍTULO\s*1[\s\S]{0,80}INSUFICIÊNCIA CARDÍACA/i, /CAPÍTULO\s*2/i],
  ["has", /CAPÍTULO\s*2[\s\S]{0,80}HIPERTENSÃO ARTERIAL/i, /CAPÍTULO\s*3/i],
  ["valvas", /CAPÍTULO\s*3[\s\S]{0,80}VALVOPATIAS/i, /APÊNDICE\s*1/i],
  ["semiologia", /APÊNDICE\s*1[\s\S]{0,40}SEMIOLOGIA/i, /APÊNDICE\s*2/i],
  ["cardiomiopatias", /APÊNDICE\s*2[\s\S]{0,40}CARDIOMIOPATIAS/i, /APÊNDICE\s*3/i],
  ["hp", /APÊNDICE\s*3[\s\S]{0,40}HIPERTENSÃO PULMONAR/i, /APÊNDICE\s*4/i],
  ["tx", /APÊNDICE\s*4[\s\S]{0,40}TRANSPLANTE/i, null]
]);

snipApo("Car3", [
  ["taqui", /CAPÍTULO\s*1[\s\S]{0,80}TAQUIARRITMIAS/i, /CAP\.\s*2|CAPÍTULO\s*2|BRADIARRITMIAS/i],
  ["bradi", /BRADIARRITMIAS/i, /PARADA|PCR|CAP\.\s*3/i],
  ["pcr", /PARADA[\s\S]{0,40}CARDIORRESPIRATÓRIA|PCR/i, /APÊNDICE\s*1/i],
  ["mecanismo", /APÊNDICE\s*1[\s\S]{0,40}MECANISMO/i, /APÊNDICE\s*2/i],
  ["antiarrhythmicos", /APÊNDICE\s*2[\s\S]{0,40}ANTIARRÍTMICAS/i, /APÊNDICE\s*3/i],
  ["extrassístoles", /APÊNDICE\s*3[\s\S]{0,40}EXTRASSÍSTOLES/i, /APÊNDICE\s*4/i],
  ["bloqueios-mp", /APÊNDICE\s*4[\s\S]{0,40}BLOQUEIOS/i, null]
]);
