"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function CitizenHubNav() {
  const { t } = useI18n();

  const items = [
    { href: "/book", label: t.hub.book, desc: t.hub.bookDesc },
    { href: "/my-appointment", label: t.hub.my, desc: t.hub.myDesc },
    { href: "/feedback", label: t.hub.feedback, desc: t.hub.feedbackDesc },
    { href: "/survey", label: "Опросник судов", desc: "Анкета оценки работы суда (демо)" },
    { href: "/process", label: t.hub.process, desc: t.hub.processDesc },
    { href: "/rules", label: t.hub.rules, desc: t.hub.rulesDesc },
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
