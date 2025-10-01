# 🔥 KIMI-K2 - DAY 2 BRIEFING: POSTGRESQL DATABASE SETUP

**Agent:** Kimi-k2 (Backend Track B)
**Mission:** PostgreSQL migration + Production database setup
**Date:** Day 2 (Tomorrow)
**Time:** 09:00-17:30 CET
**Priority:** 🔴 CRITICAL (Backend foundation)

---

## 📋 **EXECUTIVE SUMMARY**

**Your Mission:**
Migrate from in-memory Mock database to production PostgreSQL, setup connection pooling, create migration system, and ensure data persistence.

**Why You:**
- Backend architecture expertise
- Database design strength
- Critical thinking for data modeling
- Can work independently on Track B

**Success Criteria:**
```
✅ PostgreSQL database running (local + production)
✅ Connection pooling configured
✅ Migration system working
✅ All mock data migrated
✅ Tests passing with real DB
✅ Documentation complete
```

---

## 🎯 **CONTEXT: WHERE WE ARE**

### Current State (After Day 1):
```typescript
// apps/web/src/app/api/auth/lib/db.ts
// ❌ Current: In-memory Map storage
export const users = seedUsers();  // Map<string, MockUser>
export const products = seedProducts();  // Map<number, MockProduct>
export const orders = new Map<number, MockOrder>();

// Problems:
- Data lost on server restart
- No persistence
- Not scalable
- No multi-instance support
```

### What We Need (Day 2 Goal):
```typescript
// ✅ New: PostgreSQL with Prisma/Drizzle
// - Real database persistence
// - Connection pooling
// - Migration system
// - Type-safe queries
// - Production-ready
```

### Tech Stack Decision:
```
Option 1: Prisma (Recommended)
- Type-safe ORM
- Great migrations
- Developer-friendly
- Next.js optimized

Option 2: Drizzle
- Lightweight
- SQL-like syntax
- Fast performance
- Type-safe

YOUR CHOICE: Pick what you're most comfortable with!
```

---

## 📊 **DATABASE SCHEMA DESIGN**

### Current Mock Data Structure:

```typescript
// Users Table
interface MockUser {
  id: number;
  email: string;
  password: string;  // bcrypt hash
}

// Products Table
interface MockProduct {
  id: number;
  userId: number;
  name: string;
  description: string;
  price: number;  // cents
}

// Orders Table
interface MockOrder {
  id: string;
  productId: number;
  email: string;
  name: string | null;
  status: 'created' | 'processing' | 'paid' | 'refunded' | 'cancelled';
  createdAt: string;
  amount: number;
}
```

### PostgreSQL Schema Design:

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,  -- cents
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- indexes for performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## 🚀 **DAY 2 IMPLEMENTATION PLAN**

### **Phase 1: Setup PostgreSQL (09:00-10:30) - 1.5h**

#### Task 1.1: Install PostgreSQL Locally
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download installer:
# https://www.postgresql.org/download/windows/

# Start PostgreSQL service
net start postgresql-x64-15

# Create database
psql -U postgres
CREATE DATABASE nexus_sales_dev;
CREATE USER nexus_user WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE nexus_sales_dev TO nexus_user;
\q
```

#### Task 1.2: Setup Production Database (Supabase)
```bash
# 1. Go to https://supabase.com
# 2. Create new project: "nexus-sales-prod"
# 3. Copy connection string:
# postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# 4. Get connection details:
# - Host: db.[PROJECT-REF].supabase.co
# - Port: 5432
# - Database: postgres
# - User: postgres
# - Password: [from Supabase dashboard]
```

#### Task 1.3: Configure Environment Variables
```bash
# apps/web/.env.local
DATABASE_URL="postgresql://nexus_user:dev_password_123@localhost:5432/nexus_sales_dev"

# apps/web/.env.production (for Vercel)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Connection pooling (Supabase provides this)
DATABASE_POOL_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
```

#### Task 1.4: Test Connection
```typescript
// scripts/test-db-connection.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

```bash
# Test
cd apps/web
npx tsx scripts/test-db-connection.ts
```

**Checkpoint 1:** ✅ PostgreSQL running locally and in production

---

### **Phase 2: Setup Prisma ORM (10:30-12:00) - 1.5h**

#### Task 2.1: Install Prisma
```bash
cd apps/web
npm install prisma @prisma/client
npm install -D prisma
```

#### Task 2.2: Initialize Prisma
```bash
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env (update DATABASE_URL)
```

#### Task 2.3: Create Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  products  Product[]

  @@map("users")
}

