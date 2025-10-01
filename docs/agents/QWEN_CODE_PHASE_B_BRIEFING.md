# 🧪 Qwen Code - Phase B Briefing

## 🎯 Mission: Seed Data + E2E Tests

**Agent:** Qwen Code
**Priority:** P1 (High)
**Deadline:** 1 day
**Dependencies:** None (can start in parallel with Codex)

---

## 📊 Current Status

**Production:** https://nexus-sales-web.vercel.app/ ✅
**Database:** Supabase PostgreSQL (connected)
**Problem:** No test data for demo/development

---

## 🎯 Tasks

### Task 1: Create Seed Scripts (P0)

**File:** `apps/web/prisma/seed.ts`

Create seed data:
```typescript
async function main() {
  // 1. Create 10 test users
  const users = await createUsers(10)

  // 2. Create 20 products (2 per user)
  const products = await createProducts(users, 20)

  // 3. Create 50 orders
  const orders = await createOrders(products, 50)

  // 4. Create 5 demo funnels
  const funnels = await createFunnels(users, 5)
}
```

**Requirements:**
- Realistic data (faker.js)
- Different product types
- Various order statuses
- Complete funnels with steps

**Minimal Production Seed:**
```typescript
// prisma/seed-production.ts
async function main() {
  // 1 admin user
  // 3 template funnels
  // 5 example products
}
```

### Task 2: E2E Tests with Playwright (P1)

**Location:** `apps/web/tests/e2e/`

**Test Files:**
```
tests/e2e/
├── auth.spec.ts       # Login/Register flow
├── products.spec.ts   # Product CRUD
├── funnel.spec.ts     # Funnel builder
└── checkout.spec.ts   # Order flow
```

**Example Test:**
```typescript
// tests/e2e/auth.spec.ts
test('user can register and login', async ({ page }) => {
  // Register
  await page.goto('/register')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Should redirect to dashboard
  await expect(page).toHaveURL('/dashboard')

  // Logout
  await page.click('[data-testid="logout"]')

  // Login again
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
```

### Task 3: Test Utilities & Fixtures (P2)

Create helpers:
```typescript
// tests/e2e/fixtures/user.ts
export async function createTestUser() {
  return {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#'
  }
}

// tests/e2e/fixtures/product.ts
export function createTestProduct() {
  return {
    name: 'Test Product',
    description: 'Test Description',
    price: 9999
  }
}
```

### Task 4: Update package.json Scripts (P2)

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:prod": "tsx prisma/seed-production.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 🛠️ Deliverables

**Files to Create:**
- `apps/web/prisma/seed.ts` (development seed)
- `apps/web/prisma/seed-production.ts` (minimal prod seed)
- `apps/web/tests/e2e/auth.spec.ts`
- `apps/web/tests/e2e/products.spec.ts`
- `apps/web/tests/e2e/funnel.spec.ts`
- `apps/web/tests/e2e/checkout.spec.ts`
- `apps/web/tests/e2e/fixtures/*.ts`

**Updated Files:**
- `apps/web/package.json` (seed scripts)
- `apps/web/prisma/schema.prisma` (if needed)

**Documentation:**
- `SEED_DATA_GUIDE.md` - how to use seeds
- `E2E_TESTING_GUIDE.md` - how to run E2E tests

---

## ✅ Success Criteria

- ✅ Seed script creates 10+ users, 20+ products, 50+ orders
- ✅ Production seed creates minimal demo data
- ✅ E2E tests cover: auth, products, funnels, checkout
- ✅ All E2E tests pass
- ✅ Documentation complete

---

## 📝 Example Seed Data Structure

```typescript
const users = [
  { email: 'admin@nexus.com', password: bcrypt.hashSync('admin123', 10) },
  { email: 'user1@test.com', password: bcrypt.hashSync('password', 10) },
  // ... 8 more
]

const products = [
  { name: 'Premium CRM Plan', price: 49900, userId: 1 },
  { name: 'Starter Funnel Template', price: 9900, userId: 1 },
  // ... 18 more
]

const orders = [
  { productId: 1, email: 'customer@test.com', amount: 49900, status: 'paid' },
  { productId: 2, email: 'customer2@test.com', amount: 9900, status: 'created' },
  // ... 48 more
]
```

---

## 🚀 Start Command

```bash
cd apps/web

# Install faker for seed data
npm install --save-dev @faker-js/faker

# Create seed file
touch prisma/seed.ts

# Run seed
npm run db:seed

# Run E2E tests
npm run test:e2e
```

---

## 📞 Communication

**Blockers:** Update `BLOCKERS.md`
**Progress:** Update `AGENT_STATUS.md`
**Handoffs:** Document in `HANDOFFS.md`

---

**Ready? Let's make this database alive! 🌱**

_Phase B - Qwen Code - Seed & E2E Mission_
_Created: 2025-10-01_
_Status: Ready to Start_
