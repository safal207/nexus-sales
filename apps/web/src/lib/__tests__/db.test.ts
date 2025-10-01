import pool, { healthCheck } from '../db';

const shouldSkip = process.env.SKIP_DB_TESTS === '1';
const describeDb = shouldSkip ? describe.skip : describe;

describeDb('Database Connection', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should report healthy status from PostgreSQL', async () => {
    const health = await healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.timestamp).toBeDefined();
  });
});
