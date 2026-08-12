"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function CitizenHubNav() {
  const { t, lang } = useI18n();
  const isKy = lang === "ky";

  const items = [
    { href: "/book", label: t.hub.book, desc: t.hub.bookDesc },
    { href: "/my-appointment", label: t.hub.my, desc: t.hub.myDesc },
    {
      href: "/feedback",
      label: t.hub.feedback,
      desc: isKy
        ? "Онлайн-жазылуу жана кабыл алуу сапаты"
        : "Качество онлайн-записи и приёма",
    },
    { href: "/rules", label: t.hub.rules, desc: t.hub.rulesDesc },
    {
      href: "/process",
      label: isKy ? "Иштөө тартиби (демо)" : "Порядок работы (демо)",
      desc: isKy
        ? "Этаптар — демо-түшүндүрмө"
        : "Этапы рассмотрения — справочный демо-раздел",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="border border-court-line bg-white p-4 transition hover:border-court-navy hover:bg-court-mist"
        >
          <div className="text-sm font-semibold text-court-navy">
            {item.label}
          </div>
          <p className="mt-1 text-sm text-court-muted">{item.desc}</p>
        </Link>
      ))}
    </div>
  );
}
