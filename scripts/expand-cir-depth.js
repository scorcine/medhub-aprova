/**
 * Expande profundidade dos flashcards de Cirurgia (paridade com Pediatria).
 * Soma cards high-yield sem duplicar frentes existentes.
 */
const fs = require("fs");
const path = require("path");

const ADD = {
  /* ── Abdome agudo ── */
  "cg-apendicite": [
    { front: "Alvarado — pontos e corte clássico?", back: "Migração da dor (1) · Anorexia (1) · Náusea/vômito (1) · Dor FID (2) · Blumberg (1) · Febre (1) · Leucocitose (2) · Desvio à esquerda (1) · Total 10 · ≥7 alta probabilidade · 5–6 intermediário · ≤4 baixa" },
    { front: "Apendicite na gestante — imagem e via?", back: "US 1ª linha · RM se dúvida (evitar TC se possível) · Laparoscopia segura em mãos experientes · Não atrasar por gravidez — perfuração ↑ risco fetal" },
    { front: "Apendicite em criança — pegadinhas?", back: "Clínica menos localizada · Perfuração mais frequente · US preferencial · Mesma lógica WSES: laparoscopia padrão · NOM só em protocolos selecionados" },
    { front: "Neoplasia do apêndice — quando pensar?", back: "Massa / idade >40–50a · Mucoceles · Apendicite “atípica” · Após NOM de abscesso: colonoscopia/controle · Carcinoides pequenos: frequentemente achado incidental" },
    { front: "Antibiótico empírico na apendicite complicada?", back: "Cobrir anaeróbios + enterobactérias (ex.: cefalosporina + metronidazol ou piperacilina-tazobactam) · Ajustar por cultura · Curso curto se fonte controlada" },
    { front: "Apendicite × doença inflamatória pélvica — DD?", back: "DIP: dor bilateral, corrimento, mobilização cervical dolorosa · β-hCG + exame gineco · Apendicite: FID unilateral, migração, anorexia · Imagem resolve dúvida" }
  ],
  "cg-colecistite": [
    { front: "Colecistite alitiásica — quem e conduta?", back: "Crítico / UTI / jejum prolongado / sepse · US: espessamento sem cálculo · Alto risco de perfuração · Colecistectomia se operável · Senão: colecistostomia percutânea" },
    { front: "TG18 colangite — gravidade I–III?", back: "I: responde a ATB · II: não responde / ≥2 critérios de inflamação sistêmica · III: disfunção orgânica · II–III: drenagem biliar urgente + ATB" },
    { front: "Critérios de risco de coledocolitíase (ideia ASGE)?", back: "Alto: icterícia + dilatação + cálculo na via · Intermediário: alterações de enzimas / dilatação isolada · Baixo: sem pistas · Alto → CPRE; intermediário → US endoscópico/RM" },
    { front: "Colecistectomia precoce × tardia — mensagem prova?", back: "Precoce (ideal <72h) ↓ tempo hospitalar e recorrência · Tardia (após 6 sem) se inflamação intensa / alto risco · Evitar “meio-termo” 3–6 sem se possível" },
    { front: "Lesão iatrogênica de via biliar — clássico?", back: "Strasberg · Identificação errada do cístico · Prevenção: visão crítica de segurança · Suspeita: bile no dreno / icterícia pós-op · CPRE / reconstrução hepático-jejunal conforme tipo" },
    { front: "Murphy ultrasonográfico × clínico?", back: "Clínico: dor à inspiração com palpação no QHD · US: dor máxima com probe sobre vesícula · US Murphy + espessamento + cálculo = forte evidência de colecistite" }
  ],
  "cg-diverticulite": [
    { front: "Hinchey — o que cada estágio significa?", back: "I abscesso pericólico · II abscesso pélvico/distante · III peritonite purulenta · IV peritonite fecal · I–II: ATB ± drenagem · III–IV: cirurgia (lavagem/ressecção)" },
    { front: "Diverticulite não complicada — ATB de rotina?", back: "Guias recentes: muitas não complicadas sem ATB (selecionadas, imunocompetentes) · ATB se sistêmico / comorbidade / imunodepressão · Prova: “ATB seletiva”" },
    { front: "Quando operar diverticulite aguda?", back: "Peritonite / perfuração livre · Abscesso não drenável · Falha do tratamento clínico · Obstrução / fístula · Instabilidade" },
    { front: "Hartmann × anastomose primária?", back: "Hartmann: ressecção + colostomia (instável / contaminação pesada) · Anastomose ± ileostomia de proteção em estáveis selecionados · Decisão individualizada" },
    { front: "Colonoscopia após diverticulite — quando?", back: "Após quadro agudo resolvido (geralmente 6–8 sem) se nunca fez · Excluir câncer mimetizando diverticulite · Especialmente 1º episódio / atípico / >50a" },
    { front: "Fístula colovesical — clássico da prova?", back: "Pneumatúria / fecalúria · Homem > mulher · TC mostra ar na bexiga · Tratamento: ressecção do segmento + reparo vesical ± estoma temporário" }
  ],
  "cg-obstrucao": [
    { front: "ASBO Bologna — NOM inicial quando?", back: "Brida sem sinais de estrangulamento · Jejum + SNE + hidratação · Reavaliar serialmente · Falha / alarme → cirurgia" },
    { front: "Sinais de estrangulamento / isquemia?", back: "Dor contínua intensa · Febre · Leucocitose / lactato ↑ · Peritonismo · TC: pneumatose, líquido livre, transition point + sofrimento · → centro imediato" },
    { front: "Volvo de sigmoide — conduta clássica?", back: "Estável sem peritonite: descompressão endoscópica + sonda · Eletivo: sigmoidectomia (alta recorrência só com descompressão) · Peritonite/necrose: laparotomia" },
    { front: "Volvo de ceco — mensagem?", back: "Menos comum · Frequentemente cirúrgico (cecopexia/ressecção) · Descompressão endoscópica menos eficaz que no sigmoide · TC: “whirl” / ceco ectópico" },
    { front: "Obstrução por neoplasia — opções?", back: "Ressuscitação · Stent como ponte em selecionados · Ressecção ± estoma · Evitar anastomose em instável / desnutrido extremo" },
    { front: "Íleo paralítico × obstrução mecânica?", back: "Íleo: sem transição, gases difusos, silêncio/ruídos reduzidos, pós-op recente · Mecânica: níveis, transition point, ruídos metálicos · TC diferencia" },
    { front: "SNE — quando e por quê?", back: "Descompressão gástrica · Alívio de vômitos / risco de aspiração · Facilita NOM em ASBO · Não substitui cirurgia se isquemia" }
  ],
  "cg-abdome-vascular": [
    { front: "Isquemia mesentérica — 4 etiologias?", back: "Embolia arterial (FA) · Trombose arterial (aterosclerose) · NOMI (baixo fluxo) · Trombose venosa mesentérica · Dor desproporcional = chave" },
    { front: "Embolia mesentérica — conduta?", back: "Heparina · Angio-TC · Cirurgia: embolectomia ± ressecção de alça inviável · “Second look” frequente · Não atrasar por lactato normal" },
    { front: "NOMI — quem e tratamento?", back: "Choque, vasopressores, dialise, ICC · Tratar causa (fluxo/perfusão) · Vasodilatadores intra-arteriais em selecionados · Ressecar necrose se houver" },
    { front: "Trombose venosa mesentérica — ideia?", back: "Estados pró-trombóticos / trombofilia · Anticoagulação é base · Cirurgia se peritonite/necrose · TC com contraste venoso ajuda" },
    { front: "AAA roto — clássico e conduta?", back: "Dor abdominal/lombar + hipotensão + massa pulsátil · Não atrasar com exames longos se instável · Centro vascular · EVAR vs aberto conforme anatomia/disponibilidade" },
    { front: "AAA eletivo — indicação de diâmetro?", back: "≥5,5 cm (homem) · Mulher: considerar ~5,0–5,4 cm · Sintomático / crescimento rápido (≥0,5 cm/6 mes ou ≥1 cm/ano) · Independente do diâmetro se sintomático" },
    { front: "Dor desproporcional — DD de prova?", back: "Isquemia mesentérica · Perfuração encoberta · Pancreatite · Cetoacidose · Herpes zoster precoce · Não fechar diagnóstico só com exame abdominal “mole”" }
  ],
  "crr-hernia-obstrucao": [
    { front: "Hérnia estrangulada — regra de ouro?", back: "Não insistir em redução forçada · Centro imediato · Sinais: dor intensa, pele eritematosa, febre, obstrução · Ressecção se alça inviável" },
    { front: "Encarcerada × estrangulada?", back: "Encarcerada: irredutível sem isquemia · Estrangulada: compromisso vascular · Toda estrangulada é emergência; encarcerada dolorosa = urgência" },
    { front: "Howship–Romberg — o que sugere?", back: "Dor na face medial da coxa (obturador) · Hérnia obturatriz · Idosa magra + obstrução = pensar nisso" },
    { front: "Richter — por que é perigosa?", back: "Apenas parte da circunferência da alça no anel · Pode necrosar sem obstrução completa · Diagnóstico atrasado" },
    { front: "Hérnia femoral × inguinal — diferencial clínico?", back: "Femoral: abaixo do ligamento inguinal, lateral ao tubérculo púbico · Mais em mulheres · Alto risco de encarceramento · Operar eletivamente se diagnosticada" }
  ],

  /* ── Trauma ── */
  "cir2-atls": [
    { front: "Classes de hemorragia I–IV — resumo?", back: "I <15% · II 15–30% (taquicardia, ΔPP) · III 30–40% (queda PA) · IV >40% (ameaça vital) · Classe III–IV: sangue precoce" },
    { front: "Reanimação 1:1:1 e TXA — ideia ATLS moderna?", back: "Plasma:plaquetas:hemácias equilibrados no maciço · TXA precoce (<3h) no sangramento · Evitar cristaloides em excesso · Hipotensão permissiva até controle (exceto TCE)" },
    { front: "Tríade letal do trauma?", back: "Hipotermia · Acidose · Coagulopatia · Interrompe-se com controle de dano + reaquecimento + sangue · Motiva damage control" },
    { front: "Exame secundário — quando?", back: "Após estabilizar ABCDE · Cabeça-a-pés · Fraturas, dorso, períneo · História AMPLE (Alergias, Meds, Past, Last meal, Events)" },
    { front: "Choque no trauma — tipos a lembrar?", back: "Hemorrágico (mais comum) · Obstrutivo (PNTX, tamponamento) · Neurogênico (TRM) · Não assumir “só sangue” se jugulares túrgidas / MV assimétrico" },
    { front: "Controle de hemorragia externa — ordem?", back: "Pressão direta · Curativo · Torniquete se membro e sangramento arterial · Não remover objetos impalados na cena" }
  ],
  "cir2-pneumotorax": [
    { front: "Onde inserir o dreno torácico (trauma)?", back: "Adulto: 4º–5º EIC linha axilar média/anterior (triângulo de segurança) · Evitar mama / músculos · Confirmar em selo d'água" },
    { front: "Triângulo de segurança — limites?", back: "Borda lateral do peitoral · Borda lateral do latíssimo · Linha do mamilo / 5º EIC · Base da axila · Reduz lesão de órgãos/vasos" },
    { front: "PNTX hipertensivo × tamponamento — DD?", back: "Ambos: jugulares túrgidas + choque · PNTX: MV ↓ + timpanismo + desvio traqueal · Tamponamento: MV simétrico, abafamento de bulhas, Beck" },
    { front: "Indicações de toracotomia por débito do dreno?", back: "Débito imediato ≥1.500 ml · Ou ≥200 ml/h por 2–4h (critérios locais/ATLS) · Instabilidade persistente · Hemotórax coagulado / retenção" },
    { front: "Enfisema subcutâneo maciço — pensar em?", back: "Lesão de via aérea / esôfago / PNTX · Via aérea segura · Drenar PNTX se houver · Broncoscopia se suspeita traqueobrônquica" }
  ],
  "cir2-hemotorax": [
    { front: "Hemotórax maciço — definição ATLS?", back: "≥1.500 ml de sangue no hemitórax ou débito contínuo alto · Choque + MV ↓ + macicez · Dreno largo + reposição + avaliar toracotomia" },
    { front: "Por que dreno grosso no hemotórax?", back: "Sangue coagula · Calibre fino obstrui · Evacuar para expandir pulmão e monitorar débito" },
    { front: "Hemotórax retido — complicação?", back: "Empiema · Fibrotórax · VATS precoce se não drena · ATB se infecção" },
    { front: "Toracotomia de reanimação — indicação clássica?", back: "PCR traumático penetrante de tórax com sinais de vida recentes · Tempo curto · Em fechado: benefício raro / selecionado" },
    { front: "Lesão de vasos intercostais / mamários — ideia?", back: "Causa comum de hemotórax persistente · Pode precisar cirurgia se dreno não controla · Não subestimar ferida “pequena” no tórax" }
  ],
  "cir2-torax-parede": [
    { front: "Tórax instável (flail chest) — definição?", back: "≥2 costelas consecutivas fraturadas em ≥2 pontos · Segmento paradoxico · Associado a contusão pulmonar" },
    { front: "Conduta do tórax instável?", back: "Oxigênio / analgesia multimodal · VM se insuficiência · Fixação cirúrgica em selecionados · Tratar contusão associada" },
    { front: "Contusão pulmonar — pegadinha?", back: "Piora radiológica em 24–48h · Hipoxemia · Evitar hipervolemia · Fisioterapia / suporte · Não é “só fratura de costela”" },
    { front: "Indicações de intubação na contusão / flail?", back: "Hipoxemia refratária · Fadiga · Associado a TCE / choque · Trabalho ventilatório excessivo" },
    { front: "Fratura de 1ª–2ª costela — o que investigar?", back: "Trauma de alta energia · Lesão vascular (subclávia/aorta) · Lesão de plexo · Avaliar mecanismo e exames dirigidos" }
  ],
  "cir2-coracao-aorta": [
    { front: "Tríade de Beck — componentes?", back: "Hipotensão · Bulhas abafadas · Turgência jugular · Tamponamento cardíaco · Pulsus paradoxus pode acompanhar" },
    { front: "Janela pericárdica / FAST — papel?", back: "FAST subxifoide: líquido pericárdico · Instável + FAST+ → centro · Penetrante precordial: alto índice de suspeita" },
    { front: "Lesão aórtica traumática — pistas?", back: "Trauma desaceleração · Alargamento de mediastino · Escápula/1ª costela · Angio-TC se estável · Instável: controle + centro" },
    { front: "Contusão miocárdica — como suspeitar?", back: "Trauma torácico + arritmia / troponina ↑ / anormalidade de parede · Monitorização · Tratar complicações · Eco se disponível" },
    { front: "Commotio cordis — ideia?", back: "Impacto no precórdio em momento vulnerável do ciclo → FV · Crianças/adolescentes em esporte · Desfibrilação imediata" }
  ],
  "cir2-abdome-inicial": [
    { front: "FAST positivo no instável — conduta?", back: "Laparotomia (não TC) · Ressuscitação paralela · Estável + FAST+: TC para estratificar" },
    { front: "Ferida penetrante abdominal — quando operar?", back: "Peritonite · Evisceração · Instabilidade · Sangue na sonda/reto · Em estável: avaliação seletiva (TC / exploração local) conforme protocolo" },
    { front: "Trauma fechado — papel da TC?", back: "Estável hemodinâmico · Define lesão de órgão sólido / líquido livre · Instável: FAST/DPL/centro — não “passear na TC”" },
    { front: "DPL — ainda cai?", back: "Menos usado com FAST/TC · Útil se FAST duvidoso / sem TC · Positivo: aspirado grosseiro ou critérios de hemácias no lavado" },
    { front: "Trauma abdominal + pélvico — ordem prática?", back: "Controlar hemorragia externa · Binder pélvico se anel instável · FAST · Não desestabilizar com exames demorados" },
    { front: "Líquido livre sem lesão de órgão sólido — pensar?", back: "Víscera oca · Mesentério · Bexiga · Pode precisar exploração se clínica/imagem preocupante" }
  ],
  "cir2-figado-baco": [
    { front: "AAST baço — ideia dos graus?", back: "I–II: laceração/hematoma pequenos · III–IV: mais profundos / vasculares · V: estilhaçado / hilar · Grau + clínica guiam NOM vs cirurgia" },
    { front: "NOM de baço — critérios?", back: "Estável · Sem peritonite · Monitorização · Embolização em sangramento selecionado · Falha = cirurgia" },
    { front: "Vacinas pós-esplenectomia — quais?", back: "Pneumococo · Meningococo · Haemophilus · Idealmente ≥14 dias antes (eletiva) ou o mais cedo possível no trauma · Orientar risco de OPSI" },
    { front: "Trauma hepático — NOM quando?", back: "Estável · Sem outras indicações de laparotomia · Embolização se extravasamento · Cirurgia se instável / packing no damage control" },
    { front: "Packing hepático — quando?", back: "Sangramento não controlável no instável · Parte do damage control · Relaparotomia planejada · Evitar fechar sob tensão" },
    { front: "Kehrs sign — o que é?", back: "Dor referida no ombro esquerdo por irritação diafragmática · Clássico de hemoperitônio / baço" }
  ],
  "cir2-gu-pelve": [
    { front: "Fratura pélvica instável — 1ª medida?", back: "Binder / lençol na altura dos trocânteres · Ressuscitação · Evitar exame de gaveta repetido · Centro / angioembolização / packing" },
    { front: "Trauma uretral — quando suspeitar?", back: "Sangue no meato · Próstata elevada · Equimose perineal · Fratura pélvica · NÃO passar sonda cega → uretrografia retrógrada" },
    { front: "Ruptura de bexiga intraperitoneal × extra?", back: "Intra: líquido livre / cirurgia · Extra: frequentemente conservador com sonda · Cistografia/TC cistografia diagnostica" },
    { front: "Trauma renal — NOM quando?", back: "Maioria estável mesmo em graus altos selecionados · Cirurgia: instabilidade, pedículo, urina urinoma expansivo / pediatria individualizada" },
    { front: "Hematoma retroperitoneal Zona I — ideia?", back: "Zona I central: explorar (grandes vasos) · Zona II lateral: seletiva · Zona III pélvica: packing/angio em fechado" }
  ],
  "cir2-damage-control": [
    { front: "Indicações de damage control laparotomy?", back: "Tríade letal · Instabilidade · Coagulopatia · Acidose · Tempo operatório prolongado · Múltiplas lesões" },
    { front: "Passos do damage control abdominal?", back: "1 controle de hemorragia · 2 controle de contaminação · 3 packing / open abdomen · 4 UTI (reaquecer, corrigir) · 5 relaparotomia definitiva" },
    { front: "SCA — definição e conduta?", back: "Pressão intra-abdominal sustentada + disfunção orgânica · Descompressão (abrir abdome) · Medir PIA via bexiga · Não fechar sob tensão" },
    { front: "Quando tentar fechar o abdome?", back: "Fisiologia corrigida · Edema reduzido · Sem SCA iminente · Fechamento precoce demais → SCA / falha" },
    { front: "Open abdomen — cuidados?", back: "Cobertura (NPWT) · Evitar perda de domínio · Nutrição · Planejar fechamento · Prevenir fístula" },
    { front: "Hipotensão permissiva — contraindicação clássica?", back: "TCE (precisa PPC) · Usar com cautela · Meta: perfusão até controle da hemorragia" }
  ],
  "cir2-tce": [
    { front: "Glasgow — componentes?", back: "Abertura ocular (1–4) · Resposta verbal (1–5) · Motora (1–6) · Total 3–15 · ≤8 = grave → via aérea" },
    { front: "Epidural × subdural — clássico?", back: "Epidural: lente biconvexa, artéria meníngea média, intervalo lúcido · Subdural: crescente, veias ponte, mais comum em idosos/álcool" },
    { front: "Sinais de hipertensão intracraniana / herniação?", back: "Rebaixamento · Anisocoria · Postura · Bradicardia + hipertensão (Cushing) · Osmoterapia / descompressão / neurocirurgia" },
    { front: "Quando pedir TC de crânio (ideia Canadian)?", back: "Mecanismo significativo · Déficit · Rebaixamento · Vômitos repetidos · Anticoagulado · Idade · Sinais de fratura" },
    { front: "Lesão axonal difusa — pista?", back: "Coma desproporcional à TC · Pontos hemorrágicos na junção córtico-subcortical · Prognóstico variável · Suporte" },
    { front: "META de SpO2 / evitar no TCE?", back: "Evitar hipóxia e hipotensão (duplo hit) · Normocapnia (hiperventilação só temporária na herniação)" }
  ],
  "cir2-pescoco": [
    { front: "Zonas do pescoço I–III — limites?", back: "I: clavículas até cricoide · II: cricoide até ângulo da mandíbula · III: acima do ângulo até base do crânio" },
    { front: "Zona II penetrante — conduta clássica?", back: "Sinais hard (sangramento, hematoma expansivo, déficit, ar borbulhante) → centro · Soft: investigação (angio-TC, endoscopia)" },
    { front: "Lesão de via aérea cervical — prioridade?", back: "Via aérea definitiva precoce · Evitar via aérea “cego” se anatomia destruída · Cirurgia/traqueostomia conforme cenário" },
    { front: "Trauma cervical fechado — o que temer?", back: "Dissecção carotídea/vertebral · Déficit neurológico tardio · Angio-TC se critérios de Denver/mecanismo" },
    { front: "Collar cervical — quando manter?", back: "Mecanismo + dor / déficit / intoxicação / TCE · Imagem antes de liberar se critérios não limpos" }
  ],
  "cir2-visceras": [
    { front: "Trauma duodenal — por que atrasa diagnóstico?", back: "Retroperitoneal · Dor pode ser sutil · TC: ar/líquido retroperitoneal · Cirurgia: desbridamento + drenagem / exclusão conforme grau" },
    { front: "Trauma pancreático — enzima e conduta?", back: "Amilase/lipase não excluem · TC / CPRE/MRCP para ducto · Contusão: suporte · Ducto principal: cirurgia/stent conforme grau" },
    { front: "Perfuração de víscera oca — sinais?", back: "Peritonite · Ar livre · Líquido livre sem órgão sólido · Laparotomia / laparoscopia diagnóstica" },
    { front: "Lesão diafragmática — clássico?", back: "Trauma penetrante toracoabdominal esquerdo · TC/ Rx com víscera no tórax · Reparar (não cicatriza só)" },
    { front: "Síndrome compartimental abdominal pós-trauma — lembrar?", back: "Associada a reanimação maciça / packing · Medir PIA · Descomprimir · Parte do continuum do damage control" }
  ],
  "crr-trm-face": [
    { front: "Choque neurogênico × hipovolêmico?", back: "Neurogênico: hipotensão + bradicardia + pele quente (perda simpática) · Hipovolêmico: taquicardia + pele fria · No trauma: excluir sangramento antes de “fechar” neurogênico" },
    { front: "SCIWORA — o que é?", back: "Lesão medular sem anormalidade radiográfica óbvia (mais em crianças) · RM ajuda · Imobilizar e avaliar neuro" },
    { front: "Metilprednisolona no TRM — mensagem atual?", back: "Não é rotina universal · Evidência controversa / risco de infecção · Provas modernas: imobilizar, PA, transferir" },
    { front: "Trauma de face — via aérea?", back: "Sangramento / edema / Le Fort · Intubação precoce se ameaça · Cuidado com fratura de base de crânio (via nasal)" },
    { front: "Le Fort — ideia rápida?", back: "I maxila flutuante · II piramidal · III disjunção craniofacial · Via aérea + estabilidade · Cirurgia bucomaxilo" }
  ],
  "ciresp-resposta-trauma": [
    { front: "Ebb × Flow — o que importa na prova?", back: "Ebb: ↓ metabolismo, choque · Flow: hipermetabolismo, catabolismo · Nutrição e suporte na fase flow · Evitar overfeeding precoce" },
    { front: "Resposta endócrina ao trauma — eixos?", back: "Cortisol ↑ · Catecolaminas ↑ · ADH/aldosterona · Resistência insulínica · Implica hiperglicemia de estresse" },
    { front: "SIRS no trauma — cuidado?", back: "Critérios clássicos de SIRS podem ser fisiológicos · Sepse = infecção + disfunção · Não tratar “SIRS do trauma” como infecção cega" },
    { front: "Janela de oportunidade do damage control?", back: "Corrigir tríade em UTI antes da reconstrução definitiva · Relaparotomia tipicamente 24–48h se packing" }
  ],
  "ciresp-choque-tipos": [
    { front: "Choque hipovolêmico × distributivo — hemodinâmica?", back: "Hipovolêmico: PVC baixa, RVS alta, pele fria · Distributivo (séptico): RVS baixa, pele quente (fase quente) · Guia fluido/vasoativo" },
    { front: "Choque cardiogênico — pistas?", back: "Congestão · PVC alta · Baixo débito · Edema pulmonar · Tratar causa (IAM, contusão) · Evitar sobrecarga cega" },
    { front: "Choque obstrutivo — 4 clássicos?", back: "PNTX hipertensivo · Tamponamento · Tromboembolismo maciço · Obstrução de veia cava · Tratamento = aliviar obstrução" },
    { front: "Lactato e BE — papel?", back: "Marcadores de hipoperfusão · Queda com reanimação adequada · Lactato isolado não define etiologia" },
    { front: "Meta de reanimação no hemorrágico?", back: "Controle da fonte · Sangue · Evitar diluição · Permissiva até hemostasia (exceto TCE)" }
  ],

  /* ── Perioperatório ── */
  "cir3-asa": [
    { front: "ASA E — o que significa?", back: "Emergência · Soma-se à classe (ex.: IIIE) · Aumenta risco · Não substitui otimização quando há tempo" },
    { front: "Quando pedir ECG pré-op?", back: "Doença cardíaca conhecida · Sintomas · Cirurgia de risco intermediário/alto em >40–50a conforme protocolo · Não rotina em jovem ASA I de baixo risco" },
    { front: "Jejum clássico (sólidos × líquidos claros)?", back: "Sólidos ~6h · Líquidos claros ~2h (ERAS/ASA) · Leite/fórmula diferem · Emergência: estômago cheio → sequência rápida" },
    { front: "Alergia a látex — associação alimentar?", back: "Banana, abacate, kiwi, castanha · Usar material sem látex · Aviso na sala" },
    { front: "Otimizar anemia pré-op eletiva — ideia?", back: "Investigar causa · Ferro / eritropoetina em protocolos · Evitar transfusão “cosmética” · Cirurgia oncológica: individualizar" }
  ],
  "cir3-risco-cardiaco": [
    { front: "IRCR (Lee) — 6 preditores?", back: "Cirurgia de alto risco · DAC · ICC · AVC/AIT · DM insulinodependente · Creatinina ≥2 · Cada ponto ↑ risco de evento cardíaco" },
    { front: "Capacidade funcional ≥4 METs — significado?", back: "Sobe 2 lances de escada / anda em plano · Se ≥4 METs sem sintoma: em geral segue sem teste adicional · <4 METs: investigar" },
    { front: "Cirurgias de alto risco cardíaco (exemplos)?", back: "Vascular aórtica / periférica maior · Intraperitoneal/intratorácica prolongada · Emergência maior" },
    { front: "Beta-bloqueador no perioperatório — mensagem?", back: "Manter se usuário crônico · Não iniciar alto dose na véspera (POISE) · Individualizar início em alto risco com tempo" },
    { front: "Stent coronário e cirurgia eletiva — janela?", back: "Adiar eletiva: preferível ≥6 meses após DES (ideal 12m em muitos protocolos) · BMS/angioplastia: janelas menores · Dual antiagregação: discutir Heart Team" },
    { front: "DOAC / warfarina — ideia de suspensão?", back: "DOAC: tipicamente 24–72h conforme rim e risco hemorrágico · Warfarina: INR · Ponte só em alto risco trombótico · Confirmar protocolo local" }
  ],
  "cir3-jejum-atb": [
    { front: "Cefazolina — timing e redose?", back: "30–60 min antes da incisão · Redose se cirurgia longa (>3–4h) ou sangramento maciço · Alergia grave a beta-lactâmico: clinda/vanco conforme protocolo" },
    { front: "Classes de ferida — limpa até suja?", back: "I limpa · II limpa-contaminada · III contaminada · IV suja/infectada · ATB terapêutica ≥ III/IV; profilaxia em I–II selecionadas" },
    { front: "Profilaxia em cirurgia colorretal — ideia?", back: "Cobrir anaeróbios + gram − · Mecânico ± oral em protocolos · IV no momento da indução" },
    { front: "Quando NÃO precisa ATB profilática?", back: "Muitas limpas sem prótese / baixo risco · Evitar “ATB por precaução” sem indicação · Aumenta resistência e C. diff" },
    { front: "ERAS — 3 pilares que caem?", back: "Jejum curto com carboidrato · Analgesia multimodal / evitar opioide excessivo · Deambulação e dieta precoce" }
  ],
  "cir3-posop-febre": [
    { front: "5 W da febre pós-op — tempo?", back: "Wind (atelectasia) 1–2d · Water (ITU) 3d · Walking (TVP) 5d · Wound (ferida) 5–7d · Wonder drugs / abscesso mais tarde" },
    { front: "Atelectasia — prevenção?", back: "Analgesia · Inspirometria · Deambulação · Fisioterapia · Não é “só ATB”" },
    { front: "TEP pós-op — clássico?", back: "Dispneia súbita · Taquicardia · Dessaturação · Fatores de Virchow · Angio-TC · Anticoagular se alta suspeita e baixo risco de sangramento" },
    { front: "Profilaxia de TVP — quem?", back: "Quase todo médio/grande porte · Mecânica + farmacológica conforme risco · Ajustar se sangramento / neuroaxial" },
    { front: "Íleo pós-op — conduta?", back: "Jejum se vômitos · SNE se distensão · Corrigir K/Mg · Deambular · Explorar se suspeita mecânica / isquemia" }
  ],
  "cir3-isc": [
    { front: "ISC — tipos superficial / profunda / órgão?", back: "Superficial: pele/tecido · Profunda: fáscia/músculo · Órgão/espaço: cavidade · CDC define janelas temporais" },
    { front: "Deiscência de aponeurose — clínica?", back: "Saída de líquido serosanguinolento (“água de carne”) · Abertura da ferida · Risco de evisceração · Reparo em centro" },
    { front: "Evisceração — conduta imediata?", back: "Cobrir com compressas salinas estéreis · Não recolocar alças à força no leito · Centro cirúrgico · Antibiótico / suporte" },
    { front: "Fatores de risco de ISC?", back: "Obesidade · DM · Tabagismo · Tempo cirúrgico · Contaminação · Transfusão · Técnica / hemostasia" },
    { front: "Tratamento da ISC superficial?", back: "Abrir / drenar · Curativos · ATB se celulite sistêmica · Cultura se disponível" }
  ],
  "cir3-hernia-inguinal": [
    { front: "Direta × indireta — anatomia?", back: "Indireta: lateral aos vasos epigástricos, anel profundo (congênita/processo vaginal) · Direta: medial, triângulo de Hesselbach (fraqueza de parede)" },
    { front: "Limites do triângulo de Hesselbach?", back: "Ligamento inguinal · Borda lateral do reto · Vasos epigástricos inferiores" },
    { front: "Lichtenstein — ideia?", back: "Reparo aberto tension-free com tela · Padrão clássico em adultos · Baixa recorrência" },
    { front: "Quando laparoscopia (TAPP/TEP)?", back: "Bilateral · Recidiva após aberto · Preferência/expertise · Unilateral primária: aberto ou lapo aceitáveis" },
    { front: "Hérnia inguinal em mulher — pegadinha?", back: "Pensar femoral · Avaliar ambos · Não assumir só inguinal" },
    { front: "Quando operar assintomática no homem?", back: "Muitos podem observação vigilante · Operar se sintoma / risco / preferência · Femoral: operar" }
  ],
  "cir3-hernia-outras": [
    { front: "Hérnia umbilical no adulto — conduta?", back: "Operar se sintomática / risco · Tela se defeito maior · Em cirrótico: otimizar / cuidado com ascite" },
    { front: "Incisional — prevenção?", back: "Técnica / fechamento adequado · Controle de infecção · Evitar tensão · Obesidade e tabagismo ↑ risco" },
    { front: "Hérnia de Spiegel — localização?", back: "Linha semilunar · Pode ser intersticial · TC/US se dúvida · Alto risco de encarceramento" },
    { front: "Parastomal — ideia?", back: "Comum após colostomia · Prevenção com tela em alguns protocolos · Correção complexa (relocation / mesh)" }
  ],
  "cir3-anestesia": [
    { front: "Raquianestesia — nível e complicações?", back: "Bloqueio subaracnóideo · Hipotensão (simpatólise) · Cefaleia pós-punção · Retenção urinária · Contraindicações: infecção no sítio, coagulopatia" },
    { front: "Toxicidade de anestésico local — clássico?", back: "Zumbido · Gosto metálico · Convulsão · PCR · Tratamento: emulsão lipídica + suporte (ACLS)" },
    { front: "Via aérea difícil — preditores?", back: "Mallampati alto · Abertura bucal limitada · Pescoço curto · Obesidade · Trauma facial · Plano B (vídeo, supra-glótica, crico)" },
    { front: "Sequência rápida — quando?", back: "Estômago cheio / emergência · Indução + pressão cricoide (uso debatido) + intubação sem ventilação prolongada" },
    { front: "ASA e anestesia — mensagem?", back: "ASA correlaciona com risco · Não é “liberação” isolada · Avaliação completa + otimização" }
  ],
  "cir3-suturas-hemostasia": [
    { front: "Fio absorvível × inabsorvível — exemplos?", back: "Absorvível: vicryl, PDS, catgut · Inabsorvível: nylon, prolene, silk · Escolher conforme tensão e tempo de cicatrização" },
    { front: "Monofilamento × multifilamento?", back: "Mono: menos infecção, mais memória · Multi: melhor manuseio, mais nichos bacterianos · Contaminada: preferir mono" },
    { front: "Antiagregação e cirurgia — ideia geral?", back: "AAS: muitas vezes manter em risco cardiovascular · Clopidogrel: suspender ~5–7d se seguro · Stent recente: Heart Team" },
    { front: "Hemostasia — opções locais?", back: "Pressão · Ligadura · Eletrocautério · Hemostáticos tópicos · Correção de coagulopatia sistêmica" }
  ],
  "cir3-posop-anastomose": [
    { front: "Deiscência de anastomose — quando suspeitar?", back: "5–7º dia típico · Taquicardia · Febre · Dor · Dreno entérico / ar livre novo · TC com contraste se estável" },
    { front: "Fatores de risco de deiscência?", back: "Tensão · Má irrigação · Desnutrição · Corticoide · Sepse · Técnica · Tabagismo" },
    { front: "Conduta geral da deiscência?", back: "Ressuscitação · ATB · Controle de foco (dreno / estoma / reparo) · Nutrição · Individualizar por local e gravidade" },
    { front: "Fístula anastomótica de baixo débito — ideia?", back: "Estável + controlada: suporte + nutrição + controle de sepse · Alto débito / peritonite: reoperação" },
    { front: "Teste de hermeticidade intra-op — papel?", back: "Insuflação / azul de metileno em anastomoses colorretais · Não elimina risco tardio · Técnica cuidadosa é base" }
  ],
  "crr-anestesia-avancada": [
    { front: "Hipertermia maligna — gatilhos e antídoto?", back: "Succinilcolina + halogenados · Hipercapnia precoce · Rigidez · Hipertermia · Antídoto: dantrolene · Suspender gatilhos + resfriar" },
    { front: "Succinilcolina — contraindicações clássicas?", back: "Hipercalemia de risco (queimadura >24h, denervação, trauma medular) · MH suspeita · Glaucoma de ângulo fechado relativo" },
    { front: "Sugamadex — para que?", back: "Reversão de rocurônio/vecurônio · Útil em falha de via aérea / residual · Custo/protocolo local" },
    { front: "ASA difficult airway — mensagem?", back: "Avaliar · Planejar · Oxigenar · Não insistir >3–4 tentativas sem mudar estratégia · Via invasiva se necessário" },
    { front: "Sedação vs anestesia geral — risco?", back: "Sedação profunda pode obstruir via aérea · Capnografia · Pronto para converter em AG" }
  ],
  "crr-infeccao-cirurgica": [
    { front: "Pacote de prevenção de ISC — itens?", back: "ATB no tempo certo · Glicemia · Normotermia · Antisepsia · Técnica · Remover pelos com clipper (não lâmina)" },
    { front: "C. difficile pós-ATB — ideia?", back: "Diarreia + ATB recente · PCR/toxina · Vancomicina VO / fidaxomicina · Isolamento · Evitar ATB desnecessário" },
    { front: "Infecção de sítio com prótese/tela — conduta?", back: "Pode precisar remoção · ATB prolongado · Individualizar · Prevenção > tratamento" },
    { front: "Cultura de ferida — quando?", back: "ISC com drenagem / falha · Antes de ATB se possível · Não cultivar colonização seca sem pus" }
  ],

  /* ── Vascular ── */
  "cir1-aaa": [
    { front: "Rastreio de AAA — ideia?", back: "US em homens ≥65a tabagistas (protocolos) · Seguimento por diâmetro · Encaminhar se próximo do limiar cirúrgico" },
    { front: "EVAR × aberto — quando pensar?", back: "EVAR: anatomia favorável / alto risco aberto · Aberto: anatomia ruim / jovem / falha de endoprótese · Seguimento de EVAR obrigatório (endoleak)" },
    { front: "Endoleak — tipos principais?", back: "I selamento proximal/distal · II ramos lombares/mesentéricos · III junção de módulos · I/III geralmente reintervir · II observar se sac estável" },
    { front: "AAA inflamatório / micótico — pegadinha?", back: "Micótico: infecção, crescimento rápido, irregular · Inflamatório: fibrose / aderência a duodeno · Conduta especializada" },
    { front: "Choque + massa pulsátil — o que NÃO fazer?", back: "Não atrasar com TC se instável extremo · Permissiva · Centro vascular · Acesso venoso / sangue" },
    { front: "Diâmetro e risco de ruptura — mensagem?", back: "Risco sobe com diâmetro · ≥5,5 cm: benefício da correção supera risco na maioria · Sintoma = urgência" }
  ],
  "cir1-dap": [
    { front: "ITB — valores clássicos?", back: "Normal ~1,0–1,3 · <0,9 sugere DAP · <0,4 isquemia crítica · >1,3 vasos calcificados (DM) — usar outros índices" },
    { front: "Claudicação × isquemia crítica?", back: "Claudicação: dor ao esforço que alivia com repouso · Crítica: dor de repouso / úlcera / gangrena · Crítica = revascularizar" },
    { front: "Tratamento da claudicação?", back: "Parar tabaco · Exercício supervisionado · Estatina / AAS · Cilostazol em selecionados · Revascularizar se refratário / invalidez" },
    { front: "Rutherford / Fontaine — ideia?", back: "Estadiamento clínico de DAP · Claudicação → dor de repouso → lesão trófica · Guia urgência" },
    { front: "Úlcera arterial × venosa?", back: "Arterial: dolorosa, pálida, distal, ITB baixo · Venosa: maleolar medial, edema, ocre · Não comprimir arterial grave" }
  ],
  "cir1-oclusao-arterial": [
    { front: "6 P da oclusão arterial aguda?", back: "Pain · Pallor · Pulselessness · Paresthesia · Paralysis · Poikilothermia · Tempo = músculo/nervo" },
    { front: "Embolia × trombose in situ?", back: "Embolia: início súbito, coração fonte (FA), membro saudável prévio · Trombose: DAP prévia, colaterais · Conduta pode diferir" },
    { front: "Conduta imediata?", back: "Heparina IV · Analgesia · Avaliar viabilidade · Embolectomia / trombólise / bypass conforme tempo e leito" },
    { front: "Fasciotomia — quando?", back: "Síndrome compartimental após reperfusão · Dor desproporcional · Tensão das lojas · Não esperar ausência de pulso" },
    { front: "Membro inviável — conduta?", back: "Amputação primária se necrose irreversível / rigor · Não revascularizar tecido morto (risco de sepse/reperfusão letal)" },
    { front: "Janela de tempo clássica?", back: "~6h para músculo esquelético · Quanto antes melhor · Déficit motor = urgência absoluta" }
  ],
  "cir1-aneurismas-perifericos": [
    { front: "Aneurisma poplíteo — por que operar cedo?", back: "Risco de trombose / embolização distal >> ruptura · Associado a AAA (rastrear) · Tratamento: bypass / exclusão" },
    { front: "Aneurisma femoral — ideia?", back: "Menos comum · Pode complicar com embolia/trombose · Correção se sintomático / diâmetro relevante" },
    { front: "Aneurisma micótico periférico — mensagem?", back: "Infecção · Drogas IV / endocardite · Antibiótico + excisão / revascularização extra-anatômica" },
    { front: "Rastrear AAA em quem tem poplíteo?", back: "Sim — alta associação · US de aorta · Bilateralidade comum nos poplíteos" }
  ],
  "cir1-ivc": [
    { front: "Indicações clássicas de cirurgia de varizes?", back: "Sintomas · Úlcera venosa · Sangramento · Falha do conservador · CEAP guia avaliação" },
    { front: "TVP × insuficiência venosa crônica?", back: "TVP: aguda, dor, edema unilateral, risco de TEP · IVC: crônica, varicose, ocre, úlcera maleolar" },
    { front: "Meia elástica — quando evitar?", back: "DAP significativa / ITB baixo · Pode piorar isquemia · Tratar arterial primeiro" },
    { front: "Tromboflebite superficial — conduta?", back: "AAS/anti-inflamatório · Meia · Anticoagular se próxima da junção safeno-femoral / extensão · Avaliar TVP associada" },
    { front: "Úlcera venosa — tratamento base?", back: "Compressão (se ITB ok) · Curativo · Tratar refluxo · Antibiótico só se infecção" }
  ],

  /* ── Infantil ── */
  "cir1-ped-abdome": [
    { front: "Invaginação — idade e clínica?", back: "3–12 meses típico · Dor cólica intermitente · Vômitos · Fezes em geleia de morango (tardio) · Massa em salsicha" },
    { front: "Invaginação — diagnóstico e 1ª conduta?", back: "US: sinal do alvo · Estável sem peritonite: enema (ar/contraste) redutor · Instável/peritonite: cirurgia" },
    { front: "Meckel — regra dos 2 e sangramento?", back: "2% · 2 pés da válvula · 2 tipos de mucosa · <2 anos · Sangramento indolor / div. inflamado / obstrução" },
    { front: "Diagnóstico de Meckel sangrante?", back: "Cintilografia Tc-99m (mucosa gástrica ectópica) · Cirurgia se sangramento significativo / complicação" },
    { front: "Hérnia inguinal encarcerada na criança?", back: "Tentar redução se sem estrangulamento · Herniorrafia precoce após · Bilateralidade: avaliar lado contralateral conforme idade/protocolo" },
    { front: "Apendicite na criança — diferença do adulto?", back: "Perfuração mais comum · US 1ª linha · Mesma lógica operatória · DD: gastroenterite, adenite mesentérica, Meckel" }
  ],
  "cir1-ped-digestivo": [
    { front: "Atresia esofágica — tipos e VACTERL?", back: "Mais comum: AE com fístula distal · VACTERL: vertebral, anorretal, cardíaca, TEF, renal, limb · Rx com sonda enrolada" },
    { front: "Estenose hipertrófica de piloro — clássico?", back: "3–6 sem · Vômitos não biliosos em jato · Olive mass · Alcalose hipoclorêmica hipocalêmica · US · Piloromiotomia após corrigir eletrólitos" },
    { front: "Hirschsprung — como diagnosticar?", back: "Atraso de mecônio · Obstrução · Enema: zona de transição · Biópsia retal (ausência de gânglios) · Pull-through" },
    { front: "Malrotacão / volvo — emergência?", back: "Vômito bilioso no neonato = emergência até prova em contrário · US/GI série · Ladd se volvo/malrotacão sintomática" },
    { front: "Double bubble — significado?", back: "Atresia/estenose duodenal · Associar Down · Cirurgia após estabilizar · Não atrasar avaliação" },
    { front: "Enterocolite necrosante — Bell e conduta?", back: "Prematuro · Distensão · Pneumatose · Clínica: jejum, SNE, ATB · Cirurgia: perfuração / falência (pneumoperitônio)" },
    { front: "Íleo meconial × Hirschsprung — DD?", back: "Íleo meconial: FC · Enema terapêutico às vezes · Hirschsprung: aganglionose · Biópsia diferencia crônicos" }
  ],
  "cir1-ped-parede-biliar": [
    { front: "Onfalocele × gastrosquise?", back: "Onfalocele: saco, midline, mais anomalias · Gastrosquise: sem saco, direita do umbigo, alças expostas · Conduta: silo/fechamento + suporte" },
    { front: "HDC (Bochdalek) — clássico?", back: "Desconforto respiratório neonatal · Abdome escavado · Vísceras no tórax · Estabilizar (não hiperinsuflar) → cirurgia" },
    { front: "Atresia de vias biliares — Kasai?", back: "Icterícia colestática persistente · Acholic stools · Diagnóstico precoce · Kasai <60 dias melhora prognóstico · Tx se falha" },
    { front: "Hérnia umbilical infantil — quando operar?", back: "Maioria fecha até 4–5 anos · Operar se sintomática / grande / não fecha · Diferente do adulto" },
    { front: "Extrofia de bexiga — ideia?", back: "Defeito da parede inferior · Bexiga exposta · Correção especializada · Associar anomalias" },
    { front: "Hipospádia — timing?", back: "Correção eletiva tipicamente 6–18 meses · Não circuncidar antes (pele útil) · Avaliar outras anomalias se proximal" }
  ],

  /* ── AD / especialidades reforço ── */
  "cg-vesicula": [
    { front: "Colelitíase assintomática — operar?", back: "Em geral não · Exceções: porcelana, pólipos grandes, anemia hemolítica, candidato a Tx / bariátrica selecionada" },
    { front: "Cólica biliar × colecistite?", back: "Cólica: dor autolimitada sem inflamação sistêmica · Colecistite: febre, Murphy, PCR/leucocitose, US inflamatório" },
    { front: "Íleo biliar — tríade de Rigler?", back: "Obstrução · Pneumobilia · Cálculo ectópico · Cirurgia: enterolitotomia ± colecistectomia (tempo)" },
    { front: "Pólipo de vesícula — quando colecistectomia?", back: "≥1 cm · Sintomático · Crescimento · Sessão com pedículo duvidoso · Associado a cálculo em selecionados" },
    { front: "Síndrome de Mirizzi — conduta?", back: "Compressão da via por cálculo · CPRE / cirurgia cuidadosa · Alto risco de lesão de via" }
  ],
  "cg-estomago": [
    { front: "Úlcera perfurada — conduta?", back: "Ressuscitação · ATB · Cirurgia (ulcerorrafia + epíploon — Graham) · H. pylori depois · TC se dúvida no estável" },
    { front: "Úlcera sangrante — Forrest e endoscopia?", back: "Endoscopia 1ª linha · Forrest Ia–IIb alto risco de ressangramento · Falha endoscópica → IR/cirurgia" },
    { front: "Síndrome de Zollinger–Ellison — pista?", back: "Úlceras múltiplas / refratárias · Diarreia · Gastrina ↑ · Procurar gastrinoma" },
    { front: "Gastroparesia × obstrução de saída?", back: "Gastroparesia: esvaziamento lento sem bloqueio mecânico · Obstrução: estenose pilórica/úlcera · Endoscopia/série GI" },
    { front: "Síndrome de Dumping — após o quê?", back: "Pós-gastrectomia/bypass · Vasomotor + hipoglicemia tardia · Dieta fracionada · Octreotide raro" }
  ],
  "crr-estomago-onco": [
    { front: "CA gástrico — fatores de risco?", back: "H. pylori · Nitritos · Tabaco · Gastrite atrófica · História familiar · Dieta" },
    { front: "Linitis plastica — ideia?", back: "Infiltração difusa · Parede rígida · Prognóstico ruim · Diagnóstico por biópsia/ecoendoscopia" },
    { front: "Linfadenectomia D2 — mensagem?", back: "Padrão oncológico em centros · Remove estações regionais · Morbidade se inexperiente" },
    { front: "GIST gástrico — marcador e droga?", back: "CD117/DOG1 · Tumores estromais · Imatinibe em avançado / adjuvante selecionado · Ressecção se localizado" },
    { front: "Margem e tipo de gastrectomia?", back: "Localização decide subtotal vs total · Margens livres · Neoadjuvância em muitos protocolos avançados" }
  ],
  "crr-esofago": [
    { front: "Boerhaave × Mallory-Weiss?", back: "Boerhaave: ruptura transmural (vômito) — emergência cirúrgica/endoscópica · Mallory-Weiss: laceração mucosa — geralmente endoscopia" },
    { front: "Acalasia — tratamento definitivo?", back: "Heller + fundoplicatura parcial · POEM em centros · Dilatação pneumática alternativa · CA de esôfago no DD" },
    { front: "CA de esôfago — histologia por local?", back: "Superior/médio: epidermoides (álcool/tabaco) · Distal/junção: adenocarcinoma (Barrett)" },
    { front: "Perfuração esofágica iatrogênica — conduta?", back: "Depende de tempo/contaminação/local · Contida: conservador selecionado · Sepse/coleção: drenagem + reparo/stent" },
    { front: "Varizes esofágicas — sangramento agudo?", back: "ABC · Vasoativo (terlipressina/octreotide) · Endoscopia (ligadura) · ATB · TIPS se refratário" }
  ],
  "cg-colon": [
    { front: "Obstrução colorretal maligna esquerda — opções?", back: "Stent ponte · Ressecção + estoma · Anastomose em selecionados · Evitar anastomose em instável" },
    { front: "Colite isquêmica — sítio clássico?", back: "Splenic flexure / retossigmoide (watershed) · Dor + sangramento · Maioria conservadora · Cirurgia se necrose/peritonite" },
    { front: "Megacólon tóxico — conduta?", back: "IBD/infecção · Distensão + toxicidade · ATB / esteroides se IBD · Cirurgia se falha / perfuração (colectomia)" },
    { front: "Volvulus e Ogilvie — diferença?", back: "Volvulus: torção mecânica · Ogilvie: pseudo-obstrução (neostigmina/cólonoscopia se refratário)" },
    { front: "Preparação de cólon — ainda usa?", back: "Muitos protocolos: mecânico + ATB oral em eletivas · Emergência: sem preparo" }
  ],
  "crr-colorretal": [
    { front: "Rastreio de CA colorretal — ideia geral?", back: "A partir de 45–50a (protocolos) · Colonoscopia ou FIT · Familiar/sindromes: mais cedo" },
    { front: "TME no reto — por quê?", back: "Excisão total do mesorreto ↓ recorrência local · Padrão em médio/baixo reto · Neoadjuvância em avançados" },
    { front: "Lynch × FAP — diferença chave?", back: "Lynch: poucos pólipos, risco alto, MSI · FAP: centenas de pólipos, APC, colectomia profilática" },
    { front: "Estadiamento TNM — papel da RM no reto?", back: "RM define margem circunferencial / T e N · Guia neoadjuvância · Ecoendoscopia complementar" },
    { front: "CEA no seguimento — mensagem?", back: "Marcar se elevado pré-op · Elevação no follow-up → investigar metástase · Não diagnostica sozinho" },
    { front: "DII — indicações cirúrgicas absolutas?", back: "Perfuração · Hemorragia maciça · Megacólon refratário · Câncer / displasia high-grade · Falha clínica crônica" }
  ],
  "cg-pancreas": [
    { front: "Atlanta — pancreatite leve × grave?", back: "Leve: sem falência / necrose · Moderada: falência transitória / complicação local · Grave: falência persistente" },
    { front: "Quando TC na pancreatite?", back: "Dúvida diagnóstica · Falha em melhorar 48–72h · Suspeita de necrose/complicação · Não TC de rotina na admissão típica" },
    { front: "Colecistectomia na pancreatite biliar?", back: "Mesma internação após melhora (leve) · Evitar alta sem colecistectomia — recorrência alta" },
    { front: "Necrose infectada — step-up?", back: "ATB se infecção · Drenagem percutânea → necrosectomia mínima se necessário · Evitar cirurgia aberta precoce" },
    { front: "Pseudocisto — quando drenar?", back: "Sintomático / infectado / obstrutivo · Preferir parede madura (~4–6 sem) · Endoscopia / percutânea / cirurgia" }
  ],
  "crr-pancreas": [
    { front: "Whipple — indicações clássicas?", back: "CA cabeça de pâncreas ressecável · Ampola · Colédoco distal · Sem metástase · Bordas vasculares avaliadas" },
    { front: "Critérios de irressecabilidade vascular?", back: "Envolvimento extenso de artéria mesentérica superior / celíaco · Metástase · Contato venoso pode ser borderline (centros)" },
    { front: "Cisto pancreático — mucinous vs serous?", back: "Mucinoso (IPMN/MCN): potencial maligno · Seroso: geralmente benigno · CEA no líquido / imagem guiam" },
    { front: "Pancreatite crônica — dor refratária?", back: "Álcool/tabaco cessar · Enzimas · Bloqueio · Cirurgia/drenagem se dilatação (Puestow) / ressecção selecionada" },
    { front: "Insulinoma × gastrinoma — pista?", back: "Insulinoma: hipoglicemia jejum · Gastrinoma: úlceras / ZE · Localizar e ressecar se possível" }
  ],
  "cg-figado": [
    { front: "Child-Pugh — variáveis?", back: "Bilirrubina · Albumina · INR · Ascite · Encefalopatia · A/B/C correlacionam sobrevida e risco cirúrgico" },
    { front: "Hipertensão portal — sangramento?", back: "Varizes: vasoativo + endoscopia · Profilaxia secundária · TIPS refratário · Beta-bloqueador na profilaxia primária selecionada" },
    { front: "Abscesso hepático piogênico — conduta?", back: "ATB + drenagem (se >3–5 cm) · Investigar foco biliar/portal · Cirurgia se multilocular refratário" },
    { front: "Hemangioma × HNF × adenoma?", back: "Hemangioma: mais comum benigno · HNF: mulher, cicatriz central · Adenoma: risco sangramento/maligno — operar se grande/hormônio" },
    { front: "Trauma hepático — packing vs NOM?", back: "NOM se estável · Packing no damage control se sangramento · Embolização se extravasamento e estável o bastante" }
  ],
  "crr-figado-portal": [
    { front: "Critérios de Milão — o que são?", back: "Seleção Tx hepático no HCC: 1 nódulo ≤5 cm ou até 3 ≤3 cm · Sem vascular/extra-hepático · Base de muitos protocolos" },
    { front: "BCLC — ideia?", back: "Estadiamento HCC que une função hepática + performance + tumor · Guia ablação / TACE / sistêmico / suporte" },
    { front: "TIPS — indicações?", back: "Varizes refratárias · Ascite refratária selecionada · Síndrome de Budd-Chiari em alguns · Risco de encefalopatia" },
    { front: "Budd-Chiari — o que é?", back: "Obstrução do fluxo venoso hepático · Dor, ascite, hepatomegalia · Anticoagulação / TIPS / Tx" },
    { front: "Klatskin — definição?", back: "Colangiocarcinoma na confluência dos hepáticos · Icterícia indolor · Dilatação intra-hepática · Ressecabilidade em centros" },
    { front: "Hepatectomia — reserva hepática?", back: "Child / MELD / volumetria · Hipertensão portal clinicamente significativa aumenta risco · Embolização portal pré-op em selecionados" }
  ],

  "cg-urologia": [
    { front: "Torção testicular — janela e conduta?", back: "Dor súbita · Reflexo cremastérico ausente · Doppler · Dúvida = exploração (não esperar exame) · Ideal <6h" },
    { front: "Orquite/epididimite × torção?", back: "Infecciosa: mais gradual, febre, Prehn+ às vezes · Torção: súbita · Se dúvida → centro" },
    { front: "Cólica nefrética — 1ª linha analgésica?", back: "AINE (se função ok) · Hidratação · Imagem (TC baixa dose / US) · Urologia se febre+obstrução / anúria / dor refratária" },
    { front: "Obstrução + infecção — conduta?", back: "Emergência · ATB + descompressão (cateter duplo J ou nefrostomia) · Não só ATB" },
    { front: "Retenção urinária aguda — 1º passo?", back: "Alívio com sonda · Investigar causa (HBP, fármacos, neurológico) · Alfa-bloqueador em HBP · Follow-up urológico" }
  ],
  "crr-urologia": [
    { front: "Tumor testicular — via de orquiectomia?", back: "Inguinal (nunca escrotal) · Marcadores AFP/β-hCG/LDH · Estadiamento TC · Esperma bank se possível" },
    { front: "CA de bexiga — hematúria?", back: "Hematúria indolor = cistoscopia até prova em contrário · Tabagismo · RTU + histologia · BCG em alto grau selecionado" },
    { front: "CA de próstata — PSA e conduta localizado?", back: "PSA + toque · Biópsia se indicado · Localizado: vigilância / prostatectomia / RT conforme risco" },
    { front: "Pielonefrite enfisematosa — quem?", back: "DM · Gás no rim no TC · Grave · ATB + drenagem / nefrectomia se fulminante" },
    { front: "Fournier — conduta?", back: "Polimicrobiana perineal/genital · Desbridamento amplo + ATB + suporte · Não atrasar por imagem se óbvio" },
    { front: "Litíase — tamanho e LECO/URS?", back: "≤5 mm: muitas expulsam · Proximal/maior: URS ou LECO conforme densidade/local · Coraliforme: percutânea" }
  ],
  "cg-torax": [
    { front: "Pneumotórax espontâneo primário — operar quando?", back: "Recidiva · Bilaterais · Vazamento persistente · Profissões de risco (piloto/mergulho) · 1º episódio grande/sintomático: discutir" },
    { front: "Empiema — estágios e conduta?", back: "Exsudativo → fibrinopurulento → organizado · ATB + dreno · VATS se loculado · Decorticação se organizado" },
    { front: "Critérios de Light — para quê?", back: "Exsudato × transudato no derrame · Exsudato: investigar infecção/malignidade/PE" },
    { front: "Derrame parapneumônico complicado — ideia?", back: "pH baixo / glicose baixa / loculado · Drenar · Não só ATB" },
    { front: "Nódulo pulmonar solitário — fatores de malignidade?", back: "Tamanho · Espículas · Tabagismo · Idade · Crescimento · PET/biópsia conforme risco" }
  ],
  "crr-torax-eletivo": [
    { front: "NSCLC ressecável — cirurgia padrão?", back: "Lobectomia + linfadenectomia em estágios iniciais · Estadiamento mediastinal · VATS/robótica em centros" },
    { front: "Mediastino anterior — 4 T?", back: "Timoma · Teratoma/germe · “Terrible” linfoma · Tireoide ectópica (bócio)" },
    { front: "Miastenia e timoma — relação?", back: "Timoma associado a miastenia · Timectomia em selecionados · Preparo anestésico especial" },
    { front: " indicação de VATS no pneumotórax?", back: "Recidiva / vazamento / bolhas · Ressecção de blebs + pleurodese" },
    { front: "Síndrome da veia cava superior — pensar?", back: "Câncer de pulmão / linfoma · Edema facial · Circulação colateral · Tratar tumor + suporte" }
  ],

  "cir1-hemorroidas": [
    { front: "Graus de hemorroidas internas?", back: "I sangram · II prolapso e reduzem · III reduzem manual · IV irredutíveis · Conduta escala com grau" },
    { front: "Trombose hemorroidária externa — conduta?", back: "<72h: excisão do trombo alivia · >72h: conservador (banho, analgesia) frequentemente" },
    { front: "Quando operar hemorroidas?", back: "Grau III–IV sintomáticas · Falha clínica · Anemia por sangramento · Preferir técnicas conforme grau" },
    { front: "Hemorroidas × fissura — DD?", back: "Fissura: dor intensa ao evacuar, sangue vivo, hipertonia · Hemorroida: prolapso/sangue sem dor intensa (exceto trombose)" }
  ],
  "cir1-abscesso-fistula": [
    { front: "Abscesso anorretal — conduta?", back: "Drenagem cirúrgica · ATB se celulite/imunodepressão · Não só ATB no abscesso formado" },
    { front: "Fístula anal — Goodsall?", back: "Regra de Goodsall estima trajeto interno · Cirurgia: preservar esfíncter · Fistulotomia se simples baixo" },
    { front: "Doença pilonidal — tratamento?", back: "Abscesso: drenar · Eletivo: excisão / técnicas flap · Higiene e pelos" },
    { front: "Abscesso ↔ fístula — relação?", back: "Fístula = cronificação do abscesso criptoglandular · Informar risco após drenagem" }
  ],
  "cir1-bariatrica": [
    { front: "Indicações clássicas de bariátrica?", back: "IMC ≥40 · Ou ≥35 com comorbidades · Falha do clínico · Avaliação multidisciplinar" },
    { front: "Bypass × sleeve — diferença chave?", back: "Bypass: restritivo + disabsortivo, melhor refluxo/DM em muitos · Sleeve: restritivo, preserva acesso biliar · Escolha individualizada" },
    { front: "Complicações precoces que caem?", back: "Fístula de anastomose/grampeamento · Sangramento · TEP · Obstrução · Taquicardia = alarme" },
    { front: "Deficiências após bypass?", back: "B12 · Ferro · Cálcio/vit D · Proteína · Suplementação lifelong" },
    { front: "Dumping e hipoglicemia pós-bypass?", back: "Dumping precoce: vasomotor · Tardio: hipoglicemia · Dieta · Evitar açúcar simples" }
  ],
  "ciresp-queimaduras": [
  ],
  "ciresp-queimaduras-geral": [
    { front: "Regra dos 9 — adulto?", back: "Cabeça 9 · Cada MS 9 · Cada MI 18 · Tronco ant 18 · Tronco post 18 · Períneo 1 · Criança: cabeça proporcionalmente maior" },
    { front: "Profundidade — 1º × 2º × 3º?", back: "1º: só eritema · 2º: bolha / doloroso (super/profundo) · 3º: branco/acastanhado, anestésico · 2º profundo/3º: pensar enxerto" },
    { front: "Quando transferir para centro de queimados?", back: "Extensão significativa · Face/mãos/genitais/períneo · Elétrica / química · Inalação · Circunferencial · Criança/idoso" },
    { front: "Lesão inalatória — pistas e conduta?", back: "Sinhais faciais / escarro carbonáceo / ambiente fechado · Intubar precoce se ameaça · Oxigênio / broncoscopia" },
    { front: "Escarotomia — quando?", back: "Queimadura circunferencial com compromisso vascular/ventilatório · Tórax que impede ventilação · Não é fasciotomia" }
  ],
  "ciresp-parkland": [
    { front: "Parkland — fórmula?", back: "4 ml × peso(kg) × %SCQ (2º+3º) · Metade nas primeiras 8h do horário da queimadura · Ringer lactato · Ajustar por diurese" },
    { front: "Meta de diurese na reposição?", back: "Adulto ~0,5 ml/kg/h · Elétrica: maior (mioglobina) · Criança ~1 ml/kg/h" },
    { front: "Queimadura elétrica — o que temer?", back: "Lesão profunda / rabdomiólise · Arritmia · Compartimental · Internar e monitorar" },
    { front: "Química — 1º passo?", back: "Remover agente · Irrigação copiosa com água (exceto exceções como fenol/metais ativos conforme protocolo) · Olhos: irrigar muito" },
    { front: "Erro clássico do Parkland?", back: "Contar eritema (1º grau) na % · Esquecer que o relógio começa na queimadura · Não ajustar pela diurese" }
  ],
  "ciresp-cicatrizacao": [
    { front: "Fases da cicatrização?", back: "Hemostasia/inflamação · Proliferação (granulação) · Maturação/remodelação · Colágeno III → I" },
    { front: "Cicatrização 1ª × 2ª intenção?", back: "1ª: bordas aproximadas · 2ª: granula do fundo · 3ª (terciária): demorada após infecção controlada" },
    { front: "Queloide × hipertrófica?", back: "Queloide: ultrapassa bordas, não regride · Hipertrófica: dentro da ferida, pode melhorar · Queloide: corticoide/pressão/cirurgia cuidadosa" },
    { front: "Fatores que atrasam cicatrização?", back: "Infecção · Isquemia · DM · Tabaco · Desnutrição · Corticoide · Corpo estranho" },
    { front: "Deiscência precoce — causas?", back: "Técnica · Infecção · Tensão · Desnutrição · Hematoma" }
  ],
  "ciresp-sepse": [
    { front: "Sepsis-3 — definição?", back: "Disfunção orgânica ameaçadora por infecção desregulada · SOFA ≥2 · Choque séptico: vasopressor + lactato com hipovolemia corrigida" },
    { front: "Bundle 1 hora — ideia?", back: "Culturas · ATB amplo precoce · Fluido se hipotensão/lactato · Lactato · Vasopressor se necessário" },
    { front: "Controle de foco — exemplos cirúrgicos?", back: "Drenar abscesso · Retirar cateter infectado · Laparotomia em peritonite · Sem foco controlado ATB falha" },
    { front: "qSOFA — papel atual?", back: "Triagem simples (FR, PAC, mental) · Não define sepse sozinho · SOFA/clínica > qSOFA isolado" },
    { front: "Choque séptico × hipovolêmico — diferença?", back: "Séptico: vasodilatação, frequentemente quente · Hipovolêmico: frio, perdas · Ambos podem coexistir no cirúrgico" }
  ],
  "ciresp-plastica": [
    { front: "STSG × FTSG?", back: "STSG: parcial, cobre área grande, contrai mais · FTSG: total, estética, área pequena, doadora fecha" },
    { front: "Retalho — classificação simples?", back: "Randomizado × axial · Local × livre (microcirurgia) · Leva pedículo vascular" },
    { front: "Regra dos enxertos — por que falham?", back: "Hematoma · Infecção · Cisalhamento · Leito avascular · Movimento" },
    { front: "Matrizes / substitutos de pele — ideia?", back: "Úteis em queimados selecionados · Não substituem controle de infecção e nutrição do leito" },
    { front: "Ferida crônica — abordagem?", back: "Causa (venosa/arterial/pressão) · Desbridar · Umidade · Offloading · Tratar infecção · Vascular assessment" }
  ],
  "crr-partes-moles": [
    { front: "Fascite necrosante — sinais de alarme?", back: "Dor desproporcional · Evolução rápida · Crepitação / bolhas · Toxicidade · LRINEC auxilia · Centro + desbridamento" },
    { front: "Gas gangrene × celulite — DD?", back: "Gangrena: Clostridium, crepitação, toxemia · Celulite: mais superficial, progressão menor · Imagem não atrasa cirurgia se óbvio" },
    { front: "Melanoma — Breslow e conduta?", back: "Breslow define margem e estadiamento · Biópsia excisional · Linfonodo sentinela conforme espessura/ulceração" },
    { front: "Margens de melanoma (ideia)?", back: "In situ ~0,5 cm · Finos 1 cm · Mais espessos 2 cm · Protocolos atualizam — conceito cai" },
    { front: "Abscesso × fascite — não errar?", back: "Abscesso: flutuação local · Fascite: toxicidade + dor difusa · Em dúvida grave: explorar" }
  ],
  "crr-mama-tireoide": [
    { front: "Linfonodo sentinela — quando?", back: "Axila clínica negativa no CA invasivo selecionado · Axila positiva: esvaziamento/RT conforme protocolo" },
    { front: "BI-RADS 4 e 5 — conduta?", back: "Biópsia · 5 altamente sugestivo · Não acompanhar como 3" },
    { front: "Tireoidectomia — nervo recorrente e hipopara?", back: "Recorrente: rouquidão / obstrução se bilateral · Paratireoides: hipocalcemia · Identificar e preservar" },
    { front: "Nódulo tireoidiano — quando PAAF?", back: "Critérios de tamanho + ecogenicidade (TI-RADS/ATA) · TSH · Câncer: cirurgia conforme citologia de Bethesda" },
    { front: "CA medular — marcador?", back: "Calcitonina · MEN possíveis · Rastrear familiares / feo antes de operar se MEN2" }
  ]
};

const FILES = [
  "flashcards-cir-lacunas.json",
  "flashcards-cir1.json",
  "flashcards-cir2.json",
  "flashcards-cir3.json",
  "flashcards-ciresp.json",
  "flashcards-cir-r1.json"
];

function apply() {
  let added = 0;
  let touched = 0;
  for (const file of FILES) {
    const full = path.join(__dirname, "..", "data", file);
    const data = JSON.parse(fs.readFileSync(full, "utf8").replace(/^\uFEFF/, ""));
    let fileAdded = 0;
    for (const deck of data) {
      const more = ADD[deck.id];
      if (!more || !more.length) continue;
      const fronts = new Set(deck.cards.map((c) => c.front));
      let n = 0;
      for (const card of more) {
        if (fronts.has(card.front)) continue;
        deck.cards.push(card);
        fronts.add(card.front);
        n++;
      }
      if (n) {
        fileAdded += n;
        touched++;
      }
    }
    if (fileAdded) {
      fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
      console.log(file, "+", fileAdded);
      added += fileAdded;
    }
  }
  console.log("TOTAL +", added, "cards · decks touched", touched);
}

apply();
