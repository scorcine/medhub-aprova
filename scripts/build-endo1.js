const fs = require("fs");
const path = require("path");

const deck = (id, name, cards) => ({
  id,
  name,
  specialty: "clinica",
  cards: cards.map(([front, back]) => ({ front, back }))
});

// Conteúdo restrito à Apostila End1, capítulos 1–5.
const decks = [
  deck("endo-tireoide-basico", "Tireoide · anatomia, fisiologia e exames", [
    ["Qual é a origem e o trajeto embrionário da tireoide?", "Assoalho da faringe primitiva · Forame cego na base da língua · Ducto tireoglosso · Região cervical"],
    ["Qual é a estrutura anatômica habitual da tireoide?", "Dois lobos piriformes unidos por istmo · Pode haver lobo piramidal · Peso habitual de 10–20 g"],
    ["O que produzem as células C parafoliculares?", "Calcitonina · Participa do metabolismo do cálcio e do fósforo"],
    ["Como o iodeto entra na célula folicular?", "Carreador Na/I da membrana basal · Transporte ativo · Concentra iodeto 30–40 vezes acima do plasma"],
    ["Qual é a função da pendrina na síntese tireoidiana?", "Forma um poro de iodeto na membrana apical · Permite sua passagem para o coloide"],
    ["Quais reações são catalisadas pela TPO?", "Oxidação do iodeto · Iodação das tirosinas da tireoglobulina · Acoplamento das iodotirosinas"],
    ["Como se formam T3 e T4?", "T3 = MIT + DIT · T4 = DIT + DIT"],
    ["Como ocorre a liberação de T3 e T4 do coloide?", "Pinocitose do coloide · Fusão com lisossomos · Hidrólise da tireoglobulina · Liberação para a circulação"],
    ["Qual é a relação entre a produção de T4 e T3 pela tireoide?", "Produz e libera mais T4 que T3 · Proporção aproximada de 20:1 · T3 é o principal hormônio ativo nos tecidos"],
    ["Como funciona o feedback do eixo hipotálamo-hipófise-tireoide?", "TRH estimula TSH · T4 é convertido em T3 no hipotálamo e hipófise · T3 inibe TRH e TSH por feedback negativo"],
    ["Quais são os efeitos do TSH na célula folicular?", "Hipertrofia e vascularização · Aumenta TPO, tireoglobulina e carreador Na/I · Aumenta reabsorção do coloide e liberação hormonal"],
    ["O que é o efeito Wolff-Chaikoff?", "Excesso de iodo inibe sua organificação · Pode reduzir a produção hormonal · Há escape fisiológico em indivíduos normais"],
    ["O que é o fenômeno de Jod-Basedow?", "Em áreas com baixa ingestão de iodo, excesso de iodo (dieta, amiodarona, contraste) precipita hipertireoidismo em Graves, bócio multinodular ou nódulo autônomo"],
    ["Como alterações da TBG afetam os hormônios tireoidianos em eutireoidismo?", "TBG alta: T4 e T3 totais altos · TBG baixa: T4 e T3 totais baixos · Frações livres permanecem normais"],
    ["Qual padrão laboratorial define hipertireoidismo primário subclínico?", "TSH baixo ou suprimido · T4 livre ainda normal"],
    ["Qual padrão laboratorial define hipotireoidismo primário subclínico?", "TSH elevado · T4 livre normal"]
  ]),
  deck("endo-hipertireoidismo", "Hipertireoidismo · causas e urgência", [
    ["Qual é a diferença entre hipertireoidismo e tireotoxicose?", "Hipertireoidismo = hiperfunção da glândula · Tireotoxicose = estado clínico por excesso hormonal nos tecidos"],
    ["Quais causas de tireotoxicose não são hipertireoidismo?", "Tireoidites com liberação de hormônio estocado · Uso exógeno de hormônio · Produção ectópica"],
    ["Quais achados gerais sugerem tireotoxicose?", "Insônia e agitação · Sudorese e intolerância ao calor · Hiperdefecação · Perda ponderal · Tremor fino"],
    ["Quais achados cardiovasculares são típicos da tireotoxicose?", "Hipertensão sistólica · Pressão de pulso alargada · Taquicardia sinusal · Fibrilação atrial possível"],
    ["Como se apresenta o hipertireoidismo apático no idoso?", "Poucos sintomas adrenérgicos · FA ou insuficiência cardíaca · Astenia, fraqueza intensa e depressão"],
    ["Como se apresenta a T3-toxicose?", "TSH suprimido · T4 livre normal · T3 elevado · Pode ser manifestação inicial de Graves ou recidiva"],
    ["Como se define hipertireoidismo subclínico e quais riscos traz?", "TSH suprimido com T3 e T4 livres normais · Pode progredir · Risco cardíaco e esquelético"],
    ["Qual é o perfil do bócio multinodular tóxico?", "Segunda causa mais frequente de hipertireoidismo · Predomina em idosos · Evolução do bócio multinodular atóxico"],
    ["Como é a cintilografia no bócio multinodular tóxico?", "Múltiplos nódulos com captação variável · Alguns nódulos hipercaptantes ou quentes"],
    ["Que exposição pode precipitar bócio multinodular tóxico?", "Iodo ou amiodarona · Fenômeno de Jod-Basedow"],
    ["O que é a doença de Plummer?", "Adenoma tóxico · Nódulo autônomo hiperfuncionante · Produz hormônios em quantidade suprafisiológica"],
    ["Qual é o padrão cintilográfico do adenoma tóxico?", "Nódulo quente hipercaptante · Restante da glândula com captação reduzida pela supressão do TSH"],
    ["Qual é a clínica típica do adenoma tóxico?", "Nódulo solitário · Hipertireoidismo leve a moderado ou subclínico · Ausência habitual de oftalmopatia e miopatia"],
    ["Quais são os principais precipitantes da crise tireotóxica?", "Infecção é o principal · Cirurgia · Suspensão de antitireoidianos · Amiodarona · Parto · IAM · CAD"],
    ["Quais achados caracterizam a crise tireotóxica?", "Disfunção neurológica · Febre elevada · Taquicardia ou FA · Insuficiência cardíaca de alto débito · Sintomas gastrointestinais"],
    ["Qual é a sequência farmacológica essencial na crise tireotóxica?", "PTU em altas doses · Iodo após uma hora · Propranolol · Dexametasona · Tratar o fator precipitante em UTI"]
  ]),
  deck("endo-graves", "Doença de Graves · diagnóstico e tratamento", [
    ["Qual é o mecanismo da doença de Graves?", "TRAb estimulador liga-se ao receptor de TSH · Provoca hipertrofia, hiperfunção e hipervascularização tireoidiana"],
    ["Qual é o anticorpo característico de Graves?", "TRAb · Anticorpo antirreceptor de TSH estimulante · Positivo em 90–100% dos casos não tratados"],
    ["Como é o bócio na doença de Graves?", "Difuso e simétrico · Pode haver sopro e frêmito pela hipervascularização"],
    ["Qual é o padrão cintilográfico de Graves?", "Hipercaptação difusa do radiotraçador · Captação elevada e difusa praticamente sela o diagnóstico em casos duvidosos"],
    ["Quais achados compõem a oftalmopatia de Graves?", "Proptose bilateral · Retração palpebral · Edema periorbitário · Hiperemia conjuntival · Oftalmoplegia possível"],
    ["Qual fator piora classicamente a oftalmopatia de Graves?", "Tabagismo · Associado a doença mais grave e pior resposta ao tratamento"],
    ["O que é a dermopatia de Graves?", "Mixedema pré-tibial · Espessamento cutâneo por acúmulo de glicosaminoglicanos · Aspecto de casca de laranja violácea"],
    ["Quando a pesquisa de TRAb é especialmente útil?", "Graves eutireoidiano ou hipertireoidismo apático · Estimar recidiva · Gestação atual ou prévia · Diferenciar tireotoxicose gestacional"],
    ["Qual é a função dos betabloqueadores na tireotoxicose?", "Controle rápido das manifestações adrenérgicas · Propranolol também inibe conversão periférica de T4 em T3"],
    ["Qual é a droga antitireoidiana de escolha?", "Metimazol · PTU é reservado para situações específicas"],
    ["Quando PTU é primeira escolha?", "Primeiro trimestre da gestação · Crise tireotóxica · Efeito adverso ao metimazol que não seja agranulocitose com contraindicação a outras opções"],
    ["Como monitorar inicialmente a resposta às tionamidas?", "Pelo T4 livre · TSH pode permanecer suprimido por meses"],
    ["Qual orientação deve ser dada sobre agranulocitose por tionamidas?", "Suspender PTU ou metimazol se febre ou dor de garganta · Não reintroduzir tionamidas após agranulocitose confirmada"],
    ["Quais são as estratégias terapêuticas para Graves?", "Drogas antitireoidianas até remissão · Radioablação com 131I · Cirurgia"],
    ["Como conduzir Graves durante a gestação?", "Usar antitireoidiano na menor dose possível · PTU no primeiro trimestre · Após o primeiro trimestre pode-se usar metimazol"],
    ["Que fatores se associam a recidiva após antitireoidianos?", "T3 alto · Bócio grande · Jovens · Sexo masculino · Tabagismo · Oftalmopatia · TRAb detectável ao final"]
  ]),
  deck("endo-hipotireoidismo", "Hipotireoidismo · bócio atóxico e coma", [
    ["Qual é a causa mais comum de hipotireoidismo em áreas suficientes de iodo?", "Tireoidite de Hashimoto"],
    ["Como se classificam as formas de hipotireoidismo?", "Primário: falência tireoidiana · Central: falência hipofisária ou hipotalâmica"],
    ["Qual é o padrão laboratorial do hipotireoidismo primário?", "TSH elevado · T4 livre baixo"],
    ["Qual é o padrão laboratorial do hipotireoidismo central?", "T4 livre baixo · TSH baixo ou inapropriadamente normal"],
    ["Quais são as duas bases das manifestações do hipotireoidismo?", "Lentificação generalizada do metabolismo · Acúmulo intersticial de glicosaminoglicanos"],
    ["Quais achados cardiovasculares são típicos do hipotireoidismo?", "Bradicardia e baixo débito · Hipocontratilidade · Derrame pericárdico · Hipertensão diastólica · Hipercolesterolemia"],
    ["Quais achados neurológicos são típicos do hipotireoidismo?", "Lentificação cognitiva e dos reflexos · Túnel do carpo · Polineuropatia · Coma mixedematoso nos casos graves"],
    ["Qual é a reposição preferida no hipotireoidismo?", "Levotiroxina em dose única diária · Preferencialmente pela manhã, em jejum, uma hora antes do café"],
    ["Qual dose inicial de levotiroxina usar no adulto jovem saudável?", "1,6–1,8 μg/kg/dia"],
    ["Como iniciar levotiroxina em idoso ou cardiopata grave?", "Idoso: 50 μg/dia · Coronariopatia grave: 12,5–25 μg/dia, com incrementos de 12,5–25 μg a cada 2–3 semanas"],
    ["Como monitorar levotiroxina no hipotireoidismo primário e central?", "Primário: TSH após 4–6 semanas · Central: T4 livre"],
    ["Como a gestação altera a necessidade de levotiroxina?", "Aumenta a necessidade de levotiroxina · Aumentam volume de distribuição, TBG e degradação placentária de T4"],
    ["Quais achados sugerem coma mixedematoso?", "Rebaixamento da consciência · Hipoventilação · Hipotermia · Bradicardia · Hiponatremia · Hipoglicemia"],
    ["Qual é o principal precipitante do coma mixedematoso?", "Pneumonia bacteriana · Infecções respiratórias são os precipitantes mais comuns"],
    ["Quais são pilares do tratamento do coma mixedematoso?", "Levotiroxina venosa · Hidrocortisona venosa · Suporte ventilatório · Tratar infecção · Aquecimento passivo"],
    ["O que sugere bócio mergulhante e sinal de Pemberton?", "Tosse, dispneia, disfagia ou rouquidão por compressão · Elevar os braços causa fraqueza, tontura e congestão facial"],
    ["O que é a síndrome do eutireóideo doente?", "Alteração de TSH/hormônios tireoidianos em doença sistêmica grave, sem tireoidopatia · Evitar dosar função tireoidiana no agudo, salvo forte suspeita"],
    ["Padrão laboratorial mais frequente na SED?", "Síndrome do T3 baixo · T3 total/livre ↓ com T4 e TSH normais · ↑ rT3 por prejuízo da desiodase tipo 1 · Queda do T3 correlaciona com gravidade"]
  ]),
  deck("endo-tireoidites", "Tireoidites · Hashimoto e subagudas", [
    ["Qual evolução funcional é típica das tireoidites?", "Tireotoxicose inicial por liberação de hormônio estocado · Hipotireoidismo posterior · Recuperação nas subagudas"],
    ["Como ficam tireoglobulina e captação de iodo nas tireoidites?", "Tireoglobulina elevada · Captação de 131I reduzida ou nula"],
    ["O que caracteriza a tireoidite de Hashimoto?", "Tireoidite crônica autoimune · Principal causa de hipotireoidismo permanente em regiões sem deficiência de iodo"],
    ["Qual anticorpo é mais sensível para Hashimoto?", "Anti-TPO · Positivo em 95–100% dos casos"],
    ["O que é hashitoxicose?", "Tireotoxicose transitória por destruição folicular e liberação de hormônio pré-formado · Não é hipertireoidismo"],
    ["Qual é a evolução habitual da tireoidite de Hashimoto?", "Hashitoxicose possível · Hipotireoidismo subclínico · Hipotireoidismo manifesto progressivo"],
    ["Quando indicar PAAF na tireoidite de Hashimoto?", "Dor local · Crescimento rápido · Presença de nódulos"],
    ["Quando suspeitar de linfoma de tireoide em paciente com Hashimoto?", "Aumento súbito ou localizado do bócio · Sintomas compressivos"],
    ["Como se apresenta a tireoidite subaguda linfocítica?", "Indolor · Tireotoxicose transitória · Hipotireoidismo autolimitado · Pode evoluir depois para Hashimoto"],
    ["Por que tionamidas não tratam tireoidites subagudas?", "O problema é liberação de hormônio estocado · Não aumento de síntese hormonal"],
    ["Como se apresenta a tireoidite de Quervain?", "1–3 semanas após quadro gripal · Dor cervical que pode irradiar para ouvidos · VHS geralmente acima de 50 mm/h"],
    ["Como tratar a tireoidite de Quervain?", "AINE ou aspirina · Sem melhora em 24–48 h: prednisona 40 mg/dia · Retirada gradual em seis semanas"],
    ["Quando ocorre e qual é o curso da tireoidite pós-parto?", "Dentro do primeiro ano, mais comum do 2º ao 4º mês · Tireotoxicose, hipotireoidismo e eutireoidismo em 1–4 meses"],
    ["Como diagnosticar e tratar tireoidite aguda piogênica?", "Dor unilateral, febre alta, flogose e supuração · PAAF guiada por USG para Gram e cultura · Drenagem e antibiótico"],
    ["Quais tireoidites podem ser causadas por fármacos ou radioiodo?", "Alfainterferona, interleucina-2 e amiodarona · Radioiodo pode causar tireoidite actínica dolorosa"],
    ["Como se apresenta e confirma a tireoidite de Riedel?", "Glândula lenhosa infiltrativa · Disfagia e dispneia por compressão · Biópsia, geralmente a céu aberto"]
  ]),
  deck("endo-nodulos-cancer-tireoide", "Nódulos e câncer de tireoide", [
    ["Quais são os exames iniciais na avaliação de um nódulo tireoidiano?", "TSH sérico · Ultrassonografia de tireoide com Doppler"],
    ["Qual conduta diante de nódulo com TSH baixo?", "Dosar T4 livre e T3 · Fazer cintilografia para definir se o nódulo é funcionante"],
    ["Como diferenciar nódulo quente de frio?", "Quente: hipercaptante e funcionante · Frio: sem captação de radionuclídeo"],
    ["Como manejar nódulo quente e nódulo frio em Graves?", "Quente: não requer punção · Frio: indicar PAAF"],
    ["Quais achados ultrassonográficos sugerem malignidade?", "Nódulo sólido hipoecogênico · Margens irregulares ou extensão extratireoidiana · Mais alto que largo · Microcalcificações · Vascularização central"],
    ["Quais sinais clínicos de alerta sugerem malignidade em nódulo?", "Crescimento rápido · Fixação a tecidos adjacentes · Rouquidão · Adenomegalia cervical ipsilateral"],
    ["Qual exame esclarece a natureza do nódulo?", "PAAF, preferencialmente guiada por USG"],
    ["Para que servem TIRADS e a diretriz ATA no nódulo?", "TIRADS: sistema US mais usado na prática para indicar PAAF pelo risco e tamanho · ATA: cortes práticos (ex.: cisto simples sem PAAF; hipoecogênico ≥1 cm; hiper/isoecogênico ≥1,5 cm; espongiforme ≥2 cm)"],
    ["Conduta segundo Bethesda I, II, V e VI?", "I: repetir PAAF · II: acompanhar (USG em 6 meses; depois 6–18 meses se estável) · V ou VI: cirurgia"],
    ["Conduta em Bethesda III ou IV?", "Citologia indeterminada · Teste genético negativo: conduta conservadora · Positivo: cirurgia · Sem teste: operar (no III, aceitável repetir PAAF antes)"],
    ["Quais são os tumores bem diferenciados da tireoide?", "Papilífero · Folicular · Células de Hürthle, variante do folicular · Todos se originam da célula folicular"],
    ["Qual é o tumor maligno tireoidiano mais comum e sua via de disseminação?", "Carcinoma papilífero · Disseminação linfática inicial para linfonodos regionais"],
    ["Quais achados citológicos são típicos do carcinoma papilífero?", "Núcleos em vidro fosco · Fissuras e inclusões intranucleares · Corpos de psamoma"],
    ["A PAAF confirma carcinoma papilífero?", "Sim · As alterações citológicas características permitem o diagnóstico pela PAAF"],
    ["Qual principal fator de risco para carcinoma papilífero?", "Exposição à radiação ionizante · É o câncer com maior associação a esse fator"],
    ["Como diferem os carcinomas papilífero e folicular quanto à disseminação?", "Papilífero: linfática · Folicular: angioinvasivo, com metástases precoces"],
    ["Por que a PAAF não confirma carcinoma folicular?", "Citologia do carcinoma folicular é virtualmente idêntica à do adenoma folicular · Precisa avaliar invasão"],
    ["O que caracteriza o carcinoma medular?", "Origem em células C parafoliculares · Calcitonina · Associação com NEM 2 e mutações no proto-oncogene RET"],
    ["Como é o carcinoma anaplásico?", "Geralmente em idosos · Muito invasivo e de crescimento rápido · Pode originar-se de tumor bem diferenciado preexistente · Prognóstico péssimo"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-endo.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];

if (!Array.isArray(existing)) {
  throw new Error("flashcards-endo.json deve conter um array");
}

// UPSERT de End1: preserva integralmente os decks End2 e End3.
const end1Ids = new Set(decks.map((item) => item.id));
const merged = existing.filter((item) => !end1Ids.has(item.id)).concat(decks);

fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");

console.log(`End1: ${decks.length} decks · ${decks.reduce((total, item) => total + item.cards.length, 0)} cards`);
for (const item of decks) console.log(`${item.id}: ${item.cards.length}`);
