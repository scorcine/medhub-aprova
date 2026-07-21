/* Convites de acesso — admin libera por e-mail; aluno completa o cadastro */

const APROVA_USERS_KEY_ACCESS = "medhub-aprova-users-v1";
const APROVA_INVITES_KEY = "medhub-aprova-invites-v1";
const APROVA_ACCESS_NOTIFY_EMAIL = "scorcine@gmail.com";

function aprovaAccessLoadUsers () {
  try {
    return JSON.parse(localStorage.getItem(APROVA_USERS_KEY_ACCESS) || "{}");
  } catch {
    return {};
  }
}

function aprovaAccessSaveUsers (users) {
  localStorage.setItem(APROVA_USERS_KEY_ACCESS, JSON.stringify(users || {}));
}

function aprovaAccessLoadInvites () {
  try {
    const raw = JSON.parse(localStorage.getItem(APROVA_INVITES_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function aprovaAccessSaveInvites (map) {
  localStorage.setItem(APROVA_INVITES_KEY, JSON.stringify(map || {}));
}

function aprovaAccessPlanMeta (type) {
  const now = Date.now();
  const day = 86400000;
  if (type === "free") return { plan: "free", planUntil: null };
  if (type === "lifetime") return { plan: "lifetime", planUntil: null };
  if (type === "pro-mensal") return { plan: "pro-mensal", planUntil: now + 30 * day };
  if (type === "pro-anual") return { plan: "pro-anual", planUntil: now + 365 * day };
  if (type === "cortesia-1") return { plan: "cortesia", planUntil: now + 30 * day };
  if (type === "cortesia-3") return { plan: "cortesia", planUntil: now + 90 * day };
  if (type === "trial-10") return { plan: "cortesia", planUntil: now + 10 * day };
  return { plan: "free", planUntil: null };
}

function aprovaAccessEncodeInvite (payload) {
  const raw = JSON.stringify({
    v: 1,
    email: String(payload.email || "").trim().toLowerCase(),
    plan: payload.plan || "free",
    planUntil: payload.planUntil || null,
    grantedAt: payload.grantedAt || Date.now(),
    type: payload.type || payload.plan || "free"
  });
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function aprovaAccessDecodeInvite (token) {
  try {
    const b64 = String(token || "").replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const raw = decodeURIComponent(escape(atob(b64 + pad)));
    const data = JSON.parse(raw);
    if (!data || !data.email) return null;
    return {
      email: String(data.email).trim().toLowerCase(),
      plan: data.plan || "free",
      planUntil: data.planUntil || null,
      grantedAt: data.grantedAt || null,
      type: data.type || data.plan || "free"
    };
  } catch {
    return null;
  }
}

function aprovaAccessInviteUrl (payload, base) {
  const origin = base || (typeof location !== "undefined" ? location.origin : "");
  const token = aprovaAccessEncodeInvite(payload);
  return origin + "/cadastro.html?convite=" + encodeURIComponent(token);
}

function aprovaAccessGrantByEmail (email, type) {
  const key = String(email || "").trim().toLowerCase();
  if (!key || key.indexOf("@") < 0) {
    return { ok: false, msg: "Informe um e-mail válido." };
  }
  const meta = aprovaAccessPlanMeta(type);
  const now = Date.now();
  const users = aprovaAccessLoadUsers();
  const existing = users[key];
  const alreadyActive = existing && existing.password && existing.status !== "pending";

  if (alreadyActive) {
    existing.plan = meta.plan;
    existing.planUntil = meta.planUntil;
    existing.grantedAt = now;
    users[key] = existing;
  } else {
    users[key] = {
      login: String(email).trim(),
      password: existing?.password || "",
      name: existing?.name || "",
      phone: existing?.phone || "",
      plan: meta.plan,
      planUntil: meta.planUntil,
      status: existing?.password ? "active" : "pending",
      createdAt: existing?.createdAt || now,
      grantedAt: now
    };
  }
  aprovaAccessSaveUsers(users);

  const invites = aprovaAccessLoadInvites();
  invites[key] = {
    email: key,
    type: type || meta.plan,
    plan: meta.plan,
    planUntil: meta.planUntil,
    status: alreadyActive ? "active" : "pending",
    name: users[key].name || "",
    phone: users[key].phone || "",
    createdAt: invites[key]?.createdAt || now,
    grantedAt: now,
    claimedAt: alreadyActive ? (invites[key]?.claimedAt || now) : null,
    token: aprovaAccessEncodeInvite({
      email: key,
      plan: meta.plan,
      planUntil: meta.planUntil,
      grantedAt: now,
      type: type || meta.plan
    })
  };
  aprovaAccessSaveInvites(invites);

  const inviteUrl = aprovaAccessInviteUrl(invites[key]);
  return {
    ok: true,
    msg: alreadyActive
      ? "Plano atualizado para " + key + "."
      : "Acesso liberado. Envie o link de cadastro para " + key + ".",
    inviteUrl,
    invite: invites[key],
    user: users[key]
  };
}

function aprovaAccessGetInviteForEmail (email) {
  const key = String(email || "").trim().toLowerCase();
  const invites = aprovaAccessLoadInvites();
  if (invites[key]) return invites[key];
  const users = aprovaAccessLoadUsers();
  const u = users[key];
  if (u && (u.status === "pending" || (u.plan && u.plan !== "free" && !u.password))) {
    return {
      email: key,
      plan: u.plan,
      planUntil: u.planUntil,
      status: "pending",
      type: u.plan
    };
  }
  return null;
}

function aprovaAccessApplyGrantToUser (user, grant) {
  if (!user || !grant) return user;
  user.plan = grant.plan || user.plan || "free";
  user.planUntil = grant.planUntil != null ? grant.planUntil : user.planUntil;
  user.grantedAt = grant.grantedAt || user.grantedAt || Date.now();
  return user;
}

async function aprovaAccessNotifyAdminClaim (profile) {
  try {
    await fetch(
      "https://formsubmit.co/ajax/" + encodeURIComponent(APROVA_ACCESS_NOTIFY_EMAIL),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          _subject: "MedHub R1 — cadastro ativado (acesso liberado)",
          _template: "table",
          _captcha: "false",
          nome: profile.name || "",
          email: profile.email || "",
          celular: profile.phone || "",
          plano: profile.plan || "",
          validade: profile.planUntil
            ? new Date(profile.planUntil).toLocaleDateString("pt-BR")
            : "sem prazo",
          status: "ativo"
        })
      }
    );
  } catch {
    /* notificação é best-effort */
  }
}

/**
 * Completa conta pendente ou cria conta aplicando convite (URL ou lista local).
 * Retorna { ok, msg, claimed }.
 */
function aprovaAccessClaimOrRegister (login, password, extras) {
  const name = String(extras?.name || "").trim();
  const phone = String(extras?.phone || "").trim();
  const grantFromUrl = extras?.grant || null;
  const key = String(login || "").trim().toLowerCase();

  if (!key || !password) {
    return { ok: false, msg: "Informe e-mail e senha." };
  }
  if (password.length < 4) {
    return { ok: false, msg: "A senha precisa ter ao menos 4 caracteres." };
  }
  if (!name) {
    return { ok: false, msg: "Informe seu nome." };
  }

  const users = aprovaAccessLoadUsers();
  let user = users[key];
  const inviteLocal = aprovaAccessGetInviteForEmail(key);
  const grant = grantFromUrl && grantFromUrl.email === key
    ? grantFromUrl
    : (inviteLocal
      ? {
          email: key,
          plan: inviteLocal.plan,
          planUntil: inviteLocal.planUntil,
          grantedAt: inviteLocal.grantedAt
        }
      : null);

  if (user && user.password && user.status !== "pending") {
    return { ok: false, msg: "Este e-mail já está cadastrado. Use Entrar." };
  }

  const now = Date.now();
  const claimed = Boolean(user?.status === "pending" || grant);

  user = {
    login: String(login).trim(),
    password,
    name,
    phone: phone || user?.phone || "",
    plan: user?.plan || "free",
    planUntil: user?.planUntil || null,
    status: "active",
    createdAt: user?.createdAt || now,
    grantedAt: user?.grantedAt || null,
    claimedAt: now
  };
  if (grant) aprovaAccessApplyGrantToUser(user, grant);
  users[key] = user;
  aprovaAccessSaveUsers(users);

  const invites = aprovaAccessLoadInvites();
  if (invites[key] || grant) {
    invites[key] = {
      ...(invites[key] || {}),
      email: key,
      plan: user.plan,
      planUntil: user.planUntil,
      status: "claimed",
      name,
      phone: user.phone || "",
      grantedAt: user.grantedAt || now,
      claimedAt: now,
      createdAt: invites[key]?.createdAt || now
    };
    aprovaAccessSaveInvites(invites);
  }

  if (claimed) {
    void aprovaAccessNotifyAdminClaim({
      name,
      email: key,
      phone: user.phone || "",
      plan: user.plan,
      planUntil: user.planUntil
    });
  }

  return {
    ok: true,
    msg: claimed
      ? "Conta ativada com o acesso liberado. Bem-vindo!"
      : "Cadastro feito. Bem-vindo!",
    claimed,
    user
  };
}

function aprovaAccessListInvites () {
  const invites = aprovaAccessLoadInvites();
  return Object.keys(invites)
    .map((k) => invites[k])
    .sort((a, b) => (b.grantedAt || 0) - (a.grantedAt || 0));
}
