# Статичные тексты

Снимок копирайта фронта для бэкенда. Приложение пока читает те же тексты из TypeScript (`src/lib`, `src/locales`). Позже их отдаёт `GET /public/content`.

Пересобрать из исходников:

```bash
npm run export:content
```

| Файл | Что внутри | Источник |
| --- | --- | --- |
| `site.json` | Публичный сайт: навигация, руководство, контакты, процесс, правила | `src/lib/serviceContent.ts` |
| `ui.ru.json` / `ui.ky.json` | Интерфейс RU / KY | `src/locales/ru.ts`, `ky.ts` |
| `booking-rules.json` | Правила записи на первом экране | `BOOKING_RULES` в `eligibility.ts` |
| `eligibility-tree.json` | Дерево допуска / отказов | `cloneEligibilityTree()` |
| `survey.json` | Анкета (мета + вопросы, без ответов) | `src/lib/surveySeed.ts` |
| `calendar-rules.json` | Текст правил календаря | `DEFAULT_CALENDAR` в `seed.ts` |
| `shell.json` | 404, ошибка сервиса, заголовки PDF | `error.tsx`, `not-found.tsx`, `pdfReport.ts` |
| `dictionaries.json` | Справочники: статусы, регионы, контакты, предметы приёма | `src/lib/constants.ts` |

Не входит: заявки, слоты, учётные записи, ответы опросника — это операционные данные, не копирайт.

Контракт REST для Java: `docs/backend/`.
