# 🚧 Blockers & Dependencies

Last Updated: 2025-10-01

---

## 🔴 Critical Blockers

_None currently_

---

## 🟡 Non-Critical Issues

_None currently_

---

## 🔗 Dependencies Between Agents

### Phase B Dependencies:
- **Codex** and **Qwen** can work in **parallel** ✅
- No blocking dependencies between them

### Phase C Dependencies:
- **GPT5 (Payments)** → needs Phase B tests ⏳
- **Grok (Email)** → independent, can start anytime ✅
- **Codex (UX)** → needs Phase B coverage for safety ⏳
- **Qwen (Docs)** → can start after Phase B ⏳

---

## 📝 How to Report a Blocker

```markdown
## [Agent Name] - [Date]

**Blocker:** Brief description
**Impact:** High/Medium/Low
**Blocking:** Which tasks are blocked
**Needed from:** Who needs to help
**Workaround:** Is there a temporary solution?

### Example:
## Codex High - 2025-10-01

**Blocker:** Cannot mock Prisma Client in tests
**Impact:** High
**Blocking:** Repository tests
**Needed from:** Need test utilities setup
**Workaround:** Can test API routes first while figuring this out
```

---

## ✅ Resolved Blockers

### 2025-10-01
- ✅ Vercel deployment 404 issue → Fixed by setting Root Directory
- ✅ Prisma generate in CI → Fixed by adding postinstall script
- ✅ ignoreCommand error → Fixed by removing from vercel.json

---

_Update this file when you encounter blockers!_
