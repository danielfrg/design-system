export const themes = [
  { value: "ui-sdk", label: "ui-sdk" },
  { value: "cadence", label: "cadence" },
] as const;

export type Theme = (typeof themes)[number]["value"];

export function currentTheme(): Theme {
  const value = document.documentElement.getAttribute("data-theme");
  return themes.some((t) => t.value === value) ? (value as Theme) : "ui-sdk";
}

// Swaps the theme's two stylesheets that index.html added.
export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  for (const link of document.querySelectorAll<HTMLLinkElement>("link[data-theme-file]")) {
    link.href = `v1/${theme}/${link.dataset.themeFile}.css`;
  }
  try {
    localStorage.setItem("gallery-theme", theme);
  } catch {
    // Private windows can refuse storage; the theme still applies for this visit.
  }
}
