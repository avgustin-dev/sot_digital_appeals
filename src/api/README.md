# Клиент API фронта

Если вы пишете бэкенд: **не ищите эндпоинты по страницам**. Список вызовов — здесь и в `docs/backend/`.

| Файл | Что это |
| --- | --- |
| `paths.ts` | относительные пути `/auth/...`, `/public/...`, `/staff/...` |
| `client.ts` | методы, которые UI уже вызывает |
| `dto.ts` | тела запросов и ответов (camelCase) |
| `http.ts` | `Authorization: Bearer`, ошибки `{ status, code, message }` |
| `../docs/backend/openapi.yaml` | полная спека |
| `../docs/backend/ENDPOINTS.md` | таблица «экран → метод» |

База URL: `NEXT_PUBLIC_API_URL` (уже с `/api/v1`, без `/` в конце).
