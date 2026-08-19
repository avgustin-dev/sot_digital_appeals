# Цифровая платформа приёма граждан (демо)

Этот репозиторий — **учебный контур без бэкенда**: шаблоны `content/` и тестовые записи. На Vercel работает без API.

Основной фронт под бэкенд: [sot-priem-front](https://github.com/avgustin-dev/sot-priem-front).

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 · служебный кабинет: http://localhost:3000/admin

В `.env.local` **не** задавайте `NEXT_PUBLIC_API_URL`. Для Vercel уже есть `.env.production` с `NEXT_PUBLIC_DEMO=true`. В настройках проекта Vercel поле API URL оставьте пустым.

## Учебный вход

| Логин | Пароль | Роль |
| --- | --- | --- |
| `admin` | `admin123` | администратор |
| `priemnaya` | `priem123` | общественная приёмная |
| `rukovodstvo` | `sud2026` | руководство |
| `predsedatel` | `vs2026` | председатель |
| `otvet1` / `otvet2` | `otvet123` | ответственный |

Тестовые записи: `VS-2026-1001` (PIN `4821`), `VS-2026-1002` (PIN `7390`), заявка на проверке `VS-2026-1003` (PIN `5502`).

Тексты сайта правятся в `content/` (их же читает `src/lib/catalog.ts`).

Публичные адреса: `/electronic-appointment`, `/appointment-status`, `/service-evaluation/{code}`.

## Стек

Next.js 16 · React 19 · TypeScript · Tailwind · Zustand
