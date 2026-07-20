/**
 * Remove sufixos repetidos e recompõe alternativas de Puericultura
 * com comprimento parecido e finais distintos (sem “gabarito pela forma”).
 *
 * Uso: node scripts/rebalance-pueri-unique.js && node scripts/build-questions-pediatria.js
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "_parts");
const GROUP = "Puericultura e prevenção";

const BAD_SUFFIXES = [
  /,?\s*com reavaliação clínica em 48–72 horas se não houver melhora/gi,
  /;?\s*orientar sinais de alarme e retorno precoce à unidade de saúde/gi,
  /,?\s*mantendo acompanhamento de puericultura e registro na caderneta/gi,
  /;?\s*indicar exames complementares somente se houver piora ou dúvida diagnóstica/gi,
  /,?\s*sem internação na ausência de critérios de gravidade no momento/gi,
  /;?\s*discutir com a família o plano terapêutico e a adesão ao seguimento/gi,
  /,?\s*preservando intervenções de menor risco antes de escalar condutas invasivas/gi,
  /;?\s*documentar a conduta e agendar retorno conforme a idade e o risco/gi
];

/** Finais distintos por índice da alternativa (A–E), para não criar padrão. */
const TAILS = [
  [
    "; solicitar retorno em 7 dias para checar adesão e resposta clínica",
    "; manter diário de sintomas por 5 dias e reavaliar ambulatorialmente",
    "; combinar teleorientação em 72 horas se a família notar piora",
    "; reforçar medidas gerais e reavaliar na próxima consulta de rotina"
  ],
  [
    "; iniciar suporte sintomático e reservar exames só se houver alarme",
    "; priorizar conduta expectante com critérios claros de retorno urgente",
    "; orientar hidratação e observação domiciliar supervisionada pela UBS",
    "; evitar procedimentos invasivos enquanto o quadro permanecer estável"
  ],
  [
    "; registrar a hipótese na caderneta e discutir o plano com o cuidador",
    "; alinhar a conduta ao calendário de puericultura da idade da criança",
    "; checar fatores sociais que possam comprometer o seguimento proposto",
    "; confirmar compreensão da família sobre sinais que exigem reavaliação"
  ],
  [
    "; comparar com condutas de referência e só então escalar a abordagem",
    "; usar o protocolo da unidade antes de adotar medida excepcional",
    "; revisar contraindicações e interações antes de qualquer farmacoterapia",
    "; validar o diagnóstico diferencial mais comum da faixa etária primeiro"
  ],
  [
    "; reavaliar peso, crescimento e desenvolvimento no mesmo encontro",
    "; checar vacinas em atraso e oportunidades perdidas de prevenção",
    "; revisar alimentação e sono como parte da mesma consulta",
    "; integrar a conduta ao acompanhamento longitudinal da criança"
  ]
];

function stripSuffixes (text) {
  let out = String(text || "").trim();
  for (const re of BAD_SUFFIXES) out = out.replace(re, "");
  return out.replace(/\s{2,}/g, " ").replace(/\s+([;,.])/g, "$1").replace(/[;,\s]+$/g, "").trim();
}

function len (s) {
  return String(s || "").length;
}

function withTail (core, slot, variant, target) {
  let out = core;
  const options = TAILS[slot % TAILS.length];
  let i = variant % options.length;
  let guard = 0;
  while (len(out) < target && guard < 6) {
    const t = options[i % options.length];
    if (!out.includes(t.slice(2, 24))) out += t;
    else out += options[(i + 1) % options.length];
    i += 1;
    guard += 1;
  }
  return out;
}

function compress (text, target) {
  let out = stripSuffixes(text);
  while (len(out) > target + 18 && out.includes("; ")) {
    out = out.slice(0, out.lastIndexOf("; ")).trim();
  }
  return out;
}

function balanceOne (q, salt) {
  const correct0 = stripSuffixes(q.correct);
  const wrongs0 = (q.wrongs || []).map(stripSuffixes);
  if (!correct0 || wrongs0.length !== 4) return q;

  // Comprimento-alvo: médio entre correto e a maior errada (faixa 110–155)
  const base = Math.round((len(correct0) + Math.max(...wrongs0.map(len), 90)) / 2);
  const target = Math.max(110, Math.min(155, base));

  let correct = correct0;
  if (len(correct) > target + 25) correct = compress(correct, target + 10);
  if (len(correct) < target - 15) correct = withTail(correct, 2, salt, target - 5);

  const wrongs = wrongs0.map((w, idx) => {
    let out = w;
    // slot 0..3 map to tails 0,1,3,4 (pula o mesmo do correto quando possível)
    const slot = idx === 2 ? 3 : idx;
    if (len(out) > target + 20) out = compress(out, target + 8);
    if (len(out) < target - 12) out = withTail(out, slot, salt + idx * 3, target);
    // Evita ficar idêntico ao correto
    if (out === correct) out = withTail(out, (slot + 1) % 5, salt + 9, target);
    return out;
  });

  return Object.assign({}, q, { correct, wrongs });
}

function ratioSkew (q) {
  const c = len(q.correct);
  const ws = q.wrongs.map(len);
  const avg = ws.reduce((a, b) => a + b, 0) / 4;
  return c / Math.max(1, avg);
}

function sharedTailCount (q) {
  const parts = [q.correct].concat(q.wrongs).map((t) => {
    const i = t.lastIndexOf("; ");
    return i >= 0 ? t.slice(i) : "";
  }).filter(Boolean);
  const freq = Object.create(null);
  parts.forEach((p) => {
    freq[p] = (freq[p] || 0) + 1;
  });
  return Math.max(0, ...Object.values(freq), 0);
}

function main () {
  const files = fs.readdirSync(DIR).filter((f) => /^ped-part\d+\.json$/i.test(f)).sort();
  let n = 0;
  let sharedHot = 0;
  let skewHot = 0;

  files.forEach((f, fi) => {
    const p = path.join(DIR, f);
    const arr = JSON.parse(fs.readFileSync(p, "utf8"));
    let changed = false;
    arr.forEach((q, qi) => {
      if (q.group !== GROUP) return;
      n += 1;
      const next = balanceOne(q, fi * 17 + qi);
      if (JSON.stringify(next) !== JSON.stringify(q)) {
        arr[qi] = next;
        changed = true;
      }
      if (ratioSkew(arr[qi]) > 1.28) skewHot += 1;
      if (sharedTailCount(arr[qi]) >= 3) sharedHot += 1;
    });
    if (changed) fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n", "utf8");
  });

  console.log({ pueri: n, skewHot, sharedHot });
}

main();
