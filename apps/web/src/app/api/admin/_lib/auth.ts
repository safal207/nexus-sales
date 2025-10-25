import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/auth/lib/middleware';

const ADMIN_ECO_IDS = (process.env.ADMIN_ECO_IDS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

function isAdminEcoId(ecoId: unknown): ecoId is string {
  return typeof ecoId === 'string' && ecoId.startsWith('eco_') && ADMIN_ECO_IDS.includes(ecoId);
}

export async function requireAdminAuth(request: NextRequest): Promise<{ ecoId: string }> {
  const authResult = await verifyAuth(request);

  if (!authResult.ok) {
    throw NextResponse.json({ success: false, message: authResult.error ?? 'Unauthorized' }, { status: authResult.status });
  }

  const ecoId = (authResult.user?.ecoId ?? authResult.user?.eco_id ?? authResult.user?.sub) as unknown;
  if (!isAdminEcoId(ecoId)) {
    throw NextResponse.json({ success: false, message: 'Admin privileges required' }, { status: 403 });
  }

  return { ecoId };
}
