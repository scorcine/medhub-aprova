/**
 * Flashcards Nefrologia · Nefro 5 (litíase · HPB · oncouro · cistos)
 * Fonte: D:\MedHub R1\CM\Nefrologia\Nefro 5.pdf
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "nef-litiase-clinica",
    name: "Litíase · tipos · cólica · imagem",
    specialty: "clinica",
    cards: [
      { front: "Composição mais comum dos cálculos?", back: "Cálcio 70–80% (oxalato Ca mono/di) · Depois estruvita 10–20% · Ácido úrico 5–10% · Cistina 2–3%" },
      { front: "Estruvita — o que é?", back: "Fosfato amônio-Mg (triplo) · ‘Infeccioso’ · Bactérias urease+ (Proteus, Klebsiella) · pH alcalino 7,5–8 · Coraliforme clássico" },
      { front: "Ácido úrico — pistas?", back: "Urina ácida (pH <5) · Radiolúcido no RX · Gota, mieloproliferativos, diarreia crônica · Pode dissolver com alcalinização" },
      { front: "pH e tipo de cálculo?", back: "Ácido (<5): urato/cistina · Alcalino (>7): estruvita/fosfato de Ca" },
      { front: "Cólica nefrética — mecanismo da dor?", back: "Cálculo no ureter → espasmo + ↑pressão + distensão da cápsula · Giordano+ · Irradiação inguinal/testículo/lábio" },
      { front: "Hematúria na litíase?", back: "Em ~90% · 2ª causa de hematúria depois de ITU · Pode ser o único sinal" },
      { front: "Complicação mais temida da litíase obstrutiva?", back: "Pielonefrite obstruída → sepse/pionefrose · Febre/calafrios/leucocitose NÃO são da cólica pura" },
      { front: "Padrão-ouro de imagem na litíase?", back: "TC helicoidal sem contraste · Sens ~98% / esp ~100% · Vê até urato · USG se gestante / sem TC" },
      { front: "Chance de expulsão espontânea?", back: "Inversa ao tamanho · <5 mm: alta chance · Manejo conservador na maioria sem complicação" },
      { front: "Recorrência da litíase?", back: "~10% em 1 ano · 35% em 5a · 50–60% em 10a → doença crônica a controlar" },
      { front: "Yield litíase clínica?", back: "TC sem contraste · Estruvita=urease · Urato=ácido/radiolúcido · Sepse=desobstruir já" }
    ]
  },
  {
    id: "nef-litiase-tratamento",
    name: "Litíase · aguda · LOCE · prevenção",
    specialty: "clinica",
    cards: [
      { front: "Analgesia da cólica — 1ª linha?", back: "AINE (VO ou parenteral) · Opioide se falha/contraindicação (DRC) · Hioscina sem benefício comprovado" },
      { front: "Alfabloqueador na cólica?", back: "Terapia expulsiva médica (ex. tansulosina) em selecionados sem indicação urológica imediata" },
      { front: "Hidratação ‘forçada’ na cólica?", back: "Sem evidência de benefício · Evitar hiper-hidratação cega" },
      { front: "Litíase complicada — definição e 1º passo?", back: "Obstrução + infecção OU IRA pós-renal · 1º DESOBSTRUIR (nefrostomia ou duplo J) — não ‘quebrar’ o cálculo primeiro" },
      { front: "LOCE — 1ª escolha quando?", back: "Maioria dos cálculos renais/ureterais · Evitar se >20 mm, polo inferior ou cálculo muito duro (cistina/brushita)" },
      { front: "Ureteroscopia — melhor para?", back: "Ureter distal (~100% sucesso) · Médio ~90% (≈ LOCE) · Proximal: LOCE ou percutânea preferíveis" },
      { front: "Nefrolitotomia percutânea — papel?", back: "Cálculos grandes/intrarrenais / coraliformes · Substituiu a cirurgia aberta na maioria" },
      { front: "Hipercalciúria idiopática — prevenção?", back: "Tiazídico (HCTZ 12,5–25) ↓calciúria · Alça FAZ O CONTRÁRIO (↑calciúria)" },
      { front: "Hipocitratúria / ATR I — prevenção?", back: "Citrato de potássio (não citrato de Na — restringir Na na litíase de Ca)" },
      { front: "Urato — prevenção?", back: "Alcalinizar urina · Hidratação · ± alopurinol se hiperuricemia/uricosúria" },
      { front: "Estruvita — prevenção?", back: "Erradicar ITU / bactérias urease · Remover todo o cálculo (ninho infeccioso)" },
      { front: "Yield tratamento?", back: "AINE · Desobstruir se sepse · LOCE 1ª linha · Tiazida na hipercalciúria" }
    ]
  },
  {
    id: "nef-hpb",
    name: "HPB · IPSS · fármacos · RTUP",
    specialty: "clinica",
    cards: [
      { front: "Sintomas de prostatismo — eixos?", back: "Obstrutivos (jato fraco, hesitação, residuo) · Irritativos (polaciúria, urgência, nictúria)" },
      { front: "IPSS — faixas?", back: "0–7 leve · 8–19 moderado · 20–35 grave · 7 perguntas 0–5 cada" },
      { front: "Complicações da HPB?", back: "Retenção aguda · Litíase vesical · ITU/prostatite · Falência do detrusor · IRA/DRC pós-renal" },
      { front: "Toque retal — alertas?", back: "Nódulo duro → biópsia (CA) · Volume subestimado por inexperientes · Avaliar tônus anal (neurogênica)" },
      { front: "Alfabloqueadores — papel?", back: "1ª linha sintomática · Seletivos α1a: tansulosina/alfuzosina/silodosina · Melhora em ~3 semanas · Independente do tamanho" },
      { front: "Efeitos adversos dos alfabloqueadores?", back: "Hipotensão postural · Tontura · Rinite · (cuidado em idosos)" },
      { front: "Inibidor da 5-AR — efeito?", back: "Finasterida/dutasterida ↓DHT · ↓~30% volume em ~6 meses · Melhor em próstatas grandes · Disfunção sexual 10–15%" },
      { front: "Terapia combinada HPB?", back: "Alfa + 5-AR em sintomas moderados–graves / próstata volumosa — reduz progressão e retenção" },
      { front: "RTUP — mensagem?", back: "~90% melhoram · Complicação clássica antiga: síndrome de TUR (hipoNa por absorção de irrigante)" },
      { front: "Indicações cirúrgicas clássicas da HPB?", back: "Retenção refratária · ITU recorrente · Litíase vesical · Falência renal obstrutiva · Hematúria refratária · Falha clínica" },
      { front: "Yield HPB?", back: "IPSS · Tansulosina · Finasterida se grande · RTUP se complicação" }
    ]
  },
  {
    id: "nef-ca-prostata",
    name: "Câncer de próstata · PSA · Gleason",
    specialty: "clinica",
    cards: [
      { front: "Histologia dominante do CA de próstata?", back: "Adenocarcinoma · Origem na zona periférica (por isso toque detecta)" },
      { front: "Gleason — ideia?", back: "Soma dos 2 padrões dominantes (1–5) · Quanto maior, pior · Grupos de grau modernos simplificam" },
      { front: "PSA — limitações?", back: "Não é câncer-específico · Sobe em HPB/prostatite/manipulação · 5-AR ↓PSA (~50%) — interpretar com cuidado" },
      { front: "Screening — mensagem prática R1?", back: "Controverso · Decisão compartilhada · TR + PSA em selecionados · Biópsia se suspeito" },
      { front: "Doença localizada — opções?", back: "Active surveillance (baixo risco) · Prostatectomia radical · Radioterapia" },
      { front: "Doença metastática — eixo?", back: "Deprivação androgênica (castração química / antiandrogênios) · ± quimio/novos agentes" },
      { front: "Metástase óssea clássica?", back: "Osteoblástica · Dor óssea · Cintilografia no estadiamento de alto risco" },
      { front: "Yield próstata CA?", back: "Gleason · PSA≠diagnóstico · Vigilância ativa no baixo risco · ADT no metastático" }
    ]
  },
  {
    id: "nef-ca-uro",
    name: "CA bexiga · rim · urotélio",
    specialty: "clinica",
    cards: [
      { front: "CA de bexiga — apresentação clássica?", back: "Hematúria indolor intermitente · Fator: tabaco · Histologia: urotelial (células de transição)" },
      { front: "Tumores superficiais — tratamento local?", back: "Ressecção endoscópica ± BCG intravesical (alto risco: T1, alto grau, CIS)" },
      { front: "BCG intravesical — esquema-ideia?", back: "Semanal ×6 → mensal ≥1 ano · Efeitos: cistite; raro bacilemia → tuberculostáticos" },
      { front: "Tumor invasivo de bexiga (T2+)?", back: "Cistectomia radical ± neoadjuvância · (detalhe conforme estágio)" },
      { front: "CCR — tríade clássica?", back: "Hematúria + massa + dor em flanco · Só <5% têm as três no diagnóstico (tardio)" },
      { front: "CCR — associações clássicas?", back: "Varicocele esquerda súbita · Trombo em veia renal/VCI · Paraneoplásicos (EPO, PTHrP, HAS)" },
      { front: "VHL e rim?", back: "CCR bilateral precoce (<40a) · Hemangioblastomas · Feo · Cistos" },
      { front: "Tumor de Wilms — quem?", back: "Criança · Massa abdominal · ± hematúria/HAS · Nefroblastoma" },
      { front: "Yield oncouro?", back: "Hematúria indolor = bexiga até prova contrária · CCR tríade tardia · BCG no superficial alto risco" }
    ]
  },
  {
    id: "nef-obstrucao-cistos",
    name: "Obstrução · RVU · cistos · hematúria",
    specialty: "clinica",
    cards: [
      { front: "Uropatia obstrutiva — risco?", back: "IRA/DRC se persistir · Desobstruir a tempo preserva rim" },
      { front: "Obstrução crônica — túbulo?", back: "Poliúria/isostenúria · ATR I ou IV · Acidose hiperclorêmica ± hiperK" },
      { front: "RVU — consequências?", back: "Pielonefrite recorrente · Nefropatia por refluxo (GEFS) · HAS na criança · CIC/profilaxia conforme grau" },
      { front: "Causa comum de HAS na criança?", back: "Nefropatia por refluxo / cicatriz renal" },
      { front: "DRPAD — essência?", back: "Autossômica dominante · Cistos rim + fígado · ~4–10% dos dialíticos · Penetrância lenta" },
      { front: "Cisto simples × complexo?", back: "Simples: anecoico, parede fina, reforço posterior · Complexo → Bosniak / risco de malignidade" },
      { front: "Doença cística adquirida?", back: "Paciente em diálise crônica · Risco ↑ de CCR" },
      { front: "Hematúria — origem glomerular × urológica?", back: "Glomerular: dismorfismo/cilindros ± proteinúria · Urológica: coágulos, sem proteinúria importante" },
      { front: "Hematúria + coágulos?", back: "Trato urinário (uroquinase nos túbulos impede coágulo na hematúria glomerular)" },
      { front: "Diurese pós-obstrutiva — cuidado?", back: "Poliúria após desobstrução · Reposição volêmica/eletrólitos criteriosamente" },
      { front: "Yield apêndices?", back: "RVU→HAS pediátrica · DRPAD sistêmica · Bosniak · Hematúria com coágulo = urológica" }
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
  "Nefro5)"
);
