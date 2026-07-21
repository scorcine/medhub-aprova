/* Painel Admin MedHub R1 — protótipo localStorage (sem API) */

const APROVA_OWNER_EMAILS = ["scorcine@gmail.com"];
const APROVA_ADMIN_CFG_KEY = "medhub-aprova-admin-cfg-v1";
const APROVA_ADMIN_LOG_KEY = "medhub-aprova-admin-log-v1";
const APROVA_ADMIN_MKT_KEY = "medhub-aprova-admin-mkt-v1";
const APROVA_PLAN_INTEREST_KEY = "medhub-aprova-plan-interest-v1";
const APROVA_ADMIN_SESSION_KEY = "medhub-aprova-admin-session-v1";

const APROVA_ADMIN_BANKS = [
  { id: "clinica", file: "data/questions-clinica.json", label: "Clínica médica" },
  { id: "cirurgia", file: "data/questions-cirurgia.json", label: "Cirurgia" },
  { id: "pediatria", file: "data/questions-pediatria.json", label: "Pediatria" },
  { id: "go", file: "data/questions-go.json", label: "Ginecologia e obstetrícia" },
  { id: "preventiva", file: "data/questions-preventiva.json", label: "Preventiva" }
];

const SECTION_META = {
  overview: { title: "Visão geral", desc: "Resumo de conteúdo, contas locais e planos." },
  users: { title: "Usuários", desc: "Contas salvas neste navegador." },
  access: { title: "Liberar acesso", desc: "Gere cupom pelo nome e pelos meses — ela completa o cadastro no celular." },
  coupons: { title: "Cupons embaixador", desc: "Gere códigos que liberam o app completo no cadastro." },
  content: { title: "Conteúdo", desc: "Inventário dos bancos publicados." },
  plans: { title: "Leads e planos", desc: "Teste grátis e cliques Free/Pro no cadastro." },
  marketing: { title: "Marketing", desc: "Links e contatos públicos." },
  settings: { title: "Configurações", desc: "Owners e PIN do painel." },
  log: { title: "Auditoria", desc: "Ações recentes neste dispositivo." },
  pages: { title: "Páginas do site", desc: "Atalhos para editar e abrir o produto." }
};

function adminLoadJson (key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function adminSaveJson (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function adminLoadCfg () {
  const cfg = adminLoadJson(APROVA_ADMIN_CFG_KEY, {});
  const owners = Array.isArray(cfg.owners) && cfg.owners.length
    ? cfg.owners.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
    : APROVA_OWNER_EMAILS.map((e) => e.toLowerCase());
  return {
    owners,
    pin: String(cfg.pin || "")
  };
}

function adminIsOwnerEmail (email) {
  const e = String(email || "").trim().toLowerCase();
  return adminLoadCfg().owners.includes(e);
}

function adminPushLog (action, detail) {
  const session = aprovaLoadAuth();
  const list = adminLoadJson(APROVA_ADMIN_LOG_KEY, []);
  list.unshift({
    at: Date.now(),
    actor: session?.login || "admin",
    action,
    detail: detail || ""
  });
  adminSaveJson(APROVA_ADMIN_LOG_KEY, list.slice(0, 200));
}

function adminShow (el, on) {
  if (el) el.hidden = !on;
}

function adminSetStatus (id, text, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = !text;
  el.textContent = text || "";
  el.classList.toggle("admin-status--ok", Boolean(ok));
  el.classList.toggle("admin-status--err", Boolean(text) && !ok);
}

function adminPlanLabel (plan) {
  const map = {
    free: "Free",
    lifetime: "Vitalício",
    m1: "1 mês",
    m3: "3 meses",
    m6: "6 meses",
    m12: "12 meses",
    "pro-mensal": "1 mês",
    "pro-anual": "12 meses",
    cortesia: "Cortesia",
    "cortesia-1": "1 mês",
    "cortesia-3": "3 meses",
    "trial-10": "10 dias"
  };
  return map[plan] || plan || "Free";
}

function adminNormalizeUser (u) {
  return {
    login: u.login,
    name: u.name || (u.status === "pending" ? "(aguardando cadastro)" : u.login),
    phone: u.phone || "",
    password: u.password,
    status: u.status || (u.password ? "active" : "pending"),
    createdAt: u.createdAt || null,
    claimedAt: u.claimedAt || null,
    plan: u.plan || "free",
    planUntil: u.planUntil || null,
    grantedAt: u.grantedAt || null
  };
}

function adminListUsers () {
  const users = aprovaLoadUsers();
  return Object.keys(users)
    .map((k) => adminNormalizeUser(users[k]))
    .sort((a, b) => String(a.login).localeCompare(String(b.login)));
}

function adminGetSessionOk () {
  const auth = aprovaLoadAuth();
  if (!auth?.login) return null;
  if (!adminIsOwnerEmail(auth.login)) return null;
  const adm = adminLoadJson(APROVA_ADMIN_SESSION_KEY, null);
  if (!adm || adm.login !== auth.login.toLowerCase()) return null;
  if (adm.until && Date.now() > adm.until) return null;
  const cfg = adminLoadCfg();
  if (cfg.pin && adm.pin !== cfg.pin) return null;
  return auth;
}

function adminStartSession (pin) {
  const auth = aprovaLoadAuth();
  adminSaveJson(APROVA_ADMIN_SESSION_KEY, {
    login: String(auth.login).toLowerCase(),
    pin: pin || "",
    until: Date.now() + 60 * 60 * 1000
  });
}

function adminClearSession () {
  localStorage.removeItem(APROVA_ADMIN_SESSION_KEY);
}

function adminGoto (section) {
  const id = SECTION_META[section] ? section : "overview";
  document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-admin-section") === id);
  });
  document.querySelectorAll(".admin-section").forEach((el) => {
    el.hidden = el.getAttribute("data-admin-section") !== id;
  });
  const meta = SECTION_META[id];
  const title = document.getElementById("admin-section-title");
  const desc = document.getElementById("admin-section-desc");
  if (title) title.textContent = meta.title;
  if (desc) desc.textContent = meta.desc;
  window.location.hash = "#/" + id;
  if (id === "overview") adminRenderOverview();
  if (id === "users") adminRenderUsers();
  if (id === "access") {
    adminRenderInvites();
  }
  if (id === "coupons") adminRenderCoupons();
  if (id === "content") adminRenderContent();
  if (id === "plans") adminRenderPlans();
  if (id === "marketing") adminFillMarketing();
  if (id === "settings") adminFillSettings();
  if (id === "log") adminRenderLog();
}

