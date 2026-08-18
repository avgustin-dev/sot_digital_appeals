import type { AppealCategory, AppealStage, AppointmentStatus } from "./types";
import { catalog } from "./catalog";

const d = catalog.dictionaries;

export const APP_NAME = d.appName;
export const ORG_NAME = d.orgName;
export const ORG_SHORT = d.orgShort;

export const CATEGORY_LABELS = d.categories as Record<AppealCategory, string>;
export const STAGE_LABELS = d.stages as Record<AppealStage, string>;
export const STATUS_LABELS = d.statuses as Record<AppointmentStatus, string>;

export const STAGE_ORDER: AppealStage[] = [
  "registered",
  "under_review",
  "ready_for_reception",
  "reception_done",
  "in_control",
  "answered",
  "closed",
];

export const PIPELINE_STEPS = d.pipeline;
export const RECEPTION_ALLOWED = d.allowed;
export const RECEPTION_FORBIDDEN = d.forbidden;
export const REGIONS_KR = d.regions;
export const COURT_CONTACTS = d.contacts;
export const LEADERSHIP_RECEPTION_SCHEDULE = d.leadershipSchedule;
export const RECEPTION_TARGETS = d.receptionTargets;
export const APPLICANT_TYPES = d.applicantTypes;
export const FEEDBACK_QUESTIONS = d.feedbackQuestions as {
  key: "convenient" | "clearNextSteps" | "respectful" | "deadlinesMet";
  label: string;
  labelKy: string;
}[];
