/* Login / cadastro — nuvem (celular + PC) com cache local */

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
  const msg = document.getElementById("auth-msg") || document.getElementById("trial-msg");
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

function aprovaFinishSession (login, name, msg, ok) {
  aprovaSaveAuth({ login: String(login).trim(), name: name || login, at: Date.now() });
  aprovaShowAuthMsg(msg || "", Boolean(ok));
  return Boolean(ok);
}

async function aprovaPushLocalUserToCloud (login, password, migrate) {
  if (typeof aprovaCloudRegister !== "function") {
    return { ok: false, unavailable: true };
  }
  const users = aprovaLoadUsers();
  const u = users[String(login).toLowerCase()];
  if (!u) return { ok: false, msg: "Usuário local ausente." };
  return aprovaCloudRegister({
    email: u.login || login,
    password,
    name: u.name || login,
    phone: u.phone || "",
    plan: u.plan || "free",
    planUntil: u.planUntil || null,
    grantedAt: u.grantedAt || null,
    coupon: u.coupon || null,
    embassador: u.embassador || "",
    migrate: Boolean(migrate),
    // Na migração a partir do login local, a senha digitada vira a da nuvem
    replacePassword: Boolean(migrate)
  });
}

async function aprovaRegister (login, password, extras) {
  aprovaShowAuthMsg("Criando conta…", true);

  let result = null;
  if (typeof aprovaAccessClaimOrRegister === "function") {
    result = aprovaAccessClaimOrRegister(login, password, extras || {});
    if (!result.ok) {
      aprovaShowAuthMsg(result.msg, false);
      return false;
    }
  } else {
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
    result = { ok: true, msg: "Cadastro feito. Bem-vindo!", user: users[key] };
  }

  const name = String(extras?.name || result?.user?.name || "").trim() || login;
  const cloud = await aprovaPushLocalUserToCloud(login, password, Boolean(result?.upgraded));

  if (cloud.unavailable) {
    if (typeof aprovaCloudIsLocalDev === "function" && aprovaCloudIsLocalDev()) {
      return aprovaFinishSession(login, name, result.msg + " (só neste computador — em produção a conta sincroniza).", true);
    }
    aprovaShowAuthMsg(
      cloud.msg ||
        "Não foi possível sincronizar sua conta na nuvem. Verifique a internet e tente de novo.",
      false
    );
    return false;
  }

  if (!cloud.ok && cloud.code === "EXISTS") {
    // Já existe na nuvem: tenta entrar com a mesma senha
    const loginCloud = typeof aprovaCloudLogin === "function"
      ? await aprovaCloudLogin(login, password)
      : { ok: false };
    if (loginCloud.ok) {
      return aprovaFinishSession(
        login,
        loginCloud.user?.name || name,
        "Conta já existia — sessão iniciada em todos os aparelhos.",
        true
      );
    }
    aprovaShowAuthMsg(cloud.msg || "Este e-mail já está cadastrado. Use Entrar.", false);
    return false;
  }

  if (!cloud.ok) {
    aprovaShowAuthMsg(cloud.msg || "Não foi possível criar a conta na nuvem.", false);
    return false;
  }

  return aprovaFinishSession(login, cloud.user?.name || name, result.msg || "Cadastro feito. Bem-vindo!", true);
}

