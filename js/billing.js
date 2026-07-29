/* Stripe Checkout — Pro Mensal / Pro Anual */

const APROVA_BILLING_PLAN_KEY = "medhub-aprova-plan-interest-v1";

function aprovaBillingNormalizePlan (plano) {
  const p = String(plano || "").trim().toLowerCase();
  if (p === "pro-mensal" || p === "m1" || p === "mensal") return "pro-mensal";
  if (p === "pro-anual" || p === "m12" || p === "anual") return "pro-anual";
  return "";
}

function aprovaBillingRememberPlan (plano) {
  const plan = aprovaBillingNormalizePlan(plano);
  if (!plan) return;
  try {
    localStorage.setItem(APROVA_BILLING_PLAN_KEY, JSON.stringify({ plano: plan, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

function aprovaBillingReadRememberedPlan () {
  try {
    const raw = JSON.parse(localStorage.getItem(APROVA_BILLING_PLAN_KEY) || "null");
    return aprovaBillingNormalizePlan(raw && raw.plano);
  } catch {
    return "";
  }
}

async function aprovaBillingRefreshEntitlement () {
  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const email = session && session.login;
  if (!email || typeof aprovaCloudSyncProfile !== "function") return { ok: false };
  // Releitura: profile com token devolve o usuário atualizado (webhook já gravou o plano)
  const result = await aprovaCloudSyncProfile(email, {});
  return result;
}

/**
 * Inicia Stripe Checkout para o plano.
 * @param {string} plano pro-mensal | pro-anual
 * @returns {Promise<boolean>}
 */
async function aprovaBillingStartCheckout (plano) {
  const plan = aprovaBillingNormalizePlan(plano);
  if (!plan) {
    if (typeof aprovaShowAuthMsg === "function") {
      aprovaShowAuthMsg("Escolha o plano Pro Mensal ou Pro Anual.", false);
    }
    return false;
  }

  const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
  const email = session && session.login;
  const token = typeof aprovaCloudLoadToken === "function" ? aprovaCloudLoadToken() : "";
  if (!email || !token) {
    aprovaBillingRememberPlan(plan);
    window.location.href = "cadastro.html?plano=" + encodeURIComponent(plan);
    return false;
  }

  if (typeof aprovaCloudIsLocalDev === "function" && aprovaCloudIsLocalDev()) {
    if (typeof aprovaShowAuthMsg === "function") {
      aprovaShowAuthMsg("Pagamento Stripe só funciona no site publicado (não no localhost).", false);
    }
    return false;
  }

  if (typeof aprovaShowAuthMsg === "function") {
    aprovaShowAuthMsg("Abrindo pagamento seguro…", true);
  }

  try {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ plan, email, token }),
      credentials: "same-origin",
      cache: "no-store"
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.url) {
      if (typeof aprovaShowAuthMsg === "function") {
        aprovaShowAuthMsg(data.msg || "Não foi possível iniciar o pagamento.", false);
      }
      return false;
    }
    window.location.href = data.url;
    return true;
  } catch (err) {
    if (typeof aprovaShowAuthMsg === "function") {
      aprovaShowAuthMsg("Falha de rede ao iniciar o pagamento.", false);
    }
    return false;
  }
}

/** Após cadastro com ?plano=pro-*, inicia checkout (ou vai ao app se Free). */
async function aprovaBillingAfterSignup (plano) {
  const plan = aprovaBillingNormalizePlan(plano);
  if (!plan) {
    window.location.href = "app.html";
    return;
  }
  aprovaBillingRememberPlan(plan);
  const started = await aprovaBillingStartCheckout(plan);
  if (!started) {
    window.setTimeout(() => {
      window.location.href = "app.html?checkout=pending&plano=" + encodeURIComponent(plan);
    }, 800);
  }
}

async function aprovaBillingHandleReturn () {
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }
  const checkout = params.get("checkout") || "";
  if (checkout !== "success") return;

  if (typeof aprovaShowAuthMsg === "function") {
    aprovaShowAuthMsg("Pagamento confirmado. Atualizando seu acesso…", true);
  }

  // Webhook pode demorar 1–2s
  for (let i = 0; i < 6; i++) {
    const refreshed = await aprovaBillingRefreshEntitlement();
    const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
    const plan =
      session && typeof aprovaGetUserPlan === "function"
        ? aprovaGetUserPlan(session.login)
        : null;
    if (refreshed.ok && plan && (plan.plan === "m1" || plan.plan === "m12" || plan.plan === "lifetime")) {
      if (typeof aprovaShowAuthMsg === "function") {
        aprovaShowAuthMsg("Assinatura ativa. Bom estudo!", true);
      }
      break;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }

  try {
    params.delete("checkout");
    params.delete("session_id");
    const clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", clean);
  } catch {
    /* ignore */
  }
}

function aprovaBillingBindPricingLinks () {
  document.querySelectorAll("a[href*='plano=pro-']").forEach((a) => {
    a.addEventListener("click", (ev) => {
      try {
        const url = new URL(a.href, window.location.href);
        const plan = aprovaBillingNormalizePlan(url.searchParams.get("plano"));
        if (!plan) return;
        const session = typeof aprovaLoadAuth === "function" ? aprovaLoadAuth() : null;
        const token = typeof aprovaCloudLoadToken === "function" ? aprovaCloudLoadToken() : "";
        if (session && session.login && token) {
          ev.preventDefault();
          void aprovaBillingStartCheckout(plan);
        } else {
          aprovaBillingRememberPlan(plan);
        }
      } catch {
        /* ignore */
      }
    });
  });
}

try {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      aprovaBillingBindPricingLinks();
      void aprovaBillingHandleReturn();
    });
  } else {
    aprovaBillingBindPricingLinks();
    void aprovaBillingHandleReturn();
  }
} catch {
  /* ignore */
}
