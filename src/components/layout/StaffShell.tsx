"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Users,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/PageLoader";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { useI18n } from "@/lib/i18n";
import { EmblemKR } from "@/components/brand/Emblem";

export function StaffShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, ready } = useStore();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/admin", label: t.admin.panel, icon: LayoutDashboard, exact: true },
    { href: "/admin/appeals", label: t.admin.appeals, icon: FileText },
    { href: "/admin/calendar", label: t.admin.calendar, icon: CalendarDays },
    { href: "/admin/reception", label: t.admin.reception, icon: Users },
    { href: "/admin/control", label: t.admin.control, icon: ClipboardCheck },
    { href: "/admin/analytics", label: t.admin.analytics, icon: BarChart3 },
    {
      href: "/admin/survey",
      label: t.admin.survey,
      icon: ClipboardList,
    },
    { href: "/admin/settings", label: t.admin.settings, icon: Settings },
  ];

  useEffect(() => {
    if (ready && !currentUser && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [ready, currentUser, pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-court-mist">
        <PageLoader label="Загрузка служебного кабинета…" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-court-mist">
        <PageLoader label="Перенаправление…" />
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    admin: "Администратор",
    reception: "Приёмная",
    leadership: "Руководство",
    responsible: "Ответственный",
  };

  return (
    <div className="min-h-screen bg-court-mist lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-court-navy/10 bg-court-navy text-white transition lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/15 px-4">
          <EmblemKR size={36} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
              {t.orgShort}
            </div>
            <div className="truncate text-sm font-semibold">
              {t.admin.cabinet}
            </div>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium",
                  active
                    ? "border-white bg-white/10 text-white"
                    : "border-transparent text-white/75 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/15 p-4">
          <div className="mb-3">
            <div className="truncate text-sm font-semibold">
              {currentUser.fullName}
            </div>
            <div className="truncate text-xs text-white/55">
              {roleLabel[currentUser.role]} · {currentUser.position}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="flex w-full items-center justify-center gap-2 border border-white/25 px-3 py-2 text-sm font-medium hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            {t.admin.logout}
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Закрыть меню"
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-court-line bg-white/90 px-3 backdrop-blur sm:h-16 sm:px-4 md:px-6">
          <button
            type="button"
            className="btn-outline !px-3 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Меню"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 truncate text-sm text-court-muted">
            Цифровая платформа приёма граждан
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LangSwitch />
            <Link href="/" className="btn-ghost !px-2 text-sm sm:!px-3">
              {t.admin.portal}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