async function adminFetchBankCounts () {
  const out = [];
  let total = 0;
  for (const bank of APROVA_ADMIN_BANKS) {
    try {
      const res = await fetch(bank.file + "?v=admin");
      const data = await res.json();
      const n = Array.isArray(data) ? data.length : 0;
      total += n;
      out.push({ ...bank, count: n, ok: true });
    } catch {
      out.push({ ...bank, count: 0, ok: false });
    }
  }
  return { banks: out, total };
}

async function adminRenderOverview () {
  const grid = document.getElementById("admin-stats-grid");
  if (!grid) return;
  grid.innerHTML = "<p class=\"admin-muted\">Carregando…</p>";
  const users = adminListUsers();
  const pro = users.filter((u) => u.plan && u.plan !== "free").length;
  const interest = adminLoadJson(APROVA_PLAN_INTEREST_KEY, null);
  const { banks, total } = await adminFetchBankCounts();
  grid.innerHTML = [
    { v: total, l: "Questões publicadas", c: "ok" },
    { v: users.length, l: "Contas neste navegador", c: "" },
    { v: pro, l: "Com acesso pago/liberado", c: "ok" },
    { v: interest?.plano ? adminPlanLabel(interest.plano) : "—", l: "Último interesse no cadastro", c: "warn" }
  ].map((s) => (
    "<div class=\"admin-stat-card" + (s.c ? " admin-stat-card--" + s.c : "") + "\">" +
      "<div class=\"admin-stat-value\">" + s.v + "</div>" +
      "<div class=\"admin-stat-label\">" + s.l + "</div>" +
    "</div>"
  )).join("");
  void banks;
}

