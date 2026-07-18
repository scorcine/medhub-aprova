const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "data", "_extract_reu");

function dedupe(s) {
  s = String(s || "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  const m = s.match(/^(.+)\s+\1$/i);
  if (m) return m[1].trim();
  if (s.length >= 16 && s.length % 2 === 0) {
    const a = s.slice(0, s.length / 2).trim();
    const b = s.slice(s.length / 2).trim();
    if (a === b) return a;
  }
  return s;
}

function analyze(base) {
  const t = fs.readFileSync(path.join(DIR, base + "-full.txt"), "utf8").replace(/\0/g, "");
  const pageRe = /--\s*(\d+)\s+of\s+(\d+)\s*--/g;
  let totalPages = null;
  const markers = [];
  let m;
  while ((m = pageRe.exec(t))) {
    totalPages = Number(m[2]);
    markers.push({ page: Number(m[1]), index: m.index });
  }

  const chapters = [];
  const skip =
    /^(INTRODUÇÃO|EPIDEMIOLOGIA|PATOGÊNESE|QUADRO|SAIBA|TRATAMENTO|DIAGNÓSTICO|CLÍNICA|CLASSIFICAÇÃO|PROGNÓSTICO|COMPLICAÇÕES|FISIOPATOLOGIA|MANIFESTAÇÕES|EXAMES|CRITÉRIOS|TABELA|FIGURA|GENÉTICA|FATORES|DEFINIÇÃO|CONCEITO|HISTÓRIA|ACHADOS|LABORATÓRIO|IMAGEM|TERAPÊUTICA|CONDUTA|RESUMO|PONTOS|TESTE SEU|REFERÊNCIAS|BIBLIOGRAFIA|NOTA|OBS\.|ATENÇÃO|IMPORTANTE|MECANISMO|ETIOLOGIA|QUADRO CLÍNICO|DIAGNÓSTICO DIFERENCIAL)$/i;

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : Math.min(t.length, start + 2500);
    const chunk = t.slice(start, end);
    const lines = chunk
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30);

    for (let j = 0; j < lines.length; j++) {
      if (/CAP[IÍ]TULO\s+\d+/i.test(lines[j]) || lines[j].includes("CAPÍTULO")) {
        const num = (lines[j].match(/(\d+)/) || [])[1];
        let title = "";
        for (let k = j + 1; k < Math.min(j + 8, lines.length); k++) {
          let n = dedupe(lines[k]);
          if (!n || /^t\.me/i.test(n) || /^proibida/i.test(n) || /^Fig/i.test(n)) continue;
          if (n.length < 8) continue;
          if (/CAP[IÍ]TULO/i.test(n)) continue;
          title = n;
          break;
        }
        if (num && title) chapters.push({ page: markers[i].page, num: Number(num), title });
        break;
      }
    }
  }

  // unique chapters by number (keep first title)
  const byNum = new Map();
  for (const c of chapters) {
    if (!byNum.has(c.num)) byNum.set(c.num, c);
  }

  // Disease-like headers (first occurrence)
  const headers = [];
  const seenH = new Set();
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : Math.min(t.length, start + 1800);
    const lines = t
      .slice(start, end)
      .split(/\r?\n/)
      .map((l) => dedupe(l.trim()))
      .filter(Boolean)
      .slice(0, 18);
    for (const L of lines) {
      if (L.length < 12 || L.length > 70) continue;
      if (!/^[A-ZÁÉÍÓÚÂÊÔÃÕÇÜ0-9]/.test(L)) continue;
      const letters = L.replace(/[^A-Za-zÁÉÍÓÚÂÊÔÃÕÇÜáéíóúâêôãõçü]/g, "");
      const upper = letters.replace(/[^A-ZÁÉÍÓÚÂÊÔÃÕÇÜ]/g, "").length;
      if (letters.length < 10) continue;
      if (upper / letters.length < 0.75) continue;
      if (skip.test(L)) continue;
      if (/CAP[IÍ]TULO/i.test(L)) continue;
      if (seenH.has(L)) continue;
      seenH.add(L);
      headers.push({ page: markers[i].page, title: L });
    }
  }

  // Keyword density
  const low = t.toLowerCase();
  const keys = [
    ["artrite reumatoide", "AR"],
    ["anti-ccp", "anti-CCP"],
    ["fator reumatoide", "FR"],
    ["espondiloartr", "Espondiloartrites"],
    ["hla-b27", "HLA-B27"],
    ["artrite psori", "Artrite psoriásica"],
    ["artrite reativa", "Artrite reativa"],
    ["espondilite anquilos", "EA"],
    ["gota", "Gota"],
    ["pseudogota", "Pseudogota"],
    ["osteoartr", "Osteoartrite"],
    ["fibromial", "Fibromialgia"],
    ["febre reumát", "Febre reumática"],
    ["lúpus", "LES"],
    ["esclerose sistêmica", "ES"],
    ["escleroderm", "Esclerodermia"],
    ["sjögren", "Sjögren"],
    ["sjogren", "Sjogren"],
    ["dermatomios", "DM"],
    ["polimiosite", "PM"],
    ["doença mista", "DMTC"],
    ["antifosfol", "SAF"],
    ["vasculite", "Vasculites"],
    ["granulomatose", "GPA/Wegener"],
    ["poliangiíte microscópica", "PAM"],
    ["churg", "EGPA"],
    ["poliarterite", "PAN"],
    ["arterite de células gigantes", "ACG"],
    ["arterite temporal", "Arterite temporal"],
    ["polimialgia reumática", "PMR"],
    ["takayasu", "Takayasu"],
    ["behçet", "Behçet"],
    ["crioglobulin", "Crioglobulinemia"],
    ["osteopor", "Osteoporose"],
    ["metotrexato", "MTX"],
    ["hidroxicloroquina", "HCQ"],
    ["biológico", "Biológicos"],
    ["rituximabe", "RTX"],
    ["tocilizumabe", "TCZ"],
    ["colchicina", "Colchicina"],
    ["alopurinol", "Alopurinol"]
  ];
  const kw = keys
    .map(([k, label]) => ({ label, n: Math.max(0, low.split(k).length - 1) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);

  return {
    file: base + ".pdf",
    pages: totalPages,
    chars: t.length,
    chapters: [...byNum.values()].sort((a, b) => a.num - b.num),
    headers: headers.slice(0, 60),
    keywords: kw.slice(0, 35)
  };
}

const out = {
  source: "D:\\\\MedHub R1\\\\CM\\\\Reumatologia",
  analyzedAt: new Date().toISOString(),
  volumes: ["REU1", "REU2", "REU3"].map(analyze)
};

fs.writeFileSync(path.join(DIR, "analysis.json"), JSON.stringify(out, null, 2), "utf8");

for (const v of out.volumes) {
  console.log("\n====", v.file, "·", v.pages, "págs ·", v.chars, "chars ====");
  console.log("Capítulos:");
  for (const c of v.chapters) console.log(" ", String(c.num).padStart(2), "p." + String(c.page).padStart(3), c.title);
  console.log("Headers principais (amostra):");
  for (const h of v.headers.slice(0, 25)) console.log("  p." + String(h.page).padStart(3), h.title);
  console.log("Keywords top:");
  for (const k of v.keywords.slice(0, 15)) console.log(" ", k.n, k.label);
}

console.log("\nwrote", path.join(DIR, "analysis.json"));
