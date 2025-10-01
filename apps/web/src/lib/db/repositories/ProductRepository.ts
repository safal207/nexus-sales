import { prisma } from '../prisma';

import { Product, Prisma } from '@prisma/client';

export class ProductRepository {
  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUserId(userId: number): Promise<Product[]> {
    return prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  }
}

export const productRepository = new ProductRepository();
