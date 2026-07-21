/* Mascote de boas-vindas — 1ª visita automática; depois só se clicar no avatar */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_FORCE_KEY = "medhub-aprova-mascot-force-v1";
const APROVA_MASCOT_FORCE_TOKEN = "20260721-scorcine-voicefix1";
const APROVA_MASCOT_IMG = "/assets/mascote.png";

/**
 * Roteiro falado (voz do navegador). Use {nome} para o primeiro nome.
 * Evita palavras que o TTS costuma errar (revolucionar / preenchendo).
 */
const APROVA_MASCOT_SCRIPT =
  "Seja bem-vindo, {nome}. " +
  "Este é o aplicativo que vai transformar os seus estudos. " +
  "Comece configurando o seu perfil para uma experiência personalizada de acordo com a sua prova.";

/** Mesma voz/velocidade no auto-open e no clique do avatar. */
const APROVA_MASCOT_SPEECH_RATE = 1.18;
const APROVA_MASCOT_SPEECH_PITCH = 1.12;
const APROVA_MASCOT_SPEECH_VOLUME = 1;
const APROVA_MASCOT_VIDEO_RATE = 1.12;

let aprovaMascotReplayMode = false;
let aprovaMascotSyncingVolume = false;
let aprovaMascotSpeakTimer = null;

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

/** Escolhe a voz pt-BR mais natural/animada disponível no aparelho. */
function aprovaMascotPickPtVoice () {
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    const score = (v) => {
      const name = String(v.name || "");
      const lang = String(v.lang || "");
      const blob = (name + " " + lang).toLowerCase();
      let s = 0;
      if (/^pt-br/i.test(lang) || /brazil|brasil/.test(blob)) s += 50;
      else if (/^pt/i.test(lang)) s += 20;
      else return -1;
      // Vozes geralmente mais naturais / amigáveis no Windows/Chrome/Edge
      if (/google.*(portugu|brasil)|microsoft.*(maria|francisca|thalita|antonio)|luciana|fernanda|vit[oó]ria|daniela/.test(blob)) {
        s += 40;
      }
      if (/maria|francisca|thalita|luciana|fernanda|vit[oó]ria|daniela|heloisa|female|feminina/.test(blob)) {
        s += 25; // tom mais acolhedor / carismático
      }
      if (/neural|natural|enhanced|premium|online/.test(blob)) s += 15;
      if (/compact|mini|eloquence|siri/.test(blob)) s -= 10;
      if (v.localService) s += 5;
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
    return best;
  } catch (e) {
    return null;
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
    try { window.speechSynthesis.resume(); } catch (e) { /* ignore */ }
    aprovaMascotStopSpeech();

    const text = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT, name);
    const video = document.getElementById("welcome-mascot-video");
    if (video) {
      try {
        video.playbackRate = APROVA_MASCOT_VIDEO_RATE;
      } catch (e) { /* ignore */ }
      aprovaMascotSetVideoVolume(video, 0, true);
      try {
        video.play().catch(() => {});
      } catch (e) { /* ignore */ }
    }

    aprovaMascotHideTapToHear();

    // Chrome: cancel() + speak() no mesmo tick às vezes muda a voz/corta a fala.
    aprovaMascotSpeakTimer = window.setTimeout(() => {
      aprovaMascotSpeakTimer = null;
      try {
        try { window.speechSynthesis.resume(); } catch (e) { /* ignore */ }
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "pt-BR";
        u.rate = APROVA_MASCOT_SPEECH_RATE;
        u.pitch = APROVA_MASCOT_SPEECH_PITCH;
        u.volume = APROVA_MASCOT_SPEECH_VOLUME;
        const voice = aprovaMascotPickPtVoice();
        if (voice) {
          u.voice = voice;
          if (voice.lang) u.lang = voice.lang;
        }
        window.speechSynthesis.speak(u);
      } catch (e) {
        aprovaMascotShowTapToHear();
      }
    }, 60);
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

  // Replay pelo avatar: só fecha, sem empurrar perfil de novo.
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
  const video = document.getElementById("welcome-mascot-video");
  const title = document.getElementById("welcome-mascot-title");
  const caption = document.getElementById("welcome-mascot-caption");
  const closeBtn = modal && modal.querySelector("[data-welcome-mascot-close].btn-primary");
  const first = aprovaMascotFirstName();
  const spoken = aprovaMascotFillScript(APROVA_MASCOT_SCRIPT, first);

  if (!modal) return;

  if (title) title.textContent = "Olá, " + first + "!";
  if (caption) caption.textContent = spoken;
  if (closeBtn) {
    closeBtn.textContent = aprovaMascotReplayMode ? "Fechar" : "Preencher meu perfil";
  }

  // Esconde o avatar enquanto o modal está aberto (evita “duas versões”).
  const wrap = document.getElementById("inicio-mascot");
  if (wrap) wrap.hidden = true;

  modal.hidden = false;
  aprovaMascotShowTapToHear();
  aprovaMascotStopSpeech();

  // Vídeo só visual (mudo); fala usa a mesma velocidade/voz do roteiro corrigido.
  if (video) {
    try {
      video.playbackRate = APROVA_MASCOT_VIDEO_RATE;
      video.currentTime = 0;
    } catch (e) { /* ignore */ }
    aprovaMascotSetVideoVolume(video, 0, true);
    video.play().catch(() => {});
  }

  // Clique no avatar = mesmo caminho de fala (gesto do usuário).
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

  // Avatar visível depois da 1ª visita; oculto se o modal estiver aberto.
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

  modal.querySelectorAll("[data-welcome-mascot-close]").forEach((el) => {
    el.addEventListener("click", () => aprovaCloseWelcomeMascotModal());
  });

  document.getElementById("welcome-mascot-tap")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    aprovaMascotHearNow();
  });

  document.getElementById("welcome-mascot-replay")?.addEventListener("click", () => {
    const video = document.getElementById("welcome-mascot-video");
    if (video) {
      try {
        video.playbackRate = APROVA_MASCOT_VIDEO_RATE;
        video.currentTime = 0;
        aprovaMascotSetVideoVolume(video, 0, true);
        video.play().catch(() => {});
      } catch (e) { /* ignore */ }
    }
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
