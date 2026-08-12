"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

/** Хлебные крошки — только на внутренних страницах (не на главной). */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Навигация"
      className={cn("no-print mb-4 text-sm text-court-muted", className)}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <span className="mx-1 text-court-line" aria-hidden>
                  /
                </span>
              )}
              {last || !item.href ? (
                <span
                  className={cn(
                    "font-medium",
                    last ? "text-court-navy" : "text-court-muted"
                  )}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium text-court-muted transition hover:text-court-navy"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
