const {
  cors,
  json,
  cloudConfigured,
  normalizeEmail,
  verifyToken,
  getUser,
  readBody
} = require("../../lib/aprova-server");
const {
  stripeConfigured,
  getStripe,
  resolveCheckoutPlan,
  publicOrigin
} = require("../../lib/aprova-billing");

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
      msg: "Conta na nuvem ainda não está configurada."
    });
    return;
  }
  if (!stripeConfigured()) {
    json(res, 503, {
      ok: false,
      code: "NO_STRIPE",
      msg: "Pagamento online ainda não está configurado. Fale conosco em medhubr1@gmail.com."
    });
    return;
  }

  try {
    const body = await readBody(req);
    const planInfo = resolveCheckoutPlan(body.plan || body.plano);
    if (!planInfo) {
      json(res, 400, {
        ok: false,
        msg: "Escolha o plano Pro Mensal ou Pro Anual."
      });
      return;
    }

    const email = normalizeEmail(body.email || body.login);
    const token = String(body.token || "");
    if (!email || email.indexOf("@") < 0) {
      json(res, 400, { ok: false, msg: "Informe um e-mail válido." });
      return;
    }
    const tokenEmail = verifyToken(token);
    if (!tokenEmail || tokenEmail !== email) {
      json(res, 401, {
        ok: false,
        code: "AUTH",
        msg: "Faça login ou cadastre-se antes de assinar."
      });
      return;
    }

    const user = await getUser(email);
    if (!user || !user.passwordHash) {
      json(res, 404, {
        ok: false,
        code: "NO_USER",
        msg: "Crie sua conta antes de assinar."
      });
      return;
    }

    const stripe = getStripe();
    const origin = publicOrigin(req);
    const trialDays = Number(process.env.STRIPE_TRIAL_DAYS || 0);
    const subscriptionData = {
      metadata: {
        email,
        plan: planInfo.plan,
        planKey: planInfo.planKey
      }
    };
    if (trialDays > 0) subscriptionData.trial_period_days = trialDays;

    const sessionParams = {
      mode: "subscription",
      client_reference_id: email,
      line_items: [{ price: planInfo.priceId, quantity: 1 }],
      success_url: origin + "/app.html?checkout=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/cadastro.html?plano=" + encodeURIComponent(planInfo.planKey) + "&checkout=cancel",
      metadata: {
        email,
        plan: planInfo.plan,
        planKey: planInfo.planKey
      },
      subscription_data: subscriptionData,
      allow_promotion_codes: true,
      locale: "pt-BR"
    };
    if (user.stripeCustomerId) sessionParams.customer = user.stripeCustomerId;
    else sessionParams.customer_email = email;

    const session = await stripe.checkout.sessions.create(sessionParams);
    json(res, 200, {
      ok: true,
      url: session.url,
      id: session.id,
      plan: planInfo.planKey
    });
  } catch (err) {
    console.error("billing/checkout", err);
    json(res, 500, {
      ok: false,
      code: "SERVER",
      msg: err.message || "Não foi possível iniciar o pagamento."
    });
  }
};
