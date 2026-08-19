import type { Assignment } from "./types";

export type AssignmentStatus = Assignment["status"];

const LABELS: Record<AssignmentStatus, { ru: string; ky: string }> = {
  open: { ru: "К исполнению", ky: "Аткарууга" },
  in_progress: { ru: "В работе", ky: "Аткарылууда" },
  done: { ru: "Исполнено", ky: "Аткарылды" },
  overdue: { ru: "Просрочено", ky: "Мөөнөтү өттү" },
};

export const ASSIGNMENT_STATUSES: AssignmentStatus[] = [
  "open",
  "in_progress",
  "done",
  "overdue",
];

export function assignmentStatusLabel(
  status: AssignmentStatus,
  isKy = false
): string {
  const row = LABELS[status];
  if (!row) return status;
  return isKy ? row.ky : row.ru;
}
