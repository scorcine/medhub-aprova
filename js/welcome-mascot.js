/* Mascote de boas-vindas — 1ª visita: vídeo + fala com nome; depois: foto no Início */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_IMG = "/assets/mascote.png";

/**
 * Roteiro da 1ª visita. Use {nome} onde o nome da pessoa deve entrar.
 */
const APROVA_MASCOT_SCRIPT =
  "Seja bem-vindo, {nome}, ao aplicativo que irá revolucionar seus estudos. " +
  "Inicie preenchendo o seu perfil para uma experiência personalizada de acordo com a sua prova.";

function aprovaMascotFirstName () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const raw = (session && (session.name || session.login)) || "estudante";
  const first = String(raw).trim().split(/\s+/)[0] || "estudante";
  if (first.indexOf("@") !== -1) return first.split("@")[0] || "estudante";
  return first;
}

function aprovaMascotFillScript (template, firstName) {
  const name = firstName || "estudante";
  return String(template || APROVA_MASCOT_SCRIPT)
    .replace(/\{nome\}/gi, name)
    .replace(/\s+/g, " ")
    .trim();
}

function aprovaMascotHasSeenWelcome () {
  try {
    return localStorage.getItem(APROVA_MASCOT_SEEN_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function aprovaMascotMarkWelcomeSeen () {
  try {
    localStorage.setItem(APROVA_MASCOT_SEEN_KEY, "1");
  } catch (e) { /* ignore */ }
}

function aprovaMascotStopSpeech () {
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

function aprovaMascotPickPtVoice () {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    const pt = voices.filter((v) => /^pt/i.test(v.lang || ""));
    return pt.find((v) => /brazil|brasil|pt-BR/i.test(v.lang + " " + v.name)) || pt[0] || null;
  } catch (e) {
    return null;
  }
}

/** Uma única fala personalizada (sem misturar com o áudio do vídeo). */
function aprovaMascotSpeakWelcome (firstName) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  try {
    aprovaMascotStopSpeech();
    const text = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT, firstName);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 1;
    const voice = aprovaMascotPickPtVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
    return true;
  } catch (e) {
    return false;
  }
}

function aprovaCloseWelcomeMascotModal () {
  const modal = document.getElementById("welcome-mascot-modal");
  const video = document.getElementById("welcome-mascot-video");
  aprovaMascotStopSpeech();
  if (video) {
    try {
      video.pause();
      video.currentTime = 0;
    } catch (e) { /* ignore */ }
  }
  if (modal) modal.hidden = true;
  aprovaMascotMarkWelcomeSeen();
  aprovaRenderInicioMascot();

  // Depois da boas-vindas: Início pedindo o preenchimento do perfil.
  const profile = typeof aprovaLoadProfile === "function" ? aprovaLoadProfile() : null;
  const complete = typeof aprovaProfileIsComplete === "function" && aprovaProfileIsComplete(profile);

  if (typeof aprovaGoTo === "function") aprovaGoTo("inicio");
  else if (typeof aprovaRenderDashboard === "function") aprovaRenderDashboard();

  if (complete) return;

  window.setTimeout(() => {
    const banner = document.getElementById("dash-profile-banner");
    const title = document.getElementById("dash-profile-banner-title");
    const text = document.getElementById("dash-profile-banner-text");
    const btn = document.getElementById("dash-profile-banner-btn");
    if (title) title.textContent = "Personalize seu estudo";
    if (text) {
      text.textContent =
        "Preencha seu perfil com as provas que você pretende prestar para liberar uma experiência personalizada.";
    }
    if (btn) {
      btn.textContent = "Configurar meu perfil";
      btn.setAttribute("data-goto", "perfil");
      try { btn.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    if (banner) {
      try { banner.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) { /* ignore */ }
      banner.classList.add("aprova-banner--pulse");
      window.setTimeout(() => banner.classList.remove("aprova-banner--pulse"), 2400);
    }
  }, 120);
}

function aprovaOpenWelcomeMascotModal () {
  const modal = document.getElementById("welcome-mascot-modal");
  const video = document.getElementById("welcome-mascot-video");
  const title = document.getElementById("welcome-mascot-title");
  const caption = document.getElementById("welcome-mascot-caption");
  const first = aprovaMascotFirstName();
  const spoken = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT, first);

  if (!modal) return;

  if (title) title.textContent = "Olá, " + first + "!";
  if (caption) caption.textContent = spoken;

  modal.hidden = false;

  if (video) {
    // Silencia o áudio gravado para não haver “duas vozes”.
    video.muted = true;
    video.volume = 0;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => { /* autoplay bloqueado — usuário dá play */ });
    }
  }

  // Fala com o nome (única trilha de áudio da boas-vindas).
  const startSpeech = () => aprovaMascotSpeakWelcome(first);
  if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      startSpeech();
    };
    window.setTimeout(startSpeech, 400);
  } else {
    window.setTimeout(startSpeech, 200);
  }
}

function aprovaRenderInicioMascot () {
  const wrap = document.getElementById("inicio-mascot");
  const img = document.getElementById("inicio-mascot-img");
  if (!wrap || !img) return;

  const seen = aprovaMascotHasSeenWelcome();
  // Foto só depois da 1ª visita (não junto com o modal).
  wrap.hidden = !seen;
  if (seen) {
    img.src = APROVA_MASCOT_IMG;
    img.alt = "Mascote MedHub R1";
  }
}

function aprovaMaybeShowWelcomeMascot () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  if (!session || !session.login) return;

  aprovaRenderInicioMascot();

  if (aprovaMascotHasSeenWelcome()) return;
  if (aprovaMaybeShowWelcomeMascot._opened) return;
  aprovaMaybeShowWelcomeMascot._opened = true;

  window.setTimeout(() => {
    aprovaOpenWelcomeMascotModal();
  }, 280);
}

function aprovaBindWelcomeMascot () {
  const modal = document.getElementById("welcome-mascot-modal");
  if (!modal || modal.dataset.bound === "1") return;
  modal.dataset.bound = "1";

  modal.querySelectorAll("[data-welcome-mascot-close]").forEach((el) => {
    el.addEventListener("click", () => aprovaCloseWelcomeMascotModal());
  });

  document.getElementById("welcome-mascot-replay")?.addEventListener("click", () => {
    const video = document.getElementById("welcome-mascot-video");
    if (video) {
      try {
        video.muted = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      } catch (e) { /* ignore */ }
    }
    aprovaMascotSpeakWelcome(aprovaMascotFirstName());
  });

  const video = document.getElementById("welcome-mascot-video");
  video?.addEventListener("error", () => {
    const fallback = document.getElementById("welcome-mascot-fallback");
    if (fallback) fallback.hidden = false;
    if (video) video.hidden = true;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  aprovaBindWelcomeMascot();
});

window.aprovaMaybeShowWelcomeMascot = aprovaMaybeShowWelcomeMascot;
window.aprovaRenderInicioMascot = aprovaRenderInicioMascot;
window.aprovaCloseWelcomeMascotModal = aprovaCloseWelcomeMascotModal;
