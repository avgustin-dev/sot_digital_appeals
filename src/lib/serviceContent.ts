import { BOOKING_RULES } from "./eligibility";
import {
  COURT_CONTACTS,
  LEADERSHIP_RECEPTION_SCHEDULE,
  RECEPTION_ALLOWED,
  RECEPTION_FORBIDDEN,
  RECEPTION_TARGETS,
} from "./constants";
import type {
  CourtContactsContent,
  LeadershipPerson,
  ServiceContent,
} from "./types";

function contactsDefault(): CourtContactsContent {
  return {
    trustPhone: COURT_CONTACTS.trustPhone,
    trustPhoneTel: COURT_CONTACTS.trustPhoneTel,
    addressRu: COURT_CONTACTS.addressRu,
    addressKy: COURT_CONTACTS.addressKy,
    receptionOfficeRu: COURT_CONTACTS.receptionOfficeRu,
    receptionOfficeKy: COURT_CONTACTS.receptionOfficeKy,
    sourceNoteRu: COURT_CONTACTS.sourceNoteRu,
    sourceNoteKy: COURT_CONTACTS.sourceNoteKy,
    scheduleFootnoteRu:
      "Предварительная запись производится в кабинете № 111 (1 этаж).",
    scheduleFootnoteKy:
      "Алдын ала жазылуу — № 111 кабинетте (1-кабат).",
  };
}

function fromSchedule(
  id: string,
  extra: Partial<LeadershipPerson> &
    Pick<
      LeadershipPerson,
      | "shortRu"
      | "shortKy"
      | "bookLabelRu"
      | "bookLabelKy"
      | "showInSchedule"
      | "bookable"
      | "windowKind"
      | "weekdays"
      | "startMinutes"
      | "endMinutes"
    >
): LeadershipPerson {
  const row = LEADERSHIP_RECEPTION_SCHEDULE.find((r) => r.id === id);
  return {
    id,
    fullNameRu: row?.fullNameRu ?? extra.fullNameRu ?? id,
    fullNameKy: row?.fullNameKy ?? extra.fullNameKy ?? id,
    positionRu: row?.positionRu ?? extra.positionRu ?? "",
    positionKy: row?.positionKy ?? extra.positionKy ?? "",
    weekdayRu: row?.weekdayRu ?? extra.weekdayRu ?? "",
    weekdayKy: row?.weekdayKy ?? extra.weekdayKy ?? "",
    timeRu: row?.timeRu ?? extra.timeRu ?? "",
    timeKy: row?.timeKy ?? extra.timeKy ?? "",
    ...extra,
  };
}