model Product {
  id          Int       @id @default(autoincrement())
  userId      Int       @map("user_id")
  name        String
  description String?
  price       Int       // cents
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      Order[]

  @@index([userId])
  @@map("products")
}

model Order {
  id        String    @id @default(uuid())
  productId Int?      @map("product_id")
  email     String
  name      String?
  status    OrderStatus
  amount    Int
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  product   Product?  @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([productId])
  @@index([email])
  @@index([status])
  @@map("orders")
}

enum OrderStatus {
  created
  processing
  paid
  refunded
  cancelled
}
```

#### Task 2.4: Generate Prisma Client
```bash
npx prisma generate

# This creates type-safe client at:
# node_modules/@prisma/client
```

#### Task 2.5: Create Migration
```bash
npx prisma migrate dev --name initial_schema

# This:
# 1. Creates migration files in prisma/migrations/
# 2. Applies migration to database
# 3. Regenerates Prisma Client
```

**Checkpoint 2:** ✅ Prisma schema created and migrated

---

### **LUNCH BREAK (12:00-13:00)**

---

### **Phase 3: Migrate Mock Database (13:00-14:30) - 1.5h**

#### Task 3.1: Create Database Service Layer
```typescript
// apps/web/src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### Task 3.2: Create Repository Interfaces
```typescript
// apps/web/src/lib/db/repositories/UserRepository.ts
import { prisma } from '../prisma';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();
```

```typescript
// apps/web/src/lib/db/repositories/ProductRepository.ts
import { prisma } from '../prisma';
import { Product, Prisma } from '@prisma/client';

export class ProductRepository {
  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUserId(userId: number): Promise<Product[]> {
    return prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
```

```typescript
// apps/web/src/lib/db/repositories/OrderRepository.ts
import { prisma } from '../prisma';
import { Order, Prisma, OrderStatus } from '@prisma/client';

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async findByEmail(email: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { email },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({
      data,
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}

export const orderRepository = new OrderRepository();
```

#### Task 3.3: Update Login Route
```typescript
// apps/web/src/app/api/auth/login/route.ts
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { userRepository } from '@/lib/db/repositories/UserRepository';

// ... types remain the same ...

export async function POST(request: Request) {
  console.info('[auth/login] request received');

  try {
    const rawBody = (await request.json()) as unknown;

    if (!isValidLoginPayload(rawBody)) {
      return respondWithError('Неверный формат данных.', 400);
    }

    const { email, password } = rawBody;

    console.info('[auth/login] authentication attempt', { email });

    // ✅ NEW: Use repository instead of Map
    const user = await userRepository.findByEmail(email);

    let passwordMatches = false;
    if (user) {
      passwordMatches = await bcrypt.compare(password, user.password);
    }

    if (!user || !passwordMatches) {
      console.warn('[auth/login] invalid credentials', { email, passwordMatches });
      return respondWithError('Неверный e-mail или пароль.', 401);
    }

    const safeUser = toResponseUser(user);

    const token = await new SignJWT(safeUser)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(getJwtSecretKey());

    console.info('[auth/login] authentication successful', { email });

    const response = NextResponse.json<LoginSuccessResponse>(
      {
        success: true,
        token,
        user: safeUser,
      },
      { status: 200 },
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2,
    });

    return response;
  } catch (error) {
    console.error('[auth/login] unexpected error', error);
    return respondWithError('Произошла внутренняя ошибка. Попробуйте снова.', 500);
  }
}
```

#### Task 3.4: Update Register Route
```typescript
// apps/web/src/app/api/auth/register/route.ts
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { userRepository } from '@/lib/db/repositories/UserRepository';

// ... types remain the same ...

export async function POST(request: Request) {
  console.info('[auth/register] request received');

  try {
    const rawBody = (await request.json()) as unknown;

    if (!isValidRegisterPayload(rawBody)) {
      return respondWithError('Неверный формат данных.', 400);
    }

    const { email, password } = rawBody;

    console.info('[auth/register] registration attempt', { email });

    // ✅ NEW: Check if user exists
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return respondWithError('Пользователь с таким email уже существует.', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ NEW: Create user in database
    const user = await userRepository.create({
      email,
      password: hashedPassword,
    });

    const safeUser = toResponseUser(user);

    const token = await new SignJWT(safeUser)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(getJwtSecretKey());

    console.info('[auth/register] registration successful', { email });

    const response = NextResponse.json<RegisterSuccessResponse>(
      {
        success: true,
        token,
        user: safeUser,
      },
      { status: 201 },
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2,
    });

    return response;
  } catch (error) {
    console.error('[auth/register] unexpected error', error);
    return respondWithError('Произошла внутренняя ошибка. Попробуйте снова.', 500);
  }
}
```

