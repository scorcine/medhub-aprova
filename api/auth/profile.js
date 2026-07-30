const {
  cors,
  json,
  cloudConfigured,
  normalizeEmail,
  hashPassword,
  publicUser,
  getUser,
  setUser,
  verifyToken,
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
    const tokenEmail = verifyToken(body.token);

    if (!email) {
      json(res, 400, { ok: false, msg: "Informe o e-mail." });
      return;
    }

    const row = await getUser(email);
    if (!row || !row.passwordHash) {
      json(res, 404, { ok: false, code: "NOT_FOUND", msg: "Conta não encontrada." });
      return;
    }

    const byToken = tokenEmail && tokenEmail === email;
    const byPass = password && hashPassword(password, row.salt) === row.passwordHash;
    if (!byToken && !byPass) {
      json(res, 401, { ok: false, msg: "Não autorizado." });
      return;
    }

    if (body.name != null) row.name = String(body.name).trim() || row.name;
    if (body.phone != null) row.phone = String(body.phone).trim();
    if (body.plan != null) row.plan = String(body.plan);
    if (body.planUntil !== undefined) row.planUntil = body.planUntil;
    if (body.grantedAt !== undefined) row.grantedAt = body.grantedAt;
    if (body.coupon !== undefined) row.coupon = body.coupon;
    if (body.embassador !== undefined) row.embassador = body.embassador;
    if (body.status != null) row.status = String(body.status);
    row.updatedAt = Date.now();
    await setUser(row);

    json(res, 200, { ok: true, user: publicUser(row) });
  } catch (err) {
    console.error("auth/profile", err);
    json(res, 500, { ok: false, msg: "Não foi possível atualizar o perfil." });
  }
};
