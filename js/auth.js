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
  if (typeof aprovaAccessClaimOrRegister === "function") {
    const result = aprovaAccessClaimOrRegister(login, password, extras || {});
    if (!result.ok) {
      aprovaShowAuthMsg(result.msg, false);
      return false;
    }
    const name = String(extras?.name || "").trim() || login;
    aprovaSaveAuth({ login: String(login).trim(), name, at: Date.now() });
    aprovaShowAuthMsg(result.msg, true);
    return true;
  }

  const name = String(extras?.name || "").trim();
  if (!login || !password) {
    aprovaShowAuthMsg("Informe e-mail e senha para cadastrar.", false);
    return false;
  }
  if (password.length < 4) {
    aprovaShowAuthMsg("A senha precisa ter ao menos 4 caracteres.", false);
    return false;
  }

  const users = aprovaLoadUsers();
  const key = login.toLowerCase();
  if (users[key] && users[key].password && users[key].status !== "pending") {
    aprovaShowAuthMsg("Este e-mail já está cadastrado. Use Entrar.", false);
    return false;
  }

  users[key] = {
    login,
    password,
    name: name || login,
    phone: String(extras?.phone || "").trim(),
    plan: users[key]?.plan || "free",
    planUntil: users[key]?.planUntil || null,
    status: "active",
    createdAt: users[key]?.createdAt || Date.now(),
    grantedAt: users[key]?.grantedAt || null
  };
  aprovaSaveUsers(users);
  aprovaSaveAuth({ login, name: users[key].name, at: Date.now() });
  aprovaShowAuthMsg("Cadastro feito. Bem-vindo!", true);
  return true;
}

