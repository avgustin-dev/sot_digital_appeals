import { backend } from "@/api/client";
import { ApiError } from "@/api/http";
import { useRemoteApi } from "@/config/env";
import type {
  AppealCard,
  Appointment,
  PublicAppointment,
  PublicAppointmentLookup,
} from "@/api/dto";
import type { StaffProfile } from "./staff";
import { mergeServiceContent } from "./serviceContent";

type BookInput = {
  fullName: string;
  phone: string;
  email?: string;
  topic: string;
  category: Appointment["category"];
  description?: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  targetId: string;
  companions?: { fullName: string; phone?: string }[];
};

type ResultOk = { ok: true };
type ResultErr = { ok: false; error: string };

function fail(e: unknown): ResultErr {
  if (e instanceof ApiError) return { ok: false, error: e.message };
  return { ok: false, error: "Сервис временно недоступен" };
}

export function withPin(
  apt: PublicAppointment,
  pin = ""
): Appointment {
  return {
    ...apt,
    pin,
    companions: apt.companions ?? [],
    history: apt.history ?? [],
  };
}

/** Публичный lookup не содержит поручение/протокол — не затираем карточку кабинета. */
function applyPublicLookup(
  store: StoreSlice,
  data: PublicAppointmentLookup,
  pin = ""
): { appointment: Appointment; appeal: AppealCard } {
  const apt = withPin(data.appointment, pin);
  store.upsertAppointment(apt);
  const existing = store.getAppealByCode(apt.code);
  const appeal: AppealCard = {
    id: existing?.id ?? apt.id,
    appointmentId: existing?.appointmentId ?? apt.id,
    code: apt.code,
    stage: data.appealStage || existing?.stage || "registered",
    fullName: apt.fullName,
    phone: apt.phone,
    email: apt.email,
    topic: apt.topic,
    category: apt.category,
    summary: existing?.summary || apt.topic,
    previousAppealIds: existing?.previousAppealIds ?? [],
    previousNotes: existing?.previousNotes ?? "",
    prepNotes: existing?.prepNotes ?? "",
    prepCompletedBy: existing?.prepCompletedBy,
    prepCompletedAt: existing?.prepCompletedAt,
    receptionProtocol: existing?.receptionProtocol,
    assignment: existing?.assignment,
    controlLog: existing?.controlLog ?? [],
    finalAnswer: existing?.finalAnswer,
    finalAnswerAt: existing?.finalAnswerAt,
    createdAt: existing?.createdAt ?? apt.createdAt,
    updatedAt: apt.updatedAt,
    feedback: data.feedback ?? existing?.feedback,
    notifications: data.latestNotification
      ? [
          {
            id: existing?.notifications?.[0]?.id ?? "n-latest",
            at: apt.updatedAt,
            channel: apt.email ? "email" : "system",
            title: data.latestNotification.title,
            body: data.latestNotification.body,
            read: true,
          },
        ]
      : existing?.notifications ?? [],
  };
  store.upsertAppeal(appeal);
  return { appointment: apt, appeal };
}

