import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all successful payments
    const payments = await prisma.payment.findMany({
      where: { status: 'succeeded' },
      include: {
        order: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;

    // Calculate success rate
    const allPayments = await prisma.payment.count();
    const successRate = allPayments > 0
      ? Math.round((totalTransactions / allPayments) * 100)
      : 0;

    // Average order value
    const averageOrderValue = totalTransactions > 0
      ? Math.round(totalRevenue / totalTransactions)
      : 0;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = payments
      .filter((p) => p.createdAt >= today)
      .reduce((sum, p) => sum + p.amount, 0);

    // This week's revenue
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRevenue = payments
      .filter((p) => p.createdAt >= weekAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    // This month's revenue
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthRevenue = payments
      .filter((p) => p.createdAt >= monthAgo)
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      totalRevenue,
      totalTransactions,
      successRate,
      averageOrderValue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
