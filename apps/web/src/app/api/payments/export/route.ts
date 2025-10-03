import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const csvRows = [
      ['Transaction ID', 'Product', 'Customer', 'Amount (USD)', 'Status', 'Date'],
      ...payments.map((p) => [
        p.stripePaymentId,
        p.order.product?.name || 'Unknown',
        p.order.email,
        (p.amount / 100).toFixed(2),
        p.status,
        new Date(p.createdAt).toISOString(),
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=payments.csv',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
