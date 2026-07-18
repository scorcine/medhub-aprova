const fs = require("fs");
const t = fs.readFileSync("data/_extract_pneumo/Pneumo1-full.txt", "utf8");
function clean(s) {
  return s
    .replace(/t\.me\/medicinalivre2/g, "")
    .replace(/proibida venda/g, "")
    .replace(/-- \d+ of 205 --/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const cuts = [
  ["funcao", t.indexOf("FUNÇÃO RESPIRATÓRIA"), 2500],
  ["gasometria", t.indexOf("GASOMETRIA ARTERIAL"), 2200],
  ["espirometria", t.indexOf("ESPIROMETRIA"), 2200],
  ["asma", t.indexOf("CAPÍTULO 2"), 3500],
  ["asma-tx", t.indexOf("GINA"), 2500],
  ["dpoc", t.indexOf("DOENÇA PULMONAR OBSTRUTIVA"), 3000],
  ["dpoc-gold", t.indexOf("GOLD"), 2000],
  ["tep", t.indexOf("EMBOLIA PULMONAR\tEMBOLIA PULMONAR"), 3000],
  ["tep2", t.indexOf("Wells") > 0 ? t.indexOf("Wells") : t.indexOf("WELLS"), 2000],
  ["cancer", t.indexOf("CÂNCER DE PULMÃO\tCÂNCER DE PULMÃO"), 3000],
  ["pancoast", t.indexOf("PANCOAST"), 1500],
  ["paraneo", t.indexOf("PARANEOPLÁSICAS"), 2000],
  ["sdra", t.indexOf("SDRA — DEFINIÇÃO") > 0 ? t.indexOf("SDRA — DEFINIÇÃO") : t.indexOf("SÍNDROME DO"), 2500],
  ["vm", t.indexOf("NOÇÕES DE VENTILAÇÃO"), 2500],
  ["derrame", t.indexOf("APÊNDICE 2"), 3000],
  ["light", t.indexOf("CRITÉRIOS DE LIGHT") > 0 ? t.indexOf("CRITÉRIOS DE LIGHT") : t.indexOf("Light"), 1800],
  ["intersticial", t.indexOf("APÊNDICE 3"), 2500],
  ["sarcoidose", t.indexOf("APÊNDICE 4"), 2500]
];
let out = "";
for (const [lab, i, len] of cuts) {
  const start = i < 0 ? 0 : i;
  out += "\n\n#### " + lab + " @" + i + "\n" + clean(t.slice(start, start + len)).slice(0, 2200);
}
fs.writeFileSync("data/_extract_pneumo/pneumo1-snippets.txt", out);
console.log("wrote", out.length);
