const fs = require("fs");
const path = require("path");

const deck = (id, name, cards) => ({
  id,
  name,
  specialty: "clinica",
  cards: cards.map(([front, back]) => ({ front, back }))
});

// Conteúdo restrito à Apostila Car1 e seus apêndices.
const decks = [
  deck("cardio-scc", "Síndrome coronariana crônica · angina estável", [
    ["O que define isquemia miocárdica?", "Desequilíbrio entre oferta e consumo de O₂ · Queda de ATP · Isquemia grave e persistente culmina em necrose"],
    ["Como a angina estável se relaciona à obstrução coronariana?", "Placa aterosclerótica fixa geralmente obstrui > 50% do lúmen · Isquemia aparece quando o esforço aumenta a demanda de O₂"],
    ["Quais são os três critérios da dor anginosa típica?", "Desconforto retroesternal característico · Início com esforço ou emoção · Alívio com repouso ou nitrato sublingual"],
    ["Como classificar a dor com dois critérios de angina típica?", "Angina atípica · Com apenas um critério, dor não anginosa"],
    ["Como se caracteriza a angina estável?", "Desconforto isquêmico previsível ao esforço · Regride em repouso · Sem instabilidade aguda da placa"],
    ["O que define CCS I?", "Atividades ordinárias não desencadeiam angina · Apenas esforços intensos, prolongados ou muito rápidos"],
    ["O que define CCS II?", "Discreta limitação das atividades ordinárias · Angina ao andar ou subir escadas rapidamente, após refeições, no frio, vento ou estresse emocional"],
    ["O que define CCS III?", "Limitação acentuada das atividades ordinárias · Angina ao caminhar um ou dois quarteirões ou subir um lance de escadas em condições habituais"],
    ["O que define CCS IV?", "Incapacidade de realizar atividade física sem angina · Pode haver angina em repouso"],
    ["Quais achados sugerem angina instável em quem tinha angina estável?", "Angina em crescendo · Início recente com rápida progressão a CCS III · Angina em repouso prolongada"],
    ["Qual é o papel do teste ergométrico na SCC?", "Teste provocativo mais usado, barato e disponível · Confirma diagnóstico e estratifica prognóstico · Monitora ECG, PA, FC e sintomas durante esforço"],
    ["Quando o teste ergométrico é inadequado?", "ECG basal impede detectar isquemia · Incapacidade de exercício · Contraindicação ao esforço"],
    ["Qual alternativa ao teste ergométrico cabe a quem não pode exercitar-se?", "Eco-stress com dobutamina · Cintilografia miocárdica de perfusão é outra alternativa"],
    ["Qual tratamento basal é indicado na DAC estável?", "Intervenções no estilo de vida · AAS · Estatina, na ausência de contraindicação"],
    ["Qual benefício do AAS na angina estável?", "Reduz significativamente IAM e morte cardíaca · O texto cita 100 mg/dia"],
    ["Como os betabloqueadores aliviam angina?", "Bloqueiam receptores β1 miocárdicos e do nó sinusal · Reduzem contratilidade e FC · Diminuem MVO₂"],
    ["Como os nitratos aliviam angina?", "Reduzem pré e pós-carga · Vasodilatação coronariana direta · Diminuem MVO₂ e aumentam aporte de O₂"],
    ["Como prevenir tolerância aos nitratos de ação longa?", "Prescrição assimétrica · Intervalo livre de nitrato de 8–10 h · Uso contínuo causa taquifilaxia"],
    ["Quando revascularizar na DAC estável?", "Angina refratária ao tratamento clínico otimizado ou intolerância · Situações de alto risco com ganho de sobrevida"],
    ["Quais pistas indicam revascularização na SCC segundo a apostila?", "CCS III–IV apesar de tratamento · Mau prognóstico em teste não invasivo · Anatomia de alto risco"],
    ["Qual é o mecanismo de isquemia na angina estável?", "Aumento da demanda de O₂ diante de obstrução coronariana fixa · Não é a oclusão aguda por trombo da SCA"]
  ]),

  deck("cardio-sca-sem-sst", "SCA sem SST · angina instável e IAMSST", [
    ["Quais características clínicas tornam a angina instável?", "Dor em repouso ou aos mínimos esforços · Duração > 10–20 min · Mais intensa · Início recente em 4–6 semanas · Padrão em crescendo"],
    ["Qual fisiopatologia típica da SCA sem SST?", "Oclusão coronariana subtotal por trombo branco plaquetário · Pode progredir · Também pode haver oclusão total com boa perfusão colateral"],
    ["Como diferenciar angina instável de IAMSST?", "Angina instável não eleva marcadores de necrose · Elevação de MNM define IAMSST"],
    ["Que entidade especial pode causar supra transitório por espasmo?", "Angina variante de Prinzmetal · Espasmo de coronária epicárdica pode gerar oclusão total transitória"],
    ["Quais mecanismos podem causar SCA sem SST além da aterotrombose?", "Aterosclerose acelerada · Reestenose pós-angioplastia · Obstrução dinâmica · Inflamação · Angina secundária por alteração de oferta/consumo de O₂"],
    ["Quais alterações de ECG podem ocorrer na SCA sem SST?", "Onda T apiculada e simétrica · Onda T invertida e simétrica · Infradesnível de ST · ECG pode ser normal"],
    ["Quais achados de ECG são fortemente sugestivos de isquemia?", "Ondas T negativas e simétricas > 2 mm · Infradesnível de ST > 0,5 mm · Alterações que surgem durante a dor"],
    ["O que fazer se ECG não diagnóstico e sintomas persistentes?", "Repetir ECG · Acrescentar V3R, V4R, V7, V8 e V9 para aumentar sensibilidade para coronária direita e circunflexa"],
    ["Como dosar troponina na suspeita de SCA sem SST?", "Troponina ultrassensível: admissão e 1–2 h · Convencional: admissão e 3–6 h · CK-MB massa apenas se troponina indisponível"],
    ["Quais são os sete componentes do TIMI para AI/IAMSST?", "Idade ≥ 65 · ≥ 3 fatores de risco · DAC ≥ 50% · Infra de ST ≥ 0,5 mm · ≥ 2 anginas em 24 h · AAS nos últimos 7 dias · MNM elevado"],
    ["Como o TIMI estratifica risco em AI/IAMSST?", "Cada item vale 1 ponto · Baixo 0–2 · Médio 3–4 · Alto 5–7"],
    ["Quais variáveis compõem o GRACE?", "Idade · Killip · PA sistólica · Desvio de ST · PCR na apresentação · Creatinina · MNM · FC"],
    ["Como classificar risco pelo GRACE?", "Baixo ≤ 108 · Intermediário 109–140 · Alto > 140"],
    ["Qual paciente pode ter alta segura pela avaliação HEART?", "HEART ≤ 3 · Troponina negativa · ECG sem isquemia · Sem DAC prévia ou diagnóstico alternativo com risco iminente de morte"],
    ["Quando indicar estratégia invasiva imediata na SCA sem SST?", "Até 2 h · Angina refratária · IC ou IM nova/piorada · Instabilidade hemodinâmica · Isquemia recorrente apesar de terapia · TV sustentada ou FV"],
    ["Quando indicar estratégia invasiva precoce?", "Até 24 h · GRACE > 140 · Troponina alterada · Infradesnível de ST novo ou presumidamente novo"],
    ["Quando indicar estratégia invasiva em 25–72 h?", "GRACE 109–140 · TIMI ≥ 2 · Diabetes · TFG < 60 · FE < 40% · Angina pós-IAM · ICP recente · CRVM prévia"],
    ["Qual estratégia para SCA sem SST de baixo risco?", "Terapia medicamentosa otimizada · Teste de estresse pré-alta ou angio-TC coronária · Cateterismo se sintomas importantes ou isquemia"],
    ["Qual é o papel do AAS e do P2Y12 na SCA sem SST?", "AAS é essencial em toda SCA · Clopidogrel + AAS formam DAPT · Em estratégia invasiva precoce, aguardar coronariografia antes da tienopiridina"],
    ["Quando preferir enoxaparina ou HNF?", "Enoxaparina é a escolha habitual · HNF se CRVM prevista em 24 h, clearance < 15 mL/min ou peso > 150 kg · HNF é rapidamente reversível com protamina"],
    ["Quando indicar oxigênio na SCA sem SST?", "Em risco intermediário/alto com SpO₂ < 90% e/ou desconforto respiratório · Oxigênio desnecessário e prolongado pode ser prejudicial"],
    ["Qual terapia complementar deve ser precoce?", "Estatina de alta potência independentemente do LDL · Em risco médio/alto, iniciar IECA · BRA se intolerância"]
  ]),

  deck("cardio-sca-com-sst", "SCA com SST · IAM com supra de ST", [
    ["O que significa supra de ST com dor anginosa no IAMST?", "Lesão transmural · Geralmente oclusão coronariana total · Coronária fechada exige reperfusão emergencial"],
    ["Como a necrose evolui após oclusão coronariana total?", "Começa após cerca de 20–30 min · Pode completar-se como infarto transmural em 6–12 h · Tempo é miocárdio"],
    ["Qual conduta diante de dor persistente com ECG inicial normal?", "Repetir ECG a cada 5–10 min · O ECG inicial pode ser normal na isquemia aguda"],
    ["Em quanto tempo interpretar o ECG na suspeita de IAMST?", "ECG de 12 derivações em até 10 min · No IAM inferior, acrescentar V3R, V4R, V7 e V8"],
    ["Quais critérios de ECG definem IAMST no contexto adequado?", "Sem HVE ou BRE · Elevação nova no ponto J em ≥ 2 derivações contíguas · ≥ 1 mm fora de V2–V3"],
    ["Quais cortes de supra em V2–V3 definem IAMST?", "≥ 2 mm no homem > 40 anos · ≥ 2,5 mm no homem < 40 anos · ≥ 1,5 mm na mulher"],
    ["Qual finalidade da reperfusão no IAMST?", "Recanalizar a coronária ocluída · Salvar miocárdio ainda não necrosado · Quanto mais precoce e completa, melhor o prognóstico"],
    ["Quais são as estratégias de reperfusão?", "Fibrinolítico/trombólise química · Angioplastia primária"],
    ["Quais são os tempos-alvo porta-agulha e porta-balão?", "Porta-agulha até 30 min · Porta-balão até 120 min · Sem transferência, hemodinâmica idealmente em 90 min"],
    ["Quando considerar trombólise no IAMST?", "Quando há indicação de reperfusão e a angioplastia primária não será realizada dentro do prazo · Porta-agulha ≤ 30 min"],
    ["Quais fibrinolíticos são usados no IAMST?", "Estreptoquinase (SK) · rtPA/alteplase · Tenecteplase (TNK) · SK: não fibrinoespecífica · rtPA e TNK: fibrinoespecíficos"],
    ["Quais são contraindicações absolutas à trombólise?", "Sangramento intracraniano prévio a qualquer tempo · Dano/neoplasia no SNC · AVC isquêmico ou trauma craniofacial importante < 3 meses · Hemorragia ativa ou diátese · Lesão vascular cerebral conhecida · Dúvida de dissecção aórtica"],
    ["Quais são contraindicações relativas à trombólise?", "AVC isquêmico > 3 meses · Gestação · Cumarínicos · Hemorragia interna 2–4 sem · Cirurgia grande < 3 sem · RCP > 10 min ou traumática · HAS > 180/110 · Punção não compressível · Úlcera péptica ativa · SK: alergia ou exposição prévia > 5 dias"],
    ["Qual DAPT é indicada na trombólise química?", "AAS + clopidogrel · Ticagrelor e prasugrel não foram estudados nessa estratégia e não devem ser associados"],
    ["Como anticoagular após trombólise?", "Enoxaparina preferencialmente por até 8 dias · Se indisponível, HNF por 48 h · DAPT com AAS + clopidogrel por no mínimo 2–4 semanas"],
    ["Qual dupla antiagregação é habitual na angioplastia primária?", "AAS + inibidor P2Y12 · Ticagrelor e prasugrel foram estudados com angioplastia primária"],
    ["Qual é o papel do AAS no IAMST?", "Indicado em toda SCA · Reduz mortalidade e complicações · Ataque de 200–300 mg mastigado e manutenção de 100 mg/dia"],
    ["Como se classificam os pacientes pelo Killip?", "I: sem IC · II: sinais leves de IC · III: edema agudo de pulmão · IV: choque cardiogênico"],
    ["Por que AINE é contraindicado no IAMST?", "Exceto AAS, aumenta morte e reinfarto · Prejudica cicatrização perinecrótica · Predispõe à ruptura de parede"],
    ["Quando evitar nitratos no IAMST?", "Infarto de VD · Uso de inibidor da fosfodiesterase nas últimas 24 h, como sildenafil · Para tadalafil, aguardar 48 h"],
    ["Qual é o papel das estatinas no IAMST?", "Iniciar estatina potente em dose máxima nas primeiras 24 h · Benefício independe do colesterol prévio"],
    ["Por que pesquisar derivações direitas no IAM inferior?", "Para identificar infarto de VD · Nessa situação, drogas que reduzem pré-carga podem precipitar ou piorar hipotensão e choque"],
    ["Qual conduta hemodinâmica é central no infarto de VD com hipotensão?", "Reposição volêmica generosa com SF 0,9% · Dobutamina se refratário · Reperfusão miocárdica"],
    ["O que evitar no infarto de VD?", "Diuréticos · Venodilatadores, como nitratos e morfina · Reduzem pré-carga e podem piorar choque"],
    ["Qual medida inicial acompanha a reperfusão no IAMST?", "Reconhecer rapidamente o IAMST e organizar reperfusão sem atraso · Tempo é miocárdio"]
  ]),

  deck("cardio-iam-complicacoes", "IAM · complicações", [
    ["Quais grupos de complicações podem ocorrer no IAM?", "Arrítmicas · Disfunção ventricular/IC · Isquêmicas · Pericárdicas · Mecânicas: IM, CIV e ruptura de parede livre"],
    ["O que caracteriza FV primária no IAM?", "FV em Killip I, sem IC · Mais frequente na primeira hora · 80% até 48 h · Mecanismo predominantemente isquêmico"],
    ["Como tratar FV primária no IAM?", "Monitorização contínua para reconhecimento precoce · Desfibrilação elétrica com 360 J reverte a maioria"],
    ["Como diferem FV secundária e tardia?", "Secundária: Killip II–IV e disfunção de VE/IC · Tardia > 48 h: em torno de necrose em cicatrização · Pior prognóstico"],
    ["O que é ritmo idioventricular acelerado após IAM?", "Ritmo ventricular com FC 60–100 bpm · Arritmia de reperfusão característica · Benigna e sem piora prognóstica"],
    ["Quando TV não sustentada tem pior prognóstico no IAM?", "Após 48–72 h, no Holter · Associa-se a maior risco de morte cardíaca súbita e não súbita"],
    ["Qual arritmia é muito frequente no IAM inferior precoce?", "Bradicardia sinusal · Comum nas primeiras 6 h por hiperativação vagal via reflexo de Bezold-Jarisch"],
    ["Como diferem BAV total no IAM inferior e anterior?", "Inferior: geralmente transitório, QRS estreito e escape juncional · Anterior: lesão extensa do His/ramos e prognóstico extremamente ruim"],
    ["Como tratar bradicardia sinusal ou Mobitz I sintomáticos no IAM?", "Atropina IV 0,5–2 mg para normalizar a FC"],
    ["Quais bradiarritmias exigem marca-passo provisório classe I?", "Bradiarritmia sintomática refratária à atropina · Assistolia · Mobitz II · BAVT · Bloqueio trifascicular · Bifascicular novo + BAV de 1º grau · BRE novo + BAV de 1º grau"],
    ["Como se define choque cardiogênico no IAM?", "PA sistólica < 80 mmHg + hipoperfusão periférica e refratariedade a volume · Ou congestão pulmonar associada à hipotensão"],
    ["Quais medidas compõem a abordagem do choque cardiogênico?", "Monitorização hemodinâmica · Dobutamina · Vasopressores como dopamina/noradrenalina · Reposição volêmica quando choque misto"],
    ["Quais medidas reduziram mortalidade no choque cardiogênico segundo o texto?", "Balão intra-aórtico · Angioplastia primária"],
    ["O que caracteriza aneurisma ventricular pós-IAM?", "Discinesia permanente após organização/cicatrização · Mais comum na parede anterior septo-apical · Predispõe a IC, arritmia ventricular e trombo mural"],
    ["Como se manifesta IM aguda por ruptura de músculo papilar?", "IAM inferior pode romper papilar posterior; anterior, o anterior · IVE aguda/EAP · Sopro e frêmito mitral irradiados para axila ou dorso"],
    ["Qual conduta na IM aguda por ruptura de músculo papilar?", "Estabilizar se possível com dobutamina + nitroprussiato em baixa dose · Cirurgia urgente e precoce, mesmo se estabilizar"],
    ["Como se apresenta a CIV pós-IAM?", "IC biventricular congestiva aguda · Sopro e frêmito sistólico na borda esternal esquerda baixa · Eco-Doppler confirma · Cirurgia precoce"],
    ["Como se apresenta ruptura da parede livre do VE?", "Choque súbito + hemopericárdio e tamponamento · Evolui rapidamente para AESP e óbito · Tratamento cirúrgico precoce"],
    ["Como diferenciar pseudoaneurisma de aneurisma verdadeiro pós-IAM?", "Pseudoaneurisma é ruptura ventricular contida por trombo, hematoma e pericárdio · Não há tecido miocárdico na parede"],
    ["O que é pericardite epistenocárdica?", "Pericardite fibrinosa após IAM transmural · Ocorre do 2º ao 7º dia · Atrito pericárdico é comum"],
    ["Como tratar pericardite na fase aguda pós-IAM?", "AAS em dose anti-inflamatória · AINE e corticoide são contraindicados na fase aguda e até quatro semanas por efeito no remodelamento"],
    ["O que caracteriza Dressler?", "Pleuropericardite autoimune na convalescença, 1–8 semanas após IAM · Febre, mal-estar, leucocitose e VHS elevado · AAS anti-inflamatório nas primeiras quatro semanas"]
  ]),

  deck("cardio-pericardiopatias", "Pericardiopatias · pericardite, tamponamento e constrição", [
    ["Como é a dor da pericardite aguda?", "Precordial/retroesternal contínua e prolongada · Irradia para pescoço/trapézio · Pleurítica · Piora em decúbito e melhora sentado inclinado para frente"],
    ["Qual achado patognomônico de pericardite aguda?", "Atrito pericárdico · Som áspero, geralmente sisto-diastólico · Melhor na borda esternal esquerda baixa com paciente inclinado para frente"],
    ["Qual padrão clássico de ECG na pericardite aguda?", "Supra de ST côncavo em várias derivações · T positiva/apiculada · Frequentemente infra de PR · Geralmente poupa V1 e aVR"],
    ["Como o ECG de pericardite difere do IAM?", "ST com concavidade mantida · Infra de PR · Inversão de T apenas após ST retornar à linha de base · Ausência de onda Q de necrose"],
    ["A ausência de derrame ao ecocardiograma exclui pericardite?", "Não · O mais comum é não haver derrame ou ele ser leve"],
    ["Qual tratamento de primeira linha na pericardite viral ou idiopática?", "AINE, como ibuprofeno/indometacina, associado à colchicina · AINE enquanto sintomas · Colchicina geralmente por três meses após suspender AINE"],
    ["Como tratar pericardite refratária a AINE + colchicina?", "Prednisona em dose anti-inflamatória de 0,25–0,5 mg/kg/dia"],
    ["Como manejar anticoagulação na pericardite aguda?", "Contraindicada na fase sintomática pelo risco de hemopericárdio e tamponamento · Se imprescindível, preferir heparina venosa internado pela reversão com protamina"],
    ["O que define tamponamento cardíaco?", "Queda importante do débito cardíaco por enchimento ventricular prejudicado pelas altas pressões intrapericárdicas"],
    ["Qual contexto favorece tamponamento?", "Acúmulo rápido de líquido, sobretudo denso · Sangue ou pus elevam muito o risco"],
    ["O que é pulso paradoxal no tamponamento?", "Queda inspiratória da PA sistólica > 10 mmHg e/ou redução detectável da amplitude do pulso"],
    ["Como pesquisar pulso paradoxal com esfigmomanômetro?", "Diferença > 10 mmHg entre a pressão em que Korotkoff surge só na expiração e aquela em que é audível em ambas as fases respiratórias"],
    ["Quais achados clínicos sugerem tamponamento?", "Turgência jugular patológica · Pulso paradoxal · Taquicardia · Hipotensão é sinal de gravidade"],
    ["O que compõe a tríade de Beck?", "Hipotensão arterial · Bulhas hipofonéticas · Turgência jugular patológica · Sinaliza tamponamento grave e risco iminente de vida"],
    ["Qual sinal ecocardiográfico mais específico de tamponamento?", "Colapso diastólico do ventrículo direito · Pode anteceder manifestações clínicas"],
    ["Como tratar tamponamento com hipotensão?", "Reposição volêmica e, às vezes, dobutamina enquanto prepara remoção do líquido · Pericardiocentese imediata no tamponamento fulminante"],
    ["Qual achado venoso diferencia constritiva de tamponamento?", "Constritiva: descenso Y proeminente · Tamponamento: descenso Y ausente ou reduzido"],
    ["Qual mecanismo e achado venoso da pericardite constritiva?", "Pericárdio rígido limita enchimento diastólico · Pulso venoso em W ou M · Curva ventricular em raiz quadrada"],
    ["Quais marcos clínicos da pericardite constritiva?", "Congestão sistêmica com turgência jugular, hepatomegalia, ascite e edema · Sinal de Kussmaul · Knock pericárdico"],
    ["O que é sinal de Kussmaul?", "Aumento ou ausência de redução da pressão venosa jugular durante a inspiração · Decorre de restrição ao retorno venoso direito"],
    ["Qual tratamento definitivo da pericardite constritiva?", "Pericardiectomia · Deve ser realizada precocemente antes de ICC refratária e caquexia"]
  ]),

  deck("cardio-revasc", "Revascularização e aterosclerose · pérolas essenciais", [
    ["Onde a aterosclerose costuma se desenvolver preferencialmente?", "Bifurcações arteriais, por maior turbilhonamento e estresse mecânico · Também em porções proximais de artérias de médio calibre"],
    ["Qual mecanismo inicial central da aterosclerose?", "LDL retida na íntima sofre oxidação · Aumenta moléculas de adesão e quimiotaxia · Recruta monócitos e linfócitos T"],
    ["Como surgem células espumosas e cerne necrótico?", "Monócitos tornam-se macrófagos e endocitam LDL oxidada · Células espumosas acumulam-se · Sua apoptose forma cerne necrótico rico em lipídios"],
    ["O que diferencia estria gordurosa de placa de ateroma?", "Placa possui tecido fibroso envolvendo o cerne lipídico · É uma lesão fibrolipídica com células"],
    ["Qual papel das células musculares lisas na placa?", "Migra da média para íntima sob ação de citocinas/fatores de crescimento · Sintetiza colágeno e forma a capa fibrótica"],
    ["Como ocorre instabilidade de placa?", "Macrófagos ativados liberam metaloproteinases · Capa fibrótica afina e degrada · Rotura expõe conteúdo trombogênico e leva à trombose"],
    ["Quais são as consequências clínicas da aterosclerose?", "Obstrução gradual do lúmen · Fraqueza da parede e aneurisma · Trombose da placa, principal causa de eventos mórbidos"],
    ["O que é CRVM?", "By-pass que desvia fluxo da aorta e seus ramos para região distal à obstrução · A lesão permanece, mas o miocárdio isquêmico é perfundido"],
    ["Qual configuração-padrão da CRVM?", "Mamária interna esquerda para descendente anterior · Múltiplas pontes de safena para as demais coronárias conforme necessidade"],
    ["Qual enxerto é preferível para revascularizar a DA?", "Artéria mamária interna esquerda · Menos recorrência de angina e maior sobrevida em longo prazo que safena"],
    ["Quando CRVM é superior à ICP por ganho de sobrevida?", "Estenose ≥ 50% de tronco de coronária esquerda ou tronco equivalente · Doença trivascular com disfunção sistólica de VE"],
    ["Em quais outros cenários o texto favorece CRVM?", "Estenose > 50% em múltiplos vasos com FE < 50% ou diabetes · Lesão sem possibilidade técnica de ICP · SYNTAX > 22, especialmente ≥ 33"],
    ["Como SYNTAX orienta a escolha entre CRVM e ICP?", "≤ 22: resultados longos semelhantes, favorece ICP pela menor morbidade de curto prazo · > 22, sobretudo ≥ 33: CRVM reduz nova revascularização"],
    ["Por que não revascularizar artéria levemente obstruída sem isquemia?", "Há risco de oclusão do enxerto e aterosclerose acelerada no vaso nativo"],
    ["Como prevenir obstrução após CRVM?", "Estatinas têm maior impacto na proteção das pontes · AAS ad aeternum · Clopidogrel se intolerância ao AAS · Tratar tabagismo agressivamente"],
    ["Como é a patência de safena versus mamária após 10 anos?", "Cerca de 50% das safenas estão ocluídas · Cerca de 85% das mamárias permanecem patentes"],
    ["Quais mecanismos de oclusão da safena variam com o tempo?", "Precoce: trombose · Intermediário: hiperplasia da íntima · Tardio: aterosclerose acelerada"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-cardio.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];

if (!Array.isArray(existing)) {
  throw new Error("flashcards-cardio.json deve conter um array");
}

const ids = new Set(decks.map(d => d.id));
const merged = existing.filter(d => !ids.has(d.id)).concat(decks);

fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");

const total = decks.reduce((sum, item) => sum + item.cards.length, 0);
console.log(`Cardio1: ${decks.length} decks · ${total} cards`);
for (const item of decks) console.log(`${item.id}: ${item.cards.length}`);
