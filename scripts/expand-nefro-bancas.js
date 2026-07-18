const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-nef-basico.json",
    "revisao-nef-nefritica.json",
    "revisao-nef-nefrotica.json",
    "revisao-nef-especificas.json",
    "revisao-nef-nta.json",
    "revisao-nef-nia-nic.json",
    "revisao-nef-vascular.json",
    "revisao-nef-tubulares.json",
    "revisao-nef-solucoes.json",
    "revisao-nef-ira.json",
    "revisao-nef-litiase.json",
    "revisao-nef-drc.json",
    "revisao-nef-prostata.json",
    "revisao-nef-uro-extra.json",
    "stats-nefrologia-geral.json"
  ],
  "Nefrologia"
);
