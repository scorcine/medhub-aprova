/**
 * Extrai texto dos PDFs Revalida (INEP).
 * Arquivos: YYYY_1.pdf, YYYY_2.pdf em D:/MedHub R1/Provas/Revalida
 */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const PDF_DIR = "D:/MedHub R1/Provas/Revalida";
const OUT_DIR = path.join(__dirname, "revalida-extract");

function listPdfs () {
  return fs.readdirSync(PDF_DIR)
    .filter((f) => /\.pdf$/i.test(f))
    .sort();
}

async function extractOne (fileName) {
  const file = path.join(PDF_DIR, fileName);
  const id = fileName.replace(/\.pdf$/i, "");
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
    const outPath = path.join(OUT_DIR, id + ".txt");
    const header =
      "# Extract: revalida-" + id + "\n" +
      "# Source: " + file + "\n" +
      "# Pages: " + pageCount + "\n" +
      "# Chars: " + text.length + "\n\n";
    fs.writeFileSync(outPath, header + text, "utf8");
    console.log("OK", id, "pages", pageCount, "chars", text.length);
    return { id, pageCount, chars: text.length };
  } finally {
    await parser.destroy();
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = listPdfs();
  console.log("PDFs:", files.join(", "));
  for (const f of files) {
    await extractOne(f);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
