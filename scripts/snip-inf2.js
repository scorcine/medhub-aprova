const fs = require("fs");
const t = fs.readFileSync("data/_extract_infecto/Inf2-full.txt", "utf8");
function c(s) {
  return s
    .replace(/\0/g, "")
    .replace(/t\.me\/\S+/g, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
const keys = [
  "CURB-65",
  "CURB",
  "PSI",
  "PORT",
  "ambulatorial",
  "betalactâmico antipseudomonas",
  "macrolídeo",
  "fluoroquinolona",
  "amoxicilina",
  "claritromicina",
  "levofloxacino",
  "moxifloxacino",
  "ceftriaxona",
  "oseltamivir",
  "abscesso pulmonar",
  "pneumonia aspirativa",
  "clindamicina",
  "PACS",
  "lobo pesado",
  "pneumatocele",
  "antígeno urinário",
  "estabilidade clínica",
  "5 a 7 dias",
  "Pseudomonas",
  "MRSA",
  "vancomicina",
  "linezolida",
  "piperacilina",
  "carbapenêmico",
  "aminoglicosídeo",
  "penicilina G",
  "ampicilina",
  "cefazolina",
  "oxacilina",
  "metronidazol",
  "doxiciclina",
  "azitromicina",
  "critérios maiores",
  "critérios menores",
  "IDSA",
  "SBPT"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n##", k, "@" + i);
  if (i < 0) continue;
  console.log(c(t.slice(Math.max(0, i - 80), i + 420)));
}
