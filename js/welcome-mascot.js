/* Mascote de boas-vindas — 1ª visita automática; depois só se clicar no avatar */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_FORCE_KEY = "medhub-aprova-mascot-force-v1";
const APROVA_MASCOT_FORCE_TOKEN = "20260721-scorcine-voicefile1";
const APROVA_MASCOT_IMG = "/assets/mascote.png?v=20260721icon2";
/** Voz gravada do mascote (pasta Divulgação/Macote). */
const APROVA_MASCOT_AUDIO_SRC = "/assets/mascote-welcome.mp3";

/** Legenda + roteiro na tela (português do Brasil) — não alterar. */
const APROVA_MASCOT_SCRIPT =
  "Olá, {nome}, este é o aplicativo que irá revolucionar seus estudos. " +
  "Inicie configurando o seu perfil para uma experiência personalizada de acordo com a sua prova.";

let aprovaMascotReplayMode = false;
let aprovaMascotAudio = null;
let aprovaMascotPlayGen = 0;

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

function aprovaMascotGetAudio () {
  if (aprovaMascotAudio) return aprovaMascotAudio;
  const el = new Audio(APROVA_MASCOT_AUDIO_SRC);
  el.preload = "auto";
  el.volume = 1;
  aprovaMascotAudio = el;
  return el;
}

function aprovaMascotStopSpeech () {
  const audio = aprovaMascotAudio;
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) { /* ignore */ }
  }
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

function aprovaMascotPauseVideo () {
  const video = document.getElementById("welcome-mascot-video");
  if (!video) return;
  try {
    video.pause();
  } catch (e) { /* ignore */ }
}

/** Vídeo mudo, alinhado ao áudio (para quando a fala acaba). */
function aprovaMascotPlayVideoSynced (audioDuration) {
  const video = document.getElementById("welcome-mascot-video");
  if (!video) return;
  try {
    video.loop = false;
    video.muted = true;
    video.volume = 0;
    video.currentTime = 0;
    const vDur = Number(video.duration);
    if (audioDuration > 0 && vDur > 0 && isFinite(vDur)) {
      // Acaba o gesto do avatar junto com o fim da fala
      video.playbackRate = Math.max(0.85, Math.min(1.35, vDur / audioDuration));
    } else {
      video.playbackRate = 1;
    }
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

function aprovaMascotIdleVideo () {
  const video = document.getElementById("welcome-mascot-video");
  if (!video) return;
  try {
    video.loop = true;
    video.muted = true;
    video.volume = 0;
    video.playbackRate = 1;
    video.currentTime = 0;
  } catch (e) { /* ignore */ }
  video.play().catch(() => {});
}

/** Voz do arquivo do mascote + vídeo sincronizado até o fim da fala. */
function aprovaMascotSpeakWelcome () {
  const audio = aprovaMascotGetAudio();
  const gen = ++aprovaMascotPlayGen;
  aprovaMascotStopSpeech();
  aprovaMascotHideTapToHear();

  const startPair = () => {
    if (gen !== aprovaMascotPlayGen) return;
    const dur = Number(audio.duration);
    const audioDuration = dur > 0 && isFinite(dur) ? dur : 10.92;
    aprovaMascotPlayVideoSynced(audioDuration);
    audio.volume = 1;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        if (gen !== aprovaMascotPlayGen) return;
        aprovaMascotShowTapToHear();
        aprovaMascotIdleVideo();
      });
    }
  };

  audio.onended = () => {
    if (gen !== aprovaMascotPlayGen) return;
    aprovaMascotPauseVideo();
  };
  audio.onerror = () => {
    if (gen !== aprovaMascotPlayGen) return;
    aprovaMascotPauseVideo();
    aprovaMascotShowTapToHear();
  };

  try {
    audio.currentTime = 0;
  } catch (e) { /* ignore */ }

  if (audio.readyState >= 1 && audio.duration > 0) {
    startPair();
  } else {
    audio.onloadedmetadata = () => {
      audio.onloadedmetadata = null;
      startPair();
    };
    try { audio.load(); } catch (e) { /* ignore */ }
    window.setTimeout(() => {
      if (gen === aprovaMascotPlayGen && audio.paused) startPair();
    }, 400);
  }

  return true;
}

function aprovaMascotHearNow () {
  return aprovaMascotSpeakWelcome();
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
  aprovaMascotIdleVideo();

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

  // Pré-carrega a voz do mascote
  try { aprovaMascotGetAudio(); } catch (e) { /* ignore */ }

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
