# 🤖 NEXUS.SALES - Список агентов и их задания

**Дата:** 2025-09-29  
**Tech Lead:** Claude Code  
**Проект:** ConsciousFunnels (NEXUS.SALES)  
**Цель:** Запустить MVP за 6 недель

---

## 👥 **КОМАНДА (6 АГЕНТОВ)**

```
🔵 Claude Code         → Tech Lead & Архитектор
🟢 Frontend Developer  → React/Next.js Specialist
🟡 AI/ML Specialist    → AI Integration & Analytics
🔴 QA Engineer         → Testing & Quality Assurance
🟣 Backend Developer   → API & Database
🟠 DevOps Engineer     → Deployment & Infrastructure
```

---

## 🔵 **АГЕНТ 1: Claude Code (Tech Lead)**

### **👤 ПРОФИЛЬ:**
```
Роль:           Tech Lead, Senior Full-Stack Developer
Специализация:  Архитектура, координация, code review
Языки:          TypeScript, Clojure, JavaScript
Ответственность: Общая техническая стратегия проекта
Статус:         ✅ ACTIVE
```

### **📋 ЗАДАНИЯ:**

#### **1. Координация команды** (Ongoing)
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   Ежедневно

Задачи:
□ Провести daily standup (09:00 CET в Slack)
□ Разрешить технические блокеры
□ Принимать архитектурные решения
□ Распределять новые задачи
□ Отслеживать прогресс всех агентов

Формат standup:
- Что сделано вчера
- Что делаю сегодня
- Есть ли блокеры
```

#### **2. Code Review** (Ongoing)
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
SLA:       <4 hours (critical), <24 hours (normal)

Задачи:
□ Ревью всех PR перед мержем
□ Проверка архитектурных решений
□ Best practices enforcement
□ Security review
□ Performance impact оценка

Критерии approval:
✅ Code quality высокое
✅ Tests написаны
✅ Documentation обновлена
✅ No TypeScript/ESLint errors
✅ Соответствует архитектуре
```

#### **3. Architecture Integration** (Week 1-6)
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   Ongoing

Задачи:
□ Интеграция Frontend ↔ Backend API
□ Интеграция AI Services ↔ Backend
□ Интеграция Database ↔ Redis ↔ API
□ Интеграция Testing ↔ CI/CD
□ Resolve integration conflicts
□ Performance bottlenecks мониторинг

Deliverables:
✅ Seamless integration всех компонентов
✅ No breaking changes
✅ Performance metrics tracking
```

#### **4. Documentation** (Week 1-6)
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   Weekly updates

Задачи:
□ Architecture Decision Records (ADR)
□ API documentation updates
□ Deployment guides
□ Onboarding materials для новых агентов
□ Technical debt tracking

Формат:
- Markdown в репозитории
- Обновлять при каждом важном решении
```

#### **5. Risk Management** (Ongoing)
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   Weekly review

Задачи:
□ Мониторинг рисков проекта
□ Mitigation strategies
□ Escalation критических проблем
□ Timeline tracking
□ Resource allocation

