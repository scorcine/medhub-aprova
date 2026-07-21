/* Convites de acesso — admin libera por e-mail; aluno completa o cadastro */

const APROVA_USERS_KEY_ACCESS = "medhub-aprova-users-v1";
const APROVA_INVITES_KEY = "medhub-aprova-invites-v1";
const APROVA_COUPONS_KEY = "medhub-aprova-coupons-v1";
const APROVA_COUPON_SALT = "medhub-r1-emb-2026";
const APROVA_ACCESS_NOTIFY_EMAIL = "medhubr1@gmail.com";

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
  const month = 30 * day;
  if (type === "free") return { plan: "free", planUntil: null };
  if (type === "lifetime") return { plan: "lifetime", planUntil: null };
  if (type === "m1" || type === "cortesia-1" || type === "pro-mensal") {
    return { plan: "m1", planUntil: now + 1 * month };
  }
  if (type === "m3" || type === "cortesia-3") {
    return { plan: "m3", planUntil: now + 3 * month };
  }
  if (type === "m6") return { plan: "m6", planUntil: now + 6 * month };
  if (type === "m12" || type === "pro-anual") {
    return { plan: "m12", planUntil: now + 12 * month };
  }
  if (type === "trial-10" || type === "trial") {
    return { plan: "trial", planUntil: now + 10 * day };
  }
  if (type === "cortesia") return { plan: "m1", planUntil: now + 1 * month };
  return { plan: "m3", planUntil: now + 3 * month };
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
          cupom: profile.coupon || "",
          embaixador: profile.embassador || "",
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
  const couponRaw = String(extras?.coupon || "").trim();
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

  let couponGrant = null;
  if (couponRaw) {
    const checked = aprovaCouponValidate(couponRaw);
    if (!checked.ok) {
      return { ok: false, msg: checked.msg || "Cupom inválido." };
    }
    const meta = aprovaAccessPlanMeta(checked.type);
    couponGrant = {
      plan: meta.plan,
      planUntil: meta.planUntil,
      grantedAt: Date.now(),
      coupon: checked.code,
      embassador: checked.embassador || ""
    };
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
  const unlocked = Boolean(user?.status === "pending" || grant || couponGrant);

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
    claimedAt: now,
    coupon: user?.coupon || null,
    embassador: user?.embassador || ""
  };
  if (grant) aprovaAccessApplyGrantToUser(user, grant);
  if (couponGrant) {
    aprovaAccessApplyGrantToUser(user, couponGrant);
    user.coupon = couponGrant.coupon;
    user.embassador = couponGrant.embassador || "";
    aprovaCouponMarkUsed(couponGrant.coupon, key);
  }
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

  if (unlocked) {
    void aprovaAccessNotifyAdminClaim({
      name,
      email: key,
      phone: user.phone || "",
      plan: user.plan,
      planUntil: user.planUntil,
      coupon: user.coupon || "",
      embassador: user.embassador || ""
    });
  }

  return {
    ok: true,
    msg: couponGrant
      ? "Conta criada com acesso completo via cupom. Bem-vindo!"
      : (unlocked
        ? "Conta ativada com o acesso liberado. Bem-vindo!"
        : "Cadastro feito. Bem-vindo!"),
    claimed: unlocked,
    user
  };
}

function aprovaAccessListInvites () {
  const invites = aprovaAccessLoadInvites();
  return Object.keys(invites)
    .map((k) => invites[k])
    .sort((a, b) => (b.grantedAt || 0) - (a.grantedAt || 0));
}

/* ——— Cupons de embaixador (código autovalidável; funciona em qualquer aparelho) ——— */

