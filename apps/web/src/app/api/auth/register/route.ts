import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { User } from '@prisma/client';
import { userRepository } from '@/lib/db/repositories/UserRepository';

const SALT_ROUNDS = 10;

type RegisteredUser = Pick<User, 'id' | 'email'>;

type RegisterSuccessResponse = {
  success: true;
  user: RegisteredUser;
};

type RegisterErrorResponse = {
  success: false;
  message: string;
};

interface RegisterRequestBody {
  email?: unknown;
  password?: unknown;
}

interface ValidRegisterPayload {
  email: string;
  password: string;
}

function isValidRegisterPayload(payload: unknown): payload is ValidRegisterPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const { email, password } = payload as RegisterRequestBody;
  return typeof email === 'string' && typeof password === 'string';
}

function toResponseUser(user: User): RegisteredUser {
  return {
    id: user.id,
    email: user.email,
  };
}

function respondWithError(message: string, status: number) {
  return NextResponse.json<RegisterErrorResponse>({ success: false, message }, { status });
}

export async function POST(request: Request) {
  console.info('[auth/register] request received');

  try {
    const rawBody = (await request.json()) as unknown;

    if (!isValidRegisterPayload(rawBody)) {
      return respondWithError('???????????? ?????? ???????.', 400);
    }

    const { email, password } = rawBody;

    console.info('[auth/register] registration attempt', { email });

    if (password.length < 8) {
      console.warn('[auth/register] invalid password length', { email, length: password.length });
      return respondWithError('?????? ?????? ????????? ??????? 8 ????????.', 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      console.warn('[auth/register] email already exists', { email });
      return respondWithError('???????????? ? ????? e-mail ??? ??????????.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await userRepository.create({ email, password: hashedPassword });

    console.info('[auth/register] user created', { email, id: newUser.id });

    return NextResponse.json<RegisterSuccessResponse>(
      { success: true, user: toResponseUser(newUser) },
      { status: 201 },
    );
  } catch (error) {
    console.error('[auth/register] unexpected error', error);
    return respondWithError('????????? ?????????????? ??????. ?????????? ?????.', 500);
  }
}
