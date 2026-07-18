const fs = require("fs");

const puberdade = {
  id: "gin1-puberdade",
  name: "Puberdade · precoce e tardia",
  specialty: "go",
  cards: [
    {
      front: "Marcos clássicos da puberdade feminina (ordem aproximada)?",
      back: "Telarca (#1) → pubarca → estirão → menarca · Idade média da menarca ~12–13a (varia) · Telarca antes dos 8a exige investigação de precocidade"
    },
    {
      front: "Puberdade precoce: definição operacional na menina?",
      back: "Surgimento de caracteres sexuais secundários <8 anos · Menarca precoce também alerta · Separar central (GnRH-dependente) × periférica (independente)"
    },
    {
      front: "Puberdade precoce central × periférica: diferença-chave?",
      back: "Central (PPC): ativação precoce do eixo HHO (GnRH → FSH/LH) · Periférica: esteroides sexuais sem ativação central (tumor ovariano/adrenal, exposição exógena, McCune-Albright)"
    },
    {
      front: "1ºs passos na investigação da puberdade precoce?",
      back: "Idade óssea · Exame + curva de crescimento · LH/FSH (± estímulo com análogo de GnRH) · Estradiol · US pélvica · Se periférica: androgênios/17-OHP/imagem adrenal-ovariana"
    },
    {
      front: "Tratamento clássico da puberdade precoce central idiopática?",
      back: "Análogo de GnRH (suprime eixo) · Objetivo: preservar estatura final + evitar menarca precoce/impacto psicossocial · Monitorar resposta clínica e idade óssea"
    },
    {
      front: "Puberdade tardia / atraso puberal: quando investigar?",
      back: "Ausência de telarca aos 13a · Ou ausência de menarca aos 15–16a com desenvolvimento mamário há anos · Sobrepor com amenorreia primária"
    },
    {
      front: "Causas clássicas de atraso puberal que caem?",
      back: "Constitucional (familiar) · Hipogonadismo hipogonadotrófico (Kallmann, funcional) · Hipogonadismo hipergonadotrófico (Turner/disgenesia) · Doença crônica / desnutrição"
    },
    {
      front: "Kallmann: pegadinha clássica?",
      back: "Hipogonadismo hipogonadotrófico + anosmia/hiposmia · Falha de migração dos neurônios GnRH · FSH baixo diferencia de Turner (FSH alto)"
    }
  ]
};

const infertilidade = {
  id: "gin1-infertilidade",
  name: "Infertilidade conjugal",
  specialty: "go",
  cards: [
    {
      front: "Definição clássica de infertilidade?",
      back: "Ausência de gestação após 12 meses de relações regulares sem contracepção · Investigar após 6 meses se mulher ≥35a · Primária (nunca engravidou) × secundária"
    },
    {
      front: "Quando iniciar investigação mais cedo (<12 meses)?",
      back: "Idade ≥35a · Ciclos irregulares/anovulação · Antecedente de DIP/cirurgia pélvica · Endometriose conhecida · Fator masculino conhecido · Amenorreia"
    },
    {
      front: "Pilares da investigação inicial do casal?",
      back: "História + exame · Confirmar ovulação (progesterona lútea / kits / US) · Reserva ovariana se indicada (AMH/FSH D3) · Avaliação tubária (HSG) · Espermograma (cedo!)"
    },
    {
      front: "Por que pedir espermograma cedo?",
      back: "Fator masculino é frequente · Evita investigação invasiva unilateral · Barato e muda conduta · Repetir se alterado"
    },
    {
      front: "HSG: o que avalia e quando pedir?",
      back: "Histerossalpingografia · Permeabilidade tubária + cavidade uterina · Após excluir infecção ativa · Alternativas: HyCoSy / laparoscopia + azul"
    },
    {
      front: "Fator ovulatório: causas e 1ª abordagens?",
      back: "SOP (#1) · HiperPRL · Hipotalâmica · Tireoidopatia · Conduta: tratar causa · Indução: letrozol (SOP) / clomifeno · Monitorar ovulação e risco de gemelaridade/OHSS"
    },
    {
      front: "Fator tubário: pistas e conduta geral?",
      back: "DIP prévia · Cirurgia · Endometriose · HSG alterada · Conduta: FIV frequentemente preferida se dano bilateral grave · Cirurgia selecionada em aderências focais"
    },
    {
      front: "Endometriose e infertilidade: mensagem de prova?",
      back: "Pode reduzir fertilidade mesmo sem obstrução óbvia · Cirurgia selecionada (dor + desejo) · Em infertilidade pura avançada, FIV costuma ser o caminho · Não operar tudo sem indicação"
    },
    {
      front: "Quando encaminhar direto à reprodução assistida?",
      back: "Idade avançada · Reserva ovariana baixa · Fator tubário bilateral grave · Fator masculino grave · Falha de indução/ciclos bem conduzidos · Após aconselhamento do casal"
    }
  ]
};

