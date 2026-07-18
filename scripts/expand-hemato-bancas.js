const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-hema-anemias.json",
    "revisao-hema-megaloblastica.json",
    "revisao-hema-hemoliticas.json",
    "revisao-hema-smd.json",
    "revisao-hema-leucemias.json",
    "revisao-hema-nmp.json",
    "revisao-hema-linfomas.json",
    "revisao-hema-mieloma.json",
    "revisao-hema-hemostasia.json",
    "revisao-hema-plaquetas.json",
    "revisao-hema-coagulacao.json",
    "stats-hematologia-geral.json"
  ],
  "Hematologia"
);
