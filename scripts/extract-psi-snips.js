const fs = require("fs");
const t = fs.readFileSync("data/_extract_psi/Psi-full.txt", "utf8");
function clean(s) {
  return s
    .replace(/t\.me\/medicinalivre2/g, "")
    .replace(/proibida venda/g, "")
    .replace(/-- \d+ of 81 --/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const cuts = [
  ["delirium", t.indexOf("DELIRIUM"), 2200],
  ["demencia", t.indexOf("DEMÊNCIA"), 1800],
  ["alcool-dep", t.indexOf("DEPENDÊNCIA E ABUSO DE ÁLCOOL"), 2200],
  ["alcool-abst", t.indexOf("SÍNDROME DE ABSTINÊNCIA"), 2500],
  ["alcool-tx", t.indexOf("MOTIVAÇÃO"), 2000],
  ["cocaina", t.indexOf("TRANSTORNOS RELACIONADOS À COCAÍNA"), 1800],
  ["nicotina", t.indexOf("TRANSTORNOS RELACIONADOS À NICOTINA"), 1500],
  ["esquizo", t.indexOf("ESQUIZOFRENIA\tESQUIZOFRENIA"), 2800],
  ["antipsic", t.indexOf("ANTIPSICÓTICOS"), 2200],
  ["humor", t.indexOf("TRANSTORNOS DO HUMOR\tTRANSTORNOS DO HUMOR"), 2500],
  ["depress", t.indexOf("TRANSTORNOS DEPRESSIVOS"), 2500],
  ["bipolar", t.indexOf("TRANSTORNO BIPOLAR"), 2200],
  ["litio", t.indexOf("LÍTIO\tLÍTIO"), 1800],
  ["ansiedade", t.indexOf("TRANSTORNOS DE ANSIEDADE"), 2500],
  ["alimentares", t.indexOf("TRANSTORNOS ALIMENTARES"), 2200]
];
let out = "";
for (const [lab, i, len] of cuts) {
  const start = i < 0 ? 0 : i;
  out += "\n\n#### " + lab + " @" + i + "\n" + clean(t.slice(start, start + len)).slice(0, 2000);
}
fs.writeFileSync("data/_extract_psi/psi-snippets.txt", out);
console.log("wrote", out.length);
