/* Gera PNGs dos esquemas e PDFs do Material de apoio */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "material.json"), "utf8"));
const outDir = path.join(root, "assets", "material", "pdf");
fs.mkdirSync(outDir, { recursive: true });

const AREA = {
  clinica: "Clinica medica",
  cirurgia: "Cirurgia",
  preventiva: "Preventiva",
  pediatria: "Pediatria",
  go: "Ginecologia e obstetricia"
};

async function ensurePng (svgRel) {
  const rel = String(svgRel || "").replace(/^\//, "");
  const svgPath = path.join(root, rel);
  if (!fs.existsSync(svgPath)) return null;
  const pngPath = svgPath.replace(/\.svg$/i, ".png");
  await sharp(svgPath).png().toFile(pngPath);
  return pngPath;
}

async function addFigure (doc, section) {
  const src = String(section.src || "");
  const png = await ensurePng(src);
  if (section.caption) {
    doc.font("Helvetica-Oblique").fontSize(10).fillColor("#4a6078")
      .text(section.caption, { width: 500 });
    doc.moveDown(0.25);
  }
  if (png) {
    const maxW = 500;
    const img = doc.openImage(png);
    const ratio = img.height / img.width;
    const w = maxW;
    const h = Math.min(240, w * ratio);
    if (doc.y + h > 740) doc.addPage();
    doc.image(png, { width: w, height: h });
    doc.moveDown(0.5);
  }
  doc.font("Helvetica").fontSize(11).fillColor("#142033");
}

async function buildPdf (item) {
  const fileOut = path.join(outDir, item.id + ".pdf");
  const doc = new PDFDocument({
    margin: 48,
    size: "A4",
    info: {
      Title: item.title,
      Author: "MedHub R1",
      Subject: "Material de apoio - " + (AREA[item.area] || item.area)
    }
  });
  const stream = fs.createWriteStream(fileOut);
  doc.pipe(stream);

  doc.fillColor("#0f8f8b").fontSize(10).text("MedHub R1 - Material de apoio");
  doc.moveDown(0.2);
  doc.fillColor("#4a6078").fontSize(10).text(AREA[item.area] || item.area);
  doc.moveDown(0.45);
  doc.fillColor("#142033").fontSize(18).font("Helvetica-Bold").text(item.title, { width: 500 });
  doc.moveDown(0.35);
  doc.font("Helvetica").fontSize(11).fillColor("#334155");
  if (item.lead) {
    doc.text(item.lead, { width: 500, lineGap: 2 });
    doc.moveDown(0.55);
  }

  for (const section of item.sections || []) {
    if (doc.y > 720) doc.addPage();

    if (section.type === "figure") {
      await addFigure(doc, section);
      continue;
    }

    if (section.title) {
      doc.moveDown(0.15);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#0a6e6a").text(section.title);
      doc.moveDown(0.2);
      doc.font("Helvetica").fontSize(11).fillColor("#142033");
    }

    if (section.type === "callout") {
      const label = section.tone === "alert" ? "Atencao" : (section.tone === "remember" ? "Lembre" : "Dica");
      doc.font("Helvetica-Bold").text(label + (section.title ? " - " + section.title : ""));
      doc.font("Helvetica").text(section.body || "", { width: 500, lineGap: 2 });
      doc.moveDown(0.4);
      continue;
    }

    if (section.type === "bullets") {
      for (const it of section.items || []) {
        doc.text("-  " + it, { width: 500, lineGap: 1 });
        doc.moveDown(0.12);
      }
      doc.moveDown(0.25);
      continue;
    }

    if (section.type === "table") {
      const headers = section.headers || [];
      const rows = section.rows || [];
      if (headers.length) {
        doc.font("Helvetica-Bold").fontSize(10).text(headers.join("  |  "), { width: 500 });
        doc.font("Helvetica").fontSize(10);
      }
      for (const row of rows) {
        doc.text(row.join("  |  "), { width: 500, lineGap: 1 });
        doc.moveDown(0.1);
      }
      doc.fontSize(11);
      doc.moveDown(0.35);
      continue;
    }

    if (section.type === "text") {
      doc.text(section.body || "", { width: 500, lineGap: 2 });
      doc.moveDown(0.35);
    }
  }

  doc.moveDown(0.7);
  doc.fontSize(9).fillColor("#64748b").text(
    data.disclaimer || "Material de estudo para residencia (R1).",
    { width: 500 }
  );
  doc.moveDown(0.25);
  doc.text("www.medhubr1.com.br - MedHub R1", { width: 500 });

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  return fileOut;
}

(async () => {
  // Normaliza src absolutos no JSON em memoria
  for (const item of Object.values(data.items || {})) {
    for (const section of item.sections || []) {
      if (section.type === "figure" && section.src && !section.src.startsWith("/")) {
        section.src = "/" + section.src.replace(/^\.\//, "");
      }
    }
    const out = await buildPdf(item);
    console.log("OK", path.relative(root, out));
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
