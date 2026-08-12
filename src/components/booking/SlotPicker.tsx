"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import {
  formatDateRu,
  getAvailableSlotsForDate,
  isReceptionDate,
  listAvailableDates,
  minutesToTime,
  weekdayRu,
} from "@/lib/slots";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Строгий календарь записи (гос.стиль, удобный):
 * слева — месяц, справа — слоты; без «стартап»-декора.
 */
export function SlotPicker({
  date,
  slotStart,
  onDateChange,
  onSlotChange,
  excludeAppointmentId,
}: {
  date: string;
  slotStart: string;
  onDateChange: (d: string) => void;
  onSlotChange: (start: string, end: string) => void;
  excludeAppointmentId?: string;
}) {
  const { state, ready } = useStore();
  const { t, lang } = useI18n();
  const c = t.calendar;
  const isKy = lang === "ky";

  const availableSet = useMemo(() => {
    if (!ready) return new Set<string>();
    return new Set(listAvailableDates(state.calendar));
  }, [ready, state.calendar]);

  const initialMonth = date
    ? startOfMonth(parseISO(date))
    : startOfMonth(new Date());
  const [month, setMonth] = useState(initialMonth);

  const slots = useMemo(
    () =>
      ready && date
        ? getAvailableSlotsForDate(
            date,
            state.calendar,
            state.appointments,
            excludeAppointmentId
          )
        : [],
    [date, state.calendar, state.appointments, excludeAppointmentId, ready]
  );

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const today = startOfDay(new Date());
  const monthLabel = `${c.months[month.getMonth()]} ${month.getFullYear()}`;
  const selectedSlot = slots.find((s) => s.start === slotStart);

  function dayStatus(d: Date): "open" | "closed" | "past" | "selected" {
    const key = format(d, "yyyy-MM-dd");
    if (date === key) return "selected";
    if (isBefore(d, today)) return "past";
    if (availableSet.has(key) && isReceptionDate(key, state.calendar))
      return "open";
    return "closed";
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-0 border border-court-line bg-white lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Календарь */}
        <div className="border-b border-court-line p-4 lg:border-b-0 lg:border-r sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-court-line pb-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-court-line text-court-ink hover:border-court-blue hover:text-court-blue"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              aria-label={c.monthPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold uppercase tracking-wide text-court-ink sm:text-base">
              {monthLabel}
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-court-line text-court-ink hover:border-court-blue hover:text-court-blue"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label={c.monthNext}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-court-muted sm:text-xs">
            {c.weekdaysShort.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-court-line">
            {gridDays.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const status = dayStatus(d);
              const inMonth = isSameMonth(d, month);
              const clickable = status === "open" || status === "selected";

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (!clickable) return;
                    onDateChange(key);
                    onSlotChange("", "");
                    if (!isSameMonth(d, month)) setMonth(startOfMonth(d));
                  }}
                  className={cn(
                    "relative flex min-h-[2.6rem] flex-col items-center justify-center bg-white text-sm font-medium sm:min-h-[3rem]",
                    !inMonth && "text-court-muted/40",
                    status === "selected" &&
                      "bg-court-blue font-semibold text-white",
                    status === "open" &&
                      inMonth &&
                      "text-court-ink hover:bg-court-light",
                    (status === "closed" || status === "past") &&
                      "cursor-not-allowed bg-court-mist/80 text-court-muted/50"
                  )}
                  aria-label={`${formatDateRu(key)}, ${weekdayRu(key)}`}
                  aria-pressed={status === "selected"}
                >
                  {d.getDate()}
                  {status === "open" && inMonth && (
                    <span className="mt-0.5 h-1 w-1 rounded-full bg-court-gold" />
                  )}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-court-line pt-3 text-xs text-court-muted">
            <li className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-white ring-1 ring-court-line" />
              <span className="h-1 w-1 rounded-full bg-court-gold" />
              {c.legendOpen}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-court-blue" />
              {c.legendSelected}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-court-mist ring-1 ring-court-line" />
              {c.legendClosed}
            </li>
          </ul>
        </div>

        {/* Слоты */}
        <div className="flex flex-col p-4 sm:p-5">
          <div className="mb-3 border-b border-court-line pb-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-court-muted">
              {c.titleTime}
            </div>
            <div className="mt-1 text-sm font-semibold text-court-ink">
              {date
                ? `${formatDateRu(date)} (${weekdayRu(date, t.calendar.weekdays)})`
                : c.pickDateFirst}
            </div>
            <p className="mt-1 text-xs text-court-muted">{c.duration}</p>
          </div>

          <div className="min-h-[12rem] flex-1">
            {!date ? (
              <p className="border border-dashed border-court-line bg-court-mist px-4 py-8 text-center text-sm text-court-muted">
                {c.pickDateFirst}
              </p>
            ) : slots.length === 0 ? (
              <p className="border border-court-line bg-court-mist px-4 py-6 text-sm text-court-ink">
                {c.noSlots}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                {slots.map((s) => {
                  const active = slotStart === s.start;
                  return (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => onSlotChange(s.start, s.end)}
                      className={cn(
                        "min-h-[2.75rem] border px-3 py-2 text-center font-mono text-sm font-medium tracking-wide transition-colors",
                        active
                          ? "border-court-blue bg-court-blue text-white"
                          : "border-court-line bg-white text-court-ink hover:border-court-blue hover:text-court-blue"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-4 border-t border-court-line pt-3 text-xs text-court-muted">
            {isKy ? "Иш убактысы" : "Окно приёма"}:{" "}
            {minutesToTime(state.calendar.dayStartMinutes)} –{" "}
            {minutesToTime(state.calendar.dayEndMinutes)}. 20{" "}
            {isKy ? "мүн. + 5 мүн. тыныгуу" : "мин + 5 мин перерыв"}.
          </p>
        </div>
      </div>

      {/* Итог выбора — нейтральный, без зелёного «успеха» */}
      {date && (
        <div
          className="border border-court-line bg-court-mist px-4 py-3 text-sm"
          role="status"
        >
          <span className="font-semibold text-court-ink">{c.yourChoice}:</span>{" "}
          <span className="text-court-ink">
            {formatDateRu(date)}
            {selectedSlot ? (
              <>
                , <span className="font-mono font-medium">{selectedSlot.label}</span>
              </>
            ) : (
              <span className="text-court-muted">
                {" "}
                — {isKy ? "убакытты тандаңыз" : "выберите время"}
              </span>
            )}
          </span>
        </div>
      )}

      {!availableSet.size && ready && (
        <p className="border border-court-line bg-court-mist px-3 py-2 text-sm text-court-ink">
          {c.noDates}
        </p>
      )}
    </div>
  );
}
