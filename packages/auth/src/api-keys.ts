import { createHash } from 'crypto';
import type { ApiKey, VerifyApiKeyResult } from './types.js';

interface ApiKeyConfig {
  id: string;
  ecoId: string;
  label?: string;
  scopes?: string[];
  secret?: string;
  hashedSecret?: string;
  testMode?: boolean;
  rateLimit?: number;
}

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function parseConfiguredKeys(): ApiKeyConfig[] {
  const raw = process.env.NEXUS_API_KEYS;
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[auth] NEXUS_API_KEYS must be an array of key objects.');
      return [];
    }
    return parsed as ApiKeyConfig[];
  } catch (error) {
    console.error('[auth] Failed to parse NEXUS_API_KEYS environment variable.', error);
    return [];
  }
}

function toApiKey(config: ApiKeyConfig): ApiKey {
  return {
    id: config.id,
    ecoId: config.ecoId,
    label: config.label,
    scopes: config.scopes ?? ['usage:read'],
    testMode: config.testMode ?? false,
    rateLimit: config.rateLimit,
  };
}

export async function verifyApiKey(keyId: string, secret: string | undefined): Promise<VerifyApiKeyResult> {
  if (!keyId || !secret) {
    return { ok: false, status: 401, error: 'Missing API key credentials' };
  }

  const keys = parseConfiguredKeys();
  if (keys.length === 0) {
    console.warn('[auth] No API keys configured. Set NEXUS_API_KEYS to enable key authentication.');
    return { ok: false, status: 401, error: 'API keys not configured' };
  }

  const config = keys.find((entry) => entry.id === keyId);
  if (!config) {
    return { ok: false, status: 401, error: 'Invalid API key' };
  }

  const expectedHash = config.hashedSecret ?? (config.secret ? hashSecret(config.secret) : undefined);
  if (!expectedHash) {
    console.error(`[auth] API key ${keyId} is misconfigured. Provide either \`secret\` or \`hashedSecret\`.`);
    return { ok: false, status: 500, error: 'API key misconfigured' };
  }

  const suppliedHash = hashSecret(secret);
  if (suppliedHash !== expectedHash) {
    return { ok: false, status: 401, error: 'Invalid API key secret' };
  }

  return {
    ok: true,
    apiKey: toApiKey(config),
  };
}
