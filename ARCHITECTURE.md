# Архитектура и стек (2026)

## Стек

| Слой | Технология | Роль в проекте |
|------|------------|----------------|
| Framework | **Next.js 16.3** App Router + **Turbopack** | Маршруты, layout groups, prod build |
| UI | **React 19.2** + **TypeScript 5.8** | Клиентские страницы + RSC где нужно |
| Стили | **Tailwind CSS 3.4** + tokens `court.*` | Палитра ВС: navy / gold / mist |
| Состояние | **Zustand 5** + `persist` → **localStorage** | Записи, карточки, сессия, календарь |
| Даты | **date-fns 4** | Слоты 20+5, график дней |
| Иконки | **lucide-react** | UI |
| Node | **20.x / 22.x / 24.x** (рекомендуется 24 LTS) | Требование Next 16; Vercel не поддерживает Node 26 для Builds |

### Почему Zustand, не Redux

Демо-CRM: appointments + appeals + calendar + session. Persist в браузер для презентации. Меньше boilerplate, selectors из коробки.

### Почему Tailwind, не CSS-in-JS

Официальный строгий UI, utility + design tokens в `tailwind.config.ts` (`court.navy`, `court.gold`…).

### Почему localStorage

Нет бэкенда/БД — стенд для показа. Ключ: `vs-kr-citizen-platform-v2`.

---

## Архитектура

```
src/
  app/
    (public)/          # портал гражданина
      book/            # wizard 4 шага + sidebar
      my-appointment/  # модули: найти / детали / перенос / история
      feedback/        # оценка приёмной
      rules/, process/ # справка (footer + hub, не header)
    admin/             # скрытый кабинет /admin
      appeals/, reception/, control/, calendar/, analytics/, settings/
  components/
    booking/           # SlotPicker, BookSidebar
    layout/            # PublicHeader/Footer, StaffShell, CitizenHubNav
    ui/                # WizardSteps, Badge, PageLoader…
  lib/
    store.ts           # Zustand
    types.ts, seed.ts, slots.ts, constants.ts, utils.ts
```

### Публичное меню (header)

Только: Главная · Запись · Моя запись · Оценить  

**Правила / Как работает** → footer + модули на главной + sidebar на `/book`.  
**Админка** → только URL `/admin` (не в публичном меню).

### Служебный `/admin`

| Путь | Этап предложения |
|------|------------------|
| `/admin/appeals` | Карточка, этап 2 |
| `/admin/reception` | Этап 3, протокол |
| `/admin/control` | Этап 4, ответственный |
| `/admin/analytics` | Мониторинг повторных |
| `/admin/settings` | Календарь встреч |
| `/admin/calendar` | Слоты дня |

### Слоты (рукопись)

`duration=20`, `break=5`, start 08:00 →  
`08:00–08:20`, `08:25–08:45`, `08:50–09:10`, …

### Цикл обращения

```
registered → under_review → ready_for_reception
  → in_control → answered → closed
```

---

## UX (по аналогии с гос.порталами)

- Пошаговая запись (условия → данные → слот → confirm), как LA Court / Госуслуги  
- Самообслуживание: код + PIN → перенос/отмена  
- Модульный хаб на главной и sidebar у «Моя запись»  
- Талон: печать после подтверждения  
- Адаптив: scroll дат, sticky admin shell, safe-area  

---

## Запуск

```bash
npm install
npm run dev        # :3000
npm run dev:alt    # :3005
npm run build
```

Демо: `priemnaya/priem123`, запись `VS-2026-1001` / `4821`  
Админ: http://localhost:3000/admin
