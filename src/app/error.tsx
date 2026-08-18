"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { shellError } from "@/lib/langCookie";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const { lang } = useI18n();
  const copy = shellError(lang);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-court-navy">{copy.title}</h1>
      <p className="mt-2 max-w-md text-sm text-court-muted">{copy.body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={reset}>
          {copy.retry}
        </button>
        <Link href={routes.home} className="btn-outline">
          {copy.home}
        </Link>
      </div>
    </div>
  );
}