interface StoreSlice {
  upsertAppointment: (apt: Appointment) => void;
  upsertAppeal: (apl: AppealCard) => void;
  replaceStaffLists: (payload: {
    appointments?: Appointment[];
    appeals?: AppealCard[];
    staff?: import("./types").StaffUser[];
    calendar?: import("./types").CalendarSettings;
    surveyResponses?: import("./types").SurveyResponse[];
  }) => void;
  bookAppointment: (
    input: BookInput
  ) =>
    | { ok: true; appointment: Appointment; pin: string }
    | ResultErr;
  confirmAppointmentRequest: (
    appointmentId: string,
    user: StaffProfile,
    note?: string
  ) => ResultOk | ResultErr;
  rejectAppointmentRequest: (
    appointmentId: string,
    user: StaffProfile,
    reason: string
  ) => ResultOk | ResultErr;
  findAppointment: (code: string, pin: string) => Appointment | null;
  lookupByCode: (code: string) => {
    appointment: Appointment;
    appeal?: AppealCard;
  } | null;
  recoverCodesByPhone: (phone: string) => string[];
  cancelAppointment: (code: string, pin: string) => ResultOk | ResultErr;
  rescheduleAppointment: (
    code: string,
    pin: string,
    date: string,
    slotStart: string,
    slotEnd: string
  ) => ResultOk | ResultErr;
  staffCancelAppointment: (
    appointmentId: string,
    user: StaffProfile,
    reason?: string
  ) => ResultOk | ResultErr;
  staffRestoreAppointment: (
    appointmentId: string,
    user: StaffProfile
  ) => ResultOk | ResultErr;
  staffSetAppointmentStatus: (
    appointmentId: string,
    status: Appointment["status"],
    user: StaffProfile,
    note?: string
  ) => ResultOk | ResultErr;
  staffRescheduleAppointment: (
    appointmentId: string,
    date: string,
    slotStart: string,
    slotEnd: string,
    user: StaffProfile
  ) => ResultOk | ResultErr;
  staffUpdateCitizenData: (
    appointmentId: string,
    patch: Partial<
      Pick<
        Appointment,
        "fullName" | "phone" | "email" | "topic" | "category" | "description"
      >
    >,
    user: StaffProfile
  ) => ResultOk | ResultErr;
  staffSetAppealStage: (
    appealId: string,
    stage: AppealCard["stage"],
    user: StaffProfile,
    note?: string
  ) => ResultOk | ResultErr;
  startPrep: (appealId: string, user: StaffProfile) => void;
  completePrep: (
    appealId: string,
    user: StaffProfile,
    data: {
      summary: string;
      prepNotes: string;
      category: Appointment["category"];
    }
  ) => void;
  markReadyForReception: (appealId: string) => void;
  completeReception: (
    appealId: string,
    user: StaffProfile,
    protocol: Omit<
      import("./types").ReceptionProtocol,
      "heldAt" | "heldBy"
    >
  ) => void;
  addControlLog: (
    appealId: string,
    user: StaffProfile,
    action: string,
    comment: string
  ) => void;
  setAssignmentStatus: (
    appealId: string,
    status: "open" | "in_progress" | "done" | "overdue"
  ) => void;
  submitFinalAnswer: (
    appealId: string,
    user: StaffProfile,
    answer: string
  ) => void;
  submitFeedback: (
    code: string,
    feedback: Omit<import("./types").Feedback, "submittedAt">
  ) => ResultOk | ResultErr;
  getAppealByCode: (code: string) => AppealCard | undefined;
  updateCalendar: (patch: Partial<import("./types").CalendarSettings>) => void;
  updateServiceContent: (
    patch: Partial<import("./types").ServiceContent>
  ) => void;
  resetServiceContent: () => void;
  setEligibilityTree: (tree: import("./types").EligibilityTreeNode[]) => void;
  patchEligibilityNode: (
    id: string,
    patch: Partial<import("./types").EligibilityTreeNode>
  ) => void;
  removeEligibilityNode: (id: string) => void;
  addEligibilityNode: (
    parentId: string | null,
    node: import("./types").EligibilityTreeNode
  ) => void;
  resetEligibilityTree: () => void;
  updateSurveyMeta: (patch: Partial<import("./types").SurveyMeta>) => void;
  saveSurveyQuestion: (q: import("./types").SurveyQuestion) => void;
  deleteSurveyQuestion: (id: string) => void;
  reorderSurveyQuestion: (id: string, dir: "up" | "down") => void;
  resetSurveyQuestions: () => void;
  calendar: import("./types").CalendarSettings;
  surveyMeta: import("./types").SurveyMeta;
  surveyQuestions: import("./types").SurveyQuestion[];
  eligibilityTree: import("./types").EligibilityTreeNode[];
};

