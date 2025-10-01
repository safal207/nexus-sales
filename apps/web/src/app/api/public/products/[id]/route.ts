import { NextRequest, NextResponse } from 'next/server';
import { products } from '../../../auth/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function resolveProductId(context: RouteContext): Promise<number | null> {
  const params = await context.params;
  const productId = Number.parseInt(params.id, 10);
  return Number.isNaN(productId) ? null : productId;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const productId = await resolveProductId(context);
    if (productId === null) {
      return NextResponse.json({ success: false, message: 'Invalid product ID.' }, { status: 400 });
    }

    const product = products.get(productId);

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const publicProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
    };

    return NextResponse.json({ success: true, product: publicProduct }, { status: 200 });
  } catch (error) {
    console.warn(
      '[public/products/:id] unable to resolve product',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ success: false, message: 'Invalid product ID.' }, { status: 400 });
  }
}