import { catalog } from "./catalog";

export type UiLang = "ru" | "ky";

export function isUiLang(value: string | undefined | null): value is UiLang {
  return value === "ru" || value === "ky";
}

export function pickShell(lang: UiLang, ru: string, ky?: string) {
  return lang === "ky" ? ky || ru : ru || ky || "";
}

export function shellLangFromCookie(raw: string | undefined): UiLang {
  return isUiLang(raw) ? raw : "ky";
}

export function shellNotFound(lang: UiLang) {
  const c = catalog.shell.notFound;
  return {
    code: c.code,
    title: pickShell(lang, c.titleRu, c.titleKy),
    body: pickShell(lang, c.bodyRu, c.bodyKy),
    home: pickShell(lang, c.homeRu, c.homeKy),
    book: pickShell(lang, c.bookRu, c.bookKy),
  };
}

export function shellError(lang: UiLang) {
  const c = catalog.shell.error;
  return {
    title: pickShell(lang, c.titleRu, c.titleKy),
    body: pickShell(lang, c.bodyRu, c.bodyKy),
    retry: pickShell(lang, c.retryRu, c.retryKy),
    home: pickShell(lang, c.homeRu, c.homeKy),
  };
}
