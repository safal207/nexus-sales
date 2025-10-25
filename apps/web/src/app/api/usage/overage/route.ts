import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateWithEcoId } from '../_lib/auth';
import { getStripeServerClient } from '@/lib/stripe-server';
import { OverageService } from '@repo/billing';

export async function GET(req: NextRequest) {
  const auth = await authenticateWithEcoId(req);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const stripe = getStripeServerClient();
    const service = new OverageService(stripe, prisma);
    const summary = await service.getOverageSummary(auth.ecoId);

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('[usage/overage] Failed to load overage summary', error);
    return NextResponse.json({ success: false, message: 'Failed to load overage summary.' }, { status: 500 });
  }
}
