/**
 * Flashcards Pneumologia · Pneumo1 + Pneumo2
 * Fontes: D:\MedHub R1\CM\Pneumologia\Pneumo1.pdf · Pneumo2.pdf
 */
const fs = require("fs");
const path = require("path");
const pneumo2 = require("./pneumo2-decks");

const decks = [
  {
    id: "pnm-basico",
    name: "Função respiratória · espirometria · gasometria",
    specialty: "clinica",
    cards: [
      { front: "Unidade de troca gasosa e superfície alveolar (apostila)?", back: "Alvéolo (~160 μm) · ~480 milhões · Superfície ~140 m²" },
      { front: "Por que aspiração prefere o brônquio direito?", back: "Desvia menos do eixo da traqueia que o esquerdo · Material aspirado cai mais à direita" },
      { front: "Padrão obstrutivo na espirometria?", back: "VEF1/CVF reduzido · VEF1 ↓ · Exemplos: asma, DPOC · Pós-BD ajuda a ver reversibilidade" },
      { front: "Padrão restritivo?", back: "CVF ↓ · Relação VEF1/CVF normal ou ↑ · Confirmar com CPT ↓ · Interstício, neuromuscular, obesidade, derrame" },
      { front: "Prova broncodilatadora positiva (clássico)?", back: "↑ VEF1 ≥12% e ≥200 mL após BD · Apoia asma / componente reversível" },
      { front: "Gasometria na crise de asma — quando a apostila indica?", back: "PFE ou VEF1 <50% do predito · Sem resposta ao tratamento inicial · Piora progressiva · Coletar com O2 se em uso" },
      { front: "Gasometria na crise — quando intubar (apostila)?", back: "PaO2 <60 mmHg e/ou PaCO2 normal/aumentada (esp. >45) = IR aguda → considerar IOT + VM" },
      { front: "RX de tórax em toda crise de asma?", back: "NÃO · Só se suspeita de complicação (pneumotórax) ou DD (ICC, corpo estranho, pneumonia)" },
      { front: "5 mecanismos de hipoxemia?", back: "FiO2 baixa · Hipoventilação · Difusão · Shunt · Desequilíbrio V/Q" },
      { front: "Shunt × espaço morto?", back: "Shunt: perfusão sem ventilação (O2 corrige mal) · Espaço morto: ventilação sem perfusão (↑Vd / hipercapnia)" },
      { front: "IR tipo 1 × tipo 2?", back: "Tipo 1: hipoxêmica · Tipo 2: hipercápnica (ventilatória)" },
      { front: "Gradiente A-a — papel?", back: "Normal em hipoventilação/altitude · Elevado em V/Q, shunt, difusão" }
    ]
  },
  {
    id: "pnm-asma-basico",
    name: "Asma · conceito · gatilhos · diagnóstico",
    specialty: "clinica",
    cards: [
      { front: "Asma — núcleo fisiopatológico (apostila)?", back: "Inflamação crônica + hiperresponsividade + obstrução variável · Remodelamento se não controlar inflamação" },
      { front: "Principal gatilho de crise asmática (apostila)?", back: "IVAS (infecções de vias aéreas superiores)" },
      { front: "Fármacos que desencadeiam broncoespasmo?", back: "Betabloqueadores (mesmo β1-seletivos / colírio de timolol) · AAS/AINE (via leucotrienos) · IECA NÃO costuma precipitar crise (tosse ≠ asma)" },
      { front: "Broncoespasmo induzido por exercício — mecanismo?", back: "Hiperventilação ar seco/frio → desidrata mucosa → hipertonicidade → degranulação de mastócitos" },
      { front: "Diagnóstico — pilares?", back: "História típica + limitação variável do fluxo (espirometria ± prova BD / peak flow) · Avaliar controle e risco futuro" },
      { front: "GINA — avaliar controle × risco futuro?", back: "Controle: sintomas (tool GINA) · Risco futuro: espirometria (VEF1), exacerbações, efeitos adversos, técnica" },
      { front: "Espirometria no seguimento do asmático (apostila)?", back: "Antes do tratamento · Após 3–6 meses · Depois no mínimo a cada 1–2 anos (ou conforme clínica)" },
      { front: "SABA isolado em longo prazo?", back: "NÃO · Broncodilata mas não trata inflamação/remodelamento · Não é terapia de controle sozinho" },
      { front: "Asma × DPOC — DD rápido?", back: "Asma: mais jovem, atopia, reversibilidade · DPOC: tabaco, >40a, limitação pouco reversível" },
      { front: "Divisão do capítulo na apostila?", back: "Conceitos gerais · Manejo ≥12a · Manejo crianças · Farmacologia antiasmática" }
    ]
  },
  {
    id: "pnm-asma-farmaco-crise",
    name: "Asma · fármacos · exacerbação",
    specialty: "clinica",
    cards: [
      { front: "Três classes de broncodilatadores (apostila)?", back: "Agonistas β2 · Anticolinérgicos (antimuscarínicos) · Teofilina · β2 = escolha (eficácia + início rápido)" },
      { front: "SABA — exemplos e meia-vida?", back: "Salbutamol, terbutalina, fenoterol · Meia-vida ~3–6h · Rescate / crise" },
      { front: "LABA — exemplos e cuidado?", back: "Salmeterol, formoterol (12h) · Indacaterol/vilanterol/olodaterol (24h) · Sempre com CI na asma (não LABA isolado)" },
      { front: "Papel do corticoide inalatório?", back: "Anti-inflamatório de controle · Reduz exacerbações e remodelamento · Base da manutenção" },
      { front: "Exacerbação — sequência clássica?", back: "O2 se hipoxemia · SABA repetido · Corticoide sistêmico precoce · ± ipratrópio nas graves · Avaliar gravidade" },
      { front: "Ipratrópio na crise?", back: "Associar ao SABA nas crises graves · Benefício adicional na emergência" },
      { front: "Sulfato de magnésio IV — quando?", back: "Crise grave refratária ao tratamento inicial" },
      { front: "Sinais de gravidade / ameaça à vida?", back: "Fala entrecortada · Acessórios · Silêncio auscultatório · Confusão · SpO2 baixa · PaCO2 normal/alta (fadiga)" },
      { front: "Alta após crise — checklist?", back: "Completar corticoide VO · Manutenção com CI · Plano de ação · Técnica inalatória · Retorno" },
      { front: "Pegadinha de prova na asma?", back: "Não deixar SABA crônico isolado · Betabloqueador/AAS como gatilho · PaCO2 ‘normal’ na crise = alarme" }
    ]
  },
  {
    id: "pnm-dpoc",
    name: "DPOC · definição · GOLD · ABE · tratamento",
    specialty: "clinica",
    cards: [
      { front: "DPOC — definição (apostila)?", back: "Pneumopatia heterogênea · Sintomas crônicos (dispneia, tosse, escarro, exacerbações) · Mistura vias aéreas (bronquite/bronquiolite) + alvéolos (enfisema) → limitação persistente ao fluxo" },
      { front: "Epidemiologia citada?", back: "Entre as 3 principais causas de morte mundiais · ~90% das mortes em países baixa/média renda · Prevalência global ~10,3%" },
      { front: "Diagnóstico espirométrico (GOLD)?", back: "VEF1/CVF <0,7 pós-broncodilatador · + sintomas/exposição" },
      { front: "GOLD 1–4 (obstrução pelo VEF1)?", back: "1: ≥80% · 2: 50–79% · 3: 30–49% · 4: <30% do predito" },
      { front: "Por que VEF1 não basta para ‘gravidade da doença’?", back: "Obstrução ≠ impacto na qualidade de vida · Avaliar sintomas diretamente (mMRC ou CAT)" },
      { front: "mMRC — corte de sintomas intensos?", back: "mMRC ≥2 · Grau 0 esforço extremo → grau 4 dispneia ao vestir/não sai de casa" },
      { front: "CAT — corte de sintomas intensos?", back: "CAT >10" },
      { front: "Alto risco de exacerbações (apostila)?", back: "No último ano: ≥2 exacerbações moderadas OU ≥1 com hospitalização · Melhor preditor = histórico prévio" },
      { front: "Avaliação integrada ABE — o que junta?", back: "Sintomas (mMRC/CAT) + risco de exacerbação · Orienta terapia inicial (não só o VEF1)" },
      { front: "Tratamento não farmacológico essencial?", back: "Cessar tabagismo · Reabilitação · Vacinas · Atividade · O2 se hipoxemia crônica com critério" },
      { front: "Farmacologia base da DPOC?", back: "LABA e/ou LAMA · SABA/SAMA rescate · CI só em selecionados (asma overlap / eosinofilia / exacerbações frequentes)" },
      { front: "CI na DPOC sem asma (mensagem da apostila)?", back: "Sem asma, CI só com respaldo (ex.: eosinófilos ↑) · Risco de pneumonia" },
      { front: "Exacerbação de DPOC — conduta?", back: "BD curta ação · Corticoide sistêmico curto · ATB se critérios · O2 alvo 88–92% se risco de hipercapnia · VNI se acidose hipercápnica" },
      { front: "VNI na DPOC — papel?", back: "Exacerbação com acidose respiratória · Reduz IOT e mortalidade se bem indicada" }
    ]
  },
  {
    id: "pnm-tep",
    name: "Embolia pulmonar · Wells · imagem · tratamento",
    specialty: "clinica",
    cards: [
      { front: "EP/TEP — definição (apostila)?", back: "Obstrução arterial pulmonar por partícula insolúvel maior que o vaso · Na prática: quase sempre TEV (TVP → TEP)" },
      { front: "Outras causas de EP (além de trombo)?", back: "Gás · Talco · Gordura · Líquido amniótico · Células neoplásicas · Êmbolos sépticos (endocardite tricúspide)" },
      { front: "Wells TEP — itens de 3 pontos?", back: "Clínica de TVP · Diagnóstico alternativo menos provável que TEP" },
      { front: "Wells TEP — itens de 1,5 ponto?", back: "FC >100 · Imobilização >3d ou cirurgia nas 4 semanas · TVP/TEP prévio" },
      { front: "Wells TEP — itens de 1 ponto?", back: "Hemoptise · Câncer atual ou tratado nos últimos 6 meses" },
      { front: "Wells TEP — corte baixa × moderada/alta?", back: "Baixa: <4 · Moderada/alta: >4 · Se não baixa → imagem na hora (apostila)" },
      { front: "Melhor método não invasivo para TEP × TVP?", back: "TEP: angio-TC helicoidal · TVP: duplex-scan de MMII" },
      { front: "Gestante com suspeita de TEP — 1º exame (apostila)?", back: "Duplex de MMII · Se TVP+, trata sem irradiar com angio-TC" },
      { front: "D-dímero — papel?", back: "Útil se probabilidade baixa · Negativo afasta · Não confirma · Não usar para ‘fechar’ alta probabilidade" },
      { front: "TEP estável — tratamento base?", back: "Anticoagulação · Suporte · Investigar fator precipitante" },
      { front: "TEP instável — ideia?", back: "Choque/hipotensão · Trombólise se sem contraindicação absoluta · Eco à beira-leito pode apoiar se TC inviável" },
      { front: "Encontro de TVP na investigação de TEP?", back: "Encerra investigação para fins de tratamento (mesma anticoagulação) — apostila" }
    ]
  },
  {
    id: "pnm-cancer",
    name: "Câncer de pulmão · histologia · Pancoast · paraneoplásicas",
    specialty: "clinica",
    cards: [
      { front: "O que a apostila chama de ‘câncer de pulmão’?", back: "Neoplasia maligna do epitélio do trato respiratório inferior · Exclui linfoma, sarcoma, mesotelioma, carcinoide do termo" },
      { front: "Dois grandes grupos histológicos?", back: "Pequenas células · Não pequenas células (epidermoide, adenocarcinoma, grandes células)" },
      { front: "Epidemiologia BR (apostila)?", back: "Principal causa de morte oncológica em homens · 2ª em mulheres (atrás da mama)" },
      { front: "Adenocarcinoma — pistas?", back: "Mais frequente entre NPPC · Pode em não tabagistas · Mais periférico · Alvos moleculares em selecionados" },
      { front: "Epidermoide — pistas?", back: "Central · Tabaco · Hemoptise/obstrução · Hipercalcemia por PTHrP" },
      { front: "Pequenas células (oat cell) — pistas?", back: "Central · Tabaco · Disseminação precoce · Mais paraneoplásicas · Tratamento clínico (quimio ± radio)" },
      { front: "Síndrome de Pancoast-Tobias — clínica?", back: "Tumor de ápice · Dor ombro/escápula · Dor em distribuição do ulnar (± atrofia) · Destruição 1ª–2ª costelas · RM delineia bem (plano coronal)" },
      { front: "Histologia mais comum no Pancoast (apostila)?", back: "Epidermoide ~52% · Também grandes células e adenocarcinoma (~23% cada)" },
      { front: "Claude-Bernard-Horner no Pancoast?", back: "Miose, ptose, enoftalmia, anidrose ipsilateral · Cadeia simpática/gânglio estrelado · Frequentemente coexiste / compõe o Pancoast" },
      { front: "Síndrome da veia cava superior — pistas?", back: "Mais lobo superior direito · CPC é subtipo comum · Edema face/MMSS · Circulação colateral · Turgência jugular" },
      { front: "Hipercalcemia paraneoplásica — tipo e mecanismo?", back: "Mais epidermoide · PTHrP tumoral · PTH sérico suprimido · Clínica similar a hiperparatireoidismo" },
      { front: "Tratamento agudo da hipercalcemia (apostila)?", back: "Volume · Diurético de alça · Bisfosfonato · Calcitonina se Ca >14 (rápida; taquifilaxia ~48h)" },
      { front: "Qual histologia mais causa paraneoplásicas?", back: "Carcinoma de pequenas células" },
      { front: "Nódulo pulmonar solitário — ideia?", back: "≤3 cm · Probabilidade maligna guia seguimento vs biópsia/ressecção · Tamanho, bordas, tabaco, idade" }
    ]
  },
  {
    id: "pnm-intensiva-hipoxemia",
    name: "IR · hipoxemia · indicações de IOT",
    specialty: "clinica",
    cards: [
      { front: "Principal critério para intubar (apostila)?", back: "Exame clínico: consciência, esforço, FR, hemodinâmica · Gasometria apoia em alguns casos" },
      { front: "Indicações de IOT/VM listadas?", back: "Rebaixamento + instabilidade respiratória · Instabilidade respiratória + hemodinâmica · Obstrução alta · Secreção não depurada · Fadiga grave · PCR prolongada · PaO2<60 ou Sat<90% refratária · PaCO2>55 com pH<7,25 · CV<15 mL/kg neuromuscular" },
      { front: "SDRA — definição prática (apostila)?", back: "Injúria inflamatória · Edema não cardiogênico · Membrana hialina · Shunt · Infiltrado difuso · Histologia: DAD · P/F <300" },
      { front: "Mecanismo da hipoxemia na SDRA?", back: "Shunt intrapulmonar · Hipoxemia refratária" },
      { front: "PaO2/FiO2 — uso?", back: "Quantifica hipoxemia · Critério/gravidade da SDRA · Seguir evolução" },
      { front: "Causas de SDRA — ideia?", back: "Pulmonares (pneumonia, aspiração) e extrapulmonares (sepsis, trauma, pancretite…) · Pulmão recebe todo o DC" },
      { front: "ECMO / ECCO2R — quando a apostila cita?", back: "SDRA refratária às estratégias de VM · Troca gasosa extracorpórea selecionada" }
    ]
  },
  {
    id: "pnm-intensiva-vm",
    name: "VM · modos · PEEP · VNI · SDRA",
    specialty: "clinica",
    cards: [
      { front: "VM invasiva — conceito (apostila)?", back: "Via tubo traqueal · Pressão positiva transtorácica na inspiração (≠ espontânea)" },
      { front: "Modo assisto-controlado — ideia?", back: "Mais usado · Garante volume · FR mínima ajustada · Paciente pode disparar ciclos extras (gatilho)" },
      { front: "Volume corrente alvo (apostila)?", back: "8–10 mL/kg sem lesão grave · 6 mL/kg na SDRA · Platô <35 cmH2O" },
      { front: "PEEP — função?", back: "Mantém alvéolos abertos no fim da expiração · Melhora oxigenação · Cuidado hemodinâmico / hiperinsuflação" },
      { front: "Auto-PEEP — o que é?", back: "Aprisionamento aéreo · Obstrução / tempo expiratório curto · Hipotensão e barotrauma possíveis" },
      { front: "VNI — regras básicas (apostila)?", back: "Desperto e cooperativo · Reflexos de via aérea intactos · Estabilidade hemodinâmica" },
      { front: "Indicações clássicas de VNI?", back: "DPOC descompensada · Edema agudo cardiogênico · Evita TOT e reduz morbimortalidade se bem indicada" },
      { front: "BiPAP × CPAP?", back: "BiPAP: IPAP + EPAP (como PSV+PEEP sem TOT) · CPAP: um nível contínuo (~10 cmH2O); escolha em Pickwick/apneia e congestão" },
      { front: "Ventilação protetora na SDRA?", back: "VC baixo (~6 mL/kg) · Limitar platô · PEEP adequado · Prona em graves selecionados" },
      { front: "Complicações do TOT/VM (apostila)?", back: "Lesão traqueal/cordas · PAV · Baro/volutrauma · Instabilidade hemodinâmica" },
      { front: "Desmame — ideia?", back: "Causa tratada · Trocas ok · Drive presente · Teste de respiração espontânea" }
    ]
  },
  {
    id: "pnm-derrame",
    name: "Derrame pleural · Light · manejo",
    specialty: "clinica",
    cards: [
      { front: "Pleura — anatomia rápida (apostila)?", back: "Tecido conjuntivo + mesotélio · Reveste pulmão e estruturas adjacentes · Delimita espaço pleural" },
      { front: "Critérios de Light — exsudato se ≥1?", back: "Prot líquido/plasma >0,5 · LDH líquido/plasma >0,6 · LDH líquido >2/3 LSN do plasma (>200 U/L na apostila)" },
      { front: "Por que separar transudato × exsudato?", back: "Restringe etiologias · Exsudato = doença local na pleura → investigação dirigida" },
      { front: "Exames de rotina no exsudato (apostila)?", back: "pH · Glicose (e no sangue) · Celularidade · Gram · Culturas (bactérias, fungos, BK) · Citologia oncótica" },
      { front: "Quilotórax — confirmação laboratorial?", back: "TG no líquido >100–110 mg/dL · ± quilomícrons" },
      { front: "Amilase no líquido pleural — quando?", back: "Suspeita de pancreatite · Também ruptura esofágica / neoplasia em alguns contextos" },
      { front: "Derrame parapneumônico / empiema?", back: "Associado a pneumonia · Pus = empiema → dreno + ATB · Loculação/pH baixo/glicose baixa alertam" },
      { front: "Derrame neoplásico — pistas?", back: "Exsudato · Citologia · Recorrente · Volumes grandes · Cuidado com edema de reexpansão se drenar muito de uma vez" },
      { front: "Edema agudo de reexpansão — o que é?", back: "Após drenagem súbita de grande volume · Citocinas + ↑ permeabilidade · Edema não cardiogênico / SDRA-like" },
      { front: "Transudatos clássicos?", back: "ICC · Cirrose · Síndrome nefrótica · Hipoalbuminemia" },
      { front: "US no derrame — papel?", back: "Confirma líquido · Guia punção · Diferencia consolidações — yield alto em provas de intensiva" }
    ]
  },
  {
    id: "pnm-intersticial",
    name: "Intersticiais · FPI · sarcoidose",
    specialty: "clinica",
    cards: [
      { front: "DPI — jeitão clínico?", back: "Dispneia progressiva · Tosse seca · Estertores em velcro · ± baqueteamento · Restrição + DLCO ↓" },
      { front: "Fibrose pulmonar idiopática — pistas?", back: ">50a · Progressiva · TC padrão UIP (honeycombing basal subpleural) · Mau prognóstico" },
      { front: "Sarcoidose — definição (apostila)?", back: "Inflamatória crônica idiopática · Granulomas não caseosos (linfócitos + macrófagos) · Também chamada Besnier-Boeck-Schaumann" },
      { front: "Órgão mais afetado na sarcoidose?", back: "Pulmão >90% · Também pele, olhos, linfonodos, fígado" },
      { front: "Curso espontâneo (apostila)?", back: "~50% autolimitada com remissão espontânea" },
      { front: "Rx clássico da sarcoidose?", back: "Adenopatia hilar bilateral ± infiltrado · Estágios radiológicos" },
      { front: "Síndrome de Heerfordt-Waldenström?", back: "Uveíte + parotidite + paralisia facial ± febre · Forma de apresentação da sarcoidose" },
      { front: "Diagnóstico da sarcoidose?", back: "Clínica + imagem + histologia não caseosa + exclusão de TB/fungos · ACE pode ↑ (não diagnostica sozinho)" },
      { front: "Tratamento da sarcoidose?", back: "Muitos sem droga · Corticoide se órgão ameaçado/sintomas · Imunossupressor poupador se crônico" },
      { front: "Pneumonite por hipersensibilidade?", back: "Exposição a antígeno orgânico · Remover exposição é a âncora · Pode fibrosar se crônica" },
      { front: "Pneumoconioses — mensagem?", back: "Poeira inorgânica ocupacional · História ocupacional é ouro · Silicose ↑ risco de TB" },
      { front: "TB × sarcoidose — pegadinha?", back: "Ambas granulomatosas/adenopatia · TB: caseação + microbiologia+ · Nunca corticoide em sarcoide sem excluir TB" }
    ]
  }
];

const all = decks.concat(pneumo2);
const out = path.join(__dirname, "..", "data", "flashcards-pneumo.json");
fs.writeFileSync(out, JSON.stringify(all, null, 2) + "\n", "utf8");
console.log(
  "wrote",
  out,
  "·",
  all.length,
  "decks ·",
  all.reduce((n, d) => n + d.cards.length, 0),
  "cards",
  `(Pneumo1 ${decks.length} + Pneumo2 ${pneumo2.length})`
);
