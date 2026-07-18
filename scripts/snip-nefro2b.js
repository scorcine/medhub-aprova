const fs = require("fs");
const t = fs.readFileSync("data/_extract_nefro/Nefro2-full.txt", "utf8");
function c(s) {
  return s.replace(/\0/g, "").replace(/t\.me\/\S+/g, "").replace(/-- \d+ of \d+ --/g, "").replace(/proibida venda/gi, "").replace(/\s+/g, " ").trim();
}
const keys = [
  "FENa",
  "fração de excreção",
  "eosinofilúria",
  "triângulo",
  "betalactâmicos",
  "ibuprofeno",
  "necrose de papila",
  "falciforme",
  "ânion-gap urinário",
  "pH urinário",
  "tipo IV",
  "Bartter",
  "Gitelman",
  "Liddle",
  "displasia fibromuscular",
  "colar de contas",
  "IECA",
  "bilateral",
  "ateroembolismo",
  "livedo",
  "trombose de veia renal",
  "oclusão arterial",
  "CK",
  "mioglobinúria",
  "alcalinização",
  "aminoglicosídeo",
  "não oligúrica"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 40), i + 950)).slice(0, 880));
}
