# 🧪 NEXUS.SALES - Comprehensive Testing Suite

## 🎯 Overview

This document outlines our comprehensive testing strategy that covers all major testing types for production-ready software quality.

## 📊 Testing Pyramid

```
┌─────────────────────────────────────┐
│         Exploratory Testing         │  🔍 Manual Testing
├─────────────────────────────────────┤
│       Acceptance Testing            │  ✅ BDD/Cucumber (Planned)
│       Visual Regression             │  👁️ Percy
├─────────────────────────────────────┤
│       API Contract Testing          │  🤝 Pact
│       Integration Testing           │  🔗 Jest + Supertest
│       System Testing (E2E)          │  🌐 Playwright
├─────────────────────────────────────┤
│       Unit Testing                  │  🧩 Jest + Testing Library
│       Component Testing             │  ⚛️ React Testing Library
└─────────────────────────────────────┘
         Performance & Security
         Load Testing (k6) 🔄
         Security Testing (Snyk) 🔒
         Accessibility (axe) ♿
```

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Authenticate with Snyk (for security testing)
npm run test:security:auth
```

### Run All Tests
```bash
# Local development testing
npm run test:all

# CI/CD testing (simulates pipeline)
npm run test:ci
```

## 🧩 Testing Types

### 1. Unit Testing
```bash
# Run unit tests only
cd apps/web
npm test -- --testPathPattern=unit

# With coverage
npm test -- --coverage --coverageDirectory=coverage/unit
```

**Coverage Thresholds:**
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

### 2. Integration Testing
```bash
# Run integration tests
cd apps/web
npm test -- --testPathPattern=integration

# Test with real database
npm test -- --testPathPattern=integration --testNamePattern="real-db"
```

**What we test:**
- API endpoint interactions
- Database operations
- External service integrations
- User journey flows

### 3. System Testing (E2E)
```bash
# Run all E2E tests
cd apps/web
npx playwright test

# Run specific test file
npx playwright test auth-flow.spec.ts

# Run with UI mode
npx playwright test --ui

# Run mobile tests only
npx playwright test --project="Mobile Chrome"
```

**Browser Coverage:**
- ✅ Desktop Chrome
- ✅ Desktop Firefox
- ✅ Desktop Safari
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ Tablet (iPad Pro)

### 4. Performance Testing
```bash
# Load testing (local)
npm run test:load:local

# Full load test
npm run test:load

# Lighthouse performance audit
cd apps/web
npx lighthouse http://localhost:3000
```

**Performance Metrics:**
- Response Time: < 1500ms (99th percentile)
- Error Rate: < 10%
- Lighthouse Score: > 80 (Performance, Accessibility, SEO, PWA)

### 5. Security Testing
```bash
# Security vulnerability scan
npm run test:security

# Authenticate with Snyk
npm run test:security:auth

# Generate security report
npm run test:security -- --json > security-report.json
```

**Security Checks:**
- ✅ Dependency vulnerabilities
- ✅ License compliance
- ✅ Code security issues
- ✅ Container security (planned)

### 6. Accessibility Testing
```bash
# Run accessibility tests
cd apps/web
npx playwright test tests/e2e/accessibility.spec.ts

# With detailed reporting
npx playwright test tests/e2e/accessibility.spec.ts --reporter=line
```

**WCAG Compliance:**
- ✅ WCAG 2.0 AA
- ✅ WCAG 2.1 AA
- ✅ Color contrast ratios
- ✅ Keyboard navigation
- ✅ Screen reader compatibility

### 7. Visual Regression Testing
```bash
# Run visual tests (requires Percy token)
cd apps/web
npx playwright test tests/e2e/visual-regression.spec.ts

# With Percy (if configured)
npx percy exec -- playwright test tests/e2e/visual-regression.spec.ts
```

**Visual Coverage:**
- ✅ Homepage variations
- ✅ Authentication flows
- ✅ Dashboard states
- ✅ Mobile/tablet layouts
- ✅ Error states
- ✅ Loading states

### 8. API Contract Testing
```bash
# Run contract tests
cd apps/web
npm test -- --testPathPattern=contract

