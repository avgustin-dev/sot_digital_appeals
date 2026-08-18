const KEY = "vs-kr-access-token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, token);
}

export function clearAccessToken() {
  setAccessToken(null);
}
