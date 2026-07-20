/**
 * Extract outline and/or page-range text from a PDF (for MedHub R1 RAG helpers).
 * Usage:
 *   node scripts/extract-clinica-ref.js "<pdf-path>" [--outline] [--pages 1-80] [--out file.txt]
 */
const fs = require("fs");
const path = require("path");

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("--help")) {
    console.log(`Usage: node scripts/extract-clinica-ref.js "<pdf-path>" [--outline] [--pages N-M] [--out file]`);
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const pdfPath = args[0];
  const wantOutline = args.includes("--outline");
  const pagesIdx = args.indexOf("--pages");
  const outIdx = args.indexOf("--out");
  const pagesSpec = pagesIdx >= 0 ? args[pagesIdx + 1] : null;
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

  if (!fs.existsSync(pdfPath)) {
    console.error("PDF not found:", pdfPath);
    process.exit(1);
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const result = {
    path: pdfPath,
    pages: doc.numPages,
    outline: null,
    text: null,
  };

  if (wantOutline || !pagesSpec) {
    const outline = await doc.getOutline();
    result.outline = flattenOutline(outline || [], 0);
  }

  if (pagesSpec) {
    const m = /^(\d+)-(\d+)$/.exec(pagesSpec);
    if (!m) {
      console.error("Invalid --pages, use N-M");
      process.exit(1);
    }
    let start = Math.max(1, parseInt(m[1], 10));
    let end = Math.min(doc.numPages, parseInt(m[2], 10));
    const chunks = [];
    for (let p = start; p <= end; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const line = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
      chunks.push(`\n--- page ${p} ---\n${line}`);
    }
    result.text = chunks.join("\n");
  }

  const report = formatReport(result, wantOutline || !pagesSpec, !!pagesSpec);
  if (outPath) {
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, report, "utf8");
    console.log("Wrote", outPath, `(${Buffer.byteLength(report, "utf8")} bytes), pages=${result.pages}`);
  } else {
    process.stdout.write(report);
  }
}

function flattenOutline(items, depth) {
  const rows = [];
  for (const item of items || []) {
    rows.push({ depth, title: (item.title || "").trim() });
    if (item.items && item.items.length) {
      rows.push(...flattenOutline(item.items, depth + 1));
    }
  }
  return rows;
}

function formatReport(result, includeOutline, includeText) {
  const lines = [];
  lines.push(`# PDF extract`);
  lines.push(`path: ${result.path}`);
  lines.push(`pages: ${result.pages}`);
  if (includeOutline) {
    lines.push(`\n## Outline (${(result.outline || []).length} entries)`);
    for (const row of result.outline || []) {
      lines.push(`${"  ".repeat(row.depth)}- ${row.title}`);
    }
    if (!(result.outline || []).length) lines.push("(no embedded outline)");
  }
  if (includeText && result.text) {
    lines.push(`\n## Text`);
    lines.push(result.text);
  }
  return lines.join("\n") + "\n";
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
