/** Публичные пути (официальные). Старые URL редиректятся в next.config.mjs */
export const routes = {
  home: "/",
  appointment: "/electronic-appointment",
  appointmentStatus: "/appointment-status",
  evaluation: "/service-evaluation",
  evaluationByCode: (code: string) =>
    `/service-evaluation/${encodeURIComponent(code)}`,
  rules: "/appointment-rules",
  survey: "/survey",
  appointmentStatusByCode: (code: string) =>
    `/appointment-status?code=${encodeURIComponent(code.trim().toUpperCase())}`,
} as const;

const LEGACY_HREF: Record<string, string> = {
  "/book": routes.appointment,
  "/my-appointment": routes.appointmentStatus,
  "/feedback": routes.evaluation,
  "/rules": routes.rules,
  "/process": routes.home,
};

/** Старые пути из CMS / уведомлений → актуальные. */
export function canonicalPublicHref(href: string): string {
  if (LEGACY_HREF[href]) return LEGACY_HREF[href];
  if (href.startsWith("/feedback/")) {
    return `${routes.evaluation}${href.slice("/feedback".length)}`;
  }
  return href;
}
