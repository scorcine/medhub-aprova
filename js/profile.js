/* Perfil do estudante — até 3 provas por ordem de prioridade (localStorage) */

const APROVA_PROFILE_KEY = "medhub-aprova-profile-v1";
const APROVA_PROFILE_MAX = 3;

/** Provas disponíveis no app (sem “Geral Brasil”). */
const APROVA_TARGET_EXAMS = [
  { id: "enare", label: "Enare" },
  { id: "enamed", label: "Enamed" },
  { id: "revalida", label: "Revalida" },
  { id: "usp", label: "USP" },
  { id: "unifesp", label: "UNIFESP" },
  { id: "unicamp", label: "UNICAMP" },
  { id: "amp", label: "AMP" },
  { id: "santa-casa", label: "Santa Casa SP" },
  { id: "sirio", label: "Sírio-Libanês" },
  { id: "einstein", label: "Einstein" },
  { id: "iamspe", label: "IAMSPE / HSPE" },
  { id: "sus-sp", label: "SUS-SP" },
  { id: "puc-sp", label: "PUC-SP" },
  { id: "ufmg", label: "UFMG" },
  { id: "ufrgs", label: "UFRGS" },
  { id: "ufrj", label: "UFRJ" },
  { id: "consesp", label: "CONSESP" },
  { id: "sus-ba", label: "SUS-BA" },
  { id: "ses-pe", label: "SES-PE" }
];

function aprovaDefaultProfile () {
  return {
    priorities: [null, null, null],
    updatedAt: null
  };
}

/** Modo de distribuição das questões do dia (localStorage separado). */
const APROVA_STUDY_MODE_KEY = "medhub-aprova-study-mode-v1";

function aprovaNormalizeStudyMode (mode) {
  const m = String(mode || "").trim().toLowerCase();
  if (m === "miscelania" || m === "misc" || m === "interleaved") return "miscelania";
  if (m === "bloco" || m === "block" || m === "single") return "bloco";
  return "foco";
}

function aprovaGetStudyMode () {
  try {
    return aprovaNormalizeStudyMode(localStorage.getItem(APROVA_STUDY_MODE_KEY));
  } catch {
    return "foco";
  }
}

function aprovaSetStudyMode (mode) {
  const m = aprovaNormalizeStudyMode(mode);
  localStorage.setItem(APROVA_STUDY_MODE_KEY, m);
  return m;
}

function aprovaStudyModeMeta (mode) {
  const id = aprovaNormalizeStudyMode(mode);
  const all = {
    foco: {
      id: "foco",
      label: "Foco (1–2 temas)",
      badge: "Recomendado",
      short: "Mais questões de um ou dois temas no dia — melhor para consolidar.",
      splitHint: "Ex.: meta 45 → cerca de 25 + 20",
      body:
        "No modo Foco você estuda com profundidade: a meta do dia concentra-se em 1 ou 2 temas " +
        "(cerca de 55% no primeiro e 45% no segundo). Assim você consolida o núcleo do assunto " +
        "em vez de tocar leve em muitos temas.\n\n" +
        "Os temas rotacionam pela fila de prioridade (o que mais cai × onde você está mais fraco). " +
        "Quando um bloco do tema avança, ele volta depois pela revisão espaçada (3 → 7 → 14 dias), " +
        "com questões similares — não as mesmas.\n\n" +
        "É o equilíbrio mais produtivo para a maior parte do ano: profundidade no dia e cobertura " +
        "de todos os temas ao longo das semanas, sem a sensação de ter que revisar o conteúdo inteiro todo dia."
    },
    miscelania: {
      id: "miscelania",
      label: "Miscelânia",
      badge: "",
      short: "Vários temas no mesmo dia, em fatias menores — formato da prova.",
      splitHint: "Vários temas dividem a meta do dia",
      body:
        "Na Miscelânia a meta diária se espalha por vários temas (fatias menores de cada um). " +
        "É o formato mais parecido com a prova R1, que mistura assuntos.\n\n" +
        "A ciência da aprendizagem chama isso de prática intercalada: costuma parecer mais difícil " +
        "no dia, mas ajuda a distinguir temas parecidos — útil na reta final e em simulados.\n\n" +
        "O ponto fraco: poucas questões por tema no dia, então a consolidação inicial fica mais lenta. " +
        "Use quando quiser treinar o “estilo prova” ou já tiver passado uma vez pelos temas principais."
    },
    bloco: {
      id: "bloco",
      label: "Bloco (1 tema)",
      badge: "",
      short: "Toda a meta do dia em um único tema — primeira passagem ou tema muito fraco.",
      splitHint: "100% da meta em um tema",
      body:
        "No Bloco, todas as questões do dia vão para um único tema. Ideal para primeira passagem " +
        "forte ou quando um assunto está bem abaixo da sua meta de acerto.\n\n" +
        "Não significa “esgotar o tema para nunca mais”: você fecha um bloco (volume do dia ou " +
        "série de dias) e o tema entra na revisão espaçada. No dia seguinte a fila segue para o " +
        "próximo tema prioritário.\n\n" +
        "Use com parcimônia: estudo só em bloco o ano inteiro atrasa a prática de misturar temas, " +
        "que a prova exige. Alterne com Foco ou Miscelânia conforme a fase."
    }
  };
  return all[id] || all.foco;
}

