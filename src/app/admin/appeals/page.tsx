"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<AppealStage | "all">("all");

  const list = useMemo(() => {
    return state.appeals
      .filter((a) => {
        if (stage !== "all" && a.stage !== stage) return false;
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          a.code.toLowerCase().includes(s) ||
          a.fullName.toLowerCase().includes(s) ||
          a.topic.toLowerCase().includes(s) ||
          a.phone.includes(s)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [state.appeals, q, stage]);

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
        <div className="overflow-hidden rounded-2xl border border-court-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-court-mist text-xs uppercase tracking-wider text-court-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Код</th>
                  <th className="px-4 py-3 font-semibold">Гражданин</th>
                  <th className="px-4 py-3 font-semibold">Тема</th>
                  <th className="px-4 py-3 font-semibold">Категория</th>
                  <th className="px-4 py-3 font-semibold">Этап</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-court-line hover:bg-court-mist/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/appeals/${a.id}`}
                        className="font-mono font-semibold text-court-blue hover:underline"
                      >
                        {a.code}
                      </Link>
                      {a.previousAppealIds.length > 0 && (
                        <div className="text-[11px] text-amber-700">повторное</div>
                      )}
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
