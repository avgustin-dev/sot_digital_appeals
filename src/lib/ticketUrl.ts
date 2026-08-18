import { routes } from "./routes";
import { env } from "@/config/env";

/** Путь статуса записи с подставленным кодом (для QR, писем, кнопок). PIN в ссылку не входит. */
export function appointmentStatusHref(code?: string) {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return routes.appointmentStatus;
  return `${routes.appointmentStatus}?code=${encodeURIComponent(trimmed)}`;
}

export function evaluationHref(code?: string) {
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return routes.evaluation;
  return routes.evaluationByCode(trimmed);
}

/** Абсолютный URL для QR. Камера телефона открывает страницу статуса. */
export function ticketQrValue(code: string) {
  const path = appointmentStatusHref(code);
  if (env.siteUrl) return `${env.siteUrl}${path}`;
  if (typeof window !== "undefined") return `${window.location.origin}${path}`;
  return path;
}
