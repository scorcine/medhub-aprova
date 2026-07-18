const fs = require("fs");
const t = fs.readFileSync("data/_extract_neuro/Neurologia-full.txt", "utf8");
function clean(s) {
  return s
    .replace(/t\.me\/medicinalivre2/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function snip(label, needle, n = 1600) {
  const idx = typeof needle === "number" ? needle : t.toLowerCase().indexOf(String(needle).toLowerCase());
  console.log("\n## " + label + " @" + idx);
  if (idx < 0) {
    console.log("MISS");
    return;
  }
  console.log(clean(t.slice(idx, idx + n)).slice(0, 1500));
}
[
  ["trombolise", "TROMBOLÍTICO"],
  ["janela", "4,5"],
  ["contra trombo", "contraindica"],
  ["endovascular", "TERAPIA ENDOVASCULAR"],
  ["AIT", "ATAQUE ISQUÊMICO TRANSITÓRIO"],
  ["HSA", "HEMORRAGIA SUBARACNOIDE"],
  ["Hunt", "Hunt-Hess"],
  ["enxaqueca tx", "profilático"],
  ["salvas", "Cefaleia em salvas"],
  ["status", "status epilepticus"],
  ["BZD crise", "benzodiazep"],
  ["ausencia", "AUSÊNCIA"],
  ["EMJ", "MIOCLÔNICA JUVENIL"],
  ["Alzheimer", "DOENÇA DE ALZHEIMER"],
  ["Parkinson", "DOENÇA DE PARKINSON"],
  ["HIC", "HIPERTENSÃO INTRACRANIANA"],
  ["Glasgow", "Glasgow"],
  ["manitol", "manitol"],
  ["EM", "ESCLEROSE MÚLTIPLA"],
  ["MG", "MIASTENIA"],
  ["Guillain", "GUILLAIN"],
  ["ELA", "ESCLEROSE LATERAL"]
].forEach(([a, b]) => snip(a, b));
