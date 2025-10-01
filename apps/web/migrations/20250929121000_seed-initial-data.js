const USER_ID = ''a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'';
const PRODUCT_ONE_ID = ''b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'';
const PRODUCT_TWO_ID = ''c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'';
const SALT_ROUNDS = 10;

export const up = async (pgm) => {
  const { default: bcrypt } = await import(''bcrypt'');
  const passwordHash = await bcrypt.hash(''password123'', SALT_ROUNDS);

  pgm.sql(`
    INSERT INTO users (id, email, password_hash, created_at, updated_at)
    VALUES ('${USER_ID}', 'test@test.com', '${passwordHash}', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO products (id, user_id, name, description, price, active, created_at, updated_at)
    VALUES
      ('${PRODUCT_ONE_ID}', '${USER_ID}', 'My First Awesome Course', 'This is the best course ever.', 4999, true, NOW(), NOW()),
      ('${PRODUCT_TWO_ID}', '${USER_ID}', 'My Second Product', 'Another great offering.', 9999, true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `);
};

export const down = (pgm) => {
  pgm.sql(`DELETE FROM products WHERE id IN ('${PRODUCT_ONE_ID}', '${PRODUCT_TWO_ID}')`);
  pgm.sql(`DELETE FROM users WHERE id = '${USER_ID}'`);
};
