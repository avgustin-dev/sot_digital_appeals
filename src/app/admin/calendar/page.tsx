"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  formatDateRu,
  generateDaySlots,
  listAvailableDates,
  weekdayRu,
} from "@/lib/slots";
import { StatusBadge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function StaffCalendarPage() {
  const { state } = useStore();
  const { t } = useI18n();
  const dates = useMemo(
    () => listAvailableDates(state.calendar),
    [state.calendar]
  );
  const [date, setDate] = useState(dates[0] || "");

  const slots = useMemo(
    () => generateDaySlots(state.calendar),
    [state.calendar]
  );

  const bySlot = useMemo(() => {
    const map = new Map<string, (typeof state.appointments)[0]>();
    for (const a of state.appointments) {
      if (a.date !== date || a.status === "cancelled") continue;
      map.set(a.slotStart, a);
    }
    return map;
  }, [state.appointments, date]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.calendar },
        ]}
      />
      <div>
        <h1 className="section-title">{t.admin.calendar}</h1>
        <p className="mt-1 text-court-muted">
          Слоты 20 минут с паузой 5 минут. Занятые окна и свободные — на одном
          экране. Настройка дней и часов — в разделе «Настройки».
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {dates.slice(0, 12).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDate(d)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left",
              date === d
                ? "border-court-gold bg-court-goldPale"
                : "border-court-line bg-white hover:border-court-blue/40"
            )}
          >
            <div className="text-sm font-semibold text-court-navy">
              {formatDateRu(d)}
            </div>
            <div className="text-xs capitalize text-court-muted">
              {weekdayRu(d)}
            </div>
          </button>
        ))}
      </div>

      {date && (
        <div className="card overflow-hidden">
          <div className="border-b border-court-line bg-court-mist px-5 py-3">
            <h2 className="font-semibold text-court-navy">
              {formatDateRu(date)} · {weekdayRu(date)}
            </h2>
          </div>
          <div className="divide-y divide-court-line">
            {slots.map((s) => {
              const apt = bySlot.get(s.start);
              return (
                <div
                  key={s.start}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 px-5 py-3",
                    apt ? "bg-white" : "bg-emerald-50/40"
                  )}
                >
                  <div className="font-mono text-sm font-semibold text-court-navy">
                    {s.label}
                  </div>
                  {apt ? (
                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
                      <div className="min-w-0 text-right">
                        <div className="truncate font-medium text-court-ink">
                          {apt.fullName}
                        </div>
                        <div className="truncate text-xs text-court-muted">
                          {apt.code} · {apt.topic}
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ) : (
                    <span className="badge bg-emerald-100 text-emerald-800">
                      Свободно
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
