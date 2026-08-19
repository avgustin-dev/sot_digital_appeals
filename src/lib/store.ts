"use client";

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_CALENDAR,
  SEED_APPEALS,
  SEED_APPOINTMENTS,
  SEED_STAFF,
} from "./seed";
import {
  SEED_SURVEY_META,
  SEED_SURVEY_QUESTIONS,
  SEED_SURVEY_RESPONSES,
} from "./surveySeed";
import { mergeServiceContent } from "./serviceContent";
import {
  addEligibilityChild,
  cloneEligibilityTree,
  deleteEligibilityNode,
  updateEligibilityNode,
  type EligibilityNode,
} from "./eligibility";
import type {
  AppealCard,
  AppealCategory,
  AppealStage,
  Appointment,
  CalendarSettings,
  ControlLogEntry,
  Feedback,
  PlatformState,
  ReceptionProtocol,
  StaffUser,
  SurveyMeta,
  SurveyQuestion,
  SurveyResponse,
  SurveyAnswerValue,
  ServiceContent,
  AdminModule,
  EligibilityTreeNode,
  NotificationItem,
} from "./types";
import { generateCode, generateId, generatePin, matchCitizen } from "./utils";
import { formatDateRu, getAvailableSlotsForDate } from "./slots";
import { targetShort } from "./targets";
import { toStaffProfile, type StaffProfile } from "./staff";
import { clearAccessToken, getAccessToken } from "@/api/session";
import { backend } from "@/api/client";
import { env, useRemoteApi } from "@/config/env";
import { wrapRemote, withPin } from "./storeRemote";

export const STORAGE_KEY = "vs-kr-citizen-platform-demo-v1";
const STATE_VERSION = 10;

function seedEligibilityTree(): EligibilityTreeNode[] {
  return cloneEligibilityTree() as EligibilityTreeNode[];
}

const FALLBACK_ELIGIBILITY = seedEligibilityTree();

export type BookInput = {
  fullName: string;
  phone: string;
  email?: string;
  topic: string;
  category: AppealCategory;
  description?: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  targetId: string;
  companions?: { fullName: string; phone?: string }[];
};

function makeNotice(
  channel: NotificationItem["channel"],
  title: string,
  body: string
): NotificationItem {
  return {
    id: generateId("n"),
    at: new Date().toISOString(),
    channel,
    title,
    body,
    read: false,
  };
}

function citizenNotice(
  email: string | undefined,
  title: string,
  body: string
): NotificationItem {
  return makeNotice(email?.trim() ? "email" : "system", title, body);
}

type ResultOk = { ok: true };
type ResultErr = { ok: false; error: string };

type PlatformStore = PlatformState & {
  login: (login: string, password: string) => ResultOk | ResultErr;
  hydrateStaffSession: (profile: StaffProfile) => void;
  logout: () => void;
  resetDemo: () => void;
  updateCalendar: (patch: Partial<CalendarSettings>) => void;
  bookAppointment: (
    input: BookInput
  ) =>
    | { ok: true; appointment: Appointment; pin: string }
    | ResultErr;
  confirmAppointmentRequest: (
    appointmentId: string,
    user: StaffUser,
    note?: string
  ) => ResultOk | ResultErr;
  rejectAppointmentRequest: (
    appointmentId: string,
    user: StaffUser,
    reason: string
  ) => ResultOk | ResultErr;
  findAppointment: (code: string, pin: string) => Appointment | null;
  /** Публичный статус по коду (без PIN) — только для хаба */
  lookupByCode: (code: string) => {
    appointment: Appointment;
    appeal?: AppealCard;
  } | null;
  /** Восстановление кода по телефону */
  recoverCodesByPhone: (phone: string) => string[];
  cancelAppointment: (code: string, pin: string) => ResultOk | ResultErr;
  rescheduleAppointment: (
    code: string,
    pin: string,
    date: string,
    slotStart: string,
    slotEnd: string
  ) => ResultOk | ResultErr;
  /** Сотрудник: отмена записи (без PIN) */
  staffCancelAppointment: (
    appointmentId: string,
    user: StaffUser,
    reason?: string
  ) => ResultOk | ResultErr;
  /** Сотрудник: вернуть отменённую запись */
  staffRestoreAppointment: (
    appointmentId: string,
    user: StaffUser
  ) => ResultOk | ResultErr;
  /** Сотрудник: статус записи (confirmed / no_show / completed / …) */
  staffSetAppointmentStatus: (
    appointmentId: string,
    status: Appointment["status"],
    user: StaffUser,
    note?: string
  ) => ResultOk | ResultErr;
  /** Сотрудник: перенос даты/времени */
  staffRescheduleAppointment: (
    appointmentId: string,
    date: string,
    slotStart: string,
    slotEnd: string,
    user: StaffUser
  ) => ResultOk | ResultErr;
  /** Сотрудник: правка полей записи + карточки */
  staffUpdateCitizenData: (
    appointmentId: string,
    patch: Partial<
      Pick<
        Appointment,
        "fullName" | "phone" | "email" | "topic" | "category" | "description"
      >
    >,
    user: StaffUser
  ) => ResultOk | ResultErr;
  /** Сотрудник: смена этапа обращения */
  staffSetAppealStage: (
    appealId: string,
    stage: AppealStage,
    user: StaffUser,
    note?: string
  ) => ResultOk | ResultErr;
  updateAppeal: (id: string, patch: Partial<AppealCard>) => void;
  startPrep: (appealId: string, user: StaffUser) => void;
  completePrep: (
    appealId: string,
    user: StaffUser,
    data: { summary: string; prepNotes: string; category: AppealCategory }
  ) => void;
  markReadyForReception: (appealId: string) => void;
  completeReception: (
    appealId: string,
    user: StaffUser,
    protocol: Omit<ReceptionProtocol, "heldAt" | "heldBy">
  ) => void;
  addControlLog: (
    appealId: string,
    user: StaffUser,
    action: string,
    comment: string
  ) => void;
  setAssignmentStatus: (
    appealId: string,
    status: "open" | "in_progress" | "done" | "overdue"
  ) => void;
  submitFinalAnswer: (
    appealId: string,
    user: StaffUser,
    answer: string
  ) => void;
  submitFeedback: (
    code: string,
    feedback: Omit<Feedback, "submittedAt">
  ) => ResultOk | ResultErr;
  getAppealByCode: (code: string) => AppealCard | undefined;
  getPreviousAppeals: (appeal: AppealCard) => AppealCard[];
  getCurrentUser: () => StaffUser | null;
  updateSurveyMeta: (patch: Partial<SurveyMeta>) => void;
  saveSurveyQuestion: (q: SurveyQuestion) => void;
  deleteSurveyQuestion: (id: string) => void;
  reorderSurveyQuestion: (id: string, direction: "up" | "down") => void;
  resetSurveyQuestions: () => void;
  submitSurveyResponse: (
    answers: Record<string, SurveyAnswerValue>,
    courtName?: string
  ) => ResultOk | ResultErr;
  clearSurveyResponses: () => void;
  updateServiceContent: (patch: Partial<ServiceContent>) => void;
  updateBookingRules: (patch: Partial<ServiceContent["rules"]>) => void;
  setAdminModule: (m: AdminModule) => void;
  resetServiceContent: () => void;
  setEligibilityTree: (tree: EligibilityTreeNode[]) => void;
  patchEligibilityNode: (
    id: string,
    patch: Partial<EligibilityNode>
  ) => void;
  removeEligibilityNode: (id: string) => void;
  addEligibilityNode: (
    parentId: string | null,
    node: EligibilityTreeNode
  ) => void;
  resetEligibilityTree: () => void;
  upsertAppointment: (apt: Appointment) => void;
  upsertAppeal: (apl: AppealCard) => void;
  applyBootstrap: (payload: {
    site: ServiceContent;
    eligibilityTree: EligibilityTreeNode[];
    calendar: CalendarSettings;
    survey: { meta: SurveyMeta; questions: SurveyQuestion[] };
  }) => void;
  replaceStaffLists: (payload: {
    appointments?: Appointment[];
    appeals?: AppealCard[];
    staff?: StaffUser[];
    calendar?: CalendarSettings;
    surveyResponses?: SurveyResponse[];
  }) => void;
};

