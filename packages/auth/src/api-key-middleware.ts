import { NextRequest, NextResponse } from 'next/server';
import { withUsageTracking } from '@repo/usage';
import { verifyApiKey } from './api-keys.js';
import type { ApiKey } from './types.js';

export interface ApiKeyContext {
  ecoId: string;
  apiKeyId: string;
  apiKey: ApiKey;
}

export type ApiKeyHandler = (req: NextRequest, context: ApiKeyContext) => Promise<NextResponse>;

export interface ApiKeyMiddlewareOptions {
  rateLimit?: number;
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

function extractCredentials(header: string | null): { keyId: string; secret: string } | null {
  if (!header) {
    return null;
  }

  const value = header.trim();
  if (!value.toLowerCase().startsWith('apikey ')) {
    return null;
  }

  const token = value.slice(7).trim();
  const [keyId, secret] = token.split('.');
  if (!keyId || !secret) {
    return null;
  }

  return { keyId, secret };
}

export async function withApiKey(
  req: NextRequest,
  handler: ApiKeyHandler,
  _options: ApiKeyMiddlewareOptions = {},
): Promise<NextResponse> {
  const credentials = extractCredentials(req.headers.get('authorization') ?? req.headers.get('Authorization'));

  if (!credentials) {
    return errorResponse('Missing API key', 401);
  }

  const verification = await verifyApiKey(credentials.keyId, credentials.secret);
  if (!verification.ok) {
    return errorResponse(verification.error, verification.status);
  }

  const { apiKey } = verification;

  return withUsageTracking(
    req,
    { ecoId: apiKey.ecoId, apiKeyId: apiKey.id },
    (trackedRequest) => handler(trackedRequest, { ecoId: apiKey.ecoId, apiKeyId: apiKey.id, apiKey }),
  );
}

export function requireScopes(required: string[], options: ApiKeyMiddlewareOptions = {}) {
  return (handler: ApiKeyHandler): ((req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) =>
      withApiKey(req, async (trackedReq, context) => {
        const missing = required.filter((scope) => !context.apiKey.scopes.includes(scope));
        if (missing.length > 0) {
          return errorResponse(`Insufficient scopes. Required: [${missing.join(', ')}]`, 403);
        }

        return handler(trackedReq, context);
      }, options);
  };
}
