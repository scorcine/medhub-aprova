/**
 * Flashcards Hematologia · Hem2
 * Fonte exclusiva: data/_extract_hemato/Hem2-full.txt
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "hema-lma", name: "LMA · diagnóstico · urgências", specialty: "clinica",
    cards: [
      { front: "Leucemia aguda: qual é o marco fisiopatológico?", back: "Acúmulo de blastos por bloqueio da maturação · A ocupação medular suprime a hematopoiese normal" },
      { front: "LMA: contexto epidemiológico que sugere o diagnóstico?", back: "É a leucemia aguda mais comum · Sua incidência aumenta com a idade · Em adulto com leucemia aguda, LMA é a hipótese mais provável" },
      { front: "LMA: bastonetes de Auer indicam o quê?", back: "São inclusões eosinofílicas em agulha patognomônicas de LMA · Podem estar presentes nos subtipos M1, M2, M3 e M4" },
      { front: "LMA: quais marcadores definem origem mieloide?", back: "CD13 · CD14 · CD33 · CD34 é marcador de célula-tronco e confere pior prognóstico" },
      { front: "LMA: tríade de apresentação pela insuficiência medular?", back: "Astenia · Hemorragia · Febre" },
      { front: "LMA M4/M5: quais achados infiltrativos e laboratoriais chamam atenção?", back: "Hiperplasia gengival é comum · Hiperleucocitose e leucostase são mais frequentes · Lisozima elevada pode causar lesão tubular renal" },
      { front: "LMA: hemograma e esfregaço típicos?", back: "Anemia + plaquetopenia com leucometria variável · Blastos costumam estar na periferia · Leucocitose por blastos não exclui neutropenia funcional" },
      { front: "LMA: como confirmar e tipar?", back: "Mielograma com ≥20% de blastos entre células nucleadas · Morfologia, citoquímica, citometria de fluxo, cariótipo/FISH e RT-PCR" },
      { front: "Quando a OMS aceita LMA com menos de 20% de blastos?", back: "Na presença de sarcoma mieloide ou das alterações t(8;21), inv(16) e t(15;17)" },
      { front: "LMA-M3: genética e complicação principal?", back: "t(15;17) · Fusão PML-RARα · Promielócitos secretam fatores pró-coagulantes e causam CIVD" },
      { front: "LMA-M3: terapia específica e efeito do ATRA?", back: "ATRA/tretinoína + antraciclina · ATRA induz maturação dos promielócitos e a CIVD melhora em média após três dias" },
      { front: "Leucostase na LMA: quadro e manejo?", back: "Hiperleucocitose por blastos causa sintomas neurológicos, hipoxemia, IRA ou priapismo · Quimioterapia ou hidroxiureia · Leucoaférese se QT não puder iniciar de imediato" }
    ]
  },
  {
    id: "hema-lla", name: "LLA · infância · tratamento", specialty: "clinica",
    cards: [
      { front: "LLA: epidemiologia pediátrica?", back: "Leucemia mais comum da infância e câncer mais comum na criança · Pico entre 2–10 anos, máximo aos quatro anos" },
      { front: "LLA: origem B versus T?", back: "Cerca de 80% são de linhagem B · Cerca de 20% são de linhagem T" },
      { front: "LLA: quais manifestações a distinguem da LMA?", back: "Dor óssea frequente · Adenomegalia mais comum · Massa mediastinal na linhagem T · Maior acometimento de SNC e testículos" },
      { front: "LLA: critério diagnóstico na medula?", back: "Linfoblastos ≥20% das células nucleadas da medula óssea" },
      { front: "LLA FAB: como lembrar L1, L2 e L3?", back: "L1 predomina na criança e tem melhor prognóstico · L2 predomina no adulto · L3 é a forma leucêmica do linfoma de Burkitt" },
      { front: "LLA T: apresentação típica?", back: "Massa mediastinal por origem tímica · Clone neoplásico é idêntico ao do linfoma linfoblástico" },
      { front: "LLA: quatro fases clássicas da quimioterapia?", back: "Indução da remissão · Consolidação pós-remissão · Manutenção · Profilaxia do SNC" },
      { front: "LLA: finalidade e esquema da pré-fase?", back: "Reduz inicialmente a massa tumoral e o risco de lise tumoral · Vincristina ou ciclofosfamida associada a corticoide por 5–7 dias" },
      { front: "LLA infantil favorável: indução padrão?", back: "Corticosteroide + vincristina + L-asparaginase por quatro semanas · Acrescentar antraciclina no adulto ou prognóstico desfavorável" },
      { front: "LLA: manutenção?", back: "6-mercaptopurina + metotrexato · Tratamento total por 2–3 anos" },
      { front: "Por que a LLA exige profilaxia do SNC?", back: "O SNC é santuário para linfoblastos porque a QT de indução e consolidação não atravessa a barreira hematoencefálica · MTX intratecal" },
      { front: "LLA: fatores de maior peso para mau prognóstico?", back: "Idade <1 ano ou >10 anos · Hiperleucocitose · Cromossomo Philadelphia/t(9;22)" }
    ]
  },
  {
    id: "hema-lmc", name: "LMC · BCR-ABL · fases", specialty: "clinica",
    cards: [
      { front: "LMC: alteração genética definidora?", back: "Cromossomo Philadelphia t(9;22) · Fusão BCR-ABL codifica a tirosina-quinase P210" },
      { front: "LMC: mecanismo celular?", back: "Clone de célula-tronco mantém maturação até células maduras, sobretudo granulocíticas · Não há bloqueio de maturação" },
      { front: "LMC: marco clínico-laboratorial?", back: "Leucocitose neutrofílica acentuada com desvio à esquerda + esplenomegalia de grande monta" },
      { front: "LMC: hemograma característico?", back: "Anemia + hiperleucocitose + trombocitose · Eosinofilia e basofilia são típicas" },
      { front: "LMC versus reação leucemoide: quais pistas?", back: "LMC: BCR-ABL, esplenomegalia, basofilia e FAL leucocitária baixa · Reação: corpúsculos de Döhle, granulações tóxicas e FAL leucocitária alta" },
      { front: "Como confirmar LMC?", back: "Cariótipo da medula detecta Ph em cerca de 95% · Nos demais, FISH ou RT-PCR detectam BCR-ABL" },
      { front: "LMC: quais são as fases clínicas?", back: "Crônica · Acelerada · Blástica" },
      { front: "LMC: critérios de fase acelerada pela OMS?", back: "Incluem basofilia ≥20% ou blastos 10–19% · Também leucocitose/esplenomegalia progressivas refratárias, plaquetas extremas ou evolução citogenética" },
      { front: "LMC: critério de crise blástica pela OMS?", back: "Blastos ≥20% no sangue ou medula · Ou grandes agrupamentos medulares de blastos · Ou sarcoma mieloblástico" },
      { front: "LMC fase crônica: primeira linha?", back: "Imatinibe · Inibidor específico da tirosina-quinase codificada por BCR-ABL" },
      { front: "LMC: como se define resposta citogenética completa?", back: "0% de células Philadelphia positivas no estudo citogenético do aspirado medular · É o parâmetro mais associado a maior sobrevida" },
      { front: "LMC: o que fazer em falência ou intolerância ao imatinibe?", back: "Analisar mutação de BCR-ABL e trocar por TKI mais potente · Dasatinibe, nilotinibe, bosutinibe ou ponatinibe · Considerar transplante alogênico se falha aos TKI" }
    ]
  },
  {
    id: "hema-llc", name: "LLC · diagnóstico · estadiamento", specialty: "clinica",
    cards: [
      { front: "LLC: perfil epidemiológico?", back: "Acomete tipicamente idosos >60 anos · Predomínio masculino de 2:1 · Não acomete crianças" },
      { front: "LLC: célula de origem e fenótipo?", back: "Linfócito B maduro · CD19, CD20 e CD23 com CD5 positivo e FMC7 negativo" },
      { front: "LLC: marco clínico?", back: "Linfocitose acentuada + adenomegalia · A adenomegalia cervical está em dois terços das apresentações" },
      { front: "LLC: definição diagnóstica e esfregaço?", back: "Linfocitose persistente por ≥3 meses acima de 5.000/mm³ + imunofenótipo · Smudge cells ou manchas de Gumprecht são típicas" },
      { front: "LLC: por que ocorrem infecções bacterianas de repetição?", back: "Hipogamaglobulinemia pelo bloqueio de maturação em plasmócitos · Predisposição a S. pneumoniae e H. influenzae" },
      { front: "LLC: AHAI típica?", back: "Pode ocorrer em 10% · Coombs direto positivo por IgG quente · Instalação abrupta com icterícia indireta e reticulocitose" },
      { front: "LLC Rai: estágios 0, I e II?", back: "0: apenas linfocitose · I: linfadenopatia · II: hepato e/ou esplenomegalia" },
      { front: "LLC Rai: estágios III e IV?", back: "III: anemia não hemolítica com Hb <11 g/dL · IV: plaquetopenia <100.000/mm³" },
      { front: "LLC Binet: como diferenciar A, B e C?", back: "A: menos de três cadeias linfoides · B: três ou mais cadeias · C: Hb <10 g/dL ou plaquetas <100.000/mm³" },
      { front: "LLC: síndrome de Richter?", back: "Transformação em LNH agressivo, geralmente linfoma B difuso de grandes células · Ocorre em cerca de 5% dos casos" },
      { front: "LLC inicial Rai 0/I e assintomática: conduta?", back: "Watch and wait · Não há ganho de sobrevida com terapia precoce" },
      { front: "LLC: opções terapêuticas modernas?", back: "Inibidores de BTK: ibrutinibe ou acalabrutinibe · Inibidor de BCL2: venetoclax · Geralmente associados a anti-CD20" }
    ]
  },
  {
    id: "hema-pv", name: "Policitemia vera · JAK2 · trombose", specialty: "clinica",
    cards: [
      { front: "Policitemia vera: mutação e mecanismo?", back: "JAK2, encontrada em mais de 95% · Ativação constitutiva permite proliferação de progenitores eritroides sem eritropoetina" },
      { front: "PV: como fica a eritropoetina sérica?", back: "Baixa ou no limite inferior da normalidade · A eritrocitose reduz o estímulo para produção de EPO" },
      { front: "PV: quais critérios maiores da OMS 2016?", back: "Hb/Ht ou massa eritrocitária aumentada · Panmielose na biópsia medular · Mutação JAK2 V617F ou no éxon 12" },
      { front: "PV: qual é o critério menor da OMS 2016?", back: "Eritropoetina sérica abaixo do valor de referência" },
      { front: "PV: sintomas de hiperviscosidade e achado clássico?", back: "Cefaleia, tontura, turvação visual e parestesias · Pletora facial é característica" },
      { front: "PV: prurido característico?", back: "Prurido aquagênico, desencadeado por banho quente · Associado a basofilia e hiper-histaminemia" },
      { front: "PV: maior determinante do risco de trombose?", back: "Eritrocitose ou hematócrito elevado · Não é o grau de trombocitose" },
      { front: "PV: por que pode haver sangramento mesmo com trombocitose?", back: "Doença de von Willebrand adquirida · Plaquetas em excesso adsorvem e promovem proteólise do FvW circulante" },
      { front: "PV: base do tratamento e alvos de hematócrito?", back: "Flebotomia · Ht <45% em homens e <42% em mulheres" },
      { front: "PV: qual antiagregante é usado na ausência de contraindicação?", back: "AAS em baixa dose · Também é o tratamento de escolha da eritromelalgia" },
      { front: "PV: quando considerar hidroxiureia?", back: "Dificuldade ou alta necessidade de flebotomias · Trombocitose acentuada e/ou trombose prévia · Prurido intratável" },
      { front: "PV: principais evoluções tardias?", back: "Mielofibrose com metaplasia mieloide · LMA secundária" }
    ]
  },
  {
    id: "hema-mf", name: "Mielofibrose primária · diagnóstico · tratamento", specialty: "clinica",
    cards: [
      { front: "Mielofibrose primária: mecanismo da fibrose?", back: "Megacariócitos e monócitos clonais secretam citocinas que ativam fibroblastos · PDGF é destaque · Fibroblastos produzem colágeno" },
      { front: "Mielofibrose: mutações mais associadas?", back: "JAK2 em 60–65% · CALR em cerca de 25% · MPL em cerca de 10%" },
      { front: "Mielofibrose: por que há hematopoiese extramedular?", back: "A fibrose expulsa progenitores da medula · Eles colonizam sobretudo baço e fígado, causando metaplasia mieloide" },
      { front: "Mielofibrose: achado físico mais frequente?", back: "Esplenomegalia de grande monta, presente em quase todos os casos · Decorre de metaplasia mieloide" },
      { front: "Mielofibrose: tríade no esfregaço periférico?", back: "Leucoeritroblastose · Dacriócitos ou hemácias em lágrima · Plaquetas gigantes degranuladas" },
      { front: "O que significa leucoeritroblastose?", back: "Formas jovens granulocíticas e hemácias nucleadas no sangue periférico · Sugere patologia que ocupa a medula" },
      { front: "O que sugerem múltiplos dacriócitos?", back: "Hematopoiese extramedular ou metaplasia mieloide · Hemácias produzidas em fígado e baço sofrem lesão de membrana" },
      { front: "Mielofibrose: como confirmar o diagnóstico?", back: "Biópsia de medula obrigatória · Demonstra fibrose e hiperplasia megacariocítica atípica · É diagnóstico de exclusão" },
      { front: "Mielofibrose: como costuma ser o aspirado medular?", back: "Tipicamente seco, ou dry tap · O excesso de tecido fibrótico impede a aspiração" },
      { front: "Mielofibrose inicial oligo ou assintomática: conduta?", back: "Nenhuma intervenção específica é indicada" },
      { front: "Mielofibrose avançada: efeito do ruxolitinibe?", back: "Inibidor de JAK2 que reduz tamanho do baço e aumenta a sobrevida · Pode piorar citopenias inicialmente" },
      { front: "Mielofibrose: única chance de cura?", back: "Transplante alogênico de células hematopoiéticas" }
    ]
  },
  {
    id: "hema-te", name: "Trombocitemia essencial · risco · conduta", specialty: "clinica",
    cards: [
      { front: "Trombocitemia essencial: qual célula predomina no clone?", back: "Megacariócitos · O aumento da produção de plaquetas é o marco da doença" },
      { front: "TE: principais mutações?", back: "JAK2 em cerca de 50% · CALR em cerca de 30% · MPL em cerca de 8%" },
      { front: "TE: quando suspeitar pelo hemograma?", back: "Trombocitose persistente acima de 600.000/mm³ · Alguns autores usam ≥450.000/mm³" },
      { front: "TE: riscos quando plaquetas ultrapassam 1.000.000/mm³?", back: "Trombose e hemorragia · Defeito qualitativo plaquetário, incluindo doença de von Willebrand adquirida" },
      { front: "TE: manifestações vasomotoras típicas?", back: "Cefaleia, alterações visuais, tontura, parestesias, acrocianose, úlceras cutâneas e eritromelalgia" },
      { front: "TE: diagnóstico exige excluir o quê?", back: "Trombocitose reativa e outras síndromes mieloproliferativas · LMC, PV e mielofibrose" },
      { front: "TE: qual achado orienta LMC no diferencial?", back: "Leucocitose >20.000/mm³ indica pesquisar cromossomo Philadelphia · Positividade aponta para LMC" },
      { front: "TE: qual achado orienta PV ou mielofibrose no diferencial?", back: "Eritrocitose aponta para PV · Dacriócitos ou hemácias nucleadas apontam para mielofibrose" },
      { front: "TE: quais pacientes são de alto risco?", back: "Idade >60 anos · Plaquetas >1.500.000/mm³ · História prévia de evento trombótico" },
      { front: "TE de alto risco: meta e tratamento?", back: "Manter plaquetas abaixo de 500.000/mm³ · Hidroxiureia ou anagrelida" },
      { front: "TE: manejo de trombose aguda, hemorragia grave e eritromelalgia?", back: "Trombose: anticoagulação plena · Hemorragia grave: plaquetaférese · Eritromelalgia: AAS" },
      { front: "TE: evoluções tardias?", back: "Mielofibrose secundária · Leucemização, geralmente para LMA" }
    ]
  },
  {
    id: "hema-hodgkin", name: "Linfoma de Hodgkin · diagnóstico · tratamento", specialty: "clinica",
    cards: [
      { front: "Hodgkin: picos de incidência?", back: "20–30 anos · 50–60 anos" },
      { front: "Célula de Reed-Sternberg: morfologia?", back: "Célula grande, citoplasma abundante, núcleo bilobulado e nucléolos eosinofílicos proeminentes" },
      { front: "Hodgkin: requisito histológico para o diagnóstico?", back: "Células de Reed-Sternberg em pano de fundo adequado de linfócitos, plasmócitos e eosinófilos · RS isolada não é patognomônica" },
      { front: "Hodgkin clássico: marcadores?", back: "CD15 e CD30 positivos · LH com predomínio linfocitário expressa marcadores B, como CD20" },
      { front: "Hodgkin: subtipo mais comum?", back: "Esclerose nodular · Cerca de 65% · Adenopatia cervical ou mediastinal em jovens, especialmente mulheres" },
      { front: "Hodgkin: padrão de disseminação?", back: "Por contiguidade em mais de 90% dos casos · Cadeias adjacentes em padrão centrípeto" },
      { front: "Hodgkin: sintomas B?", back: "Febre · Sudorese noturna · Perda ponderal >10% · Têm valor prognóstico" },
      { front: "Hodgkin: sintomas clássicos sem valor prognóstico?", back: "Prurido · Dor linfonodal desencadeada por bebidas alcoólicas" },
      { front: "Hodgkin: exame principal para estadiar?", back: "PET-TC · É mais fidedigno que biópsia medular para avaliar acometimento da medula" },
      { front: "Hodgkin: o que define massa mediastinal bulky?", back: "Mais de 30% do diâmetro torácico ou mais de 10 cm no maior eixo" },
      { front: "Hodgkin: esquema quimioterápico de escolha?", back: "ABVD · Adriamicina, bleomicina, vinblastina e dacarbazina" },
      { front: "Hodgkin avançado III/IV: estratégia terapêutica?", back: "ABVD por seis a oito ciclos · Radioterapia é reservada para massa bulky ou residual com PET positivo" }
    ]
  },
  {
    id: "hema-lnh", name: "LNH · tipos · estadiamento · conduta", specialty: "clinica",
    cards: [
      { front: "LNH versus leucemia linfocítica: origem?", back: "LNH nasce no tecido linfoide e pode infiltrar medula · Leucemia linfocítica nasce na medula e pode acometer linfonodos" },
      { front: "LNH: origem celular predominante?", back: "Células B em cerca de 85% · Células T ou NK nos 15% restantes" },
      { front: "LNH: sintomas B e significado?", back: "Febre >38 °C · Sudorese noturna · Perda de >10% do peso em seis meses · Indicam pior prognóstico" },
      { front: "LNH: quando biopsiar um linfonodo?", back: ">2 cm · Supraclavicular ou escalênico · Crescimento progressivo · Endurecido ou aderido · Persistente por >4–6 semanas" },
      { front: "LNH: como deve ser a biópsia?", back: "Excisional, de todo o linfonodo · A arquitetura histopatológica é necessária para diagnóstico e tipagem" },
      { front: "Ann Arbor: o que define estágio IV?", back: "Acometimento extranodal não contíguo a sítio linfonodal, como fígado ou medula óssea" },
      { front: "LNH indolente versus agressivo: qual o paradoxo prognóstico?", back: "Indolentes sobrevivem mais sem tratamento, mas raramente são curados por QT · Agressivos podem ser curados por QT" },
      { front: "LNH mais frequente?", back: "Linfoma difuso de grandes células B · Cerca de 30% dos LNH" },
      { front: "Linfoma folicular: genética e mecanismo?", back: "t(14;18) em cerca de 85% · Produção de Bcl-2, que bloqueia a apoptose" },
      { front: "LDGCB: apresentação e tratamento?", back: "Massa linfonodal de crescimento rápido ou doença extranodal · R-CHOP · Nos estágios I/II associa-se radioterapia" },
      { front: "Linfoma MALT gástrico: associação e tratamento inicial?", back: "Gastrite crônica por H. pylori · Erradicação com antibiótico + IBP pode induzir remissão prolongada" },
      { front: "Burkitt: citogenética e histologia clássicas?", back: "Translocações de c-myc, sobretudo t(8;14) · Aspecto em céu estrelado · Ki-67 próximo de 100%" }
    ]
  },
  {
    id: "hema-mieloma", name: "Mieloma · gamopatias · Waldenström", specialty: "clinica",
    cards: [
      { front: "Mieloma múltiplo: marcos da doença?", back: "Plasmocitose medular · Gamopatia monoclonal · Lesões de órgão-alvo" },
      { front: "Mieloma: mnemônico CARO?", back: "Cálcio alto · Anemia · Rim com insuficiência · Osso com lesões líticas" },
      { front: "Mieloma: lesões ósseas características?", back: "Lesões líticas punched out · Costelas, vértebras, crânio, esterno e cinturas pélvica e escapular · Fosfatase alcalina costuma ser normal" },
      { front: "Mieloma: por que a cintilografia óssea pode falhar?", back: "Há inibição osteoblástica, sem neoformação óssea · RX, TC, RM e PET detectam as lesões" },
      { front: "Mieloma: agentes infecciosos precoces típicos?", back: "Bactérias encapsuladas, sobretudo Streptococcus pneumoniae e Haemophilus influenzae · Por hipogamaglobulinemia funcional" },
      { front: "Rim do mieloma: mecanismo?", back: "Cadeias leves ou Bence Jones ligam-se à Tamm-Horsfall no néfron distal · Formam cilindros e causam nefropatia obstrutiva" },
      { front: "Proteína de Bence Jones: o dipstick do EAS a detecta?", back: "Pode não detectar · Dipstick é mais específico para albumina · Usar imunoeletroforese ou imunofixação" },
      { front: "Mieloma: critério obrigatório de 2014?", back: "Plasmocitose medular ≥10% e/ou plasmocitoma confirmado por biópsia · Exige também lesão de órgão-alvo ou biomarcador" },
      { front: "Mieloma: biomarcadores diagnósticos?", back: "Plasmocitose medular ≥60% · Relação de cadeias leves envolvida/não envolvida ≥100 · Mais de uma lesão focal ≥5 mm à RM" },
      { front: "GMSI: critérios?", back: "Proteína M <3 g/dL · Plasmocitose medular <10% · Sem lesão de órgão-alvo ou amiloidose AL" },
      { front: "Mieloma assintomático: definição?", back: "Proteína M sérica ≥3 g/dL ou plasmocitose medular clonal 10–60% · Sem lesão de órgão-alvo ou amiloidose AL" },
      { front: "Waldenström versus mieloma: diferenças e urgência?", back: "MW: IgM monoclonal, hiperviscosidade, adenopatia e hepatoesplenomegalia · Sem lesões líticas ou hipercalcemia · Hiperviscosidade exige plasmaférese emergencial" }
    ]
  }
];

const obsoleteHem2Ids = new Set(["hema-mieloproliferativas"]);
const out = path.join(__dirname, "..", "data", "flashcards-hemato.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
if (!Array.isArray(existing)) throw new Error("flashcards-hemato.json deve conter um array");

const byId = new Map(existing.filter(deck => !obsoleteHem2Ids.has(deck.id)).map(deck => [deck.id, deck]));
decks.forEach(deck => byId.set(deck.id, deck));
const merged = [...byId.values()];

fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(`Hem2: ${decks.map(deck => `${deck.id} (${deck.cards.length})`).join(" · ")}`);
console.log(`Total no arquivo: ${merged.length} decks · ${merged.reduce((total, deck) => total + deck.cards.length, 0)} cards`);
