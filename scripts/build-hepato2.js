const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "hep-cirrose", name: "Cirrose · diagnóstico · função", specialty: "clinica",
    cards: [
      { front: "Definição histopatológica de cirrose?", back: "Fibrose em ponte + nódulos de regeneração · Remodelamento profundo e irreversível da arquitetura hepática" },
      { front: "Fibrose em ponte na cirrose: o que forma?", back: "Septos porta-centro e porta-porta · O sangue pode circular pelas traves fibróticas como shunt intra-hepático" },
      { front: "Nódulo regenerativo cirrótico: por que não restaura a função?", back: "É massa de hepatócitos sem comunicação com veia centrolobular · Não reconstitui a arquitetura lobular funcional" },
      { front: "Células protagonistas da fibrose hepática?", back: "Células estreladas/de Ito no espaço de Disse · Ativadas, sintetizam matriz extracelular e colágeno I e III" },
      { front: "Capilarização dos sinusoides: consequência?", back: "Deposição de colágeno no espaço de Disse · Perda de fenestras e de microvilosidades · Aumenta a resistência intra-hepática" },
      { front: "Padrão-ouro para diagnóstico de cirrose?", back: "Biópsia hepática/histopatologia · Septos fibrosos completos delimitando nódulos e desorganizando a arquitetura lobular" },
      { front: "Quando a biópsia pode não ser obrigatória na cirrose?", back: "Quando clínica, laboratório e imagem são muito sugestivos de doença avançada · A biópsia segue como padrão-ouro" },
      { front: "AST e ALT na cirrose?", back: "AST > ALT · Na hepatite crônica ativa sem cirrose, o usual é ALT > AST · Na DHA, AST > ALT desde o início" },
      { front: "Hiponatremia na cirrose com ascite: significado e mecanismo?", back: "Marcador de péssimo prognóstico · Excesso de ADH por redução do volume circulante efetivo → incapacidade de excretar água livre" },
      { front: "Plaquetopenia na cirrose avançada: mecanismo?", back: "Hipertensão porta → esplenomegalia e hiperesplenismo · É a citopenia mais precoce; anemia e leucopenia surgem mais tarde" },
      { front: "Imagem na cirrose avançada: achados morfológicos?", back: "Superfície nodular · Parênquima heterogêneo · Redução do lobo direito · Aumento do lobo caudado e do segmento lateral esquerdo" },
      { front: "Rastreamento de CHC no cirrótico segundo a apostila?", back: "USG semestral junto com alfafetoproteína sérica" }
    ]
  },
  {
    id: "hep-dha", name: "Doença hepática alcoólica · DHA", specialty: "clinica",
    cards: [
      { front: "Três estágios da DHA?", back: "Esteatose assintomática · Esteato-hepatite/hepatite alcoólica · Cirrose alcoólica" },
      { front: "DHA grave: limiar de consumo citado?", back: "Homens: >80 g/dia por >10 anos · Mulheres: >30–40 g/dia por >10 anos" },
      { front: "Por que mulheres são mais suscetíveis à DHA?", back: "Menor concentração de álcool-desidrogenase na mucosa gástrica · Maior etanolemia para a mesma dose" },
      { front: "DHA: padrão zonal histológico?", back: "Predomínio centrolobular/perivenular · Zona 3 · Difere das hepatites virais crônicas, que predominam na zona 1 periportal" },
      { front: "Esteatose alcoólica é reversível?", back: "Sim · A esteatose induzida pelo álcool é prontamente reversível com cessação do etilismo" },
      { front: "Hepatite alcoólica: critérios histológicos?", back: "Esteatose + necrose hepatocitária + infiltrado neutrofílico perivenular · Corpúsculos de Mallory podem ocorrer, mas não são obrigatórios" },
      { front: "Corpúsculos de Mallory são exclusivos da hepatite alcoólica?", back: "Não · Também podem ocorrer em EHNA, Wilson, CBP, desnutrição grave e com amiodarona/griseofulvina" },
      { front: "Síndrome clínica clássica da hepatite alcoólica?", back: "Anorexia · Hepatomegalia dolorosa · Febre · Icterícia acentuada" },
      { front: "Padrão AST/ALT na hepatite alcoólica?", back: "AST/ALT >2 · AST geralmente ≤300 U/L · FAL e GGT aumentam, mas não >3x o LSN" },
      { front: "Hemograma característico da hepatite alcoólica?", back: "Leucocitose com desvio à esquerda, por vezes reação leucemoide · Anemia macrocítica é comum" },
      { front: "Quando indicar corticoide na hepatite alcoólica aguda?", back: "Encefalopatia e/ou Índice de Função Discriminante de Maddrey ≥32 · Prednisolona por um mês" },
      { front: "Maddrey: fórmula e principal preditor isolado de óbito em 90 dias?", back: "IFD = 4,6 × (TAP paciente − TAP controle) + bilirrubina total · Injuria renal aguda é o melhor preditor isolado de óbito em 90 dias" }
    ]
  },
  {
    id: "hep-dhgna-nash", name: "DHGNA · EHNA/NASH", specialty: "clinica",
    cards: [
      { front: "EHNA no espectro da DHGNA?", back: "Fica entre esteatose simples sem atividade necroinflamatória e cirrose · É esteato-hepatite não alcoólica" },
      { front: "Perfil associado à DHGNA?", back: "Obesidade · Diabetes mellitus tipo 2 · Dislipidemia com triglicerídeos altos e HDL baixo · Componentes da síndrome metabólica" },
      { front: "Fatores associados à progressão de EHNA para cirrose?", back: "Idade >45 anos · IMC elevado · Diabetes" },
      { front: "Resistência insulínica favorece esteatose por quais vias?", back: "Aumenta lipólise periférica e captação hepática de lipídios · Diminui betaoxidação · Aumenta biossíntese de triglicerídeos" },
      { front: "EHNA: mecanismo destacado de esteato-hepatite?", back: "Excesso de ácidos graxos → TNF-alfa/IL-6 e disfunção mitocondrial · Peroxidação gera ERO e estresse oxidativo" },
      { front: "Histologia da EHNA?", back: "Esteatose macrovesicular + inflamação lobular + necrose hepatocelular · Às vezes corpúsculos de Mallory" },
      { front: "Como diferenciar na biópsia EHNA/DHA de HAI?", back: "EHNA/DHA: esteatose macrovesicular + inflamação lobular ± Mallory · HAI: hepatite de interface" },
      { front: "DHGNA/EHNA: hepatograma normal exclui doença grave?", back: "Não · Pode haver EHNA grave e até cirrose com exames laboratoriais normais" },
      { front: "AST/ALT na DHGNA?", back: "Geralmente <1 · Quando progride para cirrose, pode inverter e ficar >2" },
      { front: "Ferritina e saturação de transferrina altas na DHGNA: cuidado?", back: "Não fechar hemocromatose sem alterações genéticas do gene HFE · Hiperferritinemia pode refletir agressão hepatocelular e inflamação" },
      { front: "Imagem na esteatose: limitação?", back: "TC, USG e RM detectam esteatose · Nenhum distingue com acurácia se há esteato-hepatite · Elastografia ajuda a quantificar fibrose" },
      { front: "Tratamento-base da DHGNA e metas de perda ponderal?", back: "Dieta + atividade física · Perder 3–5% pode normalizar hepatograma · Para EHNA franca, pode ser necessário até 10% do peso inicial" }
    ]
  },
  {
    id: "hep-hai", name: "Hepatite autoimune · HAI", specialty: "clinica",
    cards: [
      { front: "Perfil típico da hepatite autoimune?", back: "Predomínio em mulheres jovens · Pode ocorrer em qualquer sexo e idade" },
      { front: "Lesão histológica característica da HAI?", back: "Hepatite de interface · Infiltrado no espaço porta formando uma “linha de frente” contra a periferia do lóbulo" },
      { front: "Imunoglobulina característica da HAI?", back: "Hipergamaglobulinemia policlonal · Predomínio de IgG" },
      { front: "HAI tipo 1: autoanticorpos e perfil?", back: "FAN homogêneo · Antimúsculo liso · Antiactina · p-ANCA atípico · Forma mais comum, predominante em mulheres jovens" },
      { front: "HAI tipo 2: marcador e perfil?", back: "Anti-LKM isolado · Predomina em meninas <14 anos · FAN costuma ser negativo e pode não haver hipergamaglobulinemia" },
      { front: "HAI tipo 3/variante agressiva: marcador?", back: "Anti-SLA · FAN e antimúsculo liso negativos · Evolução mais grave e recidivante" },
      { front: "HAI: apresentação clínica possível?", back: "40% podem apresentar forma aguda, ocasionalmente fulminante · Curso insidioso: fadiga, anorexia, icterícia e artralgia" },
      { front: "HAI com elevação proeminente de FAL e GGT: pensar em quê?", back: "Síndrome de superposição HAI-CBP ou HAI-colangite esclerosante primária" },
      { front: "Biópsia é indicada na suspeita de HAI?", back: "Sim · Hepatite de interface não é patognomônica, mas no contexto compatível confere especificidade diagnóstica" },
      { front: "HAI grave: critérios para tratar?", back: "Sintomas de hepatite crônica · Aminotransferases ≥10x LSN · Ou ≥5x LSN + gamaglobulinas ≥2x LSN · Ou necrose em ponte/multilobular" },
      { front: "HAI: esquema inicial mais empregado?", back: "Prednisona 30 mg/dia + azatioprina 50 mg/dia · Prednisona isolada 60 mg/dia é alternativa em casos muito sintomáticos" },
      { front: "HAI: prognóstico com e sem tratamento?", back: "Sem tratamento/não respondedores: cirrose ou falência hepática, mortalidade até 40% em 6 meses · Com tratamento: sobrevida em 10 anos de 80–90%" }
    ]
  },
  {
    id: "hep-cbp", name: "Colangite biliar primária · CBP", specialty: "clinica",
    cards: [
      { front: "CBP: definição?", back: "Hepatopatia autoimune crônica · Destruição seletiva de pequenos ductos biliares intra-hepáticos → colestase progressiva e cirrose" },
      { front: "Perfil epidemiológico clássico da CBP?", back: "Predomina em mulheres de 40–60 anos · Muitas vezes diagnosticada por aumento de FAL em paciente assintomática" },
      { front: "Sintomas iniciais mais comuns da CBP?", back: "Fadiga e prurido" },
      { front: "CBP: manifestações tardias?", back: "Icterícia · Esteatorreia · Sinais de hipertensão porta · Sugerem cirrose estabelecida" },
      { front: "CBP: achados cutâneos e metabólicos?", back: "Xantomas/xantelasmas por hipercolesterolemia da colestase · Osteopenia/osteoporose por deficiência de vitamina D" },
      { front: "Alteração laboratorial inicial típica da CBP?", back: "Aumento de fosfatase alcalina · Hiperbilirrubinemia direta tende a surgir em estágios avançados" },
      { front: "CBP: marcador sorológico clássico e imunoglobulina?", back: "Antimitocôndria/AMA · Presente em 95% dos casos · IgM elevada" },
      { front: "Critérios diagnósticos da CBP?", back: "Pelo menos 2 de 3: AMA · Hepatograma colestático, usualmente FAL isolada · Biópsia com colangite destrutiva não supurativa e lesão de ductos interlobulares" },
      { front: "Biópsia é obrigatória para diagnóstico de CBP?", back: "Não · É útil para estadiar a doença" },
      { front: "Prurido na CBP: tratamento tradicional?", back: "Colestiramina · Aumenta eliminação intestinal de substâncias relacionadas ao prurido" },
      { front: "Tratamento específico de base da CBP?", back: "Ácido ursodesoxicólico 13–15 mg/kg/dia · Atrasa progressão, estabiliza histologia e aumenta sobrevida" },
      { front: "CBP avançada com fibrose/cirrose: medida que prolonga sobrevida?", back: "Transplante hepático" }
    ]
  },
  {
    id: "hep-wilson", name: "Doença de Wilson · ATP7B", specialty: "clinica",
    cards: [
      { front: "Wilson: herança e gene?", back: "Autossômica recessiva · Inativação do ATP7B, que transfere cobre do hepatócito para os canalículos biliares" },
      { front: "Dois mecanismos de acúmulo de cobre na DW?", back: "Falha da excreção biliar do cobre · Produção deficiente de ceruloplasmina → maior cobre livre circulante" },
      { front: "Faixa etária e apresentação típica da Wilson?", back: "Diagnóstico sobretudo entre 5–30 anos · Crianças: forma hepática · Adultos: manifestações neuropsiquiátricas" },
      { front: "Formas hepáticas possíveis na Wilson?", back: "Hepatite crônica ativa · Hepatite fulminante · Cirrose" },
      { front: "Wilson fulminante: achado hematológico importante?", back: "Destruição maciça de hepatócitos libera cobre livre e pode causar hemólise" },
      { front: "Anel de Kayser-Fleischer: significado?", back: "Depósito de cobre na membrana de Descemet · Presente em >99% dos sintomáticos neuropsiquiátricos · Sem anel nessa forma, praticamente exclui DW" },
      { front: "Ceruloplasmina na Wilson: valor e limitação?", back: "Geralmente <20 mg/dL · Pode ser normal em cerca de 10% dos portadores e baixa em outras condições/heterozigotos" },
      { front: "Cobre urinário de 24h sugestivo de Wilson sintomática?", back: ">100 mcg/dia em paciente compatível · Pessoas hígidas: até 20–50 mcg/dia" },
      { front: "Padrão-ouro confirmatório para Wilson?", back: "Biópsia hepática com quantificação de cobre · >200 mcg/g de peso seco confirma na ausência de colestase obstrutiva prolongada · Histoquímica não é confiável" },
      { front: "Wilson: primeira linha em sintomáticos com Nazer <7?", back: "Quelante, preferencialmente trientina · Se associar zinco, separar as tomadas em pelo menos 1 hora" },
      { front: "Zinco na Wilson: mecanismo e papel?", back: "Inibe absorção intestinal de cobre e induz metalotioneína hepática · Escolha em pré-sintomáticos/manutenção e opção em manifestação neuropsiquiátrica" },
      { front: "Wilson: D-penicilamina e forma fulminante?", back: "D-penicilamina é segunda linha, por efeitos adversos e possível piora neuropsiquiátrica · Nazer >9 ou forma fulminante → transplante hepático" }
    ]
  },
  {
    id: "hep-hemocromatose", name: "Hemocromatose hereditária · HH", specialty: "clinica",
    cards: [
      { front: "Hemocromatose: problema central?", back: "Aumento progressivo dos estoques de ferro com deposição em fígado, coração, hipófise, gônadas, pâncreas e outros órgãos" },
      { front: "HH hereditária relacionada ao HFE: genótipos citados?", back: "Homozigose C282Y · Heterozigose C282Y/H63D" },
      { front: "Fisiopatologia da HH?", back: "Hiperabsorção intestinal de ferro, apesar de ingestão normal · Deposição promove peroxidação lipídica, radicais livres e fibrose" },
      { front: "Perfil clínico da HH sintomática?", back: "Em geral 40–50 anos · Mais homens · Astenia, letargia, fadiga, artralgia, perda da libido/impotência ou amenorreia" },
      { front: "HH: órgãos e manifestações clássicas?", back: "Fígado: hepatomegalia/cirrose · Pâncreas: diabetes · Coração: IC e arritmias · Hipófise/gônadas: hipogonadismo" },
      { front: "Hiperpigmentação na hemocromatose?", back: "Comum em sintomáticos, mas pode faltar nos estágios precoces · Mais acentuada em face, pescoço, mãos, pernas, genitais e cicatrizes" },
      { front: "Artropatia hemocromatótica: pistas?", back: "Pode ser manifestação inicial · Osteoartrite antes dos 40 anos · Compromete sobretudo 2ª e 3ª metacarpofalangianas · Condrocalcinose é frequente" },
      { front: "Regra dos 3 As para suspeitar de HH?", back: "Astenia crônica imotivada · Artralgia · Aminotransferases elevadas sem causa aparente, sobretudo <3x LSN" },
      { front: "Qual é o exame mais sensível para identificação fenotípica de homozigotos HH?", back: "Índice de Saturação da Transferrina/IST · Geralmente >60% nos homens e >50% nas mulheres com HH clínica" },
      { front: "Ferritina na HH: como interpretar?", back: "Reflete estoques de ferro, mas é reagente de fase aguda · Pode estar normal em adolescentes · >1.000 μg/L sugere fibrose em contexto compatível" },
      { front: "Como confirmar HH por genética?", back: "Genotipagem por PCR · Homozigose C282Y/C282Y confirma HH" },
      { front: "Tratamento principal da HH?", back: "Flebotomias · Uma sangria de 500 mL remove cerca de 250 mg de ferro · Deferoxamina é coadjuvante quando há cardiopatia ou intolerância às sangrias" }
    ]
  },
  {
    id: "hep-dili", name: "Hepatopatia medicamentosa · DILI", specialty: "clinica",
    cards: [
      { front: "Definição de hepatopatia medicamentosa?", back: "Qualquer alteração hepática relacionada a droga · Pode ser assintomática ou causar insuficiência hepática fulminante, subfulminante ou crônica" },
      { front: "DILI: mecanismos principais?", back: "Toxicidade direta: dose-dependente e previsível · Idiossincrásica: dose-independente, imprevisível e geralmente geneticamente determinada" },
      { front: "DILI: estruturas e padrões possíveis?", back: "Hepatócitos → lesão hepatocelular · Fluxo biliar → colestática · Estruturas vasculares · Podem coexistir" },
      { front: "DILI: padrão laboratorial mais frequente?", back: "Hepatocelular em 90% dos casos · ALT/AST predominam sobre outros marcadores" },
      { front: "DILI: janela habitual entre início do fármaco e hepatotoxicidade?", back: "Em geral 5–90 dias · A história cronológica de exposição é essencial" },
      { front: "Como apoiar o diagnóstico de DILI?", back: "Exposição compatível · Excluir outras etiologias · Resolução em semanas a meses após suspender a droga suspeita" },
      { front: "Conduta à suspeita de DILI com ALT >3x LSN?", back: "Suspender imediatamente o medicamento suspeito · Não aguardar exames confirmatórios" },
      { front: "Paracetamol em altas doses: lesão e gravidade?", back: "Hepatotoxina intrínseca dose-dependente · Necrose centrolobular · Doses >10–15 g podem causar insuficiência hepática fulminante" },
      { front: "Paracetamol: antídoto e janela ideal?", back: "N-acetilcisteína · Reduz necrose e mortalidade, sobretudo se administrada nas primeiras 8 horas" },
      { front: "RIPE: quais fármacos têm potencial hepatotóxico e qual associação é sinérgica?", back: "Rifampicina, isoniazida e pirazinamida · Isoniazida + rifampicina têm sinergismo hepatotóxico" },
      { front: "Amoxicilina + clavulanato: padrão de DILI?", back: "Lesão hepática colestática · Pode surgir semanas após o fim do tratamento · Icterícia é característica" },
      { front: "DILI: associações clássicas de drogas e padrão?", back: "Fenitoína: hepatite com hipersensibilidade/rash/eosinofilia · Valproato: esteatose microvesicular e necrose centrolobular · ACO: colestase hepatocelular" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-hepato.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
if (!Array.isArray(existing)) throw new Error("flashcards-hepato.json deve conter um array");
const byId = new Map(existing.map((deck) => [deck.id, deck]));
decks.forEach((deck) => byId.set(deck.id, deck));
const merged = [...byId.values()];
fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(`${merged.length} decks · ${merged.reduce((n, deck) => n + deck.cards.length, 0)} cards`);