function initialData(): PlatformState {
  return {
    version: STATE_VERSION,
    calendar: DEFAULT_CALENDAR,
    staff: env.demo ? SEED_STAFF : [],
    appointments: env.demo ? SEED_APPOINTMENTS : [],
    appeals: env.demo ? SEED_APPEALS : [],
    session: null,
    surveyMeta: { ...SEED_SURVEY_META },
    surveyQuestions: SEED_SURVEY_QUESTIONS.map((q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o })),
    })),
    surveyResponses: env.demo ? [...SEED_SURVEY_RESPONSES] : [],
    serviceContent: mergeServiceContent(),
    adminModule: "reception",
    eligibilityTree: seedEligibilityTree(),
  };
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set, get) => ({
      ...initialData(),

      getCurrentUser: () => {
        const { session, staff } = get();
        if (!session) return null;
        return staff.find((s) => s.id === session.userId) ?? null;
      },

      login: (loginName, password) => {
        const user = get().staff.find(
          (s) =>
            s.login.toLowerCase() === loginName.trim().toLowerCase() &&
            s.password === password
        );
        if (!user) return { ok: false, error: "Неверный логин или пароль" };
        set({ session: { userId: user.id } });
        return { ok: true };
      },

      hydrateStaffSession: (profile) => {
        set((s) => {
          const others = s.staff.filter((u) => u.id !== profile.id);
          return {
            staff: [...others, { ...profile, password: "" }],
            session: { userId: profile.id },
          };
        });
      },

      logout: () => {
        clearAccessToken();
        set({ session: null });
      },

      resetDemo: () => set({ ...initialData() }),

      updateCalendar: (patch) =>
        set((s) => ({ calendar: { ...s.calendar, ...patch } })),

      bookAppointment: (input) => {
        if (
          !input.fullName.trim() ||
          input.fullName.trim().split(/\s+/).length < 2
        ) {
          return {
            ok: false,
            error: "Укажите полное ФИО (фамилия, имя, отчество)",
          };
        }
        if (!input.topic.trim())
          return { ok: false, error: "Укажите тему приёма" };
        if (!input.phone.trim())
          return { ok: false, error: "Укажите телефон" };
        if (!input.date || !input.slotStart)
          return { ok: false, error: "Выберите дату и время" };
        if (!input.targetId)
          return { ok: false, error: "Укажите, к кому запись" };
        const companions = (input.companions || [])
          .map((c) => ({
            fullName: c.fullName.trim(),
            phone: c.phone?.trim() || undefined,
          }))
          .filter((c) => c.fullName);
        if (companions.length > 2) {
          return {
            ok: false,
            error: "Допускается не более двух сопровождающих.",
          };
        }

        const { calendar, appointments, appeals, serviceContent } = get();
        const free = getAvailableSlotsForDate(
          input.date,
          calendar,
          appointments,
          undefined,
          input.targetId,
          serviceContent
        );
        if (!free.some((s) => s.start === input.slotStart)) {
          return {
            ok: false,
            error: "Выбранный слот недоступен. Выберите другое время.",
          };
        }

        const now = new Date().toISOString();
        const code = generateCode();
        const pin = generatePin();
        const aptId = generateId("apt");
        const aplId = generateId("apl");
        const when = `${formatDateRu(input.date)} ${input.slotStart}–${input.slotEnd}`;
        const who = targetShort(input.targetId, false, get().serviceContent);

        const appointment: Appointment = {
          id: aptId,
          code,
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || undefined,
          pin,
          topic: input.topic.trim(),
          category: input.category,
          description: input.description?.trim(),
          date: input.date,
          slotStart: input.slotStart,
          slotEnd: input.slotEnd,
          status: "pending_review",
          targetId: input.targetId,
          companions,
          createdAt: now,
          updatedAt: now,
          history: [
            {
              at: now,
              action: "Заявка подана",
              detail: `${who}, ${when}. Ожидает решения приёмной.`,
            },
          ],
        };

        const previous = appeals.filter((a) =>
          matchCitizen(a, {
            fullName: input.fullName,
            phone: input.phone,
          })
        );

        const appeal: AppealCard = {
          id: aplId,
          appointmentId: aptId,
          code,
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          email: input.email?.trim() || undefined,
          topic: input.topic.trim(),
          category: input.category,
          summary: input.description?.trim() || input.topic.trim(),
          stage: "registered",
          previousAppealIds: previous.map((p) => p.id),
          previousNotes: previous.length
            ? `Найдено предыдущих обращений: ${previous.length}. Коды: ${previous
                .map((p) => p.code)
                .join(", ")}.`
            : "Предыдущих обращений не обнаружено.",
          prepNotes: "",
          controlLog: [],
          notifications: [
            citizenNotice(
              input.email,
              "Заявка принята на проверку",
              `Заявка ${code} принята общественной приёмной. ${who}, ${when}. Запись вступает в силу после подтверждения. Статус можно проверить на сайте по коду записи.`
            ),
          ],
          createdAt: now,
          updatedAt: now,
        };

        set((s) => ({
          appointments: [appointment, ...s.appointments],
          appeals: [appeal, ...s.appeals],
        }));

        return { ok: true, appointment, pin };
      },

      confirmAppointmentRequest: (appointmentId, user, note) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        if (apt.status !== "pending_review") {
          return { ok: false, error: "Подтвердить можно только заявку на проверке" };
        }
        const now = new Date().toISOString();
        const when = `${formatDateRu(apt.date)} ${apt.slotStart}–${apt.slotEnd}`;
        const who = targetShort(apt.targetId, false, get().serviceContent);
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status: "confirmed" as const,
                  reviewNote: note?.trim() || a.reviewNote,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Заявка подтверждена приёмной",
                      detail: note?.trim() || user.fullName,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === appointmentId
              ? {
                  ...ap,
                  updatedAt: now,
                  notifications: [
                    citizenNotice(
                      apt.email,
                      "Запись подтверждена",
                      `Запись ${ap.code} подтверждена. ${who}, ${when}. Явка — кабинет № 111, документ, удостоверяющий личность.`
                    ),
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      rejectAppointmentRequest: (appointmentId, user, reason) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        if (apt.status !== "pending_review") {
          return { ok: false, error: "Отклонить можно только заявку на проверке" };
        }
        const why = reason.trim();
        if (why.length < 8) {
          return { ok: false, error: "Укажите причину отказа (кратко, официально)." };
        }
        const now = new Date().toISOString();
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status: "rejected" as const,
                  reviewNote: why,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Заявка не подтверждена",
                      detail: `${user.fullName}: ${why}`,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === appointmentId
              ? {
                  ...ap,
                  stage: "cancelled" as AppealStage,
                  updatedAt: now,
                  notifications: [
                    citizenNotice(
                      apt.email,
                      "Запись не подтверждена",
                      `По заявке ${ap.code} запись не подтверждена. ${why}`
                    ),
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      findAppointment: (code, pin) =>
        get().appointments.find(
          (a) =>
            a.code.toUpperCase() === code.trim().toUpperCase() &&
            a.pin === pin.trim()
        ) ?? null,

      lookupByCode: (code) => {
        const appointment = get().appointments.find(
          (a) => a.code.toUpperCase() === code.trim().toUpperCase()
        );
        if (!appointment) return null;
        const appeal = get().appeals.find(
          (a) => a.appointmentId === appointment.id
        );
        return { appointment, appeal };
      },

      recoverCodesByPhone: (phone) => {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 9) return [];
        return get()
          .appointments.filter((a) => {
            const p = a.phone.replace(/\D/g, "");
            return p.endsWith(digits.slice(-9)) || p === digits;
          })
          .filter((a) => a.status !== "cancelled" && a.status !== "rejected")
          .map((a) => a.code);
      },

      cancelAppointment: (code, pin) => {
        const apt = get().findAppointment(code, pin);
        if (!apt)
          return {
            ok: false,
            error: "Запись не найдена. Проверьте код и PIN.",
          };
        if (apt.status === "cancelled")
          return { ok: false, error: "Запись уже отменена." };
        if (apt.status === "completed")
          return {
            ok: false,
            error: "Приём уже проведён — отмена невозможна.",
          };
        if (apt.status === "rejected")
          return { ok: false, error: "Эта заявка уже не подтверждена." };

        const now = new Date().toISOString();
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === apt.id
              ? {
                  ...a,
                  status: "cancelled" as const,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    { at: now, action: "Запись отменена гражданином" },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === apt.id
              ? {
                  ...ap,
                  stage: "cancelled" as AppealStage,
                  updatedAt: now,
                  notifications: [
                    {
                      id: generateId("n"),
                      at: now,
                      channel: "system" as const,
                      title: "Запись отменена",
                      body: `Запись ${ap.code} отменена. Вы можете записаться повторно на свободное время.`,
                      read: false,
                    },
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      staffCancelAppointment: (appointmentId, user, reason) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        if (apt.status === "cancelled")
          return { ok: false, error: "Уже отменена" };
        const now = new Date().toISOString();
        const detail =
          reason?.trim() ||
          `Отменил(а): ${user.fullName}`;
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status: "cancelled" as const,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Запись отменена сотрудником",
                      detail,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === appointmentId
              ? {
                  ...ap,
                  stage: "cancelled" as AppealStage,
                  updatedAt: now,
                  controlLog: [
                    {
                      id: generateId("cl"),
                      at: now,
                      authorId: user.id,
                      authorName: user.fullName,
                      action: "Отмена записи",
                      comment: detail,
                    },
                    ...ap.controlLog,
                  ],
                  notifications: [
                    {
                      id: generateId("n"),
                      at: now,
                      channel: "system" as const,
                      title: "Запись отменена приёмной",
                      body: `Запись ${ap.code} отменена сотрудником. ${detail}`,
                      read: false,
                    },
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      staffRestoreAppointment: (appointmentId, user) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        if (apt.status !== "cancelled" && apt.status !== "no_show") {
          return {
            ok: false,
            error: "Вернуть можно только отменённую запись или неявку",
          };
        }
        const now = new Date().toISOString();
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status: "confirmed" as const,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Запись восстановлена",
                      detail: user.fullName,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === appointmentId
              ? {
                  ...ap,
                  stage: "registered" as AppealStage,
                  updatedAt: now,
                  controlLog: [
                    {
                      id: generateId("cl"),
                      at: now,
                      authorId: user.id,
                      authorName: user.fullName,
                      action: "Восстановление записи",
                      comment: "Возврат в очередь / ожидание",
                    },
                    ...ap.controlLog,
                  ],
                  notifications: [
                    {
                      id: generateId("n"),
                      at: now,
                      channel: "system" as const,
                      title: "Запись восстановлена",
                      body: `Запись ${ap.code} снова активна. Дата: ${apt.date} ${apt.slotStart}.`,
                      read: false,
                    },
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      staffSetAppointmentStatus: (appointmentId, status, user, note) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        const now = new Date().toISOString();
        const stageMap: Partial<Record<Appointment["status"], AppealStage>> = {
          cancelled: "cancelled",
          rejected: "cancelled",
          completed: "reception_done",
          confirmed: "registered",
          pending_review: "registered",
          rescheduled: "registered",
          no_show: "cancelled",
        };
        const nextStage = stageMap[status];
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: `Статус записи: ${status}`,
                      detail: note || user.fullName,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) => {
            if (ap.appointmentId !== appointmentId) return ap;
            return {
              ...ap,
              stage: nextStage ?? ap.stage,
              updatedAt: now,
              controlLog: [
                {
                  id: generateId("cl"),
                  at: now,
                  authorId: user.id,
                  authorName: user.fullName,
                  action: `Статус записи → ${status}`,
                  comment: note || "Смена статуса сотрудником",
                },
                ...ap.controlLog,
              ],
            };
          }),
        }));
        return { ok: true };
      },

      staffRescheduleAppointment: (
        appointmentId,
        date,
        slotStart,
        slotEnd,
        user
      ) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        if (apt.status === "cancelled")
          return {
            ok: false,
            error: "Сначала восстановите отменённую запись",
          };
        if (apt.status === "completed")
          return { ok: false, error: "Приём уже проведён" };

        const free = getAvailableSlotsForDate(
          date,
          get().calendar,
          get().appointments,
          appointmentId,
          apt.targetId,
          get().serviceContent
        );
        // staff may force time even if not in free list, but prefer free
        const okSlot =
          free.some((s) => s.start === slotStart) ||
          Boolean(slotStart && slotEnd);
        if (!okSlot || !date || !slotStart || !slotEnd) {
          return { ok: false, error: "Укажите дату и время" };
        }

        const now = new Date().toISOString();
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  date,
                  slotStart,
                  slotEnd,
                  status: "rescheduled" as const,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Перенос сотрудником",
                      detail: `${date} ${slotStart}–${slotEnd} · ${user.fullName}`,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === appointmentId
              ? {
                  ...ap,
                  updatedAt: now,
                  notifications: [
                    {
                      id: generateId("n"),
                      at: now,
                      channel: "system" as const,
                      title: "Запись перенесена",
                      body: `Новая дата: ${date}, ${slotStart}–${slotEnd}. Код: ${ap.code}.`,
                      read: false,
                    },
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      staffUpdateCitizenData: (appointmentId, patch, user) => {
        const apt = get().appointments.find((a) => a.id === appointmentId);
        if (!apt) return { ok: false, error: "Запись не найдена" };
        const now = new Date().toISOString();
        const next = {
          fullName: patch.fullName?.trim() ?? apt.fullName,
          phone: patch.phone?.trim() ?? apt.phone,
          email:
            patch.email !== undefined
              ? patch.email?.trim() || undefined
              : apt.email,
          topic: patch.topic?.trim() ?? apt.topic,
          category: patch.category ?? apt.category,
          description:
            patch.description !== undefined
              ? patch.description?.trim() || undefined
              : apt.description,
        };
        if (!next.fullName || next.fullName.split(/\s+/).length < 2) {
          return { ok: false, error: "Укажите полное ФИО" };
        }
        if (!next.phone) return { ok: false, error: "Укажите телефон" };
        if (!next.topic) return { ok: false, error: "Укажите тему" };

        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  ...next,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Данные записи изменены",
                      detail: user.fullName,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === appointmentId
              ? {
                  ...ap,
                  fullName: next.fullName,
                  phone: next.phone,
                  email: next.email,
                  topic: next.topic,
                  category: next.category,
                  summary:
                    next.description ||
                    ap.summary ||
                    next.topic,
                  updatedAt: now,
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      staffSetAppealStage: (appealId, stage, user, note) => {
        const appeal = get().appeals.find((a) => a.id === appealId);
        if (!appeal) return { ok: false, error: "Обращение не найдено" };
        const now = new Date().toISOString();
        const aptStatus: Partial<
          Record<AppealStage, Appointment["status"]>
        > = {
          cancelled: "cancelled",
          reception_done: "completed",
          closed: "completed",
          answered: "completed",
          registered: "confirmed",
          under_review: "confirmed",
          ready_for_reception: "confirmed",
          in_control: "completed",
        };
        const nextAptStatus = aptStatus[stage];
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId
              ? {
                  ...a,
                  stage,
                  updatedAt: now,
                  controlLog: [
                    {
                      id: generateId("cl"),
                      at: now,
                      authorId: user.id,
                      authorName: user.fullName,
                      action: `Этап → ${stage}`,
                      comment: note || "Смена этапа сотрудником",
                    },
                    ...a.controlLog,
                  ],
                }
              : a
          ),
          appointments: s.appointments.map((ap) =>
            ap.id === appeal.appointmentId && nextAptStatus
              ? {
                  ...ap,
                  status: nextAptStatus,
                  updatedAt: now,
                  history: [
                    ...ap.history,
                    {
                      at: now,
                      action: `Этап обращения: ${stage}`,
                      detail: user.fullName,
                    },
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      rescheduleAppointment: (code, pin, date, slotStart, slotEnd) => {
        const apt = get().findAppointment(code, pin);
        if (!apt)
          return {
            ok: false,
            error: "Запись не найдена. Проверьте код и PIN.",
          };
        if (apt.status === "cancelled")
          return {
            ok: false,
            error: "Отменённую запись нельзя перенести. Создайте новую.",
          };
        if (apt.status === "completed")
          return { ok: false, error: "Приём уже проведён." };
        if (apt.status === "rejected")
          return { ok: false, error: "Неподтверждённую заявку перенести нельзя." };
        if (apt.status === "pending_review")
          return {
            ok: false,
            error: "Дождитесь решения приёмной — затем можно перенести запись.",
          };

        const free = getAvailableSlotsForDate(
          date,
          get().calendar,
          get().appointments,
          apt.id,
          apt.targetId,
          get().serviceContent
        );
        if (!free.some((s) => s.start === slotStart)) {
          return { ok: false, error: "Выбранный слот недоступен." };
        }

        const now = new Date().toISOString();
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === apt.id
              ? {
                  ...a,
                  date,
                  slotStart,
                  slotEnd,
                  status: "rescheduled" as const,
                  updatedAt: now,
                  history: [
                    ...a.history,
                    {
                      at: now,
                      action: "Запись перенесена",
                      detail: `${date} ${slotStart}–${slotEnd}`,
                    },
                  ],
                }
              : a
          ),
          appeals: s.appeals.map((ap) =>
            ap.appointmentId === apt.id
              ? {
                  ...ap,
                  updatedAt: now,
                  notifications: [
                    {
                      id: generateId("n"),
                      at: now,
                      channel: "system" as const,
                      title: "Запись перенесена",
                      body: `Новая дата приёма: ${date}, ${slotStart}–${slotEnd}. Код: ${ap.code}.`,
                      read: false,
                    },
                    ...ap.notifications,
                  ],
                }
              : ap
          ),
        }));
        return { ok: true };
      },

      updateAppeal: (id, patch) =>
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === id
              ? { ...a, ...patch, updatedAt: new Date().toISOString() }
              : a
          ),
        })),

      startPrep: (appealId) =>
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId && a.stage === "registered"
              ? {
                  ...a,
                  stage: "under_review" as AppealStage,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      completePrep: (appealId, user, data) => {
        const now = new Date().toISOString();
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId
              ? {
                  ...a,
                  summary: data.summary,
                  prepNotes: data.prepNotes,
                  category: data.category,
                  stage: "ready_for_reception" as AppealStage,
                  prepCompletedBy: user.fullName,
                  prepCompletedAt: now,
                  updatedAt: now,
                }
              : a
          ),
        }));
      },

      markReadyForReception: (appealId) =>
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId
              ? {
                  ...a,
                  stage: "ready_for_reception" as AppealStage,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      completeReception: (appealId, user, protocol) => {
        const now = new Date().toISOString();
        set((s) => {
          const appeal = s.appeals.find((a) => a.id === appealId);
          if (!appeal) return s;

          const fullProtocol: ReceptionProtocol = {
            ...protocol,
            heldAt: now,
            heldBy: user.fullName,
          };

          return {
            appointments: s.appointments.map((ap) =>
              ap.id === appeal.appointmentId
                ? {
                    ...ap,
                    status: "completed" as const,
                    updatedAt: now,
                    history: [
                      ...ap.history,
                      { at: now, action: "Личный приём проведён" },
                    ],
                  }
                : ap
            ),
            appeals: s.appeals.map((a) =>
              a.id === appealId
                ? {
                    ...a,
                    stage: "in_control" as AppealStage,
                    receptionProtocol: fullProtocol,
                    assignment: {
                      text: protocol.assignmentText,
                      responsibleUserId: protocol.responsibleUserId,
                      responsibleName: protocol.responsibleName,
                      dueDate: new Date(Date.now() + 14 * 86400000)
                        .toISOString()
                        .slice(0, 10),
                      status: "open" as const,
                      createdAt: now,
                    },
                    controlLog: [
                      {
                        id: generateId("cl"),
                        at: now,
                        authorId: user.id,
                        authorName: user.fullName,
                        action: "Поручение выдано",
                        comment: protocol.assignmentText,
                      },
                    ],
                    updatedAt: now,
                    notifications: [
                      {
                        id: generateId("n"),
                        at: now,
                        channel: "system" as const,
                        title: "Приём проведён",
                        body: `По итогам приёма выдано поручение. Оцените работу сервиса: /service-evaluation/${appeal.code}`,
                        read: false,
                      },
                      ...a.notifications,
                    ],
                  }
                : a
            ),
          };
        });
      },

      addControlLog: (appealId, user, action, comment) => {
        const entry: ControlLogEntry = {
          id: generateId("cl"),
          at: new Date().toISOString(),
          authorId: user.id,
          authorName: user.fullName,
          action,
          comment,
        };
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId
              ? {
                  ...a,
                  controlLog: [entry, ...a.controlLog],
                  assignment: a.assignment
                    ? {
                        ...a.assignment,
                        status:
                          a.assignment.status === "open"
                            ? "in_progress"
                            : a.assignment.status,
                      }
                    : a.assignment,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }));
      },

      setAssignmentStatus: (appealId, status) =>
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId && a.assignment
              ? {
                  ...a,
                  assignment: { ...a.assignment, status },
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        })),

      submitFinalAnswer: (appealId, user, answer) => {
        const now = new Date().toISOString();
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appealId
              ? {
                  ...a,
                  finalAnswer: answer,
                  finalAnswerAt: now,
                  stage: "answered" as AppealStage,
                  assignment: a.assignment
                    ? { ...a.assignment, status: "done" as const }
                    : a.assignment,
                  controlLog: [
                    {
                      id: generateId("cl"),
                      at: now,
                      authorId: user.id,
                      authorName: user.fullName,
                      action: "Ответ направлен гражданину",
                      comment: answer.slice(0, 200),
                    },
                    ...a.controlLog,
                  ],
                  notifications: [
                    {
                      id: generateId("n"),
                      at: now,
                      channel: "system" as const,
                      title: "Ответ по обращению готов",
                      body: `По обращению ${a.code} подготовлен ответ. Оцените работу: /service-evaluation/${a.code}`,
                      read: false,
                    },
                    ...a.notifications,
                  ],
                  updatedAt: now,
                }
              : a
          ),
        }));
      },

      submitFeedback: (code, feedback) => {
        const appeal = get().appeals.find(
          (a) => a.code.toUpperCase() === code.trim().toUpperCase()
        );
        if (!appeal) return { ok: false, error: "Обращение не найдено" };
        // Оценка сервиса (в т.ч. онлайн-записи) — по любой действующей записи;
        // после приёма критерии о приёмной/сроках тоже уместны.
        if (appeal.stage === "cancelled") {
          return {
            ok: false,
            error: "По отменённой записи оценка не принимается",
          };
        }

        const now = new Date().toISOString();
        const isEdit = Boolean(appeal.feedback);
        set((s) => ({
          appeals: s.appeals.map((a) =>
            a.id === appeal.id
              ? {
                  ...a,
                  feedback: { ...feedback, submittedAt: now },
                  stage:
                    a.stage === "answered" || a.stage === "in_control"
                      ? ("closed" as AppealStage)
                      : a.stage,
                  updatedAt: now,
                  controlLog: [
                    {
                      id: generateId("cl"),
                      at: now,
                      authorId: "citizen",
                      authorName: a.fullName,
                      action: isEdit
                        ? "Оценка приёма изменена"
                        : "Оценка приёма направлена",
                      comment: "Обратная связь гражданина",
                    },
                    ...a.controlLog,
                  ],
                }
              : a
          ),
        }));
        return { ok: true };
      },

      getAppealByCode: (code) =>
        get().appeals.find(
          (a) => a.code.toUpperCase() === code.trim().toUpperCase()
        ),

      getPreviousAppeals: (appeal) =>
        get().appeals.filter(
          (a) => a.id !== appeal.id && matchCitizen(a, appeal)
        ),

      updateSurveyMeta: (patch) => {
        set((s) => ({ surveyMeta: { ...s.surveyMeta, ...patch } }));
      },

      saveSurveyQuestion: (q) => {
        set((s) => {
          const exists = s.surveyQuestions.some((x) => x.id === q.id);
          const list = exists
            ? s.surveyQuestions.map((x) => (x.id === q.id ? q : x))
            : [...s.surveyQuestions, q];
          list.sort((a, b) => a.order - b.order);
          return { surveyQuestions: list };
        });
      },

      deleteSurveyQuestion: (id) => {
        set((s) => ({
          surveyQuestions: s.surveyQuestions
            .filter((q) => q.id !== id)
            .map((q, i) => ({ ...q, order: i + 1 })),
        }));
      },

      reorderSurveyQuestion: (id, direction) => {
        set((s) => {
          const list = [...s.surveyQuestions].sort(
            (a, b) => a.order - b.order
          );
          const idx = list.findIndex((q) => q.id === id);
          if (idx < 0) return {};
          const j = direction === "up" ? idx - 1 : idx + 1;
          if (j < 0 || j >= list.length) return {};
          const tmp = list[idx];
          list[idx] = list[j];
          list[j] = tmp;
          return {
            surveyQuestions: list.map((q, i) => ({ ...q, order: i + 1 })),
          };
        });
      },

      resetSurveyQuestions: () => {
        set({
          surveyMeta: { ...SEED_SURVEY_META },
          surveyQuestions: SEED_SURVEY_QUESTIONS.map((q) => ({
            ...q,
            options: q.options.map((o) => ({ ...o })),
          })),
        });
      },

      submitSurveyResponse: (answers, courtName) => {
        if (!Object.keys(answers).length) {
          return { ok: false, error: "Нет ответов" };
        }
        const response: SurveyResponse = {
          id: generateId("sr"),
          at: new Date().toISOString(),
          courtName: courtName || get().surveyMeta.courtNameRu,
          answers,
        };
        set((s) => ({
          surveyResponses: [response, ...s.surveyResponses],
        }));
        return { ok: true };
      },

      clearSurveyResponses: () => {
        set({ surveyResponses: [] });
      },

      updateServiceContent: (patch) => {
        set((s) => ({
          serviceContent: mergeServiceContent({
            ...(s.serviceContent ?? {}),
            ...patch,
          }),
        }));
      },

      updateBookingRules: (patch) => {
        set((s) => {
          const sc = mergeServiceContent(s.serviceContent);
          return {
            serviceContent: mergeServiceContent({
              ...sc,
              rules: { ...sc.rules, ...patch },
            }),
          };
        });
      },

      setAdminModule: (m) =>
        set((s) => (s.adminModule === m ? s : { adminModule: m })),

      resetServiceContent: () => {
        set({ serviceContent: mergeServiceContent() });
      },

      setEligibilityTree: (tree) => {
        set({ eligibilityTree: tree });
      },

      patchEligibilityNode: (id, patch) => {
        set((s) => ({
          eligibilityTree: updateEligibilityNode(
            (s.eligibilityTree?.length
              ? s.eligibilityTree
              : seedEligibilityTree()) as EligibilityNode[],
            id,
            patch
          ) as EligibilityTreeNode[],
        }));
      },

      removeEligibilityNode: (id) => {
        set((s) => ({
          eligibilityTree: deleteEligibilityNode(
            (s.eligibilityTree?.length
              ? s.eligibilityTree
              : seedEligibilityTree()) as EligibilityNode[],
            id
          ) as EligibilityTreeNode[],
        }));
      },

      addEligibilityNode: (parentId, node) => {
        set((s) => ({
          eligibilityTree: addEligibilityChild(
            (s.eligibilityTree?.length
              ? s.eligibilityTree
              : seedEligibilityTree()) as EligibilityNode[],
            parentId,
            node as EligibilityNode
          ) as EligibilityTreeNode[],
        }));
      },

      resetEligibilityTree: () => {
        set({ eligibilityTree: seedEligibilityTree() });
      },

      upsertAppointment: (apt) =>
        set((s) => ({
          appointments: s.appointments.some(
            (a) => a.id === apt.id || a.code === apt.code
          )
            ? s.appointments.map((a) =>
                a.id === apt.id || a.code === apt.code ? { ...a, ...apt } : a
              )
            : [...s.appointments, apt],
        })),

      upsertAppeal: (apl) =>
        set((s) => ({
          appeals: s.appeals.some(
            (a) => a.id === apl.id || a.code === apl.code
          )
            ? s.appeals.map((a) => {
                if (a.id !== apl.id && a.code !== apl.code) return a;
                return {
                  ...a,
                  ...apl,
                  assignment: apl.assignment ?? a.assignment,
                  receptionProtocol:
                    apl.receptionProtocol ?? a.receptionProtocol,
                  controlLog:
                    apl.controlLog?.length ? apl.controlLog : a.controlLog,
                  notifications: apl.notifications?.length
                    ? apl.notifications
                    : a.notifications,
                  feedback: apl.feedback ?? a.feedback,
                  finalAnswer: apl.finalAnswer ?? a.finalAnswer,
                  finalAnswerAt: apl.finalAnswerAt ?? a.finalAnswerAt,
                  previousAppealIds: apl.previousAppealIds?.length
                    ? apl.previousAppealIds
                    : a.previousAppealIds,
                  prepNotes: apl.prepNotes || a.prepNotes,
                };
              })
            : [...s.appeals, apl],
        })),

      applyBootstrap: (payload) =>
        set({
          serviceContent: mergeServiceContent(payload.site),
          eligibilityTree: payload.eligibilityTree,
          calendar: payload.calendar,
          surveyMeta: payload.survey.meta,
          surveyQuestions: payload.survey.questions,
        }),

      replaceStaffLists: (payload) =>
        set((s) => ({
          appointments: payload.appointments ?? s.appointments,
          appeals: payload.appeals ?? s.appeals,
          staff: payload.staff ?? s.staff,
          calendar: payload.calendar ?? s.calendar,
          surveyResponses: payload.surveyResponses ?? s.surveyResponses,
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      version: STATE_VERSION,
      skipHydration: false,
      partialize: (s) =>
        env.apiUrl
          ? {
              version: s.version,
              session: s.session,
              adminModule: s.adminModule,
              staff: s.session
                ? s.staff
                    .filter((u) => u.id === s.session?.userId)
                    .map((u) => ({ ...u, password: "" }))
                : [],
            }
          : {
              version: s.version,
              calendar: s.calendar,
              appointments: s.appointments,
              appeals: s.appeals,
              session: s.session,
              surveyMeta: s.surveyMeta,
              surveyQuestions: s.surveyQuestions,
              surveyResponses: s.surveyResponses,
              serviceContent: s.serviceContent,
              adminModule: s.adminModule,
              eligibilityTree: s.eligibilityTree,
            },
      migrate: (persisted) => {
        const p = persisted as Partial<PlatformState>;
        const base = initialData();
        return {
          ...base,
          ...p,
          version: STATE_VERSION,
          staff: env.apiUrl
            ? Array.isArray(p.staff)
              ? p.staff.map((u) => ({ ...u, password: "" }))
              : []
            : base.staff,
          appointments: (p.appointments ?? base.appointments).map((a) => ({
            ...a,
            targetId: a.targetId || "reception",
            companions: a.companions ?? [],
          })),
          surveyMeta: p.surveyMeta ?? base.surveyMeta,
          surveyQuestions:
            p.surveyQuestions && p.surveyQuestions.length
              ? p.surveyQuestions
              : base.surveyQuestions,
          surveyResponses: p.surveyResponses ?? base.surveyResponses,
          serviceContent: mergeServiceContent(p.serviceContent),
          adminModule: p.adminModule ?? "reception",
          eligibilityTree:
            p.eligibilityTree && p.eligibilityTree.length
              ? p.eligibilityTree
              : base.eligibilityTree,
        } as PlatformState;
      },
    }
  )
);