Риски для мониторинга:
⚠️ Timeline slippage
⚠️ Technical blockers
⚠️ Integration issues
⚠️ Performance problems
```

---

## 🟢 **АГЕНТ 2: Frontend Developer**

### **👤 ПРОФИЛЬ:**
```
Роль:           Frontend Developer, UI/UX Specialist
Специализация:  React, Next.js 15, Responsive Design
Языки:          TypeScript, JavaScript, CSS
Инструменты:    Next.js, Tailwind, dnd-kit, Zustand
Статус:         ✅ READY TO START
```

### **📋 ЗАДАНИЯ:**

#### **1. Funnel Builder - Полная реализация** ⭐⭐⭐
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   7 дней (Week 1)
Сложность: High

Файлы:
src/components/funnel/FunnelBuilder.tsx
src/components/funnel/Canvas/
src/components/funnel/ElementLibrary/
src/components/funnel/Properties/

Подзадачи:
□ День 1-2: Drag & Drop система (@dnd-kit)
  - Перетаскивание из палитры на canvas
  - Изменение порядка элементов
  - Удаление элементов
  - Плавная анимация

□ День 3-4: Библиотека элементов
  - Text (заголовки, параграфы)
  - Button (CTA с действиями)
  - Image (загрузка и отображение)
  - Form (поля ввода, валидация)
  - Video (встроенное видео)
  - Divider (разделители)

□ День 5: Properties Panel
  - Редактирование выбранного элемента
  - Стили (цвет, размер, шрифт, отступы)
  - Контент (текст, ссылки, изображения)
  - Действия (URL, email, popup)

□ День 6: Preview Mode
  - Desktop preview
  - Mobile preview (responsive)
  - Tablet preview
  - Переключение между режимами

□ День 7: Save/Load + тестирование
  - Сохранение в JSON
  - Загрузка воронок
  - Автосохранение (каждые 30 сек)
  - Unit tests

Критерии готовности:
✅ Создание воронки из 5+ элементов
✅ Drag & drop работает плавно (60fps)
✅ Preview точная копия
✅ Сохранение/загрузка без потерь
✅ Mobile responsive 100%
✅ Tests покрытие >80%

Технологии:
- @dnd-kit/core + @dnd-kit/sortable
- Zustand для state management
- React Hook Form для форм
```

#### **2. Dashboard Improvements** ⭐⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   5 дней (Week 2)
Сложность: Medium

Файлы:
src/app/dashboard/page.tsx
src/components/analytics/EmotionalJourneyChart.tsx
src/components/analytics/PredictiveAnalytics.tsx

Подзадачи:
□ День 1: Real-time Metrics
  - Подключить к API /api/analytics/insights
  - Живое обновление (каждые 10 сек)
  - Error handling

□ День 2-3: Interactive Charts
  - Emotion journey chart с анимациями
  - Conversion funnel visualization
  - Time-series analytics
  - Recharts оптимизация

□ День 4: Filters & Date Range
  - Фильтры по продуктам
  - Выбор периода (день, неделя, месяц)
  - Экспорт данных (CSV)

□ День 5: Polish & тестирование
  - Loading states
  - Empty states
  - Error states
  - Responsive design

Критерии готовности:
✅ Все графики с реальными данными
✅ Фильтры работают
✅ Анимации плавные
✅ Responsive на всех устройствах

Технологии:
- Recharts (dynamic import)
- React Query для data fetching
- Tailwind для стилей
```

#### **3. Auth Forms UX Enhancement** ⭐
```
Приоритет: 🟡 СРЕДНИЙ
Дедлайн:   3 дня (Week 2)
Сложность: Low

Файлы:
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
src/app/auth/forgot-password/page.tsx

Подзадачи:
□ День 1: Better Validation
  - Real-time валидация
  - Password strength indicator
  - Email format check
  - Loading states

□ День 2: Error Handling
  - Toast notifications
  - Красивые error messages
  - Retry mechanism
  - Forgot password flow

□ День 3: Accessibility
  - Keyboard navigation
  - Screen reader support
  - ARIA labels
  - Focus management

Критерии готовности:
✅ Все валидации работают
✅ UX плавный
✅ Accessibility score >95
✅ Mobile friendly

Технологии:
- React Hook Form + Zod
- Framer Motion для анимаций
```

#### **📞 Коммуникация:**
```
Daily:  Standup 09:00 CET
        Прогресс в Slack #frontend
PR:     Создавать feature branches
        Request review от Claude Code
