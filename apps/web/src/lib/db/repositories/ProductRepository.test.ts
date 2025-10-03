import type { Prisma, Product } from '@prisma/client';

import { prismaMock, resetPrismaMock } from '../../../../tests/test-utils/prisma';
import { ProductRepository, productRepository } from './ProductRepository';

describe('ProductRepository', () => {
  const repository = new ProductRepository();

  beforeEach(() => {
    resetPrismaMock();
  });

  it('findById fetches product with user relation', async () => {
    const product: Product = {
      id: 10,
      userId: 1,
      name: 'Course',
      description: 'Desc',
      price: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.product.findUnique.mockResolvedValue(product);

    const result = await repository.findById(10);

    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({ where: { id: 10 }, include: { user: true } });
    expect(result).toBe(product);
  });

  it('findByUserId sorts products by creation date', async () => {
    const products: Product[] = [];
    prismaMock.product.findMany.mockResolvedValue(products);

    const result = await repository.findByUserId(7);

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({ where: { userId: 7 }, orderBy: { createdAt: 'desc' } });
    expect(result).toBe(products);
  });

  it('create delegates to prisma product create', async () => {
    const data: Prisma.ProductCreateInput = {
      name: 'New Product',
      description: 'Info',
      price: 7500,
      user: { connect: { id: 3 } },
    };

    const created: Product = {
      id: 3,
      userId: 3,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.product.create.mockResolvedValue(created);

    const result = await repository.create(data);

    expect(prismaMock.product.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(created);
  });

  it('exports singleton instance', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await productRepository.findByUserId(1);

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({ where: { userId: 1 }, orderBy: { createdAt: 'desc' } });
  });
});
