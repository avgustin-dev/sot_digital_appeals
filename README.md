# Цифровая платформа приёма граждан

Верховный суд Кыргызской Республики. Фронт: Next.js. Бэкенд подключается отдельно.

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 · служебный кабинет: http://localhost:3000/admin

## Подключение бэкенда

Контракт: `src/api/contract.ts`. Клиент: `src/api/http.ts`.

В `.env.local`:

```
NEXT_PUBLIC_API_URL=https://host/api/v1
```

Пока URL пуст, данные живут в браузере. Пароли сотрудников в localStorage не пишутся.

Статичные тексты (сайт, UI, правила, дерево допуска, опросник, справочники) лежат в `content/`. Пересборка: `npm run export:content`.

Контракт для Java-бэкенда: `docs/backend/` (OpenAPI + примеры JSON). Клиент фронта: `src/api/client.ts`.

## Учебный вход (только разработка)

В production список логинов скрыт. Локально: `predsedatel / vs2026`, `priemnaya / priem123`.

## Стек

Next.js 16 · React 19 · TypeScript · Tailwind · Zustand
