import { env } from "@/config/env";
import { getAccessToken } from "./session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  if (!env.apiUrl) {
    throw new ApiError(503, "API не задан (NEXT_PUBLIC_API_URL)");
  }

  const { json, headers, ...rest } = init;
  const token = getAccessToken();
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const body = (await res.json()) as {
        message?: string;
        error?: string;
        code?: string;
      };
      message = body.message || body.error || message;
      code = body.code;
    } catch {
      /* empty */
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
