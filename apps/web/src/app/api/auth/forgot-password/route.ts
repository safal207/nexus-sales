import { NextRequest, NextResponse } from 'next/server';
import { users } from '../lib/db';

interface ForgotPasswordRequestBody {
  email?: unknown;
}

function isValidForgotPayload(payload: unknown): payload is { email: string } {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const { email } = payload as ForgotPasswordRequestBody;
  return typeof email === 'string' && email.length > 0;
}

export async function POST(request: NextRequest) {
  console.log('[auth/forgot-password] request received');

  try {
    const rawBody = (await request.json()) as unknown;

    if (!isValidForgotPayload(rawBody)) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 },
      );
    }

    const { email } = rawBody;
    console.log('[auth/forgot-password] lookup for', email);

    const userExists = users.has(email);
    console.log('[auth/forgot-password] user exists', userExists);

    return NextResponse.json(
      { success: true, message: 'If the email exists, a reset link has been sent.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[auth/forgot-password] unexpected error', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