const dismenorreia = {
  id: "gin2-dismenorreia",
  name: "Dismenorreia",
  specialty: "go",
  cards: [
    {
      front: "Dismenorreia primária × secundária?",
      back: "Primária: dor menstrual sem patologia pélvica demonstrável (jovens; inicia com ciclos ovulatórios) · Secundária: causa orgânica (endometriose, adenomiose, mioma, DIP, estenose, DIU)"
    },
    {
      front: "Fisiopatologia clássica da dismenorreia primária?",
      back: "Aumento de prostaglandinas endometriais (ciclo ovulatório) → contração uterina, isquemia e dor · Por isso AINE (inibidor de COX) é 1ª linha"
    },
    {
      front: "Tratamento de 1ª linha da dismenorreia primária?",
      back: "AINE (iniciar com/antes do fluxo; dose plena) · Se falha ou desejo contraceptivo: ACO · Calor local / MEV · Avaliar adesão antes de rotular refratária"
    },
    {
      front: "Quando suspeitar de dismenorreia secundária?",
      back: "Início tardio (>25a) · Piora progressiva · Dor fora do período menstrual · Dispareunia profunda · Infertilidade · SUA associado · Massa / DIP · Falha a AINE+ACO bem usados"
    },
    {
      front: "Investigação inicial se suspeita secundária?",
      back: "Exame especular/toque · beta-hCG se sexualmente ativa · US pélvica · Investigar IST/DIP se risco · Laparoscopia se endometriose refratária / massa / dúvida"
    },
    {
      front: "Papel do ACO e do SIU-LNG na dor menstrual?",
      back: "ACO: reduz prostaglandinas / atrofia endometrial relativa · SIU-LNG: excelente em adenomiose/SUA e pode reduzir dismenorreia · Escolher conforme desejo contraceptivo e causa"
    },
    {
      front: "Pegadinha: dor cíclica + infertilidade + dispareunia?",
      back: "Pensar endometriose até prova em contrário · Não atribuir automaticamente a dismenorreia primária · Encaminhar investigação conforme gravidade"
    }
  ]
};

function insertAfter (order, afterId, newId) {
  if (order.includes(newId)) return order;
  const i = order.indexOf(afterId);
  if (i === -1) return order.concat(newId);
  const out = order.slice();
  out.splice(i + 1, 0, newId);
  return out;
}

function patchRev (path, patches) {
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  data.profiles.forEach((p) => {
    let o = p.deckOrder || [];
    for (const [after, id] of patches) o = insertAfter(o, after, id);
    p.deckOrder = o;
  });
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(path, data.profiles.map((p) => p.deckOrder.length).join(","));
}

const g1 = JSON.parse(fs.readFileSync("data/flashcards-gin1.json", "utf8"));
const g2 = JSON.parse(fs.readFileSync("data/flashcards-gin2.json", "utf8"));
if (!g1.find((d) => d.id === "gin1-puberdade")) g1.push(puberdade);
if (!g1.find((d) => d.id === "gin1-infertilidade")) g1.push(infertilidade);
if (!g2.find((d) => d.id === "gin2-dismenorreia")) g2.push(dismenorreia);
fs.writeFileSync("data/flashcards-gin1.json", JSON.stringify(g1, null, 2) + "\n");
fs.writeFileSync("data/flashcards-gin2.json", JSON.stringify(g2, null, 2) + "\n");

patchRev("data/revisao-gin1.json", [
  ["gin1-amenorreia-primaria", "gin1-puberdade"],
  ["gin1-sop", "gin1-infertilidade"]
]);
patchRev("data/revisao-gin2.json", [["gin2-endometriose", "gin2-dismenorreia"]]);

const rg = JSON.parse(fs.readFileSync("data/revisao-ginecologia.json", "utf8"));
rg.profiles.forEach((p) => {
  let o = p.deckOrder || [];
  o = insertAfter(o, "gin1-amenorreia-primaria", "gin1-puberdade");
  o = insertAfter(o, "gin1-sop", "gin1-infertilidade");
  o = insertAfter(o, "gin2-endometriose", "gin2-dismenorreia");
  p.deckOrder = o;
});
fs.writeFileSync("data/revisao-ginecologia.json", JSON.stringify(rg, null, 2) + "\n");

console.log(
  "new",
  [puberdade, infertilidade, dismenorreia].map((d) => d.id + ":" + d.cards.length).join(", ")
);
console.log(
  "totals gin1",
  g1.length,
  g1.reduce((s, d) => s + d.cards.length, 0),
  "gin2",
  g2.length,
  g2.reduce((s, d) => s + d.cards.length, 0)
);
console.log("revisao-ginecologia", rg.profiles[0].deckOrder.length);
