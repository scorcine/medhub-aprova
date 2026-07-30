const { cors, json } = require("../../lib/aprova-server");
const { stripeConfigured, resolveCheckoutPlan } = require("../../lib/aprova-billing");

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
  const configured = stripeConfigured();
  json(res, 200, {
    ok: true,
    configured,
    plans: {
      "pro-mensal": Boolean(resolveCheckoutPlan("pro-mensal")),
      "pro-anual": Boolean(resolveCheckoutPlan("pro-anual"))
    }
  });
};