/**
 * Совместимый API: { ready, state, currentUser, actions }.
 * ready = true только на клиенте после mount/rehydrate (без вызова persist на SSR).
 */
export function useStore() {
  const store = usePlatformStore();
  const [ready, setReady] = useState(false);
  const [sessionReady, setSessionReady] = useState(!useRemoteApi);
  const remote = wrapRemote(
    store as never,
    () => usePlatformStore.getState() as never
  );

  useEffect(() => {
    const persistApi = usePlatformStore.persist;
    if (!persistApi) {
      setReady(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setReady(true);
      return;
    }
    const unsub = persistApi.onFinishHydration(() => setReady(true));
    const t = window.setTimeout(() => setReady(true), 50);
    return () => {
      unsub?.();
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!useRemoteApi) {
      setSessionReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const s = usePlatformStore.getState();
      try {
        const boot = await backend.public.bootstrap();
        if (!cancelled) s.applyBootstrap(boot);
      } catch {
        /* тексты сайта приходят с GET /public/bootstrap */
      }
      const token = getAccessToken();
      if (!token) {
        if (s.session && !cancelled) s.logout();
        if (!cancelled) setSessionReady(true);
        return;
      }
      try {
        const me = await backend.auth.me();
        if (cancelled) return;
        s.hydrateStaffSession(me);
        const [apts, appeals, users, cal, surveyRes] = await Promise.all([
          backend.staff.appointments(),
          backend.staff.appeals(),
          backend.staff.users(),
          backend.staff.getCalendar(),
          backend.staff.surveyResponses().catch(() => [] as never),
        ]);
        if (cancelled) return;
        s.replaceStaffLists({
          appointments: apts.map((a) => withPin(a)),
          appeals,
          staff: users.map((u) => ({ ...u, password: "" })),
          calendar: cal,
          surveyResponses: surveyRes,
        });
      } catch {
        s.logout();
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const currentUser = store.session
    ? (() => {
        const raw = store.staff.find((s) => s.id === store.session?.userId);
        return raw ? toStaffProfile(raw) : null;
      })()
    : null;

  const serviceContent = useMemo(
    () => mergeServiceContent(store.serviceContent),
    [store.serviceContent]
  );

  return {
    ready,
    sessionReady,
    state: {
      version: store.version,
      calendar: store.calendar,
      staff: store.staff,
      appointments: store.appointments,
      appeals: store.appeals,
      session: store.session,
      surveyMeta: store.surveyMeta ?? SEED_SURVEY_META,
      surveyQuestions:
        store.surveyQuestions?.length
          ? store.surveyQuestions
          : SEED_SURVEY_QUESTIONS,
      surveyResponses: store.surveyResponses ?? [],
      serviceContent,
      adminModule: store.adminModule ?? "reception",
      eligibilityTree:
        store.eligibilityTree?.length
          ? store.eligibilityTree
          : FALLBACK_ELIGIBILITY,
    } satisfies PlatformState,
    currentUser,
    login: store.login,
    hydrateStaffSession: store.hydrateStaffSession,
    logout: store.logout,
    resetDemo: store.resetDemo,
    updateCalendar: remote.updateCalendar,
    bookAppointment: remote.bookAppointment,
    confirmAppointmentRequest: remote.confirmAppointmentRequest,
    rejectAppointmentRequest: remote.rejectAppointmentRequest,
    findAppointment: remote.findAppointment,
    lookupByCode: remote.lookupByCode,
    recoverCodesByPhone: remote.recoverCodesByPhone,
    cancelAppointment: remote.cancelAppointment,
    rescheduleAppointment: remote.rescheduleAppointment,
    staffCancelAppointment: remote.staffCancelAppointment,
    staffRestoreAppointment: remote.staffRestoreAppointment,
    staffSetAppointmentStatus: remote.staffSetAppointmentStatus,
    staffRescheduleAppointment: remote.staffRescheduleAppointment,
    staffUpdateCitizenData: remote.staffUpdateCitizenData,
    staffSetAppealStage: remote.staffSetAppealStage,
    updateAppeal: store.updateAppeal,
    startPrep: remote.startPrep,
    completePrep: remote.completePrep,
    markReadyForReception: remote.markReadyForReception,
    completeReception: remote.completeReception,
    addControlLog: remote.addControlLog,
    setAssignmentStatus: remote.setAssignmentStatus,
    submitFinalAnswer: remote.submitFinalAnswer,
    submitFeedback: remote.submitFeedback,
    getAppealByCode: store.getAppealByCode,
    getPreviousAppeals: store.getPreviousAppeals,
    updateSurveyMeta: remote.updateSurveyMeta,
    saveSurveyQuestion: remote.saveSurveyQuestion,
    deleteSurveyQuestion: remote.deleteSurveyQuestion,
    reorderSurveyQuestion: remote.reorderSurveyQuestion,
    resetSurveyQuestions: remote.resetSurveyQuestions,
    pushSurvey: remote.pushSurvey,
    submitSurveyResponse: store.submitSurveyResponse,
    clearSurveyResponses: store.clearSurveyResponses,
    updateServiceContent: remote.updateServiceContent,
    updateBookingRules: store.updateBookingRules,
    setAdminModule: store.setAdminModule,
    resetServiceContent: remote.resetServiceContent,
    setEligibilityTree: remote.setEligibilityTree,
    patchEligibilityNode: remote.patchEligibilityNode,
    removeEligibilityNode: remote.removeEligibilityNode,
    addEligibilityNode: remote.addEligibilityNode,
    resetEligibilityTree: remote.resetEligibilityTree,
  };
}
