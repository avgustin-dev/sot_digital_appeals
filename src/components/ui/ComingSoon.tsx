"use client";

import Link from "next/link";
import { EmblemKR } from "@/components/brand/Emblem";
import { useI18n } from "@/lib/i18n";

export function ComingSoon({
  homeHref = "/",
  homeLabel,
}: {
  homeHref?: string;
  homeLabel?: string;
}) {
  const { lang } = useI18n();
  const isKy = lang === "ky";

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-6 md:py-16">
      <div className="rounded-lg border border-court-line bg-white p-8 text-center shadow-sm">
        <EmblemKR size={56} className="mx-auto" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-amber-800">
          {isKy ? "Иштелип жатат" : "В разработке"}
        </p>
        <h1 className="mt-2 text-lg font-semibold text-court-navy">
          {isKy ? "Сурамжылоо" : "Опросник"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-court-muted">
          {isKy
            ? "Бул бөлүм кийинчерээк кошулат."
            : "Этот раздел будет подключён позднее."}
        </p>
        <Link href={homeHref} className="btn-primary mt-6 inline-flex !text-sm">
          {homeLabel ||
            (homeHref === "/admin"
              ? isKy
                ? "Кабыл алуу"
                : "Приём граждан"
              : isKy
                ? "Башкы бет"
                : "На главную")}
        </Link>
      </div>
    </div>
  );
}
