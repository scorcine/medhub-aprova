/* Tema claro / escuro — persiste em localStorage */

const APROVA_THEME_KEY = "medhub-aprova-theme";

function aprovaGetTheme () {
  const saved = localStorage.getItem(APROVA_THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function aprovaApplyTheme (theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(APROVA_THEME_KEY, next);

  const toLight = next === "dark";
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.setAttribute("aria-label", toLight ? "Ativar modo claro" : "Ativar modo escuro");
    btn.setAttribute("title", toLight ? "Modo claro" : "Modo escuro");
    btn.setAttribute("aria-pressed", String(next === "dark"));
  });
}

function aprovaToggleTheme () {
  const current = document.documentElement.getAttribute("data-theme") || aprovaGetTheme();
  aprovaApplyTheme(current === "dark" ? "light" : "dark");
}

function aprovaBootTheme () {
  aprovaApplyTheme(aprovaGetTheme());
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.addEventListener("click", aprovaToggleTheme);
  });
}

document.addEventListener("DOMContentLoaded", aprovaBootTheme);
