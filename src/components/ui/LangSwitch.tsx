"use client";

import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  const btn = (code: Lang, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLang(code)}
      className={cn(
        "px-2 py-0.5 text-xs font-semibold uppercase",
        lang === code
          ? "bg-court-blue text-white"
          : "text-court-muted hover:text-court-blue"
      )}
      aria-pressed={lang === code}
      aria-label={label}
    >
      {code === "ky" ? "КЫР" : "РУС"}
    </button>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center border border-court-line bg-white",
        className
      )}
      role="group"
      aria-label="Тил / Язык"
    >
      {btn("ky", "Кыргызча")}
      <span className="h-3 w-px bg-court-line" aria-hidden />
      {btn("ru", "Русский")}
    </div>
  );
}
