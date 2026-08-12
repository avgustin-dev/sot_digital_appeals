import { cn } from "@/lib/utils";

/**
 * mode="bar" — полоса с подписями (по умолчанию)
 * mode="dots" — круги 1–N как у qabul.sud.uz
 */
export function WizardSteps({
  steps,
  current,
  mode = "bar",
}: {
  steps: string[];
  current: number;
  mode?: "bar" | "dots";
}) {
  if (mode === "dots") {
    return (
      <div className="w-full">
        <ol className="mx-auto flex max-w-md items-center justify-center gap-0">
          {steps.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      active || done
                        ? "border-court-blue bg-court-blue text-white"
                        : "border-court-line bg-white text-court-muted"
                    )}
                    title={label}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 hidden max-w-[4.5rem] text-center text-[10px] leading-tight sm:block",
                      active ? "font-semibold text-court-blue" : "text-court-muted"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "mx-1 mb-4 h-0.5 w-4 sm:mx-2 sm:w-6 sm:mb-5",
                      i < current ? "bg-court-blue" : "bg-court-line"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-0 border border-court-line sm:flex-row sm:divide-x sm:divide-court-line">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            className={cn(
              "flex flex-1 items-center gap-2 border-b border-court-line px-3 py-2.5 last:border-b-0 sm:border-b-0",
              active && "bg-court-light",
              done && "bg-white"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center border text-xs font-semibold",
                active || done
                  ? "border-court-blue bg-court-blue text-white"
                  : "border-court-line text-court-muted"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium sm:text-sm",
                active ? "text-court-blue" : "text-court-muted"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
