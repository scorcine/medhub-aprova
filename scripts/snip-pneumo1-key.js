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
function snip(label, idx, n = 1800) {
  console.log("\n## " + label + " @" + idx);
  if (idx < 0) {
    console.log("MISS");
    return;
  }
  console.log(clean(t.slice(idx, idx + n)).slice(0, 1700));
}
snip("Wells TEP", t.indexOf("Escore de Wells: Probabilidade de TEP"));
snip("mMRC", t.indexOf("mMRC"));
snip("GOLD ABE", t.indexOf("grupo A") > 0 ? t.toLowerCase().indexOf("grupos a") : t.indexOf("Grupo A"));
snip("Pancoast", t.toLowerCase().indexOf("pancoast"));
snip("paraneo full", t.indexOf("SÍNDROMES PARANEOPLÁSICAS"));
snip("VNI", t.indexOf("VENTILAÇÃO NÃO"));
snip("asma farmaco", t.indexOf("FARMACOLOGIA"));
snip("exacerbacao asma", t.toLowerCase().indexOf("exacerbação"));
snip("light full", t.indexOf("Critérios de Light"));
snip("intubacao", t.indexOf("Indicações de Intubação"));
