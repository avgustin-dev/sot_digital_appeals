import type { SurveyQuestion, SurveyResponse } from "./types";
import { catalog, cloneCatalog } from "./catalog";

export const SEED_SURVEY_META = catalog.survey.meta;
export const SEED_SURVEY_QUESTIONS: SurveyQuestion[] = cloneCatalog(
  catalog.survey.questions
);
/** Ответы — операционные данные, не копирайт. */
export const SEED_SURVEY_RESPONSES: SurveyResponse[] = [];
