import type { Prisma, User } from '@prisma/client';

import { prismaMock, resetPrismaMock } from '../../../../tests/test-utils/prisma';
import { UserRepository, userRepository } from './UserRepository';

describe('UserRepository', () => {
  const repository = new UserRepository();

  beforeEach(() => {
    resetPrismaMock();
  });

  it('findByEmail delegates to prisma', async () => {
    const expectedUser: User = {
      id: 1,
      email: 'user@example.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(expectedUser);

    const result = await repository.findByEmail('user@example.com');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
    expect(result).toBe(expectedUser);
  });

  it('create persists user via prisma', async () => {
    const data: Prisma.UserCreateInput = {
      email: 'new@example.com',
      password: 'hashed',
    };
    const createdUser: User = {
      id: 2,
      email: data.email,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.create.mockResolvedValue(createdUser);

    const result = await repository.create(data);

    expect(prismaMock.user.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(createdUser);
  });

  it('exports a singleton instance', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const email = 'singleton@example.com';
    await userRepository.findByEmail(email);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email } });
  });
});
