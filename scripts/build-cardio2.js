/**
 * Flashcards Cardiologia · Car2
 * Fonte exclusiva: data/_extract_cardio/Car2-full.txt e snips-car2/.
 */
const fs = require("fs");
const path = require("path");

const c = (front, back) => ({ front, back });
const decks = [
  {
    id: "cardio-icc-basico", name: "ICC · bases · diagnóstico", specialty: "clinica",
    cards: [
      c("Como o Car2 define insuficiência cardíaca?", "Síndrome clínica por alteração estrutural e/ou funcional cardíaca · Prejudica enchimento e/ou esvaziamento · Eleva pressões intracavitárias · Congestão pulmonar e/ou sistêmica ± baixo débito"),
      c("Quais são as quatro classificações gerais da IC?", "Ventrículo predominante: direita × esquerda · Fração de ejeção · Débito: alto × baixo · Cronologia: aguda × crônica"),
      c("Como se classificam ICFER, ICFElr, ICFEP e ICFEm pela FE?", "ICFER: FE ≤ 40% · ICFElr: FE 41–49% · ICFEP: FE ≥ 50% · ICFEm: FE prévia < 40%, aumento ≥ 10% e FE atual > 40%"),
      c("Quais são as principais causas de IC citadas no Car2?", "DAC é a principal (60–75%) · HAS é fator contribuinte frequente · Ambas podem gerar ICFER ou ICFEP · Diabetes é fator de risco associado"),
      c("Quais causas de sobrecarga e cardiomiopatia o Car2 lista na IC?", "Sobrecarga de pressão: HAS, estenoses · Sobrecarga de volume: insuficiências, shunts · CMD não isquêmica · Arritmias crônicas/taquicardiomiopatia · Cardiotoxicidade por antraciclinas"),
      c("O que mede a classificação funcional NYHA?", "Limitação clínica para atividade física · I: sem limitação · II: limitação leve · III: limitação acentuada · IV: sintomas em repouso ou mínimos esforços"),
      c("Quais sintomas sugerem congestão por IC esquerda?", "Dispneia aos esforços · Ortopneia · Dispneia paroxística noturna · Estertores e edema pulmonar nas formas descompensadas"),
      c("Quais achados sugerem congestão sistêmica por IC direita?", "Turgência jugular · Hepatomegalia congestiva · Ascite · Edema de membros inferiores"),
      c("Quais sinais de baixo débito são pérolas na IC?", "Fadiga e fraqueza · Pulso filiforme · Pulso dicrótico · Pulso alternans · Os achados pulsáteis indicam pior prognóstico"),
      c("Qual bordão clássico sobre IC direita o Car2 destaca?", "A principal causa de insuficiência do coração direito é a insuficiência do coração esquerdo · Com o tempo, o quadro torna-se biventricular"),
      c("Quais são os critérios de Framingham para IC?", "2 maiores ou 1 maior + 2 menores · Maiores incluem DPN, turgência jugular, estertores, cardiomegalia, EAP, B3, PVC elevada · Interpretar no contexto clínico"),
      c("Como interpretar BNP e NT-pró-BNP na suspeita ambulatorial de IC?", "BNP > 35–50 pg/mL ou NT-pró-BNP > 125 pg/mL apoiam IC · Valores baixos ajudam a afastar dispneia de causa cardíaca"),
      c("Em quais situações BNP/NT-pró-BNP podem enganar?", "Elevam-se com idade, FA, insuficiência renal, sexo feminino e falência isolada de VD · Obesidade pode reduzi-los falsamente"),
      c("Qual peptídeo solicitar no usuário de sacubitril/valsartana?", "NT-pró-BNP · O inibidor da neprilisina eleva BNP, mas não NT-pró-BNP"),
      c("O que compõe o escore H2FPEF para ICFEP?", "Heavy (obesidade) · Hipertensão · Fibrilação atrial · hipertensão Pulmonar · Elderly (idade avançada) · Filling pressures (pressões de enchimento)"),
      c("O que a radiografia de tórax pode mostrar na IC congestiva?", "Cardiomegalia · Inversão do padrão vascular · Linhas B de Kerley · Infiltrados de edema pulmonar · Derrame pleural, por vezes bilateral"),
      c("Qual é o papel central do ecocardiograma na IC?", "Avalia FE e função sistólica/diastólica · Dimensões cavitárias · Valvopatias · Pressões e alterações estruturais que definem etiologia"),
      c("Qual achado ecocardiográfico é típico da cardiomiopatia dilatada?", "Dilatação ventricular com disfunção sistólica predominante · FE reduzida · Pode haver trombo intracavitário e insuficiência mitral/tricúspide funcional"),
      c("Qual VO₂ máx. indica péssimo prognóstico e candidatura a Tx?", "VO₂ máx. ≤ 14 mL/kg/min · Nesses casos, espera-se maior sobrevida com o transplante do que com o tratamento medicamentoso"),
      c("Por que a FE é decisiva na IC?", "A classificação por FE orienta manejo e prognóstico · A evidência de redução de morbimortalidade com terapia específica é mais robusta na ICFER")
    ]
  },
  {
    id: "cardio-icc-tratamento", name: "ICC · tratamento · descompensação", specialty: "clinica",
    cards: [
      c("Quais são os pilares farmacológicos da ICFER no Car2?", "IECA ou BRA/INRA · Betabloqueador · Antagonista mineralocorticoide · Inibidor de SGLT2 · Diurético para congestão"),
      c("Qual é o papel de IECA ou BRA na ICFER?", "Bloqueiam o sistema renina-angiotensina · São base do tratamento modificador de prognóstico · BRA é alternativa quando IECA não é tolerado"),
      c("Quais betabloqueadores são citados para ICFER?", "Carvedilol · Metoprolol · Bisoprolol · Usar em paciente estável, com titulação progressiva"),
      c("Quando espironolactona é validada no Car2?", "ICFER NYHA III–IV · Na prática, aceita-se extrapolar a partir de NYHA II · Eplerenona foi validada em NYHA II–IV"),
      c("Quando evitar espironolactona?", "Creatinina > 2,5 mg/dL ou potássio persistentemente elevado · Monitorar função renal e potássio"),
      c("O que é o INRA sacubitril/valsartana?", "Valsartana bloqueia receptor de angiotensina · Sacubitril inibe neprilisina, reduzindo degradação de peptídeos natriuréticos e bradicinina"),
      c("Qual benefício do sacubitril/valsartana citado no Car2?", "Reduz mortalidade e internações cardiovasculares em comparação ao enalapril · Considerado em ICFER sintomática"),
      c("Quais SGLT2 são citados no tratamento da IC?", "Empagliflozina e dapagliflozina · Reduzem morte e hospitalização por IC independentemente de diabetes"),
      c("O que é a vasodilatação balanceada na ICFER?", "Hidralazina + nitrato · Estratégia que prolonga sobrevida e atrasa remodelamento · Complementa o bloqueio neuro-hormonal"),
      c("Quando considerar ivabradina na ICFER?", "Paciente sintomático apesar do tratamento, em ritmo sinusal com FC ≥ 70 bpm · Inibe corrente If do nó sinusal · Reduz FC sem inotropismo negativo"),
      c("Qual é o papel dos diuréticos na IC?", "Alívio de congestão e sintomas · Não substituem terapias modificadoras de prognóstico · Ajustar conforme volemia e função renal"),
      c("Qual é o efeito e a limitação da digoxina?", "Inotrópico positivo leve e simpatolítico · Diminui hospitalizações · Índice terapêutico estreito · Não é pilar de redução de mortalidade"),
      c("Qual abordagem na ICFEP destacada no Car2?", "Controlar congestão com diuréticos · Tratar comorbidades e etiologia · SGLT2 pode reduzir internações e mortalidade cardiovascular"),
      c("Qual é a principal indicação de TRC no Car2?", "ICFER sintomática NYHA ≥ II refratária, ritmo sinusal, FE ≤ 35%, QRS ≥ 150 ms e morfologia de BRE completo"),
      c("Quando TRC ainda pode ser indicada com QRS 130–150 ms?", "ICFER sintomática refratária, ritmo sinusal, FE ≤ 35% e morfologia de BRE completo · Sem morfologia de BRE, só se QRS > 160 ms"),
      c("Quais indicações de CDI para prevenção primária na ICFER?", "Não isquêmica: FE ≤ 35% + NYHA II–III após ≥ 6 meses de terapia otimizada · Isquêmica: mesmos critérios, ≥ 40 dias pós-IAM ou ≥ 90 dias pós-CRM"),
      c("Quando o CDI tem pouco papel ou deve ser evitado logo após IAM?", "Sem benefício nos primeiros 40 dias após IAM ou 90 dias após CRM · Em NYHA IV refratária, preferir Tx quando possível"),
      c("O que são DACM no estágio D?", "Dispositivos de assistência circulatória mecânica · Curta (< 30 dias) ou longa permanência · Ponte para Tx ou terapia de destino se não candidato a Tx"),
      c("Quando a IC aguda geralmente exige internação?", "Congestão/edema pulmonar, hipoxemia, baixo débito ou hipoperfusão · Instabilidade hemodinâmica · Arritmias, SCA ou necessidade de terapia EV"),
      c("Como o Car2 nomeia os perfis hemodinâmicos da ICA?", "A quente-seco · B quente-úmido · C frio-úmido · L frio-seco · C = complex · L = low volume"),
      c("Qual é o objetivo inicial no paciente 'quente e úmido'?", "Descongestionar · Diurético de alça IV e vasodilatador quando a pressão arterial permitir"),
      c("Qual inotrópico é droga de escolha no baixo débito da ICA?", "Dobutamina · Agonista β1 dose-dependente · Baixo risco de hipotensão, mas uso prolongado/altas doses pode reduzir PA e arritmias"),
      c("O que é a levosimendana?", "Sensibilizador de cálcio que aumenta contratilidade · Vasodilatação pulmonar e periférica via canais de K+ ATP-dependentes"),
      c("O que define choque cardiogênico no contexto da IC aguda?", "Hipoperfusão por falência de bomba · Hipotensão, extremidades frias, oligúria e alteração do sensório · Requer suporte intensivo")
    ]
  },
  {
    id: "cardio-has", name: "HAS · diagnóstico · tratamento · crises", specialty: "clinica",
    cards: [
      c("Como a HAS é definida no Car2?", "Elevação sustentada da pressão arterial · Diagnóstico no consultório: média de medidas em pelo menos duas consultas, em dias diferentes"),
      c("Qual valor de consultório define HAS no Car2?", "PA ≥ 140 × 90 mmHg · Valores persistentemente elevados em consultas distintas definem HAS"),
      c("Como o Car2 classifica PA ótima, normal e pré-hipertensão?", "Ótima: < 120/80 · Normal: 120–129 e/ou 80–84 · Pré-hipertensão: 130–139 e/ou 85–90 mmHg"),
      c("Como são os estágios de HAS?", "Estágio I: 140–159 e/ou 90–99 · II: 160–179 e/ou 100–109 · III: ≥ 180 e/ou ≥ 110 mmHg"),
      c("Como definir hipertensão sistólica isolada?", "PAS ≥ 140 mmHg com PAD < 90 mmHg · É típica do idoso"),
      c("Quais cortes definem HAS na MRPA e na MAPA?", "MRPA: média ≥ 130 × 80 · MAPA vigília ≥ 135 × 85 · MAPA 24 h ≥ 130 × 80 · MAPA sono ≥ 120 × 70 mmHg"),
      c("O que é hipertensão do jaleco branco?", "PA ≥ 140 × 90 no consultório com medidas domiciliares/MAPA geralmente < 140 × 90 · Pode corresponder a ~30% dos 'hipertensos' no estágio I"),
      c("Qual equação hemodinâmica explica a PA?", "PA = débito cardíaco × resistência vascular periférica · HAS pode decorrer de aumento de DC, RVP ou ambos"),
      c("Qual repercussão cardíaca é mais comum da HAS?", "Hipertrofia ventricular esquerda · A sobrecarga crônica pode evoluir para disfunção diastólica, IC e arritmias"),
      c("Quais são as causas mais comuns de HAS secundária?", "Doença parenquimatosa renal · Estenose de artéria renal/renovascular · Menos comuns: coartação, Cushing, feocromocitoma, hiperaldosteronismo primário, tireoidopatias"),
      c("Qual é a meta pressórica em paciente sem alto risco?", "< 140 × 90 mmHg · Se tolerado, pode-se buscar valores próximos de 120 × 80 mmHg"),
      c("Qual meta de consultório é sugerida para alto risco?", "PAS entre 120–129 mmHg, com cautela e individualização · Idosos frágeis e DRC avançada requerem redução gradual"),
      c("Quais classes são primeira linha no Car2?", "Diuréticos · Bloqueadores de canal de cálcio · IECA · BRA"),
      c("Qual combinação inicial tem evidência destacada?", "IECA + bloqueador de canal de cálcio · A dupla também é alternativa a IECA + diurético conforme perfil clínico"),
      c("Qual associação deve ser evitada na HAS?", "IECA + BRA · A dupla bloqueia excessivamente o SRAA e não é recomendada"),
      c("Como o Car2 define HAS resistente?", "PA acima da meta com três fármacos em doses máximas toleradas, incluindo diurético · A 4ª droga preferencial é espironolactona"),
      c("O que é crise hipertensiva?", "Elevação importante da PA que exige avaliação imediata · Ponto de corte convencional: PAS ≥ 180 e/ou PAD ≥ 120 mmHg · Gravidade depende de lesão aguda de órgão-alvo"),
      c("Urgência hipertensiva versus emergência hipertensiva?", "Urgência: PA muito elevada sem lesão aguda de órgão-alvo · Emergência: PA elevada com lesão aguda progressiva, exigindo redução controlada com terapia parenteral"),
      c("Qual é o anti-hipertensivo parenteral mais usado nas emergências?", "Nitroprussiato de sódio · Vasodilatador arterial e venoso potente · Pode causar 'roubo' coronariano, diferente da nitroglicerina"),
      c("Como manejar a PA na dissecção aguda de aorta?", "Emergência hipertensiva · Reduzir rapidamente frequência e força de ejeção com betabloqueador IV, seguido de controle pressórico · Objetivo é limitar propagação da dissecção")
    ]
  },
  {
    id: "cardio-valvas-estenose", name: "Valvas · estenose mitral e aórtica", specialty: "clinica",
    cards: [
      c("O que é estenose mitral?", "Restrição à abertura dos folhetos mitrais · Obstáculo ao fluxo do átrio esquerdo para o ventrículo esquerdo na diástole"),
      c("Como o Car2 gradua a estenose mitral pela área valvar?", "Leve: 1,5–2,5 cm² · Moderada: 1,0–1,5 cm² · Grave: < 1,0 cm² · Área normal: 4–6 cm²"),
      c("Qual etiologia clássica da estenose mitral?", "Doença reumática · Estalido de abertura em EM é fortemente sugestivo de etiologia reumática"),
      c("Quais sintomas são típicos da estenose mitral?", "Dispneia aos esforços, ortopneia e DPN por congestão pulmonar · Palpitações por FA · Hemoptise e embolia podem ocorrer"),
      c("Qual achado auscultatório clássico da EM?", "B1 hiperfonética · Estalido de abertura após B2 · Ruflar diastólico apical, com reforço pré-sistólico se houver ritmo sinusal"),
      c("O que acontece ao sopro da EM na fibrilação atrial?", "Perde o reforço pré-sistólico, pois não há contração atrial organizada"),
      c("Qual complicação arrítmica é central na estenose mitral?", "Fibrilação atrial · Pode causar importante piora hemodinâmica e eleva risco de tromboembolismo"),
      c("O que avalia o escore de Block/Wilkins?", "Calcificação · Espessamento · Mobilidade das cúspides · Acometimento do aparelho subvalvar · Cada item 1–4 · Total 4–16"),
      c("Como interpretar o escore de Wilkins na plastia mitral?", "< 8: valva pouco comprometida, excelente resposta à plastia · ≥ 12: valva muito degenerada/calcificada, resposta insatisfatória"),
      c("Qual exame confirma e estratifica a estenose mitral?", "Ecocardiograma com Doppler · Mede área valvar e gradiente médio, avalia morfologia, pressão pulmonar e trombo atrial"),
      c("Quando considerar valvoplastia mitral por balão?", "EM importante e sintomática com anatomia favorável · Sem trombo em átrio esquerdo e sem insuficiência mitral relevante"),
      c("Quando cirurgia é alternativa na EM?", "Anatomia desfavorável para valvoplastia, IM associada importante, trombo não passível de abordagem ou necessidade de outro procedimento cardíaco"),
      c("O que é estenose aórtica?", "Restrição à abertura da valva aórtica · Gera obstrução fixa à ejeção do ventrículo esquerdo"),
      c("Quais critérios definem EA grave no Car2?", "Área < 1 cm² · Gradiente médio ≥ 40 mmHg · Ou velocidade de pico ≥ 4 m/s"),
      c("Quais sintomas compõem a tríade clássica da EA grave?", "Angina · Síncope aos esforços · Insuficiência cardíaca/dispneia"),
      c("Qual pulso é típico da EA moderada a grave?", "Pulso parvus et tardus · Baixa amplitude e ascensão lenta, melhor identificado na carótida"),
      c("Como é o sopro típico da EA?", "Mesossistólico em diamante no foco aórtico · Irradia para carótidas · Pode haver frêmito"),
      c("Quais outros achados apoiam EA importante?", "A2 hipofonética · Ictus propulsivo sustentado · B4 · Desdobramento paradoxal de B2"),
      c("Qual exame define gravidade e guia a conduta na EA?", "Ecocardiograma-Doppler · A troca valvar é indicada na EA grave sintomática ou com disfunção ventricular atribuível à estenose"),
      c("Quando a TAVI é preferida no Car2?", "EA grave sintomática com idade > 80 anos e/ou risco cirúrgico proibitivo · Exemplos: cirrose, DPOC grave, aorta em porcelana, HP > 60 mmHg, fragilidade, radioterapia/cirurgias prévias"),
      c("Qual antiagregação acompanha a TAVI?", "Dupla antiagregação AAS + clopidogrel por 3–6 meses · Antibioticoprofilaxia e pré-dilatação do anel durante o procedimento")
    ]
  },
  {
    id: "cardio-valvas-insuficiencia", name: "Valvas · insuficiências · endocardite", specialty: "clinica",
    cards: [
      c("O que é insuficiência mitral?", "Refluxo de sangue do VE para o AE durante a sístole · Pode ser aguda ou crônica"),
      c("Qual causa mais comum de IM crônica em países desenvolvidos?", "Degeneração mixomatosa/prolapso da valva mitral · Cúspides e cordoalhas frouxas e redundantes"),
      c("Como é o sopro da insuficiência mitral crônica?", "Holossistólico, mais audível no foco mitral · Irradia tipicamente para a axila · Aumenta com handgrip"),
      c("Qual repercussão crônica caracteriza a IM?", "Sobrecarga de volume de AE e VE · Dilatação progressiva · FA, hipertensão pulmonar e IC em fases avançadas"),
      c("Quais causas de IM aguda são pérolas?", "Disfunção/ruptura de músculo papilar após IAM · Ruptura de cordoalha · Endocardite infecciosa com perfuração ou destruição valvar"),
      c("Por que IM aguda pode causar edema agudo de pulmão?", "AE não adaptado recebe volume regurgitante súbito · A elevação abrupta da pressão atrial se transmite ao leito pulmonar"),
      c("Qual exame é central para IM?", "Ecocardiograma com Doppler · Define mecanismo, gravidade, dimensões de AE/VE, função ventricular e possibilidade de plastia"),
      c("Qual é o papel da cirurgia na IM importante?", "Preferir plastia quando factível · Indicada em IM grave sintomática e em situações selecionadas de repercussão ventricular ou reparo precoce"),
      c("O que é insuficiência aórtica?", "Refluxo da aorta para o VE durante a diástole · Pode decorrer de lesão das cúspides ou dilatação da raiz/aorta ascendente"),
      c("Qual pulso é clássico da IA crônica importante?", "Pulso em martelo d'água ou de Corrigan · Amplo, com ascensão e queda rápidas · Pressão de pulso divergente"),
      c("Como é o sopro da insuficiência aórtica?", "Protodiastólico aspirativo, agudo e decrescente · Melhor no foco aórtico acessório na IA valvar · Aumenta sentado inclinado para frente e com handgrip"),
      c("O que é o sopro de Austin Flint?", "Ruflar diastólico apical em IA grave · Jato regurgitante fecha parcialmente a cúspide anterior mitral · Não há estalido de abertura nem B1 hiperfonética"),
      c("Qual repercussão ventricular da IA crônica?", "Sobrecarga de volume com dilatação e hipertrofia excêntrica do VE · Pode evoluir para disfunção sistólica e IC"),
      c("Como a IA aguda difere da crônica?", "IA aguda causa aumento súbito da pressão diastólica do VE e congestão pulmonar · Não há tempo para adaptação e dilatação ventricular"),
      c("Como o Car2 estagia as valvopatias A–D?", "A: risco de lesão orovalvar · B: lesão progressiva leve-moderada assintomática · C: lesão grave assintomática · D: sintomático pela lesão"),
      c("Como a diretriz brasileira indica profilaxia de endocardite?", "Antibioticoprofilaxia em portadores de doenças orovalvares ou próteses antes de procedimentos dentários, respiratórios, gastrointestinais ou geniturinários · Mais ampla que as diretrizes internacionais"),
      c("Qual discrepância existe sobre profilaxia de EI?", "Diretrizes internacionais restringem muito, basicamente a procedimentos dentários em situações muito específicas · A nacional amplia a todos com doença orovalvar ou prótese"),
      c("Como a endocardite entra na fisiopatologia das valvopatias no Car2?", "Pode causar IM aguda por destruição valvar · Também figura entre etiologias que lesam o aparelho mitral · Libman-Sacks é citada entre causas não infecciosas de lesão mitral")
    ]
  },
  {
    id: "cardio-cardiomiopatias", name: "Cardiomiopatias · dilatada · hipertrófica · restritiva", specialty: "clinica",
    cards: [
      c("Quais são os três tipos principais de cardiomiopatia?", "Dilatada · Hipertrófica · Restritiva"),
      c("Qual é a fisiopatologia central da cardiomiopatia dilatada?", "Redução da contratilidade miocárdica · Disfunção sistólica predominante · Dilatação ventricular progressiva"),
      c("Quais causas de CMD secundária são pérolas no Brasil?", "Doença de Chagas · Álcool · Miocardite viral · Periparto · HIV · Doxorrubicina · Cocaína · Endocrinopatias e carências nutricionais"),
      c("Como a CMD se apresenta clinicamente?", "Congestão pulmonar: dispneia, ortopneia, DPN · Baixo débito: fadiga e fraqueza · Pode progredir para IC biventricular"),
      c("Quais são complicações importantes da CMD?", "FA e arritmias ventriculares · Tromboembolismo · Bloqueios de condução · Morte súbita"),
      c("Qual achado ecocardiográfico confirma CMD?", "Ventrículo dilatado e FE reduzida · O eco também pesquisa trombo, insuficiência mitral/tricúspide e alterações etiológicas"),
      c("Como tratar a CMD em linhas gerais?", "Terapia da ICFER · Tratar etiologia específica quando possível · Abstenção alcoólica e retirada de cardiotóxicos são exemplos"),
      c("Como definir cardiomiopatia hipertrófica (CMH)?", "Hipertrofia ventricular inexplicada, geralmente do VE · Função sistólica hiperdinâmica · Diagnóstico exige afastar HAS e EA relevantes"),
      c("Qual padrão morfológico é mais comum na CMH?", "Hipertrofia septal assimétrica · A forma apical de Yamaguchi dá aspecto em naipe de espadas"),
      c("O que causa obstrução dinâmica na CMH obstrutiva?", "Movimento sistólico anterior da mitral contra septo hipertrofiado · Fenômeno Venturi · Pode causar IM associada"),
      c("Quais sintomas são clássicos na CMH?", "Dispneia aos esforços · Angina · Pré-síncope/síncope durante esforço · Palpitações"),
      c("Como se comporta o sopro da CMH obstrutiva?", "Aumenta com Valsalva e ortostatismo · Diminui com handgrip e cócoras · É a grande pérola semiológica"),
      c("Quais fatores preditivos de morte súbita na CMH?", "Idade < 35 anos · História familiar de MS · MS abortada · Múltiplas TVNS no Holter · Parede > 30 mm · Hipotensão ao exercício · Síncope em < 30 anos"),
      c("Por que a CMH é especialmente temida em atletas jovens?", "É a causa mais comummente encontrada em autópsias de atletas com morte súbita no esforço · Também é causa comum de MS em jovens"),
      c("Qual exame é principal para CMH?", "Ecocardiograma · Avalia hipertrofia, gradiente de via de saída, movimento sistólico anterior e disfunção diastólica"),
      c("Como tratar sintomas na CMH?", "Betabloqueadores ou verapamil · Casos obstrutivos refratários: ventriculomiectomia ou ablação septal alcoólica"),
      c("Como definir cardiomiopatia restritiva?", "Baixa complacência ventricular e disfunção diastólica importante · Função sistólica geralmente preservada · Átrios aumentados e ventrículos pouco dilatados"),
      c("Quais são as pérolas de cardiomiopatia restritiva no Brasil?", "Endomiocardiofibrose tropical · Amiloidose · Restritiva idiopática · Eco: átrios grandes com ventrículos normais · ECG pode ter baixa voltagem apesar de parede espessada"),
      c("Qual papel do transplante na CMD avançada?", "Cirurgia de maior benefício e às vezes curativa · Desencorajar se a cardiopatia for por doença sistêmica intratável, como amiloidose avançada")
    ]
  },
  {
    id: "cardio-semiologia-hp", name: "Semiologia · sopros · hipertensão pulmonar", specialty: "clinica",
    cards: [
      c("O que representam B1 e B2?", "B1: fechamento de mitral e tricúspide, início da sístole · B2: fechamento de aórtica e pulmonar, início da diástole"),
      c("O que causa desdobramento fisiológico de B2?", "Inspiração aumenta retorno venoso direito e atrasa P2 · Mais audível no foco pulmonar"),
      c("Quais causas de desdobramento paradoxal de B2?", "Atraso de A2 por bloqueio de ramo esquerdo, estenose aórtica ou disfunção de VE · Ocorre na expiração e some na inspiração"),
      c("O que significa B3 patológica?", "Vibração no enchimento rápido ventricular · Sugere sobrecarga de volume, cardiomiopatia ou IC com FE reduzida descompensada"),
      c("Quando B4 não pode existir?", "Na fibrilação atrial, porque requer contração atrial vigorosa contra ventrículo pouco complacente"),
      c("Qual sopro aumenta com inspiração profunda (Rivero-Carvallo)?", "Sopros do coração direito · Exemplo: insuficiência tricúspide · A inspiração aumenta retorno venoso direito"),
      c("Como diferenciar sopro de EA e IM pelo handgrip?", "Handgrip reduz sopro da EA · Aumenta sopro da IM"),
      c("O que é pulso parvus et tardus?", "Pulso de ascensão lenta e baixa amplitude · Característico de estenose aórtica moderada a grave"),
      c("O que significa onda V gigante na jugular?", "Insuficiência tricúspide severa · Regurgitação sistólica arterializa o pulso venoso"),
      c("Como o Car2 define hipertensão pulmonar?", "PAP média > 20 mmHg em repouso ao cateterismo direito + RVP > 3 unidades Wood"),
      c("Quais são os cinco grupos clínicos de hipertensão pulmonar?", "1: HAP · 2: doença cardíaca esquerda · 3: doença pulmonar/hipoxemia · 4: obstrução arterial pulmonar · 5: mecanismos multifatoriais/desconhecidos"),
      c("Quais associações clássicas do grupo 1 HAP?", "Idiopática/familiar · Colagenoses · Hipertensão portal · Shunts congênitos · HIV · Anorexígenos · Doença venoclusiva/hemangiomatose capilar"),
      c("Quais sintomas sugerem HAP?", "Dispneia aos esforços, fadiga, fraqueza, pré-síncope/síncope e dor precordial · Edema periférico ocorre em fases mais avançadas"),
      c("Qual achado auscultatório é mais característico de HAP?", "P2 hiperfonética no foco pulmonar · Pode haver choque valvar palpável"),
      c("Quais achados refletem falência de VD na HAP?", "Ictus de VD, B4 e depois B3 de VD · Insuficiência tricúspide, turgência jugular, hepatomegalia, ascite e edema"),
      c("Qual exame confirma e classifica HAP?", "Cateterismo cardíaco direito · Mede pressões, resistência vascular pulmonar, pressão encunhada e resposta vasodilatadora"),
      c("Quando bloqueadores de canal de cálcio podem ser usados na HAP?", "Somente no respondedor ao teste vasodilatador agudo no cateterismo · Resposta negativa pode piorar com hipotensão, taquicardia, hipoxemia e IC direita"),
      c("Quais classes de terapia específica da HAP o Car2 cita?", "Análogos da prostaciclina · Inibidores de PDE-5 · Antagonistas do receptor da endotelina · Estimulantes da guanilato ciclase · Para não respondedores ou sem resposta sustentada ao BCC"),
      c("Cite fármacos-exemplo das vias da HAP?", "Epoprostenol/iloprosta/treprostinil · Sildenafila · Ambrisentan · Riociguate · Reservados a sintomáticos NYHA II–IV pelo custo e efeitos adversos"),
      c("Qual gene candidato é citado na HAP?", "BMPR2 · Presente em cerca de 25% dos pacientes · Favorece predomínio de substâncias vasoconstritoras")
    ]
  },
  {
    id: "cardio-transplante", name: "Transplante cardíaco · apêndice", specialty: "clinica",
    cards: [
      c("Quais são as três principais etiologias do TxC no Brasil?", "Cardiopatia dilatada idiopática · Cardiopatia isquêmica · Doença de Chagas"),
      c("Qual é o principal critério para listar transplante cardíaco no Car2?", "ICFER avançada refratária ao tratamento · VO₂ máx. < 14 mL/kg/min, ou < 12 mL/kg/min em usuário de betabloqueador"),
      c("Quais contraindicações absolutas ao transplante são citadas?", "Demência · Retardo mental · Incapacidade de realizar seguimento médico · Falência hepática, pulmonar com HP fixa ou renal geralmente contraindica"),
      c("Quais condições são apenas contraindicações relativas ao TxC?", "Idade · Doença cerebrovascular ou vascular periférica · Obesidade IMC > 35 · DM mal controlado · Câncer individualizado · Infecção sistêmica com boa resposta"),
      c("Qual tempo máximo de isquemia fria do coração?", "≤ 4 h · Em circunstâncias especiais (doador jovem/estável e receptor urgente) até 6 h · Só se capta de doadores em morte encefálica"),
      c("Quais critérios de pareamento doador-receptor são centrais?", "Compatibilidade ABO · Tamanho corpóreo equivalente · HLA ideal, mas não imprescindível"),
      c("Qual é a cirurgia de escolha no TxC?", "Transplante ortotópico bicaval · Mantém-se o 'teto' do átrio esquerdo do receptor com as veias pulmonares · Enxerto fica denervado"),
      c("Qual esquema inicial de imunossupressão é preferencial?", "Tacrolimus + micofenolato + prednisona · Prednisona desmamada a partir do 6º mês · Profilaxia com ivermectina contra estrongiloidíase"),
      c("Quais são as formas de rejeição pós-transplante?", "Hiperaguda: incompatibilidade ABO, precoce e geralmente letal · Celular aguda: a mais comum · Humoral: imunocomplexos e complemento · Confirmação histopatológica"),
      c("Como tratar rejeição celular versus humoral?", "Celular: glicocorticoide em pulsoterapia ± ATS/timoglobulina · Humoral: pulsoterapia + plasmaférese + IVIG + rituximabe"),
      c("O que é a doença vascular do enxerto (DVE)?", "Hiperproliferação miointimal com obstrução difusa arterial e venosa · Prevenção com controle de FR e estatinas · Estabelecida: em geral só novo Tx"),
      c("Qual particularidade do TxC na doença de Chagas?", "Bom resultado em geral · Preferir azatioprina em vez de micofenolato · Reativação em 21–45% · Distinguir de rejeição: biópsia com amastigotos e PCR para T. cruzi · Tratamento: benzonidazol")
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-cardio.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
const ids = new Set(decks.map(d => d.id));
const merged = existing.filter(d => !ids.has(d.id)).concat(decks);
fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n");
console.log(`Car2: ${decks.map((deck) => `${deck.id} (${deck.cards.length})`).join(" · ")}`);
console.log(`Total Car2: ${decks.reduce((n, deck) => n + deck.cards.length, 0)} cards`);
console.log(`Total no arquivo: ${merged.length} decks · ${merged.reduce((n, deck) => n + deck.cards.length, 0)} cards`);
