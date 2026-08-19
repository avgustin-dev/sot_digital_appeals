# Цифровая платформа приёма граждан

Фронт: Next.js. Это **основной репозиторий под бэкенд**. CMS на фронте пустой: тексты сайта, руководство и дерево допуска приходят из API.

Контракт: `docs/backend/ENDPOINTS.md`, `docs/backend/openapi.yaml`. Клиент: `src/api/client.ts`. Пример сида для бэка: `docs/backend/seed/`.

Демо без API (шаблоны `content/` + учебные данные, Vercel): [sot_digital_appeals](https://github.com/avgustin-dev/sot_digital_appeals).

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 · служебный кабинет: http://localhost:3000/admin

## Подключение бэкенда

В `.env.local`:

```
NEXT_PUBLIC_API_URL=https://host/api/v1
```

Без URL кабинет в production не заполняется учебными учётками. Оболочка интерфейса (кнопки RU/KY) — `src/locales/`.

Публичные адреса для писем и талона: `/electronic-appointment`, `/appointment-status`, `/service-evaluation/{code}`.

## Стек

Next.js 16 · React 19 · TypeScript · Tailwind · Zustand
