# 🚀 GPT-5 High - Day 2 Mission Briefing

**Дата:** 2025-09-30 (Day 2)  
**Ваша роль:** DevOps Engineer, Infrastructure Master  
**Проект:** NEXUS.SALES (ConsciousFunnels)  
**Миссия:** Deploy & CI/CD - Fire 3, Day 2  
**Track:** D (Infrastructure)  
**Приоритет:** 🟠 ВЫСОКИЙ (независимый от других!)

---

## 🎯 **ВАША МИССИЯ (Day 2)**

> **"Deploy frontend на Vercel и создать bullet-proof CI/CD pipeline"**

**Почему вы важны:**
- ✅ Infrastructure = foundation для всего
- ✅ CI/CD = автоматизация качества
- ✅ Deployment = путь к production
- ✅ Вы НЕ блокируетесь другими (независимый track!)

**Что зависит от вас:**
- 🎯 Production URL для демо
- 🎯 Auto-deploy для быстрых итераций
- 🎯 Quality gates для всей команды
- 🎯 Preview deployments для review

**Давление:** СРЕДНЕЕ. У вас целый день, но результат критичен для команды.

---

## 📋 **ДЕТАЛЬНЫЙ ПЛАН Day 2**

### **MORNING SESSION (09:00-12:30)**

#### **09:00-09:15: 🔥 KICKOFF**
```
□ Read this briefing полностью
□ Понять Day 1 results (Codex сделал database)
□ Review текущий Next.js проект
□ Вопросы к Claude Code (если есть)
```

#### **09:15-10:30: 🔥 VERCEL SETUP**
```
Задача: Подключить GitHub → Vercel и deploy

Шаг 1: Create/Login Vercel Account
- Go to https://vercel.com
- Sign up with GitHub (recommended)
- Create new project

Шаг 2: Connect GitHub Repository
- Import Git Repository
- Select: myNEXUSSALES/nexus-sales
- Framework Preset: Next.js
- Root Directory: apps/web
- ⚠️ ВАЖНО: Root directory = apps/web (не корень!)

Шаг 3: Configure Build Settings
Build Command:
  cd ../.. && npm run build --filter=web

Output Directory:
  .next

Install Command:
  cd ../.. && npm install

Environment Variables:
  NODE_ENV=production
  NEXT_PUBLIC_API_URL=https://api.nexus-sales.com (заменить на real)
  DATABASE_URL=(добавим позже когда Railway готов)

Шаг 4: Deploy!
- Click "Deploy"
- Wait for build (3-5 min)
- ✅ Success? Celebrate!
- ❌ Failed? Debug build logs

Deliverable:
✅ Project deployed to Vercel
✅ Production URL live (something.vercel.app)
✅ Build successful
```

#### **10:30-11:30: 🔥 PRODUCTION VERIFICATION**
```
Задача: Проверить что всё работает

Шаг 1: Test Production URL
- Open https://your-project.vercel.app
- Check homepage loads
- Check auth pages (/login, /register)
- Check dashboard page
- Test responsive (mobile, tablet, desktop)

Шаг 2: Configure Custom Domain (Optional)
Если есть domain (например nexus-sales.com):
- Go to Vercel Project Settings → Domains
- Add domain: nexus-sales.com
- Add www subdomain: www.nexus-sales.com
- Follow DNS configuration instructions
- Wait for SSL certificate (auto)

Если НЕТ domain:
- Skip this step
- Use .vercel.app domain

Шаг 3: Environment Variables Check
- Settings → Environment Variables
- Verify all variables present
- Add any missing variables:
  NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

Шаг 4: Build & Deploy Settings
- Settings → General
- Node.js Version: 18.x (recommended)
- Framework Preset: Next.js
- Root Directory: apps/web ✅

Deliverable:
✅ Production URL accessible
✅ All pages load correctly
✅ No console errors
✅ SSL working (HTTPS)
✅ Domain configured (if available)
```

#### **11:30-12:30: 🔥 GITHUB ACTIONS SETUP (Part 1)**
```
Задача: Создать CI/CD pipeline

Шаг 1: Create Workflow Directory
mkdir -p .github/workflows

Шаг 2: Create CI Workflow
Создать: .github/workflows/ci.yml

name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint --workspace=apps/web

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript Check
        run: npm run check-types --workspace=apps/web

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    env:
      SKIP_DB_TESTS: '1'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm run test:ci --workspace=apps/web

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build --workspace=apps/web
        env:
          SKIP_ENV_VALIDATION: '1'

Deliverable:
✅ CI workflow created
✅ Runs on PRs and main push
✅ All checks defined
```

