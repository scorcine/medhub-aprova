/* Mascote de boas-vindas — 1ª visita automática; depois só se clicar no avatar */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_FORCE_KEY = "medhub-aprova-mascot-force-v1";
const APROVA_MASCOT_FORCE_TOKEN = "20260721-scorcine-motiv1";
const APROVA_MASCOT_IMG = "/assets/mascote.png";

/**
 * Legenda na tela (roteiro corrigido — transformar / configurando).
 */
const APROVA_MASCOT_SCRIPT =
  "Seja bem-vindo, {nome}. " +
  "Este é o aplicativo que vai transformar os seus estudos. " +
  "Comece configurando o seu perfil para uma experiência personalizada de acordo com a sua prova.";

/**
 * Texto falado: nome no começo (sem pausa dramática), tom motivante, fluído.
 */
const APROVA_MASCOT_SCRIPT_SPEECH =
  "Olá {nome}! " +
  "Este é o aplicativo que vai transformar os seus estudos. " +
  "Comece já configurando o seu perfil e personalize tudo de acordo com a sua prova!";

/** Ritmo motivante — mais rápido e vivo. */
const APROVA_MASCOT_SPEECH_RATE = 1.38;
const APROVA_MASCOT_SPEECH_RATE_SLOW_VOICE = 1.52; // neural/online compensação
const APROVA_MASCOT_SPEECH_PITCH = 1.18;
const APROVA_MASCOT_SPEECH_VOLUME = 1;
const APROVA_MASCOT_VIDEO_RATE = 1.15;

let aprovaMascotReplayMode = false;
let aprovaMascotSyncingVolume = false;
let aprovaMascotSpeakTimer = null;
let aprovaMascotKeepAlive = null;
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

function aprovaMascotClearKeepAlive () {
  if (aprovaMascotKeepAlive) {
    window.clearInterval(aprovaMascotKeepAlive);
    aprovaMascotKeepAlive = null;
  }
}

function aprovaMascotStopSpeech () {
  if (aprovaMascotSpeakTimer) {
    window.clearTimeout(aprovaMascotSpeakTimer);
    aprovaMascotSpeakTimer = null;
  }
  aprovaMascotClearKeepAlive();
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

function aprovaMascotVoiceIsSlow (voice) {
  if (!voice) return false;
  const blob = String(voice.name || "").toLowerCase();
  return /neural|natural|enhanced|premium|online/.test(blob);
}

/**
 * Prefere Google pt-BR (ágil). Se só houver neural, não força voz —
 * deixa o navegador com lang pt-BR (costuma soar menos “dramático”).
 */
function aprovaMascotPickPtVoice () {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return aprovaMascotCachedVoice;

    const isPtBr = (v) => {
      const blob = (String(v.name || "") + " " + String(v.lang || "")).toLowerCase();
      return /^pt-br/i.test(v.lang) || /brazil|brasil|portugu/.test(blob);
    };

    const google = voices.find((v) => isPtBr(v) && /google/i.test(v.name || ""));
    if (google) {
      aprovaMascotCachedVoice = google;
      return google;
    }

    const snappyLocal = voices.find((v) => {
      if (!isPtBr(v) || !v.localService) return false;
      const n = String(v.name || "").toLowerCase();
      if (/online|neural|natural|enhanced|premium/.test(n)) return false;
      return /maria|francisca|luciana|fernanda|vit[oó]ria|daniela|heloisa/.test(n);
    });
    if (snappyLocal) {
      aprovaMascotCachedVoice = snappyLocal;
      return snappyLocal;
    }

    // Sem voz boa: null → só lang pt-BR (evita neural arrastada forçada)
    return null;
  } catch (e) {
    return aprovaMascotCachedVoice;
  }
}

function aprovaMascotSetVideoVolume (video, volume, muted) {
  if (!video) return;
  aprovaMascotSyncingVolume = true;
  try {
    video.volume = Math.max(0, Math.min(1, volume));
    video.muted = !!muted;
  } catch (e) { /* ignore */ }
  window.setTimeout(() => { aprovaMascotSyncingVolume = false; }, 0);
}

