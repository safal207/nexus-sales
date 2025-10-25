import { NextRequest, NextResponse } from 'next/server';
import { withApiKey } from '@/lib/usage';

export async function GET(req: NextRequest) {
  return withApiKey(req, async (_trackedReq, context) => {
    return NextResponse.json({
      success: true,
      key_id: context.apiKeyId,
      eco_id: context.ecoId,
      scopes: context.apiKey.scopes,
      test_mode: context.apiKey.testMode,
    });
  });
}
