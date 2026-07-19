/**
 * Aprofunda decks-mapa e alguns decks rasos de Infecto.
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "flashcards-infecto.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

/** @type {Record<string, Record<string, {front?: string, back: string}>>} */
const expansions = {
  "infc-tropicais-mapa": {
    "Aedes transmite?": {
      front: "Aedes aegypti transmite? Implicação clínica?",
      back: "Dengue, Zika, Chikungunya e febre amarela urbana · Mosquito diurno · Suspeitar síndrome febril + mialgia/exantema/artralgia em área urbana · DD pelas pistas (alarme dengue; artralgia intensa → chik; gestante/exantema → zika) · Dx: PCR/sorologia conforme fase · Conduta: hidratação e sinais de alarme na dengue; notificar"
    },
    "Lutzomyia transmite?": {
      front: "Lutzomyia transmite? Como reconhecer?",
      back: "Leishmaniose visceral (calazar) · Vetor flebotomíneo · Clínica: febre + esplenomegalia + pancitopenia · DD malária/tifoide/linfoma · Dx: rK39/parasitológico · Tratar conforme gravidade (protocolo MS) e investigar HIV"
    },
    "Carrapato Amblyomma?": {
      front: "Carrapato Amblyomma — o que transmite e conduta?",
      back: "Febre maculosa (Rickettsia rickettsii) · Exposição a carrapato · Febre + cefaleia + mialgia ± exantema centrífugo · Pode evoluir para sepse · Conduta: doxiciclina precoce (não atrasar exame) · Notificar"
    },
    "Enchente + icterícia + IRA?": {
      front: "Enchente + icterícia + IRA — hipótese e conduta?",
      back: "Leptospirose / doença de Weil · Água contaminada por urina de roedor · Grave: icterícia + hemorragia + IRA · Leve: amoxi ou doxi VO · Grave: penicilina G ou ceftriaxona IV · Suporte renal/hemodinâmico"
    },
    "Febre + esplenomegalia + pancitopenia?": {
      front: "Febre + esplenomegalia + pancitopenia — hipóteses?",
      back: "Calazar no topo em endemia · DD: malária, tifoide, linfoma, TB disseminada, HIV · Confirmar rK39/parasitológico · Tratar e investigar HIV associado"
    },
    "Defervescência + dor abdominal + Ht↑?": {
      front: "Defervescência + dor abdominal + Ht↑ — o que fazer?",
      back: "Dengue com sinais de alarme / fase crítica · Extravasamento → hemoconcentração · Internar, hidratação IV controlada, monitorar Ht/plaquetas/choque · Evitar AINEs/AAS · Reavaliar com frequência"
    },
    "Artralgia incapacitante pós-febre?": {
      front: "Artralgia incapacitante pós-febre — pensar em?",
      back: "Chikungunya (aguda ou crônica) · Poliartralgia intensa de mãos/pés · Dx: sorologia/PCR · Sintomáticos; evitar AINE se dengue não afastada · Pode cronificar — reabilitação · Notificar"
    },
    "Gestante + exantema + conjuntivite?": {
      front: "Gestante + exantema + conjuntivite — preocupação?",
      back: "Zika até prova em contrário · Risco de microcefalia/alterações de SNC fetal · PCR/sorologia + USG seriada · Pré-natal de alto risco · Repelente seguro · Notificar"
    },
    "Prioridade bancas Inf5?": {
      front: "Prioridade de bancas em tropicais (Inf5)?",
      back: "1) Dengue: classificação, alarme, hidratação · 2) Malária: vivax×falciparum e gravidade · 3) Lepto/Weil · 4) Calazar · 5) Febre maculosa (doxi precoce) · DD arboviroses"
    }
  },
  "infc-itu-mapa": {
    "Cistite simples →?": {
      front: "Cistite simples não complicada — tratamento?",
      back: "Mulher não gestante sem comorbidade: fosfomicina 3 g dose única OU nitrofurantoína 5 dias · Evitar FQ de rotina · Febre/lombalgia → pielonefrite · Cultura se falha ou recorrência"
    },
    "Pielonefrite →?": {
      front: "Pielonefrite — conduta prática?",
      back: "Empírico + urocultura (± hemocultura se grave) · Internar se vômitos, toxemia, sepse, gestante ou obstrução · Duração típica 7–14 dias · Imagem se não melhora em 48–72 h"
    },
    "Homem com ITU →?": {
      front: "ITU no homem — por que é diferente?",
      back: "Sempre considerar complicada · Investigar HBP, prostatite, litíase, instrumentação · Cultura obrigatória · Tratamento mais longo · Evitar nitrofurantoína se prostatite (má penetração)"
    },
    "Gestante →?": {
      front: "ITU / bacteriúria na gestante — regras?",
      back: "Tratar sempre bacteriúria assintomática e ITU sintomática · Cultura de controle · Cefalexina, nitrofurantoína (evitar no termo), amoxi-clav · Evitar FQ · Profilaxia se recorrência"
    },
    "Erisipela →?": {
      front: "Erisipela — agente e tratamento?",
      back: "Streptococcus pyogenes · Placa eritematosa de limites nítidos + febre · Penicilina conforme gravidade · Alérgico: clinda/macrolídeo · Tratar porta de entrada e elevar membro"
    },
    "Celulite duvidosa →?": {
      front: "Celulite — cobertura empírica?",
      back: "Cobrir streptococos ± S. aureus · Limites menos nítidos que erisipela · Cefalexina/amoxi-clav/clinda · Abscesso/MRSA: drenar + cobrir MRSA · Sepse → IV"
    },
    "Osteo falcêmico →?": {
      front: "Osteomielite no falcêmico — agente?",
      back: "Salmonella é clássica (S. aureus continua frequente) · DD com crise vaso-oclusiva · Hemoculturas + imagem · Empírico cobre Salmonella + S. aureus até cultura · ATB IV prolongado"
    },
    "Prioridade bancas Inf4?": {
      front: "Prioridade de bancas em ITU/pele/osteo?",
      back: "Cistite×pielonefrite · Homem=complicada · Gestante (tratar bacteriúria) · Erisipela×celulite · Osteo: S. aureus; falcêmico→Salmonella"
    }
  },
  "infc-parasito-mapa": {
    "Quem faz ciclo pulmonar (Loss)?": {
      front: "Quem faz ciclo pulmonar (Loeffler/Loss)?",
      back: "Ascaris, Strongyloides e ancilostomídeos · Migração pulmonar → tosse, eosinofilia, infiltrados migratórios · Depois vão ao intestino · Pensar eosinofilia + sintomas respiratórios em endemia"
    },
    "Quem faz autoinfecção?": {
      front: "Quem faz autoinfecção — relevância clínica?",
      back: "Strongyloides (clássico) · Enterobius (ovos perianais) · T. solium (ovos → cisticercose) · Strongyloides + corticoide → hiperinfecção/sepse Gram-neg · Rastrear antes de imunossupressão"
    },
    "Anemia ferropriva → pensar?": {
      front: "Anemia ferropriva + parasitose — pensar?",
      back: "Ancilostomíase (espoliação) · Tricuríase intensa também · Eosinofilia + área rural · EPF + albendazol + repor ferro · Investigar outras perdas se indicado"
    },
    "Prurido anal noturno →?": {
      front: "Prurido anal noturno — diagnóstico?",
      back: "Enterobíase · Teste de Graham (fita adesiva) pela manhã · Tratar paciente e conviventes · Higienizar roupas/lençóis · Recorrência se família não tratada"
    },
    "Antes de corticoide → rastrear?": {
      front: "Antes de corticoide — qual parasita rastrear?",
      back: "Strongyloides stercoralis · Risco de hiperinfecção com imunossupressão · Sorologia/Baermann conforme disponibilidade · Alto risco epidemiológico: considerar ivermectina empírica"
    },
    "Abscesso hepático + disenteria →?": {
      front: "Abscesso hepático + disenteria — conduta?",
      back: "Amebíase invasiva · Metro/tinidazol + agente intraluminal · USG/TC · Drenar só em critérios (falha, risco de ruptura, abscesso esquerdo grande) · Sorologia ajuda no abscesso"
    },
    "HTP com função hepática ok + endemia →?": {
      front: "HTP com função hepática preservada + endemia?",
      back: "Esquistossomose mansoni (fibrose de Symmers) · HTP pré-sinusoidal · Varizes com hepatócito ainda compensado · EPF/sorologia/imagem · Praziquantel + manejo de varizes"
    },
    "Carne de porco × ovos de solium?": {
      front: "T. solium: carne × ovos — diferença?",
      back: "Carne com cisticerco → teníase intestinal · Ovos (fecal-oral/autoinfecção) → cisticercose · Neurocisticercose: convulsão + imagem · Albendazol/praziquantel ± corticoide/AED conforme forma"
    },
    "Drogas-chave deste bloco?": {
      front: "Drogas-chave das parasitoses (Inf1)?",
      back: "Ameba: metro/tini + intraluminal · Geohelmintos: albendazol/mebendazol · Strongyloides: ivermectina · Esquistossomose/tênias: praziquantel · Associe droga↔parasita"
    },
    "Prioridade de bancas (Inf1)?": {
      front: "Prioridade de bancas em parasitoses?",
      back: "Strongyloides/hiperinfecção · Esquistossomose/Symmers · Ascaris/Loeffler · Abscesso amebiano · Neurocisticercose · Enterobius (Graham)"
    }
  },
  "infc-pac-mapa": {
    "Fluxo R1 da PAC?": {
      front: "Fluxo R1 da pneumonia adquirida na comunidade?",
      back: "Clínica + RX → gravidade (CURB-65/PSI) → local (ambulatório/enfermaria/UTI) → empírico por cenário → reavaliar 48–72 h · Culturas/Legionella se grave · Oseltamivir se influenza provável"
    },
    "Ambulatório sem risco →?": {
      front: "PAC ambulatorial sem comorbidade — empírico?",
      back: "Amoxicilina (± macrolídeo se atípicos) · Com comorbidade: beta-lactâmico + macrolídeo OU FQ respiratória · Duração típica 5–7 dias se estabilização · Orientar retorno se piora"
    },
    "Enfermaria →?": {
      front: "PAC internada em enfermaria — empírico?",
      back: "Ceftriaxona + macrolídeo · Alternativa: FQ respiratória em monoterapia se adequada · Coletar culturas conforme protocolo · Oxigenação e desescalonamento"
    },
    "UTI →?": {
      front: "PAC em UTI — empírico?",
      back: "Beta-lactâmico antipneumocócico + macrolídeo ou FQ · Nunca FQ isolada na UTI · ± oseltamivir · MRSA/Pseudomonas só com fator de risco · Considerar Legionella"
    },
    "Pistas RX rápidas?": {
      front: "Pistas radiológicas clássicas na PAC?",
      back: "Lobo denso abaulado → Klebsiella · Pneumatocele → S. aureus · Pneumonia redonda → pneumococo (criança) · Escavação → anaeróbio/Kleb/S. aureus · Intersticial → atípicos/PCP (contexto)"
    },
    "PACS?": {
      front: "O que mudou com o conceito de PACS?",
      back: "Pneumonia associada a cuidados de saúde foi abandonada para não escalar MDR só por asilo/diálise · Usar fatores individuais de resistência + gravidade · Evitar pip/tazo/vanco automático sem critério"
    },
    "Prioridade bancas Inf2?": {
      front: "Prioridade de bancas em PAC?",
      back: "CURB-65/local de tratamento · Empírico por cenário · Legionella · Abscesso/anaeróbio · Influenza · Pistas de RX · Quando cobrir MRSA/Pseudomonas"
    },
    "Droga-chave deste bloco?": {
      front: "Drogas-chave da PAC (mapa)?",
      back: "Amoxicilina · Azitromicina · Ceftriaxona · Levo/moxifloxacino · Pip/tazo · Vancomicina/linezolida · Oseltamivir · Clindamicina (aspiração)"
    }
  },
  "infc-hiv-mapa": {
    "CD4 <50 — pensar?": {
      front: "CD4 <50 — infecções e profilaxia?",
      back: "MAC disseminado · Profilaxia: azitromicina se CD4 <50 · CMV grave (retinite/GI) mais frequente · Otimizar TARV · Investigar sintomas constitucionais"
    },
    "CD4 <200 — pensar?": {
      front: "CD4 <200 — o que lembrar?",
      back: "PCP — profilaxia com SMX-TMP · Reativação de Chagas em endemia · Iniciar TARV e profilaxias conforme CD4 · Cuidado integral (vacinas/rastreios)"
    },
    "CD4 <300 — protozoário intestinal?": {
      front: "Diarreia crônica + CD4 baixo — protozoários?",
      back: "Criptosporidium (clássico com CD4 baixo) · Também Cystoisospora/Microsporidia · Diarreia aquosa prolongada · Dx: BAAR modificado/PCR · Base: TARV para reconstituição"
    },
    "Esofagite — mapa rápido?": {
      front: "Esofagite na aids — mapa etiológico?",
      back: "Candida (mais comum) → fluconazol empírico · CMV: úlcera grande → ganciclovir · HSV: úlceras pequenas → aciclovir · Falha ao fluconazol → endoscopia com biópsia"
    },
    "Massa cerebral — mapa?": {
      front: "Massa cerebral na aids — toxo × linfoma × PML?",
      back: "Múltiplas lesões anelares em gânglios → toxoplasmose (tratar empiricamente) · Lesão única periventricular → linfoma · Déficit sem massa típica → PML · Sempre TARV + conduta específica"
    },
    "Fungos BR na aids?": {
      front: "Fungos importantes na aids no Brasil?",
      back: "PCM pode ser definidora · Histoplasmose disseminada · Criptococose (pulmão + meningite) · Aspergilose NÃO é OI clássica de aids · Tratar + TARV"
    },
    "Neoplasias definidoras?": {
      front: "Neoplasias definidoras de aids?",
      back: "Sarcoma de Kaposi (HHV-8) · Linfoma não Hodgkin · Carcinoma de colo uterino invasivo · Conduta oncológica + TARV · Kaposi: lesões violáceas cutâneo-mucosas"
    },
    "Prioridade bancas Inf3?": {
      front: "Prioridade de bancas em HIV/OIs?",
      back: "Limiares de CD4 e profilaxias · Esofagite Candida/CMV/HSV · Toxo×linfoma×PML · Retinite CMV · Kaposi · Coinfecção HBV (TDF+3TC/FTC)"
    }
  },
  "infc-lepto": {
    "Agente da leptospirose?": {
      front: "Agente e epidemiologia da leptospirose?",
      back: "Leptospira interrogans · Zoonose; roedores · Contato com água/lama de enchente · Incubação ~5–14 dias · Notificação compulsória"
    },
    "Doença de Weil — tríade?": {
      front: "Doença de Weil — tríade e gravidade?",
      back: "Icterícia + hemorragias + IRA · Forma icterohemorrágica grave · Pode ter miocardite, SDRA, sangramento pulmonar · Internação, ATB IV e suporte (diálise se preciso)"
    },
    "Forma anictérica — DD?": {
      front: "Leptospirose anictérica — diagnóstico diferencial?",
      back: "Mimetiza dengue · Pista: enchente/exposição + mialgia intensa (panturrilhas) · Conjuntivite sem exsudato · Sorologia/PCR · Não atrasar ATB se alta suspeita"
    },
    "Lepto leve — ATB?": {
      front: "Leptospirose leve — antibioticoterapia?",
      back: "Amoxicilina ou doxiciclina VO 5–7 dias · Iniciar precocemente · Hidratação e sintomáticos · Precauções com contato de urina"
    },
    "Lepto grave — ATB?": {
      front: "Leptospirose grave — antibioticoterapia?",
      back: "Penicilina G cristalina IV ou ceftriaxona IV ≥7 dias · Alérgico: azitromicina IV · Possível Jarisch-Herxheimer nas primeiras doses · UTI se disfunção orgânica"
    },
    "Doxiciclina — contraindicações (apostila)?": {
      front: "Doxiciclina na lepto — quando evitar?",
      back: "Gestante · Criança <8–9 anos · Na forma grave preferir beta-lactâmico IV · Lembrar fotossensibilidade"
    },
    "Surtos urbanos — quando?": {
      front: "Quando ocorrem surtos urbanos de lepto?",
      back: "Após enchentes de verão em áreas urbanas/periurbanas com roedores · Casos 1–2 semanas após o evento · Vigilância e evitar água contaminada"
    },
    "Yield lepto R1?": {
      front: "O que mais cai de leptospirose na R1?",
      back: "Weil (tríade) · Nexo com enchente · Penicilina/ceftriaxona na grave; doxi/amoxi na leve · DD com dengue anictérica · IRA e suporte"
    }
  },
  "infc-hiv-ocular": {
    "Queixa oftalmológica na aids — frequência?": {
      front: "Queixas oculares na aids — relevância?",
      back: "Até ~50% podem ter sintomas oculares · Perguntar baixa acuidade, moscas, metamorfopsia · Retinite CMV é emergência visual com CD4 muito baixo · Oftalmo urgente se sintomas"
    },
    "Retinite por CMV — aspecto clássico?": {
      front: "Retinite por CMV — aspecto e conduta?",
      back: "Exsudatos brancos + hemorragias — queijo com ketchup · CD4 tipicamente <50 · Indução ganciclovir/valganciclovir (± foscarnet) + TARV · Risco de descolamento de retina"
    },
    "Profilaxia secundária da retinite CMV?": {
      front: "Profilaxia secundária da retinite CMV — até quando?",
      back: "Valganciclovir oral até CD4 >100 por >3 meses com TARV efetiva · Reavaliar oftalmo antes de suspender · Recidiva se queda imune"
    },
    "Indução da doença CMV ocular/GI?": {
      front: "Indução do CMV ocular/GI na aids?",
      back: "Ganciclovir IV ou valganciclovir VO (se absorção ok) ou foscarnet por semanas · Associar TARV · Ajustar na IRA · Monitorar neutrófilos (ganciclovir)"
    },
    "Achado ocular comum não infeccioso?": {
      front: "Achado ocular não infeccioso comum na aids?",
      back: "Microangiopatia da aids — cotton-wool spots · Em geral assintomática · Diferenciar de retinite CMV (hemorragia + necrose progressiva) · Melhora com TARV"
    }
  }
};

function matchPatch(front, map) {
  if (map[front]) return map[front];
  for (const [key, val] of Object.entries(map)) {
    const a = front.replace(/\s+/g, " ").trim();
    const b = key.replace(/\s+/g, " ").trim();
    if (a === b) return val;
    if (a.startsWith(b.slice(0, Math.min(24, b.length)))) return val;
    if (b.startsWith(a.slice(0, Math.min(24, a.length)))) return val;
  }
  return null;
}

let n = 0;
for (const [deckId, map] of Object.entries(expansions)) {
  const deck = data.find((d) => d.id === deckId);
  if (!deck) {
    console.warn("missing deck", deckId);
    continue;
  }
  for (const card of deck.cards) {
    const patch = matchPatch(card.front, map);
    if (!patch) continue;
    if (patch.front) card.front = patch.front;
    card.back = patch.back;
    n += 1;
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log("expanded", n, "cards");

for (const id of Object.keys(expansions)) {
  const d = data.find((x) => x.id === id);
  const thin = d.cards.filter((c) => c.back.length < 100).length;
  const avg = Math.round(
    d.cards.reduce((a, c) => a + c.back.length, 0) / d.cards.length
  );
  console.log(id, "thin<", 100, ":", thin, "avg", avg);
}
