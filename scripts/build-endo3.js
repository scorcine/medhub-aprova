/**
 * Flashcards Endocrinologia · End3
 * Fonte exclusiva: data/_extract_endo/End3-full.txt · capítulos 1–3 e apêndices.
 */
const fs = require("fs");
const path = require("path");

const deck = (id, name, cards) => ({
  id,
  name,
  specialty: "clinica",
  cards: cards.map(([front, back]) => ({ front, back }))
});

const newDecks = [
  deck("endo-dm-basico", "Diabetes mellitus · bases e diagnóstico", [
    ["DM1 × DM2 — mecanismo predominante?", "DM1 · destruição primária das células beta com hipoinsulinismo absoluto · DM2 · resistência periférica à insulina e déficit secretório progressivo da célula beta"],
    ["DM1 — quadro clínico clássico?", "Início geralmente agudo · criança ou adolescente com poliúria, polidipsia, polifagia e emagrecimento · pode manifestar-se com cetoacidose diabética"],
    ["DM2 — apresentação clínica habitual?", "Curso frequentemente assintomático por anos · adulto em geral obeso e sedentário · o diagnóstico pode ocorrer quando já há lesão de órgão-alvo"],
    ["LADA — como se apresenta?", "Diabetes autoimune do adulto · evolução insidiosa ao longo de anos e possível confusão com DM2 · posteriormente instala-se hipoinsulinismo absoluto, com polis ou CAD"],
    ["MODY — padrão que o distingue do DM2 típico?", "Defeito monogênico autossômico dominante que altera a secreção de insulina · início precoce em crianças ou adolescentes · geralmente sem obesidade e com várias gerações acometidas"],
    ["Diagnóstico de DM — critérios laboratoriais?", "HbA1c ≥ 6,5% · glicemia de jejum ≥ 126 mg/dL · glicemia 2 h após TOTG-75 ≥ 200 mg/dL · glicemia aleatória ≥ 200 mg/dL com sintomas de hiperglicemia"],
    ["Diagnóstico de DM sem hiperglicemia inequívoca — como confirmar?", "Repetir o teste alterado em segunda dosagem · dois testes diferentes concordantes na mesma amostra confirmam · se discordantes, repetir o exame alterado"],
    ["Pré-diabetes — valores de jejum, TOTG e HbA1c?", "Glicemia de jejum alterada · 100–125 mg/dL · TOTG-75 após 2 h · 140–199 mg/dL · HbA1c · 5,7–6,4%"],
    ["TOTG-75 — utilidade na glicemia de jejum alterada?", "Pode revelar DM não detectado · glicemia de 2 h ≥ 200 mg/dL · é especialmente útil quando a glicemia de jejum não fecha o diagnóstico"],
    ["HbA1c — o que representa e qual a meta geral?", "Glicosilação não enzimática irreversível da hemoglobina pela hiperglicemia sustentada · estima a glicemia média dos últimos 3 meses · meta geral < 7%"],
    ["HbA1c — por que não substitui a glicemia capilar?", "É uma média das glicemias · pode permanecer normal com alternância entre hipo e hiperglicemias · glicemia capilar informa o valor atual"],
    ["HbA1c — situações de falsa elevação?", "Insuficiência renal crônica · hipertrigliceridemia · álcool · esplenectomia · deficiência de ferro · toxicidade por chumbo ou opiáceos"],
    ["HbA1c — situações de falsa diminuição?", "Redução da meia-vida das hemácias · perda sanguínea ou transfusão recente · gravidez ou parto recente · altas doses de vitaminas C ou E · hemoglobinopatias"],
    ["Frutosamina — quando pode ser alternativa à HbA1c?", "Quando condições alteram a HbA1c · reflete níveis glicêmicos das últimas 1–2 semanas por acompanhar principalmente a albumina"],
    ["Rastreio de DM2 em adulto assintomático — indicações do texto?", "Qualquer pessoa a partir de 35 anos · ou sobrepeso com ao menos um fator de risco · pré-diabetes exige rastreio anual"]
  ]),
  deck("endo-dm-tratamento", "Diabetes mellitus · tratamento", [
    ["DM2 — pilares iniciais do tratamento?", "Modificações do estilo de vida · orientação nutricional, atividade física e redução ponderal · metformina para a maioria sem contraindicação"],
    ["Metformina — três mecanismos principais?", "Inibe gliconeogênese hepática · melhora sensibilidade periférica à insulina · reduz turnover de glicose no leito esplâncnico"],
    ["Metformina — efeito sobre peso e hipoglicemia em monoterapia?", "Não estimula secreção de insulina · não aumenta o peso e pode contribuir para reduzi-lo · não aumenta as chances de hipoglicemia isoladamente"],
    ["Metformina — efeitos adversos e como reduzi-los?", "Náuseas, vômitos, diarreia, anorexia e gosto metálico · começar com dose baixa e aumentar progressivamente · administrar com alimentação"],
    ["Metformina — contraindicação renal destacada?", "TFG estimada < 30 mL/min · risco de acidose láctica grave"],
    ["Metformina no pré-diabetes — quando considerar?", "Muito alto risco · IMC ≥ 35 · idade < 60 anos · glicemia de jejum > 110 mg/dL · história de diabetes gestacional"],
    ["Tiazolidinedionas — ação e característica da pioglitazona?", "Aumentam a ação periférica da insulina, especialmente no músculo · pioglitazona pode ser usada isolada ou associada · seu efeito demora semanas por interferir na expressão gênica"],
    ["Pioglitazona — efeitos relevantes descritos?", "Tende a reduzir triglicerídeos e aumentar HDL · pode elevar risco de fraturas em mulheres pré e pós-menopausadas · exige monitorização de aminotransferases"],
    ["Sulfonilureias — mecanismo e requisito para funcionar?", "Secretagogos que estimulam a liberação de insulina formada · necessitam de células beta funcionantes · exemplos incluem glibenclamida, glimepirida e gliclazida"],
    ["Sulfonilureias — efeitos adversos principais?", "Ganho de peso · hipoglicemia, por vezes grave e fatal · risco maior em idosos, alcoólatras, desnutridos, nefropatas e hepatopatas"],
    ["Inibidores da DPP-4 — mecanismo?", "Inibem seletivamente a DPP-4 · essa enzima inativa o GLP-1 · preservam a ação incretínica"],
    ["Agonistas de GLP-1 — efeitos metabólicos?", "Aumentam insulina de modo glicose-dependente · inibem glucagon e a produção hepática de glicose · retardam esvaziamento gástrico e favorecem saciedade e perda ponderal"],
    ["Inibidores de SGLT2 — mecanismo e benefícios?", "Bloqueiam reabsorção de glicose no túbulo proximal e aumentam glicosúria · reduzem morbimortalidade cardiovascular · reduzem evolução da doença renal crônica"],
    ["iSGLT2 — efeitos adversos importantes?", "Maior incidência de infecção urinária e candidíase vulvovaginal · pode ocorrer cetoacidose euglicêmica · canagliflozina teve sinal de maior risco de amputação e fraturas"],
    ["Insulina no DM2 — quando e como iniciar segundo o texto?", "Indicada na falência da terapia oral com HbA1c > 7% apesar de terapia dupla ou tripla · adicionar NPH noturna ou glargina/detemir · manter sensibilizadores como metformina e suspender sulfonilureias/glinidas em esquema de múltiplas doses"],
    ["DM tipo 1 — o que é o esquema basal-bolus?", "Basal (NPH, detemir, glargina ou degludec) substitui a liberação lenta · Bolus pré-refeição (regular ou preferencialmente lispro/aspart/glulisina) simula o pico pós-prandial · Reproduz a fisiologia porque não há insulina endógena"],
    ["Insulina regular × análogos ultrarrápidos — timing antes da refeição?", "Regular · 30–45 min antes · Lispro, aspart ou glulisina · 15 min antes ou na hora da refeição · Análogos: mais comodidade e menor risco de hipoglicemia"]
  ]),
  deck("endo-dm-cronicas", "Diabetes mellitus · complicações crônicas", [
    ["HbA1c persistentemente > 7% — quais complicações têm risco aumentado?", "Complicações microvasculares · retinopatia · nefropatia · neuropatia"],
    ["Retinopatia diabética não proliferativa — achado inicial típico?", "Microaneurismas por lesão endotelial da microvasculatura retiniana · vistos na fundoscopia como pequenos pontos vermelhos"],
    ["Retinopatia diabética proliferativa — mecanismo e risco visual?", "Isquemia retiniana aumenta fatores de crescimento como VEGF · causa neovascularização · neovasos podem estender-se ao vítreo, fibrosar e tracionar a retina"],
    ["Retinopatia — fatores principais de aparecimento e progressão?", "Tempo de evolução do DM · mau controle glicêmico · HAS, nefropatia, puberdade, gravidez e dislipidemia também influenciam"],
    ["Rastreio de retinopatia — DM1 × DM2?", "DM1 · após 3–5 anos de doença · DM2 · fundoscopia no momento do diagnóstico · sem retinopatia, repetir anualmente"],
    ["Retinopatia com edema macular — tratamento citado?", "Anti-VEGF intraocular · fotocoagulação a laser localizada em refratários ou não aderentes · proliferativa indica fotocoagulação panretiniana"],
    ["Nefropatia diabética — sequência clássica?", "Hiperfiltração glomerular · espessamento da membrana basal e expansão mesangial · microalbuminúria · proteinúria franca · insuficiência renal progressiva · fase urêmica"],
    ["Microalbuminúria — definição e detecção?", "30–300 mg de albumina em urina de 24 h · em amostra aleatória, relação albumina/creatinina > 30 mcg/mg ou mg/g"],
    ["Macroalbuminúria — valor e consequência esperada?", "> 300 mg/24 h · queda gradual da TFG em média de 12 mL/min/ano"],
    ["Rastreio de nefropatia — DM1 × DM2?", "DM1 · após 5 anos de doença · DM2 · no momento do diagnóstico · medir excreção urinária de albumina e creatinina sérica para estimar TFG"],
    ["DRD com albuminúria — tratamento de escolha?", "Controle glicêmico e da albuminúria · IECA ou antagonista da angiotensina II mesmo sem hipertensão · monitorar escórias nitrogenadas e calemia"],
    ["DRD no DM2 — papel dos iSGLT2 e GLP-1?", "Com ClCr > 20–30 mL/min/1,73 m², preferir iSGLT2 para reduzir progressão renal e eventos cardiovasculares · agonista GLP-1 se iSGLT2 for contraindicado ou intolerável, com ClCr > 15"],
    ["Polineuropatia diabética distal — características e exame precoce?", "Forma mais comum · inicia distalmente nos membros inferiores · pode causar hipoestesia plantar e perda do reflexo aquileu · monofilamento é o exame de maior acurácia precoce"],
    ["Neuropatia periférica dolorosa — padrão dos sintomas?", "Parestesias, disestesias, dor neuropática ou hiperpatia · geralmente plantar · dor em queimação piora à noite e pode melhorar com a deambulação"],
    ["Neuropatia autonômica — manifestações frequentes?", "Disfunção sexual e tontura postural · náuseas, vômitos e plenitude pós-prandial por gastroparesia · constipação ou diarreia noturna · hipoglicemia despercebida"]
  ]),
  deck("endo-dm-agudas", "Diabetes mellitus · complicações agudas", [
    ["CAD — tríade diagnóstica e perfil típico?", "Hiperglicemia · cetonemia · acidose metabólica com ânion-gap elevado · é a complicação aguda mais grave do DM1"],
    ["CAD — mortalidade com e sem tratamento?", "Em torno de 100% sem tratamento · cerca de 5% quando adequadamente tratada"],
    ["CAD — corpos cetônicos principais?", "Beta-hidroxibutirato · acetoacetato · acetona, eliminada na respiração e relacionada ao hálito cetônico"],
    ["CAD — por que a cetonúria não serve para acompanhar a resolução?", "O nitroprussiato detecta acetoacetato e acetona, não o beta-hidroxibutirato predominante · durante o tratamento há conversão para acetoacetato, podendo piorar paradoxalmente a cetonúria"],
    ["CAD — precipitantes frequentes?", "Infecção, especialmente pneumonia, ITU e gastroenterite · omissão ou doses inadequadas de insulina · DM de início recente · IAM em idosos"],
    ["CAD — primeira medida de maior impacto?", "Reposição volêmica imediata · SF 0,9% · cerca de 1.000 mL na primeira hora"],
    ["CAD — ajuste da salina após a fase inicial?", "Sódio corrigido normal ou alto · SF 0,45% · sódio baixo · manter SF 0,9% · ajustar velocidade conforme necessidades"],
    ["CAD — quando iniciar insulina e meta de queda glicêmica?", "Somente com reposição volêmica em curso · insulina regular IV com alvo de queda de 50–75 mg/dL/h · evitar queda > 100 mg/dL/h"],
    ["CAD com K < 3,3 mEq/L — conduta?", "Não iniciar insulina · repor 40 mEq de potássio"],
    ["CAD — reposição de potássio conforme valor sérico?", "K < 3,3 · 40 mEq · K entre 3,3 e < 5 · adicionar 20–30 mEq por soro · K ≥ 5 · não administrar inicialmente e checar a cada 2 h"],
    ["CAD — quando adicionar SG 5%?", "Quando glicemia atingir 200–250 mg/dL · associar SG 5% com NaCl 0,45% · manter glicemia entre 150–200 mg/dL até resolver a CAD"],
    ["CAD — critérios de resolução e transição SC?", "pH > 7,3 · bicarbonato > 18 mEq/L · glicemia < 200 mg/dL · suspender insulina IV apenas 1–2 h após a dose subcutânea"],
    ["CAD — quando usar bicarbonato no adulto?", "Apenas quando pH < 6,9 · entre 6,9 e 7,1 não houve benefício demonstrado · pode causar hipocalemia, arritmias e acidose liquórica paradoxal"],
    ["EHH — perfil, critérios ADA e mortalidade?", "Geralmente idoso com DM2 · glicose > 600 mg/dL, pH > 7,3, HCO3 > 18 e osmolalidade efetiva > 320 mOsm/kg · mortalidade de 10–17%"],
    ["EHH — conduta inicial essencial?", "Reposição hídrica vigorosa antes da insulina · insulina sem corrigir o déficit hidroeletrolítico pode causar colapso vascular imediato"]
  ]),
  deck("endo-hipoglicemia", "Hipoglicemia", [
    ["Hipoglicemia no DM — causas precipitantes comuns?", "Omissão ou atraso de refeições · excesso de insulina ou hipoglicemiante oral · exercício imprevisto · álcool, falência renal e hepática podem predispor"],
    ["Hipoglicemia — definição bioquímica usual e categoria sintomática documentada?", "Usualmente glicose < 50–54 mg/dL · sintomática documentada quando há sintomas com glicemia < 70 mg/dL"],
    ["Hipoglicemia grave — definição?", "Evento que requer auxílio de outra pessoa para administrar carboidrato ou glucagon · pode haver convulsão, alteração comportamental ou coma"],
    ["Hipoglicemia relativa — mecanismo?", "Sintomas com glicemia > 70 mg/dL · ocorre em paciente com controle inadequado após queda brusca e acentuada da glicemia"],
    ["Hipoglicemia — sintomas adrenérgicos?", "Sudorese · tremor · taquicardia · ansiedade · fome"],
    ["Hipoglicemia — manifestações neuroglicopênicas?", "Cefaleia · vertigem · escurecimento visual · confusão mental · convulsão · coma · pode haver déficit focal reversível"],
    ["Contrarregulação fisiológica — marcos glicêmicos?", "< 85 mg/dL reduz secreção de insulina · < 70 aumenta hormônios contrarreguladores · < 55 surgem sintomas · < 35 pode ocorrer disfunção cognitiva, convulsão e coma"],
    ["Hipoglicemia no hospital — conduta imediata?", "Coletar glicemia e administrar 25–50 g de glicose IV · corresponde a 50–100 mL de glicose a 50%"],
    ["Hipoglicemia em etilismo crônico ou desnutrição — cuidado antes da glicose?", "Administrar tiamina antes da glicose IV · visa evitar precipitação de encefalopatia de Wernicke"],
    ["Hipoglicemia extra-hospitalar com inconsciência — conduta?", "Glucagon IM ou SC · 1 mg no adulto e 0,5 mg na criança · costuma restaurar a consciência em 10–15 min · depois ingerir açúcar"],
    ["Hipoglicemia por NPH excessiva ou hipoglicemiante oral — por que vigiar?", "Pode recorrer após o bolo de glicose · manter SG 10% e monitorização estreita por ao menos 24 h"],
    ["Falência autonômica diabética — relação com hipoglicemia?", "Redução da contrarregulação hormonal, sobretudo epinefrina · episódios repetidos podem ocorrer sem sinais de alerta · causa hipoglicemia despercebida"],
    ["Hipoglicemia — complicação frequente de qual tratamento?", "É a complicação mais frequente do tratamento do DM · é também a causa mais comum de coma nesses pacientes"],
    ["Efeito Somogyi — mecanismo?", "Hiperglicemia matinal de rebote por hormônios contrarreguladores · resposta a hipoglicemia de madrugada, habitualmente por dose alta de NPH noturna"],
    ["Efeito Somogyi — como a glicemia das 3 h ajuda?", "Hipoglicemia às 3 h sugere efeito Somogyi · a conduta é reduzir a NPH noturna ou mudar sua administração para antes de dormir"]
  ]),
  deck("endo-pe-diabetico", "Pé diabético", [
    ["Pé diabético — definição?", "Infecção, ulceração e/ou destruição de tecidos profundos associadas a alterações neurológicas e doença arterial periférica · resulta de neuropatia e vasculopatia, com ou sem infecção"],
    ["Pé diabético — dados epidemiológicos destacados?", "80–90% das úlceras são desencadeadas por trauma externo · 85% das amputações são precedidas por úlceras · 10–15% das úlceras são puramente isquêmicas"],
    ["Pulso pedioso palpável em pé diabético — o que sugere?", "A causa desencadeante da lesão provavelmente é neurológica · e não predominantemente vascular"],
    ["Neuropatia no pé diabético — como favorece úlceras?", "Perda de sensibilidade impede perceber calos ou feridas · neuropatia autonômica causa anidrose, fissuras e rachaduras · perda proprioceptiva concentra pressão na região tenar"],
    ["Pé neuropático — por que pode evoluir de forma silenciosa?", "Úlceras plantares podem ser indolores · fissura pelo sapato ou calosidade pode passar despercebida e evoluir para úlcera e infecção"],
    ["Wagner 0, I e II — classificação?", "0 · neuropatia e/ou isquemia sem úlcera · I · úlcera superficial · II · úlcera profunda sem abscesso e sem osteomielite"],
    ["Wagner III, IV e V — classificação?", "III · úlcera profunda com celulite, abscesso, possível osteomielite e gangrena subcutânea · IV · gangrena úmida localizada em pododáctilo · V · gangrena úmida de todo o pé"],
    ["Úlcera diabética infectada — sinais clínicos?", "Secreção purulenta · odor forte · celulite nas bordas da úlcera"],
    ["Infecção leve do pé diabético — cobertura empírica?", "Infecção superficial e leve · cobertura para bactérias Gram-positivas"],
    ["Infecção profunda e ameaçadora ao membro — conduta?", "Antibioticoterapia de amplo espectro · desbridamento cirúrgico do tecido desvitalizado"],
    ["Pé diabético — diagnóstico de osteomielite?", "Ressonância magnética é o melhor exame · probe que alcança o osso torna o diagnóstico praticamente certo"],
    ["Pé diabético — quando a amputação é necessária?", "Sempre necessária · graus IV e V da classificação de Wagner"],
    ["Neuropatia distal — achado que aumenta risco de pé diabético?", "Perda de sensibilidade no monofilamento · identifica risco de úlcera plantar indolor, infecção e gangrena úmida"],
    ["Prevenção — cuidados diários com os pés?", "Examinar os pés diariamente · não andar descalço · enxugar entre os dedos · inspecionar o interior dos sapatos"],
    ["Prevenção — o que evitar?", "Água quente · calçados apertados, de bico fino ou sola dura · deambular descalço"]
  ]),
  deck("endo-obesidade", "Obesidade · visão clínica", [
    ["IMC — fórmula e definição de obesidade?", "IMC = peso em kg / altura em m² · obesidade quando IMC ≥ 30 kg/m²"],
    ["Sobrepeso × peso ideal — faixas de IMC?", "Sobrepeso · 25–29,9 kg/m² · peso ideal · 18,5–24,9 kg/m²"],
    ["Risco clínico conforme IMC — como evolui?", "Eleva-se a partir de 25 kg/m² · acima de 30 kg/m² aumenta em progressão geométrica · grau I traz risco alto e graus II/III risco muito alto ou extremo"],
    ["Cintura — valores da OMS para caucasianos associados a risco aumentado?", "Homens · ≥ 94 cm · mulheres · ≥ 80 cm · a gordura visceral se relaciona fortemente ao risco cardiovascular"],
    ["IMC — limitações?", "Não distingue gordura de massa magra · não reflete distribuição de gordura · pode subestimar gordura visceral · varia entre populações"],
    ["Obesidade primária × secundária — frequência e exemplos?", "Primária · 95–99%, sem causa exata conhecida · secundária · 1–5%, como Cushing, hipotireoidismo, insulinoma, SOP ou medicamentos"],
    ["Leptina × grelina — efeitos sobre apetite?", "Leptina produzida nos adipócitos inibe apetite e ativa saciedade · grelina do estômago e duodeno aumenta apetite"],
    ["Tratamento da obesidade — metas e pilares?", "Perda de 5–10% do peso em 6 meses · cerca de 0,5–1 kg/semana · dieta hipocalórica, exercício regular e terapia comportamental"],
    ["Farmacoterapia da obesidade — critérios?", "IMC ≥ 30 kg/m² · ou IMC ≥ 27 kg/m² com comorbidades · após falha em perder peso com tratamento não farmacológico"],
    ["Orlistate — mecanismo?", "Inibe irreversivelmente as lipases pancreáticas · reduz a quebra e absorção dos triglicerídeos"],
    ["Orlistate — efeitos adversos principais?", "Diarreia · esteatorreia · urgência fecal"],
    ["Liraglutida em alta dose — efeito e efeitos adversos?", "Favorece perda ponderal por bloquear neuropeptídeo Y · náuseas e vômitos são comuns"],
    ["Obesidade — papel das MEV antes de fármacos?", "São a base do tratamento · incluem dieta, exercício e terapia comportamental · fármacos são considerados após falha da abordagem não farmacológica"],
    ["Cirurgia bariátrica no adulto — critérios do texto?", "IMC ≥ 40 kg/m² · ou IMC ≥ 35 kg/m² com ao menos uma comorbidade · falha do tratamento clínico após 2 anos · obesidade grave há mais de 5 anos"],
    ["Obesidade visceral — relevância clínica?", "Relaciona-se fortemente ao risco cardiovascular · o IMC isolado pode não captá-la adequadamente"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-endo.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
const byId = new Map(existing.map(item => [item.id, item]));

newDecks.forEach(item => byId.set(item.id, item));

fs.writeFileSync(out, JSON.stringify(Array.from(byId.values()), null, 2) + "\n", "utf8");
console.log(`wrote ${out} · ${newDecks.length} End3 decks · ${newDecks.reduce((n, item) => n + item.cards.length, 0)} cards`);
newDecks.forEach(item => console.log(`${item.id} · ${item.cards.length} cards`));
