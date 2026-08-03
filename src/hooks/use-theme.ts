import { useCallback, useEffect, useState } from "react";

export type Theme = "day" | "night";

const STORAGE_KEY = "blo-theme";

function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "day" || v === "night" ? v : null;
  } catch {
    // Private mode / storage disabled — fall back to the system preference.
    return null;
  }
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "night");
}

/**
 * Day/night theme, persisted per browser. The initial value is resolved by the
 * inline script in index.html so the first paint is already correct; this hook
 * reads back what that script decided rather than guessing again.
 */
export function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "night"
      : "day",
  );

  useEffect(() => {
    apply(theme);
  }, [theme]);

  // Follow the OS until the user expresses a preference of their own.
  useEffect(() => {
    if (storedTheme() !== null) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setThemeState(mq.matches ? "night" : "day");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // Not fatal: the theme still applies for this session.
    }
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "night" ? "day" : "night";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // as above
      }
      return next;
    });
  }, []);

  return [theme, setTheme, toggle];
}
