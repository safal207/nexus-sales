import type { NextResponse } from 'next/server';
import type { User } from '@prisma/client';

import bcrypt from 'bcrypt';

import { createJsonRequest, readJsonResponse } from '../test-utils/api';

const findByEmail = jest.fn();
const createUser = jest.fn();

jest.mock('@/lib/db/repositories/UserRepository', () => ({
  userRepository: {
    findByEmail,
    create: createUser,
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  hashSync: jest.fn((value: string) => `hashed:${value}`),
}));

const mockedHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for invalid payload', async () => {
    const request = createJsonRequest({
      method: 'POST',
      body: { email: null, password: 123 },
    });

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body.message).toBe('???????????? ?????? ???????.');
    expect(findByEmail).not.toHaveBeenCalled();
  });

  it('rejects short passwords', async () => {
    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'user@example.com', password: 'short' },
    });

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body.message).toBe('?????? ?????? ????????? ??????? 8 ????????.');
  });

  it('returns 409 when email already exists', async () => {
    const user: User = {
      id: 1,
      email: 'user@example.com',
      password: 'hashed:securepass',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findByEmail.mockResolvedValue(user);

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'user@example.com', password: 'longenough' },
    });

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(409);
    expect(payload.body.message).toBe('???????????? ? ????? e-mail ??? ??????????.');
    expect(mockedHash).not.toHaveBeenCalled();
  });

  it('creates user with hashed password', async () => {
    findByEmail.mockResolvedValue(null);

    const createdUser: User = {
      id: 5,
      email: 'new@example.com',
      password: 'hashed:longpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedHash.mockResolvedValue('hashed:longpassword');
    createUser.mockResolvedValue(createdUser);

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'new@example.com', password: 'longpassword' },
    });

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(request);
    const payload = await readJsonResponse<{ success: boolean; user: Pick<User, 'id' | 'email'> }>(response as NextResponse);

    expect(payload.status).toBe(201);
    expect(payload.body.success).toBe(true);
    expect(payload.body.user).toEqual({ id: 5, email: 'new@example.com' });
    expect(mockedHash).toHaveBeenCalledWith('longpassword', 10);
    expect(createUser).toHaveBeenCalledWith({ email: 'new@example.com', password: 'hashed:longpassword' });
  });

  it('handles repository failures gracefully', async () => {
    findByEmail.mockResolvedValue(null);
    mockedHash.mockResolvedValue('hashed:value');
    createUser.mockRejectedValue(new Error('database error'));

    const request = createJsonRequest({
      method: 'POST',
      body: { email: 'fail@example.com', password: 'longpassword' },
    });

    const { POST } = await import('@/app/api/auth/register/route');
    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(500);
    expect(payload.body.success).toBe(false);
    expect(payload.body.message).toBe('????????? ?????????????? ??????. ?????????? ?????.');
  });
});
