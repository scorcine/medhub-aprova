/**
 * Flashcards Infectologia · Inf3 (manifestações / OI na PVHIV)
 * Fonte: D:\MedHub R1\CM\Infectologia\Inf3.pdf
 * Acrescenta decks a data/flashcards-infecto.json
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "infc-hiv-mac",
    name: "HIV · MAC · Rhodococcus",
    specialty: "clinica",
    cards: [
      { front: "MAC — quando aparece (CD4)?", back: "Doença disseminada em imunossupressão profunda · Tipicamente CD4 <50" },
      { front: "MAC disseminado — quadro?", back: "Febre · Perda ponderal · Sudorese noturna · ± diarreia/dor abdominal · Linfadenopatia · Hepatoesplenomegalia" },
      { front: "Lab clássico no MAC?", back: "Anemia · Fosfatase alcalina ↑ · Hemocultura + em ~85% · Medula óssea também isola bem" },
      { front: "RX no MAC — possível achado?", back: "Miliar (micronódulos, predileção lobos inferiores) + adenopatia hilar/mediastinal (~25%)" },
      { front: "Tratamento do MAC?", back: "Macrolídeo (claritromicina) + etambutol · Grave: + 3ª droga (rifabutina, cipro ou amicacina)" },
      { front: "Quando suspender tratamento do MAC?", back: "CD4 >100 por >6 meses com TARV + assintomático · Em geral após ≥1 ano de ATB plena" },
      { front: "Profilaxia primária do MAC?", back: "Azitromicina semanal alta dose (ex. 1.200 mg) se CD4 <50 · Suspender se CD4 >100 por ≥3 meses com TARV" },
      { front: "Rhodococcus equi — pistas?", back: "Cocobacilo Gram+ · Pneumonia arrastada com cavitação · Muita bacteremia (hemocultura frequentemente +) · Ajustar pelo antibiograma" },
      { front: "Sinusite/traqueobronquite na PVHIV — germes?", back: "Mesmos da população geral, com ↑ encapsulados (pneumococo, H. influenzae) · Traqueobronquite: clínica + RX sem pneumonia" }
    ]
  },
  {
    id: "infc-hiv-fungos",
    name: "HIV · PCM · histo · criptococo pulm",
    specialty: "clinica",
    cards: [
      { front: "PCM na aids — status?", back: "Doença definidora de aids · Quadro agudo multissistêmico (pulmonar + sistema mononuclear)" },
      { front: "PCM + HIV — clínica?", back: "Febre, tosse, infiltrado reticulonodular · Linfadenopatia · Hepatoesplenomegalia · Lesões cutâneo-mucosas" },
      { front: "PCM — epidemiologia BR?", back: "Micose sistêmica mais prevalente no Brasil · SE/CO · Rural clássico · Coinfecção HIV também urbana" },
      { front: "Histoplasmose na aids — forma?", back: "Histoplasmose progressiva disseminada (PDH) — a mais comum" },
      { front: "PDH — quadro?", back: "Sintomas respiratórios mínimos (~⅓) · Febre · Linfadenopatia · Hepatoesplenomegalia · Pancitopenia · Lesões mucocutâneas · ± choque fulminante" },
      { front: "Criptococose pulmonar na aids — pistas?", back: "Febre, tosse, dispneia · Infiltrado intersticial >90% · ± derrame/adenopatia · Hemocultura + em >½ · Maioria com meningoencefalite associada" },
      { front: "Aspergilose é típica da aids?", back: "NÃO — exceto neutropenia ou corticoide · Candida também NÃO costuma invadir pulmão na aids" },
      { front: "Candida no LBA da PVHIV?", back: "Nem sempre = infecção · Diagnóstico de candidíase pulmonar exige biópsia com invasão tecidual" },
      { front: "Mucormicose na aids — ideia?", back: "Sinusite invasiva / rino-orbital-cerebral · Evolução pode ser mais lenta que no diabético · Tx: desbridamento + anfotericina B prolongada" }
    ]
  },
  {
    id: "infc-hiv-gi",
    name: "HIV · esôfago · diarreia · CMV GI",
    specialty: "clinica",
    cards: [
      { front: "Esofagite na PVHIV — quando suspeitar?", back: "Dor retroesternal + odinofagia · EDA mandatória para etiologia" },
      { front: "Três causas principais de esofagite?", back: "Candida · CMV · HSV" },
      { front: "Úlcera esofágica — CMV × HSV?", back: "CMV: úlceras grandes (>2 cm) · HSV: múltiplas pequenas agrupadas · CMV: inclusões “olho de coruja”" },
      { front: "Candida oral e esofágica?", back: "Com frequência coexistem · Aspecto semelhante ao oral · Tratar sistemicamente" },
      { front: "Úlcera aftosa esofágica — Tx citado?", back: "Talidomida (apostila) · Kaposi/linfoma também podem infiltrar esôfago" },
      { front: "Protozoários intestinais clássicos na aids?", back: "Cryptosporidium · Microsporidia · Isospora (Cystoisospora)" },
      { front: "Criptosporidiose — CD4 e clínica?", back: "Incidência ↑ com CD4 <300 · CD4 preservado: diarreia autolimitada · Aids avançada: diarreia grave (até litros/dia)" },
      { front: "Isosporíase — tratamento pérola?", back: "Responde muito bem a SMX-TMP (independente da TARV) — apostila" },
      { front: "Colite por CMV — frequência/quadro?", back: "5–10% sem TARV · Diarreia crônica · Dor abdominal · Perda ponderal · Tx: ganciclovir ou foscarnet 2–3 sem + TARV" },
      { front: "Colite por CMV — o que investigar sempre?", back: "Retinite por CMV coexistente" },
      { front: "Enteropatia induzida pelo HIV — definição?", back: "Diarreia crônica sem outro agente · HIV causa atrofia/hiporregeneração da mucosa" }
    ]
  },
  {
    id: "infc-hiv-hepato",
    name: "HIV · hepatites · IRIS hepática",
    specialty: "clinica",
    cards: [
      { front: "Coinfecção HIV-HBV — cronificação?", back: "Chance de cronificação da hepatite B ~5–6× maior · Mortalidade por HBV crônica 4–10× maior" },
      { front: "HIV-HBV — conduta TARV?", back: "Iniciar TARV de imediato · Usar drogas ativas nos dois vírus (ex.: tenofovir + lamivudina)" },
      { front: "HIV-HCV — ordem prática?", back: "Começar TARV até estabilizar/controlar CV do HIV · Depois DAA anti-HCV · Checar interações" },
      { front: "HCV na coinfecção — carga viral?", back: "CV do HCV em média ~10× maior que sem HIV" },
      { front: "Causas de hepatopatia na PVHIV (mapa)?", back: "Hepatites virais · Toxicidade medicamentosa · Infecções oportunistas · IRIS (hepatite granulomatosa)" },
      { front: "Todo coinfectado HIV-HBV/HCV deve?", back: "Iniciar TARV imediatamente (apostila)" }
    ]
  },
  {
    id: "infc-hiv-neuro",
    name: "HIV · SNC · neuropatia · Chagas",
    specialty: "clinica",
    cards: [
      { front: "HAND — o que é?", back: "HIV-Associated Neurocognitive Disorders · Espectro: ANI → MND → HAD (demência)" },
      { front: "Alvo celular do HIV no SNC?", back: "Células CD4 da micróglia · Citocinas neurotóxicas → dano" },
      { front: "RM na encefalopatia pelo HIV?", back: "Atrofia cerebral (predomínio citado na apostila) · Sem efeito de massa típico da toxo/linfoma" },
      { front: "Mielopatia mais comum na aids?", back: "Mielopatia vacuolar · Também: ataxia sensorial “pura” · DD: HTLV-1, neurossífilis, HSV/VZV, linfoma" },
      { front: "Neuropatia mais comum?", back: "Polineuropatia sensitiva distal (dor em queimação · “luvas e botas”) · HIV ou fármacos (ddI, metro, dapsona…)" },
      { front: "Reativação de Chagas — CD4?", back: "Típica em CD4 <200 · Diagnóstico: tripomastigota em sangue/LCR/líquidos · Xenodiagnóstico/PCR/hemocultura NÃO confirmam reativação sozinhos" },
      { front: "Neurotoxoplasmose × linfoma SNC — lesões?", back: "Toxo: múltiplas (gânglios da base, frontais/parietais) · Linfoma primário: frequentemente 1–3 lesões, única periventricular com anel favorece linfoma" },
      { front: "Lesão única com anel periventricular — pensar?", back: "Mais linfoma primário do SNC do que toxo (apostila)" },
      { front: "Toxo miocárdica na aids — o que fazer?", back: "Mandatório neuroimagem — acometimento miocárdico costuma acompanhar doença no SNC" },
      { front: "Primeira crise convulsiva na PVHIV — eixos?", back: "Lesões focais com massa (toxo/linfoma) · Encefalopatia pelo HIV · Meningite (criptococo etc.)" }
    ]
  },
  {
    id: "infc-hiv-ocular",
    name: "HIV · retinite CMV · olho",
    specialty: "clinica",
    cards: [
      { front: "Queixa oftalmológica na aids — frequência?", back: "~50% referem sintomas oculares" },
      { front: "Retinite por CMV — aspecto clássico?", back: "Exsudatos brancos + hemorragias no trajeto vascular — “queijo com ketchup”" },
      { front: "Profilaxia secundária da retinite CMV?", back: "Valganciclovir oral até CD4 >100 por >3 meses com TARV" },
      { front: "Indução da doença CMV ocular/GI?", back: "Ganciclovir ou foscarnet (semanas) + TARV efetiva" },
      { front: "Achado ocular comum não infeccioso?", back: "Microangiopatia da aids — cotton-wool spots / isquemia retinal" }
    ]
  },
  {
    id: "infc-hiv-neoplasias",
    name: "HIV · Kaposi · LNH · colo",
    specialty: "clinica",
    cards: [
      { front: "Três neoplasias definidoras de aids?", back: "Sarcoma de Kaposi · Linfoma não Hodgkin · Carcinoma cervical invasivo" },
      { front: "Após TARV — quais cânceres predominam?", back: "Não definidores (pulmão, canal anal, fígado, Hodgkin…) passaram a ser os mais frequentes" },
      { front: "Kaposi — vírus associado?", back: "HHV-8 (herpesvírus humano tipo 8) + contexto do HIV" },
      { front: "Linfoma primário do SNC — EBV?", back: "DNA do EBV nas células tumorais ~100% · Lesão focal com massa/edema/anel" },
      { front: "Burkitt na PVHIV — citogenética?", back: "t(8;14) e t(8;22) · Jovens · ~50% EBV+ no tumor" },
      { front: "Linfoma imunoblástico — variantes citadas?", back: "Linfoma de efusão primária (cavidade corporal) · Linfoma plasmacítico da cavidade oral · HHV-8 na etiopatogênese do de efusão" },
      { front: "Sobrevida típica do LNH na aids (pré-conceito moderno)?", back: "Apostila: surgimento de LNH — curso agressivo; sobrevida clássica curta sem controle (estudar tabela) — mensagem: agressivo + TARV essencial" },
      { front: "Yield neoplasias R1?", back: "3 definidoras · HHV-8/Kaposi · EBV no linfoma SNC · Única lesão anelar ≠ toxo" }
    ]
  },
  {
    id: "infc-hiv-sistema",
    name: "HIV · cardio · heme · pele",
    specialty: "clinica",
    cards: [
      { front: "Cardiomiopatia pelo HIV — ideia?", back: "Miocardite/cardiomiopatia dilatada possível · ± IgIV · Outras miocardites: Kaposi, cripto, Chagas, toxo" },
      { front: "Derrame pericárdico na PVHIV — causas?", back: "TB · MAC · Criptococo · Kaposi · Linfoma · ICC · Diagnóstico: pericardiocentese" },
      { front: "Endocardite marântica na aids?", back: "Era de aids avançada pré-TARV · Hoje extremamente rara com TARV" },
      { front: "Alteração hematológica mais comum?", back: "Anemia · Também leucopenia/neutropenia e plaquetopenia (PTI-like) frequentes" },
      { front: "Coombs na PVHIV?", back: "Pode positivar por hipergamaglobulinemia policlonal — interpretar com cuidado" },
      { front: "Pele na infecção pelo HIV?", back: ">90% têm ≥1 manifestação cutânea · Dermatite seborreica, foliculite, psoríase exacerbada, farmacodermia…" },
      { front: "Hanseníase + HIV — tratamento?", back: "Idêntico ao sem HIV (inclui reações) · Sem TARV, paradoxalmente pode “abrandar” formas; com TARV, IRIS possível" },
      { front: "Osso na PVHIV?", back: "Osteopenia/osteoporose ↑ · DEXA: mulheres pós-menopausa e homens conforme indicação da apostila/protocolo" }
    ]
  },
  {
    id: "infc-hiv-mapa",
    name: "Mapa · HIV Inf3",
    specialty: "clinica",
    cards: [
      { front: "CD4 <50 — pensar?", back: "MAC disseminado · Profilaxia com azitro · CMV grave (olho/GI) mais comum" },
      { front: "CD4 <200 — pensar?", back: "Reativação de Chagas · (P. jirovecii citado no bloco fúngico — contexto aids)" },
      { front: "CD4 <300 — protozoário intestinal?", back: "Criptosporidiose com incidência anual relevante" },
      { front: "Esofagite — mapa rápido?", back: "Candida (mais comum) · CMV (úlcera grande) · HSV (úlceras pequenas)" },
      { front: "Massa cerebral — mapa?", back: "Múltiplas + gânglios → toxo · Única periventricular anelar → linfoma · Sempre TARV + conduta específica" },
      { front: "Fungos BR na aids?", back: "PCM definidora · Histo disseminada · Cripto (pulm+meninge) · Aspergilus NÃO típico" },
      { front: "Neoplasias definidoras?", back: "Kaposi · LNH · Ca de colo invasivo" },
      { front: "Prioridade bancas Inf3?", back: "MAC/CD4 · Esofagite etiologias · Toxo×linfoma · CMV olho (“ketchup”) · Kaposi/HHV-8 · HBV com TDF+3TC" }
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
  "Inf3 ·",
  newDecks.reduce((n, d) => n + d.cards.length, 0),
  "cards)"
);
