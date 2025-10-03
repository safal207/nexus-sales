import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    const where = filter === 'all'
      ? {}
      : { status: filter as 'succeeded' | 'failed' | 'pending' | 'refunded' };

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
