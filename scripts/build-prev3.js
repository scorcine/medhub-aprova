/**
 * Flashcards Preventiva · Prev3 (vigilância epidemiológica + processo epidêmico + ética + SST)
 * Fonte: data/_extract_prev/Prev3-full.txt · snips-prev3/
 * Prefixo: pvig- · specialty: preventiva
 */
const fs = require("fs");
const path = require("path");

const decks = [
  {
    id: "pvig-vigilancia",
    name: "Vigilância epidemiológica · conceitos e funções",
    specialty: "preventiva",
    cards: [
      {
        front: "O que é vigilância epidemiológica (objetivo geral)?",
        back: "Conjunto de ações que fornece orientação técnica e científica para o controle dos agravos · Permite conhecer o comportamento/história natural das doenças, detectar ou prever alterações de fatores condicionantes e recomendar medidas oportunas de prevenção e controle"
      },
      {
        front: "Conceito ampliado de vigilância epidemiológica (década de 1960)?",
        back: "Conjunto de atividades que permite reunir informação indispensável para conhecer, a qualquer momento, o comportamento ou a história natural das doenças, detectar ou prever alterações de fatores condicionantes e recomendar medidas eficientes de prevenção e controle"
      },
      {
        front: "Conceito de vigilância epidemiológica na Lei 8.080/1990?",
        back: "Conjunto de ações que proporciona conhecimento, detecção ou prevenção de qualquer mudança nos fatores determinantes e condicionantes de saúde individual ou coletiva, com finalidade de recomendar e adotar medidas de prevenção e controle de doenças ou agravos"
      },
      {
        front: "Significado inicial de vigilância epidemiológica (década de 1950)?",
        back: "Observação sistemática e ativa de casos suspeitos ou confirmados de doenças transmissíveis e de seus contatos · Vigilância de pessoas, com isolamento/quarentena individual · Foco no indivíduo, não coletivo"
      },
      {
        front: "Marco histórico da vigilância epidemiológica no Brasil?",
        back: "Campanha de Erradicação da Varíola (CEV, 1966–1973) · Institucionalização das ações de vigilância · Em 1969, sistema de notificação semanal de doenças selecionadas · Boletim epidemiológico quinzenal do MS"
      },
      {
        front: "Prioridade atual do SNVE?",
        back: "Fortalecimento dos sistemas municipais de vigilância epidemiológica, com autonomia técnica e gerencial para enfocar problemas de saúde próprios da área de abrangência"
      },
      {
        front: "Papel da vigilância epidemiológica nos serviços de saúde?",
        back: "Instrumento para planejamento, normatização, organização e operacionalização dos serviços de saúde"
      },
      {
        front: "Funções da vigilância epidemiológica (ciclo operacional)?",
        back: "Coleta de dados · Processamento · Análise e interpretação · Recomendação de medidas · Promoção das ações · Avaliação de eficácia/efetividade · Divulgação de informações"
      },
      {
        front: "Princípio “informação para ação” na vigilância?",
        back: "Sem informação de qualidade a vigilância não funciona · Dados gerados no município (local do evento) devem ser tratados primariamente no nível local · Coleta adequada é base do planejamento dinâmico"
      },
      {
        front: "Tipos de dados que alimentam a vigilância epidemiológica?",
        back: "Demográficos, ambientais e socioeconômicos · Morbidade · Mortalidade · Notificação de surtos, epidemias e emergências de saúde pública"
      },
      {
        front: "Dados de morbidade — por que são centrais?",
        back: "Permitem detecção imediata ou precoce de problemas sanitários · Incluem casos de infecções/doenças específicas e sequelas · Fontes: notificação, produção ambulatorial/hospitalar, investigações, busca ativa, inquéritos"
      },
      {
        front: "Dados de mortalidade — quando são mais válidos que morbidade?",
        back: "Em doenças de maior letalidade · Fatos vitais bem marcantes e razoavelmente registrados · Obtidos pelas Declarações de Óbito processadas no SIM"
      },
      {
        front: "O que é notificação (definição)?",
        back: "Comunicação da ocorrência de determinada doença ou agravo à saúde à autoridade sanitária, por profissionais de saúde ou qualquer cidadão, para adoção de medidas de intervenção pertinentes"
      },
      {
        front: "Investigação epidemiológica na vigilância — importância?",
        back: "Etapa mais nobre da metodologia · Complementa a notificação sobre fontes de infecção e mecanismos de transmissão · Pode incluir busca ativa de casos e descobrir casos não notificados"
      },
      {
        front: "Outras fontes de dados além da notificação?",
        back: "Laboratórios · Investigações epidemiológicas · Imprensa e população (sempre considerar para investigação pertinente)"
      },
      {
        front: "Vigilância epidemiológica × controle de doenças infecciosas?",
        back: "Controle pode ser alcançado por intervenções nos elos da cadeia de transmissão capazes de interrompê-la · Métodos evoluem com novos conhecimentos científicos e observação sistemática das medidas de prevenção/controle"
      }
    ]
  },
  {
    id: "pvig-sistemas",
    name: "Sistemas nacionais de informação em saúde",
    specialty: "preventiva",
    cards: [
      {
        front: "O que é o SINAN?",
        back: "Sistema de Informação de Agravos de Notificação · Mais importante para vigilância epidemiológica · Desenvolvido 1990–1993, substituiu o SNCD · Coleta e processa dados de agravos notificáveis em todo o território, desde o nível local"
      },
      {
        front: "Formulários padronizados do SINAN?",
        back: "FIN — Ficha Individual de Notificação (suspeita, notificação negativa e surtos) · FII — Ficha Individual de Investigação (roteiro por agravo; identifica fonte de infecção e mecanismos de transmissão)"
      },
      {
        front: "Análises possíveis a partir do SINAN?",
        back: "Incidência, prevalência, letalidade e mortalidade · Epidemiologia descritiva · Avaliação da qualidade dos dados · Identificação de áreas de risco e modos de transmissão"
      },
      {
        front: "O que é o SIM?",
        back: "Sistema de Informação de Mortalidade · Criado em 1975 · Instrumento de coleta: Declaração de Óbito (DO), três vias coloridas · Todo óbito exige DO (Lei 6.015/73), preenchida por médico · Registro no local de ocorrência do evento"
      },
      {
        front: "Utilidade do SIM?",
        back: "Indicadores de gravidade · Perfil de morbidade das doenças mais letais · Taxas de mortalidade geral, infantil, materna e cruzamentos da DO · Para doenças de notificação compulsória, deve ser cruzado rotineiramente com o SINAN"
      },
      {
        front: "O que é o SINASC?",
        back: "Sistema de Informações sobre Nascidos Vivos · Instrumento: Declaração de Nascido Vivo (DN) · Denominador de mortalidade infantil e materna · Dados disponíveis no DATASUS a partir de 1994 · Implantação gradual desde 1992"
      },
      {
        front: "Conceito de nascido vivo (OMS/SINASC)?",
        back: "Todo produto da concepção que, independentemente do tempo de gestação, depois de expulso ou extraído do corpo da mãe, respire ou apresente outro sinal de vida (batimento cardíaco, pulsação do cordão ou movimentos efetivos de contração voluntária), estando ou não desprendida a placenta"
      },
      {
        front: "O que é o SIH/SUS?",
        back: "Sistema de Informações Hospitalares do SUS · Criado para pagamento de internações (não sob lógica epidemiológica inicial) · Instrumento: AIH (Autorização de Internação Hospitalar) · Permite indicadores de desempenho e frequência de internações para análise epidemiológica"
      },
      {
        front: "O que é o SIA/SUS?",
        back: "Sistema de Informações Ambulatoriais do SUS · Criado em 1992, implantado a partir de jul/1994 · Financia atendimentos ambulatoriais · Coleta BPA (Individualizado e Consolidado) e APAC · Mensalmente envia base ao DATASUS, complementando o SIH"
      },
      {
        front: "O que é o SISAB?",
        back: "Sistema de Informação em Saúde para a Atenção Básica · Vigente para financiamento e adesão à PNAB · Substitui o SIAB · Integra a e-SUS AB (CDS, PEC e app AD) · Relatórios de saúde e indicadores por estado, município, região de saúde e equipe"
      },
      {
        front: "O que é o SI-PNI?",
        back: "Sistema de Informações do Programa Nacional de Imunização · Implantado em todos os municípios · Dados de cobertura vacinal de rotina e campanhas, taxas de abandono e controle de boletins · Subsistema de estoque/distribuição de imunobiológicos"
      },
      {
        front: "O que é o VIGITEL?",
        back: "Vigilância de Fatores de Risco e Proteção para Doenças Crônicas por Inquérito Telefônico · Compõe vigilância de DCNT do MS · Sorteia linhas telefônicas das 27 capitais · Entrevistas anuais com adultos ≥ 18 anos"
      },
      {
        front: "DCNT monitoradas pelo VIGITEL?",
        back: "Diabetes · Câncer · Obesidade · Doenças respiratórias crônicas · Cardiovasculares (ex.: hipertensão arterial)"
      },
      {
        front: "Fatores de risco modificáveis comuns monitorados pelo VIGITEL?",
        back: "Tabagismo · Alimentação não saudável · Inatividade física · Uso nocivo de bebidas alcoólicas"
      },
      {
        front: "Papel do SIS (Sistema de Informação em Saúde)?",
        back: "Parte dos sistemas de saúde, com vários subsistemas · Objetivo básico no SUS: possibilitar análise da situação de saúde no nível local, considerando condições de vida na determinação do processo saúde-doença"
      },
      {
        front: "Sistemas de informação × vigilância epidemiológica?",
        back: "Dados de SIM, SINASC, SIH, SIA e outros complementam o SINAN (casos não notificados e outras variáveis) · Uso conjunto deve ser estimulado para aprimorar registro e compatibilizar fontes"
      },
      {
        front: "O que é o SISVAN?",
        back: "Sistema de Informações de Vigilância Alimentar e Nutricional · Monitora estado nutricional e fatores que o influenciam · Acompanha grupos atendidos na rede, inclusive pela ESF · Implantado na maioria dos municípios"
      },
      {
        front: "O que é o SISAGUA?",
        back: "Sistema de Informação de Vigilância da Qualidade da Água para Consumo Humano · Informa qualidade da água de sistemas públicos/privados e soluções alternativas · Coleta, transmite e dissemina dados gerados na vigilância"
      },
      {
        front: "O que são sistemas sentinelas?",
        back: "Monitoram indicadores-chave na população geral ou em grupos especiais · Alerta precoce sem notificação universal de todos os casos · Vigilância constante para mudanças no padrão dos agravos · No Brasil, muito usados em infecciosas/parasitárias que demandam internação"
      }
    ]
  },
  {
    id: "pvig-notificacao",
    name: "Notificação compulsória · critérios e ESPII",
    specialty: "preventiva",
    cards: [
      {
        front: "Critérios de seleção para lista de notificação compulsória?",
        back: "Magnitude · Potencial de disseminação · Transcendência (severidade, relevância social, relevância econômica) · Vulnerabilidade (instrumentos concretos de prevenção/controle) · Emergências de saúde pública, epidemias, surtos e agravos inusitados · Compromissos internacionais"
      },
      {
        front: "Critério Magnitude na notificação compulsória?",
        back: "Doenças de elevada frequência, grandes contingentes populacionais · Altas taxas de incidência, prevalência, mortalidade e anos potenciais de vida perdidos"
      },
      {
        front: "Critério Transcendência na notificação compulsória?",
        back: "Severidade (letalidade, hospitalização, sequelas) · Relevância social (medo, repulsa, indignação) · Relevância econômica (restrições comerciais, absenteísmo, custos assistenciais/previdenciários)"
      },
      {
        front: "Quem tem obrigação formal de notificar?",
        back: "Médicos, outros profissionais de saúde e responsáveis por serviços públicos/privados que prestam assistência — mesmo diante de simples suspeita · Outros cidadãos têm dever de notificar, mas sem obrigatoriedade formal"
      },
      {
        front: "Aspectos essenciais da notificação (MS)?",
        back: "Notificar a simples suspeita (não aguardar confirmação) · Sigilo (divulgação fora do âmbito médico-sanitário só se risco à comunidade) · Notificação negativa semanal mesmo sem casos · Cobertura de toda população e rede (público, privado, filantrópico)"
      },
      {
        front: "O que é notificação compulsória imediata (NCI)?",
        back: "Realizada em até 24 horas a partir do conhecimento da ocorrência, pelo meio de comunicação mais rápido disponível · Aplica-se a doença, agravo ou evento de saúde pública"
      },
      {
        front: "O que é notificação compulsória semanal (NCS)?",
        back: "Realizada em até 7 dias a partir do conhecimento da ocorrência de doença ou agravo"
      },
      {
        front: "O que é notificação compulsória negativa?",
        back: "Comunicação semanal informando que, na semana epidemiológica, não houve doença, agravo ou evento da Lista · Indica alerta do sistema e profissionais · Deve ser enviada mesmo na ausência de casos"
      },
      {
        front: "O que é ESPII?",
        back: "Emergência de Saúde Pública de Importância Internacional · RSI-2005 (vigente desde 15/jun/2007) ampliou além de cólera, peste e febre amarela · Inclui eventos químicos e radionucleares · Notificação internacional via algoritmo específico"
      },
      {
        front: "Agravos já considerados ESPII (1º ponto do RSI)?",
        back: "Varíola · Poliomielite por poliovírus selvagem · Influenza humana causada por novo subtipo viral · SARS — notificação compulsória nos termos do RSI"
      },
      {
        front: "Ponto focal do RSI no Brasil?",
        back: "CIEVS (Centro de Informações Estratégicas e Resposta em Vigilância em Saúde), SVS/MS · Cada UF tem ponto focal estadual · Conjunto forma a Rede CIEVS"
      },
      {
        front: "Penalidade por médico não notificar doença compulsória?",
        back: "Código Penal, art. 269 — deixar de denunciar doença de notificação compulsória · Pena: detenção de 6 meses a 2 anos e multa"
      },
      {
        front: "O que é Evento de Saúde Pública (ESP)?",
        back: "Situação com potencial ameaça à saúde pública: surto/epidemia, agravo de causa desconhecida, alteração do padrão clinicoepidemiológico, epizootias ou agravos de desastres/acidentes — considerando disseminação, magnitude, gravidade, severidade, transcendência e vulnerabilidade"
      },
      {
        front: "Notificação de maus-tratos contra crianças/adolescentes?",
        back: "Portaria 1.968/GM/2001 · Responsáveis técnicos de entidades do SUS notificam ao Conselho Tutelar casos suspeitos ou confirmados · Formulário em 2 vias (Conselho Tutelar/Juizado + prontuário)"
      },
      {
        front: "Notificação de violência contra a mulher?",
        back: "Lei 10.778/2003 · Casos com indícios ou confirmação em serviços de saúde · Portaria GM/MS 78/2021: comunicar à polícia em 24 h da constatação · Forma sintética/consolidada sem identificar vítima, ou excepcionalmente com identificação se risco à vítima/comunidade"
      },
      {
        front: "Outras situações de notificação citadas no material?",
        back: "Esterilização cirúrgica (Lei 9.263/96, art. 11) · Maus-tratos contra idoso (Lei 10.741/2003, art. 19) · Internação psiquiátrica involuntária (Portaria 2.048/2009: MP em 72 h) · Violência autoprovocada (Lei 13.685/2018)"
      }
    ]
  },
  {
    id: "pvig-epidemias",
    name: "Processo epidêmico · endemia, surto, pandemia",
    specialty: "preventiva",
    cards: [
      {
        front: "O que é estrutura epidemiológica?",
        back: "Conjunto de fatores relacionados ao agente etiológico (químico, físico ou biológico), ao hospedeiro e ao meio ambiente que influencia a ocorrência natural de uma doença em comunidade e período estabelecidos · É dinâmica no tempo e espaço"
      },
      {
        front: "O que são caracteres epidemiológicos?",
        back: "Resultado da estrutura epidemiológica em cada momento · Expressam frequência e distribuição da doença segundo tempo, espaço (lugar) e pessoa"
      },
      {
        front: "Comportamento endêmico de um agravo?",
        back: "Ocorrência dentro de padrões esperados para aquele intervalo de tempo e área · Pode ter variações cíclicas ou sazonais · Comportamento normal da doença"
      },
      {
        front: "Comportamento epidêmico de um agravo?",
        back: "Elevação brusca do número de casos, com claro excesso em relação ao padrão normal esperado · Limiar varia conforme agente, população exposta e experiência prévia · Um único caso pode configurar epidemia (ex.: varíola no Brasil)"
      },
      {
        front: "Características do comportamento epidêmico?",
        back: "Aumento brusco (gradual = alteração do nível endêmico, não epidemia) · Aumento temporário, com retorno posterior aos níveis endêmicos"
      },
      {
        front: "Surto × epidemia × pandemia × onda epidêmica?",
        back: "Surto: forma particular de epidemia, ≥2 casos relacionados, período curto e espaço delimitado · Pandemia: muitos países em mais de um continente (ex.: H1N1, cólera) · Onda epidêmica: prolonga-se por vários anos (ex.: meningocócica)"
      },
      {
        front: "Controle, eliminação e erradicação?",
        back: "Controle: reduz incidência/prevalência a níveis muito baixos, deixando de ser problema relevante · Eliminação (erradicação regional): cessa transmissão em ampla região/jurisdição · Erradicação: cessa toda transmissão pela extinção artificial do agente, sem risco de reintrodução"
      },
      {
        front: "Nível endêmico de um agravo?",
        back: "Frequência e distribuição com padrões regulares de variação em período delimitado · Oscilações correspondem somente a flutuações cíclicas e sazonais"
      },
      {
        front: "Variação cíclica, sazonal e tendência secular?",
        back: "Cíclica: repetição de padrão de frequência ao longo dos anos · Sazonal: incidência máxima/mínima no mesmo período (ano, mês, semana, dia) · Secular: variação de incidência ao longo de décadas ou séculos"
      },
      {
        front: "Diagrama de controle — o que é?",
        back: "Gráfico da média mensal ± 1,96 DP da incidência/casos em período não epidêmico (habitualmente 10 anos) · Valores acima do limite máximo indicam epidemia"
      },
      {
        front: "Tipos de epidemias quanto à progressão?",
        back: "Explosivas/macicas/fonte comum: casos em rápida sucessão, exposição simultânea (ex.: cólera hídrica, toxinfecção alimentar) · Progressivas/propagadas: progressão lenta, transmissão pessoa a pessoa ou por vetor (ex.: meningocócica)"
      },
      {
        front: "Epidemia mista — exemplo clássico?",
        back: "John Snow/cólera: 1º exposição por fonte comum (água contaminada) · 2º propagação pessoa a pessoa · Curva com declínio mais lento que a fase ascendente"
      },
      {
        front: "Curva epidêmica — finalidade?",
        back: "Gráfico de casos pela data de início dos sintomas · Indica forma provável de transmissão (fonte comum × propagada) · Ajuda a identificar período provável de exposição · Intervalo útil entre 1/8 e 1/4 do período de incubação"
      },
      {
        front: "Caso autóctone × alóctone × esporádico × índice?",
        back: "Autóctone: contraiu na área de residência · Alóctone: detectado em local diferente da transmissão · Esporádico: sem relação epidemiológica com outros conhecidos · Caso-índice: primeiro caso relacionado, muitas vezes fonte de contaminação"
      },
      {
        front: "Disease, illness e sickness (antropologia médica)?",
        back: "Disease: doença apreendida pelo conhecimento médico (sinais/sintomas) · Illness: experiência pessoal do doente · Sickness: visão cultural/sociedade sobre a doença"
      },
      {
        front: "Um caso de poliomielite selvagem no Brasil — por quê é epidêmico?",
        back: "Para doenças imunopreveníveis com programa de controle/eliminação/erradicação, o limiar de normalidade segue os objetivos do programa · Um único caso confirmado de poliomielite por poliovírus selvagem já representa situação epidêmica"
      },
      {
        front: "O que são doenças emergentes?",
        back: "Doenças novas, até então desconhecidas · Causadas por vírus/bactérias desconhecidos, mutação de agente existente, ou agente antes só animal que passa a infectar humanos · Exemplos: aids, febre purpúrica brasileira, hantavirose"
      },
      {
        front: "O que são doenças reemergentes?",
        back: "Já conhecidas e controladas, mas voltam a ameaçar a saúde por aumento de incidência em local ou população · Exemplos: dengue, febre amarela, malária, tuberculose, hanseníase, leishmaniose"
      },
      {
        front: "O que são doenças negligenciadas?",
        back: "Conceito recente e polêmico · Prevalecem em condições de pobreza e mantêm desigualdade social · Endêmicas em populações de baixa renda · Exemplos: dengue, Chagas, esquistossomose, malária, hanseníase, filariose"
      },
      {
        front: "Causas comuns de emergência/reemergência citadas?",
        back: "Crescente número de pessoas vivendo e se deslocando pelo mundo · Rápidas e intensas mudanças ambientais e sociais · Entre outros fatores que favorecem disseminação e reaparecimento de infecciosas"
      },
      {
        front: "Eliminação × erradicação — diferença-chave?",
        back: "Eliminação = erradicação regional · Cessa transmissão em ampla região/jurisdição · Erradicação = extinção artificial do agente em escala global, sem risco de reintrodução, permitindo suspender medidas de prevenção/controle"
      }
    ]
  },
  {
    id: "pvig-hnd-prevencao",
    name: "História natural da doença · prevenção",
    specialty: "preventiva",
    cards: [
      {
        front: "Períodos da história natural da doença (Leavell & Clark)?",
        back: "Pré-patogênese: relações agente–hospedeiro–ambiente e condições sociais/econômicas/culturais favoráveis, mas doença ainda NÃO desenvolvida · Patogênese: agente age sobre o organismo, de alterações imperceptíveis até lesões permanentes/crônicas"
      },
      {
        front: "Prevenção primária — período e objetivo?",
        back: "Atua no pré-patogênese · Evitar a doença removendo fatores causais · Diminui incidência · Dividida em promoção da saúde e proteção específica"
      },
      {
        front: "Exemplos de proteção específica (prevenção primária)?",
        back: "Vacinação · EPI · Ações/educação e distribuição de preservativos/seringas descartáveis para prevenir HIV"
      },
      {
        front: "Exemplos de promoção da saúde (prevenção primária)?",
        back: "Tratamento de água · Desinfecção e desinfestação · Saneamento básico"
      },
      {
        front: "Prevenção secundária — período e objetivo?",
        back: "Atua no patogênico (doença já presente) · Identificar e corrigir precocemente desvios da normalidade · Diminui prevalência em doenças curáveis · Ex.: diagnóstico e tratamento"
      },
      {
        front: "Prevenção terciária — período e objetivo?",
        back: "Atua no patogênico · Reduz incapacidade e reintegra o indivíduo aproveitando capacidades remanescentes · Ex.: reintegração ocupacional, fisioterapia, terapia ocupacional"
      },
      {
        front: "Prevenção primordial?",
        back: "Evitar a instalação do fator de risco (conceito fora da história natural clássica de Leavell & Clark)"
      },
      {
        front: "Prevenção quaternária?",
        back: "Prevenção contra iatrogenias · Protege pacientes de intervenções e exames desnecessários"
      },
      {
        front: "Isolamento social/domiciar — nível de prevenção?",
        back: "Prevenção secundária · Protege o caso de complicações · Duração ≈ tempo médio de transmissibilidade · Medidas conforme agente (quarto arejado, EPI, material exclusivo)"
      },
      {
        front: "Distanciamento/afastamento social — nível de prevenção?",
        back: "Prevenção primária · Medida coletiva para evitar aglomeração e casos novos · Fechamento temporário de escolas, templos, shoppings etc."
      },
      {
        front: "Quarentena — nível de prevenção?",
        back: "Prevenção primária · Para contatos na fase subclínica · Tempo ≈ período médio de incubação · Avaliar surgimento de sintomas em domicílio"
      },
      {
        front: "Período prodrômico?",
        back: "Intervalo entre primeiros sintomas e início dos sinais/sintomas característicos que permitem diagnóstico clínico · Pródromos indicam início da doença"
      },
      {
        front: "Período de transmissibilidade (contágio)?",
        back: "Intervalo em que pessoa/animal infectado elimina agente biológico ao meio ou vetor, permitindo transmissão a novo hospedeiro"
      },
      {
        front: "Infectividade × patogenicidade × virulência?",
        back: "Infectividade: alojar-se, multiplicar-se e transmitir-se · Patogenicidade: capacidade de causar doença em suscetível · Virulência: grau de patogenicidade (gravidade, letalidade, sequelas)"
      },
      {
        front: "Suscetibilidade × resistência × imunidade?",
        back: "Suscetibilidade: ausência de resistência suficiente contra agente patogênico · Resistência: mecanismos específicos (imunidade humoral) e inespecíficos (pele, mucosa, ácido gástrico, tosse…) · Imunidade: resistência associada a anticorpos específicos"
      },
      {
        front: "Definição de caso na investigação epidemiológica?",
        back: "Padronização de critérios clínicos, laboratoriais e epidemiológicos para classificar paciente como caso · Critérios epidemiológicos delimitam tempo, espaço e pessoa · Não incluir exposição/fator de rico sob investigação na definição"
      }
    ]
  },
  {
    id: "pvig-trabalhador",
    name: "Saúde do trabalhador · acidentes e doenças ocupacionais",
    specialty: "preventiva",
    cards: [
      {
        front: "Definição de acidente de trabalho?",
        back: "Ocorre pelo exercício do trabalho formal ou informal · Pode ocasionar lesão, doença ou morte · Inclui redução temporária ou permanente da capacidade laboral"
      },
      {
        front: "Acidente de trajeto — quando é acidente de trabalho?",
        back: "Sofrido no percurso residência–trabalho ou trabalho–residência, com distância e tempo compatíveis · Percurso sindicato–residência também conta · NÃO caracteriza se o segurado interrompeu/alterou o percurso habitual por interesse pessoal"
      },
      {
        front: "Para fins previdenciários, o que equivale a acidente de trabalho?",
        back: "Doença profissional · Doença do trabalho · Acidente de trajeto"
      },
      {
        front: "O que é doença profissional?",
        back: "Relacionada ao desempenho da atividade laborativa · Síndrome típica em trabalhadores da mesma situação · Fator etiológico conhecido · Reconhecida pelo Ministério da Previdência Social · Ex.: saturnismo, silicose"
      },
      {
        front: "O que é doença do trabalho?",
        back: "Adquirida ou desencadeada em função de condições especiais em que o trabalho é realizado · Ex.: surdez em motorista de ônibus exposto a ruído extremo"
      },
      {
        front: "Classificação legal brasileira — Grupo 1 × Grupo 2?",
        back: "Grupo 1: doença profissional produzida/desencadeada pelo exercício do trabalho peculiar à atividade (relação do MTPS) · Grupo 2: adquirida/desencadeada por condições especiais do trabalho, com relação direta"
      },
      {
        front: "Classificação médico-legal — tecnopatia × mesopatia?",
        back: "Grupo 1: doença profissional típica/clássica ou tecnopatia · Grupo 2: doença do trabalho ou mesopatia (também chamada doença profissional atípica)"
      },
      {
        front: "Tipos de acidentes de trabalho citados?",
        back: "Fatais (notificação/investigação imediata; CAT em até 24 h no formal) · Graves (menor de 18 anos, ocular, fraturas, TCE, eletrocussão, politrauma, amputação, queimadura 3º grau etc.) · Típicos · De trajeto"
      },
      {
        front: "Consequências do acidente de trabalho?",
        back: "Simples assistência médica (retorno imediato) · Incapacidade temporária (<15 ou ≥15 dias — auxílio-doença acidentário se ≥15) · Incapacidade permanente total (aposentadoria por invalidez) ou parcial (auxílio-acidente) · Óbito"
      },
      {
        front: "Agentes de risco nos acidentes de trabalho?",
        back: "Físicos (ruído, calor, radiação…) · Químicos (gases, poeiras, contato, ingestão) · Biológicos · Organização do trabalho (jornada, ritmo, repetitividade, posturas, esforço, turnos)"
      },
      {
        front: "Indicadores da OIT para acidentes de trabalho?",
        back: "Índice de frequência · Índice de gravidade · Taxa de incidência · Recomendação: incluir ausências ≥1 jornada normal e trabalhadores informais/temporários"
      },
      {
        front: "Indicadores básicos adotados pela Previdência Social?",
        back: "Índices de frequência, gravidade e custo · Também citados: incidência acumulada, densidade de incidência, coeficiente de mortalidade, letalidade e coeficiente de gravidade"
      },
      {
        front: "Densidade de incidência (DI) — vantagem?",
        back: "Indicador mais acurado que incidência acumulada · Denominador: horas-homem trabalhadas · Estimativa comum: trabalhadores × 8 h/dia × 264 dias/ano (22 dias úteis × 12 meses)"
      },
      {
        front: "Acidentes são eventos agudos — característica?",
        back: "Decorrem de situações de risco presentes no local de trabalho · Diferem das doenças ocupacionais, que têm evolução mais crônica"
      },
      {
        front: "CAT — quando emitir?",
        back: "Comunicação de Acidente de Trabalho · Empresa do mercado formal deve emitir até 24 horas após acidente fatal ou grave · Acompanhar em investigação de acidentes fatais"
      }
    ]
  },
  {
    id: "pvig-etica",
    name: "Código de Ética Médica · highlights Prev3",
    specialty: "preventiva",
    cards: [
      {
        front: "Composição do Código de Ética Médica (CFM 2.217/2018)?",
        back: "25 princípios fundamentais · 10 normas diceológicas · 118 normas deontológicas · 4 disposições gerais · Transgressão deontológica sujeita a penas disciplinares previstas em lei"
      },
      {
        front: "Princípio I do CEM?",
        back: "Medicina é profissão a serviço da saúde do ser humano e da coletividade, exercida sem discriminação de nenhuma natureza"
      },
      {
        front: "Autonomia profissional (Princípio VII)?",
        back: "Médico exerce profissão com autonomia · Não é obrigado a prestar serviços contrários à consciência ou a quem não deseje · Exceção: ausência de outro médico em urgência/emergência ou se recusa traz dano ao paciente"
      },
      {
        front: "Sigilo profissional (Princípio XI)?",
        back: "Guardar sigilo sobre informações obtidas no desempenho das funções · Exceção: casos previstos em lei"
      },
      {
        front: "Medicina e comércio (Princípios IX e X)?",
        back: "Medicina não pode ser exercida como comércio · Trabalho médico não pode ser explorado por terceiros com objetivos de lucro, finalidade política ou religiosa"
      },
      {
        front: "Responsabilidade profissional — Art. 1º?",
        back: "Vedado causar dano ao paciente por imperícia, imprudência ou negligência · Responsabilidade médica é sempre pessoal e não pode ser presumida"
      },
      {
        front: "Art. 7º — urgência e emergência?",
        back: "Vedado deixar de atender em setores de urgência/emergência quando for sua obrigação, mesmo respaldado por decisão majoritária da categoria"
      },
      {
        front: "Art. 21 — autoridades sanitárias?",
        back: "Vedado deixar de colaborar com autoridades sanitárias ou infringir legislação pertinente (inclui notificação compulsória)"
      },
      {
        front: "Art. 22 — consentimento informado?",
        back: "Vedado deixar de obter consentimento do paciente/representante legal após esclarecimento · Salvo risco iminente de morte"
      },
      {
        front: "Art. 25 — tortura?",
        back: "Vedado deixar de denunciar tortura ou procedimentos degradantes/desumanos/cruéis, praticá-las, ser conivente ou fornecer meios que as facilitem"
      },
      {
        front: "Art. 34 — dever de informar?",
        back: "Vedado deixar de informar diagnóstico, prognóstico, riscos e objetivos do tratamento · Se comunicação direta puder causar dano, informar representante legal"
      },
      {
        front: "Art. 36 e §2º — abandono?",
        back: "Vedado abandonar paciente sob seus cuidados · Em doença crônica/incurável, não abandonar e continuar cuidados necessários, inclusive paliativos"
      },
      {
        front: "Art. 41 — ortotanásia?",
        back: "Vedado abreviar vida do paciente, ainda que a pedido · Em doença incurável terminal: cuidados paliativos, sem ações inúteis/obstinadas, respeitando vontade expressa do paciente/representante"
      },
      {
        front: "Art. 12 — riscos ocupacionais?",
        back: "Vedado deixar de esclarecer trabalhador sobre condições de trabalho que ponham em risco sua saúde · Comunicar empregador; se persistir, autoridades competentes e CRM"
      },
      {
        front: "Princípio XXII — cuidados paliativos?",
        back: "Em situações clínicas irreversíveis e terminais, evitar procedimentos diagnósticos/terapêuticos desnecessários e propiciar cuidados paliativos apropriados"
      }
    ]
  }
];

const out = path.join(__dirname, "..", "data", "flashcards-prev3.json");
fs.writeFileSync(out, JSON.stringify(decks, null, 2) + "\n", "utf8");
const totalCards = decks.reduce((n, d) => n + d.cards.length, 0);
console.log("wrote", out, "·", decks.length, "decks ·", totalCards, "cards");
decks.forEach((d) => console.log(" ", d.id, "·", d.cards.length, "cards"));
