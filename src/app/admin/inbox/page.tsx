"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { AdminHeading } from "@/components/staff/AdminHeading";
import { ReviewRequestPanel } from "@/components/staff/ReviewRequestPanel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateRu, weekdayRu } from "@/lib/slots";
import { targetShort } from "@/lib/targets";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABELS } from "@/lib/constants";

export default function InboxPage() {
  const { state } = useStore();
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const [flash, setFlash] = useState("");
  const [err, setErr] = useState(false);

  const pending = useMemo(
    () =>
      state.appointments
        .filter((a) => a.status === "pending_review")
        .sort((a, b) =>
          `${a.date}${a.slotStart}`.localeCompare(`${b.date}${b.slotStart}`)
        ),
    [state.appointments]
  );

  function appealFor(appointmentId: string) {
    return state.appeals.find((a) => a.appointmentId === appointmentId);
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: isKy ? "Өтүнмөлөр" : "Заявки на проверке" },
        ]}
      />
      <AdminHeading
        title={isKy ? "Өтүнмөлөр" : "Заявки"}
        lead={
          isKy
            ? "Ырастоо же баш тартуу. Жазылуу ырасталгандан кийин күчүнө кирет."
            : "Подтверждение либо отказ. Запись вступает в силу после подтверждения."
        }
      />

      {flash && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            err
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {flash}
        </div>
      )}

      {pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={isKy ? "Текшерүүгө өтүнмө жок" : "Новых заявок нет"}
          description={
            isKy
              ? "Баардык өтүнмөлөр каралды. Кийинки кадам — даярдоо жана кабыл алуу."
              : "Все заявки рассмотрены. Следующий шаг — подготовка карточек и личный приём."
          }
          className="bg-white"
        />
      ) : (
        <ul className="space-y-4">
          {pending.map((apt) => {
            const appeal = appealFor(apt.id);
            return (
              <li
                key={apt.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
                  <div className="border-b border-slate-100 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-900">
                        <Inbox className="h-3.5 w-3.5" />
                        {isKy ? "Текшерүүдө" : "На проверке"}
                      </span>
                      <span className="font-mono text-sm font-semibold text-court-navy">
                        {apt.code}
                      </span>
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-950">
                        PIN {apt.pin}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {apt.fullName}
                    </h2>
                    <p className="text-sm text-slate-600">{apt.topic}</p>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">
                          {isKy ? "Кимге" : "К кому"}
                        </dt>
                        <dd className="font-medium">
                          {targetShort(apt.targetId, isKy, state.serviceContent)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">
                          {isKy ? "Күн / убакыт" : "Дата и время"}
                        </dt>
                        <dd className="font-medium">
                          {formatDateRu(apt.date)} ({weekdayRu(apt.date)}) ·{" "}
                          {apt.slotStart}–{apt.slotEnd}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">
                          {isKy ? "Телефон" : "Телефон"}
                        </dt>
                        <dd className="font-medium">{apt.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase text-slate-400">
                          {isKy ? "Категория" : "Категория"}
                        </dt>
                        <dd className="font-medium">
                          {CATEGORY_LABELS[apt.category]}
                        </dd>
                      </div>
                    </dl>
                    {apt.description && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                        <div className="text-[11px] font-semibold uppercase text-slate-400">
                          {isKy ? "Мазмуну" : "Содержание обращения"}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap">
                          {apt.description}
                        </p>
                      </div>
                    )}
                    {apt.companions.length > 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        {isKy ? "Коштоочулар" : "Сопровождающие"}:{" "}
                        {apt.companions
                          .map((c) =>
                            c.phone
                              ? `${c.fullName} (${c.phone})`
                              : c.fullName
                          )
                          .join("; ")}
                      </p>
                    )}
                    {appeal && (
                      <Link
                        href={`/admin/appeals/${appeal.id}`}
                        className="mt-3 inline-block text-sm font-medium text-court-blue hover:underline"
                      >
                        {isKy
                          ? "Толук карточканы ачуу →"
                          : "Открыть полную карточку →"}
                      </Link>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <ReviewRequestPanel
                      appointment={apt}
                      isKy={isKy}
                      onDone={(ok, message) => {
                        setErr(!ok);
                        setFlash(message);
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-sm text-slate-500">
        {isKy ? "Кийинки бөлүм:" : "Следующий раздел:"}{" "}
        <Link href="/admin/reception" className="font-medium text-court-blue hover:underline">
          {isKy ? "даярдоо жана кабыл алуу" : "подготовка и приём"}
        </Link>
        {" · "}
        <Link href="/admin/help" className="font-medium text-court-blue hover:underline">
          {isKy ? "нускама" : "инструкция по шагам"}
        </Link>
      </p>
    </div>
  );
}
