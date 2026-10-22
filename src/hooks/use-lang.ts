import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STRINGS, type Lang, type Strings } from "@/lib/i18n";

const STORAGE_KEY = "blo-lang";

function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "fr" ? v : null;
  } catch {
    // Private mode / storage disabled — the app opens in English.
    return null;
  }
}

/**
 * The interface language, persisted per browser under `blo-lang`.
 *
 * English until someone picks French, and then French on that device from
 * then on. It does NOT follow the browser's language the way the theme follows
 * the OS: the app has always opened in English, and a crew's screen changing
 * language on its own would be a surprise nobody asked for.
 *
 * Read synchronously in the initialiser, so a French choice paints French on
 * the first frame rather than flashing English while an effect catches up.
 */
export function useLangState(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => storedLang() ?? "en");

  useEffect(() => {
    const t = STRINGS[lang];
    document.documentElement.lang = t.htmlLang;
    // Swap only the language's part of the title, so the [TEST] prefix the
    // /test/ build puts in front of it survives the switch.
    const other = STRINGS[lang === "en" ? "fr" : "en"].titleSuffix;
    if (document.title.includes(other)) {
      document.title = document.title.replace(other, t.titleSuffix);
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Not fatal: the language still applies for this session.
    }
    setLangState(l);
  }, []);

  return [lang, setLang];
}

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export const useLang = () => useContext(LangContext);

/** The current language's strings. */
export const useT = (): Strings => STRINGS[useContext(LangContext).lang];
