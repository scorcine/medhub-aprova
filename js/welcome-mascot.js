/* Mascote de boas-vindas — 1ª visita: vídeo; depois: foto no Início */

const APROVA_MASCOT_SEEN_KEY = "medhub-aprova-mascot-welcome-v1";
const APROVA_MASCOT_IMG = "/assets/mascote.png";
const APROVA_MASCOT_VIDEO = "/assets/mascote-welcome.mp4";

function aprovaMascotFirstName () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const raw = (session && (session.name || session.login)) || "estudante";
  const first = String(raw).trim().split(/\s+/)[0] || "estudante";
  // E-mail → parte antes do @
  if (first.indexOf("@") !== -1) return first.split("@")[0] || "estudante";
  return first;
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

/** Fala o nome com a voz do navegador (não altera o áudio do vídeo gravado). */
function aprovaMascotSpeakWelcome (firstName) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  try {
    aprovaMascotStopSpeech();
    const u = new SpeechSynthesisUtterance(
      "Olá, " + firstName + "! Seja bem-vindo ao MedHub R1. Vamos estudar com intenção."
    );
    u.lang = "pt-BR";
    u.rate = 1;
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
}

function aprovaOpenWelcomeMascotModal () {
  const modal = document.getElementById("welcome-mascot-modal");
  const video = document.getElementById("welcome-mascot-video");
  const title = document.getElementById("welcome-mascot-title");
  const caption = document.getElementById("welcome-mascot-caption");
  const first = aprovaMascotFirstName();

  if (!modal) return;

  if (title) title.textContent = "Olá, " + first + "!";
  if (caption) {
    caption.textContent =
      "Bem-vindo ao MedHub R1, " + first +
      ". Esta mensagem aparece só na primeira vez — da próxima, o mascote fica aqui no Início.";
  }

  modal.hidden = false;

  if (video) {
    // Vídeo gravado continua genérico; o nome aparece no texto (e opcionalmente na voz do navegador).
    video.muted = false;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        // Autoplay bloqueado: usuário usa o controle do vídeo.
      });
    }
  }
}

function aprovaRenderInicioMascot () {
  const wrap = document.getElementById("inicio-mascot");
  const img = document.getElementById("inicio-mascot-img");
  if (!wrap || !img) return;

  const seen = aprovaMascotHasSeenWelcome();
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
  // Evita abrir duas vezes no mesmo boot
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

  document.getElementById("welcome-mascot-speak")?.addEventListener("click", () => {
    aprovaMascotSpeakWelcome(aprovaMascotFirstName());
  });

  const video = document.getElementById("welcome-mascot-video");
  video?.addEventListener("ended", () => {
    // Mantém o modal aberto para o usuário confirmar; não fecha sozinho.
  });
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
