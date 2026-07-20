/**
 * Gera data/questions-pediatria.json a partir de scripts/_parts/ped-part*.json
 * (estilo SUS-SP: vinheta densa, 5 alternativas, sem siglas opacas como IVAS).
 *
 * Uso: node scripts/build-questions-pediatria.js
 */
const { spawnSync } = require("child_process");
const path = require("path");

function run (file) {
  const r = spawnSync(process.execPath, [path.join(__dirname, file)], {
    stdio: "inherit"
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

run("densify-pediatria-parts.js");
run("merge-pediatria-parts.js");
