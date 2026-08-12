import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-court-line bg-white px-6 py-12 text-center",
        className
      )}
    >
      <Icon className="mb-3 h-8 w-8 text-court-muted" />
      <h3 className="text-base font-semibold text-court-navy">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-court-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
