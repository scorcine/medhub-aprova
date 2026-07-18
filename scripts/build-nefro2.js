/**
 * Flashcards Nefrologia · Nefro 2 (tubulointerstício + vascular)
 * Fonte: D:\MedHub R1\CM\Nefrologia\Nefro 2.pdf
 * Acrescenta decks a data/flashcards-nefro.json
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "nef-nta",
    name: "NTA · FENa · pré-renal",
    specialty: "clinica",
    cards: [
      { front: "Causas de IRA hospitalar — ordem (apostila)?", back: "1º pré-renal 55–60% · 2º NTA 35–40% · 3º pós-renal 5–10%" },
      { front: "Quando suspeitar de doença tubulointersticial?", back: "Poliúria/isostenúria + distúrbios HE/AB (hipoK, acidose hiperclorêmica) desproporcionais à TFG" },
      { front: "FENa pré-renal × NTA?", back: "Pré-renal: FENa <1% · urina concentrada, Na baixo · NTA: FENa >1% · urina diluída, Na alto" },
      { front: "Exceções clássicas da FENa?", back: "Pré-renal + diurético → FENa pode >1% · GN / vascular / pré-renal “puro” podem ter FENa <1% mesmo intrínsecas" },
      { front: "Segmentos mais vulneráveis na NTA isquêmica?", back: "Túbulo proximal (parte reta) + alça ascendente espessa (medula externa) — alta demanda de ATP" },
      { front: "Mecanismos da oligúria na NTA?", back: "Feedback tubuloglomerular (aferente contrai) · Plugs de células no lúmen · Backleak para o interstício" },
      { front: "Recuperação típica da NTA?", back: "Função volta em ~7–21 dias nos sobreviventes · Fase poliúrica possível" },
      { front: "NTA não oligúrica × oligúrica — exemplos?", back: "Não oligúrica: aminoglicosídeo (principal), anfo B, aciclovir… · Oligúrica/vasoconstritora: contraste, ciclosporina, tacrolimus" },
      { front: "Indicações clássicas de diálise na IRA/NTA?", back: "Uremia sintomática · EAP/HAS grave · HiperK refratária · Acidose grave · (AEIOU)" },
      { front: "Choque → NTA — limiar prático?", back: "Hipofluxo se PAM <80 · NTA se hipoperfusão grave/prolongada (>60 min) ou com nefrotoxinas/DRC" }
    ]
  },
  {
    id: "nef-nta-toxicos",
    name: "NTA tóxica · AG · contraste · drogas",
    specialty: "clinica",
    cards: [
      { front: "Aminoglicosídeos — padrão de NTA?", back: "Não oligúrica · 10–20% elevam escórias · Em geral a partir da 2ª semana · Dose/duração importam" },
      { front: "Contraste iodado — jeitão?", back: "Vasoconstrição aferente · Pode mimetizar pré-renal (FENa baixa) · Oligúrica mais típica · Risco↑ em DRC" },
      { front: "Ciclosporina/tacrolimus — rim?", back: "Vasoconstrição ± NTA · Bioquímica pode parecer pré-renal · Pós-Tx" },
      { front: "Anfotericina B — extras tubulares?", back: "Além de NTA: hipoMg · DI nefrogênico · ATR tipo I · HipoPO4/hipoCa possíveis" },
      { front: "Aciclovir IV em bolus — mecanismo?", back: "Cristais intratubulares · NTA não oligúrica · Cristalúria + hematúria + lombalgia · 10–30%" },
      { front: "Pentamidina IV — pérola?", back: "IRA >25% (em geral 2ª sem) · HiperK desproporcional à IRA (↓Na no coletor)" },
      { front: "Etilenoglicol — lesão renal?", back: "Cristais de oxalato de Ca nos túbulos → IRA" },
      { front: "Prevenção da NTA tóxica — ideia?", back: "Hidratar · Evitar nefrotoxinas empilhadas · Ajustar dose/intervalo · Suspender AINE/IECA se hipovolemia" }
    ]
  },
  {
    id: "nef-rabdo-slt",
    name: "Rabdomiólise · lise tumoral",
    specialty: "clinica",
    cards: [
      { front: "Rabdomiólise — tríade laboratorial clássica?", back: "CPK↑↑ (MM; muitas vezes >10.000) · Mioglobinúria (urina escura) · ± IRA oligúrica (30–40%)" },
      { front: "Eletrólitos na rabdo?", back: "HiperK · HiperPO4 · HipoCa · Acidose AG elevado (lactato + urato)" },
      { front: "Tratamento inicial da rabdo (rim)?", back: "Volume agressivo · Alcalinizar urina pH 6–7 só se não oligúrico · Corrigir hiperK · Evitar Ca de rotina" },
      { front: "Por que evitar Ca de rotina na rabdo?", back: "Risco de precipitar fosfato de Ca no músculo + hiperCa de rebote na recuperação" },
      { front: "SLT — liberação típica?", back: "Hiperuricemia · HiperK · HiperPO4 · HipoCa · Risco de IRA por cristais de urato/fosfato" },
      { front: "Prevenção da SLT — hidratação e urato?", back: "Hidratação vigorosa · Alopurinol ou rasburicase no risco médio/alto · Bicarbonato NÃO de rotina (só se acidose) — risco de fosfato de Ca" },
      { front: "Rabdo × SLT — overlap?", back: "Ambas: hiperK + hiperPO4 + hipoCa + IRA · Contexto: trauma/imobilização vs quimio/linfoma" },
      { front: "Yield R1?", back: "CPK + volume na rabdo · Rasburicase/alopurinol na SLT · Não alcalinizar SLT às cegas" }
    ]
  },
  {
    id: "nef-nia",
    name: "Nefrite intersticial aguda",
    specialty: "clinica",
    cards: [
      { front: "NIA — quadro clássico?", back: "IRA após droga nova · Piúria/hematúria · Proteinúria não nefrótica · ± rash/febre/eosinofilia" },
      { front: "Eosinofilúria — o que prova?", back: "Sugere NIA (corante de Hansel) · NÃO específica — também no ateroembolismo" },
      { front: "FENa na NIA × GNDA?", back: "NIA ~ NTA (FENa >1%) · GNDA costuma FENa <1%" },
      { front: "Causas principais de NIA?", back: "1º fármacos · Infecção direta (pielonefrite) · Infecção à distância · Sistêmicas · Idiopática" },
      { front: "Betalactâmicos e NIA — tempo?", back: "Dias–semanas (média ~2 sem) · Sem relação com dose · Suspender ± GC curto" },
      { front: "AINE — padrão especial?", back: "~70%: NIA + lesão mínima (IRA + SN, sem alergia clássica) · ~20% NIA pura · ~10% só DLM" },
      { front: "AINE no DD de IRA + SN?", back: "Junto com amiloidose e DM avançado — lembrar ibuprofeno/fenoprofeno/naproxeno" },
      { front: "Rifampicina e NIA?", back: "TB: rifampicina é o tuberculostático que mais causa NIA · Pior com uso irregular · Suspender → recupera" },
      { front: "NIA × síndrome nefrítica — DD?", back: "Clínica pode cruzar · Rash alérgico → NIA · Artrite/serosite → LES · Dismorfismo ajuda GNDA" },
      { front: "Conduta na NIA farmaco?", back: "Parar o fármaco · ± prednisona 1 mg/kg 1–2 sem com desmame · Poucos precisam diálise" }
    ]
  },
  {
    id: "nef-nic-papila",
    name: "NIC · necrose de papila",
    specialty: "clinica",
    cards: [
      { front: "NIC — clínica dominante?", back: "Perda de concentração (poliúria) + acidificação (ATR) ± azotemia · Sem rash alérgico da NIA" },
      { front: "Causas importantes de NIC?", back: "Obstrução/RVU (criança!) · Pielonefrite crônica · Analgésicos · Lítio · Falciforme · Sjögren/sarcoide · Mieloma" },
      { front: "RVU na criança — mensagem?", back: "Causa clássica de NIC / nefropatia por refluxo · HAS possível já na infância" },
      { front: "Necrose de papila — quem?", back: "DM · Analgésicos · Falciforme · Pielonefrite/litíase · Obstrução · Contraste · >50a (exceto falciforme)" },
      { front: "Necrose de papila — clínica?", back: "Dor em flanco · Hematúria · ± eliminação de tecido · Cultura + em ~3/4 · Pode ser bilateral (2/3)" },
      { front: "Analgésicos e papila?", back: "Nefropatia analgésica = NIC + necrose de papila clássica de prova" },
      { front: "Falciforme e rim?", back: "Necrose de papila / NIC · Hematúria · Concentração prejudicada" },
      { front: "Fanconi na NIA aguda?", back: "Raro na aguda · Mais marco da NIC / lesão proximal crônica" }
    ]
  },
  {
    id: "nef-atr-fanconi",
    name: "ATR · Fanconi · Bartter/Gitelman",
    specialty: "clinica",
    cards: [
      { front: "Todas as ATR — padrão ácido-base?", back: "Acidose metabólica hiperclorêmica · Ânion-gap plasmático normal" },
      { front: "ATR II (proximal) — defeito?", back: "↓ limiar de reabsorção de HCO3 · Perda de bicarbonato até HCO3 estabilizar ~15–20 · Urina pode acidificar depois" },
      { front: "ATR I (distal) — defeito?", back: "Não acidifica urina (pH urinário não <~5,3) mesmo com acidose · HipoK · Litíase/nefrocalcinose" },
      { front: "ATR I × II — dose de álcali?", back: "I: 0,5–2 mEq/kg/dia (menor) · II: doses bem maiores · Preferir citrato de K" },
      { front: "ATR IV — assinatura?", back: "Hiperclorêmica + HIPERCALEMIA · Hipoaldosteronismo/resistência · Acidose leve; hiperK chama atenção" },
      { front: "Quando pensar ATR IV?", back: "Acidose hiperclorêmica + hiperK desproporcional à Cr · DM/DRC distal clássicos" },
      { front: "Ânion-gap urinário — uso?", back: "AGu = (Na+K)−Cl urinário · Negativo → NH4+ ok (perda GI) · Positivo/neutro → ATR (falha em gerar NH4+)" },
      { front: "Síndrome de Fanconi — o que é?", back: "Defeito generalizado do proximal: glicosúria + fosfatúria + aminoacidúria + ATR II + hipoK…" },
      { front: "Fanconi — causa #1 adulto × criança?", back: "Adulto: toxicidade medicamentosa · Criança: cistinose (≠ cistinúria)" },
      { front: "Bartter × Gitelman — DD rápido?", back: "Bartter: criança <6a, poliúria, hipercalciúria, “furosemida” · Gitelman: >6a/adolescente, hipocalciúria + hipoMg, “tiazídico”, sem poliúria" },
      { front: "Liddle — tétrade?", back: "HAS + alcalose + hipoK + aldosterona baixa (pseudo-hiperaldosteronismo)" },
      { front: "Yield ATR?", back: "I = litíase/pH urinário alto · II = Fanconi/proximal · IV = hiperK" }
    ]
  },
  {
    id: "nef-renovascular",
    name: "Estenose artéria renal · DFM · IECA",
    specialty: "clinica",
    cards: [
      { front: "Estenose hemodinamicamente significativa?", back: "Em geral >70–80% do lúmen · Pode causar HAS renovascular e/ou nefropatia isquêmica" },
      { front: "Duas grandes etiologias de EAR?", back: "Aterosclerose (idoso, FRs) · Displasia fibromuscular (mulher jovem)" },
      { front: "DFM — imagem clássica?", back: "“Colar de contas” na artéria renal · Melhor candidata a cura com angioplastia (~50% cura nos estudos)" },
      { front: "HAS renovascular unilateral — mecanismo?", back: "Rim estenótico ↑renina → Angio II → HAS renina-dependente · Rim contralateral “protege” volume" },
      { front: "Estenose bilateral / rim único — mecanismo?", back: "Mais volume-dependente · Nefropatia isquêmica + risco de IRA com IECA/BRA/AINE" },
      { front: "Por que IECA precipita IRA na EAR bilateral?", back: "Angio II contrai eferente e mantém TFG no hipofluxo · Bloquear = cai a filtração" },
      { front: "Quando suspeitar de HAS renovascular?", back: "Início abrupto/acelerado · Assimetria de rins · Sopros · Flash EAP · Piora com IECA · Resistente · Fumante aterosclerótico" },
      { front: "Nefropatia isquêmica — quem?", back: "Idoso >65a · EAR aterosclerótica · Pode ter proteinúria até nefrótica · Até ~20% dos novos dialíticos (EUA, apostila)" },
      { front: "Padrão-ouro diagnóstico?", back: "Arteriografia renal · Triagem: duplex, angio-TC, angio-RM (gadolínio) conforme risco" },
      { front: "Revascularização — expectativa?", back: "DFM: boa chance de cura/melhora · Atero: cura rara; melhora possível · HAS >5 anos → menor chance de cura" },
      { front: "Rim <8 cm na EAR grave?", back: "~20% com obstrução >75% evoluem com atrofia/fibrose — perda de viabilidade" },
      { front: "Yield R1 renovascular?", back: "IECA + EAR bilateral · DFM jovem · Flash EAP · Assimetria renal" }
    ]
  },
  {
    id: "nef-ateroembolo",
    name: "Ateroembolismo · oclusão · trombose venosa",
    specialty: "clinica",
    cards: [
      { front: "Ateroembolismo renal — gatilho?", back: "Cateterismo/cirurgia vascular/anticoagulação em aterosclerótico · Embolos de cristais de colesterol" },
      { front: "Clínica sistêmica do ateroembolismo?", back: "Livedo · Dedo azul/isquemia digital · ± pancreatite · Piora subaguda da função renal" },
      { front: "Lab no ateroembolismo?", back: "Eosinofilia · ± hipocomplementemia · Eosinofilúria possível · VHS↑" },
      { front: "Histologia patognomônica?", back: "Fissuras biconvexas nos vasos (cristais de colesterol dissolvidos no preparo)" },
      { front: "Ateroembolismo × NIA — pegadinha?", back: "Ambos podem ter eosinofilúria · Contexto de procedimento vascular aponta ateroêmbolo" },
      { front: "Oclusão arterial renal aguda — ideia?", back: "Dor lombar + hematúria + elevação de LDH/AST · Embolo/trombose · Imagem vascular" },
      { front: "Trombose de veia renal — associação clássica?", back: "Síndrome nefrótica (esp. membranosa) · Dor + hematúria ± IRA" },
      { front: "Temas vasculares do cap. 2 (mapa)?", back: "EAR/HAS renovascular · Oclusão arterial · Ateroembolismo · Trombose de veia renal" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-nefro.json");
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
  "Nefro2)"
);
