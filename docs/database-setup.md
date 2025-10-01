# Database Setup Guide

This guide describes how to bootstrap and verify the database foundation for NEXUS.SALES (Fire 3).

## Prerequisites
- PostgreSQL 14 or newer
- Node.js 18+
- npm 10+

## 1. Install and Start PostgreSQL
You can install PostgreSQL locally or use Docker:

```bash
# Docker example
docker run --name nexus-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

## 2. Create Development Database
```bash
psql -U postgres
CREATE DATABASE nexus_sales_dev;
CREATE USER nexus_dev WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE nexus_sales_dev TO nexus_dev;
\q
```

## 3. Configure Environment Variables
Create `apps/web/.env.local` (not committed) with:
```
DATABASE_URL=postgresql://nexus_dev:dev_password@localhost:5432/nexus_sales_dev
NODE_ENV=development
```

## 4. Install Dependencies
From the project root:
```bash
npm install
```

## 5. Run Migrations
```bash
cd apps/web
npm run migrate:up
```
The command uses `node-pg-migrate` and will create the required extension, tables, indexes, and constraints.

To inspect schema changes:
```bash
npm run migrate:status
psql -U nexus_dev -d nexus_sales_dev -c "\dt"
```

## 6. Seed Baseline Data
Seeding is part of the migration chain. Re-running `npm run migrate:up` will apply the seed migration if it has not been executed yet.
To roll back and re-apply everything:
```bash
npm run migrate:down
npm run migrate:up
```

## 7. Verify the Setup
Run the verification script (requires PostgreSQL to be running):
```bash
npm run verify:db
```
Expected output lists seeded users, products, and the set of tables.

You can also execute the jest health-check test:
```bash
npm run test -- src/lib/__tests__/db.test.ts
```

## 8. Troubleshooting
- Ensure `DATABASE_URL` matches your local credentials.
- Check that the `pgcrypto` extension is available (`CREATE EXTENSION pgcrypto;`).
- If migrations fail, inspect the error log and confirm PostgreSQL is running.
- Set `SKIP_DB_TESTS=1` before running unit tests if PostgreSQL is temporarily unavailable.

## 9. Next Steps
- Wire API routes to use `query`/`getClient` helpers.
- Extend seeding with funnels, orders, and emotion samples as new features require.
- Integrate the verification script into CI once a dedicated database service is provisioned.
