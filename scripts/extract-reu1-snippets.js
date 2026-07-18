const fs = require("fs");
const path = require("path");
const t = fs.readFileSync(path.join(__dirname, "..", "data", "_extract_reu", "REU1-full.txt"), "utf8");
const markers = [];
const re = /--\s*(\d+)\s+of\s+(\d+)\s*--/g;
let m;
while ((m = re.exec(t))) markers.push({ p: +m[1], i: m.index });

function slicePages(from, to) {
  const a = markers.find((x) => x.p === from);
  const b = markers.find((x) => x.p === to + 1) || markers[markers.length - 1];
  if (!a) return "(missing " + from + ")";
  return t
    .slice(a.i, b.i)
    .replace(/\t/g, " ")
    .replace(/t\.me\/\S+/g, "")
    .replace(/proibida venda/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

const ranges = [
  [1, 8],
  [28, 36],
  [36, 46],
  [46, 58],
  [58, 70],
  [77, 88],
  [88, 96],
  [94, 106]
];
for (const [a, b] of ranges) {
  const s = slicePages(a, b);
  console.log("\n#### p." + a + "-" + b + " (" + s.length + " chars) ####\n");
  console.log(s.slice(0, 2800));
}
