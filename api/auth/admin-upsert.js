/**
 * Cria ou redefine conta na nuvem (uso pelo painel admin).
 * Autorização: body.adminKey === AUTH_SECRET
 *   ou login do dono (ADMIN_OWNERS) já existente na nuvem.
 */
const {
  cors,
  json,
  cloudConfigured,
  normalizeEmail,
  hashPassword,
  newSalt,
  publicUser,
  getUser,
  setUser,
  issueToken,
  readBody
} = require("../../lib/aprova-server");

function ownerList () {
  const raw = process.env.ADMIN_OWNERS || "medhubr1@gmail.com";
  return String(raw)
    .split(/[,;\n]+/)
    .map((s) => normalizeEmail(s))
    .filter(Boolean);
}

async function authorizeAdmin (body) {
  const key = String(body.adminKey || body.secret || "").trim();
  const secret = String(process.env.AUTH_SECRET || "").trim();
  if (secret && key && key === secret) return { ok: true, via: "key" };

  const ownerEmail = normalizeEmail(body.ownerEmail || body.adminEmail);
  const ownerPassword = String(body.ownerPassword || body.adminPassword || "");
  if (!ownerEmail || !ownerPassword) {
    return { ok: false, msg: "Informe a chave admin ou e-mail/senha do dono." };
  }
  if (!ownerList().includes(ownerEmail)) {
    return { ok: false, msg: "E-mail sem permissão de admin." };
  }
  const owner = await getUser(ownerEmail);
  if (!owner || !owner.passwordHash) {
    return {
      ok: false,
      msg: "Conta do dono ainda não está na nuvem. Use a chave AUTH_SECRET (Vercel) no campo chave admin."
    };
  }
  if (hashPassword(ownerPassword, owner.salt) !== owner.passwordHash) {
    return { ok: false, msg: "Senha do admin incorreta." };
  }
  return { ok: true, via: "owner" };
}

module.exports = async function handler (req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    json(res, 405, { ok: false, msg: "Método não permitido." });
    return;
  }
  if (!cloudConfigured()) {
    json(res, 503, { ok: false, code: "NO_CLOUD", msg: "Nuvem indisponível." });
    return;
  }

  try {
    const body = await readBody(req);
    const authz = await authorizeAdmin(body);
    if (!authz.ok) {
      json(res, 401, { ok: false, msg: authz.msg || "Não autorizado." });
      return;
    }

    const email = normalizeEmail(body.email || body.login);
    const password = String(body.password || "");
    const name = String(body.name || "").trim() || email;
    const phone = String(body.phone || "").trim();
    const action = String(body.action || "upsert").toLowerCase();

    if (!email || email.indexOf("@") < 0) {
      json(res, 400, { ok: false, msg: "Informe um e-mail válido." });
      return;
    }

    if (action === "lookup") {
      const row = await getUser(email);
      json(res, 200, {
        ok: true,
        exists: Boolean(row && row.passwordHash),
        user: row ? publicUser(row) : null
      });
      return;
    }

    if (!password || password.length < 4) {
      json(res, 400, { ok: false, msg: "Informe uma senha com ao menos 4 caracteres." });
      return;
    }

    const existing = await getUser(email);
    const salt = newSalt();
    const now = Date.now();
    const row = {
      email,
      passwordHash: hashPassword(password, salt),
      salt,
      name: name || existing?.name || email,
      phone: phone || existing?.phone || "",
      plan: body.plan || existing?.plan || "free",
      planUntil: body.planUntil !== undefined ? body.planUntil : (existing?.planUntil ?? null),
      status: "active",
      createdAt: existing?.createdAt || now,
      grantedAt: body.grantedAt !== undefined ? body.grantedAt : (existing?.grantedAt || null),
      coupon: body.coupon !== undefined ? body.coupon : (existing?.coupon || null),
      embassador: body.embassador !== undefined ? body.embassador : (existing?.embassador || ""),
      updatedAt: now,
      resetByAdminAt: now
    };
    await setUser(row);

    json(res, 200, {
      ok: true,
      created: !existing,
      user: publicUser(row),
      token: issueToken(email),
      msg: existing
        ? "Conta na nuvem atualizada. Ela já pode entrar no celular com esta senha."
        : "Conta criada na nuvem. Ela já pode entrar no celular com esta senha."
    });
  } catch (err) {
    console.error("auth/admin-upsert", err);
    json(res, 500, { ok: false, msg: "Falha ao salvar conta na nuvem." });
  }
};
