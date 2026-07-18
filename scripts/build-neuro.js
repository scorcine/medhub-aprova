/**
 * Flashcards Neurologia · Neurologia.pdf
 * Fonte: D:\MedHub R1\CM\Neurologia\Neurologia.pdf
 * Prioridade por bancas R1: AVC · epilepsia · coma/HIC · cefaleia · neuromuscular
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "neu-avc-isquemico",
    name: "AVC isquêmico · trombólise · trombectomia",
    specialty: "clinica",
    cards: [
      { front: "AVE isquêmico — definição prática?", back: "Deficit neurológico focal súbito por oclusão arterial · Penumbra = tecido isquêmico ainda salvável · Tempo = cérebro" },
      { front: "Fatores de risco clássicos do AVEi?", back: "HAS · DM · Dislipidemia · Tabaco · FA · Estenose carotídea · Idade" },
      { front: "Primeiro exame de imagem na suspeita de AVE?", back: "TC de crânio sem contraste — excluir hemorragia e decidir trombólise · Angio-TC se candidata a trombectomia" },
      { front: "Janela do rtPA IV (apostila / AHA)?", back: "Até 4,5 h do início dos sintomas · Quanto antes, melhor · Reduz sequela (não mortalidade)" },
      { front: "PA para indicar e após trombólise?", back: "Indicar só se PA ≤185×110 · Após rtPA: manter <180×105 nas primeiras 24h" },
      { front: "Contraindicações-chave do rtPA?", back: "TCE/AVEi/cirurgia SNC <3 meses · HIC prévia ou TC com sangue/HSA · Plaq <100k · INR >1,7 · HBPM terapêutica 24h · DOAC <48h · Hipodensidade extensa · Sintomas leves não incapacitantes" },
      { front: "Trombectomia mecânica — quem e até quando?", back: "Oclusão proximal circulação anterior (ACI/M1) · NIHSS ≥6 · ASPECTS ≥3 · Janela clássica 6h; estudos até 24h em selecionados · Pode resgatar falha do rtPA" },
      { front: "AAS na fase aguda do AVEi?", back: "Iniciar 50–325 mg nas primeiras 24–48h (se sem trombólise ou após janela segura pós-rtPA conforme protocolo)" },
      { front: "Controle da PA na fase aguda SEM trombólise?", back: "Não baixar agressivamente — perfusão da penumbra depende da PA · Tratar só se muito elevada / comorbidade (seguir diretriz)" },
      { front: "Prevenção secundária cardioembólica (FA)?", back: "Anticoagulação (INR 2–3 com varfarina ou DOAC se não valvar) · Doppler carótidas + Eco + ECG essenciais na etilogia" },
      { front: "Complicações precoces do AVEi?", back: "Edema/HIC · Transformação hemorrágica (12–48h) · Pneumonia · Crise convulsiva (1ª semana) · Distúrbios Na/glicose" },
      { front: "Hemicraniectomia — ideia?", back: "Edema maligno de ACM / HIC grave refratária · Descompressão em selecionados" }
    ]
  },
  {
    id: "neu-avc-ait-hemorragia",
    name: "AIT · AVEh · HSA",
    specialty: "clinica",
    cards: [
      { front: "Definição moderna de AIT (AHA/ASA)?", back: "Deficit transitório SEM infarto na imagem (DWI) · Não é mais só “<24h”" },
      { front: "Amaurose fugaz — o que é?", back: "Subtipo de AIT · Êmbolo transitório na artéria oftálmica · Monocular" },
      { front: "ABCD2 — itens?", back: "Age ≥60 (1) · BP ≥140/90 (1) · Clínica: paresia (2) / só fala (1) · Duração ≥60min (2) / 10–59 (1) · Diabetes (1) · Total 0–7" },
      { front: "ABCD2 — risco e conduta (apostila)?", back: "6–7 alto (~8% AVE/48h) · 4–5 moderado · 0–3 baixo · Escore >3 até 72h → internar" },
      { front: "AVEh intraparenquimatoso — clínica?", back: "Cefaleia intensa súbita + déficit focal + rebaixamento · Putâmen: hemiplegia faciobraquial (cápsula interna)" },
      { front: "Hematoma cerebelar — indicação cirúrgica (apostila)?", back: ">3 cm (≥15 mL) OU 1–3 cm com hidrocefalia/coma/repercussão · Risco de compressão de bulbo" },
      { front: "Prognóstico ruim no AVEh — fatores?", back: "Volume >30 mL · Hemoventrículo · Glasgow ≤8 · Idade >80 · Infratentorial · Anticoagulação prévia" },
      { front: "HSA — clínica clássica?", back: "“A pior cefaleia da vida” súbita · ± síncope + rigidez de nuca · Até prova em contrário = AVE hemorrágico" },
      { front: "Causa mais comum de HSA espontânea?", back: "Rotura de aneurisma sacular (polígono de Willis) · Menos: MAV" },
      { front: "Hunt-Hess — graus I a V?", back: "I: leve · II: cefaleia/nuca graves ± par · III: confusão/letargia · IV: torpor/hemiparesia · V: coma/descerebração" },
      { front: "1º exame na HSA · se TC negativa?", back: "TC sem contraste (sensível nas primeiras horas) · Se alta suspeita e TC− → punção (xantocromia)" },
      { front: "Complicações da HSA?", back: "Resangramento · Vasoespasmo · Hidrocefalia (aguda/crônica: demência + apraxia + incontinência)" }
    ]
  },
  {
    id: "neu-epilepsia",
    name: "Epilepsia · crises · status",
    specialty: "clinica",
    cards: [
      { front: "Crise × epilepsia?", back: "Crise: evento paroxístico · Epilepsia: crises recorrentes não provocadas / predisposição duradoura" },
      { front: "Crise focal perceptiva × disperceptiva?", back: "Perceptiva: consciência preservada · Disperceptiva: consciência alterada · Podem generalizar secundariamente" },
      { front: "Crise tônico-clônica generalizada — fases?", back: "Tônica → clônica → pós-ictal (confusão, cefaleia, mialgia) · Tipo mais visto na prática" },
      { front: "Ausência típica — pistas?", back: "Criança/adolescente · Breve “desligar” · Sem pós-ictal importante · EEG ponta-onda 3 Hz · Valproato/etosuximida clássicos" },
      { front: "Epilepsia mioclônica juvenil — jeitão?", back: "Adolescente · Mioclonias matinais ± TCG · Sensível a privação de sono · Valproato clássico (cuidado em gestante)" },
      { front: "Status epilepticus — definição prática?", back: "Crise prolongada ou crises sem recuperação · Emergência · Via aérea + BZD + DAE" },
      { front: "1ª linha no status (apostila / BR)?", back: "Diazepam IV (lorazepam IV não disponível no BR) · Midazolam IM se sem acesso · Pode repetir" },
      { front: "2ª linha se persiste após BZD?", back: "Fenitoína · Alternativas: fosfenitoína, valproato, levetiracetam" },
      { front: "Status refratário — próximo passo?", back: "IOT + anestesia (midazolam/propofol/barbitúrico) + EEG contínuo" },
      { front: "Lamotrigina — mensagem da apostila?", back: "1ª linha em quase todos os tipos de crise (exceto espasmos infantis, onde ACTH/vigabatrina)" },
      { front: "Paralisia de Todd — o que é?", back: "Paresia pós-ictal transitória · Não confundir com AVE — história de crise" },
      { front: "Crise provocada — exemplos?", back: "Abstinência álcool/BZD · Hiponatremia · Hipoglicemia · Meningite · Trauma · Não = epilepsia automaticamente" }
    ]
  },
  {
    id: "neu-coma-hic",
    name: "Coma · HIC · neurointensivismo",
    specialty: "clinica",
    cards: [
      { front: "HIC — definição prática?", back: "PIC elevada prejudicando perfusão · PPC = PAM − PIC · Sinais: cefaleia matinal, vômito, papiledema, rebaixamento" },
      { front: "Escala de Glasgow — três eixos?", back: "Abertura ocular · Resposta verbal · Resposta motora · 3–15 · ≤8 = coma grave / considerar via aérea" },
      { front: "Medidas gerais na HIC (apostila)?", back: "Cabeceira elevada · Manitol · Evitar hipóxia/hipercapnia · Sedação adequada · ± DVE se hidrocefalia · Coma barbitúrico se refratário" },
      { front: "Manitol — papel?", back: "Osmoterapia para reduzir PIC / edema · Em AVE com edema e no AVEh conforme protocolo" },
      { front: "Herniação transtentorial — ideia?", back: "Tecido protrui pela fenda do tentório → comprime tronco · Midríase ipsilateral clássica · Urgência extrema" },
      { front: "Delirium × demência (prova)?", back: "Delirium: agudo, flutuante, atenção · Demência: crônica, memória/cognição · Delirium é urgência etiológica" },
      { front: "Avaliação do coma — pilares?", back: "ABC · Glicemia · Pupilas/tronco · Meningismo · TC · Toxinas/metabólico · Não sedar antes do exame se possível" },
      { front: "DVE — quando?", back: "Hidrocefalia com repercussão clínica · Também monitora/drena PIC em neurointensiva" },
      { front: "Pegadinha Glasgow motor?", back: "Localiza dor > flexão/extensão anormal · Decorticação × descerebração ajudam topografia" },
      { front: "Yield em bancas (USP)?", back: "Coma/alteração de consciência ~20% da Neuro USP-SP — semiologia + delirium + HIC" }
    ]
  },
  {
    id: "neu-cefaleia",
    name: "Cefaleias · migrânea · salvas · secundárias",
    specialty: "clinica",
    cards: [
      { front: "Cefaleias primárias principais?", back: "Tensional · Migrânea · Em salvas · (± outras menos comuns)" },
      { front: "Cefaleia tensional — jeitão?", back: "Mais comum · Opressiva bilateral frontoccipital · Leve–moderada · Sem náusea/fotofobia importantes" },
      { front: "Migrânea — critérios clínicos?", back: "Pulsátil · Uni · Moderada–severa · Náusea/foto/fonofobia · Piora com atividade · Aura em alguns" },
      { front: "Aura típica da migrânea?", back: "Escotomas cintilantes · Parestesias · ± basilar/hemiplégica (raras) · Precede ou acompanha a dor" },
      { front: "Abortivo da migrânea?", back: "AINE · Triptanos (maior eficácia) · O mais cedo possível no início da dor" },
      { front: "Quando profilaxia da migrânea?", back: "≥3 crises/mês (apostila) · 1ª linha clássica: betabloqueador · Também amitriptilina, topiramato, valproato, CCB · ± anti-CGRP" },
      { front: "Cefaleia em salvas — pistas?", back: "Homem meia-idade · Dor orbital excruciante · Lacrimejo/congestão · Em “surtos” noturnos · Períodos assintomáticos" },
      { front: "Abortivo clássico da salvas?", back: "O2 100% · Triptano SC/nasal · Profilaxia: verapamil clássico" },
      { front: "Red flags de cefaleia secundária?", back: "Súbita “pior da vida” · Progressiva · Neurológico focal · Febre/nuca · Idoso novo padrão · Papiledema" },
      { front: "Cefaleia da HIC?", back: "Matinal, progressiva, náusea/vômito · ± diplopia · Investigar massa/idiopática" },
      { front: "Arterite temporal — alerta?", back: "Idoso >60 · Cefaleia temporal · Claudicação mandibular · Risco de cegueira · VHS↑ · GC imediato" },
      { front: "Yield (USP/UNIFESP)?", back: "Cefaleias ~13–14% da Neuro — abortivo/profilaxia e red flags caem" }
    ]
  },
  {
    id: "neu-neuromuscular",
    name: "MG · Guillain-Barré · ELA",
    specialty: "clinica",
    cards: [
      { front: "Miastenia gravis — mecanismo?", back: "Ac anti-AChR (pós-sináptico) · ± MuSK · Bloqueio da junção · Fatigabilidade decremental" },
      { front: "MG — clínica clássica?", back: "Ptose/diplopia · Fraqueza que piora com uso e melhora com repouso · Pode generalizar / crise respiratória" },
      { front: "MG e timo?", back: "Jovens: hiperplasia ~65% / timoma ~10% · Timectomia no timoma e beneficia MG generalizada anti-AChR+" },
      { front: "Tratamento sintomático da MG?", back: "Piridostigmina · Imunossupressor (prednisona → AZA/MMF) · Crise: IgIV ou plasmaférese" },
      { front: "Drogas a evitar na MG?", back: "BZD · Betabloqueadores · Alguns antibióticos (aminoglicosídeos etc.) — pioram bloqueio" },
      { front: "Guillain-Barré — definição?", back: "Polineuropatia inflamatória aguda pós-infecciosa · Desmielinizante · Ascendente flácida arreflexa" },
      { front: "Gatilhos infecciosos da SGB?", back: "Campylobacter jejuni · CMV · EBV · 1–3 semanas antes · Anti-GM1; Miller-Fisher: anti-GQ1b" },
      { front: "SGB — risco vital?", back: "25% precisam de VM · Disautonomia · Diparesia facial/bulbar em ~50% · Liquor: dissociação albumino-citológica" },
      { front: "Tratamento da SGB?", back: "IgIV ou plasmaférese · NÃO corticoide como monoterapia clássica · Suporte respiratório" },
      { front: "ELA — o que acomete?", back: "1º e 2º neurônios motores · Espasticidade/Babinski + atrofia/fasciculações · Bulbar frequente · Sensibilidade preservada" },
      { front: "ELA × SGB × MG — DD rápido?", back: "ELA: crônico misto UMN+LMN · SGB: agudo arreflexo ascendente · MG: ocular + fatigabilidade, reflexos ok" },
      { front: "Yield UNIFESP?", back: "Neuromuscular ~21% da Neuro — MG, ELA e Guillain são o trio clássico" }
    ]
  },
  {
    id: "neu-demencia-parkinson",
    name: "Demências · Parkinson",
    specialty: "clinica",
    cards: [
      { front: "Alzheimer — clínica típica?", back: "Memória episódica progressiva · Desorientação · Afasia/apraxia tardias · Idoso · Excluir reversíveis" },
      { front: "Tratamento sintomático do Alzheimer?", back: "IAchE: donepezil (1x/dia, menos hepático), rivastigmina, galantamina · Memantina em moderado–grave" },
      { front: "Demência vascular — pistas?", back: "Degrau / focal · Fatores de risco vasculares · Neuroimagem com infartos · Prevenção = controle vascular" },
      { front: "Demência com corpos de Lewy — alertas?", back: "Alucinações visuais · Parkinsonismo · Flutuação · Sensibilidade a neurolépticos" },
      { front: "Parkinson — tétrade clássica?", back: "Tremor de repouso · Rigidez · Bradicinesia · Instabilidade postural · Assimetria inicial" },
      { front: "Levodopa — por que + inibidor periférico?", back: "Descarboxilase periférica reduz L-Dopa no SNC e causa náusea/taquicardia · Carbidopa/benserazida ↑ oferta central" },
      { front: "Agonistas dopaminérgicos — papel?", back: "Poupar levodopa em jovens · Evitar pergolida/cabergolina (valvulopatia)" },
      { front: "Parkinsonismo atípico — red flags?", back: "Quedas precoces · Oftalmoparesia vertical (PSP) · Autonômico grave precoce (MSA) · Má resposta à levodopa" },
      { front: "DD demência × delirium × depressão?", back: "Tempo + atenção · Delirium agudo · Pseudodemência depressiva pode mimetizar — tratar humor" },
      { front: "Yield (USP-RP/UNIFESP)?", back: "Demências ~14% — Alzheimer + DD com vascular/Lewy caem bem" }
    ]
  },
  {
    id: "neu-em-tumores",
    name: "Esclerose múltipla · tumores (síntese)",
    specialty: "clinica",
    cards: [
      { front: "EM — definição?", back: "Doença desmielinizante autoimune do SNC · Placas na substância branca · Óptico, tronco, cerebelo, medula" },
      { front: "EM — quem sintetiza mielina no SNC × SNP?", back: "SNC: oligodendrócito · SNP: Schwann" },
      { front: "Perfil epidemiológico da EM?", back: "Mulher branca 20–40a · HLA · Associa tireoidite/DM1" },
      { front: "Surto de EM — tratamento agudo?", back: "Corticoide em dose alta · Plasmaférese se grave refratário · Não altera progressão de longo prazo sozinho" },
      { front: "Modificadores de doença (ideia)?", back: "IFN-β, glatirâmer (~↓1/3 recidivas) · Natalizumabe mais eficaz (cuidado LMP/JC)" },
      { front: "Disseminação no tempo e espaço?", back: "Critério diagnóstico clássico · Clínica ± RM · Bandas oligoclonais apoiam" },
      { front: "Tumor de SNC — sinais de alarme?", back: "Cefaleia progressiva · Déficit focal · Crises novas no adulto · HIC · Imagem com contraste" },
      { front: "Metástase × primário — ideia R1?", back: "Metástase mais comum em adulto · Primários: glioma/meningioma conforme idade · Conduta: imagem + estadiamento" },
      { front: "Vertigem central × periférica (rápido)?", back: "Central: neurológico focal, nistagmo multidirecional · Periférica: intensa, náusea, sem déficit de vias longas" },
      { front: "Mensagem Enare (misc)?", back: "Além de AVC/epilepsia: TCE, tumores, EM e movimento aparecem em fatias menores — cobrir o básico" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-neuro.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log("wrote", out, "·", decks.length, "decks ·", decks.reduce((n, d) => n + d.cards.length, 0), "cards");
