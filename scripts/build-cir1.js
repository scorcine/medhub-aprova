const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "cir1-aaa",
    name: "AAA · aneurisma de aorta abdominal",
    specialty: "cirurgia",
    cards: [
      {
        front: "Quando diagnosticar AAA (diâmetro)?",
        back: "Homem: aorta > 3 cm · Mulher: > 2,6 cm · Local mais comum: infrarrenal (~85%)"
      },
      {
        front: "Principal fator de risco para AAA (estudo ADAM)?",
        back: "Tabagismo (8:1 vs nao fumantes; presente em ~78% dos casos) · Tambem: HAS, sexo masculino (4:1), idade, HF em 1o grau · DM, sexo feminino e raca negra/asiatica tendem a proteger"
      },
      {
        front: "Indicacoes classicas de intervencao no AAA?",
        back: "Diametro >= 5,5 cm · Crescimento > 0,5 cm/6 meses ou > 1 cm/12 meses · Sintomas · Complicacoes (embolizacao, infeccao) · Forma sacular · Mulheres: limiar tende a ser menor (maior risco de ruptura)"
      },
      {
        front: "Triagem USPSTF do AAA?",
        back: "USG 1x em homens 65-75 anos tabagistas atuais/ex · Nunca fumaram: individualizar · Mulheres: sem recomendacao de rotina"
      },
      {
        front: "Triade classica da ruptura do AAA — e frequencia?",
        back: "Massa abdominal pulsatil + dor abdominal + hipotensao · Presente em ~1/3 · Ruptura retroperitoneal inicial pode manter estabilidade relativa"
      },
      {
        front: "EVAR — requisito anatomico classico do colo?",
        back: "Colo infrarrenal livre >= ~15 mm · Iliacas distais adequadas (~20 mm) para fixacao · Alternativa: reparo aberto com protese"
      },
      {
        front: "USG no AAA — papel e limitacao?",
        back: "Sensibilidade ~95% / especificidade ~100% para diagnostico e follow-up de crescimento · Limitacao: ruptura pode passar despercebida em ate ~50%"
      }
    ]
  },
  {
    id: "cir1-aneurismas-perifericos",
    name: "Aneurismas perifericos · poplitea · femoral",
    specialty: "cirurgia",
    cards: [
      {
        front: "Aneurisma periferico mais comum?",
        back: "Popliteo (~70% dos perifericos) · ~50% bilaterais · ~70% associados a aneurismas aortoiliacos"
      },
      {
        front: "Complicacao temida do aneurisma popliteo?",
        back: "Tromboembolismo → perda do membro · Embolizacao distal (dedo azul) · Massa pulsatil / sopro / fremito possiveis"
      },
      {
        front: "AAA e iliacas — associacao?",
        back: "~40% dos AAA tem aneurisma iliaco · Em ~90% acomete iliaca comum · Hipogastrica ~10%"
      },
      {
        front: "Pseudoaneurisma femoral — contexto classico?",
        back: "Pos-cateterismo / puncao arterial · Hematoma pulsatil · Conduta: compressao, injecao de trombina ou reparo conforme tamanho/estabilidade"
      },
      {
        front: "Mensagem de prova: aneurisma popliteo vs AAA?",
        back: "AAA → risco de ruptura · Popliteo → risco tromboembolico / isquemia do membro"
      }
    ]
  },
  {
    id: "cir1-dap",
    name: "Doenca arterial periferica (DAP)",
    specialty: "cirurgia",
    cards: [
      {
        front: "Sitios arteriais mais acometidos na DAP?",
        back: "Femoral/poplitea 80-90% · Tibiais/fibulares 40-50% · Aorto-iliaco em menor percentual · Claudicacao referida tipicamente na panturrilha"
      },
      {
        front: "Principal causa de obito no paciente com DAP?",
        back: "Doenca isquemica do miocardio · Aterosclerose e sistemica (coracao + cerebro + membros)"
      },
      {
        front: "ITB — valores-chave?",
        back: "Normal ~1,0-1,2 (≈1,11 ± 0,10) · Claudicacao: ~0,5-0,9 · Isquemia critica: <= 0,4 · Necrose: valores muito baixos (~<0,13) · >1,3: vasos incompressiveis (DM/DRC) → ITB pouco confiavel"
      },
      {
        front: "Fontaine — estagios que caem?",
        back: "I assintomatico · IIa claudicacao leve · IIb moderada/grave · III dor em repouso · IV ulcera/gangrena · Rutherford e a alternativa moderna"
      },
      {
        front: "Tratamento clinico obrigatorio na DAP?",
        back: "Parar de fumar (impacto enorme na mortalidade) · Antiagregante · Estatina · Controle de HAS/DM · Exercicio supervisionado para claudicacao · Revascularizacao se refratario / isquemia critica"
      },
      {
        front: "Quando revascularizar (ideia geral)?",
        back: "Claudicacao limitante refrataria ao clinico · Dor em repouso · Ulcera/gangrena (isquemia critica) · Anatomia + risco cardiaco definem endovascular vs cirurgia"
      }
    ]
  },
  {
    id: "cir1-oclusao-arterial",
    name: "Oclusao arterial aguda",
    specialty: "cirurgia",
    cards: [
      {
        front: "Duas causas de oclusao arterial aguda de MMII?",
        back: "Embolia (vasos limpos, clinica intensa, sem colaterais) · Trombose in situ (sobre DAP/aneurisma/enxerto — clinica muitas vezes menos exuberante)"
      },
      {
        front: "Fonte mais comum de embolos arteriais para MMII?",
        back: "Coracao (~80%) · FA e a condicao cardiaca mais frequente · Tambem: trombo mural pos-IAM, endocardite, mixoma"
      },
      {
        front: "Sitio mais comum de impacto do embolo em MMII?",
        back: "Bifurcacao femoral (~40%) · Depois: iliaca (~15%) · Aorta / embolo em sela (~10-15%) · Poplitea (~10%)"
      },
      {
        front: "Clinica classica da isquemia aguda (6 P)?",
        back: "Pain (dor) · Pallor · Pulselessness · Paresthesia · Paralysis · Poikilothermia · Tempo = musculo/nervo em risco — revascularizar sem demora"
      },
      {
        front: "Conduta inicial na oclusao arterial aguda?",
        back: "Heparinizacao · Avaliacao de viabilidade do membro · Embolectomia / trombectomia / trombolise / bypass conforme causa e tempo · Investigar fonte embolica (ECG/FA, eco)"
      },
      {
        front: "Embolo em sela — o que e?",
        back: "Embolo na bifurcacao aortica → interrompe fluxo para ambas as iliacas · Quadro gravissimo bilateral · Emergencia vascular"
      }
    ]
  },
  {
    id: "cir1-ivc",
    name: "Insuficiencia venosa · varizes",
    specialty: "cirurgia",
    cards: [
      {
        front: "Mecanismos da insuficiencia venosa cronica?",
        back: "Incompetencia valvular · Alteracao da parede venosa · Hipertensao venosa nos MMII · Refluxo → dilatacao do sistema superficial/perfurante"
      },
      {
        front: "Varizes primarias x secundarias?",
        back: "Primarias: incompetencia valvar superficial / fatores constitucionais · Secundarias: TVP, massa pelvica, FAV traumatica"
      },
      {
        front: "Fatores de risco classicos de varizes?",
        back: "Idade >50 · Sexo feminino / hormonios (progesterona dilata; estrogenio relaxa) · Gravidez · Hereditariedade · Postura profissional · TVP previa"
      },
      {
        front: "CEAP C1 x C2 — conduta tipica?",
        back: "C1 (telangiectasias/reticulares): escleroterapia (± meia elastica) · C2 com refluxo de juncao safena/tributarias: cirurgia ou termoablacao endovenosa (laser) · Meias elasticas no conservador"
      },
      {
        front: "Safenectomia — contraindicacao classica?",
        back: "TVP (nao matar o sistema superficial se o profundo esta comprometido) · Indicacoes: acometimento extenso / sintomas intensos / ulcera / tromboflebite / estetica selecionada"
      },
      {
        front: "Ulcera de estase — mensagem?",
        back: "Maleolo medial classico · Compressao elastica e base · Tratar refluxo/insuficiencia quando indicado · Infeccao: desbridamento + cuidado local"
      }
    ]
  },
  {
    id: "cir1-hemorroidas",
    name: "Hemorroidas",
    specialty: "cirurgia",
    cards: [
      {
        front: "Hemorroida interna x externa (linha denteada)?",
        back: "Interna: acima da linha denteada (mucosa colunar/transicional) · Externa: margem anal, epitelio escamoso · Sintomas: prolapso, sangramento, prurido"
      },
      {
        front: "Graus das hemorroidas internas?",
        back: "I: sangramento sem prolapso · II: prolapso com evacuacao e reducao espontanea · III: prolapso que precisa reducao manual · IV: prolapso permanente"
      },
      {
        front: "Conduta inicial / graus baixos?",
        back: "Fibras + agua · Banho de assento · Evitar esforco · Procedimentos ambulatoriais (ligadura elastica etc.) em selecionados · Cirurgia nos graus altos / refratarios / exteriores trombosadas selecionadas"
      },
      {
        front: "Exame proctologico — componentes?",
        back: "Inspecao (estatica + dinamica / Valsalva) · Toque retal · Anuscopia · ± Retossigmoidoscopia · Posicoes: Sims (DLE) ou genupeitoral"
      },
      {
        front: "Pegadinha: sangue vermelho vivo x neoplasia?",
        back: "Hemorroida explica muito, mas >=40-45a / mudanca de habito / anemia → nao fechar so em hemorroida — avaliar colon/reto conforme contexto"
      }
    ]
  },
  {
    id: "cir1-abscesso-fistula",
    name: "Abscesso · fistula · pilonidal",
    specialty: "cirurgia",
    cards: [
      {
        front: "Origem da maioria dos abscessos anorretais?",
        back: "Infeccao das glandulas das criptas anais (criptas de Morgagni / glandulas de Chiari) · Abscesso e fistula = fases do mesmo processo"
      },
      {
        front: "Tipos anatomicos de abscesso anorretal?",
        back: "Perianal (mais comum, 40-50%) · Isquiorretal · Interesfincteriano · Supralevantador · Submucoso (raro) · Ferradura: comunicacao posterior entre fossas isquiorretais"
      },
      {
        front: "Conduta do abscesso anorretal?",
        back: "Drenagem cirurgica · ATB se celulite/imunossupressao/sinal sistemico · Buscar trajeto fistuloso em episodios recorrentes"
      },
      {
        front: "Fistula anal — etiologias alem da criptoglandular?",
        back: "Crohn · TB · Trauma / CEO · Malignidade hematologica · Complicacao de cirurgia anal · Classificacao de Parks (interesfincterica, trans, supra, extra)"
      },
      {
        front: "Doenca pilonidal — perfil e etiologia atual?",
        back: "Jovem masculino, hirsuto, fenda interglutea · Hoje: origem adquirida (nao congenita) · Aguda = abscesso (drenar) · Cronica = poros + drenagem → excisao/flaps selecionados"
      }
    ]
  },
  {
    id: "cir1-prolapso",
    name: "Prolapso retal",
    specialty: "cirurgia",
    cards: [
      {
        front: "Prolapso retal completo — o que e?",
        back: "Protrusao de todas as camadas da parede retal atraves do anus · Diferente de hemorroida prolapsada (mucosa/vascular)"
      },
      {
        front: "Tecnicas perineais classicas (idosos/frageis)?",
        back: "Altemeier (proctossigmoidectomia perineal) · Delorme (resseccao mucosa + plicatura) · Thiersch (cerclagem) — historica / selecionada"
      },
      {
        front: "Tecnicas abdominais classicas?",
        back: "Retopexia (Ripstein, Wells, Frykman-Goldberg) · Preferidas em pacientes aptos · Laparoscopia crescente"
      },
      {
        front: "Mensagem de prova: escolha da via?",
        back: "Idoso fragil / alto risco → perineal · Bom candidato cirurgico → abdominal/retopexia · Avaliar incontinencia e constipacao associadas"
      }
    ]
  },
  {
    id: "cir1-bariatrica",
    name: "Cirurgia bariatrica",
    specialty: "cirurgia",
    cards: [
      {
        front: "Criterios CFM/NIH de indicacao bariatrica?",
        back: "IMC > 40 · ou IMC > 35 + >=1 comorbidade · IMC 30-34,9 com DM2 refratario (parecer CFM) · Falha do tratamento clinico / tempo de doenca e idade entram na decisao"
      },
      {
        front: "Contraindicacoes absolutas classicas?",
        back: "Cardiopatia/pneumopatia terminal (ASA IV) · Hipertensao porta com varizes EG · Precaucoes CFM: drogadicao/alcoolismo ativo, psicose/demencia ativa, falta de compreensao do processo"
      },
      {
        front: "Sleeve x bypass em Y de Roux — ideia?",
        back: "Sleeve: restritiva (manga gastrica); tecnica que mais cresce · Bypass Y-Roux: mista (restritiva + disabsortiva leve); classica e muito realizada · Disabsortivas puras (Scopinaro/switch) = mais deficiencias"
      },
      {
        front: "Comorbidades que mais melhoram pos-bariatrica?",
        back: "DM2 · HAS · SAOS · Artropatia · Dislipidemia · Risco oncologico associado a obesidade (colon, mama, endometrio etc.) cai com perda ponderal"
      },
      {
        front: "Complicacoes/cuidados pos que caem?",
        back: "Fistula/vazamento precoce · TVP/TEP · Dumping (bypass) · Deficiencias (B12, ferro, calcio, vitamina D) — reposicao e follow-up multiprofissional obrigatorios"
      },
      {
        front: "Grelina — por que o sleeve ajuda na fome?",
        back: "Grelina (celulas do fundo gastrico) sobe antes da refeicao · Resseccao do fundo no sleeve reduz grelina → menos apetite"
      }
    ]
  },
  {
    id: "cir1-ped-abdome",
    name: "Pediatria · invaginacao · Meckel · hernia",
    specialty: "cirurgia",
    cards: [
      {
        front: "Invaginacao intestinal — idade e clinica?",
        back: "Pico 6-9 meses · Colica intermitente + palidez/letargia · Fezes em geleia de groselha (~60%) · Massa em salsicha · Sinal de Dance (FID vazia)"
      },
      {
        front: "Tratamento da invaginacao estavel <24h?",
        back: "Reducao hidrostatica (enema) ou pneumatica (pressao <=120 mmHg) · Cirurgia se peritonite, choque, falha da reducao ou >24h com sofrimento"
      },
      {
        front: "Ponto de apoio em >2 anos?",
        back: "Meckel, polipo, duplicacao, Henoch-Schonlein · Associacao citada com vacina de rotavirus / virus"
      },
      {
        front: "Diverticulo de Meckel — regra dos 2 e clinica?",
        back: "~2% · ~2 tipos de mucosa ectopica · ~60 cm da valvula · Sangramento indolor (mucosa gastrica) · Pode causar invaginacao/obstrucao · Tc-99m se sangramento"
      },
      {
        front: "Hernia umbilical infantil — conduta?",
        back: "Maioria fecha espontaneamente ate ~4-5 anos · Cirurgia se persistir, aumentar, sintomatica ou encarceramento (raro)"
      }
    ]
  },
  {
    id: "cir1-ped-digestivo",
    name: "Pediatria · AE · piloro · Hirschsprung · Ladd",
    specialty: "cirurgia",
    cards: [
      {
        front: "Atresia de esofago com fistula distal — apresentacao?",
        back: "Forma mais comum · Sialorreia · Regurgitacao/tosse/cianose as mamadas · Distensao abdominal (ar pela fistula) · Sonda nao progredir + Rx: sonda enovelada no coto"
      },
      {
        front: "Conduta inicial na atresia de esofago?",
        back: "Aspiracao continua do coto · Cabaceira elevada · ATB · ± Gastrostomia se distensao grave · Correcao cirurgica apos estabilizacao"
      },
      {
        front: "Estenose hipertrofica do piloro — classicos?",
        back: "2a-8a semana · Meninos · Vomitos nao biliosos em jato · Olive mass · Alcalose hipocloremica/hipocalemica · US: piloro espesso · Cirurgia: Fredet-Ramstedt"
      },
      {
        front: "Atresia duodenal — sinal radiologico?",
        back: "Dupla bolha (estomago + duodeno) · Associar a Down · Diferenciar ma rotacao/volvo (urgencia)"
      },
      {
        front: "Ma rotacao / volvo do intestino medio — cirurgia?",
        back: "Procedimento de Ladd · Urgencia se volvo (isquemia) · Bridas de Ladd + posicionamento intestinal"
      },
      {
        front: "Hirschsprung — diagnostico e cirurgia?",
        back: "Ausencia de ganglios (aganglionose distal) · Atraso na eliminacao do meconio · Enema: zona de transicao · Biopsia retal · Tecnicas: Duhamel, Swenson, Soave"
      },
      {
        front: "ECN — quando operar?",
        back: "Pneumoperitonio / perfuracao · Falha clinica ao tratamento clinico · Portal gas / pneumatose sozinhos != indicacao absoluta · Ressuscitacao + ATB + jejum na maioria"
      }
    ]
  },
  {
    id: "cir1-ped-parede-biliar",
    name: "Pediatria · parede · vias biliares · HDC",
    specialty: "cirurgia",
    cards: [
      {
        front: "Onfalocele x gastrosquise?",
        back: "Onfalocele: defeito central com saco · Mais anomalias associadas (cromossomicas, cardiacas, Beckwith) · Gastrosquise: lateral direito, sem saco, alcas expostas · Menos anomalias extracolonicas"
      },
      {
        front: "Atresia de vias biliares — mensagem R1?",
        back: "Icterícia colestatica persistente · Principal indicacao de transplante hepatico pediatrico · Cirurgia: Kasai (hepatoportoenterostomia) — quanto antes, melhor fluxo"
      },
      {
        front: "Cisto do coledoco — ideia?",
        back: "Dilatacao congenita das vias · Dor / massa / ictericia (triade classica incompleta) · Classificacao de Todani · Tratamento: excisao + anastomose bilioenterica (nao so drenar)"
      },
      {
        front: "Hernia diafragmatica congenita — prioridade?",
        back: "Estabilizacao respiratoria / hipertensao pulmonar · Cirurgia apos estabilizacao (nao correr no RN instavel) · Bochdalek (postero-lateral) e a mais citada"
      },
      {
        front: "Cisto do ducto tireoglosso — cirurgia?",
        back: "Massa mediana que sobe com protrusao da lingua · Cirurgia de Sistrunk: cisto + trato + porcao mediana do hioide"
      }
    ]
  },
  {
    id: "cir1-cabeca-pescoco",
    name: "Cabeca e pescoco · salivares",
    specialty: "cirurgia",
    cards: [
      {
        front: "Histologia dominante nos canceres de cabeca/pescoco?",
        back: "Carcinoma epidermoide (~90-95%) · Fatores: tabaco + alcool (sinergismo) · HPV (orofaringe) · EBV (nasofaringe)"
      },
      {
        front: "Massa cervical sem primario obvio — 1o passo?",
        back: "PAAF (alta acuracia) · Se inconclusiva: repetir PAAF antes de biopsia excisional de linfonodo · Exame completo + laringoscopia flexivel"
      },
      {
        front: "Glandula salivar mais acometida por tumor?",
        back: "Parotida (~70% dos tumores salivares) · ~80% benignos · Tipo benigno mais comum: adenoma pleomorfico (tumor misto)"
      },
      {
        front: "Nervo critico na cirurgia da parotida?",
        back: "Nervo facial — divide lobos superficial/profundo · Preservacao e o grande desafio da parotidectomia"
      },
      {
        front: "Sialolitíase — glandula mais comum?",
        back: "Submandibular (~90%) · Dor a alimentacao · Pode infectar · Conduta: hidratacao, sialogogos, remocao do calculo / cirurgia se refratario"
      },
      {
        front: "Higroma cistico — conceito?",
        back: "Malformacao linfatica (linfangioma) · Massa cervical translucida no RN/lactente · Pode comprimir via aerea · Tratamento: cirurgia / escleroterapia selecionada"
      }
    ]
  }
];

