/**
 * Flashcards Endocrinologia · End2
 * Fonte exclusiva: data/_extract_endo/End2-full.txt
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "endo-cushing", name: "Cushing · investigação · tratamento", specialty: "clinica",
    cards: [
      { front: "Síndrome de Cushing: definição?", back: "Sinais e sintomas decorrentes de exposição crônica ao excesso de glicocorticoide" },
      { front: "Qual é a causa mais comum de síndrome de Cushing?", back: "Uso crônico de glicocorticoides · Cushing iatrogênico" },
      { front: "Após excluir a forma iatrogênica, qual a etiologia mais comum?", back: "Doença de Cushing · Corticotropinoma hipofisário hipersecretante de ACTH · Cerca de 70% dos casos" },
      { front: "Quais achados aumentam a suspeita clínica de Cushing?", back: "Obesidade centrípeta progressiva · Estrias violáceas largas · Miopatia proximal · Face cushingoide" },
      { front: "Cushing na criança: qual associação é sugestiva?", back: "Obesidade generalizada acompanhada de retardo do crescimento" },
      { front: "Quais testes demonstram hipercortisolismo no rastreio de Cushing?", back: "Cortisol livre urinário de 24 h · Supressão com dexametasona em baixa dose · Cortisol salivar noturno" },
      { front: "Como confirmar hipercortisolismo no algoritmo de Cushing?", back: "Pelo menos dois testes de triagem positivos · Se dois forem discordantes, usar um terceiro método" },
      { front: "Depois de confirmar hipercortisolismo, qual é o próximo passo?", back: "Dosar ACTH plasmático" },
      { front: "ACTH baixo no Cushing: o que indica e qual exame solicitar?", back: "Cushing ACTH-independente por patologia primária adrenal · TC de abdome" },
      { front: "ACTH alto no Cushing: qual investigação inicial?", back: "Cushing ACTH-dependente · RM de sela túrcica e teste de Liddle 2" },
      { front: "Como doença de Cushing e secreção ectópica de ACTH respondem à dexametasona em alta dose?", back: "Corticotropinoma pode suprimir ACTH e cortisol · Secreção ectópica não é suprimida" },
      { front: "Quando indicar cateterismo do seio petroso inferior no Cushing?", back: "RM de sela normal com supressão no Liddle 2 · Compara ACTH central e periférico antes e após CRH" },
      { front: "Se RM de sela normal não suprime no Liddle 2, qual etiologia é provável?", back: "Secreção ectópica de ACTH · O próximo exame é TC de tórax e abdome" },
      { front: "Qual o tratamento de escolha da doença de Cushing?", back: "Ressecção transesfenoidal do corticotropinoma" },
      { front: "Quando a radioterapia é usada na doença de Cushing?", back: "Doença persistente · Recidiva pós-operatória · Risco cirúrgico proibitivo" },
      { front: "Quais inibidores da esteroidogênese podem ser usados no Cushing grave?", back: "Cetoconazol · Metirapona · Mitotano · Etomidato intravenoso" }
    ]
  },
  {
    id: "endo-addison-insuficiencia-adrenal", name: "Addison · insuficiência adrenal", specialty: "clinica",
    cards: [
      { front: "Insuficiência adrenal primária versus secundária: onde está a lesão?", back: "Primária: córtex adrenal · Secundária: deficiência de ACTH por hipófise ou hipotálamo" },
      { front: "Qual a causa mais comum de insuficiência adrenal primária nos países industrializados?", back: "Adrenalite autoimune · 75–85% dos casos nos EUA desde 1950" },
      { front: "Quanto do córtex adrenal deve ser afetado para manifestar Addison?", back: "Mais de 90%" },
      { front: "Quais achados distinguem Addison de insuficiência adrenal secundária?", back: "Addison: ACTH alto, hiperpigmentação e deficiência mineralocorticoide · Secundária: ACTH baixo/normal e aldosterona geralmente preservada" },
      { front: "Por que ocorre hiperpigmentação na doença de Addison?", back: "Aumento de ACTH na insuficiência adrenal primária" },
      { front: "Qual cortisol matinal praticamente confirma ou torna improvável insuficiência adrenal?", back: "< 3–5 μg/dL: quase patognomônico · > 18–20 μg/dL: diagnóstico bastante improvável" },
      { front: "Qual é o exame mais importante para confirmar insuficiência adrenal?", back: "Teste rápido de estímulo com ACTH sintético · Cortrosina ou cosintropina 250 μg" },
      { front: "No teste da cortrosina, qual pico de cortisol confirma insuficiência adrenal?", back: "Pico ≤ 18–20 μg/dL · Pico > 18–20 μg/dL exclui insuficiência primária e secundária franca com atrofia adrenal" },
      { front: "Após teste da cortrosina alterado, qual dosagem separa forma primária da secundária?", back: "ACTH plasmático · Alto em Addison · Baixo ou normal na insuficiência secundária" },
      { front: "Quais situações precipitam crise adrenal em Addison?", back: "Infecção · Cirurgia · Desidratação por privação de sal, diarreia ou vômitos" },
      { front: "O que é a síndrome de Waterhouse-Friderichsen?", back: "Apoplexia/hemorragia adrenal bilateral na sepse por Gram-negativos ou meningococcemia · Causa de insuficiência adrenal aguda" },
      { front: "Crise adrenal: quadro que demanda tratamento empírico?", back: "Hipotensão ou choque com vômitos e/ou hipoglicemia em paciente de risco · Condição potencialmente fatal" },
      { front: "Qual esquema inicial de hidrocortisona na crise adrenal?", back: "100 mg EV a cada 6 h por 24 h · Ou 100 mg inicial seguido de infusão contínua de 10 mg/h" },
      { front: "Quais medidas de suporte acompanham a crise adrenal?", back: "Corrigir depleção de volume, desidratação, eletrólitos e hipoglicemia · Tratar infecção ou outro fator precipitante" },
      { front: "Por que não é preciso fludrocortisona no início da crise adrenal?", back: "As doses preconizadas de hidrocortisona já possuem efeito mineralocorticoide" },
      { front: "Qual reposição de manutenção é usada na insuficiência adrenal crônica?", back: "Prednisona ou hidrocortisona em doses divididas · A dose deve dobrar em infecções e procedimentos como extração dentária" },
      { front: "Quando a fludrocortisona é indicada na insuficiência adrenal?", back: "Apenas na insuficiência adrenal primária · Raramente necessária na secundária" },
      { front: "Hiperplasia adrenal congênita por 21-hidroxilase — mecanismo?", back: "Bloqueia cortisol e aldosterona · Precursor desvia para androgênios adrenais · Forma mais comum de HAC" },
      { front: "HAC 21-OH — forma clássica mais frequente e rastreio?", back: "Perdedora de sal ~66% (virilizante simples ~32%) · Crise adrenal neonatal possível · Rastreio com 17-hidroxiprogesterona (teste do pezinho)" }
    ]
  },
  {
    id: "endo-feocromocitoma", name: "Feocromocitoma · diagnóstico · preparo", specialty: "clinica",
    cards: [
      { front: "Feocromocitoma: origem e definição?", back: "Neoplasia de células cromafins da medula adrenal · Paraganglioma é tumor cromafim extra-adrenal" },
      { front: "Qual catecolamina é preferencialmente secretada por paragangliomas?", back: "Noradrenalina · A maioria não possui PNMT" },
      { front: "Qual é a apresentação clássica do feocromocitoma?", back: "Crises paroxísticas de hipertensão · Cefaleia · Sudorese profusa · Palpitações" },
      { front: "Quais associações hereditárias são clássicas no feocromocitoma?", back: "NEM 2A · NEM 2B · Von Hippel-Lindau · Neurofibromatose tipo 1" },
      { front: "Em quais situações investigar feocromocitoma?", back: "Paroxismos adrenérgicos · HAS resistente ou em jovem · Incidentaloma adrenal · História familiar ou síndrome hereditária" },
      { front: "Qual é o primeiro passo bioquímico na suspeita de feocromocitoma?", back: "Dosar catecolaminas e metanefrinas no plasma e/ou urina · Dosagens fracionadas são preferíveis" },
      { front: "Qual resultado bioquímico praticamente sela o diagnóstico de feocromocitoma?", back: "Catecolaminas ou metanefrinas > 3 vezes o limite superior da normalidade" },
      { front: "Como reduzir falso-positivo ao dosar metanefrinas plasmáticas?", back: "Coletar paciente deitado e calmo após acesso venoso prévio" },
      { front: "Após rastreio bioquímico positivo, qual é o próximo passo?", back: "Localizar o tumor por métodos de imagem" },
      { front: "Qual o papel de TC, RM e MIBG no feocromocitoma?", back: "TC ou RM localizam após confirmação bioquímica · MIBG auxilia quando os demais métodos não localizam, especialmente em paragangliomas" },
      { front: "Quando o PET-scan e o octreoscan podem ser úteis no feocromocitoma?", back: "PET-scan pode detectar paragangliomas · Octreoscan é especialmente útil no feocromocitoma maligno para investigar metástases" },
      { front: "Por que PAAF de massa adrenal é contraindicada quando há suspeita de feocromocitoma?", back: "Pode desencadear crise hiperadrenérgica fatal" },
      { front: "Qual a sequência correta no preparo pré-operatório do feocromocitoma?", back: "Bloqueio alfa por 10–14 dias + liberar sódio/hidratar · Fenoxibenzamina clássica (indisponível no BR) · No Brasil: prazosina, terazosina ou doxazosina · Beta só após alfa" },
      { front: "Por que o betabloqueador não pode anteceder o bloqueio alfa no feocromocitoma?", back: "Beta isolado perde vasodilatação β2 · Pode elevar intensamente a PA · Por isso o alfa vem primeiro" },
      { front: "Quais frequências compõem a regra dos 10% do feocromocitoma?", back: "≈10%: bilaterais · Extra-adrenais · Extra-adrenais torácicos · <20 anos · Malignos · Sem HAS · Recidiva · Valores podem variar" },
      { front: "Quando usar cateterismo venoso seletivo das adrenais no feocromocitoma?", back: "Evidência laboratorial de feocromocitoma sem tumor identificado nos exames de imagem" }
    ]
  },
  {
    id: "endo-hiperaldosteronismo", name: "Hiperaldosteronismo · Conn", specialty: "clinica",
    cards: [
      { front: "Hiperaldosteronismo primário: definição?", back: "Produção excessiva de aldosterona pela suprarrenal · Independente do sistema renina-angiotensina" },
      { front: "Como a renina diferencia hiperaldosteronismo primário de secundário?", back: "Primário: renina suprimida · Secundário: renina elevada" },
      { front: "Qual a principal causa de hiperaldosteronismo primário?", back: "Hiperplasia adrenal bilateral idiopática · Adenoma produtor de aldosterona é outra causa frequente" },
      { front: "Quais alterações sugerem hiperaldosteronismo primário?", back: "Hipertensão · Hipocalemia · Alcalose metabólica · Hipocalemia pode causar poliúria e polidipsia por DI nefrogênico" },
      { front: "Quem deve ser rastreado para hiperaldosteronismo primário?", back: "HAS resistente · HAS com hipocalemia · HAS com incidentaloma adrenal · HAS de início precoce ou familiar de primeiro grau com HAP" },
      { front: "Qual é o exame inicial para HAP e qual preparo é necessário?", back: "Relação CAP/ARP entre 8–10 h · Corrigir hipocalemia antes da coleta" },
      { front: "Como interpretar CAP/ARP no resumo do capítulo?", back: "> 50 confirma · < 30 exclui · Valores intermediários exigem teste confirmatório" },
      { front: "Qual resultado de rastreio é sugestivo de HAP?", back: "CAP/ARP ≥ 30 com CAP > 15 pg/mL" },
      { front: "O que fazer com espironolactona antes de dosar CAP/ARP?", back: "Suspender por 4–6 semanas" },
      { front: "Como a sobrecarga intravenosa de sódio confirma HAP?", back: "Após 2 L de SF 0,9% em 4 h, CAP > 10 ng/dL sugere HAP · Normalmente, CAP cai para < 5 ng/dL" },
      { front: "Após confirmação laboratorial de HAP, qual é o primeiro exame de imagem?", back: "TC de alta resolução do abdome superior" },
      { front: "Quando é indicado o cateterismo das veias adrenais no HAP?", back: "Suspeita de hiperplasia bilateral assimétrica ou lesão unilateral duvidosa na TC · Compara aldosterona/cortisol dos dois lados" },
      { front: "Que resultado no cateterismo adrenal sugere produção unilateral de aldosterona?", back: "Relação aldosterona/cortisol > 4:1 daquele lado" },
      { front: "Como tratar adenoma produtor de aldosterona?", back: "Adrenalectomia unilateral laparoscópica · Corrigir hipocalemia e iniciar espironolactona no pré-operatório" },
      { front: "Como tratar hiperplasia adrenal bilateral idiopática?", back: "Tratamento medicamentoso · Espironolactona é a droga recomendada · Eplerenona é alternativa se houver intolerância" },
      { front: "Qual o papel da adrenalectomia na hiperplasia adrenal bilateral idiopática?", back: "Raramente realizada, pois cura menos de 25% · Indicada na hipopotassemia refratária" }
    ]
  },
  {
    id: "endo-paratireoide", name: "Paratireoide · cálcio · vitamina D", specialty: "clinica",
    cards: [
      { front: "Qual fração do cálcio é fisiologicamente relevante?", back: "Cálcio ionizado · O cálcio total acompanha variações da albumina" },
      { front: "Como corrigir o cálcio total para albumina?", back: "Cálcio corrigido = cálcio total medido + 0,8 × (4 − albuminemia)" },
      { front: "Quais os efeitos do PTH sobre a calcemia?", back: "Reabsorção óssea · Menor excreção renal de cálcio · Estímulo à produção de calcitriol" },
      { front: "Quais efeitos renais adicionais do PTH?", back: "Inibe reabsorção de fosfato e bicarbonato no túbulo proximal · Produz fosfatúria" },
      { front: "Qual metabólito deve ser dosado para investigar deficiência de vitamina D?", back: "25(OH)-vitamina D · Forma de meia-vida longa que reflete melhor o pool endógeno" },
      { front: "Qual o ponto de corte de 25(OH)-vitamina D baixo citado no texto?", back: "< 20 ng/mL" },
      { front: "Qual a principal causa de hiperparatireoidismo primário?", back: "Adenoma solitário esporádico de paratireoide · Cerca de 80% dos casos" },
      { front: "Qual padrão laboratorial do hiperparatireoidismo primário?", back: "Hipercalcemia · PTH elevado ou inapropriadamente normal · Hipofosfatemia por efeito fosfatúrico do PTH" },
      { front: "Como diferenciar hiperparatireoidismo primário de FHH?", back: "FHH tem hipocalciúria · Cálcio urinário < 50 mg/dia, inesperado no hiperpara verdadeiro" },
      { front: "Por que a paratireoidectomia não beneficia a FHH?", back: "O prognóstico é excelente e não há benefício da paratireoidectomia subtotal" },
      { front: "Como se forma o hiperparatireoidismo secundário na DRC?", back: "Retenção de fosfato · Menor produção renal de calcitriol · Tendência à hipocalcemia, todos estimulando PTH" },
      { front: "Como definir hiperparatireoidismo terciário?", back: "Hiperpara secundário prolongado com transformação neoplásica e secreção autônoma de PTH · Persiste após corrigir a doença de base" },
      { front: "Como a calcemia costuma se comportar no hiperpara secundário e terciário?", back: "Secundário: pode ser normal ou baixa · Hipercalcemia franca é esperada no terciário" },
      { front: "Qual é o papel do sestamibi no hiperparatireoidismo?", back: "Localização pré-operatória de tecido paratireoidiano ativo · Não confirma o diagnóstico" },
      { front: "Qual padrão laboratorial do hipoparatireoidismo primário?", back: "Hipocalcemia · Hiperfosfatemia · PTH baixo" },
      { front: "Qual padrão cálcio-fósforo-PTH ocorre na deficiência de vitamina D?", back: "Hipocalcemia · Hipofosfatemia · PTH elevado por aumento da fosfatúria" },
      { front: "Pseudo-hipoparatireoidismo — o que é e qual o laboratório?", back: "Resistência periférica ao PTH (hereditária) · Hipocalcemia + hiperfosfatemia como no hipopara · PTH elevado (>65 pg/mL) · Pode haver osteodistrofia de Albright (braquidactilia 4º/5º)" },
      { front: "Crise hipercalcêmica — critérios e tratamento inicial?", back: "Ca total >15 mg/dL + encefalopatia, desidratação e IRA pré-renal · Hidratar vigorosamente com SF 0,9% primeiro · Depois furosemida · Graves/refratários: calcitonina e bifosfonato (pamidronato/zoledronato)" }
    ]
  },
  {
    id: "endo-hipofise", name: "Hipófise · acromegalia · prolactina · ADH", specialty: "clinica",
    cards: [
      { front: "Qual hormônio hipotalâmico inibe tonicamento a prolactina?", back: "Dopamina · A lesão do pedículo reduz a inibição e pode elevar prolactina" },
      { front: "Ao seccionar o pedículo hipofisário, como ficam os hormônios adeno-hipofisários?", back: "GH, TSH, ACTH, LH e FSH caem · Prolactina aumenta pela perda da inibição dopaminérgica" },
      { front: "Onde ADH é sintetizado e liberado?", back: "Sintetizado nos núcleos supraóptico e paraventricular do hipotálamo · Liberado pela neuro-hipófise" },
      { front: "Quais são os principais distúrbios patológicos do ADH?", back: "SIADH: secreção inapropriada de ADH · Diabetes insipidus central: secreção prejudicada de ADH" },
      { front: "Qual causa comum de diabetes insipidus em crianças é citada no texto?", back: "Granuloma eosinofílico ou síndrome X" },
      { front: "Qual causa mais comum de pan-hipopituitarismo?", back: "Adenoma hipofisário · Comprime a glândula funcionante" },
      { front: "Quais causas adquiridas clássicas de hipopituitarismo além do adenoma?", back: "Síndrome de Sheehan (necrose pós-parto) · Apoplexia hipofisária · Tumores hipotalâmicos · Hipofisite linfocítica · Cirurgia/radioterapia" },
      { front: "Como a síndrome da sela vazia pode afetar a prolactina?", back: "Estiramento do pedículo hipofisário reduz inibição dopaminérgica · Pode elevar prolactina · Também citado junto a trauma e compressão do pedículo" },
      { front: "Qual é a principal causa de hiperprolactinemia não fisiológica?", back: "Uso de fármacos · Neurolépticos e metoclopramida bloqueiam receptores de dopamina" },
      { front: "Prolactina muito alta: qual valor sugere prolactinoma?", back: "> 150–200 ng/mL · Muito indicativo de prolactinoma" },
      { front: "Qual é o problema do efeito gancho no prolactinoma?", back: "Macroprolactinoma volumoso pode ter prolactina falsamente baixa no ensaio imunométrico · Repetir com soro diluído" },
      { front: "Qual é o tratamento inicial dos micro e macroprolactinomas?", back: "Agonista dopaminérgico · Cabergolina é preferida por eficácia, tolerabilidade e posologia · Bromocriptina é a escolha na gravidez" },
      { front: "Quando indicar cirurgia no prolactinoma?", back: "Ausência de normalização da prolactina e/ou redução tumoral após três meses de agonista dopaminérgico em dose ótima" },
      { front: "Acromegalia versus gigantismo: qual a diferença?", back: "Excesso de GH antes do fechamento epifisário causa gigantismo · Depois, acromegalia" },
      { front: "Qual a origem da maior parte da acromegalia?", back: "Adenoma hipofisário secretor de GH · Acromegalia está mais associada a macroadenomas" },
      { front: "Como confirmar acromegalia no TOTG?", back: "Nadir de GH > 1,0 ng/mL com IGF-1 elevado · Normalmente GH deve suprimir" },
      { front: "Qual é o tratamento primário da acromegalia?", back: "Cirurgia transesfenoidal" },
      { front: "Quando usar tratamento medicamentoso na acromegalia?", back: "Não candidatos à cirurgia ou baixa chance de cura · Análogos da somatostatina são as drogas de escolha" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-endo.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
if (!Array.isArray(existing)) throw new Error("flashcards-endo.json deve conter um array");

const endo2Ids = new Set(decks.map((deck) => deck.id));
const byId = new Map(existing.filter((deck) => !endo2Ids.has(deck.id)).map((deck) => [deck.id, deck]));
decks.forEach((deck) => byId.set(deck.id, deck));
const merged = [...byId.values()];

fs.writeFileSync(out, JSON.stringify(merged, null, 2) + "\n", "utf8");
console.log(`End2: ${decks.map((deck) => `${deck.id} (${deck.cards.length})`).join(" · ")}`);
console.log(`Total End2: ${decks.reduce((total, deck) => total + deck.cards.length, 0)} cards`);
console.log(`Total no arquivo: ${merged.length} decks · ${merged.reduce((total, deck) => total + deck.cards.length, 0)} cards`);
