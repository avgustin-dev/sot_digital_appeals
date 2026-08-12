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
  FilePenLine,
  ChartColumn,
  ExternalLink,
  GitBranch,
  BookOpen,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/PageLoader";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { useI18n } from "@/lib/i18n";
import { EmblemKR } from "@/components/brand/Emblem";
import type { AdminModule } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  hint?: string;
};

export function StaffShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, ready, setAdminModule } = useStore();
  const { lang } = useI18n();
  const isKy = lang === "ky";
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const module: AdminModule = pathname.startsWith("/admin/survey")
    ? "survey"
    : "reception";

  useEffect(() => {
    if (pathname.startsWith("/admin/survey")) setAdminModule("survey");
    else if (pathname.startsWith("/admin") && pathname !== "/admin/login")
      setAdminModule("reception");
  }, [pathname, setAdminModule]);

  const receptionNav: NavItem[] = useMemo(
    () => [
      { href: "/admin", label: isKy ? "Бүгүн" : "Рабочий стол", icon: LayoutDashboard, exact: true, hint: isKy ? "Эмне кылуу керек" : "Что сделать сегодня" },
      { href: "/admin/calendar", label: isKy ? "Жазылуулар" : "Записи и календарь", icon: CalendarDays, hint: isKy ? "Ким качан" : "Кто и когда" },
      { href: "/admin/appeals", label: isKy ? "Кайрылуулар" : "Обращения", icon: FileText, hint: isKy ? "Бардык карточкалар" : "Все карточки" },
      { href: "/admin/reception", label: isKy ? "Даярдоо / кабыл алуу" : "Подготовка и приём", icon: Users, hint: isKy ? "Этап 2–3" : "Этапы 2–3" },
      { href: "/admin/control", label: isKy ? "Көзөмөл" : "Контроль поручений", icon: ClipboardCheck, hint: isKy ? "Этап 4" : "Этап 4" },
      { href: "/admin/analytics", label: isKy ? "Мониторинг" : "Мониторинг", icon: BarChart3, hint: isKy ? "Кайталанмалар" : "Повторные обращения" },
      { href: "/admin/content", label: isKy ? "Контент сервиса" : "Контент сервиса", icon: FilePenLine, hint: isKy ? "Тексттер, эрежелер" : "Тексты, правила" },
      { href: "/admin/eligibility", label: isKy ? "Дарак допуску" : "Дерево допуска", icon: GitBranch, hint: isKy ? "Категориялар жазылуу" : "Категории записи" },
      { href: "/admin/settings", label: isKy ? "График" : "График приёма", icon: Settings, hint: isKy ? "Күндөр жана слоттор" : "Дни и слоты" },
      { href: "/admin/help", label: isKy ? "Нускама" : "Инструкция", icon: BookOpen, hint: isKy ? "Кызматкерлер үчүн" : "Для сотрудников — по шагам" },
    ],
    [isKy]
  );

  const surveyNav: NavItem[] = useMemo(
    () => [
      { href: "/admin/survey", label: isKy ? "Суроолор" : "Вопросы анкеты", icon: ClipboardList, exact: true, hint: isKy ? "Түзөтүү" : "Редактирование" },
      { href: "/admin/survey/results", label: isKy ? "Жыйынтыктар" : "Результаты", icon: ChartColumn, hint: isKy ? "Статистика" : "Статистика ответов" },
    ],
    [isKy]
  );

  const nav = module === "survey" ? surveyNav : receptionNav;

  useEffect(() => {
    if (ready && !currentUser && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [ready, currentUser, pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <PageLoader label="Загрузка служебного кабинета…" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <PageLoader label="Перенаправление…" />
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    admin: "Администратор",
    reception: isKy ? "Кабыл алуу" : "Приёмная",
    leadership: isKy ? "Жетекчилик" : "Руководство",
    responsible: isKy ? "Жооптуу" : "Ответственный",
  };

  function switchModule(m: AdminModule) {
    setAdminModule(m);
    setOpen(false);
    router.push(m === "survey" ? "/admin/survey" : "/admin");
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[88vw] flex-col border-r border-slate-200/80 bg-white shadow-sm transition duration-200 ease-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex min-h-[4.5rem] shrink-0 items-center gap-3 border-b border-slate-100 px-3 py-2.5">
          <EmblemKR size={42} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold leading-snug text-slate-800 sm:text-[11px]">
              {isKy
                ? "Кыргыз Республикасынын Жогорку соту"
                : "Верховный суд Кыргызской Республики"}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-500">
              {isKy ? "Кызматтык кабинет" : "Служебный кабинет"}
            </div>
          </div>
          <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {isKy ? "Модуль" : "Рабочее пространство"}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => switchModule("reception")} className={cn("rounded-md px-2 py-2 text-xs font-semibold transition", module === "reception" ? "bg-white text-court-navy shadow-sm" : "text-slate-500 hover:text-slate-800")}>
              {isKy ? "Кабыл алуу" : "Приём граждан"}
            </button>
            <button type="button" onClick={() => switchModule("survey")} className={cn("rounded-md px-2 py-2 text-xs font-semibold transition", module === "survey" ? "bg-white text-court-navy shadow-sm" : "text-slate-500 hover:text-slate-800")}>
              {isKy ? "Сурамжылоо" : "Опросник"}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-150", active ? "bg-court-navy text-white shadow-sm" : "text-slate-700 hover:bg-slate-50")}>
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "opacity-95" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="min-w-0">
                  <span className="block font-medium leading-snug">{item.label}</span>
                  {item.hint && <span className={cn("mt-0.5 block text-[11px] leading-snug", active ? "text-white/70" : "text-slate-400")}>{item.hint}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
            <div className="truncate text-sm font-semibold text-slate-900">{currentUser.fullName}</div>
            <div className="truncate text-xs text-slate-500">{roleLabel[currentUser.role]} · {currentUser.position}</div>
          </div>
          <button type="button" onClick={() => { logout(); router.push("/admin/login"); }} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <LogOut className="h-4 w-4" />
            {isKy ? "Чыгуу" : "Выход"}
          </button>
        </div>
      </aside>

      {open && (
        <button type="button" className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] transition lg:hidden" onClick={() => setOpen(false)} aria-label="Закрыть меню" />
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-md sm:h-16 sm:px-5">
          <button type="button" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 lg:hidden" onClick={() => setOpen(true)} aria-label="Меню">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {module === "survey" ? (isKy ? "Модуль: сурамжылоо" : "Модуль: опросник судов") : isKy ? "Модуль: жарандарды кабыл алуу" : "Модуль: приём граждан"}
            </div>
            <div className="hidden truncate text-xs text-slate-500 sm:block">
              {isKy ? "Расмий кызматтык кабинет · демо" : "Официальный служебный кабинет · демо"}
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LangSwitch />
            <Link href={module === "survey" ? "/survey" : "/"} className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
              <ExternalLink className="h-3.5 w-3.5" />
              {module === "survey" ? (isKy ? "Анкета" : "Анкета") : isKy ? "Бөлүм" : "Раздел граждан"}
            </Link>
          </div>
        </header>
        <main className="admin-page-enter flex-1 p-3 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
