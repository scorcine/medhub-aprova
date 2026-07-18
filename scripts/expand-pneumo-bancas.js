const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-pnm-asma.json",
    "revisao-pnm-dpoc.json",
    "revisao-pnm-tep.json",
    "revisao-pnm-intensiva.json",
    "revisao-pnm-derrame.json",
    "revisao-pnm-cancer.json",
    "revisao-pnm-basico.json",
    "revisao-pnm-intersticial.json",
    "revisao-pnm-tb.json",
    "revisao-pnm-tb-extra.json",
    "revisao-pnm-micoses.json",
    "stats-pneumologia-geral.json"
  ],
  "Pneumologia"
);
