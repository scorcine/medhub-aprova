const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-cir-trauma.json",
    "revisao-cir-abdome-agudo.json",
    "revisao-cir-perioperatorio.json",
    "revisao-cir-infantil.json",
    "revisao-cir-vascular.json",
    "revisao-cir-ad.json",
    "revisao-cir-especialidades.json",
    "revisao-cir-torax.json",
    "revisao-cir-urologia.json",
    "revisao-cir-extras.json",
    "revisao-cir-r1.json",
    "revisao-cir-lacunas.json",
    "stats-cirurgia-geral.json"
  ],
  "Cirurgia"
);