async function aprovaLoginApplyExtras (login, extras) {
  let grantMsg = "";
  const grant = extras?.grant || null;
  if (grant && typeof aprovaAccessApplyInviteOnLogin === "function") {
    const applied = aprovaAccessApplyInviteOnLogin(login, grant);
    if (applied && !applied.ok) {
      return { ok: false, msg: applied.msg || "Não foi possível aplicar o convite." };
    }
    if (applied && applied.ok) {
      grantMsg = " " + (applied.msg || "Plano liberado.");
      const fresh = aprovaLoadUsers()[String(login).toLowerCase()];
      if (fresh && typeof aprovaCloudSyncProfile === "function") {
        void aprovaCloudSyncProfile(login, {
          plan: fresh.plan,
          planUntil: fresh.planUntil,
          grantedAt: fresh.grantedAt,
          coupon: fresh.coupon,
          embassador: fresh.embassador,
          name: fresh.name,
          phone: fresh.phone
        });
      }
    }
  }
  const coupon = String(extras?.coupon || "").trim();
  if (coupon && typeof aprovaAccessApplyCoupon === "function") {
    const applied = aprovaAccessApplyCoupon(login, coupon);
    if (!applied.ok) {
      return { ok: false, msg: applied.msg || "Não foi possível aplicar o cupom." };
    }
    grantMsg = " " + (applied.msg || "Cupom aplicado.");
    const fresh = aprovaLoadUsers()[String(login).toLowerCase()];
    if (fresh && typeof aprovaCloudSyncProfile === "function") {
      void aprovaCloudSyncProfile(login, {
        plan: fresh.plan,
        planUntil: fresh.planUntil,
        grantedAt: fresh.grantedAt,
        coupon: fresh.coupon,
        embassador: fresh.embassador
      });
    }
  }
  return { ok: true, grantMsg };
}

async function aprovaLogin (login, password, extras) {
  if (!login || !password) {
    aprovaShowAuthMsg("Informe e-mail e senha.", false);
    return false;
  }

  aprovaShowAuthMsg("Entrando…", true);

  let cloud = null;
  // 1) Nuvem primeiro (funciona em qualquer aparelho)
  if (typeof aprovaCloudLogin === "function") {
    cloud = await aprovaCloudLogin(login, password);
    if (cloud.ok && cloud.user) {
      const applied = await aprovaLoginApplyExtras(login, extras);
      if (!applied.ok) {
        aprovaShowAuthMsg(applied.msg, false);
        return false;
      }
      const access = aprovaCheckAccess(login);
      if (!access.ok) {
        aprovaSaveAuth(null);
        aprovaShowAuthMsg(access.msg || "Seu acesso expirou.", false);
        return false;
      }
      const fresh = aprovaLoadUsers()[login.toLowerCase()] || cloud.user;
      return aprovaFinishSession(
        fresh.login || login,
        fresh.name || cloud.user.name || login,
        "Sessão iniciada." + (applied.grantMsg || ""),
        true
      );
    }
  }

  // 2) Conta local antiga neste aparelho → entra e sincroniza na nuvem
  const users = aprovaLoadUsers();
  const user = users[login.toLowerCase()];
  const hasLocal = Boolean(user && user.password && user.status !== "pending");

  if (cloud && !cloud.unavailable && cloud.code === "BAD_PASSWORD" && !hasLocal) {
    aprovaShowAuthMsg("Senha incorreta.", false);
    return false;
  }

  if (!hasLocal) {
    if (user?.status === "pending") {
      aprovaShowAuthMsg("Seu acesso foi liberado — complete o cadastro em Cadastre-se.", false);
      return false;
    }
    if (cloud && cloud.code === "BAD_PASSWORD") {
      aprovaShowAuthMsg("Senha incorreta.", false);
      return false;
    }
    if (cloud && cloud.http >= 500) {
      aprovaShowAuthMsg(cloud.msg || "Servidor indisponível. Tente de novo em instantes.", false);
      return false;
    }
    if (cloud && cloud.code === "NETWORK") {
      aprovaShowAuthMsg(cloud.msg || "Sem conexão. Verifique a internet e tente de novo.", false);
      return false;
    }
    // 3) Conta ainda não existe na nuvem → cria sozinha (sem admin)
    if (password.length < 4) {
      aprovaShowAuthMsg("A senha precisa ter ao menos 4 caracteres.", false);
      return false;
    }
    const nameGuess = String(extras?.name || "")
      .trim() ||
      String(login).split("@")[0].replace(/[._-]+/g, " ").trim() ||
      login;
    aprovaShowAuthMsg("Primeira vez — criando sua conta…", true);
    const created = await aprovaRegister(login, password, {
      name: nameGuess,
      phone: String(extras?.phone || "").trim(),
      grant: extras?.grant || null,
      coupon: extras?.coupon || ""
    });
    return created;
  }

  if (user.password !== password) {
    aprovaShowAuthMsg("Senha incorreta.", false);
    return false;
  }

  const applied = await aprovaLoginApplyExtras(login, extras);
  if (!applied.ok) {
    aprovaShowAuthMsg(applied.msg, false);
    return false;
  }
  let grantMsg = applied.grantMsg || "";

  const access = aprovaCheckAccess(user.login);
  if (!access.ok) {
    aprovaSaveAuth(null);
    aprovaShowAuthMsg(access.msg || "Seu acesso expirou.", false);
    return false;
  }

  const migrate = await aprovaPushLocalUserToCloud(login, password, true);
  if (migrate.ok) {
    grantMsg += " Conta pronta no celular e no computador.";
  } else if (!migrate.unavailable && migrate.msg) {
    grantMsg += " (" + migrate.msg + ")";
  }

  const fresh = aprovaLoadUsers()[login.toLowerCase()] || user;
  return aprovaFinishSession(fresh.login, fresh.name || fresh.login, "Sessão iniciada." + grantMsg, true);
}

