# BMAD MVP – ConsciousFunnels

## Обзор
- Назначение: MVP платформы для построения осознанных воронок продаж с AI-поддержкой.
- Горизонт: 6 недель, 3 релизных итерации.
- Команды: Frontend (Next.js), Backend (Clojure API), Data/AI, Product.
- Цель релиза: подтвердить ценность конструкторов и AI-инсайтов на группе пилотных клиентов.

## Scope MVP (2–4 недели)

### Core Infrastructure (Неделя 1)
- [x] Turborepo с рабочими пространствами и общими пакетами.
- [x] Next.js 15 (App Router, React 19) + Tailwind UI-шаблон.
- [x] Clojure API с REST-эндпоинтами и JWT-аутентификацией.
- [x] PostgreSQL (Railway) + миграции продуктов/покупок.
- [x] CI-таски lint/type-check/build в Turbo.

### Basic Funnel Builder (Неделя 2)
- [ ] Drag & drop редактор на `@dnd-kit/core`.
- [ ] Хранение схемы воронки в JSON (Postgres `funnels`).
- [ ] Предпросмотр с SSR и responsive-шаблонами.
- [ ] Версия для мобильных (tailwind breakpoints).

### Simple AI Integration (Недели 2–3)
- [ ] Адаптер Hugging Face Inference API (Rate limit ≤ 60 req/min).
- [ ] Очередь задач AI (BullMQ / Redis) + ретрай.
- [ ] Обогащение карточек аналитики эмоциями (радость/ожидание/страх/злость/печаль).
- [ ] Сохранение результатов анализа (таблица `emotion_insights`).

### Basic Analytics (Неделя 3)
- [ ] Трекинг событий: page_view, form_submit, checkout_start, checkout_success.
- [ ] ETL на бэкенде → агрегаты по воронкам/продуктам.
- [ ] Дашборд: график конверсии, динамика эмоций, топ-страницы.
- [ ] Экспорт CSV для пилотных клиентов.

### Payment Integration (Недели 3–4)
- [ ] Stripe Checkout Session (one-time + subscription).
- [ ] Вебхук `checkout.session.completed` → создание заказа.
- [ ] CRUD продуктов (цена в центах, валюта USD).
- [ ] Уведомление клиента по email (Resend API).

## Таблица фич MVP

| Блок | Фича | Ответственный | Статус | Критерий готовности |
| --- | --- | --- | --- | --- |
| Инфраструктура | CI build + preview deployments | DevOps | ✅ | Build без ошибок, auto preview в Vercel |
| Конструктор | Drag & drop Canvas + Library | Frontend | 🚧 | Создание >1 шага воронки и сохранение |
| AI | Анализ эмоций текста CTA | Data/AI | ⏳ | API Hugging Face возвращает ≥3 эмоции < 2 c |
| Аналитика | Дашборд KPI | Backend | ⏳ | Запрос `/api/analytics/insights` отдаёт метрики |
| Платежи | Stripe checkout | Backend | 🚧 | Сессия оплаты создаётся, вебхук создаёт заказ |

## Пользовательский сценарий
1. Регистрация: email + пароль, подтверждение правилами использования.
2. Онбординг: выбор шаблона воронки, подсказки AI.
3. Конструктор: сборка шагов, предпросмотр, сохранение.
4. Публикация: генерация публичного URL, настройка домена.
5. Покупка: клиент проходит страницу, оплачивает Stripe.
6. Аналитика: владелец видит конверсии, эмоции, рекомендации.

## Архитектура и потоки данных
- Frontend → API: Next.js `fetch` → Clojure REST JSON.
- API → DB: Postgres через HugSQL, схемы `users`, `products`, `funnels`, `orders`, `emotion_insights`.
- API → Stripe/HF: внешние вызовы, окружение `JWT_SECRET_KEY`, `STRIPE_SECRET_KEY`, `HF_TOKEN`.
- Webhooks Stripe → API → Postgres/Resend.
- Логи и трассировка: pino + OpenTelemetry (opc.).

## AI-функциональность
- Вход: текст CTA, заголовки, ответы формы.
- Модель: `cardiffnlp/twitter-roberta-base-emotion` (multilabel).
- Выход: массив {label, score}; фильтр score ≥ 0.2.
- Постобработка: вычисление доминирующей эмоции, рекомендация контента.
- Ограничения: кеш на 15 мин, хранилище последних 10 анализов.

## UI-компоненты
- `MetricCard`, `EmotionChart`, `FunnelStepCard`, `ProductTable`.
- Дизайн-токены: primary `#6366F1`, success `#10B981`, warning `#F59E0B`.
- Сетка: 12 колонок, gap 24 px, breakpoint sm/md/lg/xl.
- Темный режим: позже, но заложить переменные CSS.

## Аналитика и метрики
- KPI: conversion rate, средний чек, эмоция недели.
- Методы: server-side события + client beacon fallback.
- Визуализация: Recharts (LineChart, PieChart, BarChart).
- Отчёты: ежедневный CSV, недельный PDF (ручной экспорт).

## План тестирования
- Smoke: /healthz, /api/auth/login, /api/products.
- Функциональные сценарии: регистрация, создание продукта, успешный checkout.
- Нагрузочные: 50 параллельных запросов на `/api/public/orders` (k6).
- E2E: Playwright сценарий регистрации и покупки (минимум 1).
- QA чек-лист UI: адаптивность, состояния ошибок.

## Риски и допущения
- Hugging Face rate limit → нужно кеширование и очереди.
- OneDrive/Windows блокирует `.next/trace` → перенос проекта вне синхронизации.
- Stripe требует продакшен-домен и вебхук → учесть на soft launch.
- Недостаток данных для AI → вручную размеченные 20 примеров.

## Стратегия запуска
- Soft launch: 10–20 пилотных агентств, ежедневный созвон, доска фидбэка.
- Public launch: Product Hunt, LinkedIn, Reddit (r/marketing, r/startups).
- Контент: блог о conscious sales, видео-демо, кейсы пилотов.
- Поддержка: Slack-канал, SLA ≤ 12 часов.

## Критерии успеха
- Time-to-first-funnel < 10 минут.
- CR landing → checkout ≥ 15% на пилотах.
- Retention D7 ≥ 70%.
- Средний скоринг эмоций по CTA ≥ 0.8 точности по ручной выборке.
- Page Speed LCP < 2 сек на Vercel (мобильный 4G).

## Следующие шаги
- Исправить ошибки импорта и типизации (`npm run check-types`).
- Настроить `outputFileTracingRoot` и вынести репозиторий из OneDrive.
- Реализовать очередь AI и эндпоинт `/api/analytics/insights`.
- Написать smoke-тесты (`apps/web/tests/smoke.spec.ts`).
- Подготовить план демо и сценарии пользовательского тестирования.
