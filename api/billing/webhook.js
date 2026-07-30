const { cors, json, cloudConfigured } = require("../../lib/aprova-server");
const {
  stripeConfigured,
  getStripe,
  planFromPriceId,
  applyEntitlement,
  readRawBody
} = require("../../lib/aprova-billing");

module.exports.config = {
  api: {
    bodyParser: false
  }
};

async function entitlementFromSubscription (subscription) {
  const item = subscription?.items?.data?.[0];
  const priceId = item?.price?.id || "";
  const plan =
    planFromPriceId(priceId) ||
    String(subscription?.metadata?.plan || "").trim() ||
    null;
  const periodEnd = subscription?.current_period_end
    ? Number(subscription.current_period_end) * 1000
    : null;
  return {
    plan: plan || "m1",
    planUntil: periodEnd,
    stripeCustomerId: String(subscription?.customer || ""),
    stripeSubscriptionId: String(subscription?.id || ""),
    stripePriceId: priceId,
    status: "active"
  };
}

async function handleCheckoutCompleted (stripe, session) {
  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    session.customer_email ||
    session.client_reference_id;
  if (!email) return;

  let plan = String(session.metadata?.plan || "").trim();
  let planUntil = null;
  let stripeSubscriptionId = session.subscription
    ? String(session.subscription)
    : "";
  let stripeCustomerId = session.customer ? String(session.customer) : "";
  let stripePriceId = "";

  if (stripeSubscriptionId) {
    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const ent = await entitlementFromSubscription(sub);
    plan = ent.plan || plan;
    planUntil = ent.planUntil;
    stripeCustomerId = ent.stripeCustomerId || stripeCustomerId;
    stripeSubscriptionId = ent.stripeSubscriptionId || stripeSubscriptionId;
    stripePriceId = ent.stripePriceId;
  }

  if (!plan) plan = "m1";
  if (planUntil == null) {
    const month = 30 * 86400000;
    planUntil = Date.now() + (plan === "m12" ? 12 * month : month);
  }

  await applyEntitlement(email, {
    plan,
    planUntil,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId,
    status: "active"
  });
}

async function handleSubscriptionChange (subscription, deleted) {
  const email = subscription?.metadata?.email;
  if (!email) return;
  if (deleted || subscription.status === "canceled" || subscription.status === "unpaid") {
    await applyEntitlement(email, {
      plan: "free",
      planUntil: Date.now() - 1000,
      stripeCustomerId: String(subscription.customer || ""),
      stripeSubscriptionId: String(subscription.id || ""),
      status: "expired"
    });
    return;
  }
  const ent = await entitlementFromSubscription(subscription);
  await applyEntitlement(email, ent);
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
  if (!cloudConfigured() || !stripeConfigured()) {
    json(res, 503, { ok: false, msg: "Billing não configurado." });
    return;
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!secret) {
    json(res, 503, { ok: false, msg: "STRIPE_WEBHOOK_SECRET ausente." });
    return;
  }

  try {
    const stripe = getStripe();
    const raw = await readRawBody(req);
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(raw, sig, secret);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object, false);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object, true);
        break;
      case "invoice.paid": {
        const invoice = event.data.object;
        const subId = invoice.subscription ? String(invoice.subscription) : "";
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await handleSubscriptionChange(sub, false);
        }
        break;
      }
      default:
        break;
    }

    json(res, 200, { ok: true, received: true });
  } catch (err) {
    console.error("billing/webhook", err);
    json(res, 400, {
      ok: false,
      msg: err.message || "Webhook inválido."
    });
  }
};