# Generate pact files
npm test -- --testPathPattern=contract --testNamePattern="should"
```

**Contract Coverage:**
- ✅ Request/response schemas
- ✅ Authentication flows
- ✅ Error handling
- ✅ Data validation

## 🔧 Configuration Files

### Jest Configuration (`apps/web/jest.config.js`)
```javascript
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Playwright Configuration (`apps/web/playwright.config.ts`)
```typescript
{
  testDir: './tests/e2e',
  fullyParallel: true,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'Tablet', use: { ...devices['iPad Pro'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
}
```

### k6 Load Test Configuration (`k6-load-test.js`)
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'],
    http_req_failed: ['rate<0.1'],
  },
};
```

## 📊 CI/CD Pipeline

Our GitHub Actions pipeline runs all test types:

```yaml
jobs:
  - lint
  - type-check
  - unit-tests
  - security-scan
  - e2e-tests
  - performance-tests
  - load-tests
  - accessibility-tests
  - build (depends on all tests)
```

### Parallel Execution
- ✅ Unit tests run in parallel
- ✅ E2E tests run across multiple browsers
- ✅ Security scans run continuously
- ✅ Performance tests run in staging environment

## 🎯 Test Results & Reporting

### Coverage Reports
```bash
# Generate coverage report
cd apps/web
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Performance Reports
- Lighthouse: `apps/web/lighthouse-report.json`
- k6: `k6-results/`
- Playwright: `apps/web/playwright-report/`

### Security Reports
- Snyk: Generated via `npm run test:security`
- Manual reviews: Security audit checklists

## 🐛 Debugging Failed Tests

### Unit Tests
```bash
# Run specific test
npm test -- --testNamePattern="should create product"

# Debug mode
npm test -- --inspect-brk --testNamePattern="should create product"
```

### E2E Tests
```bash
# Run with browser visible
npx playwright test --headed auth-flow.spec.ts

# Debug mode
npx playwright test --debug auth-flow.spec.ts
```

### Load Tests
```bash
# Run with reduced load for debugging
k6 run --vus 5 --duration 10s k6-load-test.js
```

## 📈 Metrics & KPIs

### Code Quality
- **Coverage**: >70% statements, branches, functions, lines
- **Duplication**: <5% (via SonarQube)
- **Complexity**: <10 per function
- **Technical Debt**: <5% of total code

### Performance
- **Response Time**: <1.5s (99th percentile)
- **Error Rate**: <1% in production
- **Lighthouse Score**: >85 overall
- **Time to Interactive**: <3s

### Reliability
- **Test Pass Rate**: >95%
- **Pipeline Success Rate**: >90%
- **Mean Time to Detect**: <1 hour
- **Mean Time to Recover**: <4 hours

## 🚀 Future Enhancements

### Phase 2 (Next 2-4 weeks)
- [ ] BDD testing with Cucumber
- [ ] Chaos engineering with Gremlin
- [ ] Contract testing expansion
- [ ] Visual testing with Chromatic

### Phase 3 (Next 2-3 months)
- [ ] AI-powered test generation
- [ ] Real device testing (BrowserStack)
- [ ] Performance monitoring integration
- [ ] Automated security testing (OWASP ZAP)

## 🤝 Contributing

### Adding New Tests
1. Follow existing patterns in respective test directories
2. Update this README with new test types
3. Ensure CI pipeline includes new tests
4. Add appropriate documentation

### Test Naming Convention
```typescript
// Unit tests
describe('ComponentName', () => {
  test('should handle valid input', () => { ... });
  test('should reject invalid input', () => { ... });
});

// E2E tests
test.describe('User Authentication', () => {
  test('should login with valid credentials', () => { ... });
});
```

## 📞 Support

For questions about testing:
- 📧 Create an issue with `testing` label
- 💬 Discuss in `#testing` channel
- 📚 Check this README first

---

## 🎉 Summary

This comprehensive testing suite ensures **NEXUS.SALES** maintains high quality across all dimensions:

- **🛡️ Security**: Continuous vulnerability scanning
- **⚡ Performance**: Load and lighthouse testing
- **♿ Accessibility**: WCAG compliance
- **👁️ Visual**: Regression prevention
- **🤝 Contracts**: API reliability
- **🔄 Integration**: System reliability
- **🧩 Unit**: Code correctness
- **🌐 E2E**: User experience

**Result**: Production-ready software with confidence! 🚀
