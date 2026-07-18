/**
 * Flashcards Hematologia · Hem3
 * Fonte exclusiva: data/_extract_hemato/Hem3-full.txt · capítulos 1–3.
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
  deck("hema-hemostasia", "Hemostasia · princípios e provas", [
    ["Hemostasia — definição e etapas didáticas?", "Interrompe o sangramento e inicia o reparo tecidual · primária forma o tampão plaquetário · secundária forma a rede de fibrina que o consolida"],
    ["Hemostasia eficaz — que equilíbrio limita o coágulo?", "Estímulos pró-coagulantes · anticoagulantes · fibrinolíticos · a oposição restringe o coágulo à injúria e evita trombose em vasos saudáveis"],
    ["Plaquetas — origem e vida média?", "Fragmentos celulares anucleados derivados de megacariócitos medulares · vida média de 7–10 dias"],
    ["Grânulos plaquetários — conteúdos-chave?", "Alfa · FvW, fibrinogênio, fator V e PDGF · densos · ADP e cálcio · lisossomos · hidrolases"],
    ["Adesão ao colágeno — receptores e força das ligações?", "GP Ia/IIa e GP VI ligam colágeno de modo fraco · GP Ib ligada ao FvW e ao colágeno faz a adesão forte e duradoura"],
    ["Ativação plaquetária — agonistas e mediadores liberados?", "Colágeno, trombina e epinefrina estimulam degranulação · ADP e TxA2 recrutam plaquetas · serotonina causa vasoconstrição"],
    ["AAS × outros AINE — efeito sobre COX-1 plaquetária?", "AAS bloqueia COX-1 irreversivelmente por 7–10 dias · outros AINE bloqueiam reversivelmente, com efeito por cerca de 48 h"],
    ["Agregação plaquetária — receptor e ponte molecular?", "GP IIb/IIIa ativada liga fibrinogênio · fibrinogênio faz a ponte entre plaquetas"],
    ["Fatores dependentes de vitamina K?", "II · VII · IX · X · proteínas C e S"],
    ["Via intrínseca × extrínseca — gatilho e prova?", "Intrínseca · contato com superfície negativa · PTTa · extrínseca · fator tecidual exposto pela lesão · TP/TAP"],
    ["Via comum — sequência até a rede de fibrina?", "Xa + Va + fosfolipídio + cálcio formam protrombinase · converte II em IIa · trombina converte fibrinogênio em fibrina · XIIIa estabiliza ligações fibrina-fibrina"],
    ["Trombo branco × trombo vermelho?", "Branco · predominantemente plaquetário e arterial · vermelho · rede de fibrina com hemácias e leucócitos, mais comum na circulação venosa"],
    ["Endotélio íntegro — mecanismos antitrombóticos?", "NO e PGI2 inibem plaquetas · CD39 degrada ADP · trombomodulina/proteína C degradam VIIIa e Va · heparan-sulfato ativa ATIII · TFPI bloqueia TF/VIIa/Xa"],
    ["Como o endotélio estimula fibrinólise?", "tPA transforma plasminogênio ligado à fibrina em plasmina · alfa-2-antiplasmina inativa a plasmina após sua ação"]
  ]),
  deck("hema-pti", "Púrpura trombocitopênica imune · PTI", [
    ["PTI — fisiopatologia central?", "Doença autoimune idiopática · autoanticorpos opsonizam plaquetas e aceleram sua remoção pelo baço · também podem inibir sua liberação medular"],
    ["PTI — principais alvos dos autoanticorpos?", "Glicoproteínas IIb/IIIa e Ib/IX da membrana plaquetária"],
    ["PTI — apresentação clássica?", "Plaquetopenia isolada · sem outras citopenias ou sinais como hepatoesplenomegalia, linfadenopatia, febre e perda ponderal"],
    ["PTI — por que é diagnóstico de exclusão?", "Confirmar trombocitopenia verdadeira no esfregaço · excluir drogas, HIV/HCV, LES e neoplasias linfoproliferativas · anticorpo antiplaqueta não é útil na prática"],
    ["Suspeita de PTI — quando estudar a medula óssea?", "Outras citopenias inexplicadas ou displasia no esfregaço · falha terapêutica · suspeita de causa secundária"],
    ["PTI — padrão de sangramento e marco plaquetário?", "Predomina sangramento mucocutâneo · petéquias, equimoses, epistaxe e menorragia · frequentemente assintomática até < 20.000/mL"],
    ["PTI do adulto × infantil — curso típico?", "Adulto · crônica, mais comum em mulheres de 20–40 anos · criança · aguda, autolimitada e geralmente pós-infecção viral ou vacinação"],
    ["PTI infantil — evolução para cronicidade?", "10–20% evoluem para PTI crônica · a maioria resolve em poucos meses"],
    ["PTI do adulto — quando tratar?", "Plaquetas < 20.000–30.000/mL mesmo sem sintomas · ou sangramento significativo em qualquer contagem"],
    ["PTI do adulto — primeira linha?", "Corticoterapia é a base · Ig IV ou anti-D podem ser associadas · Ig IV/anti-D aumentam plaquetas em 24–36 h, mais rápido que corticoide"],
    ["PTI — transfusão de plaquetas é rotineira?", "Não · plaquetas transfundidas são opsonizadas e removidas · indicar no sangramento agudo grave junto de corticoide e Ig IV ou anti-D"],
    ["PTI refratária/corticodependente — segunda linha?", "Rituximabe · agonistas do receptor de trombopoietina, como romiplostim ou eltrombopague · esplenectomia se refratária"],
    ["PTI infantil sem sangramento — conduta?", "Expectante independentemente da plaquetometria · orientar prevenção de trauma e evitar AAS, AINE e anticoagulantes"],
    ["PTI — meta terapêutica no adulto sem sangramento?", "Manter plaquetometria persistentemente > 30.000/mL"]
  ]),
  deck("hema-ptt-shuh", "PTT e síndrome hemolítico-urêmica", [
    ["PTT — fisiopatologia central?", "Deficiência adquirida de ADAMTS-13, geralmente por IgG anti-ADAMTS-13 · acúmulo de multímeros grandes de FvW aumenta agregação plaquetária microvascular"],
    ["PTT — composição e consequências dos microtrombos?", "Principalmente plaquetas e FvW, com pouca fibrina · causam isquemia multiorgânica, consumo plaquetário e hemólise com esquizócitos"],
    ["PTT — pêntade clássica?", "Anemia hemolítica microangiopática · trombocitopenia · sintomas neurológicos · febre · insuficiência renal"],
    ["PTT — apresentação sem pêntade completa?", "Pode manifestar-se por anemia hemolítica · plaquetopenia · distúrbio neurológico"],
    ["PTT — manifestações neurológicas e renais?", "Cefaleia, pares cranianos, afasia, hemiparesia, confusão, torpor, coma ou convulsão · insuficiência renal em geral não causa uremia"],
    ["PTT — achados laboratoriais de hemólise?", "Reticulocitose · policromatofilia · LDH e bilirrubina indireta elevados · haptoglobina baixa · hemoglobinúria/hemossiderinúria · esquizócitos"],
    ["PTT × CIVD — provas de coagulação?", "PTT · TP e PTTa caracteristicamente normais, podendo haver leve aumento de PDF · CIVD cursa com coagulopatia de consumo"],
    ["PTT — confirmação diagnóstica específica?", "Atividade sérica de ADAMTS-13 < 10% confirma o diagnóstico"],
    ["PTT — tratamento urgente?", "Plasmaférese diária com plasma fresco congelado até estabilização clínica e normalização laboratorial · corticoide imunossupressor pode ser associado"],
    ["PTT — plasma fresco enquanto aguarda plasmaférese?", "Pode estabilizar o paciente · dilui fatores patogênicos e fornece ADAMTS-13"],
    ["PTT — transfusão de plaquetas?", "Formalmente contraindicada · aumenta microtrombos e pode piorar função neurológica e renal"],
    ["PTT recidivante ou refratária — alternativas?", "Rituximabe · caplacizumabe, que bloqueia a ligação FvW–GP Ib-IX-V"],
    ["SHU típica — paciente e gatilho?", "Pré-escolar · após diarreia aguda por toxina Shiga da E. coli O157:H7 entero-hemorrágica"],
    ["SHU típica — quadro, diagnóstico e tratamento?", "Microangiopatia localizada no rim · anemia, oligúria, hematúria e proteinúria · laboratório semelhante ao da PTT · diagnóstico clínico · suporte"]
  ]),
  deck("hema-hemofilia", "Hemofilias A e B", [
    ["Hemofilia A × B — fator deficiente e herança?", "A · fator VIII · B · fator IX · ambas hereditárias e ligadas ao cromossomo X, quase exclusivas de homens"],
    ["Hemofilia A × B — são distinguíveis clinicamente?", "Não · são clinicamente indistinguíveis · diferenciação exige ensaio específico dos fatores VIII e IX"],
    ["Hemofilia — classificação pela atividade do fator?", "Grave · < 1% · moderada · 1–5% · leve · 6–30%"],
    ["Hemofilia grave — início e manifestação típica?", "Aos 2–4 anos, ao iniciar deambulação · hemartroses espontâneas"],
    ["Hemartrose hemofílica — articulações mais acometidas?", "Joelho é a mais frequente · seguido por cotovelo, tornozelo e quadril"],
    ["Hemartroses recorrentes mal controladas — consequência?", "Espessamento sinovial e dano à cartilagem · subluxações, anquilose e deformidade articular permanente"],
    ["Hemofilia — sangramentos potencialmente graves?", "Hematomas intramusculares com síndrome compartimental · retroperitoneal ou de psoas · hemorragia intracraniana · hematoma orofaríngeo com risco de asfixia"],
    ["Hemofilia — padrão laboratorial?", "PTTa alargado isoladamente · demais provas hemostáticas normais"],
    ["Hemofilia A — tratamento agudo de escolha?", "Reposição de fator VIII purificado ou recombinante · crioprecipitado não é mais usado rotineiramente"],
    ["Hemofilia A — papel de DDAVP e antifibrinolíticos?", "DDAVP pode ser usado em hemorragia branda · EACA ou ácido tranexâmico são adjuvantes para procedimentos orais · antifibrinolíticos são contraindicados em hematúria"],
    ["Hemofilia B — tratamento de escolha?", "Reposição de fator IX purificado ou recombinante"],
    ["Hemofilia grave — objetivo da profilaxia primária?", "Manter o nível do fator deficiente > 1%"],
    ["Hemofilia A grave — emicizumabe?", "Opção profilática · anticorpo biespecífico que liga IXa e X, mimetizando a ação do VIIIa"],
    ["Hemofilia C — herança e conduta?", "Deficiência de fator XI · autossômica recessiva · não causa sangramento espontâneo · tratar trauma ou pré-operatório com fator XI ou plasma fresco"]
  ]),
  deck("hema-von-willebrand", "Doença de von Willebrand", [
    ["Doença de von Willebrand — frequência e síntese do FvW?", "Desordem hemorrágica hereditária mais comum · afeta 1% da população, mas só cerca de 1/10 tem doença clínica · FvW é sintetizado por endotélio e megacariócitos"],
    ["FvW — duas funções essenciais?", "Promove adesão plaquetária ao colágeno subendotelial · transporta e protege o fator VIII da depuração por proteases"],
    ["DvW — padrão de herança e tipos?", "Quase sempre autossômica dominante · tipos 1 e 2 são os mais comuns · tipos 2N e 3 são autossômicos recessivos"],
    ["DvW tipo 1 — frequência e defeito?", "80% dos casos · redução quantitativa leve a moderada do FvW"],
    ["DvW tipo 2 × tipo 3?", "Tipo 2 · defeito qualitativo, subtipos A, B, M e N · tipo 3 · ausência quase total de FvW e atividade muito baixa de VIII, com quadro grave semelhante à hemofilia"],
    ["DvW — apresentação clínica típica?", "Forma geralmente branda · sangramento imediato após trauma, extração dentária ou procedimento invasivo · equimoses e sangramento mucoso nos casos moderados"],
    ["DvW — por que hemartrose é incomum?", "A redução do VIII em geral não basta para manifestação típica de coagulopatia · exceção importante: tipo 3"],
    ["DvW — triagem laboratorial habitual?", "TS prolongado · PTTa alargado por deficiência parcial de VIII · demais provas normais · formas brandas podem ter todos os testes normais"],
    ["DvW — quando o PTTa já pode alargar?", "Quando a atividade plasmática do fator VIII é < 30%"],
    ["DvW — testes confirmatórios?", "Atividade do FvW por ristocetina · antígeno do FvW por ELISA"],
    ["DvW tipo 1/3 × tipo 2 — ristocetina e FvW?", "Tipos 1 e 3 · ambos reduzidos · tipo 2 · teste da ristocetina mais alterado que a dosagem de FvW"],
    ["DvW — prevenção farmacológica obrigatória?", "Evitar AAS e outros AINE, por interferirem na função plaquetária"],
    ["DvW tipo 1 — tratamento de sangramento leve/profilaxia operatória?", "DDAVP aumenta a liberação endotelial de FvW · não mais de duas doses em 48 h por taquifilaxia e hiponatremia"],
    ["DvW — sangramento grave ou refratário a DDAVP?", "Concentrados ricos em FvW · crioprecipitado não é mais recomendado de rotina"]
  ]),
  deck("hema-cid", "Coagulação intravascular disseminada · CIVD", [
    ["CIVD — principais contextos associados?", "Sepse, sobretudo Gram-negativa · complicações obstétricas · neoplasias como adenocarcinoma mucinoso e LMA M3 · politrauma · grande queimado · hemólise intravascular aguda"],
    ["CIVD — gatilho e mecanismo central?", "Exposição ou liberação de fator tecidual · formação difusa de fibrina na microvasculatura consome plaquetas e fatores, destrói hemácias e obstrui pequenos vasos"],
    ["CIVD × PTT — composição predominante dos microtrombos?", "CIVD · fibrina · PTT · plaquetas e FvW, com pouca fibrina"],
    ["CIVD — fibrinogênio, PDF e d-dímero?", "Fibrinogênio é intensamente consumido · fibrinólise ativada aumenta PDF e d-dímero"],
    ["D-dímero — o que demonstra?", "Degradação de polímeros de fibrina previamente formados · na fibrinólise primária, PDFF sobem, mas d-dímero fica normal"],
    ["CIVD aguda × crônica — causas e manifestação dominante?", "Aguda · sepse, trauma, obstetrícia e LMA, com sangramento · crônica · tumores sólidos secretores de fator tecidual, com tromboses repetidas"],
    ["CIVD aguda — critérios laboratoriais?", "Hipofibrinogenemia · PDF/d-dímero elevados · PTTa, TP e TT alargados · trombocitopenia · anemia hemolítica com esquizócitos"],
    ["CIVD — manifestações de microtrombose difusa?", "Insuficiência renal aguda · disfunção hepática · depressão do sensório · gangrena de dígitos · apoplexia suprarrenal na meningococemia"],
    ["CIVD sem sangramento ou trombose — há terapia específica?", "Não necessariamente · tratar a doença de base e acompanhar, pois alteração laboratorial isolada não exige terapia específica"],
    ["CIVD com sangramento — reposição de plaquetas?", "Indicar se plaquetometria < 50.000/mm³"],
    ["CIVD com sangramento — reposição de fatores?", "Plasma fresco congelado · crioprecipitado para manter fibrinogênio > 150 mg/dL · vitamina K"],
    ["CIVD aguda — heparina em baixa dose?", "Benefício não comprovado"],
    ["CIVD crônica com macrotrombose — conduta?", "Heparinização para tratar eventos macrotrombóticos"],
    ["CIVD — papel dos antifibrinolíticos?", "Contraindicados em qualquer forma · podem agravar a microtrombose"]
  ]),
  deck("hema-anticoagulacao", "Anticoagulantes · heparina, varfarina e DOAC", [
    ["HNF — mecanismo e exame de controle?", "Ativa intensamente a antitrombina III contra trombina e Xa · alarga especialmente o PTTa, usado para controle"],
    ["HNF × HBPM — ação sobre trombina e Xa?", "HNF inibe trombina IIa e Xa · HBPM inibe fortemente Xa e fracamente trombina"],
    ["HNF × HBPM — relação anti-Xa/antitrombina?", "HNF · 1:1 · HBPM · 4:1"],
    ["HNF — por que exige monitorização?", "Liga-se a proteínas plasmáticas, fator 4 plaquetário e endotélio · resposta varia entre pacientes · controlar PTTa com relação 1,5–2,5"],
    ["HBPM — monitorização habitual e exceções?", "Geralmente não altera PTTa e não exige rotina · dosar fator Xa em gestantes, obesos e disfunção renal"],
    ["Heparina — efeitos adversos importantes?", "Sangramento · trombocitopenia imune · osteoporose no uso crônico · HBPM tem menor chance de trombocitopenia e osteoporose"],
    ["Hemorragia por heparina — conduta e antídoto?", "Suspender a infusão · se moderada/grave, protamina · 1 mg neutraliza 100 U de HNF"],
    ["HIT — mecanismo e apresentação?", "Anticorpos contra complexo heparina/fator 4 plaquetário ativam e agregam plaquetas · plaquetopenia com predisposição paradoxal a trombose venosa e arterial"],
    ["HIT — período usual e conduta?", "Ocorre em 5–14 dias · suspender imediatamente qualquer heparina · trocar por inibidor de trombina ou Xa · não iniciar varfarina de imediato"],
    ["Varfarina — mecanismo?", "Inibe gamacarboxilação dependente de vitamina K para síntese dos fatores II, VII, IX e X, além de proteínas C e S"],
    ["Varfarina — por que efeito pró-coagulante inicial?", "Proteína C e fator VII caem antes dos demais · nas primeiras 48 h pode piorar trombose e causar necrose cutânea · se precisar ação imediata, associar heparina"],
    ["Varfarina — exame e meta de controle habitual?", "TP/INR · alvo entre 2–3 na maioria das situações"],
    ["Sangramento grave por varfarina — reversão?", "Suspender o fármaco · PFC, fator VII recombinante ou complexo protrombínico + vitamina K IV 5–10 mg"],
    ["DOAC — classes, exemplos e antídotos?", "Dabigatrana · inibidor direto da trombina · rivaroxabana, apixabana e edoxabana · inibidores diretos de Xa · doses fixas sem rotina de monitorização · andexanet alfa reverte Xa e idarucizumabe reverte dabigatrana"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-hemato.json");
const obsoleteHem3Ids = [];
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
const byId = new Map(existing.map(item => [item.id, item]));
obsoleteHem3Ids.forEach(id => byId.delete(id));
newDecks.forEach(item => byId.set(item.id, item));
const decks = Array.from(byId.values());

fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log(`wrote ${out} · ${newDecks.length} Hem3 decks · ${newDecks.reduce((n, item) => n + item.cards.length, 0)} cards`);
newDecks.forEach(item => console.log(`${item.id} · ${item.cards.length} cards`));
