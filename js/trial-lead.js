/* Captura de leads — teste grátis 10 dias (landing) */

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
          _subject: "MedHub R1 — lead teste grátis 10 dias",
          _template: "table",
          _captcha: "false",
          nome: lead.name,
          celular: lead.phone,
          email: lead.email,
          origem: "Landing — teste grátis lançamento",
          followUpEm: lead.followUpAt
            ? new Date(lead.followUpAt).toLocaleDateString("pt-BR")
            : ""
        })
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function aprovaTrialSubmit (event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = String(form.name?.value || "").trim();
  const phone = String(form.phone?.value || "").trim();
  const email = String(form.email?.value || "").trim().toLowerCase();
  const phoneDigits = phone.replace(/\D/g, "");

  if (!name || !email || phoneDigits.length < 10) {
    aprovaTrialShowMsg("Preencha nome, celular com DDD e e-mail.", false);
    return;
  }

  const submit = document.getElementById("trial-submit");
  if (submit) {
    submit.disabled = true;
    submit.textContent = "Enviando…";
  }
  aprovaTrialShowMsg("", false);

  const now = Date.now();
  const lead = {
    name,
    phone,
    email,
    at: now,
    followUpAt: now + 10 * 24 * 60 * 60 * 1000,
    source: "landing-trial-10d"
  };

  const list = aprovaTrialLoadLeads().filter((row) => row.email !== email);
  list.unshift(lead);
  aprovaTrialSaveLeads(list);

  await aprovaTrialNotifyOwner(lead);

  form.hidden = true;
  const success = document.getElementById("trial-success");
  if (success) success.hidden = false;
  if (submit) {
    submit.disabled = false;
    submit.textContent = "Quero meu teste grátis";
  }
  form.reset();
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
      if (el.getAttribute("href") === "#planos") {
        aprovaTrialCloseModal();
        return;
      }
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aprovaInitTrialLead);
} else {
  aprovaInitTrialLead();
}
