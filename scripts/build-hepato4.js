/**
 * Flashcards Hepatologia · Hep4
 * Fonte exclusiva: data/_extract_hepato/Hep4-full.txt · apêndices 1–4.
 */
const fs = require("fs");
const path = require("path");

const newDecks = [
  {
    id: "hep-cep",
    name: "Colangite esclerosante primária · CEP",
    specialty: "clinica",
    cards: [
      { front: "CEP — definição anatomopatológica?", back: "Doença inflamatório-fibrosante, estenosante e progressiva das grandes vias biliares intra e extra-hepáticas · estenoses segmentares irregulares são o achado clássico" },
      { front: "CEP — perfil epidemiológico e associação principal?", back: "Homens jovens · maioria com menos de 45 anos · 70–90% têm doença inflamatória intestinal, sobretudo RCU" },
      { front: "CEP e RCU — números de associação?", back: "60–75% dos portadores de CEP têm RCU · apenas 5% dos portadores de RCU desenvolvem CEP" },
      { front: "CEP — sintomas e evolução típicos?", back: "Início insidioso · fadiga progressiva, dor em QSD, prurido e depois icterícia · colangite bacteriana recorrente pode ocorrer pelas estenoses" },
      { front: "CEP avançada — principais consequências da colestase e obstrução?", back: "Cirrose, hipertensão portal e sangramento variceal · deficiência de vitaminas lipossolúveis A, D, E e K" },
      { front: "CEP — padrão laboratorial inicial?", back: "Fosfatase alcalina elevada em quase todos, pelo menos cerca de 2 vezes · bilirrubina direta sobe com progressão e é marcador prognóstico" },
      { front: "CEP — p-ANCA e cobre?", back: "p-ANCA em 80%, podendo apenas sinalizar RCU coexistente · ceruloplasmina e cobre sérico elevados; cobre urinário elevado correlaciona-se com pior histologia" },
      { front: "CEP — exame diagnóstico clássico e achado?", back: "CPRE · estenoses multifocais, sobretudo nas bifurcações dos ductos; bifurcação dos hepáticos é a região mais acometida" },
      { front: "CEP — papel de USG, colangio-RM e biópsia?", back: "USG tem uso limitado · colangio-RM é alternativa diagnóstica crescente · biópsia pode mostrar fibrose periductal em anel de cebola e estadiar fibrose/cirrose" },
      { front: "CEP de pequenos ductos — como reconhecer?", back: "Marcadores de colestase inequivocamente altos sem estenose à colangiografia · biópsia com achados típicos e exclusão de outras causas" },
      { front: "CEP de pequenos ductos — prognóstico?", back: "Melhor que na CEP convencional · menor risco de colangiocarcinoma pela ausência de lesões extra-hepáticas" },
      { front: "CEP — risco de neoplasias?", back: "Colangiocarcinoma em 7–20% · risco estimado de 1% ao ano · CEP com RCU aumenta o risco de CCR acima do risco da RCU isolada" },
      { front: "CEP — medidas clínicas e papel do AUDC?", back: "Colestiramina para prurido · reposição de vitaminas lipossolúveis, sobretudo vitamina D · AUDC 15 mg/kg/dia melhora parâmetros, mas sem benefício significativo em mortalidade ou transplante no longo prazo" },
      { front: "CEP — tratamento de estenose importante e doença avançada?", back: "Estenose única grave ou colangite recorrente: CPRE com stent · doença avançada: transplante hepático, com recorrência no enxerto em torno de 30%" }
    ]
  },
  {
    id: "hep-cistos-vias-biliares",
    name: "Cistos das vias biliares · Caroli",
    specialty: "clinica",
    cards: [
      { front: "Cistos das vias biliares — por que costumam demandar intervenção?", back: "Risco futuro de colangiocarcinoma pode chegar a 30% · a mucosa lesada desenvolve inflamação e displasia" },
      { front: "Cistos coledocianos — mecanismo em 90% dos casos?", back: "Junção anômala, mais alta, entre colédoco e ducto pancreático principal · canal comum longo mistura secreções pancreáticas e biliares" },
      { front: "Canal comum anômalo — como leva à dilatação?", back: "Enzimas pancreáticas promovem autodigestão e enfraquecimento da parede ductal · dilatação progressiva e agressão da mucosa" },
      { front: "Todani I — definição?", back: "Dilatação de toda a árvore biliar extra-hepática" },
      { front: "Todani II — definição?", back: "Dilatação diverticular em algum ponto da árvore biliar extra-hepática" },
      { front: "Todani III — definição e outro nome?", back: "Dilatação da porção intraduodenal do ducto biliar comum · coledococele" },
      { front: "Todani IVa × IVb?", back: "IVa: dilatação intra e extra-hepática · IVb: múltiplas dilatações extra-hepáticas" },
      { front: "Todani V — definição?", back: "Dilatação exclusivamente dos ductos biliares intra-hepáticos · doença de Caroli" },
      { front: "Visser — quais entidades substituem a classificação numérica?", back: "Cistos de colédoco · divertículo de colédoco · coledococele · doença de Caroli" },
      { front: "Visser — equivalência para Todani I/IV, II, III e V?", back: "I e IV: cistos de colédoco · II: divertículo de colédoco · III: coledococele · V: doença de Caroli" },
      { front: "Cisto coledociano — estratégia cirúrgica usual?", back: "Ressecção de segmento variável da via biliar e vesícula · hepaticojejunostomia em Y de Roux" },
      { front: "Cistos de vias biliares — objetivo central da cirurgia?", back: "Eliminar a mucosa danificada · profilaxia do colangiocarcinoma" },
      { front: "Caroli com lesão hepática grave — conduta?", back: "Transplante ortotópico de fígado" },
      { front: "Coledococele — tratamento descrito?", back: "Excisão endoscópica da mucosa do cisto + esfincteroplastia · facilita drenagem e evita estase e cálculos" }
    ]
  },
  {
    id: "hep-lesao-iatrogenica-biliar",
    name: "Lesão iatrogênica da via biliar",
    specialty: "clinica",
    cards: [
      { front: "Lesão iatrogênica biliar — quando pode ser diagnosticada?", back: "Durante a cirurgia · no pós-operatório imediato · tardiamente, meses a anos depois" },
      { front: "Lesão de via biliar — proporção reconhecida intraoperatoriamente?", back: "Apenas 25% · geralmente lesões de ductos maiores reconhecidas por vazamento de bile, colangiografia alterada ou identificação anatômica" },
      { front: "Lesão iatrogênica biliar — dois mecanismos principais?", back: "Vazamento/fístula · ou obstrução por ligadura/estenose cicatricial" },
      { front: "Suspeita de lesão biliar pós-operatória — avaliação inicial?", back: "USG ou TC procurando fístula e biloma · sem esse achado, investigar ligadura/estenose por CTP ou CPRE" },
      { front: "Leak biliar — quadro clínico típico?", back: "Pós-operatório imediato com dor em QSD, febre, distensão e aumento sobretudo de FA · geralmente sem icterícia · bile em dreno ou ferida é pista" },
      { front: "Leak biliar — achado de imagem e exame mais usado?", back: "USG/TC: biloma sub-hepático ou líquido livre · CPRE é a mais usada, pois permite esfincterotomia terapêutica" },
      { front: "Ligadura de colédoco/hepático comum — apresentação e confirmação?", back: "Icterícia importante precoce, com ou sem dor em QSD · USG/TC mostram dilatação proximal · CTP confirma e pode drenar" },
      { front: "Estenose cicatricial de colédoco/hepático comum — apresentação tardia?", back: "Icterícia progressiva · pode evoluir com colangite e cirrose biliar secundária" },
      { front: "Strasberg A, B e C?", back: "A: pequeno ducto com fístula, como cístico/Luschka · B: ducto setorial com estenose · C: ducto setorial com fístula" },
      { front: "Strasberg D × E?", back: "D: ductos principais com fístula · E: ductos principais com estenose · quanto mais proximal a lesão, pior o prognóstico" },
      { front: "Strasberg E1–E5 — gradação essencial?", back: "E1 >2 cm da confluência · E2 <2 cm · E3 na confluência com confluência intacta · E4 destrói confluência · E5 oclui também ductos setoriais" },
      { front: "Lesão detectada durante cirurgia — reparo conforme extensão?", back: "<30% do ducto: reparo com dreno de Kehr · >30% ou transecção: coledocojejunostomia em Y de Roux" },
      { front: "Lesão isolada de ducto hepático — conduta pelo calibre?", back: "<3 mm: ligadura · >3 mm: hepatojejunostomia em Y de Roux" },
      { front: "Fístula de coto cístico detectada após cirurgia — manejo?", back: "Drenagem percutânea do biloma + CPRE com esfincterotomia e stent no colédoco" }
    ]
  },
  {
    id: "hep-abscesso-piogenico",
    name: "Abscesso hepático piogênico",
    specialty: "clinica",
    cards: [
      { front: "Abscesso hepático piogênico — perfil atual?", back: "Meia-idade e idosos · hoje associado a obstrução/infecção biliar, câncer, doença do cólon e diabetes" },
      { front: "Abscesso piogênico — fração sem causa identificada?", back: "43% · pode sugerir bacteremia prévia ou doença oculta do trato biliar" },
      { front: "Abscesso piogênico — vias de chegada das bactérias ao fígado?", back: "Trato biliar, mais frequente · sistema porta · artéria hepática · foco séptico adjacente/ferida penetrante · iatrogenia por biópsia ou embolização" },
      { front: "Abscesso piogênico de origem biliar — padrão?", back: "Geralmente múltiplo e predominante no lobo direito · causas incluem cálculo, câncer, CEP e doença de Caroli" },
      { front: "Abscesso piogênico — microbiologia mais comum?", back: "Geralmente polimicrobiano · E. coli em até 2/3 · também Enterococcus faecalis, Klebsiella, Proteus e anaeróbios" },
      { front: "Quando pensar em estafilococos no abscesso piogênico?", back: "Trauma, bacteremia por cateter venoso profundo/endocardite ou uso de quimioterapia · encontrados em 20–25%" },
      { front: "Abscesso piogênico — clínica usual?", back: "Febre intermitente, dor abdominal difusa ou em QSD e leucocitose com desvio há mais de duas semanas · astenia, anorexia e perda de peso podem ocorrer" },
      { front: "Abscesso piogênico — achados físicos/pulmonares possíveis?", back: "Hepatomegalia em metade · derrame pleural, atelectasia ou pneumonia" },
      { front: "Abscesso piogênico — melhor imagem e papel da USG?", back: "TC é o método de escolha, sensibilidade >95% · USG costuma ser a primeira por acesso/custo, sensibilidade de 80–95%" },
      { front: "Abscesso piogênico — culturas?", back: "Hemoculturas positivas em 50–60% · cultura do aspirado positiva em 90%" },
      { front: "Abscesso piogênico — antibiótico empírico?", back: "Cobrir Gram-negativos entéricos e anaeróbios · betalactâmico + inibidor ou ceftriaxona/quinolona + metronidazol" },
      { front: "Abscesso piogênico — duração mínima de antibiótico?", back: "4–6 semanas · pode ser prolongada em casos selecionados" },
      { front: "Abscesso piogênico — quem deve receber drenagem percutânea?", back: "Todos, exceto pacientes com múltiplos abscessos pequenos · guiada por USG ou TC" },
      { front: "Abscesso piogênico — quando operar e como lidar com obstrução biliar?", back: "Cirurgia quando drenagem percutânea falha · obstrução biliar deve ser aliviada, usualmente por CPRE" }
    ]
  },
  {
    id: "hep-abscesso-amebiano",
    name: "Abscesso hepático amebiano",
    specialty: "clinica",
    cards: [
      { front: "Abscesso hepático amebiano — agente e via?", back: "Entamoeba histolytica · ingestão de cistos, invasão intestinal e chegada ao fígado pelo sistema porta" },
      { front: "Abscesso amebiano — perfil epidemiológico típico?", back: "Homem jovem · relação homem:mulher >10:1 · etilismo pesado é fator de risco" },
      { front: "Abscesso amebiano — padrão anatômico clássico?", back: "Único, na região superoanterior do lobo direito · icterícia é incomum e costuma indicar compressão por abscesso grande ou múltiplos" },
      { front: "Abscesso amebiano — relação com amebíase intestinal simultânea?", back: "A maioria não tem doença intestinal simultânea nem história clínica pregressa · menos de 10% têm essa associação" },
      { front: "Abscesso amebiano — disenteria e fezes para cistos?", back: "Disenteria em apenas 10% · fezes positivas para cistos em somente 15%" },
      { front: "Abscesso amebiano — sorologia?", back: "Alta sensibilidade, 99% · teste negativo essencialmente afasta a hipótese" },
      { front: "Abscesso amebiano — hepatograma e hemograma?", back: "FA discretamente elevada, pouca ou nenhuma alteração de aminotransferases e geralmente sem hiperbilirrubinemia · leucocitose sem eosinofilia" },
      { front: "Abscesso amebiano — imagem para diagnóstico e seguimento?", back: "USG é a mais usada para diagnóstico e acompanhamento · TC é mais sensível para abscessos pequenos" },
      { front: "Piogênico versus amebiano — quatro dados que favorecem fortemente piogênico?", back: "Idade >50 anos · achados pulmonares ao exame · abscessos múltiplos · sorologia antiameba negativa" },
      { front: "Abscesso amebiano — tratamento de primeira linha?", back: "Metronidazol 750 mg, 3x/dia, por 7–10 dias · efetivo em 95% dos casos" },
      { front: "Abscesso amebiano — por que acrescentar amebicida intestinal?", back: "Para tratar empiricamente formas luminais mesmo se exame de fezes for negativo · exemplo: paromomicina por 7 dias" },
      { front: "Abscesso amebiano — quando aspirar?", back: "Dúvida diagnóstica · risco iminente de ruptura, sobretudo >5 cm no lobo esquerdo · sem resposta após 3–5 dias de metronidazol · infecção secundária suspeita ou confirmada" },
      { front: "Aspirado de abscesso amebiano — aspecto típico?", back: "Pasta de anchova · líquido proteináceo, acelular e amarronzado, formado sobretudo por hepatócitos necrosados" },
      { front: "Abscesso amebiano — principais destinos de ruptura?", back: "Peritônio em 2/3 · pulmão em 1/3 · raramente pericárdio" }
    ]
  },
  {
    id: "hep-cisto-hidatico",
    name: "Cisto hidático hepático",
    specialty: "clinica",
    cards: [
      { front: "Cisto hidático — agente e outro nome?", back: "Echinococcus granulosus · equinococose" },
      { front: "Cisto hidático — ciclo de transmissão descrito?", back: "Humano ingere parasitos de fezes de cães · cães adquirem infecção ao ingerir vísceras de ovelhas" },
      { front: "Cisto hidático — contexto epidemiológico típico?", back: "Áreas rurais com criação de ovelhas" },
      { front: "Cisto hidático — órgão e forma de crescimento?", back: "Após absorção, o parasito alcança o fígado e cresce em forma de cisto" },
      { front: "Cisto hidático — quadro clínico habitual?", back: "Arrastado · dor abdominal, náuseas e hepatomegalia · tipicamente sem febre" },
      { front: "Cisto hidático — laboratório inflamatório e eosinofilia?", back: "Não há achados laboratoriais inflamatórios usuais · eosinofilia não é a regra" },
      { front: "Cisto hidático — complicações importantes?", back: "Infecção bacteriana secundária · ruptura com anafilaxia" },
      { front: "Cisto hidático — aparência sonográfica típica?", back: "Cisto usualmente septado ou com debris e parede calcificada" },
      { front: "Cisto hidático — qual sorologia e sensibilidade?", back: "ELISA para E. granulosus · sensibilidade de 85%" },
      { front: "Cisto hidático — tratamento predominante?", back: "Cirúrgico, devido ao alto risco de ruptura, anafilaxia e infecção secundária" },
      { front: "Cisto hidático — exceções ao tratamento cirúrgico?", back: "Cistos pequenos e pacientes com risco cirúrgico proibitivo" },
      { front: "Cisto hidático — antiparasitário indicado?", back: "Albendazol em altas doses · 400 mg, 2x/dia, por três meses · prescrito em todos os casos" }
    ]
  }
];

const obsoleteHep4Ids = new Set(["hep-abscesso-hidatico"]);
const out = path.join(__dirname, "..", "data", "flashcards-hepato.json");
const existing = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
const byId = new Map(existing.map((deck) => [deck.id, deck]));
obsoleteHep4Ids.forEach((id) => byId.delete(id));
newDecks.forEach((deck) => byId.set(deck.id, deck));
const decks = Array.from(byId.values());
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log(`wrote ${out} · ${newDecks.length} Hep4 decks · ${newDecks.reduce((sum, deck) => sum + deck.cards.length, 0)} cards`);