Блоки:  Immediate Slack mention
```

---

## 🟡 **АГЕНТ 3: AI/ML Specialist**

### **👤 ПРОФИЛЬ:**
```
Роль:           AI/ML Engineer, Data Scientist
Специализация:  Hugging Face, OpenAI, ML models
Языки:          TypeScript, Python
Инструменты:    Hugging Face API, OpenAI API, Redis
Статус:         ✅ READY TO START
```

### **📋 ЗАДАНИЯ:**

#### **1. Hugging Face Real Integration** ⭐⭐⭐
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   7 дней (Week 1)
Сложность: High

Файлы:
src/services/ai/emotionAnalysis.ts
src/app/api/emotions/analyze/route.ts
src/lib/redis.ts (создать)

Подзадачи:
□ День 1: API Setup
  - Получить Hugging Face API key
  - Настроить environment variables
  - Тестовые запросы к API
  - Rate limiting понимание

□ День 2-3: Real Integration
  - Модель: j-hartmann/emotion-english-distilroberta-base
  - Обработка response
  - Маппинг эмоций
  - Error handling + retry logic
  - Response time <2 sec

□ День 4: Redis Caching Layer
  - Setup ioredis client
  - Cache strategy (TTL: 1 час)
  - Cache key generation
  - Cache invalidation
  - Fallback на mock при сбое

□ День 5: Batch Processing
  - Queue система (BullMQ + Redis)
  - Обработка массовых запросов
  - Priority queue
  - Progress tracking
  - Job retry logic

□ День 6: Emotion Scoring
  - Нормализация scores (0-1)
  - Confidence thresholds
  - Multi-emotion detection
  - Aggregation по времени

□ День 7: Testing & Optimization
  - Unit tests
  - Integration tests
  - Performance testing
  - Documentation

Критерии готовности:
✅ Real API возвращает результаты <2 сек
✅ Кэширование (95% cache hit rate)
✅ Обработка ошибок безупречна
✅ Rate limiting соблюдается (60 req/min)
✅ Tests покрытие >80%

Технологии:
- Hugging Face Inference API
- ioredis для кэша
- BullMQ для очередей
```

#### **2. OpenAI Content Generation** ⭐⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   5 дней (Week 2)
Сложность: Medium

Файлы:
src/services/ai/contentGeneration.ts
src/app/api/content/generate/route.ts

Подзадачи:
□ День 1: OpenAI Setup
  - API key setup
  - GPT-4 Turbo integration
  - Prompt engineering basics
  - Parameters optimization

□ День 2-3: Content Templates
  - Email templates
  - Landing page copy
  - CTA button text
  - Product descriptions
  - Social media posts

□ День 4: Emotional Adaptation
  - Генерация на основе эмоций
  - Tone adjustment (empathetic, urgent, friendly)
  - A/B test variations
  - Personalization

□ День 5: Testing & Optimization
  - Quality checking
  - Cost optimization
  - Caching strategy
  - Multi-language (ru, en)

Критерии готовности:
✅ Генерация контента <5 сек
✅ Качество текста высокое
✅ Эмоциональная адаптация работает
✅ Поддержка русского и английского

Технологии:
- OpenAI GPT-4 Turbo API
- Redis caching
- Zod для валидации
```

#### **3. Analytics Dashboard Data** ⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   4 дня (Week 2)
Сложность: Medium

Файлы:
src/app/api/analytics/insights/route.ts
src/app/api/analytics/dashboard/route.ts

Подзадачи:
□ День 1-2: Data Pipeline
  - Подключение к emotion tracking
  - Агрегация данных по времени
  - Расчет conversion metrics
  - Database queries optimization

□ День 3: Insights Generation
  - AI-powered recommendations
  - Anomaly detection
  - Trend analysis
  - Actionable insights

□ День 4: Testing & Documentation
  - Unit tests
  - Performance testing
  - API documentation

Критерии готовности:
✅ API возвращает реальные данные
✅ Insights полезные и точные
✅ Response time <500ms

Технологии:
- PostgreSQL aggregations
- Redis caching
- Statistical analysis
```

#### **📞 Коммуникация:**
```
Daily:  Standup 09:00 CET
        Прогресс в Slack #ai-ml
PR:     Request review от Claude Code
API:    Документировать все endpoints
```

---

## 🔴 **АГЕНТ 4: QA Engineer**

### **👤 ПРОФИЛЬ:**
```
Роль:           QA Engineer, Test Automation
Специализация:  Playwright, Jest, E2E Testing
Языки:          TypeScript, JavaScript
Инструменты:    Playwright, Jest, Testing Library
Статус:         ✅ READY TO START
```

### **📋 ЗАДАНИЯ:**

