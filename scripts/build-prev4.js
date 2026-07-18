/**
 * Flashcards Preventiva · Prev4 — Indicadores de Saúde
 * Fonte: data/_extract_prev/Prev4-full.txt e snips-prev4/
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
  deck("pind-conceitos", "Indicadores · conceitos · qualidade · absolutos vs relativos", [
    ["O que são indicadores de saúde?", "Medidas com informações relevantes sobre como anda o sistema de saúde · Matéria-prima essencial para a análise de saúde"],
    ["Por que a epidemiologia mede saúde indiretamente?", "Medir saúde exatamente é difícil · Opta por medir pela não saúde: ocorrência de doenças e mortes"],
    ["O que os indicadores de saúde permitem?", "Avaliar o estado de saúde da população · Melhorar, manter ou prevenir doenças · Planejar, avaliar e administrar ações de saúde"],
    ["Quem produz e utiliza indicadores de saúde no Brasil?", "SUS (3 níveis) · IBGE · Instituições de ensino e pesquisa · ONGs · Setores públicos com dados de interesse à saúde · Associações técnico-científicas"],
    ["O que é a RIPSA?", "Rede Interagencial de Informações para a Saúde · Criada em 1996 (MS + OPAS) · Unifica dados de saúde, econômicos e sociais de ~40 instituições"],
    ["O que é a Matriz de Indicadores Básicos?", "Instrumento para elaboração dos IDB (Indicadores de Dados Básicos) · Produto final da RIPSA, base das análises e tendências da saúde"],
    ["Quais são os atributos de qualidade de um indicador?", "Propriedades dos componentes · Precisão do sistema de informação · Validade · Confiabilidade · Mensurabilidade · Relevância · Custo-efetividade"],
    ["O que são valores absolutos?", "Indicadores com valores numéricos absolutos (ex.: nº de casos de aids, nº de gestantes) · Traduzem realidade restrita e pontual"],
    ["Limitação dos valores absolutos?", "Não permitem comparações temporais, geográficas nem avaliação da importância relativa de um fato ou evento"],
    ["Utilidade dos valores absolutos?", "Administrar recursos nos serviços de saúde · Ex.: número de leitos necessários e quantidade de medicamentos"],
    ["Exemplo de uso de valor absoluto (vacina antissarampo)?", "Comunidade 20.000 hab., 10% com 1–4 anos = 2.000 crianças · Campanha em massa exige 2.000 doses"],
    ["O que são valores relativos?", "Indicadores construídos pela relação entre dois fatos ou eventos · Permitem comparações e levantamento de prioridades"],
    ["Para comparar dados de saúde entre realidades, o que é necessário?", "Padronização · Nos dados de saúde pode ser por coeficientes ou índices"],
    ["O que são coeficientes (Prev4)?", "Medem risco ou probabilidade de adoecer ou morrer em local e ano · Unidade do numerador difere da do denominador · Vários autores usam “taxa” como sinônimo"],
    ["O que são índices (Prev4)?", "Proporções: subconjunto (numerador) ÷ conjunto (denominador), mesmas unidades · Expressos em percentual · Apontam frequência e proporcionalidade das doenças"],
    ["Por que medir saúde é complicado (mensagem da apostila)?", "Não existe um único indicador da qualidade de vida · Componentes sugeridos: saúde, demografia, alimentação, trabalho, transporte…"]
  ]),

  deck("pind-demografia", "Perfil demográfico · pirâmide · esperança de vida · urbanização", [
    ["Fatores do perfil demográfico brasileiro?", "Redução da mortalidade infantil · Queda da fecundidade · Aumento da expectativa de vida · Desde pós-guerra, mais marcante nas últimas 3 décadas"],
    ["O que é a transição demográfica?", "Mudança da estrutura etária decorrente de alterações em fecundidade, natalidade e mortalidade · No Brasil: queda da fecundidade e da mortalidade geral"],
    ["Quatro fases da transição demográfica?", "Pré-industrial (natalidade e mortalidade altas) · Divergência (natalidade alta, mortalidade cai → explosão populacional) · Convergência (natalidade cai mais → envelhecimento) · Pós-transição (coeficientes baixos, fecundidade próxima da reposição)"],
    ["Transição demográfica × transição epidemiológica?", "Demográfica = estrutura etária · Epidemiológica = mudanças em mortalidade, morbidade e invalidez (DTN, causas externas, carga nos idosos, morbidade dominante)"],
    ["Sobremortalidade masculina no Brasil?", "Homens “morrem mais” em todas as faixas etárias · Principalmente por altos índices de mortalidade por causas externas · 2019: ~96 homens para cada 100 mulheres"],
    ["O que as pirâmides etárias permitem acompanhar?", "Evolução da população por sexo e idade · Alterações: menor proporção de crianças, maior população em idade ativa, proporção crescente de idosos"],
    ["Dado projetado 2020 — maior faixa etária brasileira?", "20–29 anos (~16%) · Envelhecimento: esperava-se > 700 mil pessoas com mais de 90 anos"],
    ["Urbanização no Brasil — padrão regional?", "Concentração mais acentuada no Sudeste, Centro-Oeste e Sul · Norte e Nordeste: menor concentração urbana · Crescimento mais acelerado no Norte e Nordeste"],
    ["Grau de urbanização brasileiro (IBGE)?", "Cerca de 85% da população vive na zona urbana"],
    ["População brasileira estimada em 2022?", "215.131.352 pessoas · Distribuição: ~9% Norte, 27% Nordeste, 42% Sudeste, 14% Sul, 8% Centro-Oeste"],
    ["Taxa de crescimento populacional brasileira?", "2001–2010: 1,17% · 2015: 0,83% · Estimativa 2030: 0,38%"],
    ["Taxa de fecundidade total e reposição populacional?", "Reposição: ≥ 2,1 filhos por mulher · 2020: 1,76 · Expectativa 2030: 1,72 · Muito abaixo do nível de reposição"],
    ["Esperança de vida ao nascer — Brasil 2020?", "76,8 anos (projeção IBGE) · Recuo na pandemia covid-19 para 74,8 anos · Homens: 73,26 · Mulheres: 80,25 · Sul: maior · Norte: menor"],
    ["Esperança de vida 1980–2020?", "Aumento de 12,1 anos (62,7 em 1980 → 74,8 em 2020) · Estimativa 2030: 78,64 anos"],
    ["Proporção de idosos (65+ anos) em 2020?", "~9,83% · Menores participações: Norte, Centro-Oeste e Nordeste · Maiores: Sul e Sudeste · Predomínio de mulheres idosas"],
    ["Índice de envelhecimento — Brasil?", "2018: 43,19% (60+ / <15 anos) · Projeção 2060: 173,47% · Varia de ~21% (Norte) a ~55% (Sul)"]
  ]),

  deck("pind-morbidade", "Morbidade · prevalência · incidência · densidade", [
    ["O que medem os coeficientes de morbidade?", "Risco de uma pessoa adoecer em determinado local e ano · Apontam problemas de saúde e permitem medidas de prevenção e controle"],
    ["Coeficiente de prevalência — conceito?", "Frequência da doença aqui/agora · Casos existentes ÷ população, independentemente de serem novos ou antigos · “Fotografia” do momento"],
    ["Prevalência instantânea × lápsica?", "Instantânea: ponto definido (dia/semana/ano) — mais cobrada em provas · Lápsica: intervalo de tempo; inclui óbitos, curas e emigração (retirados da instantânea)"],
    ["O que AUMENTA a prevalência?", "Mais casos novos diagnosticados · Imigração de doentes · Diminuição da mortalidade por doenças crônicas"],
    ["O que DIMINUI a prevalência?", "Aumento de óbitos do agravo · Aumento de curados · Emigração de doentes"],
    ["Prevalência × coeficiente de prevalência?", "Prevalência = nº total de casos · Coeficiente = casos ÷ população exposta · Termos muito usados como sinônimos em concursos"],
    ["Coeficiente de incidência — conceito?", "Frequência de casos novos em local e tempo · Mede intensidade da morbidade · Melhor coeficiente de morbidade para avaliar risco de adoecer · Também chamado incidência acumulada"],
    ["Incidência × coeficiente de incidência?", "Incidência = nº de casos novos · Coeficiente = casos novos ÷ população exposta · Sinônimos frequentes em concursos"],
    ["Densidade de incidência — quando usar?", "População que varia no tempo (ex.: infecções hospitalares) · Denominador = pessoas-tempo em risco, não pessoas por período fixo"],
    ["Fórmula da densidade de incidência?", "Casos novos ÷ soma dos períodos em que cada indivíduo permaneceu no estudo · Ex.: 2 casos / 11 pessoas-ano = 2 eventos por 11 pessoas-ano"],
    ["Coeficiente (taxa) de ataque?", "Incidência usada em surtos epidêmicos"],
    ["Coeficiente de ataque secundário?", "Casos novos após contato com caso-índice ÷ total de contatos · Resultado em percentual"],
    ["Relação prevalência, incidência e duração?", "Prevalência = Incidência × Duração · Válida se incidência e duração permanecem constantes"],
    ["Prevalência × incidência — diferença central?", "Prevalência: casos existentes (novos + antigos), fotografia · Incidência: apenas casos novos, mede risco de adoecer"],
    ["Estrutura do cálculo dos coeficientes de morbidade?", "Doenças notificadas/informadas (ano e lugar) · População total (ano e lugar) · Parâmetro de comparação = potência de 10"],
    ["Doenças de notificação compulsória com maior incidência (Brasil)?", "Dengue, malária e tuberculose · Dengue: 548.501 casos em 2021"]
  ]),

  deck("pind-mortalidade", "Mortalidade · letalidade · coeficientes · padronização", [
    ["O que medem os coeficientes de mortalidade?", "Probabilidade de qualquer pessoa da população morrer em determinado local e ano"],
    ["Coeficiente de mortalidade geral — conceituação?", "Nº total de óbitos por mil habitantes, população residente, no ano · Também chamado taxa bruta de mortalidade"],
    ["Interpretação da taxa bruta de mortalidade?", "Probabilidade de morrer por qualquer causa em qualquer idade · Influenciada pela estrutura etária e sexo · Taxas altas: população pobre ou envelhecida"],
    ["Brasil 2021 — taxa bruta de mortalidade?", "1.826.354 óbitos · 8,58 óbitos por mil habitantes (2021) · Coeficiente geral ~8,49 · Média mundial: 7–10 mortes/1.000 hab./ano"],
    ["Limitação da taxa bruta de mortalidade?", "Dificulta comparação entre regiões com estrutura etária distinta · Ex.: localidade jovem pode ter taxa menor que localidade envelhecida sem melhor saúde"],
    ["Para que serve a padronização de coeficientes?", "Colocar populações no mesmo patamar para comparação realista · Escolhe-se população-padrão (real ou fictícia) · Ex.: padronização por idade"],
    ["Coeficiente de letalidade — o que mede?", "Capacidade da doença de provocar morte em acometidos · Gravidade da doença · Risco de pessoa doente morrer pelo agravo"],
    ["Numerador e denominador da letalidade?", "Óbitos totais da doença (tempo e lugar delimitados) ÷ nº de casos da doença no mesmo período"],
    ["Estrutura do cálculo dos coeficientes de mortalidade?", "Óbitos (ano e lugar) · População total ou nascidos vivos (mortalidade infantil/materna) · Parâmetro de comparação = potência de 10"],
    ["Estrutura do cálculo dos índices de mortalidade?", "Óbitos totais por causa, sexo e faixa etária ÷ óbitos proporcionais · Resultado em proporção (percentual)"],
    ["Esperança de vida ao nascer × taxa bruta de mortalidade?", "Expectativa de vida = medida sintética da mortalidade · Não é afetada pela estrutura etária como a taxa bruta"],
    ["Esperança de vida ao nascer — conceituação?", "Nº médio de anos esperados para recém-nascido, mantido o padrão de mortalidade existente · Probabilidade de tempo de vida média"],
    ["O que é DALY?", "Disability Adjusted Life Years · Anos de vida perdidos ajustados por incapacidade · OMS/Banco Mundial · Alia morbidade e mortalidade em um indicador"],
    ["Componentes do DALY?", "YLL (morte prematura: N × L) + YLD (anos vividos com incapacidade: P × DW) · DALY = YLL + YLD"],
    ["Principais causas de óbito Brasil 2021 (pandemia)?", "1º DIP (~26,5%) · 2º aparelho circulatório · 3º neoplasias · 4º respiratório · 5º causas externas · Antes da covid-19: circulatório liderava"],
    ["Tendência pré-pandemia das principais causas de óbito?", "Em ordem decrescente: doenças do aparelho circulatório, neoplasias, aparelho respiratório e causas externas"],
    ["Coeficiente de mortalidade materna — o que mede?", "Óbitos por complicações de gravidez, parto, puerpério e abortos · Avalia cobertura e qualidade da assistência à mulher nesse período · Expresso por 100.000 nascidos vivos"],
    ["Denominador da mortalidade materna — por quê?", "Não é a população feminina exposta · Usa-se o total de nascidos vivos como proxy do número de gestantes no período"],
    ["Definição de morte materna (Prev4)?", "Morte durante a gravidez, parto ou até 42 dias após o término da gestação · Qualquer causa relacionada ou agravada pela gravidez/medidas · Exclui causas acidentais ou incidentais"],
    ["Mortes obstétricas diretas × indiretas?", "Diretas: complicações obstétricas, intervenções, omissões ou tratamento incorreto · 70–80% dos óbitos maternos · Indiretas: doença prévia ou surgida na gestação, agravada pela gravidez, sem ser obstétrica direta"],
    ["Exemplo Brasil 2021 — mortalidade materna?", "2.946 óbitos maternos · 2.672.046 nascidos vivos · Coeficiente ≈ 110 por 100.000 NV · Ainda elevado frente a países como Suécia/Itália (~4) e EUA (~14) em comparações citadas"],
    ["Coeficiente de mortalidade por causas externas?", "Óbitos por acidentes e violências por 100 mil habitantes residentes/ano · Principais grupos: acidentes de transporte, suicídios e homicídios"]
  ]),

  deck("pind-infantil-isu", "Mortalidade infantil · ISU · Nelson Moraes · Guedes", [
    ["Coeficiente de mortalidade infantil — definição?", "Óbitos de menores de 1 ano por mil nascidos vivos · Probabilidade de criança nascida viva morrer antes de 1 ano · Indicador sensível das condições de vida e saúde"],
    ["Brasil 2021 — mortalidade infantil?", "31.724 óbitos < 1 ano · 11,87 por mil nascidos vivos · Tendência de queda (1999: 31,8; meta ONU 2015: 17,7 em 2011)"],
    ["Classificação das taxas de mortalidade infantil?", "Altas: ≥ 50 por mil · Médias: 20–49 · Baixas: < 20 · Vários países hoje < 10 por mil"],
    ["Componente predominante — CMI alta vs baixa?", "Alta: predomina pós-neonatal · Baixa: predomina neonatal (até 28 dias), especialmente neonatal precoce"],
    ["Mortalidade neonatal — o que mede?", "Óbitos < 28 dias (até 27 completos) por mil nascidos vivos · Avalia assistência ao parto, pré-natal e primeiros dias · Causas: perinatais e anomalias congênitas"],
    ["Mortalidade neonatal precoce?", "Óbitos 0–6 dias completos por mil nascidos vivos · Avalia assistência ao parto e pré-natal · Brasil 2021: 6,2 por mil"],
    ["Mortalidade neonatal tardia?", "Óbitos 7–27 dias completos por mil nascidos vivos · Brasil 2021: 2,1 por mil · Declínio mais lento (causas endógenas e qualidade do atendimento)"],
    ["Mortalidade pós-neonatal (infantil tardia)?", "Óbitos 28–364 dias por mil nascidos vivos · Brasil 2021: 3,5 · Componente que mais caiu (saneamento, vacinação, amamentação)"],
    ["Mortalidade perinatal — período e cálculo?", "22 sem completas (154 dias, ~500 g) até 7 dias completos pós-nascimento · (Óbitos fetais + neonatais precoces) ÷ nascimentos totais · Brasil 2021: ~17 por mil"],
    ["Natimortalidade?", "Apenas natimortos (perdas fetais tardias) · Avalia assistência pré-natal, saúde/nutrição materna e fatores fetais"],
    ["Índice de mortalidade infantil proporcional?", "Proporção de óbitos < 1 ano no total de óbitos · Brasil 2021: 1,73% · Avalia assistência materno-infantil"],
    ["ISU (Swaroop-Uemura) — definição?", "Percentual de óbitos com ≥ 50 anos em relação ao total · Indicador do nível de vida · Não exige dados censitários populacionais"],
    ["ISU — interpretação ideal?", "Melhor entre 75–100%: maioria dos óbitos acima de 50 anos · Baixa mortalidade infantil e entre jovens · Classificação: >75% 1º; 50–74% 2º; 25–49% 3º; <25% 4º"],
    ["ISU — níveis Tipo I a IV?", "Tipo I / 1º nível: ISU > 75% · Tipo II / 2º: 50–74% · Tipo III / 3º: 25–49% · Tipo IV / 4º: < 25% · Quanto maior o ISU, melhor o nível de saúde"],
    ["Curva de Nelson Moraes — 5 grupos etários?", "< 1 ano · 1–4 · 5–19 · 20–49 · 50+ anos"],
    ["Curvas de Nelson Moraes — 4 tipos?", "I (“N”): saúde muito baixa, óbitos em adulto jovem · II (“L”/J invertido): saúde baixa, óbitos infantis/pré-escolares · III (“U”): regular, eleva >50a, MI ainda alta · IV (“J”): saúde elevada, predomínio >50a"],
    ["Nelson Moraes Tipo II e III — detalhes?", "Tipo II: formato L ou J invertido · Predomínio de óbitos infantis e pré-escolares · Tipo III: formato U · Começa a elevar mortalidade >50 anos, mas MI ainda alta"],
    ["Quantificação de Guedes — pesos por faixa?", "< 1 ano: −4 · 1–4: −2 · 5–19: −1 · 20–49: −3 · 50+: +5 · Idealizado em 1972 para traduzir numericamente as curvas de Nelson Moraes"],
    ["Por que a mortalidade infantil é sensível às condições de vida?", "Reflete saneamento, vacinação, amamentação, assistência ao parto e pré-natal · Quedas grandes no componente pós-neonatal · Neonatal precoce ainda depende fortemente da qualidade assistencial"]
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-prev4.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");

const total = decks.reduce((n, d) => n + d.cards.length, 0);
console.log(`Prev4: ${decks.length} decks · ${total} cards → ${out}`);
for (const d of decks) console.log(`  ${d.id}: ${d.cards.length}`);
