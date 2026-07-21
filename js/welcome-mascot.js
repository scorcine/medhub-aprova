/* Mascote de boas-vindas — 1ª visita automática; depois só se clicar no avatar */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_FORCE_KEY = "medhub-aprova-mascot-force-v1";
const APROVA_MASCOT_FORCE_TOKEN = "20260721-scorcine-bright1";
const APROVA_MASCOT_IMG = "/assets/mascote.png";

/** Legenda + fala (português do Brasil). */
const APROVA_MASCOT_SCRIPT =
  "Olá, {nome}, este é o aplicativo que irá revolucionar seus estudos. " +
  "Inicie configurando o seu perfil para uma experiência personalizada de acordo com a sua prova.";

/**
 * Versão falada: mesma mensagem, pontuação leve (sem pausa dramática no nome).
 */
const APROVA_MASCOT_SCRIPT_SPEECH =
  "Olá {nome}! " +
  "Este é o aplicativo que irá revolucionar seus estudos. " +
  "Inicie configurando o seu perfil para uma experiência personalizada de acordo com a sua prova.";

/** Mesmo roteiro · tom claro/feliz (evita grave de “senhor”), ritmo empolgado. */
const APROVA_MASCOT_SPEECH_RATE = 1.3;
const APROVA_MASCOT_SPEECH_PITCH = 1.45;
const APROVA_MASCOT_SPEECH_PITCH_DEEP = 1.55; // Antonio e afins (muito graves)
const APROVA_MASCOT_SPEECH_VOLUME = 1;
const APROVA_MASCOT_VIDEO_RATE = 1;

let aprovaMascotReplayMode = false;
let aprovaMascotSpeakTimer = null;
let aprovaMascotCachedVoice = null;

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

/** One-shot: reabre o vídeo uma vez para scorcine@gmail.com. */
function aprovaMascotMaybeForceOwnerOnce () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const email = String(session && session.login || "").trim().toLowerCase();
  if (email !== "scorcine@gmail.com") return false;
  try {
    if (localStorage.getItem(APROVA_MASCOT_FORCE_KEY) === APROVA_MASCOT_FORCE_TOKEN) {
      return false;
    }
    localStorage.removeItem(APROVA_MASCOT_SEEN_KEY);
    localStorage.setItem(APROVA_MASCOT_FORCE_KEY, APROVA_MASCOT_FORCE_TOKEN);
    aprovaMaybeShowWelcomeMascot._opened = false;
    return true;
  } catch (e) {
    return false;
  }
}

function aprovaMascotStopSpeech () {
  if (aprovaMascotSpeakTimer) {
    window.clearTimeout(aprovaMascotSpeakTimer);
    aprovaMascotSpeakTimer = null;
  }
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

function aprovaMascotVoiceIsDeep (voice) {
  if (!voice) return false;
  return /antonio|ant[oô]nio|ricardo|david|jorge/.test(String(voice.name || "").toLowerCase());
}

/** Prefere masculina clara/jovem (Daniel…). Evita Antonio grave quando houver opção. */
function aprovaMascotPickPtVoice () {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return aprovaMascotCachedVoice;

    const blob = (v) => (String(v.name || "") + " " + String(v.lang || "")).toLowerCase();
    const isPtBr = (v) => /^pt-br/i.test(v.lang) || /brazil|brasil/.test(blob(v));
    const isFemale = (v) =>
      /maria|francisca|thalita|luciana|fernanda|vit[oó]ria|daniela|heloisa|female|feminina/.test(blob(v));

    const score = (v) => {
      if (!isPtBr(v) || isFemale(v)) return -1;
      const b = blob(v);
      let s = 0;
      // Mais claros / jovens
      if (/daniel|felipe|gustavo/.test(b)) s += 100;
      else if (/male|masculin|homem/.test(b)) s += 50;
      else if (/antonio|ant[oô]nio|ricardo/.test(b)) s += 15; // último recurso (grave)
      else return -1;
      if (v.localService) s += 8;
      if (/online|neural/.test(b)) s += 5; // às vezes mais expressiva
      return s;
    };

    let best = null;
    let bestScore = -1;
    voices.forEach((v) => {
      const s = score(v);
      if (s > bestScore) {
        bestScore = s;
        best = v;
      }
    });
    if (best) aprovaMascotCachedVoice = best;
    return best || aprovaMascotCachedVoice;
  } catch (e) {
    return aprovaMascotCachedVoice;
  }
}

function aprovaMascotPlayVideo () {
  const video = document.getElementById("welcome-mascot-video");
  if (!video) return;
  try {
    video.loop = true;
    video.muted = true;
    video.volume = 0;
    video.playbackRate = APROVA_MASCOT_VIDEO_RATE;
    video.currentTime = 0;
  } catch (e) { /* ignore */ }
  video.play().catch(() => {});
}

function aprovaMascotHideTapToHear () {
  const tap = document.getElementById("welcome-mascot-tap");
  if (tap) tap.hidden = true;
}

function aprovaMascotShowTapToHear () {
  const tap = document.getElementById("welcome-mascot-tap");
  if (tap) tap.hidden = false;
}

