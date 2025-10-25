import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { User } from '@prisma/client';
import { userRepository } from '@/lib/db/repositories/UserRepository';

type AuthenticatedUser = Pick<User, 'id' | 'email'>;

type LoginSuccessResponse = {
  success: true;
  token: string;
  user: AuthenticatedUser;
};

type LoginErrorResponse = {
  success: false;
  message: string;
};

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

interface ValidLoginPayload {
  email: string;
  password: string;
}

function isValidLoginPayload(payload: unknown): payload is ValidLoginPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const { email, password } = payload as LoginRequestBody;
  return typeof email === 'string' && typeof password === 'string';
}

function toResponseUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
  };
}

function respondWithError(message: string, status: number) {
  return NextResponse.json<LoginErrorResponse>({ success: false, message }, { status });
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT_SECRET_KEY is not set in environment variables.');
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
  console.info('[auth/login] request received');

  try {
    const rawBody = (await request.json()) as unknown;

    if (!isValidLoginPayload(rawBody)) {
      return respondWithError('Некорректное тело запроса.', 400);
    }

    const { email, password } = rawBody;

    console.info('[auth/login] authentication attempt', { email });

    const user = await userRepository.findByEmail(email);

    let passwordMatches = false;
    if (user) {
      passwordMatches = await bcrypt.compare(password, user.password);
    }

    if (!user || !passwordMatches) {
      console.warn('[auth/login] invalid credentials', { email, passwordMatches });
      return respondWithError('Неверный e-mail или пароль.', 401);
    }

    const safeUser = toResponseUser(user);

    const token = await new SignJWT(safeUser)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(getJwtSecretKey());

    console.info('[auth/login] authentication successful', { email });

    const response = NextResponse.json<LoginSuccessResponse>(
      {
        success: true,
        token,
        user: safeUser,
      },
      { status: 200 },
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2,
    });

    return response;
  } catch (error) {
    console.error('[auth/login] unexpected error', error);
    return respondWithError('Произошла непредвиденная ошибка. Попробуйте позже.', 500);
  }
}