#### Task 3.5: Update Products API
```typescript
// apps/web/src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { productRepository } from '@/lib/db/repositories/ProductRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // ✅ NEW: Use repository
    const products = await productRepository.findByUserId(parseInt(userId));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('[products] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, description, price } = body;

    // Validation
    if (!userId || !name || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ NEW: Create product in database
    const product = await productRepository.create({
      name,
      description: description || '',
      price: parseInt(price),
      user: {
        connect: { id: parseInt(userId) },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('[products] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### Task 3.6: Seed Database
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create test products
  const product1 = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      userId: user.id,
      name: 'My First Awesome Course',
      description: 'This is the best course ever.',
      price: 4999,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      userId: user.id,
      name: 'My Second Product',
      description: 'Another great offering.',
      price: 9999,
    },
  });

  console.log('✅ Created products:', product1.name, product2.name);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```json
// package.json - add seed script
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

```bash
# Run seed
npm run db:seed
```

**Checkpoint 3:** ✅ All mock data migrated to PostgreSQL

---

### **Phase 4: Testing & Validation (14:30-16:00) - 1.5h**

#### Task 4.1: Update Tests
```typescript
// apps/web/src/__tests__/api/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/lib/db/prisma';

describe('Auth API with PostgreSQL', () => {
  beforeAll(async () => {
    // Clean database before tests
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register new user', async () => {
    // Test registration with real database
    // ...
  });

  it('should login existing user', async () => {
    // Test login with real database
    // ...
  });

  it('should reject invalid credentials', async () => {
    // Test error handling
    // ...
  });
});
```

#### Task 4.2: Manual Testing Checklist
```bash
# 1. Start dev server
npm run dev

# 2. Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"password123"}'

# 3. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 4. Verify in database
npx prisma studio
# Opens GUI to view data

# 5. Test products API
curl http://localhost:3000/api/products?userId=1

# 6. Test create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"name":"Test Product","description":"Test","price":1000}'
```

#### Task 4.3: Performance Testing
```typescript
// scripts/benchmark-db.ts
import { prisma } from '../src/lib/db/prisma';
import { performance } from 'perf_hooks';

async function benchmarkQueries() {
  console.log('🏃 Running database benchmarks...\n');

  // Test 1: Find user by email
  const start1 = performance.now();
  await prisma.user.findUnique({ where: { email: 'test@test.com' } });
  const end1 = performance.now();
  console.log(`✅ Find user by email: ${(end1 - start1).toFixed(2)}ms`);

  // Test 2: Find products by user
  const start2 = performance.now();
  await prisma.product.findMany({ where: { userId: 1 } });
  const end2 = performance.now();
  console.log(`✅ Find products by user: ${(end2 - start2).toFixed(2)}ms`);

  // Test 3: Create and delete order
  const start3 = performance.now();
  const order = await prisma.order.create({
    data: {
      productId: 1,
      email: 'test@test.com',
      status: 'created',
      amount: 4999,
    },
  });
  await prisma.order.delete({ where: { id: order.id } });
  const end3 = performance.now();
  console.log(`✅ Create + delete order: ${(end3 - start3).toFixed(2)}ms`);

  console.log('\n🎉 Benchmarks complete!');
}

benchmarkQueries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
npx tsx scripts/benchmark-db.ts
```

**Checkpoint 4:** ✅ All tests passing with real database

---

### **Phase 5: Documentation & Handoff (16:00-17:30) - 1.5h**