/** Chamado no gesto do usuário (Toque para ouvir / avatar). */
function aprovaMascotSpeakWelcome (firstName) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  const name = firstName || aprovaMascotFirstName();
  const text = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT_SPEECH, name);

  let needsGap = false;
  try {
    needsGap = !!(window.speechSynthesis.speaking || window.speechSynthesis.pending);
    if (needsGap || aprovaMascotSpeakTimer) aprovaMascotStopSpeech();
  } catch (e) {
    needsGap = true;
    aprovaMascotStopSpeech();
  }

  aprovaMascotPlayVideo();
  aprovaMascotHideTapToHear();

  const speak = () => {
    aprovaMascotSpeakTimer = null;
    try {
      const voice = aprovaMascotPickPtVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.rate = APROVA_MASCOT_SPEECH_RATE;
      u.pitch = aprovaMascotVoiceIsDeep(voice)
        ? APROVA_MASCOT_SPEECH_PITCH_DEEP
        : APROVA_MASCOT_SPEECH_PITCH;
      u.volume = APROVA_MASCOT_SPEECH_VOLUME;
      if (voice) {
        u.voice = voice;
        if (voice.lang) u.lang = voice.lang;
      }
      u.onerror = () => aprovaMascotShowTapToHear();
      window.speechSynthesis.speak(u);
    } catch (e) {
      aprovaMascotShowTapToHear();
    }
  };

  // Gap só quando houve cancel — senão fala na hora (menos travamento)
  aprovaMascotSpeakTimer = window.setTimeout(speak, needsGap ? 120 : 0);

  return true;
}

function aprovaMascotHearNow () {
  try {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  } catch (e) { /* ignore */ }
  return aprovaMascotSpeakWelcome(aprovaMascotFirstName());
}

function aprovaCloseWelcomeMascotModal () {
  const modal = document.getElementById("welcome-mascot-modal");
  const video = document.getElementById("welcome-mascot-video");
  const wasReplay = aprovaMascotReplayMode;
  aprovaMascotReplayMode = false;

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

  if (wasReplay) return;

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

function aprovaOpenWelcomeMascotModal (opts) {
  const options = opts || {};
  aprovaMascotReplayMode = !!options.replay;

  const modal = document.getElementById("welcome-mascot-modal");
  const title = document.getElementById("welcome-mascot-title");
  const caption = document.getElementById("welcome-mascot-caption");
  const closeBtn = modal && modal.querySelector("[data-welcome-mascot-close].btn-primary");
  const first = aprovaMascotFirstName();
  const captionText = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT, first);

  if (!modal) return;

  if (title) title.textContent = "Olá, " + first + "!";
  if (caption) caption.textContent = captionText;
  if (closeBtn) {
    closeBtn.textContent = aprovaMascotReplayMode ? "Fechar" : "Preencher meu perfil";
  }

  const wrap = document.getElementById("inicio-mascot");
  if (wrap) wrap.hidden = true;

  modal.hidden = false;
  aprovaMascotShowTapToHear();
  aprovaMascotStopSpeech();
  aprovaMascotPlayVideo();

  if (aprovaMascotReplayMode) {
    aprovaMascotHearNow();
  }
}

function aprovaRenderInicioMascot () {
  const wrap = document.getElementById("inicio-mascot");
  const img = document.getElementById("inicio-mascot-img");
  const btn = document.getElementById("inicio-mascot-btn");
  if (!wrap || !img) return;

  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const logged = !!(session && session.login);
  const seen = aprovaMascotHasSeenWelcome();
  const modal = document.getElementById("welcome-mascot-modal");
  const modalOpen = modal && !modal.hidden;

  wrap.hidden = !logged || !seen || modalOpen;
  if (!wrap.hidden) {
    img.src = APROVA_MASCOT_IMG;
    img.alt = "Mascote MedHub R1 — toque para ouvir de novo";
    if (btn) btn.title = "Ouvir boas-vindas de novo";
  }
}

function aprovaMaybeShowWelcomeMascot () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  if (!session || !session.login) return;

  aprovaMascotMaybeForceOwnerOnce();
  aprovaRenderInicioMascot();

  if (aprovaMascotHasSeenWelcome()) return;
  if (aprovaMaybeShowWelcomeMascot._opened) return;
  aprovaMaybeShowWelcomeMascot._opened = true;

  window.setTimeout(() => {
    aprovaOpenWelcomeMascotModal({ replay: false });
  }, 280);
}

function aprovaBindWelcomeMascot () {
  const modal = document.getElementById("welcome-mascot-modal");
  if (!modal || modal.dataset.bound === "1") return;
  modal.dataset.bound = "1";

  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        aprovaMascotPickPtVoice();
      };
    } catch (e) { /* ignore */ }
  }

  modal.querySelectorAll("[data-welcome-mascot-close]").forEach((el) => {
    el.addEventListener("click", () => aprovaCloseWelcomeMascotModal());
  });

  document.getElementById("welcome-mascot-tap")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    aprovaMascotHearNow();
  });

  document.getElementById("welcome-mascot-replay")?.addEventListener("click", () => {
    aprovaMascotHearNow();
  });

  document.getElementById("inicio-mascot-btn")?.addEventListener("click", () => {
    aprovaOpenWelcomeMascotModal({ replay: true });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  aprovaBindWelcomeMascot();
});

window.aprovaMaybeShowWelcomeMascot = aprovaMaybeShowWelcomeMascot;
window.aprovaRenderInicioMascot = aprovaRenderInicioMascot;
window.aprovaCloseWelcomeMascotModal = aprovaCloseWelcomeMascotModal;
