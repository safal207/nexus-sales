import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, type VerifyAuthResult } from '../../auth/lib/middleware';
import { products, type MockProduct } from '../../auth/lib/db';

type AuthResult = { error: string; status: number } | { userId: number };

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

async function resolveProductId(context: RouteContext): Promise<number | null> {
  const params = await context.params;
  const productId = Number.parseInt(params.id, 10);
  return Number.isNaN(productId) ? null : productId;
}

function ensureOwnership(product: MockProduct | undefined, userId: number) {
  if (!product || product.userId !== userId) {
    return { error: 'Product not found.', status: 404 } as const;
  }

  return { product } as const;
}

function parseUpdatePayload(payload: unknown): Partial<MockProduct> | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const { name, description, price } = payload as Record<string, unknown>;

  if (name !== undefined && typeof name !== 'string') {
    return null;
  }

  if (description !== undefined && typeof description !== 'string') {
    return null;
  }

  if (price !== undefined && (typeof price !== 'number' || Number.isNaN(price))) {
    return null;
  }

  const result: Partial<MockProduct> = {};

  if (typeof name === 'string') {
    result.name = name;
  }

  if (typeof description === 'string') {
    result.description = description;
  }

  if (typeof price === 'number') {
    result.price = price;
  }

  return result;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const productId = await resolveProductId(context);
  if (productId === null) {
    return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
  }

  const auth = await requireUserId(request);
  if ('error' in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status },
    );
  }

  const ownership = ensureOwnership(products.get(productId), auth.userId);
  if ('error' in ownership) {
    return NextResponse.json(
      { success: false, message: ownership.error },
      { status: ownership.status },
    );
  }

  return NextResponse.json({ success: true, product: ownership.product }, { status: 200 });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const productId = await resolveProductId(context);
  if (productId === null) {
    return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
  }

  const auth = await requireUserId(request);
  if ('error' in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status },
    );
  }

  const ownership = ensureOwnership(products.get(productId), auth.userId);
  if ('error' in ownership) {
    return NextResponse.json(
      { success: false, message: ownership.error },
      { status: ownership.status },
    );
  }

  try {
    const rawBody = (await request.json()) as unknown;
    const update = parseUpdatePayload(rawBody);
    if (!update) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const updatedProduct: MockProduct = {
      ...ownership.product,
      ...update,
    };

    products.set(productId, updatedProduct);

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.warn('[products/:id] invalid request body', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const productId = await resolveProductId(context);
  if (productId === null) {
    return NextResponse.json({ success: false, message: 'Invalid product id.' }, { status: 400 });
  }

  const auth = await requireUserId(request);
  if ('error' in auth) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status },
    );
  }

  const ownership = ensureOwnership(products.get(productId), auth.userId);
  if ('error' in ownership) {
    return NextResponse.json(
      { success: false, message: ownership.error },
      { status: ownership.status },
    );
  }

  products.delete(productId);
  return NextResponse.json({ success: true, message: 'Product deleted successfully.' }, { status: 200 });
}
