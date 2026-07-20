/**
 * Gera data/questions-pediatria.json (>=105 questões originais, pt-BR).
 * Estilo residência (USP/ENARE/ENAMED/UNIFESP/Santa Casa): vinheta clínica,
 * pegadinhas suaves, sem “entregar” classificação/diagnóstico no enunciado.
 *
 * Uso: node scripts/build-questions-pediatria.js
 *
 * RNG com seed fixa → rebuild determinístico.
 * Gabarito em índice aleatório 0–3 (não fica sempre em B).
 */

const fs = require("fs");
const path = require("path");

const SEED = 20260720;
const OUT = path.join(__dirname, "..", "data", "questions-pediatria.json");

const EXAMS = ["enamed", "enare", "usp", "unifesp", "santa-casa", "amp"];
const YEARS = [2022, 2023, 2024, 2025];
/** Poucos fáceis; maioria média/difícil */
const DIFF_POOL = [
  "dificil", "dificil", "dificil", "dificil",
  "media", "media", "media",
  "facil"
];

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
    difficulty: DIFF_POOL[Math.floor(rng() * DIFF_POOL.length)]
  };
}

/**
 * @typedef {{
 *   theme: string,
 *   stem: string,
 *   correct: string,
 *   wrongs: string[],
 *   explain: string,
 *   trap?: string
 * }} RawQ
 */