function defaultLeadership(): LeadershipPerson[] {
  const book = (id: string) => RECEPTION_TARGETS.find((t) => t.id === id);
  return [
    fromSchedule("chairman", {
      shortRu: "Председатель",
      shortKy: "Төрага",
      bookLabelRu: book("chairman")?.ru ?? "",
      bookLabelKy: book("chairman")?.ky ?? "",
      showInSchedule: true,
      bookable: true,
      windowKind: "fixed",
      weekdays: [4],
      startMinutes: 9 * 60,
      endMinutes: 12 * 60,
    }),
    fromSchedule("deputy_1", {
      shortRu: "Мусаев Н. А.",
      shortKy: "Мусаев Н. А.",
      bookLabelRu: "Мусаев Н. А. — Заместитель Председателя",
      bookLabelKy: "Мусаев Н. А. — Төраганын орун басары",
      showInSchedule: true,
      bookable: false,
      windowKind: "calendar",
      weekdays: [2, 4],
      startMinutes: 8 * 60,
      endMinutes: 12 * 60,
    }),
    fromSchedule("deputy_bakirova", {
      shortRu: "Бакирова Н. Ж.",
      shortKy: "Бакирова Н. Ж.",
      bookLabelRu: book("deputy_bakirova")?.ru ?? "",
      bookLabelKy: book("deputy_bakirova")?.ky ?? "",
      showInSchedule: true,
      bookable: true,
      windowKind: "fixed",
      weekdays: [2],
      startMinutes: 15 * 60,
      endMinutes: 16 * 60,
    }),
    fromSchedule("deputy_kamchybekov", {
      shortRu: "Камчыбеков Ш. Р.",
      shortKy: "Камчыбеков Ш. Р.",
      bookLabelRu: book("deputy_kamchybekov")?.ru ?? "",
      bookLabelKy: book("deputy_kamchybekov")?.ky ?? "",
      showInSchedule: true,
      bookable: true,
      windowKind: "fixed",
      weekdays: [4],
      startMinutes: 9 * 60,
      endMinutes: 10 * 60,
    }),
    {
      id: "deputy_other",
      fullNameRu: "Иной заместитель Председателя",
      fullNameKy: "Төраганын башка орун басары",
      positionRu: "Заместитель Председателя Верховного суда КР",
      positionKy: "КР Жогорку сотунун Төрагасынын орун басары",
      weekdayRu: "По графику",
      weekdayKy: "График боюнча",
      timeRu: "Согласно предварительному графику приёма",
      timeKy: "Алдын ала график боюнча",
      shortRu: "Иной заместитель",
      shortKy: "Башка орун басар",
      bookLabelRu: book("deputy_other")?.ru ?? "",
      bookLabelKy: book("deputy_other")?.ky ?? "",
      showInSchedule: false,
      bookable: true,
      windowKind: "calendar",
      weekdays: [2, 4],
      startMinutes: 8 * 60,
      endMinutes: 12 * 60,
    },
    {
      id: "reception",
      fullNameRu: "Общественная приёмная",
      fullNameKy: "Коомдук кабыл алуу",
      positionRu: "Отдел по работе с гражданами",
      positionKy: "Жарандар менен иштөө бөлүмү",
      weekdayRu: "По графику платформы",
      weekdayKy: "Платформанын графиги боюнча",
      timeRu: "Согласно настройкам календаря",
      timeKy: "Календардын жөндөөлөрү боюнча",
      shortRu: "Приёмная",
      shortKy: "Кабыл алуу",
      bookLabelRu: book("reception")?.ru ?? "",
      bookLabelKy: book("reception")?.ky ?? "",
      showInSchedule: false,
      bookable: true,
      windowKind: "calendar",
      weekdays: [2, 4],
      startMinutes: 8 * 60,
      endMinutes: 12 * 60,
    },
  ];
}

