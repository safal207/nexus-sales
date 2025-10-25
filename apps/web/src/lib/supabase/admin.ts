import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = getRequiredEnv('SUPABASE_URL');
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error('Environment variable SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) is not set.');
  }

  cachedClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });

  return cachedClient;
}