function aprovaMascotRestartVideo () {
  const video = document.getElementById("welcome-mascot-video");
  if (!video) return;
  try {
    video.loop = true;
    video.playbackRate = APROVA_MASCOT_VIDEO_RATE;
    if (video.paused || video.ended || video.currentTime > 0.2) {
      video.currentTime = 0;
    }
  } catch (e) { /* ignore */ }
  aprovaMascotSetVideoVolume(video, 0, true);
  video.play().catch(() => {});
}

function aprovaMascotPauseVideoSoft () {
  const video = document.getElementById("welcome-mascot-video");
  if (!video) return;
  try {
    video.pause();
  } catch (e) { /* ignore */ }
}

function aprovaMascotHideTapToHear () {
  const tap = document.getElementById("welcome-mascot-tap");
  if (tap) tap.hidden = true;
}

function aprovaMascotShowTapToHear () {
  const tap = document.getElementById("welcome-mascot-tap");
  if (tap) tap.hidden = false;
}

/** Precisa ser chamado no clique do usuário (gesto) para o som sair no Chrome/mobile. */
function aprovaMascotSpeakWelcome (firstName) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  const name = firstName || aprovaMascotFirstName();
  try {
    try { window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ }
    try { window.speechSynthesis.resume(); } catch (e) { /* ignore */ }
    aprovaMascotStopSpeech();

    const text = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT_SPEECH, name);
    aprovaMascotRestartVideo();
    aprovaMascotHideTapToHear();

    const speakNow = () => {
      try {
        try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
        try { window.speechSynthesis.resume(); } catch (e) { /* ignore */ }

        const voice = aprovaMascotPickPtVoice();
        const slow = aprovaMascotVoiceIsSlow(voice);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "pt-BR";
        u.rate = slow ? APROVA_MASCOT_SPEECH_RATE_SLOW_VOICE : APROVA_MASCOT_SPEECH_RATE;
        u.pitch = APROVA_MASCOT_SPEECH_PITCH;
        u.volume = APROVA_MASCOT_SPEECH_VOLUME;
        if (voice) {
          u.voice = voice;
          if (voice.lang) u.lang = voice.lang;
        }

        u.onstart = () => {
          aprovaMascotRestartVideo();
          aprovaMascotClearKeepAlive();
          // Chrome às vezes “pausa” a fala no meio — resume mantém o fluxo
          aprovaMascotKeepAlive = window.setInterval(() => {
            try {
              if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
            } catch (e) { /* ignore */ }
          }, 4000);
        };

        u.onend = () => {
          aprovaMascotClearKeepAlive();
          // Fim da fala = fim da animação (sincronizado)
          aprovaMascotPauseVideoSoft();
        };

        u.onerror = () => {
          aprovaMascotClearKeepAlive();
          aprovaMascotShowTapToHear();
        };

        window.speechSynthesis.speak(u);
      } catch (e) {
        aprovaMascotShowTapToHear();
      }
    };

    aprovaMascotSpeakTimer = window.setTimeout(() => {
      aprovaMascotSpeakTimer = null;
      speakNow();
    }, 30);
    return true;
  } catch (e) {
    aprovaMascotShowTapToHear();
    return false;
  }
}

function aprovaMascotHearNow () {
  if (window.speechSynthesis) {
    try { window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ }
  }
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
  aprovaMascotRestartVideo();

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

  const videoEl = document.getElementById("welcome-mascot-video");
  videoEl?.addEventListener("ended", () => {
    const modalOpen = modal && !modal.hidden;
    const speaking = window.speechSynthesis && window.speechSynthesis.speaking;
    if (!modalOpen || !speaking) return;
    try {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    } catch (e) { /* ignore */ }
  });

  document.getElementById("welcome-mascot-tap")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    aprovaMascotHearNow();
  });

  document.getElementById("welcome-mascot-replay")?.addEventListener("click", () => {
    aprovaMascotRestartVideo();
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
