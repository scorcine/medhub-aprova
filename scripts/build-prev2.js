/**
 * Flashcards Preventiva · Prev2
 * Fonte: data/_extract_prev/snips-prev2/ e Prev2-full.txt
 */
const fs = require("fs");
const path = require("path");

const deck = (id, name, cards) => ({
  id,
  name,
  specialty: "preventiva",
  cards: cards.map(([front, back]) => ({ front, back }))
});

const decks = [
  deck("pepi-desenhos", "Desenhos epidemiológicos · coorte · caso-controle · transversal · ecológico · ensaio · metanálise", [
    ["Como classificar estudos pelo objetivo?", "Descritivos · investigam frequência e distribuição do agravo · Analíticos · investigam associação entre fatores de risco e agravo · Exemplos analíticos: caso-controle, coorte e ensaios clínicos"],
    ["Dados individuado × agregado?", "Individuado · cada variável registrada por indivíduo · distingue sadios e doentes entre expostos e não expostos · Agregado · variáveis registradas para grupos · unidade geográfica · não distingue indivíduos dentro do grupo"],
    ["Observacional × intervenção?", "Observacional · sem manipulação do fator · apenas observação · Intervenção · há manipulação (medicamento, vacina etc.) · Ensaio = intervenção · não existe estudo de intervenção transversal"],
    ["Transversal × longitudinal?", "Transversal · exposição e desfecho no mesmo momento · retrato pontual · Longitudinal · acompanhamento em mais de um momento · Prospectivo · exposição primeiro, desfecho depois · Retrospectivo · doença primeiro, exposição no passado"],
    ["Estudo transversal pode ser analítico?", "Segundo Rouquayrol (Epidemiologia & Saúde) · NÃO · não testa hipóteses · Apesar disso, pode avaliar associações, mas com limitação de causalidade reversa"],
    ["O que é estudo de coorte?", "Agrupa indivíduos sem o desfecho · classifica exposições no início · acompanha no tempo · compara risco de doença entre expostos e não expostos · Fluxo: risco → doença"],
    ["Coorte · características centrais?", "Prospectivo ou retrospectivo (histórico/não concorrente) · longitudinal · analítico · unidade = indivíduo · Exposição precede o desfecho · Fortalece inferência causal · Permite incidência, fatores de risco e prognóstico"],
    ["Coorte · vantagens principais?", "Planejamento preciso · menor risco de conclusões falsas · expostos e não expostos conhecidos antes do desfecho · melhor método para incidência e história natural · vários desfechos · excelente para fatores de risco raros"],
    ["Coorte · desvantagens principais?", "Caro e demorado · péssimo para doenças raras · difícil reproduzir · perdas de seguimento (drop out) · sujeito a vieses de confusão · exige excluir doentes no início"],
    ["O que é estudo caso-controle?", "Parte do efeito (agravo) para elucidar causas (fatores de risco) · seleciona casos e controles · avalia exposição passada retrospectivamente · Fluxo: doença → risco"],
    ["Caso-controle · vantagens?", "Fácil, rápido e barato · fácil de repetir · ideal para doenças raras · permite analisar vários fatores de risco · Nested case-control · casos e controles de coorte prévia · maior comparabilidade"],
    ["Caso-controle · desvantagens e vieses?", "Dificuldade na seleção de controles · documentação incompleta · uma única doença · Vieses de seleção · Vieses de memória e de medição (retrospectivo) · Ocultamento reduz viés de aferição"],
    ["Estudo transversal · características?", "Avalia exposição e doença no mesmo momento · pode ser descritivo (levantamento) ou comparado · mede prevalência, não incidência · útil para hipóteses e prática clínica comunitária"],
    ["Causalidade reversa no transversal?", "Exposição e doença medidas simultaneamente · impossível saber o que veio primeiro · doença pode ter modificado a exposição · limita inferência causal"],
    ["Transversal · vantagens e desvantagens?", "Vantagens · fácil, rápido, barato · boa fonte de hipóteses · ótimo para prevalências · Desvantagens · causalidade reversa · desconhece ação passada dos fatores · impossível testar hipóteses (Rouquayrol)"],
    ["Estudo ecológico · unidade de análise?", "População/grupo · não o indivíduo · medidas agregadas (ex.: mortalidade infantil × renda per capita por município) · gera hipóteses para estudos analíticos"],
    ["Falácia ecológica?", "Inferir causalidade no indivíduo a partir de associação entre grupos · exposição no grupo não garante que doentes sejam os expostos · heterogeneidade interna dos grupos · Ex.: Durkheim · suicídio × religião por província"],
    ["Ecológico · vantagens e desvantagens?", "Vantagens · fácil · baixo custo · simplicidade analítica · gera hipóteses · Série temporal = ecológico em vários momentos · Desvantagens · baixo poder analítico · falácia ecológica"],
    ["Ensaio clínico · o que é?", "Intervenção controlada · compara nova terapia com controle (placebo ou melhor terapia disponível) · randomização garante comparabilidade · estrutura semelhante à coorte · unidade = indivíduo · Fluxo: intervenção → desfecho"],
    ["Cegamento no ensaio clínico?", "Simples-cego · só participante ignora o grupo · Duplo-cego · participante e pesquisador · Triplo-cego · também quem analisa exames/dados · Aberto · todos conhecem a alocação · Mascaramento reduz vieses de seleção e aferição"],
    ["Ensaio clínico · padrão-ouro?", "ECR duplo-cego · melhor evidência de eficácia · base para justificar tratamentos · Efeitos não específicos · Hawthorne (mudança por ser observado) · Placebo"],
    ["Ensaio clínico · problemas operacionais?", "Não aderência · drop out · crossover · impossibilidade de cegamento em alguns casos · alta seleção de participantes · validade interna ↑ · generalização ↓ · mede eficácia no grupo, não em cada indivíduo"],
    ["O que é metanálise?", "Síntese quantitativa de vários estudos sobre mesma questão · unidade de análise = os estudos · combina medidas de associação (geralmente RR) · identifica convergências e discordâncias · RS quantitativa = metanálise"],
    ["Forest plot · elementos?", "Coluna esquerda · estudos incluídos · Coluna direita · medidas de associação · Eixo horizontal · valores crescentes da medida · Linha vertical · valor unitário (1 = sem associação) · Caixas · medida e peso do estudo · Losango · resultado sumário ponderado"],
    ["Metanálise · vantagens e limitações?", "Vantagens · síntese de muitos trabalhos · analisa diferenças metodológicas · rápida e barata · Desvantagens · controvérsias metodológicas · estudos ruins não são compensados · intuito meramente descritivo tem valor limitado"],
    ["Relato e série de casos · o que são?", "Estudos descritivos literais · descrevem evolução de casos, em geral raros · Relato: cerca de 1–10 casos · Série: > 10 casos · Geram hipótese, não confirmam associação"],
    ["Fase I de ensaio clínico?", "Primeiros ensaios em humanos com nova substância · Geralmente 20–80 voluntários sãos · Objetivo: segurança preliminar e perfil farmacocinético/farmacodinâmico · Não avalia eficácia"],
    ["Fase II de ensaio clínico?", "Pesquisa terapêutica piloto · 100–300 pacientes · Acompanhamento intenso · Objetivo: eficácia e segurança em curto prazo e melhor dose · Começam estudos controlados"],
    ["Fase III de ensaio clínico?", "Pesquisa terapêutica ampliada · 300–1.000 voluntários, grupos variados · Objetivo: eficácia e segurança em curto e longo prazo · Valor terapêutico absoluto e relativo · Investigação mais extensa e rigorosa"],
    ["Fase IV de ensaio clínico?", "Pós-comercialização / farmacovigilância · Pode usar inquéritos, caso-controle ou coorte · Detectar reações adversas raras, efeitos em longo prazo e uso em populações não estudadas nas fases prévias"]
  ]),

  deck("pepi-associacao", "Medidas de associação · RR · OR · RP · risco atribuível", [
    ["Risco Relativo (RR) · definição?", "Razão de riscos/incidências cumulativas · expostos ÷ não expostos · Responde: quantas vezes mais provável é adoecer entre expostos?"],
    ["O que é incidência cumulativa no cálculo do RR/RA?", "Proporção de novos casos no período entre os sob risco · IE = incidência nos expostos · INE = incidência nos não expostos · Base do RR (IE/INE) e do RA (IE − INE)"],
    ["RR · interpretação?", "RR = 1 · sem associação · RR > 1 · fator de risco · RR < 1 · fator de proteção · Confirmar com IC 95% · IC não deve incluir 1 para inferência"],
    ["RR · em quais estudos?", "Coorte · ensaio clínico · Estudos longitudinais prospectivos · incidência em expostos (IE) ÷ incidência em não expostos (INE)"],
    ["Odds Ratio (OR) · definição?", "Razão dos produtos cruzados (ad/bc) · odds de exposição nos casos ÷ odds nos controles · Estimativa do risco relativo"],
    ["OR · interpretação?", "OR = 1 · sem associação · OR > 1 · exposição mais frequente nos casos · fator de risco · OR < 1 · exposição mais frequente nos controles · fator de proteção · Confirmar com IC"],
    ["OR · em quais estudos?", "Principal medida do caso-controle · também usável em coortes · Quanto mais rara a doença · OR ≈ RR · Doenças raras em caso-controle · OR e RR equivalentes"],
    ["Caso-controle · o que NÃO se calcula diretamente?", "Taxas de incidência · Risco Atribuível (RA) direto · Usa OR no lugar do RR · RAP% via fórmula de Levin (F = proporção exposta na população)"],
    ["Risco Atribuível (RA) · definição?", "Diferença de incidências · IE − INE · Risco adicional de adoecer por causa da exposição · Medida de coorte/ensaio · Ex.: RA 12,63% · dos 14 casos/100 expostos, 12 pelo fator"],
    ["RAP% · definição?", "Risco Atribuível na População · medida de impacto · proporção de doença atribuível à exposição · doença eliminável se remover a exposição · Coorte: fórmula própria · Caso-controle: Levin com OR e F"],
    ["Razão de Prevalência (RP) · definição?", "Prevalência em expostos ÷ prevalência em não expostos · Quantas vezes mais doentes estão entre expostos · Medida característica do estudo transversal"],
    ["RP · fórmula na tabela 2×2?", "RP = (a/(a+b)) / (c/(c+d)) · PE = prevalência expostos · PNE = prevalência não expostos · Confirmar com IC como no RR"],
    ["Medida por tipo de estudo · resumo?", "Coorte/ensaio · RR, RA, RAP% · Caso-controle · OR (+ RAP% por Levin) · Transversal · RP · Ensaio clínico · RR, RRR, RAR, NNT"],
    ["Redução do Risco Relativo (RRR)?", "RRR = 1 − RR · complemento do RR · expressa em % · Ex.: RR 0,75 → RRR 25% · risco relativo 25% menor no tratamento"],
    ["Redução Absoluta do Risco (RAR)?", "RAR = X − Y · diferença absoluta de incidência · controle (X) menos experimental (Y) · Ex.: 20% − 15% = 5% · benefício absoluto da intervenção"],
    ["NNT · definição e cálculo?", "Número Necessário ao Tratamento · quantos tratar para evitar 1 desfecho negativo · NNT = 1/RAR · Ex.: RAR 0,05 → NNT 20 · traduz benefício clínico do tratamento"],
    ["NND (NNH) · definição?", "Número Necessário ao Dano/Dano · pacientes tratados para 1 apresentar desfecho adverso · NND = 1/(Rt − Rc) · Rt = danos no tratado · Rc = danos no controle"],
    ["IC estreito × RR/OR · confiança?", "Quanto mais estreito o IC · mais confiável/preciso · provável amostra grande · RR 18 com IC (16,7–21,4) > RR 18 com IC (1,4–59,4) · IC amplo incluindo 1 · não confiar"],
    ["Exemplo RP transversal (clamídia)?", "100 mulheres · 50 usaram anticoncepcional oral · 10/50 positivas vs 5/50 sem uso · Prevalência 15% · RP = (10/50)/(5/50) = 2,0 · uso de ACO associado ao dobro da prevalência"]
  ]),

  deck("pepi-estatistica", "Significância estatística · p-valor · IC · teste t · qui-quadrado", [
    ["Objetivo da significância estatística?", "Avaliar se associação se deve ao acaso · Afastar acaso (erro aleatório) e vieses (erro sistemático) · Ferramentas · p-valor e intervalos de confiança"],
    ["Acaso × vieses?", "Acaso · variação aleatória da amostra · contornado aumentando n · Vieses · desviam sistematicamente do valor verdadeiro · seleção · aferição · confusão"],
    ["Duas explicações para diferença entre grupos?", "Causa real (efeito da exposição/intervenção) · Acaso (azar/casualidade) · Estatística quantifica probabilidade do acaso"],
    ["Limite de probabilidade (α)?", "5% (0,05) · se probabilidade > 5% · acaso explica a diferença · Erro alfa (tipo I) · falso-positivo · rejeitar H0 quando é verdadeira"],
    ["Erro beta (tipo II)?", "Aceitar H0 quando é falsa · falso-negativo · fixar em 10% (ou 20%) · Poder do teste = 1 − beta · Ex.: beta 0,10 → poder 0,90 · 90% de detectar associação real"],
    ["Hipótese nula (H0)?", "Não existe diferença entre grupos · tratamento = placebo · teste novo = padrão-ouro · sem associação"],
    ["Hipótese alternativa (H1)?", "Grupos são diferentes · ou um é maior/melhor que outro · quando há expectativa clínica prévia"],
    ["Quando usar alfa baixo vs beta baixo?", "Alfa baixo · evitar falso-positivo · ex.: testar medicamento com riscos · Beta baixo · evitar falso-negativo · ex.: provar segurança ambiental"],
    ["Intervalo de Confiança 95% · ideia?", "Repetir o estudo 100 vezes · em 95 o valor verdadeiro estará no intervalo · IC sem o 1 (RR/OR/RP) · associação estatisticamente significativa · IC inclui 1 · sem confiança na direção"],
    ["IC estreito × amostra?", "IC estreito · mais confiança e precisão · amostra grande · Estudo 2 (RR 10 · IC 9,3–10,8) mais preciso que Estudo 3 (IC 0,6–42,0) · Estudo 3 inclui proteção, nulidade e risco"],
    ["Teste t · quando usar?", "Comparar duas médias · ex.: BMD em fraturados vs não fraturados · usa distribuição t quando desvio-padrão populacional desconhecido"],
    ["Teste t · pressupostos?", "Distribuição normal nos dois grupos · desvios-padrão semelhantes · Calcula probabilidade da diferença observada se H0 for verdadeira"],
    ["Teste qui-quadrado · quando usar?", "Independência de duas variáveis categóricas/nominais · tabela de contingência · não paramétrico · variáveis discretas sem ordem (sexo, cor etc.)"],
    ["Qui-quadrado · interpretação?", "Compara observados (O) vs esperados (E) se H0 verdadeira · Glib = (linhas−1)×(colunas−1) · Calculado ≥ tabelado → rejeita H0 · Calculado < tabelado → aceita H0 · IC de RR/OR/RP derivado do qui-quadrado"],
    ["Viés de seleção?", "Grupos de comparação não semelhantes nas variáveis que determinam o resultado · Subtipos · autosseleção · trabalhador saudável · Berkson · perda seletiva de seguimento · sobrevida seletiva · detecção · temporalidade"],
    ["Viés de confundimento · 3 propriedades do fator?", "1 · fator de risco para doença entre não expostos · 2 · associado à exposição · 3 · não variável intermediária nem consequência do desfecho · Ex.: tabagismo confunde exercício × IAM"],
    ["Validade interna × externa?", "Interna · resultados válidos para a amostra do estudo · ausência de vieses/confundimento · Externa · capacidade de generalizar para população externa"],
    ["Eficácia × efetividade × eficiência?", "Eficácia · efeito sob condições ideais (ECR) · % · Ex.: vacina sarampo 95% · Efetividade · sob condições reais · Eficiência · resultado/recursos e tempo · medida econômica"]
  ]),

  deck("pepi-testes-dx", "Testes diagnósticos · sensibilidade · especificidade · VPP · VPN · acurácia", [
    ["O que é teste diagnóstico?", "Exames laboratoriais · imagem · ou conjunto de sinais/sintomas · Ex.: critérios de Jones · hemoptise + perda ponderal no fumante · Comparado ao padrão-ouro (biópsia, cultura etc.)"],
    ["Sensibilidade · definição?", "Capacidade de identificar verdadeiro-positivos entre doentes · Sens = VP/(VP+FN) = a/(a+c) · Teste sensível · raramente deixa doente passar (poucos FN)"],
    ["Quando preferir teste sensível?", "Doença grave e tratável · triagem/rastreamento · bancos de sangue · FN aceitável se FP não causam trauma · Regra SnNout · sensibilidade alta + negativo → exclui diagnóstico"],
    ["Especificidade · definição?", "Capacidade de identificar verdadeiro-negativos entre sadios · Espec = VN/(VN+FP) = d/(b+d) · Teste específico · raramente classifica sadio como doente (poucos FP)"],
    ["Quando preferir teste específico?", "Doença importante/incurável · confirmação diagnóstica · FP causam trauma psicológico/econômico/social · Regra SpPin · especificidade alta + positivo → confirma diagnóstico"],
    ["Valor Preditivo Positivo (VPP)?", "Dado teste positivo · qual probabilidade de ter a doença? · VPP = VP/(VP+FP) = a/(a+b) · Probabilidade pós-teste positiva"],
    ["Valor Preditivo Negativo (VPN)?", "Dado teste negativo · qual probabilidade de NÃO ter a doença? · VPN = VN/(VN+FN) = d/(c+d) · Probabilidade pós-teste negativa"],
    ["Prevalência e valores preditivos?", "VPP e VPN dependem da prevalência · Sensibilidade e especificidade NÃO dependem da prevalência · Maior prevalência → ↑ VPP e ↓ VPN · Menor prevalência → ↓ VPP e ↑ VPN"],
    ["Baixa prevalência · consequência?", "Mesmo teste específico · muitos FP (muitos sadios na população) · Alta prevalência · mais FN mesmo com boa sensibilidade"],
    ["Acurácia · definição?", "Proporção de acertos · (VP+VN)/N = (a+d)/N · Desejável quando FP e FN têm consequências graves · Doença importante e curável"],
    ["Probabilidade pré-teste?", "Prevalência da doença na população · probabilidade antes do exame · Teste modifica para probabilidade pós-teste (VPP/VPN)"],
    ["Tabela 2×2 · células a, b, c, d?", "a = VP · b = FP · c = FN · d = VN · Doente = a+c · Não doente = b+d · Teste+ = a+b · Teste− = c+d"],
    ["SnNout · regra clínica?", "High Sensitivity · Negative rules Out · Alta sensibilidade · resultado negativo exclui eficazmente o diagnóstico · Ausência exclui doença-alvo"],
    ["SpPin · regra clínica?", "High Specificity · Positive rules In · Alta especificidade · resultado positivo confirma eficazmente o diagnóstico · Presença confirma doença-alvo"],
    ["Escolha do teste disponível?", "Usar o mais preciso entre os acessíceis · padrão-ouro nem sempre disponível (custo/acesso) · precisão = positivo quando doente · negativo quando sadio"],
    ["Exemplo faringite · exame clínico?", "Cultura = padrão-ouro · Sens 0,21 · Espec 0,16 · VPP 0,078 · VPN 0,38 · Acurácia 0,17 · Exame clínico não substitui cultura"],
    ["Exemplo pneumonia · auscultação?", "Raio X = padrão · Sens 0,95 · Espec 0,97 · VPP 0,98 · VPN 0,95 · Acurácia 0,96 · Auscultação com bom desempenho"],
    ["Exemplo PSA · câncer de próstata?", "Toque retal = padrão · Sens 0,15 (muitos FN) · Espec 0,95 · VPP 0,60 · VPN 0,69 · PSA+ confiável · PSA− não exclui bem"],
    ["Por que usar testes múltiplos?", "A maioria dos testes não tem 100% de sensibilidade e especificidade · Um único exame raramente confirma ou afasta sozinho · Combinam-se vários testes em paralelo ou em série"],
    ["Testes em paralelo · definição e efeito?", "Vários testes ao mesmo tempo · Qualquer positivo indica o diagnóstico · ↑ sensibilidade e ↑ VPN · ↓ especificidade e ↓ VPP · Útil quando se precisa de avaliação rápida (ex.: hospitalizados/emergência)"],
    ["Testes em série · definição e efeito?", "Testes consecutivos · Todos devem ser positivos para confirmar · Um negativo invalida o diagnóstico · ↑ especificidade e ↑ VPP · ↓ sensibilidade e ↓ VPN · Útil quando falta exame de alta especificidade isolado"]
  ]),

  deck("pepi-roc-lr", "Curva ROC · cutoff · razões de verossimilhança · RVP · RVN", [
    ["Curva ROC · o que representa?", "Receiver Operating Characteristic · relação entre sensibilidade e especificidade · trade-off antagônico · difícil maximizar ambas simultaneamente"],
    ["Como construir curva ROC?", "Diagrama sensibilidade (eixo vertical) × especificidade (eixo horizontal) · para vários valores de cut off point · cada ponto = par sens/esp de um corte"],
    ["Cut off point (ponto de corte)?", "Valor discriminatório em teste quantitativo contínuo · transforma variável contínua em dicotômica (doente/não doente) · Ex.: glicemia de jejum · alterar corte muda sens e espec"],
    ["ROC · ponto ótimo?", "Mais próximo do canto superior esquerdo · maior otimização sensibilidade × especificidade · escolha depende do objetivo · rastrear → ↑ sens · confirmar → ↑ espec"],
    ["Área sob curva ROC?", "Proporcional à acurácia do teste · quanto mais próxima do canto superior esquerdo · melhor o teste · compara testes · maior área = maior exatidão"],
    ["ROC · escolha do corte clínico?", "Ponto 1 · melhor equilíbrio sens+esp · Ponto 2 · ↑ sens · ↓ espec · Ponto 3 · ↑ espec · ↓ sens · Intenção clínica define o cut off"],
    ["Razão de verossimilhança · vantagens?", "Descrevem desempenho do teste · resumo sens+esp · menos afetadas pela prevalência que VPP/VPN · úteis em testes numéricos com vários cortes · calculam probabilidade pós-teste"],
    ["Chances × probabilidade?", "Probabilidade · proporção com característica · usada em sens/esp/VPP/VPN · Chances · razão de duas probabilidades · RV expressa em chances · interconvertíveis"],
    ["RVP · fórmula?", "Razão de Verossimilhança Positiva · RVP = sensibilidade / (1 − especificidade) · ou (a/(a+c)) / (b/(b+d))"],
    ["RVP · interpretação?", "Quanto maior · melhor o teste · deve ser >> 1 · resultado positivo mais provável em doente (VP) que em sadio (FP) · aumenta chance da doença após teste+"],
    ["RVN · fórmula?", "Razão de Verossimilhança Negativa · RVN = (1 − sensibilidade) / especificidade · ou (c/(a+c)) / (d/(d+b))"],
    ["RVN · interpretação?", "Quanto menor · melhor · ideal próximo de 0 · resultado negativo mais provável em sadio (VN) que em doente (FN) · reduz chance da doença após teste−"],
    ["Exemplo teste rápido estreptococo?", "Prevalência 12% · Sens 95,45% · Espec 96,25% · VPP 77,78% · VPN 99,35% · RVP 25,3 · RVN 0,05 · teste+ aumenta chance em 25× · teste− praticamente exclui"],
    ["RV vs sensibilidade/especificidade isoladas?", "RV resume o mesmo tipo de informação · permite atualizar probabilidade pré-teste (prevalência) para pós-teste · menos dependente da prevalência"],
    ["Teste sensível × específico · mnemônicos?", "SnNout · sensibilidade alta · negativo exclui · RVN baixa reforça · SpPin · especificidade alta · positivo confirma · RVP alta reforça · combinar com prevalência para VPP/VPN"],
    ["Paralelo × série · resumo de desempenho?", "Paralelo: sensibilidade alta · VPN alto · especificidade baixa · VPP baixo · Série: especificidade alta · VPP alto · sensibilidade baixa · VPN baixo"],
    ["RVP alta · efeito na probabilidade pós-teste?", "Quanto maior a RVP · mais o teste+ aumenta a chance de doença · Deve ser >> 1 · Exemplo estreptococo: RVP 25,3 ≈ aumenta chance em 25× após positivo"],
    ["RVN baixa · efeito na probabilidade pós-teste?", "Quanto menor a RVN · mais o teste− reduz a chance de doença · Ideal próximo de 0 · Exemplo estreptococo: RVN 0,05 · negativo praticamente exclui"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-prev2.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
const cards = decks.reduce((n, d) => n + d.cards.length, 0);
console.log("wrote", out, "·", decks.length, "decks ·", cards, "cards");
decks.forEach((d) => console.log(" ", d.id, "·", d.cards.length));
