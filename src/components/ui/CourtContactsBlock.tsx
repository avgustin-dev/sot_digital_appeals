"use client";

import {
  COURT_CONTACTS,
  LEADERSHIP_RECEPTION_SCHEDULE,
} from "@/lib/constants";
import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/** Контакты и график руководства — по данным раздела sot.kg «График приёма граждан» */
export function CourtContactsBlock({
  isKy,
  showSchedule = true,
  compact = false,
  className,
}: {
  isKy: boolean;
  showSchedule?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-court-line bg-white shadow-sm",
        compact ? "p-4" : "p-5",
        className
      )}
    >
      <h2
        className={cn(
          "font-semibold text-court-navy",
          compact ? "text-sm" : "text-base"
        )}
      >
        {isKy
          ? "Байланыш жана кабыл алуу графиги"
          : "Контакты и график приёма граждан"}
      </h2>
      <p className="mt-1 text-xs text-court-muted">
        {isKy ? COURT_CONTACTS.sourceNoteKy : COURT_CONTACTS.sourceNoteRu}
      </p>

      <div
        className={cn(
          "mt-3 grid gap-3",
          compact ? "sm:grid-cols-1" : "sm:grid-cols-2"
        )}
      >
        <a
          href={`tel:${COURT_CONTACTS.trustPhoneTel}`}
          className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 transition hover:border-court-blue/40"
        >
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-court-blue" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {isKy ? "Ишеним телефону" : "Телефон доверия"}
            </div>
            <div className="font-semibold tabular-nums text-court-navy">
              {COURT_CONTACTS.trustPhone}
            </div>
          </div>
        </a>
        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-court-blue" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {isKy ? "Дарек" : "Адрес"}
            </div>
            <div className="text-sm font-medium text-court-navy">
              {isKy ? COURT_CONTACTS.addressKy : COURT_CONTACTS.addressRu}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {isKy
                ? COURT_CONTACTS.receptionOfficeKy
                : COURT_CONTACTS.receptionOfficeRu}
            </div>
          </div>
        </div>
      </div>

      {showSchedule && (
        <div className="mt-4 overflow-x-auto">
          <table className="admin-table min-w-[520px] text-left">
            <thead>
              <tr>
                <th className="!px-2 !py-2">№</th>
                <th className="!px-2 !py-2">
                  {isKy ? "ФИО" : "ФИО"}
                </th>
                <th className="!px-2 !py-2">
                  {isKy ? "Кызматы" : "Должность"}
                </th>
                <th className="!px-2 !py-2">
                  {isKy ? "Күн" : "День"}
                </th>
                <th className="!px-2 !py-2">
                  {isKy ? "Убакыт" : "Время"}
                </th>
              </tr>
            </thead>
            <tbody>
              {LEADERSHIP_RECEPTION_SCHEDULE.map((row, i) => (
                <tr key={row.id}>
                  <td className="!px-2 !py-2 font-mono text-xs text-slate-500">
                    {i + 1}
                  </td>
                  <td className="!px-2 !py-2 text-sm font-medium">
                    {isKy ? row.fullNameKy : row.fullNameRu}
                  </td>
                  <td className="!px-2 !py-2 text-xs text-slate-600">
                    {isKy ? row.positionKy : row.positionRu}
                  </td>
                  <td className="!px-2 !py-2 text-sm">
                    {isKy ? row.weekdayKy : row.weekdayRu}
                  </td>
                  <td className="!px-2 !py-2 text-xs tabular-nums text-slate-700">
                    {isKy ? row.timeKy : row.timeRu}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-400">
            {isKy
              ? "Алдын ала жазылуу — № 111 кабинетте (1-кабат)."
              : "Предварительная запись производится в кабинете № 111 (1 этаж)."}
          </p>
        </div>
      )}
    </div>
  );
}
