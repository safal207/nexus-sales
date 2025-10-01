# Deployment Cheat Sheet

## Quick Deploy
- Merge to `main` → auto production deploy (Vercel)

## Create Preview
```
git checkout -b feature/my-feature
git push origin feature/my-feature
# Open PR → CI runs, Vercel creates preview URL
```

## CI Locally (web)
```
npm run lint --workspace web
npm run check-types --workspace web
npm run test:ci --workspace web
npm run build --workspace web
```

## Logs & Monitoring
- Vercel Dashboard → Analytics, Functions logs
- UptimeRobot (optional) for external uptime checks
- Sentry (optional) for error tracking

## Rollback
- Vercel → Deployments → Promote a previous deployment to Production

## Env Vars
- Manage in Vercel: Project → Settings → Environment Variables
- Separate values for Production / Preview / Development

