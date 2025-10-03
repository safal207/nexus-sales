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

    if (!productId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
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
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        productId: product.id.toString(),
        userId: auth.userId.toString(),
      },
    });

    // Save payment record
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
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
