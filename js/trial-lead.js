/* Teste grátis 10 dias — cria conta, libera o app na hora e registra lead */

const APROVA_TRIAL_LEADS_KEY = "medhub-aprova-trial-leads-v1";
const APROVA_TRIAL_NOTIFY_EMAIL = "scorcine@gmail.com";

function aprovaTrialLoadLeads () {
  try {
    const raw = JSON.parse(localStorage.getItem(APROVA_TRIAL_LEADS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function aprovaTrialSaveLeads (list) {
  localStorage.setItem(APROVA_TRIAL_LEADS_KEY, JSON.stringify(list.slice(0, 500)));
}

function aprovaTrialFormatPhone (value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? "(" + digits : "";
  if (digits.length <= 6) return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
  if (digits.length <= 10) {
    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
  }
  return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
}

function aprovaTrialShowMsg (text, ok) {
  const msg = document.getElementById("trial-msg");
  if (!msg) return;
  msg.hidden = !text;
  msg.textContent = text || "";
  msg.classList.toggle("auth-msg--ok", Boolean(ok));
  msg.classList.toggle("auth-msg--err", Boolean(text) && !ok);
}

function aprovaTrialOpenModal () {
  const modal = document.getElementById("trial-modal");
  const form = document.getElementById("trial-form");
  const success = document.getElementById("trial-success");
  if (!modal) return;
  if (form) form.hidden = false;
  if (success) success.hidden = true;
  aprovaTrialShowMsg("", false);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const first = document.getElementById("trial-name");
  if (first) setTimeout(() => first.focus(), 40);
}

function aprovaTrialCloseModal () {
  const modal = document.getElementById("trial-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function aprovaTrialNotifyOwner (lead) {
  try {
    const res = await fetch(
      "https://formsubmit.co/ajax/" + encodeURIComponent(APROVA_TRIAL_NOTIFY_EMAIL),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          _subject: "MedHub R1 — teste grátis ativado (10 dias)",
          _template: "table",
          _captcha: "false",
          nome: lead.name,
          celular: lead.phone,
          email: lead.email,
          origem: "Landing — teste grátis 10 dias (acesso liberado)",
          validadeAte: lead.trialUntil
            ? new Date(lead.trialUntil).toLocaleDateString("pt-BR")
            : "",
          status: "ativo"
        })
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function aprovaTrialBuildGrant (email) {
  const meta = typeof aprovaAccessPlanMeta === "function"
    ? aprovaAccessPlanMeta("trial-10")
    : { plan: "trial", planUntil: Date.now() + 10 * 86400000 };
  return {
    email: String(email || "").trim().toLowerCase(),
    plan: meta.plan || "trial",
    planUntil: meta.planUntil,
    grantedAt: Date.now(),
    type: "trial-10"
  };
}

async function aprovaTrialSubmit (event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = String(form.name?.value || "").trim();
  const phone = String(form.phone?.value || "").trim();
  const email = String(form.email?.value || "").trim().toLowerCase();
  const password = String(form.password?.value || "");
  const password2 = String(form.password2?.value || "");
  const phoneDigits = phone.replace(/\D/g, "");

  if (!name || !email || phoneDigits.length < 10) {
    aprovaTrialShowMsg("Preencha nome, celular com DDD e e-mail.", false);
    return;
  }
  if (password.length < 4) {
    aprovaTrialShowMsg("A senha precisa ter ao menos 4 caracteres.", false);
    return;
  }
  if (password !== password2) {
    aprovaTrialShowMsg("As senhas não coincidem.", false);
    return;
  }
  if (typeof aprovaRegister !== "function") {
    aprovaTrialShowMsg("Não foi possível criar a conta. Recarregue a página.", false);
    return;
  }

  const submit = document.getElementById("trial-submit");
  if (submit) {
    submit.disabled = true;
    submit.textContent = "Liberando acesso…";
  }
  aprovaTrialShowMsg("", false);

  const grant = aprovaTrialBuildGrant(email);
  const ok = aprovaRegister(email, password, { name, phone, grant });
  if (!ok) {
    if (submit) {
      submit.disabled = false;
      submit.textContent = "Começar meu teste de 10 dias";
    }
    // aprovaRegister já mostrou a mensagem em #auth-msg se existir; espelha em #trial-msg
    const authMsg = document.getElementById("auth-msg");
    if (authMsg && authMsg.textContent) {
      aprovaTrialShowMsg(authMsg.textContent, false);
    } else {
      aprovaTrialShowMsg("Não foi possível ativar o teste. Se já tem conta, use Entrar.", false);
    }
    return;
  }

  const now = Date.now();
  const lead = {
    name,
    phone,
    email,
    at: now,
    trialUntil: grant.planUntil,
    followUpAt: grant.planUntil,
    source: "landing-trial-10d",
    status: "active"
  };
  const list = aprovaTrialLoadLeads().filter((row) => row.email !== email);
  list.unshift(lead);
  aprovaTrialSaveLeads(list);

  void aprovaTrialNotifyOwner(lead);

  aprovaTrialShowMsg("Teste liberado — abrindo o app…", true);
  if (submit) submit.textContent = "Abrindo…";

  window.setTimeout(() => {
    if (typeof aprovaEnterAppAfterLogin === "function") {
      aprovaEnterAppAfterLogin();
    } else {
      window.location.href = "app.html";
    }
  }, 400);
}

function aprovaInitTrialLead () {
  const modal = document.getElementById("trial-modal");
  if (!modal) return;

  document.querySelectorAll("[data-trial-open]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      aprovaTrialOpenModal();
    });
  });

  document.querySelectorAll("[data-trial-close]").forEach((el) => {
    el.addEventListener("click", () => {
      aprovaTrialCloseModal();
    });
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !modal.hidden) aprovaTrialCloseModal();
  });

  const phone = document.getElementById("trial-phone");
  if (phone) {
    phone.addEventListener("input", () => {
      phone.value = aprovaTrialFormatPhone(phone.value);
    });
  }

  const form = document.getElementById("trial-form");
  if (form) form.addEventListener("submit", aprovaTrialSubmit);

  try {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("trial") === "1" || window.location.hash === "#trial") {
      aprovaTrialOpenModal();
    }
  } catch (e) { /* ignore */ }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aprovaInitTrialLead);
} else {
  aprovaInitTrialLead();
}
