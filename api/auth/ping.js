const { cors, json, cloudConfigured, redisCommand } = require("../../lib/aprova-server");

module.exports = async function handler (req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  try {
    if (!cloudConfigured()) {
      json(res, 503, { ok: false, cloud: false, msg: "sem env" });
      return;
    }
    const pong = await redisCommand(["PING"]);
    const set = await redisCommand(["SET", "aprova:ping", String(Date.now())]);
    const get = await redisCommand(["GET", "aprova:ping"]);
    json(res, 200, { ok: true, cloud: true, pong, set, get: get != null });
  } catch (err) {
    json(res, 500, {
      ok: false,
      cloud: true,
      msg: String(err && err.message ? err.message : err),
      code: err && err.code
    });
  }
};
