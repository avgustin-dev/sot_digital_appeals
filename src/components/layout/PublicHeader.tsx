"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { EmblemKR } from "@/components/brand/Emblem";
import { useStore } from "@/lib/store";
import { mergeServiceContent, pickLocale } from "@/lib/serviceContent";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, lang } = useI18n();
  const isKy = lang === "ky";
  const { state } = useStore();
  const sc = mergeServiceContent(state.serviceContent);
  const org = pickLocale(isKy, sc.orgNameRu, sc.orgNameKy) || t.orgName;
  const app = pickLocale(isKy, sc.appNameRu, sc.appNameKy) || t.appName;
  const cta = pickLocale(isKy, sc.navBookCtaRu, sc.navBookCtaKy) || t.nav.bookCta;

  const links = sc.headerNav.map((l) => ({
    href: l.href,
    label: pickLocale(isKy, l.labelRu, l.labelKy),
  }));

  return (
    <header className="no-print sticky top-0 z-40 border-b border-court-line bg-white">
      <div className="border-b border-court-line bg-court-mist">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-xs text-court-muted md:px-6">
          <span className="truncate font-medium text-court-ink">{org}</span>
          <LangSwitch />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <EmblemKR size={44} priority />
          <div className="min-w-0">
            <div className="line-clamp-2 text-[11px] font-semibold leading-snug text-court-navy sm:text-xs">
              {org}
            </div>
            <div className="truncate text-sm font-medium leading-snug text-court-ink">
              {app}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/book"
            className="btn-primary hidden !py-1.5 !text-sm sm:inline-flex"
          >
            {cta}
          </Link>
          <button
            type="button"
            className="btn-outline !px-2.5 !py-1.5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.menu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-court-line bg-court-navy lg:block">
        <div className="mx-auto flex max-w-6xl items-stretch px-4 md:px-6">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-court-gold bg-white/10 text-white"
                    : "border-transparent text-white/85 hover:bg-white/5 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {open && (
        <div className="border-t border-court-line bg-white px-4 py-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-court-line px-1 py-2.5 text-sm font-medium text-court-navy last:border-0"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
