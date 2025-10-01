import bcrypt from 'bcrypt';

const SEED_PASSWORD_SALT_ROUNDS = 10;

export interface MockUser {
  id: number;
  email: string;
  password: string;
}

export interface MockProduct {
  id: number;
  userId: number;
  name: string;
  description: string;
  price: number; // stored in cents
}

export type MockOrderStatus = 'created' | 'processing' | 'paid' | 'refunded' | 'cancelled';

export interface MockOrder {
  id: string;
  productId: number;
  email: string;
  name: string | null;
  status: MockOrderStatus;
  createdAt: string;
  amount: number;
}

const DEFAULT_USER_PASSWORD_HASH = bcrypt.hashSync('password123', SEED_PASSWORD_SALT_ROUNDS);

function seedUsers(): Map<string, MockUser> {
  const initialUsers = new Map<string, MockUser>();
  initialUsers.set('test@test.com', {
    id: 1,
    email: 'test@test.com',
    password: DEFAULT_USER_PASSWORD_HASH,
  });
  return initialUsers;
}

function seedProducts(): Map<number, MockProduct> {
  const initialProducts = new Map<number, MockProduct>();
  initialProducts.set(1, {
    id: 1,
    userId: 1,
    name: 'My First Awesome Course',
    description: 'This is the best course ever.',
    price: 4_999,
  });
  initialProducts.set(2, {
    id: 2,
    userId: 1,
    name: 'My Second Product',
    description: 'Another great offering.',
    price: 9_999,
  });
  return initialProducts;
}

export const users = seedUsers();
export const products = seedProducts();
export const orders = new Map<number, MockOrder>();
