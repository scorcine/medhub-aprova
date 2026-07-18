const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-reu-ar.json",
    "revisao-reu-aij.json",
    "revisao-reu-spa.json",
    "revisao-reu-oa.json",
    "revisao-reu-cristais.json",
    "revisao-reu-fr.json",
    "revisao-reu-infecciosa.json",
    "revisao-reu-extras2.json",
    "revisao-reu-les.json",
    "revisao-reu-saf.json",
    "revisao-reu-es.json",
    "revisao-reu-outras-colag.json",
    "revisao-reu-vasculites.json",
    "revisao-reu-amiloidose.json",
    "stats-reumatologia-geral.json"
  ],
  "Reumatologia"
);
