import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { CONTENT, UI } from "./locales";

const LANG_KEY = "finhabit_lang";

const fallback = UI.en;

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

const LangCtx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "id" || saved === "en") return saved;
    } catch {
      /* abaikan */
    }
    return "id";
  });

  const setLang = useCallback((l) => {
    const next = l === "id" ? "id" : "en";
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* abaikan */
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      if (!key) return "";
      const table = UI[lang] || fallback;
      let s = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : fallback[key];
      if (s == null) return key;
      return interpolate(s, vars);
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      content: CONTENT[lang] || CONTENT.en,
      categoryInfo: (id) => {
        const cats = (CONTENT[lang] || CONTENT.en).EXPENSE_CATEGORIES;
        return cats.find((c) => c.id === id) || cats.find((c) => c.id === "other");
      }
    }),
    [lang, setLang, t]
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useI18n = () => useContext(LangCtx);