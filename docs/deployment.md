# Deployment Guide (Vercel + GitHub Actions)

This guide explains how to deploy the Next.js frontend to Vercel and wire up CI/CD in GitHub Actions.

## Vercel Setup (Dashboard)

1) Create/Login Vercel account and import the repo.
- Framework Preset: Next.js
- Root Directory: `apps/web` (important)

2) Build Settings
- Install Command: `cd ../.. && npm install`
- Build Command: `cd ../.. && npm run build --filter=web`
- Output Directory: `.next`

3) Environment Variables
- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app`
- Add others as needed (API URLs, Sentry, etc.)

4) Deploy
- Click Deploy and wait for build to finish.

## CI/CD (GitHub Actions)

We provide a CI workflow at `.github/workflows/ci.yml` that runs on PRs and pushes to `main`:
- Lint (`npm run lint --workspace web`)
- Type-check (`npm run check-types --workspace web`)
- Tests (`npm run test:ci --workspace web`) with `SKIP_DB_TESTS=1`
- Build (`npm run build --workspace web`)

Recommended branch protection for `main`:
- Require PR with 1 approval
- Require status checks: lint, type-check, test, build (and vercel if integrated)

## Auto-deploy & Previews

In Vercel Project → Git settings:
- Production Branch: `main`
- Preview Branches: All branches (PRs get preview URLs)

## Monitoring

- Enable Vercel Web Analytics (Project → Analytics)
- Optional: Sentry error tracking (add DSN via env, install `@sentry/nextjs`)
- Optional: UptimeRobot for availability checks (target production URL)

## Rollback

- Vercel → Deployments → Promote previous good deployment to Production
- Or revert the Git commit and push

## Cheat Sheet

See `docs/deployment-cheatsheet.md` for quick commands and tips.

