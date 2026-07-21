/* Instalar MedHub R1 na tela inicial — Android (prompt) + iPhone (instruções) */

(function () {
  const DISMISS_KEY = "medhub-aprova-install-dismiss-v1";
  let deferredPrompt = null;

  function aprovaIsStandalone () {
    try {
      if (window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
      if (navigator.standalone === true) return true;
    } catch {
      /* ignore */
    }
    return false;
  }

  function aprovaIsIos () {
    const ua = navigator.userAgent || "";
    const iOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return iOS;
  }

  function aprovaIsAndroid () {
    return /Android/i.test(navigator.userAgent || "");
  }

  function aprovaInstallDismissed () {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  }

  function aprovaSetInstallDismissed () {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function aprovaShowInstallModal (show) {
    const modal = document.getElementById("aprova-install-modal");
    if (!modal) return;
    modal.hidden = !show;
    if (show) {
      const ios = document.getElementById("aprova-install-ios");
      const and = document.getElementById("aprova-install-android");
      if (ios) ios.hidden = !aprovaIsIos();
      if (and) and.hidden = aprovaIsIos();
    }
  }

  async function aprovaTriggerInstall () {
    if (aprovaIsStandalone()) {
      aprovaShowInstallModal(true);
      const note = document.getElementById("aprova-install-status");
      if (note) note.textContent = "O app já está instalado neste aparelho.";
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          aprovaSetInstallDismissed();
          aprovaRefreshInstallUi();
        }
      } catch {
        /* ignore */
      }
      deferredPrompt = null;
      return;
    }

    // iPhone / Safari / sem prompt nativo → mostra o passo a passo
    aprovaShowInstallModal(true);
  }

  function aprovaRefreshInstallUi () {
    const installed = aprovaIsStandalone();
    const canNative = Boolean(deferredPrompt);
    const showHint = !installed && !aprovaInstallDismissed();

    document.querySelectorAll("[data-aprova-install]").forEach((btn) => {
      btn.hidden = installed;
      if (installed) return;
      const label = btn.querySelector("[data-aprova-install-label]") || btn;
      if (canNative || aprovaIsAndroid()) {
        label.textContent = btn.getAttribute("data-label-android") || "Instalar app";
      } else if (aprovaIsIos()) {
        label.textContent = btn.getAttribute("data-label-ios") || "Instalar no iPhone";
      } else {
        label.textContent = btn.getAttribute("data-label-default") || "Instalar app";
      }
    });

    document.querySelectorAll("[data-aprova-install-banner]").forEach((el) => {
      el.hidden = !showHint || installed;
    });

    document.querySelectorAll("[data-aprova-installed-note]").forEach((el) => {
      el.hidden = !installed;
    });
  }

  function aprovaBindInstallUi () {
    document.querySelectorAll("[data-aprova-install]").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        void aprovaTriggerInstall();
      });
    });

    document.querySelectorAll("[data-aprova-install-close]").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => aprovaShowInstallModal(false));
    });

    document.querySelectorAll("[data-aprova-install-dismiss]").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        aprovaSetInstallDismissed();
        aprovaShowInstallModal(false);
        aprovaRefreshInstallUi();
      });
    });

    const androidPrompt = document.getElementById("aprova-install-android-prompt");
    if (androidPrompt && androidPrompt.dataset.bound !== "1") {
      androidPrompt.dataset.bound = "1";
      androidPrompt.addEventListener("click", () => {
        if (deferredPrompt) {
          void aprovaTriggerInstall();
          return;
        }
        const note = document.getElementById("aprova-install-status");
        if (note) {
          note.textContent = "Use o menu ⋮ do Chrome → Instalar app (ou Adicionar à tela inicial).";
        }
      });
    }
  }

  function aprovaRegisterSw () {
    if (!("serviceWorker" in navigator)) return;
    const swUrl = "/sw.js?v=r1-pwa-1";
    navigator.serviceWorker.register(swUrl).catch(() => undefined);
  }

  function aprovaEnsureInstallModal () {
    if (document.getElementById("aprova-install-modal")) return;
    const wrap = document.createElement("div");
    wrap.id = "aprova-install-modal";
    wrap.className = "aprova-modal";
    wrap.hidden = true;
    wrap.innerHTML =
      "<div class=\"aprova-modal-backdrop\" data-aprova-install-close></div>" +
      "<div class=\"aprova-modal-panel aprova-install-panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"aprova-install-title\">" +
        "<div class=\"aprova-modal-head\">" +
          "<div>" +
            "<p class=\"trial-modal-kicker\">MedHub R1</p>" +
            "<h3 id=\"aprova-install-title\" class=\"esp-decks-title\" style=\"margin:0\">Instalar o app</h3>" +
          "</div>" +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-aprova-install-close aria-label=\"Fechar\">✕</button>" +
        "</div>" +
        "<p id=\"aprova-install-status\" class=\"muted\" style=\"margin:0 0 0.85rem\"></p>" +
        "<div id=\"aprova-install-ios\">" +
          "<ol class=\"aprova-install-steps\">" +
            "<li>Toque em <strong>Compartilhar</strong> <span aria-hidden=\"true\">▢↑</span> na barra do Safari</li>" +
            "<li>Role e toque em <strong>Adicionar à Tela de Início</strong></li>" +
            "<li>Confirme em <strong>Adicionar</strong> — o ícone do MedHub R1 aparece na tela</li>" +
          "</ol>" +
          "<p class=\"muted\" style=\"margin:0.75rem 0 0;font-size:0.85rem\">No iPhone isso precisa ser pelo Safari (não pelo Instagram).</p>" +
        "</div>" +
        "<div id=\"aprova-install-android\" hidden>" +
          "<ol class=\"aprova-install-steps\">" +
            "<li>Toque no botão <strong>Instalar app</strong> abaixo (ou no menu ⋮ do Chrome)</li>" +
            "<li>Confirme <strong>Instalar</strong> no aviso do Android</li>" +
            "<li>Abra pelo ícone na tela inicial</li>" +
          "</ol>" +
          "<div class=\"actions-row\" style=\"margin-top:1rem\">" +
            "<button type=\"button\" class=\"btn btn-primary\" id=\"aprova-install-android-prompt\">Instalar agora</button>" +
          "</div>" +
          "<p class=\"muted\" style=\"margin:0.75rem 0 0;font-size:0.85rem\">Se o aviso não aparecer, use Chrome → menu ⋮ → <strong>Instalar app</strong> / <strong>Adicionar à tela inicial</strong>.</p>" +
        "</div>" +
        "<div class=\"actions-row\" style=\"margin-top:1rem\">" +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-aprova-install-dismiss>Agora não</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(wrap);
  }

  window.aprovaTriggerInstall = aprovaTriggerInstall;
  window.aprovaRefreshInstallUi = aprovaRefreshInstallUi;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    aprovaRefreshInstallUi();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    aprovaSetInstallDismissed();
    aprovaRefreshInstallUi();
  });

  function boot () {
    aprovaEnsureInstallModal();
    aprovaBindInstallUi();
    aprovaRefreshInstallUi();
    aprovaRegisterSw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
