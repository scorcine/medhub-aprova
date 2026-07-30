const { cors, json, cloudConfigured } = require("../../lib/aprova-server");

module.exports = async function handler (req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET" && req.method !== "POST") {
    json(res, 405, { ok: false, msg: "Método não permitido." });
    return;
  }
  json(res, 200, {
    ok: true,
    cloud: cloudConfigured(),
    service: "medhub-r1-auth"
  });
};
