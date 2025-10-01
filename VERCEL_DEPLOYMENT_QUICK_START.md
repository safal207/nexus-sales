# 🚀 VERCEL DEPLOYMENT - QUICK START

**Status:** Ready to deploy (CI/CD pipeline complete)
**Time Required:** 10-15 minutes
**Prepared by:** GPT-5 High

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

Перед началом убедись, что у тебя есть:

```
✅ GitHub repository pushed to GitHub
✅ Vercel account (free tier OK)
✅ GitHub connected to Vercel
⏳ DATABASE_URL from Kimi-k2 (можно добавить позже)
✅ JWT_SECRET_KEY (32+ characters random string)
```

---

## 🎯 **5-MINUTE DEPLOYMENT GUIDE**

### **Step 1: Create Vercel Project (2 min)**

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repo: `myNEXUSSALES/nexus-sales`
4. Click **"Import"**

### **Step 2: Configure Project (3 min)**

```
Root Directory: apps/web
Framework Preset: Next.js
Node.js Version: 18.x
```

**Build & Development Settings:**
```bash
Install Command:
cd ../.. && npm install

Build Command:
cd ../.. && npm run build --filter=web

Output Directory:
.next

Development Command:
npm run dev
```

### **Step 3: Environment Variables (3 min)**

Add these in **"Environment Variables"** section:

```bash
# Required
NODE_ENV=production
JWT_SECRET_KEY=your-super-secret-key-at-least-32-chars-long

# Database (add when Kimi-k2 provides)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Optional (for your domain)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

**Generate JWT_SECRET_KEY:**
```bash
# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use this:
openssl rand -base64 32

# Or online:
https://randomkeygen.com/ (use "Fort Knox Passwords")
```

### **Step 4: Deploy! (2 min)**

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Get your URL: `https://your-app.vercel.app`
4. ✅ **Production is live!**

---

## 🔧 **POST-DEPLOYMENT SETUP**

### **Enable Web Analytics (1 min)**

1. Go to your project dashboard
2. Click **"Analytics"** tab
3. Click **"Enable Web Analytics"**
4. ✅ Free real-time analytics enabled!

### **Add Custom Domain (5 min - Optional)**

1. Go to **"Settings" → "Domains"**
2. Enter your domain (e.g., `nexus.sales`)
3. Add DNS records (Vercel shows exact records)
4. Wait 5-10 min for propagation
5. ✅ Custom domain live!

### **Setup Branch Protection (3 min)**

1. Go to GitHub repo → **Settings → Branches**
2. Add rule for `main` branch:
   ```
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging

   Status checks required:
   - lint
   - type-check
   - test
   - build
   ```
3. Save rule
4. ✅ Protected branch with CI gates!

---

## 🎨 **VERCEL GIT INTEGRATION**

### **Automatic Deployments:**

```
Push to main → Production deploy (auto)
Push to other branch → Preview deploy (auto)
Open PR → Preview deploy with comment (auto)
```

### **Preview URLs:**

Every PR gets unique URL:
```
https://nexus-sales-git-feature-abc-username.vercel.app
```

### **Environment Variables per Branch:**

```
Production (main): Uses production DATABASE_URL
Preview (all other): Can use different DATABASE_URL (optional)
Development (local): Uses .env.local
```

---

## ⚠️ **KNOWN ISSUES & FIXES**

### **Issue 1: Build fails - "Cannot find module"**

**Fix:**
```bash
# Check install command includes monorepo root:
cd ../.. && npm install

# NOT just: npm install
```

### **Issue 2: Database connection fails**

**Fix:**
```bash
# Add DATABASE_URL to Vercel env vars
# Redeploy: Vercel dashboard → Deployments → ... → Redeploy
```

### **Issue 3: "JWT_SECRET_KEY is not set"**

**Fix:**
```bash
# Add JWT_SECRET_KEY to Vercel env vars
# Must be 32+ characters
# Redeploy
```

### **Issue 4: API routes return 500**

**Check:**
1. Environment variables set correctly?
2. Database accessible from Vercel? (check Supabase connection pooling)
3. Check Vercel logs: Dashboard → Deployments → View Function Logs

---

## 📊 **MONITORING & LOGS**

### **View Logs:**

```
Real-time logs:
Vercel Dashboard → Project → Deployments → [latest] → View Function Logs

Build logs:
Click any deployment → View Build Logs
```

### **Check Status:**

```
Production URL: https://your-app.vercel.app
Status page: Automatic (Vercel monitors uptime)
Analytics: Dashboard → Analytics
```

