/**
 * Flashcards Reumatologia · REU3
 * Fonte: D:\MedHub R1\CM\Reumatologia\REU3.pdf
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "reu3-les-basico",
    name: "LES · conceito · epidemiologia · patogênese",
    specialty: "clinica",
    cards: [
      { front: "LES — definição em uma frase?", back: "Doença autoimune multissistêmica crônica · “Doença das ites”: dermatite, artrite, serosite, glomerulite, cerebrite · Exacerbações × remissões" },
      { front: "Braço imunológico dominante no LES × AR?", back: "LES: braço humoral (múltiplos autoanticorpos / imunocomplexos) · AR: braço celular (linfócitos T) predominante" },
      { front: "Epidemiologia clássica do LES?", back: "Mulheres na menacme · ♀:♂ ~9:1 (até 15:1 em jovens; ~2:1 em crianças/idosos) · Pico 15–45a · Mais em negros · Mais em zona urbana" },
      { front: "Fatores ambientais clássicos do LES?", back: "UV (apoptose/DNA) · Tabaco (↑ risco/atividade) · Infecções · Estrogênio · Medicamentos (lúpus-like / DIL)" },
      { front: "Locais mais característicos do LES?", back: "Pele · Articulações · Serosas · Glomérulos · SNC · Hematologia" },
      { front: "Sintomas constitucionais no diagnóstico?", back: "Fadiga, febre e perda de peso na maioria · Febre pode anunciar recaída · Infecção sempre no DD" },
      { front: "Mensagem-chave da patogênese?", back: "Autoanticorpos + imunocomplexos → inflamação tecidual · Complemento consome na atividade · FAN é porta de entrada diagnóstica, não específico" }
    ]
  },
  {
    id: "reu3-les-clinica",
    name: "LES · clínica por sistema",
    specialty: "clinica",
    cards: [
      { front: "Erupção malar clássica — pistas?", back: "“Asa de borboleta” · Poupa sulco nasolabial (≠ rosácea) · Fotossensível · Lesão específica aguda" },
      { front: "Lúpus cutâneo subagudo — Ac e clínica?", back: "Anti-Ro · Lesões eritematodescamativas / anulares · Poupa face com frequência · Recidivante, sem cicatriz típica do discoide" },
      { front: "Lúpus discoide — o que cai?", back: "Crônico · Cicatriz + atrofia + plugs foliculares · Face/couro · Só 5–10% dos discoides “puros” viram LES · ↑ risco de Ca epidermoide em cicatriz" },
      { front: "Úlceras orais no LES × herpes?", back: "Úlceras lúpicas tipicamente indolores · Herpéticas doem · Palato/lábios/septo nasal" },
      { front: "Artrite lúpica — padrão?", back: "Simétrica, distal, migratória · Pouco derrame · Não erosiva · Rigidez <1h · Artropatia de Jaccoud = deformidade redutível não erosiva" },
      { front: "Nefrite lúpica — importância?", back: "Grande morbimortalidade · Classificação ISN/RPS (I–VI) · Proliferativa (III/IV) é a mais grave · Biópsia guia terapia" },
      { front: "Pleuropulmonar no LES?", back: "Pleurite ~50% · Derrame (exsudato; complemento baixo no líquido) · Infecção = 1ª hipótese em febre/infiltrado · HAP pode ligar a SAF" },
      { front: "Coração no LES — clássicos?", back: "Pericardite (mais frequente) · Libman-Sacks (mitral > aórtica, não bacteriana) · Miocardite · Coronariopatia precoce (risco CV)" },
      { front: "Neuropsiquiátrico — Ac e manifestações?", back: "Anti-P ↔ psicose/depressão (“P de psique”) · Cefaleia comum · AVE: trombose (SAF), embolia Libman-Sacks, vasculite, aterosclerose" },
      { front: "Hematologia clássica do LES?", back: "Anemia de doença crônica · Anemia hemolítica autoimune · Leucopenia/linfopenia · Trombocitopenia · Síndrome de Evans · Neutropenia NÃO é o mais típico" },
      { front: "Raynaud no LES?", back: "Até ~30% · Mais típico da esclerose sistêmica · Não define LES sozinho" },
      { front: "Olho no LES?", back: "Ceratoconjuntivite seca (Sjögren) mais comum · Vasculite retiniana / corpos citoides em graves" }
    ]
  },
  {
    id: "reu3-les-lab-crit",
    name: "LES · FAN · autoanticorpos · EULAR/ACR 2019",
    specialty: "clinica",
    cards: [
      { front: "EULAR/ACR 2019 — regra de entrada?", back: "FAN positivo (≥1:80) é obrigatório · Depois soma pontos clínicos + imunológicos · ≥10 = LES" },
      { front: "Categorias do escore EULAR/ACR?", back: "7 clínicas (constitucionais, hematológicas, neuro, mucocutâneas, serosas, MEQ, renais) · 3 imunológicas (aFL, Ac específicos, hipocomplementemia)" },
      { front: "FAN — o que é e corte?", back: "Painel de Ac contra antígenos celulares (não um Ac único) · Células HEp-2 · Título ≥1:80 significativo · Sensível, pouco específico" },
      { front: "FAN em outras doenças / normals?", back: "ES ~90% · Sjögren ~70% · AR ~35% · ~10% da população com títulos baixos" },
      { front: "Anti-dsDNA — significado?", back: "Alta especificidade · Correla atividade e nefrite · E = ~95% (apostila)" },
      { front: "Anti-Sm — significado?", back: "Mais específico do LES · Menos sensível · Anti-RNP associa overlap / DMTC" },
      { front: "Anti-Ro / Anti-La — associações?", back: "Síndrome seca · Lúpus subagudo · Fotossensibilidade · Neonatal / bloqueio AV congênito (anti-Ro em gestante)" },
      { front: "Hipocomplementemia no LES?", back: "C3/C4 baixos na atividade (consumo) · Categoria imunológica nos critérios · Útil no seguimento" },
      { front: "Padrões de FAN clássicos (ideia)?", back: "Homogêneo/difuso · Pontilhado/salpicado · Nucleolar · Padrão + Ac específico interpretam juntos" },
      { front: "VHS/PCR e LES?", back: "VHS sobe na atividade · PCR pode ficar relativamente baixa na flare “pura” — PCR muito alta sugere infecção" }
    ]
  },
  {
    id: "reu3-les-tratamento",
    name: "LES · tratamento por cenário",
    specialty: "clinica",
    cards: [
      { front: "Droga de base quase universal no LES?", back: "Hidroxicloroquina — reduz flares, protege pele/articulações, ajuda sobrevida · Manter salvo contraindicação" },
      { front: "Corticoide — doses (apostila)?", back: "Baixa (~0,5 mg/kg) = anti-inflamatório · Alta (1–2 mg/kg) = imunossupressão · Pulso de metilprednisolona em graves" },
      { front: "Antes de pulsoterapia — o que lembrar no Brasil?", back: "Tratar empiricamente Strongyloides (ivermectina 200 mcg/kg × 2 dias) · Risco de hiperinfecção · Independente de exame de fezes" },
      { front: "Osteoproteção com corticoide?", back: "Ca + vit D · Bisfosfonato se prednisona ≥5 mg/dia >3 meses · LES já tem risco ósseo ↑" },
      { front: "Nefrite proliferativa — ideia terapêutica?", back: "Indução com GC + imunossupressor (MMF ou ciclofosfamida conforme contexto) · Manutenção MMF/AZA · Biópsia orienta" },
      { front: "Cutâneo / articular / leve — 1ª linha?", back: "HCQ ± AINE ± GC baixo · Evitar sol · Tópico/intralesional no discoide" },
      { front: "Belimumabe — ideia?", back: "Biológico anti-BLyS · Adicionar em doença ativa refratária a padrão · Apostila cita no arsenal moderno" },
      { front: "Serosite / flare moderado?", back: "GC em dose adequada · HCQ de base · Imunossupressor se poupador de corticoide necessário" },
      { front: "Neuropsiquiátrico grave?", back: "GC alto / pulso ± imunossupressor · Excluir infecção e evento trombótico (SAF) · Conduta individualizada" },
      { front: "Erro clássico no LES?", back: "Atribuir toda febre à flare sem excluir infecção · Ou suspender HCQ sem motivo · Ou corticoide crônico alto sem poupador" }
    ]
  },
  {
    id: "reu3-les-gravidez-dil",
    name: "LES · gravidez · lúpus farmacoinduzido",
    specialty: "clinica",
    cards: [
      { front: "Quando engravidar no LES?", back: "Preferir remissão / baixa atividade ≥6 meses · Ajustar medicações teratogênicas antes · Planejar com reumato + obstetra" },
      { front: "Anti-Ro na gestante — risco fetal?", back: "Lúpus neonatal · Bloqueio AV congênito · Monitorar coração fetal" },
      { front: "SAF + gestação — ideia?", back: "AAS ± heparina conforme perfil (perda fetal / trombose) · Maior risco de pré-eclâmpsia, RCIU, HELLP" },
      { front: "Drogas “seguras” clássicas na gestação lúpica?", back: "HCQ continua · GC se necessário · AZA em muitos protocolos · Evitar MMF, MTX, ciclofosfamida, LEF" },
      { front: "Lúpus farmacoinduzido (DIL) — drogas clássicas?", back: "Procainamida · Hidralazina · Isoniazida · Anti-TNF (síndrome lúpus-like) · Outras com menor frequência" },
      { front: "DIL × LES idiopático — pistas?", back: "Anti-histona clássico · Anti-dsDNA/anti-Sm raros · Nefrite/SNC menos comuns · Melhora ao suspender droga" },
      { front: "Conduta no DIL?", back: "Suspender fármaco culpado · Sintomáticos / GC curto se preciso · Em geral bom prognóstico" },
      { front: "Flare na gravidez × pré-eclâmpsia?", back: "DD difícil · Hipocomplementemia / anti-dsDNA ↑ favorece flare · Proteinúria + HAS tardia favorece PE — ambos possíveis" }
    ]
  },
  {
    id: "reu3-saf",
    name: "SAF · critérios · trombose · obstétrico",
    specialty: "clinica",
    cards: [
      { front: "O que é SAF?", back: "Trombose arterial/venosa e/ou morbidade obstétrica + anticorpos antifosfolípides persistentes · Primária ou secundária (ex.: LES)" },
      { front: "Anticorpos da SAF?", back: "Anticardiolipina · Anti-β2-glicoproteína I · Anticoagulante lúpico · Confirmar em ≥2 ocasiões (≥12 semanas)" },
      { front: "Manifestação trombótica mais comum?", back: "TVP · Trombose venosa superficial NÃO é critério · Artérias: AVE, coronária, retinal, etc." },
      { front: "Critério obstétrico mais específico × mais sensível?", back: "Mais específico: morte fetal >10 sem em feto morfologicamente normal · Mais sensível: abortamentos recorrentes precoces" },
      { front: "Livedo reticular na SAF?", back: "Manifestação cutânea clássica · Associada a eventos arteriais em alguns · Não fecha diagnóstico sozinho" },
      { front: "Trombocitopenia na SAF?", back: "Comum, leve–moderada · Mecanismo tipo PTI · Raro sangramento espontâneo importante" },
      { front: "Libman-Sacks e SAF/LES?", back: "Endocardite não bacteriana · Embolia cerebral/sistêmica · Valva mitral > aórtica" },
      { front: "Tratamento após trombose (ideia)?", back: "Anticoagulação prolongada (varfarina clássica; alvo INR conforme cenário) · Evitar recorrência · Em gestação: heparina ± AAS" },
      { front: "SAF catastrófica — ideia?", back: "Tromboses múltiplas em órgãos em poucos dias · Alta mortalidade · Anticoagulação + GC ± plasmaférese/IgIV" },
      { front: "Pegadinha laboratorial?", back: "Anticoagulante lúpico pode prolongar TTPa in vitro, mas clinicamente é pró-trombótico — não “anticoagulante” de verdade" }
    ]
  },
  {
    id: "reu3-es-basico",
    name: "Esclerose sistêmica · formas · Raynaud · Ac",
    specialty: "clinica",
    cards: [
      { front: "Dois processos patológicos da ES?", back: "1) Disfunção vascular de pequenas artérias · 2) Fibrose tecidual (fibroblastos / TGF-β) · ≠ focos inflamatórios do LES" },
      { front: "Forma cutânea difusa × limitada?", back: "Difusa: pele em qualquer sítio (tronco/abdome) · Limitada: distal a cotovelos/joelhos e acima das clavículas · Ambas são sistêmicas (órgãos internos!)" },
      { front: "CREST — o que é?", back: "Calcinose · Raynaud · Esophageal dysmotility · Sclerodactyly · Telangiectasia · Forma limitada clássica" },
      { front: "Fenômeno de Raynaud — fases?", back: "Trifásica: palidez → cianose → rubor · Nem sempre completa (65%) · Na limitada pode preceder a pele por anos" },
      { front: "Raynaud primário × secundário?", back: "Primário: mulher <30a, sem gangrena, Ac−/VHS normal, capilaroscopia normal · Secundário: ES e outras CTD" },
      { front: "Frequência de Raynaud nas CTD (apostila)?", back: "ES >90% · LES ~30% · DM/PM 20–30% · Sjögren 20–30%" },
      { front: "Anti-Scl-70 (topo I) — associa?", back: "Forma difusa · Doença intersticial pulmonar · Pior prognóstico cutâneo/pulmonar" },
      { front: "Anticentrômero — associa?", back: "Forma limitada / CREST · Maior risco de HAP · Menos DIP precoce que Scl-70" },
      { front: "Esclerodermia localizada × sistêmica?", back: "Localizada (morfeia, golpe de sabre): pele sem Raynaud/órgãos típicos da ES · Sistêmica: vascular + fibrose visceral" },
      { front: "Forma visceral sem pele?", back: "Esclerose sistêmica sem esclerodermia · Órgãos internos sem lesão cutânea · Menos lembrada, mas existe" }
    ]
  },
  {
    id: "reu3-es-clinica-tx",
    name: "Esclerose sistêmica · órgãos · tratamento",
    specialty: "clinica",
    cards: [
      { front: "Fácies clássica da ES?", back: "Nariz afilado · Lábios retesados · Perda de pregas · Microstomia · Esclerodactilia ± contraturas" },
      { front: "GI na ES — o que cai?", back: "Hipomotilidade esofágica / DRGE · Disfagia · Pseudo-obstrução · Má absorção · Estômago em melancia (GAVE) em alguns" },
      { front: "Pulmão na ES — dois eixos?", back: "Doença intersticial (mais difusa/Scl-70) · HAP (mais limitada/anticentrômero) · Principal causa de morte" },
      { front: "Rim na ES — crise renal?", back: "HAS maligna + IRA · Mais na difusa precoce · IECA é a âncora (mesmo com creatinina alta) · Evitar prednisona alta desnecessária" },
      { front: "Úlcera digital — manejo ideia?", back: "Aquecer · Cessar tabaco · CCB · Prostanoides/PDE5/bosentana em graves · Cuidado com infecção" },
      { front: "Capilaroscopia — papel?", back: "Padrão escleroderma (megacapilares, avascular) ajuda a distinguir Raynaud secundário" },
      { front: "Tratamento cutâneo/inflamatório?", back: "MTX / MMF em selecionados · GC com cautela (crise renal) · Não há “cura” da fibrose estabelecida" },
      { front: "HAP na ES — ideia?", back: "Suspeitar em limitada + dispneia · Ecocardiograma / cateterismo · Vasodilatadores pulmonares específicos" },
      { front: "DIP na ES — ideia?", back: "MMF ou ciclofosfamida em progressivos · Reabilitação · Oxigênio se hipoxemia" },
      { front: "Pegadinha ES × LES?", back: "ES = fibrose + Raynaud + Ac Scl-70/centrômero · LES = ites + anti-dsDNA/Sm + hipocomplementemia" }
    ]
  },
  {
    id: "reu3-miopatias",
    name: "Polimiosite · dermatomiosite · MCI",
    specialty: "clinica",
    cards: [
      { front: "Miopatias inflamatórias idiopáticas — trio?", back: "Dermatomiosite (DM) · Polimiosite (PM) · Miosite por corpúsculos de inclusão (MCI)" },
      { front: "Clínica muscular comum DM/PM?", back: "Fraqueza proximal simétrica (ombro/cintura) · Dificuldade de pentear/levantar da cadeira · CK tipicamente ↑" },
      { front: "Pele da dermatomiosite?", back: "Heliótropo · Pápulas de Gottron (MCF/IFP) · Sinal do xale · Fotossensibilidade · Mais associada a malignidade que PM" },
      { front: "Patogênese DM × PM?", back: "DM: imunocomplexos / microangiopatia muscular · PM: T-CD8+ citotóxico direto na fibra" },
      { front: "MCI — pistas?", back: "Homem >50a · Distal + assimétrica · Quedas (quadríceps) · Flexores dos dedos · Resposta pobre a imunossupressão" },
      { front: "Anti-Jo-1 — síndrome?", back: "Síndrome antissintetase: miosite + interstício pulmonar + artrite + fenômeno de Raynaud + mãos de mecânico" },
      { front: "Diagnóstico — exames-chave?", back: "CK/aldolase · EMG · RM muscular · Biópsia · Ac miosite-específicos · Excluir hipotireoidismo/drogas" },
      { front: "Rastreio de câncer na DM?", back: "Sim — DM adulta associa neoplasia oculta · Idade-apropriado + sintoma-dirigido" },
      { front: "Tratamento 1ª linha?", back: "Corticoide em dose imunossupressora · MTX/AZA/MMF como poupadores · IgIV em refratários/cutâneo grave" },
      { front: "Pulmão na miosite — alerta?", back: "DIP pode dominar o quadro (esp. antissintetase) · Dispneia ≠ só fraqueza diafragmática" },
      { front: "DM × LES cutâneo — DD rápido?", back: "Gottron/heliótropo + fraqueza proximal + CK↑ → DM · LES: malar/discoide + outros critérios sistêmicos" }
    ]
  },
  {
    id: "reu3-sjogren",
    name: "Síndrome de Sjögren",
    specialty: "clinica",
    cards: [
      { front: "Sjögren — definição?", back: "Doença autoimune de glândulas exócrinas → xerostomia + xeroftalmía (síndrome seca) ± extraglandular" },
      { front: "Primária × secundária?", back: "Primária: isolada · Secundária: com outra CTD — sobretudo AR (30–50%), também LES (10–25%), ES (~1%)" },
      { front: "Epidemiologia da primária?", back: "Prevalência ~0,5–1% · Mulheres 9:1 · 4ª–5ª décadas" },
      { front: "Teste de Schirmer — corte clássico?", back: "≤5 mm em 5 min sugere deficiência lacrimal · Rosa bengala / escore ocular também usados" },
      { front: "Histopatologia diagnóstica?", back: "Biópsia de glândula salivar menor · Escore de foco ≥1 · SS é CTD com alvo facilmente biopsiável" },
      { front: "Autoanticorpos típicos?", back: "Anti-Ro/SSA · Anti-La/SSB · FAN frequentemente + · FR pode +" },
      { front: "Complicação neoplásica temida?", back: "Linfoma (MALT / não-Hodgkin) · Parótida persistente + sintomas B + IgM monoclonal alertam" },
      { front: "Síndrome de Mikulicz?", back: "Aumento bilateral de parótidas/submandibulares/lacrimais · Mais ligado a causas secundárias / DD amplo" },
      { front: "Tratamento da seca?", back: "Lágrimas/saliva artificial · Ciclosporina tópica ocular · Pilocarpina/cevimelina se reserva glandular · Hidratação mucosal" },
      { front: "Extraglandular — o que pensar?", back: "Artralgia/artrite · Raynaud · Interstício pulmonar · RTA tubular · Vasculite cutânea · Mais na primária" },
      { front: "DD da síndrome seca?", back: "Fármacos anticolinérgicos · HIV/HCV · Sarcoidose · Desidratação — não é Sjögren automático" }
    ]
  },
  {
    id: "reu3-dmtc",
    name: "Doença mista do tecido conjuntivo (DMTC)",
    specialty: "clinica",
    cards: [
      { front: "O que é DMTC?", back: "Overlap com feições de LES + ES + miopatia · Marcador sorológico: anti-U1-RNP em alto título" },
      { front: "Clínica clássica da DMTC?", back: "Raynaud · Mãos inchadas / esclerodactilia · Artrite · Miosite · Pode ter serosite e HAP" },
      { front: "Anti-RNP — papel?", back: "Quase necessário ao conceito clássico · Também aparece em LES/overlaps · Título alto favorece DMTC" },
      { front: "Pulmão na DMTC?", back: "HAP e DIP são causas importantes de morbimortalidade · Seguir como ES/miopatia" },
      { front: "Rim na DMTC × LES?", back: "Nefrite grave menos frequente que no LES “puro” · Mas pode ocorrer — não negligenciar" },
      { front: "Tratamento — ideia?", back: "Conforme órgão dominante · GC + imunossupressor na miosite/artrite · Vasodilatadores no Raynaud/HAP · HCQ em feições lúpicas" },
      { front: "DMTC × síndrome de overlap indiferenciada?", back: "DMTC: fenótipo + anti-RNP alto · Overlap/UCTD: critérios incompletos sem o pacote clássico" },
      { front: "Pegadinha de prova?", back: "Mulher + Raynaud + mãos inchadas + anti-RNP → pensar DMTC · Não forçar LES se anti-dsDNA/Sm negativos e quadro típico" }
    ]
  },
  {
    id: "reu3-vasc-acg-pmr",
    name: "Vasculites · conceito · ACG · PMR",
    specialty: "clinica",
    cards: [
      { front: "O que são vasculites?", back: "Inflamação da parede vascular · Primárias (idiopáticas) × secundárias (infecção, droga, CTD, neoplasia)" },
      { front: "Classificar vasculite — eixo prático?", back: "Calibre do vaso (grande / médio / pequeno) · ANCA · Órgãos-alvo · Histologia/angiografia somam critérios" },
      { front: "Púrpura palpável sugere qual calibre?", back: "Pequenos vasos / vênulas pós-capilares · Ex.: hipersensibilidade, IgA (Henoch-Schönlein)" },
      { front: "Arterite de células gigantes (ACG) — perfil?", back: "Idoso >50a · Cefaleia nova · Claudicação mandibular · Amaurose · Artéria temporal espessada/dolorosa · VHS/PCR ↑↑" },
      { front: "Complicação temida da ACG?", back: "Cegueira por neurite óptica isquêmica · Tratar com GC sem esperar biópsia se alta suspeita" },
      { front: "Biópsia da temporal — regras?", back: "Confirma diagnóstico · Pode ser negativa (saltatória) · Iniciar prednisona antes não invalida se feita em poucos dias" },
      { front: "Polimialgia reumática — clínica?", back: "Dor/rigidez proximal (ombro/cintura) em idoso · VHS alto · Sem fraqueza verdadeira de miosite · Resposta dramática a GC baixo–moderado" },
      { front: "PMR × ACG?", back: "Overlap frequente · Todo PMR: perguntar cefaleia/visual/mandíbula · ACG exige dose maior de GC" },
      { front: "Tratamento ACG (ideia)?", back: "Prednisona 40–60 mg/dia (maior se ameaça visual) · Tocilizumabe/MTX em poupadores selecionados · AAS em alguns protocolos" },
      { front: "Leucocitoclasia / necrose fibrinoide?", back: "Termos histológicos inespecíficos · Aparecem em várias vasculites · Não fecham etiologia sozinhos" }
    ]
  },
  {
    id: "reu3-vasc-takayasu",
    name: "Arterite de Takayasu",
    specialty: "clinica",
    cards: [
      { front: "Takayasu — quem e quais vasos?", back: "Mulher jovem · Aorta e ramos principais (subclávias, carótidas, renais) · “Doença sem pulso”" },
      { front: "Clínica clássica?", back: "Assimetria de PA/pulsos · Sopros · Claudicação de membros · Tontura/AVE · HAS renovascular · Fase sistêmica febril prévia possível" },
      { front: "Diagnóstico — papel da imagem?", back: "Angio-TC/RM/PET ou arteriografia · Estenoses longas, oclusões, dilatações · Biópsia raramente acessível" },
      { front: "Tratamento clínico (apostila)?", back: "Prednisona 1 mg/kg → desmame para 5–10 mg · MTX 15–25 mg/sem se refratário · MMF pode ajudar manutenção" },
      { front: "Revascularização — quando?", back: "Estenose sintomática irreversível · Preferir com doença em remissão · Bypass / angioplastia · Bentall se IAo grave selecionada" },
      { front: "Takayasu × ACG — DD rápido?", back: "Takayasu: <40a, aorta/ramos · ACG: >50a, ramos cranianos/temporal · Ambos grandes vasos granulomatosos" },
      { front: "Morbimortalidade vem de quê?", back: "ICC · IAM · AVE · IRA — isquemia de órgãos-alvo" },
      { front: "Pegadinha de PA?", back: "Medir nos quatro membros · Braço “sem pulso” pode mascarar HAS real no outro lado" }
    ]
  },
  {
    id: "reu3-vasc-anca",
    name: "Vasculites ANCA · GPA · EGPA · PAM",
    specialty: "clinica",
    cards: [
      { front: "ANCA — dois padrões clássicos?", back: "c-ANCA / anti-PR3 · p-ANCA / anti-MPO · Ativam neutrófilos (apostila) → lesão vascular" },
      { front: "GPA (Wegener) — tríade clássica?", back: "Vias aéreas superiores + pulmão + rim · Granulomatose necrosante de pequenos/médios vasos" },
      { front: "Sinais ORL do GPA?", back: "Rinite/sinusite purulento-sanguinolenta · Úlcera/necrose septal · Otite · Estenose subglótica" },
      { front: "Pulmão-rim — quem entra?", back: "GPA · PAM · Goodpasture · Hemoptise + GN rapidamente progressiva" },
      { front: "PAM — diferença do GPA?", back: "Pequenos vasos sem granuloma clássico · Anti-MPO/p-ANCA · Capilarite pulmonar + GN · Sem destruição ORL granulomatosa típica" },
      { front: "EGPA (Churg-Strauss) — jeitão?", back: "Asma + eosinofilia + vasculite · Neuropatia · Pode ter ANCA (MPO) · Granulomas eosinofílicos" },
      { front: "Rim nas ANCA?", back: "GN pauci-imune necrosante com crescentes · Urgência — tratar rápido" },
      { front: "Indução grave (ideia moderna/clássica)?", back: "GC + rituximabe ou ciclofosfamida · Plasmaférese em selecionados (hemorragia alveolar/GN grave)" },
      { front: "Manutenção após remissão?", back: "Rituximabe / AZA / MTX conforme órgão e protocolo · Longa vigilância de recidiva" },
      { front: "Pegadinha GPA × cocaína/levamisole?", back: "Lesão septal e ANCA atípicos podem mimetizar · História de droga ilícita importa" }
    ]
  },
  {
    id: "reu3-vasc-pan-behcet",
    name: "PAN · IgA · Behçet · outras",
    specialty: "clinica",
    cards: [
      { front: "PAN clássica — calibre e órgãos?", back: "Artérias de médio calibre · Rim (HAS, infarctos — sem GN glomerular típica) · Mesentério · Nervos · Testículo · Pele" },
      { front: "PAN e hepatite B?", back: "Associação clássica · Forma “secundária” indiferenciável · Tratar vírus + vasculite conforme gravidade" },
      { front: "Mononeurite múltipla — significado?", back: "Lesão assimétrica de nervos por isquemia dos vasa nervorum · Muito típica de PAN e outras vasculites de médio vaso" },
      { front: "PAN × PAM — rim?", back: "PAN: vasculite de artérias interlobares/arcuadas, ANCA−, sem GN · PAM: GN pauci-imune, ANCA+" },
      { front: "Vasculite por IgA (Henoch-Schönlein)?", back: "Púrpura palpável em MMII · Artralgia · Dor abdominal · Nefropatia IgA · Mais em crianças, ocorre em adultos" },
      { front: "Behçet — critérios clínicos chave?", back: "Aftas orais recorrentes (obrigatórias) + genitais + olho (uveíte/panuveíte) + pele (pseudofoliculite) · Patergia" },
      { front: "HLA do Behçet (Oriente)?", back: "HLA-B51 · Mais grave em homens jovens · Distribuição Rota da Seda" },
      { front: "Olho no Behçet — risco?", back: "Uveíte / panuveíte → amaurose · Urgência oftalmológica" },
      { front: "Tromboangeíte obliterante — ideia?", back: "Buerger · Tabagista jovem · Artérias/veias de extremidades · Claudicação, Raynaud, úlceras · Parar de fumar é a terapia" },
      { front: "Kawasaki — lembrete R1?", back: "Vasculite de médio vaso na criança · Febre ≥5d + mucocutâneo · Coronárias · AAS + IgIV" }
    ]
  },
  {
    id: "reu3-amiloidose",
    name: "Amiloidoses",
    specialty: "clinica",
    cards: [
      { front: "Amiloidose — conceito?", back: "Grupo de doenças com depósito extracelular de amiloide → disfunção de órgãos · Não é uma doença única" },
      { front: "Três componentes do amiloide?", back: "Fibrila proteica (define o tipo clínico) · Glicosaminoglicanos · Componente sérico P" },
      { front: "AA × AL — diferença prática?", back: "AA: proteína sérica A (inflamação crônica — AR, FFM, infecções) · AL: cadeias leves (plasmócitos / mieloma)" },
      { front: "Órgãos clássicos na amiloidose sistêmica?", back: "Rim (proteinúria/Síndrome nefrótica) · Coração (restrição) · Fígado · Neuropatia · Língua macroglossia (AL)" },
      { front: "Diagnóstico histológico?", back: "Biópsia (tecido subcutâneo/reto/órgão) · Vermelho-Congo + birrefringência verde sob luz polarizada" },
      { front: "Amiloidose na FFM / AR?", back: "AA secundária a inflamação crônica · Colchicina na FFM previne · Controlar doença de base" },
      { front: "Alzheimer é amiloidose “clássica” da apostila?", back: "Depósitos amiloide-like intracelulares/diferentes — NÃO entram no conceito clássico de amiloidose sistêmica" },
      { front: "Mensagem de prova?", back: "Nefrótico + cardiopatia restritiva + Congo-red+ → amiloidose · Tipar AA vs AL muda o tratamento" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-reu3.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log("wrote", out, "·", decks.length, "decks ·", decks.reduce((n, d) => n + d.cards.length, 0), "cards");
