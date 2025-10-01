# Database Setup & Usage Guide

## Migration Complete ✅

The NEXUS.SALES project has been successfully migrated from mock in-memory data to PostgreSQL using Prisma ORM.

## Database Connection

**Production Database:** Supabase

**DATABASE_URL:** `postgres://postgres:NexusSales2024!@#Secure@db.yyeovmwzvasrvaaahqgd.supabase.co:5432/postgres`

## Database Schema

### Users Table
- id: Int (Primary Key, Auto Increment)
- email: String (Unique)
- password: String
- createdAt: DateTime
- updatedAt: DateTime

### Products Table
- id: Int (Primary Key, Auto Increment)
- userId: Int (Foreign Key to users.id)
- name: String
- description: String?
- price: Int (cents)
- createdAt: DateTime
- updatedAt: DateTime

### Orders Table
- id: String (Primary Key, UUID)
- productId: Int? (Foreign Key to products.id)
- email: String
- name: String?
- status: OrderStatus (enum: created, processing, paid, refunded, cancelled)
- amount: Int
- createdAt: DateTime
- updatedAt: DateTime

## Setup Instructions

### Local Development
1. Install PostgreSQL locally (optional, for development)
2. Update `.env.local` with DATABASE_URL
3. Run `npx prisma generate` to generate client
4. Run `npx prisma db push` to create tables

### Production (Supabase)
- Database already set up and migrated
- Use the provided DATABASE_URL

## Usage

### Connecting to Database
```typescript
import { prisma } from '@/lib/db/prisma';
```

### Using Repositories
```typescript
import { userRepository } from '@/lib/db/repositories/UserRepository';
import { productRepository } from '@/lib/db/repositories/ProductRepository';
import { orderRepository } from '@/lib/db/repositories/OrderRepository';

// Example
const users = await userRepository.findByEmail('user@example.com');
const products = await productRepository.findByUserId(userId);
```

### Running Migrations
- For schema changes: `npx prisma migrate dev`
- For pushing schema: `npx prisma db push`

## Testing

All existing tests pass with the real PostgreSQL database. Run `npm test` to verify.

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project status
- Ensure password is correct

### Migration Issues
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` for development

### Performance
- Use connection pooling in production
- Indexes are created automatically for foreign keys

## Next Steps

The database migration is complete. The project is ready for deployment on Vercel using the provided DATABASE_URL.

**Delivered to GPT-5 High:** DATABASE_URL for Vercel deployment.

---

*Migration completed by Grok Fast4*
*Date: 2025-09-30*
*Status: ✅ SUCCESS*
