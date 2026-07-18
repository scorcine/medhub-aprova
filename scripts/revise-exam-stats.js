/**
 * Revisa estatísticas de todas as provas:
 * - reforça Geral Brasil (ciclo 2024–2026)
 * - gera/atualiza bancas distintas (inclui Santa Casa, Sírio, IAMSPE, PUC-SP, CONSESP)
 * - reaplica recorte por ano 2024/2025/2026
 */
const fs = require("fs");
const path = require("path");
const { expandProfiles } = require("./lib/expand-bancas-core");

const DATA = path.join(__dirname, "..", "data");

function specialtyFromFile(file, data) {
  if (file.includes("cardio")) return "Cardiologia";
  if (file.includes("prev")) return "Preventiva";
  if (file.includes("clinica")) return "Clínica médica";
  if (file.includes("pediatr")) return "Pediatria";
  if (file.includes("cir")) return "Cirurgia";
  if (file.includes("gin") || file.includes("ginec")) return "Ginecologia";
  if (file.includes("obs") || file.includes("obstet")) return "Obstetrícia";
  if (file.includes("endo")) return "Endocrinologia";
  if (file.includes("hema")) return "Hematologia";
  if (file.includes("hep")) return "Hepatologia";
  if (file.includes("infc") || file.includes("infect")) return "Infectologia";
  if (file.includes("nef")) return "Nefrologia";
  if (file.includes("neu")) return "Neurologia";
  if (file.includes("pnm") || file.includes("pneumo")) return "Pneumologia";
  if (file.includes("psi")) return "Psiquiatria";
  if (file.includes("reu")) return "Reumatologia";
  if (data.module) return String(data.module);
  return "R1";
}

function reviseFile(file) {
  const full = path.join(DATA, file);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  if (!Array.isArray(data.profiles) || !data.profiles.length) return false;

  const label = specialtyFromFile(file, data);
  data.profiles = expandProfiles(data.profiles, data.title || file, label);
  data.yearLabel = "2024–2026";
  data.years = ["2024", "2025", "2026"];
  if (!data.note) {
    data.note = "Síntese e estimativas do ciclo 2024–2026. Escolha a prova para estudar o recorte certo.";
  } else if (!/2024|2025|2026/.test(data.note)) {
    data.note += " Recorte principal: provas 2024–2026.";
  } else if (!/Escolha a prova|prova escolhida|banca escolhida/i.test(data.note)) {
    data.note += " Escolha a prova no seletor para alinhar o estudo ao padrão dela.";
  }

  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  return data.profiles.length;
}

const files = fs.readdirSync(DATA).filter(
  (f) =>
    (f.startsWith("stats-") && f.endsWith("-geral.json")) ||
    (f.startsWith("revisao-") && f.endsWith(".json"))
);

let n = 0;
for (const f of files) {
  const count = reviseFile(f);
  if (count) {
    console.log(f, "→", count, "bancas");
    n += 1;
  }
}
console.log("revised", n, "files");
console.log("enriching years…");
require("./enrich-stats-years.js");