/** @returns {Array<RawQ & {idPrefix:string,n:number,group:string}>} */
function buildBank () {
  /** @type {Array<RawQ & {idPrefix:string,n:number,group:string}>} */
  const raw = [];

  // ── Neonatologia (18) ──────────────────────────────────────────
  /** @type {RawQ[]} */
  const neo = [
    {
      theme: "Reanimação neonatal",
      stem: "RN a termo, parto vaginal sem intercorrências, líquido claro. Após secagem e estímulo, permanece com esforço irregular e frequência cardíaca de 78 bpm; vias aéreas estão posicionadas e a pele está cianosada. Qual a melhor conduta neste momento?",
      correct: "Iniciar ventilação com pressão positiva e monitorar FC e expansão torácica",
      wrongs: [
        "Iniciar compressões torácicas na proporção 3:1 imediatamente",
        "Administrar adrenalina pela veia umbilical sem ventilação prévia",
        "Aguardar 60 segundos em observação antes de qualquer intervenção"
      ],
      explain: "Após passos iniciais, FC < 100 bpm ou respiração inadequada indica VPP como intervenção central. Compressões só entram após VPP efetiva com FC persistente < 60 bpm. Adrenalina é reserva para falha ventilatória/circulatória.",
      trap: "Pular direto para compressões ou adrenalina quando a FC está entre 60 e 100, sem garantir ventilação eficaz."
    },
    {
      theme: "Reanimação neonatal",
      stem: "Em sala de parto, após 30 segundos de VPP com expansão torácica adequada e FiO2 titulada, a FC do RN permanece em 48 bpm. Qual o próximo passo prioritário?",
      correct: "Iniciar compressões torácicas coordenadas à VPP (3:1) e revisar a via aérea",
      wrongs: [
        "Elevar apenas a FiO2 para 100% e manter observação sem compressões",
        "Administrar bicarbonato de sódio de rotina pela veia umbilical",
        "Interromper a VPP por 1 minuto para avaliar tônus espontâneo"
      ],
      explain: "FC < 60 após VPP efetiva exige compressões 3:1 e checagem da ventilação (MR. SOPA). Bicarbonato não é rotina na reanimação. Oxigênio isolado não substitui o suporte circulatório.",
      trap: "Acreditar que só aumentar oxigênio resolve bradicardia grave sem compressões."
    },
    {
      theme: "Reanimação neonatal",
      stem: "RN de 27 semanas nasce com esforço respiratório fraco. Ao iniciar suporte ventilatório, qual estratégia de oxigênio é a mais adequada nas primeiras ações?",
      correct: "Começar com FiO2 baixa (cerca de 21–30%) e titular conforme oximetria por minuto de vida",
      wrongs: [
        "Manter FiO2 100% fixa desde o primeiro minuto até estabilização completa",
        "Usar exclusivamente ar ambiente, sem possibilidade de ajuste",
        "Iniciar óxido nítrico inalatório empírico na sala de parto"
      ],
      explain: "Prematuros devem iniciar com O2 baixo e titulação guiada por SpO2 alvo. Hiperóxia desnecessária aumenta risco de lesão oxidativa. Óxido nítrico não faz parte do algoritmo inicial de reanimação.",
      trap: "Associar prematuridade automaticamente a FiO2 100% desde o nascimento."
    },
    {
      theme: "Icterícia neonatal",
      stem: "RN a termo, 30 horas de vida, ictérico até coxas. Mãe grupo O Rh−, RN A Rh+, Coombs direto positivo, hemoglobina 12,8 g/dL, bilirrubina total 15,8 mg/dL. Qual a melhor conduta inicial?",
      correct: "Iniciar fototerapia guiada por nomograma e monitorar bilirrubina e hemólise",
      wrongs: [
        "Liberar para domicilio com orientação de exposição solar",
        "Programar colangiografia e biópsia hepática nas próximas 24 horas",
        "Iniciar levotiroxina empírico sem dosar TSH/T4"
      ],
      explain: "Icterícia precoce com incompatibilidade ABO e Coombs positivo sugere hemólise imune; o manejo imediato é fototerapia conforme limiares, com vigilância de anemia e necessidade de exsanguineotransfusão. Atresia biliar e hipotireoidismo têm outro tempo e perfil clínico.",
      trap: "Rotular como 'fisiológica' só pela idade gestacional, ignorando precocidade e Coombs positivo."
    },
    {
      theme: "Icterícia neonatal",
      stem: "Lactente de 32 dias em aleitamento materno exclusivo apresenta icterícia progressiva, fezes claras intercaladas e hepatomegalia discreta. Bilirrubina direta 3,4 mg/dL. Qual o próximo passo mais adequado?",
      correct: "Investigar colestase com urgência, incluindo ultrassom e exclusão de atresia biliar",
      wrongs: [
        "Manter observação exclusiva até 3 meses por provável icterícia do leite materno",
        "Prescrever fototerapia domiciliar sem investigação etiológica",
        "Tratar empiricamente como incompatibilidade Rh tardia"
      ],
      explain: "BD elevada com fezes claras e hepatomegalia configura colestase neonatal. Atresia biliar exige diagnóstico precoce para portoenterostomia. Icterícia do leite materno não eleva BD nem causa acolia.",
      trap: "Atribuir toda icterícia prolongada ao leite materno sem checar fração direta e padrão das fezes."
    },
    {
      theme: "Sepse neonatal",
      stem: "RN de 16 horas, filho de parto com febre materna intraparto e líquido fétido, apresenta taquicardia, enchimento capilar de 4 s e temperatura de 38,2 °C. Hemograma com neutropenia e PCR elevada. Qual antibioticoterapia empírica inicial é a mais apropriada?",
      correct: "Ampicilina associada a gentamicina",
      wrongs: [
        "Vancomicina em monoterapia",
        "Ceftriaxona em dose única sem associação",
        "Anfotericina B empírica isolada"
      ],
      explain: "Sepse precoce cobre SGB e Gram-negativos com ampicilina + aminoglicosídeo. Vancomicina e antifúngico não são primeira linha nesse cenário. Ceftriaxona no RN tem riscos (bilirrubina/cálcio) e não substitui o esquema clássico.",
      trap: "Escolher vancomicina por 'cobertura ampla' em sepse precoce comunitária/obstétrica."
    },
    {
      theme: "Sepse neonatal",
      stem: "Prematuro de 30 semanas, 14º dia de vida em UTI, com cateter venoso central, passa a ter apneias novas, distensão abdominal e glicemia instável. Hemocultura cresce Staphylococcus coagulase-negativo. Qual interpretação é a mais coerente?",
      correct: "Sepse neonatal tardia associada a dispositivo intravascular",
      wrongs: [
        "Sepse precoce exclusiva por Streptococcus do grupo B",
        "Infecção congênita por rubéola sem componente séptico",
        "Reação transfusional hemolítica aguda isolada"
      ],
      explain: "Após 72 h de vida, sobretudo em prematuro com acesso vascular, SCN é patógeno típico de sepse tardia nosocomial. Sepse precoce e TORCH têm outros tempos e manifestações.",
      trap: "Chamar qualquer bacteremia neonatal de 'sepse precoce' sem olhar o dia de vida."
    },
    {
      theme: "SDR/taquipneia",
      stem: "RN de 33 semanas, desconforto respiratório crescente nas primeiras 3 horas, retrações e gemido. Radiografia com padrão reticulogranular difuso e broncograma aéreo. Qual o diagnóstico mais provável?",
      correct: "Síndrome do desconforto respiratório por deficiência de surfactante",
      wrongs: [
        "Taquipneia transitória do RN sem acometimento alveolar",
        "Bronquiolite por VSR com início no período neonatal imediato",
        "Cardiopatia cianótica sem sinais de esforço ventilatório"
      ],
      explain: "Prematuridade + desconforto precoce + reticulogranularidade/broncograma apontam para SDR/membrana hialina. Taquipneia transitória costuma ter hiperinsuflação e líquido em fissuras, com curso mais benigno.",
      trap: "Diagnosticar taquipneia transitória em prematuro com padrão radiológico clássico de déficit de surfactante."
    },
    {
      theme: "SDR/taquipneia",
      stem: "RN a termo nascido de cesárea eletiva, com taquipneia desde a primeira hora, boa oxigenação em ar ambiente e radiografia com líquido em fissuras e hiperinsuflação leve. Melhor conduta inicial?",
      correct: "Suporte respiratório conforme necessidade e observação, com expectativa de resolução em 24–72 h",
      wrongs: [
        "Surfactante endotraqueal imediato de rotina",
        "Antibiótico de amplo espectro por 14 dias sem avaliação",
        "Cirurgia de emergência por suspeita de hérnia diafragmática"
      ],
      explain: "Quadro compatível com taquipneia transitória: termo/cesárea, curso precoce e imagem típica. Manejo é suporte e vigilância. Surfactante é para SDR; antibiótico não é automático sem critérios de infecção.",
      trap: "Tratar todo desconforto neonatal com surfactante, como se fosse membrana hialina."
    },
    {
      theme: "Asfixxia/encefalopatia",
      stem: "RN a termo após sofrimento fetal agudo nasce com Apgar 2/4/5, necessita de VPP prolongada e, com 2 horas, apresenta hipotonia, convulsão e acidose metabólica persistente. Qual intervenção específica deve ser considerada precocemente?",
      correct: "Hipotermia terapêutica em centro habilitado, se critérios de encefalopatia hipóxico-isquêmica forem preenchidos",
      wrongs: [
        "Fenobarbital de manutenção sem avaliação neurológica estruturada",
        "Bicarbonato contínuo como terapia neuroprotetora isolada",
        "Observação exclusiva em alojamento conjunto sem monitoramento"
      ],
      explain: "Encefalopatia hipóxico-isquêmica moderada/grave com critérios temporais pode se beneficiar de hipotermia terapêutica iniciada precocemente. Bicarbonato não é neuroproteção. Alojamamento conjunto é inadequado nesse perfil.",
      trap: "Focar só em anticonvulsivante e esquecer a janela da hipotermia."
    },
    {
      theme: "Infecção congênita",
      stem: "RN pequeno para idade gestacional, microcefalia, petéquias, hepatoesplenomegalia e calcificações cerebrais periventriculares. Qual agente é o mais provável?",
      correct: "Citomegalovírus",
      wrongs: [
        "Streptococcus do grupo B",
        "Vírus sincicial respiratório",
        "Staphylococcus aureus comunitário"
      ],
      explain: "A combinação de CIUR, microcefalia, petéquias, hepatoesplenomegalia e calcificações periventriculares é clássica de CMV congênito. SGB e estafilococo causam sepse perinatal/pós-natal sem esse padrão malformativo-calcificante.",
      trap: "Assumir SGB diante de qualquer doença neonatal grave, mesmo com estigmas congênitos."
    },
    {
      theme: "Triagem neonatal",
      stem: "No teste do pezinho coletado no 3º dia, TSH está muito elevado e T4 livre baixo. Qual a melhor conduta?",
      correct: "Confirmar com dosagens séricas e iniciar levotiroxina precocemente após confirmação/conforme protocolo",
      wrongs: [
        "Repetir o pezinho apenas com 6 meses de vida",
        "Iniciar iodo radioativo diagnóstico imediatamente",
        "Aguardar sintomas clínicos de mixedema para tratar"
      ],
      explain: "Hipotireoidismo congênito exige confirmação e reposição precoce de levotiroxina para proteger o neurodesenvolvimento. Esperar sintomas ou adiar meses causa dano irreversível.",
      trap: "Aguardar 'confirmação clínica' antes de tratar, perdendo a janela crítica."
    },
    {
      theme: "Aleitamento / hipoglicemia",
      stem: "RN filho de mãe com diabetes gestacional, 2 horas de vida, sonolento e com tremor fino. Glicemia capilar 28 mg/dL. Qual a conduta mais adequada agora?",
      correct: "Oferecer leite (ou glicose oral conforme protocolo) e reavaliar; se sintomático grave ou refratário, glicose EV",
      wrongs: [
        "Aguardar a próxima mamada programada em 3 horas sem intervenção",
        "Administrar insulina regular subcutânea",
        "Indicar jejum absoluto por 12 horas para 'descanso pancreático'"
      ],
      explain: "Filho de mãe diabética tem risco de hipoglicemia hiperinsulinêmica. Valores baixos com sintomas exigem correção imediata e reavaliação. Insulina agrava o quadro; jejum prolongado é inadequado.",
      trap: "Normalizar tremor como 'imaturidade' e adiar a medida da glicemia/correção."
    },
    {
      theme: "Enterocolite necrosante",
      stem: "Prematuro de 29 semanas, 10º dia, em progressão de dieta enteral, evolui com distensão, resíduos biliosos, sangue nas fezes e pneumatose intestinal na radiografia. Melhor conduta inicial?",
      correct: "Jejuar, descompressão gástrica, antibióticos e suporte intensivo com acompanhamento radiológico",
      wrongs: [
        "Aumentar o volume da dieta para 'estimular o intestino'",
        "Alta precoce com fórmula hipercalórica exclusiva",
        "Corticoterapia sistêmica empírica como tratamento definitivo"
      ],
      explain: "Sinais clínicos e radiológicos de enterocolite necrosante pedem suspensão da dieta, suporte, antibióticos e vigilância de indicação cirúrgica. Aumentar dieta piora a isquemia/inflamação intestinal.",
      trap: "Insistir em alimentação enteral perante resíduos biliosos e pneumatose."
    },
    {
      theme: "Hiperbilirrubinemia",
      stem: "RN a termo, 4º dia, bilirrubina total em nível de exsanguineotransfusão pelo nomograma, com sinais de encefalopatia bilirrubínica inicial. Além da fototerapia intensiva, qual medida deve ser preparada?",
      correct: "Exsanguineotransfusão em ambiente adequado",
      wrongs: [
        "Apenas observação com retorno ambulatorial em 72 horas",
        "Colecistectomia de urgência",
        "Suspensão definitiva do aleitamento materno para sempre"
      ],
      explain: "Limiar de exsanguineotransfusão e/ou sinais neurológicos exigem ET sob fototerapia intensiva. Colecistectomia não trata hiperbilirrubinemia neonatal. Suspensão permanente do aleitamento não é a resposta.",
      trap: "Subestimar icterícia intensa no termo por achar que 'sempre resolve com sol/fototerapia leve'."
    },
    {
      theme: "Distúrbio metabólico",
      stem: "RN de 5 dias com vômitos, letargia, odor incomum e acidose metabólica com anion gap elevado após introdução de fórmula. Qual conduta diagnóstica inicial é mais útil?",
      correct: "Solicitar amônia, gasometria, glicemia e aminoácidos/acilcarnitinas conforme protocolo de erro inato",
      wrongs: [
        "Tratar apenas como refluxo fisiológico com espessante",
        "Indicar fundoplicatura de Nissen imediata",
        "Prescrever antibiótico único sem investigação metabólica"
      ],
      explain: "Descompensação neonatal precoce com acidose de anion gap e alteração do sensorium levanta erro inato do metabolismo. Painel metabólico urgente guia suporte e dieta. Refluxo isolado não explica acidose grave.",
      trap: "Atribuir vômitos neonatais sempre a refluxo e atrasar a investigação metabólica."
    },
    {
      theme: "Oftalmia neonatal",
      stem: "RN de 7 dias com secreção ocular purulenta bilateral intensa e edema palpebral. Qual a hipótese etiológica mais preocupante e o foco do manejo?",
      correct: "Gonococo; antibiótico sistêmico e avaliação de complicações, além de higiene ocular",
      wrongs: [
        "Alergia ao shampoo; apenas suspender produtos tópicos",
        "Obstrução isolada do ducto lacrimal; massagem exclusiva por 2 meses",
        "Infecção fúngica exclusiva; antifúngico tópico empírico"
      ],
      explain: "Secreção purulenta intensa na primeira semana sugere oftalmia gonocócica, que pode perfurar a córnea; exige tratamento sistêmico. Obstrução lacrimal costuma ser mais tardia e menos inflamatória aguda.",
      trap: "Tratar toda secreção ocular neonatal como dacriocistite/obstrução simples."
    },
    {
      theme: "Vitamina K / hemorragia",
      stem: "RN de 3 semanas, parto domiciliar sem profilaxia ao nascer, apresenta sangramento do coto umbilical e hematomas. Coagulograma com TP muito alongado. Qual a causa mais provável?",
      correct: "Doença hemorrágica do RN por deficiência de vitamina K",
      wrongs: [
        "Hemofilia A sem necessidade de investigação familiar",
        "Púrpura trombocitopênica imune com plaquetas normais",
        "Escorbuto por deficiência de vitamina C materna aguda"
      ],
      explain: "Ausência de vitamina K ao nascer e sangramento tardio com TP alongado são típicos de doença hemorrágica por deficiência de K. PTI altera plaquetas; hemofilia tem outro padrão e história.",
      trap: "Pensar primeiro em hemofilia diante de qualquer sangramento neonatal, sem olhar profilaxia de K e TP."
    }
  ];
  neo.forEach((q, i) => {
    raw.push({ idPrefix: "ped-neo", n: i + 1, group: "Neonatologia", ...q });
  });

  // ── Puericultura (18) ──────────────────────────────────────────
  /** @type {RawQ[]} */
  const puer = [
    {
      theme: "Vacinação",
      stem: "Lactente de 2 meses, hígido, comparece para consulta de rotina. Além das vacinas do calendário da faixa etária, a mãe pergunta se pode aplicar vacinas inativadas no mesmo dia. Qual a orientação correta?",
      correct: "Vacinas do calendário podem ser aplicadas na mesma visita conforme indicação, respeitando sites e técnicas",
      wrongs: [
        "Nunca se deve aplicar mais de uma vacina no mesmo dia",
        "Só é permitido combinar vacinas se houver febre no momento",
        "Vacinas inativadas exigem intervalo mínimo de 90 dias entre si"
      ],
      explain: "No calendário, múltiplas vacinas podem ser administradas na mesma consulta se indicadas. Intervalos longos obrigatórios aplicam-se sobretudo a certas combinações de vacinas vivas, não a todas as inativadas.",
      trap: "Acreditar que 'uma vacina por dia' reduz eventos adversos de forma geral."
    },
    {
      theme: "Vacinação",
      stem: "Criança de 12 meses HIV exposta, não infectada, com esquema em dia. A mãe questiona a vacina tríplice viral. Qual a melhor conduta?",
      correct: "Aplicar SCR conforme calendário, pois criança não infectada não tem contraindicação por esse motivo",
      wrongs: [
        "Contraindicar definitivamente todas as vacinas vivas para sempre",
        "Substituir SCR por imunoglobulina mensal de rotina",
        "Adiar SCR até os 10 anos independentemente do status"
      ],
      explain: "Exposição ao HIV sem infecção não contraindica SCR. Imunodeficiência grave sintomática é o cenário de cautela com vacinas vivas, não a mera exposição resolvida.",
      trap: "Contraindicar vacinas vivas em toda criança 'exposta ao HIV', sem distinguir infectada/imunossuprimida."
    },
    {
      theme: "Crescimento",
      stem: "Menino de 18 meses com peso no percentil 3 e estatura no percentil 50, bom desenvolvimento, exame abdominal normal e história alimentar restrita em calorias. Qual a interpretação mais provável?",
      correct: "Déficit ponderal predominantemente nutricional; reforçar oferta calórica e acompanhar curva",
      wrongs: [
        "Doença celíaca confirmada sem necessidade de exames",
        "Deficiência de GH como primeira hipótese isolada",
        "Hipotireoidismo congênito não tratado como causa exclusiva"
      ],
      explain: "Peso baixo com estatura preservada e exame normal sugere ingestão insuficiente. Déficit de GH e hipotireoidismo costumam afetar mais a estatura. Celíaca exige investigação dirigida se houver sinais.",
      trap: "Ir direto a endocrinopatia rara sem avaliar história alimentar e proporcionalidade da curva."
    },
    {
      theme: "Desenvolvimento",
      stem: "Lactente de 9 meses não senta sem apoio, não transferem objetos e não balbucia. Gestação e peri‑parto sem intercorrências relatadas. Qual a melhor conduta?",
      correct: "Reconhecer atraso global e iniciar avaliação diagnóstica e intervenção precoce",
      wrongs: [
        "Aguardar os 18 meses porque 'cada criança tem seu tempo' sem avaliação",
        "Prescrever apenas polivitamínico e reavaliar em 1 ano",
        "Diagnosticar autismo de forma definitiva só por ausência de balbucio"
      ],
      explain: "Marcos ausentes aos 9 meses exigem investigação e estimulação/reabilitação precoces. Esperar passivamente perde janela terapêutica. Autismo não se fecha só por um marco isolado.",
      trap: "Normalizar atrasos evidentes com a frase 'cada um no seu tempo'."
    },
    {
      theme: "Aleitamento",
      stem: "Puérpera no 5º dia refere fissura mamilar e dor à mamada; o bebê ganha peso adequadamente, mas a pega é superficial. Melhor conduta?",
      correct: "Corrigir a pega/posição e manter aleitamento, com manejo da fissura",
      wrongs: [
        "Suspender o peito e iniciar fórmula integral imediatamente",
        "Indicar antibiótico materno de amplo espectro de rotina",
        "Orientar intervalo fixo de 6/6 horas entre mamadas"
      ],
      explain: "Fissura com pega inadequada melhora com técnica e suporte. Suspensão desnecessária do peito e intervalos rígidos prejudicam o aleitamento. Antibiótico não é rotina sem mastite infecciosa.",
      trap: "Trocar para fórmula na primeira dor mamilar, sem ajustar a pega."
    },
    {
      theme: "Introdução alimentar",
      stem: "Lactente de 6 meses em AME, prontidão adequada. A família pergunta sobre consistência e alérgenos. Qual orientação é a mais correta?",
      correct: "Iniciar complementar com alimentos em papa/amassados e introduzir alérgenos precocemente de forma segura",
      wrongs: [
        "Manter só líquidos até 12 meses para evitar engasgo",
        "Evitar absolutamente ovo e amendoim até os 5 anos",
        "Oferecer mel como adoçante natural desde os 6 meses"
      ],
      explain: "Aos 6 meses inicia-se alimentação complementar em consistência adequada; introdução precoce de alérgenos pode reduzir alergia em risco. Mel é contraindicado abaixo de 1 ano pelo botulismo.",
      trap: "Atrasar alérgenos 'por precaução' e oferecer mel precocemente."
    },
    {
      theme: "Vitamina D / ferro",
      stem: "RN a termo em AME exclusivo. Qual suplementação preventiva é recomendada na puericultura brasileira típica?",
      correct: "Vitamina D desde os primeiros dias e ferro a partir de cerca de 6 meses (ou conforme protocolo local para termo)",
      wrongs: [
        "Nenhuma suplementação se o peito for exclusivo",
        "Vitamina A megadose mensal desde o nascimento",
        "Cálcio endovenoso semanal de rotina"
      ],
      explain: "AME não fornece vitamina D suficiente; a suplementação precoce é padrão. Ferro profilático no termo costuma iniciar perto dos 6 meses (prematuros mais cedo). Megadoses e cálcio EV não são rotina.",
      trap: "Achar que aleitamento exclusivo dispensa qualquer suplemento."
    },
    {
      theme: "Obesidade",
      stem: "Escolar de 8 anos com IMC acima do percentil 97, acantose nigricans e história familiar de DM2. Qual o próximo passo mais adequado na abordagem inicial?",
      correct: "Avaliar comorbidades (glicemia/perfil metabólico) e iniciar mudanças intensivas de estilo de vida",
      wrongs: [
        "Indicar bariátrica imediatamente como primeira medida",
        "Prescrever insulina basal mesmo com glicemia normal",
        "Ignorar o IMC porque a criança ainda está em crescimento"
      ],
      explain: "Obesidade com sinais de resistência insulínica pede rastreio de comorbidades e intervenção comportamental familiar. Cirurgia e insulina não são primeira linha nesse cenário inicial.",
      trap: "Esperar o fim do crescimento para abordar obesidade grave."
    },
    {
      theme: "Sono / choro",
      stem: "Lactente de 6 semanas chora intensamente no fim da tarde, ganha peso bem, exame normal e episódios autolimitados. Pais exaustos. Melhor conduta?",
      correct: "Orientar sobre cólica/choro fisiológico, técnicas de acalento e sinais de alarme para retorno",
      wrongs: [
        "Solicitar imediatamente TC de crânio sem sinais focais",
        "Trocar para fórmula de soja sem avaliação",
        "Iniciar opioide antitussígeno para sedar o choro"
      ],
      explain: "Choro do fim da tarde com crescimento e exame normais é compatível com cólica. Educação e suporte são a base; exames de imagem e sedativos são inadequados.",
      trap: "Medicalizar choro fisiológico com exames invasivos ou mudança alimentar precoce."
    },
    {
      theme: "Higiene / segurança",
      stem: "Consulta de 4 meses: pais perguntam sobre transporte no carro e posição para dormir. Qual orientação é a mais segura?",
      correct: "Sono em decúbito dorsal em superfície firme e uso de bebê-conforto/cadeirinha adequada no banco traseiro",
      wrongs: [
        "Dormir de bruços para reduzir refluxo, sem outras medidas",
        "Viajar no colo do adulto com cinto do adulto envolvendo os dois",
        "Usar travesseiros e protetores soltos no berço para 'aconchego'"
      ],
      explain: "Decúbito dorsal e berço seguro reduzem risco de morte súbita. Cadeirinha correta é obrigatória; colo com cinto do adulto é perigoso. Objetos soltos no berço aumentam risco.",
      trap: "Colocar o bebê de bruços 'para não engasgar com refluxo'."
    },
    {
      theme: "Triagem / saúde bucal",
      stem: "Criança de 12 meses ainda sem primeira consulta odontológica, usa mamadeira noturna com leite adoçado. Qual a melhor orientação?",
      correct: "Encaminhar ao odontopediatra e suspender açúcar/mamadeira noturna cariogênica",
      wrongs: [
        "Aguardar a troca da dentição permanente para cuidar dos dentes",
        "Indicar refrigerante 'diet' à noite como substituto",
        "Prescrever antibiótico mensal para prevenir cáries"
      ],
      explain: "A primeira avaliação odontológica deve ser precoce; mamadeira noturna açucarada favorece cárie de estresse precoce. Antibiótico não previne cárie.",
      trap: "Adiar cuidado bucal até a dentição permanente."
    },
    {
      theme: "Anemia ferropriva",
      stem: "Lactente de 14 meses alimentado predominantemente com leite de vaca integral e poucos alimentos ferrosos apresenta palidez e Hb 8,9 g/dL, VCM baixo. Melhor conduta inicial?",
      correct: "Iniciar reposição de ferro e orientar diversificação alimentar, investigando resposta",
      wrongs: [
        "Transfundir concentrado de hemácias de rotina por Hb < 10",
        "Indicar medula óssea imediata sem tentativa terapêutica",
        "Prescrever apenas vitamina B12 intramuscular sem ferro"
      ],
      explain: "Perfil microcítico com dieta pobre em ferro e leite de vaca excessivo é ferropriva clássica. Ferro terapêutico e dieta são a base; transfusão e mielograma não são primeiro passo se estável.",
      trap: "Transfundir anemia ferropriva crônica estável só pelo número da Hb."
    },
    {
      theme: "Puberdade precoce",
      stem: "Menina de 6 anos e 8 meses com telarca progressiva, aceleração estatural e idade óssea avançada. Qual o próximo passo mais adequado?",
      correct: "Encaminhar para avaliação endocrinológica de puberdade precoce central vs periférica",
      wrongs: [
        "Apenas observar até os 12 anos sem investigação",
        "Iniciar contraceptivo oral combinado imediatamente",
        "Diagnosticar obesidade isolada e liberar sem exames"
      ],
      explain: "Telarca + aceleração de crescimento antes de 8 anos exige investigação de puberdade precoce. Observação passiva pode comprometer altura final. ACO não é o tratamento específico.",
      trap: "Normalizar telarca precoce como 'obesidade' sem avaliar eixo e idade óssea."
    },
    {
      theme: "Enurese",
      stem: "Menino de 7 anos com enurese noturna primária, diurnos secos, exame normal e sem poliúria. Família solicita 'exame de imagem urgente'. Melhor conduta?",
      correct: "Orientar medidas comportamentais e considerar alarme/desmopressina conforme impacto, sem imagem de rotina",
      wrongs: [
        "Solicitar urografia excretora e cistoscopia de imediato",
        "Indicar cirúrgica de reimplante ureteral empírico",
        "Restringir absolutamente líquidos por 24 h antes da escola"
      ],
      explain: "Enurese monosintomática primária com exame normal não pede imagem invasiva inicial. Educação, alarme e, em casos selecionados, desmopressina são o caminho.",
      trap: "Partir para investigação urológica invasiva sem critérios de alarme."
    },
    {
      theme: "Tela / comportamento",
      stem: "Pré-escolar de 3 anos passa mais de 4 horas/dia em telas, com irritabilidade e atraso de linguagem. Qual a orientação mais adequada?",
      correct: "Reduzir drasticamente o tempo de tela e estimular interação verbal presencial",
      wrongs: [
        "Aumentar desenhos educativos para compensar o atraso",
        "Iniciar metilfenidato empírico por irritabilidade",
        "Indicar internação psiquiátrica imediata"
      ],
      explain: "Excesso de tela associa-se a atraso de linguagem; a intervenção inicial é limitar exposição e enriquecer interação. Estimulante empírico é inadequado.",
      trap: "Substituir interação humana por 'mais conteúdo educativo' em tela."
    },
    {
      theme: "Calendário vacinal / atraso",
      stem: "Criança de 4 anos chega sem carteira e a mãe refere 'quase nenhuma vacina'. Estado geral bom. Qual a melhor conduta?",
      correct: "Iniciar esquema de atualização (catch-up) conforme calendário e idade, sem reiniciar do zero desnecessariamente",
      wrongs: [
        "Aplicar todas as doses da vida no mesmo instante sem planejamento",
        "Aguardar documentos escolares para qualquer vacina",
        "Contraindicar vacinas porque o atraso 'anula' o benefício"
      ],
      explain: "Atraso vacinal se corrige com catch-up por idade, priorizando proteção. Falta de caderneta não impede vacinação; doses podem ser registradas e agendadas de forma segura.",
      trap: "Recusar vacinar até aparecer a caderneta antiga."
    },
    {
      theme: "Prevenção de acidentes",
      stem: "Família com criança de 2 anos pergunta sobre prevenção no domicílio. Qual medida tem maior impacto nessa faixa?",
      correct: "Supervisionar, manter medicamentos/produtos de limpeza trancados e proteger escadas/tomadas",
      wrongs: [
        "Permitir álcool em gel ao alcance para 'higiene autônoma'",
        "Deixar baldes com água no quintal para brincar",
        "Guardar cloro em garrafa de refrigerante na cozinha baixa"
      ],
      explain: "Intoxicações e afogamento doméstico são riscos centrais no toddler. Acesso a químicos e água acumulada deve ser bloqueado. Repackaging de cloro em garrafa de bebida é clássico de acidente.",
      trap: "Subestimar afogamento em pequenos volumes de água e intoxicação por produtos domésticos."
    },
    {
      theme: "Crescimento / percentis",
      stem: "Menina de 3 anos caiu do percentil 50 para o 10 de estatura em 12 meses, com ganho ponderal preservado e cansaço. Qual a conduta mais adequada?",
      correct: "Investigar causas de desaceleração estatural (incluindo tireoide e doença crônica)",
      wrongs: [
        "Apenas tranquilizar porque ainda está acima do percentil 3",
        "Prescrever GH empírico sem investigação",
        "Indicar dieta restritiva para 'afinamento'"
      ],
      explain: "Queda cruzando percentis de estatura é sinal de alerta, mesmo acima do P3. Exige investigação etiológica antes de qualquer hormônio. Dieta restritiva é inadequada.",
      trap: "Aceitar qualquer valor acima do P3 como crescimento normal, ignorando a velocidade."
    }
  ];
  puer.forEach((q, i) => {
    raw.push({ idPrefix: "ped-puer", n: i + 1, group: "Puericultura", ...q });
  });

  // ── Infectologia pediátrica (14) ───────────────────────────────
  /** @type {RawQ[]} */
  const inf = [
    {
      theme: "Dengue",
      stem: "Escolar de 9 anos no 4º dia de febre, dor retro-ocular e mialgia, plaquetas 78.000/mm³, hematócrito estável, bom estado geral, pressão arterial normal, sem sangramento espontâneo, aceitando líquidos. Qual a melhor conduta?",
      correct: "Hidratação vigorosa ambulatorial/observação conforme grupo clínico e reavaliação seriada",
      wrongs: [
        "Transfundir plaquetas imediatamente pelo número isolado",
        "Prescrever AAS para a dor e febre",
        "Internar em UTI e iniciar noradrenalina empírico"
      ],
      explain: "Em dengue, a classificação e a hidratação guiam o manejo mais do que a plaquetopenia isolada em paciente estável. AAS aumenta risco de sangramento. Transfusão de plaquetas não é automática pelo valor laboratorial.",
      trap: "Transfundir plaquetas só porque estão baixas, sem sangramento ou procedimento, e usar AAS."
    },
    {
      theme: "Dengue",
      stem: "Adolescente com dengue, dor abdominal intensa, vômitos, hematócrito em elevação rápida e extremidades frias. Qual a prioridade?",
      correct: "Reconhecer extravasamento plasmático e hidratar com cristaloides conforme protocolo de dengue grave/com sinais de alarme",
      wrongs: [
        "Aumentar oferta oral exclusiva em domicilio sem reavaliação",
        "Administrar diurético de alça para 'desinchar'",
        "Iniciar AAS e dexametasona empíricos"
      ],
      explain: "Dor abdominal, vômitos persistentes, hemoconcentração e má perfusão indicam extravasamento. Cristaloides e vigilância são centrais; diurético e AAS são prejudiciais nessa fase.",
      trap: "Tratar má perfusão da dengue como desidratação simples ambulatorial ou como congestão a ser diuretada."
    },
    {
      theme: "Sarampo / exantemas",
      stem: "Pré-escolar não vacinado, febre alta, coriza, conjuntivite e, no 4º dia, exantema máculo-papular cefalocaudal com manchas esbranquiçadas na mucosa oral. Diagnóstico mais provável?",
      correct: "Sarampo",
      wrongs: [
        "Roséola apenas, pelo exantema após defervescência",
        "Escarlatina sem faringite",
        "Urticária aguda por alimento"
      ],
      explain: "Tríade tosse/coriza/conjuntivite, febre e exantema cefalocaudal com enantema (Koplik) apontam sarampo, especialmente em não vacinado. Roséola tipicamente exantema após queda da febre.",
      trap: "Chamar de roséola qualquer exantema viral sem olhar o timing da febre e o enantema."
    },
    {
      theme: "Kawasaki",
      stem: "Menino de 3 anos com febre há 6 dias, injeção conjuntival não exsudativa, língua em framboesa, exantema polimorfo, edema de mãos e descamação periungueal inicial. Qual a melhor conduta?",
      correct: "Internar e iniciar imunoglobulina EV e AAS em doses adequadas, com ecocardiograma",
      wrongs: [
        "Tratar apenas com amoxicilina ambulatorial por 10 dias",
        "Aguardar 14 dias de febre para confirmar diagnóstico",
        "Indicar anticoagulação plena empírica sem avaliação coronariana"
      ],
      explain: "Critérios de Kawasaki com febre ≥5 dias exigem IGIV precoce e AAS, além de avaliação coronariana. Antibiótico isolado não trata a vasculite. Atrasar aumenta risco de aneurisma.",
      trap: "Esperar 'todos os critérios clássicos por mais tempo' e perder a janela da IGIV."
    },
    {
      theme: "Meningite",
      stem: "Lactente de 8 meses com febre, irritabilidade, fontanela tensa e vômitos. Estável hemodinamicamente. Qual o exame mais adequado para confirmar a hipótese central?",
      correct: "Punção lombar com análise do líquor (após estabilidade e sem contraindicação)",
      wrongs: [
        "Apenas hemograma, adiando o líquor indefinidamente",
        "Radiografia de crânio em duas incidências",
        "Teste rápido de estreptococo faríngeo como substituto"
      ],
      explain: "Suspeita de meningite bacteriana no lactente pede líquor tão logo seja seguro. Hemograma isolado não confirma. Imagem de crânio simples não substitui PL.",
      trap: "Tratar empiricamente sem líquor quando não há contraindicação, perdendo definição etiológica."
    },
    {
      theme: "Otite / faringite",
      stem: "Escolar com odinofagia, febre, exsudato amigdaliano e linfonodos cervicais dolorosos, sem tosse. Teste rápido de estreptococo positivo. Melhor conduta?",
      correct: "Antibiótico adequado para Streptococcus pyogenes (ex.: penicilina/amoxicilina)",
      wrongs: [
        "Apenas sintomáticos, pois toda faringite é viral",
        "Oseltamivir empírico",
        "Corticoterapia prolongada sem antibiótico"
      ],
      explain: "Critérios clínicos + teste positivo confirmam faringite estreptocócica; antibiótico reduz complicações. Nem toda faringite é viral — o teste guia a decisão.",
      trap: "Negar antibiótico em faringite estreptocócica documentada por 'evitar uso excessivo' de forma absoluta."
    },
    {
      theme: "IVAS / antibiótico",
      stem: "Pré-escolar com coriza, tosse e febre baixa há 3 dias, otoscopia normal, ausculta limpa e bom estado. Mãe insiste em antibiótico 'para não virar pneumonia'. Melhor conduta?",
      correct: "Orientar suporte sintomático e sinais de alarme; não indicar antibiótico neste momento",
      wrongs: [
        "Prescrever azitromicina 'por precaução'",
        "Solicitar TC de tórax de rotina",
        "Internar para oxigênio e ceftriaxona empíricos"
      ],
      explain: "Quadro típico de IVAS viral autolimitada não se beneficia de antibiótico. TC e internação são desproporcionais sem gravidade.",
      trap: "Ceder à pressão por antibiótico profilático em resfriado comum."
    },
    {
      theme: "Tuberculose",
      stem: "Criança de 5 anos contato intradomiciliar de TB pulmonar bacilífera, assintomática, radiografia normal, prova tuberculínica de 12 mm, sem BCG recente explicando o valor. Qual a melhor conduta?",
      correct: "Tratar infecção latente pelo esquema indicado na faixa etária/protocolo",
      wrongs: [
        "Esquema completo de TB doença com 4 drogas por 6 meses sem outros critérios",
        "Apenas repetir radiografia em 1 ano sem quimioprofilaxia",
        "Isolar em UTI e iniciar corticoterapia isolada"
      ],
      explain: "Contato + PT positiva sem sinais de doença configura infecção latente, tratada com esquema próprio. TB doença exige critérios clínicos/radiológicos/bacteriológicos.",
      trap: "Tratar como TB doença todo contato com PT positiva, ou não tratar latente."
    },
    {
      theme: "HIV pediátrico",
      stem: "Lactente filho de mãe HIV+, com carga viral materna alta no parto, sem profilaxia adequada. Com 6 semanas apresenta candidíase oral exuberante e pneumonia. Qual a prioridade diagnóstica?",
      correct: "Teste virológico para HIV (não apenas sorologia) e avaliação de infecções oportunistas",
      wrongs: [
        "Apenas ELISA materno repetido na criança como único exame",
        "Aguardar sorologia após os 18 meses sem investigação atual",
        "Tratar só candidíase tópica e liberar sem follow-up"
      ],
      explain: "Em menores de 18 meses, diagnóstico de HIV exige teste virológico. Clínica sugestiva e falha de profilaxia aumentam urgência. Sorologia isolada reflete anticorpos maternos.",
      trap: "Usar só sorologia precoce como regra-out definitivo de infecção."
    },
    {
      theme: "Imunização pós-exposição",
      stem: "Adolescente não vacinado contra hepatite B sofre exposição percutânea com sangue de fonte HBsAg positiva há 8 horas. Melhor conduta?",
      correct: "Imunoglobulina específica e iniciar esquema vacinal o mais precocemente possível",
      wrongs: [
        "Apenas observar sintomas por 6 meses",
        "Indicar interferon empírico imediato",
        "Única dose de vacina após 30 dias"
      ],
      explain: "Pós-exposição a fonte HBsAg+ em suscetível: HBIG + vacina precoces. Observação isolada é insuficiente.",
      trap: "Adiar imunoprofilaxia para 'ver se aparece icterícia'."
    },
    {
      theme: "Varicela / zoster",
      stem: "Criança de 2 anos imunocompetente com varicela típica, bom estado, sem sinais de infecção bacteriana secundária. Conduta?",
      correct: "Cuidados de suporte e isolamento de contatos suscetíveis de risco; antivirais só em critérios selecionados",
      wrongs: [
        "Aciclovir EV de rotina em todo caso ambulatorial",
        "Antibiótico de amplo espectro para todas as lesões",
        "Corticoterapia sistêmica para reduzir prurido"
      ],
      explain: "Varicela não complicada em imunocompetente é suporte. Antiviral sistêmico reserva-se a risco/complicação. Corticoide pode piorar disseminação.",
      trap: "Medicalizar varicela leve com aciclovir EV e antibiótico 'por segurança'."
    },
    {
      theme: "Mononucleose",
      stem: "Adolescente com febre, odinofagia exsudativa, linfadenomegalia cervical posterior e esplenomegalia. Iniciou amoxicilina e surgiu rash. Qual a interpretação mais provável?",
      correct: "Síndrome mononucleose-like (EBV); suspender aminopenicilina e dar suporte",
      wrongs: [
        "Alergia IgE grave à amoxicilina comprovada sem outra hipótese",
        "Escalação imediata para vancomicina e UTI",
        "Leucemia aguda definida só pelo rash medicamentoso"
      ],
      explain: "Quadro clássico de EBV + rash após aminopenicilina é conhecido. Nem todo rash pós-amoxicilina é alergia IgE verdadeira. Manejo é suporte e evitar esporte de contato se baço aumentado.",
      trap: "Rotular definitivamente alergia à penicilina e privar o paciente do antibiótico para sempre sem nuance."
    },
    {
      theme: "Parasitoses",
      stem: "Escolar com prurido anal noturno intenso, sono agitado e exame perianal com estrias. Qual o diagnóstico mais provável e a conduta típica?",
      correct: "Enterobíase; tratar com anti-helmíntico adequado e higiene, considerando contactantes",
      wrongs: [
        "Ascaridíase pulmonar; iniciar corticoide inalatório",
        "Alergia alimentar exclusiva; dieta de eliminação ampla",
        "Candidíase sistêmica; antifúngico EV"
      ],
      explain: "Prurido anal noturno é altamente sugestivo de oxiúrus. Tratamento anti-helmíntico e medidas de higiene/contactantes. Não se confunde com ascaridíase pulmonar.",
      trap: "Investigar alergia alimentar complexa antes de considerar enterobíase."
    },
    {
      theme: "Celulite / abscessos",
      stem: "Pré-escolar com febre e área eritematosa quente e dolorosa em perna, sem fluctuação. Qual a melhor conduta inicial?",
      correct: "Antibiótico com cobertura para estreptococo/estafilococo e reavaliação seriada",
      wrongs: [
        "Apenas compressa morna por 10 dias sem antibiótico",
        "Cirurgia exploratória óssea imediata sem imagem/indicação",
        "Antiviral sistêmico empírico"
      ],
      explain: "Celulite não purulenta típica trata-se com antibiótico dirigido aos cocos gram-positivos e seguimento. Ausência de abscesso não indica drenagem. Antiviral não tem papel.",
      trap: "Aguardar 'amadurecer' celulite sem antibiótico, ou operar precocemente sem critério."
    }
  ];
  inf.forEach((q, i) => {
    raw.push({ idPrefix: "ped-inf", n: i + 1, group: "Infectologia pediátrica", ...q });
  });

  // ── Pneumologia (10) ───────────────────────────────────────────
  /** @type {RawQ[]} */
  const pneumo = [
    {
      theme: "Bronquiolite",
      stem: "Lactente de 5 meses, 3º dia de coriza, agora com taquipneia, sibilos e saturação 96% em ar ambiente, alimentando-se com pausas. Qual a melhor conduta?",
      correct: "Suporte (oxigênio se necessário, hidratação/alimentação) e evitar terapias sem benefício rotineiro",
      wrongs: [
        "Corticosteroide sistêmico de rotina em todos os casos",
        "Salbutamol nebulizado seriado como padrão obrigatório",
        "Antibiótico de amplo espectro por 10 dias"
      ],
      explain: "Bronquiolite viral é suporte. Corticoide e broncodilatador não têm benefício rotineiro comprovado; antibiótico só se coinfecção bacteriana. A decisão de internar depende de hipoxemia, dificuldade alimentar e idade.",
      trap: "Tratar bronquiolite como crise asmática com corticoide + β2 de rotina."
    },
    {
      theme: "Asma",
      stem: "Escolar com sibilância recorrente, despertares noturnos e uso de salbutamol >2 vezes/semana. Exame entre crises quase normal. Melhor passo terapêutico de manutenção?",
      correct: "Iniciar corticoide inalatório em dose adequada e plano de ação",
      wrongs: [
        "Manter só salbutamol sob demanda indefinidamente",
        "Antibiótico mensal profilático",
        "Antitussígeno opioide noturno"
      ],
      explain: "Sintomas frequentes definem necessidade de controle com CI. Resgate isolado não trata inflamação. Antibiótico e opioide não têm papel no controle.",
      trap: "Aceitar uso frequente de resgate como 'normal da asma' sem preventivo."
    },
    {
      theme: "Pneumonia",
      stem: "Pré-escolar com febre, taquipneia, tiragem e estertores localizados; radiografia com consolidação lobar. Estável, SatO2 94%. Melhor conduta ambulatorial típica?",
      correct: "Antibiótico empírico para pneumonia adquirida na comunidade (ex.: amoxicilina) e reavaliação",
      wrongs: [
        "Apenas nebulização com soro fisiológico",
        "Oseltamivir + corticoide sem antibiótico",
        "Internação em UTI e ventilação invasiva imediata"
      ],
      explain: "Consolidação lobar febril com esforço sugere pneumonia bacteriana típica; amoxicilina é primeira linha em muitos protocolos ambulatoriais se não houver gravidade. UTI não é automática com Sat aceitável e estabilidade.",
      trap: "Tratar pneumonia lobar só com suporte de bronquiolite."
    },
    {
      theme: "Corpo estranho",
      stem: "Menino de 2 anos apresentou engasgo súbito com amendoim seguido de tosse e sibilância unilateral persistente. Radiografia pode ser normal na expiração. Qual o próximo passo mais adequado?",
      correct: "Broncoscopia diagnóstica/terapêutica em centro experiente",
      wrongs: [
        "Corticoterapia prolongada ambulatorial como tratamento definitivo",
        "Antibiótico por 3 semanas sem investigação",
        "Observação exclusiva por 30 dias"
      ],
      explain: "História de engasgo + sinais focais persistentes impõe exclusão de corpo estranho por broncoscopia. Tratamento clínico isolado atrasa remoção e aumenta complicações.",
      trap: "Tratar como asma/pneumonia de repetição sem valorizar o engasgo súbito."
    },
    {
      theme: "Laringite / crupe",
      stem: "Pré-escolar com rouquidão, tosse metálica e estridor leve em repouso, SatO2 normal, sem toxemia. Melhor conduta?",
      correct: "Corticosteroide (ex.: dexametasona) e observação; adrenalina nebulizada se estridor moderado/grave",
      wrongs: [
        "Antibiótico de rotina para cobrir difteria em todo crupe",
        "Intubação imediata em todo estridor leve",
        "Sedação com opioide para reduzir a tosse"
      ],
      explain: "Crupe viral leve/moderado responde a corticoide; adrenalina nebulizada nos casos com esforço maior. Intubação é para falência/imminente obstrução. Opioide é perigoso.",
      trap: "Intubar precocemente crupe leve ou usar antibiótico indiscriminado."
    },
    {
      theme: "Fibrose cística",
      stem: "Lactente com íleo meconial neonatal, agora com esteatorarreia, desnutrição e colonizações respiratórias de repetição. Teste do pezinho alterado. Exame confirmatório mais adequado?",
      correct: "Teste do suor (cloreto) e/ou estudo genético conforme protocolo",
      wrongs: [
        "Apenas IgE total elevada como critério diagnóstico",
        "Biópsia hepática de rotina como primeiro teste",
        "Teste ergométrico em esteira"
      ],
      explain: "Fenótipo clássico + triagem neonatal levam a confirmação por suor/genética. IgE não diagnostica FC. Biópsia hepática não é o primeiro passo.",
      trap: "Atribuir só 'alergia/asma' a infecções e má absorção com história de íleo meconial."
    },
    {
      theme: "Coqueluche",
      stem: "Lactente de 2 meses com acessos de tosse em salvas, engasgos e episódios de cianose, sem febre alta. Leucocitose com linfocitose. Qual a melhor conduta?",
      correct: "Internar conforme gravidade, antibiótico macrolídeo e notificação/profilaxia de contactantes",
      wrongs: [
        "Apenas antitussígeno sedativo domiciliar",
        "Corticoide inalatório como tratamento etiológico",
        "Vacina DTPa como único tratamento da doença atual"
      ],
      explain: "Coqueluche em lactente jovem é potencialmente grave: suporte, macrolídeo e controle de focos. Sedativos antitussígenos são perigosos. Vacina protege a médio prazo, não trata a infecção instalada.",
      trap: "Mandar para casa com xarope sedativo um lactente com salvas e cianose."
    },
    {
      theme: "Derrame pleural",
      stem: "Criança com pneumonia em tratamento, mantém febre e desconforto; ultrassom mostra derrame pleural septado significativo. Próximo passo?",
      correct: "Avaliar drenagem/intervenção pleural e ajuste antimicrobiano em ambiente hospitalar",
      wrongs: [
        "Aumentar só antitussígeno oral e manter ambulatorial",
        "Fisioterapia isolada como terapia definitiva",
        "Suspender antibiótico por 'falha' e observar"
      ],
      explain: "Derrame parapneumônico complicado frequentemente precisa drenagem e otimização antimicrobiana. Suspender antibiótico ou tratar só com xarope é inadequado.",
      trap: "Persistir no oral ambulatorial perante derrame septado e febre persistente."
    },
    {
      theme: "Apneia / SAOS",
      stem: "Escolar obeso com roncos, pausas respiratórias referidas pelos pais, enurese secundária e baixo rendimento escolar. Exame com hipertrofia amigdaliana. Melhor próximo passo?",
      correct: "Avaliar apneia obstrutiva do sono (ex.: polissonografia/encaminhamento ORL conforme disponibilidade)",
      wrongs: [
        "Prescrever benzodiazepínico noturno para 'profundar o sono'",
        "Indicar adenoidectomia sem qualquer avaliação",
        "Ignorar porque ronco é normal na infância"
      ],
      explain: "Ronco + pausas + sintomas diurnos sugerem SAOS; investigação e eventual ORL são indicados. Benzodiazepínico piora obstrução.",
      trap: "Sedative para ronco ou banalizar pausas respiratórias."
    },
    {
      theme: "Bronquiectasia / infecção",
      stem: "Criança com tosse produtiva crônica, baqueteamento digital e infecções de repetição no mesmo lobo. Qual exame de imagem é o mais útil para caracterizar a via aérea?",
      correct: "TC de tórax de alta resolução",
      wrongs: [
        "Radiografia de seios da face como único exame",
        "Ultrassom abdominal de rotina",
        "Ressonância de coluna lombar"
      ],
      explain: "TCAR é o padrão para mapear bronquiectasias e guiar investigação de causas (FC, imunodeficiência, aspiração). Outros exames não caracterizam a árvore brônquica.",
      trap: "Contentar-se com radiografia simples normal e não avançar na tosse crônica produtiva."
    }
  ];
  pneumo.forEach((q, i) => {
    raw.push({ idPrefix: "ped-pneumo", n: i + 1, group: "Pneumologia / respiratório", ...q });
  });

  // ── Gastroenterologia (8) ──────────────────────────────────────
  /** @type {RawQ[]} */
  const gastro = [
    {
      theme: "Diarreia aguda",
      stem: "Lactente de 11 meses com diarreia aquosa há 2 dias, olhos fundos, lágrimas diminuídas, turgor lento e sede intensa; ainda responsivo. Qual a melhor conduta?",
      correct: "Reidratação com SRO conforme plano B (ou equivalente) e reavaliação",
      wrongs: [
        "Antibiotico empírico para todos os vírus enterais",
        "Loperamida para reduzir o número de evacuações",
        "Jejum absoluto por 48 horas"
      ],
      explain: "Sinais de desidratação moderada pedem SRO supervisionada e reavaliação. Loperamida é contraindicada em lactentes. Antibiótico não é rotina em diarreia aquosa viral. Jejum prolongado atrasa recuperação.",
      trap: "Usar antidiarreico antimotilidade em lactente desidratado."
    },
    {
      theme: "Constipação",
      stem: "Pré-escolar com evacuações endurecidas, escape fecal e massa fecal em ampola. Qual a abordagem inicial mais adequada?",
      correct: "Desimpactação e laxativo de manutenção com orientações de banheiro e fibras/líquidos",
      wrongs: [
        "Apenas punição comportamental sem tratamento orgânico da impactação",
        "Cirurgia de Hartmann de rotina",
        "Antibiótico prolongado para 'flora intestinal'"
      ],
      explain: "Constipação funcional com escape (sobretudo retentiva) exige desimpactação e manutenção. Punir a criança piora o ciclo. Cirurgia não é primeira linha.",
      trap: "Tratar escape fecal como 'falta de educação' sem desimpactar."
    },
    {
      theme: "RGE / DRGE",
      stem: "Lactente de 2 meses regurgita após mamadas, ganha peso bem, sem crises de apneia ou sangramento. Melhor conduta?",
      correct: "Tranquilizar e medidas posturais/espessamento se necessário; evitar exames invasivos de rotina",
      wrongs: [
        "Fundoplicatura imediata",
        "IBP em dose máxima por 12 meses sem critérios",
        "Endoscopia urgente em todo regurgitador"
      ],
      explain: "Regurgitação com bom ganho é tipicamente fisiológica. Invasivo e IBP prolongado reservam-se a DRGE complicada. Cirurgia é excepcional.",
      trap: "Medicalizar refluxo fisiológico com IBP prolongado."
    },
    {
      theme: "Apendicite",
      stem: "Escolar com dor periumbilical migrando para fossa ilíaca direita, vômitos, febre baixa e descompressão dolorosa. Ultrassom inconclusivo. Qual a melhor conduta?",
      correct: "Manter alta suspeita clínica; observação cirúrgica/imagem complementar e não liberar com analgésico isolado",
      wrongs: [
        "Alta com dipirona e retorno 'se piorar' sem plano",
        "Antibiótico oral ambulatorial como tratamento definitivo sem avaliação",
        "Lavagem intestinal forçada em domicilio"
      ],
      explain: "Migratória clássica com sinais peritoneais mantém indicação de avaliação cirúrgica mesmo com US inconclusivo. Alta precoce com analgésico mascara evolução.",
      trap: "Confiar cegamente em ultrassom negativo e liberar o paciente."
    },
    {
      theme: "Intussuscepção",
      stem: "Lactente de 8 meses com episódios de choro intenso e palidez intercalados com letargia, vômitos e evacuações com sangue escuro em geleia. Massa em forma de salsicha em hipocôndrio. Próximo passo?",
      correct: "Estabilizar e encaminhar para redução (enema guiado/cirurgia conforme disponibilidade e gravidade)",
      wrongs: [
        "Apenas probiótico e observação domiciliar",
        "Tratar como fissura anal com pomada",
        "Colonoscopia ambulatorial eletiva em 30 dias"
      ],
      explain: "Quadro clássico de intussuscepção exige redução urgente após estabilização. Pomada para fissura não aborda a urgência. Atraso aumenta risco de necrose.",
      trap: "Atribuir sangue nas fezes só a fissura e mandar para casa."
    },
    {
      theme: "Doença celíaca",
      stem: "Escolar com diarreia crônica, anemia ferropriva refratária, baixo peso e distensão. Come glúten regularmente. Qual a estratégia diagnóstica correta?",
      correct: "Sorologias específicas (ex.: anti-transglutaminase IgA + IgA total) com dieta contendo glúten, e biópsia conforme protocolo",
      wrongs: [
        "Retirar glúten por 6 meses e só então dosar sorologia",
        "Diagnosticar só por teste IgG anti-gliadina antigo isolado",
        "Indicar pancreatectomia"
      ],
      explain: "Investigação de celíaca deve ocorrer sob dieta com glúten. Retirar glúten antes dos testes falseia resultados. Confirmação segue algoritmo sorológico ± biópsia.",
      trap: "Começar dieta sem glúten 'de teste' antes da investigação formal."
    },
    {
      theme: "Hepatite / icterícia",
      stem: "Adolescente com icterícia, colúria, anorexia e ALT/AST muito elevadas após quadro prodrômico. Sorologia anti-HBc IgM positiva e HBsAg positivo. Diagnóstico?",
      correct: "Hepatite B aguda",
      wrongs: [
        "Hepatite A exclusiva, sem necessidade de sorologia B",
        "Obstrução por cálculo como primeira hipótese sem dor",
        "Síndrome de Gilbert com aminotransferases normais"
      ],
      explain: "HBsAg + anti-HBc IgM definem infecção aguda por HBV. Gilbert não eleva muito as transaminases. Cálculo costuma ter padrão colestático e dor.",
      trap: "Chamar toda hepatite aguda de A sem sorologias."
    },
    {
      theme: "Alergia alimentar",
      stem: "Lactente em fórmula padrão com sangue nas fezes, irritabilidade e bom estado geral, sem anemia grave. Hipótese de proctocolite. Melhor conduta inicial?",
      correct: "Prova terapêutica com fórmula extensamente hidrolisada (ou dieta materna se AME) e seguimento",
      wrongs: [
        "Colonoscopia imediata em todos os casos leves",
        "Adrenalina intramuscular de rotina a cada mamada",
        "Antibiótico por 14 dias"
      ],
      explain: "Proctocolite por proteína do leite costuma ser leve e responde a exclusão/fórmula hidrolisada. Colonoscopia não é primeiro passo. Adrenalina é para anafilaxia.",
      trap: "Indicar endoscopia invasiva precoce em proctocolite leve típica."
    }
  ];
  gastro.forEach((q, i) => {
    raw.push({ idPrefix: "ped-gastro", n: i + 1, group: "Gastroenterologia", ...q });
  });

  // ── Urgências (8) ──────────────────────────────────────────────
  /** @type {RawQ[]} */
  const urg = [
    {
      theme: "PCR / PALS",
      stem: "Criança em PCR, ritmo não chocável, via aérea aberta. Qual a sequência medicamentosa/energia mais coerente com PALS?",
      correct: "Adrenalina a cada 3–5 minutos; identificar e tratar causas reversíveis",
      wrongs: [
        "Amiodarona em bolus repetidos sem indicação de ritmo",
        "Cardioversão sincronizada como primeiro ato em assistolia",
        "Bicarbonato de rotina em todos os ciclos"
      ],
      explain: "Em ritmos não chocáveis, adrenalina periódica e busca de Hs/Ts são pilares. Cardioversão sincronizada não trata assistolia/AESP. Bicarbonato não é rotina.",
      trap: "Aplicar lógica de FV/TV sem pulso (choque/antiarrítmico) em assistolia."
    },
    {
      theme: "Choque",
      stem: "Lactente com taquicardia, enchimento capilar de 5 s, pressão limítrofe e história de diarreia intensa. Qual a prioridade imediata?",
      correct: "Expansão volumétrica com cristaloide em bolus e reavaliação da perfusão",
      wrongs: [
        "Noradrenalina como primeiro passo sem volume",
        "Diurético para evitar sobrecarga",
        "Aguardar hemocultura por 2 horas antes de qualquer fluido"
      ],
      explain: "Choque hipovolêmico/distributivo inicial na criança responde a bolus de cristaloide e reassessment. Vasopressor vem após volume inadequado/refratariedade, não antes em hipovolemia pura.",
      trap: "Começar vasoativo em choque hipovolêmico sem repor volume."
    },
    {
      theme: "Anafilaxia",
      stem: "Escolar após ingestão de amendoim apresenta urticária, vômitos, sibilância e queda da pressão. Qual a droga de primeira linha?",
      correct: "Adrenalina intramuscular na face ântero-lateral da coxa",
      wrongs: [
        "Apenas anti-histamínico oral e observação domiciliar",
        "Corticoide EV como única medida",
        "Salbutamol nebulizado isolado sem adrenalina"
      ],
      explain: "Anafilaxia exige adrenalina IM imediata. Anti-histamínico e corticoide são adjuvantes e não substituem a adrenalina. Broncodilatador ajuda o broncoespasmo, mas não trata o choque/anafilaxia global.",
      trap: "Priorizar anti-histamínico/corticoide e atrasar a adrenalina."
    },
    {
      theme: "Convulsão",
      stem: "Pré-escolar em crise tônico-clônica contínua há 8 minutos na emergência, acesso obtido. Qual o medicamento de primeira linha?",
      correct: "Benzodiazepínico (ex.: diazepam/midazolam/lorazepam) na dose e via adequadas",
      wrongs: [
        "Fenitoína intramuscular como primeiro agente",
        "Antibiótico empírico antes de cessar a crise",
        "Observação sem fármaco até 30 minutos"
      ],
      explain: "Estado de mal convulsivo inicia com benzodiazepínico. Fenitoína/outros vêm depois se a crise persistir. Esperar 30 minutos é inaceitável.",
      trap: "Pular o benzodiazepínico e ir direto a anticonvulsivante de manutenção."
    },
    {
      theme: "TCE",
      stem: "Menino de 6 anos caiu da própria altura, sem perda de consciência, exame neurológico normal, sem vômitos repetidos nem mecanismo grave. Qual a conduta mais adequada?",
      correct: "Observação e orientações de retorno; imagem não é rotina",
      wrongs: [
        "TC de crânio imediata em todos os TCE leves",
        "Internação em UTI por 72 horas obrigatória",
        "Punção lombar diagnóstica"
      ],
      explain: "TCE leve de baixo risco com exame normal pode ser observado sem TC rotineira, reduzindo radiação. Critérios de PECARN/similares guiam imagem.",
      trap: "Pedir TC em todo batida de cabeça, sem estratificar risco."
    },
    {
      theme: "Intoxicação",
      stem: "Adolescente trazido 45 minutos após ingestão de grande quantidade de paracetamol em tentativa de autoextermínio, ainda assintomático. Melhor conduta?",
      correct: "Avaliar níveis/tempo e iniciar N-acetilcisteína conforme protocolo, além de suporte e cuidado em saúde mental",
      wrongs: [
        "Alta liberada porque ainda não há icterícia",
        "Aguardar falência hepática para tratar",
        "Induzir vômito com água sanitária"
      ],
      explain: "Toxicidade por paracetamol pode ser inicialmente silenciosa; NAC precoce previne hepatotoxicidade. Esperar icterícia é tarde. Eméticos cáusticos são perigosos.",
      trap: "Liberar intoxicação por paracetamol 'assintomática' sem protocolo de NAC."
    },
    {
      theme: "Desidratação grave",
      stem: "Lactente letárgico, sem lágrimas, turgor muito diminuído, pulsos fracos e enchimento capilar >5 s após diarreia. Qual a prioridade?",
      correct: "Acesso vascular/intraósseo e expansão EV imediata",
      wrongs: [
        "Tentar apenas SRO oral por 2 horas na sala de espera",
        "Restrição hídrica por risco de SIADH",
        "Sonda nasogástrica com dieta hipercalórica como primeiro ato"
      ],
      explain: "Desidratação grave com choque exige volume EV/IO imediato. SRO é para planos A/B em pacientes que bebem e não estão em choque.",
      trap: "Insistir em SRO oral na criança em choque hipovolêmico."
    },
    {
      theme: "Corpo estranho em via aérea",
      stem: "Lactente engasgado, consciente, com tosse ineficaz e cianose crescente. Qual a manobra imediata?",
      correct: "Manobras de desobstrução da via aérea adequadas à idade (tapotagem/compressões)",
      wrongs: [
        "Oferecer água para 'empurrar' o objeto",
        "Realizar varredura digital cega de rotina",
        "Aguardar parada completa antes de qualquer ação"
      ],
      explain: "Obstrução grave com tosse ineficaz exige desobstrução imediata por manobras etárias. Varredura cega pode impactar o objeto. Água não remove corpo estranho.",
      trap: "Fazer finger sweep cego ou esperar a PCR para agir."
    }
  ];
  urg.forEach((q, i) => {
    raw.push({ idPrefix: "ped-urg", n: i + 1, group: "Urgências e emergências", ...q });
  });

  // ── Nefrologia (6) ─────────────────────────────────────────────
  /** @type {RawQ[]} */
  const nefro = [
    {
      theme: "ITU",
      stem: "Lactente febril sem foco aparente, bom estado, urina de jato médio contaminada. Qual a melhor estratégia diagnóstica?",
      correct: "Obter urocultura por método adequado (saco com cautela/cateterismo/punção) antes do antibiótico quando possível",
      wrongs: [
        "Tratar por 3 dias sem cultura porque 'toda febre é viral'",
        "Diagnosticar ITU só pelo odor da fralda",
        "TC de abdome de rotina em toda febre"
      ],
      explain: "Febre sem foco no lactente exige exclusão de ITU com urocultura bem colhida. Odor isolado não diagnostica. Antibiótico sem cultura dificulta o manejo.",
      trap: "Tratar empiricamente sem cultura ou diagnosticar por cheiro da fralda."
    },
    {
      theme: "Síndrome nefrótica",
      stem: "Pré-escolar com edema periorbitário matinal, proteinúria maciça, hipoalbuminemia e colesterol elevado, sem hipertensão grave nem hematúria franca. Conduta inicial típica?",
      correct: "Corticoterapia conforme protocolo de nefrótica idiopática e orientações sobre complicações",
      wrongs: [
        "Biópsia renal imediata em todos os pré-escolares típicos antes de qualquer corticoide",
        "Antibiótico prolongado como tratamento da proteinúria",
        "Restrição absoluta de água e sal sem acompanhamento"
      ],
      explain: "Nefrótica idiopática típica em pré-escolar costuma iniciar corticoide sem biópsia imediata. Biópsia reserva-se a atípicos/refratários. Antibiótico não trata a proteinúria.",
      trap: "Biópsiar todo caso típico antes da prova terapêutica com corticoide."
    },
    {
      theme: "Glomerulonefrite",
      stem: "Escolar 2 semanas após impetigo apresenta edema, hipertensão e urina cor de chá com hematúria dismórfica. C3 baixo. Diagnóstico mais provável?",
      correct: "Glomerulonefrite pós-estreptocócica",
      wrongs: [
        "Síndrome nefrótica de mudanças mínimas pura",
        "ITU baixa sem acometimento glomerular",
        "Diabetes insipidus central"
      ],
      explain: "Intervalo pós-estreptocócico cutâneo, síndrome nefrítica e C3 baixo são clássicos de GNPE. Mudanças mínimas é nefrótica sem hematúria/hipertensão típicas.",
      trap: "Chamar de nefrótica todo edema, ignorando hematúria e hipertensão."
    },
    {
      theme: "SHA / HUS",
      stem: "Pré-escolar após diarreia sanguinolenta evolui com palidez, oligúria, hipertensão, plaquetopenia e esquizócitos. Qual o diagnóstico sindrômico?",
      correct: "Síndrome hemolítico-urêmica",
      wrongs: [
        "Púrpura de Henoch-Schönlein sem alterações renais laboratoriais",
        "Anemia ferropriva isolada",
        "Cistite simples"
      ],
      explain: "Tríade anemia hemolítica microangiopática + plaquetopenia + injúria renal após diarreia sanguinolenta define SHU típica. Ferropriva não gera esquizócitos nem IRA assim.",
      trap: "Tratar só a diarreia e perder a microangiopatia renal."
    },
    {
      theme: "Hipertensão",
      stem: "Adolescente obeso com PA persistentemente elevada em consultório e em casa, sem sintomas. Exame de fundo de olho normal. Melhor abordagem inicial?",
      correct: "Confirmar técnica/medidas, investigar causas secundárias selecionadas e iniciar mudanças de estilo de vida",
      wrongs: [
        "Iniciar três anti-hipertensivos de uma vez sem confirmação",
        "Ignorar porque 'criança não tem hipertensão'",
        "Internar em UTI para nitroprussiato empírico"
      ],
      explain: "PA elevada exige confirmação e estratificação. Em obesos, estilo de vida é central; investigação secundária é dirigida. Nitroprussiato é para emergência hipertensiva.",
      trap: "Negar a existência de hipertensão pediátrica ou tratar como emergência sem critérios."
    },
    {
      theme: "Enurese / anomalia",
      stem: "Menina de 5 anos nunca teve continência diurna, com escapes constantes e infecções urinárias de repetição. Qual a preocupação anatômica principal a investigar?",
      correct: "Malformação/ectopia ureteral ou outra anomalia do trato urinário",
      wrongs: [
        "Apenas enurese noturna monosintomática típica",
        "Diabetes mellitus sem poliúria/polidipsia",
        "Constipação exclusiva sem avaliação urológica"
      ],
      explain: "Incontinência diurna contínua desde sempre em menina sugere ectopia ureteral (ureter em vestíbulo/vagina). Não é enurese noturna clássica. Exige imagem/urologia.",
      trap: "Tratar como enurese comportamental uma incontinência diurna contínua primária."
    }
  ];
  nefro.forEach((q, i) => {
    raw.push({ idPrefix: "ped-nefro", n: i + 1, group: "Nefrologia", ...q });
  });

  // ── Endocrinologia (6) ─────────────────────────────────────────
  /** @type {RawQ[]} */
  const endo = [
    {
      theme: "Cetoacidose",
      stem: "Escolar polidipsia e emagrecimento, agora com vômitos, respiração profunda, glicemia 480 mg/dL e pH 7,12. Qual a prioridade terapêutica inicial?",
      correct: "Hidratação com cristaloide e insulina EV conforme protocolo de CAD, monitorando potássio",
      wrongs: [
        "Insulina subcutânea isolada sem hidratação",
        "Bicarbonato de rotina em todo pH < 7,20",
        "Jejuar e só observar até gasometria normalizar sozinha"
      ],
      explain: "CAD pediátrica exige volume cuidadoso + insulina EV e vigilância de K e edema cerebral. Bicarbonato não é rotina. Insulina SC isolada é insuficiente na CAD grave.",
      trap: "Corrigir agressivamente com bicarbonato ou negligenciar o potássio na CAD."
    },
    {
      theme: "Hipotireoidismo congênito",
      stem: "RN com icterícia prolongada, hernia umbilical, macroglossia e hipotonia; pezinho com TSH elevado. Melhor conduta?",
      correct: "Confirmar função tireoidiana e iniciar levotiroxina precocemente",
      wrongs: [
        "Aguardar 1 ano para ver se 'amadurece'",
        "Indicar tireoidectomia imediata",
        "Tratar só com iodo tópico cutâneo"
      ],
      explain: "Fenótipo + TSH alto pedem confirmação e reposição imediata. Atraso no tratamento compromete QI. Cirurgia não é o manejo do hipotireoidismo congênito típico.",
      trap: "Adiar hormônio esperando resolução espontânea."
    },
    {
      theme: "Hiperplasia adrenal",
      stem: "RN do sexo feminino com genitália ambígua e, na 2ª semana, vômitos, desidratação e hiponatremia com hipercalemia. Qual a hipótese mais importante?",
      correct: "Hiperplasia adrenal congênita por deficiência de 21-hidroxilase (forma perdedora de sal)",
      wrongs: [
        "Diabetes neonatal transitório isolado",
        "Hipotireoidismo primário puro",
        "Fibrose cística sem alterações eletrolíticas típicas"
      ],
      explain: "Virilização feminina + crise perdedora de sal com hipoNa/hiperK é clássica de HAC 21-OH. Exige hidrocortisona, fludrocortisona e sal. Outras endocrinopatias não reúnem esse conjunto.",
      trap: "Tratar só como gastroenterite a crise adrenal neonatal."
    },
    {
      theme: "Baixa estatura",
      stem: "Menino de 10 anos no percentil 3 de estatura, velocidade normal, pai e mãe baixos, idade óssea compatível com a cronológica. Interpretação mais provável?",
      correct: "Baixa estatura familiar",
      wrongs: [
        "Deficiência de GH clássica com velocidade zero",
        "Hipotireoidismo não tratado com queda livre da curva",
        "Doença celíaca ativa sem outros sinais e com velocidade normal"
      ],
      explain: "Estatura baixa proporcional à família, com velocidade e idade óssea preservadas, sugere padrão familiar. Déficit de GH costuma ter velocidade baixa e atraso ósseo.",
      trap: "Investigar GH invasivamente em toda criança no P3 sem olhar velocidade e alvo familiar."
    },
    {
      theme: "Puberdade precoce",
      stem: "Menina de 5 anos com telarca, aceleração de crescimento e pico de LH após GnRH elevado. Qual o tratamento específico mais usado?",
      correct: "Análogo de GnRH",
      wrongs: [
        "Estrogênio oral contínuo para 'completar a puberdade'",
        "Testosterona depot mensal",
        "Iodo radioativo tireoidiano"
      ],
      explain: "Puberdade precoce central confirma-se com eixo ativado; análogos de GnRH freiam a progressão e preservam potencial estatural. Estrogênio agravaria o quadro.",
      trap: "Usar hormônio sexual em vez de bloquear o eixo na puberdade precoce central."
    },
    {
      theme: "Obesidade / DM2",
      stem: "Adolescente obeso com poliúria, glicemia de jejum 180 mg/dL, HbA1c 8,2%, sem cetoacidose. Anticorpos anti-GAD negativos. Melhor conduta inicial típica?",
      correct: "Educação, mudanças de estilo de vida e metformina (com insulina se gravidade/protocolo exigir)",
      wrongs: [
        "Pancreatectomia parcial empírica",
        "Apenas dieta sem acompanhamento glicêmico",
        "Iodo radioativo para 'reduzir metabolismo'"
      ],
      explain: "Perfil de DM2 pediátrico (obesidade, anticorpos negativos) inicia com estilo de vida e metformina; insulina entra conforme gravidade/HbA1c. Cirurgia pancreática não é tratamento.",
      trap: "Tratar todo diabetes pediátrico automaticamente como tipo 1 com esquema basal-bolus sem olhar o fenótipo."
    }
  ];
  endo.forEach((q, i) => {
    raw.push({ idPrefix: "ped-endo", n: i + 1, group: "Endocrinologia", ...q });
  });

  // ── Cardiologia (5) ────────────────────────────────────────────
  /** @type {RawQ[]} */
  const cardio = [
    {
      theme: "SOP / cardiopatia",
      stem: "RN de 10 dias com sudorese às mamadas, taquipneia, hepatomegalia e sopro; saturando 88% em ar ambiente. Qual a prioridade diagnóstica inicial?",
      correct: "Avaliar cardiopatia congênita com urgência (oximetria crítica/ecocardiograma) e estabilizar",
      wrongs: [
        "Tratar como bronquiolite exclusiva sem avaliação cardíaca",
        "Alta com orientação de cólica",
        "Iniciar AAS antiagregante como única medida"
      ],
      explain: "Insuficiência cardíaca/cianose no período neonatal de fechamento do ducto sugere cardiopatia crítica. Ecocardiograma e suporte (prostaglandina se ducto-dependente) são centrais.",
      trap: "Atribuir cansaço às mamadas só a 'pulmão' ou cólica."
    },
    {
      theme: "CIA / CIV",
      stem: "Escolar assintomático com sopro sistólico suave e desdobramento fixo de B2. Radiografia com hiperfluxo pulmonar leve. Diagnóstico mais provável?",
      correct: "Comunicação interatrial",
      wrongs: [
        "Estenose aórtica crítica do neonato",
        "Tetralogia de Fallot com crises de hipoxia",
        "Pericardite constritiva aguda"
      ],
      explain: "Desdobramento fixo de B2 com hiperfluxo é clássico de CIA. Fallot cursa com cianose/crises; estenose aórtica crítica é neonatal grave.",
      trap: "Associar qualquer sopro a CIV, sem valorizar o B2 fixo."
    },
    {
      theme: "Febre reumática",
      stem: "Adolescente com migratória de grandes articulações, sopro de regurgitação mitral novo e evidência de infecção estreptocócica prévia. Qual o diagnóstico sindrômico?",
      correct: "Febre reumática aguda (cardite + artrite)",
      wrongs: [
        "Artrite séptica poliarticular sem foco",
        "Lúpus com anti-DNA negativo e sem outros critérios",
        "Miocardite viral exclusiva sem critérios de Jones"
      ],
      explain: "Artrite migratória + cardite + evidência de estreptococo preenchem critérios de Jones para febre reumática. Isso muda profilaxia secundária e manejo.",
      trap: "Tratar só a artrite e esquecer a cardite/profilaxia."
    },
    {
      theme: "Síncope",
      stem: "Adolescente com síncope durante exercício, história familiar de morte súbita e ECG com intervalo QT longo. Melhor conduta?",
      correct: "Afastar de esportes competitivos, investigar canalopatia e referir à cardiologia/eletrofisiologia",
      wrongs: [
        "Liberar esporte integral após soro caseiro",
        "Diagnosticar síncope vasovagal típica sem ECG",
        "Prescrever estimulante para melhorar o rendimento"
      ],
      explain: "Síncope de esforço + QT longo + história familiar é alto risco de arritmia hereditária. Exige restrição e avaliação especializada, não liberação esportiva.",
      trap: "Rotular toda síncope adolescente como vasovagal sem ECG e contexto de esforço."
    },
    {
      theme: "Kawasaki / coronárias",
      stem: "Criança no 10º dia de Kawasaki tratado tardiamente apresenta sopro e ecocardiograma com aneurisma coronariano médio. Além do seguimento, qual cuidado é essencial?",
      correct: "Antiagregação (e anticoagulação se critério de tamanho/risco) e seguimento cardiológico estrito",
      wrongs: [
        "Alta definitiva sem reavaliação de coronárias",
        "Antibiótico isolado por 6 meses",
        "Vacina viva imediata no mesmo dia da IGIV sem intervalo"
      ],
      explain: "Aneurisma coronariano exige antiagregação ± anticoagulação conforme risco e follow-up de imagem. IGIV recente também impacta intervalo de vacinas vivas.",
      trap: "Considerar Kawasaki 'curado' só porque a febre cedeu, ignorando coronárias."
    }
  ];
  cardio.forEach((q, i) => {
    raw.push({ idPrefix: "ped-cardio", n: i + 1, group: "Cardiologia", ...q });
  });

  // ── Hematologia (4) ────────────────────────────────────────────
  /** @type {RawQ[]} */
  const hemato = [
    {
      theme: "Anemia ferropriva",
      stem: "Lactente de 15 meses com Hb 8,2 g/dL, VCM 62 fL, RDW alto, ferritina baixa, estável hemodinamicamente. Melhor conduta?",
      correct: "Sulfato ferroso terapêutico e ajuste dietético, com controle da resposta",
      wrongs: [
        "Transfusão de plaquetas",
        "Transfusão de hemácias de rotina por Hb < 9 em paciente estável",
        "Biópsia de medula imediata sem prova de ferro"
      ],
      explain: "Anemia microcítica com ferritina baixa em lactente com dieta inadequada é ferropriva: ferro oral e dieta. Transfusão não é rotina se estável; plaquetas não tratam anemia.",
      trap: "Transfundir anemia crônica estável apenas pelo valor da Hb."
    },
    {
      theme: "Púrpura trombocitopênica",
      stem: "Pré-escolar após IVAS apresenta petéquias e plaquetas 12.000/mm³, sem sangramento maior, exame sem hepatoesplenomegalia, hemoglobina normal. Conduta mais adequada na maioria dos protocolos atuais?",
      correct: "Observação ou terapia dirigida ao sangramento conforme risco; evitar procedimentos invasivos desnecessários",
      wrongs: [
        "Esplenectomia imediata em todos os casos de primeira crise",
        "Transfusão de plaquetas de rotina só pelo número, sem sangramento grave",
        "Quimioterapia multiagente empírica"
      ],
      explain: "PTI aguda típica com sangramento leve frequentemente é expectante ou usa Ig/corticoide conforme risco. Transfusão plaquetária isolada pelo número é pouco duradoura e não rotina; esplenectomia é excepcional na primeira crise.",
      trap: "Transfundir plaquetas automaticamente porque 'estão muito baixas', mesmo sem hemorragia grave."
    },
    {
      theme: "Drepanocitose",
      stem: "Criança com anemia falciforme chega com febre 39 °C, bom estado relativo, sem foco claro. Qual a preocupação e conduta inicial?",
      correct: "Risco de sepse por germes encapsulados; coletar culturas e iniciar antibiótico empírico conforme protocolo",
      wrongs: [
        "Apenas antitérmico domiciliar sem avaliação, por ser 'febre da doença'",
        "Transfusão de troca imediata em toda febre",
        "Suspender penicilina profilática definitivamente"
      ],
      explain: "Febre na falciforme é emergência potencial por asplenia funcional. Antibiótico empírico precoce após culturas é regra em muitos protocolos. Nem toda febre é crise vaso-oclusiva simples.",
      trap: "Liberar febre na falciforme como 'só dor/crise' sem cobrir sepse."
    },
    {
      theme: "Hemofilia",
      stem: "Menino de 3 anos com hematoma muscular após trauma mínimo e história familiar materna de sangradores. TTPA alongado, TP normal, plaquetas normais. Próximo passo?",
      correct: "Dosar fatores VIII/IX e manejar com reposição do fator deficiente",
      wrongs: [
        "Transfundir plaquetas empiricamente",
        "Indicar AAS para 'afinar e prevenir trombose'",
        "Apenas vitamina K intramuscular sem investigação de fator"
      ],
      explain: "Padrão de coagulopatia intrínseca em menino sugere hemofilia: dosar FVIII/FIX e repor. AAS é contraindicado. Plaquetas e vitamina K não corrigem deficiência de fator.",
      trap: "Dar AAS ou plaquetas em suspeita de hemofilia."
    }
  ];
  hemato.forEach((q, i) => {
    raw.push({ idPrefix: "ped-hemato", n: i + 1, group: "Hematologia", ...q });
  });

  // ── Reumatologia / ortopedia (4) ───────────────────────────────
  /** @type {RawQ[]} */
  const reuma = [
    {
      theme: "AIJ",
      stem: "Menina de 4 anos com artrite de joelho e tornozelo há 10 semanas, afebril, FAN positivo, sem rash quotidianos. Forma mais compatível?",
      correct: "AIJ oligoarticular",
      wrongs: [
        "AIJ sistêmica com febre e rash típicos",
        "Artrite séptica poliarticular de horas de evolução",
        "Dor de crescimento sem artrite objetiva"
      ],
      explain: "≤4 articulações por ≥6 semanas em pré-escolar com FAN+ sugere oligo AIJ; rastrear uveíte. Sistêmica exige febre/rash característicos. Séptica é hiperaguda e tóxica.",
      trap: "Chamar de dor de crescimento uma artrite objetiva persistente."
    },
    {
      theme: "Artrite séptica",
      stem: "Lactente recusa apoiar o membro, febre, PCR muito elevada e mobilização do quadril extremamente dolorosa. Ultrassom com derrame. Prioridade?",
      correct: "Artrite séptica até prova em contrário; punção/drenagem e antibiótico urgentes",
      wrongs: [
        "Sinovite transitória; alta com AINE sem investigação",
        "Apenas fisioterapia ambulatorial por 2 semanas",
        "Observação exclusiva por 7 dias sem exames"
      ],
      explain: "Febre + impotência + inflamação alta + derrame no lactente é séptica até excluir. Atraso em drenagem/antibiótico ameaça a articulação.",
      trap: "Tratar como sinovite transitória um lactente tóxico com PCR alta."
    },
    {
      theme: "Sinovite transitória",
      stem: "Pré-escolar após IVAS, claudicação leve, afebril, bom estado, PCR normal, ultrassom com pequeno derrame. Hipótese mais provável?",
      correct: "Sinovite transitória do quadril",
      wrongs: [
        "Artrite séptica com toxemia",
        "Fratura exposta",
        "Osteomielite crônica de longa data sem história"
      ],
      explain: "Pós-viral, criança bem, inflamação baixa e derrame discreto apontam sinovite transitória. Séptica cursa com toxemia e marcadores altos.",
      trap: "Operar/agredir terapeutamente todo derrame de quadril sem estratificar toxicidade."
    },
    {
      theme: "Perthes",
      stem: "Menino de 6 anos com claudicação progressiva, dor referida no joelho e limitação de rotação interna do quadril. Radiografia sugere necrose da cabeça femoral. Diagnóstico?",
      correct: "Doença de Legg-Calvé-Perthes",
      wrongs: [
        "Pé torto congênito não tratado como causa aguda aos 6 anos",
        "Displasia do desenvolvimento do quadril exclusiva do RN",
        "Escoliose idiopática sem acometimento de quadril"
      ],
      explain: "Perthes é necrose avascular da cabeça femoral em escolares, muitas vezes com dor referida no joelho e limitação de RI. Exige descarga/seguimento ortopédico.",
      trap: "Investigar só o joelho e perder a patologia do quadril."
    }
  ];
  reuma.forEach((q, i) => {
    raw.push({ idPrefix: "ped-reuma", n: i + 1, group: "Reumatologia / ortopedia", ...q });
  });

  // ── Maus-tratos / proteção (4) ──────────────────────────────────
  /** @type {RawQ[]} */
  const maus = [
    {
      theme: "Suspeita",
      stem: "Lactente de 3 meses com hematomas em diferentes estágios em dorso e orelhas; cuidadores relatam 'queda do sofá' com narrativa inconsistente. Conduta médica prioritária?",
      correct: "Garantir segurança, investigar lesões ocultas e notificar Conselho Tutelar/autoridades competentes",
      wrongs: [
        "Alta sem comunicação por ser acidente doméstico comum",
        "Confrontar agressivamente os responsáveis na sala de espera",
        "Apenas analgésico e retorno em 6 meses"
      ],
      explain: "Hematomas em locais atípicos e história incompatível são red flags. O médico deve proteger, avaliar (incluindo lesões ocultas) e notificar — obrigação legal/ética.",
      trap: "Aceitar história improvável e liberar sem notificação."
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
      explain: "A legislação e os códigos de ética impõem notificação de suspeita de violência contra criança/adolescente. Não se exige prova judicial prévia nem anuência do agressor.",
      trap: "Usar o sigilo médico como justificativa para não notificar."
    },
    {
      theme: "Fratura metafisária",
      stem: "Lactente de 4 meses com fratura metafisária em 'canto' (corner fracture) do úmero distal, sem mecanismo plausível. Qual o significado clínico mais importante?",
      correct: "Lesão altamente sugestiva de maus-tratos; investigar outras lesões e notificar",
      wrongs: [
        "Fratura típica isolada de osteopenia do prematuro sem outros cuidados",
        "Achado normal da marcha",
        "Sempre decorrente de raquitismo sem avaliação social"
      ],
      explain: "Fraturas metafisárias clássicas em lactentes não deambuladores são altamente específicas de abuso físico e exigem investigação completa (incluindo fundo de olho/imagem óssea) e notificação.",
      trap: "Atribuir fratura metafisária clássica só a raquitismo/osteopenia sem protocolo de proteção."
    },
    {
      theme: "Violência sexual",
      stem: "Adolescente relata abuso sexual recente e apresenta-se ansioso. Além do acolhimento clínico, qual ação é necessária no fluxo de proteção?",
      correct: "Notificar órgãos de proteção e acionar fluxo de atendimento a violência sexual conforme protocolo",
      wrongs: [
        "Pedir que resolva 'em família' sem notificar",
        "Adiar atendimento para depois das provas escolares",
        "Divulgar o caso em redes sociais da unidade"
      ],
      explain: "Violência sexual exige acolhimento, cuidados, preservação de evidências quando indicado e acionamento do fluxo de proteção/notificação. Sigilo não impede a comunicação compulsória.",
      trap: "Devolver o caso à família sem acionar a rede de proteção."
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
    /** @type {Record<string, unknown>} */
    const out = {
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
    if (q.trap && String(q.trap).trim()) out.trap = q.trap;
    return out;
  });

  if (questions.length < 105) {
    throw new Error(`Esperado >= 105 questões, obtido ${questions.length}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(questions, null, 2) + "\n", "utf8");

  const byGroup = {};
  const letters = { A: 0, B: 0, C: 0, D: 0 };
  let withTrap = 0;
  let shortExplain = 0;
  for (const q of questions) {
    byGroup[q.group] = (byGroup[q.group] || 0) + 1;
    letters["ABCD"[q.answer]]++;
    if (q.trap && String(q.trap).trim()) withTrap++;
    if (!q.explain || q.explain.length <= 80) shortExplain++;
  }

  console.log("Wrote:", OUT);
  console.log("Total:", questions.length);
  console.log("Por grupo:");
  Object.keys(byGroup)
    .sort((a, b) => byGroup[b] - byGroup[a] || a.localeCompare(b))
    .forEach((g) => console.log(`  ${g}: ${byGroup[g]}`));
  console.log("Distribuição gabarito (A/B/C/D):", letters);
  console.log("Com trap:", withTrap);
  console.log("Explain <= 80 chars:", shortExplain);
}

main();
