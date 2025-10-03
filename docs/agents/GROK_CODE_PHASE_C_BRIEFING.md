# 📧✨ Grok Code - Phase C: Email Service + UX/UI Polish

**Agent:** Grok Code (Fast4 + Codex combined)
**Phase:** C (Features & Polish)
**Priority:** HIGH
**Deadline:** 2-3 days
**Status:** Ready to Start

---

## 🎯 Mission Part 1: Email Service (Day 1)

Implement email notification system using Resend for user registration, order confirmations, and password reset.

## 🎯 Mission Part 2: UX/UI Polish (Day 2-3)

Polish the UI, improve user experience, and optimize performance for production readiness.

---

# PART 1: EMAIL SERVICE (Day 1 - 8 hours)

## 📋 Requirements

### 1. Email Setup (1 hour)
- [ ] Install: `npm install resend react-email @react-email/components`
- [ ] Create `apps/web/src/lib/email.ts`:
```typescript
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY');
}

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### 2. Email Templates (3 hours)

**apps/web/src/emails/WelcomeEmail.tsx**
```tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components';

export default function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f9fc' }}>
        <Container style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', fontSize: '24px' }}>
            Welcome to Nexus Sales, {userName}! 🎉
          </Heading>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Thanks for joining us! You're now ready to create powerful sales funnels and track your revenue.
          </Text>
          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            style={{
              backgroundColor: '#0070f3',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '20px',
            }}
          >
            Go to Dashboard
          </Button>
          <Hr style={{ margin: '30px 0', borderColor: '#e6e6e6' }} />
          <Text style={{ color: '#999', fontSize: '12px' }}>
            Nexus Sales - Sales Funnel Analytics Platform
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

**apps/web/src/emails/OrderConfirmation.tsx**
```tsx
export default function OrderConfirmation({
  orderNumber,
  productName,
  amount,
  customerName,
}: {
  orderNumber: string;
  productName: string;
  amount: number;
  customerName: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f9fc' }}>
        <Container style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', fontSize: '24px' }}>
            Order Confirmation ✓
          </Heading>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Hi {customerName}, your order has been confirmed!
          </Text>
          <Container style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '6px', margin: '20px 0' }}>
            <Text style={{ margin: '5px 0', color: '#333' }}>
              <strong>Order #:</strong> {orderNumber}
            </Text>
            <Text style={{ margin: '5px 0', color: '#333' }}>
              <strong>Product:</strong> {productName}
            </Text>
            <Text style={{ margin: '5px 0', color: '#333' }}>
              <strong>Amount:</strong> ${(amount / 100).toFixed(2)}
            </Text>
          </Container>
          <Text style={{ color: '#666', fontSize: '14px' }}>
            We'll send you another email when your order ships.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

**apps/web/src/emails/PasswordReset.tsx**

### 3. Email Sending API (2 hours)

**apps/web/src/app/api/emails/send/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/email';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import OrderConfirmation from '@/emails/OrderConfirmation';
import PasswordReset from '@/emails/PasswordReset';

export async function POST(request: NextRequest) {
  try {
    const { to, template, data } = await request.json();

    let emailHtml;
    let subject;

    switch (template) {
      case 'welcome':
        emailHtml = render(<WelcomeEmail userName={data.userName} />);
        subject = 'Welcome to Nexus Sales!';
        break;
      case 'order-confirmation':
        emailHtml = render(<OrderConfirmation {...data} />);
        subject = `Order Confirmation #${data.orderNumber}`;
        break;
      case 'password-reset':
        emailHtml = render(<PasswordReset {...data} />);
        subject = 'Reset Your Password';
        break;
      default:
        return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nexus Sales <noreply@nexus-sales.com>',
      to,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: emailData?.id });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 4. Integration (2 hours)

**Update registration to send welcome email:**
`apps/web/src/app/api/auth/register/route.ts` - добавь после создания user:
```typescript
// Send welcome email
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: email,
    template: 'welcome',
    data: { userName: email.split('@')[0] },
  }),
});
```

**Update payment webhook to send order confirmation:**
`apps/web/src/app/api/payments/webhook/route.ts` - добавь в case 'payment_intent.succeeded':
```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: { product: true },
});

await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: order.email,
    template: 'order-confirmation',
    data: {
      orderNumber: order.id,
      productName: order.product.name,
      amount: order.amount,
      customerName: order.name,
    },
  }),
});
```

---

# PART 2: UX/UI POLISH (Day 2-3)

## 📋 Requirements

### 1. Loading States (Day 2 - 2 hours)

**apps/web/src/components/ui/Skeleton.tsx**
```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-32 mt-4" />
    </div>
  );
}
```

Используй скелетоны в:
- [ ] Product list (когда загружаются)
- [ ] Dashboard stats
- [ ] Analytics charts
- [ ] Order history

### 2. Error Handling (Day 2 - 2 hours)

**apps/web/src/components/ui/EmptyState.tsx**
```tsx
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action}
    </div>
  );
}
```

Используй в:
- [ ] No products yet
- [ ] No orders yet
- [ ] No analytics data

### 3. Performance Optimization (Day 2 - 3 hours)

**Dynamic imports для тяжелых компонентов:**
```typescript
const FunnelBuilder = dynamic(() => import('@/components/funnel/FunnelBuilder'), {
  loading: () => <Skeleton className="h-screen" />,
  ssr: false,
});

const AnalyticsCharts = dynamic(() => import('@/components/analytics/Charts'), {
  loading: () => <Skeleton className="h-96" />,
});
```

**Оптимизация изображений:**
- [ ] Замени все `<img>` на `<Image>` из next/image
- [ ] Добавь `sizes` и `priority` где нужно

**Pagination для списков:**
- [ ] Products list (10 per page)
- [ ] Orders list (20 per page)

### 4. Responsive Design (Day 3 - 3 hours)

Проверь и исправь на:
- [ ] Mobile (375px) - все кнопки минимум 44px
- [ ] Tablet (768px)
- [ ] Desktop (1280px)

Особенно:
- [ ] Dashboard layout
- [ ] Payment form
- [ ] Product cards
- [ ] Navigation menu (hamburger на мобиле)

### 5. Micro-interactions (Day 3 - 2 hours)

Добавь анимации:
- [ ] Button hover effects
- [ ] Success checkmark animation при успешной оплате
- [ ] Toast notifications (success, error, info)
- [ ] Modal fade in/out
- [ ] Loading spinner

### 6. Lighthouse Audit (Day 3 - 1 hour)

- [ ] Run `npm run build`
- [ ] Deploy preview
- [ ] Run Lighthouse
- [ ] Fix issues до scores > 90

---

## 🎯 Success Criteria

### Email Service:
- ✅ Welcome email on registration
- ✅ Order confirmation on payment
- ✅ All emails are responsive

### UX/UI:
- ✅ Loading states everywhere
- ✅ Responsive on all devices
- ✅ Lighthouse score > 90
- ✅ Smooth animations

---

## 📝 Environment Variables

```env
# .env.local
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production:
```env
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://nexus-sales-web.vercel.app
```

---

**Day 1: Emails → Day 2-3: UX/UI. Let's go, Grok! 🚀**
