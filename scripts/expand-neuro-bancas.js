const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-neu-avc.json",
    "revisao-neu-epilepsia.json",
    "revisao-neu-cefaleia.json",
    "revisao-neu-coma.json",
    "revisao-neu-neuromuscular.json",
    "revisao-neu-demencia.json",
    "revisao-neu-em.json",
    "stats-neurologia-geral.json"
  ],
  "Neurologia"
);