/** Дефолтный контент публичного сервиса (CMS → localStorage) */
export function defaultServiceContent(): ServiceContent {
  return {
    orgNameRu: "Верховный суд Кыргызской Республики",
    orgNameKy: "Кыргыз Республикасынын Жогорку соту",
    appNameRu: "Приём граждан руководством",
    appNameKy: "Жетекчилик тарабынан кабыл алуу",
    navBookCtaRu: "Записаться на приём",
    navBookCtaKy: "Кабыл алууга жазылуу",
    headerNav: [
      { href: "/", labelRu: "Главная", labelKy: "Башкы бет" },
      { href: "/book", labelRu: "Запись на приём", labelKy: "Кабыл алууга жазылуу" },
      { href: "/my-appointment", labelRu: "Моя запись", labelKy: "Менин жазылууум" },
      { href: "/feedback", labelRu: "Оценка приёма", labelKy: "Кабыл алууну баалоо" },
      { href: "/rules", labelRu: "Правила записи", labelKy: "Жазылуу эрежелери" },
      { href: "/process", labelRu: "Порядок работы", labelKy: "Иштөө тартиби" },
    ],
    hubNav: [
      {
        href: "/book",
        labelRu: "Запись на приём",
        labelKy: "Кабыл алууга жазылуу",
        descRu: "Регистрация, тема, дата и время",
        descKy: "Каттоо, тема, күн жана убакыт",
      },
      {
        href: "/my-appointment",
        labelRu: "Моя запись",
        labelKy: "Менин жазылууум",
        descRu: "Перенос и отмена",
        descKy: "Жылдыруу жана жокко чыгаруу",
      },
      {
        href: "/feedback",
        labelRu: "Оценка приёма",
        labelKy: "Кабыл алууну баалоо",
        descRu: "Качество онлайн-записи и приёма",
        descKy: "Онлайн-жазылуу жана кабыл алуу сапаты",
      },
      {
        href: "/rules",
        labelRu: "Правила",
        labelKy: "Эрежелер",
        descRu: "График и ограничения",
        descKy: "График жана чектөөлөр",
      },
      {
        href: "/process",
        labelRu: "Порядок работы",
        labelKy: "Иштөө тартиби",
        descRu: "Этапы рассмотрения",
        descKy: "Кароо этаптары",
      },
    ],
    footerReceptionRu: "Общественная приёмная",
    footerReceptionKy: "Коомдук кабыл алуу",
    footerDemoRu: "Демонстрационный стенд. Данные хранятся локально",
    footerDemoKy: "Демонстрациялык стенд. Маалымат жергиликтүү сакталат",
    footerIndependenceRu:
      "Независимость судей обеспечивается в полном объёме",
    footerIndependenceKy: "Соттордун көз карандысыздыгы толук камсыз кылынат",
    footerNoCasesRu: "Конкретные судебные дела на приёме не рассматриваются",
    footerNoCasesKy: "Конкреттүү сот иштери кабыл алууда каралбайт",
    footerCitizensRu: "Гражданам",
    footerCitizensKy: "Жарандарга",
    footerHelpRu: "Справка",
    footerHelpKy: "Маалымат",
    footerImportantRu: "Важная информация",
    footerImportantKy: "Маанилүү маалымат",
    hubKickerRu:
      "Ниже — запись на приём, управление записью, правила и оценка качества сервиса (электронная запись и работа общественной приёмной).",
    hubKickerKy:
      "Төмөндө — жазылуу, жазылууну башкаруу, эрежелер жана сервис сапатын баалоо (электрондук жазылуу + кабыл алуу).",
    hubTitleRu: "Приём граждан руководством Верховного суда",
    hubTitleKy: "Жетекчилик тарабынан жарандарды кабыл алуу",
    hubLeadRu:
      "Уважаемые граждане! В настоящем разделе Верховного суда Кыргызской Республики Вы можете осуществить предварительную электронную запись на личный приём руководством, проверить состояние обращения по регистрационному коду, перенести или отменить запись, а также ознакомиться с правилами приёма. Сервис предоставляется бесплатно.",
    hubLeadKy:
      "Урматтуу жарандар! Кыргыз Республикасынын Жогорку сотунун ушул бөлүмүндө жетекчилик тарабынан жеке кабыл алууга алдын ала электрондук жазылуу, каттоо коду боюнча кайрылуунун абалын текшерүү, жазылууну которуу же жокко чыгаруу, ошондой эле кабыл алуу эрежелери менен таанышуу мүмкүн. Кызмат акысыз көрсөтүлөт.",
    hubCtaRu: "Записаться на личный приём",
    hubCtaKy: "Жеке кабыл алууга жазылуу",
    memoTitleRu: "Памятка для заявителя",
    memoTitleKy: "Кайрылуучуга эскертме",
    memoItemsRu: [
      "На личном приёме не обсуждаются конкретные судебные дела, законность судебных актов и результаты рассмотрения дел.",
      "Предмет приёма: организация судопроизводства, деятельность суда, предложения по законодательству Кыргызской Республики.",
      "Независимость судей обеспечивается в полном объёме; вмешательство в осуществление правосудия не допускается.",
      "Запись бесплатна. Явка осуществляется строго в выбранный день и временной интервал.",
    ],
    memoItemsKy: [
      "Жеке кабыл алууда конкреттүү сот иштери, сот актыларынын мыйзамдуулугу жана иштерди кароонун натыйжалары талкууланбайт.",
      "Кабыл алуунун предмети: сот өндүрүшүн уюштуруу, соттун иши, Кыргыз Республикасынын мыйзамдары боюнча сунуштар.",
      "Соттордун көз карандысыздыгы толук сакталат; сот адилеттигине кийлигишүүгө жол берилбейт.",
      "Жазылуу акысыз. Келүү — жазылган күн жана убакыт аралыгы боюнча гана.",
    ],
    allowedTitleRu: "Предмет приёма",
    allowedTitleKy: "Кабыл алуунун предмети",
    forbiddenTitleRu: "Не рассматривается",
    forbiddenTitleKy: "Каралбайт",
    allowedRu: [...RECEPTION_ALLOWED],
    allowedKy: [
      "сот өндүрүшүн уюштуруу",
      "соттун иши",
      "мыйзамдар боюнча сунуштар",
      "кабыл алууда берилген жазуу жүзүндөгү кайрылуулар",
    ],
    forbiddenRu: [...RECEPTION_FORBIDDEN],
    forbiddenKy: [
      "конкреттүү сот иштери",
      "сот чечимдеринин мыйзамдуулугу",
      "иштерди кароонун натыйжалары",
    ],
    cycleTitleRu: "Порядок рассмотрения обращения",
    cycleTitleKy: "Кайрылууну кароо тартиби",
    cycleLeadRu:
      "Регистрация, предварительный анализ, личный приём, контроль исполнения поручения, направление ответа, обратная связь, мониторинг.",
    cycleLeadKy:
      "Каттоо, алдын ала талдоо, жеке кабыл алуу, аткарууну көзөмөлдөө, кайтарым байланыш, мониторинг.",
    bookTitleRu: "Электронная запись на личный приём",
    bookTitleKy: "Жеке кабыл алууга электрондук жазылуу",
    bookSubtitleRu: "Руководство Верховного суда Кыргызской Республики",
    bookSubtitleKy: "Кыргыз Республикасынын Жогорку сотунун жетекчилиги",
    bookTargetHintRu:
      "График и ФИО соответствуют разделу «График приёма граждан». Предварительная запись — в указанном кабинете. Телефон доверия указан в блоке контактов.",
    bookTargetHintKy:
      "График жана ФИО «Жарандарды кабыл алуу графигине» ылайык. Алдын ала жазылуу — көрсөтүлгөн кабинетте. Ишеним телефону байланыш блогунда.",
    contacts: contactsDefault(),
    leadership: defaultLeadership(),
    processNoticeRu:
      "Справочный раздел. Описание этапов работы сервиса. В официальной версии портала данный раздел может не публиковаться отдельно.",
    processNoticeKy:
      "Маалымдама бөлүм. Сервистин этаптарынын сүрөттөлүшү. Расмий порталда бул бөлүм өзүнчө жарыяланбашы мүмкүн.",
    processSteps: [
      {
        stageRu: "Этап 1",
        stageKy: "1-этап",
        titleRu: "Заявка на приём",
        titleKy: "Кабыл алууга өтүнмө",
        pointsRu: [
          "Сведения о заявителе, тема обращения, дата и время",
          "Заявка принимается к рассмотрению общественной приёмной",
          "Выдаются регистрационный код и PIN-код",
          "Запись вступает в силу после подтверждения; заявителю направляется уведомление",
        ],
        pointsKy: [
          "Кайрылуучу жөнүндө маалымат, тема, күн жана убакыт",
          "Өтүнмөнү коомдук кабыл алуу кароого кабыл алат",
          "Каттоо коду жана PIN-код берилет",
          "Жазылуу ырастоодон кийин күчүнө кирет; кайрылуучуга билдирме жөнөтүлөт",
        ],
      },
      {
        stageRu: "Этап 2",
        stageKy: "2-этап",
        titleRu: "Предварительное изучение",
        titleKy: "Алдын ала изилдөө",
        pointsRu: [
          "Электронная карточка обращения",
          "Сведения о заявителе, содержание, категория",
          "История и предыдущие обращения",
          "Разъяснения в соответствии с законодательством",
        ],
        pointsKy: [
          "Кайрылуунун электрондук карточкасы",
          "Кайрылуучу, мазмун, категория",
          "Тарых жана мурунку кайрылуулар",
          "Мыйзамга ылайык түшүндүрмөлөр",
        ],
      },
      {
        stageRu: "Этап 3",
        stageKy: "3-этап",
        titleRu: "Личный приём",
        titleKy: "Жеке кабыл алуу",
        pointsRu: [
          "Изложение существа обращения",
          "Разъяснение порядка дальнейших действий",
          "Поручение в пределах компетенции",
          "Назначение ответственного лица",
        ],
        pointsKy: [
          "Кайрылуунун маңызын баяндоо",
          "Кийинки аракеттердин тартибин түшүндүрүү",
          "Ыйгарым укук чегинде тапшырма",
          "Жооптуу адамды дайындоо",
        ],
      },
      {
        stageRu: "Этап 4",
        stageKy: "4-этап",
        titleRu: "Контроль исполнения",
        titleKy: "Аткарууну көзөмөлдөө",
        pointsRu: [
          "Роль «Ответственный по обращению»",
          "Контроль исполнения поручения",
          "Взаимодействие с подразделениями",
          "Направление обоснованного ответа",
        ],
        pointsKy: [
          "«Кайрылуу боюнча жооптуу» ролу",
          "Тапшырманын аткарылышын көзөмөлдөө",
          "Бөлүмдөр менен өз ара аракет",
          "Негизделген жоопту жөнөтүү",
        ],
      },
      {
        stageRu: "Обратная связь",
        stageKy: "Кайтарым байланыш",
        titleRu: "Оценка работы приёмной",
        titleKy: "Кабыл алуунун ишин баалоо",
        pointsRu: [
          "Форма оценки после приёма",
          "Уважительное отношение",
          "Ясность дальнейших действий",
          "Соблюдение сроков",
        ],
        pointsKy: [
          "Кабыл алуудан кийинки баалоо формасы",
          "Урматтоо мамилеси",
          "Кийинки аракеттердин түшүнүктүүлүгү",
          "Мөөнөттөрдү сактоо",
        ],
      },
      {
        stageRu: "Мониторинг",
        stageKy: "Мониторинг",
        titleRu: "Анализ повторных обращений",
        titleKy: "Кайталанган кайрылууларды талдоо",
        pointsRu: [
          "Количество и темы повторных обращений",
          "Выявление системных проблем",
          "Сводка для руководства",
        ],
        pointsKy: [
          "Кайталанган кайрылуулардын саны жана темалары",
          "Системалык көйгөйлөрдү аныктоо",
          "Жетекчилик үчүн жыйынтык",
        ],
      },
    ],
    rules: { ...BOOKING_RULES },
  };
}

