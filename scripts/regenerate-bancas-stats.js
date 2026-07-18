/**
 * Regenera prioridades distintas por banca em todos os temas.
 */
const scripts = [
  "build-clinica-stats.js",
  "expand-cardio-bancas.js",
  "expand-prev-bancas.js",
  "expand-endo-bancas.js",
  "expand-hemato-bancas.js",
  "expand-hepato-bancas.js",
  "expand-infecto-bancas.js",
  "expand-nefro-bancas.js",
  "expand-neuro-bancas.js",
  "expand-psi-bancas.js",
  "expand-reu-bancas.js",
  "expand-pneumo-bancas.js",
  "expand-cir-bancas.js"
];

for (const s of scripts) {
  console.log("\n===", s, "===");
  require("./" + s);
}