#### **1. Fix Flaky E2E Tests** ⭐⭐⭐
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   5 дней (Week 1)
Сложность: Medium

Файлы:
tests/e2e/auth.spec.ts
tests/e2e/funnel.spec.ts
playwright.config.ts
tests/utils/test-helpers.ts

Подзадачи:
□ День 1: Анализ failing tests
  - Выявить причины флейков
  - Собрать логи и screenshots
  - Приоритизация исправлений

□ День 2-3: Auth Tests Stabilization
  - Правильные waits (waitForSelector)
  - Stable selectors (data-testid)
  - Retry logic
  - Database reset между тестами
  - Mock API где нужно

□ День 4: Test Infrastructure
  - Test fixtures
  - Helper functions
  - Parallel execution fix
  - CI/CD integration

□ День 5: Documentation & Validation
  - Test documentation
  - CI/CD workflow
  - Slack notifications
  - Final validation (100 runs)

Критерии готовности:
✅ Все E2E тесты проходят стабильно
✅ Flakiness rate <2%
✅ CI/CD полностью автоматизирован
✅ Test coverage видимость

Технологии:
- Playwright Test
- GitHub Actions
- Docker для test env
```

#### **2. Unit Test Coverage** ⭐⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   4 дня (Week 2)
Сложность: Medium

Файлы:
src/**/__tests__/
tests/api/
tests/utils/

Подзадачи:
□ День 1: Component Tests
  - Testing Library setup
  - User interaction tests
  - Accessibility tests
  - Snapshot tests

□ День 2: API Tests
  - Unit tests для route handlers
  - Integration tests для flows
  - Mock database
  - Error scenarios

□ День 3: Utility Tests
  - auth.ts tests
  - api.ts tests
  - tracking.ts tests
  - emotionTracking.ts tests

□ День 4: Coverage & CI
  - Coverage report
  - CI integration
  - Pre-commit hooks

Критерии готовности:
✅ Test coverage >80%
✅ All critical paths covered
✅ Fast execution (<30 sec)

Технологии:
- Jest
- React Testing Library
- MSW для API mocking
```

#### **3. Performance Testing** ⭐
```
Приоритет: 🟡 СРЕДНИЙ
Дедлайн:   3 дня (Week 3)
Сложность: Medium

Файлы:
tests/performance/
lighthouse.config.js

Подзадачи:
□ День 1: Lighthouse CI
  - Performance score >90
  - Accessibility score >95
  - Best practices >90
  - SEO score >90

□ День 2: Load Testing
  - k6 or Artillery setup
  - API stress tests (1000 req/sec)
  - Database performance
  - Caching effectiveness

□ День 3: Bundle Analysis
  - Bundle size optimization
  - Code splitting review
  - Lazy loading verification

Критерии готовности:
✅ Lighthouse scores достигнуты
✅ Load tests проходят
✅ Bundle size оптимизирован

Технологии:
- Lighthouse CI
- k6 или Artillery
- webpack-bundle-analyzer
```

#### **📞 Коммуникация:**
```
Daily:    Standup 09:00 CET
          Bug reports в Slack #qa
Tests:    Daily test reports
Blocker:  Immediate escalation
```

---

## 🟣 **АГЕНТ 5: Backend Developer**

### **👤 ПРОФИЛЬ:**
```
Роль:           Backend Developer, API Specialist
Специализация:  Node.js, PostgreSQL, Redis, API Design
Языки:          TypeScript, SQL
Инструменты:    PostgreSQL, Redis, Prisma/pg
Статус:         ✅ READY TO START
```

### **📋 ЗАДАНИЯ:**

#### **1. Real Database Migration** ⭐⭐⭐
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   6 дней (Week 1)
Сложность: High

Файлы:
apps/web/src/app/api/auth/lib/db.ts
apps/web/src/lib/db/ (создать)
migrations/ (создать)

Подзадачи:
□ День 1: Database Design
  - Schema design:
    * users (id, email, password_hash, created_at)
    * products (id, user_id, name, description, price)
    * orders (id, product_id, email, status, created_at)
    * funnels (id, user_id, name, config_json, created_at)
    * emotions (id, user_id, type, intensity, timestamp)
  - Indexes planning
  - Foreign keys

