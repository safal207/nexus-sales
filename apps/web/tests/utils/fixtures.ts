import { test as base, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Define our custom test fixtures
interface TestFixtures {
  createUser: () => Promise<{ id: number; email: string; password: string }>;
  createProduct: (userId: number) => Promise<{ id: number; name: string; description: string | null; price: number; userId: number; createdAt: Date; updatedAt: Date }>;
  createOrder: (productId: number) => Promise<{ id: string; email: string; name: string | null; status: string; amount: number; productId: number | null; createdAt: Date; updatedAt: Date }>;
  cleanup: () => Promise<void>;
}

// Extend the base test with our fixtures
export const test = base.extend<TestFixtures>({
  // Create a user fixture
  createUser: async ({}, use) => {
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      },
    });
    
    await use(() => 
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: 'password123',
        },
      })
    );
    
    // Cleanup after test
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'example.com' }
      }
    });
  },

  // Create a product fixture
  createProduct: async ({}, use) => {
    const fn = async (userId: number) => {
      return await prisma.product.create({
        data: {
          userId,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseInt(faker.commerce.price({ min: 10, max: 1000, dec: 0 })),
        },
      });
    };

    await use(fn);
  },

  // Create an order fixture
  createOrder: async ({}, use) => {
    const fn = async (productId: number) => {
      const orderStatuses = ['created', 'processing', 'paid', 'refunded', 'cancelled'] as const;
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as typeof orderStatuses[number];

      return await prisma.order.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          status: randomStatus,
          amount: parseInt(faker.commerce.price({ min: 10, max: 1000, dec: 0 })),
          productId,
        },
      });
    };

    await use(fn);
  },

  // Create a cleanup fixture
  cleanup: async ({}, use) => {
    await use(async () => {
      // Clean up any test data created during the test
      await prisma.order.deleteMany({
        where: {
          email: { contains: 'example.com' }
        }
      });
      await prisma.product.deleteMany({
        where: {
          user: {
            email: { contains: 'example.com' }
          }
        }
      });
      await prisma.user.deleteMany({
        where: {
          email: { contains: 'example.com' }
        }
      });
    });
  },
});

export { expect } from '@playwright/test';

// Utility functions
export const login = async (page: Page, email: string, password: string) => {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
};

export const logout = async (page: Page) => {
  await page.click('button:has-text("Logout")');
  await page.waitForURL('/');
};

export const navigateToProducts = async (page: Page) => {
  await page.click('text=Products');
  await page.waitForURL('/dashboard/products');
};

export const navigateToFunnels = async (page: Page) => {
  await page.click('text=Funnel Analytics');
  await page.waitForURL('/dashboard/funnels');
};