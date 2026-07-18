/**
 * Fecha lacunas de cobertura Inf1–5 vs capítulos das apostilas.
 * - Inf1: himenolepíase + formas extras da esquistossomose
 * - Inf2: PN/PAVM (bloco grande omitido)
 * - Inf3: PML · PIL/PINE · HIV-PAH
 * - Inf4: bacteriúria assintomática (gestante)
 */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "data", "flashcards-infecto.json");
const decks = JSON.parse(fs.readFileSync(out, "utf8"));
const byId = new Map(decks.map((d) => [d.id, d]));

function addCards(id, cards) {
  const d = byId.get(id);
  if (!d) throw new Error("deck missing " + id);
  const fronts = new Set(d.cards.map((c) => c.front));
  let n = 0;
  for (const c of cards) {
    if (fronts.has(c.front)) continue;
    d.cards.push(c);
    fronts.add(c.front);
    n++;
  }
  console.log("+", n, "cards →", id, "(total", d.cards.length + ")");
}

function upsertCard(id, front, back) {
  const d = byId.get(id);
  if (!d) throw new Error("deck missing " + id);
  const existing = d.cards.find((c) => c.front === front);
  if (existing) {
    existing.back = back;
    console.log("~ updated →", id, "·", front);
  } else {
    d.cards.push({ front, back });
    console.log("+ 1 card →", id, "·", front);
  }
}

addCards("infc-tenias", [
  {
    front: "Himenolepíase — agente principal?",
    back: "Hymenolepis nana (“tênia anã”) · Cestodo mais comum no mundo · H. diminuta (roedores) é rara no homem"
  },
  {
    front: "H. nana — particularidade do ciclo?",
    back: "Única tênia humana que completa o ciclo SEM hospedeiro intermediário · Autoinfecção + transmissão pessoa-pessoa"
  },
  {
    front: "Tratamento da himenolepíase?",
    back: "Praziquantel (escolha) — esquemas com 2 doses em intervalo de ~10 dias · Alternativa: niclosamida · Em criança: rastrear conviventes"
  }
]);

addCards("infc-esquisto", [
  {
    front: "Enterobacteriose septicêmica prolongada — o que é?",
    back: "Bacteremia persistente (Salmonella > E. coli) aderida ao esquistossoma adulto · Complicação da esquistossomose"
  },
  {
    front: "Neuroesquistossomose — mecanismos?",
    back: "Êmbolos arteriais · Anastomoses porta–Batson · Oviposição in situ após migração anômala"
  },
  {
    front: "Forma pulmonar da esquistossomose?",
    back: "Comum na necrópsia (20–30%) · Raramente isolada · Pode dominar o quadro · Associada a carga/HTP"
  },
  {
    front: "Glomerulopatia esquistossomótica — ideia?",
    back: "Forma renal da esquistossomose · Imunocomplexos/granuloma · Pensar em endemia + alteração renal"
  }
]);

addCards("infc-itu-especiais", [
  {
    front: "Bacteriúria assintomática — quem tratar de rotina?",
    back: "Gestante (risco de pielonefrite/prematuridade) · Pré-procedimento urológico mucoso · NÃO tratar mulher não gestante/idoso assintomático de rotina"
  },
  {
    front: "Bacteriúria na gestante — follow-up?",
    back: "Tratar · Cultura de controle 2–4 sem · Se negativa, repetir mensalmente até o parto (alta recorrência)"
  }
]);

addCards("infc-hiv-neuro", [
  {
    front: "Tríade de déficit neurológico focal na PVHIV?",
    back: "Neurotoxoplasmose · Leucoencefalopatia multifocal progressiva (PML) · Linfoma primário do SNC"
  },
  {
    front: "PML na aids — ideia?",
    back: "Leucoencefalopatia multifocal progressiva · Uma das 3 causas principais de déficit focal · DD com toxo (massa/anel) e linfoma"
  }
]);

