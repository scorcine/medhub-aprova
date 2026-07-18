const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "hep-histologia-circulacao",
    name: "Histologia · circulação hepática",
    specialty: "clinica",
    cards: [
      { front: "Lóbulo hepático: como são organizados os hepatócitos?", back: "Massas prismáticas poligonais · Unidades funcionais · Hepatócitos em placas de uma camada celular" },
      { front: "O que preenche os espaços entre as placas de hepatócitos?", back: "Sinusoides hepáticos · Capilares especiais de parede fenestrada" },
      { front: "Quais células formam a parede dos sinusoides?", back: "Células endoteliais · Células de Kupffer" },
      { front: "Células de Kupffer: funções?", back: "Sistema mononuclear fagocitário · Defesa · Hemocaterese com degradação de hemácias senis e liberação de bilirrubina" },
      { front: "Onde fica o espaço de Disse?", back: "Entre as placas de hepatócitos e os sinusoides hepáticos" },
      { front: "Componentes do espaço-porta?", back: "Vênula da veia porta · Arteríola da artéria hepática · Dúctulo biliar · Vasos linfáticos · Bainha de tecido conjuntivo" },
      { front: "O que se encontra no centro do lóbulo hepático?", back: "Vênula central ou centrolobular" },
      { front: "Qual é o trajeto do sangue no lóbulo?", back: "Vasos dos espaços-porta → sinusoides · Fluxo centrípeto → vênula centrolobular" },
      { front: "Quais são os dois vasos aferentes do fígado?", back: "Veia porta · Artéria hepática" },
      { front: "Fluxo e oxigenação hepática: porta × artéria?", back: "Veia porta: 70–75% do fluxo e 50–70% da oxigenação · Artéria hepática: 25–30% do fluxo e 30–50% da oxigenação" }
    ]
  },
  {
    id: "hep-hepatograma-ictericia",
    name: "Hepatograma · icterícia · hepatite aguda",
    specialty: "clinica",
    cards: [
      { front: "Quais são as fases clínicas da hepatite viral aguda?", back: "Prodrômica · Ictérica · Convalescença" },
      { front: "Hepatite viral aguda: sintomas da fase prodrômica?", back: "Mal-estar · Astenia · Anorexia · Náuseas/diarreia · Febre · Artralgia/artrite · Rash/urticária" },
      { front: "O que caracteriza a fase ictérica?", back: "Icterícia · Pode haver colúria, hipocolia fecal e prurido · Sintomas sistêmicos usualmente regridem ou abrandam" },
      { front: "Quando hepatite aguda passa a sugerir cronicidade?", back: "Persistência de replicação viral e queixas clínicas após seis meses" },
      { front: "Hemograma típico da hepatite viral aguda?", back: "Leucopenia inicial por queda de neutrófilos e linfócitos · Evolui para linfocitose · Pode haver linfócitos atípicos" },
      { front: "Síndrome hepatocelular nas hepatites virais agudas?", back: "ALT e AST habitualmente >10× o limite superior · ALT geralmente maior que AST" },
      { front: "Quais outras etiologias causam aminotransferases muito elevadas?", back: "Intoxicação por paracetamol · Hepatite isquêmica · Geralmente ALT maior que AST" },
      { front: "Magnitude da aminotransferase define prognóstico?", back: "Não · Maior elevação indica mais necrose, mas não prevê diretamente falência hepática aguda" },
      { front: "Bilirrubina na hepatite viral aguda?", back: "Podem elevar-se as duas frações · Predomina geralmente a bilirrubina direta · Pode haver colestase intra-hepática" },
      { front: "Quais são as provas de função hepática?", back: "Albuminemia · TAP/INR · Bilirrubinas · Amonemia · Aminotransferases, FA e GGT não são provas funcionais" }
    ]
  },
  {
    id: "hep-hav",
    name: "Hepatite A · HAV",
    specialty: "clinica",
    cards: [
      { front: "HAV: características virológicas?", back: "RNA · Capsídeo icosaédrico · Sem envelope · Picornaviridae · Hepatovirus · Um sorotipo" },
      { front: "Via de transmissão predominante do HAV?", back: "Fecal-oral · Contato interpessoal ou água e alimentos contaminados · Associada a más condições de higiene e saneamento" },
      { front: "Por que as fezes transmitem HAV com eficiência?", back: "Vírus replica nos hepatócitos e é excretado na bile · Títulos fecais são 100–1.000× maiores que no sangue" },
      { front: "O HAV é diretamente citopático?", back: "Não · A lesão hepatocelular decorre principalmente da resposta imune celular do hospedeiro, com linfócitos T CD8+" },
      { front: "Hepatite A: criança × adulto acima de 50 anos?", back: "Criança: usualmente leve; icterícia em 5–10% · >50 anos: icterícia em 70–80%" },
      { front: "Hepatite A cronifica?", back: "Não · É doença aguda e autolimitada" },
      { front: "Qual marcador confirma hepatite A aguda?", back: "Anti-HAV IgM · Pode persistir elevado por 3–6 meses" },
      { front: "O que significa anti-HAV IgG positivo sem IgM?", back: "Infecção passada ou vacinação · Não autoriza o diagnóstico de hepatite A aguda" },
      { front: "Tratamento da hepatite A?", back: "Repouso relativo conforme tolerância · Aumento da ingesta calórica · Sintomáticos quando necessários · Evitar hepatotóxicos e álcool" },
      { front: "Hepatite A fulminante: frequência e risco?", back: "0,1–0,5% dos infectados · Mais frequente em idosos, usuários de drogas IV e indivíduos com hepatopatia prévia" }
    ]
  },
  {
    id: "hep-hbv-aguda",
    name: "Hepatite B aguda · sorologia",
    specialty: "clinica",
    cards: [
      { front: "HBV: particularidade e família?", back: "Único vírus hepatotrópico de DNA · Família Hepadnaviridae" },
      { front: "Quais antígenos do HBV são relevantes?", back: "HBsAg: superfície · HBcAg: core, não detectável no sangue · HBeAg: secretado na alta replicação" },
      { front: "Qual marcador fecha hepatite B aguda?", back: "Anti-HBc IgM positivo · Com HBsAg positivo, confirma hepatite B aguda" },
      { front: "Como diagnosticar HBV agudo na janela imunológica?", back: "HBsAg negativo + anti-HBc IgM positivo · Considerar hepatite B aguda recente" },
      { front: "O que indica o anti-HBc?", back: "Principal marcador de infecção pelo HBV ativa ou curada · Não é neutralizante · Não indica cura isoladamente" },
      { front: "O que HBeAg positivo indica?", back: "Alta replicação viral · Alta viremia · Alta infectividade" },
      { front: "O que significa anti-HBe positivo?", back: "Fase não replicativa · Baixa infectividade · HBeAg desaparece" },
      { front: "Perfil da imunidade por vacinação contra HBV?", back: "Anti-HBs isolado positivo · Sem anti-HBc · Vacina contém apenas HBsAg recombinante" },
      { front: "Qual é a cicatriz sorológica de HBV curado?", back: "Anti-HBs positivo + anti-HBc IgG positivo · Pode haver anti-HBe positivo" },
      { front: "HBV agudo em adulto hígido: tratamento?", back: "Sintomático · Nos casos graves/fulminantes: suporte intensivo + tenofovir ou entecavir · Transplante é a terapia definitiva da fulminante" },
      { front: "Profilaxia pós-exposição ao HBV — o que usar se não vacinado?", back: "Imunoglobulina humana anti-HBV (IGHAHB / HBIg) · Obtida de plasma com altos títulos de anti-HBs · Associar vacinação quando indicada" },
      { front: "HBIg pós-exposição — janela de tempo?", back: "Percutânea: benefício até 7 dias (preferir nas primeiras 24h) · Sexual: até 14 dias" }
    ]
  },
  {
    id: "hep-hbv-cronica",
    name: "Hepatite B crônica · fases · tratamento",
    specialty: "clinica",
    cards: [
      { front: "Definição sorológica de hepatite B crônica?", back: "HBsAg positivo por mais de seis meses · Associado a anti-HBc IgG positivo" },
      { front: "Risco de cronificação do HBV: RN × criança × adulto?", back: "RN: cerca de 90% · Crianças: 25–50% · Adultos: 5–10%" },
      { front: "Qual perfil sugere HBV crônica em replicação?", back: "HBsAg positivo · Anti-HBc IgG positivo · HBeAg positivo · Anti-HBe negativo" },
      { front: "Qual perfil sugere HBV crônica não replicativa?", back: "HBsAg positivo · Anti-HBc IgG positivo · HBeAg negativo · Anti-HBe positivo" },
      { front: "Qual exame é mais sensível para avaliar a replicação do HBV?", back: "DNA-HBV por PCR em tempo real · Correlaciona-se com a carga viral" },
      { front: "Quando suspeitar do mutante pré-core do HBV?", back: "HBsAg >6 meses · HBeAg negativo · Anti-HBe positivo · Aminotransferases elevadas · DNA-HBV pode estar alto" },
      { front: "Por que o mutante pré-core é importante?", back: "Replica intensamente sem elevar HBeAg · Associa-se a hepatite fulminante e exacerbações mais graves da hepatite B crônica" },
      { front: "Qual é a droga de primeira linha citada para HBV crônica?", back: "Tenofovir 300 mg/dia VO · Tratamento de duração indeterminada nos pacientes elegíveis" },
      { front: "HBV: qual antiviral é preferido antes de imunossupressão ou quimioterapia?", back: "Entecavir · Idealmente iniciar antes pelo risco de agudização e insuficiência hepática fulminante" },
      { front: "Gestante com HBeAg positivo ou DNA-HBV >200.000 UI/mL: conduta antiviral?", back: "Tenofovir a partir da 28ª semana · Pode suspender 30 dias após parto se não houver outra indicação de manter tratamento" }
    ]
  },
  {
    id: "hep-hcv-aguda-cronica",
    name: "Hepatite C · aguda · crônica",
    specialty: "clinica",
    cards: [
      { front: "HCV: características virológicas?", back: "RNA de cadeia simples · Capsídeo proteico em envelope lipídico · Flaviviridae · Hepacivirus" },
      { front: "Principal forma de transmissão do HCV?", back: "Contato com sangue contaminado · Exposições percutâneas · Hemotransfusões · Transplantes de órgãos" },
      { front: "Transmissão sexual e vertical do HCV?", back: "Sexual existe e é facilitada por IST/HIV · Vertical: cerca de 5% com carga viral materna >10⁵ cópias/mL · HIV multiplica o risco por 4" },
      { front: "HCV materno contraindica aleitamento?", back: "Não · Suspender se houver fissura mamilar · Evitar se a mulher estiver em tratamento antiviral específico" },
      { front: "HCV agudo: quando surgem sintomas e em quantos pacientes?", back: "4–12 semanas após a exposição · Menos de 20% tornam-se sintomáticos" },
      { front: "Qual é o risco de cronificação após HCV agudo?", back: "Aproximadamente 80%" },
      { front: "HCV-RNA × anti-HCV: quando aparecem?", back: "HCV-RNA: a partir da segunda semana após exposição · Anti-HCV: 30–60 dias depois" },
      { front: "Anti-HCV positivo confirma infecção ativa?", back: "Não · Não diferencia infecção atual de contato prévio curado · Confirmar infecção ativa com HCV-RNA" },
      { front: "HCV agudo: falência hepática fulminante é frequente?", back: "Não · É raríssima" },
      { front: "Quem deve receber tratamento específico para HCV no Brasil?", back: "Todo paciente HCV-RNA positivo, na fase aguda ou crônica, sem critérios de exclusão · Fibrose F3 ou cirrose F4 modificam o esquema" }
    ]
  },
  {
    id: "hep-hdv-hev",
    name: "Hepatites D e E · HDV · HEV",
    specialty: "clinica",
    cards: [
      { front: "Qual condição é necessária para infecção pelo HDV?", back: "Presença do HBV · O HDV depende do HBsAg" },
      { front: "Quem deve ser investigado para HDV?", back: "Todo paciente HBsAg positivo que reside ou esteve em área endêmica para o vírus D" },
      { front: "Coinfecção HBV + HDV: consequência para insuficiência hepática fulminante?", back: "Risco maior que na hepatite B isolada · Usuários de drogas endovenosas são o principal grupo de risco" },
      { front: "Como é o tratamento citado para hepatite D?", back: "Alfapeginterferona + tenofovir ou entecavir por 48 semanas · Pode repetir por mais 48 semanas · Orais mantidos por tempo indeterminado" },
      { front: "Hepatite E: em que cenário a IHF é particularmente grave?", back: "Gestantes em áreas endêmicas · Letalidade de 25–40%" },
      { front: "HEV: como é a IHF fora da gestação?", back: "Evolução incomum · Assim como na hepatite A" },
      { front: "HEV pode cronificar?", back: "Pode ocorrer em imunodeprimidos, especialmente receptores de transplante de órgão sólido" },
      { front: "Estratégia inicial citada na hepatite E crônica em imunodeprimidos?", back: "Redução da intensidade da imunossupressão farmacológica, quando possível" },
      { front: "Quais antivirais são citados para erradicar HEV crônica em imunodeprimidos?", back: "Ribavirina isolada · Ou ribavirina + PEG-interferon" },
      { front: "HDV e HEV: o que compartilham quanto à gravidade?", back: "Podem associar-se a hepatite fulminante · HDV aumenta o risco na coinfecção com HBV · HEV é especialmente grave na gestação" }
    ]
  },
  {
    id: "hep-fulminante",
    name: "Insuficiência hepática fulminante",
    specialty: "clinica",
    cards: [
      { front: "Como se apresenta a insuficiência hepática fulminante (IHF)?", back: "Disfunção hepatocelular súbita e intensa · Encefalopatia com ou sem edema cerebral · Coagulopatia · Predisposição a infecções" },
      { front: "Quais são as duas causas mais comuns de IHF no mundo?", back: "Hepatites virais, especialmente HBV · Toxicidade medicamentosa, especialmente paracetamol" },
      { front: "Hepatite aguda com obnubilação ou torpor: o que avaliar?", back: "Síntese hepática · Albuminemia · TAP/INR · Pesquisar IHF precocemente" },
      { front: "Quais parâmetros de mau prognóstico na hepatite viral aguda?", back: "Encefalopatia hepática · Hipoalbuminemia · Alargamento do TAP" },
      { front: "Hepatite B e IHF?", back: "HBV é a principal causa viral, respondendo por 30–60% dos casos · Mutantes pré-core ou pré-S podem exigir dosagem de DNA-HBV" },
      { front: "HEV e IHF?", back: "Em zonas endêmicas, associa-se a hepatite fulminante em gestantes · Letalidade de 25–40%" },
      { front: "Paracetamol: dose tóxica mínima citada?", back: "150 mg/kg na criança · 7,5 g no adulto · Hepatopatia prévia, álcool crônico e indutores de CYP450 podem causar toxicidade com doses menores" },
      { front: "Antídoto da intoxicação precoce por paracetamol?", back: "N-acetilcisteína" },
      { front: "King’s College na IHF por paracetamol: quais critérios?", back: "pH <7,3 · Ou lactato >3,5 mEq/L após 4 h ou >3,0 após 12 h de ressuscitação · Ou INR ≥6,5 + Cr >3,4 mg/dL + EH grau III/IV" },
      { front: "King’s College na IHF não associada a paracetamol?", back: "INR >6,5 · Ou 3 de 5: etiologia desfavorável, idade <10 ou >40 anos, icterícia–EH >7 dias, BT >17,5 mg/dL, INR >3,5 · Indica TxH precoce" },
      { front: "Classificação de O’Grady da insuficiência hepática aguda?", back: "Hiperaguda: EH nos primeiros 7 dias · Aguda: EH entre 8–28 dias · Subaguda: EH entre 4–24 semanas" },
      { front: "Hiperaguda × subaguda — prognóstico citado?", back: "Hiperaguda: mais edema cerebral, mas maior chance de recuperação espontânea · Subaguda/subfulminante: menos edema cerebral, maior chance de precisar de transplante" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-hepato.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
if (!Array.isArray(existing)) throw new Error("flashcards-hepato.json deve conter um array");
const replacedHep1Ids = new Set([
  "hep-intro-labs-ictericia",
  "hep-hav",
  "hep-hbv-aguda-serologia",
  "hep-hcv-hdv-hev-agudas",
  "hep-hbv-hcv-cronicas",
  "hep-fulminante",
  ...decks.map((deck) => deck.id)
]);
const merged = existing.filter((deck) => !replacedHep1Ids.has(deck.id)).concat(decks);
fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(`Hep1: ${decks.length} decks · ${decks.reduce((n, deck) => n + deck.cards.length, 0)} cards`);
console.log(`Total: ${merged.length} decks · ${merged.reduce((n, deck) => n + deck.cards.length, 0)} cards`);
