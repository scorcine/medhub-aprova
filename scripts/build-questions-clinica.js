/**
 * Gera data/questions-clinica.json a partir de scripts/_parts/cli-*.json
 * Uso: node scripts/build-questions-clinica.js
 */
const { spawnSync } = require("child_process");
const path = require("path");

function run (file) {
  const r = spawnSync(process.execPath, [path.join(__dirname, file)], {
    stdio: "inherit"
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

run("merge-clinica-parts.js");
