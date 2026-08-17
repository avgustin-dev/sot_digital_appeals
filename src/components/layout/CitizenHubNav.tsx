"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { mergeServiceContent, pickLocale } from "@/lib/serviceContent";

export function CitizenHubNav() {
  const { lang } = useI18n();
  const isKy = lang === "ky";
  const { state } = useStore();
  const sc = mergeServiceContent(state.serviceContent);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sc.hubNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="border border-court-line bg-white p-4 transition hover:border-court-navy hover:bg-court-mist"
        >
          <div className="text-sm font-semibold text-court-navy">
            {pickLocale(isKy, item.labelRu, item.labelKy)}
          </div>
          <p className="mt-1 text-sm text-court-muted">
            {pickLocale(isKy, item.descRu, item.descKy)}
          </p>
        </Link>
      ))}
    </div>
  );
}
