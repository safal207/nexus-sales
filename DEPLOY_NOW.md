# 🚀 Quick Deploy Guide

## Быстрый деплой за 5 минут

### Шаг 1: Создай Supabase Project (2 мин)

1. Открой https://supabase.com/dashboard
2. Нажми **New Project**
3. Заполни:
   - Name: `nexus-sales-prod`
   - Database Password: (сгенерируй надёжный пароль)
   - Region: `Europe (Frankfurt)`
4. Нажми **Create new project**
5. Подожди ~2 минуты

### Шаг 2: Получи Database URLs (1 мин)

1. В Supabase Dashboard → **Project Settings** → **Database**
2. Найди **Connection string**
3. Скопируй оба URL:
   - **Connection pooling** (для `DATABASE_URL`)
   - **Direct connection** (для `DIRECT_URL`)

### Шаг 3: Запусти автоматический деплой (2 мин)

**Windows (PowerShell):**
```powershell
# Установи переменные окружения
$env:DATABASE_URL="твой-connection-pooling-url"
$env:DIRECT_URL="твой-direct-connection-url"

# Запусти скрипт деплоя
.\scripts\deploy-production.ps1
```

**Mac/Linux (Bash):**
```bash
# Установи переменные окружения
export DATABASE_URL="твой-connection-pooling-url"
export DIRECT_URL="твой-direct-connection-url"

# Сделай скрипт исполняемым
chmod +x scripts/deploy-production.sh

# Запусти скрипт деплоя
./scripts/deploy-production.sh
```

### Готово! 🎉

Скрипт автоматически:
- ✅ Проверит подключение к базе данных
- ✅ Применит миграции
- ✅ Сгенерирует Prisma Client
- ✅ Задеплоит на Vercel
- ✅ Настроит environment variables
- ✅ Запустит smoke tests

---

## Альтернатива: Ручной деплой через Vercel Dashboard

Если скрипт не работает, используй ручной метод:

### 1. Push код в GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin master
```

### 2. Подключи к Vercel

1. Открой https://vercel.com/new
2. **Import Git Repository** → выбери `safal207/nexus-sales`
3. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Добавь Environment Variables

В разделе **Environment Variables** добавь:

```
DATABASE_URL = твой-connection-pooling-url
DIRECT_URL = твой-direct-connection-url
JWT_SECRET = (сгенерируй: openssl rand -base64 32)
NODE_ENV = production
NEXT_PUBLIC_SITE_URL = https://твой-проект.vercel.app
```

### 4. Deploy!

Нажми **Deploy** и подожди ~3-5 минут

### 5. Примени миграции

После успешного деплоя:

```bash
cd apps/web
DATABASE_URL="твой-direct-connection-url" npx prisma migrate deploy
```

---

## Проверка работоспособности

Зайди на свой deployment URL и проверь:

- ✅ Главная страница загружается
- ✅ `/api/health` возвращает успешный ответ
- ✅ Регистрация работает
- ✅ Логин работает
- ✅ Можно создать продукт

---

## Troubleshooting

### Ошибка: "Cannot connect to database"
- Проверь правильность DATABASE_URL
- Убедись что IP адрес Vercel добавлен в Supabase (обычно автоматически)

### Ошибка: "Build failed"
- Проверь логи в Vercel Dashboard → Deployments → [твой-deployment] → View Logs
- Убедись что все environment variables установлены

### Ошибка: "Prisma Client not generated"
- В Vercel проверь что установлен `@prisma/client` в dependencies (не devDependencies)

---

## Полезные ссылки

- 📊 **Vercel Dashboard**: https://vercel.com/dashboard
- 🗄️ **Supabase Dashboard**: https://supabase.com/dashboard
- 📖 **Полная документация**: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

---

**Нужна помощь?** Создай issue в репозитории!
