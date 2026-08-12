"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ru } from "@/locales/ru";
import { ky } from "@/locales/ky";
import type { Dict } from "@/locales/types";

export type Lang = "ru" | "ky";

const LANG_KEY = "vs-kr-lang";

const dicts: Record<Lang, Dict> = {
  ru: ru as unknown as Dict,
  ky,
};

type I18nApi = {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
  ready: boolean;
};

const I18nContext = createContext<I18nApi | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as Lang | null;
      if (saved === "ru" || saved === "ky") setLangState(saved);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang === "ky" ? "ky" : "ru";
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, ready]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const value = useMemo(
    () => ({ lang, t: dicts[lang], setLang, ready }),
    [lang, setLang, ready]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
