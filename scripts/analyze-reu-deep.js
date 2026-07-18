const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_reu");

function dedupe(s) {
  s = String(s || "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length >= 16) {
    const half = Math.floor(s.length / 2);
    if (s.slice(0, half).trim() === s.slice(half).trim()) return s.slice(0, half).trim();
  }
  const m = s.match(/^(.+)\s+\1$/i);
  return m ? m[1].trim() : s;
}

function markersOf(t) {
  const markers = [];
  const re = /--\s*(\d+)\s+of\s+(\d+)\s*--/g;
  let m;
  while ((m = re.exec(t))) markers.push({ page: +m[1], index: m.index });
  return markers;
}

function headersFrom(base, fromPage = 1) {
  const t = fs.readFileSync(path.join(DIR, base + "-full.txt"), "utf8");
  const markers = markersOf(t);
  const out = [];
  let last = "";
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].page < fromPage) continue;
    const chunk = t.slice(markers[i].index, markers[i + 1] ? markers[i + 1].index : markers[i].index + 2200);
    const lines = chunk
      .split(/\n/)
      .map((l) => dedupe(l.trim()))
      .filter(Boolean)
      .slice(0, 14);
    for (const L of lines) {
      if (L.length < 10 || L.length > 78) continue;
      const letters = L.replace(/[^A-Za-zÁ-Úá-ú]/g, "");
      if (!letters) continue;
      const up = (letters.match(/[A-ZÁ-Ú]/g) || []).length;
      if (up / letters.length < 0.68) continue;
      if (
        /INTRODU|EPIDEM|PATOGEN|TRATAM|MANIFEST|QUADRO DE|FATORES|DIAGN[OÓ]ST|CRITER|LABORAT|TESTE SEU|PROIBIDA|T\.ME|DEFINIÇÃO|FISIOPAT|ETIOPAT|ACHADOS|PROGN[OÓ]ST|COMPLICA|CLASSIFICA|CONCEITO|SAIBA|REFER/i.test(
          L
        )
      )
        continue;
      if (L === last) continue;
      last = L;
      out.push({ page: markers[i].page, title: L });
      break;
    }
  }
  return out;
}

console.log("=== REU2 from p.76 ===");
headersFrom("REU2", 76).forEach((h) => console.log("p." + h.page, h.title));
console.log("\n=== REU3 from p.100 ===");
headersFrom("REU3", 100).forEach((h) => console.log("p." + h.page, h.title));
console.log("\n=== REU3 from p.140 ===");
headersFrom("REU3", 140).forEach((h) => console.log("p." + h.page, h.title));