#### Task 5.1: Create Database Documentation
```markdown
<!-- apps/web/docs/DATABASE.md -->
# Database Setup & Migration Guide

## Overview
NEXUS.SALES uses PostgreSQL with Prisma ORM for type-safe database access.

## Local Development Setup

### 1. Install PostgreSQL
\`\`\`bash
# Windows
choco install postgresql

# Start service
net start postgresql-x64-15
\`\`\`

### 2. Create Database
\`\`\`bash
psql -U postgres
CREATE DATABASE nexus_sales_dev;
\q
\`\`\`

### 3. Configure Environment
\`\`\`bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexus_sales_dev"
\`\`\`

### 4. Run Migrations
\`\`\`bash
cd apps/web
npx prisma migrate dev
npx prisma db seed
\`\`\`

### 5. Open Prisma Studio
\`\`\`bash
npx prisma studio
\`\`\`

## Production Setup (Supabase)

### 1. Create Project
- Go to https://supabase.com
- Create new project
- Copy connection string

### 2. Configure Vercel
\`\`\`bash
# Add to Vercel environment variables:
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
\`\`\`

### 3. Run Production Migration
\`\`\`bash
npx prisma migrate deploy
\`\`\`

## Schema

### Users
- id: Serial primary key
- email: Unique string
- password: Bcrypt hash
- timestamps: created_at, updated_at

### Products
- id: Serial primary key
- user_id: Foreign key to users
- name, description, price
- timestamps

### Orders
- id: UUID primary key
- product_id: Foreign key to products
- email, name, status, amount
- timestamps

## Common Commands

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npm run db:seed

# Open Prisma Studio
npx prisma studio
\`\`\`

## Repository Pattern

All database access goes through repositories:

\`\`\`typescript
import { userRepository } from '@/lib/db/repositories/UserRepository';

const user = await userRepository.findByEmail('test@test.com');
\`\`\`

## Performance Tips

1. Use connection pooling (Supabase provides PgBouncer)
2. Add indexes for frequently queried fields
3. Use \`select\` to fetch only needed fields
4. Use transactions for multi-step operations

## Troubleshooting

### Connection issues
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Test connection: \`npx tsx scripts/test-db-connection.ts\`

### Migration issues
- Reset migrations: \`npx prisma migrate reset\`
- Check migration history: \`npx prisma migrate status\`

### Performance issues
- Run benchmarks: \`npx tsx scripts/benchmark-db.ts\`
- Check slow queries in Prisma logs
- Add missing indexes
\`\`\`

#### Task 5.2: Update .env.example
```bash
# apps/web/.env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_sales_dev"

# Auth
JWT_SECRET_KEY="your-secret-key-min-32-chars"

# Backend
BACKEND_URL="http://localhost:3001"

# AI Services (optional)
HUGGING_FACE_KEY="hf_xxxxx"
OPENAI_API_KEY="sk-xxxxx"
```

#### Task 5.3: Create Migration README
```markdown
<!-- apps/web/prisma/README.md -->
# Database Migrations

This directory contains Prisma schema and migrations.

## Files
- \`schema.prisma\` - Database schema definition
- \`migrations/\` - Migration history
- \`seed.ts\` - Database seeding script

## Create Migration
\`\`\`bash
npx prisma migrate dev --name descriptive_name
\`\`\`

## Apply Migrations (Production)
\`\`\`bash
npx prisma migrate deploy
\`\`\`

## Reset Database (Dev Only)
\`\`\`bash
npx prisma migrate reset
\`\`\`
```

#### Task 5.4: Update Main README
```markdown
<!-- Add to root README.md -->

## Database Setup

### Quick Start
\`\`\`bash
# 1. Install PostgreSQL
choco install postgresql

# 2. Create database
psql -U postgres -c "CREATE DATABASE nexus_sales_dev;"

# 3. Run migrations
cd apps/web
npx prisma migrate dev

# 4. Seed data
npm run db:seed

# 5. Open Prisma Studio
npx prisma studio
\`\`\`

See [apps/web/docs/DATABASE.md](apps/web/docs/DATABASE.md) for full guide.
```

**Checkpoint 5:** ✅ Complete documentation created

---

## ✅ **DAY 2 SUCCESS CHECKLIST**

Copy this checklist and mark as you complete:

```
PostgreSQL Setup:
[ ] PostgreSQL installed locally
[ ] Database created (nexus_sales_dev)
[ ] Supabase project created
[ ] Connection tested (local + production)

Prisma Setup:
[ ] Prisma installed
[ ] Schema created
[ ] Initial migration generated
[ ] Prisma Client generated
[ ] Seed script created

Code Migration:
[ ] Database service layer created (prisma.ts)
[ ] Repository classes created (User, Product, Order)
[ ] Login route updated
[ ] Register route updated
[ ] Products API updated
[ ] Orders API updated (if exists)

Testing:
[ ] Unit tests updated
[ ] Manual testing completed
[ ] Performance benchmarks run
[ ] No regressions found

Documentation:
[ ] DATABASE.md created
[ ] README updated
[ ] .env.example updated
[ ] Migration README created
[ ] Handoff notes written

Deployment:
[ ] Production DATABASE_URL configured
[ ] Migrations applied to production
[ ] Seed data in production
[ ] Monitoring setup (optional)
```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### Problem: Cannot connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
sc query postgresql-x64-15

# If not running, start it
net start postgresql-x64-15

