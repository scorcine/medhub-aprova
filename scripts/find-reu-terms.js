const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "data", "_extract_reu");

function findPages(base, terms) {
  const t = fs.readFileSync(path.join(DIR, base + "-full.txt"), "utf8");
  const re = /--\s*(\d+)\s+of\s+(\d+)\s*--/g;
  const markers = [];
  let m;
  while ((m = re.exec(t))) markers.push({ page: +m[1], index: m.index });
  function pageAt(idx) {
    let p = 1;
    for (const mk of markers) {
      if (mk.index <= idx) p = mk.page;
      else break;
    }
    return p;
  }
  for (const term of terms) {
    const low = t.toLowerCase();
    const q = term.toLowerCase();
    let from = 0;
    const hits = [];
    while (from < low.length) {
      const i = low.indexOf(q, from);
      if (i < 0) break;
      hits.push(pageAt(i));
      from = i + q.length;
      if (hits.length >= 3) break;
    }
    console.log(base, term, hits.length ? "p." + hits.join(", p.") : "—");
  }
}

findPages("REU3", [
  "síndrome de sjögren",
  "sjogren",
  "granulomatose de wegener",
  "granulomatose com poliangiite",
  "arterite de takayasu",
  "doença mista do tecido",
  "síndrome do anticorpo antifosfolipídeo",
  "antifosfolipídeo"
]);
findPages("REU2", [
  "fibromialgia",
  "febre familiar do mediterrâneo",
  "policondrite",
  "apêndice 1",
  "artrite infecciosa"
]);
findPages("REU1", [
  "artrite idiopática juvenil",
  "doença de still",
  "espondilite anquilosante",
  "artropatias enteropáticas"
]);
