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

function aprovaNormalizePriority (slot) {
  if (!slot || typeof slot !== "object") return null;
  if (slot.kind === "exam" && slot.id && APROVA_TARGET_EXAMS.some(e => e.id === slot.id)) {
    return { kind: "exam", id: slot.id };
  }
  if (slot.kind === "other") {
    const label = String(slot.label || "").trim();
    if (!label) return null;
    return { kind: "other", label };
  }
  return null;
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
      detail: "Escolha até 3 provas por ordem de prioridade."
    };
  }
  const ordered = names.map((n, i) => (i + 1) + "º " + n);
  return {
    complete: true,
    line: ordered.join(" · "),
    detail: names.length === 1
      ? "1 prova-alvo (prioridade 1) salva neste aparelho."
      : names.length + " provas-alvo por prioridade salvas neste aparelho."
  };
}
