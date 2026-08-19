/**
 * Статичные тексты. Источник — папка content/ (демо без бэкенда).
 * Когда задан NEXT_PUBLIC_API_URL, те же JSON отдаёт GET /public/bootstrap.
 */
import siteJson from "../../content/site.json";
import uiRuJson from "../../content/ui.ru.json";
import uiKyJson from "../../content/ui.ky.json";
import bookingRulesJson from "../../content/booking-rules.json";
import eligibilityTreeJson from "../../content/eligibility-tree.json";
import surveyJson from "../../content/survey.json";
import calendarRulesJson from "../../content/calendar-rules.json";
import dictionariesJson from "../../content/dictionaries.json";
import shellJson from "../../content/shell.json";
import type { Dict } from "@/locales/types";
import type {
  BookingRulesContent,
  EligibilityTreeNode,
  ServiceContent,
  SurveyMeta,
  SurveyQuestion,
} from "./types";

export const catalog = {
  site: siteJson as ServiceContent,
  uiRu: uiRuJson as Dict,
  uiKy: uiKyJson as Dict,
  bookingRules: bookingRulesJson as BookingRulesContent,
  eligibilityTree: eligibilityTreeJson as EligibilityTreeNode[],
  survey: surveyJson as {
    meta: SurveyMeta;
    questions: SurveyQuestion[];
  },
  calendarRules: calendarRulesJson as { rulesText: string },
  dictionaries: dictionariesJson,
  shell: shellJson,
};

export function cloneCatalog<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
