/**
 * Flashcards Psiquiatria · Psi.pdf
 * Fonte: D:\MedHub R1\CM\Psiquiatria\Psi.pdf
 * Prioridade: substâncias → humor → psicose (bancas R1)
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "psi-alcool-clinica",
    name: "Álcool · dependência · CAGE · AUDIT",
    specialty: "clinica",
    cards: [
      { front: "CAGE — o que é e corte?", back: "4 perguntas (Cut down, Annoyed, Guilty, Eye-opener) · ≥2 respostas positivas sugerem dependência de álcool" },
      { front: "AUDIT — faixas de interpretação?", back: "≤7 baixo risco · 8–15 uso de risco · 16–19 uso nocivo · ≥20 provável dependência" },
      { front: "Jeitão clínico de dependência de álcool?", back: "Tolerância · Abstinência · Uso apesar de prejuízo · Vida gira em torno de beber · Falha em obrigações · Abandono de atividades" },
      { front: "Intoxicação aguda por álcool — clínica?", back: "Desinibição → ataxia/disartria → torpor/coma conforme dose · Risco de trauma, aspiração, hipoglicemia" },
      { front: "Alucinose alcoólica × delirium tremens?", back: "Alucinose: alucinações (souvent auditivas) COM consciência preservada · DT: confusão + flutuação + hiperatividade autonômica" },
      { front: "Complicações clínicas clássicas do álcool?", back: "Hepatopatia · Pancreatite · Neuropatia · Cardiomiopatia · Wernicke-Korsakoff · SA fetal" },
      { front: "Síndrome de Wernicke — tríade?", back: "Confusão · Oftalmoplegia/nistagmo · Ataxia · Déficit de tiamina (B1) · Tratar com tiamina ANTES da glicose" },
      { front: "Korsakoff — marca?", back: "Amnésia anterógrada + confabulação · Sequelas de Wernicke não tratada · Pouco reversível" },
      { front: "Síndrome alcoólica fetal — ideia?", back: "Exposição gestacional · Disfomorfismos + déficit neurodesenvolvimento · Prevenção = abstinência na gravidez" },
      { front: "Embriaguez patológica — ideia de prova?", back: "Resposta comportamental desproporcional/violenta a dose relativamente pequena · Conceito cobrado em algumas bancas (USP)" }
    ]
  },
  {
    id: "psi-alcool-abst-tx",
    name: "Álcool · abstinência · DT · Prochaska · fármacos",
    specialty: "clinica",
    cards: [
      { front: "Sinal mais precoce/clássico da abstinência alcoólica?", back: "Tremor · Também: ansiedade, insônia, agitação · Maioria leve–moderada · Autolimitada ~7–10 dias" },
      { front: "Timeline da abstinência?", back: "Leves ~24–36h · Graves (incl. DT) tipicamente ~3–4 dias · Crises convulsivas tônico-clônicas ~3%" },
      { front: "Delirium tremens — tríade/clínica?", back: "Obnubilação/confusão + alucinações/ilusões vívidas (zoopsias) + tremor/sudorese · Hiperatividade autonômica · Risco de morte" },
      { front: "Conduta na abstinência grave / DT?", back: "BDZ (diazepam/lorazepam) titulado · Hidratação · Tiamina IV · Repor eletrólitos · Contenção se risco · Monitorar" },
      { front: "Prochaska e DiClemente — 5 estágios?", back: "Pré-contemplação · Contemplação · Preparação · Ação · Manutenção · (+ recaída em alguns modelos)" },
      { front: "Pré-contemplação × contemplação?", back: "Pré: não vê problema / não planeja mudar · Contemplação: pesa prós/contras, mudança mais real" },
      { front: "Naltrexona no álcool — mecanismo?", back: "Antagonista opioide · Reduz prazer/compulsão de beber · Paciente motivado, sem contraindicação" },
      { front: "Dissulfiram — ideia?", back: "Inibe aldeído-desidrogenase → reação aversiva com álcool · Exige adesão e abstinência · Educar sobre risco" },
      { front: "Intervenção breve — o que é?", back: "1–3 sessões · Avaliar gravidade + feedback motivacional + aconselhamento · APS/Enare gostam do conceito" },
      { front: "Ordem clássica tiamina × glicose?", back: "Tiamina primeiro (ou junto) · Glicose isolada pode precipitar/piorar Wernicke" },
      { front: "Pegadinha de prova no DT?", back: "Não é “só ansiedade” · Tem rebaixamento/confusão · Diferente de alucinose (sensorium claro)" }
    ]
  },
  {
    id: "psi-outras-drogas",
    name: "Cocaína · nicotina · opioides · cannabis · BDZ",
    specialty: "clinica",
    cards: [
      { front: "Intoxicação por cocaína — jeitão?", back: "Agitação · Midríase · Taquicardia/HAS · Euphoria/paranoia · Risco CV (IAM, arritmia) e AVE · Hipertermia" },
      { front: "Abstinência de cocaína — clínica?", back: "Crash: fadiga, hipersonia, anedonia, humor deprimido, craving · Menos risco vital que álcool/BDZ" },
      { front: "Tabagismo — 1ª linha farmacológica?", back: "TRN (adesivo/goma) · Bupropiona · Vareniclina · + aconselhamento / estágios motivacionais" },
      { front: "Intoxicação opioide — tríade?", back: "Miose · Depressão respiratória · Rebaixamento de consciência · Antídoto: naloxona" },
      { front: "Abstinência opioide — ideia?", back: "Desconfortável mas raramente fatal · Mialgia, diarreia, midríase, craving, piloereção · Metadona/buprenorfina em programas" },
      { front: "Cannabis — intoxicação típica?", back: "Euforia · Alteração de percepção · Conjuntivas hiperemiadas · Taquicardia · Ansiedade/paranoia em alguns" },
      { front: "Abstinência de benzodiazepínico — risco?", back: "Ansiedade, insônia, tremor · Convulsão / delirium possíveis · Desmame lento · Alto yield com álcool" },
      { front: "Intoxicação por BDZ — antídoto?", back: "Flumazenil (cautela: precipitação de crise em dependentes/misturas) · Suporte ventilatório" },
      { front: "Anfetaminas / estimulantes — clínica?", back: "Simpatomimético: agitação, midríase, taquicardia, hipertermia, psicose · Similar cocaína" },
      { front: "Mensagem transversal de substâncias?", back: "Intox × abstinência têm clínicas opostas · Álcool/BDZ abstinência pode matar · Estimulantes: risco CV/agitação" }
    ]
  },
  {
    id: "psi-depressao",
    name: "Depressão · critérios · suicídio · antidepressivos",
    specialty: "clinica",
    cards: [
      { front: "Episódio depressivo maior — duração mínima?", back: "≥2 semanas · Sintomas na maior parte do dia · Prejuízo funcional" },
      { front: "Sintomas nucleares da depressão?", back: "Humor deprimido e/ou anedonia · + sono, apetite/peso, energia, culpa, concentração, psicomotor, ideação suicida" },
      { front: "Quando hospitalizar na depressão?", back: "Risco suicida alto · Psicose · Negativa alimentar grave · Sem suporte · Falha ambulatorial grave" },
      { front: "Avaliação de suicídio — o que perguntar?", back: "Ideação · Plano · Intenção · Meios · Tentativas prévias · Fatores de risco/proteção · Nunca omitir a pergunta" },
      { front: "ISRS — papel e exemplos?", back: "1ª linha frequente na depressão/ansiedade · Fluoxetina, sertralina, escitalopram… · Início em 2–4 sem" },
      { front: "Efeitos adversos clássicos dos ISRS?", back: "GI · Disfunção sexual · Agitação inicial · Hiponatremia (idosos) · Síndrome serotoninérgica se combinação" },
      { front: "Síndrome serotoninérgica — ideia?", back: "Hiperreflexia/clonus · Agitação · Hipertermia · Diarreia · Associada a ISRS + IMAO/tramadol etc. · Suspender + suporte" },
      { front: "Bupropiona — quando pensar?", back: "Depressão + tabagismo · Menos disfunção sexual · Evitar se risco convulsivo alto / transtorno alimentar grave" },
      { front: "Depressão secundária — drogas clássicas?", back: "Corticoides · Betabloqueadores · Interferon · Alguns anti-hipertensivos · Sempre excluir causa médica/fármaco" },
      { front: "Tempo típico de manutenção do AD?", back: "Após remissão, manter meses (em geral ≥6) · Recorrentes: manutenção mais longa · Não suspender na melhora precoce" },
      { front: "Pegadinha: luto × depressão?", back: "Luto pode ter tristeza · Depressão: anedonia persistente, culpa excessiva, ideação suicida, prejuízo marcado — critérios e tempo" }
    ]
  },
  {
    id: "psi-bipolar-litio",
    name: "Bipolar · mania · lítio · estabilizadores",
    specialty: "clinica",
    cards: [
      { front: "Mania — duração e clínica?", back: "≥1 semana (ou qualquer duração se hospitalização) · Humor elevado/irritável + energia ↑ · Pouco sono · Grandiosidade · Impulsividade · Pode ter psicose" },
      { front: "Hipomania × mania?", back: "Hipomania: sintomas maniformes sem prejuízo grave nem psicose típica · Mania: prejuízo marcado / hospitalização / psicose" },
      { front: "Bipolar I × II?", back: "I: ≥1 episódio maníaco (depressão não obrigatória) · II: depressão + hipomania (sem mania)" },
      { front: "Ciclagem rápida — ideia?", back: "≥4 episódios de humor/ano (definição clássica) · Apostila também cita alternância muito curta em alguns textos — foco no conceito de alta recorrência" },
      { front: "Erro clássico: AD isolado no bipolar?", back: "Pode induzir virada maníaca · Preferir estabilizador ± AD com cuidado · Identificar história de mania/hipomania" },
      { front: "Lítio — indicações clássicas?", back: "Manutenção do bipolar · Mania aguda (com outros) · Reduz risco de suicídio · Monitorar nível sérico" },
      { front: "Efeitos adversos / toxicidade do lítio?", back: "Tremor · Poliúria/polidipsia (DI nefrogênico) · Hipotireoidismo · Ganho de peso · Intoxicação: ataxia, confusão, convulsão" },
      { front: "Monitoramento do lítio (prova)?", back: "Litemia · Função renal · TSH · Eletrólitos · Cuidado com desidratação, AINE, IECA/diuréticos (↑ nível)" },
      { front: "Outros estabilizadores?", back: "Valproato · Carbamazepina · Lamotrigina (mais depressão bipolar) · Antipsicóticos atípicos na mania" },
      { front: "Distimia × ciclotimia?", back: "Distimia: depressão crônica leve (≥2 anos) · Ciclotimia: oscilações crônicas hipomania leve ↔ depressão leve" }
    ]
  },
  {
    id: "psi-esquizo-clinica",
    name: "Esquizofrenia · critérios · DD psicóticos",
    specialty: "clinica",
    cards: [
      { front: "Esquizofrenia — duração mínima (DSM)?", back: "Sinais contínuos ≥6 meses · Fase ativa com sintomas característicos por período significativo (≥1 mês se não tratado)" },
      { front: "Sintomas positivos clássicos?", back: "Delírios · Alucinações (auditivas típicas) · Pensamento/discurso desorganizado · Comportamento desorganizado/catatonia" },
      { front: "Sintomas negativos?", back: "Embotamento afetivo · Alogia · Abulia/avolição · Anedonia · Isolamento · Pior resposta a fármacos clássicos" },
      { front: "Esquizofreniforme × esquizofrenia?", back: "Mesma clínica · Duração 1–6 meses · Se ≥6 meses → esquizofrenia" },
      { front: "Transtorno psicótico breve?", back: "Sintomas psicóticos 1 dia–1 mês · Retorno ao baseline · Frequentemente estressor" },
      { front: "Transtorno esquizoafetivo — ideia?", back: "Critérios de humor + psicose · Período de psicose sem humor proeminente · Diferente de humor com psicose só na fase afetiva" },
      { front: "Transtorno delirante?", back: "Delírio(s) persistente(s) · Funcionamento relativamente preservado fora do delírio · Sem desorganização típica da esquizofrenia" },
      { front: "DD orgânico da psicose?", back: "Delirium · Intox/abstinência · Endocrino/metabólico · Neurológico · Sempre pensar causa clínica em atípicos/idosos" },
      { front: "Prognóstico melhor — fatores?", back: "Início agudo · Bom funcionamento pré-mórbido · Sintomas afetivos · Sexo feminino · Bom suporte · Tratamento precoce" },
      { front: "Catatonia — pistas?", back: "Estupor · Catalepsia · Flexibilidade cérea · Mutismo · Ecolalia/ecopraxia · Pode ocorrer em humor/esquizo/orgânico" }
    ]
  },
  {
    id: "psi-esquizo-tx",
    name: "Antipsicóticos · EPS · SNM",
    specialty: "clinica",
    cards: [
      { front: "Antipsicóticos típicos × atípicos?", back: "Típicos (haloperidol): mais EPS / discinesia · Atípicos (olanzapina, quetiapina, risperidona…): mais metabólicos, menos EPS (em geral)" },
      { front: "Distonia aguda — clínica e conduta?", back: "Espasmo muscular (torcicolo, oculógiro) horas–dias · Anticolinérgico (biperideno) / anti-histamínico · Urgência" },
      { front: "Acatisia — o que é?", back: "Inquietação subjetiva + necessidade de se mexer · Diferente de ansiedade “pura” · Reduzir dose / trocar / propranolol etc." },
      { front: "Parkinsonismo induzido?", back: "Rigidez, bradicinesia, tremor · Anticolinérgico ou trocar antipsicótico · ≠ Parkinson idiopático necessariamente" },
      { front: "Discinesia tardia — ideia?", back: "Movimentos involuntários (oral-bucal) após uso prolongado · Mais com típicos · Difícil reverter · Prevenir com menor dose/atípicos" },
      { front: "Síndrome neuroléptica maligna — clínica?", back: "Rigidez · Hipertermia · Autonômico instável · CK↑ · Alteração consciência · Emergência — suspender antipsicótico + suporte" },
      { front: "SNM × serotoninérgica — DD rápido?", back: "SNM: rigidez “chumbo”, CK↑, após neuroléptico · Serotoninérgica: hiperreflexia/clonus, diarreia, ISRS/IMAO" },
      { front: "Clozapina — quando e cuidados?", back: "Refratariedade · Risco de agranulocitose → hemograma seriado · Também sialorreia, convulsão, miocardite" },
      { front: "Agitação psicótica aguda — ideia?", back: "Segurança · Contenção se preciso · BDZ ± antipsicótico IM/VO · Tratar causa orgânica se houver" },
      { front: "Efeitos metabólicos dos atípicos?", back: "Ganho de peso · DM · Dislipidemia · Monitorar peso, glicemia, lipídios — olanzapina/cloza entre os piores" }
    ]
  },
  {
    id: "psi-ansiedade-toc",
    name: "Pânico · TAG · fobias · TOC · TEPT",
    specialty: "clinica",
    cards: [
      { front: "Ansiedade × medo (apostila)?", back: "Ansiedade: apreensão vaga/difusa a ameaça desconhecida · Medo: resposta a ameaça conhecida" },
      { front: "Transtorno de pânico — clínica?", back: "Ataques recorrentes inesperados · Pico em minutos · Palpitação, falta de ar, medo de morrer/enlouquecer · ± agorafobia" },
      { front: "Conduta no ataque de pânico agudo?", back: "Reassegurar · Respiração · Excluir emergência clínica se 1ª vez/atípico · BDZ curto se necessário · Longo prazo: ISRS + TCC" },
      { front: "TAG — jeitão?", back: "Preocupação excessiva crônica (≥6 meses) · Tensão muscular, inquietação, fadiga, sono ruim · Difícil controlar a preocupação" },
      { front: "Fobia social × específica?", back: "Social: medo de avaliação/humilhação em situações sociais · Específica: objeto/situação delimitada (altura, animal…)" },
      { front: "TOC — obsessão × compulsão?", back: "Obsessão: pensamento/impulso intrusivo gerador de ansiedade · Compulsão: ato/ritual para neutralizar · Consome tempo/prejuízo" },
      { front: "Tratamento do TOC?", back: "ISRS (às vezes doses altas) · TCC com exposição e prevenção de resposta · Não é “só vontade”" },
      { front: "TEPT — critérios-chave?", back: "Exposição a trauma · Revivescência (flashbacks/pesadelos) · Evitação · Hiperalerta · Humor/cognição negativos · >1 mês" },
      { front: "Estresse agudo × TEPT?", back: "Estresse agudo: sintomas semelhantes nos primeiros dias–1 mês · TEPT: persistência >1 mês" },
      { front: "Transtorno de adaptação?", back: "Sintomas emocionais/comportamentais após estressor identificável · Desproporcionais · Não preenche outro transtorno maior" }
    ]
  },
  {
    id: "psi-delirium",
    name: "Delirium · confusional agudo",
    specialty: "clinica",
    cards: [
      { front: "Delirium — definição prática?", back: "Alteração aguda e flutuante de consciência/atenção + cognição · Início horas–dias · Causado por condição médica/droga" },
      { front: "Delirium × demência?", back: "Delirium: agudo, flutuante, consciência alterada · Demência: crônico, consciência tipicamente clara (até estágio avançado)" },
      { front: "Fatores de risco clássicos?", back: "Idade avançada · Demência prévia · UTI/pós-op · Polifarmácia · Infecção · Distúrbio metabólico" },
      { front: "Neurotransmissor clássico citado?", back: "Déficit colinérgico (acetilcolina) · Formação reticular · Anticolinérgicos precipitam" },
      { front: "Conduta no delirium?", back: "Tratar causa · Orientar ambiente · Evitar contenção/psicotrópico desnecessário · Haloperidol/atípico se risco grave · Cuidado com BDZ (exceto álcool/BDZ abst.)" },
      { front: "Prognóstico?", back: "Marcador de gravidade · Mortalidade elevada em 1 ano em séries · Reversão depende da causa" },
      { front: "Causas extracranianas comuns?", back: "Infecção · Distúrbio eletrolítico · Hipoxemia · Insuficiência hepática/renal · Drogas/abstinência" },
      { front: "Pegadinha pós-op / idoso?", back: "Agitação flutuante ≠ “demência nova” · Pensar delirium · Revisar medicações e infecção" }
    ]
  },
  {
    id: "psi-demencia",
    name: "Demência · Alzheimer · DD",
    specialty: "clinica",
    cards: [
      { front: "Demência — conceito?", back: "Declínio cognitivo múltiplo com prejuízo funcional · Consciência tipicamente preservada · É síndrome (muitas causas)" },
      { front: "Causas mais frequentes?", back: "Alzheimer (~50–60%) · Vascular (15–30%) · Outras neurodegenerativas / mista" },
      { front: "Por que investigar causa reversível?", back: "~15% potencialmente tratáveis · B12 · Hipotireoidismo · NPH · Hematoma subdural · Depressão (pseudodemência) · Sífilis/HIV conforme contexto" },
      { front: "Alzheimer — clínica típica?", back: "Início insidioso · Memória episódica · Progressão gradual · Afasia/apraxia/agnosia tardias" },
      { front: "Demência vascular — pistas?", back: "Início mais abruptos/escalonado · Fatores de risco CV · Déficits focais · Neuroimagem com infartos" },
      { front: "NPH — tríade?", back: "Demência + ataxia da marcha + incontinência urinária · TC/RM com ventrículos dilatados · Derivação em selecionados" },
      { front: "Pseudodemência depressiva?", back: "Idoso deprimido com queixa cognitiva · Respostas “não sei” · Humor guia · Pode melhorar com tratamento da depressão" },
      { front: "Tratamento sintomático Alzheimer (ideia)?", back: "Inibidores da colinesterase / memantina em selecionados · Cuidado do cuidador · Tratar sintomas comportamentais com parcimônia" }
    ]
  },
  {
    id: "psi-alimentares",
    name: "Anorexia · bulimia",
    specialty: "clinica",
    cards: [
      { front: "Anorexia nervosa — núcleo?", back: "Restrição energética → baixo peso · Medo intenso de engordar · Perturbação da imagem corporal" },
      { front: "Epidemiologia clássica da anorexia?", back: "Mulheres >> homens · Início na adolescência · Mais em contextos que valorizam magreza" },
      { front: "Tipos de anorexia?", back: "Restritiva · Purga/compulsão-purga · Ambos com baixo peso (diferente da bulimia de peso normal)" },
      { front: "Complicações médicas da anorexia?", back: "Bradicardia · Osteoporose · Amenorreia · Hipotermia · Distúrbios eletrolíticos · Risco de morte" },
      { front: "Critério de internação (ideia)?", back: "Instabilidade clínica · IMC muito baixo · Recusa alimentar grave · Ideação suicida · Falha ambulatorial" },
      { front: "Bulimia nervosa — núcleo?", back: "Compulsões alimentares recorrentes + comportamentos compensatórios (vômito, laxantes, exercício) · Peso frequentemente normal" },
      { front: "Sinais físicos da bulimia?", back: "Callos de Russell · Hipertrofia parotídea · Erosão dentária · Distúrbios eletrolíticos (hipoK)" },
      { front: "Tratamento — ideias?", back: "Equipe multidisciplinar · Realimentação cuidadosa na anorexia · TCC · Fluoxetina tem evidência na bulimia · Evitar bupropiona (risco convulsão)" },
      { front: "Anorexia × bulimia — DD rápido?", back: "Anorexia: baixo peso essencial ao diagnóstico · Bulimia: episódios de compulsão+purga com peso tipicamente normal/sobrepeso" },
      { front: "Pegadinha metabólica na realimentação?", back: "Síndrome de realimentação (hipoP, hipoK, hipoMg) · Repor e monitorar — emergência nutricional" }
    ]
  },
  {
    id: "psi-psico-basico",
    name: "Psicopatologia · delírio · alucinação",
    specialty: "clinica",
    cards: [
      { front: "Ilusão × alucinação?", back: "Ilusão: percepção deformada de objeto real · Alucinação: percepção sem objeto externo" },
      { front: "Delírio — definição?", back: "Juízo falso incorrigível, não compartilhado pela cultura · Convícção plena · Pode ser persecutório, grandioso, de referência…" },
      { front: "Alucinação auditivas típicas da esquizofrenia?", back: "Vozes comentando / conversando · Sonorização ou publicação do pensamento" },
      { front: "Anedonia — o que é?", back: "Incapacidade de sentir prazer · Central na depressão · Também em negativos da esquizofrenia" },
      { front: "Embotamento afetivo × apatia?", back: "Embotamento: perda profunda da vivência afetiva (esquizo/negativos) · Apatia: hiporreatividade (comum na depressão)" },
      { front: "Labilidade afetiva?", back: "Mudanças súbitas e imotivadas de humor · Incontinência: não contém a reação afetiva" },
      { front: "Obnubilação / torpor / coma?", back: "Alterações quantitativas da consciência · Delirium afeta nível/atenção · Relevante no orgânico" },
      { front: "Confabulação — contexto?", back: "Preenche lacunas de memória com fantasia · Clássica em Korsakoff" },
      { front: "Catatonia — catalepsia?", back: "Hipertonia com postura mantida · Flexibilidade cérea · Parte do espectro catatônico" },
      { front: "DSM-5-TR × CID-11 — ideia?", back: "Sistemas de classificação atuais · Critérios operacionais · Prova cobra mais clínica do que decorar códigos" }
    ]
  },
  {
    id: "psi-personalidade",
    name: "Transtornos de personalidade · clusters",
    specialty: "clinica",
    cards: [
      { front: "O que é transtorno de personalidade?", back: "Padrão persistente de experiência/comportamento desvio da cultura · Início precoce · Rígido · Prejuízo · Não é “episódio”" },
      { front: "Cluster A — quais?", back: "“Estranhos/excêntricos”: paranoide · Esquizoide · Esquizotípico" },
      { front: "Cluster B — quais?", back: "“Dramáticos/impulsivos”: antissocial · Borderline · Histriônico · Narcisista" },
      { front: "Cluster C — quais?", back: "“Ansiosos/medrosos”: evitativo · Dependente · Obsessivo-compulsivo de personalidade (≠ TOC)" },
      { front: "Borderline — jeitão?", back: "Instabilidade afetiva · Medo de abandono · Impulsividade · Autolesão/suicidabilidade · Relacionamentos intensos e instáveis" },
      { front: "Antissocial — pistas?", back: "Desrespeito a direitos · Engano · Impulsividade · Irresponsabilidade · Falta de remorso · História de conduta na infância/adolescência" },
      { front: "TOC × personalidade obsessivo-compulsiva?", back: "TOC: obsessões/compulsões egodistônicas · TP obsessiva: perfeccionismo/controle egossintônico, sem rituais clássicos necessariamente" },
      { front: "Tratamento geral dos TP?", back: "Psicoterapia é âncora (ex.: DBT no borderline) · Fármacos para sintomas-alvo (humor, impulsividade) · Expectativa realista" },
      { front: "Yield de prova?", back: "Borderline e antissocial caem mais · Clusters ajudam a organizar · Não priorizar tipologias raras" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-psi.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log("wrote", out, "·", decks.length, "decks ·", decks.reduce((n, d) => n + d.cards.length, 0), "cards");
