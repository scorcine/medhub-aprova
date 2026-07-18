const fs = require("fs");
const t = fs.readFileSync("data/_extract_infecto/Inf1-full.txt", "utf8");
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
  "AMEBÍASE",
  "metronidazol",
  "GIARDÍASE",
  "ASCARIDÍASE",
  "Loeffler",
  "ANCILOSTOMÍASE",
  "ESTRONGILOIDÍASE",
  "hiperinfecção",
  "ivermectina",
  "ENTEROBÍASE",
  "mebendazol",
  "albendazol",
  "TENÍASE",
  "cisticercose",
  "TOXOCARÍASE",
  "ESQUISTOSSOMOSE",
  "praziquantel",
  "Katayama",
  "hepatoesplênica",
  "Schistosoma",
  "diloxanida",
  "tinidazol",
  "nitazoxanida",
  "piperazina",
  "pirantel",
  "niclosamida",
  "TRICURÍASE",
  "HIMENOLEPÍASE"
];
for (const k of keys) {
  const i = t.toLowerCase().indexOf(k.toLowerCase());
  console.log("\n## " + k + " @" + i);
  if (i >= 0) console.log(c(t.slice(Math.max(0, i - 40), i + 1100)).slice(0, 950));
}
