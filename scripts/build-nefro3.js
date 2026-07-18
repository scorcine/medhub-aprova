/**
 * Flashcards Nefrologia · Nefro 3 (soluções · Mg · tampões)
 * Fonte: D:\MedHub R1\CM\Nefrologia\Nefro 3.pdf
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "nef-cristaloides",
    name: "Cristaloides · SF · RL · SG · hipertônica",
    specialty: "clinica",
    cards: [
      { front: "SF 0,9% é “fisiológico”?", back: "Não — mais Cl que o plasma, levemente hipertônico, sem outros eletrólitos · Ainda assim o mais prescrito" },
      { front: "SF em grande volume (>2 L/dia) — risco?", back: "Acidose metabólica hiperclorêmica (solução acidificante, sem tampão)" },
      { front: "Quando preferir SF ao balanceado?", back: "Hipovolemia + hipoNa leve · + hipocloremia/alcalose (vômito/SNG) · + hiperK · + hiperCa" },
      { front: "Quando preferir soro balanceado (RL)?", back: "Acidose hiperclorêmica (ex.: ATR) · Quer evitar excesso de Cl · Lactato → HCO3 no fígado (alcalinizante)" },
      { front: "Quando evitar RL / balanceados?", back: "HiperK · HiperCa · Predisposição a edema / lesão aguda SNC (menos Na → piora edema cerebral) · Não veicular fosfato (precipita com Ca)" },
      { front: "Ringer lactato — ideia histórica/prática?", back: "Hartmann ↓Cl e + lactato para combater acidose da desidratação · “Solução balanceada”" },
      { front: "SG 5% — o que realmente entrega?", back: "Água livre (glicose some em minutos) · Escolha para repor água / corrigir hipernatremia · Evita hemólise da água destilada" },
      { front: "SG 5% — uso prático clássico?", back: "Profilaxia da cetose de jejum (2 L = 100 g glicose ≈ 400 kcal) · Prevenir hipoglicemia em dieta zero + insulina" },
      { front: "SG 10% — quando?", back: "Mesma glicose com metade do volume — útil se restrição hídrica" },
      { front: "Salina hipertônica — NaCl 3% × 7,5%?", back: "3%: repor Na em 24h (hipoNa grave) · 7,5% (“salgadão”): expansão volêmica em bolus" },
      { front: "Por que hipertônica expande com menos volume?", back: "Puxa água do intracelular → ECF · Vantagem em risco de edema (SNC, queimado, cirurgia extensa)" },
      { front: "Coloides × cristaloides — mensagem da apostila?", back: "Coloide expande mais rápido/duradouro, mas RCTs não mostram superioridade de sobrevida · HES/VISEP: ↑ disfunção renal na sepse" },
      { front: "Albumina — quando NÃO serve?", back: "Só para “corrigir albumina sérica” em cirrose/SN/desnutrição — sem benefício · Pode usar se choque hipovolêmico nesses contextos" },
      { front: "Yield soluções R1?", back: "SF→hiperCl · RL na ATR · SF se hiperK · SG = água livre · 3% vs 7,5%" }
    ]
  },
  {
    id: "nef-magnesio",
    name: "Hipomagnesemia · hipermagnesemia",
    specialty: "clinica",
    cards: [
      { front: "Hipomagnesemia — definição?", back: "Mg < 1,5 mg/dl · Mecanismos: ↓absorção intestinal ou perda renal" },
      { front: "Prevalência de hipoMg?", back: "~12% nas enfermarias · Até ~50% na UTI" },
      { front: "HipoMg e potássio — relação?", back: "Causas parecidas + hipoMg é caliurética → hipoK associada / refratária até repor Mg" },
      { front: "Causas clássicas de hipoMg?", back: "Diarreia/esteatorreia · Tiazídico/alça · Bartter/Gitelman · AG / anfo B · Alcoolismo" },
      { front: "Clínica da hipoMg?", back: "Tremor, tetania, convulsões · Arritmias (com hipoK) · ↑PR no ECG · Lembra quadro de hiperCa (Mg antagoniza Ca)" },
      { front: "Tratamento da hipoMg grave?", back: "MgSO4 1–2 g IV (1–2 amp 10%) em 15 min → 6 g/24h por ≥2 dias · Leve: VO 480–720 mg/dia (diarreia = efeito colateral)" },
      { front: "Hipermagnesemia — definição e causas?", back: "Mg > 2,5 mg/dl · IRA/DRC (retenção) · Excesso exógeno (eclâmpsia / pré-eclâmpsia)" },
      { front: "Ampolas de MgSO4 — pegadinha?", back: "Existe 50% e 10% — não trocar!" },
      { front: "Sinais de intoxicação por Mg?", back: "A partir de ~4,5 mg/dl: hiporreflexia → arreflexia, fraqueza, íleo, bradipneia/bradicardia → PCR" },
      { front: "Antídoto agudo da hiperMg?", back: "Gluconato de Ca 1–2 g IV · Depois hidratação ou HD se DRC/ICC" },
      { front: "Regra de ouro Mg × Ca (prova)?", back: "Mg = “bloqueador natural de canal de Ca” · HipoMg ~ hiperCa · HiperMg ~ hipoCa" },
      { front: "Yield Mg?", back: "HipoK refratária → repôe Mg · Eclâmpsia + hiperMg · Ca como antídoto" }
    ]
  },
  {
    id: "nef-tampoes",
    name: "Sistemas-tampão · Henderson · BE",
    specialty: "clinica",
    cards: [
      { front: "Tampão extracelular principal?", back: "Sistema bicarbonato–CO2: CO2 + H2O ⇿ H2CO3 ⇿ H+ + HCO3−" },
      { front: "pKa do bicarbonato–CO2?", back: "6,10 · pH normal 7,40" },
      { front: "Henderson-Hasselbalch (ideia)?", back: "pH = 6,10 + log([HCO3−] / (0,03 × pCO2)) · Normais: HCO3 24 / pCO2 40 → razão 20 → pH 7,40" },
      { front: "Conceito mais importante do EAB?", back: "pH plasmático = relação [HCO3−]/pCO2 (base/ácido do tampão extracelular)" },
      { front: "Por que o tampão HCO3–CO2 funciona apesar do pKa?", back: "Faixa ideal = pKa ±1; 7,40 está fora · Salva o controle ventilatório do CO2 (quimiorreceptores → V̇E)" },
      { front: "Buffer Base (BB) — o que é?", back: "Soma das bases do sangue: HCO3 + tampões eritrocíticos (Hb, fosfato) · Normal ~48 mEq/L (~2× o HCO3)" },
      { front: "Base Excess (BE)?", back: "Variação do BB vs 48 · BE+ = excesso de bases · BE− = déficit de bases" },
      { front: "Tampão intracelular — componentes?", back: "Proteínas + fosfato · H+ + proteinato ⇿ proteína-H · H+ + HPO4²− ⇿ H2PO4−" },
      { front: "Tampão ósseo — consequência?", back: "Libera NaHCO3/KHCO3 e depois CaCO3/CaHPO4 → pode desmineralizar (perda de Ca/PO4)" },
      { front: "Distribuição do tamponamento de carga ácida (apostila)?", back: "~40% extracelular (BB) · ~60% intracelular + ósseo" },
      { front: "RL como “alcalinizante” — por quê?", back: "Lactato = precursor de HCO3 (tampão) · Contrasta com SF acidificante" },
      { front: "Yield tampões?", back: "pH ∝ HCO3/pCO2 · Ventilação “salva” o sistema · BE = Δ buffer base" }
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
  "Nefro3)"
);
