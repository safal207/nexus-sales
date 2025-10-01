import { prisma } from '../prisma';

import { Order, Prisma } from '@prisma/client';

export class OrderRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async findByEmail(email: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { email },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({
      data,
    });
  }
}

export const orderRepository = new OrderRepository();
