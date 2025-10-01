import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedProductionData() {
  try {
    console.log('Starting to seed production demo data...');
    
    // Удалить существующие данные (в продакшене этого обычно не делают, но для демонстрации очистим)
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('Cleared existing data for demo.');
    
    // Создать одного пользователя для демонстрации
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@nexus-sales.com',
        password: 'DemoPassword123!',
      },
    });
    
    console.log(`Created demo user: ${demoUser.email}`);
    
    // Создать 3 демонстрационных продукта
    const demoProducts = [];
    for (let i = 0; i < 3; i++) {
      const product = await prisma.product.create({
        data: {
          userId: demoUser.id,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseInt(faker.commerce.price({ min: 10, max: 1000, dec: 0 })),
        },
      });
      demoProducts.push(product);
      console.log(`Created demo product: ${product.name}`);
    }
    
    // Создать 5 заказов для демонстрации
    for (let i = 0; i < 5; i++) {
      const productIndex = Math.floor(Math.random() * demoProducts.length);
      const orderStatuses = ['created', 'processing', 'paid', 'refunded', 'cancelled'];
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as any;
      
      await prisma.order.create({
        data: {
          email: faker.internet.email(),
          name: faker.name.fullName(),
          status: randomStatus,
          amount: parseInt(faker.commerce.price({ min: 10, max: 1000, dec: 0 })),
          productId: demoProducts[productIndex].id,
        },
      });
      
      console.log(`Created demo order for product: ${demoProducts[productIndex].name}`);
    }
    
    console.log('Production demo data seeding completed successfully!');
  } catch (error) {
    console.error('Error during production demo seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductionData()
  .then(() => console.log('Production demo seeding finished'))
  .catch((error) => {
    console.error('Production demo seeding failed:', error);
    process.exit(1);
  });