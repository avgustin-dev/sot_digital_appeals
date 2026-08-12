import {
  addDays,
  format,
  getDay,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
} from "date-fns";
import type { Appointment, CalendarSettings, TimeSlot } from "./types";

/** Минуты → "HH:mm" */
export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Слоты по схеме из рукописи:
 * 08:00–08:20, 08:25–08:45, 08:50–09:10, …
 * (20 мин приём + 5 мин пауза)
 */
export function generateDaySlots(settings: CalendarSettings): TimeSlot[] {
  const {
    dayStartMinutes,
    dayEndMinutes,
    slotDurationMinutes,
    breakMinutes,
  } = settings;
  const slots: TimeSlot[] = [];
  let cursor = dayStartMinutes;

  while (cursor + slotDurationMinutes <= dayEndMinutes) {
    const start = minutesToTime(cursor);
    const end = minutesToTime(cursor + slotDurationMinutes);
    slots.push({
      start,
      end,
      label: `${start} – ${end}`,
    });
    cursor += slotDurationMinutes + breakMinutes;
  }

  return slots;
}

export function isReceptionDate(
  dateStr: string,
  settings: CalendarSettings
): boolean {
  if (settings.closedDates.includes(dateStr)) return false;
  if (settings.extraOpenDates.includes(dateStr)) return true;
  const d = parseISO(dateStr);
  return settings.receptionWeekdays.includes(getDay(d));
}

export function listAvailableDates(
  settings: CalendarSettings,
  from: Date = new Date()
): string[] {
  const dates: string[] = [];
  const start = startOfDay(from);
  for (let i = 0; i <= settings.bookingHorizonDays; i++) {
    const day = addDays(start, i);
    // нельзя записаться «на вчера»; на сегодня — только если есть свободные слоты (фильтруем отдельно)
    if (isBefore(day, start) && !isEqual(day, start)) continue;
    const key = format(day, "yyyy-MM-dd");
    if (isReceptionDate(key, settings)) dates.push(key);
  }
  return dates;
}

export function getBookedSlotKeys(
  appointments: Appointment[],
  date: string,
  excludeId?: string
): Set<string> {
  const set = new Set<string>();
  for (const a of appointments) {
    if (a.date !== date) continue;
    if (a.status === "cancelled") continue;
    if (excludeId && a.id === excludeId) continue;
    set.add(a.slotStart);
  }
  return set;
}

export function getAvailableSlotsForDate(
  date: string,
  settings: CalendarSettings,
  appointments: Appointment[],
  excludeAppointmentId?: string
): TimeSlot[] {
  if (!isReceptionDate(date, settings)) return [];
  const booked = getBookedSlotKeys(appointments, date, excludeAppointmentId);
  const today = format(new Date(), "yyyy-MM-dd");
  const nowMinutes =
    new Date().getHours() * 60 + new Date().getMinutes();

  return generateDaySlots(settings).filter((slot) => {
    if (booked.has(slot.start)) return false;
    if (date === today && timeToMinutes(slot.start) <= nowMinutes) return false;
    return true;
  });
}

/** Отображение даты: дд.мм.гггг (формат КР, не гггг-мм-дд) */
export function formatDateRu(dateStr: string): string {
  if (!dateStr) return "";
  // already display?
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  const d = parseISO(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return format(d, "dd.MM.yyyy");
}

/** ISO yyyy-MM-dd → дд.мм.гггг */
export function isoToDisplay(iso: string): string {
  return formatDateRu(iso);
}

/**
 * дд.мм.гггг или дд.мм.гг → ISO yyyy-MM-dd
 * Внутреннее хранение остаётся ISO; на экране — только display.
 */
export function displayToIso(input: string): string | null {
  const s = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (!m) return null;
  let [, dd, mm, yy] = m;
  if (yy.length === 2) yy = `20${yy}`;
  const d = parseInt(dd, 10);
  const mo = parseInt(mm, 10);
  const y = parseInt(yy, 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const check = parseISO(iso);
  if (Number.isNaN(check.getTime())) return null;
  return iso;
}

/** Список времён 24ч (без AM/PM) для select */
export function generateTimeOptions(
  fromMinutes = 0,
  toMinutes = 24 * 60,
  step = 5
): string[] {
  const out: string[] = [];
  for (let m = fromMinutes; m < toMinutes; m += step) {
    out.push(minutesToTime(m));
  }
  return out;
}

/** Разбор списка дат из поля (дд.мм.гггг или ISO) */
export function parseDateList(s: string): string[] {
  return s
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => displayToIso(x))
    .filter((x): x is string => Boolean(x));
}

export function formatDateList(isos: string[]): string {
  return isos.map(isoToDisplay).join(", ");
}

export function weekdayRu(
  dateStr: string,
  names?: readonly string[]
): string {
  const fallback = [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
  ];
  return (names || fallback)[getDay(parseISO(dateStr))];
}
