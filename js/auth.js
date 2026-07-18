/* Login / cadastro local (protótipo) — localStorage */

const APROVA_AUTH_KEY = "medhub-aprova-auth-v1";
const APROVA_USERS_KEY = "medhub-aprova-users-v1";

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

function aprovaLoadUsers () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function aprovaSaveUsers (users) {
  localStorage.setItem(APROVA_USERS_KEY, JSON.stringify(users));
}

function aprovaShowAuthMsg (text, ok) {
  const msg = document.getElementById("auth-msg");
  if (!msg) return;
  msg.hidden = !text;
  msg.textContent = text || "";
  msg.classList.toggle("auth-msg--ok", Boolean(ok));
  msg.classList.toggle("auth-msg--err", Boolean(text) && !ok);
  if (text && ok) {
    clearTimeout(aprovaShowAuthMsg._t);
    aprovaShowAuthMsg._t = setTimeout(() => {
      msg.hidden = true;
    }, 2200);
  }
}

function aprovaReadCredentials (form) {
  return {
    login: String(form.login?.value || "").trim(),
    password: String(form.password?.value || "")
  };
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
    if (label) label.textContent = session.name || session.login;
  } else {
    form.hidden = false;
    sessionEl.hidden = true;
  }
}

function aprovaRegister (login, password, extras) {
  const name = String(extras?.name || "").trim();
  if (!login || !password) {
    aprovaShowAuthMsg("Informe login e senha para cadastrar.", false);
    return false;
  }
  if (password.length < 4) {
    aprovaShowAuthMsg("A senha precisa ter ao menos 4 caracteres.", false);
    return false;
  }

  const users = aprovaLoadUsers();
  const key = login.toLowerCase();
  if (users[key]) {
    aprovaShowAuthMsg("Este login já está cadastrado. Use Entrar.", false);
    return false;
  }

  users[key] = {
    login,
    password,
    name: name || login,
    createdAt: Date.now()
  };
  aprovaSaveUsers(users);
  aprovaSaveAuth({ login, name: users[key].name, at: Date.now() });
  aprovaShowAuthMsg("Cadastro feito. Bem-vindo!", true);
  return true;
}

function aprovaLogin (login, password) {
  if (!login || !password) {
    aprovaShowAuthMsg("Informe login e senha.", false);
    return false;
  }

  const users = aprovaLoadUsers();
  const user = users[login.toLowerCase()];
  if (!user) {
    aprovaShowAuthMsg("Conta não encontrada. Cadastre-se para criar uma.", false);
    return false;
  }
  if (user.password !== password) {
    aprovaShowAuthMsg("Senha incorreta.", false);
    return false;
  }

  aprovaSaveAuth({ login: user.login, name: user.name || user.login, at: Date.now() });
  aprovaShowAuthMsg("Sessão iniciada.", true);
  return true;
}

function aprovaBootSignupPage () {
  const form = document.getElementById("signup-form");
  if (!form) return false;

  const session = aprovaLoadAuth();
  if (session && session.login) {
    window.location.href = "app.html";
    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(form.name?.value || "").trim();
    const login = String(form.login?.value || "").trim();
    const password = String(form.password?.value || "");
    const password2 = String(form.password2?.value || "");

    if (!name) {
      aprovaShowAuthMsg("Informe seu nome.", false);
      return;
    }
    if (password !== password2) {
      aprovaShowAuthMsg("As senhas não coincidem.", false);
      return;
    }
    if (!aprovaRegister(login, password, { name })) return;

    window.setTimeout(() => {
      window.location.href = "app.html";
    }, 600);
  });

  return true;
}

function aprovaBootAuth () {
  if (aprovaBootSignupPage()) return;

  const form = document.getElementById("auth-form");
  const logoutBtn = document.getElementById("auth-logout");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const { login, password } = aprovaReadCredentials(form);
    if (!aprovaLogin(login, password)) return;
    form.reset();
    aprovaRenderAuth();
  });

  logoutBtn?.addEventListener("click", () => {
    aprovaSaveAuth(null);
    aprovaShowAuthMsg("");
    aprovaRenderAuth();
  });

  aprovaRenderAuth();
}

document.addEventListener("DOMContentLoaded", aprovaBootAuth);