/** Lista/atualiza plano do usuário (admin / gates futuras). */
function aprovaGetUserPlan (login) {
  const users = aprovaLoadUsers();
  const user = users[String(login || "").toLowerCase()];
  if (!user) return { plan: "free", planUntil: null, expired: false };
  const until = user.planUntil || null;
  const plan = user.plan || "free";
  if (plan === "lifetime") {
    return { plan: "lifetime", planUntil: null, expired: false };
  }
  if (until && Date.now() > until) {
    return { plan, planUntil: until, expired: true };
  }
  return { plan, planUntil: until, expired: false };
}

/** Dias restantes do plano com validade (ceil). null = sem prazo. */
function aprovaPlanDaysLeft (login) {
  const plan = aprovaGetUserPlan(login);
  if (!plan || plan.planUntil == null) return null;
  if (plan.expired) return 0;
  const ms = Number(plan.planUntil) - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / 86400000));
}

/**
 * Acesso liberado?
 * - lifetime / planos pagos ativos: ok
 * - trial com planUntil futuro: ok
 * - free sem prazo: ok (cadastro simples)
 * - expirado: bloqueia
 */
function aprovaCheckAccess (login) {
  const key = String(login || "").trim().toLowerCase();
  if (!key) {
    return { ok: false, msg: "Faça login para continuar." };
  }
  const plan = aprovaGetUserPlan(key);
  if (plan.expired) {
    const wasTrial = plan.plan === "trial" || plan.plan === "trial-10";
    return {
      ok: false,
      expired: true,
      plan: plan.plan,
      msg: wasTrial
        ? "Seu teste grátis de 10 dias acabou. Assine o Pro em medhubr1.com.br (#planos) ou fale em medhubr1@gmail.com."
        : "Seu acesso expirou. Renove o Pro em medhubr1.com.br (#planos) ou fale em medhubr1@gmail.com."
    };
  }
  return {
    ok: true,
    plan: plan.plan,
    planUntil: plan.planUntil,
    daysLeft: aprovaPlanDaysLeft(key)
  };
}

/** Se a sessão existir mas o plano expirou, desloga e devolve false. */
function aprovaEnforceActiveAccess () {
  const session = aprovaLoadAuth();
  if (!session || !session.login) return false;
  const access = aprovaCheckAccess(session.login);
  if (access.ok) return true;
  aprovaSaveAuth(null);
  try {
    sessionStorage.setItem("medhub-aprova-access-msg", access.msg || "Acesso encerrado.");
  } catch (e) { /* ignore */ }
  return false;
}

function aprovaConsumeAccessMsg () {
  try {
    const msg = sessionStorage.getItem("medhub-aprova-access-msg") || "";
    if (msg) sessionStorage.removeItem("medhub-aprova-access-msg");
    return msg;
  } catch (e) {
    return "";
  }
}

const APROVA_TRIAL_WARN_KEY = "medhub-aprova-trial-warn-v1";

function aprovaTrialWarnLoad () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_TRIAL_WARN_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function aprovaTrialWarnSave (map) {
  localStorage.setItem(APROVA_TRIAL_WARN_KEY, JSON.stringify(map || {}));
}

