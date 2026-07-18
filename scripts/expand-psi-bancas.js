const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-psi-substancias.json",
    "revisao-psi-humor.json",
    "revisao-psi-psicose.json",
    "revisao-psi-ansiedade.json",
    "revisao-psi-organicos.json",
    "revisao-psi-alimentares.json",
    "revisao-psi-basico.json",
    "stats-psiquiatria-geral.json"
  ],
  "Psiquiatria"
);
