/**
 * Equilibra comprimento/complexidade das alternativas em Puericultura.
 * Evita gabarito “óbvio” por ser a opção mais longa/completa.
 *
 * Uso: node scripts/balance-pueri-choices.js
 * Depois: node scripts/build-questions-pediatria.js
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "_parts");
const GROUP = "Puericultura e prevenção";

const PADS = [
  ", com reavaliação clínica em 48–72 horas se não houver melhora",
  "; orientar sinais de alarme e retorno precoce à unidade de saúde",
  ", mantendo acompanhamento de puericultura e registro na caderneta",
  "; indicar exames complementares somente se houver piora ou dúvida diagnóstica",
  ", sem internação na ausência de critérios de gravidade no momento",
  "; discutir com a família o plano terapêutico e a adesão ao seguimento",
  ", preservando intervenções de menor risco antes de escalar condutas invasivas",
  "; documentar a conduta e agendar retorno conforme a idade e o risco"
];

const TRIM_MARKERS = [
  " e articular com a rede de proteção social quando pertinente",
  " e registrar tudo na caderneta da criança",
  ", com monitoramento laboratorial seriado se disponível",
  " conforme protocolo local e disponibilidade de exames"
];

function len (s) {
  return String(s || "").length;
}

function expandTo (text, target) {
  let out = String(text || "").trim();
  if (!out) out = "Observação ambulatorial com reavaliação programada";
  let i = 0;
  let guard = 0;
  while (len(out) < target && guard < 12) {
    const pad = PADS[i % PADS.length];
    if (!out.includes(pad.trim().replace(/^[,;]\s*/, ""))) {
      out += pad;
    } else {
      out += PADS[(i + 3) % PADS.length];
    }
    i += 1;
    guard += 1;
  }
  return out;
}

function trimToward (text, target) {
  let out = String(text || "").trim();
  for (const m of TRIM_MARKERS) {
    if (len(out) <= target) break;
    if (out.includes(m)) out = out.replace(m, "");
  }
  // Evita cortar no meio da frase: só se ainda muito longo e houver "; "
  while (len(out) > target + 25 && out.lastIndexOf("; ") > target * 0.55) {
    out = out.slice(0, out.lastIndexOf("; ")).trim();
  }
  return out.replace(/\s{2,}/g, " ").replace(/\s+([,;.])/g, "$1").trim();
}

function balanceQuestion (q) {
  const correct = String(q.correct || "").trim();
  const wrongs = (q.wrongs || []).map((w) => String(w || "").trim());
  if (!correct || wrongs.length !== 4) return { q, changed: false };

  const maxWrong = Math.max(...wrongs.map(len));
  const avgWrong = wrongs.reduce((a, b) => a + len(b), 0) / 4;
  // Alvo: faixa comum — nem telegráfica, nem monólogo só no gabarito
  let target = Math.round((len(correct) + Math.max(avgWrong, maxWrong)) / 2);
  target = Math.max(95, Math.min(165, target));

  // Se o correto está bem acima dos errados, enxuga um pouco o correto
  let nextCorrect = correct;
  if (len(correct) > avgWrong * 1.45 && len(correct) > 130) {
    nextCorrect = trimToward(correct, Math.max(110, Math.round(avgWrong * 1.25)));
    if (len(nextCorrect) < 80) nextCorrect = correct;
  }

  // Recalcula alvo com o correto já ajustado
  target = Math.max(95, Math.min(170, Math.max(len(nextCorrect), Math.round(avgWrong * 1.15))));
  // Preferir igualar ao comprimento do correto (±10%)
  const low = Math.round(len(nextCorrect) * 0.88);
  const high = Math.round(len(nextCorrect) * 1.12);

  const nextWrongs = wrongs.map((w) => {
    let out = w;
    if (len(out) < low) out = expandTo(out, low + Math.floor(Math.random() * 8));
    if (len(out) > high + 20) out = trimToward(out, high);
    // Garante piso próximo do correto
    if (len(out) < low) out = expandTo(out, low);
    return out;
  });

  const changed =
    nextCorrect !== correct ||
    nextWrongs.some((w, i) => w !== wrongs[i]);

  return {
    changed,
    q: Object.assign({}, q, { correct: nextCorrect, wrongs: nextWrongs })
  };
}

function isSkewed (q) {
  const choices = [q.correct].concat(q.wrongs);
  const c = len(q.correct);
  const wrongs = q.wrongs.map(len);
  const avg = wrongs.reduce((a, b) => a + b, 0) / 4;
  const maxW = Math.max(...wrongs);
  return c > avg * 1.3 || c > maxW + 35;
}

function main () {
  const files = fs.readdirSync(DIR).filter((f) => /^ped-part\d+\.json$/i.test(f)).sort();
  let touched = 0;
  let skewBefore = 0;
  let skewAfter = 0;
  let pueri = 0;

  for (const f of files) {
    const p = path.join(DIR, f);
    const arr = JSON.parse(fs.readFileSync(p, "utf8"));
    let fileChanged = false;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].group !== GROUP) continue;
      pueri += 1;
      if (isSkewed(arr[i])) skewBefore += 1;
      const { q, changed } = balanceQuestion(arr[i]);
      if (changed) {
        arr[i] = q;
        fileChanged = true;
        touched += 1;
      }
      if (isSkewed(arr[i])) skewAfter += 1;
    }
    if (fileChanged) {
      fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n", "utf8");
    }
  }

  console.log("Puericultura:", pueri);
  console.log("Ajustadas:", touched);
  console.log("Skew antes/depois:", skewBefore, skewAfter);
}

main();
