import type { AppealCategory, AppealStage, AppointmentStatus } from "./types";

export const APP_NAME =
  "Цифровая платформа приёма граждан";
export const ORG_NAME =
  "Верховный суд Кыргызской Республики";
export const ORG_SHORT = "ВС КР";

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

export const STAGE_ORDER: AppealStage[] = [
  "registered",
  "under_review",
  "ready_for_reception",
  "reception_done",
  "in_control",
  "answered",
  "closed",
];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmed: "Подтверждена",
  rescheduled: "Перенесена",
  cancelled: "Отменена",
  completed: "Проведена",
  no_show: "Неявка",
};

export const PIPELINE_STEPS = [
  {
    key: "registration",
    title: "Регистрация",
    desc: "Запись на приём: ФИО, тема, дата и время",
  },
  {
    key: "analysis",
    title: "Анализ",
    desc: "Электронная карточка, предварительное изучение",
  },
  {
    key: "reception",
    title: "Личный приём",
    desc: "Приём руководством, поручение, ответственный",
  },
  {
    key: "control",
    title: "Контроль",
    desc: "Исполнение поручения, направление ответа",
  },
  {
    key: "feedback",
    title: "Обратная связь",
    desc: "Оценка работы общественной приёмной",
  },
  {
    key: "monitor",
    title: "Мониторинг",
    desc: "Повторные обращения, системные проблемы",
  },
] as const;

export const RECEPTION_FORBIDDEN = [
  "конкретные судебные дела",
  "законность судебных решений",
  "результаты рассмотрения дел",
];

export const RECEPTION_ALLOWED = [
  "организация судопроизводства",
  "деятельность суда",
  "предложения по изменению законодательства КР",
  "письменные обращения, поданные на приёме",
];

/** Регионы КР для формы заявителя */
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
] as const;

/** К кому записывается (без привязки к судебному делу) */
export const RECEPTION_TARGETS = [
  {
    id: "chairman",
    ru: "Председатель Верховного суда КР",
    ky: "КР Жогорку сотунун Төрагасы",
  },
  {
    id: "deputy",
    ru: "Заместитель Председателя Верховного суда КР",
    ky: "КР Жогорку сотунун Төрагасынын орун басары",
  },
  {
    id: "reception",
    ru: "Общественная приёмная (подготовка к приёму руководством)",
    ky: "Коомдук кабыл алуу (жетекчиликке даярдоо)",
  },
] as const;

export const APPLICANT_TYPES = [
  { id: "citizen", ru: "Физическое лицо (гражданин)", ky: "Жеке жак (жаран)" },
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
] as const;

export const FEEDBACK_QUESTIONS = [
  {
    key: "respectful" as const,
    label: "Было ли обеспечено уважительное отношение?",
  },
  {
    key: "clearNextSteps" as const,
    label: "Было ли понятно разъяснено дальнейшее действие?",
  },
  {
    key: "convenient" as const,
    label: "Насколько удобно организован приём граждан?",
  },
  {
    key: "deadlinesMet" as const,
    label: "Соблюдены ли сроки предоставления ответа?",
  },
];
