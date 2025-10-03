# 💳 Supernova Code - Phase C: Stripe Payment Integration

**Agent:** Supernova Code (replacing GPT5 High)
**Phase:** C (Features & Polish)
**Priority:** HIGH
**Deadline:** 3-4 days
**Status:** Ready to Start

---

## 🎯 Mission

Integrate Stripe payment processing into Nexus Sales, enabling customers to purchase products directly through the platform with complete payment flow, webhook handling, and transaction tracking.

---

## 📋 Requirements

### 1. Stripe Setup (Day 1 - 2 hours)
- [ ] Install dependencies: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`
- [ ] Create Stripe client utility in `apps/web/src/lib/stripe.ts`:
  ```typescript
  import Stripe from 'stripe';

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  ```

### 2. Database Schema Updates (Day 1 - 2 hours)
- [ ] Add `Payment` model to `apps/web/prisma/schema.prisma`:
  ```prisma
  model Payment {
    id              String   @id @default(cuid())
    orderId         String
    order           Order    @relation(fields: [orderId], references: [id])
    stripePaymentId String   @unique
    amount          Int
    currency        String   @default("usd")
    status          String   // succeeded, pending, failed, refunded
    metadata        Json?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt

    @@index([orderId])
    @@index([stripePaymentId])
  }
  ```
- [ ] Update `Order` model to add payments relation:
  ```prisma
  model Order {
    // ... existing fields
    payments Payment[]
  }
  ```
- [ ] Run migration:
  ```bash
  cd apps/web
  npx prisma migrate dev --name add-payments
  npx prisma generate
  ```

### 3. Payment API Routes (Day 1-2 - 6 hours)

**apps/web/src/app/api/payments/create-intent/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/app/api/auth/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, customerEmail, customerName } = body;

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        productId: product.id,
        email: customerEmail,
        name: customerName,
        amount: product.price,
        status: 'created',
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        productId: product.id,
        userId: auth.userId.toString(),
      },
    });

    // Save payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentId: paymentIntent.id,
        amount: product.price,
        currency: 'usd',
        status: 'pending',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      paymentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
```

**apps/web/src/app/api/payments/webhook/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        // Update payment status
        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'succeeded' },
        });

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'paid' },
        });

        console.log(`Payment succeeded for order ${orderId}`);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        await prisma.payment.updateMany({
          where: { stripePaymentId: failedIntent.id },
          data: { status: 'failed' },
        });
        await prisma.order.update({
          where: { id: failedIntent.metadata.orderId },
          data: { status: 'cancelled' },
        });
        break;

      case 'charge.refunded':
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntentId as string },
          data: { status: 'refunded' },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
```

**apps/web/src/app/api/payments/[id]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/app/api/auth/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = verifyToken(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  return NextResponse.json(payment);
}
```

### 4. Frontend Payment Component (Day 2 - 4 hours)

**apps/web/src/components/payments/PaymentForm.tsx**
```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function PaymentForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm orderId={orderId} />
    </Elements>
  );
}
```

### 5. Checkout Page (Day 2 - 2 hours)

**apps/web/src/app/checkout/[productId]/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PaymentForm from '@/components/payments/PaymentForm';

export default function CheckoutPage() {
  const params = useParams();
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'info' | 'payment'>('info');

  const handleCreatePaymentIntent = async () => {
    const res = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: params.productId,
        customerEmail: email,
        customerName: name,
      }),
    });

    const data = await res.json();
    setClientSecret(data.clientSecret);
    setOrderId(data.orderId);
    setStep('payment');
  };

  if (step === 'info') {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <button
            onClick={handleCreatePaymentIntent}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>
      {clientSecret && <PaymentForm clientSecret={clientSecret} orderId={orderId} />}
    </div>
  );
}
```

### 6. Payment Success Page (Day 2 - 1 hour)

**apps/web/src/app/payment/success/page.tsx**

### 7. Payment Analytics Dashboard (Day 3 - 4 hours)

**apps/web/src/app/dashboard/payments/page.tsx**

### 8. Testing (Day 4 - 4 hours)
- [ ] Unit tests for payment API routes
- [ ] Webhook testing with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/payments/webhook
  stripe trigger payment_intent.succeeded
  ```
- [ ] E2E test for checkout flow
- [ ] Test with Stripe test cards

---

## 🎯 Success Criteria

- ✅ Users can purchase products with credit card
- ✅ Webhooks update order status automatically
- ✅ Payment analytics dashboard works
- ✅ All payment flows tested
- ✅ Test mode works with Stripe test cards

---

## 📝 Environment Variables

```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚨 Critical Notes

1. **Security:** Never expose STRIPE_SECRET_KEY to frontend
2. **Webhooks:** MUST verify signature
3. **Amounts:** Always in cents (100 = $1.00)
4. **Testing:** Use test mode for development

---

**Let's do this, Supernova! 💰**
