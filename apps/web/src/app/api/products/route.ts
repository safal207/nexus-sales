import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, type VerifyAuthResult } from '../auth/lib/middleware';
import { productRepository } from '@/lib/db/repositories/ProductRepository';

type AuthResult = { error: string; status: number } | { userId: number };

async function requireUserId(request: NextRequest): Promise<AuthResult> {
  const auth: VerifyAuthResult = await verifyAuth(request);

  if (!auth.ok) {
    return { error: auth.error, status: auth.status };
  }

  const userId = (auth.user as { id?: unknown }).id;

  if (typeof userId !== 'number') {
    return { error: 'Authenticated user is missing an id.', status: 403 };
  }

  return { userId };
}

interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
}

function parseCreatePayload(payload: unknown): CreateProductPayload | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const { name, description, price } = payload as Record<string, unknown>;

  if (typeof name !== 'string' || name.length === 0) {
    return null;
  }

  if (typeof price !== 'number' || Number.isNaN(price)) {
    return null;
  }

  if (description !== undefined && typeof description !== 'string') {
    return null;
  }

  return {
    name,
    description: description as string | undefined,
    price,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireUserId(request);

  if ('error' in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status },
    );
  }

  const userProducts = await productRepository.findByUserId(auth.userId);

  return NextResponse.json({ success: true, products: userProducts }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = await requireUserId(request);

  if ('error' in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status },
    );
  }

  try {
    const rawBody = (await request.json()) as unknown;
    const payload = parseCreatePayload(rawBody);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Name and price are required.' },
        { status: 400 },
      );
    }

    const newProduct = await productRepository.create({
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price,
      user: {
        connect: { id: auth.userId },
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.warn('[products] invalid request body', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 },
    );
  }
}
