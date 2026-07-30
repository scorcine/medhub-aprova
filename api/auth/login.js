const {
  cors,
  json,
  cloudConfigured,
  normalizeEmail,
  hashPassword,
  publicUser,
  getUser,
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

    if (!email || !password) {
      json(res, 400, { ok: false, msg: "Informe e-mail e senha." });
      return;
    }

    const row = await getUser(email);
    if (!row || !row.passwordHash) {
      json(res, 404, {
        ok: false,
        code: "NOT_FOUND",
        msg: "Conta não encontrada. Cadastre-se para criar sua conta."
      });
      return;
    }

    const hash = hashPassword(password, row.salt);
    if (hash !== row.passwordHash) {
      json(res, 401, {
        ok: false,
        code: "BAD_PASSWORD",
        msg: "Senha incorreta."
      });
      return;
    }

    json(res, 200, {
      ok: true,
      user: publicUser(row),
      token: issueToken(email)
    });
  } catch (err) {
    console.error("auth/login", err);
    json(res, 500, {
      ok: false,
      code: "SERVER",
      msg: "Não foi possível entrar. Tente de novo."
    });
  }
};