/** Aviso único aos 5 dias e ao 1 dia restantes (plano trial). */
function aprovaMaybeShowTrialWarning () {
  const session = aprovaLoadAuth();
  if (!session || !session.login) return;
  const plan = aprovaGetUserPlan(session.login);
  if (plan.plan !== "trial" && plan.plan !== "trial-10") return;
  const daysLeft = aprovaPlanDaysLeft(session.login);
  if (daysLeft == null || daysLeft <= 0) return;

  const key = String(session.login).toLowerCase();
  const map = aprovaTrialWarnLoad();
  const row = map[key] && typeof map[key] === "object" ? map[key] : {};
  let milestone = null;
  if (daysLeft <= 1 && !row.d1) milestone = "d1";
  else if (daysLeft <= 5 && !row.d5) milestone = "d5";
  if (!milestone) return;

  row[milestone] = Date.now();
  map[key] = row;
  aprovaTrialWarnSave(map);

  const text = daysLeft <= 1
    ? "Falta 1 dia para o fim do seu teste grátis. Depois disso o acesso será encerrado."
    : ("Faltam " + daysLeft + " dias para o fim do seu teste grátis.");

  let banner = document.getElementById("trial-access-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "trial-access-banner";
    banner.className = "aprova-banner aprova-banner--trial";
    banner.setAttribute("role", "status");
    const main = document.querySelector(".app-main--shell") || document.getElementById("app-shell");
    if (main) main.insertBefore(banner, main.firstChild);
    else return;
  }
  banner.hidden = false;
  banner.innerHTML =
    "<strong>Teste grátis</strong>" +
    "<p>" + text + "</p>" +
    "<div class=\"actions-row\">" +
    "<button type=\"button\" class=\"btn btn-primary btn-compact\" id=\"trial-access-banner-subscribe\">Assinar Pro</button>" +
    "<button type=\"button\" class=\"btn btn-ghost btn-compact\" id=\"trial-access-banner-dismiss\">Entendi</button>" +
    "</div>";
  const dismiss = document.getElementById("trial-access-banner-dismiss");
  if (dismiss) {
    dismiss.addEventListener("click", () => {
      banner.hidden = true;
    });
  }
  const sub = document.getElementById("trial-access-banner-subscribe");
  if (sub) {
    sub.addEventListener("click", () => {
      if (typeof aprovaBillingStartCheckout === "function") {
        void aprovaBillingStartCheckout("pro-anual");
      } else {
        window.location.href = "index.html#planos";
      }
    });
  }
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

/** Após login: sessão já está no localStorage — recarrega o app para montar o painel. */
function aprovaEnterAppAfterLogin () {
  aprovaRevealAppShell();
  const path = (window.location.pathname && window.location.pathname !== "/")
    ? window.location.pathname
    : "app.html";
  const target = path + "?ok=" + Date.now();
  try {
    window.location.replace(target);
  } catch (e) {
    window.location.href = target;
  }
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
    trial: "Teste grátis 10 dias",
    "trial-10": "Teste grátis 10 dias"
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
        ". Se já tem conta, use a mesma senha e toque em cadastrar — o plano será aplicado. Se for a primeira vez, preencha nome, celular e senha.";
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
          ". Complete o cadastro (ou use o mesmo e-mail/senha se já tiver conta Free) para liberar o app.";
      } else {
        note.textContent = checked.msg || "Cupom inválido. Você pode corrigir o código abaixo.";
      }
    }
  }

  let planoFromUrl = "";
  try {
    planoFromUrl = String(new URLSearchParams(window.location.search).get("plano") || "").trim();
  } catch {
    planoFromUrl = "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = String(form.name?.value || "").trim();
    const login = String(form.login?.value || "").trim();
    const password = String(form.password?.value || "");
    const password2 = String(form.password2?.value || "");
    const phone = String(form.phone?.value || "").trim();
    const coupon = String(form.coupon?.value || couponInput?.value || "").trim();
    const submitBtn = form.querySelector("[type=\"submit\"]");
    if (submitBtn) submitBtn.disabled = true;

    try {
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
      const ok = await aprovaRegister(login, password, { name, phone, grant: grantFromUrl, coupon });
      if (!ok) return;

      const paidPlan =
        typeof aprovaBillingNormalizePlan === "function"
          ? aprovaBillingNormalizePlan(planoFromUrl)
          : "";
      if (paidPlan && typeof aprovaBillingAfterSignup === "function") {
        await aprovaBillingAfterSignup(paidPlan);
        return;
      }

      window.setTimeout(() => {
        window.location.href = "app.html";
      }, 600);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  return true;
}

function aprovaReadGrantFromUrl () {
  try {
    const token = new URLSearchParams(window.location.search).get("convite") || "";
    if (token && typeof aprovaAccessDecodeInvite === "function") {
      return aprovaAccessDecodeInvite(token);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function aprovaReadCouponFromUrl () {
  try {
    return String(new URLSearchParams(window.location.search).get("cupom") || "").trim();
  } catch {
    return "";
  }
}

function aprovaBootGateLogin () {
  const form = document.getElementById("gate-login-form");
  if (!form) return false;

  const couponFromUrl = aprovaReadCouponFromUrl();
  const couponInput = form.querySelector("[name=\"coupon\"]");
  if (couponInput && couponFromUrl) {
    couponInput.value = couponFromUrl.toUpperCase();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { login, password } = aprovaReadCredentials(form);
    const coupon = String(form.coupon?.value || couponFromUrl || "").trim();
    const submitBtn = form.querySelector("[type=\"submit\"]");
    if (submitBtn) submitBtn.disabled = true;
    try {
      const ok = await aprovaLogin(login, password, {
        grant: aprovaReadGrantFromUrl(),
        coupon
      });
      if (!ok) return;
      form.reset();
      aprovaEnterAppAfterLogin();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  return true;
}

function aprovaBootAuth () {
  if (aprovaBootSignupPage()) return;

  const hasGate = aprovaBootGateLogin();
  const form = document.getElementById("auth-form");
  const logoutBtn = document.getElementById("auth-logout");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { login, password } = aprovaReadCredentials(form);
    const coupon = String(form.coupon?.value || aprovaReadCouponFromUrl() || "").trim();
    const submitBtn = form.querySelector("[type=\"submit\"]");
    if (submitBtn) submitBtn.disabled = true;
    try {
      const ok = await aprovaLogin(login, password, {
        grant: aprovaReadGrantFromUrl(),
        coupon
      });
      if (!ok) return;
      form.reset();
      aprovaRenderAuth();
      aprovaEnterAppAfterLogin();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  logoutBtn?.addEventListener("click", () => {
    aprovaSaveAuth(null);
    if (typeof aprovaCloudSaveToken === "function") aprovaCloudSaveToken("");
    aprovaShowAuthMsg("");
    aprovaRenderAuth();
    if (hasGate && typeof aprovaSyncAppAuthUI === "function") {
      aprovaSyncAppAuthUI();
    }
  });

  document.getElementById("perfil-coupon-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const msg = document.getElementById("perfil-coupon-msg");
    const session = aprovaLoadAuth();
    const code = String(document.getElementById("perfil-coupon-input")?.value || "").trim();
    if (!session?.login) {
      if (msg) {
        msg.hidden = false;
        msg.textContent = "Faça login para aplicar o cupom.";
      }
      return;
    }
    if (typeof aprovaAccessApplyCoupon !== "function") {
      if (msg) {
        msg.hidden = false;
        msg.textContent = "Módulo de cupons indisponível.";
      }
      return;
    }
    const result = aprovaAccessApplyCoupon(session.login, code);
    if (msg) {
      msg.hidden = false;
      msg.textContent = result.msg || (result.ok ? "Cupom aplicado." : "Não foi possível aplicar.");
    }
    if (result.ok) {
      const input = document.getElementById("perfil-coupon-input");
      if (input) input.value = "";
    }
  });

  aprovaRenderAuth();
}

document.addEventListener("DOMContentLoaded", aprovaBootAuth);
