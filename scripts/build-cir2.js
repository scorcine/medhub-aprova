const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "cir2-atls",
    name: "ATLS · ABCDE · choque hemorrágico",
    specialty: "cirurgia",
    cards: [
      {
        front: "Sequência do exame primário (ATLS)?",
        back: "A — via aérea + proteção da coluna cervical · B — respiração/ventilação · C — circulação + controle de hemorragia · D — disability (ECG + pupilas) · E — exposição + prevenção de hipotermia"
      },
      {
        front: "Indicações clássicas de via aérea definitiva no trauma?",
        back: "Apneia · Proteção contra aspiração · Comprometimento iminente (inalação, face, convulsões) · TCE grave (Glasgow ≤ 8) · Falha em oxigenar com máscara"
      },
      {
        front: "Manejo inicial da via aérea com coluna cervical?",
        back: "Chin-lift / jaw-thrust (evitar hiperextensão) · Aspirar sangue/vômito · Guedel/nasofaríngea · Intubação preferencial orotraqueal · Cricotireoidostomia se falha / face destruída"
      },
      {
        front: "Fontes clássicas de sangramento oculto no politrauma?",
        back: "Abdome (fígado/baço — mais comum) · Pelve (hematoma retroperitoneal) · Tórax (hemotórax maciço) · Ossos longos (fêmur até ~1.500 ml)"
      },
      {
        front: "Classes de hemorragia — marco da classe II?",
        back: "Perda ~750–1.500 ml (70 kg) · Taquicardia · Taquipneia · Pressão de pulso estreita · Classe I ≈ doação de sangue · Classe IV = ameaça imediata à vida"
      },
      {
        front: "Coluna cervical — quando liberar (ideia NEXUS)?",
        back: "Sem dor em linha média · Sem intoxicação · Alerta normal · Sem déficit focal · Sem lesão distratora · Canadian C-Spine / NEXUS guiam imagem vs retirada do colar"
      },
      {
        front: "Prancha rígida — mensagem prática?",
        back: "Só para transporte · Retirar cedo na sala (úlceras / insuficiência respiratória) · Colar + coxins + prancha no pré-hospitalar"
      }
    ]
  },
  {
    id: "cir2-pneumotorax",
    name: "Pneumotórax · hipertensivo · aberto",
    specialty: "cirurgia",
    cards: [
      {
        front: "Pneumotórax hipertensivo — clínica clássica?",
        back: "Dispneia + ↓ expansibilidade · Timpanismo · ↓ MV · Desvio contralateral da traqueia · Turgência jugular · Hipotensão/choque · ± Enfisema subcutâneo"
      },
      {
        front: "Causa mais comum de PNTX hipertensivo no ATLS?",
        back: "Ventilação com pressão positiva em lesão pleuropulmonar não reconhecida · No fechado sem VM: ruptura alveolar (saco de papel)"
      },
      {
        front: "Conduta do PNTX hipertensivo?",
        back: "Descompressão imediata (não esperar Rx) · Adulto: preferir 4º–5º EIC linha axilar média/anterior · Criança: ainda cita 2º EIC hemiclavicular · Definitivo: dreno torácico em selo d'água"
      },
      {
        front: "Pneumotórax aberto — conduta?",
        back: "Curativo oclusivo em 3 lados (válvula) · Depois dreno torácico · Não fechar os 4 lados sem dreno (pode virar hipertensivo)"
      },
      {
        front: "PNTX simples no trauma — tratamento?",
        back: "Dreno torácico (selo d'água) na maioria · Observação só em selecionados muito pequenos/estáveis conforme protocolo local — em prova, trauma + ar → pensar drenar"
      }
    ]
  },
  {
    id: "cir2-hemotorax",
    name: "Hemotórax · toracotomia",
    specialty: "cirurgia",
    cards: [
      {
        front: "Todo derrame pleural no trauma é…?",
        back: "Hemotórax até prova em contrário · Drenagem intercostal é a regra (independente do tamanho aparente)"
      },
      {
        front: "Hemotórax maciço — definição?",
        back: "≥ 1.500 ml rápido OU ≥ 1/3 da volemia na cavidade · Causas: vasos sistêmicos/hilares (penetrante > fechado)"
      },
      {
        front: "Indicações clássicas de toracotomia por dreno?",
        back: "Saída imediata ≥ 1.500 ml · Ou ~200 ml/h nas primeiras 2–4 h · Instabilidade / hemotórax maciço persistente"
      },
      {
        front: "Dreno torácico — onde inserir?",
        back: "4º ou 5º EIC · Entre linha axilar anterior e média · Confirmar posição no Rx · Mal posicionamento = falha comum"
      },
      {
        front: "Fontes habituais de hemotórax autolimitado?",
        back: "Parênquima pulmonar (baixa pressão) · Intercostais · Artéria mamária interna · 85% resolvem só com dreno"
      }
    ]
  },
  {
    id: "cir2-torax-parede",
    name: "Tórax instável · contusão pulmonar",
    specialty: "cirurgia",
    cards: [
      {
        front: "Tórax instável — definição?",
        back: "≥ 2 arcos consecutivos fraturados em ≥ 2 pontos cada (ou separação costocondral) · Segmento perde continuidade com a caixa"
      },
      {
        front: "Achado clínico clássico do tórax instável?",
        back: "Respiração paradoxal · Segmento “encolhe” na inspiração e abaúla na expiração · Dor intensa · Associar contusão pulmonar"
      },
      {
        front: "Tratamento do tórax instável?",
        back: "Analgesia agressiva (permite ventilação) · O₂ / suporte · Intubar se insuficiência · Fixação cirúrgica selecionada · Tratar contusão associada"
      },
      {
        front: "Contusão pulmonar — mensagem?",
        back: "Lesão do parênquima · Piora em 24–48 h · Suporte / evitar sobrecarga hídrica · Pode precisar VM · Rx/TC atrasam em relação à clínica"
      }
    ]
  },
  {
    id: "cir2-coracao-aorta",
    name: "Tamponamento · aorta · contusão",
    specialty: "cirurgia",
    cards: [
      {
        front: "Tríade de Beck do tamponamento?",
        back: "Hipotensão · Estase jugular · Bulhas abafadas · Também: pulso paradoxal · Confirmar com US (janela subxifoide / eFAST)"
      },
      {
        front: "Câmara cardíaca mais acometida no penetrante?",
        back: "VD (posição anterior) · Depois VE e átrios · Muitos morrem no local por hemotórax/exsanguinação — tamponamento = pericárdio “contém”"
      },
      {
        front: "Volume pequeno já causa tamponamento agudo?",
        back: "Sim — ~100–150 ml podem bastar no trauma agudo (pericárdio pouco complacente)"
      },
      {
        front: "Ruptura aórtica traumática — sítio clássico?",
        back: "Aorta descendente no ligamento arterioso (distal à subclávia E) · Mecanismo: desaceleração · Rx: alargamento de mediastino (pode ser normal em 1–13%)"
      },
      {
        front: "Por que não “perder” a lesão aórtica?",
        back: "~20% sobrevivem inicialmente contidos · 25% podem romper em 24 h · Clínica pobre → pensar no mecanismo + imagem (angio-TC)"
      },
      {
        front: "Contusão miocárdica — ideia?",
        back: "Trauma fechado · Arritmias / alterações de ECG · Troponina · Suporte · Diferenciar de tamponamento/isquemia"
      }
    ]
  },
  {
    id: "cir2-abdome-inicial",
    name: "Trauma abdominal · FAST · ferida",
    specialty: "cirurgia",
    cards: [
      {
        front: "Quando indicar FAST / LPD?",
        back: "Contusão + exame físico não confiável (coma/intoxicação) · Hipotensão sem causa · Politrauma com pelve/abdome como fonte possível"
      },
      {
        front: "FAST positivo no instável — conduta?",
        back: "Laparotomia (não “passear” na TC) · Estável + líquido: TC para estadiar e NOM selecionado"
      },
      {
        front: "LPD — critério de positividade imediata?",
        back: "Aspiração inicial > 10 ml de sangue · Senão: infundir 1.000 ml RL (10 ml/kg criança) e analisar efluente · Gravidez/fratura pélvica: acesso supraumbilical"
      },
      {
        front: "Ferida por arma branca no abdome — algoritmo clássico?",
        back: "Explorar ferida local · Se não penetrou fáscia → alta com cuidado local · Se penetrou / dúvida → observação seriada ou laparoscopia/laparotomia conforme estabilidade e política do serviço"
      },
      {
        front: "Ferida em transição toracoabdominal — pegadinha?",
        back: "Diafragma move com a respiração · Pode lesar tórax e abdome · Avaliar ambos os compartimentos (dreno ± exploração)"
      },
      {
        front: "Órgão mais lesado no trauma fechado de abdome?",
        back: "Baço (1º) · Fígado (2º) · Penetrante: fígado frequentemente no topo (dimensões)"
      }
    ]
  },
  {
    id: "cir2-figado-baco",
    name: "Trauma de baço · fígado",
    specialty: "cirurgia",
    cards: [
      {
        front: "Sinais que sugerem lesão esplênica?",
        back: "Trauma abdominal importante · Fraturas de arcos à E · Dor referida em ombro E (Kehr) · FAST + líquido"
      },
      {
        front: "NOM no baço — premissa?",
        back: "Estável hemodinamicamente · TC para grau / blush · UTI/monitorização · Embolização se blush selecionado · Cirurgia se instável / falha do NOM"
      },
      {
        front: "Por que preservar o baço (mensagem)?",
        back: "Sepse fulminante pós-esplenectomia (OPSI) · Pneumococo #1 · Vacinas se esplenectomia inevitável"
      },
      {
        front: "Trauma hepático — conduta geral?",
        back: "Estável: NOM ± angioembolização · Instável: laparotomia / packing · Pringle para controle temporário · Grau V justa-hepático = mortalidade altíssima"
      },
      {
        front: "Packing hepático — quando pensar?",
        back: "Sangramento difuso / coagulopatia / paciente exaurido · Parte do controle de danos · Reoperar após reanimação"
      }
    ]
  },
  {
    id: "cir2-gu-pelve",
    name: "Pelve · uretra · bexiga · rim",
    specialty: "cirurgia",
    cards: [
      {
        front: "Fratura pélvica instável — critério simples da apostila?",
        back: "Anel deformado OU abertura da sínfise > 2,5 cm · Estável: alinhado e sínfise ≤ 2,5 cm · Open book ↔ compressão AP"
      },
      {
        front: "Hemorragia pélvica — medidas iniciais?",
        back: "Binder / estabilização mecânica · Ressuscitação · Angioembolização se estável o bastante · Packing pré-peritoneal / cirurgia se necessário · Mortalidade da hemorragia ~50%"
      },
      {
        front: "Tríade da lesão de uretra posterior?",
        back: "Uretrorragia · Retenção urinária · Globo vesical · Também: próstata alta ao toque · Associada a fratura pélvica / queda a cavaleiro"
      },
      {
        front: "Suspeita de lesão uretral — o que NÃO fazer?",
        back: "Não passar sonda vesical às cegas · Fazer uretrocistografia retrógrada primeiro · Cistostomia se necessário"
      },
      {
        front: "Ruptura de bexiga — intraperitoneal × extraperitoneal?",
        back: "Intra: contraste livre na cavidade (cistografia) → cirurgia · Extra: extravasamento pré-peritoneal (orelha de cachorro) → muitas vezes sonda + observação"
      },
      {
        front: "Trauma renal — maioria dos casos?",
        back: "Fechado (~80%) · Estável: NOM · Instável / pedículo / urinoma expandindo: intervencionismo/cirurgia"
      }
    ]
  },
  {
    id: "cir2-damage-control",
    name: "Controle de danos · SCA",
    specialty: "cirurgia",
    cards: [
      {
        front: "Quando indicar laparotomia de controle de danos?",
        back: "Instabilidade · Coagulopatia · Acidose · Hipotermia (tríade letal) · Lesões complexas com sangramento que não fecha rápido · Objetivo: controlar sangramento/contaminação e ir à UTI"
      },
      {
        front: "Passos típicos do damage control?",
        back: "1) Controlar hemorragia (packing, shunt) · 2) Controlar contaminação (grampos/ligaduras) · 3) Fechamento temporário · 4) Reanimação · 5) Relaparotomia definitiva"
      },
      {
        front: "Síndrome de compartimento abdominal — definição prática?",
        back: "PIA elevada (≥ 12 = HIA) · SCA típica: PIA > 20 + disfunção orgânica · Fatores: volume maciço, packing, ascite, hematoma"
      },
      {
        front: "PIA normal e mensuração clássica?",
        back: "Normal ~5–7 mmHg · Via bexiga (pressão vesical) · Tratamento da SCA grave: descompressão / reopen abdomen"
      },
      {
        front: "Prevenir a tríade letal no trauma?",
        back: "Aquecer · Sangue precoce / evitar cristaloides excessivos · Corrigir coagulopatia · Operar rápido o que sangra · Damage control em vez de cirurgia definitiva longa"
      }
    ]
  },
  {
    id: "cir2-tce",
    name: "TCE · Glasgow · hematomas",
    specialty: "cirurgia",
    cards: [
      {
        front: "Classificação do TCE pela ECG?",
        back: "Leve 13–15 · Moderado 9–12 · Grave 3–8 · Grave → via aérea definitiva (≤ 8)"
      },
      {
        front: "Hematoma epidural — clássicos?",
        back: "Artéria meníngea média (fratura temporal) · Intervalo lúcido · Forma biconvexa · Midríase homolateral + hemiparesia contralateral na herniação"
      },
      {
        front: "Hematoma subdural — clássicos?",
        back: "Veias ponte (bridging) · Crescentérico · Idosos/álcool · Clínica costuma ser mais grave / sem intervalo lúcido clássico"
      },
      {
        front: "Choque no TCE — interpretação?",
        back: "Sangramento intracraniano quase nunca explica choque hipovolêmico · Procurar outra fonte (abdome, pelve, tórax)"
      },
      {
        front: "Lesão cerebral secundária — o que evitar?",
        back: "Hipóxia · Hipotensão · Hipercapnia/hipocapnia extrema · Hipoglicemia/hiperglicemia · Febre · Meta: oxigenar + perfundir cérebro"
      },
      {
        front: "TCE e coluna cervical?",
        back: "~10% dos TCE têm lesão cervical · Sempre imobilizar até liberar coluna"
      },
      {
        front: "Indicação de TC no TCE leve (ideia)?",
        back: "Critérios clínicos (vômitos, idade, coagulopatia, mecanismo, déficit, convulsao, CE >2 h etc.) · Não TC em todos os ECG 15 sem fator de risco"
      }
    ]
  },
  {
    id: "cir2-pescoco",
    name: "Trauma de pescoço · zonas",
    specialty: "cirurgia",
    cards: [
      {
        front: "Zonas do pescoço (I / II / III)?",
        back: "I: clavículas → cricóide (estruturas torácicas/vasos) · II: cricóide → ângulo da mandíbula (mais acessível) · III: ângulo da mandíbula → base do crânio"
      },
      {
        front: "Indicação de exploração imediata no pescoço penetrante?",
        back: "Sinais duros: sangramento ativo · Instabilidade · Hematoma em expansão · Déficit neurológico · Compromisso aerodigestivo claro (enfisema, estridor, hemoptise)"
      },
      {
        front: "Sem sinais duros — conduta moderna?",
        back: "Não operar todas as zona II “às cegas” · Imagem (angio-TC) ± endoscopia/bronco conforme zona e suspeita · Observação selecionada"
      },
      {
        front: "Via aérea no trauma de pescoço?",
        back: "Hematoma expansivo / estridor / voz de batata quente → via aérea definitiva precoce · Enfisema: intubação preferencial com broncofibroscopia · Cirúrgica se obstrução/laringe destruída"
      },
      {
        front: "Trauma fechado de pescoço — pegadinha?",
        back: "Pode parecer “leve” no início · Lesão carotídea/vertebral e aerodigestiva tardia · Mecanismo + sinais sutis → imagem vascular"
      }
    ]
  },
  {
    id: "cir2-visceras",
    name: "Duodeno · pâncreas · oco · diafragma",
    specialty: "cirurgia",
    cards: [
      {
        front: "Trauma duodenal fechado — contexto?",
        back: "Impacto epigástrico (cinto/volante) · Pode atrasar diagnóstico · TC com contraste · Cirurgia conforme grau AAST"
      },
      {
        front: "Trauma pancreático — o que define gravidade?",
        back: "Integridade do ducto principal · Amilase isolada não fecha · TC · Lesão ductal → cirurgia/intervenções específicas"
      },
      {
        front: "Perfuração de víscera oca no fechado — pista?",
        back: "Ar livre · Líquido sem sólido lesado óbvio · Piora peritoneal · Laparotomia se peritonite/instabilidade"
      },
      {
        front: "Trauma de diafragma — mensagem?",
        back: "Mais à esquerda (fígado “protege” a D) · Ferida toracoabdominal · Rx: sonda/víscera no tórax · Correção cirúrgica (não confiar só em Rx normal)"
      },
      {
        front: "Colon/reto no trauma — ideia geral?",
        back: "Penetrante frequente · Reto também por espícula óssea pélvica · Controle de contaminação · Estoma vs reparo conforme estabilidade e contaminação"
      }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-cir2.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
console.log("decks", decks.length, "cards", decks.reduce((a, d) => a + d.cards.length, 0));
