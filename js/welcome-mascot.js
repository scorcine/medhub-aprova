/* Mascote de boas-vindas — 1ª visita automática; depois só se clicar no avatar */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_FORCE_KEY = "medhub-aprova-mascot-force-v1";
const APROVA_MASCOT_FORCE_TOKEN = "20260721-scorcine-once";
const APROVA_MASCOT_IMG = "/assets/mascote.png";

/**
 * Roteiro da 1ª visita. Use {nome} onde o nome da pessoa deve entrar.
 */
const APROVA_MASCOT_SCRIPT =
  "Seja bem-vindo, {nome}, ao aplicativo que irá revolucionar seus estudos. " +
  "Inicie preenchendo o seu perfil para uma experiência personalizada de acordo com a sua prova.";

let aprovaMascotReplayMode = false;

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

  // Áudio = trilha do vídeo. volume sempre 1 para o unmute do player funcionar.
  // (Antes volume=0 impedia ouvir mesmo com a caixa de som ativada.)
  aprovaMascotStopSpeech();
  if (video) {
    video.volume = 1;
    try { video.currentTime = 0; } catch (e) { /* ignore */ }

    const tryPlayWithSound = () => {
      video.muted = false;
      return video.play();
    };

    const playPromise = tryPlayWithSound();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay com som bloqueado: inicia mudo, mas volume=1 — ao desmutar, ouve.
        video.muted = true;
        video.volume = 1;
        video.play().catch(() => {});
      });
    }
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

  document.getElementById("welcome-mascot-replay")?.addEventListener("click", () => {
    const video = document.getElementById("welcome-mascot-video");
    aprovaMascotStopSpeech();
    if (video) {
      try {
        video.volume = 1;
        video.muted = false;
        video.currentTime = 0;
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      } catch (e) { /* ignore */ }
    }
  });

  const videoEl = document.getElementById("welcome-mascot-video");
  videoEl?.addEventListener("volumechange", () => {
    // Se o usuário ligar o som do vídeo, para a voz do navegador (se houver).
    if (videoEl && !videoEl.muted && videoEl.volume > 0) {
      aprovaMascotStopSpeech();
    }
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
