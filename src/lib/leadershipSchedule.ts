import type {
  CalendarSettings,
  LeadershipDayWindow,
  LeadershipPerson,
} from "./types";

const DAY_RU = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];
const DAY_KY = [
  "жекшемби",
  "дүйшөмбү",
  "шейшемби",
  "шаршемби",
  "бейшемби",
  "жума",
  "ишемби",
];

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function hm(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeRange(start: number, end: number) {
  return `${hm(start)}–${hm(end)}`;
}

function weekdaySortKey(d: number) {
  return d === 0 ? 7 : d;
}

/** Окна личного графика. Старые записи без dayWindows → одно время на все weekdays. */
export function leadershipDayWindows(
  person: Pick<
    LeadershipPerson,
    "weekdays" | "startMinutes" | "endMinutes" | "dayWindows"
  >
): LeadershipDayWindow[] {
  if (person.dayWindows?.length) {
    return [...person.dayWindows].sort(
      (a, b) => weekdaySortKey(a.weekday) - weekdaySortKey(b.weekday)
    );
  }
  const days = person.weekdays?.length ? person.weekdays : [];
  return days
    .map((weekday) => ({
      weekday,
      startMinutes: person.startMinutes,
      endMinutes: person.endMinutes,
    }))
    .sort((a, b) => weekdaySortKey(a.weekday) - weekdaySortKey(b.weekday));
}

export function withLeadershipSchedule(
  person: LeadershipPerson,
  windows: LeadershipDayWindow[]
): LeadershipPerson {
  const dayWindows = [...windows].sort(
    (a, b) => weekdaySortKey(a.weekday) - weekdaySortKey(b.weekday)
  );
  return {
    ...person,
    dayWindows,
    weekdays: dayWindows.map((w) => w.weekday),
    startMinutes: dayWindows[0]?.startMinutes ?? person.startMinutes,
    endMinutes: dayWindows[0]?.endMinutes ?? person.endMinutes,
  };
}

/** Окна, которые реально действуют: личный график или общий график приёма. */
export function receptionWindowsForPerson(
  person: Pick<
    LeadershipPerson,
    "windowKind" | "weekdays" | "startMinutes" | "endMinutes" | "dayWindows"
  >,
  calendar: CalendarSettings
): LeadershipDayWindow[] {
  if (person.windowKind === "calendar") {
    return (calendar.receptionWeekdays ?? [])
      .map((weekday) => ({
        weekday,
        startMinutes: calendar.dayStartMinutes,
        endMinutes: calendar.dayEndMinutes,
      }))
      .sort((a, b) => weekdaySortKey(a.weekday) - weekdaySortKey(b.weekday));
  }
  const own = leadershipDayWindows(person);
  if (own.length) return own;
  return [];
}

/** Подписи дня и времени для сайта — из графика приёма, не из свободного текста. */
export function leadershipScheduleLabels(
  person: Pick<
    LeadershipPerson,
    "windowKind" | "weekdays" | "startMinutes" | "endMinutes" | "dayWindows"
  >,
  calendar: CalendarSettings
): Pick<LeadershipPerson, "weekdayRu" | "weekdayKy" | "timeRu" | "timeKy"> {
  const windows = receptionWindowsForPerson(person, calendar);
  const weekdayRu = windows.map((w) => cap(DAY_RU[w.weekday] || "")).join(", ");
  const weekdayKy = windows.map((w) => cap(DAY_KY[w.weekday] || "")).join(", ");
  const noteRu = " (согласно предварительной записи)";
  const noteKy = " (алдын ала жазылуу боюнча)";

  if (!windows.length) {
    return {
      weekdayRu: weekdayRu || "По графику приёма",
      weekdayKy: weekdayKy || "Кабыл алуу графиги боюнча",
      timeRu: "По графику приёма",
      timeKy: "Кабыл алуу графиги боюнча",
    };
  }

  const same = windows.every(
    (w) =>
      w.startMinutes === windows[0].startMinutes &&
      w.endMinutes === windows[0].endMinutes
  );
  if (same) {
    const t = timeRange(windows[0].startMinutes, windows[0].endMinutes);
    return {
      weekdayRu,
      weekdayKy,
      timeRu: `${t}${noteRu}`,
      timeKy: `${t}${noteKy}`,
    };
  }

  return {
    weekdayRu,
    weekdayKy,
    timeRu: windows
      .map((w) => `${DAY_RU[w.weekday]} ${timeRange(w.startMinutes, w.endMinutes)}`)
      .join("; "),
    timeKy: windows
      .map((w) => `${DAY_KY[w.weekday]} ${timeRange(w.startMinutes, w.endMinutes)}`)
      .join("; "),
  };
}

export function withScheduleLabels(
  person: LeadershipPerson,
  calendar: CalendarSettings
): LeadershipPerson {
  return { ...person, ...leadershipScheduleLabels(person, calendar) };
}
