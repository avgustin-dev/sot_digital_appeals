"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ReceptionTabs({ isKy }: { isKy?: boolean }) {
  const pathname = usePathname();
  const schedule = pathname.startsWith("/admin/calendar");
  const items = [
    {
      href: "/admin/reception",
      label: isKy ? "Кезек" : "Очередь",
      hint: isKy ? "Даярдоо жана протокол" : "Подготовка и протокол",
      active: pathname.startsWith("/admin/reception"),
    },
    {
      href: "/admin/calendar",
      label: isKy ? "Расписание" : "Расписание",
      hint: isKy ? "Күн боюнча" : "По дням",
      active: schedule,
    },
  ];
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "min-w-[140px] flex-1 rounded-md px-3 py-2 text-center transition",
            item.active
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <span className="block text-sm font-semibold">{item.label}</span>
          <span className="block text-[11px] text-slate-500">{item.hint}</span>
        </Link>
      ))}
    </div>
  );
}
