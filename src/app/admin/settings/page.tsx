"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { generateDaySlots, minutesToTime, timeToMinutes } from "@/lib/slots";
import { RotateCcw, Save } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useI18n } from "@/lib/i18n";

const WEEKDAYS = [
  { v: 1, l: "Понедельник" },
  { v: 2, l: "Вторник" },
  { v: 3, l: "Среда" },
  { v: 4, l: "Четверг" },
  { v: 5, l: "Пятница" },
  { v: 6, l: "Суббота" },
  { v: 0, l: "Воскресенье" },
];

export default function SettingsPage() {
  const { state, currentUser, updateCalendar, resetDemo } = useStore();
  const { t } = useI18n();
  const cal = state.calendar;
  const [weekdays, setWeekdays] = useState(cal.receptionWeekdays);
  const [start, setStart] = useState(minutesToTime(cal.dayStartMinutes));
  const [end, setEnd] = useState(minutesToTime(cal.dayEndMinutes));
  const [slot, setSlot] = useState(cal.slotDurationMinutes);
  const [brk, setBrk] = useState(cal.breakMinutes);
  const [horizon, setHorizon] = useState(cal.bookingHorizonDays);
  const [closed, setClosed] = useState(cal.closedDates.join(", "));
  const [extra, setExtra] = useState(cal.extraOpenDates.join(", "));
  const [rules, setRules] = useState(cal.rulesText);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setWeekdays(cal.receptionWeekdays);
    setStart(minutesToTime(cal.dayStartMinutes));
    setEnd(minutesToTime(cal.dayEndMinutes));
    setSlot(cal.slotDurationMinutes);
    setBrk(cal.breakMinutes);
    setHorizon(cal.bookingHorizonDays);
    setClosed(cal.closedDates.join(", "));
    setExtra(cal.extraOpenDates.join(", "));
    setRules(cal.rulesText);
  }, [cal]);

  const canEdit =
    currentUser && ["admin", "reception", "leadership"].includes(currentUser.role);

  const preview = generateDaySlots({
    ...cal,
    dayStartMinutes: timeToMinutes(start),
    dayEndMinutes: timeToMinutes(end),
    slotDurationMinutes: slot,
    breakMinutes: brk,
  });

  function toggleDay(v: number) {
    setWeekdays((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v].sort()
    );
  }

  function parseDates(s: string): string[] {
    return s
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x));
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    updateCalendar({
      receptionWeekdays: weekdays,
      dayStartMinutes: timeToMinutes(start),
      dayEndMinutes: timeToMinutes(end),
      slotDurationMinutes: slot,
      breakMinutes: brk,
      bookingHorizonDays: horizon,
      closedDates: parseDates(closed),
      extraOpenDates: parseDates(extra),
      rulesText: rules,
    });
    setMsg("Настройки календаря сохранены.");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.settings },
        ]}
      />
      <div>
        <h1 className="section-title">{t.admin.settings}</h1>
        <p className="mt-1 text-base text-court-muted">
          Дни приёма, интервалы, закрытые даты, текст правил.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {msg}
        </div>
      )}

      <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <h2 className="font-display text-xl font-semibold text-court-navy">
            Дни и время приёма
          </h2>
          <div>
            <div className="label">Дни недели</div>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => toggleDay(d.v)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    weekdays.includes(d.v)
                      ? "border-court-navy bg-court-navy text-white"
                      : "border-court-line bg-white text-court-muted"
                  }`}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Начало</label>
              <input
                type="time"
                className="input"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="label">Конец</label>
              <input
                type="time"
                className="input"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="label">Длительность слота (мин)</label>
              <input
                type="number"
                min={10}
                max={60}
                className="input"
                value={slot}
                onChange={(e) => setSlot(Number(e.target.value))}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="label">Пауза между слотами (мин)</label>
              <input
                type="number"
                min={0}
                max={30}
                className="input"
                value={brk}
                onChange={(e) => setBrk(Number(e.target.value))}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div>
            <label className="label">Горизонт записи (дней вперёд)</label>
            <input
              type="number"
              min={7}
              max={120}
              className="input"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="label">
              Закрытые даты (YYYY-MM-DD через запятую)
            </label>
            <input
              className="input font-mono text-xs"
              value={closed}
              onChange={(e) => setClosed(e.target.value)}
              disabled={!canEdit}
              placeholder="2026-05-01, 2026-08-31"
            />
          </div>
          <div>
            <label className="label">
              Доп. открытые даты вне графика
            </label>
            <input
              className="input font-mono text-xs"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-display text-xl font-semibold text-court-navy">
              Предпросмотр слотов
            </h2>
            <p className="mt-1 text-xs text-court-muted">
              По схеме из рукописи: 08:00–08:20, 08:25–08:45…
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {preview.map((s) => (
                <span
                  key={s.start}
                  className="rounded-lg border border-court-line bg-court-mist px-2.5 py-1 font-mono text-xs"
                >
                  {s.label}
                </span>
              ))}
              {preview.length === 0 && (
                <span className="text-sm text-court-muted">
                  Некорректное окно времени
                </span>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl font-semibold text-court-navy">
              Текст правил (публичный)
            </h2>
            <textarea
              className="input min-h-[220px] font-sans text-sm"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button type="submit" className="btn-primary" disabled={!canEdit}>
            <Save className="h-4 w-4" />
            Сохранить настройки
          </button>
          {currentUser?.role === "admin" && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                if (
                  confirm(
                    "Сбросить все демо-данные и настройки к исходному состоянию?"
                  )
                ) {
                  resetDemo();
                  setMsg("Демо-данные восстановлены.");
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить демо
            </button>
          )}
          {!canEdit && (
            <span className="self-center text-sm text-court-muted">
              Редактирование доступно администратору, приёмной и руководству.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
