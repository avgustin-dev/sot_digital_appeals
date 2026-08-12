import { cn } from "@/lib/utils";

export function ProgressSteps({
  steps,
  current,
}: {
  steps: { title: string; desc?: string }[];
  current: number;
}) {
  return (
    <ol className="grid gap-0 border border-court-line md:grid-cols-3 xl:grid-cols-6">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step.title}
            className={cn(
              "border-b border-court-line p-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0",
              active && "bg-court-light",
              done && "bg-white"
            )}
          >
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center border text-xs font-semibold",
                  active || done
                    ? "border-court-blue bg-court-blue text-white"
                    : "border-court-line bg-white text-court-muted"
                )}
              >
                {i + 1}
              </span>
              <span className="text-sm font-semibold text-court-ink">
                {step.title}
              </span>
            </div>
            {step.desc && (
              <p className="pl-8 text-xs leading-relaxed text-court-muted">
                {step.desc}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
