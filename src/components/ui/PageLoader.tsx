import { EmblemKR } from "@/components/brand/Emblem";

/**
 * Загрузка в стиле судебных порталов: эмблема ВС и золотое кольцо.
 * Не квадрат с обрывом рамки.
 */
export function PageLoader({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-16">
      <div
        className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <span
          className="court-loader-ring absolute inset-0 rounded-full"
          aria-hidden
        />
        <span
          className="absolute inset-1.5 rounded-full border border-court-navy/15"
          aria-hidden
        />
        <EmblemKR size={36} />
      </div>
      <p className="text-sm text-court-muted">{label}</p>
    </div>
  );
}
