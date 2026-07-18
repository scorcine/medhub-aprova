/**
 * Flashcards Infectologia · Inf1 (parasitoses + esquistossomose)
 * Fonte: D:\MedHub R1\CM\Infectologia\Inf1.pdf
 * Prefixo: infc- · specialty: clinica · area: infectologia
 * Nota: pediatria já usa inf- (dengue/sepse) — não colidir.
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "infc-amebiase",
    name: "Amebíase · histolytica · abscesso",
    specialty: "clinica",
    cards: [
      { front: "Agente da amebíase invasiva?", back: "Entamoeba histolytica · “histolítica” = destruidora de tecidos · E. dispar / E. moshkovskii: morfologicamente idênticas, NÃO patogênicas" },
      { front: "Formas do ciclo da E. histolytica?", back: "Cisto (infectante, resistente no meio) · Trofozoíto (forma invasiva na mucosa)" },
      { front: "Transmissão da amebíase?", back: "Fecal-oral — água/alimentos com cistos · Países em desenvolvimento / saneamento precário" },
      { front: "Formas clínicas da amebíase?", back: "Intestinal: aguda (disenteria), crônica, ameboma · Extraintestinal: abscesso hepático (± pulmonar/cerebral)" },
      { front: "Abscesso hepático amebiano — sexo?", back: "Muito mais em homens (~7:1) · Complemento feminino mais eficiente na lise de trofozoítos (apostila)" },
      { front: "Incubação típica da amebíase?", back: "2–6 semanas após ingestão dos cistos" },
      { front: "Disenteria amebiana × bacilar — pista?", back: "Amebiana: fezes com sangue/muco, dor, tenesmo · Poucos leucócitos (≠ shigelose com PMN abundantes)" },
      { front: "Tratamento da amebíase invasiva (ideia)?", back: "1º tecidual: metronidazol ou tinidazol · Depois SEMPRE agente intraluminal (erradicar cistos)" },
      { front: "Agentes intraluminais (Brasil)?", back: "1ª: teclozan (Falmonox) 100 mg VO 3×/d × 5d · 2ª: etofamida (Kitnos) · Exterior: diloxanida, iodoquinol, paromomicina" },
      { front: "Abscesso hepático — responde a droga?", back: "Sim — ~90% melhoram em 72h com terapia isolada (mesmo tamanho grande) · Mesmas doses do tratamento tecidual + luminal" },
      { front: "Quando drenar abscesso amebiano?", back: "(1) Excluir piogênico · (2) Sem resposta clínica em ~4 dias · (3) Ameaça de ruptura (crescimento, lobo E, risco pericárdico)" },
      { front: "Diagnóstico laboratorial da amebíase?", back: "EPF (cistos/trofozoítos) · Abscesso: sorologia + imagem · Punção: “pasta de anchova” clássica" }
    ]
  },
  {
    id: "infc-giardia",
    name: "Giardíase",
    specialty: "clinica",
    cards: [
      { front: "Agente da giardíase?", back: "Giardia lamblia (intestinalis/duodenalis) — flagelado (Mastigophora)" },
      { front: "Transmissão da Giardia?", back: "Fecal-oral · Água · Creches · Viajantes · Homossexuais · Cistos altamente infectantes" },
      { front: "Onde a Giardia se adere?", back: "Duodeno/jejuno proximal — não invade profundamente a mucosa" },
      { front: "Quadro clínico típico da giardíase?", back: "Diarreia aquosa · Flatulência · Empachamento · Esteatorréia / má absorção · Pode cronificar" },
      { front: "Diagnóstico da Giardia?", back: "EPF (cistos; múltiplas amostras) · Antígeno fecal · Aspirado duodenal / string test se EPF negativo e alta suspeita" },
      { front: "Tratamento de 1ª linha da giardíase?", back: "Metronidazol · Alternativas: tinidazol (dose única), nitazoxanida, furazolidona" },
      { front: "Giardia × ameba — mensagem R1?", back: "Giardia = má absorção/gases sem disenteria clássica · Ameba = disenteria ± abscesso hepático" }
    ]
  },
  {
    id: "infc-ascaris",
    name: "Ascaridíase · Loeffler",
    specialty: "clinica",
    cards: [
      { front: "Agente da ascaridíase?", back: "Ascaris lumbricoides — “lombriga” · Maior nematodo intestinal humano" },
      { front: "Ciclo do Ascaris — marca?", back: "Ciclo pulmonar de Loss → síndrome eosinofílica de Loeffler" },
      { front: "Loeffler — o que é?", back: "Infiltrados pulmonares transitórios + eosinofilia + tosse/sibilos na passagem larvária pelo pulmão" },
      { front: "Complicações mecânicas do Ascaris?", back: "Obstrução intestinal (emaranhado) · Migração biliar/pancreática · Apendicite · Perfuração rara" },
      { front: "Tratamento não complicado do Ascaris?", back: "Albendazol 400 mg VO dose única · Mebendazol 100 mg 2×/d × 3d · Alternativas: ivermectina, levamisol, pirantel" },
      { front: "Obstrução por Ascaris — conduta inicial?", back: "Internar · Jejum · SNG · Óleo mineral · Aguardar desenovelamento · Cirurgia se falha/sofrimento de alça" },
      { front: "Quando iniciar anti-helmíntico na obstrução?", back: "APÓS alívio/expulsão dos vermes — albendazol depois do desenovelamento" },
      { front: "Produção de ovos do Ascaris?", back: "~200.000 ovos/dia por fêmea · Vida média do adulto ~12 meses" },
      { front: "Ascaris na gestação — cuidado?", back: "Evitar albendazol/mebendazol no 1º trimestre · Preferir pirantel quando necessário (apostila)" }
    ]
  },
  {
    id: "infc-ancilostoma",
    name: "Ancilostomíase",
    specialty: "clinica",
    cards: [
      { front: "Agentes da ancilostomíase?", back: "Ancylostoma duodenale e Necator americanus" },
      { front: "Transmissão clássica?", back: "Penetração cutânea de larva filarioide (solo) · A. duodenale também pode infectar por via oral" },
      { front: "Complicação hematológica clássica?", back: "Anemia ferropriva (microcítica hipocrômica) por espoliação crônica de sangue" },
      { front: "Outros achados da ancilostomíase crônica?", back: "Hipoalbuminemia · Desnutrição · Anasarca · ± síndrome disabsortiva · Atraso de desenvolvimento na criança" },
      { front: "Eosinofilia na ancilostomíase?", back: "Leve a moderada — importante, mas NÃO obrigatória" },
      { front: "Quadro agudo possível?", back: "Gastroenterite: náuseas, vômitos, diarreia, dor, flatulência · Erupção pruriginosa no ponto de penetração (larva currens-like)" },
      { front: "Tratamento da ancilostomíase?", back: "Albendazol 400 mg dose única · Mebendazol × 3 dias · Reposição de ferro se anemia" },
      { front: "Ancilostoma × Ascaris — yield?", back: "Ancilostoma = anemia ferropriva · Ascaris = Loeffler + obstrução mecânica" }
    ]
  },
  {
    id: "infc-strongyloides",
    name: "Estrongiloidíase · hiperinfecção",
    specialty: "clinica",
    cards: [
      { front: "Agente da estrongiloidíase?", back: "Strongyloides stercoralis" },
      { front: "Particularidade do ciclo do Strongyloides?", back: "Autoinfecção — larva rabditoide vira filarioide no intestino → reinfecta sem sair do hospedeiro" },
      { front: "Fator de risco #1 para hiperinfecção?", back: "Corticosteroide em alta dose · Também: desnutrição, alcoolismo, neoplasias · ~13% sem fator conhecido" },
      { front: "Hiperinfecção — quadro?", back: "Febre · Dor abdominal · Diarreia · Infiltrados pulmonares · Leucocitose com desvio · Pode evoluir a peritonite/meningite" },
      { front: "Sepse na hiperinfecção — germe?", back: "Bacteremia por Gram-negativos entéricos (translocação com as larvas) ± meningite" },
      { front: "Diagnóstico do Strongyloides?", back: "Larvas nas fezes (Baermann, ágar) · EPF convencional tem baixa sensibilidade · Sorologia auxiliar" },
      { front: "Tratamento de escolha?", back: "Ivermectina 200 mcg/kg VO (1–2 dias; esquemas prolongados na hiperinfecção) · Alternativa: albendazol" },
      { front: "Antes de corticoide prolongado em área endêmica?", back: "Rastrear/tratar Strongyloides — prevenir síndrome de hiperinfecção" },
      { front: "Strongyloides × Ascaris no pulmão?", back: "Ambos fazem ciclo pulmonar · Strongyloides = autoinfecção + hiperinfecção imunossuprimido" }
    ]
  },
  {
    id: "infc-oxiuro-tricuris",
    name: "Enterobíase · tricuríase",
    specialty: "clinica",
    cards: [
      { front: "Agente da enterobíase (oxiuríase)?", back: "Enterobius vermicularis — “oxiúro” · Verme do prurido anal" },
      { front: "Sinal clássico da enterobíase?", back: "Prurido anal noturno (calor do corpo acamado ativa as fêmeas) · Irritabilidade · Sono ruim" },
      { front: "Diagnóstico da enterobíase?", back: "Teste da fita adesiva (Graham) pela manhã · EPF pouco sensível (ovos depositados na região perianal)" },
      { front: "Complicação ginecológica da enterobíase?", back: "Migração errática → vulvovaginite / prurido genital em meninas" },
      { front: "Tratamento da enterobíase?", back: "Albendazol ou mebendazol · Tratar conviventes · Repetir em 2–3 semanas (ovos no ambiente)" },
      { front: "Agente da tricuríase?", back: "Trichuris trichiura — “tricocéfalo”" },
      { front: "Tricuríase intensa na criança — clássico?", back: "Diarreia sanguinolenta · Anemia · Prolapso retal" },
      { front: "Tratamento da tricuríase?", back: "Albendazol ou mebendazol (esquemas de 3 dias costumam ser melhores que dose única)" }
    ]
  },
  {
    id: "infc-tenias",
    name: "Teníase · cisticercose",
    specialty: "clinica",
    cards: [
      { front: "Agentes da teníase?", back: "Taenia solium (porco) e Taenia saginata (boi) — cestoides" },
      { front: "T. solium × T. saginata — chave?", back: "Ambas causam teníase intestinal · Só T. solium causa cisticercose humana (ovos)" },
      { front: "Como se pega teníase?", back: "Ingestão de carne mal passada com cisticercos (larva) · Hospedeiro definitivo = homem" },
      { front: "Como se pega neurocisticercose?", back: "Ingestão de ovos de T. solium (fecal-oral / autoinfecção) — NÃO é carne de porco com cisticerco" },
      { front: "Tratamento da teníase intestinal?", back: "1ª: praziquantel 5–10 mg/kg (máx 600 mg) dose única · Alternativas: niclosamida, mebendazol, albendazol" },
      { front: "Quando tratar neurocisticercose com antiparasitário?", back: "Lesões viáveis ou em degeneração na imagem · Independentemente da localização (apostila)" },
      { front: "Quando NÃO dar antiparasitário na NCC?", back: "Hidrocefalia não tratada · Encefalite cisticercal (alta carga + edema difuso) · Só lesões calcificadas" },
      { front: "Drogas na neurocisticercose?", back: "Albendazol (± praziquantel) + corticosteroide para edema · Anticonvulsivante se crises" },
      { front: "Yield de prova — solium?", back: "Carne de porco → teníase · Ovos → cisticercose/NCC · Saginata não faz cisticercose humana" }
    ]
  },
  {
    id: "infc-toxocara",
    name: "Toxocaríase · larva migrans",
    specialty: "clinica",
    cards: [
      { front: "Agentes da toxocaríase?", back: "Toxocara canis (cão) e Toxocara cati (gato) — larva migrans visceral/ocular" },
      { front: "Quem mais pega toxocaríase?", back: "Crianças com geofagia / contato com solo contaminado por fezes de cães/gatos" },
      { front: "Larva migrans visceral — quadro?", back: "Febre · Hepatomegalia · Eosinofilia intensa · ± sintomas pulmonares/GI · Larvas não completam ciclo no homem" },
      { front: "Larva migrans ocular — ideia?", back: "Lesão unilateral · Pode mimetizar retinoblastoma · Eosinofilia periférica pode ser discreta" },
      { front: "Diagnóstico da toxocaríase?", back: "Clínica + eosinofilia + sorologia (ELISA) · Biópsia rara" },
      { front: "Tratamento da toxocaríase?", back: "Albendazol (± corticoide se inflamação intensa / ocular)" },
      { front: "Larva migrans cutânea × visceral?", back: "Cutânea clássica: Ancylostoma braziliense (cão/gato) — trajeto serpiginoso · Visceral: Toxocara" }
    ]
  },
  {
    id: "infc-esquisto",
    name: "Esquistossomose mansoni",
    specialty: "clinica",
    cards: [
      { front: "Agente da esquistossomose no Brasil?", back: "Schistosoma mansoni · Hospedeiro intermediário: caramujo Biomphalaria (glabrata, tenagophila, straminea)" },
      { front: "Onde vivem os vermes adultos?", back: "Sistema venoso mesentérico (homem = hospedeiro definitivo)" },
      { front: "Forma infectante para o homem?", back: "Cercária (água doce) → penetra a pele → esquistossômulo" },
      { front: "Dermatite cercariana?", back: "Prurido / “coceira do nadador” na penetração das cercárias" },
      { front: "Síndrome de Katayama?", back: "Fase aguda: febre, urticária, eosinofilia, tosse, hepatoesplenomegalia — resposta a antígenos do parasita" },
      { front: "Fibrose de Symmers — o que é?", back: "Fibrose periportal nodular (“pipe-stem”) · Hepatomegalia endurecida, lobo E frequentemente predominante" },
      { front: "Hipertensão porta na esquistossomose?", back: "Intra-hepática pré-sinusoidal · Varizes esofagianas · Esplenomegalia congestiva · Função hepática relativamente preservada cedo" },
      { front: "Diagnóstico parasitológico?", back: "EPF com Kato-Katz (quantifica ovos) · Biópsia retal se EPF negativo e alta suspeita" },
      { front: "Tratamento de escolha?", back: "Praziquantel 40 mg/kg VO dose única · Cura 80–90% · Preferencial (age nas 3 espécies humanas)" },
      { front: "Alternativa ao praziquantel?", back: "Oxamniquina — opção quando praziquantel indisponível/falha (apostila)" },
      { front: "Fase em que o praziquantel serve?", back: "Todas as fases da doença (apostila) — droga preferencial" },
      { front: "Mapa R1 da esquistossomose?", back: "Biomphalaria + cercária · Katayama agudo · Symmers + HTP pré-sinusoidal · Praziquantel 40 mg/kg" }
    ]
  },
  {
    id: "infc-parasito-mapa",
    name: "Mapa · parasitoses Inf1",
    specialty: "clinica",
    cards: [
      { front: "Quem faz ciclo pulmonar (Loss)?", back: "Ascaris · Strongyloides · Ancilostomídeos — Loeffler possível" },
      { front: "Quem faz autoinfecção?", back: "Strongyloides (clássico) · Enterobius (ovos perianais) · T. solium (ovos → cisticercose)" },
      { front: "Anemia ferropriva → pensar?", back: "Ancilostomíase (espoliação) · Também tricuríase intensa" },
      { front: "Prurido anal noturno →?", back: "Enterobius · Graham (fita adesiva)" },
      { front: "Antes de corticoide → rastrear?", back: "Strongyloides — hiperinfecção / sepse Gram-neg" },
      { front: "Abscesso hepático + disenteria →?", back: "Amebíase · Metro/tini + intraluminal · Drenar só em critérios" },
      { front: "HTP com função hepática ok + endemia →?", back: "Esquistossomose (Symmers) · Praziquantel" },
      { front: "Carne de porco × ovos de solium?", back: "Carne (cisticerco) = teníase · Ovos = neurocisticercose" },
      { front: "Drogas-chave deste bloco?", back: "Metro/tini (+ luminal) · Albendazol · Ivermectina · Praziquantel · Teclozan/etofamida" },
      { front: "Prioridade de bancas (Inf1)?", back: "Strongyloides/hiperinfecção · Esquistossomose/Symmers · Ascaris/Loeffler · Ameba/abscesso · NCC (solium)" }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-infecto.json");
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
