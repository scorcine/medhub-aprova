const fs = require("fs");
const path = require("path");

const deck = (id, name, cards) => ({
  id,
  name,
  specialty: "clinica",
  cards: cards.map(([front, back]) => ({ front, back }))
});
const decks = [
  deck("hema-anemia-intro", "Introdução às anemias", [
    ["Anemia: doença ou sinal?", "Sinal de doença · Define queda da hemoglobina no sangue"],
    ["Vida média normal da hemácia?", "Cerca de 120 dias"],
    ["Exames iniciais na investigação da anemia?", "Hemograma com índices hematimétricos · Reticulócitos · Cinética do ferro · Esfregaço periférico"],
    ["Causas de anemia microcítica-hipocrômica?", "Ferropriva · Talassemia · Doença crônica prolongada · Sideroblástica hereditária · Hipertireoidismo"],
    ["Definição de anemia macrocítica?", "VCM > 100 fL · Causa clássica: megaloblástica por carência de folato e/ou B12"],
    ["Outras causas de macrocitose além de megaloblastose?", "SMD · Anemia aplásica · Etilismo · AZT/metotrexato · Hepatopatia · Hipotireoidismo · Hemólise · Hemorragia aguda"],
    ["Reticulocitose aponta para quais anemias?", "Hemolítica · Hemorragia aguda"],
    ["Anemia hipo × hiperproliferativa?", "Hipoproliferativa: sem reticulocitose · Hiperproliferativa: hemólise ou sangramento agudo"],
    ["Fórmula do índice de reticulócitos corrigido?", "Ht/40 × percentual de reticulócitos · Ou Hb/15 × percentual de reticulócitos"],
    ["Quando o IPR é mais fidedigno e qual ponto sugere hiperproliferação?", "Com Ht < 30% · IPR > 2% sugere hemólise ou hemorragia aguda"],
    ["Pancitopenia: causas importantes?", "Anemia aplásica ou leucemia aguda · Também megaloblastose e mielodisplasias"],
    ["Microcitose-hipocromia com trombocitose sugere?", "Anemia ferropriva"]
  ]),
  deck("hema-ferropriva", "Anemia ferropriva", [
    ["Principal causa de anemia ferropriva?", "Sangramento crônico · Sangramento agudo nem sempre causa ferropriva"],
    ["Ferropriva em homem ou paciente idoso: conduta?", "Investigar perda sanguínea · Em maiores de 50 anos, investigar trato gastrointestinal"],
    ["Causa frequente na mulher em menacme?", "Hipermenorreia · Avaliação ginecológica é necessária"],
    ["Evolução morfológica da ferropriva?", "Inicialmente normocítica-normocrômica · Depois microcítica e hipocrômica"],
    ["Hemograma típico da ferropriva?", "RDW elevado · Trombocitose frequente · Leucometria geralmente normal"],
    ["Ferro e ferritina na ferropriva?", "Ferro geralmente < 30 μg/dL · Ferritina < 15 ng/mL é típica"],
    ["Ferritina que praticamente afasta ferropriva?", "Acima de 60 ng/mL"],
    ["TIBC e saturação na ferropriva?", "TIBC > 360 μg/dL e quase sempre > 400 μg/dL · Saturação < 15%"],
    ["Ferropriva × betatalassemia minor pelo RDW?", "Ferropriva: alto, média 16% · Betatalassemia minor: normal, cerca de 13%"],
    ["Esfregaço da ferropriva grave?", "Anisopoiquilocitose · Microcitose e hipocromia · Hemácias em charuto · Micrócitos bizarros"],
    ["Padrão-ouro da ferropriva?", "Aspirado de medula com azul da Prússia · Ausência de ferro em macrófagos e eritroblastos"],
    ["Reposição oral e absorção do ferro?", "60 mg de ferro elementar · Em jejum, 1–2 h antes das refeições · Vitamina C ou suco de laranja favorece absorção"]
  ]),
  deck("hema-anemia-doenca-cronica", "Anemia de doença crônica", [
    ["Sinônimos de anemia de doença crônica?", "Anemia inflamatória · Hipoferrêmica com siderose reticuloendotelial · Citocina-mediada"],
    ["Morfologia usual da ADC?", "Normocítica-normocrômica · Microcitose discreta · VCM quase nunca < 72 fL"],
    ["Cinética do ferro na ADC?", "Ferro baixo · Ferritina normal ou alta · TIBC normal ou baixo · Saturação discretamente baixa"],
    ["Valores típicos da cinética na ADC?", "Ferro < 60 μg/dL · Ferritina 50–500 ng/mL · TIBC < 300 μg/dL · Saturação 10–20%"],
    ["TRP na ADC versus ferropriva?", "ADC: baixa · Ferropriva: alta"],
    ["Por que o TIBC é normal ou baixo na ADC?", "Redução da transferrina sérica · O TIBC traduz indiretamente sua concentração"],
    ["Quando suspeitar ferropenia associada à ADC?", "Ferritina < 30 ng/mL · Entre 30–60 ng/mL, usar ferro medular ou prova terapêutica"],
    ["Tratamento da ADC leve a moderada?", "Tratar a doença de base"],
    ["ADC grave: quando considerar eritropoetina?", "Ht < 25% após afastar ferropenia e outras causas · Associar ferro parenteral"],
    ["Fator principal na anemia da IRC?", "Deficiência de produção renal de eritropoetina"],
    ["Padrão da anemia da IRC?", "Normocítica-normocrômica · Progressiva · Gravidade proporcional à disfunção renal"],
    ["Meta de Hb na reposição de eritropoetina da IRC?", "Em torno de 11 g/dL · Faixa 10–12 g/dL · Não ultrapassar 12 g/dL"]
  ]),
  deck("hema-megaloblastica", "Anemia megaloblástica", [
    ["Causa básica da megaloblastose?", "Defeito da síntese de DNA por carência de vitamina B12 e/ou folato"],
    ["VCM que torna megaloblastose muito provável?", "> 110 fL · Acima de 120 fL praticamente não há outro diagnóstico"],
    ["Esfregaço típico?", "Neutrófilos hipersegmentados · Macro-ovalócitos · Anisocitose e poiquilocitose"],
    ["Critério de hipersegmentação neutrofílica?", "Um neutrófilo com ≥ 6 lobos · Ou ≥ 5% com cinco lobos"],
    ["LDH, bilirrubina e reticulócitos na megaloblastose?", "LDH e bilirrubina indireta elevados · Reticulócitos normais ou baixos"],
    ["B12 e folato que praticamente confirmam deficiência?", "B12 < 200 pg/mL · Folato < 2 ng/mL"],
    ["Metilmalônico e homocisteína: B12 × folato?", "Metilmalônico: elevado só na B12 · Homocisteína: elevada em ambas"],
    ["Principal causa de deficiência de B12 no texto?", "Anemia perniciosa"],
    ["Mecanismo da anemia perniciosa?", "Autoanticorpos contra células parietais · Redução de ácido, pepsina e fator intrínseco · Má absorção de B12"],
    ["Achados neurológicos da deficiência de B12 podem ocorrer sem anemia?", "Sim · Podem ocorrer com hemograma normal e B12 sérica baixa"],
    ["Schilling: uso atual?", "Não empregado rotineiramente · Valor histórico pela baixa disponibilidade e falta de padronização"],
    ["Reposição de B12, folato e resposta?", "B12 usualmente parenteral · Folato 1–5 mg/dia VO, até 15 mg/dia se má absorção · Pico reticulocitário em torno de 7 dias"]
  ]),
  deck("hema-hemoliticas-geral", "Anemias hemolíticas · geral", [
    ["Definição de hemólise?", "Destruição prematura de hemácias · Intravascular ou no sistema reticuloendotelial"],
    ["Hemólise compensada?", "Vida eritrocitária pode cair a 20–25 dias sem anemia se eritropoiese e estoques estiverem preservados"],
    ["Principal sítio de hemólise extravascular?", "Sistema reticuloendotelial, especialmente o baço"],
    ["Marcadores laboratoriais gerais de hemólise?", "Reticulocitose · Bilirrubina indireta alta · LDH alto · Haptoglobina baixa"],
    ["Achado urinário confirmatório de hemólise intravascular?", "Hemoglobina ++++ sem hemácias · Hemoglobinúria"],
    ["Apresentação de crise hemolítica intravascular aguda?", "Febre · Lombalgia · Palidez · Icterícia · Urina escura"],
    ["Cálculo associado à hemólise crônica?", "Cálculo de bilirrubinato de cálcio · Geralmente radiopaco"],
    ["Crise aplásica na hemólise crônica?", "Parvovírus B19 · Tropismo por pró-eritroblasto · Anemia com reticulocitopenia"],
    ["Esfregaço na hemólise microangiopática?", "Esquizócitos em capacete · Fragmentos de hemácia"],
    ["Por que prescrever folato na hemólise crônica?", "Suprir a necessidade aumentada de folato"]
  ]),
  deck("hema-ahai", "Anemia hemolítica autoimune", [
    ["Mecanismo da hemólise na AHAI?", "Anticorpos e/ou complemento ligados à membrana eritrocítica"],
    ["Tipos principais de AHAI?", "Anticorpos quentes: IgG · Anticorpos frios: IgM"],
    ["AHAI quente: alvo e local de hemólise?", "IgG contra antígenos Rh · Hemólise extravascular no baço"],
    ["AHAI fria: temperatura e mecanismo?", "IgM ativa em 0–10 °C · Ativa complemento"],
    ["AHAI fria: sítio de destruição?", "Fígado · Macrófagos de Kupffer fagocitam hemácias revestidas por C3b"],
    ["Coombs direto na AHAI por IgG?", "Positivo em 98% dos casos"],
    ["Coombs indireto é importante para diagnosticar AHAI?", "Não · Detecta anticorpos anti-hemácia livres no soro"],
    ["Esfregaço e reticulócitos na AHAI quente?", "Microesferócitos e reticulócitos · Reticulocitose de 10–30%"],
    ["Primeira linha da AHAI clinicamente significativa?", "Prednisona 1–2 mg/kg/dia ou 40 mg/m²"],
    ["AHAI quente refratária a corticoide?", "Rituximabe ou esplenectomia"],
    ["Tratamento da doença por crioaglutinina?", "Rituximabe · Evitar exposição ao frio · Corticoide e esplenectomia não respondem"]
  ]),
  deck("hema-g6pd-esferocitose", "G6PD · esferocitose hereditária", [
    ["Esferocitose hereditária: padrão de herança?", "Autossômica dominante em 80% · Recessiva nos demais casos"],
    ["Proteínas afetadas na esferocitose?", "Espectrina · Anquirina · Banda 3 · Proteína 4.2"],
    ["Padrão laboratorial da esferocitose?", "Hemólise crônica · Microesferócitos · CHCM elevado · Coombs direto negativo"],
    ["Teste clássico da esferocitose?", "Fragilidade osmótica · Microesferócitos são muito sensíveis à hipo-osmolaridade"],
    ["Tratamento da esferocitose?", "Esplenectomia, exceto anemia leve ou hemólise compensada"],
    ["Herança da deficiência de G6PD?", "Recessiva ligada ao X · Mais frequente no sexo masculino"],
    ["Função da G6PD?", "Regenerar glutation reduzido · Proteger hemoglobina e membrana contra radicais livres"],
    ["Precipitante mais comum de crise por G6PD?", "Infecção · Também drogas e substâncias oxidantes"],
    ["Drogas comprovadamente desencadeantes em G6PD?", "Dapsona · Fenazopiridina · Primaquina · Nitrofurantoína · Azul de metileno · Azul de toluidina · Rasburicase"],
    ["Clínica e esfregaço na crise por G6PD?", "Hemólise intravascular aguda · Corpúsculos de Heinz · Hemácias irregularmente contraídas"],
    ["Conduta na deficiência de G6PD?", "Evitar oxidantes e tratar infecções precocemente · Suporte e transfusão nos casos graves"]
  ]),
  deck("hema-talassemia", "Talassemias", [
    ["Definição de talassemias?", "Doenças genéticas por redução ou perda da síntese de cadeias globínicas"],
    ["Tipos principais?", "Betatalassemia: deficiência de cadeias beta · Alfatalassemia: deficiência de cadeias alfa"],
    ["Betatalassemia mais comum no Brasil?", "É a forma mais comum de talassemia no país"],
    ["Início típico da betatalassemia major?", "Após 3–6 meses · Quando a HbF deixa de predominar"],
    ["Hb e clínica da betatalassemia major?", "Hb entre 3–5 g/dL · Anemia grave e icterícia"],
    ["Eletroforese na betatalassemia?", "HbA2 entre 3,5–8% é característica · HbF pode ultrapassar 90% na forma major"],
    ["Betatalassemia minor: conduta?", "Não exige tratamento · Orientação e aconselhamento genético"],
    ["Tratamento da betatalassemia major?", "Hipertransfusão crônica · Controla a hiperplasia eritroide"],
    ["Alfatalassemia minor: pista diagnóstica?", "Microcitose 70–80 fL sem anemia · Ferro normal · Eletroforese normal"],
    ["Alfatalassemia sem cadeias alfa?", "Hidropsia fetal com Hb Barts · Incompatível com vida extrauterina"],
    ["Doença da HbH?", "Tetrâmeros beta4 · Pode precipitar e aparecer como pontilhado com azul brilhante de cresil"]
  ]),
  deck("hema-falciforme", "Doença falciforme", [
    ["Mutação da HbS?", "Ácido glutâmico por valina na posição 6 da cadeia beta · Cromossomo 11"],
    ["Evento central da fisiopatologia falciforme?", "Polimerização da HbS desoxigenada · Afoiçamento e perda de deformabilidade"],
    ["Fatores que exacerbam o afoiçamento?", "Hipóxia · Acidose · Desidratação celular"],
    ["Qual Hb bloqueia melhor a polimerização da HbS?", "HbF · Níveis altos reduzem afoiçamento e manifestações clínicas"],
    ["Hemólise na anemia falciforme: extra × intravascular?", "Extravascular cerca de 2/3 · Intravascular cerca de 1/3"],
    ["Esfregaço na anemia falciforme?", "Hemácias afoiçadas · Policromasia · Howell-Jolly · Hemácias em alvo"],
    ["Confirmação da doença falciforme?", "Eletroforese de hemoglobina · HPLC e análise genética também confirmam"],
    ["Manifestação clínica central?", "Hemólise crônica com disfunções orgânicas progressivas · Crises vaso-oclusivas recorrentes"],
    ["Quatro pilares da terapia modificadora?", "Profilaxia antipneumocócica · Reativar HbF · Hemotransfusão · Quelantes de ferro"],
    ["Hidroxiureia na falciforme?", "Aumenta HbF · Diminui crises álgicas e episódios de síndrome torácica aguda"],
    ["Dose e monitorização da hidroxiureia?", "15–40 mg/kg/dia · Monitorar neutrófilos, mantendo > 2.000/mL"]
  ]),
  deck("hema-smd", "Mielodisplasias", [
    ["O que são SMD?", "Desordens adquiridas clonais da célula-tronco hematopoiética · Maturação anormal e displasia"],
    ["SMD primária × secundária?", "Primária: idosos > 60 anos, curso arrastado · Secundária: após quimio/radioterapia, pior prognóstico"],
    ["Quando suspeitar de SMD?", "Idoso com anemia normo/macrocítica, bicitopenia ou pancitopenia após excluir B12/folato"],
    ["Manifestação hematológica predominante?", "Anemia crônica refratária · Setor eritroide é geralmente o mais comprometido"],
    ["Principal causa de óbito?", "Infecção · Neutrófilos displásicos são funcionalmente defeituosos"],
    ["Padrão laboratorial?", "Anemia sem reticulocitose · Mais frequentemente macrocítica · VCM raramente > 115 fL"],
    ["Esfregaço sugestivo?", "Macro-ovalócitos · Neutrófilos hipo/hipogranulares · Pseudo-Pelger-Huët · Megatrombócitos"],
    ["Como confirmar SMD?", "Biópsia de medula óssea · Geralmente hiper ou normocelular · Sem achado único patognomônico"],
    ["Mau prognóstico na SMD?", "Secundária · Blastos > 5% · ALIP · Displasia multilinhagem · Deleção 7q ou monossomia 7"],
    ["Escore usado para risco?", "IPSS · Ajuda a selecionar o tratamento"],
    ["Tratamento da deleção 5q?", "Lenalidomida"],
    ["Única chance de cura?", "Transplante de células-tronco hematopoiéticas em casos selecionados"]
  ]),
  deck("hema-sideroblastica", "Anemia sideroblástica", [
    ["Definição de anemia sideroblástica?", "Depósitos de ferro nas mitocôndrias dos eritroblastos · Sideroblastos em anel perinucleares"],
    ["Base fisiopatológica?", "Distúrbio da síntese do heme sem carência de ferro · Acúmulo mitocondrial de ferro"],
    ["Por que há eritropoiese ineficaz?", "Ferro acumulado lesa e pode destruir eritroblastos na medula · Sem aumento de reticulócitos"],
    ["Critério confirmatório na medula?", "> 15% de eritroblastos sideroblastos em anel"],
    ["Sobrecarga de ferro associada?", "Hemocromatose eritropoiética · Pode causar hepatoesplenomegalia e lesão hepática e cardíaca"],
    ["Gene da forma hereditária ligada ao X?", "ALAS2 · Vitamina B6 é cofator da ALA sintase"],
    ["Causas reversíveis adquiridas?", "Etanol · Isoniazida · Pirazinamida · Cloranfenicol · Deficiência de cobre · Excesso de zinco"],
    ["Morfologia eritrocitária?", "Microcitose e hipocromia · Dimorfismo com população microcítica e outra normo/macrocítica"],
    ["Hereditária × adquirida pelo VCM?", "Hereditária: micrócitos predominam · Adquirida: macrócitos predominam"],
    ["Cinética do ferro típica?", "Ferro > 150 μg/dL · Ferritina > 100–200 ng/mL · TIBC normal · Saturação 30–80%"],
    ["Tratamento da hereditária ligada ao X?", "Piridoxina 100–200 mg/dia por 3 meses · Resposta em 40–60%"],
    ["Manejo da sobrecarga de ferro?", "Se ferritina > 500 ng/mL · Flebotomia se Hb > 9 g/dL · Desferroxamina na anemia mais grave"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-hemato.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
if (!Array.isArray(existing)) throw new Error("flashcards-hemato.json deve conter um array");

const obsoleteHem1Ids = new Set([
  "hema-anemia-intro", "hema-ferropriva", "hema-anemia-doenca-cronica",
  "hema-megaloblastica", "hema-hemoliticas", "hema-hemoglobinopatias",
  "hema-smd", "hema-sideroblastica", "hema-ahai", "hema-g6pd-esferocitose",
  "hema-talassemia", "hema-falciforme"
]);
const merged = existing.filter((item) => !obsoleteHem1Ids.has(item.id)).concat(decks);

fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(`Hem1: ${decks.length} decks · ${decks.reduce((total, deck) => total + deck.cards.length, 0)} cards`);
for (const deck of decks) console.log(`${deck.id}: ${deck.cards.length}`);
