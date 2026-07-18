/**
 * Flashcards Hepatologia · Hep3
 * Fonte: apostila Hep3 extraída em data/_extract_hepato/
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "hep-ihc-child",
    name: "Insuficiência hepática crônica · Child-Pugh",
    specialty: "clinica",
    cards: [
      { front: "Insuficiência hepática crônica — o que descreve?", back: "Complicações sistêmicas da queda lenta e gradual da função hepatocitária · como na cirrose" },
      { front: "Cirrose compensada × descompensada — diferença?", back: "Compensada · predominam distúrbios endócrinos e hemodinâmicos · descompensada · complicações da hipertensão porta ou disfunção hepática" },
      { front: "Cirrose — achado hormonal característico?", back: "Hiperestrogenismo + hipoandrogenismo" },
      { front: "Hiperestrogenismo da cirrose — sinais?", back: "Eritema palmar · telangiectasias em aranha vascular · ginecomastia" },
      { front: "Hipoandrogenismo da cirrose — manifestações?", back: "Redução da massa muscular · atrofia interóssea · rarefação de pelos · atrofia testicular · perda de libido e disfunção erétil" },
      { front: "Cirrose — perfil hemodinâmico?", back: "↓ resistência vascular periférica · ↑ débito cardíaco · retenção hidrossalina · hipovolemia relativa por redução do volume circulante efetivo" },
      { front: "Cirrose descompensada — complicações por hipertensão porta?", back: "Ascite · varizes esofagogástricas · esplenomegalia congestiva/hiperesplenismo · circulação colateral abdominal" },
      { front: "Cirrose descompensada — complicações por insuficiência hepatocelular?", back: "Icterícia · encefalopatia hepática · coagulopatia · hipoalbuminemia/anasarca · desnutrição · imunodepressão · síndromes hepatorrenal e hepatopulmonar" },
      { front: "Child-Pugh — quais cinco parâmetros?", back: "Bilirrubina · albumina · INR · ascite · encefalopatia hepática" },
      { front: "Doença hepática crônica avançada descompensada — critérios citados?", back: "Ascite evidente ou derrame pleural com GASA ≥ 1,1 · encefalopatia evidente > grau II de West Haven · sangramento varicoso" }
    ]
  },
  {
    id: "hep-encefalopatia",
    name: "Encefalopatia hepática · diagnóstico e tratamento",
    specialty: "clinica",
    cards: [
      { front: "Encefalopatia hepática (EH) — definição?", back: "Síndrome neuropsiquiátrica potencialmente reversível · por toxinas intestinais que não são depuradas pelo fígado" },
      { front: "EH na cirrose — dois mecanismos centrais?", back: "Disfunção hepatocelular grave · hipertensão porta com desvio mesentérico para a circulação sistêmica" },
      { front: "EH — principal neurotoxina implicada?", back: "Amônia · produzida por enterócitos a partir da glutamina e por bactérias colônicas a partir de proteínas e ureia" },
      { front: "EH — classificação por mecanismo?", back: "Tipo A · falência hepática aguda · tipo B · bypass portossistêmico sem lesão hepatocelular intrínseca · tipo C · cirrose e hipertensão porta" },
      { front: "West Haven — EH mínima × manifesta?", back: "Mínima/subclínica · alterações detectadas por testes neuropsicométricos · manifesta · graus I a IV · graus II, III e IV são EH franca ou aberta" },
      { front: "EH manifesta — achados clínicos comuns?", back: "Desorientação · agitação ou torpor · inversão sono-vigília · fala arrastada/bradipsiquismo · fetor hepaticus · asterixis" },
      { front: "Asterixis é patognomônico de EH?", back: "Não · também ocorre em encefalopatia urêmica · carbonarcose da DPOC · pré-eclâmpsia/eclâmpsia · intoxicação por lítio" },
      { front: "EH — precipitantes essenciais?", back: "HDA · hipocalemia/alcalose · desidratação ou diuréticos · infecção, sobretudo PBE · sedativos · constipação · hipóxia · shunts portossistêmicos" },
      { front: "EH — diagnóstico e papel da amônia sérica?", back: "Diagnóstico eminentemente clínico · amônia não é recomendada de rotina porque tem baixa especificidade e não correlaciona bem com o grau de EH" },
      { front: "EH no cirrótico com ascite — investigação obrigatória?", back: "Buscar ativamente fator precipitante · fazer paracentese diagnóstica para infecção mesmo sem sinais infecciosos" },
      { front: "Lactulose na EH — mecanismo e meta?", back: "Acidifica o cólon · converte NH3 em NH4+ não absorvível · efeito catártico · meta de 2–3 evacuações pastosas/dia" },
      { front: "Lactulose na EH — dose oral citada?", back: "20–30 g ou 30–45 mL · 2–4 vezes/dia · ajustar à meta de 2–3 evacuações pastosas/dia" },
      { front: "Rifaximina na EH — lugar terapêutico?", back: "550 mg VO 12/12 h · reduz recorrência e aumenta eficácia aguda junto à lactulose · reservada para intolerância ou refratariedade · não substitui a lactulose" }
    ]
  },
  {
    id: "hep-hipertensao-portal",
    name: "Hipertensão portal · fisiopatologia e avaliação",
    specialty: "clinica",
    cards: [
      { front: "Hipertensão porta — definição pela pressão porta e pelo HVPG?", back: "Pressão porta ≥ 10 mmHg · HVPG ≥ 5 mmHg · HVPG normal 1–5 mmHg" },
      { front: "HVPG — como é calculado?", back: "Pressão venosa hepática encunhada − pressão venosa hepática livre" },
      { front: "HVPG — marcos de risco?", back: "Varizes começam a se formar > 10 mmHg · sangramento clinicamente significativo ≥ 12 mmHg · ≥ 20 mmHg prevê hemorragia incontrolável ou ressangramento" },
      { front: "Hipertensão porta na cirrose — dois mecanismos?", back: "↑ resistência intra-hepática ao fluxo por alterações estruturais · ↑ fluxo esplâncnico pela vasodilatação" },
      { front: "Cirrose — componentes da resistência intra-hepática?", back: "Fibrose e nódulos regenerativos · contração de células estreladas, miofibroblastos e músculo liso vascular" },
      { front: "Vasodilatação esplâncnica na cirrose — mediador principal?", back: "Óxido nítrico · acumula no sistema esplâncnico e aumenta o fluxo em direção ao sistema porta" },
      { front: "Hipertensão portal — consequências clínicas principais?", back: "Ascite · varizes esofagogástricas · esplenomegalia congestiva/hiperesplenismo · circulação colateral como cabeça de medusa" },
      { front: "Hiperesplenismo da hipertensão porta — hemograma?", back: "Plaquetopenia · leucopenia/neutropenia · anemia" },
      { front: "Hipertensão porta pré-sinusoidal × intra/pós-sinusoidal — ascite?", back: "Pré-sinusoidal raramente causa ascite e, quando causa, é leve · intra e pós-sinusoidal têm grande tendência à ascite" },
      { front: "USG-Doppler na hipertensão porta — fluxo hepatopetal × hepatofugal?", back: "Hepatopetal · normal e HP menos grave · hepatofugal · indica hipertensão porta grave" },
      { front: "EDA na hipertensão porta — papel?", back: "Indicada na suspeita ou após o diagnóstico · varizes esofagogástricas selam o diagnóstico de hipertensão porta" }
    ]
  },
  {
    id: "hep-varizes",
    name: "Varizes esofagogástricas · sangramento e profilaxia",
    specialty: "clinica",
    cards: [
      { front: "Varizes esofágicas — classificação F1/F2/F3?", back: "F1 < 5 mm · F2 5–20 mm e < 1/3 do lúmen · F3 > 20 mm e > 1/3 do lúmen" },
      { front: "HDA por varizes — prioridade inicial?", back: "Estabilização respiratória e hemodinâmica · evitar excesso de fluidos porque aumenta a pressão portal · EDA precoce, preferencialmente em até 12 h" },
      { front: "Sangramento agudo por varizes esofágicas — hemostasia endoscópica de escolha?", back: "Ligadura elástica · preferida à escleroterapia · oblitera mais rápido e tem menos complicações" },
      { front: "Varizes esofágicas × gástricas sangrantes — terapia de escolha?", back: "Esofágicas · terapia endoscópica, com ligadura elástica · gástricas · vasoconstritor esplâncnico é a primeira linha" },
      { front: "Sangramento varicoso — drogas vasoativas?", back: "Terlipressina · somatostatina · octreotida · iniciar imediatamente como adjuvante da endoscopia ou isoladamente em varizes gástricas/GHP" },
      { front: "Terlipressina no sangramento varicoso — diferencial?", back: "É a única citada que, além de melhorar o sangramento, reduz mortalidade · manter vasoativo por 2–5 dias" },
      { front: "Sengstaken-Blakemore — papel?", back: "Ponte temporária, idealmente < 24 h, até terapia definitiva · alto ressangramento sem tratamento definitivo e risco de complicações" },
      { front: "HPCS — definição e profilaxia primária medicamentosa?", back: "HVPG ≥ 10 mmHg ou manifestações clínicas de HP · todo cirrótico com HPCS deve receber betabloqueador para profilaxia primária" },
      { front: "Betabloqueadores na profilaxia primária — quais e mecanismo?", back: "Propranolol ou nadolol · reduzem fluxo venoso mesentérico para a porta · carvedilol também reduz tônus e resistência hepática" },
      { front: "Profilaxia primária de varizes — escolha?", back: "Betabloqueio, de preferência, ou ligadura elástica se não puder usar betabloqueador · escleroterapia não é indicada" },
      { front: "Profilaxia secundária de sangramento varicoso — esquema de escolha?", back: "Ligadura elástica + betabloqueador não seletivo · superior a cada estratégia isolada" },
      { front: "HDA varicosa — profilaxia infecciosa?", back: "Norfloxacino 400 mg 12/12 h por 7 dias · se grave ou sem VO, ceftriaxona 1 g/dia · ceftriaxona é preferível onde há resistência a quinolonas" }
    ]
  },
  {
    id: "hep-ascite",
    name: "Ascite · GASA · paracentese e diuréticos",
    specialty: "clinica",
    cards: [
      { front: "Ascite — definição e principal causa no Brasil?", back: "Derrame líquido na cavidade peritoneal · hipertensão portal da cirrose é a principal causa" },
      { front: "Ascite — melhor método semiológico para detectar?", back: "Macicez móvel de decúbito · geralmente detecta a partir de 1,5 L" },
      { front: "Ascite — exame de imagem de escolha para pequenas coleções?", back: "Ultrassonografia · também orienta punções diagnósticas ou terapêuticas" },
      { front: "Paracentese diagnóstica — quando indicar no cirrótico com ascite?", back: "É obrigatória · fazer em toda internação, independentemente do motivo, para investigar PBE inclusive em assintomáticos" },
      { front: "Paracentese no hepatopata — coagulopatia contraindica?", back: "Não · embora aumente o risco de hemorragia, o risco permanece pequeno com técnica correta" },
      { front: "GASA — como calcular?", back: "Albumina sérica − albumina do líquido ascítico · colher o soro logo antes ou logo após a paracentese" },
      { front: "GASA < 1,1 × ≥ 1,1 g/dL — interpretação?", back: "< 1,1 · exsudato, pensar doença peritoneal como câncer ou tuberculose · ≥ 1,1 · transudato, hipertensão portal" },
      { front: "Ascite da cirrose × cardiogênica — proteína total no líquido?", back: "Cirrose · geralmente baixa por sinusoides capilarizados · cardiogênica · GASA alto, mas proteína total elevada por sinusoides íntegros" },
      { front: "Ascite por hipertensão porta — por que se forma?", back: "Aumento da pressão nos sinusoides fenestrados causa extravasamento de linfa hepática para o peritônio" },
      { front: "Ascite por hipertensão portal — restrição de sódio e água?", back: "Sódio 2 g/dia · restrição hídrica só se hiponatremia importante, Na < 120–125 mEq/L" },
      { front: "Ascite cirrótica — diurético inicial de escolha?", back: "Espironolactona · antagonista da aldosterona · 100 mg/dia inicialmente, faixa de 100–400 mg/dia" },
      { front: "Ascite cirrótica — combinação espironolactona/furosemida?", back: "Acrescentar furosemida se não responde · manter proporção 100 mg de espironolactona : 40 mg de furosemida" },
      { front: "Paracentese de grande volume — quando albumina e qual dose?", back: "Se retirar > 5 L · infundir 6–8 g de albumina por litro retirado para evitar instabilidade hemodinâmica e renal" }
    ]
  },
  {
    id: "hep-pbe-shr",
    name: "PBE · síndrome hepatorrenal",
    specialty: "clinica",
    cards: [
      { front: "PBE — definição?", back: "Infecção da ascite sem fonte contígua de contaminação · associada a translocação bacteriana intestinal e baixa defesa do líquido ascítico" },
      { front: "PBE na cirrose — agente mais comum?", back: "Escherichia coli · PBE costuma ser monobacteriana · pneumococo é o agente mais comum na ascite nefrótica" },
      { front: "PBE — critério diagnóstico e ascite neutrofílica?", back: "PMN ≥ 250/mm³, não leucócitos totais · se a cultura for negativa, é ascite neutrofílica e geralmente se trata como PBE" },
      { front: "PBE × peritonite bacteriana secundária — pista microbiológica?", back: "PBE · monobacteriana · secundária · polimicrobiana e sem resposta à antibioticoterapia padrão" },
      { front: "Peritonite secundária — critérios no líquido ascítico?", back: "Dois ou mais · proteína > 1 g/dL · glicose < 50 mg/dL · LDH acima do limite sérico normal" },
      { front: "PBE — tratamento empírico de escolha?", back: "Cefotaxima 2 g IV 12/12 h · ceftriaxona é alternativa · iniciar antes da cultura · duração de 5 dias e reavaliar" },
      { front: "PBE — albumina para prevenir SHR?", back: "Associar à antibioticoterapia · 1,5 g/kg no dia 1 e 1 g/kg no dia 3" },
      { front: "Após PBE — profilaxia secundária?", back: "Norfloxacino 400 mg/dia ou sulfametoxazol-trimetoprima 800/160 mg/dia por tempo indeterminado" },
      { front: "SHR — definição e mecanismo hemodinâmico?", back: "Insuficiência renal funcional em cirrose avançada com ascite · vasodilatação esplâncnica reduz volume efetivo e provoca vasoconstrição renal/queda da TFG" },
      { front: "SHR tipo 1 × tipo 2 — padrão clínico?", back: "Tipo 1 · rápida progressão em < 2 semanas · tipo 2 · evolução insidiosa, creatinina > 1,5 mg/dL e ascite refratária típica" },
      { front: "SHR — critérios centrais de diagnóstico?", back: "Cirrose com ascite · creatinina > 1,5 ou ↑ > 0,3 em 48 h ou > 50% em 7 dias · sem melhora após 2 dias sem diurético + albumina 1 g/kg/dia" },
      { front: "SHR — exclusões diagnósticas?", back: "Choque · uso de nefrotóxicos · doença parenquimatosa renal" },
      { front: "SHR — tratamento farmacológico de escolha?", back: "Terlipressina + albumina · albumina 1 g/kg no dia 1, depois 20–40 g/dia · alternativas · noradrenalina ou midodrina + octreotida" },
      { front: "SHR — tratamento que aumenta efetivamente a sobrevida?", back: "Transplante hepático · diálise pode ser ponte · TIPS é alternativa selecionada, limitado pelo risco de EH e contraindicações" }
    ]
  },
  {
    id: "hep-transplante",
    name: "Transplante hepático · MELD e indicação",
    specialty: "clinica",
    cards: [
      { front: "Candidato ao transplante hepático?", back: "Doença hepática avançada, progressiva e irreversível · qualidade de vida muito comprometida · expectativa de vida < 1 ano" },
      { front: "Alocação para transplante — princípio?", back: "Gravidade da doença · menor expectativa de sobrevida significa alocação mais rápida" },
      { front: "MELD — variáveis?", back: "Bilirrubina · INR · creatinina" },
      { front: "Brasil — MELD mínimo para lista nacional de fígado?", back: "MELD ≥ 11 no adulto" },
      { front: "Hepatocarcinoma — critérios de Milão para transplante?", back: "Lesão única ≤ 5 cm ou até 3 lesões, todas < 3 cm · sem metástase à distância nem invasão do pedículo vascular hepático" },
      { front: "Transplante hepático — contraindicações absolutas citadas?", back: "Tumor incurável pelo transplante · não adesão à abstinência alcoólica · infecção não controlada · doença extra-hepática limitante da vida" },
      { front: "Transplante hepático ortotópico — o que é?", back: "Retira o fígado doente e implanta fígado inteiro de doador cadavérico no seu lugar" },
      { front: "Transplante inter vivos — qual princípio?", back: "Pela capacidade regenerativa hepática, pode-se transplantar um lobo de doador vivo · direito para adulto · esquerdo costuma servir para criança" },
      { front: "HBV antes do transplante — profilaxia de recidiva?", back: "HBIG é obrigatória · associar tenofovir ou entecavir se DNA viral detectável e/ou HBeAg positivo" },
      { front: "Transplante hepático — sobrevida informada?", back: "> 90% em 1 ano · 85–90% em 5 anos · 60% em 10 anos" }
    ]
  },
  {
    id: "hep-tips-cirurgia-htp",
    name: "TIPS · cirurgia da hipertensão portal",
    specialty: "clinica",
    cards: [
      { front: "TIPS — o que é?", back: "Shunt portossistêmico intra-hepático transjugular · comunica ramo da veia porta à veia hepática por stent" },
      { front: "TIPS — principais indicações?", back: "Hemorragia varicosa refratária ou recorrente apesar de tratamento clínico/endoscópico · ascite refratária" },
      { front: "TIPS — eficácia citada?", back: "Previne sangramento de varizes em 80% em um ano · no sangramento refratário ao tratamento convencional, controle supera 95%" },
      { front: "TIPS — por que causa encefalopatia?", back: "Desvia sangue gastrointestinal da detoxificação hepática · especialmente amônia · EH ocorre em cerca de 30%" },
      { front: "TIPS — outra complicação importante?", back: "Estenose do stent · reduz vazão e permite retorno das complicações da hipertensão portal" },
      { front: "TIPS — contraindicações citadas?", back: "ICC · hipertensão pulmonar moderada/grave · trombose de porta ou de todas as veias hepáticas · EH refratária · dilatação da árvore biliar" },
      { front: "TIPS — vantagem no candidato a transplante?", back: "Não altera a anatomia dos sistemas porta e cava · diferentemente da derivação cirúrgica, não dificulta o transplante" },
      { front: "Cirurgia na hipertensão portal — objetivo e indicações?", back: "Descomprimir varizes esofagogástricas · falha endoscópica/farmacológica sem TIPS · varizes gástricas/GHP sangrantes · urgência com sangramento persistente" },
      { front: "Shunts cirúrgicos — consequência do desvio portal?", back: "Reduz pressão portal, mas pode deteriorar função hepática e precipitar encefalopatia portossistêmica" },
      { front: "Derivações portossistêmicas — três grupos?", back: "Não seletivas/totais · parciais, que reduzem pressão para perto de 12 mmHg · seletivas, que descomprimem varizes e preservam HTP em outros territórios" },
      { front: "Derivação esplenorrenal distal de Warren — principal vantagem?", back: "Descomprime território esofagogástrico e esplênico, mantendo o fluxo mesentérico-porto-hepático · evita EH e piora progressiva da função hepática" },
      { front: "Cirurgia de Warren — quando é contraindicada?", back: "Ascite moderada ou grave · pode não melhorar e até piorar a ascite" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-hepato.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
const obsoleteHep3Ids = new Set(["hep-ihc-encefalopatia", "hep-ascite-shr"]);
const byId = new Map(
  existing
    .filter((deck) => !obsoleteHep3Ids.has(deck.id))
    .map((deck) => [deck.id, deck])
);
for (const deck of newDecks) byId.set(deck.id, deck);
const decks = Array.from(byId.values());
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log(`wrote ${out} · ${newDecks.length} Hep3 decks · ${newDecks.reduce((sum, deck) => sum + deck.cards.length, 0)} cards`);
