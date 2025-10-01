import { query } from '../src/lib/db';

async function verify() {
  console.log('--- Database verification ---');

  const users = await query<{ email: string }>('SELECT email FROM users ORDER BY created_at ASC');
  console.log(`Users: ${users.rows.length}`);
  users.rows.forEach((row) => console.log(`  - ${row.email}`));

  const products = await query<{ name: string; price: number }>('SELECT name, price FROM products ORDER BY name ASC');
  console.log(`Products: ${products.rows.length}`);
  products.rows.forEach((row) => console.log(`  - ${row.name} ($${row.price / 100})`));

  const tables = await query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  console.log(`Tables: ${tables.rows.length}`);
  tables.rows.forEach((row) => console.log(`  - ${row.tablename}`));

  console.log('Verification complete.');
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
