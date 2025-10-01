# Database Schema - NEXUS.SALES

This document captures the relational data model for Fire 3 (Core Engine). The schema targets PostgreSQL 14+ with JSONB support and the `pgcrypto` extension (for `gen_random_uuid()`).

## 1. Tables

### 1.1 users
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login / contact |
| password_hash | VARCHAR(255) | NOT NULL | Password hash (bcrypt/argon2) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update |

Indexes:
- users_email_idx on email.

### 1.2 products
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | PK, DEFAULT gen_random_uuid() | Product identifier |
| user_id | UUID | FK -> users(id), ON DELETE CASCADE | Owner |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT |  | Description |
| price | INTEGER | NOT NULL, CHECK (price >= 0) | Price in cents |
| active | BOOLEAN | DEFAULT true | Visibility flag |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Updated |

Indexes:
- products_user_id_idx on user_id.
- products_active_idx on active.

### 1.3 orders
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | PK, DEFAULT gen_random_uuid() | Order identifier |
| product_id | UUID | FK -> products(id) | Related product |
| email | VARCHAR(255) | NOT NULL | Buyer email |
| name | VARCHAR(255) |  | Buyer name |
| status | VARCHAR(50) | NOT NULL, CHECK (status IN ('created','processing','paid','refunded','cancelled')) | Lifecycle state |
| amount | INTEGER | NOT NULL, CHECK (amount >= 0) | Amount in cents |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Created |

Indexes:
- orders_email_idx on email.
- orders_status_idx on status.
- orders_created_at_idx on created_at.

### 1.4 funnels
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | PK, DEFAULT gen_random_uuid() | Funnel identifier |
| user_id | UUID | FK -> users(id), ON DELETE CASCADE | Owner |
| name | VARCHAR(255) | NOT NULL | Funnel name |
| config | JSONB | NOT NULL | Serialized funnel configuration |
| published | BOOLEAN | DEFAULT false | Publish flag |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Updated |

Indexes:
- funnels_user_id_idx on user_id.
- funnels_published_idx on published.

### 1.5 emotions
| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | UUID | PK, DEFAULT gen_random_uuid() | Emotion record |
| user_id | UUID | FK -> users(id), ON DELETE SET NULL | Optional user |
| funnel_id | UUID | FK -> funnels(id), ON DELETE CASCADE | Related funnel |
| session_id | VARCHAR(255) | NOT NULL | Session identifier |
| emotion_type | VARCHAR(50) | NOT NULL, CHECK (emotion_type IN ('joy','sadness','fear','anger','surprise','disgust','neutral')) | Emotion label |
| intensity | DECIMAL(3,2) | NOT NULL, CHECK (intensity BETWEEN 0 AND 1) | Model intensity |
| confidence | DECIMAL(3,2) | NOT NULL, CHECK (confidence BETWEEN 0 AND 1) | Model confidence |
| context | JSONB |  | Extra metadata |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Captured at |

Indexes:
- emotions_funnel_id_idx on funnel_id.
- emotions_session_id_idx on session_id.
- emotions_created_at_idx on created_at.
- emotions_emotion_type_idx on emotion_type.

## 2. Relationships
- users 1:N products (cascade delete keeps catalog consistent).
- products 1:N orders.
- users 1:N funnels.
- funnels 1:N emotions (strict); deleting a funnel removes dependent emotion rows.
- users 1:N emotions (optional via nullable user_id).

Text ERD:
```
users (1) --< products (N)
   |
   |      +--< orders (N)
   +--< funnels (N) --< emotions (N)
              (user_id nullable)
```

## 3. Environment Requirements
- PostgreSQL 14+.
- Extension pgcrypto enabled for gen_random_uuid().
- Wrap DDL changes in transactions for atomic up/down.

## 4. Next Steps
1. Implement migrations via node-pg-migrate.
2. Configure pg Pool, health check, and unit test.
3. Seed baseline data (test@test.com, demo products).
4. Update API layer to use PostgreSQL (separate Day 2 task).

