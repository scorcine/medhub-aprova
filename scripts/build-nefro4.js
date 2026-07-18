/**
 * Flashcards Nefrologia · Nefro 4 (IRA + DRC)
 * Fonte: D:\MedHub R1\CM\Nefrologia\Nefro 4.pdf
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "nef-ira-kdigo",
    name: "IRA · KDIGO · marcadores",
    specialty: "clinica",
    cards: [
      { front: "Azotemia × uremia?", back: "Azotemia = ↑ ureia/Cr · Uremia = síndrome clínica da falência renal (não é só ‘ureia alta’) · Uremia tipicamente TFG <15–30" },
      { front: "Três funções do rim (apostila)?", back: "Filtro (excreção) · Reguladora (HE/AB) · Endócrina (EPO + calcitriol)" },
      { front: "Definição KDIGO de IRA?", back: "↑Cr ≥0,3 mg/dl em 48h OU ↑Cr ≥1,5× basal em 7 dias OU débito <0,5 ml/kg/h >6h" },
      { front: "Estágios KDIGO da IRA (ideia)?", back: "1: +0,3 ou 1,5–1,9× / DU <0,5 por 6–12h · 2: 2–2,9× / ≥12h · 3: ≥4 ou 3× / DU <0,3 ≥24h ou anúria ≥12h" },
      { front: "IRA oligúrica × não oligúrica × anúrica?", back: "Oligúrica <400–500 ml/dia · Não oligúrica >400–500 (maioria >50%) · Anúria <50–100 ml/dia" },
      { front: "Creatinina na IRA — demora?", back: "Pode levar 48–72h para subir · Cr isolada atrasa o diagnóstico" },
      { front: "Falsos ↑ de creatinina (sem ↓TFG)?", back: "Trimeto/cimetidina/probenecida/penicilina (↓secreção) · Acetoacetato na CAD · Cefoxitina · Rabdo (liberação muscular)" },
      { front: "Clearance — padrão-ouro teórico?", back: "Inulina (só pesquisa) · Na prática: CKD-EPI (atual) · Também Cockcroft-Gault / MDRD" },
      { front: "Mortalidade da IRA hospitalar?", back: "Alta — ordem de 30–86% conforme gravidade/comorbidades" },
      { front: "Yield marcadores?", back: "KDIGO 0,3/48h · Cr atrasada · Não confundir azotemia com uremia" }
    ]
  },
  {
    id: "nef-ira-etiologia",
    name: "IRA · pré · intrínseca · pós",
    specialty: "clinica",
    cards: [
      { front: "Frequência das causas de IRA (geral)?", back: "Pré-renal 55–60% · NTA 35–40% · Pós-renal 5–10% · CTI: NTA ~50%" },
      { front: "Pré-renal — essência?", back: "Hipofluxo · Reversível se restaurar perfusão · Sedimento ‘inocente’ · FENa <1% · U/Cr plasmática >40" },
      { front: "Precipitantes clássicos de pré-renal?", back: "Hipovolemia/choque · ICC · AINE · IECA/BRA (esp. com hipovolemia/EAR)" },
      { front: "IRA intrínseca mais comum?", back: "NTA · Também GN, NIA, vascular micro" },
      { front: "Quando suspeitar pós-renal?", back: "Anúria ou flutuação anúria↔poliúria · Idoso + prostatismo · Bexigoma · USG ~98% sensível" },
      { front: "Conduta imediata na retenção por HPB?", back: "Sondagem Foley · Desobstruir · Depois investigar" },
      { front: "Pós-desobstrução — cuidado?", back: "Poliúria pós-obstrutiva + ATR hipercalêmica possível · Reposição volêmica criteriosa" },
      { front: "Anúria — DD curto?", back: "Pós-renal · Necrose cortical · Algumas GN · (não é o padrão da NTA)" },
      { front: "1ª pergunta diante de IRA?", back: "Pré × intrínseca × pós — muda toda a conduta" },
      { front: "Yield etiológico?", back: "Pré = mais comum · Pós = sonda/USG · Intrínseca = NTA" }
    ]
  },
  {
    id: "nef-ira-conduta",
    name: "IRA · tratamento · diálise",
    specialty: "clinica",
    cards: [
      { front: "Tratamento por tipo de IRA?", back: "Pré: restaurar fluxo · Pós: desobstruir · Intrínseca: suporte + tratar causa (ex. GNRP)" },
      { front: "Dopamina ‘dose renal’ na NTA?", back: "NÃO FAZER — sem benefício · Risco de arritmia" },
      { front: "Furosemida na NTA — papel?", back: "Não muda mortalidade/necessidade de diálise de forma comprovada · Pode ajudar manejo de volume (oligúrica → não oligúrica nas primeiras 24–48h)" },
      { front: "Indicações de diálise de urgência (apostila)?", back: "Uremia sintomática (encefalopatia/hemorragia/pericardite) · Hipervolemia refratária · HiperK refratária · Acidose refratária · ± azotemia muito alta · Intoxicações dialisáveis" },
      { front: "Diálise só por ureia/Cr altas no SUS?", back: "Em geral NÃO — indica-se por clínica/complicações, não só número" },
      { front: "Método dialítico na IRA estável × instável?", back: "Estável: HD intermitente · Instável: contínua (ex. HVVC) ou DP se sem contraindicação abdominal" },
      { front: "HiperK na IRA oligoanúrica — ritmo?", back: "Pode subir ~0,5 mEq/L/dia · Pior em rabdo/hemólise/SLT" },
      { front: "Acidose na IRA — padrão?", back: "Metabólica com AG↑ (ácidos do metabolismo / sulfato) · Em críticos com NTA comum" },
      { front: "Prognóstico pré/pós × NTA?", back: "Pré/pós favorável se tratados · NTA: recuperação em dias–semanas; alguns viram DRC/diálise" },
      { front: "Yield conduta?", back: "Sem dopamina renal · Diálise = AEIOU clínico · Volume/eletrólitos primeiro" }
    ]
  },
  {
    id: "nef-drc-estadios",
    name: "DRC · definição · estágios · causas",
    specialty: "clinica",
    cards: [
      { front: "Definição de DRC (KDIGO)?", back: "Dano renal (ex. albuminúria ≥30 mg/dia) e/ou TFG <60 por ≥3 meses" },
      { front: "Por que ≥3 meses?", back: "Diferenciar de IRA · Na DRC a perda de néfrons é (em regra) irreversível" },
      { front: "Estadiamento KDIGO — eixos?", back: "G (TFG) + A (albuminúria) · + D se em diálise · Ex.: G3aA1, G5DA3" },
      { front: "Albuminúria persistente ≥30 — significado?", back: "Marca risco de progressão para DRFT independente da etiologia" },
      { front: "Causas líderes de DRC (BR/mundo)?", back: "Nefropatia diabética · HAS · Glomerulopatias · (RVU importante na criança)" },
      { front: "DRC que ‘nasce aguda’ — exemplos?", back: "Necrose cortical · GNRP — regeneração abolida → crônico desde o início" },
      { front: "Ciclo IRA ↔ DRC?", back: "DRC deixa o rim vulnerável a novos insultos · IRA acelera progressão da DRC" },
      { front: "Rins na DRC avançada (macro)?", back: "Atrofia progressiva · Rim ‘terminal’ pequeno" },
      { front: "Autoperpetuação da DRC?", back: "Hiperfiltração dos néfrons remanescentes → GEFS secundária → mais perda" },
      { front: "Yield definição?", back: "≥3 meses · G+A · DM/HAS lideram" }
    ]
  },
  {
    id: "nef-drc-manejo",
    name: "DRC · nefroproteção · HAS · dieta",
    specialty: "clinica",
    cards: [
      { front: "Meta principal do tratamento genérico da DRC?", back: "Controlar proteinúria + pressão arterial · Todos devem ser avaliados nisso" },
      { front: "1ª linha anti-hipertensiva na DRC?", back: "IECA ou BRA · Quase sempre precisa associar outros fármacos" },
      { front: "Meta de PA (apostila / prática citada)?", back: "Muitos usam <130×80 sobretudo se proteinúria ≥1 g/dia · (há guidelines com <140×90)" },
      { front: "Cuidado com IECA/BRA na DRC?", back: "EAR bilateral/rim único → IRA + hiperK · Monitorar Cr e K" },
      { front: "Diurético na DRC avançada?", back: "Alça (furosemida) — tiazídico perde efeito com TFG muito baixa (~<30)" },
      { front: "Medidas nefroprotetoras gerais?", back: "Parar tabaco · Controle glicêmico · Tratar acidose · ± restrição proteica (não diabética, seletiva)" },
      { front: "HAS na uremia/diálise — tipo dominante?", back: "~80% volume-dependente · Ultrafiltração vira peça-chave quando TFG <15" },
      { front: "Principal causa de óbito na DRC?", back: "Complicações cardiovasculares" },
      { front: "Quando a diálise vira imprescindível para HAS?", back: "Falência franca (TFG <15) com HAS refratária ao volume — precisa UF" },
      { front: "Yield manejo?", back: "IECA/BRA + meta PA · Proteinúria · CV manda no prognóstico" }
    ]
  },
  {
    id: "nef-drc-complicacoes",
    name: "DRC · uremia · anemia · DMO",
    specialty: "clinica",
    cards: [
      { front: "O que responde bem à diálise na uremia?", back: "Hipervolemia/hiperK/hipoNa · Acidose · HAS volume · Encefalopatia/pericardite (em grande parte)" },
      { front: "O que NÃO responde só à diálise?", back: "Anemia (EPO) · DMO/PTH · Neuropatia (melhora mais com Tx / poros maiores) · Prurido parcial" },
      { front: "Anemia da DRC — mecanismo #1?", back: "Deficiência de eritropoetina · Também ferro/folato (perda na HD)" },
      { front: "Quando repor ferro na DRC?", back: "Ferritina <100 ng/ml e saturação de transferrina <20% · Na HD ferro IV é praxe" },
      { front: "Anemia microcítica refratária a EPO+ferro — pensar?", back: "Intoxicação por alumínio (água da HD / quelantes com Al) · Al >100 μg/L · Desferoxamina" },
      { front: "PTH como toxina urêmica?", back: "Contribui para encefalopatia, cardiomiopatia, anemia, prurido · DMO é a face mais típica" },
      { front: "HiperP na DRC — 1ª linha prática?", back: "Restrição de fósforo + quelante (sevelâmer preferível a CaCO3) nas refeições · ± calcitriol se refratário" },
      { front: "Alvo prático de PTH (apostila)?", back: "Manter relativamente alto (ex. 150–300 pg/ml) — evitar doença óssea adinâmica" },
      { front: "Acidose crônica da DRC — danos?", back: "Desmineralização óssea + catabolismo proteico · Tratar precocemente · Evitar citrato de K (↑absorção Al)" },
      { front: "Pericardite urêmica — mensagem?", back: "Indicação de diálise · Risco de tamponamento · ‘Pericardite relacionada à diálise’ = mesma entidade mal dialisada" },
      { front: "Hemostasia na uremia?", back: "Disfunção plaquetária · TS prolongado · Sangramentos mucocutâneos" },
      { front: "Yield complicações?", back: "EPO+ferro · Sevelâmer · Diálise para uremia sintomática · CV = morte" }
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
  "Nefro4)"
);
