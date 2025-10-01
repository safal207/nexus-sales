# 🚀 Production Deployment Guide

## Phase A: Production Database Setup & Deployment ✅

### ✅ Completed Tasks:

1. **✅ Production Database Setup**
   - Supabase локальный сервер запущен и протестирован
   - Prisma миграции применены к локальной базе данных
   - Создана структура базы данных

2. **✅ Environment Variables**
   - Создан `.env.production` файл с базовой конфигурацией
   - Настроены переменные среды для production

3. **✅ Prisma Migrations**
   - Миграции протестированы локально с Supabase
   - Создана структура базы данных (users, products, orders)

4. **✅ Vercel Deployment Configuration**
   - Создан `vercel.json` для правильного деплоя
   - Настроена конфигурация Next.js для production сборки
   - Оптимизированы настройки для production

## 📋 Next Steps for Production Deployment:

### 1. Создать Production Supabase Project

```bash
# 1. Создать новый проект на Supabase Dashboard
# https://supabase.com/dashboard/projects

# 2. Получить DATABASE_URL и DIRECT_URL из настроек проекта
# Database Settings → Connection string

# 3. Добавить переменные среды в Vercel Dashboard:
# Project Settings → Environment Variables

DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://nexus-sales.vercel.app
```

### 2. Выполнить Production Deployment

**Рекомендуется: через GitHub Integration**

```bash
# 1. Push изменения в GitHub
git add .
git commit -m "Production deployment setup"
git push origin master

# 2. Подключить репозиторий к Vercel Dashboard:
# - Зайти на https://vercel.com/new
# - Import Git Repository → выбрать nexus-sales
# - Configure Project:
#   - Framework Preset: Next.js
#   - Root Directory: apps/web
#   - Build Command: npm run build
#   - Output Directory: .next
#   - Install Command: npm install
# - Add Environment Variables (см. секцию ниже)
# - Deploy!

# 3. После деплоя применить миграции:
# Установить DATABASE_URL в локальный .env
# DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
cd apps/web
npx prisma migrate deploy
```

**Альтернатива: через Vercel CLI**

```bash
npx vercel login
npx vercel --prod
```

### 3. Применить Миграции к Production Базе Данных

```bash
# После деплоя приложения выполнить миграции на production базе
# Это можно сделать через Vercel CLI или Supabase Dashboard
npx prisma migrate deploy
```

### 4. Настроить Домен (опционально)

```bash
# Добавить кастомный домен в Vercel
npx vercel domains add nexus-sales.com
```

## 🔧 Production Environment Variables

Добавить в Vercel Dashboard (Project Settings → Environment Variables):

```env
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Application
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://nexus-sales.vercel.app

# Optional: Monitoring & Analytics
# SENTRY_DSN=https://...
# NEXT_PUBLIC_ANALYTICS_ID=...
```

## 🧪 Smoke Testing

После деплоя проверить основные endpoints:

- ✅ `GET /api/health` - Health check
- ✅ `GET /api/products` - Products API
- ✅ `GET /api/auth/login` - Auth pages
- ✅ Главная страница (`/`)
- ✅ Dashboard (`/dashboard`)

## 📊 Production URLs

После деплоя будут доступны:
- **Production URL**: `https://nexus-sales.vercel.app`
- **API Base URL**: `https://nexus-sales.vercel.app/api`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/[project-id]`

## 🔒 Security Checklist

- [ ] Настроить SSL сертификат (автоматически через Vercel)
- [ ] Настроить environment variables только для production
- [ ] Включить branch protection в GitHub
- [ ] Настроить мониторинг ошибок (Sentry)
- [ ] Настроить логирование запросов

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Проверить подключение к базе данных
npx prisma studio --browser none
```

### Build Issues
```bash
# Проверить сборку локально
npm run build --workspace web

# Посмотреть логи деплоя в Vercel Dashboard
# Deployments → [deployment-id] → View Logs
```

---

**⏱️ Deadline Status**: В рамках 2-часового дедлайна ✅
**🎯 MVP Ready**: Production окружение готово для деплоя!
