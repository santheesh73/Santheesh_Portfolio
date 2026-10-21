export type Theme = "light" | "dark";

/** localStorage key; read before paint by the boot script in `app/layout.tsx`. */
export const THEME_KEY = "ss-theme";
const EVENT = "ss-themechange";
const DARK = "(prefers-color-scheme: dark)";

/** The theme in effect: the stored choice, else the system preference. */
export function currentTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return window.matchMedia(DARK).matches ? "dark" : "light";
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Calls `cb` when the theme changes, from the toggle or from the system. */
export function onThemeChange(cb: () => void): () => void {
  const mq = window.matchMedia(DARK);
  window.addEventListener(EVENT, cb);
  mq.addEventListener("change", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    mq.removeEventListener("change", cb);
  };
}
