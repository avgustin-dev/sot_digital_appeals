import { mergeServiceContent } from "./serviceContent";
import { leadershipDayWindows } from "./leadershipSchedule";
import type { CalendarSettings, LeadershipPerson, ServiceContent } from "./types";
import { getDay, parseISO } from "date-fns";

/**
 * Окно приёма конкретного лица (график sot.kg).
 * "calendar" — общие дни/часы из настроек платформы (приёмная, иной зам.).
 */
export type TargetWindow =
  | { kind: "fixed"; weekdays: number[]; startMinutes: number; endMinutes: number }
  | { kind: "calendar" };

export const TARGET_WINDOWS: Record<string, TargetWindow> = {
  reception: { kind: "calendar" },
};

function peopleOf(sc?: ServiceContent | null): LeadershipPerson[] {
  return mergeServiceContent(sc).leadership;
}

export function resolveTargetWindow(
  targetId: string,
  calendar: CalendarSettings,
  sc?: ServiceContent | null
): { weekdays: number[]; startMinutes: number; endMinutes: number } {
  const person = peopleOf(sc).find((p) => p.id === targetId);
  if (person) {
    if (person.windowKind === "calendar") {
      return {
        weekdays: calendar.receptionWeekdays,
        startMinutes: calendar.dayStartMinutes,
        endMinutes: calendar.dayEndMinutes,
      };
    }
    const windows = leadershipDayWindows(person);
    return {
      weekdays: windows.length
        ? windows.map((w) => w.weekday)
        : calendar.receptionWeekdays,
      startMinutes: windows[0]?.startMinutes ?? calendar.dayStartMinutes,
      endMinutes: windows[0]?.endMinutes ?? calendar.dayEndMinutes,
    };
  }
  const w = TARGET_WINDOWS[targetId] ?? { kind: "calendar" as const };
  if (w.kind === "calendar") {
    return {
      weekdays: calendar.receptionWeekdays,
      startMinutes: calendar.dayStartMinutes,
      endMinutes: calendar.dayEndMinutes,
    };
  }
  return {
    weekdays: w.weekdays,
    startMinutes: w.startMinutes,
    endMinutes: w.endMinutes,
  };
}

/** Окно слотов на конкретную дату (у личного графика время может отличаться по дням). */
export function resolveTargetWindowForDate(
  targetId: string,
  dateStr: string,
  calendar: CalendarSettings,
  sc?: ServiceContent | null
): { weekdays: number[]; startMinutes: number; endMinutes: number } {
  const base = resolveTargetWindow(targetId, calendar, sc);
  const person = peopleOf(sc).find((p) => p.id === targetId);
  if (!person || person.windowKind === "calendar" || !dateStr) return base;
  const dow = getDay(parseISO(dateStr));
  const hit = leadershipDayWindows(person).find((w) => w.weekday === dow);
  if (!hit) return base;
  return {
    weekdays: base.weekdays,
    startMinutes: hit.startMinutes,
    endMinutes: hit.endMinutes,
  };
}

export function bookableTargets(sc?: ServiceContent | null): LeadershipPerson[] {
  return peopleOf(sc).filter((p) => p.bookable);
}

export function targetLabel(id: string, isKy = false, sc?: ServiceContent | null): string {
  const row = peopleOf(sc).find((r) => r.id === id);
  if (!row) return id;
  return isKy
    ? row.bookLabelKy || row.fullNameKy || row.bookLabelRu
    : row.bookLabelRu || row.fullNameRu || row.bookLabelKy;
}

export function targetShort(id: string, isKy = false, sc?: ServiceContent | null): string {
  const row = peopleOf(sc).find((r) => r.id === id);
  if (!row) return id;
  return isKy
    ? row.shortKy || row.fullNameKy || row.shortRu
    : row.shortRu || row.fullNameRu || row.shortKy;
}
