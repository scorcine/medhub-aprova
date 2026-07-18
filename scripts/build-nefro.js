/**
 * Flashcards Nefrologia · Nefro 1 (glomérulos)
 * Fonte: D:\MedHub R1\CM\Nefrologia\Nefro 1.pdf
 * Prefixo: nef- · specialty: clinica · area: nefrologia
 * Nota: pediatria já tem nef-sindromes — decks da CM levam specialty explícita.
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "nef-basico",
    name: "Básico · TFG · proteinúria · hematúria",
    specialty: "clinica",
    cards: [
      { front: "TFG normal (ordem de grandeza)?", back: "≈80–120 ml/min (≈120–180 L/dia filtrados) · Só 1–3 L/dia viram urina — ~99% é reabsorvido" },
      { front: "Proteinúria >2 g/dia — o que sugere?", back: "Fortalece glomerulopatia · Tubulointersticial raramente passa de ~2 g/dia" },
      { front: "Proteinúria nefrótica no adulto?", back: ">3,5 g/24h · Criança: >50 mg/kg/24h · Spot: relação proteína/creatinina ≈ nefrótica com boa acurácia" },
      { front: "EAS positivo para proteína — limiar?", back: "A partir de ~300–500 mg/dia · Só alerta — não quantifica bem" },
      { front: "Hematúria glomerular — pista no sedimento?", back: "Dismorfismo eritrocitário (hemácias deformadas/fragmentadas/hipocrômicas) ± cilindros hemáticos" },
      { front: "Cinco grandes síndromes glomerulares (apostila)?", back: "1) Nefrítica · 2) Alterações urinárias assintomáticas · 3) Nefrótica · 4) GNRP · 5) Trombóticas" },
      { front: "Proteinúria intermitente — exemplos?", back: "Exercício · Ortostática · Febre · ICC · Gestação · Estresse · Sem doença renal estrutural típica" },
      { front: "Proteinúria ortostática — como afastar?", back: "Coletar manhã (antes de levantar) e após 4–6h em ortostatismo · Bom prognóstico" },
      { front: "Proteinúria fixa <2 g/24h sem hematúria/sistema — biópsia?", back: "Em geral NÃO (apostila) · Sem estigmas sistêmicos nem queda de função" },
      { front: "Hematúria glomerular assintomática — DD clássico?", back: "Berger (IgA) · Adelgaçamento da MBG · Alport (nefrite hereditária ± surdez)" }
    ]
  },
  {
    id: "nef-nefritica-gnpe",
    name: "Síndrome nefrítica · GNPE",
    specialty: "clinica",
    cards: [
      { front: "Tríade clássica da síndrome nefrítica?", back: "Hematúria (macro/micro) · Edema/oligúria · HAS · ± proteinúria subnefrótica · ± azotemia" },
      { front: "Protótipo da GNDA?", back: "GN pós-estreptocócica (GNPE)" },
      { front: "Incubação GNPE — faringe × pele?", back: "Orofaringe: 1–3 sem (média ~10 dias) · Cutânea: 2–6 sem (média ~21 dias)" },
      { front: "Faixa etária típica da GNPE?", back: "Crianças/adolescentes 5–15a · Rara <2a · Meninos 2:1 na via aérea" },
      { front: "Complemento na GNPE — expectativa?", back: "C3↓ transitório · Normaliza em até 8 semanas (muitas vezes <2 sem)" },
      { front: "Hipocomplementemia >8 semanas na “GNPE” — o que fazer?", back: "Suspeitar outra GNDA crônica (ex.: GNMP, lúpus) → biópsia" },
      { front: "Histologia clássica da GNPE (ME)?", back: "“Corcovas/gibas” — depósitos subepiteliais eletrodensos · MO: proliferação endocapilar difusa · IF: IgG/C3 granular" },
      { front: "GNPE × Berger na infecção — diferenciação-chave?", back: "Berger NÃO consome complemento · GNPE tem incubação típica + C3↓ · Exacerbação de Berger: hematúria no curso da IVAS, sem incubação clássica" },
      { front: "DD de nefrítica + hipocomplementemia?", back: "GNPE · Outras pós-infecciosas (endocardite) · Lúpus · GN membranoproliferativa" },
      { front: "Tratamento da GNPE?", back: "Suporte: restrição H2O/Na · Diurético de alça · Vasodilatador se HAS · Diálise se urêmico/congestão refratária · Imunossupressor sem papel confirmado (exceto GNRP rara)" },
      { front: "Quando biopsiar na suspeita de GNPE?", back: "C3↓ >8 sem · Proteinúria nefrótica persistente · Evolução atípica / GNRP · Sem história infecciosa compatível" },
      { front: "Edema nefrítico — renina?", back: "Retenção renal primária → renina tipicamente baixa · Edema também periorbitário" }
    ]
  },
  {
    id: "nef-nefrotica",
    name: "Síndrome nefrótica · complicações",
    specialty: "clinica",
    cards: [
      { front: "Critérios da síndrome nefrótica?", back: "Proteinúria >3,5 g/dia · Hipoalbuminemia · Edema · ± hiperlipidemia/lipidúria" },
      { front: "Início nefrótica × nefrítica?", back: "Nefrótica: frequentemente insidiosa · Nefrítica: abrupta" },
      { front: "Por que hipercolesterolemia na SN?", back: "Queda da pressão oncótica → fígado ↑ síntese de lipoproteínas (LDL) · Triglicérides: ↓ catabolismo" },
      { front: "Trombose na SN — mecanismo-chave?", back: "Perda urinária de antitrombina III → hipercoagulabilidade · Risco alto na membranosa" },
      { front: "Anticoagulação na SN — pérolas?", back: "Plena se trombo documentado · Profilaxia controversa (considerar albumina muito baixa, ex. <2,0, na membranosa) · Warfarin > heparina (precisa de ATIII) · Heparina precede warfarin; dose maior (PTTa 2–2,5×)" },
      { front: "Infecções na SN — quem e qual quadro?", back: "Germes encapsulados (↓IgG/complemento) · Pneumococo #1 · PBE na ascite: pneumococo ~½, depois E. coli" },
      { front: "Outras proteínas perdidas na SN?", back: "TBG → T4 total baixo com TSH/livre normais · Vit D binding → ± osteomalácia · Transferrina → anemia hipo-micro resistente a Fe" },
      { front: "Causas primárias de SN no adulto (ordem)?", back: "GEFS 25–35% (>50% em negros) · Membranosa ~25% · DLM 10–15% · GNMP 5–15% · Mesangial 5–10%" },
      { front: "Causa #1 de SN na criança?", back: "Doença por lesão mínima (~85%)" },
      { front: "Underfilling × overfilling no edema nefrótico?", back: "Underfilling: ↓oncótica → hipovolemia efetiva → renina↑ (clássico na DLM) · Overfilling: retenção primária · renina↓/N (ex. GEFS adulto)" }
    ]
  },
  {
    id: "nef-dlm-gefs",
    name: "DLM · GEFS",
    specialty: "clinica",
    cards: [
      { front: "DLM — achado na ME?", back: "Fusão/apagamento dos processos podocitários · MO “normal” (nefrose lipoide)" },
      { front: "DLM — resposta a corticoide?", back: "Altamente corticossensível · Criança: remissão ≥4 sem = SNCS · Resistente se >4–8 sem · Adulto resistente só após ~16 sem" },
      { front: "Corticodependente — definição?", back: "Duas recidivas consecutivas durante o corticoide ou nos primeiros 14 dias da suspensão" },
      { front: "Criança corticorresistente — próximo passo?", back: "Biópsia · Frequentemente GEFS ou proliferação mesangial" },
      { front: "GEFS — ideia clínica?", back: "SN do adulto (esp. negros) · Mais retenção hidrossalina / overfilling · Pior prognóstico que DLM" },
      { front: "GEFS × DLM — mensagem de prova?", back: "Mesma “família” podocitária · DLM = criança + corticoide · GEFS = adulto/resistente/progressão" },
      { front: "Proteinúria isolada progressiva no adulto — pensar?", back: "GEFS · Também GMi, diabética, amiloidose" },
      { front: "Metade dos respondedores na DLM infantil?", back: "~½ nunca mais / um episódio e cura · ~½ recidiva (ainda costuma responder)" }
    ]
  },
  {
    id: "nef-membranosa",
    name: "Glomerulopatia membranosa",
    specialty: "clinica",
    cards: [
      { front: "Membranosa — apresentação típica?", back: "SN isolada no adulto · EAS “inocente” (pouca hematúria ativa)" },
      { front: "Membranosa primária — marcador?", back: "Anti-PLA2R positivo · Não consome complemento" },
      { front: "Causas secundárias clássicas de membranosa?", back: "HBV · Neoplasias (pulmão, mama, cólon…) · LES classe V · Drogas (ouro, penicilamina, captopril) · Sífilis/malária etc." },
      { front: "Após diagnosticar membranosa na biópsia — o que fazer?", back: "Triagem de secundárias (neoplasia, vírus, LES, drogas) — pode ser forma reveladora" },
      { front: "Membranosa e trombose — alerta?", back: "Maior risco tromboembólico entre as SN · Considerar profilaxia se albumina muito baixa e baixo risco hemorrágico" },
      { front: "Membranosa × DLM — idade?", back: "Membranosa: adulto · DLM: criança (e ~10–15% adultos)" },
      { front: "Padrão histológico (ideia R1)?", back: "Espessamento da MBG / depósitos subepiteliais · IF IgG granular · Primária: anti-PLA2R" },
      { front: "Yield em bancas?", back: "SN do adulto + anti-PLA2R + vasculizar neoplasia/HBV = combo clássico" }
    ]
  },
  {
    id: "nef-berger",
    name: "Berger (IgA) · hematúria",
    specialty: "clinica",
    cards: [
      { front: "Berger — definição?", back: "Nefropatia por IgA · Depósitos mesangiais de IgA · Glomerulopatia primária mais frequente" },
      { front: "Perfil epidemiológico do Berger?", back: "10–40 anos · Homem 2:1 · Mais em asiáticos" },
      { front: "Apresentação mais comum do Berger?", back: "Hematúria macroscópica recorrente precipitada por IVAS (40–50%) · ± dor lombar no episódio" },
      { front: "Outras apresentações do Berger?", back: "Hematúria micro incidental 30–40% · Nefrítica clássica ~10% · SN ~10% · GNRP <5%" },
      { front: "Berger consome complemento?", back: "NÃO — chave vs GNPE/lúpus mesangial" },
      { front: "Berger × GNPE na IVAS?", back: "Berger: hematúria durante/logo na infecção · GNPE: após período de incubação + C3↓" },
      { front: "Henoch-Schönlein × Berger?", back: "Mesma lesão IgA mesangial · PHS = vasculite da infância com púrpura · Berger = forma renal idiopática do jovem" },
      { front: "IgA sérica no Berger?", back: "~½ dos pacientes tem IgA sérico elevado — apoia, não fecha" },
      { front: "DD de IgA mesangial intenso?", back: "Berger · Nefrite lúpica classe II (esta consome complemento)" },
      { front: "Alport — quando pensar?", back: "Hematúria glomerular familiar · ± surdez neurossensorial · Nefrite hereditária" }
    ]
  },
  {
    id: "nef-gnrp",
    name: "GNRP · crescentes · Goodpasture · ANCA",
    specialty: "clinica",
    cards: [
      { front: "GNRP — definição prática?", back: "Queda rápida da função renal + crescêntica (>50% glomérulos com crescentes) · Emergência nefrológica" },
      { front: "Três tipos de GNRP (mecanismo)?", back: "I: anti-MBG (~10%) · II: imunocomplexos (~45%) · III: pauci-imune/ANCA (~45%)" },
      { front: "IFI na GNRP — padrões?", back: "Linear = anti-MBG · Granular = imunocomplexos · Pouco/nenhum = pauci-imune (só fibrina nos crescentes)" },
      { front: "Sorologias que classificar a GNRP?", back: "Anti-MBG · Complemento↓ (tipo II) · ANCA+ (tipo III)" },
      { front: "Goodpasture — o que é?", back: "Anti-MBG · Rim ± pulmão (hemorragia alveolar) · IFI linear · Tipo I" },
      { front: "GNRP tipo II — exemplos?", back: "LES (classe IV) · GNPE · PHS · Crioglobulinemia · Infecções · Complemento↓" },
      { front: "GNRP tipo III — exemplos?", back: "GPA (c-ANCA) · PAM (p-ANCA) · Crescêntica pauci-imune idiopática · Mais comum no idoso" },
      { front: "Tratamento-ideia da GNRP?", back: "Imunossupressão agressiva (corticoide ± ciclofosfamida etc.) · Plasmaférese no anti-MBG/Goodpasture (conforme protocolo)" },
      { front: "Crescentes na GNPE — significado?", back: "~5% dos casos · Pior prognóstico · Mais em adultos · Pode comportar-se como GNRP" },
      { front: "Yield R1 da GNRP?", back: "Classificar I/II/III por IFI + sorologia — cai muito" }
    ]
  },
  {
    id: "nef-sistemicas",
    name: "Lúpus · diabética · síntese",
    specialty: "clinica",
    cards: [
      { front: "Nefrite lúpica na DD da GNPE?", back: "Nefrítica + hipocomplementemia · C3 permanece baixo · Proteinúria pode ser nefrótica · Biópsia classifica" },
      { front: "Lúpus classe IV — jeitão?", back: "Proliferativa difusa · Pode apresentar-se como GNRP · C3/CH50↓ · Anti-MBG/ANCA− · IF granular · Pulsoterapia + imunossupressor" },
      { front: "Lúpus classe V — padrão?", back: "Membranosa · SN · Entra no DD de membranosa secundária" },
      { front: "Lúpus classe II × Berger?", back: "Ambos IgA/mesângio · Lúpus consome complemento; Berger não" },
      { front: "Nefropatia diabética — apresentação inicial?", back: "Pode começar como proteinúria isolada · Evolui para SN · Contexto de DM + retinopatia ajuda" },
      { front: "Quando NÃO biopsiar proteinúria isolada leve?", back: "<2 g/dia fixa · Sem hematúria · Sem sistêmica · Função ok — observar" },
      { front: "Mapa rápido: quem consome C3?", back: "GNPE · GNMP · Lúpus · Algumas pós-infecciosas · NÃO: Berger, DLM, membranosa primária, GEFS típica" },
      { front: "Mapa rápido SN por idade?", back: "Criança → DLM · Adulto → GEFS/membranosa · Sempre caçar secundárias na membranosa" },
      { front: "Mapa rápido hematúria + IVAS?", back: "Durante a infecção + C3 normal → Berger · Após incubação + C3↓ → GNPE" },
      { front: "Prioridade de bancas (glomérulos)?", back: "GNPE/C3 · SN criança vs adulto · Berger · Membranosa/PLA2R · GNRP tipos · Complicações da SN (trombo/PBE)" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-nefro.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log(
  "wrote",
  out,
  "·",
  decks.length,
  "decks ·",
  decks.reduce((n, d) => n + d.cards.length, 0),
  "cards"
);
