"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardCheck,
  FilePenLine,
  FileText,
  GitBranch,
  RefreshCw,
  Settings,
  ClipboardList,
  Star,
  Users,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StageBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDateRu } from "@/lib/slots";
import { average } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABELS, STAGE_LABELS } from "@/lib/constants";
import { DonutChart, HBarChart } from "@/components/ui/SimpleCharts";
import type { AppealStage } from "@/lib/types";

export default function StaffDashboardPage() {
  const { state, currentUser, setAdminModule } = useStore();
  const { lang } = useI18n();
  const isKy = lang === "ky";

  useEffect(() => {
    setAdminModule("reception");
  }, [setAdminModule]);

  const appeals = state.appeals.filter((a) => a.stage !== "cancelled");
  const allAppeals = state.appeals;

  const prep = appeals.filter((a) =>
    ["registered", "under_review"].includes(a.stage)
  );
  const readyReception = appeals.filter(
    (a) => a.stage === "ready_for_reception"
  );
  const inControl = appeals.filter((a) => a.stage === "in_control");

  const phones = new Map<string, number>();
  for (const a of appeals) {
    const key = a.phone.replace(/\D/g, "");
    phones.set(key, (phones.get(key) || 0) + 1);
  }
  const repeatedCount = Array.from(phones.values()).filter((n) => n > 1).length;

  const stageChart = useMemo(() => {
    const order: AppealStage[] = [
      "registered",
      "under_review",
      "ready_for_reception",
      "reception_done",
      "in_control",
      "answered",
      "closed",
      "cancelled",
    ];
    const counts: Record<string, number> = {};
    for (const a of allAppeals) {
      counts[a.stage] = (counts[a.stage] || 0) + 1;
    }
    return order
      .filter((s) => counts[s])
      .map((s) => ({
        key: s,
        label: STAGE_LABELS[s],
        value: counts[s] || 0,
      }));
  }, [allAppeals]);

  const categoryChart = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of appeals) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return Object.entries(counts).map(([k, v]) => ({
      key: k,
      label: CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] || k,
      value: v,
    }));
  }, [appeals]);

  const upcoming = useMemo(
    () =>
      state.appointments
        .filter(
          (a) =>
            a.status === "confirmed" ||
            a.status === "rescheduled" ||
            a.status === "no_show"
        )
        .sort((a, b) =>
          `${a.date}${a.slotStart}`.localeCompare(`${b.date}${b.slotStart}`)
        )
        .slice(0, 6),
    [state.appointments]
  );

  const recent = useMemo(
    () =>
      [...state.appeals]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 6),
    [state.appeals]
  );

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

  const firstName = currentUser
    ? currentUser.fullName.split(" ")[0]
    : "";

  function appealIdForApt(aptId: string) {
    return state.appeals.find((a) => a.appointmentId === aptId)?.id;
  }

  const taskCards = [
    {
      key: "prep",
      label: isKy ? "Даярдоо керек" : "Нужна подготовка",
      hint: isKy ? "Кароо / даярдоо" : "На рассмотрении",
      value: prep.length,
      icon: FolderOpen,
      href: "/admin/reception",
      accent: "bg-sky-50 text-sky-700",
    },
    {
      key: "ready",
      label: isKy ? "Кабыл алууга даяр" : "Готовы к приёму",
      hint: isKy ? "Этап 3" : "Этап приёма",
      value: readyReception.length,
      icon: Users,
      href: "/admin/reception",
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "control",
      label: isKy ? "Көзөмөлдө" : "На контроле",
      hint: isKy ? "Тапшырмалар" : "Поручения",
      value: inControl.length,
      icon: ClipboardCheck,
      href: "/admin/control",
      accent: "bg-amber-50 text-amber-800",
    },
    {
      key: "repeated",
      label: isKy ? "Кайталанма" : "Повторные",
      hint: isKy ? "Бир нече кайрылуу" : "Несколько обращений",
      value: repeatedCount,
      icon: RefreshCw,
      href: "/admin/analytics",
      accent: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {isKy ? "Кабыл алуу модулу" : "Модуль приёма граждан"}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {isKy ? "Иш тактасы" : "Рабочий стол"}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          {isKy
            ? "Статистика, милдеттер, жазылуулар — басыңыз жана ачыңыз."
            : "Сначала статистика и задачи. Нажмите на запись — откроется карточка: правка, отмена, статус."}
        </p>
      </div>

      {/* Stats first */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            {isKy ? "Этаптар" : "По этапам"}
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            {isKy
              ? "Кайрылуулардын бөлүштүрүлүшү"
              : "Распределение обращений по пайплайну"}
          </p>
          <HBarChart items={stageChart} />
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            {isKy ? "Категориялар" : "По категориям"}
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            {isKy ? "Предмет кабыл алуу" : "Предмет приёма"}
          </p>
          <DonutChart
            items={categoryChart}
            centerValue={appeals.length}
            centerLabel={isKy ? "активдүү" : "активных"}
          />
          <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              ★ {isKy ? "Орточо баа" : "Ср. оценка"}:{" "}
              <strong className="text-slate-900">
                {avgScore ? avgScore.toFixed(1) : "—"}
              </strong>
              /5
            </span>
            <span>
              {isKy ? "Жооптор" : "Оценок"}:{" "}
              <strong className="text-slate-900">{feedbacks.length}</strong>
            </span>
            <Link
              href="/admin/analytics"
              className="font-medium text-court-blue hover:underline"
            >
              {isKy ? "Мониторинг →" : "Мониторинг →"}
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {taskCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="animate-fade-up group rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">
                    {card.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {card.hint}
                  </div>
                  <div className="mt-2 font-display text-3xl font-semibold text-slate-900">
                    {card.value}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-2.5 transition group-hover:scale-105 ${card.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              {isKy ? "Жакынкы жазылуулар" : "Ближайшие записи"}
            </h2>
            <Link
              href="/admin/calendar"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-court-blue hover:underline"
            >
              <CalendarDays className="h-4 w-4" />
              {isKy ? "Календарь" : "Календарь"}
            </Link>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 && (
              <p className="text-sm text-slate-500">
                {isKy ? "Алдыдагы жазылуу жок." : "Нет предстоящих записей."}
              </p>
            )}
            {upcoming.map((a) => {
              const aplId = appealIdForApt(a.id);
              const href = aplId
                ? `/admin/appeals/${aplId}`
                : "/admin/calendar";
              return (
                <Link
                  key={a.id}
                  href={href}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition hover:border-court-blue/30 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900 group-hover:text-court-navy">
                      {a.fullName}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {a.code} · {a.topic}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right text-sm">
                    <div className="font-semibold text-slate-900">
                      {formatDateRu(a.date)} · {a.slotStart}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 group-hover:text-court-blue sm:block" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              {isKy ? "Акыркы кайрылуулар" : "Недавние обращения"}
            </h2>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Star className="h-4 w-4 text-amber-500" />
              {avgScore ? avgScore.toFixed(1) : "—"} / 5
            </div>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && (
              <p className="text-sm text-slate-500">
                {isKy ? "Кайрылуулар жок." : "Обращений пока нет."}
              </p>
            )}
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/admin/appeals/${a.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">
                    {a.code} · {a.fullName}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {a.topic}
                    {a.previousAppealIds.length > 0 && (
                      <span className="ml-1 text-amber-700">
                        · {isKy ? "кайталанма" : "повторное"}
                      </span>
                    )}
                  </div>
                </div>
                <StageBadge stage={a.stage} />
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <Link
              href="/admin/appeals"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-court-blue hover:underline"
            >
              <FileText className="h-4 w-4" />
              {isKy ? "Бардык кайрылуулар" : "Все обращения"}
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {isKy ? "Тез шилтемелер" : "Быстрые переходы"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/content", icon: FilePenLine, label: isKy ? "Контент" : "Контент сервиса" },
            { href: "/admin/eligibility", icon: GitBranch, label: isKy ? "Допуск" : "Дерево допуска" },
            { href: "/admin/settings", icon: Settings, label: isKy ? "График" : "График приёма" },
            { href: "/admin/survey", icon: ClipboardList, label: isKy ? "Опросник" : "Вопросы анкеты" },
          ].map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-white hover:shadow-sm"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
