import type { User, Product, Order } from '@prisma/client';

type MockFn = jest.Mock;

type UserDelegateMock = {
  findUnique: MockFn;
  create: MockFn;
};

type ProductDelegateMock = {
  findUnique: MockFn;
  findMany: MockFn;
  create: MockFn;
};

type OrderDelegateMock = {
  findUnique: MockFn;
  findMany: MockFn;
  create: MockFn;
};

type PrismaClientMock = {
  user: UserDelegateMock;
  product: ProductDelegateMock;
  order: OrderDelegateMock;
  $transaction: MockFn;
  $disconnect: MockFn;
};

function passthroughTransaction(callback: unknown): unknown {
  if (typeof callback === 'function') {
    return (callback as (client: PrismaClientMock) => unknown)(prismaMock);
  }
  return callback;
}

function createPrismaMock(): PrismaClientMock {
  return {
    user: {
      findUnique: jest.fn<Promise<User | null>, [unknown]>(),
      create: jest.fn<Promise<User>, [unknown]>(),
    },
    product: {
      findUnique: jest.fn<Promise<Product | null>, [unknown]>(),
      findMany: jest.fn<Promise<Product[]>, [unknown]>(),
      create: jest.fn<Promise<Product>, [unknown]>(),
    },
    order: {
      findUnique: jest.fn<Promise<Order | null>, [unknown]>(),
      findMany: jest.fn<Promise<Order[]>, [unknown]>(),
      create: jest.fn<Promise<Order>, [unknown]>(),
    },
    $transaction: jest.fn(async (callback: unknown) => passthroughTransaction(callback)),
    $disconnect: jest.fn(async () => undefined),
  };
}

export const prismaMock: PrismaClientMock = createPrismaMock();

jest.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}));

export function resetPrismaMock(): void {
  prismaMock.user.findUnique.mockReset();
  prismaMock.user.create.mockReset();
  prismaMock.product.findUnique.mockReset();
  prismaMock.product.findMany.mockReset();
  prismaMock.product.create.mockReset();
  prismaMock.order.findUnique.mockReset();
  prismaMock.order.findMany.mockReset();
  prismaMock.order.create.mockReset();
  prismaMock.$transaction.mockReset();
  prismaMock.$disconnect.mockReset();
}