function aprovaLogin (login, password) {
  if (!login || !password) {
    aprovaShowAuthMsg("Informe e-mail e senha.", false);
    return false;
  }

  const users = aprovaLoadUsers();
  const user = users[login.toLowerCase()];
  if (!user || (!user.password && user.status === "pending")) {
    aprovaShowAuthMsg(
      user?.status === "pending"
        ? "Seu acesso foi liberado — complete o cadastro em Cadastre-se."
        : "Conta não encontrada. Cadastre-se para criar uma.",
      false
    );
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

/** Lista/atualiza plano do usuário (admin / gates futuras). */
function aprovaGetUserPlan (login) {
  const users = aprovaLoadUsers();
  const user = users[String(login || "").toLowerCase()];
  if (!user) return { plan: "free", planUntil: null };
  const until = user.planUntil || null;
  if (until && Date.now() > until && user.plan !== "lifetime") {
    return { plan: "free", planUntil: until, expired: true };
  }
  return { plan: user.plan || "free", planUntil: until, expired: false };
}

function aprovaRevealAppShell () {
  const gate = document.getElementById("login-gate");
  const shell = document.getElementById("app-shell");
  const sideUser = document.getElementById("sidebar-user-label");
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  if (!shell) return false;
  if (gate) gate.hidden = true;
  shell.hidden = false;
  if (sideUser && session) {
    sideUser.textContent = session.name || session.login || "";
  }
  return true;
}

function aprovaEnterAppAfterLogin () {
  if (!document.getElementById("app-shell")) {
    window.location.href = "app.html";
    return;
  }

  // Sempre revela o shell após login bem-sucedido (não depende do app-qui.js).
  aprovaRevealAppShell();

  if (typeof aprovaSyncAppAuthUI === "function") {
    try { aprovaSyncAppAuthUI(); } catch (e) { /* shell já aberto */ }
  }

  if (typeof aprovaBootStudyModules === "function") {
    Promise.resolve()
      .then(() => aprovaBootStudyModules())
      .then(() => {
        if (typeof aprovaGoTo === "function") aprovaGoTo("inicio");
      })
      .catch(() => {
        // Sessão já salva — recarrega para montar o painel limpo.
        window.location.reload();
      });
    return;
  }

  // app-qui.js não carregou: recarrega com a sessão já gravada.
  window.setTimeout(() => { window.location.reload(); }, 80);
}

function aprovaBootSignupPage () {
  const form = document.getElementById("signup-form");
  if (!form) return false;

  const session = aprovaLoadAuth();
  if (session && session.login) {
    window.location.href = "app.html";
    return true;
  }

  let grantFromUrl = null;
  let couponFromUrl = "";
  const planLabels = {
    lifetime: "Vitalício",
    m1: "1 mês",
    m3: "3 meses",
    m6: "6 meses",
    m12: "12 meses",
    "pro-mensal": "1 mês",
    "pro-anual": "12 meses",
    cortesia: "Cortesia / teste",
    "trial-10": "10 dias"
  };

  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("convite") || "";
    if (token && typeof aprovaAccessDecodeInvite === "function") {
      grantFromUrl = aprovaAccessDecodeInvite(token);
    }
    couponFromUrl = String(params.get("cupom") || "").trim();
  } catch {
    grantFromUrl = null;
  }

  const couponInput = document.getElementById("signup-coupon");
  if (couponInput && couponFromUrl) {
    couponInput.value = couponFromUrl.toUpperCase();
  }

  if (grantFromUrl) {
    const note = document.getElementById("signup-plan-note");
    const emailInput = document.getElementById("signup-login");
    const phoneField = document.getElementById("signup-phone-field");
    if (emailInput) {
      emailInput.value = grantFromUrl.email;
      emailInput.readOnly = true;
    }
    if (phoneField) phoneField.hidden = false;
    if (note) {
      const planLabel = typeof adminPlanLabel === "function"
        ? adminPlanLabel(grantFromUrl.plan)
        : (planLabels[grantFromUrl.plan] || grantFromUrl.plan || "liberado");
      note.hidden = false;
      note.textContent = "Acesso liberado: " + planLabel +
        ". Preencha nome, celular e senha para ativar sua conta.";
    }
  } else if (couponFromUrl && typeof aprovaCouponValidate === "function") {
    const checked = aprovaCouponValidate(couponFromUrl);
    const note = document.getElementById("signup-plan-note");
    const phoneField = document.getElementById("signup-phone-field");
    if (phoneField) phoneField.hidden = false;
    if (note) {
      note.hidden = false;
      if (checked.ok) {
        const planLabel = planLabels[checked.type] || checked.type;
        note.textContent = "Cupom de embaixador válido — acesso " + planLabel +
          ". Complete o cadastro para liberar o app completo.";
      } else {
        note.textContent = checked.msg || "Cupom inválido. Você pode corrigir o código abaixo.";
      }
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(form.name?.value || "").trim();
    const login = String(form.login?.value || "").trim();
    const password = String(form.password?.value || "");
    const password2 = String(form.password2?.value || "");
    const phone = String(form.phone?.value || "").trim();
    const coupon = String(form.coupon?.value || couponInput?.value || "").trim();

    if (!name) {
      aprovaShowAuthMsg("Informe seu nome.", false);
      return;
    }
    if (password !== password2) {
      aprovaShowAuthMsg("As senhas não coincidem.", false);
      return;
    }
    if (grantFromUrl && grantFromUrl.email !== login.toLowerCase()) {
      aprovaShowAuthMsg("Use o e-mail para o qual o acesso foi liberado.", false);
      return;
    }
    if (!aprovaRegister(login, password, { name, phone, grant: grantFromUrl, coupon })) return;

    window.setTimeout(() => {
      window.location.href = "app.html";
    }, 600);
  });

  return true;
}

function aprovaBootGateLogin () {
  const form = document.getElementById("gate-login-form");
  if (!form) return false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const { login, password } = aprovaReadCredentials(form);
    if (!aprovaLogin(login, password)) return;
    form.reset();
    aprovaEnterAppAfterLogin();
  });

  return true;
}

function aprovaBootAuth () {
  if (aprovaBootSignupPage()) return;

  const hasGate = aprovaBootGateLogin();
  const form = document.getElementById("auth-form");
  const logoutBtn = document.getElementById("auth-logout");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const { login, password } = aprovaReadCredentials(form);
    if (!aprovaLogin(login, password)) return;
    form.reset();
    aprovaRenderAuth();
    aprovaEnterAppAfterLogin();
  });

  logoutBtn?.addEventListener("click", () => {
    aprovaSaveAuth(null);
    aprovaShowAuthMsg("");
    aprovaRenderAuth();
    if (hasGate && typeof aprovaSyncAppAuthUI === "function") {
      aprovaSyncAppAuthUI();
    }
  });

  aprovaRenderAuth();
}

document.addEventListener("DOMContentLoaded", aprovaBootAuth);
