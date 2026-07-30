/**
 * Stripe billing helpers (shared outside /api for Vercel bundling).
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   STRIPE_PRICE_PRO_MENSAL
 *   STRIPE_PRICE_PRO_ANUAL
 *   (opcional) STRIPE_TRIAL_DAYS
 */
const { getUser, setUser, normalizeEmail } = require("./aprova-server");

function stripeConfigured () {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_PRO_MENSAL &&
      process.env.STRIPE_PRICE_PRO_ANUAL
  );
}

function getStripe () {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key) {
    const err = new Error("STRIPE_SECRET_KEY ausente");
    err.code = "NO_STRIPE";
    throw err;
  }
  // Lazy require — evita crash se o pacote não for necessário (ex.: status)
  const Stripe = require("stripe");
  return new Stripe(key);
}

function resolveCheckoutPlan (planInput) {
  const raw = String(planInput || "")
    .trim()
    .toLowerCase();
  const mensal = process.env.STRIPE_PRICE_PRO_MENSAL || "";
  const anual = process.env.STRIPE_PRICE_PRO_ANUAL || "";
  if (raw === "pro-mensal" || raw === "m1" || raw === "mensal") {
    if (!mensal) return null;
    return { planKey: "pro-mensal", plan: "m1", priceId: mensal, label: "Pro Mensal" };
  }
  if (raw === "pro-anual" || raw === "m12" || raw === "anual") {
    if (!anual) return null;
    return { planKey: "pro-anual", plan: "m12", priceId: anual, label: "Pro Anual" };
  }
  return null;
}

function planFromPriceId (priceId) {
  const id = String(priceId || "");
  if (id && id === process.env.STRIPE_PRICE_PRO_MENSAL) return "m1";
  if (id && id === process.env.STRIPE_PRICE_PRO_ANUAL) return "m12";
  return null;
}

function publicOrigin (req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "www.medhubr1.com.br")
    .split(",")[0]
    .trim();
  return proto + "://" + host;
}

async function applyEntitlement (email, opts) {
  const key = normalizeEmail(email);
  if (!key || key.indexOf("@") < 0) return null;
  let row = await getUser(key);
  if (!row) {
    row = {
      email: key,
      passwordHash: "",
      salt: "",
      name: key,
      phone: "",
      plan: "free",
      planUntil: null,
      status: "active",
      createdAt: Date.now(),
      grantedAt: null,
      coupon: null,
      embassador: "",
      updatedAt: Date.now()
    };
  }
  if (opts.plan) row.plan = opts.plan;
  if (opts.planUntil !== undefined) row.planUntil = opts.planUntil;
  if (opts.stripeCustomerId) row.stripeCustomerId = opts.stripeCustomerId;
  if (opts.stripeSubscriptionId) row.stripeSubscriptionId = opts.stripeSubscriptionId;
  if (opts.stripePriceId) row.stripePriceId = opts.stripePriceId;
  if (opts.status) row.status = opts.status;
  row.grantedAt = row.grantedAt || Date.now();
  row.updatedAt = Date.now();
  row.billingSource = "stripe";
  await setUser(row);
  return row;
}

async function readRawBody (req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = {
  stripeConfigured,
  getStripe,
  resolveCheckoutPlan,
  planFromPriceId,
  publicOrigin,
  applyEntitlement,
  readRawBody
};
