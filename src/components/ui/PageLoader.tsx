export function PageLoader({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 py-16 text-court-muted">
      <div className="h-8 w-8 animate-pulse border-2 border-court-navy border-t-transparent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
