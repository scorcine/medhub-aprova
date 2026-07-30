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
    json(res, 503, {
      ok: false,
      code: "NO_CLOUD",
      msg: "Serviço de conta na nuvem ainda não está configurado."
    });
    return;
  }

  try {
    const body = await readBody(req);
    const email = normalizeEmail(body.email || body.login);
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const migrate = Boolean(body.migrate);

    if (!email || email.indexOf("@") < 0) {
      json(res, 400, { ok: false, msg: "Informe um e-mail válido." });
      return;
    }
    if (!password || password.length < 4) {
      json(res, 400, { ok: false, msg: "A senha precisa ter ao menos 4 caracteres." });
      return;
    }
    if (!name && !migrate) {
      json(res, 400, { ok: false, msg: "Informe seu nome." });
      return;
    }

    const existing = await getUser(email);
    if (existing && existing.passwordHash) {
      if (migrate) {
        const tryHash = hashPassword(password, existing.salt);
        if (tryHash === existing.passwordHash) {
          // Mesma senha: só atualiza perfil/plano
          existing.name = name || existing.name || email;
          if (phone) existing.phone = phone;
          if (body.plan) existing.plan = String(body.plan);
          if (body.planUntil !== undefined) existing.planUntil = body.planUntil;
          if (body.grantedAt !== undefined) existing.grantedAt = body.grantedAt;
          if (body.coupon !== undefined) existing.coupon = body.coupon;
          if (body.embassador !== undefined) existing.embassador = body.embassador;
          existing.status = "active";
          existing.updatedAt = Date.now();
          await setUser(existing);
          json(res, 200, {
            ok: true,
            migrated: true,
            user: publicUser(existing),
            token: issueToken(email)
          });
          return;
        }
        // Conta antiga no aparelho com senha diferente da nuvem:
        // na migração, a senha digitada no login local vira a senha da nuvem.
        if (body.replacePassword) {
          const salt = newSalt();
          existing.passwordHash = hashPassword(password, salt);
          existing.salt = salt;
          existing.name = name || existing.name || email;
          if (phone) existing.phone = phone;
          if (body.plan) existing.plan = String(body.plan);
          if (body.planUntil !== undefined) existing.planUntil = body.planUntil;
          existing.status = "active";
          existing.updatedAt = Date.now();
          await setUser(existing);
          json(res, 200, {
            ok: true,
            migrated: true,
            replacedPassword: true,
            user: publicUser(existing),
            token: issueToken(email)
          });
          return;
        }
        json(res, 401, {
          ok: false,
          code: "BAD_PASSWORD",
          msg: "Senha diferente da conta na nuvem."
        });
        return;
      }
      json(res, 409, {
        ok: false,
        code: "EXISTS",
        msg: "Este e-mail já está cadastrado. Use Entrar."
      });
      return;
    }

    const salt = newSalt();
    const now = Date.now();
    const row = {
      email,
      passwordHash: hashPassword(password, salt),
      salt,
      name: name || email,
      phone,
      plan: body.plan || "free",
      planUntil: body.planUntil != null ? body.planUntil : null,
      status: "active",
      createdAt: now,
      grantedAt: body.grantedAt || null,
      coupon: body.coupon || null,
      embassador: body.embassador || "",
      updatedAt: now
    };
    await setUser(row);
    json(res, 201, {
      ok: true,
      user: publicUser(row),
      token: issueToken(email)
    });
  } catch (err) {
    console.error("auth/register", err);
    json(res, 500, {
      ok: false,
      code: "SERVER",
      msg: "Não foi possível criar a conta. Tente de novo."
    });
  }
};
