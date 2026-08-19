import type { AppealCard, Appointment, CalendarSettings, StaffUser } from "./types";

export const DEFAULT_CALENDAR: CalendarSettings = {
  receptionWeekdays: [2, 4],
  dayStartMinutes: 8 * 60,
  dayEndMinutes: 12 * 60,
  slotDurationMinutes: 20,
  breakMinutes: 5,
  bookingHorizonDays: 45,
  closedDates: [],
  extraOpenDates: [],
  rulesText: "",
};

export const SEED_STAFF: StaffUser[] = [
  {
    id: "u-chairman",
    login: "predsedatel",
    password: "vs2026",
    fullName: "Председатель",
    role: "leadership",
    position: "Председатель",
    department: "Верховный суд Кыргызской Республики",
  },
  {
    id: "u-admin",
    login: "admin",
    password: "admin123",
    fullName: "Абдылдаев Нурлан Токтосунович",
    role: "admin",
    position: "Администратор платформы",
    department: "ИТ-служба Верховного суда Кыргызской Республики",
  },
  {
    id: "u-reception",
    login: "priemnaya",
    password: "priem123",
    fullName: "Касымова Айгуль Бакытовна",
    role: "reception",
    position: "Главный специалист",
    department: "Отдел по работе с гражданами",
  },
  {
    id: "u-leadership",
    login: "rukovodstvo",
    password: "sud2026",
    fullName: "Руководство Верховного суда КР",
    role: "leadership",
    position: "Приём руководства",
    department: "Аппарат Верховного суда КР",
  },
  {
    id: "u-resp-1",
    login: "otvet1",
    password: "otvet123",
    fullName: "Жумабеков Эркин Сапарович",
    role: "responsible",
    position: "Ответственный по обращениям",
    department: "Аппарат Верховного суда КР",
  },
  {
    id: "u-resp-2",
    login: "otvet2",
    password: "otvet123",
    fullName: "Сыдыкова Меерим Асановна",
    role: "responsible",
    position: "Ответственный по обращениям",
    department: "Отдел анализа судебной практики",
  },
];

function daysFromNow(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Ближайшие вт/чт для исходных записей локального контура */
function nextWeekday(targetDow: number, weeksAhead = 0): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const current = d.getDay();
  let add = (targetDow - current + 7) % 7;
  if (add === 0) add = 7;
  add += weeksAhead * 7;
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0, 10);
}

const demoDate1 = nextWeekday(2, 0);
const demoDate2 = nextWeekday(4, 0);
const pastDate = daysFromNow(-14);

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-demo-1",
    code: "VS-2026-1001",
    fullName: "Токтосунов Алмаз Бектурович",
    phone: "+996700111001",
    email: "almaz.t@example.com",
    pin: "4821",
    topic: "Улучшение информирования о сроках рассмотрения жалоб",
    category: "organization",
    description:
      "Прошу разъяснить порядок информирования граждан о ходе рассмотрения жалоб в судах и предложить единый канал уведомлений.",
    date: demoDate1,
    slotStart: "15:00",
    slotEnd: "15:20",
    status: "confirmed",
    targetId: "deputy_bakirova",
    companions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        at: new Date().toISOString(),
        action: "Запись создана",
        detail: "Онлайн-запись через платформу",
      },
    ],
  },
  {
    id: "apt-demo-2",
    code: "VS-2026-1002",
    fullName: "Исакова Назгуль Асанбековна",
    phone: "+996555222003",
    pin: "7390",
    topic: "Предложение по приёмным часам в региональных судах",
    category: "court_activity",
    description: "Предлагаю расширить график приёма в областных судах.",
    date: demoDate2,
    slotStart: "09:00",
    slotEnd: "09:20",
    status: "confirmed",
    targetId: "chairman",
    companions: [{ fullName: "Исаков Бакыт", phone: "+996555000111" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        at: new Date().toISOString(),
        action: "Запись создана",
      },
    ],
  },
  {
    id: "apt-past-1",
    code: "VS-2026-0910",
    fullName: "Токтосунов Алмаз Бектурович",
    phone: "+996700111001",
    pin: "1111",
    topic: "Доступность информации на сайте суда",
    category: "court_activity",
    date: pastDate,
    slotStart: "08:00",
    slotEnd: "08:20",
    status: "completed",
    targetId: "reception",
    companions: [],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    history: [{ at: pastDate, action: "Приём проведён" }],
  },
  {
    id: "apt-pending-1",
    code: "VS-2026-1003",
    fullName: "Мамытов Эрлан Сагынович",
    phone: "+996700333221",
    email: "erlan.m@example.com",
    pin: "5502",
    topic: "Предложение по информированию о графике приёма в областных судах",
    category: "organization",
    description:
      "Прошу рассмотреть публикацию единого понятного графика приёма граждан во всех областных судах на государственном и официальном языках.",
    date: demoDate1,
    slotStart: "08:00",
    slotEnd: "08:20",
    status: "pending_review",
    targetId: "reception",
    companions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        at: new Date().toISOString(),
        action: "Заявка подана",
        detail: "Ожидает решения общественной приёмной",
      },
    ],
  },
];

