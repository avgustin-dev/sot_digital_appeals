# Эндпоинты, которые вызывает фронт

Бэкенд реализуется **ровно по этому списку**. Спека с телами запросов: `openapi.yaml`. Клиент: `src/api/client.ts`. Префикс: `/api/v1`.

JSON camelCase. Часовой пояс `Asia/Bishkek`. PIN только в ответе `POST /public/appointments`.

## Публичные (без JWT)

| Метод | Путь | Экран |
| --- | --- | --- |
| GET | `/public/bootstrap` | все публичные страницы при старте |
| GET | `/public/dates?targetId=` | календарь записи |
| GET | `/public/slots?date=&targetId=&excludeAppointmentId=` | слоты дня |
| POST | `/public/appointments` | `/electronic-appointment` |
| GET | `/public/appointments/{code}` | главная, оценка по коду |
| POST | `/public/appointments/{code}/unlock` | `/appointment-status` (код + PIN) |
| POST | `/public/appointments/{code}/actions` | отмена / перенос гражданином |
| POST | `/public/appointments/{code}/feedback` | `/service-evaluation/{code}` |
| POST | `/public/recover-codes` | главная, восстановление кода |
| GET | `/public/survey` | CMS опросника (публичное заполнение — opros.sot.kg) |
| POST | `/public/survey` | не используется в UI v1 |

## Сотрудник (Bearer JWT)

| Метод | Путь | Экран |
| --- | --- | --- |
| POST | `/auth/login` | `/admin/login` |
| POST | `/auth/logout` | выход |
| GET | `/auth/me` | после входа |
| GET | `/staff/appointments` | кабинет, календарь, заявки |
| POST | `/staff/appointments/{id}/confirm` | входящие |
| POST | `/staff/appointments/{id}/reject` | входящие |
| POST | `/staff/appointments/{id}/cancel` | карточка, календарь |
| POST | `/staff/appointments/{id}/restore` | карточка, календарь |
| PATCH | `/staff/appointments/{id}` | карточка, данные гражданина |
| POST | `/staff/appointments/{id}/status` | неявка / статус |
| POST | `/staff/appointments/{id}/reschedule` | карточка, перенос |
| GET | `/staff/appeals` | список карточек |
| GET | `/staff/appeals/{id}` | карточка |
| POST | `/staff/appeals/{id}/prep` | подготовка |
| POST | `/staff/appeals/{id}/ready` | к приёму |
| POST | `/staff/appeals/{id}/reception` | протокол приёма |
| POST | `/staff/appeals/{id}/control` | журнал поручения |
| POST | `/staff/appeals/{id}/assignment-status` | статус поручения |
| POST | `/staff/appeals/{id}/answer` | ответ гражданину |
| POST | `/staff/appeals/{id}/stage` | смена этапа (`under_review` = начать подготовку) |
| GET/PUT | `/staff/calendar` | график |
| GET/PUT | `/staff/content` | тексты сайта |
| GET/PUT | `/staff/eligibility` | дерево допуска, тело `{ "nodes": [] }` |
| GET/PUT | `/staff/survey` | вопросы опросника целиком |
| GET | `/staff/survey/responses` | сводка |
| GET | `/staff/analytics` | опционально; фронт считает по спискам |
| GET | `/staff/users` | выбор ответственного |

## Ссылки в письмах и QR талона

Не API, но бэкенд должен писать их в письме:

- запись: `{SITE}/electronic-appointment`
- статус: `{SITE}/appointment-status?code={CODE}`
- оценка: `{SITE}/service-evaluation/{CODE}`

PIN в QR и в GET **не** включать.
