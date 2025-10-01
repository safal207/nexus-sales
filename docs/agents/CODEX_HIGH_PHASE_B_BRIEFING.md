# 💎 Codex High - Phase B Briefing

## 🎯 Mission: Increase Test Coverage 7% → 30-40%

**Agent:** Codex High
**Priority:** P1 (High)
**Deadline:** 2 days
**Dependencies:** None (can start immediately)

---

## 📊 Current Status

```
Current Coverage: 7.39%
├─ Statements: 7.39%
├─ Branches: 4.93%
├─ Functions: 6.61%
└─ Lines: 7.31%

Target Coverage: 30-40%
├─ Statements: 30%+
├─ Branches: 25%+
├─ Functions: 30%+
└─ Lines: 30%+
```

**Production:** https://nexus-sales-web.vercel.app/ ✅

---

## 🎯 Tasks

### Task 1: API Routes Testing (P0)

Test all API routes in `apps/web/src/app/api/`:
- auth/login, auth/register
- products (GET, POST, PUT, DELETE)
- orders
- funnels
- emotions/analyze
- analytics/insights

**Requirements:**
- Success cases (200, 201)
- Error cases (400, 401, 404, 500)
- Validation tests
- Auth middleware tests

### Task 2: Repository Testing (P1)

Test `apps/web/src/lib/db/repositories/`:
- UserRepository
- ProductRepository
- OrderRepository

**Requirements:**
- CRUD operations
- Error handling
- Edge cases

### Task 3: Utils & Services Testing (P1)

Test `apps/web/src/utils/` and `apps/web/src/services/ai/`

### Task 4: Integration Tests (P2)

Create end-to-end flow tests:
- User registration → Login → Create Product → Order

---

## 🛠️ Deliverables

- Test files for all API routes
- Test files for all repositories
- Test utilities (`test-utils/prisma.ts`, `test-utils/api.ts`)
- Integration tests
- Coverage report 30-40% ✅

---

## ✅ Success Criteria

- Coverage ≥ 30%
- All API routes tested
- All repositories tested
- CI tests pass
- No skipped tests

---

**Start:** `cd apps/web && npm test`

**Good luck! 🚀**
