/**
 * Flashcards Infectologia · Inf2 (PAC + influenza + abscesso + ATB)
 * Fonte: D:\MedHub R1\CM\Infectologia\Inf2.pdf
 * Acrescenta decks a data/flashcards-infecto.json
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "infc-pac-basico",
    name: "PAC · conceitos · típica×atípica",
    specialty: "clinica",
    cards: [
      { front: "Definição clínica de pneumonia (PAC)?", back: "Infecção aguda do parênquima pulmonar · Consenso: pneumonia adquirida fora do hospital (comunidade)" },
      { front: "Agente #1 da PAC no adulto?", back: "Streptococcus pneumoniae (pneumococo) — ~30–40% · Diplococo Gram+" },
      { front: "Germes “atípicos” clássicos?", back: "Mycoplasma pneumoniae · Chlamydophila pneumoniae · Legionella pneumophila · (± vírus, Coxiella, C. psittaci)" },
      { front: "Por que Legionella entrou no grupo “atípico”?", back: "Difícil no Gram · Não responde a betalactâmico convencional · Apesar de clínica muitas vezes “típica” e grave" },
      { front: "PAC típica — protótipo clínico?", back: "Início abrupto · Febre alta · Calafrios · Tosse produtiva · Dor pleurítica · Consolidação · Leucocitose com desvio" },
      { front: "PAC atípica — protótipo (Mycoplasma)?", back: "Jovem · Início subagudo · Tosse seca · Febre menor · Parece virose prolongada · Leucocitose só ~20%" },
      { front: "PACS (cuidados de saúde) — status atual?", back: "Conceito ABANDONADO pelo consenso de nosocomial · Não usar PACS para guiar cobertura MDR de rotina" },
      { front: "Via principal até o alvéolo?", back: "Microaspiração de colonização das vias aéreas superiores (maioria) · Hematogênica menos comum (ex.: S. aureus)" },
      { front: "Idoso — apresentação enganosa?", back: "Pode faltar febre/tosse/leucocitose · Prostração, confusão ou taquidispneia podem ser a pista" },
      { front: "Quando buscar etiologia na PAC?", back: "Se o resultado puder mudar o ATB · Grave/internado · Falha empírica · Suspeita específica (influenza, Legionella, TB, MRSA/Pseudomonas)" },
      { front: "Antígeno urinário — quem?", back: "Pneumococo e Legionella · Rápido · Pode positivar após início do ATB · Pneumococo: cuidado com colonização/criança e PAC recente" },
      { front: "Fatores de risco para MRSA/Pseudomonas na PAC?", back: "(1) Infecção prévia por esses germes · (2) Hospitalização + ATB IV nos últimos 90 dias" }
    ]
  },
  {
    id: "infc-pac-rx",
    name: "PAC · radiologia · pistas etiológicas",
    specialty: "clinica",
    cards: [
      { front: "RX normal na pneumonia — quando?", back: "Possível, mas incomum · Retrocardíaco · Desidratação precoce · Imunossuprimido · TC/US ajudam" },
      { front: "Padrão RX mais comum na PAC bacteriana?", back: "Infiltrado alveolar broncopneumônico (não a clássica lobar)" },
      { front: "Pneumonia lobar comunitária — agente?", back: "~90–95% pneumococo · Lobar ≠ o tipo mais frequente mesmo no pneumococo" },
      { front: "“Lobo pesado” — pensar?", back: "Klebsiella pneumoniae (Friedlander) · Alcoólatra/diabético · Lobo superior com abaulamento da cisura" },
      { front: "Pneumatocele — pensar?", back: "Staphylococcus aureus · Cistos de parede fina · Revertem com ATB · Sem drenar de rotina" },
      { front: "Pneumonia redonda (criança) — agente?", back: "Quase sempre S. pneumoniae · Pseudotumor arredondado" },
      { front: "Necrose/cavitação — agentes?", back: "Anaeróbios (aspirativa) · Klebsiella · S. aureus · Pneumococo sorotipo 3 (raro)" },
      { front: "Abscesso × pneumonia necrosante?", back: "Mesmo espectro · Necrosante: cavidades <2 cm · Abscesso: cavidade >2 cm com nível hidroaéreo" },
      { front: "US de tórax na PAC?", back: "À beira-leito — boa acurácia diagnóstica em emergência (apostila)" }
    ]
  },
  {
    id: "infc-pac-escores",
    name: "PAC · CURB · UTI · estabilidade",
    specialty: "clinica",
    cards: [
      { front: "CURB-65 — letras?", back: "C: Confusão · U: Ureia ≥50 mg/dl (ou BUN≥20) · R: FR ≥30 · B: PA baixa (PAS<90 ou PAD≤60) · 65: idade ≥65" },
      { front: "CURB-65 — onde tratar (ideia BR)?", back: "0–1: ambulatorial (se 1 só por idade, ok ambulatorial) · ≥2: considerar internação · Sempre julgar clinicamente" },
      { front: "CRB-65 — diferença?", back: "Sem ureia · Útil no ambulatório/APS quando não há lab" },
      { front: "PSI × CURB — quem a apostila BR prefere?", back: "Autores BR sugerem CURB-65 (mais simples; validado para gravidade) · Internacionais: PSI · Provas: CURB cai mais (memorizável)" },
      { front: "Critérios maiores ATS/IDSA de PAC grave?", back: "Choque com vasopressor · OU ventilação mecânica invasiva → UTI" },
      { front: "Critérios menores ATS/IDSA — quantos para UTI?", back: "≥3 menores (ou 1 maior) · FR≥30 · PaO2/FiO2≤250 · Multilobar · Confusão · Ureia≥50 · PAS<90 · Leuco<4k · Plaq<100k · T<36°C" },
      { front: "Conversão IV→VO — ideia?", back: "Deglute bem · Sinais vitais estáveis >24h (afebril/quase, FR≤24, PAS≥90) · Melhora clínica" },
      { front: "Antes de parar o ATB — febre?", back: "Estar afebril ≥3 dias (regra prática da apostila)" },
      { front: "Duração típica do ATB na PAC?", back: "Branda: 5–7 dias · Grave: 7–14 (alguns até 21) · Ajustar à evolução e ao germe" },
      { front: "Alta — além da conversão VO?", back: "Estado mental basal · Sem anormalidade aguda que exija hospital · Oxigenação ok em AA ou O2 baixo (PaO2>60 / Sat adequada)" }
    ]
  },
  {
    id: "infc-pac-tx",
    name: "PAC · tratamento empírico",
    specialty: "clinica",
    cards: [
      { front: "Ambulatorial sem comorbidade/ATB recente?", back: "Amoxicilina (± clavulanato) OU macrolídeo (azitromicina/claritromicina) · Alternativa: FQ respiratória se alergia" },
      { front: "Ambulatorial com comorbidade ou ATB recente?", back: "Betalactâmico + macrolídeo · OU FQ respiratória (moxi/levo/gemi) em monoterapia" },
      { front: "Comorbidades que contam (ATS/IDSA)?", back: "Coração, pulmão, fígado, rim · DM · Alcoolismo · Neoplasia · Asplenia · Imunossupressão" },
      { front: "Enfermaria (não CTI) — esquema clássico?", back: "Ceftriaxona/cefotaxima ou ampicilina-sulbactam + macrolídeo · OU FQ respiratória em monoterapia" },
      { front: "CTI — cobertura obrigatória?", back: "Pneumococo + Legionella · Betalactâmico antipneumocócico + macrolídeo OU FQ · FQ isolada NÃO para PAC grave" },
      { front: "MRSA na PAC — opções?", back: "Linezolida ou vancomicina · (Clindamicina em alguns contextos de CA-MRSA toxinogênico)" },
      { front: "Pseudomonas na PAC — opções?", back: "Piperacilina-tazobactam · Cefepima · Carbapenêmico antipseudomonas · FQ antipseudomonas · ± combinação · Polimixina se MDR" },
      { front: "ESBL na PAC — droga de escolha?", back: "Carbapenêmico (ex.: ertapenem se não Pseudomonas)" },
      { front: "Aspirativa “simples” — cobertura?", back: "Seguir esquema da PAC (não precisa anaeróbio extra de rotina em muitos consensos) · Quinolona ou cefalo 3ª conforme tabela" },
      { front: "Aspirativa com necrose/abscesso/periodontal grave?", back: "Betalactâmico + inibidor · Pip/tazo · Clindamicina · Ou moxifloxacino · 7–21 dias" },
      { front: "PAC grave + temporada de influenza?", back: "Considerar oseltamivir empírico + ATB da PAC (sobretudo se PCR indisponível)" },
      { front: "Falha terapêutica — 5 hipóteses?", back: "(1) Resistência/ATB errado · (2) Empiema/abscesso/obstrução · (3) Germe não coberto · (4) Febre do fármaco · (5) Não era pneumonia (TEP, vasculite, COP…)" },
      { front: "Espera-se defervescência em quanto tempo?", back: "Em geral até ~72h com ATB adequado · Se não: reavaliar (não só “trocar às cegas”)" },
      { front: "Corticoide na PAC?", back: "Não é rotina da maioria · Considerar em contextos selecionados (choque/SDRA) — não substituir ATB" }
    ]
  },
  {
    id: "infc-pac-agentes",
    name: "PAC · agentes específicos",
    specialty: "clinica",
    cards: [
      { front: "Pneumococo — fatores de risco clássicos?", back: "Idade · DRC · Neoplasia linfoproliferativa · Tx · AIDS · Hipogamaglobulinemia · Asplenia/hipoesplenismo" },
      { front: "Pneumococo resistente a penicilina — mecanismo?", back: "PBP com menor afinidade · Em doses altas, muitos ainda respondem a betalactâmicos" },
      { front: "H. influenzae — nicho clássico?", back: "#1 na pneumonia/traqueobronquite do DPOC · Cocobacilo Gram− · Não tipável no adulto vacinado para Hib" },
      { front: "H. influenzae — tratamento?", back: "Cefuroxima / ceftriaxona / amox-clavulanato · Cobrem produtores de betalactamase" },
      { front: "Moraxella — ideia?", back: "Diplococo Gram− · DPOC · Clínica/espectro parecidos com Haemophilus" },
      { front: "Klebsiella / Friedlander — perfil?", back: "Alcoólatra/diabético · PAC grave · Lobo pesado · Necrose/abscesso · 2ª–3ª causa em graves selecionados" },
      { front: "S. aureus — pistas?", back: "Pós-influenza · Lactentes · Hematogênica (endocardite tricúspide → êmbolos) · Pneumatocele · Necrose/empiema" },
      { front: "S. aureus MSSA comunitário — ATB?", back: "Oxacilina IV (mais eficaz no MSSA de comunidade) · MRSA: vanco/linezolida" },
      { front: "Aspirativa anaeróbia — local e complicações?", back: "Pulmão D (brônquio mais retificado) · Empiema (~90% dos derrames) · Abscesso" },
      { front: "Mendelson × pneumonia bacteriana aspirativa?", back: "Mendelson = pneumonite química horas após macroaspiração · Bacteriana: dias depois · Mendelson ≠ ATB de rotina" },
      { front: "Edêntulo e anaeróbios?", back: "Risco de pneumonia anaeróbia muito menor (menos microbiota periodontal)" },
      { front: "Legionella — gravidade?", back: "2ª–3ª causa de PAC grave · HipoNa · ↑enzimas hepáticas · Água/aerossol · Antígeno urinário · Macrolídeo/FQ (± rifampicina em sepse grave)" },
      { front: "Mycoplasma — faixa etária?", back: "Jovens (escola/adulto jovem) · Surto · Extrapulmonar possível (erupção, hemólise, encefalite)" },
      { front: "Chlamydia pneumoniae — idade?", back: "Mais em idosos (65–80) · Clínica semelhante ao Mycoplasma · 2º atípico comum" },
      { front: "Derrame parapneumônico — yield?", back: "20–70% · Mais em estafilococo/anaeróbios · Marca pior prognóstico · Pensar empiema se não melhora" }
    ]
  },
  {
    id: "infc-pac-influenza",
    name: "Influenza · vacinas · prevenção",
    specialty: "clinica",
    cards: [
      { front: "PAC grave — sempre pensar em influenza?", back: "Sim — infecção/coinfecção · Sobremaneira na temporada · Oseltamivir empírico se PCR indisponível" },
      { front: "Vacina influenza no SUS × privada?", back: "SUS: trivalente em geral · Privada: tetravalente · Campanha prioriza grupos de risco, mas indicação ampla" },
      { front: "Vacina pneumocócica — tipos?", back: "Conjugada (PCV10/13…) e polissacarídica 23-valente (VPP-23)" },
      { front: "Esquema sequencial adulto (ideia apostila)?", back: "PCV-13 seguida 6–12 meses depois por VPP-23 (grupos indicados / ≥60–65a conforme protocolo vigente)" },
      { front: "PCV-10 — uso?", back: "Principalmente pediátrico (calendário) · Adulto: conjugada 13/15/20 conforme atualização local" },
      { front: "Por que vacinar influenza reduz PAC?", back: "Influenza predispoe a superinfecção bacteriana (pneumococo, S. aureus)" },
      { front: "2º agente clássico pós-influenza?", back: "S. aureus (depois do pneumococo)" },
      { front: "Prevenção da PAC — mensagem R1?", back: "Vacina influenza + pneumocócica nos elegíveis · Cessar tabagismo · Higienizar mãos/aspiração" }
    ]
  },
  {
    id: "infc-abscesso",
    name: "Abscesso pulmonar · necrose",
    specialty: "clinica",
    cards: [
      { front: "Abscesso pulmonar — definição RX?", back: "Cavidade >2 cm com nível hidroaéreo · Continuum com pneumonia necrosante" },
      { front: "Agentes do abscesso comunitário?", back: "Anaeróbios (aspirativa) · Klebsiella · S. aureus · ± pneumococo tipo 3" },
      { front: "Tratamento inicial do abscesso?", back: "ATB prolongado cobrindo anaeróbios/aeróbios · Ex.: betalactâmico+inibidor, pip/tazo, clindamicina, moxi (± levo+metro)" },
      { front: "Metronidazol isolado no abscesso?", back: "NÃO — inadequado sozinho · Combinar se usado" },
      { front: "Duração típica?", back: "Semanas (pode chegar a muitas semanas até resolução radiológica/clínica) — individualizar" },
      { front: "Quando drenar abscesso pulmonar?", back: "~5–10% · Principalmente falha clínica ao ATB · Preferir drenagem percutânea/pigtail quando indicada" },
      { front: "Fatores de risco para MDR no abscesso?", back: "ATB recente · Colonização prévia → considerar carbapenêmico inicial" },
      { front: "Abscesso × empiema — distinção prática?", back: "Abscesso = parenquimatoso · Empiema = pleural · Empiema quase sempre precisa drenagem" },
      { front: "Yield de prova — abscesso?", back: "Aspiração + anaeróbios · ATB longo · Drenar se falha · Metro só não basta" }
    ]
  },
  {
    id: "infc-atb-betalact",
    name: "ATB · betalactâmicos · parede",
    specialty: "clinica",
    cards: [
      { front: "Mecanismo dos betalactâmicos?", back: "Anel betalactâmico inibe síntese da parede (PBP) · Bactericidas tempo-dependentes" },
      { front: "Penicilinas antipneumocócicas clássicas?", back: "Penicilina G · Amoxicilina · Ampicilina · (± cefuroxima/ceftriaxona/cefotaxima)" },
      { front: "Cefalosporina 1ª geração — cobertura?", back: "Cefazolina/cefalexina: Gram+ incl. MSSA · Poucos Gram− (E. coli, P. mirabilis, Klebsiella) · Sem MRSA · Sem boa cobertura pneumococo grave/atípicos" },
      { front: "Ceftriaxona na PAC — papel?", back: "Betalactâmico antipneumocócico de enfermaria/UTI · Sempre associar cobertura de atípico (macrolídeo/FQ) se esquema dual" },
      { front: "Ampicilina-sulbactam — quando brilha?", back: "PAC enfermaria · Aspirativa/abscesso (anaeróbios) · Ampicilina sozinha não cobre anaeróbios orais bem" },
      { front: "Pip/tazo — nicho?", back: "Pseudomonas · Aspirativa grave/abscesso · Nosocomial · Ampla cobertura incl. anaeróbios" },
      { front: "Carbapenêmico — ESBL?", back: "Droga de escolha para Enterobacterales ESBL+ · Ertapenem se sem Pseudomonas · Mero/imipenem se Pseudomonas/grave" },
      { front: "KPC / carbapenemase — escolha?", back: "Polimixinas (B ou colistina) · No pulmão: considerar ATB inalatório + IV (níveis pulmonares baixos da polimixina)" },
      { front: "Oxacilina — para quem?", back: "MSSA · Mais eficaz que vanco no S. aureus sensível · Não serve para MRSA" },
      { front: "Vancomicina — mecanismo/uso?", back: "Inibe parede (D-Ala-D-Ala) · MRSA · Enterococo resistente à ampicilina · Não é 1ª linha para MSSA" },
      { front: "Linezolida × vancomicina na pneumonia MRSA?", back: "Ambas opções · Linezolida: boa penetração pulmonar · Atenção: mielossupressão, interações MAO" },
      { front: "Inibidor de betalactamase — ideia?", back: "Clavulanato/sulbactam/tazobactam protegem o betalactâmico de muitas betalactamases · Amox-clav, ampi-sulb, pip/tazo" }
    ]
  },
  {
    id: "infc-atb-outros",
    name: "ATB · macrolídeo · FQ · AG · outros",
    specialty: "clinica",
    cards: [
      { front: "Macrolídeos — alvo ribossomal?", back: "Subunidade 50S · Impedem elongação peptídica · Azitro/claritro/eritro" },
      { front: "Macrolídeo na PAC — cobre o quê?", back: "Atípicos (Mycoplasma, Chlamydia, Legionella) · Alguns pneumococos (resistência crescente) · Por isso combo com betalactâmico no internado" },
      { front: "FQ respiratórias — quais?", back: "Levofloxacino · Moxifloxacino · Gemifloxacino · Boa cobertura pneumococo + atípicos" },
      { front: "Ciprofloxacino na PAC típica?", back: "Não é FQ “respiratória” clássica para pneumococo · Melhor para Pseudomonas/BGN em outros contextos" },
      { front: "Aminoglicosídeos — alvo?", back: "Subunidade 30S · Bactericidas concentração-dependentes · Nefro/ototoxicidade · Sinergia em endocardite/BGN graves" },
      { front: "Clindamicina — nicho?", back: "Anaeróbios · Toxinas estafilocócicas/estreptocócicas · Abscesso/aspirativa · Cuidado com C. difficile" },
      { front: "Doxiciclina na PAC?", back: "Opção para atípicos / ambulatorial em alguns esquemas · Alternativa a macrolídeo" },
      { front: "Metronidazol — cobertura?", back: "Anaeróbios (bom abaixo do diafragma) · No abscesso pulmonar: NÃO monoterapia" },
      { front: "Polimixina — quando?", back: "BGN MDR / carbapenemase · Nefro/neurotoxicidade · Pulmão: ± inalatória" },
      { front: "Mapa rápido ATB × sítio de ação?", back: "Parede: betalactâmicos, vanco · 50S: macrolídeo, clinda · 30S: AG, tetra · DNA: FQ · Membrana: polimixina" },
      { front: "Tempo × concentração — ideia R1?", back: "Betalactâmicos: tempo>MIC · AG/FQ: pico/AUC · Infusão prolongada de beta pode ajudar em graves" },
      { front: "Yield ATB nas provas deste bloco?", back: "Esquema PAC por cenário · MRSA/Pseudomonas · ESBL=carbapenem · Anaeróbio no abscesso · Não FQ só no CTI" }
    ]
  },
  {
    id: "infc-pac-mapa",
    name: "Mapa · PAC Inf2",
    specialty: "clinica",
    cards: [
      { front: "Fluxo R1 da PAC?", back: "Clínica+RX → CURB/PSI → ambulatório/enfermaria/UTI → empírico por cenário → reavaliar 48–72h" },
      { front: "Ambulatório sem risco →?", back: "Amox (± clav) ou macrolídeo · Com risco: beta+macro ou FQ" },
      { front: "Enfermaria →?", back: "Ceftriaxona + macrolídeo (ou FQ mono)" },
      { front: "UTI →?", back: "Beta antipneumocócico + macro/FQ · Nunca FQ isolada · ± oseltamivir · ± MRSA/Pseudomonas se risco" },
      { front: "Pistas RX rápidas?", back: "Lobo pesado=Klebsiella · Pneumatocele=S. aureus · Redonda=pneumococo (criança) · Cavidade=anaeróbio/Kleb/S.aureus" },
      { front: "PACS?", back: "Abandonado — não escalar MDR só por asilo/diálise" },
      { front: "Prioridade bancas Inf2?", back: "CURB · Empírico por local · Legionella/UTI · Abscesso/anaeróbio · Influenza · Pistas RX" },
      { front: "Droga-chave deste bloco?", back: "Amox · Azitro · Ceftriaxona · Levo/moxi · Pip/tazo · Vanco/linezolida · Oseltamivir · Clinda" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-infecto.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
const byId = new Map(existing.map((d) => [d.id, d]));
for (const d of newDecks) byId.set(d.id, d);
const decks = Array.from(byId.values());
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log(
  "wrote",
  out,
  "·",
  decks.length,
  "decks ·",
  decks.reduce((n, d) => n + d.cards.length, 0),
  "cards · (+",
  newDecks.length,
  "Inf2 ·",
  newDecks.reduce((n, d) => n + d.cards.length, 0),
  "cards)"
);
