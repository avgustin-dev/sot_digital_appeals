import { catalog, cloneCatalog } from "./catalog";
import { canonicalPublicHref } from "./routes";
import {
  leadershipDayWindows,
  withLeadershipSchedule,
} from "./leadershipSchedule";
import type { LeadershipPerson, ServiceContent } from "./types";

export function defaultServiceContent(): ServiceContent {
  return cloneCatalog(catalog.site);
}

function normalizeNav<T extends { href: string }>(items: T[]): T[] {
  return items
    .filter((i) => i.href !== "/process")
    .map((i) => ({ ...i, href: canonicalPublicHref(i.href) }));
}

type LegacyFooter = {
  footerDemoRu?: string;
  footerDemoKy?: string;
};

/** Шаблон только если поля нет (undefined). Пустая строка из админки сохраняется. */
function filled<T>(value: T | undefined | null, fallback: T): T {
  return value === undefined || value === null ? fallback : value;
}

function normalizeLeadershipPerson(
  p: Partial<LeadershipPerson>
): LeadershipPerson {
  const merged: LeadershipPerson = {
    id: p.id || "",
    fullNameRu: p.fullNameRu ?? "",
    fullNameKy: p.fullNameKy ?? "",
    positionRu: p.positionRu ?? "",
    positionKy: p.positionKy ?? "",
    weekdayRu: p.weekdayRu ?? "",
    weekdayKy: p.weekdayKy ?? "",
    timeRu: p.timeRu ?? "",
    timeKy: p.timeKy ?? "",
    shortRu: p.shortRu ?? "",
    shortKy: p.shortKy ?? "",
    bookLabelRu: p.bookLabelRu ?? "",
    bookLabelKy: p.bookLabelKy ?? "",
    showInSchedule: p.showInSchedule ?? true,
    bookable: p.bookable ?? true,
    windowKind: p.windowKind ?? "calendar",
    weekdays: Array.isArray(p.weekdays) ? p.weekdays : [],
    startMinutes: p.startMinutes ?? 8 * 60,
    endMinutes: p.endMinutes ?? 12 * 60,
    dayWindows: Array.isArray(p.dayWindows) ? p.dayWindows : undefined,
  };
  return withLeadershipSchedule(merged, leadershipDayWindows(merged));
}

/**
 * CMS / bootstrap — источник истины.
 * JSON из content/ заполняет только отсутствующие ключи (старый бэк, первый кадр).
 * Не подставляет шаблон поверх пустых строк и не копирует ФИО из site.json.
 */
export function mergeServiceContent(
  partial?: Partial<ServiceContent> | null
): ServiceContent {
  const d = defaultServiceContent();
  if (!partial) return d;
  const legacy = partial as Partial<ServiceContent> & LegacyFooter;
  return {
    ...d,
    ...partial,
    footerDisclaimerRu: filled(
      legacy.footerDisclaimerRu ?? legacy.footerDemoRu,
      d.footerDisclaimerRu
    ),
    footerDisclaimerKy: filled(
      legacy.footerDisclaimerKy ?? legacy.footerDemoKy,
      d.footerDisclaimerKy
    ),
    rules: { ...d.rules, ...(partial.rules ?? {}) },
    contacts: { ...d.contacts, ...(partial.contacts ?? {}) },
    headerNav: normalizeNav(
      Array.isArray(partial.headerNav) ? partial.headerNav : d.headerNav
    ),
    hubNav: normalizeNav(
      Array.isArray(partial.hubNav) ? partial.hubNav : d.hubNav
    ),
    leadership: Array.isArray(partial.leadership)
      ? partial.leadership.map((p) => normalizeLeadershipPerson(p))
      : d.leadership,
    processSteps: Array.isArray(partial.processSteps)
      ? partial.processSteps
      : d.processSteps,
    memoItemsRu: filled(partial.memoItemsRu, d.memoItemsRu),
    memoItemsKy: filled(partial.memoItemsKy, d.memoItemsKy),
    allowedRu: filled(partial.allowedRu, d.allowedRu),
    allowedKy: filled(partial.allowedKy, d.allowedKy),
    forbiddenRu: filled(partial.forbiddenRu, d.forbiddenRu),
    forbiddenKy: filled(partial.forbiddenKy, d.forbiddenKy),
  };
}

export function pickLocale(
  isKy: boolean,
  ru: string | undefined,
  ky: string | undefined
): string {
  if (isKy) return (ky || ru || "").trim();
  return (ru || ky || "").trim();
}
