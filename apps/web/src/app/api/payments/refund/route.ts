import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