# Test connection
psql -U postgres -c "SELECT version();"
```

### Problem: Prisma migration fails

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# If stuck, reset (dev only!)
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Problem: "Database 'nexus_sales_dev' does not exist"

**Solution:**
```bash
# Create database
psql -U postgres
CREATE DATABASE nexus_sales_dev;
GRANT ALL PRIVILEGES ON DATABASE nexus_sales_dev TO postgres;
\q

# Run migrations again
npx prisma migrate dev
```

### Problem: Slow queries

**Solution:**
```typescript
// Add indexes to schema.prisma
model User {
  email String @unique  // Already indexed

  @@index([email])  // Additional index if needed
}

// Then migrate
npx prisma migrate dev --name add_indexes
```

### Problem: Connection pool exhausted

**Solution:**
```typescript
// Increase pool size in prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10',
    },
  },
});
```

---

## 📞 **SUPPORT & COORDINATION**

### Daily Sync Points:
- **09:00** - Day 2 kickoff (all agents)
- **12:30** - Lunch sync (quick updates)
- **17:30** - EOD demo & handoff

### Your Track: B (Backend)
**Parallel tracks:**
- Track A: Gemini (Frontend features)
- Track C: Qwen (Frontend UI)
- Track D: GPT-5 High (Infrastructure)

**Dependencies:**
- ✅ No blocking dependencies on Day 2
- ⚠️ GPT-5 High needs your DATABASE_URL for Vercel deploy

### Communication Channels:
- **Slack #track-b-backend** - Your updates
- **Slack #day2-sync** - Cross-team coordination
- **Claude Code (Tech Lead)** - Available all day for questions

### When to ask for help:
- PostgreSQL connection issues > 15 minutes
- Migration failures > 30 minutes
- Test failures after migration
- Any blocker > 1 hour

---

## 🎯 **SUCCESS DEFINITION**

**You succeed when:**

1. ✅ **PostgreSQL running** (local + production)
2. ✅ **All mock data migrated** (no data loss)
3. ✅ **Tests passing** (auth, products, orders)
4. ✅ **Performance acceptable** (<50ms for simple queries)
5. ✅ **Documentation complete** (others can replicate)
6. ✅ **Team unblocked** (GPT-5 High can deploy)

**Quality metrics:**
- Zero data loss during migration
- All existing features work
- No performance regressions
- Clean migration history
- Comprehensive documentation

---

## 🔥 **MOTIVATION & CONTEXT**

### Why This Matters:
- **Foundation for scale:** Real database enables growth
- **Data persistence:** Users won't lose their data
- **Production-ready:** Critical step to launch
- **Team enabler:** Unblocks frontend + DevOps

### Your Unique Value:
- **Backend expertise:** You understand data modeling
- **Critical thinking:** You catch edge cases
- **Independence:** You can work parallel to others
- **Quality focus:** You ensure zero data loss

### This Mission Advances:
- ✅ MVP → Production transition
- ✅ Security & reliability
- ✅ Team velocity (unblocks GPT-5 High)
- ✅ Customer confidence (data persists!)

---

## 📦 **DELIVERABLES SUMMARY**

At EOD (17:30), you'll deliver:

1. **Code:**
   - `prisma/schema.prisma` - Schema definition
   - `prisma/migrations/` - Migration files
   - `src/lib/db/prisma.ts` - Database client
   - `src/lib/db/repositories/` - Repository classes
   - Updated API routes (login, register, products)

2. **Documentation:**
   - `docs/DATABASE.md` - Setup & usage guide
   - `prisma/README.md` - Migration guide
   - Updated root README
   - `.env.example` - Environment template

3. **Tests:**
   - Updated unit tests
   - Benchmark results
   - Manual testing checklist

4. **Deployment:**
   - Production DATABASE_URL for Vercel
   - Supabase project ready
   - Seed data in production

---

## 🚀 **LET'S BUILD!**

You have everything you need:
- ✅ Clear plan (5 phases)
- ✅ Code examples (copy-paste ready)
- ✅ Troubleshooting guide
- ✅ Success criteria
- ✅ Support channels

**Your mission is CRITICAL for Day 2 success.**

**Questions before you start?**
- Ask in Slack #track-b-backend
- Or ping Claude Code directly

**Otherwise: START WITH PHASE 1! 🔥**

**Remember:**
- Work independently (no blockers!)
- Sync at 12:30 and 17:30
- Ask for help if stuck > 1 hour
- Document as you go

**YOU GOT THIS! LET'S MAKE DAY 2 LEGENDARY! 🚀🔥**

---

*Briefing created by: Claude Code (Tech Lead)*
*Date: Day 2 Prep*
*Agent: Kimi-k2*
*Track: B (Backend)*
*Mission: PostgreSQL Migration*