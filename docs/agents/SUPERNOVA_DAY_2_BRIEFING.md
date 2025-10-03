# 💳 Supernova Code - Day 2: Payment UI & Checkout Flow

**Date:** 2025-10-04
**Status:** Ready to Start
**Prerequisites:** ✅ Day 1 Complete (API Routes Done)

---

## 🎉 Day 1 Recap - Что уже сделано:

✅ Stripe клиент настроен (`src/lib/stripe.ts`)
✅ Payment модель в БД с миграцией
✅ 3 API routes работают:
  - `/api/payments/create-intent` - создание платежа
  - `/api/payments/webhook` - обработка Stripe events
  - `/api/payments/[id]` - получение payment info

**Код на GitHub:** Всё закоммичено и запушено!

---

## 🎯 Day 2 Mission: Frontend Payment Components

Сегодня создаём **UI для приёма платежей**:
1. PaymentForm компонент (Stripe Elements)
2. Checkout страница
3. Payment Success страница
4. Интеграция с Products

**Timeline:** 6-8 часов работы

---

## 📋 Task 1: PaymentForm Component (2 часа)

### Создать: `apps/web/src/components/payments/PaymentForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Checkout Form Component
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Powered by Stripe • Your payment is secure and encrypted
      </p>
    </form>
  );
}

// Main PaymentForm Component
export default function PaymentForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string;
}) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0070f3',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm orderId={orderId} />
    </Elements>
  );
}
```

**✅ Checklist:**
- [ ] Файл создан
- [ ] Stripe Elements интегрированы
- [ ] Loading states работают
- [ ] Error handling есть
- [ ] UI красивый и понятный

---

## 📋 Task 2: Checkout Page (2 часа)

### Создать: `apps/web/src/app/checkout/[productId]/page.tsx`

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PaymentForm from '@/components/payments/PaymentForm';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load product
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product');
        setLoading(false);
      });
  }, [productId]);

  const handleCreatePaymentIntent = async () => {
    if (!email || !name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerEmail: email,
          customerName: name,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep('payment');
    } catch (err) {
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Info */}
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Checkout
              </h1>
              <p className="text-gray-600">{product?.name}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${((product?.price || 0) / 100).toFixed(2)}
              </p>
            </div>

            {/* Customer Info Form */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCreatePaymentIntent}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => setStep('info')}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Back to information
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Complete Payment
            </h2>
            <p className="text-gray-600 mt-1">
              {product?.name} - ${((product?.price || 0) / 100).toFixed(2)}
            </p>
          </div>

          {clientSecret && (
            <PaymentForm clientSecret={clientSecret} orderId={orderId} />
          )}
        </div>
      </div>
    </div>
  );
}
```

**✅ Checklist:**
- [ ] Checkout page создана
- [ ] Product info показывается
- [ ] Customer info форма работает
- [ ] Integration с /api/payments/create-intent
- [ ] PaymentForm интегрирован
- [ ] Loading states везде
- [ ] Error handling есть

---

## 📋 Task 3: Payment Success Page (1 час)

### Создать: `apps/web/src/app/payment/success/page.tsx`

```tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Fetch order details
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 p-8 text-center border-b border-green-100">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. We've sent a confirmation email.
            </p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-mono font-semibold">
                  {orderId?.slice(0, 8).toUpperCase()}
                </span>
              </div>
              {order && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-semibold">
                      {order.product?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600">
                      ${(order.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                      {order.status}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 text-center transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/products"
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 text-center transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
```

**✅ Checklist:**
- [ ] Success page создана
- [ ] Order details показываются
- [ ] Success animation/icon есть
- [ ] Links to dashboard и products
- [ ] Suspense boundary для useSearchParams

---

## 📋 Task 4: Product Integration (1-2 часа)

### Обновить: `apps/web/src/app/products/[id]/page.tsx`

Добавь "Buy Now" кнопку на страницу продукта:

```tsx
// Внутри компонента страницы продукта
<Link
  href={`/checkout/${product.id}`}
  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
>
  Buy Now - ${(product.price / 100).toFixed(2)}
</Link>
```

**✅ Checklist:**
- [ ] Buy Now кнопка добавлена
- [ ] Link на /checkout/[productId]
- [ ] Цена отображается корректно

---

## 📋 Task 5: Order API Route (опционально, 30 мин)

Если нет `/api/orders/[id]` route, создай:

### `apps/web/src/app/api/orders/[id]/route.ts`

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      product: true,
      payments: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}
```

---

## 🧪 Testing Checklist

После завершения протестируй полный flow:

1. **Test Card:** `4242 4242 4242 4242`
2. **Flow:**
   ```
   Products → Click "Buy Now"
   → Fill email/name
   → Continue to Payment
   → Enter card 4242...
   → Submit payment
   → Redirect to success page
   → See order details
   ```

3. **Check:**
   - [ ] Order создаётся в БД
   - [ ] Payment Intent создаётся в Stripe
   - [ ] Payment record создаётся
   - [ ] Webhook обновляет статус на 'paid'
   - [ ] Success page показывает правильные данные

---

## 🎯 Success Criteria

Day 2 считается завершённым когда:

✅ PaymentForm компонент работает
✅ Checkout flow полностью функционален
✅ Success page показывает order details
✅ Можно купить продукт от начала до конца
✅ Test card payment работает
✅ Всё закоммичено и запушено

---

## 📝 Environment Variables Reminder

Не забудь установить в `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_... (для Day 3)
```

Get from: https://dashboard.stripe.com/test/apikeys

---

## 🚀 Ready to Code!

**Структура:**
```
apps/web/src/
├── components/payments/
│   └── PaymentForm.tsx          ← NEW
├── app/
│   ├── checkout/[productId]/
│   │   └── page.tsx              ← NEW
│   ├── payment/success/
│   │   └── page.tsx              ← NEW
│   └── api/orders/[id]/
│       └── route.ts              ← NEW (if needed)
```

**Timeline:** 6-8 часов

**When Done:**
```bash
git add -A
git commit -m "Phase C Day 2: Payment UI & Checkout Flow Complete"
git push origin master
```

**Поехали, Supernova! 💪💳**