□ День 2: PostgreSQL Setup
  - Connection pool (pg-pool)
  - Environment variables
  - Health checks
  - Error handling

□ День 3: Migrations System
  - node-pg-migrate setup
  - Initial migrations
  - Rollback testing
  - Seed scripts

□ День 4-5: API Migration
  - Migrate In-Memory → PostgreSQL
  - Update all API endpoints
  - Transaction handling
  - Query optimization

□ День 6: Testing
  - Integration tests
  - Performance testing
  - Migration validation
  - Documentation

Критерии готовности:
✅ БД работает в dev и production
✅ Миграции без ошибок
✅ Данные персистентны
✅ Performance оптимизирован
✅ Rollback механизм работает

Технологии:
- PostgreSQL 15+
- pg-pool
- node-pg-migrate
```

#### **2. Redis Integration** ⭐⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   4 дня (Week 2)
Сложность: Medium

Файлы:
src/lib/redis.ts (создать)
src/app/api/*/route.ts (обновить)

Подзадачи:
□ День 1: Redis Client Setup
  - ioredis configuration
  - Connection management
  - Error handling
  - Reconnection logic
  - Health checks

□ День 2: Caching Strategy
  - Session storage (JWT)
  - API response caching
  - Emotion analysis cache
  - Rate limiting data
  - Cache invalidation

□ День 3: Pub/Sub для Real-time
  - Event publishing
  - Subscription handling
  - Dashboard updates
  - Notifications

□ День 4: Testing & Documentation
  - Integration tests
  - Performance testing
  - Documentation

Критерии готовности:
✅ Redis подключен
✅ Cache hit rate >80%
✅ Pub/Sub работает
✅ Error handling правильный

Технологии:
- ioredis
- Redis 7+
```

#### **3. API Endpoints Completion** ⭐⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   5 дней (Week 2)
Сложность: Medium

Файлы:
src/app/api/funnels/ (создать)
src/app/api/payments/ (создать)
src/app/api/webhooks/ (создать)

Подзадачи:
□ День 1-2: Funnel CRUD API
  - POST /api/funnels (создание)
  - GET /api/funnels (список)
  - GET /api/funnels/[id] (получение)
  - PUT /api/funnels/[id] (обновление)
  - DELETE /api/funnels/[id] (удаление)

□ День 3: Stripe Payment API
  - POST /api/payments/checkout
  - POST /api/webhooks/stripe
  - GET /api/orders

□ День 4: Validation & Security
  - Zod schemas
  - JWT middleware
  - Rate limiting
  - CORS configuration

□ День 5: Documentation
  - OpenAPI spec
  - Postman collection
  - API documentation

Критерии готовности:
✅ Все endpoints работают
✅ Валидация 100%
✅ Security hardening
✅ API документация

Технологии:
- Next.js API Routes
- Zod
- Stripe SDK
```

#### **📞 Коммуникация:**
```
Daily:  Standup 09:00 CET
        Прогресс в Slack #backend
API:    Документировать endpoints
PR:     Request review от Claude Code
```

---

## 🟠 **АГЕНТ 6: DevOps Engineer**

### **👤 ПРОФИЛЬ:**
```
Роль:           DevOps Engineer, Infrastructure
Специализация:  Deployment, CI/CD, Monitoring
Инструменты:    Vercel, Railway, Docker, GitHub Actions
Статус:         ✅ READY TO START
```

### **📋 ЗАДАНИЯ:**

#### **1. Production Deployment** ⭐⭐⭐
```
Приоритет: 🔴 КРИТИЧЕСКИЙ
Дедлайн:   7 дней (Week 1-2)
Сложность: High

Подзадачи:
□ День 1-2: Vercel Frontend Setup
  - Connect GitHub repo
  - Configure build settings
  - Environment variables
  - Preview deployments
  - Custom domain (если есть)

□ День 3-4: Railway Backend
  - Deploy Clojure API
  - PostgreSQL setup
  - Redis setup
  - Environment config
  - Health checks

