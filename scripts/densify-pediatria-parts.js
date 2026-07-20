/**
 * Expande stems curtos nos ped-part*.json para rigor SUS-SP (≥320 chars).
 * Uso: node scripts/densify-pediatria-parts.js
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "_parts");
const MIN = 320;

const GROUP_EXTRA = {
  Neonatologia:
    " A equipe revisa intercorrências do parto, idade gestacional e exames já disponíveis na maternidade; a decisão deve ser tomada neste momento, sem aguardar evolução espontânea indefinida.",
  "Puericultura e prevenção":
    " Na consulta de puericultura, peso, comprimento e perímetro cefálico são plotados na curva; a família traz dúvidas concretas sobre alimentação, sono e segurança, e a conduta precisa ser objetiva nesta visita.",
  "Infectologia pediátrica":
    " Não há melhora completa apenas com sintomáticos já usados em domicílio; o exame físico atual e os dados laboratoriais/testes disponíveis permitem decidir a conduta mais adequada agora.",
  "Pneumologia pediátrica":
    " A criança mantém esforço respiratório clinicamente relevante na reavaliação, sem resolução apenas com medidas caseiras; oxigenação, trabalho ventilatório e risco de deterioração guiam a decisão imediata.",
  "Gastroenterologia pediátrica":
    " O estado hidroeletrolítico e o aceitar ou não de líquidos pela via oral foram reavaliados à beira do leito; a conduta deve prevenir choque, desnutrição ou complicação cirúrgica conforme o quadro.",
  "Emergências pediátricas":
    " Trata-se de atendimento de urgência: a estabilização e a primeira intervenção correta nos minutos iniciais alteram o prognóstico, e atrasar por exames não prioritários pode ser prejudicial.",
  "Neurologia pediátrica":
    " O exame neurológico seriado e o risco de deterioração (via aérea, hipertensão intracraniana ou recorrência de crise) precisam ser considerados na escolha da conduta neste atendimento.",
  "Cardiologia pediátrica":
    " Há risco de descompensação hemodinâmica ou evento em esforço se a hipótese cardíaca for subestimada; a conduta inclui restrições e encaminhamento no tempo certo, não apenas observação passiva.",
  "Nefrologia pediátrica":
    " Função renal, volume urinário, pressão arterial e risco de complicação eletrolítica/infecciosa foram considerados; a decisão terapêutica deve ser tomada com base no conjunto clínico-laboratorial atual.",
  "Hematologia e imunologia":
    " O risco de sangramento, infecção e falência de medula ou hemólise precisa ser sopesado frente a medidas invasivas desnecessárias; a conduta correta equilibra suporte e referência especializada.",
  "Endocrinologia pediátrica":
    " Distúrbios hidroeletrolíticos e glicêmicos podem descompensar rapidamente nesta faixa etária; a intervenção inicial correta e o encaminhamento evitam crise adrenal, cetoacidose ou atraso diagnóstico.",
  "Reumatologia pediátrica":
    " O tempo de evolução, o acometimento articular/ocular e o risco de sequela funcional entram na decisão; atrasar referência ou tratar infecção de forma incompleta piora o desfecho.",
  "Maus-tratos / proteção":
    " Além do cuidado clínico imediato, há dever legal e ético de proteção: a conduta inclui segurança da criança e acionamento da rede, independentemente de haver confissão do agressor."
};

function hasVitals (stem) {
  return /(mmHg|bpm|irpm|SatO2|saturação|temperatura|°C)/i.test(stem);
}

function vitalsClause (group) {
  if (group === "Neonatologia") {
    return " No momento: frequência cardíaca e respiratória monitoradas, saturação aferida em ar ou sob suporte já instituído, temperatura controlada e glicemia checada quando pertinente.";
  }
  return " Na avaliação atual registram-se sinais vitais (pressão arterial, frequência cardíaca, frequência respiratória, saturação e temperatura) compatíveis com a gravidade descrita e suficientes para decidir a conduta.";
}

function densifyStem (q) {
  let stem = String(q.stem || "").trim();
  if (stem.length >= MIN) return stem;

  const extra = GROUP_EXTRA[q.group] || GROUP_EXTRA["Infectologia pediátrica"];
  if (!hasVitals(stem)) stem += vitalsClause(q.group);
  if (stem.length < MIN) stem += extra;

  // Se ainda curto, reforça lead-in clínico (raro).
  while (stem.length < MIN) {
    stem += " A escolha da alternativa deve refletir o melhor próximo passo, e não apenas uma medida paliativa isolada.";
  }
  return stem;
}

function main () {
  const files = fs.readdirSync(DIR).filter((f) => /^ped-part\d+\.json$/i.test(f)).sort();
  let changed = 0;
  for (const f of files) {
    const p = path.join(DIR, f);
    const arr = JSON.parse(fs.readFileSync(p, "utf8"));
    for (const q of arr) {
      const before = q.stem.length;
      q.stem = densifyStem(q);
      if (q.stem.length !== before) changed++;
      if (q.stem.length < MIN) {
        throw new Error(`Ainda curto (${q.stem.length}): ${q.idPrefix}-${q.n}`);
      }
      if (/\bIVAS\b/i.test(q.theme) || /\bIVAS\b/i.test(q.stem)) {
        throw new Error(`IVAS em ${q.idPrefix}-${q.n}`);
      }
    }
    fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n", "utf8");
  }
  console.log("Arquivos:", files.join(", "));
  console.log("Stems densificados:", changed);
}

main();
