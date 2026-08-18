import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultServiceContent } from "../src/lib/serviceContent";
import { ru } from "../src/locales/ru";
import { ky } from "../src/locales/ky";
import { BOOKING_RULES, cloneEligibilityTree } from "../src/lib/eligibility";
import { SEED_SURVEY_META, SEED_SURVEY_QUESTIONS } from "../src/lib/surveySeed";
import { DEFAULT_CALENDAR } from "../src/lib/seed";
import {
  APP_NAME,
  APPLICANT_TYPES,
  CATEGORY_LABELS,
  COURT_CONTACTS,
  FEEDBACK_QUESTIONS,
  LEADERSHIP_RECEPTION_SCHEDULE,
  ORG_NAME,
  ORG_SHORT,
  PIPELINE_STEPS,
  RECEPTION_ALLOWED,
  RECEPTION_FORBIDDEN,
  RECEPTION_TARGETS,
  REGIONS_KR,
  STAGE_LABELS,
  STATUS_LABELS,
} from "../src/lib/constants";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content");
mkdirSync(dir, { recursive: true });

function save(name: string, data: unknown) {
  writeFileSync(join(dir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

save("site.json", defaultServiceContent());
save("ui.ru.json", ru);
save("ui.ky.json", ky);
save("booking-rules.json", BOOKING_RULES);
save("eligibility-tree.json", cloneEligibilityTree());
save("survey.json", {
  meta: SEED_SURVEY_META,
  questions: SEED_SURVEY_QUESTIONS,
});
save("calendar-rules.json", { rulesText: DEFAULT_CALENDAR.rulesText });
save("shell.json", {
  error: {
    titleRu: "Сервис временно недоступен",
    bodyRu:
      "Повторите попытку. Если ошибка сохраняется, обратитесь в общественную приёмную.",
    retryRu: "Повторить",
    homeRu: "На главную",
  },
  notFound: {
    code: "404",
    titleRu: "Страница не найдена",
    bodyRu: "Проверьте адрес или вернитесь в раздел приёма граждан.",
    homeRu: "На главную",
    bookRu: "Запись на приём",
  },
  pdf: {
    titleRu: "Отчёт по приёму граждан",
    subtitleRu: "Сводка для руководства Верховного суда КР",
    popupHintRu:
      "Разрешите всплывающие окна. Затем: Печать → «Сохранить как PDF».",
  },
});
save("dictionaries.json", {
  orgName: ORG_NAME,
  orgShort: ORG_SHORT,
  appName: APP_NAME,
  categories: CATEGORY_LABELS,
  stages: STAGE_LABELS,
  statuses: STATUS_LABELS,
  pipeline: PIPELINE_STEPS,
  allowed: RECEPTION_ALLOWED,
  forbidden: RECEPTION_FORBIDDEN,
  regions: REGIONS_KR,
  applicantTypes: APPLICANT_TYPES,
  contacts: COURT_CONTACTS,
  leadershipSchedule: LEADERSHIP_RECEPTION_SCHEDULE,
  receptionTargets: RECEPTION_TARGETS,
  feedbackQuestions: FEEDBACK_QUESTIONS,
});
save("index.json", {
  note: "Статичные тексты фронта. Бэкенд может отдать те же JSON как GET /public/content.",
  files: [
    "site.json",
    "ui.ru.json",
    "ui.ky.json",
    "booking-rules.json",
    "eligibility-tree.json",
    "survey.json",
    "calendar-rules.json",
    "shell.json",
    "dictionaries.json",
  ],
});
