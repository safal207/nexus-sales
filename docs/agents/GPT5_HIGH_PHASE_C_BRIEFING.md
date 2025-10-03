# 💳 GPT5 High - Phase C: Stripe Payment Integration

**Agent:** GPT5 High
**Phase:** C (Features & Polish)
**Priority:** HIGH
**Deadline:** 3-4 days
**Status:** Ready to Start

---

## 🎯 Mission

Integrate Stripe payment processing into Nexus Sales, enabling customers to purchase products directly through the platform with complete payment flow, webhook handling, and transaction tracking.

---

## 📋 Requirements

### 1. Stripe Setup (Day 1)
- [ ] Create Stripe account configuration guide
- [ ] Set up environment variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] Install dependencies: `stripe` package
- [ ] Create Stripe client utility in `apps/web/src/lib/stripe.ts`

### 2. Database Schema Updates (Day 1)
- [ ] Add `Payment` model to Prisma schema:
  ```prisma
  model Payment {
    id              String   @id @default(cuid())
    orderId         String
    order           Order    @relation(fields: [orderId], references: [id])
    stripePaymentId String   @unique
    amount          Int
    currency        String   @default("usd")
    status          String   // succeeded, pending, failed, refunded
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
  }
  ```
- [ ] Add `payments` relation to Order model
- [ ] Run migration: `npx prisma migrate dev --name add-payments`

### 3. Payment API Routes (Day 2)
Create in `apps/web/src/app/api/payments/`:

**POST /api/payments/create-intent**
- [ ] Accept: `{ orderId, amount, currency? }`
- [ ] Validate user owns the product associated with order
- [ ] Create Stripe Payment Intent
- [ ] Save payment record to database
- [ ] Return: `{ clientSecret, paymentId }`

**POST /api/payments/webhook**
- [ ] Verify Stripe webhook signature
- [ ] Handle events:
  - `payment_intent.succeeded` → Update order status to 'paid'
  - `payment_intent.payment_failed` → Update order status to 'failed'
  - `charge.refunded` → Update order status to 'refunded'
- [ ] Log all webhook events
- [ ] Return 200 OK to Stripe

**GET /api/payments/[id]**
- [ ] Fetch payment details by ID
- [ ] Include order and product information
- [ ] Require authentication

### 4. Frontend Payment Component (Day 2-3)
Create in `apps/web/src/components/payments/`:

**PaymentForm.tsx**
- [ ] Use Stripe Elements for card input
- [ ] Handle payment submission
- [ ] Show loading states
- [ ] Display payment errors
- [ ] Redirect to success page on completion

**PaymentSuccess.tsx**
- [ ] Display order confirmation
- [ ] Show payment details
- [ ] Email receipt (integrate with Phase C email service)

### 5. Integration with Products (Day 3)
- [ ] Add "Buy Now" button to product pages
- [ ] Create checkout flow:
  1. User clicks "Buy Now"
  2. Create order in database
  3. Redirect to payment page
  4. Process payment
  5. Update order status
  6. Show confirmation

### 6. Payment Analytics Dashboard (Day 3-4)
Create in `apps/web/src/app/dashboard/payments/`:

**Revenue Overview:**
- [ ] Total revenue (all time, this month, this week)
- [ ] Revenue by product
- [ ] Revenue trends chart (Chart.js/Recharts)
- [ ] Payment success rate

**Transaction List:**
- [ ] Table of all payments
- [ ] Filter by status, date range, product
- [ ] Export to CSV
- [ ] Refund functionality

### 7. Testing (Day 4)
- [ ] Unit tests for payment API routes
- [ ] Integration tests for payment flow
- [ ] Webhook testing with Stripe CLI
- [ ] E2E test for complete purchase flow
- [ ] Test refund process

---

## 🛠 Technical Stack

- **Payment Processor:** Stripe
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Prisma)
- **Frontend:** React + Stripe Elements
- **Testing:** Jest + Playwright

---

## 📁 Files to Create

```
apps/web/
├── src/
│   ├── lib/
│   │   └── stripe.ts                           # Stripe client
│   ├── app/
│   │   ├── api/
│   │   │   └── payments/
│   │   │       ├── create-intent/
│   │   │       │   └── route.ts
│   │   │       ├── webhook/
│   │   │       │   └── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   └── dashboard/
│   │       └── payments/
│   │           └── page.tsx
│   ├── components/
│   │   └── payments/
│   │       ├── PaymentForm.tsx
│   │       ├── PaymentSuccess.tsx
│   │       └── RevenueChart.tsx
│   └── utils/
│       └── stripe-helpers.ts
├── prisma/
│   └── migrations/
│       └── XXX_add_payments/
│           └── migration.sql
└── tests/
    └── api/
        ├── payments-create-intent.route.test.ts
        ├── payments-webhook.route.test.ts
        └── payments-integration.test.ts
```

---

## 🔗 Dependencies

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0"
  }
}
```

---

## 🎯 Success Criteria

- ✅ Users can purchase products with credit card
- ✅ Payments are processed securely through Stripe
- ✅ Webhooks update order status automatically
- ✅ Payment analytics dashboard shows revenue metrics
- ✅ All payment flows are covered by tests
- ✅ Refunds can be processed from dashboard
- ✅ Test mode works with Stripe test cards

---

## 📝 Environment Variables

Add to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Add to Vercel production:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚨 Important Notes

1. **Security:** Never expose secret keys to frontend
2. **Webhooks:** Must verify signature on every webhook
3. **Idempotency:** Handle duplicate webhook events
4. **Testing:** Use Stripe test mode for all development
5. **Currency:** Default to USD, but support multiple currencies
6. **Amounts:** Store in cents (100 = $1.00)

---

## 📊 Reporting

Update `AGENT_STATUS.md` daily with:
- Tasks completed
- Current blockers
- Integration points with other agents
- Test coverage for payment features

---

## 🤝 Integration Points

- **Email Service (Grok):** Send payment receipts
- **UX Polish (Codex):** Payment UI/UX review
- **Documentation (Qwen):** Payment API documentation

---

**Good luck, GPT5! Let's make payments smooth! 💰**
