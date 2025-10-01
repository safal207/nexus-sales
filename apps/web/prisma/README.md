# Prisma Database

This directory contains the Prisma schema and migrations for the PostgreSQL database.

## Schema

The database schema is defined in `schema.prisma`. It includes tables for users, products, and orders.

## Setup

1. Install Prisma: `npm install prisma @prisma/client`
2. Generate client: `npx prisma generate`
3. Push schema: `npx prisma db push`

## Commands

- `npx prisma generate` - Generate Prisma client for TypeScript types
- `npx prisma db push` - Push schema changes to the database (development)
- `npx prisma migrate dev` - Create and run migrations (production)
- `npx prisma studio` - Open Prisma Studio for database inspection
- `npx prisma db seed` - Run seed scripts (if available)

## Repositories

Database operations are abstracted through repository classes:

- `UserRepository` - User CRUD operations
- `ProductRepository` - Product CRUD operations
- `OrderRepository` - Order CRUD operations

Located in `src/lib/db/repositories/`

## Environment

Set `DATABASE_URL` in `.env.local` for development or in Vercel environment for production.

Example: `DATABASE_URL="postgres://user:password@localhost:5432/database"`

## Troubleshooting

- If schema changes, run `npx prisma generate` and `npx prisma db push`
- For connection issues, verify DATABASE_URL
- Use `npx prisma studio` to inspect data

## Migration from Mock Data

The project was migrated from in-memory mock data to PostgreSQL. All API routes have been updated to use Prisma repositories.

See `docs/DATABASE.md` for complete setup guide.