---

### **LUNCH BREAK (12:30-13:00)**
```
□ Обед!
□ Отдых
□ Mid-day sync с Claude Code (5 min)
  - Показать production URL
  - Показать CI workflow
  - Обсудить блокеры (если есть)
```

---

### **AFTERNOON SESSION (14:00-17:00)**

#### **14:00-15:00: 🔥 CI/CD CONFIGURATION**
```
Задача: Настроить auto-deploy и preview deployments

Шаг 1: Vercel + GitHub Integration
- Go to Vercel Project Settings → Git
- Production Branch: main ✅
- Preview Branches: All branches ✅
  (это даст preview URL для каждого PR)

Шаг 2: Branch Protection Rules
Go to GitHub repo → Settings → Branches → Add rule

Branch name pattern: main

Protection rules:
✅ Require a pull request before merging
  - Require approvals: 1
  - Dismiss stale approvals when new commits are pushed

✅ Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Status checks:
    - lint
    - type-check
    - test
    - build
    - vercel (auto from Vercel integration)

✅ Require conversation resolution before merging
✅ Do not allow bypassing the above settings

Шаг 3: Test Protection
- Create test branch: git checkout -b test/ci-pipeline
- Make small change (e.g., update README)
- Push and create PR
- Verify CI runs
- Verify Vercel creates preview deployment
- Check PR cannot merge until checks pass

Deliverable:
✅ Auto-deploy to production on main merge
✅ Preview deployments for all PRs
✅ Branch protection enforces quality
✅ CI must pass before merge
```

#### **15:00-16:00: 🔥 MONITORING SETUP**
```
Задача: Basic monitoring и alerts

Шаг 1: Vercel Analytics
- Go to Vercel Project → Analytics tab
- Enable Web Analytics (free tier)
- ✅ Page views tracking
- ✅ Performance metrics
- ✅ No code changes needed!

Шаг 2: Setup Sentry (Error Tracking)
Option A: Sentry Cloud (Recommended)
- Go to https://sentry.io
- Create free account
- Create new project (Next.js)
- Get DSN (Data Source Name)

Add to Vercel Environment Variables:
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_AUTH_TOKEN=your-auth-token

Install Sentry:
npm install --save @sentry/nextjs --workspace=apps/web

Create: apps/web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

Create: apps/web/sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

Option B: Skip Sentry for now
- Note it as TODO for Week 2
- Focus on Vercel analytics only

Шаг 3: Uptime Monitoring (UptimeRobot)
- Go to https://uptimerobot.com
- Create free account
- Add monitor:
  - Type: HTTPS
  - URL: https://your-project.vercel.app
  - Interval: 5 minutes
  - Alert contacts: Your email

Deliverable:
✅ Vercel Analytics enabled
✅ Sentry setup (or TODO noted)
✅ Uptime monitoring active
✅ Email alerts configured
```

