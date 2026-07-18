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
function snip(label, needle, n = 1500) {
  const idx = typeof needle === "number" ? needle : t.toLowerCase().indexOf(needle.toLowerCase());
  console.log("\n## " + label + " @" + idx);
  if (idx < 0) {
    console.log("MISS");
    return;
  }
  console.log(clean(t.slice(idx, idx + n)).slice(0, 1500));
}
[
  ["TRM-TB", "TESTE RÁPIDO MOLECULAR"],
  ["efeitos", "EFEITOS COLATERAIS"],
  ["rifampicina efeito", "rifampicina"],
  ["ILTB tx", "TRATAMENTO DA ILTB"],
  ["PT 5mm", "toda PT ≥ 5"],
  ["IGRA how", "COMO FUNCIONA O ENSAIO"],
  ["BCG", "VACINA BCG"],
  ["AIDS TB", "TB NA AIDS"],
  ["ADA pleural", "ADA"],
  ["PCM", "PARACOCCIDIOIDOMICOSE"],
  ["histo", "HISTOPLASMOSE"],
  ["cripto", "CRYPTOCOC"],
  ["aspergilose", "ASPERGILOSE"],
  ["SR", "sintomático respiratório"],
  ["TDO", "TRATAMENTO DIRETAMENTE OBSERVADO"],
  ["falencia", "FALÊNCIA TERAPÊUTICA"],
  ["TB-RR", "ESQUEMA PARA TB-RR"],
  ["RN contactante", "RECÉM-NASCIDO CONTACTANTE"]
].forEach(([a, b]) => snip(a, b));