/** Restore Portuguese accents for display */
function accent(s) {
  return s
    .replace(/nao /g, "não ")
    .replace(/Nao /g, "Não ")
    .replace(/tambem/g, "também")
    .replace(/Tambem/g, "Também")
    .replace(/raca /g, "raça ")
    .replace(/asiatica/g, "asiática")
    .replace(/Indicacoes/g, "Indicações")
    .replace(/indicacoes/g, "indicações")
    .replace(/classicas/g, "clássicas")
    .replace(/Classicas/g, "Clássicas")
    .replace(/intervencao/g, "intervenção")
    .replace(/Diametro/g, "Diâmetro")
    .replace(/diametro/g, "diâmetro")
    .replace(/Complicacoes/g, "Complicações")
    .replace(/complicacoes/g, "complicações")
    .replace(/embolizacao/g, "embolização")
    .replace(/infeccao/g, "infecção")
    .replace(/recomendacao/g, "recomendação")
    .replace(/Triade/g, "Tríade")
    .replace(/triade/g, "tríade")
    .replace(/pulsatil/g, "pulsátil")
    .replace(/hipotensao/g, "hipotensão")
    .replace(/frequencia/g, "frequência")
    .replace(/anatomico/g, "anatômico")
    .replace(/fixacao/g, "fixação")
    .replace(/Iliacas/g, "Ilíacas")
    .replace(/iliacas/g, "ilíacas")
    .replace(/protese/g, "prótese")
    .replace(/diagnostico/g, "diagnóstico")
    .replace(/limitacao/g, "limitação")
    .replace(/ate ~/g, "até ~")
    .replace(/perifericos/g, "periféricos")
    .replace(/Popliteo/g, "Poplíteo")
    .replace(/popliteo/g, "poplíteo")
    .replace(/aortoiliacos/g, "aortoilíacos")
    .replace(/Tromboembolismo/g, "Tromboembolismo")
    .replace(/Embolizacao/g, "Embolização")
    .replace(/fremito/g, "frêmito")
    .replace(/possiveis/g, "possíveis")
    .replace(/associacao/g, "associação")
    .replace(/iliaco/g, "ilíaco")
    .replace(/iliaca/g, "ilíaca")
    .replace(/Hipogastrica/g, "Hipogástrica")
    .replace(/Pos-cateterismo/g, "Pós-cateterismo")
    .replace(/puncao/g, "punção")
    .replace(/compressao/g, "compressão")
    .replace(/injecao/g, "injeção")
    .replace(/tromboembolico/g, "tromboembólico")
    .replace(/Doenca/g, "Doença")
    .replace(/doenca/g, "doença")
    .replace(/periferica/g, "periférica")
    .replace(/Sitios/g, "Sítios")
    .replace(/Sitio/g, "Sítio")
    .replace(/poplitea/g, "poplítea")
    .replace(/Aorto-iliaco/g, "Aorto-ilíaco")
    .replace(/Claudicacao/g, "Claudicação")
    .replace(/claudicacao/g, "claudicação")
    .replace(/obito/g, "óbito")
    .replace(/isquemica/g, "isquêmica")
    .replace(/miocardio/g, "miocárdio")
    .replace(/sistemica/g, "sistêmica")
    .replace(/coracao/g, "coração")
    .replace(/cerebro/g, "cérebro")
    .replace(/critica/g, "crítica")
    .replace(/incompressiveis/g, "incompressíveis")
    .replace(/confiavel/g, "confiável")
    .replace(/estagios/g, "estágios")
    .replace(/assintomatico/g, "assintomático")
    .replace(/ulcera/g, "úlcera")
    .replace(/obrigatorio/g, "obrigatório")
    .replace(/Exercicio/g, "Exercício")
    .replace(/Revascularizacao/g, "Revascularização")
    .replace(/refratario/g, "refratário")
    .replace(/cardiaco/g, "cardíaco")
    .replace(/Oclusao/g, "Oclusão")
    .replace(/oclusao/g, "oclusão")
    .replace(/embolos/g, "êmbolos")
    .replace(/Embolo/g, "Êmbolo")
    .replace(/embolo/g, "êmbolo")
    .replace(/condicao/g, "condição")
    .replace(/cardiaca/g, "cardíaca")
    .replace(/Bifurcacao/g, "Bifurcação")
    .replace(/bifurcacao/g, "bifurcação")
    .replace(/aortica/g, "aórtica")
    .replace(/Clinica/g, "Clínica")
    .replace(/clinica/g, "clínica")
    .replace(/musculo/g, "músculo")
    .replace(/Heparinizacao/g, "Heparinização")
    .replace(/Avaliacao/g, "Avaliação")
    .replace(/trombolise/g, "trombólise")
    .replace(/embolica/g, "embólica")
    .replace(/gravissimo/g, "gravíssimo")
    .replace(/Emergencia/g, "Emergência")
    .replace(/Insuficiencia/g, "Insuficiência")
    .replace(/insuficiencia/g, "insuficiência")
    .replace(/cronica/g, "crônica")
    .replace(/Incompetencia/g, "Incompetência")
    .replace(/incompetencia/g, "incompetência")
    .replace(/Alteracao/g, "Alteração")
    .replace(/Hipertensao/g, "Hipertensão")
    .replace(/hipertensao/g, "hipertensão")
    .replace(/dilatacao/g, "dilatação")
    .replace(/primarias/g, "primárias")
    .replace(/secundarias/g, "secundárias")
    .replace(/Primarias/g, "Primárias")
    .replace(/Secundarias/g, "Secundárias")
    .replace(/pelvica/g, "pélvica")
    .replace(/traumatica/g, "traumática")
    .replace(/hormonios/g, "hormônios")
    .replace(/estrogenio/g, "estrogênio")
    .replace(/previa/g, "prévia")
    .replace(/tipica/g, "típica")
    .replace(/elastica/g, "elástica")
    .replace(/elasticas/g, "elásticas")
    .replace(/juncao/g, "junção")
    .replace(/tributarias/g, "tributárias")
    .replace(/termoablacao/g, "termoablação")
    .replace(/contraindicacao/g, "contraindicação")
    .replace(/Indicacoes:/g, "Indicações:")
    .replace(/estetica/g, "estética")
    .replace(/Maleolo/g, "Maléolo")
    .replace(/Compressao/g, "Compressão")
    .replace(/Infeccao/g, "Infecção")
    .replace(/epitelio/g, "epitélio")
    .replace(/evacuacao/g, "evacuação")
    .replace(/reducao/g, "redução")
    .replace(/espontanea/g, "espontânea")
    .replace(/agua/g, "água")
    .replace(/esforco/g, "esforço")
    .replace(/refratarios/g, "refratários")
    .replace(/proctologico/g, "proctológico")
    .replace(/Inspecao/g, "Inspeção")
    .replace(/estatica/g, "estática")
    .replace(/dinamica/g, "dinâmica")
    .replace(/Posicoes/g, "Posições")
    .replace(/mudanca/g, "mudança")
    .replace(/habito/g, "hábito")
    .replace(/colon/g, "cólon")
    .replace(/fistula/g, "fístula")
    .replace(/Fistula/g, "Fístula")
    .replace(/glandulas/g, "glândulas")
    .replace(/Infeccao/g, "Infecção")
    .replace(/anatomicos/g, "anatômicos")
    .replace(/Interessfincteriano/g, "Interesfincteriano")
    .replace(/comunicacao/g, "comunicação")
    .replace(/cirurgica/g, "cirúrgica")
    .replace(/imunossupressao/g, "imunossupressão")
    .replace(/sistemico/g, "sistêmico")
    .replace(/episodios/g, "episódios")
    .replace(/hematologica/g, "hematológica")
    .replace(/Classificacao/g, "Classificação")
    .replace(/interesfincterica/g, "interesfinctérica")
    .replace(/interglutea/g, "interglútea")
    .replace(/congenita/g, "congênita")
    .replace(/Cronica/g, "Crônica")
    .replace(/excisao/g, "excisão")
    .replace(/Protrusao/g, "Protrusão")
    .replace(/atraves/g, "através")
    .replace(/anus/g, "ânus")
    .replace(/Tecnicas/g, "Técnicas")
    .replace(/tecnicas/g, "técnicas")
    .replace(/frageis/g, "frágeis")
    .replace(/resseccao/g, "ressecção")
    .replace(/historica/g, "histórica")
    .replace(/fragil/g, "frágil")
    .replace(/cirurgico/g, "cirúrgico")
    .replace(/incontinencia/g, "incontinência")
    .replace(/constipacao/g, "constipação")
    .replace(/bariatrica/g, "bariátrica")
    .replace(/Criterios/g, "Critérios")
    .replace(/indicacao/g, "indicação")
    .replace(/comorbidade/g, "comorbidade")
    .replace(/decisao/g, "decisão")
    .replace(/Contraindicacoes/g, "Contraindicações")
    .replace(/pneumopatia/g, "pneumopatia")
    .replace(/Precaucoes/g, "Precauções")
    .replace(/drogadicao/g, "drogadição")
    .replace(/alcoolismo/g, "alcoolismo")
    .replace(/demencia/g, "demência")
    .replace(/compreensao/g, "compreensão")
    .replace(/gastrica/g, "gástrica")
    .replace(/tecnica/g, "técnica")
    .replace(/deficiencias/g, "deficiências")
    .replace(/pos-bariatrica/g, "pós-bariátrica")
    .replace(/Dislipidemia/g, "Dislipidemia")
    .replace(/oncologico/g, "oncológico")
    .replace(/endometrio/g, "endométrio")
    .replace(/Deficiencias/g, "Deficiências")
    .replace(/calcio/g, "cálcio")
    .replace(/reposicao/g, "reposição")
    .replace(/obrigatorios/g, "obrigatórios")
    .replace(/celulas/g, "células")
    .replace(/refeicao/g, "refeição")
    .replace(/Resseccao/g, "Ressecção")
    .replace(/invaginacao/g, "invaginação")
    .replace(/Invaginacao/g, "Invaginação")
    .replace(/Colica/g, "Cólica")
    .replace(/hidrostatica/g, "hidrostática")
    .replace(/pneumatica/g, "pneumática")
    .replace(/pressao/g, "pressão")
    .replace(/polipo/g, "pólipo")
    .replace(/duplicacao/g, "duplicação")
    .replace(/Associacao/g, "Associação")
    .replace(/rotavirus/g, "rotavírus")
    .replace(/Diverticulo/g, "Divertículo")
    .replace(/ectopica/g, "ectópica")
    .replace(/valvula/g, "válvula")
    .replace(/obstrucao/g, "obstrução")
    .replace(/Hernia/g, "Hérnia")
    .replace(/espontaneamente/g, "espontaneamente")
    .replace(/sintomatica/g, "sintomática")
    .replace(/esofago/g, "esôfago")
    .replace(/apresentacao/g, "apresentação")
    .replace(/Regurgitacao/g, "Regurgitação")
    .replace(/Distensao/g, "Distensão")
    .replace(/distensao/g, "distensão")
    .replace(/Aspiracao/g, "Aspiração")
    .replace(/continua/g, "contínua")
    .replace(/Cabaceira/g, "Cabeceira")
    .replace(/Correcao/g, "Correção")
    .replace(/apos /g, "após ")
    .replace(/estabilizacao/g, "estabilização")
    .replace(/hipertrofica/g, "hipertrófica")
    .replace(/Vomitos/g, "Vômitos")
    .replace(/hipocloremica/g, "hipoclorêmica")
    .replace(/hipocalemica/g, "hipocalêmica")
    .replace(/estomago/g, "estômago")
    .replace(/Ma rotacao/g, "Má rotação")
    .replace(/ma rotacao/g, "má rotação")
    .replace(/urgencia/g, "urgência")
    .replace(/medio/g, "médio")
    .replace(/Ausencia/g, "Ausência")
    .replace(/ganglios/g, "gânglios")
    .replace(/eliminacao/g, "eliminação")
    .replace(/meconio/g, "mecônio")
    .replace(/transicao/g, "transição")
    .replace(/Biopsia/g, "Biópsia")
    .replace(/Pneumoperitonio/g, "Pneumoperitônio")
    .replace(/perfuracao/g, "perfuração")
    .replace(/Falha clinica/g, "Falha clínica")
    .replace(/cromossomicas/g, "cromossômicas")
    .replace(/cardiacas/g, "cardíacas")
    .replace(/alcas/g, "alças")
    .replace(/extracolonicas/g, "extracólonicas")
    .replace(/Icterícia/g, "Icterícia")
    .replace(/colestatica/g, "colestática")
    .replace(/hepatico/g, "hepático")
    .replace(/pediatrico/g, "pediátrico")
    .replace(/coledoco/g, "colédoco")
    .replace(/congenita/g, "congênita")
    .replace(/ictericia/g, "icterícia")
    .replace(/bilioenterica/g, "bilioentérica")
    .replace(/diafragmatica/g, "diafragmática")
    .replace(/Estabilizacao/g, "Estabilização")
    .replace(/postero-lateral/g, "póstero-lateral")
    .replace(/protrusao/g, "protrusão")
    .replace(/lingua/g, "língua")
    .replace(/porcao/g, "porção")
    .replace(/Cabeca/g, "Cabeça")
    .replace(/cabeca/g, "cabeça")
    .replace(/pescoco/g, "pescoço")
    .replace(/canceres/g, "cânceres")
    .replace(/alcool/g, "álcool")
    .replace(/primario/g, "primário")
    .replace(/obvio/g, "óbvio")
    .replace(/acuracia/g, "acurácia")
    .replace(/biopsia/g, "biópsia")
    .replace(/flexivel/g, "flexível")
    .replace(/Glandula/g, "Glândula")
    .replace(/Parotida/g, "Parótida")
    .replace(/parotida/g, "parótida")
    .replace(/pleomorfico/g, "pleomórfico")
    .replace(/critico/g, "crítico")
    .replace(/Preservacao/g, "Preservação")
    .replace(/Sialolitíase/g, "Sialolitíase")
    .replace(/alimentacao/g, "alimentação")
    .replace(/hidratacao/g, "hidratação")
    .replace(/remocao/g, "remoção")
    .replace(/calculo/g, "cálculo")
    .replace(/cistico/g, "cístico")
    .replace(/Malformacao/g, "Malformação")
    .replace(/linfatica/g, "linfática")
    .replace(/translucida/g, "translúcida")
    .replace(/aerea/g, "aérea");
}

const fixed = decks.map((d) => ({
  ...d,
  name: accent(d.name),
  cards: d.cards.map((c) => ({
    front: accent(c.front),
    back: accent(c.back)
  }))
}));

const out = path.join(__dirname, "..", "data", "flashcards-cir1.json");
fs.writeFileSync(out, JSON.stringify(fixed, null, 2) + "\n");
const n = fixed.reduce((a, d) => a + d.cards.length, 0);
console.log("wrote", out, "decks", fixed.length, "cards", n);