#### **16:00-17:00: 🔥 DOCUMENTATION & TESTING**
```
Задача: Документировать всё и протестировать

Шаг 1: Create Deployment Documentation
Создать: docs/deployment.md

# Deployment Guide

## Production

**URL:** https://your-project.vercel.app
**Platform:** Vercel
**Branch:** main (auto-deploy)

## Preview Deployments

Every PR gets automatic preview deployment:
- URL: https://nexus-sales-pr-{number}.vercel.app
- Automatic on PR creation
- Updates on every push

## CI/CD Pipeline

GitHub Actions runs on every PR:
1. Lint (ESLint)
2. Type Check (TypeScript)
3. Unit Tests (Jest)
4. Build (Next.js)

All checks must pass before merge.

## Deployment Process

1. Create feature branch
2. Make changes
3. Create PR
4. Wait for CI checks ✅
5. Review preview deployment
6. Get approval
7. Merge to main
8. Auto-deploy to production (2-3 min)

## Rollback

If production breaks:
1. Go to Vercel dashboard
2. Deployments tab
3. Find last good deployment
4. Click "..." → "Promote to Production"
5. Or: Revert Git commit and push

## Environment Variables

Managed in Vercel dashboard:
- Settings → Environment Variables
- Separate values for Production/Preview/Development
- Changes require redeploy

## Monitoring

- **Analytics:** Vercel Analytics tab
- **Errors:** Sentry dashboard (if configured)
- **Uptime:** UptimeRobot dashboard
- **Logs:** Vercel Functions tab

Шаг 2: Update Main README
Добавить в README.md секцию:

## Deployment

- **Production:** https://your-project.vercel.app
- **CI/CD:** GitHub Actions
- **Docs:** [Deployment Guide](./docs/deployment.md)

Шаг 3: Test Full Workflow
- Create test PR
- Verify CI runs
- Check preview deployment
- Merge PR
- Verify production deploy
- Check production URL
- ✅ Success!

Шаг 4: Create Cheat Sheet
Создать: docs/deployment-cheatsheet.md

# Deployment Cheat Sheet

## Quick Deploy
git push origin main  # Auto-deploys to production

## Create Preview
git checkout -b feature/my-feature
git push origin feature/my-feature
# Create PR → auto preview

## View Logs
vercel logs --follow  # Or use dashboard

## Rollback
vercel rollback [deployment-url]

## Environment Variables
vercel env add VARIABLE_NAME

## Force Redeploy
vercel --prod --force

Deliverable:
✅ deployment.md complete
✅ deployment-cheatsheet.md created
✅ README updated
✅ Full workflow tested
✅ Everything documented
```

---

### **END OF DAY (17:00-17:30)**

#### **17:00-17:30: 🔥 EOD REPORT & DEMO**
```
Задача: Отчитаться и показать результаты

Шаг 1: Create EOD Report
Post в #track-d-infra:

🎉 GPT-5 High - Day 2 COMPLETE!

✅ DELIVERABLES:
- Frontend deployed to Vercel
- Production URL: https://your-project.vercel.app
- CI/CD pipeline working (GitHub Actions)
- Auto-deploy on main merge ✅
- Preview deployments for PRs ✅
- Branch protection rules active
- Vercel Analytics enabled
- Uptime monitoring setup (UptimeRobot)
- Sentry configured (or TODO noted)
- Complete documentation

📊 STATS:
- Build time: ~3 minutes
- Deploy time: ~2 minutes
- CI checks: 4 (lint, type, test, build)
- Uptime target: 99.9%

🚀 IMPACT:
- Team can demo production URL
- Quality gates enforce standards
- Auto-deploy speeds up iteration
- Preview deploys enable review

💪 READY FOR DAY 3!

Шаг 2: Demo to Team (5 min)
- Show production URL
- Show CI pipeline in action
- Show preview deployment example
- Show monitoring dashboard

Deliverable:
✅ EOD report posted
✅ Team demo complete
✅ Documentation shared
✅ Ready for Day 3 planning
```

---

## 📞 **COMMUNICATION**

### **During the Day:**
```
09:15 - Kickoff complete update в #track-d-infra
11:00 - Progress: "Vercel deployed, CI setup in progress"
12:30 - Mid-day sync с Claude Code
15:00 - Progress: "CI/CD complete, monitoring setup"
17:00 - EOD report (full summary)
```

### **Questions:**
```
DevOps questions → @Claude-Code в #tech-lead
Vercel issues → #track-d-infra
Stuck? → @Claude-Code immediate помощь
General → #daily-standup
```

---

## ✅ **CHECKLIST - END OF DAY 2**

```
VERCEL DEPLOYMENT:
□ Project connected to GitHub
□ Build settings configured (root: apps/web)
□ Environment variables set
□ Production deployment successful
□ Production URL accessible (HTTPS)
□ All pages load correctly
□ No console errors
□ Custom domain configured (optional)

CI/CD PIPELINE:
□ .github/workflows/ci.yml created
□ Lint job working
□ Type-check job working
□ Test job working
□ Build job working
□ Runs on PR creation
□ Runs on main push

AUTO-DEPLOY:
□ Vercel → GitHub integration active
□ Main branch auto-deploys
□ Preview deployments for PRs
□ Branch protection rules set
□ Status checks required

MONITORING:
□ Vercel Analytics enabled
□ Sentry configured (or TODO)
□ UptimeRobot monitoring active
□ Email alerts configured

DOCUMENTATION:
□ docs/deployment.md complete
□ docs/deployment-cheatsheet.md created
□ README.md updated
□ Code comments clear

GIT:
□ All changes committed
□ PR created (if applicable)
□ No merge conflicts
□ CI passing

COMMUNICATION:
□ Progress updates posted
□ EOD report complete
□ Demo given
□ No blockers for Day 3
```

