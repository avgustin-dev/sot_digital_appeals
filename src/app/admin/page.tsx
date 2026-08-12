"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { formatDateRu } from "@/lib/slots";
import { average } from "@/lib/utils";

export default function StaffDashboardPage() {
  const { state, currentUser } = useStore();
  const appeals = state.appeals.filter((a) => a.stage !== "cancelled");
  const active = appeals.filter((a) => !["closed", "cancelled"].includes(a.stage));
  const inControl = appeals.filter((a) => a.stage === "in_control");
  const readyReception = appeals.filter((a) =>
    ["ready_for_reception", "under_review", "registered"].includes(a.stage)
  );
  const upcoming = state.appointments
    .filter((a) => a.status === "confirmed" || a.status === "rescheduled")
    .sort((a, b) => `${a.date}${a.slotStart}`.localeCompare(`${b.date}${b.slotStart}`))
    .slice(0, 5);

  const feedbacks = appeals.filter((a) => a.feedback).map((a) => a.feedback!);
  const avgScore = feedbacks.length
    ? average(
        feedbacks.flatMap((f) => [
          f.respectful,
          f.clearNextSteps,
          f.convenient,
          f.deadlinesMet,
        ])
      )
    : 0;

  // repeated: same citizen appears >1
  const phones = new Map<string, number>();
  for (const a of appeals) {
    const key = a.phone.replace(/\D/g, "");
    phones.set(key, (phones.get(key) || 0) + 1);
  }
  const repeatedCount = Array.from(phones.values()).filter((n) => n > 1).length;

  const stats = [
    {
      label: "Активные обращения",
      value: active.length,
      icon: FileText,
      href: "/admin/appeals",
    },
    {
      label: "К приёму / в подготовке",
      value: readyReception.length,
      icon: Users,
      href: "/admin/reception",
    },
    {
      label: "На контроле",
      value: inControl.length,
      icon: ClipboardCheck,
      href: "/admin/control",
    },
    {
      label: "Повторные граждане",
      value: repeatedCount,
      icon: RefreshCw,
      href: "/admin/analytics",
    },
  ];

  const recent = [...appeals]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-court-gold">
          Служебная панель
        </div>
        <h1 className="section-title mt-1">
          Добро пожаловать
          {currentUser ? `, ${currentUser.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-court-muted">
          Сводка по приёму граждан, исполнению поручений и опроснику судов.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/survey" className="btn-outline !py-1.5 !text-sm">
            Опросник: вопросы
          </Link>
          <Link
            href="/admin/survey/results"
            className="btn-outline !py-1.5 !text-sm"
          >
            Опросник: результаты ({state.surveyResponses?.length ?? 0})
          </Link>
          <Link href="/survey" className="btn-primary !py-1.5 !text-sm">
            Публичная анкета
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-5 transition hover:shadow-panel"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-court-muted">{s.label}</div>
                <div className="mt-1 font-display text-3xl font-semibold text-court-navy">
                  {s.value}
                </div>
              </div>
              <div className="rounded-xl bg-court-light p-2.5 text-court-blue">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-court-navy">
              Ближайшие записи
            </h2>
            <Link href="/admin/calendar" className="btn-ghost text-sm">
              <CalendarDays className="h-4 w-4" />
              Календарь
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-court-muted">Нет предстоящих записей.</p>
            )}
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-court-line px-3 py-2.5"
              >
                <div>
                  <div className="font-medium text-court-navy">{a.fullName}</div>
                  <div className="text-xs text-court-muted">{a.topic}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-court-navy">
                    {formatDateRu(a.date)}
                  </div>
                  <div className="text-court-muted">
                    {a.slotStart}–{a.slotEnd}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-court-navy">
              Недавние обращения
            </h2>
            <div className="flex items-center gap-1 text-sm text-court-muted">
              <Star className="h-4 w-4 text-court-gold" />
              Оценка: {avgScore ? avgScore.toFixed(1) : "—"} / 5
            </div>
          </div>
          <div className="space-y-3">
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/admin/appeals/${a.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-court-line px-3 py-2.5 transition hover:bg-court-mist"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-court-navy">
                    {a.code} · {a.fullName}
                  </div>
                  <div className="truncate text-xs text-court-muted">
                    {a.topic}
                    {a.previousAppealIds.length > 0 && (
                      <span className="ml-1 text-amber-700">· повторное</span>
                    )}
                  </div>
                </div>
                <StageBadge stage={a.stage} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
