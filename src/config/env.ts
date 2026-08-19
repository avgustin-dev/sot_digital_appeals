/**
 * Среда фронта. Бэкенд подключается через NEXT_PUBLIC_API_URL.
 * Без URL — локальный контур (Zustand) и учебные данные, в том числе на Vercel.
 */
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export const env = {
  apiUrl,
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, ""),
  demo:
    process.env.NEXT_PUBLIC_DEMO === "true" ||
    (!apiUrl && process.env.NEXT_PUBLIC_DEMO !== "false"),
} as const;

export const useRemoteApi = Boolean(env.apiUrl);
