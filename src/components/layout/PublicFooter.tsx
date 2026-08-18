"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { EmblemKR } from "@/components/brand/Emblem";
import { useStore } from "@/lib/store";
import { mergeServiceContent, pickLocale } from "@/lib/serviceContent";
import { routes } from "@/lib/routes";

export function PublicFooter() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const { state } = useStore();
  const sc = mergeServiceContent(state.serviceContent);
  const org = pickLocale(isKy, sc.orgNameRu, sc.orgNameKy) || t.orgName;
  const app = pickLocale(isKy, sc.appNameRu, sc.appNameKy) || t.appName;
  const c = sc.contacts;
  const disclaimer = pickLocale(
    isKy,
    sc.footerDisclaimerRu,
    sc.footerDisclaimerKy
  );
  const navLabel = (href: string, fallback: string) => {
    const item = sc.headerNav.find((l) => l.href === href);
    return (
      pickLocale(isKy, item?.labelRu, item?.labelKy) || fallback
    );
  };

  return (
    <footer className="no-print mt-auto border-t-2 border-court-navy bg-court-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2.5">
            <EmblemKR size={36} />
            <div>
              <div className="text-sm font-semibold leading-snug">{org}</div>
              <div className="mt-0.5 text-xs text-white/60">{app}</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/65">
            {pickLocale(isKy, sc.footerReceptionRu, sc.footerReceptionKy)}.{" "}
            {disclaimer}.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            {pickLocale(isKy, c.addressRu, c.addressKy)}
            <br />
            {isKy ? "Ишеним телефону" : "Телефон доверия"}:{" "}
            <a
              href={`tel:${c.trustPhoneTel}`}
              className="font-medium text-white/85 hover:underline"
            >
              {c.trustPhone}
            </a>
          </p>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            {pickLocale(isKy, sc.footerCitizensRu, sc.footerCitizensKy)}
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link
                href={routes.appointment}
                className="hover:text-white hover:underline"
              >
                {navLabel(routes.appointment, t.nav.book)}
              </Link>
            </li>
            <li>
              <Link
                href={routes.appointmentStatus}
                className="hover:text-white hover:underline"
              >
                {navLabel(routes.appointmentStatus, t.nav.myAppointment)}
              </Link>
            </li>
            <li>
              <Link
                href={routes.evaluation}
                className="hover:text-white hover:underline"
              >
                {navLabel(routes.evaluation, t.nav.feedback)}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            {pickLocale(isKy, sc.footerHelpRu, sc.footerHelpKy)}
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link
                href={routes.rules}
                className="hover:text-white hover:underline"
              >
                {navLabel(routes.rules, t.footer.rules)}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            {pickLocale(isKy, sc.footerImportantRu, sc.footerImportantKy)}
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              {pickLocale(
                isKy,
                sc.footerIndependenceRu,
                sc.footerIndependenceKy
              )}
            </li>
            <li>{pickLocale(isKy, sc.footerNoCasesRu, sc.footerNoCasesKy)}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs text-white/45 md:flex-row md:items-center md:justify-between md:px-6">
          <span>
            © {new Date().getFullYear()} {org}
          </span>
          <span>{disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