function adminRenderUsers () {
  const list = document.getElementById("admin-users-list");
  const count = document.getElementById("admin-user-count");
  const q = String(document.getElementById("admin-search")?.value || "").trim().toLowerCase();
  const plan = document.getElementById("admin-filter-plan")?.value || "all";
  let users = adminListUsers();
  if (q) {
    users = users.filter((u) =>
      String(u.login).toLowerCase().includes(q) || String(u.name).toLowerCase().includes(q)
    );
  }
  if (plan !== "all") {
    users = users.filter((u) => {
      if (plan === "cortesia") return String(u.plan).startsWith("cortesia");
      return u.plan === plan;
    });
  }
  if (count) count.textContent = users.length + " conta(s)";
  if (!list) return;
  if (!users.length) {
    list.innerHTML = "<p class=\"admin-muted\">Nenhuma conta neste navegador.</p>";
    return;
  }
  list.innerHTML = users.map((u) => {
    const until = u.planUntil
      ? new Date(u.planUntil).toLocaleDateString("pt-BR")
      : "—";
    const created = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString("pt-BR")
      : "—";
    const statusPill = u.status === "pending"
      ? "<span class=\"admin-pill admin-pill--warn\">pendente</span>"
      : "<span class=\"admin-pill\">ativo</span>";
    const invite = typeof aprovaAccessGetInviteForEmail === "function"
      ? aprovaAccessGetInviteForEmail(u.login)
      : null;
    const inviteUrl = invite && typeof aprovaAccessInviteUrl === "function"
      ? aprovaAccessInviteUrl(invite)
      : "";
    return (
      "<article class=\"admin-user-card\">" +
        "<div class=\"admin-user-card-head\">" +
          "<strong>" + adminEscape(u.login) + "</strong>" +
          "<span class=\"admin-pill\">" + adminEscape(adminPlanLabel(u.plan)) + "</span>" +
          statusPill +
        "</div>" +
        "<dl class=\"admin-user-dl\">" +
          "<div><dt>Nome</dt><dd>" + adminEscape(u.name) + "</dd></div>" +
          "<div><dt>Celular</dt><dd>" + adminEscape(u.phone || "—") + "</dd></div>" +
          "<div><dt>Criada</dt><dd>" + created + "</dd></div>" +
          "<div><dt>Validade</dt><dd>" + until + "</dd></div>" +
        "</dl>" +
        "<div class=\"admin-user-actions\">" +
          (u.status === "pending" && inviteUrl
            ? "<button type=\"button\" class=\"btn btn-primary btn-compact\" data-admin-copy-invite=\"" +
                adminEscape(inviteUrl) + "\">Copiar link de cadastro</button>"
            : "") +
          (u.status === "pending"
            ? "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-fill-sync=\"" +
                adminEscape(u.login) + "\">Já cadastrou? Atualizar lista</button>"
            : "") +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-revoke=\"" +
            adminEscape(u.login) + "\">Revogar para Free</button>" +
        "</div>" +
      "</article>"
    );
  }).join("");
}

function adminRenderInvites () {
  const el = document.getElementById("admin-invites-list");
  if (!el) return;
  const list = typeof aprovaAccessListInvites === "function"
    ? aprovaAccessListInvites()
    : [];
  if (!list.length) {
    el.innerHTML = "<p class=\"admin-muted\">Nenhum convite ainda. Liberar acesso acima gera o link.</p>";
    return;
  }
  el.innerHTML = list.map((inv) => {
    const until = inv.planUntil
      ? new Date(inv.planUntil).toLocaleDateString("pt-BR")
      : "—";
    const status = inv.status === "claimed" || inv.status === "active"
      ? "ativo"
      : "pendente";
    const url = typeof aprovaAccessInviteUrl === "function"
      ? aprovaAccessInviteUrl(inv)
      : (inv.token
        ? ("https://www.medhubr1.com.br/cadastro.html?convite=" + encodeURIComponent(inv.token))
        : "");
    return (
      "<article class=\"admin-user-card\">" +
        "<div class=\"admin-user-card-head\">" +
          "<strong>" + adminEscape(inv.email) + "</strong>" +
          "<span class=\"admin-pill\">" + adminEscape(adminPlanLabel(inv.plan)) + "</span>" +
          "<span class=\"admin-pill" + (status === "pendente" ? " admin-pill--warn" : "") + "\">" +
            status + "</span>" +
        "</div>" +
        "<dl class=\"admin-user-dl\">" +
          "<div><dt>Nome</dt><dd>" + adminEscape(inv.name || "(ainda não preencheu)") + "</dd></div>" +
          "<div><dt>Celular</dt><dd>" + adminEscape(inv.phone || "—") + "</dd></div>" +
          "<div><dt>Validade</dt><dd>" + until + "</dd></div>" +
          "<div><dt>Liberado em</dt><dd>" +
            (inv.grantedAt ? new Date(inv.grantedAt).toLocaleString("pt-BR") : "—") +
          "</dd></div>" +
        "</dl>" +
        (url
          ? "<div class=\"admin-user-actions\">" +
              "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-copy-invite=\"" +
                adminEscape(url) + "\">Copiar link</button>" +
            "</div>"
          : "") +
      "</article>"
    );
  }).join("");
}

