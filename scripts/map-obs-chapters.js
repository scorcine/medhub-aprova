const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_obs");

function chaptersFrom (text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const chapters = [];
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (!L) continue;
    // Title often duplicated: "TITLE\tTITLE" or appears before PONTOS PRINCIPAIS
    const next = (lines[i + 1] || "") + " " + (lines[i + 2] || "");
    const isAntesPontos = /PONTOS PRINCIPAIS/i.test(next) || /PONTOS PRINCIPAIS/i.test(lines[i + 1] || "");
    const looksTitle =
      L.length >= 8 &&
      L.length <= 90 &&
      !/^t\.me\//i.test(L) &&
      !/^-- \d+ of/i.test(L) &&
      !/^TAB\./i.test(L) &&
      !/^FIG\./i.test(L) &&
      !/^Figura/i.test(L) &&
      !/^Tabela/i.test(L) &&
      !/^Quadro/i.test(L) &&
      (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s\/\-\(\)\,\.\:]{7,}$/.test(L) ||
        (isAntesPontos && /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(L)));

    if (!looksTitle && !isAntesPontos) continue;
    if (!looksTitle) continue;

    let title = L.replace(/\t.*/, "").replace(/\s+/g, " ").trim();
    // drop duplicated half
    const mid = Math.floor(title.length / 2);
    if (title.length % 2 === 0 && title.slice(0, mid) === title.slice(mid)) {
      title = title.slice(0, mid).trim();
    }
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    if (/^(definição|etiologia|tratamento|diagnóstico|classificação|introdução|conceitos|relevância|anatomia|tipos de|não esqueça|pontos principais)$/i.test(title)) {
      continue;
    }
    if (isAntesPontos || /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s\/\-\(\)\,\.\:]+$/.test(title)) {
      seen.add(key);
      chapters.push(title);
    }
  }
  return chapters;
}

const map = {};
for (let n = 1; n <= 5; n++) {
  const text = fs.readFileSync(path.join(DIR, `Obs${n}-full.txt`), "utf8");
  const ch = chaptersFrom(text);
  map[`Obs${n}`] = {
    chars: text.length,
    chapterCount: ch.length,
    chapters: ch.slice(0, 60)
  };
  console.log("\n==== Obs" + n + " (" + ch.length + " titles) ====");
  ch.slice(0, 40).forEach((c, i) => console.log(String(i + 1).padStart(2) + ". " + c));
}

fs.writeFileSync(path.join(DIR, "chapters.json"), JSON.stringify(map, null, 2));
