const fs = require("fs");
const path = require("path");
const DIR = "data/_extract_pneumo";

function pageAt(t, idx, totalHint) {
  const before = t.slice(0, idx);
  const re = new RegExp("-- (\\d+) of (\\d+) --", "g");
  let m;
  let last = "?";
  while ((m = re.exec(before))) last = m[1];
  return last;
}

for (const file of ["Pneumo1-full.txt", "Pneumo2-full.txt"]) {
  const t = fs.readFileSync(path.join(DIR, file), "utf8");
  console.log("\n====", file, "chars", t.length, "====");
  const summary = JSON.parse(fs.readFileSync(path.join(DIR, "summary.json"), "utf8"));
  const info = summary.find((s) => file.startsWith(s.file.replace(".pdf", "")));
  console.log("keywords top:");
  if (info) {
    Object.entries(info.keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([k, v]) => console.log(" ", k, v));
  }

  const caps = [];
  const re = /CAP[IÍ]TULO\s*\.?\s*(\d+)/gi;
  let m;
  while ((m = re.exec(t))) {
    const after = t.slice(m.index, m.index + 220).replace(/\s+/g, " ");
    caps.push({ n: m[1], p: pageAt(t, m.index), snip: after.slice(0, 140) });
  }
  const seen = new Set();
  for (const c of caps) {
    const key = c.n + c.snip.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    console.log("Cap", c.n, "p~" + c.p, c.snip);
  }

  const titles = [
    "ASMA",
    "DPOC",
    "PNEUMONIA",
    "DERRAME PLEURAL",
    "TROMBOEMBOLISMO",
    "EMBOLIA PULMONAR",
    "CÂNCER DE PULMÃO",
    "CANCER DE PULMAO",
    "TUBERCULOSE",
    "VENTILAÇÃO MECÂNICA",
    "GASOMETRIA",
    "ESPIROMETRIA",
    "HIPERTENSÃO PULMONAR",
    "BRONQUIECTASIA",
    "FIBROSE",
    "SARCOIDOSE",
    "PNEUMOTÓRAX",
    "SDRA",
    "APNEIA",
    "INTERSTICIAL"
  ];
  const U = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  for (const title of titles) {
    const kn = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const i = U.indexOf(kn);
    if (i < 0) continue;
    console.log("HIT", title, "p~" + pageAt(t, i));
  }
}
