const fs = require("fs");
const path = require("path");

const c = (front, back) => ({ front, back });
const deck = (id, name, cards) => ({ id, name, specialty: "preventiva", cards });

// Conteúdo restrito à Apostila Prev1 e snips em data/_extract_prev/snips-prev1/
const decks = [
  deck("psus-reforma", "Reforma sanitária · VIII CNS · CF/88", [
    c(
      "Qual foi o lema da VIII Conferência Nacional de Saúde (1986)?",
      "Saúde: direito de todos, dever do Estado"
    ),
    c(
      "O que marcou a VIII CNS de 1986?",
      "Primeira CNS com participação dos usuários · >4 mil participantes · Propostas: universalização · unificação MS-INAMPS · integralidade · descentralização · participação popular"
    ),
    c(
      "Quais princípios ético-normativos orientavam o movimento da Reforma Sanitária?",
      "Saúde como direito humano · Determinação social saúde-doença · Saúde como direito universal de cidadania · Proteção integral da promoção à reabilitação"
    ),
    c(
      "Quem compôs o movimento da Reforma Sanitária?",
      "Movimento civil · Técnicos de saúde · Acadêmicos · Secretários de saúde · Simpatizantes · Amplo apoio político"
    ),
    c(
      "O que propunham as Ações Integradas de Saúde (AIS, 1983)?",
      "Convênios MS-INAMPS com municípios/estados · Repasses descentralizados · Ampliação de serviços · Ênfase em ações básicas e preventivas · Integração MS e INAMPS"
    ),
    c(
      "O que foi o SUDS (1987)?",
      "Sistema Unificado e Descentralizado de Saúde · Momento de transição para o SUS · Descentralizou gestão e orçamento · Retirou poder centralizado do INAMPS"
    ),
    c(
      "Quando e onde o SUS foi criado constitucionalmente?",
      "Constituição Federal de 1988 · Seção da saúde nos arts. 196 a 200"
    ),
    c(
      "Texto central do art. 196 da CF/88?",
      "A saúde é direito de todos e dever do Estado"
    ),
    c(
      "Como era o “duplo comando” antes do SUS?",
      "Ministério da Saúde: ações preventivas · Ministério da Previdência/INAMPS: assistência curativa · Acesso restrito a trabalhadores formais e dependentes"
    ),
    c(
      "O que a Reforma Sanitária propôs sobre financiamento?",
      "Fundo único de saúde, público, capaz de financiar ações preventivas e curativas"
    ),
    c(
      "Linha histórica do seguro social privado no Brasil até o INAMPS?",
      "1923 CAPs (Lei Eloy Chaves) · 1933 IAPs · ~1966 INPS · 1977 INAMPS · Direito à assistência condicionado à contribuição"
    ),
    c(
      "Como eram as ações preventivas antes do SUS?",
      "Financiadas pelo Estado e de acesso universal · Conviviam em paralelo com a cura restrita · Modelo sem integralidade entre prevenção e cura"
    ),
    c(
      "O que foi a Revolta da Vacina?",
      "Manifestação popular no Rio de Janeiro · Novembro de 1904 · Contra a obrigatoriedade da vacinação contra varíola"
    ),
    c(
      "O que saiu da Conferência de Alma-Ata (1978)?",
      "Atenção primária como referência · Promover saúde · Prevenir doenças · Estender serviços à população"
    ),
    c(
      "Características do modelo assistencial sanitarista?",
      "Grandes campanhas e programas especiais · Primeira República · Não é integralidade · Não atua em prevenção contínua · Ações pontuais"
    ),
    c(
      "Modelo bismarckiano (seguro social) no Brasil?",
      "CAPs, IAPs, INPS · Acesso restrito a quem contribui · Financiamento por empregados e empregadores"
    ),
    c(
      "Modelo beveridgiano (seguridade social)?",
      "Saúde financiada por impostos · Universal · Estado presta serviços · Referência para o SUS"
    ),
    c(
      "Quais fatores alimentaram a crise da Previdência nos anos 1970?",
      "Má aplicação de recursos · Incorporação tecnológica · Assistência hospitalocêntrica · Privilegiamento do setor privado · 1ª Crise do Petróleo (1973)"
    )
  ]),

  deck("psus-principios", "Princípios doutrinários e organizacionais do SUS", [
    c(
      "Como a CF/88 classifica os princípios do SUS?",
      "Éticos/doutrinários: universalidade, equidade, integralidade · Organizacionais/operativos: descentralização, regionalização, hierarquização, participação social"
    ),
    c(
      "Relação entre princípios doutrinários e organizacionais?",
      "Interdependentes · Para materializar os doutrinários, os organizacionais precisam estar estruturados"
    ),
    c(
      "O que é universalidade no SUS?",
      "Todo cidadão tem direito de acesso aos serviços de saúde em todos os níveis de assistência"
    ),
    c(
      "O que é integralidade no SUS?",
      "Atendimento integral às necessidades · Prevenção, promoção, recuperação e reabilitação · Prioridade às preventivas, sem prejuízo dos assistenciais"
    ),
    c(
      "O que é equidade no SUS?",
      "Reduzir disparidades sociais e regionais · Situações desiguais merecem tratamento desigual · Busca maior equilíbrio"
    ),
    c(
      "Equidade vs igualdade (Lei 8.080)?",
      "Igualdade: assistência sem preconceitos ou privilégios · Equidade: tratar desigualmente situações desiguais · Conceitos distintos, não sinônimos"
    ),
    c(
      "O que é descentralização no SUS?",
      "Redistribuição de responsabilidades entre União, estados e municípios · Reforço do poder municipal (municipalização) · Decisão mais próxima da realidade local"
    ),
    c(
      "O que é regionalização?",
      "Serviços em território delimitado com população definida · Consórcios intermunicipais ou interestaduais quando faltam serviços locais"
    ),
    c(
      "O que é hierarquização da rede?",
      "Serviços em níveis de complexidade crescente · Acesso pelo nível primário · Casos complexos referenciados · Trajetória do usuário = linha de cuidado"
    ),
    c(
      "Quanto da demanda a atenção primária pode responder?",
      "Pelo menos 85% da demanda · Nível ambulatorial próximo da vida das pessoas"
    ),
    c(
      "Exemplos de atenção secundária segundo a apostila?",
      "Subespecialidades ambulatoriais · Exames mais avançados · UPAs · SAMU · Emergência e urgência de porta aberta"
    ),
    c(
      "O que é participação e controle social?",
      "População participa da formulação e controle das políticas de saúde · Conselhos e Conferências de Saúde · Conselhos são condição obrigatória ao funcionamento do SUS"
    ),
    c(
      "Papel das Conferências de Saúde?",
      "Instâncias consultivas · Avaliam a situação de saúde · Propõem diretrizes · Normalmente a cada 4 anos"
    ),
    c(
      "Papel dos Conselhos de Saúde (Lei 8.142)?",
      "Permanentes e deliberativos · Formulam estratégias e controlam execução da política, inclusive aspectos econômicos · Decisões homologadas pelo chefe do Poder Executivo"
    ),
    c(
      "Conselho vs gestor de saúde?",
      "Gestor executa a política · Conselho delibera diretrizes, acompanha ações e fiscaliza recursos"
    ),
    c(
      "Composição paritária dos conselhos (Lei 8.142)?",
      "50% usuários · 25% profissionais de saúde · 25% prestadores de serviço e gestores"
    ),
    c(
      "O que é resolubilidade?",
      "Problema de saúde deve ser resolvido pelo serviço até o limite de sua competência"
    ),
    c(
      "O que é complementaridade do setor privado?",
      "Quando o setor público não for suficiente, contratar privado · Instituição privada deve seguir princípios do SUS · Preferência a filantrópicos e sem fins lucrativos"
    ),
    c(
      "O que é referência e contrarreferência?",
      "Rede regionalizada e hierarquizada · Referência: envio a nível mais complexo · Contrarreferência: retorno com continuidade do cuidado no nível de origem"
    ),
    c(
      "Atenção primária como porta de entrada — regra prática?",
      "Acesso preferencial pelo nível primário · Especialistas, em geral, mediante encaminhamento do médico da APS · Impacto em custos e eficiência"
    )
  ]),

  deck("psus-legislacao", "Leis 8.080/8.142 · NOBs · NOAS", [
    c(
      "O que são as leis orgânicas da saúde?",
      "Lei 8.080/1990 e Lei 8.142/1990 · Editadas em 1990 para organizar o SUS após a CF/88"
    ),
    c(
      "Objeto principal da Lei 8.080/90?",
      "Condições para promoção, proteção e recuperação da saúde · Organização e funcionamento do SUS em todo o território nacional"
    ),
    c(
      "Principais temas da Lei 8.080/90?",
      "Organização, direção e gestão · Competências das três esferas · Participação complementar do privado · Recursos humanos · Recursos financeiros, planejamento e orçamento"
    ),
    c(
      "Objeto principal da Lei 8.142/90?",
      "Participação da comunidade na gestão do SUS · Transferências intergovernamentais de recursos financeiros"
    ),
    c(
      "Instâncias colegiadas do SUS em cada esfera (Lei 8.142)?",
      "Conferência de Saúde · Conselho de Saúde · Paridade de usuários em relação aos demais segmentos"
    ),
    c(
      "Requisitos para municípios receberem recursos federais (Lei 8.142)?",
      "Fundo de Saúde · Conselho de Saúde · Plano de Saúde · Relatório de Gestão · Contrapartida orçamentária · Comissão de PCCS (prazo 2 anos)"
    ),
    c(
      "Quantas NOBs e NOAS orientaram a implantação do SUS?",
      "Três Normas Operacionais Básicas (1991, 1993, 1996) · Duas NOAS (01/2001 e 01/2002)"
    ),
    c(
      "NOB 01/91 — pontos centrais?",
      "Centraliza gestão no INAMPS · Pagamento por produção · Município municipalizado exige conselho, fundo, plano, PROS, contrapartida e PCCS · Cria SIA/SUS"
    ),
    c(
      "NOB 01/93 — tema central?",
      "“A municipalização é o caminho” · Transferência fundo a fundo para gestão semiplena · Habilita municípios gestores · Cria Comissões Intergestores Bipartite e Tripartite"
    ),
    c(
      "NOB 01/96 — principais avanços?",
      "Consolida municipalização · Cria PAB (per capita) · Gestão Plena da Atenção Básica e Plena do Sistema Municipal · Reduz repasse por produção · Fortalece CIB e CIT"
    ),
    c(
      "Tipos de gestão municipal na NOB 96?",
      "Gestão Plena da Atenção Básica: município cuida de toda AB · Gestão Plena do Sistema Municipal: AB + demais níveis de atenção"
    ),
    c(
      "Quando a NOB 96 entrou em vigor e o que mudou no PAB?",
      "Implantada em janeiro de 1998 · Piso Assistencial Básico virou Piso da Atenção Básica · Parte fixa (R$ 10,00 per capita/ano) + parte variável (PACS, PSF, vigilâncias etc.)"
    ),
    c(
      "NOAS/SUS 01/2001 — objetivo?",
      "Promover equidade na alocação de recursos e no acesso · Regionalização e hierarquização · Institui Plano Diretor de Regionalização (PDR)"
    ),
    c(
      "Conceitos-chave do PDR (NOAS 2001)?",
      "Região de saúde · Módulo assistencial (primeiro nível de referência) · Município-polo · Microrregião de saúde"
    ),
    c(
      "NOAS/SUS 01/2002 — principais mudanças?",
      "Revisão da NOAS 2001 · Gestão Plena da Atenção Básica Ampliada (GPABA) · Estratégias mínimas: TB, hanseníase, HAS, DM, saúde da criança, mulher e bucal · PAB ampliado"
    ),
    c(
      "Resumo comparativo NOB 91 → 93 → 96?",
      "91: centralização federal · 93: inicia descentralização, município gestor · 96: consolida municipalização, PAB, PSF/PACS como estratégia principal"
    ),
    c(
      "Resumo NOAS 2001 e 2002?",
      "2001: divisão de responsabilidades, 100% municípios habilitados, PDR · 2002: GPABA, PAB ampliado, reforço do comando único e gestão estadual"
    ),
    c(
      "Marcos legais pós-CF/88 citados na apostila?",
      "Pacto pela Saúde (jan/2006) · Regulamento do SUS aprovado em 3/set/2009"
    )
  ]),

  deck("psus-financiamento", "Financiamento do SUS · EC 29 · LC 141", [
    c(
      "De quem é a responsabilidade pelo financiamento do SUS?",
      "Responsabilidade comum da União, estados, Distrito Federal e municípios"
    ),
    c(
      "Percentuais mínimos da EC 29 / LC 141?",
      "Município: 15% da receita · Estado: 12% da receita · União: valor do ano anterior + variação nominal do PIB (posteriormente alterado pela EC 95)"
    ),
    c(
      "Como a EC 95/2016 alterou o repasse da União?",
      "2017: despesa primária de 2016 corrigida em 7,2% · Anos seguintes: limite anterior corrigido pelo IPCA · União deixou de seguir apenas PIB nominal"
    ),
    c(
      "Investimento mínimo atual segundo a apostila?",
      "Município: 15% das receitas · Estado: 12% · União: 15% das receitas em 2017, depois ajuste pelo IPCA · DF pode aplicar 12% ou 15%"
    ),
    c(
      "Gastos com saúde no Brasil (~dados da apostila)?",
      "~8% do PIB total · ~3,1% público (União 1,6% · estados 0,7% · municípios 0,8%) · ~4,89% privado · Público = 38,75% dos gastos totais"
    ),
    c(
      "Tributos que financiam estados no SUS?",
      "ITCMD · ICMS · IPVA · IRRF · Transferências: cota-parte FPE e IPI-exportação"
    ),
    c(
      "Tributos que financiam municípios no SUS?",
      "IPTU · ITBI · ISS · IRRF · ITR · Transferências: FPM, cota-parte ITR, IPVA, ICMS e IPI-exportação"
    ),
    c(
      "Base de cálculo estadual para o mínimo em saúde?",
      "Receita de impostos + transferências constitucionais − repasses a municípios (ICMS 25%, IPVA 50%, IPI-exportação 25%) · Mínimo = base × 0,12"
    ),
    c(
      "Base de cálculo municipal para o mínimo em saúde?",
      "Receita de impostos + transferências constitucionais · Mínimo = base × 0,15"
    ),
    c(
      "Modalidades de execução dos recursos federais de custeio?",
      "Transferência regular e automática (fundo a fundo) · Remuneração por serviços produzidos"
    ),
    c(
      "Dois Blocos de Financiamento (Portaria 2.979/2019)?",
      "Bloco de Manutenção das Ações e Serviços Públicos de Saúde · Bloco de Estruturação da Rede de Serviços Públicos de Saúde"
    ),
    c(
      "Uso do Bloco de Manutenção?",
      "Manter oferta e continuidade das ações/serviços · Funcionamento de órgãos e estabelecimentos · Vedado pagar obras novas ou ampliações"
    ),
    c(
      "Uso do Bloco de Estruturação?",
      "Obras novas, ampliações e reformas de imóveis para saúde · Vedado usar em unidades exclusivamente administrativas"
    ),
    c(
      "Para que serve o SIOPS?",
      "Acompanhar, fiscalizar e controlar aplicação dos recursos vinculados em saúde · Verificar cumprimento da EC 29/LC 141 · Visibilidade dos gastos públicos"
    ),
    c(
      "Principais fontes federais citadas para o Ministério da Saúde?",
      "COFINS (principal) · CSLL (~7%) · Fundo de Combate à Pobreza (4,4%) · IOF compensou extinção da CPMF (2007)"
    ),
    c(
      "Destinação do DPVAT para o SUS?",
      "45% ao FNS para custear hospitais públicos · 5% ao DENATRAN (campanhas) · 50% às seguradoras (indenizações)"
    ),
    c(
      "O que o FNS financia?",
      "Despesas de média e alta complexidade na rede ambulatorial e emergencial · Consultas, medicamentos, internações e procedimentos de emergência"
    ),
    c(
      "Decreto 1.232/1994 e transferências?",
      "Mecanismo de repasse direto do FNS aos fundos estaduais e municipais · Intensificou descentralização iniciada pelas NOBs"
    ),
    c(
      "O que é o Programa Previne Brasil (Portaria 2.979/2019)?",
      "Novo modelo de financiamento de custeio da APS · Busca ampliar acesso e equidade · Extingue PAB fixo e variável a partir de 2020"
    ),
    c(
      "Quais são os quatro componentes do Previne Brasil?",
      "Capitação ponderada · Pagamento por desempenho · Incentivo para ações estratégicas · Incentivo financeiro com base em critério populacional"
    ),
    c(
      "O que é capitação ponderada no Previne Brasil?",
      "Transferência conforme características da população cadastrada e do território · Usa classificação geográfica do IBGE · Estimula equidade entre municípios"
    )
  ]),

  deck("psus-programas", "Programas e ações do Ministério da Saúde", [
    c(
      "O que é o Programa Farmácia Popular do Brasil?",
      "Complementa dispensação de medicamentos da APS · Parceria com farmácias/drogarias privadas credenciadas · Além de UBS e farmácias municipais"
    ),
    c(
      "Medicamentos do Farmácia Popular (gratuitos vs subsidiados)?",
      "Gratuitos: diabetes, asma, hipertensão · Subsidiados (até 90% MS): dislipidemia, rinite, Parkinson, osteoporose, glaucoma, anticoncepção, fraldas geriátricas"
    ),
    c(
      "O que é o SAMU?",
      "Serviço de Atendimento Móvel de Urgência · Acesso pelo 192 · Central de regulação médica 24h · Componente estratégico da Política Nacional de Atenção às Urgências"
    ),
    c(
      "Como funciona a regulação do SAMU?",
      "Acolhe e prioriza chamados · Pode enviar ambulância com médico+enfermeiro ou só técnico · Orientar busca a UBS · Reavaliar se piora · Acionar outros meios de socorro"
    ),
    c(
      "Posição da UPA 24h na rede?",
      "Complexidade intermediária entre UBS e urgência hospitalar · Pré-hospitalar fixo · Acolhimento e classificação de risco · Integra rede de Atenção às Urgências com SAMU"
    ),
    c(
      "Objetivo da Estratégia Saúde da Família (ESF)?",
      "Reorganizar a Atenção Básica no SUS · Caráter substitutivo da AB tradicional · Atuar no território com cadastro domiciliar e vínculo longitudinal · Espaço de construção de cidadania"
    ),
    c(
      "Programa Brasil Sorridente — foco?",
      "Política Nacional de Saúde Bucal · Reorganizar AB bucal via ESF · Ampliar atenção especializada (CEO, laboratórios de prótese) · Fluoretação da água"
    ),
    c(
      "Para que servem os CAPS?",
      "Programa estratégico da Reforma Psiquiátrica · Substituir hospitais psiquiátricos · Atendimento diário · Inserção social · Porta de entrada da saúde mental na área"
    ),
    c(
      "CAPS I, II e III — população mínima?",
      "CAPS I: ≥15 mil hab · CAPS II: ≥70 mil hab · CAPS III: ≥150 mil hab · Até 5 vagas de acolhimento noturno no CAPS III"
    ),
    c(
      "CAPS i e CAPS ad — diferença?",
      "CAPS i: crianças e adolescentes (≥70 mil hab) · CAPS ad: transtornos por álcool e drogas (≥70 mil) · CAPS ad III/IV: acolhimento 24h em populações maiores"
    ),
    c(
      "Programa Mais Médicos — retomada e foco (2023)?",
      "Retomado após abandono do Médicos pelo Brasil · Provimento de médicos + formação · Ampliar residências prioritárias · Incentivo a mestrado/pós em APS e MFC"
    ),
    c(
      "Ordem de prioridade no Mais Médicos?",
      "1º Médicos formados/revalidados no Brasil · 2º Brasileiros formados no exterior habilitados · 3º Estrangeiros habilitados · Remanescentes via OPAS"
    ),
    c(
      "Três frentes atuais do Mais Médicos?",
      "Provimento emergencial · Educação · Infraestrutura"
    ),
    c(
      "O que é o Programa Saúde na Hora?",
      "Amplia horário das USF (noite, almoço, opcionalmente fins de semana) · Lançado 2019 · Incentivo financeiro federal após proposta e portaria de aprovação"
    ),
    c(
      "Sinônimos de programas federais (saiba mais)?",
      "Atenção Básica = Saúde Mais Perto de Você · Urgências = Saúde Toda Hora · Saúde Mental = Saúde Conte com a Gente · Mulher = Saúde da Mulher · Farmácia = Saúde Não Tem Preço"
    ),
    c(
      "HumanizaSUS — objetivo e ano?",
      "Política Nacional de Humanização (2003) · Efetivar princípios do SUS no cotidiano · Valorizar usuários, trabalhadores e gestores · Acolhimento como conceito central"
    ),
    c(
      "PACS e ESF na história do financiamento?",
      "PACS precede ESF (1994) · 1998 NOB 96: financiamento per capita via PAB variável para PACS e ESF"
    ),
    c(
      "Programa Melhor em Casa?",
      "Atendimento domiciliar para reabilitação motora, idosos, crônicos estáveis ou pós-cirúrgicos · Equipe multiprofissional (~60 pacientes/equipe) · 100% financiado pelo MS"
    ),
    c(
      "O que é Saúde Digital / Telessaúde no Prev1?",
      "Uso de TIC para informação confiável a cidadãos, profissionais e gestores · Saúde Digital é mais abrangente que e-Saúde · Incorpora avanços tecnológicos recentes"
    ),
    c(
      "O que é o Programa Conecte SUS?",
      "Principal iniciativa da Estratégia de Saúde Digital 2020–2028 (ESD28) · Informatiza e integra rede pública/privada e gestores · Cidadão acessa trajetória, vacinas, exames, internações e medicamentos"
    )
  ]),

  deck("psus-aps-esf", "APS/ESF · equipes · atribuições", [
    c(
      "Definição de APS na Declaração de Alma-Ata (1978)?",
      "Atenção essencial, tecnologia adequada, socialmente aceitável, universalmente acessível · Primeiro nível de contato · Função central do sistema · Atenção continuada"
    ),
    c(
      "Atributos essenciais de APS (Barbara Starfield)?",
      "Porta de entrada / primeiro contato · Longitudinalidade · Integralidade · Coordenação do cuidado"
    ),
    c(
      "Atributos derivados de APS citados?",
      "Centralização na família · Orientação comunitária · Competência cultural"
    ),
    c(
      "Fundamentos da Atenção Básica no SUS (síntese)?",
      "Acesso universal e contínuo · Integralidade e coordenação na rede · Vínculo e longitudinalidade · Valorização profissional · Avaliação sistemática · Participação popular"
    ),
    c(
      "Histórico PACS e ESF?",
      "ESF iniciada em 1994 como Programa de Saúde da Família · Evolução do PACS · Repasse inicial por convênio Funasa-SMS · 1998: PAB variável per capita (NOB 96)"
    ),
    c(
      "Composição mínima da equipe ESF?",
      "Médico (preferencial MFC) · Enfermeiro (preferencial saúde da família) · Auxiliar/técnico de enfermagem · ACS · Opcionais: ACE · Saúde bucal (CD e ASB) · Jornada 40h para todos"
    ),
    c(
      "Qual era a regra antiga de ACS por equipe e o que mudou?",
      "Antigamente mínimo de seis ACS por equipe · A última portaria da AB não cita número mínimo de ACS"
    ),
    c(
      "Atribuições comuns de ACS e ACE?",
      "Diagnóstico demográfico/social/epidemiológico do território · Promoção, prevenção e vigilância com visitas domiciliares · Ações educativas na UBS, domicílio e comunidade · Apoiar investigação de casos suspeitos"
    ),
    c(
      "População de responsabilidade de uma equipe PSF/ESF?",
      "2.000 a 3.500 pessoas (PNAB) · Gestor local pode ajustar conforme vulnerabilidades e dinâmica comunitária"
    ),
    c(
      "Equipe de Atenção Básica (eAB) vs Equipe de Atenção Primária (eAP)?",
      "eAB: médico + enfermeiro + aux/téc enfermagem · eAP: médico + enfermeiro (composição mínima)"
    ),
    c(
      "Portas de entrada do SUS (Decreto 7.508/2011)?",
      "Atenção primária · Urgência e emergência · Atenção psicossocial · Serviços especiais de acesso aberto"
    ),
    c(
      "Percentual de casos que a ESF pode resolver?",
      "Mais de 85% dos casos · Restante encaminhado a níveis mais complexos com referência garantida"
    ),
    c(
      "Atribuições básicas da equipe ESF (síntese)?",
      "Conhecer realidade e riscos do território · Vigilância nos ciclos de vida · Referência adequada · Assistência integral contínua · Ações intersetoriais · Incentivar conselhos locais"
    ),
    c(
      "Atribuições específicas do médico na ESF?",
      "Atenção às pessoas/famílias sob responsabilidade · Consultas, pequenos procedimentos, grupos na UBS/domicílio · Estratificação de risco e plano de cuidados · Encaminhar mantendo responsabilidade · Indicar internação · Gerenciar ACS/ACE"
    ),
    c(
      "Atribuições comuns a todos os profissionais da ESF (exemplos)?",
      "Territorialização e cadastro · Cuidado integral na UBS/domicílio · Acolhimento e classificação de risco · Longitudinalidade e coordenação na RAS · Busca ativa e notificação compulsória · Visitas domiciliares"
    ),
    c(
      "Cobertura da ESF em 2017?",
      "Aproximadamente 70% da população brasileira"
    ),
    c(
      "O que é o NASF-AB?",
      "Núcleo Ampliado de Saúde da Família e Atenção Básica · Apoio multiprofissional às eSF/eAB · Não é porta de entrada · Sem unidade física independente"
    ),
    c(
      "Encerramento do NASF?",
      "Estratégia NASF encerrada início de 2020 · Proibida criação de novos NASF · Equipes existentes: migrar para eSF/eAP, permanecer NASF-AB no CNES ou cadastro sem vínculo"
    ),
    c(
      "ESF como estratégia reestruturante?",
      "Não isola alta complexidade · Ordena encaminhamentos · Articula todos os níveis · Promove saúde por ações básicas · Universal, integral, equânime, contínua e resolutiva"
    ),
    c(
      "Saúde na Hora — requisito mínimo de equipes (60h)?",
      "Mínimo 3 eSF para modalidade 60h semanal · Ou combinação eSF (40h) + eAP (20–30h) totalizando 60h"
    )
  ]),

  deck("psus-promocao", "Promoção da saúde · níveis de prevenção", [
    c(
      "O que a Carta de Ottawa representa na promoção da saúde?",
      "Marco internacional da promoção da saúde · Enfoca determinantes amplos (indivíduo–ambiente) · Reafirmada em reuniões posteriores, como Bogotá"
    ),
    c(
      "O que a Conferência de Jakarta destacou sobre Ottawa?",
      "Reforço da ação comunitária · Atenção a fatores transnacionais: globalização, degradação ambiental e acesso à comunicação"
    ),
    c(
      "Como a promoção da saúde se diferencia de ações pontuais?",
      "Conceito abrangente de saúde e múltiplos determinantes · Contínuo identificar determinantes do processo saúde-doença · Exige romper práticas setoriais isoladas e fortalecer integralidade"
    ),
    c(
      "O que é prevenção primária?",
      "Evitar a doença removendo fatores causais · Diminui incidência · Atua no período pré-patogênico · Exemplos: vacinação, tratamento de água, educação e prevenção do HIV"
    ),
    c(
      "O que é prevenção secundária?",
      "Identificar e corrigir precocemente desvios da normalidade · Visa reduzir prevalência quando há cura · Atua no período patogênico · Exemplo: inquéritos para TB precoce"
    ),
    c(
      "Por que prevenção secundária pode aumentar a prevalência em algumas doenças?",
      "Em doenças sem cura, como DM2 e HAS essencial, o tratamento prolonga a convivência com a doença · A prevalência tende a aumentar com o cuidado"
    ),
    c(
      "O que é prevenção terciária?",
      "Reduzir incapacidade e favorecer reintegração social · Usa capacidades remanescentes · Atua no período patogênico · Exemplo: reintegração do trabalhador"
    ),
    c(
      "O que é prevenção quaternária?",
      "Prevenir iatrogenia e prevenção inapropriada · Novo conceito de prevenção citado na apostila"
    ),
    c(
      "O que é prevenção primordial?",
      "Evitar padrões sociais, econômicos ou culturais ligados a alto risco de doença · Trabalha com promoção da saúde"
    ),
    c(
      "Pré-patogênico × patogênico — em quais níveis?",
      "Pré-patogênico: prevenção primária · Patogênico: prevenção secundária e terciária"
    ),
    c(
      "Exemplos clássicos de prevenção primária no Prev1?",
      "Vacinação · Tratamento de água · Desinfecção/desinfestação · Educação em saúde · Preservativos ou seringas descartáveis na prevenção do HIV"
    ),
    c(
      "Território na promoção/APS — papel?",
      "Espaço de mudança e responsabilização · Diagnóstico local e ações intersetoriais · Base para integralidade das intervenções governamentais"
    ),
    c(
      "Alma-Ata e promoção — ligação com o SUS?",
      "Atenção primária como referência · Promover saúde, prevenir doenças e estender serviços · Influenciou o modelo da Reforma Sanitária"
    ),
    c(
      "Promoção vs proteção específica (prevenção primária)?",
      "A prevenção primária trabalha com promoção da saúde e proteção específica · Promoção: determinantes amplos · Proteção específica: medidas direcionadas, como vacinas"
    ),
    c(
      "Por que promoção exige ação intersetorial?",
      "Determinantes vão além do setor saúde · Práticas setoriais isoladas são insuficientes · Governo deve contemplar integralidade das ações"
    ),
    c(
      "Relação entre equidade e promoção no território?",
      "Ações devem considerar desigualdades locais · Capitação e territorialização buscam responder a prioridades epidemiológicas e socioeconômicas distintas"
    )
  ])
];

const out = path.join(__dirname, "..", "data", "flashcards-prev1.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n");

const summary = decks.map((d) => `${d.id}: ${d.cards.length} cards`).join("\n");
console.log(`Wrote ${decks.length} decks → ${out}\n${summary}`);
