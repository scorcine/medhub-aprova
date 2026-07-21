/* Formulário de contato — envia para o e-mail oficial via FormSubmit */

const APROVA_CONTACT_EMAIL = "medhubr1@gmail.com";

function aprovaContactShowMsg (formId, text, ok) {
  const msg = document.getElementById(formId + "-msg");
  if (!msg) return;
  msg.hidden = !text;
  msg.textContent = text || "";
  msg.classList.toggle("auth-msg--ok", Boolean(ok));
  msg.classList.toggle("auth-msg--err", Boolean(text) && !ok);
}

async function aprovaContactSend (payload) {
  const res = await fetch(
    "https://formsubmit.co/ajax/" + encodeURIComponent(APROVA_CONTACT_EMAIL),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        _subject: "MedHub R1 — mensagem de contato",
        _template: "table",
        _captcha: "false",
        _replyto: payload.email,
        nome: payload.name,
        email: payload.email,
        mensagem: payload.message,
        origem: payload.source || "site"
      })
    }
  );
  return res.ok;
}

function aprovaBindContactForm (formId, source) {
  const form = document.getElementById(formId);
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "1";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = String(form.name?.value || "").trim();
    const email = String(form.email?.value || "").trim().toLowerCase();
    const message = String(form.message?.value || "").trim();
    const submit = form.querySelector("[type=submit]");

    if (!name || !email || !message) {
      aprovaContactShowMsg(formId, "Preencha nome, e-mail e mensagem.", false);
      return;
    }

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Enviando…";
    }
    aprovaContactShowMsg(formId, "", false);

    try {
      const ok = await aprovaContactSend({ name, email, message, source });
      if (!ok) throw new Error("fail");
      form.reset();
      aprovaContactShowMsg(formId, "Mensagem enviada. Respondemos em breve no seu e-mail.", true);
    } catch {
      aprovaContactShowMsg(
        formId,
        "Não foi possível enviar agora. Escreva para " + APROVA_CONTACT_EMAIL + ".",
        false
      );
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Enviar mensagem";
      }
    }
  });
}

function aprovaPrefillContactFromSession (formId) {
  const form = document.getElementById(formId);
  if (!form || typeof aprovaLoadAuth !== "function") return;
  const session = aprovaLoadAuth();
  if (!session) return;
  if (form.name && !form.name.value && session.name) form.name.value = session.name;
  if (form.email && !form.email.value && session.login) form.email.value = session.login;
}

function aprovaInitContactForms () {
  aprovaBindContactForm("landing-contact-form", "landing");
  aprovaBindContactForm("app-contact-form", "app");
  aprovaPrefillContactFromSession("app-contact-form");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aprovaInitContactForms);
} else {
  aprovaInitContactForms();
}