addCards("infc-hiv-fungos", [
  {
    front: "Pneumonite intersticial na PVHIV — padrões?",
    back: "PIL (linfocítica) e PINE (não específica) · PIL típica de crianças; <1% dos adultos com HIV"
  },
  {
    front: "PIL — clínica e conduta?",
    back: "Infiltração linfocítica difusa · Em geral oligo/assintomática · Imagem: infiltrado intersticial · TARV reverte · Se muito sintomática: curso breve de glicocorticoide"
  }
]);

addCards("infc-hiv-sistema", [
  {
    front: "HIV-PAH — o que é e prognóstico?",
    back: "~0,5% das PVHIV · Clínica de HAP (dispneia, fadiga, síncope, cor pulmonale) · TARV sem benefício claro · Sobrevida média ~2 anos após o diagnóstico (apostila)"
  }
]);

upsertCard(
  "infc-hiv-mapa",
  "Massa cerebral — mapa?",
  "Múltiplas + gânglios → toxo · Única periventricular anelar → linfoma · Déficit focal sem massa típica: incluir PML no DD · Sempre TARV + conduta específica"
);

const pavm = {
  id: "infc-pavm",
  name: "PN · PAVM · nosocomial",
  specialty: "clinica",
  cards: [
    {
      front: "PN × PAVM — definições?",
      back: "PN: pneumonia ≥48h após internação · PAVM: pneumonia 48–72h após intubação · Entidades distintas (microbiologia/prognóstico)"
    },
    {
      front: "Chamar PAVM de “PN”?",
      back: "NÃO — apostila enfatiza: perfil, diagnóstico, terapia e prognóstico diferem"
    },
    {
      front: "PACS na PN/PAVM — status?",
      back: "Abandonado · Contato com saúde sozinho NÃO justifica cobertura MDR · Usar fatores de risco independentes"
    },
    {
      front: "BGN #1 associado a PN/PAVM?",
      back: "Pseudomonas aeruginosa · Sobrevive na água do circuito do ventilador — drenar; nunca deixar escorrer para o TOT"
    },
    {
      front: "Outros BGN “difíceis” da PAVM?",
      back: "Acinetobacter baumannii · Burkholderia · Stenotrophomonas · Pensar MDR/hospitalar"
    },
    {
      front: "Cabeceira e PAVM?",
      back: "Supina (0°) ↑ muito o risco (esp. com dieta enteral) → microaspiração · Manter cabeceira elevada salvo contraindicação (ex. trauma raquimedular)"
    },
    {
      front: "CPIS no diagnóstico de PN?",
      back: "NÃO usar mais — acurácia limitada · PCT/PCR/sTREM-1: papel incerto para decidir iniciar ATB"
    },
    {
      front: "LBA de rotina na PN?",
      back: "NÃO indicado de rotina · Coleta invasiva mais cara/trabalhosa sem vantagem prática clara vs não invasiva"
    },
    {
      front: "Duração do ATB na PN/PAVM?",
      back: "7 dias (independente do agente) · Prolongar se resposta lenta, abscesso/empiema ou outra infecção que exija mais tempo · Antigos 14–21d não são padrão"
    },
    {
      front: "Pseudomonas na PN — mono × combo?",
      back: "Clássico: 2 antipseudomonas · Literatura só confirma benefício da combinação em contextos selecionados · Ajustar pela cultura"
    },
    {
      front: "MRSA na PN/PAVM — opções?",
      back: "Vancomicina ou linezolida · Desescalonar se cultura negativa/sem risco"
    },
    {
      front: "Germe só sensível a polimixina no pulmão?",
      back: "Polimixina IV + inalatória (níveis pulmonares da IV são baixos)"
    },
    {
      front: "Yield PN/PAVM R1?",
      back: "PN≠PAVM · PACS abandonado · Cabeceira elevada · 7 dias · Pseudomonas/água do circuito · Sem CPIS"
    }
  ]
};

byId.set("infc-pavm", pavm);
console.log("set infc-pavm", pavm.cards.length, "cards");

const merged = Array.from(byId.values());
fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(
  "wrote",
  out,
  "·",
  merged.length,
  "decks ·",
  merged.reduce((n, d) => n + d.cards.length, 0),
  "cards"
);
