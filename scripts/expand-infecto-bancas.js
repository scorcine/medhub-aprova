const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-infc-protozoarios.json",
    "revisao-infc-helmintos.json",
    "revisao-infc-cestoides.json",
    "revisao-infc-esquisto.json",
    "revisao-infc-malaria.json",
    "revisao-infc-dengue.json",
    "revisao-infc-arbovirus.json",
    "revisao-infc-hiv-oi.json",
    "revisao-infc-hiv-snc.json",
    "revisao-infc-hiv-neoplasias.json",
    "revisao-infc-pac-clinica.json",
    "revisao-infc-pac-conduta.json",
    "revisao-infc-itu.json",
    "revisao-infc-pele.json",
    "revisao-infc-osteo.json",
    "revisao-infc-abscesso.json",
    "revisao-infc-antibioticos.json",
    "revisao-infc-tropicais.json",
    "stats-infectologia-geral.json"
  ],
  "Infectologia"
);
