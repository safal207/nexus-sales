import type { NextResponse } from 'next/server';
import type { User } from '@prisma/client';

import bcrypt from 'bcrypt';

import { createJsonRequest, readJsonResponse } from '../test-utils/api';

const findByEmail = jest.fn();

jest.mock('@/lib/db/repositories/UserRepository', () => ({
  userRepository: {
    findByEmail,
    create: jest.fn(),
  },
}));

const signSpy = jest.fn();

jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: signSpy.mockResolvedValue('signed-token'),
  })),
  jwtVerify: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  hashSync: jest.fn((value: string) => `hashed:${value}`),
}));

const mockedCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = 'test-secret';
  });

  it('returns 400 when payload is invalid', async () => {
    const request = createJsonRequest({
      method: 'POST',
      body: { email: 123, password: null },
    });

    const response = (await import('@/app/api/auth/login/route')).POST;
    const result = await response(request);
    const payload = await readJsonResponse(result as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({
      success: false,
      message: '???????????? ?????? ???????.',
    });
    expect(findByEmail).not.toHaveBeenCalled();
  });

  it('returns 401 when user does not exist', async () => {
    findByEmail.mockResolvedValue(null);

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'missing@example.com', password: 'secret123' },
    });

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(401);
    expect(payload.body.success).toBe(false);
    expect(payload.body.message).toBe('???????? e-mail ??? ??????.');
    expect(mockedCompare).not.toHaveBeenCalled();
  });

  it('returns 401 when password mismatch', async () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed:secret123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    findByEmail.mockResolvedValue(user);
    mockedCompare.mockResolvedValue(false);

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: 'wrong' },
    });

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(401);
    expect(payload.body.message).toBe('???????? e-mail ??? ??????.');
    expect(mockedCompare).toHaveBeenCalledWith('wrong', 'hashed:secret123');
  });

  it('returns token and cookie on success', async () => {
    const user: User = {
      id: 42,
      email: 'user@example.com',
      password: 'hashed:securepass',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    findByEmail.mockResolvedValue(user);
    mockedCompare.mockResolvedValue(true);

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'user@example.com', password: 'securepass' },
    });

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(request);
    const payload = await readJsonResponse<{ success: boolean; token: string }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.token).toBe('signed-token');
    expect(payload.cookies.token).toBe('signed-token');
    expect(findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockedCompare).toHaveBeenCalledWith('securepass', 'hashed:securepass');
  });

  it('handles unexpected repository errors', async () => {
    findByEmail.mockRejectedValue(new Error('database down'));

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'user@example.com', password: 'securepass' },
    });

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(500);
    expect(payload.body.success).toBe(false);
    expect(payload.body.message).toBe('????????? ?????????????? ??????. ?????????? ?????.');
  });
});
