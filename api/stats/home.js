/**
 * Contadores da página inicial (Redis).
 * GET  → { views, sessions, anonSessions }
 * POST → incrementa (body: { session?: bool, anon?: bool })
 */
const {
  cors,
  json,
  cloudConfigured,
  redisCommand,
  readBody
} = require("../../lib/aprova-server");

const KEY_VIEWS = "aprova:stats:home:views";
const KEY_SESSIONS = "aprova:stats:home:sessions";
const KEY_ANON = "aprova:stats:home:anon";

async function readCounts () {
  const [views, sessions, anon] = await Promise.all([
    redisCommand(["GET", KEY_VIEWS]),
    redisCommand(["GET", KEY_SESSIONS]),
    redisCommand(["GET", KEY_ANON])
  ]);
  return {
    views: Number(views || 0) || 0,
    sessions: Number(sessions || 0) || 0,
    anonSessions: Number(anon || 0) || 0
  };
}

module.exports = async function handler (req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!cloudConfigured()) {
    json(res, 503, {
      ok: false,
      code: "NO_CLOUD",
      msg: "Estatísticas na nuvem indisponíveis.",
      views: 0,
      sessions: 0,
      anonSessions: 0
    });
    return;
  }

  try {
    if (req.method === "GET") {
      const counts = await readCounts();
      json(res, 200, { ok: true, ...counts });
      return;
    }

    if (req.method !== "POST") {
      json(res, 405, { ok: false, msg: "Método não permitido." });
      return;
    }

    const body = await readBody(req);
    await redisCommand(["INCR", KEY_VIEWS]);
    if (body && body.session) {
      await redisCommand(["INCR", KEY_SESSIONS]);
    }
    if (body && body.anon) {
      await redisCommand(["INCR", KEY_ANON]);
    }
    const counts = await readCounts();
    json(res, 200, { ok: true, ...counts });
  } catch (err) {
    console.error("stats/home", err);
    json(res, 500, { ok: false, msg: "Falha ao registrar acesso." });
  }
};