function aprovaStudyModeList () {
  return ["foco", "miscelania", "bloco"].map(aprovaStudyModeMeta);
}

function aprovaNormalizeExamDate (value) {
  const s = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return s;
}

/** Meta de acerto esperada na prova (50–95%). Em branco → 75%. */
const APROVA_DEFAULT_TARGET_ACCURACY = 75;

function aprovaNormalizeTargetAccuracy (value) {
  if (value == null || String(value).trim() === "") return APROVA_DEFAULT_TARGET_ACCURACY;
  const n = Number(value);
  if (!Number.isFinite(n)) return APROVA_DEFAULT_TARGET_ACCURACY;
  return Math.max(50, Math.min(95, Math.round(n)));
}

function aprovaNormalizePriority (slot) {
  if (!slot || typeof slot !== "object") return null;
  const date = aprovaNormalizeExamDate(slot.date);
  const rawAcc = slot.targetAccuracy;
  const hasAcc = rawAcc != null && String(rawAcc).trim() !== "";
  const targetAccuracy = hasAcc ? aprovaNormalizeTargetAccuracy(rawAcc) : undefined;
  if (slot.kind === "exam" && slot.id && APROVA_TARGET_EXAMS.some(e => e.id === slot.id)) {
    const next = { kind: "exam", id: slot.id };
    if (targetAccuracy != null) next.targetAccuracy = targetAccuracy;
    if (date) next.date = date;
    return next;
  }
  if (slot.kind === "other") {
    const label = String(slot.label || "").trim();
    if (!label) return null;
    const next = { kind: "other", label };
    if (targetAccuracy != null) next.targetAccuracy = targetAccuracy;
    if (date) next.date = date;
    return next;
  }
  return null;
}

/** Meta de acerto da 1ª prioridade preenchida (ou padrão). */
function aprovaProfileTargetAccuracy (profile) {
  const filled = aprovaProfileFilled(profile);
  const first = filled[0];
  if (first && first.targetAccuracy != null) {
    return aprovaNormalizeTargetAccuracy(first.targetAccuracy);
  }
  return APROVA_DEFAULT_TARGET_ACCURACY;
}

/** Migra formato antigo { exams[], otherExam } → priorities[3]. */
function aprovaMigrateLegacyProfile (data) {
  const priorities = [null, null, null];
  let i = 0;
  const exams = Array.isArray(data.exams) ? data.exams : [];
  for (const id of exams) {
    if (i >= APROVA_PROFILE_MAX) break;
    if (APROVA_TARGET_EXAMS.some(e => e.id === id)) {
      priorities[i] = { kind: "exam", id };
      i += 1;
    }
  }
  const other = String(data.otherExam || "").trim();
  if (other && i < APROVA_PROFILE_MAX && (data.otherEnabled || other)) {
    priorities[i] = { kind: "other", label: other };
  }
  return priorities;
}

