import { NextRequest, NextResponse } from 'next/server';
import type { JWTPayload } from 'jose';
import { verifyAuth } from '../../auth/lib/middleware';

type AuthSuccess = {
  ok: true;
  ecoId: string;
  payload: JWTPayload;
};

type AuthFailure = {
  ok: false;
  response: NextResponse;
};

const ECO_ID_KEYS = ['ecoId', 'eco_id', 'ecoID', 'eco-id', 'eco'];

function resolveEcoId(payload: JWTPayload): string | null {
  for (const key of ECO_ID_KEYS) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  if (typeof payload.sub === 'string' && payload.sub.startsWith('eco_')) {
    return payload.sub;
  }

  const nested = payload.user;
  if (nested && typeof nested === 'object') {
    for (const key of ECO_ID_KEYS) {
      const value = (nested as Record<string, unknown>)[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }
  }

  return null;
}

export async function authenticateWithEcoId(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const authResult = await verifyAuth(request);

  if (!authResult.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: authResult.error ?? 'Unauthorized' },
        { status: authResult.status },
      ),
    };
  }

  const ecoId = resolveEcoId(authResult.user);

  if (!ecoId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'EcoID is required to access usage analytics.' },
        { status: 403 },
      ),
    };
  }

  return { ok: true, ecoId, payload: authResult.user };
}