function adminRenderCoupons () {
  const el = document.getElementById("admin-coupons-list");
  if (!el) return;
  const list = typeof aprovaCouponLoadCatalog === "function"
    ? aprovaCouponLoadCatalog()
    : [];
  if (!list.length) {
    el.innerHTML = "<p class=\"admin-muted\">Nenhum cupom gerado neste aparelho ainda.</p>";
    return;
  }
  el.innerHTML = list.map((c) => {
    const url = typeof aprovaCouponSignupUrl === "function"
      ? aprovaCouponSignupUrl(c.code)
      : (location.origin + "/cadastro.html?cupom=" + encodeURIComponent(c.code));
    const usesLabel = (c.maxUses | 0) > 0
      ? ((c.uses | 0) + " / " + (c.maxUses | 0))
      : String(c.uses | 0);
    return (
      "<article class=\"admin-user-card\">" +
        "<div class=\"admin-user-card-head\">" +
          "<strong>" + adminEscape(c.code) + "</strong>" +
          "<span class=\"admin-pill\">" + adminEscape(adminPlanLabel(c.type)) + "</span>" +
          (c.disabled
            ? "<span class=\"admin-pill admin-pill--warn\">desativado</span>"
            : "") +
        "</div>" +
        "<dl class=\"admin-user-dl\">" +
          "<div><dt>Embaixador</dt><dd>" + adminEscape(c.embassador || "—") + "</dd></div>" +
          "<div><dt>Usos</dt><dd>" + adminEscape(usesLabel) + "</dd></div>" +
          "<div><dt>Criado</dt><dd>" +
            (c.createdAt ? new Date(c.createdAt).toLocaleString("pt-BR") : "—") +
          "</dd></div>" +
        "</dl>" +
        "<div class=\"admin-user-actions\">" +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-copy-coupon=\"" +
            adminEscape(c.code) + "\">Copiar código</button>" +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-copy-invite=\"" +
            adminEscape(url) + "\">Copiar link</button>" +
          (!c.disabled
            ? "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-disable-coupon=\"" +
                adminEscape(c.code) + "\">Desativar</button>"
            : "") +
        "</div>" +
      "</article>"
    );
  }).join("");
}

function adminShowCreatedCoupons (created) {
  const box = document.getElementById("admin-coupon-created");
  const listEl = document.getElementById("admin-coupon-created-list");
  if (!box || !listEl || !created?.length) return;
  box.hidden = false;
  listEl.innerHTML = created.map((c) => {
    const url = typeof aprovaCouponSignupUrl === "function"
      ? aprovaCouponSignupUrl(c.code)
      : (location.origin + "/cadastro.html?cupom=" + encodeURIComponent(c.code));
    return (
      "<article class=\"admin-user-card\">" +
        "<div class=\"admin-user-card-head\">" +
          "<strong>" + adminEscape(c.code) + "</strong>" +
          "<span class=\"admin-pill\">" + adminEscape(adminPlanLabel(c.type)) + "</span>" +
        "</div>" +
        "<div class=\"admin-user-actions\">" +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-copy-coupon=\"" +
            adminEscape(c.code) + "\">Copiar código</button>" +
          "<button type=\"button\" class=\"btn btn-ghost btn-compact\" data-admin-copy-invite=\"" +
            adminEscape(url) + "\">Copiar link</button>" +
        "</div>" +
      "</article>"
    );
  }).join("");
}

