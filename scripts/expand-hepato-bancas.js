const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-hep-basico.json",
    "revisao-hep-virais-agudas.json",
    "revisao-hep-virais-cronicas.json",
    "revisao-hep-fulminante.json",
    "revisao-hep-esteatose.json",
    "revisao-hep-autoimune.json",
    "revisao-hep-metabolicas.json",
    "revisao-hep-descompensacao.json",
    "revisao-hep-htp-varizes.json",
    "revisao-hep-transplante.json",
    "revisao-hep-biliar.json",
    "stats-hepatologia-geral.json"
  ],
  "Hepatologia"
);
