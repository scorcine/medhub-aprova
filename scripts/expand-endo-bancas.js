const { expandFiles } = require("./lib/expand-bancas-core");

expandFiles(
  [
    "revisao-endo-tireoide.json",
    "revisao-endo-hipotireo.json",
    "revisao-endo-nodulos.json",
    "revisao-endo-adrenal.json",
    "revisao-endo-paratireoide.json",
    "revisao-endo-hipofise.json",
    "revisao-endo-dm.json",
    "revisao-endo-dm-complicacoes.json",
    "revisao-endo-urgencias-dm.json",
    "revisao-endo-obesidade.json",
    "stats-endocrinologia-geral.json"
  ],
  "Endocrinologia"
);
