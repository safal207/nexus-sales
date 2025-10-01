import { NextRequest } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

type VerifyAuthFailure = {
  ok: false;
  error: string;
  status: number;
};

type VerifyAuthSuccess = {
  ok: true;
  user: JWTPayload;
  status: number;
};

export type VerifyAuthResult = VerifyAuthFailure | VerifyAuthSuccess;

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT_SECRET_KEY is not set in environment variables.');
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAuth(request: NextRequest): Promise<VerifyAuthResult> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return { ok: false, error: 'Missing authentication token', status: 401 };
  }

  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return { ok: true, user: verified.payload, status: 200 };
  } catch (error) {
    console.warn('[auth/verify] failed to verify token', error);
    return { ok: false, error: 'Invalid token', status: 401 };
  }
}
