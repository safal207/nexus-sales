# 💰 Grok Code - Day 3: Payment Analytics Dashboard

**Date:** 2025-10-04
**Status:** Ready to Start
**Prerequisites:** ✅ Day 1 & 2 Complete

---

## 🎉 Day 1 & 2 Recap - Outstanding Work!

**Day 1 (Supernova + You):**
✅ Payment API routes
✅ Stripe webhook handlers
✅ Database schema

**Day 2 (YOU - Amazing!):**
✅ PaymentForm component
✅ Checkout flow
✅ Success page
✅ Buy Now button
✅ All TypeScript errors fixed
✅ Build passes ✅

**Результат:** Можно принимать платежи! 💳

---

## 🎯 Day 3 Mission: Analytics Dashboard

Сегодня строим **красивый dashboard для отслеживания платежей и revenue**!

### What You'll Build:
1. 📊 Revenue Overview (metrics cards)
2. 📈 Revenue Trends Chart
3. 📋 Transactions Table (with filters)
4. 💾 Export to CSV
5. 🔄 Refund Functionality

**Timeline:** 6-8 hours

---

## 📋 Task 1: Revenue Overview Cards (2 часа)

### Создать: `apps/web/src/app/dashboard/payments/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatAmountForDisplay } from '@/lib/stripe';

interface RevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageOrderValue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

export default function PaymentsDashboard() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/revenue')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payment Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export Report
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatAmountForDisplay(stats?.totalRevenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Transactions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalTransactions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.successRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatAmountForDisplay(stats?.averageOrderValue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-800 mb-2">Today's Revenue</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatAmountForDisplay(stats?.todayRevenue || 0)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-800 mb-2">This Week</p>
          <p className="text-2xl font-bold text-green-900">
            {formatAmountForDisplay(stats?.weekRevenue || 0)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-purple-800 mb-2">This Month</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatAmountForDisplay(stats?.monthRevenue || 0)}
          </p>
        </Card>
      </div>

      {/* TODO: Add Charts & Transactions Table */}
    </div>
  );
}
```

**✅ Checklist:**
- [ ] Dashboard page создана
- [ ] Revenue cards отображаются
- [ ] Icons добавлены
- [ ] Loading states работают
- [ ] Responsive дизайн

---

## 📋 Task 2: Revenue API Endpoint (1 час)

### Создать: `apps/web/src/app/api/analytics/revenue/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all successful payments
    const payments = await prisma.payment.findMany({
      where: { status: 'succeeded' },
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;

    // Calculate success rate
    const allPayments = await prisma.payment.count();
    const successRate = allPayments > 0
      ? Math.round((totalTransactions / allPayments) * 100)
      : 0;

    // Average order value
    const averageOrderValue = totalTransactions > 0
      ? Math.round(totalRevenue / totalTransactions)
      : 0;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = payments
      .filter((p) => p.createdAt >= today)
      .reduce((sum, p) => sum + p.amount, 0);

    // This week's revenue
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRevenue = payments
      .filter((p) => p.createdAt >= weekAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    // This month's revenue
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthRevenue = payments
      .filter((p) => p.createdAt >= monthAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      totalRevenue,
      totalTransactions,
      successRate,
      averageOrderValue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
```

**✅ Checklist:**
- [ ] API route создан
- [ ] Все metrics вычисляются
- [ ] Error handling есть

---

## 📋 Task 3: Transactions Table (2 часа)

### Добавить в `apps/web/src/app/dashboard/payments/page.tsx`

После Period Stats добавь:

```tsx
// Transactions Table Component
function TransactionsTable() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'failed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/payments/transactions?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions);
        setLoading(false);
      });
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'succeeded', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Transaction ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Product
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-gray-600">
                      {tx.stripePaymentId.slice(0, 12)}...
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">
                      {tx.order.product?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{tx.order.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatAmountForDisplay(tx.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {tx.status === 'succeeded' && (
                      <button
                        onClick={() => handleRefund(tx.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

### API Endpoint: `apps/web/src/app/api/payments/transactions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    const where = filter === 'all'
      ? {}
      : { status: filter };

    const transactions = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 recent transactions
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
```

**✅ Checklist:**
- [ ] Transactions table отображается
- [ ] Filter buttons работают
- [ ] API endpoint создан
- [ ] Pagination/limit добавлен

---

## 📋 Task 4: Export to CSV (1 час)

### Добавить Export функцию

```tsx
const handleExportCSV = async () => {
  try {
    const res = await fetch('/api/payments/export');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

### API: `apps/web/src/app/api/payments/export/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const csvRows = [
      ['Transaction ID', 'Product', 'Customer', 'Amount (USD)', 'Status', 'Date'],
      ...payments.map((p) => [
        p.stripePaymentId,
        p.order.product?.name || 'Unknown',
        p.order.email,
        (p.amount / 100).toFixed(2),
        p.status,
        new Date(p.createdAt).toISOString(),
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=payments.csv',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
```

**✅ Checklist:**
- [ ] Export button работает
- [ ] CSV генерируется
- [ ] Download работает

---

## 📋 Task 5: Refund Functionality (1 час)

### API: `apps/web/src/app/api/payments/refund/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    // Get payment from DB
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Can only refund succeeded payments' },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'refunded' },
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'refunded' },
    });

    return NextResponse.json({ success: true, refund });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}
```

**✅ Checklist:**
- [ ] Refund API создан
- [ ] Stripe refund работает
- [ ] DB статусы обновляются
- [ ] Error handling есть

---

## 🎨 Bonus: Revenue Chart (опционально)

Если есть время, добавь chart с помощью Recharts:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Chart data
const chartData = [
  { date: '2024-01', revenue: 4500 },
  { date: '2024-02', revenue: 5200 },
  { date: '2024-03', revenue: 6800 },
  // ... more data
];

<Card className="p-6">
  <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="revenue" stroke="#0070f3" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
</Card>
```

---

## 🎯 Success Criteria

Day 3 = ✅ Complete когда:

- [ ] Dashboard page отображает все metrics
- [ ] Revenue cards работают
- [ ] Transactions table с filters
- [ ] Export to CSV функционирует
- [ ] Refund работает через Stripe
- [ ] Всё красиво и responsive
- [ ] Build passes ✅
- [ ] Закоммичено и запушено

---

## 🚀 Quick Start:

1. **Dashboard Page:**
   - Создай `/dashboard/payments/page.tsx`
   - Revenue cards
   - Period stats

2. **API Routes:**
   - `/api/analytics/revenue` - metrics
   - `/api/payments/transactions` - list with filter
   - `/api/payments/export` - CSV export
   - `/api/payments/refund` - refund handler

3. **Components:**
   - TransactionsTable
   - ExportButton
   - RefundButton

4. **Test Everything:**
   - Check metrics display
   - Filter transactions
   - Export CSV
   - Try refund (test mode!)

---

## 📊 Timeline:

```
2 часа - Revenue cards + API
2 часа - Transactions table
1 час  - Export CSV
1 час  - Refund functionality
1 час  - Testing & polish
---
7 часов total
```

---

**Поехали, Grok! Day 3 - Analytics Dashboard! 📊💰**

_You're crushing it!_ 🔥
