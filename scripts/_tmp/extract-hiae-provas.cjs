/**
 * Extrai texto completo dos PDFs HIAE / Einstein (2021–2026).
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const PDF_DIR = "D:/MedHub R1/Provas/HIAE";
const OUT_DIR = path.join(__dirname, "hiae-extract");

async function extractOne (year) {
  const file = path.join(PDF_DIR, year + ".pdf");
  if (!fs.existsSync(file)) {
    console.warn("Missing:", file);
    return null;
  }
  const buf = fs.readFileSync(file);
  const parser = new PDFParse({ data: buf });
  try {
    const result = await parser.getText();
    const pageCount = result.pages?.length || 0;
    let text = "";
    if (result.pages && result.pages.length) {
      text = result.pages.map((p) => p.text || "").join("\n\n").trim();
    }
    if (!text && result.text) text = String(result.text).trim();
    const outPath = path.join(OUT_DIR, year + ".txt");
    const header =
      "# Extract: hiae-" + year + "\n" +
      "# Source: " + file + "\n" +
      "# Pages: " + pageCount + "\n" +
      "# Chars: " + text.length + "\n\n";
    fs.writeFileSync(outPath, header + text, "utf8");
    console.log("OK", year, "pages", pageCount, "chars", text.length);
    return { year, pageCount, chars: text.length };
  } finally {
    await parser.destroy();
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const year of YEARS) {
    await extractOne(year);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
