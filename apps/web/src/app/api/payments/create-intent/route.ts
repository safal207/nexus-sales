import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

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

    const { productId, amount } = await request.json();

    if (!productId || !amount) {
      return NextResponse.json(
        { error: 'Product ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // CRITICAL: Validate amount matches product price
    if (amount !== product.price) {
      return NextResponse.json(
        { error: 'Amount mismatch: price has been tampered with' },
        { status: 400 }
      );
    }

    // Create order first
    const order = await prisma.order.create({
      data: {
        productId: product.id,
        email: user.email!,
        name: user.email!, // In a real app, get from user profile
        status: 'created',
        amount: amount,
      },
    });

    // Create Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Create Stripe Payment Intent with idempotency key
    const idempotencyKey = `order-${order.id}-${Date.now()}`;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price, // Use verified product price, not client amount
      currency: 'usd',
      metadata: {
        orderId: order.id,
        productId: product.id.toString(),
      },
    }, {
      idempotencyKey,
    });

    // Create payment record with Stripe payment ID
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentId: paymentIntent.id,
        amount: amount,
        currency: 'usd',
        status: 'pending',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}