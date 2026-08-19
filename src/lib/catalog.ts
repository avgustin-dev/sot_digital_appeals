/**
 * Оболочка интерфейса (кнопки, статусы, 404). Не CMS сайта.
 * Тексты приёма, ФИО и правила — bootstrap / админка.
 */
import uiRuJson from "@/locales/ui.ru.json";
import uiKyJson from "@/locales/ui.ky.json";
import shellJson from "@/locales/shell.json";
import type { Dict } from "@/locales/types";

export const catalog = {
  uiRu: uiRuJson as Dict,
  uiKy: uiKyJson as Dict,
  shell: shellJson,
};

export function cloneCatalog<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
