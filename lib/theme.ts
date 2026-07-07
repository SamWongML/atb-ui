// Theme utility. The whole tree is CSS variables swapped on `data-theme`
// (README.md §Interactions), so theming is: set the attribute, persist the
// choice. Dark is the default; light is opt-in and remembered.

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "atb-theme";

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

/** The persisted choice, or null if none/invalid. */
export function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/** The theme to render on load: the stored choice, else the default. */
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? DEFAULT_THEME;
}

/** The theme currently applied to the document, falling back to the resolved initial. */
export function getCurrentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  return isTheme(attr) ? attr : resolveInitialTheme();
}

/** Apply a theme to the document root (re-themes the whole tree via CSS vars). */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Apply a theme and persist it for next load. */
export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable (private mode / SSR) — the applied theme still holds.
  }
}

/** Flip between dark and light, persist, and return the new theme. */
export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/**
 * Blocking inline script for <head> that applies the stored theme before first
 * paint (no flash of the wrong theme). It runs before hydration, so it cannot
 * import this module — the logic is intentionally mirrored here as a string.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:${JSON.stringify(
  DEFAULT_THEME,
)});}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(
  DEFAULT_THEME,
)});}})();`;
