import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://nexus_dev:dev_password@localhost:5432/nexus_sales_dev',
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (error) => {
  console.error('[db] unexpected error on idle client', error);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const startedAt = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - startedAt;
    console.log('[db] executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('[db] query error', { text, error });
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function healthCheck() {
  try {
    const result = await query<{ now: string }>('SELECT NOW()');
    return { healthy: true, timestamp: result.rows[0]?.now };
  } catch (error) {
    return { healthy: false, error: (error as Error).message };
  }
}

export default pool;
