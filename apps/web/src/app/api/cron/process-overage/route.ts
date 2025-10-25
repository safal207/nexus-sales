import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getStripeServerClient } from '@/lib/stripe-server';
import { OverageService } from '@repo/billing';

function extractCronSecret(req: NextRequest): string | null {
  const header = req.headers.get('x-cron-secret');
  if (header) {
    return header;
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  return token || null;
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron/process-overage] CRON_SECRET environment variable is not set.');
    return NextResponse.json({ success: false, message: 'Server misconfigured' }, { status: 500 });
  }

  const providedSecret = extractCronSecret(req);
  if (!providedSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stripe = getStripeServerClient();
    const service = new OverageService(stripe, prisma);
    const result = await service.processMonthlyOverage(new Date());

    return NextResponse.json({ success: true, processed: result.processed, charges: result.charges });
  } catch (error) {
    console.error('[cron/process-overage] Failed to process overage', error);
    return NextResponse.json({ success: false, message: 'Failed to process overage charges' }, { status: 500 });
  }
}
