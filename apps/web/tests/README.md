# 🧪 E2E Testing Suite - ConsciousFunnels

Полноценный набор end-to-end тестов с использованием Playwright для проверки критических пользовательских путей.

## 📁 Структура тестов

```
tests/
├── e2e/                    # E2E тесты (Playwright)
│   ├── auth.spec.ts       # Тесты аутентификации
│   ├── dashboard.spec.ts  # Тесты dashboard
│   ├── api.spec.ts        # Тесты API endpoints
│   └── ui.spec.ts         # Тесты UI/UX
└── smoke.spec.ts          # Базовые smoke тесты (Jest)
```

## 🚀 Запуск тестов

### Установка зависимостей
```bash
cd apps/web
npm install
```

### Запуск всех E2E тестов
```bash
npm run test:e2e
```

### Запуск с UI режимом (для отладки)
```bash
npm run test:e2e:ui
```

### Запуск в headless режиме с браузером
```bash
npm run test:e2e:headed
```

### Отладка тестов
```bash
npm run test:e2e:debug
```

### Запуск всех тестов (unit + E2E)
```bash
npm run test:all
```

## 🎯 Покрытие тестирования

### 🔐 **Authentication Tests** (`auth.spec.ts`)
- ✅ Landing page отображение
- ✅ Навигация к страницам входа/регистрации
- ✅ Регистрация нового пользователя
- ✅ Вход в систему
- ✅ Сброс пароля
- ✅ Формы валидации

### 📊 **Dashboard Tests** (`dashboard.spec.ts`)
- ✅ Отображение dashboard с метриками
- ✅ Навигация к разделам продуктов/аналитики
- ✅ Эмоциональные графики и диаграммы
- ✅ AI предсказания и рекомендации

### 🔌 **API Tests** (`api.spec.ts`)
- ✅ Health endpoint проверка
- ✅ Products API CRUD операции
- ✅ Authentication endpoints
- ✅ Emotion tracking API
- ✅ Analytics insights API

### 🎨 **UI/UX Tests** (`ui.spec.ts`)
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Loading состояния
- ✅ Навигация и ссылки
- ✅ Формы валидации
- ✅ Error handling (404)
- ✅ Accessibility (alt text, heading hierarchy)

## 🔧 Конфигурация

### Playwright Config
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Parallel**: Да (кроме CI)
- **Retries**: 2 на CI, 0 локально
- **Screenshots**: Только при ошибках
- **Videos**: Сохраняются при ошибках
- **Traces**: При retry

### Web Server
- Автоматически запускает `npm run dev` перед тестами
- Переиспользует существующий сервер (если доступен)
- Таймаут: 120 секунд

## 📊 Отчеты и результаты

### HTML Report
После запуска тестов откройте `playwright-report/index.html` для детального отчета.

### JSON Results
```bash
test-results/e2e-results.json
```

### JUnit XML
```bash
test-results/e2e-results.xml
```

## 🐛 Отладка

### Запуск конкретного теста
```bash
npx playwright test auth.spec.ts
```

### Запуск с фильтром
```bash
npx playwright test --grep "login"
```

### Шаг за шагом
```bash
npx playwright test --debug
```

### UI режим
```bash
npx playwright test --ui
```

## 🔍 Что тестируется

### Критические пользовательские пути:
1. **Регистрация** → **Вход** → **Dashboard**
2. **Навигация** между разделами
3. **Создание продуктов**
4. **Просмотр аналитики**
5. **Responsive поведение**

### API интеграция:
1. **Authentication** (login/register/forgot-password)
2. **Products CRUD** (create/read/update/delete)
3. **Emotion tracking** (POST events)
4. **Analytics** (GET insights)

### UI/UX аспекты:
1. **Responsive design** на всех устройствах
2. **Loading states** и error handling
3. **Form validation** и user feedback
4. **Accessibility** compliance
5. **Navigation** и link behavior

## 🎯 Критерии успеха

### ✅ **Тесты считаются пройденными, если:**
- Все критические пути работают без ошибок
- UI корректно отображается на всех устройствах
- API endpoints отвечают правильно
- Нет JavaScript ошибок в консоли
- Все формы валидируются корректно

### 🚨 **Критические ошибки:**
- Страницы не загружаются
- Аутентификация не работает
- Dashboard не отображает данные
- API возвращает 500 ошибки
- JavaScript ошибки в консоли

## 🔄 CI/CD интеграция

### GitHub Actions
```yaml
- name: Install dependencies
  run: npm ci

- name: Run E2E tests
  run: npm run test:e2e
```

### Результаты
- ✅ **Проходят все тесты** на CI
- ✅ **HTML отчет** генерируется
- ✅ **JUnit XML** для интеграции
- ✅ **Screenshots** при ошибках

## 🛠️ Расширение тестов

### Добавление нового теста
```typescript
test('should handle user profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.locator('h1')).toContainText('Profile');
});
```

### Создание нового spec файла
```bash
touch tests/e2e/new-feature.spec.ts
```

## 📞 Поддержка

При возникновении проблем с тестами:
1. Проверьте, что сервер запущен (`npm run dev`)
2. Убедитесь, что все зависимости установлены
3. Проверьте логи в терминале
4. Используйте `--debug` режим для отладки

---

**🎉 E2E тесты готовы к запуску и покрывают все критические функции платформы!**
