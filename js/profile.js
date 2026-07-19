/* Perfil do estudante — provas-alvo e preferências (localStorage) */

const APROVA_PROFILE_KEY = "medhub-aprova-profile-v1";

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
    exams: [],
    otherExam: "",
    otherEnabled: false,
    updatedAt: null
  };
}

function aprovaLoadProfile () {
  try {
    const data = JSON.parse(localStorage.getItem(APROVA_PROFILE_KEY) || "null");
    if (!data || typeof data !== "object") return aprovaDefaultProfile();
    const exams = Array.isArray(data.exams)
      ? data.exams.filter(id => APROVA_TARGET_EXAMS.some(e => e.id === id))
      : [];
    const otherExam = String(data.otherExam || "").trim();
    return {
      exams,
      otherExam,
      otherEnabled: Boolean(data.otherEnabled) || otherExam.length > 0,
      updatedAt: data.updatedAt || null
    };
  } catch {
    return aprovaDefaultProfile();
  }
}

function aprovaSaveProfile (profile) {
  const next = Object.assign(aprovaDefaultProfile(), profile || {}, {
    updatedAt: Date.now()
  });
  next.exams = Array.isArray(next.exams) ? next.exams : [];
  next.otherExam = String(next.otherExam || "").trim();
  next.otherEnabled = Boolean(next.otherEnabled) || next.otherExam.length > 0;
  localStorage.setItem(APROVA_PROFILE_KEY, JSON.stringify(next));
  return next;
}

function aprovaProfileIsComplete (profile) {
  const p = profile || aprovaLoadProfile();
  if (p.exams && p.exams.length) return true;
  if (p.otherEnabled && String(p.otherExam || "").trim()) return true;
  return false;
}

function aprovaExamOptionLabel (id) {
  const hit = APROVA_TARGET_EXAMS.find(e => e.id === id);
  return hit ? hit.label : id;
}

function aprovaProfileSummary (profile) {
  const p = profile || aprovaLoadProfile();
  const names = (p.exams || []).map(aprovaExamOptionLabel);
  if (p.otherEnabled && p.otherExam) names.push(p.otherExam);
  if (!names.length) {
    return {
      complete: false,
      line: "Ainda sem provas escolhidas",
      detail: "Informe as provas que você pretende prestar para personalizar o estudo."
    };
  }
  const shown = names.slice(0, 3).join(" · ");
  const extra = names.length > 3 ? (" +" + (names.length - 3)) : "";
  return {
    complete: true,
    line: shown + extra,
    detail: names.length === 1
      ? "1 prova-alvo salva neste aparelho."
      : names.length + " provas-alvo salvas neste aparelho."
  };
}
