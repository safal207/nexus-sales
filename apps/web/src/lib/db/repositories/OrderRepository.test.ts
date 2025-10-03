import type { Order, Prisma } from '@prisma/client';

import { prismaMock, resetPrismaMock } from '../../../../tests/test-utils/prisma';
import { OrderRepository, orderRepository } from './OrderRepository';

describe('OrderRepository', () => {
  const repository = new OrderRepository();

  beforeEach(() => {
    resetPrismaMock();
  });

  it('findById fetches order with product relation', async () => {
    const order: Order = {
      id: 'ord_1',
      productId: 2,
      email: 'buyer@example.com',
      name: 'Buyer',
      status: 'created',
      amount: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.order.findUnique.mockResolvedValue(order);

    const result = await repository.findById('ord_1');

    expect(prismaMock.order.findUnique).toHaveBeenCalledWith({ where: { id: 'ord_1' }, include: { product: true } });
    expect(result).toBe(order);
  });

  it('findByEmail retrieves orders ordered by created date', async () => {
    const orders: Order[] = [];
    prismaMock.order.findMany.mockResolvedValue(orders);

    const result = await repository.findByEmail('buyer@example.com');

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { email: 'buyer@example.com' },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toBe(orders);
  });

  it('create delegates to prisma order.create', async () => {
    const data: Prisma.OrderCreateInput = {
      email: 'buyer@example.com',
      name: 'Buyer',
      amount: 5000,
      status: 'created',
    };

    const created: Order = {
      id: 'ord_2',
      productId: null,
      email: data.email,
      name: data.name ?? null,
      status: data.status,
      amount: data.amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.order.create.mockResolvedValue(created);

    const result = await repository.create(data);

    expect(prismaMock.order.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(created);
  });

  it('exports singleton instance', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    await orderRepository.findById('ord');

    expect(prismaMock.order.findUnique).toHaveBeenCalledWith({ where: { id: 'ord' }, include: { product: true } });
  });
});
