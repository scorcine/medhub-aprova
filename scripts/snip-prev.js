/** Snips high-yield stretches from Prev1–4 extracts. */
const fs = require("fs");
const path = require("path");

function clean(s) {
  return s
    .replace(/t\.me\/\S+/g, "")
    .replace(/proibida venda[^\n]*/gi, "")
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function snipFile(n, markers) {
  const t = fs.readFileSync(path.join(__dirname, `../data/_extract_prev/Prev${n}-full.txt`), "utf8");
  const outDir = path.join(__dirname, `../data/_extract_prev/snips-prev${n}`);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, start, end] of markers) {
    const i = t.toLowerCase().indexOf(start.toLowerCase());
    if (i < 0) {
      console.log("MISS", `Prev${n}`, name, start);
      continue;
    }
    let j = t.length;
    if (end) {
      const k = t.toLowerCase().indexOf(end.toLowerCase(), i + 20);
      if (k > i) j = k;
    }
    const chunk = clean(t.slice(i, Math.min(j, i + 25000)));
    fs.writeFileSync(path.join(outDir, `${name}.txt`), chunk, "utf8");
    console.log("wrote", `Prev${n}/${name}.txt`, chunk.length);
  }
}

snipFile(1, [
  ["reforma-sus", "A REFORMA SANITÁRIA", "PRINCIPAIS DEFINIÇÕES LEGAIS"],
  ["principios", "PRINCÍPIOS", "O PROCESSO DE IMPLANTAÇÃO"],
  ["nob-noas", "AS NORMAS OPERACIONAIS", "GASTOS PÚBLICOS"],
  ["financiamento", "GASTOS PÚBLICOS COM SAÚDE", "AÇÕES E PROGRAMAS"],
  ["programas", "AÇÕES E PROGRAMAS", "PROMOÇÃO E ATENÇÃO"],
  ["aps-esf", "ATENÇÃO BÁSICA", "COMENTÁRIOS FINAIS"]
]);

snipFile(2, [
  ["desenhos", "DESENHOS EM ESTUDOS", "ANÁLISE DE DADOS EM ESTUDOS"],
  ["associacao", "MEDIDAS DE ASSOCIAÇÃO", "MEDIDAS DE SIGNIFICÂNCIA"],
  ["estatistica", "MEDIDAS DE SIGNIFICÂNCIA ESTATÍSTICA", "TESTES DIAGNÓSTICOS"],
  ["testes-dx", "TESTES DIAGNÓSTICOS", "RAZÕES DE VEROSSIMILHANÇA"],
  ["verossimilhanca", "RAZÕES DE VEROSSIMILHANÇA", "TESTES MÚLTIPLOS"]
]);

snipFile(3, [
  ["vigilancia", "VIGILÂNCIA EPIDEMIOLÓGICA", "BASES DE DADOS"],
  ["sistemas", "BASES DE DADOS DOS SISTEMAS", "LISTA NACIONAL"],
  ["notificacao", "LISTA NACIONAL DE DOENÇAS", "DOENÇAS EMERGENTES"],
  ["epidemias", "O PROCESSO EPIDÊMICO", "HISTÓRIA NATURAL"],
  ["hnd-prevencao", "HISTÓRIA NATURAL DA DOENÇA", "SAÚDE DO TRABALHADOR"],
  ["trabalhador", "SAÚDE DO TRABALHADOR", "ÉTICA MÉDICA"],
  ["etica", "ÉTICA MÉDICA", "TESTE SEU CONHECIMENTO"]
]);

snipFile(4, [
  ["indicadores", "OS INDICADORES DE SAÚDE", "PERFIL — INDICADORES"],
  ["perfil", "PERFIL — INDICADORES DE SAÚDE", "INDICADORES DE MORBIMORTALIDADE"],
  ["morbimortalidade", "INDICADORES DE MORBIMORTALIDADE", "B. ÍNDICES"],
  ["indices", "B. ÍNDICES", "CLASSIFICAÇÃO DE ISU"],
  ["isu", "CLASSIFICAÇÃO DE ISU", "TESTE SEU CONHECIMENTO"]
]);
