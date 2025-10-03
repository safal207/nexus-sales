import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Starting to seed database...');
    
    // Удалить существующие данные
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('Cleared existing data.');
    
    // Создать 10 пользователей
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });
      users.push(user);
      console.log(`Created user: ${user.email}`);
    }
    
    // Создать 20 продуктов
    const products = [];
    for (let i = 0; i < 20; i++) {
      const userIndex = Math.floor(Math.random() * users.length);
      const product = await prisma.product.create({
        data: {
          userId: users[userIndex]!.id,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseInt(faker.commerce.price({ min: 10, max: 1000, dec: 0 })),
        },
      });
      products.push(product);
      console.log(`Created product: ${product.name} for user ${users[userIndex]?.email || 'Unknown'}`);
    }
    
    // Создать 50 заказов
    for (let i = 0; i < 50; i++) {
      const productIndex = Math.floor(Math.random() * products.length);
      const orderStatuses = ['created', 'processing', 'paid', 'refunded', 'cancelled'];
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as any;
      
      await prisma.order.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          status: randomStatus,
          amount: parseInt(faker.commerce.price({ min: 10, max: 1000, dec: 0 })),
          productId: products[productIndex]?.id,
        },
      });
      
      console.log(`Created order for product: ${products[productIndex]?.name || 'Unknown'}`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData()
  .then(() => console.log('Seeding finished'))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });