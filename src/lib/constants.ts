import type { AppealCategory, AppealStage, AppointmentStatus } from "./types";

export const STAGE_ORDER: AppealStage[] = [
  "registered",
  "under_review",
  "ready_for_reception",
  "reception_done",
  "in_control",
  "answered",
  "closed",
];

export const CATEGORY_LABELS: Record<AppealCategory, string> = {
  organization: "Организация судопроизводства",
  court_activity: "Деятельность суда",
  legislation: "Предложения по законодательству",
  other: "Иное (в рамках компетенции приёма)",
};

export const STAGE_LABELS: Record<AppealStage, string> = {
  registered: "1. Регистрация",
  under_review: "2. Предварительный анализ",
  ready_for_reception: "2. Готово к приёму",
  reception_done: "3. Личный приём",
  in_control: "4. Контроль исполнения",
  answered: "Ответ направлен",
  closed: "Завершено",
  cancelled: "Отменено",
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending_review: "На проверке",
  confirmed: "Подтверждена",
  rescheduled: "Перенесена",
  cancelled: "Отменена",
  rejected: "Не подтверждена",
  completed: "Проведена",
  no_show: "Неявка",
};

export const REGIONS_KR = [
  { id: "bishkek", ru: "г. Бишкек", ky: "Бишкек ш." },
  { id: "chui", ru: "Чуйская область", ky: "Чүй облусу" },
  { id: "issyk", ru: "Иссык-Кульская область", ky: "Ысык-Көл облусу" },
  { id: "naryn", ru: "Нарынская область", ky: "Нарын облусу" },
  { id: "talas", ru: "Таласская область", ky: "Талас облусу" },
  { id: "jalal", ru: "Джалал-Абадская область", ky: "Жалал-Абад облусу" },
  { id: "osh", ru: "Ошская область", ky: "Ош облусу" },
  { id: "osh_city", ru: "г. Ош", ky: "Ош ш." },
  { id: "batken", ru: "Баткенская область", ky: "Баткен облусу" },
];

export const APPLICANT_TYPES = [
  {
    id: "citizen",
    ru: "Физическое лицо (гражданин)",
    ky: "Жеке жак (жаран)",
  },
  {
    id: "legal",
    ru: "Представитель юридического лица",
    ky: "Юридикалык жактын өкүлү",
  },
  {
    id: "rep",
    ru: "Представитель гражданина (по доверенности)",
    ky: "Жарандын өкүлү (ишеним кат)",
  },
];

export const FEEDBACK_QUESTIONS: {
  key: "convenient" | "clearNextSteps" | "respectful" | "deadlinesMet";
  label: string;
  labelKy: string;
}[] = [
  {
    key: "convenient",
    label:
      "Насколько удобен процесс электронной записи (сайт, выбор даты и времени, получение кода, перенос/отмена)?",
    labelKy:
      "Электрондук жазылуу канчалык ыңгайлуу (сайт, күн жана убакытты тандоо, код алуу, жылдыруу/жокко чыгаруу)?",
  },
  {
    key: "clearNextSteps",
    label: "Было ли понятно, какие действия последуют после записи и после приёма?",
    labelKy: "Жазылуудан жана кабыл алуудан кийинки аракеттер түшүнүктүү болдубу?",
  },
  {
    key: "respectful",
    label: "Было ли обеспечено уважительное отношение при работе общественной приёмной?",
    labelKy: "Коомдук кабыл алууда урматтоо мамилеси камсыз болдубу?",
  },
  {
    key: "deadlinesMet",
    label: "Соблюдены ли заявленные сроки рассмотрения и ответа?",
    labelKy: "Кароо жана жооп берүү мөөнөттөрү сакталдыбы?",
  },
];
