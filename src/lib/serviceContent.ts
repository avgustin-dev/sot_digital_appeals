import { canonicalPublicHref } from "./routes";
import {
  leadershipDayWindows,
  withLeadershipSchedule,
} from "./leadershipSchedule";
import type {
  BookingRulesContent,
  CourtContactsContent,
  LeadershipPerson,
  ServiceContent,
} from "./types";

const EMPTY_CONTACTS: CourtContactsContent = {
  trustPhone: "",
  trustPhoneTel: "",
  addressRu: "",
  addressKy: "",
  receptionOfficeRu: "",
  receptionOfficeKy: "",
  sourceNoteRu: "",
  sourceNoteKy: "",
  scheduleFootnoteRu: "",
  scheduleFootnoteKy: "",
};

const EMPTY_RULES: BookingRulesContent = {
  titleRu: "",
  titleKy: "",
  welcomeRu: "",
  welcomeKy: "",
  rulesRu: [],
  rulesKy: [],
  cannotTitleRu: "",
  cannotTitleKy: "",
  cannotRu: [],
  cannotKy: [],
  deleteNoteRu: "",
  deleteNoteKy: "",
  agreeRu: "",
  agreeKy: "",
};

/** Пустой CMS: ничего не подставляем из шаблонов. */
export function defaultServiceContent(): ServiceContent {
  return {
    orgNameRu: "",
    orgNameKy: "",
    appNameRu: "",
    appNameKy: "",
    navBookCtaRu: "",
    navBookCtaKy: "",
    headerNav: [],
    hubNav: [],
    footerReceptionRu: "",
    footerReceptionKy: "",
    footerDisclaimerRu: "",
    footerDisclaimerKy: "",
    footerIndependenceRu: "",
    footerIndependenceKy: "",
    footerNoCasesRu: "",
    footerNoCasesKy: "",
    footerCitizensRu: "",
    footerCitizensKy: "",
    footerHelpRu: "",
    footerHelpKy: "",
    footerImportantRu: "",
    footerImportantKy: "",
    hubKickerRu: "",
    hubKickerKy: "",
    hubTitleRu: "",
    hubTitleKy: "",
    hubLeadRu: "",
    hubLeadKy: "",
    hubCtaRu: "",
    hubCtaKy: "",
    memoTitleRu: "",
    memoTitleKy: "",
    memoItemsRu: [],
    memoItemsKy: [],
    allowedTitleRu: "",
    allowedTitleKy: "",
    forbiddenTitleRu: "",
    forbiddenTitleKy: "",
    allowedRu: [],
    allowedKy: [],
    forbiddenRu: [],
    forbiddenKy: [],
    cycleTitleRu: "",
    cycleTitleKy: "",
    cycleLeadRu: "",
    cycleLeadKy: "",
    bookTitleRu: "",
    bookTitleKy: "",
    bookSubtitleRu: "",
    bookSubtitleKy: "",
    bookTargetHintRu: "",
    bookTargetHintKy: "",
    contacts: { ...EMPTY_CONTACTS },
    leadership: [],
    processNoticeRu: "",
    processNoticeKy: "",
    processSteps: [],
    rules: { ...EMPTY_RULES, rulesRu: [], rulesKy: [], cannotRu: [], cannotKy: [] },
  };
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
 * Пустые строки и пустые списки из админки не заполняются шаблоном.
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