□ День 5: DNS & SSL
  - Domain setup
  - SSL certificates (auto)
  - CDN configuration
  - Email (SPF, DKIM, DMARC)

□ День 6: Testing & Validation
  - Smoke tests в production
  - Performance validation
  - Security checks
  - Rollback testing

□ День 7: Documentation
  - Deployment guide
  - Troubleshooting guide
  - Rollback procedures

Критерии готовности:
✅ Production доступен по HTTPS
✅ Zero-downtime deployments
✅ Monitoring работает
✅ Backups настроены
✅ Rollback механизм готов

Технологии:
- Vercel для frontend
- Railway для backend
- PostgreSQL managed
- Redis managed
```

#### **2. Monitoring & Alerts** ⭐⭐
```
Приоритет: 🟠 ВЫСОКИЙ
Дедлайн:   5 дней (Week 2)
Сложность: Medium

Файлы:
infrastructure/monitoring/
.github/workflows/alerts.yml

Подзадачи:
□ День 1-2: Application Monitoring
  - Sentry для errors
  - LogRocket для sessions (опционально)
  - Uptime monitoring (UptimeRobot)
  - Vercel Analytics

□ День 3: Infrastructure Monitoring
  - Database metrics
  - Redis metrics
  - API response times
  - Resource utilization

□ День 4: Alerting Setup
  - Slack notifications
  - Email alerts (critical)
  - Alert thresholds
  - Escalation policy

□ День 5: Dashboard & Documentation
  - Monitoring dashboard
  - Incident response plan
  - Documentation

Критерии готовности:
✅ Все метрики собираются
✅ Alerts работают
✅ Dashboard доступен
✅ Incident plan готов

Технологии:
- Sentry
- UptimeRobot
- Vercel Analytics
- Railway metrics
```

#### **3. CI/CD Optimization** ⭐
```
Приоритет: 🟡 СРЕДНИЙ
Дедлайн:   3 дня (Week 3)
Сложность: Low-Medium

Файлы:
.github/workflows/ci.yml
.github/workflows/deploy.yml
turbo.json

Подзадачи:
□ День 1: Pipeline Optimization
  - Turbo cache optimization
  - Parallel jobs
  - Docker layer caching
  - Build time <5 min

□ День 2: Deployment Automation
  - Auto-deploy main branch
  - Preview для PRs
  - Rollback mechanism
  - Smoke tests после deploy

□ День 3: Quality Gates
  - Lint required
  - Type check required
  - Tests must pass
  - Coverage threshold

Критерии готовности:
✅ Build time <5 min
✅ Deployment automatic
✅ Quality gates enforced

Технологии:
- GitHub Actions
- Turbo cache
- Docker
```

#### **📞 Коммуникация:**
```
Daily:    Standup 09:00 CET
          Status в Slack #devops
