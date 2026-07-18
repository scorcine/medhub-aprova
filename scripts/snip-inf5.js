const fs = require("fs");
const t = fs.readFileSync("data/_extract_infecto/Inf5-full.txt", "utf8");
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
  "sinais de alarme",
  "dengue grave",
  "Halstead",
  "NS1",
  "fase crítica",
  "hematócrito",
  "Aedes aegypti",
  "chikungunya",
  "artralgia",
  "zika",
  "microcefalia",
  "Guillain",
  "febre amarela",
  "vacina 17D",
  "leptospirose",
  "Weil",
  "penicilina",
  "doxiciclina",
  "leishmaniose",
  "calazar",
  "glucantime",
  "anfotericina",
  "malária",
  "Plasmodium falciparum",
  "vivax",
  "primaquina",
  "cloroquina",
  "artesunato",
  "Anopheles",
  "febre maculosa",
  "Rickettsia",
  "tifoide",
  "rosa",
  "covid",
  "mpox",
  "ebola",
  "sorotipo",
  "choque",
  "plaquetas"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n##", k, "@" + i);
  if (i < 0) continue;
  console.log(c(t.slice(Math.max(0, i - 40), i + 420)));
}
