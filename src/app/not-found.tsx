import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-court-muted">404</p>
      <h1 className="mt-1 text-xl font-semibold text-court-navy">
        Страница не найдена
      </h1>
      <p className="mt-2 max-w-md text-sm text-court-muted">
        Проверьте адрес или вернитесь в раздел приёма граждан.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          На главную
        </Link>
        <Link href="/book" className="btn-outline">
          Запись на приём
        </Link>
      </div>
    </div>
  );
}
