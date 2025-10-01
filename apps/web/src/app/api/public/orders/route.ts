import { NextRequest, NextResponse } from 'next/server';
import { products, orders, type MockOrder } from '../../auth/lib/db';

interface CreateOrderInput {
  productId: number;
  email: string;
  name: string | null;
}

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string | undefined): boolean {
  if (!ip) {
    return false;
  }

  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_COUNT) {
    return true;
  }

  record.count += 1;
  return false;
}

function parseOrderPayload(payload: unknown): CreateOrderInput | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const { productId, email, name } = payload as Record<string, unknown>;

  if (typeof email !== 'string' || email.length === 0) {
    return null;
  }

  const numericProductId = typeof productId === 'number'
    ? productId
    : typeof productId === 'string'
      ? Number.parseInt(productId, 10)
      : Number.NaN;

  if (Number.isNaN(numericProductId)) {
    return null;
  }

  if (name !== undefined && name !== null && typeof name !== 'string') {
    return null;
  }

  return {
    productId: numericProductId,
    email,
    name: typeof name === 'string' ? name : null,
  };
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';

  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
  }

  try {
    const rawBody = (await request.json()) as unknown;
    const payload = parseOrderPayload(rawBody);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Product ID and email are required.' },
        { status: 400 },
      );
    }

    const product = products.get(payload.productId);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const newId = orders.size + 1;
    const { productId, email, name } = payload;

    const newOrder: MockOrder = {
      id: `ord_${newId}_${Date.now()}`,
      productId,
      email,
      name,
      status: 'created',
      createdAt: new Date().toISOString(),
      amount: product.price,
    };

    orders.set(newId, newOrder);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.warn('[public/orders] invalid request body', error);
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }
}
