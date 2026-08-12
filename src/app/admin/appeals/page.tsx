"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { StageBadge } from "@/components/ui/Badge";
import { CATEGORY_LABELS, STAGE_LABELS } from "@/lib/constants";
import type { AppealStage } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AppealsListPage() {
  const { state } = useStore();
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<AppealStage | "all">("all");

  function pinFor(appointmentId: string) {
    return state.appointments.find((x) => x.id === appointmentId)?.pin ?? "—";
  }

  const list = useMemo(() => {
    return state.appeals
      .filter((a) => {
        if (stage !== "all" && a.stage !== stage) return false;
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        const pin = state.appointments
          .find((x) => x.id === a.appointmentId)
          ?.pin?.toLowerCase();
        return (
          a.code.toLowerCase().includes(s) ||
          a.fullName.toLowerCase().includes(s) ||
          a.topic.toLowerCase().includes(s) ||
          a.phone.includes(s) ||
          (pin ? pin.includes(s) : false)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [state.appeals, state.appointments, q, stage]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.appeals },
        ]}
      />
      <div>
        <h1 className="section-title">{t.admin.appeals}</h1>
        <p className="mt-1 text-court-muted">
          Реестр карточек: регистрация → анализ → приём → контроль → закрытие.
        </p>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="q">
            Поиск
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-court-muted" />
            <input
              id="q"
              className="input pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Код, ФИО, тема, телефон"
            />
          </div>
        </div>
        <div className="sm:w-64">
          <label className="label" htmlFor="stage">
            Этап
          </label>
          <select
            id="stage"
            className="input"
            value={stage}
            onChange={(e) => setStage(e.target.value as AppealStage | "all")}
          >
            <option value="all">Все этапы</option>
            {(Object.keys(STAGE_LABELS) as AppealStage[]).map((k) => (
              <option key={k} value={k}>
                {STAGE_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Ничего не найдено"
          description="Измените фильтр или дождитесь новых записей граждан."
        />
      ) : (
        <div className="page-enter overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Рег. код</th>
                  <th>PIN</th>
                  <th>Заявитель</th>
                  <th>Тема обращения</th>
                  <th>Категория</th>
                  <th>Этап</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-t border-court-line hover:bg-court-mist/50"
                    onClick={() => router.push(`/admin/appeals/${a.id}`)}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/appeals/${a.id}`}
                        className="font-mono font-semibold text-court-blue hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {a.code}
                      </Link>
                      {a.previousAppealIds.length > 0 && (
                        <div className="text-[11px] text-amber-700">повторное</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-slate-900"
                        title="PIN для «Моя запись» (перенос/отмена)"
                      >
                        {pinFor(a.appointmentId)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-court-navy">
                        {a.fullName}
                      </div>
                      <div className="text-xs text-court-muted">{a.phone}</div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-court-muted">
                      {a.topic}
                    </td>
                    <td className="px-4 py-3 text-court-muted">
                      {CATEGORY_LABELS[a.category]}
                    </td>
                    <td className="px-4 py-3">
                      <StageBadge stage={a.stage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
