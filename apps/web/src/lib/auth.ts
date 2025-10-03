import { NextRequest } from 'next/server';
import { requireAuth, JWTPayload } from '@/utils/auth';

export async function auth(request: NextRequest): Promise<JWTPayload | null> {
  return requireAuth(request);
}
