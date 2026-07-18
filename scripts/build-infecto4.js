/**
 * Flashcards Infectologia · Inf4 (ITU + pele + osteomielite)
 * Fonte: D:\MedHub R1\CM\Infectologia\INf4.pdf
 * Acrescenta decks a data/flashcards-infecto.json
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "infc-itu-basico",
    name: "ITU · conceitos · agentes",
    specialty: "clinica",
    cards: [
      { front: "ITU baixa × alta — o que inclui?", back: "Baixa: cistite, uretrite, prostatite, epididimite · Alta: pielonefrite (parênquima renal)" },
      { front: "Via principal das ITU?", back: "Ascendente (principal) · Também: hematogênica, linfática, fístula vesicoenteral" },
      { front: "ITU não complicada esporádica — agentes?", back: "E. coli 80–85% · S. saprophyticus 10–15% (mulher sexualmente ativa; padrão verão) · ± Klebsiella/Proteus" },
      { front: "O que torna a ITU “complicada”?", back: "Cálculo · Alteração anatomofuncional · Manipulação urológica/cateter · Condições que ↑ sepse" },
      { front: "ITU em homens — regra da apostila?", back: "Sempre complicada — implica anormalidade anatomofuncional" },
      { front: "ITU por S. aureus — o que sugere?", back: "Bacteremia e foco infeccioso à distância (não típica de via ascendente comunitária)" },
      { front: "Cálculo e germes — associação?", back: "↑ Proteus/Klebsiella (urease → alcaliniza / biofilme)" },
      { front: "Cateter >30 dias — microbiologia?", back: "Polimicrobiana ~70% · Gram− atípicos (Providencia, Morganella…) · Candida em diabético/ATB amplo" },
      { front: "ITU nosocomial — relevância?", back: "ITU = infecção hospitalar mais frequente (~45%) · Principal fonte de bacteremia Gram− hospitalar" },
      { front: "Fímbrias uropatogênicas — pérola?", back: "E. coli/Proteus aderem via fímbrias ao antígeno P da mucosa · Quem não tem grupo P: menos pielonefrite" }
    ]
  },
  {
    id: "infc-itu-dx",
    name: "ITU · diagnóstico · cultura",
    specialty: "clinica",
    cards: [
      { front: "EAS sozinho fecha ITU?", back: "NÃO · Piúria tem baixa acurácia · Várias causas de leucócitos na urina" },
      { front: "Piúria — limiares citados?", back: "≥10 piócitos/campo · Ou ≥5/ml na câmara · Esterase leucocitária no dipstick" },
      { front: "Cultura clássica ≥10⁵ — ainda vale?", back: "Clássico ≥10⁵ UFC/ml · Sintomas de cistite: cortes menores propostos (♀ 10² · ♂ 10³) · Alta: ~10⁴ · Assintomática: permanece 10⁵" },
      { front: "Cilindros leucocitários — significado?", back: "Sugerem acometimento renal (pielonefrite) · Hematúria comum na cistite" },
      { front: "Cistite × uretrite — pista temporal?", back: "Cistite: sintomas em <24h · Uretrite: curso mais arrastado (>7 dias) · Homem: corrimento" },
      { front: "Prostatite aguda — cuidado diagnóstico?", back: "Evitar massagem prostática agressiva — risco de bacteremia/sepse" },
      { front: "Pielonefrite — clínica clássica?", back: "Febre · Calafrios · Dor lombar · ± sintomas de ITU baixa · Leucocitose com desvio" },
      { front: "Quando imagem na pielonefrite?", back: "Sem melhora 48–72h · Suspeita de abscesso/obstrução · Cultura de controle + na gestante/complicada" },
      { front: "Hemocultura na pielonefrite?", back: "Coletar 2 amostras · Especialmente se grave/internado" }
    ]
  },
  {
    id: "infc-itu-tx",
    name: "ITU · tratamento · profilaxia",
    specialty: "clinica",
    cards: [
      { front: "Cistite não complicada — opções top?", back: "Fosfomicina 3 g dose única · Nitrofurantoína 5 dias · (FQ 3 dias eficaz, mas evitar na cistite simples)" },
      { front: "Fosfomicina × nitrofurantoína — nuance?", back: "Ambas muito usadas · Alguns reservam fosfo para MDR · Comparação citada: nitro pode ser superior" },
      { front: "Pielonefrite — duração?", back: "7–14 dias · Algumas refs: FQ 5 dias se ambulatorial elegível" },
      { front: "Internar na pielonefrite — critérios?", back: "Hipotensão · Vômitos intensos (precisa IV) · Febre com tremores/toxemia · Julgamento clínico" },
      { front: "Prostatite aguda — ATB e tempo?", back: "FQ (ex. cipro) · Começar IV se grave · Total ~30 dias" },
      { front: "Prostatite crônica — tempo?", back: "ATB oral prolongado (FQ ou SMX-TMP) ~3 meses · Refratário → pensar litíase prostática" },
      { front: "Cinco indicações de profilaxia ITU?", back: "(1) ≥3 episódios sintomáticos/ano · (2) Gestante com ITU recorrente · (3) Pós-Tx renal · (4) Prostatite crônica · (5) Criança com RVU" },
      { front: "Como dar profilaxia da ITU?", back: "1×/dia à noite (concentra na urina) · Não gestante sintomática de repetição: 6–12 meses" },
      { front: "Gestante na profilaxia — evitar?", back: "Evitar SMX-TMP · FQ contraindicadas · Usar opções da tabela gestante (nitro/beta conforme trimestre/protocolo)" },
      { front: "Cultura de controle — quando mandatória?", back: "Gestante: 2–4 sem após Tx e mensal até o parto se negativa · Também pielonefrite/bacteremia em alguns contextos" },
      { front: "Abscesso renal — conduta chave?", back: "Drenagem o mais cedo possível + ATB · Sem drenar, resposta ao ATB costuma falhar" }
    ]
  },
  {
    id: "infc-itu-especiais",
    name: "ITU · gestante · cateter · Candida",
    specialty: "clinica",
    cards: [
      { front: "Por que ITU na gestação é grave?", back: "Risco materno + fetal: prematuridade, baixo peso, ↑ morbimortalidade perinatal" },
      { front: "Alterações gestacionais que favorecem ITU?", back: "↓ tônus/peristalse urinária · Compressão vesical · Hidronefrose fisiológica (mais à D)" },
      { front: "Tx renal — ITU precoce?", back: "Até 80% nos 3 primeiros meses sem profilaxia · Com profilaxia ~40% · Pielonefrite oligossintomática + bacteremia/disfunção do enxerto" },
      { front: "ITU associada a cateter — escolha do ATB?", back: "Preferir cultura/antibiograma · Empírico guiado pela gravidade e flora local · Trocar/retirar cateter quando possível" },
      { front: "Candida na urina — quem?", back: "Diabético · ATB amplo · Cateter · Distinguir colonização × ITU × fungúria sistêmica" },
      { front: "Neonato/lactente com ITU — clínica?", back: "Sem disúria clássica · Febre, irritabilidade, mau aspecto · ± urina fétida · Pode ser causa de sepse" },
      { front: "Fator de risco #1 de ITU na mulher adulta?", back: "ITU prévia · Atividade sexual também dispara incidência" }
    ]
  },
  {
    id: "infc-pele-piodermites",
    name: "Pele · impetigo · furúnculo",
    specialty: "clinica",
    cards: [
      { front: "Camadas — ordem superficial→profundo?", back: "Piodermites (impetigo/foliculite/ectima) → erisipela → celulite → fasciíte necrosante" },
      { front: "Impetigo — agentes a cobrir?", back: "S. aureus e S. pyogenes · Bolhoso ~10% · Crostoso mais comum" },
      { front: "Penicilina V/benzatina no impetigo?", back: "NÃO adequadas — degradadas por penicilinases estafilocócicas" },
      { front: "Impetigo localizado — Tx tópico?", back: "Mupirocina ou ácido fusídico · Alternativas: neomicina+bacitracina, retapamulina" },
      { front: "Quando ATB sistêmico no impetigo?", back: "Extenso / múltiplas lesões / sistêmico · Cobrir S.aureus+strepto · MRSA: vanco ou SMX-TMP (CA-MRSA)" },
      { front: "Furúnculo × carbúnculo?", back: "Furúnculo: nódulo supurativo dérmico pós-foliculite · Carbúnculo: múltiplos abscessos profundos com septos · Ambos S. aureus" },
      { front: "Furúnculo simples — conduta?", back: "Calor úmido local · Sem espremer · ATB sistêmico se celulite perilesional >4,5 cm ou carbúnculo" },
      { front: "Ectima — ideia?", back: "Piodermite estreptocócica que ulcera a derme · Bordos elevados" }
    ]
  },
  {
    id: "infc-pele-celulite",
    name: "Pele · erisipela · celulite",
    specialty: "clinica",
    cards: [
      { front: "Erisipela — agente clássico?", back: "Streptococcus pyogenes · “Celulite superficial” com porta de entrada (úlcera/estase)" },
      { front: "Erisipela × celulite — pista clínica?", back: "Erisipela: limites nítidos + aspecto em casca de laranja · Celulite: limites menos definidos, mais profunda" },
      { front: "Erisipela — Tx grave × leve?", back: "Grave: penicilina G cristalina / cefazolina / ceftriaxona · Leve: penicilina procaína/V · Alérgico: eritromicina · 10–14 dias" },
      { front: "Erisipela de repetição — sequela/profilaxia?", back: "Linfedema · Profilaxia indicada para prevenir novos episódios" },
      { front: "Celulite — agentes?", back: "S. pyogenes e S. aureus · Se dúvida erisipela×celulite: cobrir os dois (ex. penicilina + oxacilina)" },
      { front: "Celulite grave — ATB?", back: "Oxacilina ou cefazolina IV · Leve: cefalexina/cefadroxila/clinda/dicloxacilina · 10–14 dias" },
      { front: "Flora após ATB prévio na pele?", back: "Seleciona MRSA e Pseudomonas/BGN — pensar em cobertura ampliada se contexto" },
      { front: "Fasciíte necrosante — posição no espectro?", back: "Mais profunda que celulite · Emergência cirúrgica + ATB amplo (mensagem R1)" }
    ]
  },
  {
    id: "infc-osteo",
    name: "Osteomielite",
    specialty: "clinica",
    cards: [
      { front: "O que é sequestro ósseo?", back: "Fragmento ósseo desvascularizado no pus/necrose · Age como corpo estranho + biofilme → difícil erradicar" },
      { front: "Três vias da osteomielite?", back: "Hematogênica · Contiguidade (mais comum) · Inoculação direta (trauma/cirurgia)" },
      { front: "Agente #1 das osteomielites?", back: "S. aureus (adesinas para fibronectina/colágeno da matriz óssea)" },
      { front: "Osteomielite no falcêmico — agente?", back: "Salmonella #1 · Depois S. aureus · Exceção à regra geral" },
      { front: "Forma hematogênica mais comum no adulto?", back: "Espondilodiscite (disco + vértebras adjacentes) · Fontes: cateter, endocardite, ITU, pele, UDI" },
      { front: "Pé diabético — tipo de osteo?", back: "Por contiguidade a partir de infecção de partes moles/úlcera" },
      { front: "Cierny-Mader — ideia terapêutica?", back: "Estágio 1: ATB isolado pode curar · Estágio 3: precisa cirurgia + ATB" },
      { front: "Duração típica do ATB na osteo?", back: "Ordem de 4–6 semanas (individualizar; recidiva frequente se sequestro/biofilme)" },
      { front: "VHS na osteomielite — pérola?", back: "Pode ser >100 (junto com vasculite/câncer) · Na espondilodiscite: queda >50% no 1º mês sugere boa resposta" },
      { front: "Imagem de escolha (muitas situações)?", back: "RM — mais acurada que cintilografia em vários contextos (ex. espondilodiscite)" },
      { front: "Fratura exposta — risco de osteo?", back: "3–25% conforme desvitalização e profilaxia ATB" },
      { front: "Adulto × criança — apresentação?", back: "Adulto: frequentemente contiguidade/crônica, diagnóstico mais tardio · Criança: hematogênica aguda mais exuberante" }
    ]
  },
  {
    id: "infc-itu-mapa",
    name: "Mapa · ITU/pele/osteo Inf4",
    specialty: "clinica",
    cards: [
      { front: "Cistite simples →?", back: "Fosfo dose única ou nitro 5d · Evitar FQ de rotina" },
      { front: "Pielonefrite →?", back: "Empírico + culturas · 7–14d · Internar se choque/vômito/toxemia" },
      { front: "Homem com ITU →?", back: "Sempre complicada · Investigar causa anatomofuncional" },
      { front: "Gestante →?", back: "Tratar · Cultura de controle · Evitar FQ/SMX-TMP na profilaxia" },
      { front: "Erisipela →?", back: "Strepto · Limites nítidos · Penicilina" },
      { front: "Celulite duvidosa →?", back: "Cobrir strepto + S. aureus" },
      { front: "Osteo falcêmico →?", back: "Salmonella" },
      { front: "Prioridade bancas Inf4?", back: "Cistite/pielonefrite Tx · Homem=complicada · Gestante · Erisipela×celulite · Osteo S.aureus/Salmonella/espondilodiscite" }
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
  "Inf4 ·",
  newDecks.reduce((n, d) => n + d.cards.length, 0),
  "cards)"
);