function aprovaLoadProfile () {
  try {
    const data = JSON.parse(localStorage.getItem(APROVA_PROFILE_KEY) || "null");
    if (!data || typeof data !== "object") return aprovaDefaultProfile();

    let priorities;
    if (Array.isArray(data.priorities)) {
      priorities = [0, 1, 2].map(i => aprovaNormalizePriority(data.priorities[i]));
    } else {
      priorities = aprovaMigrateLegacyProfile(data);
    }

    return {
      priorities,
      updatedAt: data.updatedAt || null
    };
  } catch {
    return aprovaDefaultProfile();
  }
}

function aprovaSaveProfile (profile) {
  const raw = (profile && profile.priorities) || [];
  const priorities = [0, 1, 2].map(i => aprovaNormalizePriority(raw[i]));
  // Remove buracos: prioridade 1 preenchida antes da 2/3
  const compact = priorities.filter(Boolean);
  const next = {
    priorities: [compact[0] || null, compact[1] || null, compact[2] || null],
    updatedAt: Date.now()
  };
  localStorage.setItem(APROVA_PROFILE_KEY, JSON.stringify(next));
  return next;
}

function aprovaProfileFilled (profile) {
  const p = profile || aprovaLoadProfile();
  return (p.priorities || []).filter(Boolean);
}

function aprovaProfileIsComplete (profile) {
  return aprovaProfileFilled(profile).length > 0;
}

/** Id da 1ª prioridade que seja banca do catálogo (para default de estatísticas). */
function aprovaProfilePrimaryExamId (profile) {
  const filled = aprovaProfileFilled(profile);
  const first = filled.find(s => s && s.kind === "exam" && s.id);
  return first ? first.id : null;
}

function aprovaExamOptionLabel (id) {
  const hit = APROVA_TARGET_EXAMS.find(e => e.id === id);
  return hit ? hit.label : id;
}

function aprovaPriorityLabel (slot) {
  if (!slot) return "";
  if (slot.kind === "exam") return aprovaExamOptionLabel(slot.id);
  if (slot.kind === "other") return slot.label;
  return "";
}

function aprovaProfileSummary (profile) {
  const p = profile || aprovaLoadProfile();
  const filled = aprovaProfileFilled(p);
  const names = filled.map(aprovaPriorityLabel).filter(Boolean);
  if (!names.length) {
    return {
      complete: false,
      line: "Ainda sem provas escolhidas",
      detail: "Escolha até 3 provas por ordem de prioridade.",
      hasDates: false
    };
  }
  const ordered = names.map((n, i) => (i + 1) + "º " + n);
  const hasDates = filled.some(s => s && s.date);
  const dateBits = filled.map((s, i) => {
    if (!s) return null;
    if (s.date) {
      const label = typeof aprovaFormatDateBr === "function"
        ? aprovaFormatDateBr(s.date)
        : s.date;
      return (i + 1) + "ª · " + label;
    }
    return (i + 1) + "ª · fim do ano";
  }).filter(Boolean);
  const accBits = filled.map((s, i) => {
    if (!s) return null;
    const t = aprovaNormalizeTargetAccuracy(s.targetAccuracy);
    return (i + 1) + "ª · meta " + t + "%";
  }).filter(Boolean);
  return {
    complete: true,
    line: ordered.join(" · "),
    detail: (hasDates
      ? ("Datas: " + dateBits.join(" · "))
      : ("Plano com fim do ano como data estimada · " + dateBits.join(" · "))) +
      (accBits.length ? (" · Acerto: " + accBits.join(" · ")) : ""),
    hasDates,
    targetAccuracy: aprovaProfileTargetAccuracy(p)
  };
}
