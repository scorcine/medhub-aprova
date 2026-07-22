/**
 * Extrai imagens embutidas dos PDFs Revalida e associa às questões do pack.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const { createCanvas } = require("@napi-rs/canvas");

const PDF_DIR = "D:/MedHub R1/Provas/Revalida";
const MIN_W = 60;
const MIN_H = 60;

function listEditions () {
  return fs.readdirSync(PDF_DIR)
    .filter((f) => /^\d{4}_\d\.pdf$/i.test(f))
    .map((f) => {
      const m = f.match(/^(\d{4})_(\d)\.pdf$/i);
      return { id: m[1] + "-" + m[2], year: Number(m[1]), app: Number(m[2]), file: f };
    })
    .sort((a, b) => a.year - b.year || a.app - b.app);
}

function norm (s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function saveImageData (img, outPath) {
  const w = img.width;
  const h = img.height;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(w, h);
  const src = img.data;
  if (!src || !src.length) throw new Error("empty image data");

  if (src.length === w * h * 4) {
    imageData.data.set(src);
  } else if (src.length === w * h * 3) {
    for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
      imageData.data[j] = src[i];
      imageData.data[j + 1] = src[i + 1];
      imageData.data[j + 2] = src[i + 2];
      imageData.data[j + 3] = 255;
    }
  } else if (src.length === w * h) {
    for (let i = 0; i < w * h; i++) {
      const v = src[i] || 0;
      imageData.data[i * 4] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
      imageData.data[i * 4 + 3] = 255;
    }
  } else {
    const n = Math.min(src.length, w * h * 4);
    for (let i = 0; i < n; i++) imageData.data[i] = src[i];
  }
  ctx.putImageData(imageData, 0, 0);
  fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
}

function scoreMatch (stemN, pageN) {
  if (!stemN || stemN.length < 40) return 0;
  const head = stemN.slice(0, 50);
  if (pageN.includes(head.slice(0, 36))) return 50;
  const words = stemN.split(" ").filter((w) => w.length > 5).slice(0, 10);
  let hit = 0;
  for (const w of words) if (pageN.includes(w)) hit++;
  return hit;
}

async function processEdition (ed) {
  const packPath = path.join(ROOT, "data", "provas", "revalida-" + ed.id + ".json");
  if (!fs.existsSync(packPath)) {
    console.warn("pack ausente", packPath);
    return { id: ed.id, applied: 0, skipped: true };
  }
  const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
  const stems = pack.questions.map((q) => {
    const m = String(q.id || "").match(/(\d{3})$/);
    return { n: m ? Number(m[1]) : 0, stemN: norm(q.stem) };
  }).filter((s) => s.n > 0);

  const data = new Uint8Array(fs.readFileSync(path.join(PDF_DIR, ed.file)));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const outDir = path.join(ROOT, "data", "provas", "images", "revalida-" + ed.id);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) {
    fs.unlinkSync(path.join(outDir, f));
  }

  const byQ = Object.create(null);
  const report = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const imgs = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) {
        const name = ops.argsArray[i][0];
        try {
          const img = await page.objs.get(name);
          if ((img?.width || 0) >= MIN_W && (img?.height || 0) >= MIN_H) {
            imgs.push(img);
          }
        } catch (_) {}
      }
    }
    if (!imgs.length) continue;

    const text = (await page.getTextContent()).items.map((it) => it.str).join(" ");
    const pageN = norm(text);
    let best = null;
    let bestScore = 0;
    for (const s of stems) {
      const sc = scoreMatch(s.stemN, pageN);
      if (sc > bestScore) {
        bestScore = sc;
        best = s.n;
      }
    }
    const qm = [...text.matchAll(/Quest[aã]o\s*(\d+)/gi)].map((m) => Number(m[1]));
    if (bestScore < 4 && qm.length) {
      best = qm[qm.length - 1];
      bestScore = 3;
    }

    if (!best || bestScore < 3) {
      imgs.forEach((img, idx) => {
        const file = "orphan-p" + String(p).padStart(2, "0") + "-" + (idx + 1) + ".png";
        saveImageData(img, path.join(outDir, file));
      });
      report.push({
        id: ed.id,
        page: p,
        unmatched: true,
        snippet: text.replace(/\s+/g, " ").slice(0, 180)
      });
      continue;
    }

    const files = [];
    imgs.forEach((img, idx) => {
      const file =
        "q" +
        String(best).padStart(3, "0") +
        (imgs.length > 1 ? "-" + (idx + 1) : "") +
        ".png";
      const rel = "data/provas/images/revalida-" + ed.id + "/" + file;
      saveImageData(img, path.join(outDir, file));
      files.push(rel);
    });
    byQ[best] = (byQ[best] || []).concat(files);
    report.push({ id: ed.id, page: p, q: best, score: bestScore, files });
  }

  let applied = 0;
  pack.questions.forEach((q) => {
    const m = String(q.id || "").match(/(\d{3})$/);
    const n = m ? Number(m[1]) : 0;
    if (byQ[n] && byQ[n].length) {
      q.images = byQ[n];
      applied++;
    } else {
      delete q.images;
    }
  });
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2), "utf8");
  return { id: ed.id, applied, byQKeys: Object.keys(byQ).length, orphans: report.filter((x) => x.unmatched).length, report };
}

const all = [];
for (const ed of listEditions()) {
  const r = await processEdition(ed);
  all.push(r);
  console.log(ed.id, "applied", r.applied, "qsWithImg", r.byQKeys, "orphans", r.orphans || 0);
}
fs.writeFileSync(
  path.join(__dirname, "revalida-images-report.json"),
  JSON.stringify(all, null, 2),
  "utf8"
);
console.log("OK images");
