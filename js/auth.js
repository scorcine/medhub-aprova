/* Login local (protótipo) — sessão no localStorage */

const APROVA_AUTH_KEY = "medhub-aprova-auth-v1";

function aprovaLoadAuth () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

function aprovaSaveAuth (session) {
  if (!session) localStorage.removeItem(APROVA_AUTH_KEY);
  else localStorage.setItem(APROVA_AUTH_KEY, JSON.stringify(session));
}

function aprovaRenderAuth () {
  const form = document.getElementById("auth-form");
  const sessionEl = document.getElementById("auth-session");
  const label = document.getElementById("auth-user-label");
  const session = aprovaLoadAuth();

  if (!form || !sessionEl) return;

  if (session && session.login) {
    form.hidden = true;
    sessionEl.hidden = false;
    if (label) label.textContent = session.login;
  } else {
    form.hidden = false;
    sessionEl.hidden = true;
  }
}

function aprovaBootAuth () {
  const form = document.getElementById("auth-form");
  const logoutBtn = document.getElementById("auth-logout");
  const msg = document.getElementById("auth-msg");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const login = String(form.login?.value || "").trim();
    const password = String(form.password?.value || "");

    if (!login || !password) {
      if (msg) {
        msg.hidden = false;
        msg.textContent = "Informe login e senha.";
      }
      return;
    }

    // Protótipo: qualquer login/senha válidos criam sessão local
    aprovaSaveAuth({ login, at: Date.now() });
    form.reset();
    if (msg) {
      msg.hidden = false;
      msg.textContent = "Sessão iniciada.";
      setTimeout(() => { msg.hidden = true; }, 2000);
    }
    aprovaRenderAuth();
  });

  logoutBtn?.addEventListener("click", () => {
    aprovaSaveAuth(null);
    aprovaRenderAuth();
  });

  aprovaRenderAuth();
}

document.addEventListener("DOMContentLoaded", aprovaBootAuth);
