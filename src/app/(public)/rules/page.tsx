"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { RECEPTION_ALLOWED, RECEPTION_FORBIDDEN } from "@/lib/constants";
import { minutesToTime } from "@/lib/slots";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageLoader } from "@/components/ui/PageLoader";
import { useI18n } from "@/lib/i18n";

export default function RulesPage() {
  const { ready, state } = useStore();
  const { t } = useI18n();
  const cal = state.calendar;

  if (!ready) {
    return <PageLoader />;
  }

  const weekdays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const days = cal.receptionWeekdays.map((d) => weekdays[d]).join(", ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs
        items={[
          { label: t.crumbs.home, href: "/" },
          { label: t.crumbs.rules },
        ]}
      />
      <h1 className="section-title mb-6">{t.footer.rules}</h1>

      <div className="card mb-6 space-y-3 p-6">
        <h2 className="font-display text-xl font-semibold text-court-navy">
          График приёма
        </h2>
        <ul className="space-y-2 text-base text-court-muted">
          <li>
            Дни приёма: <strong className="text-court-ink">{days}</strong>
          </li>
          <li>
            Время:{" "}
            <strong className="text-court-ink">
              {minutesToTime(cal.dayStartMinutes)} –{" "}
              {minutesToTime(cal.dayEndMinutes)}
            </strong>
          </li>
          <li>
            Интервал:{" "}
            <strong className="text-court-ink">
              {cal.slotDurationMinutes} мин
            </strong>
            , перерыв{" "}
            <strong className="text-court-ink">{cal.breakMinutes} мин</strong>
          </li>
          <li>Пример: 08:00–08:20, 08:25–08:45, 08:50–09:10…</li>
        </ul>
      </div>

      <div className="card mb-6 p-6">
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-court-ink">
          {cal.rulesText}
        </pre>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-semibold text-court-danger">
            {t.home.forbidden}
          </h3>
          <ul className="space-y-2 text-base text-court-muted">
            {RECEPTION_FORBIDDEN.map((i) => (
              <li key={i}>— {i}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 font-semibold text-court-success">
            {t.home.allowed}
          </h3>
          <ul className="space-y-2 text-base text-court-muted">
            {RECEPTION_ALLOWED.map((i) => (
              <li key={i}>— {i}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/book" className="btn-primary !min-h-12">
          {t.nav.bookCta}
        </Link>
      </div>
    </div>
  );
}