async function refreshLists(store: StoreSlice) {
  const [appointments, appeals] = await Promise.all([
    backend.staff.appointments(),
    backend.staff.appeals(),
  ]);
  store.replaceStaffLists({
    appointments: appointments.map((a) => withPin(a)),
    appeals,
  });
}

async function persistSurvey(getState: () => StoreSlice) {
  const s = getState();
  await backend.staff.putSurvey({
    meta: s.surveyMeta,
    questions: s.surveyQuestions,
  });
}

async function persistEligibility(store: StoreSlice, getState: () => StoreSlice) {
  const nodes = await backend.staff.putEligibility(getState().eligibilityTree);
  store.setEligibilityTree(nodes);
}

let surveyMetaTimer: ReturnType<typeof setTimeout> | undefined;

export function wrapRemote(
  store: StoreSlice,
  getState: () => StoreSlice = () => store
) {
  return {
    bookAppointment: async (input: BookInput) => {
      if (!useRemoteApi) return store.bookAppointment(input);
      try {
        const res = await backend.public.book(input);
        const apt = withPin(res.appointment, res.pin);
        store.upsertAppointment(apt);
        return { ok: true as const, appointment: apt, pin: res.pin };
      } catch (e) {
        return fail(e);
      }
    },

    findAppointment: async (code: string, pin: string) => {
      if (!useRemoteApi) return store.findAppointment(code, pin);
      try {
        const apt = await backend.public.unlock(code, { pin });
        const local = withPin(apt, pin);
        store.upsertAppointment(local);
        try {
          const data = await backend.public.lookup(code);
          applyPublicLookup(store, data, pin);
        } catch {
          /* карточка обращения — отдельно; запись уже открыта */
        }
        return local;
      } catch {
        return null;
      }
    },

    lookupByCode: async (code: string) => {
      if (!useRemoteApi) return store.lookupByCode(code);
      try {
        const data = await backend.public.lookup(code);
        return applyPublicLookup(store, data);
      } catch {
        return null;
      }
    },

    recoverCodesByPhone: async (phone: string) => {
      if (!useRemoteApi) return store.recoverCodesByPhone(phone);
      try {
        const res = await backend.public.recover({ phone });
        return res.codes;
      } catch {
        return [];
      }
    },

    cancelAppointment: async (code: string, pin: string) => {
      if (!useRemoteApi) return store.cancelAppointment(code, pin);
      try {
        const apt = await backend.public.actions(code, { pin, action: "cancel" });
        store.upsertAppointment(withPin(apt, pin));
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    rescheduleAppointment: async (
      code: string,
      pin: string,
      date: string,
      slotStart: string,
      slotEnd: string
    ) => {
      if (!useRemoteApi)
        return store.rescheduleAppointment(code, pin, date, slotStart, slotEnd);
      try {
        const apt = await backend.public.actions(code, {
          pin,
          action: "reschedule",
          date,
          slotStart,
          slotEnd,
        });
        store.upsertAppointment(withPin(apt, pin));
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    submitFeedback: async (
      code: string,
      feedback: Omit<import("./types").Feedback, "submittedAt">
    ) => {
      if (!useRemoteApi) return store.submitFeedback(code, feedback);
      try {
        await backend.public.feedback(code, feedback);
        const submitted = {
          ...feedback,
          submittedAt: new Date().toISOString(),
        };
        const existing = store.getAppealByCode(code);
        if (existing) {
          store.upsertAppeal({ ...existing, feedback: submitted });
        } else {
          try {
            const data = await backend.public.lookup(code);
            const { appeal } = applyPublicLookup(store, data);
            store.upsertAppeal({ ...appeal, feedback: submitted });
          } catch {
            /* оценка на сервере есть, локальная карточка подтянется при следующем lookup */
          }
        }
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    confirmAppointmentRequest: async (
      appointmentId: string,
      user: StaffProfile,
      note?: string
    ) => {
      if (!useRemoteApi)
        return store.confirmAppointmentRequest(appointmentId, user, note);
      try {
        await backend.staff.confirm(appointmentId, { note });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    rejectAppointmentRequest: async (
      appointmentId: string,
      user: StaffProfile,
      reason: string
    ) => {
      if (!useRemoteApi)
        return store.rejectAppointmentRequest(appointmentId, user, reason);
      try {
        await backend.staff.reject(appointmentId, { reason });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    staffCancelAppointment: async (
      appointmentId: string,
      user: StaffProfile,
      reason?: string
    ) => {
      if (!useRemoteApi)
        return store.staffCancelAppointment(appointmentId, user, reason);
      try {
        await backend.staff.cancel(appointmentId, { reason });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    staffRestoreAppointment: async (
      appointmentId: string,
      user: StaffProfile
    ) => {
      if (!useRemoteApi)
        return store.staffRestoreAppointment(appointmentId, user);
      try {
        await backend.staff.restore(appointmentId);
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    staffSetAppointmentStatus: async (
      appointmentId: string,
      status: Appointment["status"],
      user: StaffProfile,
      note?: string
    ) => {
      if (!useRemoteApi)
        return store.staffSetAppointmentStatus(appointmentId, status, user, note);
      try {
        await backend.staff.setStatus(appointmentId, { status, note });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    staffRescheduleAppointment: async (
      appointmentId: string,
      date: string,
      slotStart: string,
      slotEnd: string,
      user: StaffProfile
    ) => {
      if (!useRemoteApi)
        return store.staffRescheduleAppointment(
          appointmentId,
          date,
          slotStart,
          slotEnd,
          user
        );
      try {
        await backend.staff.reschedule(appointmentId, {
          date,
          slotStart,
          slotEnd,
        });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    staffUpdateCitizenData: async (
      appointmentId: string,
      patch: Partial<
        Pick<
          Appointment,
          "fullName" | "phone" | "email" | "topic" | "category" | "description"
        >
      >,
      user: StaffProfile
    ) => {
      if (!useRemoteApi)
        return store.staffUpdateCitizenData(appointmentId, patch, user);
      try {
        await backend.staff.patchAppointment(appointmentId, patch);
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    staffSetAppealStage: async (
      appealId: string,
      stage: AppealCard["stage"],
      user: StaffProfile,
      note?: string
    ) => {
      if (!useRemoteApi)
        return store.staffSetAppealStage(appealId, stage, user, note);
      try {
        await backend.staff.setStage(appealId, { stage, note });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    startPrep: async (appealId: string, user: StaffProfile) => {
      if (!useRemoteApi) {
        store.startPrep(appealId, user);
        return { ok: true as const };
      }
      try {
        await backend.staff.setStage(appealId, { stage: "under_review" });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    completePrep: async (
      appealId: string,
      user: StaffProfile,
      data: {
        summary: string;
        prepNotes: string;
        category: Appointment["category"];
      }
    ) => {
      if (!useRemoteApi) {
        store.completePrep(appealId, user, data);
        return { ok: true as const };
      }
      try {
        await backend.staff.completePrep(appealId, data);
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    markReadyForReception: async (appealId: string) => {
      if (!useRemoteApi) {
        store.markReadyForReception(appealId);
        return { ok: true as const };
      }
      try {
        await backend.staff.markReady(appealId);
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    completeReception: async (
      appealId: string,
      user: StaffProfile,
      protocol: Omit<import("./types").ReceptionProtocol, "heldAt" | "heldBy">
    ) => {
      if (!useRemoteApi) {
        store.completeReception(appealId, user, protocol);
        return { ok: true as const };
      }
      try {
        await backend.staff.completeReception(appealId, protocol);
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    addControlLog: async (
      appealId: string,
      user: StaffProfile,
      action: string,
      comment: string
    ) => {
      if (!useRemoteApi) {
        store.addControlLog(appealId, user, action, comment);
        return { ok: true as const };
      }
      try {
        await backend.staff.addControlLog(appealId, { action, comment });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    setAssignmentStatus: async (
      appealId: string,
      status: "open" | "in_progress" | "done" | "overdue"
    ) => {
      if (!useRemoteApi) {
        store.setAssignmentStatus(appealId, status);
        return { ok: true as const };
      }
      try {
        await backend.staff.setAssignmentStatus(appealId, { status });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    submitFinalAnswer: async (
      appealId: string,
      user: StaffProfile,
      answer: string
    ) => {
      if (!useRemoteApi) {
        store.submitFinalAnswer(appealId, user, answer);
        return { ok: true as const };
      }
      try {
        await backend.staff.submitAnswer(appealId, { answer });
        await refreshLists(store);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    updateCalendar: async (
      patch: Partial<import("./types").CalendarSettings>
    ) => {
      if (!useRemoteApi) {
        store.updateCalendar(patch);
        return { ok: true as const };
      }
      try {
        const next = { ...getState().calendar, ...patch };
        const saved = await backend.staff.putCalendar(next);
        store.replaceStaffLists({ calendar: saved });
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    updateServiceContent: async (
      patch: Partial<import("./types").ServiceContent>
    ) => {
      if (!useRemoteApi) {
        store.updateServiceContent(patch);
        return { ok: true as const };
      }
      try {
        const saved = await backend.staff.putContent(
          patch as import("./types").ServiceContent
        );
        store.updateServiceContent(saved ?? patch);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    resetServiceContent: async () => {
      const factory = mergeServiceContent();
      if (!useRemoteApi) {
        store.resetServiceContent();
        return { ok: true as const };
      }
      try {
        const saved = await backend.staff.putContent(factory);
        store.updateServiceContent(saved ?? factory);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    setEligibilityTree: async (
      tree: import("./types").EligibilityTreeNode[]
    ) => {
      if (!useRemoteApi) {
        store.setEligibilityTree(tree);
        return { ok: true as const };
      }
      try {
        const nodes = await backend.staff.putEligibility(tree);
        store.setEligibilityTree(nodes);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    patchEligibilityNode: async (
      id: string,
      patch: Partial<import("./types").EligibilityTreeNode>
    ) => {
      store.patchEligibilityNode(id, patch);
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistEligibility(store, getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    removeEligibilityNode: async (id: string) => {
      store.removeEligibilityNode(id);
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistEligibility(store, getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    addEligibilityNode: async (
      parentId: string | null,
      node: import("./types").EligibilityTreeNode
    ) => {
      store.addEligibilityNode(parentId, node);
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistEligibility(store, getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    resetEligibilityTree: async () => {
      store.resetEligibilityTree();
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistEligibility(store, getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    updateSurveyMeta: async (
      patch: Partial<import("./types").SurveyMeta>
    ) => {
      store.updateSurveyMeta(patch);
      if (!useRemoteApi) return { ok: true as const };
      if (surveyMetaTimer) clearTimeout(surveyMetaTimer);
      surveyMetaTimer = setTimeout(() => {
        void persistSurvey(getState).catch(() => undefined);
      }, 700);
      return { ok: true as const };
    },

    saveSurveyQuestion: async (q: import("./types").SurveyQuestion) => {
      store.saveSurveyQuestion(q);
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistSurvey(getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    deleteSurveyQuestion: async (id: string) => {
      store.deleteSurveyQuestion(id);
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistSurvey(getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    reorderSurveyQuestion: async (id: string, dir: "up" | "down") => {
      store.reorderSurveyQuestion(id, dir);
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistSurvey(getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    resetSurveyQuestions: async () => {
      store.resetSurveyQuestions();
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistSurvey(getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },

    pushSurvey: async () => {
      if (!useRemoteApi) return { ok: true as const };
      try {
        await persistSurvey(getState);
        return { ok: true as const };
      } catch (e) {
        return fail(e);
      }
    },
  };
}
