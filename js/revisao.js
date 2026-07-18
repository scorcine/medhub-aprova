/* Revisões direcionadas a provas R1 */

const APROVA_REVISAO_MODULES = {
  neonatologia: {
    label: "Neonatologia",
    file: "data/revisao-neonatologia.json?v=20260718t",
    specialty: "pediatria"
  },
  alimentacao: {
    label: "Alimentação",
    file: "data/revisao-alimentacao.json?v=20260718t",
    specialty: "pediatria"
  },
  "avaliacao-nutricional": {
    label: "Avaliação nutricional",
    file: "data/revisao-avaliacao-nutricional.json?v=20260718t",
    specialty: "pediatria"
  },
  imunizacoes: {
    label: "Imunizações",
    file: "data/revisao-imunizacoes.json?v=20260718t",
    specialty: "pediatria"
  },
  diabetes: {
    label: "Diabetes",
    file: "data/revisao-diabetes.json?v=20260718t",
    specialty: "pediatria"
  },
  ped6: {
    label: "Nefro / Infecto / Cardio",
    file: "data/revisao-ped6.json?v=20260718t",
    specialty: "pediatria"
  },
  respiratorio: {
    label: "Respiratório",
    file: "data/revisao-respiratorio.json?v=20260718t",
    specialty: "pediatria"
  },
  "gastro-neuro": {
    label: "Gastro / Neuro",
    file: "data/revisao-gastro-neuro.json?v=20260718t",
    specialty: "pediatria"
  },
  "nefro-extra": {
    label: "Nefro (SN / GNA)",
    file: "data/revisao-nefro-extra.json?v=20260718t",
    specialty: "pediatria"
  },
  "r1-extra": {
    label: "Dengue / Hemato / Orto",
    file: "data/revisao-r1-extra.json?v=20260718t",
    specialty: "pediatria"
  },
  "r1-lacunas": {
    label: "Cirurgia / Alergia / Abuso",
    file: "data/revisao-r1-lacunas.json?v=20260718t",
    specialty: "pediatria"
  },
  gin1: {
    label: "Endócrino / ciclo",
    file: "data/revisao-gin1.json?v=20260718aj",
    specialty: "go",
    area: "ginecologia"
  },
  gin2: {
    label: "SUA / miomatose",
    file: "data/revisao-gin2.json?v=20260718aj",
    specialty: "go",
    area: "ginecologia"
  },
  gin3: {
    label: "Climatério / urogin",
    file: "data/revisao-gin3.json?v=20260718aj",
    specialty: "go",
    area: "ginecologia"
  },
  gin4: {
    label: "Mastologia / ovário",
    file: "data/revisao-gin4.json?v=20260718aj",
    specialty: "go",
    area: "ginecologia"
  },
  gin5: {
    label: "Oncoginecologia",
    file: "data/revisao-gin5.json?v=20260718aj",
    specialty: "go",
    area: "ginecologia"
  },
  gin6: {
    label: "Infecto / IST",
    file: "data/revisao-gin6.json?v=20260718aj",
    specialty: "go",
    area: "ginecologia"
  },
  obs1: {
    label: "Parto operatório · Med. fetal · Puerpério",
    file: "data/revisao-obs1.json?v=20260718al",
    specialty: "go",
    area: "obstetricia"
  },
  obs2: {
    label: "Diagnóstico de gravidez · Pré-natal",
    file: "data/revisao-obs2.json?v=20260718am",
    specialty: "go",
    area: "obstetricia"
  },
  obs3: {
    label: "Parto · RPMO · Prematuridade",
    file: "data/revisao-obs3.json?v=20260718an",
    specialty: "go",
    area: "obstetricia"
  },
  obs4: {
    label: "Sangramentos na gestação",
    file: "data/revisao-obs4.json?v=20260718ao",
    specialty: "go",
    area: "obstetricia"
  },
  obs5: {
    label: "HAS · Diabetes · Gemelaridade",
    file: "data/revisao-obs5.json?v=20260718ap",
    specialty: "go",
    area: "obstetricia"
  },
  "cir-abdome-agudo": {
    label: "Abdome agudo · urgências (~12–24%)",
    file: "data/revisao-cir-abdome-agudo.json?v=20260718az",
    specialty: "cirurgia"
  },
  "cir-trauma": {
    label: "Trauma · ATLS (~14%)",
    file: "data/revisao-cir-trauma.json?v=20260718az",
    specialty: "cirurgia"
  },
  "cir-perioperatorio": {
    label: "Pré/pós-op · Anestesia · Hérnias (~20%)",
    file: "data/revisao-cir-perioperatorio.json?v=20260718az",
    specialty: "cirurgia"
  },
  "cir-infantil": {
    label: "Cirurgia infantil (~9%)",
    file: "data/revisao-cir-infantil.json?v=20260718az",
    specialty: "cirurgia"
  },
  "cir-vascular": {
    label: "Cirurgia vascular (~8–16%)",
    file: "data/revisao-cir-vascular.json?v=20260718az",
    specialty: "cirurgia"
  },
  "cir-ad": {
    label: "Aparelho digestivo · eletivo / onco / procto",
    file: "data/revisao-cir-ad.json?v=20260718az",
    specialty: "cirurgia"
  },
  "cir-especialidades": {
    label: "Especialidades R1 · uro · tórax · plástica",
    file: "data/revisao-cir-especialidades.json?v=20260718az",
    specialty: "cirurgia"
  },
  "reu-ar": {
    label: "Artrite reumatoide (REU1)",
    file: "data/revisao-reu-ar.json?v=20260718bb",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-aij": {
    label: "AIJ · Still (REU1)",
    file: "data/revisao-reu-aij.json?v=20260718bb",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-spa": {
    label: "Espondiloartrites · AINEs (REU1)",
    file: "data/revisao-reu-spa.json?v=20260718bb",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-oa": {
    label: "Osteoartrose (REU2)",
    file: "data/revisao-reu-oa.json?v=20260718bc",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-cristais": {
    label: "Gota e cristais (REU2)",
    file: "data/revisao-reu-cristais.json?v=20260718bc",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-fr": {
    label: "Febre reumática (REU2)",
    file: "data/revisao-reu-fr.json?v=20260718bc",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-infecciosa": {
    label: "Artrites infecciosas (REU2)",
    file: "data/revisao-reu-infecciosa.json?v=20260718bc",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-extras2": {
    label: "Extras REU2 · FFM · fibromialgia",
    file: "data/revisao-reu-extras2.json?v=20260718bc",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-les": {
    label: "LES (REU3)",
    file: "data/revisao-reu-les.json?v=20260718bd",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-saf": {
    label: "SAF (REU3)",
    file: "data/revisao-reu-saf.json?v=20260718bd",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-es": {
    label: "Esclerose sistêmica (REU3)",
    file: "data/revisao-reu-es.json?v=20260718bd",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-outras-colag": {
    label: "Miopatias · Sjögren · DMTC (REU3)",
    file: "data/revisao-reu-outras-colag.json?v=20260718bd",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-vasculites": {
    label: "Vasculites (REU3)",
    file: "data/revisao-reu-vasculites.json?v=20260718bd",
    specialty: "clinica",
    area: "reumatologia"
  },
  "reu-amiloidose": {
    label: "Amiloidoses (REU3)",
    file: "data/revisao-reu-amiloidose.json?v=20260718bd",
    specialty: "clinica",
    area: "reumatologia"
  },
  "psi-substancias": {
    label: "Substâncias · álcool · drogas",
    file: "data/revisao-psi-substancias.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "psi-humor": {
    label: "Humor · depressão · bipolar",
    file: "data/revisao-psi-humor.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "psi-psicose": {
    label: "Esquizofrenia · antipsicóticos",
    file: "data/revisao-psi-psicose.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "psi-ansiedade": {
    label: "Ansiedade · TOC · trauma",
    file: "data/revisao-psi-ansiedade.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "psi-organicos": {
    label: "Delirium · demência",
    file: "data/revisao-psi-organicos.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "psi-alimentares": {
    label: "Transtornos alimentares",
    file: "data/revisao-psi-alimentares.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "psi-basico": {
    label: "Psicopatologia · personalidade",
    file: "data/revisao-psi-basico.json?v=20260718be",
    specialty: "clinica",
    area: "psiquiatria"
  },
  "pnm-intensiva": {
    label: "Intensiva · VM · SDRA",
    file: "data/revisao-pnm-intensiva.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-tep": {
    label: "TEP · embolia pulmonar",
    file: "data/revisao-pnm-tep.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-asma": {
    label: "Asma · GINA",
    file: "data/revisao-pnm-asma.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-dpoc": {
    label: "DPOC · GOLD",
    file: "data/revisao-pnm-dpoc.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-derrame": {
    label: "Derrame pleural · Light",
    file: "data/revisao-pnm-derrame.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-cancer": {
    label: "Câncer de pulmão",
    file: "data/revisao-pnm-cancer.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-basico": {
    label: "Espirometria · gasometria",
    file: "data/revisao-pnm-basico.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-intersticial": {
    label: "Intersticiais · sarcoidose",
    file: "data/revisao-pnm-intersticial.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-tb": {
    label: "TB · RIPE · ILTB",
    file: "data/revisao-pnm-tb.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-tb-extra": {
    label: "TB extrapulmonar",
    file: "data/revisao-pnm-tb-extra.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "pnm-micoses": {
    label: "Micoses pulmonares",
    file: "data/revisao-pnm-micoses.json?v=20260718bh",
    specialty: "clinica",
    area: "pneumologia"
  },
  "neu-avc": {
    label: "AVC · AIT · HSA",
    file: "data/revisao-neu-avc.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "neu-epilepsia": {
    label: "Epilepsia · status",
    file: "data/revisao-neu-epilepsia.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "neu-coma": {
    label: "Coma · HIC",
    file: "data/revisao-neu-coma.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "neu-cefaleia": {
    label: "Cefaleias",
    file: "data/revisao-neu-cefaleia.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "neu-neuromuscular": {
    label: "Neuromuscular",
    file: "data/revisao-neu-neuromuscular.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "neu-demencia": {
    label: "Demências · Parkinson",
    file: "data/revisao-neu-demencia.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "neu-em": {
    label: "EM · tumores · misc",
    file: "data/revisao-neu-em.json?v=20260718bj",
    specialty: "clinica",
    area: "neurologia"
  },
  "nef-basico": {
    label: "Básico glomerular",
    file: "data/revisao-nef-basico.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-nefritica": {
    label: "Nefrítica · GNPE",
    file: "data/revisao-nef-nefritica.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-nefrotica": {
    label: "Síndrome nefrótica",
    file: "data/revisao-nef-nefrotica.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-especificas": {
    label: "Glomerulopatias específicas",
    file: "data/revisao-nef-especificas.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-nta": {
    label: "NTA · tóxicos · rabdo",
    file: "data/revisao-nef-nta.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-nia-nic": {
    label: "NIA · NIC · papila",
    file: "data/revisao-nef-nia-nic.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-tubulares": {
    label: "ATR · Fanconi",
    file: "data/revisao-nef-tubulares.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-vascular": {
    label: "Vascular · ateroêmbolo",
    file: "data/revisao-nef-vascular.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-solucoes": {
    label: "Soluções · Mg · tampões",
    file: "data/revisao-nef-solucoes.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-ira": {
    label: "IRA · KDIGO · diálise",
    file: "data/revisao-nef-ira.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-drc": {
    label: "DRC · uremia · DMO",
    file: "data/revisao-nef-drc.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-litiase": {
    label: "Nefrolitíase",
    file: "data/revisao-nef-litiase.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-prostata": {
    label: "HPB · CA próstata",
    file: "data/revisao-nef-prostata.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "nef-uro-extra": {
    label: "Oncouro · cistos · hematúria",
    file: "data/revisao-nef-uro-extra.json?v=20260718bo",
    specialty: "clinica",
    area: "nefrologia"
  },
  "infc-protozoarios": {
    label: "Protozoários intestinais",
    file: "data/revisao-infc-protozoarios.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-helmintos": {
    label: "Nematoides intestinais",
    file: "data/revisao-infc-helmintos.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-cestoides": {
    label: "Tênias · toxocaríase",
    file: "data/revisao-infc-cestoides.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-esquisto": {
    label: "Esquistossomose",
    file: "data/revisao-infc-esquisto.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-pac-clinica": {
    label: "PAC · clínica · agentes",
    file: "data/revisao-infc-pac-clinica.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-pac-conduta": {
    label: "PAC · escores · empírico",
    file: "data/revisao-infc-pac-conduta.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-abscesso": {
    label: "Abscesso pulmonar",
    file: "data/revisao-infc-abscesso.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-antibioticos": {
    label: "Antibióticos",
    file: "data/revisao-infc-antibioticos.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-hiv-oi": {
    label: "HIV · OI resp/GI",
    file: "data/revisao-infc-hiv-oi.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-hiv-snc": {
    label: "HIV · SNC · olho",
    file: "data/revisao-infc-hiv-snc.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-hiv-neoplasias": {
    label: "HIV · neoplasias",
    file: "data/revisao-infc-hiv-neoplasias.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-itu": {
    label: "ITU",
    file: "data/revisao-infc-itu.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-pele": {
    label: "Pele e partes moles",
    file: "data/revisao-infc-pele.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-osteo": {
    label: "Osteomielite",
    file: "data/revisao-infc-osteo.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-dengue": {
    label: "Dengue",
    file: "data/revisao-infc-dengue.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-arbovirus": {
    label: "Chik · Zika · FA",
    file: "data/revisao-infc-arbovirus.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-malaria": {
    label: "Malária",
    file: "data/revisao-infc-malaria.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "infc-tropicais": {
    label: "Lepto · calazar · maculosa",
    file: "data/revisao-infc-tropicais.json?v=20260718bv",
    specialty: "clinica",
    area: "infectologia"
  },
  "hep-basico": {
    label: "Hepatograma · icterícia",
    file: "data/revisao-hep-basico.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-virais-agudas": {
    label: "Hepatites virais agudas",
    file: "data/revisao-hep-virais-agudas.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-virais-cronicas": {
    label: "Hepatites B e C crônicas",
    file: "data/revisao-hep-virais-cronicas.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-fulminante": {
    label: "Insuficiência hepática fulminante",
    file: "data/revisao-hep-fulminante.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-esteatose": {
    label: "Cirrose · DHA · DHGNA",
    file: "data/revisao-hep-esteatose.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-autoimune": {
    label: "HAI · CBP · CEP",
    file: "data/revisao-hep-autoimune.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-metabolicas": {
    label: "Wilson · hemocromatose · DILI",
    file: "data/revisao-hep-metabolicas.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-descompensacao": {
    label: "IHC · ascite · PBE · SHR",
    file: "data/revisao-hep-descompensacao.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-htp-varizes": {
    label: "HTP · varizes · TIPS",
    file: "data/revisao-hep-htp-varizes.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-transplante": {
    label: "Transplante hepático",
    file: "data/revisao-hep-transplante.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hep-biliar": {
    label: "Biliar · abscesso · hidático",
    file: "data/revisao-hep-biliar.json?v=20260718cb",
    specialty: "clinica",
    area: "hepatologia"
  },
  "hema-anemias": {
    label: "Anemias · ferropriva · ADC",
    file: "data/revisao-hema-anemias.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-megaloblastica": {
    label: "Anemia megaloblástica",
    file: "data/revisao-hema-megaloblastica.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-hemoliticas": {
    label: "Hemolíticas · hemoglobinopatias",
    file: "data/revisao-hema-hemoliticas.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-smd": {
    label: "SMD · sideroblástica",
    file: "data/revisao-hema-smd.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-leucemias": {
    label: "Leucemias",
    file: "data/revisao-hema-leucemias.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-nmp": {
    label: "Neoplasias mieloproliferativas",
    file: "data/revisao-hema-nmp.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-linfomas": {
    label: "Linfomas · Hodgkin · LNH",
    file: "data/revisao-hema-linfomas.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-mieloma": {
    label: "Mieloma · gamopatias",
    file: "data/revisao-hema-mieloma.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-hemostasia": {
    label: "Princípios da hemostasia",
    file: "data/revisao-hema-hemostasia.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-plaquetas": {
    label: "PTI · PTT · SHU",
    file: "data/revisao-hema-plaquetas.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "hema-coagulacao": {
    label: "Hemofilia · vW · CID · anticoagulação",
    file: "data/revisao-hema-coagulacao.json?v=20260718cf",
    specialty: "clinica",
    area: "hematologia"
  },
  "endo-tireoide": {
    label: "Tireoide · hipertireoidismo · Graves",
    file: "data/revisao-endo-tireoide.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-hipotireo": {
    label: "Hipotireoidismo · tireoidites",
    file: "data/revisao-endo-hipotireo.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-nodulos": {
    label: "Nódulos · câncer de tireoide",
    file: "data/revisao-endo-nodulos.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-adrenal": {
    label: "Suprarrenal",
    file: "data/revisao-endo-adrenal.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-paratireoide": {
    label: "Paratireoide · cálcio",
    file: "data/revisao-endo-paratireoide.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-hipofise": {
    label: "Hipófise · hipotálamo",
    file: "data/revisao-endo-hipofise.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-dm": {
    label: "Diabetes · diagnóstico · tratamento",
    file: "data/revisao-endo-dm.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-dm-complicacoes": {
    label: "DM · crônicas · pé",
    file: "data/revisao-endo-dm-complicacoes.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-urgencias-dm": {
    label: "CAD · HHNS · hipoglicemia",
    file: "data/revisao-endo-urgencias-dm.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "endo-obesidade": {
    label: "Obesidade",
    file: "data/revisao-endo-obesidade.json?v=20260718cn",
    specialty: "clinica",
    area: "endocrinologia"
  },
  "cardio-scc": {
    label: "Síndrome coronariana crônica",
    file: "data/revisao-cardio-scc.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-sca": {
    label: "SCA · NSTEMI · STEMI",
    file: "data/revisao-cardio-sca.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-pericardio": {
    label: "Pericardiopatias",
    file: "data/revisao-cardio-pericardio.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-icc": {
    label: "Insuficiência cardíaca",
    file: "data/revisao-cardio-icc.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-has": {
    label: "Hipertensão arterial",
    file: "data/revisao-cardio-has.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-valvas": {
    label: "Valvopatias · endocardite",
    file: "data/revisao-cardio-valvas.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-miopatias": {
    label: "Cardiomiopatias · semiologia · HP",
    file: "data/revisao-cardio-miopatias.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-fa": {
    label: "FA · flutter · taquicardias",
    file: "data/revisao-cardio-fa.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-bradi": {
    label: "Bradiarritmias · BAV · marca-passo",
    file: "data/revisao-cardio-bradi.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "cardio-pcr": {
    label: "PCR · antiarrítmicos",
    file: "data/revisao-cardio-pcr.json?v=20260718da",
    specialty: "clinica",
    area: "cardiologia"
  },
  "prev-sus": {
    label: "SUS · APS · programas",
    file: "data/revisao-prev-sus.json?v=20260718da",
    specialty: "preventiva"
  },
  "prev-epidemiologia": {
    label: "Epidemiologia · estudos · testes",
    file: "data/revisao-prev-epidemiologia.json?v=20260718da",
    specialty: "preventiva"
  },
  "prev-vigilancia": {
    label: "Vigilância · HND · ética",
    file: "data/revisao-prev-vigilancia.json?v=20260718da",
    specialty: "preventiva"
  },
  "prev-indicadores": {
    label: "Indicadores · mortalidade · Swaroop-Uemura",
    file: "data/revisao-prev-indicadores.json?v=20260718da",
    specialty: "preventiva"
  }
};

const APROVA_GO_AREAS = {
  ginecologia: {
    id: "ginecologia",
    label: "Ginecologia",
    blurb: "Endócrino, SUA, onco, mama, infecto e urogin"
  },
  obstetricia: {
    id: "obstetricia",
    label: "Obstetrícia",
    blurb: "Pré-natal, parto, sangramentos, HAS, DM e gemelar"
  }
};

const APROVA_CLI_AREAS = {
  cardiologia: {
    id: "cardiologia",
    label: "Cardiologia",
    blurb: "Série Car1–3 · SCA, ICC, arritmias, HAS e valvas (alto peso CM)"
  },
  reumatologia: {
    id: "reumatologia",
    label: "Reumatologia",
    blurb: "AR, LES, gota, SpA, vasculites e colagenoses"
  },
  psiquiatria: {
    id: "psiquiatria",
    label: "Psiquiatria",
    blurb: "Substâncias, humor, psicose, ansiedade e orgânicos"
  },
  pneumologia: {
    id: "pneumologia",
    label: "Pneumologia",
    blurb: "Asma, DPOC, TEP, intensiva, derrame, câncer, TB e micoses"
  },
  neurologia: {
    id: "neurologia",
    label: "Neurologia",
    blurb: "AVC, epilepsia, coma, cefaleia e neuromuscular"
  },
  nefrologia: {
    id: "nefrologia",
    label: "Nefrologia",
    blurb: "Série completa Nefro 1–5 · glomérulos à uro"
  },
  infectologia: {
    id: "infectologia",
    label: "Infectologia",
    blurb: "Série completa Inf1–5 · parasitoses à tropicais"
  },
  hepatologia: {
    id: "hepatologia",
    label: "Hepatologia",
    blurb: "Série completa Hep1–4 · virais à biliar/descompensação"
  },
  hematologia: {
    id: "hematologia",
    label: "Hematologia",
    blurb: "Série completa Hem1–3 · anemias, onco-hemato e hemostasia"
  },
  endocrinologia: {
    id: "endocrinologia",
    label: "Endocrinologia",
    blurb: "Série completa End1–3 · tireoide, adrenal e diabetes"
  }
};

const AprovaRevisao = {
  cache: {},
  activeModuleId: "neonatologia",
  activeProfileId: "geral",

  async loadModule (moduleId) {
    const id = moduleId || this.activeModuleId || "neonatologia";
    if (this.cache[id]) return this.cache[id];
    const meta = APROVA_REVISAO_MODULES[id];
    if (!meta) {
      this.cache[id] = null;
      return null;
    }
    try {
      const res = await fetch(meta.file);
      if (!res.ok) throw new Error("fail");
      this.cache[id] = await res.json();
      return this.cache[id];
    } catch {
      this.cache[id] = null;
      return null;
    }
  },

  async loadNeonatologia () {
    return this.loadModule("neonatologia");
  },

  moduleSpecialty (moduleId) {
    const meta = APROVA_REVISAO_MODULES[moduleId];
    return (meta && meta.specialty) || "pediatria";
  },

  moduleArea (moduleId) {
    const meta = APROVA_REVISAO_MODULES[moduleId];
    return (meta && meta.area) || null;
  },

  listModules (specialty, area) {
    return Object.keys(APROVA_REVISAO_MODULES)
      .filter(id => {
        if (specialty && this.moduleSpecialty(id) !== specialty) return false;
        if (area && this.moduleArea(id) !== area) return false;
        return true;
      })
      .map(id => ({
        id,
        label: APROVA_REVISAO_MODULES[id].label,
        specialty: this.moduleSpecialty(id),
        area: this.moduleArea(id)
      }));
  },

  listGoAreas () {
    return Object.keys(APROVA_GO_AREAS).map(id => ({
      id,
      label: APROVA_GO_AREAS[id].label,
      blurb: APROVA_GO_AREAS[id].blurb || ""
    }));
  },

  listCliAreas () {
    return Object.keys(APROVA_CLI_AREAS).map(id => ({
      id,
      label: APROVA_CLI_AREAS[id].label,
      blurb: APROVA_CLI_AREAS[id].blurb || ""
    }));
  },

  setActiveModule (id) {
    this.activeModuleId = APROVA_REVISAO_MODULES[id] ? id : "neonatologia";
  },

  async getProfiles (moduleId) {
    const data = await this.loadModule(moduleId || this.activeModuleId);
    return data && Array.isArray(data.profiles) ? data.profiles : [];
  },

  async getProfile (id, moduleId) {
    const profiles = await this.getProfiles(moduleId || this.activeModuleId);
    return profiles.find(p => p.id === id) || profiles[0] || null;
  },

  setActiveProfile (id) {
    this.activeProfileId = id || "geral";
  }
};

function aprovaEscapeHtml (str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function aprovaYieldClass (yieldLabel) {
  if (yieldLabel === "Máximo") return "max";
  if (yieldLabel === "Alto") return "high";
  if (yieldLabel === "Médio-alto") return "mid";
  return "low";
}

async function aprovaRenderRevisaoNeo (profileId, moduleId) {
  const root = document.getElementById("revisao-neo-root");
  const titleEl = document.getElementById("rev-neo-title");
  const subEl = document.getElementById("rev-neo-sub");
  if (!root) return;

  const mid = moduleId || AprovaRevisao.activeModuleId || "neonatologia";
  AprovaRevisao.setActiveModule(mid);
  const moduleSpec = AprovaRevisao.moduleSpecialty(mid);
  const moduleLabel = (APROVA_REVISAO_MODULES[mid] && APROVA_REVISAO_MODULES[mid].label) ||
    (moduleSpec === "go"
      ? "Ginecologia"
      : moduleSpec === "cirurgia"
        ? "Cirurgia"
        : moduleSpec === "clinica"
          ? "Clínica médica"
          : "Pediatria");

  root.innerHTML = "<p class=\"muted\">Carregando revisão…</p>";
  const data = await AprovaRevisao.loadModule(mid);
  if (!data) {
    root.innerHTML = "<p class=\"muted\">Não foi possível carregar a revisão.</p>";
    return;
  }

  const pid = profileId || AprovaRevisao.activeProfileId || "geral";
  AprovaRevisao.setActiveProfile(pid);
  const profile = await AprovaRevisao.getProfile(pid, mid);
  if (!profile) {
    root.innerHTML = "<p class=\"muted\">Perfil de prova não encontrado.</p>";
    return;
  }

  if (titleEl) titleEl.textContent = moduleLabel + " · " + profile.label;
  if (subEl) {
    subEl.textContent = profile.id === "geral"
      ? "Estatística geral das principais provas R1."
      : ("Foco em " + profile.label + " — " + profile.estilo);
  }

  const priorities = (profile.priorities || []).map(p => {
    const pct = Number(p.pct != null ? p.pct : p.score);
    const width = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    const label = Number.isFinite(pct)
      ? pct.toLocaleString("pt-BR", {
        minimumFractionDigits: Number.isInteger(pct) ? 0 : 1,
        maximumFractionDigits: 1
      }) + "%"
      : "—";
    return (
      "<div class=\"rev-bar-row\">" +
        "<span>" + aprovaEscapeHtml(p.tema) + "</span>" +
        "<div class=\"stat-bar\" aria-hidden=\"true\"><i style=\"width:" + width + "%\"></i></div>" +
        "<em>" + label + "</em>" +
      "</div>"
    );
  }).join("");

  const checklist = (profile.checklist || []).map(key => {
    const item = data.checklistItems && data.checklistItems[key];
    if (!item) return "";
    return (
      "<article class=\"rev-item\">" +
        "<div class=\"rev-item-head\">" +
          "<strong>" + aprovaEscapeHtml(item.tema) + "</strong>" +
          "<span class=\"rev-yield rev-yield--" + aprovaYieldClass(item.yield) + "\">" +
            aprovaEscapeHtml(item.yield) +
          "</span>" +
        "</div>" +
        "<p>" + aprovaEscapeHtml(item.pegar) + "</p>" +
      "</article>"
    );
  }).join("");

  const list = items => (items || []).map(t => "<li>" + aprovaEscapeHtml(t) + "</li>").join("");

  const sessoes = (profile.sessoes || []).map(s => (
    "<article class=\"rev-session\">" +
      "<strong>" + aprovaEscapeHtml(s.titulo) + "</strong>" +
      "<p>" + aprovaEscapeHtml(s.texto) + "</p>" +
    "</article>"
  )).join("");

  root.innerHTML =
    "<div class=\"rev-callout\">" +
      "<strong>" + aprovaEscapeHtml(profile.label) + "</strong> — " +
      aprovaEscapeHtml(profile.verdict) +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Foco desta prova</div>" +
      "<p class=\"rev-focus-line\"><strong>Conteúdo:</strong> " + aprovaEscapeHtml(profile.foco) + "</p>" +
      "<p class=\"rev-focus-line\"><strong>Estilo:</strong> " + aprovaEscapeHtml(profile.estilo) + "</p>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Prioridade relativa</div>" +
      "<div class=\"rev-bars\">" + priorities + "</div>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Checklist — o que decorar</div>" +
      "<div class=\"rev-checklist\">" + checklist + "</div>" +
    "</div>" +

    "<div class=\"rev-two\">" +
      "<div class=\"study-card rev-block\">" +
        "<div class=\"label\">Números que caem</div>" +
        "<ul class=\"rev-list\">" + list(data.numeros) + "</ul>" +
      "</div>" +
      "<div class=\"study-card rev-block\">" +
        "<div class=\"label\">Pegadinhas clássicas</div>" +
        "<ul class=\"rev-list\">" + list(data.pegadinhas) + "</ul>" +
      "</div>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Baixo ROI nesta apostila</div>" +
      "<ul class=\"rev-list\">" + list(data.baixoRoi) + "</ul>" +
    "</div>" +

    "<div class=\"study-card rev-block\">" +
      "<div class=\"label\">Plano em 3 sessões</div>" +
      "<div class=\"rev-sessions\">" + sessoes + "</div>" +
    "</div>" +

    "<div class=\"rev-callout rev-callout--warn\">" + aprovaEscapeHtml(profile.lacuna) + "</div>" +

    "<div class=\"actions-row\" style=\"margin-top:1rem\">" +
      "<button type=\"button\" class=\"btn btn-primary\" id=\"rev-open-ped\">Voltar aos subtemas</button>" +
    "</div>";

  document.getElementById("rev-open-ped")?.addEventListener("click", () => {
    const activeId = AprovaRevisao.activeModuleId;
    const spec = activeId ? AprovaRevisao.moduleSpecialty(activeId) : "pediatria";
    if (spec === "go") {
      if (typeof aprovaOpenGinecologiaModule === "function" && activeId) {
        aprovaOpenGinecologiaModule(activeId);
        return;
      }
      if (typeof aprovaOpenGinecologia === "function") aprovaOpenGinecologia();
      return;
    }
    if (spec === "cirurgia") {
      if (typeof aprovaOpenCirurgiaModule === "function" && activeId) {
        aprovaOpenCirurgiaModule(activeId);
        return;
      }
      if (typeof aprovaOpenCirurgia === "function") aprovaOpenCirurgia();
      return;
    }
    if (spec === "clinica") {
      if (typeof aprovaOpenClinicaModule === "function" && activeId) {
        aprovaOpenClinicaModule(activeId);
        return;
      }
      if (typeof aprovaOpenClinica === "function") aprovaOpenClinica();
      return;
    }
    if (typeof aprovaOpenPediatriaModule === "function" && activeId) {
      aprovaOpenPediatriaModule(activeId);
      return;
    }
    if (typeof aprovaOpenPediatria === "function") aprovaOpenPediatria();
  });
}