Incidents: Immediate Slack alert
Deploy:    Notify team перед deploy
```

---

## 📅 **ОБЩИЙ TIMELINE**

```
┌─────────────────────────────────────────────────┐
│  WEEK 1-2: SPRINT 1 - FOUNDATION                │
├─────────────────────────────────────────────────┤
│  🟢 Frontend:  Funnel Builder MVP               │
│  🟡 AI/ML:     Hugging Face Integration         │
│  🟣 Backend:   Database Migration                │
│  🔴 QA:        Fix E2E Tests                     │
│  🟠 DevOps:    Production Deployment             │
│  🔵 Lead:      Coordination & Code Review        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  WEEK 3-4: SPRINT 2 - ENHANCEMENT               │
├─────────────────────────────────────────────────┤
│  🟢 Frontend:  Dashboard + Auth UX               │
│  🟡 AI/ML:     OpenAI + Analytics Data           │
│  🟣 Backend:   Redis + API Endpoints             │
│  🔴 QA:        Unit Tests + Performance          │
│  🟠 DevOps:    Monitoring + CI/CD                │
│  🔵 Lead:      Integration & Optimization        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  WEEK 5-6: SPRINT 3 - PRODUCTION                │
├─────────────────────────────────────────────────┤
│  Все:  Bug fixes, Polish, Documentation         │
│  🔴 QA:    Final testing & validation            │
│  🟠 DevOps: Final deployment & monitoring        │
│  🔵 Lead:   Launch preparation                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  WEEK 7: 🚀 LAUNCH!                             │
└─────────────────────────────────────────────────┘
```

---

## 📞 **COMMUNICATION PROTOCOL**

### **Daily Standup (09:00 CET):**
```
Формат (в Slack):
@agent: 
✅ Вчера: [что сделано]
🔨 Сегодня: [что делаю]
⚠️ Блокеры: [если есть]
```

### **Code Review:**
```
1. Создать feature branch: feature/[agent]/[task-name]
2. Commit format: [agent-name]: Brief description
3. Create PR с описанием
4. Request review от @Claude-Code
5. Address comments
6. Merge после approval
```

### **Slack Channels:**
```
#general      - Общие вопросы
#frontend     - Frontend задачи
#backend      - Backend задачи
#ai-ml        - AI/ML задачи
#qa           - Testing & QA
#devops       - Infrastructure
#tech-lead    - Архитектурные решения
#incidents    - Critical issues
```

### **Escalation:**
```
🟢 Normal:     Slack в рабочие часы
🟡 Important:  Slack mention @tech-lead
🔴 Critical:   Slack mention + Email
🚨 Emergency:  Immediate call
```

---

## 🎯 **SUCCESS CRITERIA**

### **Sprint 1 (Week 1-2):**
```
✅ Funnel Builder работает
✅ Hugging Face возвращает emotions
✅ Database мигрирована
✅ E2E tests стабильны
✅ Production deployed
```

### **Sprint 2 (Week 3-4):**
```
✅ Full Funnel Builder feature-complete
✅ OpenAI content generation
✅ Redis caching работает
✅ Stripe payments functional
✅ Test coverage >80%
```

### **Sprint 3 (Week 5-6):**
```
✅ All features tested
✅ Performance score >90
✅ Documentation complete
✅ Production stable
✅ Ready for users
```

---

## 🚀 **IMMEDIATE NEXT STEPS (TODAY)**

### **Для всех агентов:**
```
1. ✅ Прочитать свои задания
2. ✅ Setup dev окружения
3. ✅ Review связанных файлов
4. ✅ Задать вопросы (если есть)
5. ✅ Начать работу над Priority 1 задачами
6. ✅ First standup завтра 09:00 CET
```

### **Для Claude Code (Lead):**
```
1. ✅ Распределение готово
2. 💬 Share с командой
3. 📋 Setup Slack channels
4. 📅 Schedule first standup
5. 📊 Create project board
```

---

## 📚 **РЕСУРСЫ**

### **Документация:**
- [AGENT_TASK_DISTRIBUTION.md](./AGENT_TASK_DISTRIBUTION.md) - Детальный план
- [QUICK_TASK_OVERVIEW.md](./QUICK_TASK_OVERVIEW.md) - Быстрый обзор
- [GO_MIGRATION_ANALYSIS.md](./GO_MIGRATION_ANALYSIS.md) - Go анализ
- [TEAM_TASKS.md](./TEAM_TASKS.md) - История задач

### **Tech Stack:**
- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [Hugging Face](https://huggingface.co/docs/api-inference)
- [OpenAI API](https://platform.openai.com/docs)
- [Playwright](https://playwright.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/docs/)

---

## 💪 **LET'S BUILD!**

```
┌────────────────────────────────────────┐
│                                        │
│   🎯 ЦЕЛЬ: Production-ready за 6 недель │
│                                        │
│   🚀 СТАРТ: Сегодня!                   │
│   📅 LAUNCH: Week 7                    │
│   👥 КОМАНДА: 6 агентов                │
│   💎 КАЧЕСТВО: Enterprise-grade        │
│                                        │
└────────────────────────────────────────┘
```

**Команда готова! Начинаем работу! 🚀**

---

*Prepared by: Claude Code (Tech Lead) | 2025-09-29*
*Status: ✅ ACTIVE | Version: 1.0*