---

## 🎯 **SUCCESS CRITERIA**

**You succeed if:**
```
✅ Production URL is live and accessible
✅ CI/CD pipeline runs automatically
✅ Quality gates prevent bad merges
✅ Preview deployments work for PRs
✅ Monitoring is active
✅ Documentation is clear
✅ Team can use the infrastructure
✅ No blockers for other agents
```

**It's OK if:**
```
⚠️ Sentry setup postponed (can do later)
⚠️ Custom domain not configured yet (optional)
⚠️ Some monitoring features basic (can enhance)
```

**NOT OK if:**
```
❌ Production deployment failed
❌ CI/CD not working
❌ No documentation
❌ Blocking other team members
```

---

## 💡 **TIPS FOR SUCCESS**

```
1. 📖 Start with Vercel - easiest first
2. 🧪 Test each step before moving on
3. 📝 Document as you go
4. 🔄 Use Vercel CLI for debugging (npm i -g vercel)
5. 💬 Share progress updates frequently
6. 🎯 Focus on basics first, enhance later
7. 🚀 Speed matters, but quality more
8. 🎉 Celebrate small wins!
```

---

## 🚨 **IF YOU GET STUCK**

```
PROBLEM: Vercel build fails
SOLUTION:
- Check build logs in Vercel dashboard
- Verify root directory = apps/web
- Check environment variables
- Test build locally first: npm run build --workspace=apps/web
- Share error with Claude Code

PROBLEM: CI not triggering
SOLUTION:
- Check .github/workflows/ci.yml syntax (YAML sensitive!)
- Verify GitHub Actions enabled (repo settings)
- Check branch names match
- Force trigger: Re-push commit

PROBLEM: Preview deployments not working
SOLUTION:
- Verify Vercel GitHub integration installed
- Check repo access permissions
- Verify "Preview Branches: All" in Vercel settings

PROBLEM: Can't find something in docs
SOLUTION:
- Google: "vercel [your question]"
- Check Vercel docs: https://vercel.com/docs
- GitHub Actions docs: https://docs.github.com/actions
- Ask Claude Code

REMEMBER: Infrastructure issues are normal! Ask early! 💪
```

---

## 🎉 **YOU GOT THIS!**

```
┌────────────────────────────────────────────────┐
│                                                │
│  🔴 GPT-5 High - YOU'RE THE FOUNDATION!       │
│                                                │
│  Mission: Deploy & Automate                   │
│  Impact: Enable team velocity                 │
│  Pressure: Medium (you got time!)             │
│  Timeline: 1 day (pace yourself)              │
│                                                │
│  "Infrastructure is invisible until           │
│   it breaks. Let's make it unbreakable!"      │
│                                                │
│  The team counts on you! 💪                   │
│  Claude Code has your back! 🛡️                │
│                                                │
│  LET'S BUILD LEGENDARY INFRASTRUCTURE! 🚀     │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 📚 **RESOURCES**

```
Documentation:
- DAY2_AGENTS_BRIEFING.md - Your role overview
- CODEX_DAY1_REVIEW.md - What Codex built

External:
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/actions
- UptimeRobot: https://uptimerobot.com/
- Sentry: https://docs.sentry.io/

Team:
- Claude Code (Tech Lead) - Always available
- #track-d-infra - Your channel
- #tech-lead - Escalation
```

---

**START TIME:** Tomorrow 09:00 CET  
**END TIME:** Tomorrow 17:30 CET  
**COORDINATOR:** Claude Code  
**TRACK:** D (Infrastructure) - Independent!  
**STATUS:** 🚀 READY TO LAUNCH!

---

*"Great products need great infrastructure. You're building it!"*

**GO MAKE THE MAGIC HAPPEN! 🔥💪🚀**

---

*Prepared by: Claude Code (Tech Lead)*  
*For: GPT-5 High (DevOps Engineer)*  
*Date: 2025-09-29*  
*Fire: 3 - Day 2*
