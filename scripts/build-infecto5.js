/**
 * Flashcards Infectologia · Inf5 (arboviroses / febres tropicais)
 * Fonte: D:\MedHub R1\CM\Infectologia\Inf5.pdf
 * Acrescenta decks a data/flashcards-infecto.json
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "infc-dengue-clinica",
    name: "Dengue · clínica · patogênese",
    specialty: "clinica",
    cards: [
      { front: "Vetor principal da dengue?", back: "Aedes aegypti · Também A. albopictus · Homem = principal reservatório" },
      { front: "Família/gênero do vírus da dengue?", back: "Flavivirus / Flaviviridae — mesma família da febre amarela · 4 sorotipos no BR (DENV-1–4)" },
      { front: "Teoria de Halstead — ideia?", back: "2ª infecção por sorotipo diferente · Anticorpos heterólogos subneutralizantes opsonizam → ↑ entrada em macrófagos → tempestade de citocinas" },
      { front: "Três fases evolutivas da dengue?", back: "Febril · Crítica (na defervescência, D3–D7) · Recuperação" },
      { front: "Fase febril — quadro clássico?", back: "Febre alta súbita 2–7 dias · Cefaleia · Dor retro-orbitária · Mialgia intensa (“quebra-ossos”) · Artralgia · ± GI" },
      { front: "Classificação MS da dengue?", back: "(1) Caso suspeito · (2) Com sinais de alarme · (3) Dengue grave" },
      { front: "Sinais de alarme — listar?", back: "Dor abdominal intensa · Vômitos persistentes · Hipotensão ortostática/lipotimia · Hepatomegalia >2 cm · Sangramento mucoso · Letargia/irritabilidade · Acúmulo de líquido · Ht em ↑ progressivo" },
      { front: "Quando surge a fase crítica?", back: "Na defervescência (em geral D3–D7) — NÃO negligenciar sinais de alarme nesse momento" },
      { front: "Fisiopatologia da dengue grave?", back: "Extravasamento plasmático → hemoconcentração (Ht↑) → choque · Trombocitopenia (± CIVD)" },
      { front: "Papel do NS1 na gravidade?", back: "Antígeno NS1 + partículas virais agridem o glicocálix endotelial → potencializam extravasamento" },
      { front: "AAS/AINE na dengue?", back: "Contraindicados — risco de sangramento (inibição plaquetária) · Preferir dipirona/paracetamol conforme protocolo" },
      { front: "Diagnóstico até o 5º dia?", back: "Métodos diretos: NS1 · Isolamento · PCR · IgM sobe depois (pico fim da 1ª semana)" }
    ]
  },
  {
    id: "infc-dengue-conduta",
    name: "Dengue · conduta · hidratação",
    specialty: "clinica",
    cards: [
      { front: "Mensagem #1 de conduta na dengue?", back: "Reconhecer sinais de alarme + hidratação adequada evitam óbitos · Reavaliar na defervescência" },
      { front: "Internar na dengue — indicações-chave?", back: "Sinais de alarme · Choque · Sangramento grave · Disfunção orgânica grave · Não ingere · Comprometimento respiratório…" },
      { front: "Grupo A (sem alarme) — ideia?", back: "Ambulatorial · Hidratação VO · Orientar sinais de alarme · Retorno na defervescência" },
      { front: "Com sinais de alarme — onde?", back: "Observação/internação · Hidratação IV cuidadosa · Monitorar Ht/hemodinâmica" },
      { front: "Choque da dengue — tipo?", back: "Hipovolêmico por extravasamento (não cardiogênico primário) · Volume + reavaliação seriada do Ht" },
      { front: "Ht caindo sem sangramento na recuperação — pensar?", back: "Reabsorção do líquido extravasado · Se instável: possível hipervolemia/ICC → reduzir volume ± diurético" },
      { front: "Plaquetopenia isolada indica transfusão?", back: "Não de rotina · Transfundir se sangramento significativo / critérios clínicos (não só número)" },
      { front: "Criança pequena — apresentação?", back: "Inespecífica: febre, choro, irritabilidade · Avaliar alarme com atenção redobrada" },
      { front: "DD febril agudo BR (mapa)?", back: "Dengue · Zika · Chik · Influenza · Lepto anictérica · Exantemáticas · Bacterianas (pielo/pneumonia…)" },
      { front: "Leucocitose com desvio na “dengue” — alerta?", back: "Pensar infecção bacteriana — não omitir foco tratável com ATB" }
    ]
  },
  {
    id: "infc-chik-zika",
    name: "Chikungunya · Zika",
    specialty: "clinica",
    cards: [
      { front: "Chikungunya — vetor e marca clínica?", back: "Aedes · Febre + artralgia intensa/incapacitante · Pode cronificar" },
      { front: "Chik crônica — 1ª linha citada?", back: "Hidroxicloroquina (± sulfassalazina) ~6 semanas · Metotrexato se falha" },
      { front: "Zika — quadro agudo típico?", back: "Exantema + febre baixa/ausente · Conjuntivite não purulenta · Artralgia de pequenas articulações · Prurido" },
      { front: "Zika na gestação — complicação?", back: "Microcefalia e outras malformações do SNC fetal (síndrome congênita)" },
      { front: "Zika e nervo periférico?", back: "Associação com Guillain-Barré · Também mielite/meningoencefalite (raras)" },
      { front: "Dengue × Chik × Zika — pista rápida?", back: "Dengue: mialgia/alarme/extravasamento · Chik: artrite intensa · Zika: exantema+conjuntivite+risco fetal" },
      { front: "Imunidade após Zika?", back: "Maioria adquire imunidade duradoura após infecção (apostila)" },
      { front: "Yield arbovírus R1?", back: "Sinais de alarme dengue · Artralgia Chik · Microcefalia/SGB Zika" }
    ]
  },
  {
    id: "infc-febre-amarela",
    name: "Febre amarela",
    specialty: "clinica",
    cards: [
      { front: "Febre amarela — vírus/vetor urbano?", back: "Flavivirus · Ciclo urbano: Aedes aegypti · Ciclo silvestre: Haemagogus/Sabethes (contexto BR)" },
      { front: "Quadro clássico grave da FA?", back: "Febre · Icterícia · Hemorragia · Insuficiência hepática/renal · Bradicardia relativa possível" },
      { front: "Vacina da febre amarela?", back: "Vírus vivo atenuado 17D · Altamente eficaz · Indicação conforme área/idade/protocolo MS" },
      { front: "Dengvaxia — relação com FA?", back: "Vacina dengue recombinante usa backbone 17D da FA expressando antígenos DENV · Indicada em contextos específicos (soropositivos)" },
      { front: "FA × dengue — DD clássico?", back: "Ambas flavivírus/Aedes · FA: icterícia/hepatite grave proeminente · Dengue: extravasamento/alarme" },
      { front: "Conduta geral FA?", back: "Suporte · Notificação · Sem antiviral específico de rotina · Prevenção = vacina + controle vetorial" }
    ]
  },
  {
    id: "infc-lepto",
    name: "Leptospirose",
    specialty: "clinica",
    cards: [
      { front: "Agente da leptospirose?", back: "Leptospira interrogans (espiroqueta) · Zoonose · Urina de roedores / enchentes" },
      { front: "Doença de Weil — tríade?", back: "Icterícia · Hemorragias · IRA" },
      { front: "Forma anictérica — DD?", back: "Mimetiza dengue · Pensar no contexto de enchente/exposição" },
      { front: "Lepto leve — ATB?", back: "Amoxicilina ou doxiciclina VO 5–7 dias" },
      { front: "Lepto grave — ATB?", back: "Penicilina G cristalina IV ou ceftriaxona IV ≥7 dias · Alérgico: azitromicina IV" },
      { front: "Doxiciclina — contraindicações (apostila)?", back: "Gestante · <9 anos · IRA ou insuficiência hepática" },
      { front: "Surtos urbanos — quando?", back: "Enchentes de verão em zonas urbanas/periurbanas" },
      { front: "Yield lepto R1?", back: "Weil · Enchente · Penicilina/ceftriaxona na grave · DD dengue anictérica" }
    ]
  },
  {
    id: "infc-leishmania",
    name: "Leishmaniose visceral (calazar)",
    specialty: "clinica",
    cards: [
      { front: "Calazar — o que é?", back: "Leishmaniose visceral · “Febre negra” · Forma sistêmica do complexo L. donovani / L. infantum (chagasi)" },
      { front: "Vetor no Brasil?", back: "Lutzomyia longipalpis — mosquito-palha / birigui · Hematofagia crepuscular/noturna" },
      { front: "Quadro clássico do calazar?", back: "Febre prolongada · Hepatoesplenomegalia · Pancitopenia · Emagrecimento · Sem eosinofilia" },
      { front: "1ª escolha no BR (não especiais)?", back: "Antimonial pentavalente (Glucantime) 20 mg Sb5+/kg/dia IV/IM por 20–30 dias (máx ~40)" },
      { front: "Quando anfotericina lipossomal é escolha (MS)?", back: "HIV · <1a ou >50a · Quadros graves · IRA · Falha/intolerância ao antimonial · Outras situações do protocolo" },
      { front: "Refratariedade ao antimonial — pistas?", back: "Baço >10 cm · Fígado >8 cm · Hb <8 · Leuco <3.000 · Plaq <40.000" },
      { front: "DD de esplenomegalia febril?", back: "Calazar · Malária · Tifoide · Katayama · Chagas agudo · Endocardite…" },
      { front: "Yield calazar R1?", back: "Lutzomyia · Pancitopenia + esplenomegalia · Glucantime · Anfo lipossomal nos especiais" }
    ]
  },
  {
    id: "infc-malaria",
    name: "Malária",
    specialty: "clinica",
    cards: [
      { front: "Vetor da malária?", back: "Anopheles (BR: A. darlingi predominante) · Fêmea hematófaga" },
      { front: "Espécies no homem — quem é grave?", back: "P. falciparum = formas graves · BR: P. vivax ~90% dos casos · Também malariae; ovale/knowlesi regionais" },
      { front: "Hipnozoíta — quem tem e por quê importa?", back: "Vivax e ovale · Recidivas · Resistente a drogas só eritrocitárias → precisa primaquina" },
      { front: "Primaquina — cuidados?", back: "Hemólise se G6PD↓ · Evitar <6 meses e gestação · Também metemoglobinemia" },
      { front: "P. vivax e Duffy?", back: "Usa fator Duffy para invadir hemácia · Duffy negativo (muitos africanos): relativa resistência ao vivax" },
      { front: "P. falciparum — cloroquina no BR?", back: "Ineficaz na maioria das cepas desde décadas · Não usar como 1ª linha" },
      { front: "Falciparum não grave — esquema citado?", back: "ACT (ex. artemeter-lumefantrina ou artesunato-mefloquina) + primaquina dose única (gametocitocida) · 2ª linha: quinina+clinda+primaquina" },
      { front: "Vivax — ideia de tratamento?", back: "Cloroquina (ainda útil no vivax BR em geral) + primaquina para hipnozoítas (checar G6PD)" },
      { front: "Notificação na Amazônia?", back: "Compulsória semanal (até 7 dias) na área endêmica · Extra-Amazônia: atenção redobrada a casos importados" },
      { front: "Malária grave — mensagem?", back: "Pensar falciparum · Artesunato/quinina parenteral conforme protocolo · Complicações: cerebral, anemia, IRA, acidose" },
      { front: "Yield malária R1?", back: "Vivax 90% BR · Falciparum=grave · Hipnozoíta/primaquina/G6PD · Anopheles" }
    ]
  },
  {
    id: "infc-maculosa-tifoide",
    name: "Febre maculosa · febre tifoide",
    specialty: "clinica",
    cards: [
      { front: "Febre maculosa — agente/vetor?", back: "Rickettsia rickettsii · Carrapato Amblyomma · Saliva infectada" },
      { front: "Tríade clássica da febre maculosa?", back: "Febre · Cefaleia · Rash (D2–D6) — predileção palmoplantar" },
      { front: "Tratamento da febre maculosa?", back: "Doxiciclina — iniciar na suspeita (não esperar confirmação se grave)" },
      { front: "Febre tifoide — agente?", back: "Salmonella Typhi · Transmissão fecal-oral / água-alimentos" },
      { front: "Clínica clássica da tifoide?", back: "Febre em platô · Bradicardia relativa · Roséolas · Dor abdominal · ± constipação ou diarreia · Esplenomegalia" },
      { front: "Teste de Widal — ideia?", back: "Aglutininas O e H · Sugestivo >1:100 · Muitos FP/FN — cultura é ouro" },
      { front: "Yield maculosa×tifoide?", back: "Maculosa: carrapato+doxi+palmoplantar · Tifoide: Typhi+roséola+Widal limitado" }
    ]
  },
  {
    id: "infc-emergentes",
    name: "COVID · mpox · Ebola",
    specialty: "clinica",
    cards: [
      { front: "COVID-19 — agente?", back: "SARS-CoV-2 (coronavírus) · Quadro respiratório agudo · Alta transmissibilidade" },
      { front: "Mpox — família/transmissão?", back: "Orthopoxvirus / Poxviridae · Contato com animal/humano/material infectado · Não é “doença só de macacos” como reservatório principal" },
      { front: "Ebola — família?", back: "Filoviridae (com Marburg) · Febre hemorrágica grave · Altíssima letalidade potencial" },
      { front: "Mensagem R1 dos emergentes?", back: "Isolamento/EPI · Notificação · Suporte · Vacinas/antivirais conforme protocolo vigente da época" },
      { front: "Mpox × varíola — ideia?", back: "Mesma família Orthopox · Mpox geralmente menos grave · Lesões cutâneas evolutivas" }
    ]
  },
  {
    id: "infc-tropicais-mapa",
    name: "Mapa · tropicais Inf5",
    specialty: "clinica",
    cards: [
      { front: "Aedes transmite?", back: "Dengue · Zika · Chik · FA urbana" },
      { front: "Anopheles transmite?", back: "Malária" },
      { front: "Lutzomyia transmite?", back: "Leishmaniose visceral" },
      { front: "Carrapato Amblyomma?", back: "Febre maculosa (R. rickettsii)" },
      { front: "Enchente + icterícia + IRA?", back: "Leptospirose / Weil" },
      { front: "Febre + esplenomegalia + pancitopenia?", back: "Calazar (DD malária/tifoide)" },
      { front: "Defervescência + dor abdominal + Ht↑?", back: "Dengue com alarme / fase crítica" },
      { front: "Artralgia incapacitante pós-febre?", back: "Chikungunya (± crônica)" },
      { front: "Gestante + exantema + conjuntivite?", back: "Zika — investigar SNC fetal" },
      { front: "Prioridade bancas Inf5?", back: "Dengue alarme/hidratação · Malária vivax/falciparum · Lepto/Weil · Calazar · Maculosa" }
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
  "Inf5 ·",
  newDecks.reduce((n, d) => n + d.cards.length, 0),
  "cards)"
);
