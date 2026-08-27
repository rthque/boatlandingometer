import { useCallback, useEffect, useState } from "react";

export type Theme = "day" | "night";

const STORAGE_KEY = "blo-theme";

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "night");
}

/**
 * Day/night theme, persisted per browser.
 *
 * Day is the default and nothing infers it: the theme changes only when the
 * toggle is used. The OS `prefers-color-scheme` is deliberately ignored, here
 * and in the inline script — most systems flip themselves to dark in the
 * evening, which meant the app appeared to choose its own theme by the hour.
 *
 * The initial value is resolved by that inline script in index.html so the
 * first paint is already correct; this hook reads back what it decided rather
 * than guessing again.
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
