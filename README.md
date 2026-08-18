# Цифровая платформа приёма граждан

Фронт: Next.js. Бэкенд подключается по контракту `docs/backend/`.

**Если вы собираете API:** откройте `docs/backend/ENDPOINTS.md` и `docs/backend/openapi.yaml`. Фронт уже вызывает эти методы из `src/api/client.ts`.

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 · служебный кабинет: http://localhost:3000/admin

## Подключение бэкенда

Спека: `docs/backend/openapi.yaml`. Клиент, который уже вызывает фронт: `src/api/client.ts`. Обзор для генерации API: `ARCHITECTURE.md`.

В `.env.local`:

```
NEXT_PUBLIC_API_URL=https://host/api/v1
```

Пока URL пуст, данные живут в браузере. Пароли сотрудников в localStorage не пишутся.

Статичные тексты — папка `content/` (их же отдаёт `GET /public/bootstrap`).

Публичные адреса для писем и талона: `/electronic-appointment`, `/appointment-status`, `/service-evaluation/{code}`.

## Стек

Next.js 16 · React 19 · TypeScript · Tailwind · Zustand