export function mergeServiceContent(
  partial?: Partial<ServiceContent> | null
): ServiceContent {
  const d = defaultServiceContent();
  if (!partial) return d;
  return {
    ...d,
    ...partial,
    rules: { ...d.rules, ...(partial.rules ?? {}) },
    contacts: { ...d.contacts, ...(partial.contacts ?? {}) },
    headerNav: Array.isArray(partial.headerNav) ? partial.headerNav : d.headerNav,
    hubNav: Array.isArray(partial.hubNav) ? partial.hubNav : d.hubNav,
    leadership: Array.isArray(partial.leadership)
      ? partial.leadership.map((p) => ({
          ...d.leadership[0],
          ...p,
          weekdays: Array.isArray(p.weekdays) ? p.weekdays : [2, 4],
          showInSchedule: p.showInSchedule ?? true,
          bookable: p.bookable ?? true,
          windowKind: p.windowKind ?? "calendar",
          startMinutes: p.startMinutes ?? 8 * 60,
          endMinutes: p.endMinutes ?? 12 * 60,
        }))
      : d.leadership,
    processSteps: Array.isArray(partial.processSteps)
      ? partial.processSteps
      : d.processSteps,
    memoItemsRu: partial.memoItemsRu ?? d.memoItemsRu,
    memoItemsKy: partial.memoItemsKy ?? d.memoItemsKy,
    allowedRu: partial.allowedRu ?? d.allowedRu,
    allowedKy: partial.allowedKy ?? d.allowedKy,
    forbiddenRu: partial.forbiddenRu ?? d.forbiddenRu,
    forbiddenKy: partial.forbiddenKy ?? d.forbiddenKy,
  };
}

export function pickLocale(
  isKy: boolean,
  ru: string | undefined,
  ky: string | undefined
): string {
  if (isKy) return (ky || ru || "").trim();
  return (ru || ky || "").trim();
}
