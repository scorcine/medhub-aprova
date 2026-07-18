const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_obs");

function cleanTitle (raw) {
  let t = String(raw || "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // duplicated title glued: "FOO FOO"
  const words = t.split(" ");
  if (words.length >= 4 && words.length % 2 === 0) {
    const half = words.length / 2;
    const a = words.slice(0, half).join(" ");
    const b = words.slice(half).join(" ");
    if (a === b) t = a;
  }
  const mid = Math.floor(t.length / 2);
  if (t.length > 12 && t.length % 2 === 0 && t.slice(0, mid) === t.slice(mid)) {
    t = t.slice(0, mid).trim();
  }
  return t;
}

for (let n = 1; n <= 5; n++) {
  const lines = fs
    .readFileSync(path.join(DIR, `Obs${n}-full.txt`), "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim());
  const ch = [];

  for (let i = 0; i < lines.length; i++) {
    if (!/^PONTOS PRINCIPAIS/i.test(lines[i])) continue;
    const cand = [];
    for (let j = i - 1; j >= 0 && cand.length < 8; j--) {
      const L = lines[j];
      if (!L) continue;
      if (/^t\.me\//i.test(L) || /^-- \d+ of/i.test(L) || /^_+$/.test(L)) continue;
      if (/proibida venda/i.test(L)) continue;
      if (/^(TAB\.|FIG\.|Figura|Tabela|Quadro)/i.test(L)) continue;
      cand.unshift(L);
    }
    // Prefer last uppercase-ish line(s)
    let title = "";
    for (let k = cand.length - 1; k >= 0; k--) {
      const L = cand[k];
      if (L.length < 6 || L.length > 100) continue;
      title = cleanTitle(L);
      break;
    }
    // Sometimes title spans 2 lines
    if (title && cand.length >= 2) {
      const prev = cleanTitle(cand[cand.length - 2] || "");
      if (
        prev &&
        prev.length <= 60 &&
        /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9]/.test(prev) &&
        !/^(DEFINIÇÃO|ETIOLOGIA|TRATAMENTO|CLASSIFICAÇÃO|INTRODUÇÃO)$/i.test(prev)
      ) {
        const joined = cleanTitle(prev + " " + title);
        if (joined.length <= 100) title = joined;
      }
    }
    if (
      title &&
      title.length >= 6 &&
      title.length <= 100 &&
      !ch.includes(title) &&
      !/^(DEFINIÇÃO|ETIOLOGIA|TRATAMENTO|CLASSIFICAÇÃO|PONTOS PRINCIPAIS)$/i.test(title)
    ) {
      ch.push(title);
    }
  }

  console.log("\n==== Obs" + n + " (" + ch.length + ") ====");
  ch.forEach((c, i) => console.log(String(i + 1).padStart(2) + ". " + c));
  fs.writeFileSync(path.join(DIR, `Obs${n}-chapters.txt`), ch.join("\n") + "\n");
}
