/**
 * Gera data/questions-pediatria.json (>=105 questões originais, pt-BR).
 * Uso: node scripts/build-questions-pediatria.js
 *
 * RNG com seed fixa → rebuild determinístico.
 * Gabarito em índice aleatório 0–3 (não fica sempre em B).
 */

const fs = require("fs");
const path = require("path");

const SEED = 20260719;
const OUT = path.join(__dirname, "..", "data", "questions-pediatria.json");

const EXAMS = ["enamed", "enare", "usp", "unifesp", "santa-casa", "amp"];
const YEARS = [2022, 2023, 2024, 2025];
const DIFFS = ["facil", "media", "dificil"];

/** Mulberry32 — RNG determinístico */
function createRng (seed) {
  let t = seed >>> 0;
  return function next () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Coloca a alternativa correta em índice aleatório 0–3.
 * @returns {{ choices: string[], answer: number }}
 */
function placeCorrect (correct, distractors, rng) {
  if (!Array.isArray(distractors) || distractors.length !== 3) {
    throw new Error("placeCorrect exige exatamente 3 distratores");
  }
  const answer = Math.floor(rng() * 4);
  const pool = distractors.slice();
  const choices = [];
  for (let i = 0; i < 4; i++) {
    if (i === answer) choices.push(correct);
    else choices.push(pool.shift());
  }
  return { choices, answer };
}

function meta (rng) {
  return {
    exam: EXAMS[Math.floor(rng() * EXAMS.length)],
    year: YEARS[Math.floor(rng() * YEARS.length)],
    difficulty: DIFFS[Math.floor(rng() * DIFFS.length)]
  };
}

/**
 * Definição bruta: correct + 3 wrongs; stem/explain/theme/group/idPrefix.
 * O índice do gabarito é decidido em runtime por placeCorrect.
 */
function buildBank () {
  /** @type {Array<{idPrefix:string,group:string,theme:string,stem:string,correct:string,wrongs:string[],explain:string}>} */
  const raw = [];

  // ── Neonatologia (18) ──────────────────────────────────────────
  const neo = [
    {
      theme: "Reanimação neonatal",
      stem: "RN a termo, nascido de parto vaginal, ao nascer apresenta FC de 80 bpm e respiração irregular após secagem e estímulo tátil. Vias aéreas posicionadas. Qual a próxima conduta prioritária segundo o algoritmo de reanimação neonatal?",
      correct: "Iniciar ventilação com pressão positiva (VPP)",
      wrongs: [
        "Iniciar compressões torácicas imediatamente",
        "Administrar adrenalina endovenosa",
        "Observar por mais 60 segundos sem intervenção"
      ],
      explain: "FC < 100 bpm ou esforço respiratório inadequado → VPP é o passo central. Compressões só após VPP efetiva se FC < 60."
    },
    {
      theme: "Reanimação neonatal",
      stem: "Durante reanimação neonatal, após 30 segundos de VPP efetiva com expansão torácica adequada, a FC permanece em 50 bpm. Qual a conduta imediata?",
      correct: "Iniciar compressões torácicas coordenadas à VPP (3:1) e garantir via aérea",
      wrongs: [
        "Aumentar apenas a FiO2 para 100% sem compressões",
        "Administrar bicarbonato de sódio de rotina",
        "Interromper a VPP e observar"
      ],
      explain: "FC < 60 após VPP efetiva indica compressões 3:1 e revisão da ventilação; adrenalina se persistir."
    },
    {
      theme: "Reanimação neonatal",
      stem: "RN de 28 semanas, nascimento em sala de parto. Qual concentração inicial de oxigênio é preferível ao iniciar a reanimação, conforme diretrizes atuais?",
      correct: "Oxigênio em baixa concentração (cerca de 21–30%), titulando pela oximetria",
      wrongs: [
        "Sempre FiO2 100% desde o primeiro minuto",
        "Ar ambiente sem possibilidade de titulação",
        "Óxido nítrico inalatório de rotina"
      ],
      explain: "Em prematuros inicia-se com O2 baixo (≈21–30%) e titula-se pela SpO2 alvo por minuto de vida."
    },
    {
      theme: "Icterícia neonatal",
      stem: "RN a termo, 36 horas de vida, ictérico até raíz de coxas, mãe O−, RN A+, Coombs direto positivo, bilirrubina total 16 mg/dL. Qual a hipótese mais provável e o manejo inicial típico?",
      correct: "Doença hemolítica por incompatibilidade ABO; fototerapia conforme nomograma",
      wrongs: [
        "Icterícia fisiológica isolada; apenas observação domiciliar",
        "Atresia de vias biliares; colangiografia imediata",
      "Hipotireoidismo congênito; levotiroxina sem fototerapia"
      ],
      explain: "Icterícia precoce + incompatibilidade ABO/Coombs+ sugere hemólise; fototerapia guiada por nomograma (e exsanguineotransfusão se limiar)."
    },
    {
      theme: "Icterícia neonatal",
      stem: "Lactente de 28 dias com icterícia persistente, fezes acólicas e hepatomegalia. Bilirrubina direta elevada. Qual conduta diagnóstica inicial mais adequada?",
      correct: "Investigar colestase (ex.: ultrassom e exclusão urgente de atresia biliar)",
      wrongs: [
        "Aguardar resolução espontânea até 3 meses",
        "Indicar fototerapia domiciliar isolada",
        "Tratar empiricamente como incompatibilidade Rh"
      ],
      explain: "Colestase neonatal (BD elevada, fezes acólicas) exige investigação urgente — atresia biliar tem janela cirúrgica crítica."
    },
    {
      theme: "Sepse neonatal",
      stem: "RN de 18 horas de vida, filho de mãe com corioamnionite, apresenta taquicardia, má perfusão e febre. Hemograma com neutropenia e PCR elevada. Qual antibioticoterapia empírica inicial típica para sepse precoce?",
      correct: "Ampicilina associada a gentamicina",
      wrongs: [
        "Vancomicina isolada",
        "Ceftriaxona em dose única sem associação",
        "Somente antifúngico empírico"
      ],
      explain: "Sepse precoce: cobrir SGB e bacilos Gram-negativos com ampicilina + aminoglicosídeo."
    },
    {
      theme: "Sepse neonatal",
      stem: "RN pré-termo internado em UTI neonatal, dia 12 de vida, com apneias novas, distensão abdominal e hemocultura positiva para Staphylococcus coagulase-negativo. Qual o contexto clínico mais compatível?",
      correct: "Sepse neonatal tardia associada a dispositivo/cateter",
      wrongs: [
        "Sepse precoce exclusiva por Streptococcus do grupo B",
        "Infecção congênita por rubéola sem sepse",
        "Reação transfusional hemolítica aguda"
      ],
      explain: "Sepse tardia (>72 h) em prematuro com acesso vascular costuma envolver SCN e outros nosocomiais."
    },
    {
      theme: "SDR/taquipneia",
      stem: "RN de 34 semanas, desconforto respiratório progressivo nas primeiras horas, retrações e grunting. Radiografia com reticulogranularidade difusa e broncograma aéreo. Diagnóstico mais provável?",
      correct: "Síndrome do desconforto respiratório (doença da membrana hialina)",
      wrongs: [
        "Taquipneia transitória do RN sem envolvimento alveolar",
        "Pneumonia a vírus sincicial exclusivamente",
        "Cardiopatia congênita cianótica sem desconforto"
      ],
      explain: "SDR do prematuro: déficit de surfactante → padrão reticulogranular e broncograma; manejo com suporte e surfactante se indicado."
    },
    {
      theme: "SDR/taquipneia",
      stem: "RN a termo, nascido de cesárea eletiva sem trabalho de parto, com taquipneia desde o nascimento, boa oxigenação em ar ambiente e RX com líquido em fissuras. Evolução favorável em 24–48 h. Diagnóstico mais provável?",
      correct: "Taquipneia transitória do recém-nascido",
      wrongs: [
        "Doença da membrana hialina clássica do termo",
        "Hérnia diafragmática congênita",
        "Atresia de esôfago com fístula"
      ],
      explain: "TTRN: retardo na reabsorção do líquido pulmonar, comum após cesárea; curso autolimitado."
    },
    {
      theme: "Hipoglicemia",
      stem: "RN filho de mãe diabética, 2 horas de vida, assintomático. Glicemia capilar 35 mg/dL. Conduta inicial mais adequada?",
      correct: "Oferecer aleitamento/leite e reavaliar a glicemia precocemente",
      wrongs: [
        "Administrar glucagon IM de rotina sem alimentar",
        "Iniciar insulina intravenosa",
        "Aguardar 12 horas sem intervenção"
      ],
      explain: "Hipoglicemia assintomática leve: alimentar e monitorar; glicose IV se sintomático, grave ou refratário."
    },
    {
      theme: "Hipoglicemia",
      stem: "RN a termo com tremores, hypotonia e convulsão no período neonatal precoce. Glicemia 18 mg/dL. Qual a prioridade terapêutica imediata?",
      correct: "Corrigir a hipoglicemia com glicose intravenosa (bolus + manutenção)",
      wrongs: [
        "Fenobarbital antes de medir/corrigir glicemia",
        "Apenas fórmula oral fracionada sem via venosa",
        "Exsanguineotransfusão como primeira medida"
      ],
      explain: "Hipoglicemia sintomática grave é emergência: glicose IV imediata para proteger o SNC."
    },
    {
      theme: "TORCH/infecções congênitas",
      stem: "RN com microcefalia, calcificações intracranianas periventriculares, coriorretinite e petéquias. Sorologia materna IgM para CMV positiva na gestação. Agente mais provável?",
      correct: "Citomegalovírus congênito",
      wrongs: [
        "Toxoplasmose congênita com calcificações exclusivamente difusas sem outros achados",
        "Sífilis congênita sem acometimento neurológico",
        "HSV neonatal limitado a vesículas cutâneas"
      ],
      explain: "CMV congênito clássico: microcefalia, calcificações periventriculares, coriorretinite e alterações hematológicas."
    },
    {
      theme: "TORCH/infecções congênitas",
      stem: "RN com coriza sanguinolenta, hepatoesplenomegalia, rash maculopapular e radiografia com periostite. VDRL materno positivo não tratado. Diagnóstico mais provável?",
      correct: "Sífilis congênita",
      wrongs: [
        "Rubéola congênita sem achados ósseos",
        "Infecção por Zika com apenas microcefalia",
        "Sepse exclusiva por Listeria sem manifestações cutâneo-ósseas"
      ],
      explain: "Sífilis congênita: snuffles, hepatoesplenomegalia, rash e alterações ósseas; tratar com penicilina."
    },
    {
      theme: "TORCH/infecções congênitas",
      stem: "Gestante com primoinfecção por toxoplasmose no 2º trimestre. RN assintomático ao nascer. Qual medida é fundamental no seguimento?",
      correct: "Investigação e tratamento do RN conforme protocolo (ex.: IgM/IgA, PCR e oftalmo/neuroimagem)",
      wrongs: [
        "Alta sem qualquer investigação por estar assintomático",
        "Vacinação antimeningocócica exclusiva como prevenção",
        "Corticoterapia sistêmica de rotina em todos os RN"
      ],
      explain: "Toxoplasmose congênita pode ser subclínica ao nascer; exige investigação e tratamento para prevenir sequelas."
    },
    {
      theme: "Prematuridade",
      stem: "RN de 27 semanas, 980 g, em UTI. Além do suporte respiratório, qual intervenção é essencial para prevenir hemorragia peri-intraventricular nas primeiras horas?",
      correct: "Manter estabilidade hemodinâmica/térmica e evitar manobras que gerem flutuações bruscas de fluxo cerebral",
      wrongs: [
        "Estimular mudanças posturais frequentes e vigorosas",
        "Restringir completamente qualquer suporte ventilatório",
        "Administrar AINE de rotina em todos os prematuros extremos sem critério"
      ],
      explain: "Prevenção de HIVH: minimal handling, estabilidade térmica/hemodinâmica e ventilação cuidadosa."
    },
    {
      theme: "Prematuridade",
      stem: "Prematuro de 30 semanas, 10 dias de vida, recebe dieta enteral crescente por sonda e apresenta distensão, resíduos biliosos e sangue nas fezes. Radiografia com pneumatose intestinal. Diagnóstico mais provável?",
      correct: "Enterocolite necrosante",
      wrongs: [
        "Refluxo gastroesofágico fisiológico simples",
        "Invaginação intestinal típica do lactente maior",
        "Constipação funcional do prematuro"
      ],
      explain: "ECN: prematuro + sinais digestivos + pneumatose; jejum, ATB e suporte; cirurgia se perfuração/necrose."
    },
    {
      theme: "Prematuridade",
      stem: "RN prematuro de 32 semanas recebe profilaxia com surfactante e CPAP. Qual vitaminoprofilaxia/suplementação é rotineiramente importante no seguimento do prematuro para prevenir doença metabólica óssea e deficiências?",
      correct: "Suplementação de vitamina D (e atenção a cálcio/fósforo conforme protocolo)",
      wrongs: [
        "Vitamina K diária em altas doses por 6 meses sem indicação",
        "Vitamina A em megadoses semanais para todos",
        "Suspensão de ferro até os 2 anos"
      ],
      explain: "Prematuros precisam de vitamina D (e monitoramento mineral); ferro também é suplementado em momento adequado."
    },
    {
      theme: "Reanimação neonatal",
      stem: "RN com mecônio espesso no líquido amniótico nasce vigoroso, chora e tem bom tônus. Qual a conduta em relação às vias aéreas?",
      correct: "Cuidados de rotina; não é mandatória aspiração traqueal só pelo mecônio se vigoroso",
      wrongs: [
        "Intubação e aspiração traqueal obrigatória em todos com mecônio",
        "Laringoscopia de rotina mesmo se vigoroso",
        "Adrenalina profilática antes de qualquer avaliação"
      ],
      explain: "Se o RN com mecônio está vigoroso: cuidados de rotina. Aspiração traqueal não é rotina só pela presença de mecônio."
    }
  ];
  neo.forEach((q, i) => {
    raw.push({
      idPrefix: "ped-neo",
      n: i + 1,
      group: "Neonatologia",
      ...q
    });
  });

  // ── Puericultura (18) ──────────────────────────────────────────
  const puer = [
    {
      theme: "Vacinas/PNI",
      stem: "Lactente de 2 meses em consulta de puericultura, saudável, sem contraindicações. Segundo o calendário do PNI, qual conjunto melhor representa vacinas típicas dessa idade?",
      correct: "Pentavalente, VIP, pneumocócica 10-valente e rotavírus",
      wrongs: [
        "HPV e herpes-zóster",
        "Apenas febre amarela e dTpa adulto",
        "BCG e hepatite B como únicas doses aos 2 meses"
      ],
      explain: "Aos 2 meses: penta, VIP, pneumo e rota (além de esquemas já iniciados ao nascer: BCG/HepB)."
    },
    {
      theme: "Vacinas/PNI",
      stem: "Criança de 15 meses comparece para vacinação. Além de reforços do esquema básico, qual vacina é tipicamente aplicada nessa faixa no PNI (quando indicada na idade)?",
      correct: "Tríplice viral (SCR) — dose do esquema, se ainda não aplicada/conforme calendário",
      wrongs: [
        "Vacina meningocócica ACWY exclusiva de adultos",
        "Vacina contra herpes-zóster",
        "Vacina antirrábica de rotina em todos sem exposição"
      ],
      explain: "SCR integra o calendário na infância (1ª dose em geral aos 12 meses; reforços conforme PNI vigente)."
    },
    {
      theme: "Vacinas/PNI",
      stem: "Adolescente de 11 anos, sexo feminino, em consulta. Qual vacina é priorizada no PNI nessa faixa etária para prevenção de câncer relacionado ao HPV?",
      correct: "Vacina HPV conforme calendário do PNI para a faixa etária",
      wrongs: [
        "BCG de reforço anual",
        "Rotavírus de rotina aos 11 anos",
        "Pentavalente como dose única na adolescência"
      ],
      explain: "HPV está no calendário do adolescente (faixas e doses conforme PNI atualizado)."
    },
    {
      theme: "Vacinas/PNI",
      stem: "Lactente de 4 meses recebeu rotavírus monovalente. A mãe pergunta sobre contraindicação absoluta. Qual situação impede nova dose de rotavírus?",
      correct: "História de invaginação intestinal prévia",
      wrongs: [
        "Coriza leve no dia da vacina",
        "Uso de paracetamol há 24 horas",
        "Irmão com asma controlada"
      ],
      explain: "Invaginação prévia é contraindicação à vacina contra rotavírus."
    },
    {
      theme: "Crescimento/DNPM",
      stem: "Lactente de 6 meses, em aleitamento materno exclusivo, percentil 50 de peso e comprimento. Marcos: sustenta a cabeça, rola, agarra objetos e balbucia. Conduta?",
      correct: "Manter acompanhamento de rotina; desenvolvimento adequado para a idade",
      wrongs: [
        "Solicitar imediatamente RM de crânio",
        "Iniciar estimulação como se houvesse atraso grave",
        "Suspender aleitamento e introduzir fórmula exclusivamente"
      ],
      explain: "Marcos e crescimento adequados → reforçar puericultura e orientação alimentar oportuna."
    },
    {
      theme: "Crescimento/DNPM",
      stem: "Criança de 18 meses ainda não anda sem apoio e não fala palavras com significado. Gestação e neonatal sem intercorrências. Qual a conduta mais adequada?",
      correct: "Investigar atraso de DNPM e encaminhar para avaliação especializada/estimulação precoce",
      wrongs: [
        "Aguardar até os 4 anos para qualquer avaliação",
        "Diagnosticar autismo apenas pelo atraso motor",
        "Indicar cirurgia ortopédica de rotina"
      ],
      explain: "Não andar aos 18 meses e ausência de palavras exige investigação e intervenção precoce."
    },
    {
      theme: "Crescimento/DNPM",
      stem: "Pré-escolar com queda do percentil de peso de P50 para P3 em 6 meses, apetite seletivo e telas prolongadas nas refeições. Primeiro passo na abordagem?",
      correct: "Avaliar história alimentar, dinâmica das refeições e causas orgânicas comuns; orientar rotina",
      wrongs: [
        "Indicar gastrostomia de imediato",
        "Prescrever corticoides anabolizantes",
        "Internar em UTI para nutrição parenteral sem avaliação"
      ],
      explain: "Queda ponderal: anamnese alimentar/psicossocial + exclusão de orgânico; orientação da rotina alimentar."
    },
    {
      theme: "Aleitamento",
      stem: "RN de 10 dias, perda ponderal de 12% em relação ao nascimento, mamadas demoradas, dor materna no mamilo e esvaziamento incompleto. Conduta prioritária?",
      correct: "Avaliar e corrigir pega/posição, aumentar frequência de mamadas e acompanhar ganho de peso",
      wrongs: [
        "Suspender aleitamento e iniciar fórmula sem tentativa de correção",
        "Antibiótico materno de rotina sem avaliação",
        "Internação para fototerapia sem checar icterícia"
      ],
      explain: "Perda >10% e dificuldades de pega: suporte ao aleitamento, correção técnica e monitoramento."
    },
    {
      theme: "Aleitamento",
      stem: "Mãe HIV positiva em acompanhamento, deseja amamentar. No Brasil, qual a orientação padrão de alimentação do RN em relação ao aleitamento materno?",
      correct: "Contraindicar aleitamento materno e oferecer fórmula infantil conforme protocolo",
      wrongs: [
        "Estimular aleitamento exclusivo sem restrições",
        "Permitir aleitamento apenas à noite",
        "Indicar aleitamento misto livre sem orientação"
      ],
      explain: "No Brasil, mães vivendo com HIV não devem amamentar; usa-se fórmula e medidas do protocolo."
    },
    {
      theme: "Aleitamento",
      stem: "Lactente de 3 meses em AME, mãe retorna ao trabalho. Qual orientação está mais alinhada à promoção do aleitamento?",
      correct: "Ordenha e armazenamento adequado do leite; manter AME até 6 meses se possível",
      wrongs: [
        "Interromper aleitamento definitivamente aos 3 meses",
        "Introduzir mel para complementar calorias",
        "Oferecer chá de erva-doce em substituição às mamadas"
      ],
      explain: "AME até 6 meses; ordenha e conservação correta permitem manutenção do aleitamento."
    },
    {
      theme: "Aleitamento",
      stem: "Qual alimento é contraindicado abaixo de 1 ano de idade pelo risco de botulismo?",
      correct: "Mel",
      wrongs: [
        "Banana amassada após 6 meses",
        "Carne bem cozida na introdução alimentar",
        "Iogurte natural sem açúcar após idade apropriada"
      ],
      explain: "Mel é contraindicado <1 ano pelo risco de botulismo infantil."
    },
    {
      theme: "Anemia ferropriva prevenção",
      stem: "Lactente a termo, 6 meses, em aleitamento materno, inicia alimentação complementar. Qual medida preventiva de anemia ferropriva é recomendada na prática brasileira?",
      correct: "Suplementação profilática de ferro conforme protocolo (e alimentação rica em ferro)",
      wrongs: [
        "Evitar qualquer fonte de ferro até os 2 anos",
        "Transfusão sanguínea profilática trimestral",
        "Vitamina C isolada sem atenção ao ferro"
      ],
      explain: "Profilaxia com ferro (esquema MS/SBP) e introdução de alimentos fontes de ferro."
    },
    {
      theme: "Anemia ferropriva prevenção",
      stem: "Prematuro de 34 semanas, agora com 2 meses de idade corrigida, em seguimento ambulatorial. Em relação ao ferro, qual afirmação é mais correta?",
      correct: "Prematuros têm maior risco de deficiência e geralmente necessitam suplementação mais precoce/intensificada",
      wrongs: [
        "Prematuros nunca precisam de ferro suplementar",
        "Ferro só se inicia após os 5 anos",
        "Anemia ferropriva não ocorre em prematuros"
      ],
      explain: "Reservas de ferro são menores no prematuro; suplementação costuma ser mais precoce."
    },
    {
      theme: "Vacinas/PNI",
      stem: "Criança de 5 anos chega para reforço escolar. Qual vacina de reforço é típica nessa idade no calendário nacional?",
      correct: "DTP (ou reforço tríplice bacteriana) e VIP/VOP conforme esquema vigente, além de SCR se indicado",
      wrongs: [
        "Apenas vacina contra COVID como única dose da vida",
        "Rotavírus de reforço aos 5 anos",
        "BCG anual obrigatória"
      ],
      explain: "Por volta dos 4–5 anos há reforços de DTP e pólio (e verificação de SCR), conforme PNI."
    },
    {
      theme: "Crescimento/DNPM",
      stem: "Na curva de crescimento, menina de 4 anos está no P97 de IMC, com história familiar de obesidade. Melhor abordagem inicial?",
      correct: "Orientar hábitos alimentares e atividade física; investigar comorbidades conforme indicação",
      wrongs: [
        "Cirurgia bariátrica imediata",
        "Dieta cetogênica rígida sem acompanhamento",
        "Apenas tranquilizar sem qualquer orientação"
      ],
      explain: "Obesidade infantil: mudanças de estilo de vida e rastreio de comorbidades; evitar medidas extremas iniciais."
    },
    {
      theme: "Crescimento/DNPM",
      stem: "Lactente de 9 meses não senta sem apoio e apresenta hipotonia. Reflexo de Moro ainda presente. Conduta?",
      correct: "Encaminhar para avaliação neurológica/DNPM por atraso motor e persistência de reflexo primitivo",
      wrongs: [
        "Considerar normal até os 2 anos sem avaliação",
        "Indicar apenas troca de fórmula",
        "Prescrever antibiótico empírico"
      ],
      explain: "Não sentar aos 9 meses + Moro persistente sugere atraso/neurológico — avaliação especializada."
    },
    {
      theme: "Anemia ferropriva prevenção",
      stem: "Pré-escolar de 2 anos com dieta baseada em leite de vaca em excesso (>700 mL/dia) e poucos alimentos com ferro. Principal risco nutricional?",
      correct: "Anemia ferropriva",
      wrongs: [
        "Escorbuto por excesso de vitamina C",
        "Hipervitaminose D exclusiva",
        "Deficiência de vitamina K por leite"
      ],
      explain: "Excesso de leite de vaca e baixa ingestão de ferro → clássico risco de anemia ferropriva."
    },
    {
      theme: "Vacinas/PNI",
      stem: "RN na maternidade, mãe AgHBs positiva. Além da vacina hepatite B nas primeiras 12–24 h, qual medida adicional é indicada?",
      correct: "Imunoglobulina específica para hepatite B o mais breve possível",
      wrongs: [
        "Aguardar sorologia do RN aos 6 meses para decidir vacina",
        "Isolar o RN sem vacinar",
        "Indicar apenas vitamina K como profilaxia da hepatite"
      ],
      explain: "Filho de mãe AgHBs+: vacina HepB + imunoglobulina específica precocemente."
    }
  ];
  puer.forEach((q, i) => {
    raw.push({ idPrefix: "ped-puer", n: i + 1, group: "Puericultura", ...q });
  });

  // ── Infectologia pediátrica (14) ───────────────────────────────
  const infecto = [
    {
      theme: "Meningite",
      stem: "Lactente de 8 meses com febre, irritabilidade, fontanela abaulada e recusa alimentar. Suspeita de meningite bacteriana. Após estabilização e coleta quando possível, qual antibioticoterapia empírica inicial típica nessa idade?",
      correct: "Ceftriaxona (ou cefotaxima) associada a vancomicina, conforme protocolo local",
      wrongs: [
        "Apenas penicilina G isolada",
        "Oseltamivir como monoterapia",
        "Isoniazida + rifampicina sem cobrir pneumococo/meningococo"
      ],
      explain: "Meningite bacteriana comunitária: cefalosporina de 3ª geração ± vancomicina (resistência pneumocócica)."
    },
    {
      theme: "Meningite",
      stem: "Escolar com meningite meningocócica confirmada. Além do tratamento do caso índice, qual medida é essencial para contatos domiciliares íntimos?",
      correct: "Quimioprofilaxia dos contatos íntimos conforme protocolo",
      wrongs: [
        "Vacinar apenas o caso índice após alta, sem profilaxia dos contatos",
        "Isolamento dos contatos por 40 dias sem medicação",
        "Corticoterapia em todos os contatos assintomáticos"
      ],
      explain: "Contatos íntimos de doença meningocócica recebem quimioprofilaxia (ex.: rifampicina/ceftriaxona/cipro conforme guia)."
    },
    {
      theme: "Dengue",
      stem: "Criança de 7 anos no 4º dia de dengue, plaquetas 90.000, hematócrito estável, sem sangramento, alimentando-se e urinando bem. Sem sinais de alarme. Conduta?",
      correct: "Manejo ambulatorial com hidratação oral vigorosa, analgesia sem AINE e retorno se alarme",
      wrongs: [
        "Internação em UTI e expansão agressiva com coloides de rotina",
        "Transfusão de plaquetas profilática",
        "AAS em dose antiagregante"
      ],
      explain: "Sem sinais de alarme e estável: hidratação oral, evitar AAS/AINE, vigilância de alarme."
    },
    {
      theme: "Dengue",
      stem: "Adolescente com dengue apresenta dor abdominal intensa, vômitos persistentes, aumento rápido do hematócrito e pulso fino. Classificação e prioridade?",
      correct: "Dengue com sinais de alarme/grave em evolução; hidratação venosa supervisionada imediata",
      wrongs: [
        "Dengue clássica sem risco; alta com dipirona apenas",
        "Indicação exclusiva de antibiótico de amplo espectro",
        "Antiviral específico obrigatório em todos os casos"
      ],
      explain: "Sinais de alarme → observação e hidratação IV criteriosa; pode evoluir para choque."
    },
    {
      theme: "IVAS",
      stem: "Pré-escolar com coriza, tosse e febre baixa há 3 dias, orofaringe hiperemiada sem exsudato, sem dificuldade respiratória. Melhor conduta?",
      correct: "Medidas de suporte; antibiótico não indicado de rotina",
      wrongs: [
        "Amoxicilina por 10 dias em todos os casos",
        "Corticoterapia sistêmica de rotina",
        "Internação para oxigênio mesmo com saturação normal"
      ],
      explain: "IVAS viral: suporte. Antibiótico só se critérios de bacterialidade (ex.: otite/faringite estreptocócica)."
    },
    {
      theme: "Pneumonia",
      stem: "Criança de 3 anos com febre, taquipneia, tiragem subcostal e crepitações unilaterais. SatO2 96% em ar ambiente, aceitando via oral. Conduta inicial típica para pneumonia comunitária sem sinais de gravidade?",
      correct: "Amoxicilina oral e reavaliação ambulatorial próxima",
      wrongs: [
        "Vancomicina IV de rotina em todos",
        "Oseltamivir isolado sem considerar bacteriano",
        "Observação sem antibiótico em pneumonia bacteriana típica com tiragem"
      ],
      explain: "PAC sem gravidade: amoxicilina é primeira linha empírica em muitas faixas; gravidade indica internação."
    },
    {
      theme: "Diarreia/desidratação infecciosa",
      stem: "Lactente de 11 meses com diarreia aquosa há 2 dias, sem sangue, ativo, olhos úmidos, bebe com vontade. Qual plano de hidratação?",
      correct: "Plano A: SRO no domicílio, manter alimentação e orientar sinais de alarme",
      wrongs: [
        "Plano C com SF 0,9% em bolus repetidos na UTI",
        "Suspender alimentação por 72 horas",
        "Loperamida de rotina"
      ],
      explain: "Sem desidratação: Plano A (SRO preventivo, alimentação, vigilância)."
    },
    {
      theme: "Diarreia/desidratação infecciosa",
      stem: "Pré-escolar com diarreia, muco e sangue, febre e tenesmo. Qual etiologia é mais sugestiva?",
      correct: "Diarreia invasiva (ex.: Shigella/Salmonella/Campylobacter)",
      wrongs: [
        "Rotavírus exclusivamente aquoso sem sangue",
        "Intolerância à lactose como única causa de sangue",
        "Doença celíaca aguda febril típica"
      ],
      explain: "Disenteria (sangue/muco/febre) sugere enteropatógeno invasivo."
    },
    {
      theme: "Exantemas",
      stem: "Lactente 10 meses: febre alta por 3 dias que cessa, seguida de exantema maculopapular róseo no tronco. Diagnóstico mais provável?",
      correct: "Exantema súbito (roséola, HHV-6)",
      wrongs: [
        "Sarampo clássico com tosse/coriza/conjuntivite e manchas de Koplik",
        "Varicela com vesículas em vários estágios",
        "Escarlatina com sandpaper rash e Signal de Pastia"
      ],
      explain: "Roséola: febre alta → defervescência → exantema."
    },
    {
      theme: "Exantemas",
      stem: "Escolar com febre, tosse, coriza, conjuntivite e exantema céfalo-caudal; há manchas esbranquiçadas na mucosa oral. Diagnóstico?",
      correct: "Sarampo",
      wrongs: [
        "Roséola",
        "Eritema infeccioso (parvovírus) sem pródomos respiratórios intensos",
        "Urticária aguda isolada"
      ],
      explain: "Sarampo: pródomos (3C) + Koplik + exantema céfalo-caudal."
    },
    {
      theme: "ITU",
      stem: "Lactente febril de 3 meses, sem foco claro, urinálise com nitrito e leucócitos. Qual a melhor conduta inicial?",
      correct: "Coletar urocultura (método adequado) e iniciar antibiótico; avaliar necessidade de internação pela idade/gravidade",
      wrongs: [
        "Tratar só com analgesia sem antibiótico",
        "Aguardar 7 dias sem coleta de urina",
        "Cistoscopia de urgência em todos"
      ],
      explain: "ITU febril no lactente: urocultura + ATB; <3 meses frequentemente internar."
    },
    {
      theme: "ITU",
      stem: "Menina de 5 anos com disúria, polaciúria, sem febre, bom estado geral. Urocultura com E. coli sensível. Tratamento típico?",
      correct: "Antibiótico oral de acordo com o antibiograma/padrão local por curso curto adequado",
      wrongs: [
        "Nefrectomia parcial",
        "Apenas aumento de líquidos sem antibiótico em cistite sintomática confirmada",
        "Vancomicina IV prolongada de rotina"
      ],
      explain: "Cistite não complicada: ATB oral guiado por sensibilidade/padrão empírico local."
    },
    {
      theme: "IVAS",
      stem: "Criança de 6 anos com odinofagia, febre, exsudato amigdaliano e ausência de tosse. Teste rápido para estreptococo positivo. Conduta?",
      correct: "Antibiótico (ex.: penicilina/amoxicilina) para faringoamigdalite estreptocócica",
      wrongs: [
        "Apenas xarope antitussígeno",
        "Oseltamivir como primeira escolha",
        "Internação para drenagem sem abscessos"
      ],
      explain: "Estreptococo do grupo A confirmado: antibiótico para reduzir complicações e transmissão."
    },
    {
      theme: "Pneumonia",
      stem: "Adolescente com pneumonia atípica (tosse seca, febre baixa, infiltrado intersticial). Qual agente/tratamento empírico é frequentemente considerado?",
      correct: "Mycoplasma pneumoniae; macrolídeo quando indicado",
      wrongs: [
        "Apenas Staphylococcus aureus comunitário tratado com aciclovir",
        "Strongyloides como causa típica de pneumonia lobar",
        "Tratamento exclusivo com antifúngico azólico"
      ],
      explain: "Em escolares/adolescentes, Mycoplasma é causa comum de PAC atípica; macrolídeo é opção clássica."
    }
  ];
  infecto.forEach((q, i) => {
    raw.push({ idPrefix: "ped-inf", n: i + 1, group: "Infectologia pediátrica", ...q });
  });

  // ── Pneumologia / respiratório (10) ────────────────────────────
  const pneumo = [
    {
      theme: "Bronquiolite",
      stem: "Lactente de 5 meses, sibilância, tiragem, saturação 90% em ar ambiente, dificuldade para mamar, no pico sazonal de VSR. Conduta hospitalar prioritária?",
      correct: "Oxigenoterapia e suporte; evitar broncodilatador/corticoide de rotina sem resposta clara",
      wrongs: [
        "Corticoterapia sistêmica obrigatória em todos os casos",
        "Antibiótico de amplo espectro de rotina",
        "Fisioterapia torácica agressiva como tratamento específico"
      ],
      explain: "Bronquiolite: suporte (O2, hidratação). Beta2/corticoide não são rotina."
    },
    {
      theme: "Bronquiolite",
      stem: "Lactente com bronquiolite leve, saturação 97%, alimentando-se bem, sem tiragem importante. Conduta?",
      correct: "Manejo ambulatorial com orientações de alarme e higiene das vias aéreas superiores",
      wrongs: [
        "Internação obrigatória em UTI",
        "Ribavirina inalatória em todos",
        "Amoxicilina por 10 dias"
      ],
      explain: "Formas leves: ambulatorial com critérios de retorno."
    },
    {
      theme: "Asma",
      stem: "Criança de 8 anos com crise asmática: fala frases, SatO2 94%, sibilos difusos, FR elevada. Primeira linha na crise?",
      correct: "Beta2 de curta duração inalatório + corticoide sistêmico precoce",
      wrongs: [
        "Antibiótico de rotina",
        "Antitussígeno opioide",
        "Apenas nebulização com SF sem broncodilatador"
      ],
      explain: "Crise asmática: SABA + corticoide sistêmico; O2 se hipoxemia; reavaliar gravidade."
    },
    {
      theme: "Asma",
      stem: "Escolar com asma persistente moderada, despertares noturnos semanais apesar de SABA sob demanda. Próximo passo no controle?",
      correct: "Iniciar/otimizar corticoide inalatório de manutenção e revisar técnica inalatória",
      wrongs: [
        "Manter apenas SABA contínuo de hora em hora no domicílio",
        "Suspender toda medicação e observar",
        "Indicar lobectomia"
      ],
      explain: "Controle inadequado → CI (e educação/técnica); SABA não é manutenção isolada."
    },
    {
      theme: "Pneumonia",
      stem: "Lactente de 14 meses com pneumonia e SatO2 89%, tiragem intensa e recusa alimentar. Conduta?",
      correct: "Internação, oxigênio e antibiótico parenteral conforme protocolo",
      wrongs: [
        "Alta com xarope expectorante apenas",
        "Observação domiciliar sem oxigênio",
        "Corticoterapia isolada sem antibiótico/suporte"
      ],
      explain: "Sinais de gravidade (hipoxemia, tiragem, má aceitação) → internação."
    },
    {
      theme: "Laringite/crupe",
      stem: "Pré-escolar com rouquidão, tosse metálica e estridor leve sob agitação, sem cianose, SatO2 98%. Diagnóstico e tratamento inicial?",
      correct: "Crupe viral; corticoide (ex.: dexametasona) e observação; adrenalina nebulizada se estridor em repouso/grave",
      wrongs: [
        "Amigdalectomia de urgência",
        "Antibiótico antipseudomonas de rotina",
        "Intubação imediata em todos os crupes leves"
      ],
      explain: "Crupe: dexametasona; adrenalina nebulizada nas formas moderadas/graves."
    },
    {
      theme: "Laringite/crupe",
      stem: "Criança com febre alta, toxicidade, drooling e estridor, sentada em posição de tripé. Hipótese e conduta?",
      correct: "Epiglotite (diferencial de crupe); via aérea em ambiente controlado, sem examinar orofaringe agressivamente",
      wrongs: [
        "Crupe leve; alta com hidratação apenas",
        "Asma; apenas SABA",
        "Corpo estranho esofágico tratado com antibóticos"
      ],
      explain: "Toxicidade + drooling + tripé sugere epiglotite — priorizar via aérea segura."
    },
    {
      theme: "Asma",
      stem: "Adolescente asmático em UTI com crise grave, pouca entrada de ar, sonolência e SatO2 caindo. Além de O2/SABA/anticolinérgico/corticoide, qual medida pode ser necessária?",
      correct: "Suporte ventilatório e cuidados de emergência; considerar adjuvantes (ex.: sulfato de magnésio IV) conforme gravidade",
      wrongs: [
        "Alta hospitalar imediata",
        "Suspender oxigênio para 'estimular drive'",
        "Apenas anti-histamínico oral"
      ],
      explain: "Crise ameaçadora à vida: suporte avançado; MgSO4 IV é adjuvante em crises graves."
    },
    {
      theme: "Bronquiolite",
      stem: "Qual fator de risco aumenta a chance de bronquiolite grave por VSR?",
      correct: "Prematuridade e idade inferior a 6 meses",
      wrongs: [
        "Vacinação completa contra rotavírus",
        "Aleitamento materno exclusivo",
        "Idade escolar sem comorbidades"
      ],
      explain: "Prematuros e lactentes jovens têm maior risco de formas graves de VSR."
    },
    {
      theme: "Pneumonia",
      stem: "Criança vacinada incompletamente, pneumonia lobar com efusão. Agente bacteriano mais frequentemente implicado na PAC típica pediátrica?",
      correct: "Streptococcus pneumoniae",
      wrongs: [
        "Clostridium botulinum",
        "HPV",
        "Plasmodium vivax"
      ],
      explain: "Pneumococo permanece o principal agente da pneumonia bacteriana típica na infância."
    }
  ];
  pneumo.forEach((q, i) => {
    raw.push({ idPrefix: "ped-pneumo", n: i + 1, group: "Pneumologia / respiratório", ...q });
  });

  // ── Gastroenterologia (8) ──────────────────────────────────────
  const gastro = [
    {
      theme: "Desidratação/planos",
      stem: "Criança com diarreia, olhos fundos, sinal da prega lento, bebendo avidamente, lúcida. Qual plano de hidratação do MS?",
      correct: "Plano B: reidratação oral supervisionada com SRO em serviço de saúde",
      wrongs: [
        "Plano A exclusivamente domiciliar sem observação",
        "Plano C com acesso venoso imediato como única opção em todos",
        "Jeum absoluto por 48 h"
      ],
      explain: "Desidratação moderada → Plano B (SRO supervisionada)."
    },
    {
      theme: "Desidratação/planos",
      stem: "Lactente com diarreia, muito prostrado, choque, não bebe, pulsos fracos. Plano indicado?",
      correct: "Plano C: expansão intravenosa imediata com SF 0,9%",
      wrongs: [
        "Plano A domiciliar",
        "Apenas SRO por via oral forçada no choque",
        "Loperamida e alta"
      ],
      explain: "Desidratação grave/choque → Plano C (IV)."
    },
    {
      theme: "Refluxo",
      stem: "Lactente de 2 meses, regurgitações frequentes após mamadas, ganho ponderal adequado, sem sintomas de alarme. Conduta?",
      correct: "Orientações posturais/volume e tranquilização; RGE fisiológico",
      wrongs: [
        "Fundoplicatura imediata",
        "IBP de rotina em todos os regurgitadores",
        "Internação para NPT"
      ],
      explain: "RGE fisiológico: ganho adequado sem alarmes → medidas conservadoras."
    },
    {
      theme: "Refluxo",
      stem: "Lactente com refluxo, irritabilidade intensa, recusa alimentar, anemia e falha de crescimento. Próximo passo?",
      correct: "Avaliar DRGE complicada e considerar investigação/tratamento conforme gravidade",
      wrongs: [
        "Ignorar por ser sempre fisiológico",
        "Indicar apenas antitussígeno",
        "Cirurgia cardíaca de rotina"
      ],
      explain: "Sinais de alarme/falha ponderal sugerem DRGE patológica — avaliar e tratar."
    },
    {
      theme: "Invaginação",
      stem: "Lactente de 9 meses com crises de choro intenso intermitente, palidez, vômitos e fezes em 'geleia de morango'. Massa palpável em hipocôndrio direito. Diagnóstico mais provável?",
      correct: "Invaginação intestinal",
      wrongs: [
        "Constipação funcional simples",
        "Apendicite típica do adolescente",
        "Refluxo fisiológico"
      ],
      explain: "Idade + dor intermitente + fezes em geleia ± massa → invaginação; imagem e redução guiada/cirurgia."
    },
    {
      theme: "Invaginação",
      stem: "Suspeita de invaginação em lactente estável, sem peritonite. Qual método terapêutico não operatório é frequentemente empregado após confirmação?",
      correct: "Enema de ar ou contraste hidrostático guiado por imagem",
      wrongs: [
        "Apendicectomia laparoscópica de rotina",
        "Apenas antiespasmódico oral em casa",
        "Colonoscopia com polipectomia em todos"
      ],
      explain: "Redução por enema pneumático/hidrostático é padrão se sem sinais de perfuração/necrose."
    },
    {
      theme: "Constipação",
      stem: "Pré-escolar com evacuação a cada 4–5 dias, fezes endurecidas, escape fecal e medo de evacuar. Sem sinais de alarme. Abordagem inicial?",
      correct: "Desimpactação se necessário, laxativo osmótico (ex.: PEG) e treino intestinal/dieta",
      wrongs: [
        "Cirurgia de Hirschsprung sem investigação em todos",
        "Antibiótico prolongado",
        "Jeum e SNE de rotina"
      ],
      explain: "Constipação funcional: desimpactar, manutenção com PEG e hábitos."
    },
    {
      theme: "Constipação",
      stem: "RN com atraso na eliminação do mecônio (>48 h), distensão e vômitos biliosos. Qual hipótese deve ser investigada?",
      correct: "Doença de Hirschsprung (entre outros diferenciais de obstrução)",
      wrongs: [
        "Constipação funcional típica do escolar",
        "Intolerância à lactose do adulto",
        "Úlcera péptica duodenal clássica"
      ],
      explain: "Atraso de mecônio e obstrução no RN → investigar Hirschsprung/outras malformações."
    }
  ];
  gastro.forEach((q, i) => {
    raw.push({ idPrefix: "ped-gastro", n: i + 1, group: "Gastroenterologia", ...q });
  });

  // ── Urgências e emergências (8) ────────────────────────────────
  const urg = [
    {
      theme: "Anafilaxia",
      stem: "Criança com urticária disseminada, sibilos e hipotensão minutos após ingestão de amendoim. Conduta imediata prioritária?",
      correct: "Adrenalina intramuscular na face ântero-lateral da coxa",
      wrongs: [
        "Apenas anti-histamínico oral e observar em casa",
        "Corticoide isolado como primeira droga",
        "Antibiótico venoso"
      ],
      explain: "Anafilaxia: adrenalina IM imediata; depois suporte, anti-H1/corticoide como adjuvantes."
    },
    {
      theme: "Anafilaxia",
      stem: "Após adrenalina IM por anafilaxia, a criança melhora, mas há risco de reação bifásica. Conduta adequada?",
      correct: "Observação hospitalar por período adequado e prescrição de autoinjetor/orientação",
      wrongs: [
        "Alta imediata em 5 minutos sem orientação",
        "Proibir qualquer acompanhamento alergológico",
        "Substituir adrenalina por dipirona de rotina"
      ],
      explain: "Observar após anafilaxia; educar e disponibilizar adrenalina autoinjetável quando indicado."
    },
    {
      theme: "Estado de mal",
      stem: "Criança em convulsão tônico-clônica há 8 minutos, sem acesso venoso ainda. Medicação de primeira linha preferível?",
      correct: "Benzodiazepínico (ex.: midazolam intramuscular/intranasal ou diazepam retal conforme disponibilidade)",
      wrongs: [
        "Fenitoína oral ambulatorial",
        "Antibiótico intramuscular",
        "Insulina regular"
      ],
      explain: "Estado de mal: benzodiazepínico precoce; depois fármacos de segunda linha se persistir."
    },
    {
      theme: "Estado de mal",
      stem: "Lactente convulsivo, glicemia capilar 25 mg/dL. Além do benzodiazepínico se ainda convulsando, qual correção é imprescindível?",
      correct: "Glicose intravenosa para corrigir hipoglicemia",
      wrongs: [
        "Apenas restrição hídrica",
        "Bicarbonato de rotina sem gasometria",
        "Manitol empírico em todos"
      ],
      explain: "Sempre checar/corrigir hipoglicemia em convulsão pediátrica."
    },
    {
      theme: "PCR pediátrica",
      stem: "Criança em PCR em ritmo não chocável. Relação compressão:ventilação para 2 socorristas (via aérea avançada ainda não estabelecida) mais citada nas diretrizes pediátricas?",
      correct: "15 compressões : 2 ventilações",
      wrongs: [
        "30:2 exclusiva de adultos em qualquer cenário pediátrico com 2 socorristas",
        "5:1 com pausas de 1 minuto a cada ciclo",
        "Apenas ventilações sem compressões"
      ],
      explain: "PCR pediátrica com 2 socorristas (sem via avançada): 15:2; após via avançada, compressões contínuas + ventilações."
    },
    {
      theme: "Choque",
      stem: "Lactente com taquicardia, tempo de enchimento capilar 5 s, extremidades frias, PA ainda normal, pós-diarreia. Tipo de choque e conduta inicial?",
      correct: "Choque hipovolêmico compensado; expansão com cristaloides e reavaliação",
      wrongs: [
        "Choque cardiogênico; restringir volume em todos os casos de diarreia",
        "Choque distributivo exclusivo por adrenalina IM",
        "Observação sem volume"
      ],
      explain: "Sinais de má perfusão após perdas → hipovolemia; bolus de cristaloide e reassessorar."
    },
    {
      theme: "Corpo estranho",
      stem: "Pré-escolar engasgou com brinquedo pequeno: tosse ineficaz, cianose e estridor. Está consciente. Conduta imediata?",
      correct: "Manobras de desobstrução da via aérea adequadas à idade (compressões abdominais/torácicas conforme protocolo)",
      wrongs: [
        "Oferecer água para 'empurrar' o objeto",
        "Deitar e observar por 30 minutos sem manobras",
        "Antibiótico inalatório"
      ],
      explain: "Obstrução grave consciente: manobras de desobstrução; se IOR, iniciar RCP."
    },
    {
      theme: "Corpo estranho",
      stem: "Criança com história de engasgo há dias, tosse persistente unilateral e sibilância localizada. Radiografia com hiperinsuflação de um hemitórax. Hipótese?",
      correct: "Aspiração de corpo estranho com mecanismo valvular",
      wrongs: [
        "Asma exclusivamente simétrica sem história",
        "Pneumonia só por fungos",
        "Derrame pleural hipertensivo sem outros dados"
      ],
      explain: "Sibilância/hiperinsuflação unilateral + engasgo → corpo estranho; broncoscopia."
    }
  ];
  urg.forEach((q, i) => {
    raw.push({ idPrefix: "ped-urg", n: i + 1, group: "Urgências e emergências", ...q });
  });

  // ── Nefrologia (6) ─────────────────────────────────────────────
  const nefro = [
    {
      theme: "Síndrome nefrótica",
      stem: "Pré-escolar com edema periorbitário matinal, proteinúria maciça, hipoalbuminemia e dislipidemia. PA normal, complemento normal. Forma mais comum e conduta inicial típica?",
      correct: "Doença de lesão mínima; corticoterapia conforme protocolo",
      wrongs: [
        "GNPE; antibiótico isolado sem abordar proteinúria",
        "SHU; diálise imediata em todos",
        "ITU; apenas nitrofurantoína"
      ],
      explain: "SN idiopática (lesão mínima) é a mais comum em pré-escolares; corticoide é o tratamento inicial usual."
    },
    {
      theme: "Síndrome nefrótica",
      stem: "Criança com síndrome nefrótica em uso de corticoide apresenta ascite tensa e dor abdominal com sinais de peritonite. Complicação infecciosa clássica?",
      correct: "Peritonite bacteriana espontânea",
      wrongs: [
        "Otite média exclusiva",
        "Bronquiolite por VSR como única possibilidade",
        "Faringite viral sem relação"
      ],
      explain: "Nefróticos têm risco de PBE (ex.: pneumococo); força avaliação e ATB."
    },
    {
      theme: "GNPE",
      stem: "Escolar com hematúria cola, edema e hipertensão 2 semanas após impetigo. C3 baixo. Diagnóstico mais provável?",
      correct: "Glomerulonefrite pós-estreptocócica",
      wrongs: [
        "Nefropatia por IgA sincronizada com a faringite no mesmo dia",
        "Síndrome nefrótica por lesão mínima sem hematúria",
        "SHU típica por E. coli sem relação estreptocócica"
      ],
      explain: "GNPE: latência após pele/faringe, hematúria, HAS, C3 ↓."
    },
    {
      theme: "SHU",
      stem: "Pré-escolar após diarreia sanguinolenta evolui com palidez, oligúria, plaquetopenia e esquizócitos. Diagnóstico?",
      correct: "Síndrome hemolítico-urêmica típica (D+)",
      wrongs: [
        "Púrpura de Henoch-Schönlein sem falência renal",
        "Anemia ferropriva isolada",
        "ITP sem anemia hemolítica nem insuficiência renal"
      ],
      explain: "Tríade da SHU: anemia hemolítica microangiopática, plaquetopenia e LRA, frequentemente pós-diarreia (STEC)."
    },
    {
      theme: "ITU febril",
      stem: "Lactente de 5 meses com ITU febril. Após tratamento agudo, qual exame de imagem é frequentemente indicado na primeira ITU febril nessa faixa?",
      correct: "Ultrassonografia de vias urinárias",
      wrongs: [
        "Uretrocistografia miccional obrigatória em absolutamente todos sem critério",
        "RM de corpo inteiro de rotina",
        "Nenhum exame nunca é necessário"
      ],
      explain: "USG é o exame inicial usual após ITU febril no lactente; UCM conforme critérios de risco/recorrência."
    },
    {
      theme: "ITU febril",
      stem: "Menino de 8 meses com pielonefrite, jato urinário fraco e globo vesical intermitente. Qual preocupação anatômica merece investigação?",
      correct: "Obstrução/valva de uretra posterior ou outra uropatia",
      wrongs: [
        "Apenas fimose fisiológica sem avaliação do jato",
        "Refluxo exclusivo descartado só pela idade",
        "Litíase renal sem ultrassom"
      ],
      explain: "Sinais de obstrução em menino lactente → avaliar uropatia (ex.: VUP)."
    }
  ];
  nefro.forEach((q, i) => {
    raw.push({ idPrefix: "ped-nefro", n: i + 1, group: "Nefrologia", ...q });
  });

  // ── Endocrinologia (6) ─────────────────────────────────────────
  const endo = [
    {
      theme: "DM1 cetoacidose",
      stem: "Criança com poliúria, polidipsia, hálito cetônico, FC elevada, glicemia 480 mg/dL e pH 7,15. Conduta inicial prioritária na CAD?",
      correct: "Expansão com SF 0,9% e início de insulina IV após reposição inicial, com reposição de potássio conforme protocolo",
      wrongs: [
        "Insulina subcutânea isolada sem hidratação",
        "Bicarbonato de rotina em toda CAD",
        "Restrição hídrica absoluta"
      ],
      explain: "CAD: volume com SF, depois insulina IV; K+ é crítico; bicarbonato não é rotina."
    },
    {
      theme: "DM1 cetoacidose",
      stem: "Durante tratamento de CAD, a criança apresenta cefaleia intensa e queda do nível de consciência. Complicação temida?",
      correct: "Edema cerebral",
      wrongs: [
        "Hiperglicemia de rebote exclusiva sem neuro",
        "Crise asmática",
        "Apendicite"
      ],
      explain: "Edema cerebral é complicação grave do tratamento da CAD pediátrica."
    },
    {
      theme: "Hipotireoidismo congênito",
      stem: "Teste do pezinho com TSH elevado. RN ainda sem resultado confirmatório. Conduta correta em relação ao tempo?",
      correct: "Confirmar prontamente e iniciar levotiroxina sem atrasar o tratamento",
      wrongs: [
        "Aguardar 1 ano para iniciar hormônio",
        "Tratar apenas com iodo tópico",
        "Indicar tireoidectomia neonatal de rotina"
      ],
      explain: "Hipotireoidismo congênito: tratamento precoce com LT4 evita déficit neurocognitivo."
    },
    {
      theme: "Hipotireoidismo congênito",
      stem: "RN com icterícia prolongada, hernia umbilical, macroglossia e hipotonia. Qual endocrinopatia deve ser lembrada?",
      correct: "Hipotireoidismo congênito",
      wrongs: [
        "Hipertireoidismo neonatal exclusivo",
        "Puberdade precoce central",
        "Hiperplasia adrenal sem outros dados"
      ],
      explain: "Fenótipo clássico de hipotireoidismo congênito; rastreio neonatal é essencial."
    },
    {
      theme: "Puberdade",
      stem: "Menina de 7 anos e meio com telarca isolada, idade óssea compatível com cronológica, sem estirão acelerado. Abordagem inicial mais razoável?",
      correct: "Acompanhar evolução (telarca prematura isolada é possível) e reavaliar progressão",
      wrongs: [
        "Análogo de GnRH imediato sem avaliação",
        "Ovariectomia bilateral",
        "Corticoide em altas doses de rotina"
      ],
      explain: "Telarca prematura isolada pode ser benigna; vigiar progressão/idade óssea/outros caracteres."
    },
    {
      theme: "Puberdade",
      stem: "Menino de 9 anos com volume testicular 12 mL bilateral, estirão e idade óssea avançada. Diagnóstico sindrômico?",
      correct: "Puberdade precoce (central até prova em contrário)",
      wrongs: [
        "Atraso puberal",
        "Telarca prematura feminina",
        "Hipotireoidismo congênito não tratado como causa exclusiva sem dados"
      ],
      explain: "Sinais puberais precoces + avanço de IO → puberdade precoce; investigar eixo."
    }
  ];
  endo.forEach((q, i) => {
    raw.push({ idPrefix: "ped-endo", n: i + 1, group: "Endocrinologia", ...q });
  });

  // ── Cardiologia (5) ────────────────────────────────────────────
  const cardio = [
    {
      theme: "Sopros",
      stem: "Pré-escolar assintomático com sopro suave, vibratório, em borda esternal esquerda, que diminui sentado. Exame normal. Hipótese mais provável?",
      correct: "Sopro inocente (ex.: Still)",
      wrongs: [
        "Estenose aórtica grave sintomática",
        "Tetralogia de Fallot cianótica",
        "Miocardite fulminante"
      ],
      explain: "Sopro inocente: suave, posição-dependente, criança assintomática, exame normal."
    },
    {
      theme: "IC congestiva",
      stem: "Lactente de 2 meses com sudorese às mamadas, taquipneia, hepatomegalia e dificuldade ponderal. Qual síndrome clínica?",
      correct: "Insuficiência cardíaca congestiva",
      wrongs: [
        "Apenas RGE fisiológico",
        "Asma do lactente sem outros achados",
        "ITU baixa sem febre"
      ],
      explain: "Sudorese às mamadas + taquipneia + hepatomegalia + falha ponderal → ICC no lactente."
    },
    {
      theme: "Kawasaki",
      stem: "Criança com febre há 6 dias, conjuntivite não exsudativa, glossite, rash polimorfo, edema de mãos e pés e adenopatia cervical. Principal preocupação e tratamento agudo?",
      correct: "Doença de Kawasaki; imunoglobulina IV + AAS na fase aguda",
      wrongs: [
        "Apenas antibiótico para escarlatina sem considerar Kawasaki",
        "Corticoterapia isolada sem IGIV como padrão universal",
        "Anticoagulação plena sem diagnóstico"
      ],
      explain: "Kawasaki: IGIV + AAS para reduzir risco de aneurisma coronariano."
    },
    {
      theme: "Cardiopatia congênita básica",
      stem: "RN cianótico que melhora temporariamente com prostaglandina E1. Qual mecanismo é o alvo dessa terapia?",
      correct: "Manter o canal arterial pérvio em cardiopatia canal-dependente",
      wrongs: [
        "Fechar o canal arterial imediatamente",
        "Tratar pneumonia viral",
        "Induzir fechamento do forame oval"
      ],
      explain: "PGE1 mantém o canal aberto em lesões canal-dependentes (fluxo pulmonar ou sistêmico)."
    },
    {
      theme: "Cardiopatia congênita básica",
      stem: "Escolar com sopro holossistólico em borda esternal esquerda baixa e frêmito. Diagnóstico mais compatível entre as CIV?",
      correct: "Comunicação interventricular hemodinamicamente significativa",
      wrongs: [
        "Comunicação interatrial com sopro exclusivamente diastólico apical clássico",
        "Persistência do canal sem sopro contínuo",
        "Prolapso mitral sem sopro sistólico"
      ],
      explain: "CIV: sopro holossistólico em BEIE baixa ± frêmito."
    }
  ];
  cardio.forEach((q, i) => {
    raw.push({ idPrefix: "ped-cardio", n: i + 1, group: "Cardiologia", ...q });
  });

  // ── Hematologia (4) ────────────────────────────────────────────
  const hemato = [
    {
      theme: "Anemia ferropriva",
      stem: "Pré-escolar com palidez, VCM baixo, RDW alto, ferritina baixa e dieta pobre em ferro. Tratamento de escolha?",
      correct: "Sulfato ferroso oral na dose terapêutica por tempo adequado",
      wrongs: [
        "Vitamina B12 isolada como primeira linha",
        "Transfusão de rotina em anemia leve assintomática",
        "Eritropoetina em todos os casos dietéticos"
      ],
      explain: "Anemia ferropriva: ferro oral terapêutico + orientação dietética."
    },
    {
      theme: "Púrpura",
      stem: "Criança após virose com petéquias e equimoses, plaquetas 12.000, Hb e leucócitos normais, bom estado geral. Diagnóstico mais provável?",
      correct: "Púrpura trombocitopênica imune (PTI) aguda",
      wrongs: [
        "Leucemia sem alterações nas outras linhagens e sem sintomas",
        "Hemofilia A com plaquetas baixas",
        "Anemia falciforme em crise vaso-oclusiva típica"
      ],
      explain: "PTI pós-viral: plaquetopenia isolada em criança bem."
    },
    {
      theme: "Púrpura",
      stem: "Escolar com púrpura palpável em membros inferiores, dor abdominal e artralgia após IVAS. Urina com hematúria. Hipótese?",
      correct: "Vasculite por IgA (Púrpura de Henoch-Schönlein)",
      wrongs: [
        "PTI com plaquetas muito baixas como achado obrigatório",
        "Kawasaki sem febre prolongada",
        "Escorbuto exclusivo do lactente alimentado com leite"
      ],
      explain: "IgA vasculitis: púrpura palpável + dor abdominal/artralgia ± nefrite."
    },
    {
      theme: "Leucemia sinais",
      stem: "Criança com palidez, febre persistente, dores ósseas, hepatoesplenomegalia e petéquias. Hemograma com blastos. Conduta inicial?",
      correct: "Encaminhar urgentemente para centro especializado; evitar procedimentos invasivos desnecessários antes da avaliação",
      wrongs: [
        "Alta com ferro oral e retorno em 3 meses",
        "Vacina de vírus vivos imediatamente antes da investigação",
        "Cirurgia abdominal exploratória de rotina"
      ],
      explain: "Suspeita de leucemia aguda → referência hematológica urgente."
    }
  ];
  hemato.forEach((q, i) => {
    raw.push({ idPrefix: "ped-hemato", n: i + 1, group: "Hematologia", ...q });
  });

  // ── Reumatologia / ortopedia (4) ───────────────────────────────
  const reuma = [
    {
      theme: "AIJ",
      stem: "Menina de 4 anos com artrite de joelho há 8 semanas, sem febre diária, FAN positivo, sem comprometimento sistêmico grave. Forma mais compatível de AIJ?",
      correct: "AIJ oligoarticular",
      wrongs: [
        "AIJ sistêmica com febre quotidianas e rash",
        "Artrite séptica aguda de poucas horas",
        "Dor de crescimento sem artrite objetiva"
      ],
      explain: "Oligo AIJ: ≤4 articulações, comum em pré-escolares; rastrear uveíte."
    },
    {
      theme: "Artrite séptica vs transitória",
      stem: "Lactente recusa apoiar o membro, febre, PCR muito elevada e mobilização extremamente dolorosa do quadril. Prioridade?",
      correct: "Artrite séptica até prova em contrário; punção/drenagem e antibiótico urgentes",
      wrongs: [
        "Sinovite transitória; alta com AINE sem investigação",
        "Apenas fisioterapia ambulatorial",
        "Observação por 1 semana sem exames"
      ],
      explain: "Febre + impotência funcional + inflamação alta no lactente → séptica até excluir."
    },
    {
      theme: "Artrite séptica vs transitória",
      stem: "Pré-escolar após IVAS, claudicação leve, afebril, bom estado, PCR normal, ultrassom com pequeno derrame. Hipótese mais provável?",
      correct: "Sinovite transitória do quadril",
      wrongs: [
        "Artrite séptica com toxicidade",
        "Fratura exposta",
        "Osteomielite crônica de longa data sem história"
      ],
      explain: "Sinovite transitória: pós-viral, criança bem, inflamação baixa."
    },
    {
      theme: "Marcha",
      stem: "Menino de 6 anos com claudicação progressiva, dor referida no joelho, limitação de rotação interna do quadril. Radiografia sugere necrose avascular da cabeça femoral. Diagnóstico?",
      correct: "Doença de Legg-Calvé-Perthes",
      wrongs: [
        "Pé torto congênito não tratado como causa aguda aos 6 anos",
        "Displasia do desenvolvimento do quadril do RN apenas",
        "Escoliose idiopática sem acometimento de quadril"
      ],
      explain: "Perthes: necrose avascular da cabeça femoral em escolares, claudicação/limitação de RI."
    }
  ];
  reuma.forEach((q, i) => {
    raw.push({ idPrefix: "ped-reuma", n: i + 1, group: "Reumatologia / ortopedia", ...q });
  });

  // ── Maus-tratos / proteção (4) ──────────────────────────────────
  const maus = [
    {
      theme: "Suspeita",
      stem: "Lactente de 3 meses com hematomas em diferentes estágios em dorso e orelhas, história inconsistente de 'queda do sofá'. Conduta médica prioritária?",
      correct: "Garantir segurança da criança, avaliar lesões ocultas e notificar o Conselho Tutelar/autoridades competentes",
      wrongs: [
        "Alta sem comunicação por ser 'acidente doméstico comum'",
        "Confrontar agressivamente os pais na sala de espera",
        "Apenas receitar analgésico e retorno em 6 meses"
      ],
      explain: "Suspeita de maus-tratos: proteger, investigar e notificar — obrigação legal/ética."
    },
    {
      theme: "Notificação",
      stem: "Diante de suspeita fundamentada de violência contra criança, a notificação ao Conselho Tutelar é:",
      correct: "Obrigatória, independentemente de certeza absoluta ou autorização dos responsáveis",
      wrongs: [
        "Opcional e só após sentença judicial",
        "Proibida pelo sigilo médico absoluto sem exceções",
        "Permitida apenas se houver confissão do agressor"
      ],
      explain: "Notificação de suspeita de violência contra criança/adolescente é mandatória."
    },
    {
      theme: "Fratura metafisária",
      stem: "RN de 4 meses com fratura metafisária em 'canto' (corner fracture) do úmero distal, sem mecanismo plausível. Significado clínico mais importante?",
      correct: "Lesão altamente sugestiva de maus-tratos; investigar outras lesões e notificar",
      wrongs: [
        "Fratura típica de osteopenia do prematuro sem outros cuidados",
        "Achado normal da marcha",
        "Sempre decorrente de raquitismo sem avaliação social"
      ],
      explain: "Fraturas metafisárias clássicas em lactentes são red flags de abuso físico."
    },
    {
      theme: "Suspeita",
      stem: "Adolescente relata abuso sexual e apresenta-se ansioso. Além do cuidado clínico e acolhimento, qual ação é necessária no fluxo de proteção?",
      correct: "Notificar órgãos de proteção e acionar fluxo de atendimento a violência sexual conforme protocolo",
      wrongs: [
        "Pedir que o adolescente 'resolva em família' sem notificar",
        "Adiar qualquer atendimento para depois dos exames escolares",
        "Divulgar o caso em redes sociais da unidade"
      ],
      explain: "Violência sexual: acolher, cuidar, preservar evidências quando indicado e acionar proteção/notificação."
    }
  ];
  maus.forEach((q, i) => {
    raw.push({ idPrefix: "ped-maus", n: i + 1, group: "Maus-tratos / proteção", ...q });
  });

  return raw;
}

function main () {
  const rng = createRng(SEED);
  const raw = buildBank();
  const questions = raw.map((q) => {
    const { choices, answer } = placeCorrect(q.correct, q.wrongs, rng);
    const m = meta(rng);
    const num = String(q.n).padStart(3, "0");
    return {
      id: `${q.idPrefix}-${num}`,
      specialty: "pediatria",
      group: q.group,
      theme: q.theme,
      exam: m.exam,
      year: m.year,
      difficulty: m.difficulty,
      stem: q.stem,
      choices,
      answer,
      explain: q.explain
    };
  });

  if (questions.length < 105) {
    throw new Error(`Esperado >= 105 questões, obtido ${questions.length}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(questions, null, 2) + "\n", "utf8");

  const byGroup = {};
  const letters = { A: 0, B: 0, C: 0, D: 0 };
  for (const q of questions) {
    byGroup[q.group] = (byGroup[q.group] || 0) + 1;
    letters["ABCD"[q.answer]]++;
  }

  console.log("Wrote:", OUT);
  console.log("Total:", questions.length);
  console.log("Por grupo:");
  Object.keys(byGroup)
    .sort((a, b) => byGroup[b] - byGroup[a] || a.localeCompare(b))
    .forEach((g) => console.log(`  ${g}: ${byGroup[g]}`));
  console.log("Distribuição gabarito (A/B/C/D):", letters);
}

main();
