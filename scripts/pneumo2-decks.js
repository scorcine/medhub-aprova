/**
 * Decks Pneumologia · Pneumo2.pdf (TB + micoses)
 * Fonte: D:\MedHub R1\CM\Pneumologia\Pneumo2.pdf
 */
module.exports = [
  {
    id: "pnm-tb-basico",
    name: "TB · epidemiologia · transmissão · patogenia",
    specialty: "clinica",
    cards: [
      { front: "Agente principal da TB e propriedade tintorial?", back: "M. tuberculosis (BK) · BAAR (Ziehl-Neelsen) · Parede rica em ácido micólico · Também ± M. bovis (complexo)" },
      { front: "O que é paciente bacilífero (apostila)?", back: "Elimina bacilos no escarro · Só TB de vias aéreas (pulmonar ou laríngea)" },
      { front: "Partícula infectante clássica?", back: "Núcleos de Wells ≤5 μm · 1–2 bacilos · Atingem bronquíolo/alvéolo · Gotículas de Flügge na tosse/fala/espirro" },
      { front: "Multibacilífero × paucibacilífero × não bacilífero?", back: "Multi: BAAR+ no escarro (cavitária/laríngea) — transmite muito · Pauci: BAAR− mas cultura/TRM+ · Não: extrapulmonar" },
      { front: "Transmissão domiciliar multi × pauci (apostila)?", back: "~50% se multibacilífera · ~5% se paucibacilífera · Contato domiciliar diário ~30–50%" },
      { front: "Criança com TB pulmonar transmite?", back: "Em geral NÃO é bacilífera · Procurar o adulto intradomiciliar multibacilífero que infectou" },
      { front: "Quantos % dos infectados adoecem?", back: "~5–10% · Metade no início, metade por reativação/reinfecção ao longo da vida" },
      { front: "Granuloma tuberculoso — papel?", back: "Contém o foco em ~95% · Imunidade celular CD4 · Viragem tuberculínica ~2–10 semanas" },
      { front: "Por que o BK prefere ápices / caverna?", back: "Aeróbio estrito · Alta tensão de O2 · Caverna = ambiente ideal para proliferação absurda de bacilos" },
      { front: "Brasil — metas OMS de cura/abandono (apostila)?", back: "Cura ≥85% · Abandono <5% · Dados citados: cura ~74,6% / abandono ~10,8% (ainda aquém)" },
      { front: "Coinfecção HIV na TB BR (ordem de grandeza)?", back: "~10% dos casos de TB diagnosticados também vivem com HIV" },
      { front: "Cada bacilífero infecta quantas pessoas/ano (estimativa)?", back: "~10–15 pessoas/ano — mantém o ciclo na população" }
    ]
  },
  {
    id: "pnm-tb-clinica-dx",
    name: "TB · formas clínicas · diagnóstico",
    specialty: "clinica",
    cards: [
      { front: "TB primária típica — jeitão?", back: "Mais criança · Como pneumonia atípica · Adenopatia hilar · ± complexo de Ghon · Pode deixar tuberculoma calcificado" },
      { front: "TB pós-primária (“do adulto”) — pistas?", back: ">3 anos após infecção · Reativação ou reinfecção · Ápices · Infiltrado → caverna → disseminação broncogênica → fibrose" },
      { front: "Fases radiológicas da pós-primária (apostila)?", back: "Inicial: infiltrado misto · Cavitária · Cavitária + disseminação · Avançada: fibrose/retração · TC: “brotos de árvore”" },
      { front: "TB miliar — ideia?", back: "Disseminação hematogênica · Rx “milhar” · Mais graves em <2a / imunossuprimidos · ± meningite" },
      { front: "Sintomático respiratório (SR) — definição geral?", back: "Tosse ≥3 semanas · Em vulneráveis muda: DM ≥2 sem · HIV, PS, indígenas, presídio, rua, imigrantes = tosse de qualquer duração" },
      { front: "Três métodos que CONFIRMAM TB (apostila)?", back: "TRM-TB · Baciloscopia · Cultura (+ TSA)" },
      { front: "TRM-TB — papel e limites?", back: "Escolha no BR para TB pulmonar/laríngea em adultos · ~2h · Sens ~90% / esp ~99% · Detecta DNA vivo/morto → NÃO serve para acompanhar tratamento · Sinaliza resistência à R" },
      { front: "Baciloscopia — coleta e acompanhamento?", back: "2 amostras (consulta + manhã seguinte) · Ziehl-Neelsen · Exame de escolha para acompanhar resposta (negativação)" },
      { front: "Cultura + TSA — papel?", back: "Alta sensibilidade · Meios sólido/líquido · TSA guia resistência · Obrigatória em materiais não-escarro (baixa sens. da BAAR)" },
      { front: "Sequelas da caverna (apostila)?", back: "Fibrose · Bronquiectasias · Aspergiloma (fungus ball) · Hemoptise · Empiema/hidropneumotórax se fístula" },
      { front: "TB na AIDS — quando CD4 baixo?", back: "Formas atípicas · Pode mimetizar pneumocistose (infiltrado difuso) · Mais derrame/adenopatia · Menos cavitação clássica" },
      { front: "Pegadinha: criança doente → o que fazer?", back: "Tratar a criança E rastrear/fonte adulta bacilífera no domicílio" }
    ]
  },
  {
    id: "pnm-tb-tratamento",
    name: "TB · RIPE · TDO · efeitos · resistência",
    specialty: "clinica",
    cards: [
      { front: "Esquema básico ≥10 anos (apostila)?", back: "2 RIPE / 4 RI · Casos novos e retratamento (exceto meningoencefalite e osteoarticular)" },
      { front: "Esquema básico <10 anos?", back: "2 RIP / 4 RI (sem etambutol no básico infantil clássico da apostila)" },
      { front: "Meningoencefalite / osteoarticular ≥10a?", back: "2 RIPE / 10 RI · + corticoide na meningoencefalite (não na osteoarticular) · Osteo “baixa complexidade” pode 6 meses a critério" },
      { front: "Corticoide na meningite TB — como?", back: "Prednisona 1–2 mg/kg/dia × 4 sem OU dexametasona IV 0,3–0,4 mg/kg/dia × 4–8 sem + desmame · Fisioterapia precoce" },
      { front: "TDO no Brasil — regra?", back: "TODOS os casos · Observar deglutição + vínculo · Mín. 24 doses na intensiva + 48 na manutenção · Familiar sozinho ↑ má adesão" },
      { front: "Efeitos menores × maiores?", back: "Menores: não suspende (APS) · Maiores: suspende temporariamente, muitas vezes muda esquema · Hipersensibilidade grave → droga fora para sempre" },
      { front: "Risco ↑ de efeitos adversos anti-TB?", back: "Idade ≥40 (progressivo) · Álcool >80 g/dia · Desnutrição (perda >15%) · Hepatopatia · HIV" },
      { front: "Falência terapêutica — critérios (apostila)?", back: "BAAR+ ao fim · ++/+++ inicial que persiste até o 4º mês · Negativou e positivou de novo após o 4º mês por 2 meses seguidos" },
      { front: "TRM com resistência à R — o que implica?", back: "~80% também H-resistente (= MDR) · Repetir TRM · Encaminhar terciário · Esquema inicial TB-RR (ex.: Cm EP Lfx Trd…) · Cultura redefine · MDR 18–24 meses" },
      { front: "TB na gestação / aleitamento?", back: "Esquema básico OK na gestação e aleitamento · Se TB ativa no parto → biópsia/cultura da placenta · Aleitamento contraindicado só na mastite TB · Máscara nos cuidados" },
      { front: "HIV + TB — ordem das drogas (apostila)?", back: "Não iniciar TARV junto com tuberculostáticos no mesmo dia · Começar TB primeiro, depois TARV (risco sobreposição/IRIS)" },
      { front: "Acompanhar cura na bacilífera — exame?", back: "Baciloscopia mensal · TRM NÃO acompanha resposta" }
    ]
  },
  {
    id: "pnm-tb-contatos",
    name: "TB · contatos · ILTB · PPD · IGRA · BCG",
    specialty: "clinica",
    cards: [
      { front: "ILTB × TB doença?", back: "ILTB: abriga BK sem sinais de doença · TB doença: manifestações patológicas · Tratar ILTB reduz adoecimento futuro" },
      { front: "Como pesquisar ILTB?", back: "Prova tuberculínica (PPD/Mantoux) ou IGRA · Sempre excluir TB doença antes (clínica + Rx ± escarro)" },
      { front: "PPD — técnica e corte no BR (apostila)?", back: "2 UT intradérmicas · Lê induração 48–72h · Reação tipo IV · Toda PT ≥5 mm = infecção pelo M. tuberculosis" },
      { front: "Adulto assintomático contactante com PT <5 mm?", back: "Repetir PT em 8 semanas (janela imunológica) · Conversão = infecção" },
      { front: "IGRA — vantagem chave?", back: "Antígenos específicos do M. tb · Não cruzam com BCG/MNT · Especificidade ~100% · Mede IFN-γ de linfócitos sensibilizados" },
      { front: "RN contactante de bacilífero — conduta (apostila)?", back: "NÃO vacinar BCG ao nascer · Isoniazida ou R × 3 meses · Depois PPD: ≥5 mm → completar ILTB (H +3m ou R +1m) e não precisa BCG · <5 mm → suspende e vacina BCG" },
      { front: "BCG — como e o que previne?", back: "0,1 mL ID braço direito · Sem PT prévia · Reduz formas graves (~75%): meningite e miliar em <4a · Não impede infecção/TB pulmonar do adulto" },
      { front: "Criança <10a contactante assintomática — ideia?", back: "Rx tórax + PT ou IGRA · Sintomática: sistema de pontuação + ± lavado gástrico se não expectora" },
      { front: "Indicações clássicas de tratar ILTB (além de contato)?", back: "Imunossupressão, HIV, neoplasias (cabeça/pescoço, hematológicas), quimio imunossupressora… · (contexto de risco de adoecimento)" },
      { front: "Pegadinha BCG × PPD?", back: "BCG pode interferir na PT · IGRA não · No BR o corte operacional da apostila unifica PT ≥5 mm como infecção" }
    ]
  },
  {
    id: "pnm-tb-extra",
    name: "TB extrapulmonar",
    specialty: "clinica",
    cards: [
      { front: "Forma extrapulmonar mais comum no adulto sem HIV?", back: "TB pleural (pleurite tuberculosa)" },
      { front: "Mecanismo da TB pleural típica?", back: "Ruptura de foco subpleural primário · Poucos bacilos → reação imunológica · Derrame unilateral moderado · Exsudato linfocitário (PMN nos primeiros 15 dias)" },
      { front: "ADA no líquido pleural — papel?", back: ">40 U/L → alto VPP para TB · Apoia diagnóstico clinicoepidemiológico · Confirmação ideal: biópsia + cultura do fragmento" },
      { front: "TB pleural × empiema tuberculoso?", back: "Pleurite: paucibacilar, muitas vezes autolimitada · Empiema: ruptura de caverna → fístula, hidropneumotórax, muitos bacilos → drenar cedo" },
      { front: "Líquido pleural TB — outras pistas?", back: "Glicose baixa (raramente <20) · Poucas células mesoteliais (≠ neoplasia) · Citologia linfocitária" },
      { front: "TB meníngea — gravidade e DD?", back: "Forma grave do SNC · BCG reduz · Evolução subaguda · DD: sarcoide, linfoma, brucelose · Suspeitou: investigar · ± tuberculoma" },
      { front: "Mal de Pott — o que é?", back: "Espondilite tuberculosa · Encunhamento anterior + perda de espaço discal · Abscesso paravertebral frequente · ≠ neoplasia (TB não respeita o mesmo padrão)" },
      { front: "TB ganglionar (escrófula)?", back: "Adenite cervical clássica · Em HIV a positividade microbiológica é maior · Sem HIV biópsia/cultura mais difíceis" },
      { front: "TB pericárdica — tratamento extra?", back: "RIPE 6 meses · Corticoide associado nos primeiros meses (reduz complicações) · Pericardiectomia se constritiva/derrame refratário · Constritiva pode ocorrer mesmo tratado" },
      { front: "TB genital feminina — pegadinha?", back: "Salpingite tuberculosa = causa importante de esterilidade no BR" },
      { front: "Polisserosite tuberculosa?", back: "Ascite + derrame pleural ± pericárdico no mesmo contexto hematogênico" },
      { front: "Extrapulmonar é bacilífera?", back: "Caracteristicamente paucibacilar · Diagnóstico bacteriológico difícil · Sempre pensar em TB pulmonar associada (escarro)" }
    ]
  },
  {
    id: "pnm-micoses",
    name: "Micoses pulmonares · PCM · histo",
    specialty: "clinica",
    cards: [
      { front: "PCM — agente e distribuição?", back: "Paracoccidioides brasiliensis (dimórfico) · Solo/vegetais · América Latina · BR: rural SE, CO e Sul · Homem 40–60a (14:1) — estrógeno inibe transformação" },
      { front: "PCM transmite pessoa a pessoa?", back: "NÃO · Contaminação por inalação em atividade agrícola · Doença não contagiosa" },
      { front: "PCM — tratamento (apostila)?", back: "Itraconazol 100–200 mg/dia (escolha) · SMX-TMP opção barata · Anfo B IV só graves/disseminados (fase inicial) · Cetoconazol = menos potente / mais tóxico" },
      { front: "Histoplasmose — reservatório?", back: "H. capsulatum · Solo úmido · Cavernas/morcegos · Galinheiros/pombos · Inalação · Sem transmissão pessoa-pessoa" },
      { front: "Aspergiloma — contexto na apostila de TB?", back: "Cavidade residual fibrosada pós-TB · Fungus ball · Hemoptise possível" },
      { front: "Lista de micoses pulmonares citadas?", back: "PCM · Histoplasmose · Criptococose · Aspergilose · (± Pneumocystis na Infecto/AIDS)" },
      { front: "PCM × TB — DD mental?", back: "Ambas crônicas cavitárias/mucosas possíveis · PCM: mucosas orais, adrenal, rural BR · Microbiologia/sorologia diferenciam · Não é contagiosa" },
      { front: "Pegadinha de prova em micose BR?", back: "PCM = micose sistêmica clássica do interior · Homem rural · Itraconazol · Sem isolamento respiratório por contágio" }
    ]
  }
];
