"use client";

import { useEffect } from "react";
import Link from "next/link";

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

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-court-navy">
        Сервис временно недоступен
      </h1>
      <p className="mt-2 max-w-md text-sm text-court-muted">
        Повторите попытку. Если ошибка сохраняется, обратитесь в общественную
        приёмную.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={reset}>
          Повторить
        </button>
        <Link href="/" className="btn-outline">
          На главную
        </Link>
      </div>
    </div>
  );
}
