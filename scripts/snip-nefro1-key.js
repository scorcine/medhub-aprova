const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro1-full.txt", "utf8");
function clean(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function snip(label, needle, n = 1500) {
  const idx =
    typeof needle === "number"
      ? needle
      : t
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .indexOf(
            String(needle)
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
          );
  console.log("\n## " + label + " @" + idx);
  if (idx < 0) {
    console.log("MISS");
    return;
  }
  console.log(clean(t.slice(idx, idx + n)).slice(0, 1450));
}
[
  ["nefritica", "SÍNDROME NEFRÍTICA"],
  ["GNPE", "PÓS-ESTREPTOCÓCICA"],
  ["complemento", "hipocomplementemia"],
  ["nefrotica", "SÍNDROME NEFRÓTICA"],
  ["complicacoes neo", "trombose"],
  ["lesoes minimas", "mínimas"],
  ["GEFS", "SEGMENTAR E FOCAL"],
  ["membranosa", "MEMBRANOSA"],
  ["Berger", "BERGER"],
  ["IgA", "nefropatia por IgA"],
  ["GNRP", "RAPIDAMENTE PROGRESSIVA"],
  ["crescentes", "crescentes"],
  ["lupus", "nefrite lúpica"],
  ["diabetica", "NEFROPATIA DIABÉTICA"],
  ["Kimmelstiel", "Kimmelstiel"],
  ["TFG", "taxa de filtração"]
].forEach(([a, b]) => snip(a, b));
