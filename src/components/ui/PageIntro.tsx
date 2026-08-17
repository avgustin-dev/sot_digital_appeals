export function PageIntro({
  step,
  title,
  lead,
  who,
  whoLabel,
}: {
  step?: string;
  title: string;
  lead: string;
  who?: string;
  whoLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {step && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-court-blue">
          {step}
        </div>
      )}
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h1>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">
        {lead}
      </p>
      {who && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-800">
            {whoLabel || "Ответственные:"}{" "}
          </span>
          {who}
        </p>
      )}
    </div>
  );
}
