import { cn } from "@/lib/utils";
import type { AppealStage, AppointmentStatus } from "@/lib/types";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/constants";

const stageTone: Record<AppealStage, string> = {
  registered: "border-slate-300 bg-slate-50 text-slate-800",
  under_review: "border-slate-400 bg-slate-100 text-slate-900",
  ready_for_reception: "border-court-navy/30 bg-court-light text-court-navy",
  reception_done: "border-court-navy/40 bg-court-light text-court-navy",
  in_control: "border-amber-300 bg-amber-50 text-amber-950",
  answered: "border-emerald-300 bg-emerald-50 text-emerald-900",
  closed: "border-slate-300 bg-slate-100 text-slate-700",
  cancelled: "border-red-300 bg-red-50 text-red-900",
};

const statusTone: Record<AppointmentStatus, string> = {
  confirmed: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rescheduled: "border-amber-300 bg-amber-50 text-amber-950",
  cancelled: "border-red-300 bg-red-50 text-red-900",
  completed: "border-slate-300 bg-slate-100 text-slate-700",
  no_show: "border-orange-300 bg-orange-50 text-orange-950",
};

export function StageBadge({ stage }: { stage: AppealStage }) {
  return (
    <span className={cn("badge border", stageTone[stage])}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn("badge border", statusTone[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function SoftBadge({
  children,
  tone = "navy",
}: {
  children: React.ReactNode;
  tone?: "navy" | "gold" | "muted";
}) {
  const map = {
    navy: "border-court-line bg-court-light text-court-navy",
    gold: "border-court-gold/40 bg-court-goldPale text-court-navy",
    muted: "border-court-line bg-slate-50 text-slate-600",
  };
  return <span className={cn("badge border", map[tone])}>{children}</span>;
}
