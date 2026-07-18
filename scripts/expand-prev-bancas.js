const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-prev-sus.json",
    "revisao-prev-epidemiologia.json",
    "revisao-prev-vigilancia.json",
    "revisao-prev-indicadores.json",
    "stats-preventiva-geral.json"
  ],
  "Preventiva"
);
