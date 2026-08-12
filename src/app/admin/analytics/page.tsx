"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABELS, STAGE_LABELS } from "@/lib/constants";
import { average, normalizePhone } from "@/lib/utils";
import type { AppealCard } from "@/lib/types";
import { downloadAppealsReport } from "@/lib/pdfReport";
import { useI18n } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AnalyticsPage() {
  const { state } = useStore();
  const { t } = useI18n();
  const appeals = state.appeals.filter((a) => a.stage !== "cancelled");

  const stats = useMemo(() => {
    const byStage: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byTopic = new Map<string, number>();

    for (const a of appeals) {
      byStage[a.stage] = (byStage[a.stage] || 0) + 1;
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
      const topicKey = a.topic.trim().toLowerCase();
      byTopic.set(topicKey, (byTopic.get(topicKey) || 0) + 1);
    }

    // group by citizen (phone)
    const groups = new Map<string, AppealCard[]>();
    for (const a of appeals) {
      const key = normalizePhone(a.phone) || a.fullName.toLowerCase();
      const list = groups.get(key) || [];
      list.push(a);
      groups.set(key, list);
    }

    const repeated = Array.from(groups.entries())
      .filter(([, list]) => list.length > 1)
      .map(([key, list]) => ({
        key,
        name: list[0].fullName,
        phone: list[0].phone,
        count: list.length,
        themes: Array.from(new Set(list.map((x) => x.topic))),
        codes: list.map((x) => x.code),
        ids: list.map((x) => x.id),
      }))
      .sort((a, b) => b.count - a.count);

    const feedbacks = appeals.filter((a) => a.feedback).map((a) => a.feedback!);
    const quality = {
      count: feedbacks.length,
      respectful: average(feedbacks.map((f) => f.respectful)),
      clearNextSteps: average(feedbacks.map((f) => f.clearNextSteps)),
      convenient: average(feedbacks.map((f) => f.convenient)),
      deadlinesMet: average(feedbacks.map((f) => f.deadlinesMet)),
      overall: average(
        feedbacks.flatMap((f) => [
          f.respectful,
          f.clearNextSteps,
          f.convenient,
          f.deadlinesMet,
        ])
      ),
    };

    const topThemes = Array.from(byTopic.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // systemic: themes that appear in repeated groups or 2+ times
    const systemic = topThemes
      .filter(([, n]) => n >= 2)
      .map(([theme, n]) => ({ theme, n }));

    return { byStage, byCategory, repeated, quality, topThemes, systemic };
  }, [appeals]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.crumbs.admin, href: "/admin" },
          { label: t.crumbs.analytics },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-title">{t.admin.analytics}</h1>
          <p className="mt-1 max-w-2xl text-court-muted">
            Количество, темы, системные проблемы, качество общественной
            приёмной — для руководства ВС КР.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary !min-h-11"
          onClick={() =>
            downloadAppealsReport({
              appeals: state.appeals,
              appointments: state.appointments,
              title: t.admin.reportTitle,
              subtitle: t.admin.reportSubtitle,
              orgName: t.orgName,
            })
          }
        >
          <FileDown className="h-4 w-4" />
          {t.common.downloadPdf}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <div className="text-sm text-court-muted">Всего обращений</div>
          <div className="font-display text-3xl font-semibold text-court-navy">
            {appeals.length}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-court-muted">Повторные граждане</div>
          <div className="font-display text-3xl font-semibold text-court-navy">
            {stats.repeated.length}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-court-muted">Оценок получено</div>
          <div className="font-display text-3xl font-semibold text-court-navy">
            {stats.quality.count}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-court-muted">Средняя оценка</div>
          <div className="font-display text-3xl font-semibold text-court-navy">
            {stats.quality.overall
              ? stats.quality.overall.toFixed(1)
              : "—"}
            <span className="text-base text-court-muted"> / 5</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-xl font-semibold text-court-navy">
            Повторные обращения
          </h2>
          <p className="mt-1 text-sm text-court-muted">
            Граждане с более чем одним обращением (по телефону / ФИО).
          </p>
          {stats.repeated.length === 0 ? (
            <p className="mt-4 text-sm text-court-muted">Пока нет повторов.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.repeated.map((r) => (
                <li
                  key={r.key}
                  className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-court-navy">{r.name}</div>
                    <span className="badge bg-amber-100 text-amber-900">
                      {r.count} обращ.
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-court-muted">{r.phone}</div>
                  <div className="mt-2 text-sm text-court-ink">
                    Темы: {r.themes.join("; ")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {r.ids.map((id, i) => (
                      <Link
                        key={id}
                        href={`/admin/appeals/${id}`}
                        className="font-mono text-court-blue hover:underline"
                      >
                        {r.codes[i]}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-display text-xl font-semibold text-court-navy">
            Системные темы
          </h2>
          <p className="mt-1 text-sm text-court-muted">
            Темы, встречающиеся неоднократно — сигнал для организационных мер.
          </p>
          <ul className="mt-4 space-y-2">
            {stats.systemic.length === 0 && (
              <li className="text-sm text-court-muted">Недостаточно данных.</li>
            )}
            {stats.systemic.map((s) => (
              <li
                key={s.theme}
                className="flex items-center justify-between rounded-lg border border-court-line px-3 py-2 text-sm"
              >
                <span className="capitalize text-court-ink">{s.theme}</span>
                <span className="font-semibold text-court-navy">{s.n}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 mb-2 font-semibold text-court-navy">
            По категориям
          </h3>
          <ul className="space-y-2">
            {Object.entries(stats.byCategory).map(([k, n]) => (
              <li
                key={k}
                className="flex justify-between text-sm text-court-muted"
              >
                <span>
                  {CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] || k}
                </span>
                <span className="font-semibold text-court-navy">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-xl font-semibold text-court-navy">
            Распределение по этапам
          </h2>
          <ul className="mt-4 space-y-2">
            {Object.entries(stats.byStage).map(([k, n]) => (
              <li key={k} className="flex items-center gap-3 text-sm">
                <div className="w-40 shrink-0 text-court-muted">
                  {STAGE_LABELS[k as keyof typeof STAGE_LABELS] || k}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-court-blue"
                    style={{
                      width: `${Math.min(100, (n / Math.max(appeals.length, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="w-8 text-right font-semibold text-court-navy">
                  {n}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-xl font-semibold text-court-navy">
            Качество общественной приёмной
          </h2>
          <p className="mt-1 text-sm text-court-muted">
            Критерии из предложения: уважение, ясность, удобство, сроки.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Уважительное отношение", stats.quality.respectful],
              ["Понятность действий", stats.quality.clearNextSteps],
              ["Удобство организации", stats.quality.convenient],
              ["Соблюдение сроков", stats.quality.deadlinesMet],
            ].map(([label, val]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-court-line px-3 py-3"
              >
                <div className="text-xs text-court-muted">{label}</div>
                <div className="font-display text-2xl font-semibold text-court-navy">
                  {typeof val === "number" && val
                    ? val.toFixed(1)
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
