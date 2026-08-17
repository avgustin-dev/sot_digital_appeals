"use client";

import Link from "next/link";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { mergeServiceContent, pickLocale } from "@/lib/serviceContent";

export default function ProcessPage() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const { state } = useStore();
  const sc = mergeServiceContent(state.serviceContent);
  const steps = sc.processSteps;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs
        items={[
          { label: t.crumbs.home, href: "/" },
          { label: t.crumbs.process },
        ]}
      />
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {pickLocale(isKy, sc.processNoticeRu, sc.processNoticeKy)}
      </div>
      <h1 className="section-title mb-2">
        {pickLocale(isKy, sc.cycleTitleRu, sc.cycleTitleKy) || t.home.cycle}
      </h1>
      <p className="mb-8 max-w-3xl text-base text-court-muted">
        {pickLocale(isKy, sc.cycleLeadRu, sc.cycleLeadKy) || t.home.cycleLead}
      </p>

      <ProgressSteps
        steps={steps.map((s) => ({
          title: pickLocale(isKy, s.titleRu, s.titleKy),
          desc: pickLocale(isKy, s.pointsRu[0], s.pointsKy[0]),
        }))}
        current={-1}
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {steps.map((d) => (
          <article
            key={d.titleRu}
            className="card p-6"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-court-gold">
              {pickLocale(isKy, d.stageRu, d.stageKy)}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-court-navy">
              {pickLocale(isKy, d.titleRu, d.titleKy)}
            </h2>
            <ul className="mt-4 space-y-2 text-base text-court-muted">
              {(isKy
                ? d.pointsKy?.length
                  ? d.pointsKy
                  : d.pointsRu
                : d.pointsRu
              ).map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-court-gold" />
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/book" className="btn-primary !min-h-12">
          {pickLocale(isKy, sc.navBookCtaRu, sc.navBookCtaKy) || t.nav.bookCta}
        </Link>
        <Link href="/rules" className="btn-outline !min-h-12">
          {pickLocale(
            isKy,
            sc.headerNav.find((l) => l.href === "/rules")?.labelRu,
            sc.headerNav.find((l) => l.href === "/rules")?.labelKy
          ) || t.footer.rules}
        </Link>
      </div>
    </div>
  );
}
