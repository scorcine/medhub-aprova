const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-cardio-scc.json",
    "revisao-cardio-sca.json",
    "revisao-cardio-pericardio.json",
    "revisao-cardio-icc.json",
    "revisao-cardio-has.json",
    "revisao-cardio-valvas.json",
    "revisao-cardio-miopatias.json",
    "revisao-cardio-fa.json",
    "revisao-cardio-bradi.json",
    "revisao-cardio-pcr.json",
    "stats-cardiologia-geral.json"
  ],
  "Cardiologia"
);
