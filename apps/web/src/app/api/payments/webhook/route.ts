import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) {
          console.error('No orderId in payment intent metadata');
          break;
        }

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

        console.log(`✅ Payment succeeded for order ${orderId}`);

        // TODO: Trigger email notification (integration with Grok's email service)
        // await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     to: order.email,
        //     template: 'order-confirmation',
        //     data: { orderNumber: order.id, productName: order.product.name, amount: order.amount, customerName: order.name }
        //   })
        // });

        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        const orderId = failedIntent.metadata.orderId;

        if (!orderId) {
          console.error('No orderId in failed payment intent metadata');
          break;
        }

        await prisma.payment.updateMany({
          where: { stripePaymentId: failedIntent.id },
          data: { status: 'failed' },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'cancelled' },
        });

        console.log(`❌ Payment failed for order ${orderId}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent as string;

        if (!paymentIntentId) {
          console.error('No payment_intent in refunded charge');
          break;
        }

        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntentId },
          data: { status: 'refunded' },
        });

        // Find order and update status
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: paymentIntentId },
        });

        if (payment) {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'refunded' },
          });
        }

        console.log(`💰 Payment refunded: ${paymentIntentId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