export const SEED_APPEALS: AppealCard[] = [
  {
    id: "apl-demo-1",
    appointmentId: "apt-demo-1",
    code: "VS-2026-1001",
    fullName: "Токтосунов Алмаз Бектурович",
    phone: "+996700111001",
    email: "almaz.t@example.com",
    topic: "Улучшение информирования о сроках рассмотрения жалоб",
    category: "organization",
    summary:
      "Гражданин предлагает единый канал уведомлений о ходе рассмотрения жалоб.",
    stage: "registered",
    previousAppealIds: ["apl-past-1"],
    previousNotes:
      "Ранее обращался по вопросу доступности информации на сайте (VS-2026-0910).",
    prepNotes: "",
    controlLog: [],
    notifications: [
      {
        id: "n1",
        at: new Date().toISOString(),
        channel: "system",
        title: "Запись подтверждена",
        body: "Ваша запись на приём подтверждена. Код: VS-2026-1001.",
        read: false,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "apl-demo-2",
    appointmentId: "apt-demo-2",
    code: "VS-2026-1002",
    fullName: "Исакова Назгуль Асанбековна",
    phone: "+996555222003",
    topic: "Предложение по приёмным часам в региональных судах",
    category: "court_activity",
    summary: "Предложение расширить график приёма в областных судах.",
    stage: "under_review",
    previousAppealIds: [],
    previousNotes: "",
    prepNotes:
      "Проведена предварительная беседа. Вопрос относится к организации деятельности судов. Рекомендовано подготовить справку по текущим графикам приёма.",
    prepCompletedBy: "Касымова Айгуль Бакытовна",
    prepCompletedAt: new Date().toISOString(),
    controlLog: [],
    notifications: [
      {
        id: "n2",
        at: new Date().toISOString(),
        channel: "system",
        title: "Запись подтверждена",
        body: "Ваша запись на приём подтверждена. Код: VS-2026-1002.",
        read: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "apl-past-1",
    appointmentId: "apt-past-1",
    code: "VS-2026-0910",
    fullName: "Токтосунов Алмаз Бектурович",
    phone: "+996700111001",
    topic: "Доступность информации на сайте суда",
    category: "court_activity",
    summary: "Повторное обращение того же гражданина (для проверки мониторинга).",
    stage: "closed",
    previousAppealIds: [],
    previousNotes: "",
    prepNotes: "Вопрос изучен, даны разъяснения.",
    prepCompletedBy: "Касымова Айгуль Бакытовна",
    prepCompletedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    receptionProtocol: {
      heldAt: pastDate + "T08:10:00",
      heldBy: "Руководство Верховного суда КР",
      citizenStatement: "Сложно найти сведения о графике и контактах на сайте.",
      leadershipExplanation:
        "Разъяснён порядок размещения информации. Поручено проработать улучшение навигации.",
      assignmentText: "Подготовить предложения по доработке раздела «Гражданам» на сайте.",
      responsibleUserId: "u-resp-1",
      responsibleName: "Жумабеков Эркин Сапарович",
      specialistsInvolved: "Отдел информатизации",
    },
    assignment: {
      text: "Подготовить предложения по доработке раздела «Гражданам» на сайте.",
      responsibleUserId: "u-resp-1",
      responsibleName: "Жумабеков Эркин Сапарович",
      dueDate: daysFromNow(-7),
      status: "done",
      createdAt: pastDate,
    },
    controlLog: [
      {
        id: "cl1",
        at: new Date(Date.now() - 12 * 86400000).toISOString(),
        authorId: "u-resp-1",
        authorName: "Жумабеков Эркин Сапарович",
        action: "Взято в работу",
        comment: "Собран аудит структуры сайта.",
      },
      {
        id: "cl2",
        at: new Date(Date.now() - 10 * 86400000).toISOString(),
        authorId: "u-resp-1",
        authorName: "Жумабеков Эркин Сапарович",
        action: "Ответ подготовлен",
        comment: "Направлен обоснованный ответ гражданину.",
      },
    ],
    finalAnswer:
      "Уважаемый Алмаз Бектурович! Ваше обращение рассмотрено. Подготовлены предложения по улучшению навигации раздела «Гражданам». О результатах реализации будет сообщено дополнительно.",
    finalAnswerAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    feedback: {
      respectful: 5,
      clearNextSteps: 4,
      convenient: 4,
      deadlinesMet: 5,
      comment: "Спасибо за внимательное отношение.",
      submittedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    notifications: [],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "apl-pending-1",
    appointmentId: "apt-pending-1",
    code: "VS-2026-1003",
    fullName: "Мамытов Эрлан Сагынович",
    phone: "+996700333221",
    email: "erlan.m@example.com",
    topic: "Предложение по информированию о графике приёма в областных судах",
    category: "organization",
    summary:
      "Предложение публиковать единый график приёма граждан в областных судах на двух языках.",
    stage: "registered",
    previousAppealIds: [],
    previousNotes: "Предыдущих обращений не обнаружено.",
    prepNotes: "",
    controlLog: [],
    notifications: [
      {
        id: "n-pending-1",
        at: new Date().toISOString(),
        channel: "email",
        title: "Заявка принята на проверку",
        body: "Заявка VS-2026-1003 принята общественной приёмной. Запись вступает в силу после подтверждения. Статус можно проверить на сайте по коду записи.",
        read: false,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
