/* Templates SVG ASCII-safe para Material de apoio */

function esc (s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell (w, h, title, subtitle, body) {
  return (
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + w + " " + h + "\" role=\"img\">\n" +
    "  <rect width=\"" + w + "\" height=\"" + h + "\" rx=\"16\" fill=\"#0f172a\"/>\n" +
    "  <text x=\"32\" y=\"40\" fill=\"#5eead4\" font-family=\"Arial, sans-serif\" font-size=\"18\" font-weight=\"700\">" + esc(title) + "</text>\n" +
    (subtitle
      ? "  <text x=\"32\" y=\"62\" fill=\"#94a3b8\" font-family=\"Arial, sans-serif\" font-size=\"12\">" + esc(subtitle) + "</text>\n"
      : "") +
    body +
    "\n</svg>\n"
  );
}

function flow3 (d) {
  const nodes = d.nodes || [];
  const boxes = [0, 1, 2].map((i) => {
    const n = nodes[i] || { label: "Passo " + (i + 1), sub: "" };
    const x = 32 + i * 200;
    return (
      "  <rect x=\"" + x + "\" y=\"100\" width=\"176\" height=\"88\" rx=\"12\" fill=\"#134e4a\" stroke=\"#2dd4bf\"/>\n" +
      "  <text x=\"" + (x + 88) + "\" y=\"138\" text-anchor=\"middle\" fill=\"#ecfeff\" font-family=\"Arial, sans-serif\" font-size=\"13\" font-weight=\"700\">" + esc(n.label) + "</text>\n" +
      "  <text x=\"" + (x + 88) + "\" y=\"162\" text-anchor=\"middle\" fill=\"#99f6e4\" font-family=\"Arial, sans-serif\" font-size=\"11\">" + esc(n.sub || "") + "</text>\n"
    );
  }).join("");
  const arrows =
    "  <path d=\"M208 144 H224\" stroke=\"#2dd4bf\" stroke-width=\"2\"/>\n" +
    "  <path d=\"M408 144 H424\" stroke=\"#2dd4bf\" stroke-width=\"2\"/>\n";
  return shell(640, 240, d.title, d.subtitle, boxes + arrows);
}

function triage3 (d) {
  const colors = [
    { bg: "#14532d", stroke: "#4ade80", title: "#bbf7d0", body: "#dcfce7", foot: "#86efac" },
    { bg: "#78350f", stroke: "#fbbf24", title: "#fde68a", body: "#fef3c7", foot: "#fcd34d" },
    { bg: "#7f1d1d", stroke: "#f87171", title: "#fecaca", body: "#fee2e2", foot: "#fca5a5" }
  ];
  const nodes = d.nodes || [];
  const cols = [0, 1, 2].map((i) => {
    const n = nodes[i] || { title: "Nivel", lines: [], foot: "" };
    const c = colors[i];
    const x = 32 + i * 200;
    const lines = (n.lines || []).slice(0, 3).map((line, idx) =>
      "  <text x=\"" + (x + 90) + "\" y=\"" + (150 + idx * 20) + "\" text-anchor=\"middle\" fill=\"" + c.body + "\" font-family=\"Arial, sans-serif\" font-size=\"11\">" + esc(line) + "</text>\n"
    ).join("");
    return (
      "  <rect x=\"" + x + "\" y=\"90\" width=\"180\" height=\"170\" rx=\"14\" fill=\"" + c.bg + "\" stroke=\"" + c.stroke + "\"/>\n" +
      "  <text x=\"" + (x + 90) + "\" y=\"120\" text-anchor=\"middle\" fill=\"" + c.title + "\" font-family=\"Arial, sans-serif\" font-size=\"14\" font-weight=\"700\">" + esc(n.title) + "</text>\n" +
      lines +
      "  <text x=\"" + (x + 90) + "\" y=\"230\" text-anchor=\"middle\" fill=\"" + c.foot + "\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"700\">" + esc(n.foot || "") + "</text>\n"
    );
  }).join("");
  return shell(640, 300, d.title, d.subtitle, cols);
}

function timeline (d) {
  const nodes = (d.nodes || []).slice(0, 5);
  const n = Math.max(nodes.length, 2);
  const usable = 520;
  const start = 60;
  const step = usable / (n - 1);
  let body = "  <line x1=\"40\" y1=\"150\" x2=\"600\" y2=\"150\" stroke=\"#334155\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n";
  const palette = ["#2dd4bf", "#2dd4bf", "#fbbf24", "#f87171", "#a78bfa"];
  nodes.forEach((node, i) => {
    const x = start + i * step;
    const color = palette[i % palette.length];
    body +=
      "  <circle cx=\"" + x + "\" cy=\"150\" r=\"10\" fill=\"" + color + "\"/>\n" +
      "  <text x=\"" + x + "\" y=\"110\" text-anchor=\"middle\" fill=\"" + color + "\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"700\">" + esc(node.label) + "</text>\n" +
      "  <text x=\"" + x + "\" y=\"190\" text-anchor=\"middle\" fill=\"#94a3b8\" font-family=\"Arial, sans-serif\" font-size=\"11\">" + esc(node.sub || "") + "</text>\n";
  });
  return shell(640, 260, d.title, d.subtitle, body);
}

function formula (d) {
  const n = (d.nodes && d.nodes[0]) || { formula: "formula", note: "" };
  const body =
    "  <rect x=\"32\" y=\"100\" width=\"576\" height=\"120\" rx=\"14\" fill=\"#134e4a\" stroke=\"#2dd4bf\"/>\n" +
    "  <text x=\"320\" y=\"155\" text-anchor=\"middle\" fill=\"#ecfeff\" font-family=\"Arial, sans-serif\" font-size=\"22\" font-weight=\"700\">" + esc(n.formula) + "</text>\n" +
    "  <text x=\"320\" y=\"190\" text-anchor=\"middle\" fill=\"#99f6e4\" font-family=\"Arial, sans-serif\" font-size=\"12\">" + esc(n.note || "") + "</text>\n";
  return shell(640, 280, d.title, d.subtitle, body);
}

function branch2 (d) {
  const left = (d.nodes && d.nodes[0]) || { title: "A", lines: [] };
  const right = (d.nodes && d.nodes[1]) || { title: "B", lines: [] };
  const lineBlock = (n, x, bg, stroke, titleC, bodyC) => {
    const lines = (n.lines || []).slice(0, 3).map((line, idx) =>
      "  <text x=\"" + (x + 135) + "\" y=\"" + (200 + idx * 20) + "\" text-anchor=\"middle\" fill=\"" + bodyC + "\" font-family=\"Arial, sans-serif\" font-size=\"11\">" + esc(line) + "</text>\n"
    ).join("");
    return (
      "  <rect x=\"" + x + "\" y=\"160\" width=\"270\" height=\"110\" rx=\"12\" fill=\"" + bg + "\" stroke=\"" + stroke + "\"/>\n" +
      "  <text x=\"" + (x + 135) + "\" y=\"188\" text-anchor=\"middle\" fill=\"" + titleC + "\" font-family=\"Arial, sans-serif\" font-size=\"13\" font-weight=\"700\">" + esc(n.title) + "</text>\n" +
      lines
    );
  };
  const body =
    "  <rect x=\"32\" y=\"88\" width=\"576\" height=\"50\" rx=\"12\" fill=\"#1e293b\" stroke=\"#2dd4bf\"/>\n" +
    "  <text x=\"320\" y=\"118\" text-anchor=\"middle\" fill=\"#ecfeff\" font-family=\"Arial, sans-serif\" font-size=\"13\" font-weight=\"700\">" + esc(d.subtitle || "Decisao") + "</text>\n" +
    "  <path d=\"M160 138 V160\" stroke=\"#64748b\" stroke-width=\"2\"/>\n" +
    "  <path d=\"M480 138 V160\" stroke=\"#64748b\" stroke-width=\"2\"/>\n" +
    "  <path d=\"M160 160 H480\" stroke=\"#64748b\" stroke-width=\"2\"/>\n" +
    lineBlock(left, 32, "#78350f", "#fbbf24", "#fef3c7", "#fde68a") +
    lineBlock(right, 338, "#7f1d1d", "#f87171", "#fecaca", "#fee2e2");
  return shell(640, 310, d.title, "", body);
}

function scorecard (d) {
  const nodes = (d.nodes || []).slice(0, 10);
  const rowH = 28;
  const top = 88;
  const h = Math.max(280, top + 36 + nodes.length * rowH + 50);
  let body =
    "  <rect x=\"32\" y=\"78\" width=\"576\" height=\"" + (nodes.length * rowH + 24) + "\" rx=\"12\" fill=\"#1e293b\" stroke=\"#334155\"/>\n";
  nodes.forEach((n, i) => {
    const y = top + i * rowH;
    body +=
      "  <text x=\"48\" y=\"" + y + "\" fill=\"#e2e8f0\" font-family=\"Arial, sans-serif\" font-size=\"12\">" + esc(n.label) + "</text>\n" +
      "  <text x=\"580\" y=\"" + y + "\" text-anchor=\"end\" fill=\"#5eead4\" font-family=\"Arial, sans-serif\" font-size=\"13\" font-weight=\"700\">" + esc(n.pts || "") + "</text>\n";
  });
  if (d.footer) {
    body +=
      "  <text x=\"32\" y=\"" + (top + nodes.length * rowH + 28) + "\" fill=\"#fbbf24\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"700\">" + esc(d.footer) + "</text>\n";
  }
  return shell(640, h, d.title, d.subtitle, body);
}

function checklist (d) {
  const nodes = (d.nodes || []).slice(0, 8);
  const rowH = 34;
  const top = 96;
  const h = Math.max(260, top + nodes.length * rowH + 40);
  let body = "";
  nodes.forEach((n, i) => {
    const y = top + i * rowH;
    body +=
      "  <circle cx=\"52\" cy=\"" + (y - 4) + "\" r=\"12\" fill=\"#134e4a\" stroke=\"#2dd4bf\"/>\n" +
      "  <text x=\"52\" y=\"" + y + "\" text-anchor=\"middle\" fill=\"#5eead4\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"700\">" + (i + 1) + "</text>\n" +
      "  <text x=\"76\" y=\"" + y + "\" fill=\"#e2e8f0\" font-family=\"Arial, sans-serif\" font-size=\"13\">" + esc(n.label) + "</text>\n";
  });
  if (d.footer) {
    body +=
      "  <text x=\"32\" y=\"" + (top + nodes.length * rowH + 16) + "\" fill=\"#fbbf24\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"700\">" + esc(d.footer) + "</text>\n";
  }
  return shell(640, h, d.title, d.subtitle, body);
}

function renderDiagram (diagram) {
  const d = diagram || {};
  switch (d.type) {
    case "triage3": return triage3(d);
    case "timeline": return timeline(d);
    case "formula": return formula(d);
    case "branch2": return branch2(d);
    case "scorecard": return scorecard(d);
    case "checklist": return checklist(d);
    case "flow3":
    default: return flow3(d);
  }
}

module.exports = { renderDiagram };
