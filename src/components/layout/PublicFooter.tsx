"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { EmblemKR } from "@/components/brand/Emblem";
import { COURT_CONTACTS } from "@/lib/constants";

export function PublicFooter() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";

  return (
    <footer className="no-print mt-auto border-t-2 border-court-navy bg-court-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2.5">
            <EmblemKR size={36} />
            <div>
              <div className="text-sm font-semibold leading-snug">
                {t.orgName}
              </div>
              <div className="mt-0.5 text-xs text-white/60">{t.appName}</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/65">
            {t.footer.reception}. {t.footer.demo}.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            {isKy ? COURT_CONTACTS.addressKy : COURT_CONTACTS.addressRu}
            <br />
            {isKy ? "Ишеним телефону" : "Телефон доверия"}:{" "}
            <a
              href={`tel:${COURT_CONTACTS.trustPhoneTel}`}
              className="font-medium text-white/85 hover:underline"
            >
              {COURT_CONTACTS.trustPhone}
            </a>
          </p>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            {t.footer.citizens}
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/book" className="hover:text-white hover:underline">
                {t.nav.book}
              </Link>
            </li>
            <li>
              <Link
                href="/my-appointment"
                className="hover:text-white hover:underline"
              >
                {t.nav.myAppointment}
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="hover:text-white hover:underline"
              >
                {t.nav.feedback}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            {t.footer.help}
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href="/rules" className="hover:text-white hover:underline">
                {t.footer.rules}
              </Link>
            </li>
            <li>
              <Link
                href="/process"
                className="hover:text-white hover:underline"
              >
                {t.footer.process} (демо)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            {t.footer.important}
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            <li>{t.footer.independence}</li>
            <li>{t.footer.noCases}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs text-white/45 md:flex-row md:items-center md:justify-between md:px-6">
          <span>
            © {new Date().getFullYear()} {t.orgName}
          </span>
          <span>{t.footer.demo}</span>
        </div>
      </div>
    </footer>
  );
}
