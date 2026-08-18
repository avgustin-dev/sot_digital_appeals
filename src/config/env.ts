/**
 * Среда фронта. Бэкенд подключается через NEXT_PUBLIC_API_URL.
 * Пока URL пуст — работает локальный контур (Zustand).
 */
export const env = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, ""),
  demo:
    process.env.NEXT_PUBLIC_DEMO === "true" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.NEXT_PUBLIC_DEMO !== "false"),
} as const;

export const useRemoteApi = Boolean(env.apiUrl);