function adminEscape (s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

async function adminRenderContent () {
  const el = document.getElementById("admin-content-banks");
  if (!el) return;
  el.textContent = "Carregando…";
  const { banks, total } = await adminFetchBankCounts();
  el.innerHTML =
    "<table class=\"admin-report-table\"><thead><tr><th>Área</th><th>Arquivo</th><th>Questões</th><th>Status</th></tr></thead><tbody>" +
    banks.map((b) =>
      "<tr><td>" + adminEscape(b.label) + "</td><td><code>" + adminEscape(b.file) +
      "</code></td><td>" + b.count + "</td><td>" + (b.ok ? "OK" : "Erro") + "</td></tr>"
    ).join("") +
    "<tr><td colspan=\"2\"><strong>Total</strong></td><td colspan=\"2\"><strong>" + total +
    "</strong></td></tr></tbody></table>";
}

function adminRenderPlans () {
  const el = document.getElementById("admin-plans-list");
  const leadsEl = document.getElementById("admin-trial-leads-list");
  if (leadsEl) {
    const leads = adminLoadJson("medhub-aprova-trial-leads-v1", []);
    const rows = Array.isArray(leads) ? leads : [];
    if (!rows.length) {
      leadsEl.innerHTML = "<p class=\"admin-muted\">Nenhum lead de teste grátis neste navegador ainda.</p>";
    } else {
      leadsEl.innerHTML = rows.map((row) =>
        "<article class=\"admin-user-card\">" +
          "<div class=\"admin-user-card-head\">" +
            "<strong>" + adminEscape(row.name || "—") + "</strong>" +
            "<span class=\"admin-pill\">teste 10d</span>" +
          "</div>" +
          "<dl class=\"admin-user-dl\">" +
            "<div><dt>E-mail</dt><dd>" + adminEscape(row.email || "—") + "</dd></div>" +
            "<div><dt>Celular</dt><dd>" + adminEscape(row.phone || "—") + "</dd></div>" +
            "<div><dt>Entrou em</dt><dd>" +
              (row.at ? new Date(row.at).toLocaleString("pt-BR") : "—") +
            "</dd></div>" +
            "<div><dt>Follow-up</dt><dd>" +
              (row.followUpAt ? new Date(row.followUpAt).toLocaleDateString("pt-BR") : "—") +
            "</dd></div>" +
          "</dl>" +
        "</article>"
      ).join("");
    }
  }
  if (!el) return;
  const interest = adminLoadJson(APROVA_PLAN_INTEREST_KEY, null);
  if (!interest?.plano) {
    el.innerHTML = "<p class=\"admin-muted\">Nenhum clique de plano registrado neste navegador.</p>";
    return;
  }
  el.innerHTML =
    "<div class=\"admin-user-card\">" +
      "<div class=\"admin-user-card-head\"><strong>" + adminEscape(adminPlanLabel(interest.plano)) +
      "</strong><span class=\"admin-pill\">interesse</span></div>" +
      "<p class=\"admin-muted\">Registrado em " +
      (interest.ts ? new Date(interest.ts).toLocaleString("pt-BR") : "—") +
      "</p></div>";
}

function adminExportTrialLeadsCsv () {
  const leads = adminLoadJson("medhub-aprova-trial-leads-v1", []);
  const rows = Array.isArray(leads) ? leads : [];
  const lines = ["name,phone,email,at,followUpAt,source"];
  rows.forEach((row) => {
    lines.push([
      JSON.stringify(row.name || ""),
      JSON.stringify(row.phone || ""),
      JSON.stringify(row.email || ""),
      row.at || "",
      row.followUpAt || "",
      JSON.stringify(row.source || "")
    ].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "medhub-r1-trial-leads.csv";
  a.click();
  URL.revokeObjectURL(url);
  adminPushLog("export_trial_leads", rows.length + " leads");
}

function adminFillMarketing () {
  const m = adminLoadJson(APROVA_ADMIN_MKT_KEY, {});
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || "";
  };
  set("mkt-instagram", m.instagram);
  set("mkt-support", m.support);
  set("mkt-site", m.site);
  set("mkt-pixel", m.pixel);
}

function adminFillSettings () {
  const cfg = adminLoadCfg();
  const owners = document.getElementById("cfg-owners");
  const pin = document.getElementById("cfg-pin");
  if (owners) owners.value = cfg.owners.join("\n");
  if (pin) pin.value = cfg.pin || "";
}

function adminRenderLog () {
  const el = document.getElementById("admin-log-list");
  if (!el) return;
  const list = adminLoadJson(APROVA_ADMIN_LOG_KEY, []);
  if (!list.length) {
    el.innerHTML = "<p class=\"admin-muted\">Sem eventos ainda.</p>";
    return;
  }
  el.innerHTML = list.map((row) =>
    "<div class=\"admin-log-row\">" +
      "<time>" + new Date(row.at).toLocaleString("pt-BR") + "</time>" +
      "<strong>" + adminEscape(row.action) + "</strong>" +
      "<span>" + adminEscape(row.actor) + (row.detail ? " — " + adminEscape(row.detail) : "") + "</span>" +
    "</div>"
  ).join("");
}

function adminExportCsv () {
  const users = adminListUsers();
  const lines = ["login,name,plan,planUntil,createdAt"];
  users.forEach((u) => {
    lines.push([
      u.login,
      JSON.stringify(u.name || ""),
      u.plan || "free",
      u.planUntil || "",
      u.createdAt || ""
    ].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "medhub-r1-users.csv";
  a.click();
  URL.revokeObjectURL(url);
  adminPushLog("export_csv", users.length + " users");
}

function adminGrantAccess (email, name, type, password) {
  void name;
  void password;
  if (typeof aprovaAccessGrantByEmail === "function") {
    const result = aprovaAccessGrantByEmail(email, type);
    if (result.ok) {
      adminPushLog("grant", String(email).toLowerCase() + " → " + type);
    }
    return result;
  }
  return { ok: false, msg: "Módulo de acesso indisponível." };
}

function adminSyncClaimedProfile (email, name, phone) {
  const key = String(email || "").trim().toLowerCase();
  if (!key || !name) return { ok: false, msg: "Informe e-mail e nome." };
  const users = aprovaLoadUsers();
  const invites = typeof aprovaAccessLoadInvites === "function"
    ? aprovaAccessLoadInvites()
    : {};
  const now = Date.now();
  const prev = users[key] || invites[key] || {};
  users[key] = {
    login: key,
    password: users[key]?.password || "",
    name: String(name).trim(),
    phone: String(phone || "").trim(),
    plan: prev.plan || users[key]?.plan || "free",
    planUntil: prev.planUntil != null ? prev.planUntil : (users[key]?.planUntil || null),
    status: users[key]?.password ? "active" : "claimed",
    createdAt: users[key]?.createdAt || prev.createdAt || now,
    grantedAt: users[key]?.grantedAt || prev.grantedAt || now,
    claimedAt: now
  };
  aprovaSaveUsers(users);
  if (typeof aprovaAccessSaveInvites === "function") {
    invites[key] = {
      ...(invites[key] || {}),
      email: key,
      name: users[key].name,
      phone: users[key].phone,
      plan: users[key].plan,
      planUntil: users[key].planUntil,
      status: "claimed",
      grantedAt: users[key].grantedAt,
      claimedAt: now,
      createdAt: invites[key]?.createdAt || now,
      token: invites[key]?.token || null
    };
    aprovaAccessSaveInvites(invites);
  }
  adminPushLog("claim_sync", key);
  return { ok: true, msg: "Lista atualizada com os dados de " + key + "." };
}

function adminRevoke (email) {
  const key = String(email || "").toLowerCase();
  const users = aprovaLoadUsers();
  if (!users[key]) return;
  users[key].plan = "free";
  users[key].planUntil = null;
  users[key].grantedAt = Date.now();
  aprovaSaveUsers(users);
  adminPushLog("revoke", key);
  adminRenderUsers();
}

function adminShowGate () {
  const loginPanel = document.getElementById("admin-login-panel");
  const forbidden = document.getElementById("admin-forbidden-panel");
  const panel = document.getElementById("admin-panel");
  const auth = aprovaLoadAuth();
  const adm = adminGetSessionOk();

  if (adm) {
    adminShow(loginPanel, false);
    adminShow(forbidden, false);
    adminShow(panel, true);
    const signed = document.getElementById("admin-signed-as");
    if (signed) signed.textContent = adm.login;
    const hash = (window.location.hash || "").replace(/^#\/?/, "") || "overview";
    adminGoto(hash);
    return;
  }

  adminShow(panel, false);
  if (auth?.login && !adminIsOwnerEmail(auth.login)) {
    adminShow(loginPanel, false);
    adminShow(forbidden, true);
    const fe = document.getElementById("admin-forbidden-email");
    if (fe) fe.textContent = auth.login;
    return;
  }
  adminShow(forbidden, false);
  adminShow(loginPanel, true);
  if (auth?.login) {
    const email = document.getElementById("admin-email");
    if (email && !email.value) email.value = auth.login;
  }
}

function adminLogout () {
  adminClearSession();
  aprovaSaveAuth(null);
  adminShowGate();
}

function adminBoot () {
  document.getElementById("admin-login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = String(document.getElementById("admin-email")?.value || "").trim();
    const password = String(document.getElementById("admin-password")?.value || "");
    const pin = String(document.getElementById("admin-pin")?.value || "");
    const err = document.getElementById("admin-login-error");
    if (err) err.hidden = true;

    if (!aprovaLogin(email, password)) {
      adminSetStatus("admin-login-error", document.getElementById("auth-msg")?.textContent || "Falha no login.", false);
      // auth.js writes to #auth-msg which may not exist — fallback:
      const users = aprovaLoadUsers();
      const user = users[email.toLowerCase()];
      if (!user) adminSetStatus("admin-login-error", "Conta não encontrada. Cadastre-se no site primeiro.", false);
      else if (user.password !== password) adminSetStatus("admin-login-error", "Senha incorreta.", false);
      return;
    }

    if (!adminIsOwnerEmail(email)) {
      adminShowGate();
      return;
    }

    const cfg = adminLoadCfg();
    if (cfg.pin && pin !== cfg.pin) {
      adminClearSession();
      adminSetStatus("admin-login-error", "PIN admin incorreto.", false);
      return;
    }

    adminStartSession(pin);
    adminPushLog("admin_login", email);
    adminShowGate();
  });

  document.getElementById("admin-logout-btn")?.addEventListener("click", adminLogout);
  document.getElementById("admin-forbidden-logout")?.addEventListener("click", adminLogout);
  document.getElementById("admin-refresh-btn")?.addEventListener("click", () => {
    const hash = (window.location.hash || "").replace(/^#\/?/, "") || "overview";
    adminGoto(hash);
  });
  document.getElementById("admin-export-btn")?.addEventListener("click", adminExportCsv);
  document.getElementById("admin-export-leads-btn")?.addEventListener("click", adminExportTrialLeadsCsv);

  document.getElementById("admin-nav")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-admin-section]");
    if (!btn) return;
    adminGoto(btn.getAttribute("data-admin-section"));
  });

  document.querySelectorAll("[data-admin-goto]").forEach((btn) => {
    btn.addEventListener("click", () => adminGoto(btn.getAttribute("data-admin-goto")));
  });

  document.getElementById("admin-search")?.addEventListener("input", adminRenderUsers);
  document.getElementById("admin-filter-plan")?.addEventListener("change", adminRenderUsers);

  document.getElementById("admin-users-list")?.addEventListener("click", (e) => {
    const copyBtn = e.target.closest("[data-admin-copy-invite]");
    if (copyBtn) {
      const url = copyBtn.getAttribute("data-admin-copy-invite") || "";
      if (!url) return;
      navigator.clipboard?.writeText(url).then(() => {
        adminSetStatus("admin-users-status", "Link copiado (medhubr1.com.br). Envie no WhatsApp.", true);
      }).catch(() => {
        adminSetStatus("admin-users-status", url, true);
      });
      return;
    }
    const syncBtn = e.target.closest("[data-admin-fill-sync]");
    if (syncBtn) {
      const email = syncBtn.getAttribute("data-admin-fill-sync") || "";
      adminGoto("access");
      const emailEl = document.getElementById("claim-sync-email");
      if (emailEl) emailEl.value = email;
      document.getElementById("claim-sync-name")?.focus();
      adminSetStatus(
        "admin-claim-sync-status",
        "Preencha o nome (e celular) que ela usou no celular e confirme. Isso só atualiza a lista deste PC — o plano dela vem do link de convite.",
        true
      );
      return;
    }
    const btn = e.target.closest("[data-admin-revoke]");
    if (!btn) return;
    adminRevoke(btn.getAttribute("data-admin-revoke"));
  });

  document.getElementById("admin-invites-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-admin-copy-invite]");
    if (!btn) return;
    const url = btn.getAttribute("data-admin-copy-invite") || "";
    if (!url) return;
    navigator.clipboard?.writeText(url).then(() => {
      adminSetStatus("admin-grant-status", "Link copiado.", true);
    }).catch(() => {
      adminSetStatus("admin-grant-status", url, true);
    });
  });

  document.getElementById("admin-coupons-list")?.addEventListener("click", (e) => {
    const copyCode = e.target.closest("[data-admin-copy-coupon]");
    if (copyCode) {
      const code = copyCode.getAttribute("data-admin-copy-coupon") || "";
      navigator.clipboard?.writeText(code).then(() => {
        adminSetStatus("admin-coupon-status", "Código copiado: " + code, true);
      }).catch(() => {
        adminSetStatus("admin-coupon-status", code, true);
      });
      return;
    }
    const copyLink = e.target.closest("[data-admin-copy-invite]");
    if (copyLink) {
      const url = copyLink.getAttribute("data-admin-copy-invite") || "";
      navigator.clipboard?.writeText(url).then(() => {
        adminSetStatus("admin-coupon-status", "Link de cadastro copiado.", true);
      }).catch(() => {
        adminSetStatus("admin-coupon-status", url, true);
      });
      return;
    }
    const disableBtn = e.target.closest("[data-admin-disable-coupon]");
    if (disableBtn && typeof aprovaCouponDisable === "function") {
      const code = disableBtn.getAttribute("data-admin-disable-coupon") || "";
      const result = aprovaCouponDisable(code);
      adminSetStatus("admin-coupon-status", result.msg, result.ok);
      if (result.ok) {
        adminPushLog("coupon-disable", code);
        adminRenderCoupons();
      }
    }
  });

  document.getElementById("admin-coupon-created")?.addEventListener("click", (e) => {
    const copyCode = e.target.closest("[data-admin-copy-coupon]");
    if (copyCode) {
      const code = copyCode.getAttribute("data-admin-copy-coupon") || "";
      navigator.clipboard?.writeText(code).then(() => {
        adminSetStatus("admin-coupon-status", "Código copiado: " + code, true);
      }).catch(() => {
        adminSetStatus("admin-coupon-status", code, true);
      });
      return;
    }
    const copyLink = e.target.closest("[data-admin-copy-invite]");
    if (copyLink) {
      const url = copyLink.getAttribute("data-admin-copy-invite") || "";
      navigator.clipboard?.writeText(url).then(() => {
        adminSetStatus("admin-coupon-status", "Link de cadastro copiado.", true);
      }).catch(() => {
        adminSetStatus("admin-coupon-status", url, true);
      });
    }
  });

  document.getElementById("admin-copy-invite")?.addEventListener("click", () => {
    const input = document.getElementById("admin-invite-url");
    const url = input?.value || "";
    if (!url) return;
    navigator.clipboard?.writeText(url).then(() => {
      adminSetStatus("admin-grant-status", "Link copiado. Envie no WhatsApp.", true);
    }).catch(() => {
      input.select();
      adminSetStatus("admin-grant-status", "Selecione e copie o link manualmente.", true);
    });
  });

  document.getElementById("admin-copy-grant-code")?.addEventListener("click", () => {
    const input = document.getElementById("admin-grant-code");
    const code = input?.value || "";
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      adminSetStatus("admin-grant-status", "Cupom copiado: " + code, true);
    }).catch(() => {
      input.select();
      adminSetStatus("admin-grant-status", code, true);
    });
  });

  document.getElementById("grant-type-chips")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-grant-type]");
    if (!chip) return;
    const type = chip.getAttribute("data-grant-type") || "m3";
    const hidden = document.getElementById("grant-type");
    if (hidden) hidden.value = type;
    document.querySelectorAll("#grant-type-chips [data-grant-type]").forEach((btn) => {
      btn.classList.toggle("is-active", btn === chip);
    });
  });

  document.getElementById("coupon-type-chips")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-coupon-type]");
    if (!chip) return;
    const type = chip.getAttribute("data-coupon-type") || "lifetime";
    const hidden = document.getElementById("coupon-type");
    if (hidden) hidden.value = type;
    document.querySelectorAll("#coupon-type-chips [data-coupon-type]").forEach((btn) => {
      btn.classList.toggle("is-active", btn === chip);
    });
  });

  document.getElementById("admin-grant-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = String(document.getElementById("grant-name")?.value || "").trim();
    const type = document.getElementById("grant-type")?.value || "m3";
    if (!name) {
      adminSetStatus("admin-grant-status", "Informe o nome da pessoa.", false);
      return;
    }
    if (typeof aprovaCouponGenerate !== "function") {
      adminSetStatus("admin-grant-status", "Módulo de cupons indisponível.", false);
      return;
    }
    const result = aprovaCouponGenerate({
      type,
      embassador: name,
      qty: 1,
      maxUses: 1
    });
    adminSetStatus(
      "admin-grant-status",
      result.ok
        ? ("Cupom gerado para " + name + ". Envie o link — ela completa o cadastro no celular.")
        : (result.msg || "Não foi possível gerar."),
      result.ok
    );
    const created = result.created && result.created[0];
    const box = document.getElementById("admin-invite-box");
    const urlInput = document.getElementById("admin-invite-url");
    const codeInput = document.getElementById("admin-grant-code");
    const personEl = document.getElementById("admin-grant-person");
    if (result.ok && created && box && urlInput && codeInput) {
      const url = typeof aprovaCouponSignupUrl === "function"
        ? aprovaCouponSignupUrl(created.code)
        : ("https://www.medhubr1.com.br/cadastro.html?cupom=" + encodeURIComponent(created.code));
      box.hidden = false;
      codeInput.value = created.code;
      urlInput.value = url;
      if (personEl) personEl.textContent = name;
      adminPushLog("coupon-grant", name + " → " + type + " " + created.code);
      adminShowCreatedCoupons(result.created || []);
      adminRenderCoupons();
    }
  });

  document.getElementById("admin-coupon-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (typeof aprovaCouponGenerate !== "function") {
      adminSetStatus("admin-coupon-status", "Módulo de cupons indisponível.", false);
      return;
    }
    const type = document.getElementById("coupon-type")?.value || "lifetime";
    const embassador = document.getElementById("coupon-embassador")?.value || "";
    const qty = Number(document.getElementById("coupon-qty")?.value || 1);
    const maxUses = Number(document.getElementById("coupon-max-uses")?.value || 0);
    const result = aprovaCouponGenerate({ type, embassador, qty, maxUses });
    adminSetStatus("admin-coupon-status", result.msg, result.ok);
    if (result.ok) {
      adminPushLog("coupon-generate", type + " x" + (result.created?.length || 0));
      adminShowCreatedCoupons(result.created || []);
      adminRenderCoupons();
    }
  });

  document.getElementById("admin-claim-sync-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("claim-sync-email")?.value || "";
    const name = document.getElementById("claim-sync-name")?.value || "";
    const phone = document.getElementById("claim-sync-phone")?.value || "";
    const result = adminSyncClaimedProfile(email, name, phone);
    adminSetStatus("admin-claim-sync-status", result.msg, result.ok);
    if (result.ok) {
      e.target.reset();
      adminRenderUsers();
      adminRenderInvites();
    }
  });

  document.getElementById("admin-marketing-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      instagram: document.getElementById("mkt-instagram")?.value || "",
      support: document.getElementById("mkt-support")?.value || "",
      site: document.getElementById("mkt-site")?.value || "",
      pixel: document.getElementById("mkt-pixel")?.value || ""
    };
    adminSaveJson(APROVA_ADMIN_MKT_KEY, data);
    adminPushLog("marketing_save", data.site || data.instagram || "");
    adminSetStatus("admin-marketing-status", "Marketing salvo neste dispositivo.", true);
  });

  document.getElementById("admin-settings-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ownersRaw = String(document.getElementById("cfg-owners")?.value || "");
    const owners = ownersRaw.split(/\n+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    const pin = String(document.getElementById("cfg-pin")?.value || "");
    if (!owners.length) {
      adminSetStatus("admin-settings-status", "Informe ao menos um e-mail admin.", false);
      return;
    }
    adminSaveJson(APROVA_ADMIN_CFG_KEY, { owners, pin });
    adminPushLog("settings_save", owners.join(","));
    adminSetStatus("admin-settings-status", "Configurações salvas.", true);
  });

  window.addEventListener("hashchange", () => {
    if (!adminGetSessionOk()) return;
    const hash = (window.location.hash || "").replace(/^#\/?/, "") || "overview";
    adminGoto(hash);
  });

  adminShowGate();
}

document.addEventListener("DOMContentLoaded", adminBoot);