function aprovaCouponLoadCatalog () {
  try {
    const raw = JSON.parse(localStorage.getItem(APROVA_COUPONS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function aprovaCouponSaveCatalog (list) {
  localStorage.setItem(APROVA_COUPONS_KEY, JSON.stringify((list || []).slice(0, 500)));
}

function aprovaCouponHash (str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).toUpperCase();
}

function aprovaCouponRandomId (len) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < (len || 4); i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function aprovaCouponTypeTag (type) {
  const map = {
    lifetime: "LIFE",
    m1: "M1",
    m3: "M3",
    m6: "M6",
    m12: "M12",
    "trial-10": "T10"
  };
  return map[type] || "M3";
}

function aprovaCouponTypeFromTag (tag) {
  const map = {
    LIFE: "lifetime",
    M1: "m1",
    M3: "m3",
    M6: "m6",
    M12: "m12",
    T10: "trial-10"
  };
  return map[String(tag || "").toUpperCase()] || null;
}

function aprovaCouponNormalize (code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}

function aprovaCouponMakeCode (type) {
  const tag = aprovaCouponTypeTag(type);
  const id = aprovaCouponRandomId(4);
  const body = tag + "-" + id;
  const chk = aprovaCouponHash(body + "|" + APROVA_COUPON_SALT).slice(0, 2);
  return body + "-" + chk;
}

function aprovaCouponValidate (code) {
  const raw = aprovaCouponNormalize(code);
  const parts = raw.split("-");
  if (parts.length !== 3) return { ok: false, msg: "Cupom inválido." };
  const [tag, id, chk] = parts;
  const type = aprovaCouponTypeFromTag(tag);
  if (!type || !id || id.length < 3 || !chk) {
    return { ok: false, msg: "Cupom inválido." };
  }
  const body = tag + "-" + id;
  const expect = aprovaCouponHash(body + "|" + APROVA_COUPON_SALT).slice(0, 2);
  if (expect !== chk) {
    return { ok: false, msg: "Cupom inválido ou adulterado." };
  }
  const catalog = aprovaCouponLoadCatalog();
  const row = catalog.find((c) => aprovaCouponNormalize(c.code) === raw);
  if (row && row.disabled) {
    return { ok: false, msg: "Este cupom foi desativado." };
  }
  if (row && row.maxUses > 0 && (row.uses | 0) >= (row.maxUses | 0)) {
    return { ok: false, msg: "Este cupom já atingiu o limite de usos." };
  }
  return {
    ok: true,
    code: raw,
    type,
    embassador: row?.embassador || "",
    maxUses: row?.maxUses || 0,
    uses: row?.uses || 0
  };
}

function aprovaCouponGenerate (opts) {
  const type = opts?.type || "m12";
  const embassador = String(opts?.embassador || "").trim();
  const maxUses = Math.max(0, Number(opts?.maxUses) || 0);
  const qty = Math.min(50, Math.max(1, Number(opts?.qty) || 1));
  const list = aprovaCouponLoadCatalog();
  const created = [];
  const now = Date.now();
  for (let i = 0; i < qty; i++) {
    const code = aprovaCouponMakeCode(type);
    const row = {
      code,
      type,
      embassador,
      maxUses,
      uses: 0,
      disabled: false,
      createdAt: now,
      redemptions: []
    };
    list.unshift(row);
    created.push(row);
  }
  aprovaCouponSaveCatalog(list);
  return { ok: true, created, msg: created.length + " cupom(ns) gerado(s)." };
}

function aprovaCouponMarkUsed (code, email) {
  const raw = aprovaCouponNormalize(code);
  const list = aprovaCouponLoadCatalog();
  const idx = list.findIndex((c) => aprovaCouponNormalize(c.code) === raw);
  if (idx < 0) return;
  list[idx].uses = (list[idx].uses | 0) + 1;
  list[idx].redemptions = (list[idx].redemptions || []).slice(0, 40);
  list[idx].redemptions.unshift({
    email: String(email || "").toLowerCase(),
    at: Date.now()
  });
  aprovaCouponSaveCatalog(list);
}

function aprovaCouponDisable (code) {
  const raw = aprovaCouponNormalize(code);
  const list = aprovaCouponLoadCatalog();
  const row = list.find((c) => aprovaCouponNormalize(c.code) === raw);
  if (!row) return { ok: false, msg: "Cupom não encontrado neste aparelho." };
  row.disabled = true;
  aprovaCouponSaveCatalog(list);
  return { ok: true, msg: "Cupom desativado." };
}

function aprovaCouponSignupUrl (code, base) {
  const origin = base || (typeof location !== "undefined" ? location.origin : "");
  return origin + "/cadastro.html?cupom=" + encodeURIComponent(aprovaCouponNormalize(code));
}