### **Common Log Patterns:**

```bash
# Successful request
[GET] /api/auth/login → 200 (45ms)

# Database error
[POST] /api/auth/login → 500 (Error: connect ETIMEDOUT)
→ Fix: Check DATABASE_URL

# Missing env var
[POST] /api/auth/login → 500 (Error: JWT_SECRET_KEY is not set)
→ Fix: Add to Vercel env vars
```

---

## 🔄 **REDEPLOYMENT**

### **When to Redeploy:**

```
✅ After adding environment variables
✅ After updating Vercel config
✅ To fix failed deployment
❌ NOT needed for code changes (auto-deploys from git)
```

### **How to Redeploy:**

```
Option 1: Via Dashboard
1. Go to Deployments
2. Find latest deployment
3. Click "..." menu → "Redeploy"

Option 2: Via Git
1. Push to main branch
2. Auto-redeploys

Option 3: Via CLI
vercel --prod
```

---

## 🚨 **TROUBLESHOOTING CHECKLIST**

```
Build fails:
□ Check build logs in Vercel
□ Verify install command correct
□ Try build locally: npm run build --filter=web
□ Check Node version matches (18.x)

Runtime errors:
□ Check function logs
□ Verify all env vars set
□ Test DATABASE_URL connection
□ Check API route paths

Database issues:
□ Verify DATABASE_URL format
□ Check Supabase allows Vercel IPs (should be automatic)
□ Use connection pooling URL (PgBouncer)
□ Test connection: psql $DATABASE_URL

Performance issues:
□ Enable Edge Runtime for API routes (optional)
□ Check database query performance
□ Review function execution time in logs
□ Consider caching (Redis) if slow
```

---

## 📞 **SUPPORT & RESOURCES**

### **Official Docs:**
- Vercel Next.js: https://vercel.com/docs/frameworks/nextjs
- Monorepo setup: https://vercel.com/docs/monorepos

### **GPT-5 High's Documentation:**
- Full guide: `docs/deployment.md`
- Cheatsheet: `docs/deployment-cheatsheet.md`

### **Team Support:**
- GPT-5 High: Available for deployment questions
- Claude Code: Tech Lead for escalations

---

## 🎯 **SUCCESS CRITERIA**

Your deployment is successful when:

```
✅ Production URL accessible
✅ Homepage loads without errors
✅ Can register new user
✅ Can login with test user (test@test.com / password123)
✅ Can view dashboard
✅ API routes respond correctly
✅ No 500 errors in logs
✅ Analytics tracking
```

---

## 🎉 **AFTER SUCCESSFUL DEPLOY**

### **Share Production URL:**

```
1. Copy production URL from Vercel dashboard
2. Update README.md with production URL
3. Add to project documentation
4. Share with team
5. Test all features
```

### **Next Steps:**

```
Week 1:
□ Add custom domain
□ Setup error tracking (Sentry)
□ Configure uptime monitoring
□ Add DATABASE_URL when ready
□ Test with real database

Week 2+:
□ Setup staging environment
□ Add performance monitoring
□ Configure CDN settings
□ Optimize build times
```

---

## 💡 **PRO TIPS**

```
1. Use Preview Deployments for testing PRs
2. Never commit .env files (use Vercel env vars)
3. Keep JWT_SECRET_KEY secure (different for prod/preview)
4. Monitor function execution time (Vercel has limits)
5. Use Edge Runtime for faster API routes (optional)
6. Enable Web Analytics for free metrics
7. Check deployment frequency (free tier: 100 deployments/day)
```

---

## ⏱️ **DEPLOYMENT TIMELINE**

```
00:00 - Start
02:00 - Vercel project created
05:00 - Environment variables added
07:00 - First deployment triggered
10:00 - Build complete
12:00 - Production URL live
15:00 - Web Analytics enabled
17:00 - Branch protection setup
20:00 - Custom domain (optional)

Total: 10-15 minutes (20 min with custom domain)
```

---

## 📋 **QUICK COMMAND REFERENCE**

```bash
# View logs
vercel logs your-app.vercel.app

# Redeploy
vercel --prod

# Check deployment status
vercel inspect your-deployment-url

# List deployments
vercel list

# View project info
vercel project ls
```

---

**🚀 READY TO DEPLOY? Follow Step 1 above!**

**Questions?** Check `docs/deployment.md` for detailed guide.

---

*Quick Start by: GPT-5 High*
*CI/CD Pipeline: ✅ Ready*
*Status: Ready for production deployment*