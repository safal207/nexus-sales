# @repo/auth

Lightweight authentication helpers focused on API key verification for the Nexus monorepo.

## Environment

Set `NEXUS_API_KEYS` to a JSON array of API key definitions. Each entry supports the following shape:

```json
[
  {
    "id": "key_live_123",
    "ecoId": "eco_usr_live000000000000000000",
    "hashedSecret": "<sha256 hash of secret>",
    "scopes": ["usage:read"],
    "testMode": false,
    "rateLimit": 1000
  }
]
```

For development you can provide `secret` instead of `hashedSecret`; the value will be hashed with SHA-256 before comparison.

## Usage

```ts
import { withApiKey } from '@repo/auth';

export async function GET(req: NextRequest) {
  return withApiKey(req, async (_req, ctx) => {
    // ctx.ecoId, ctx.apiKeyId, ctx.apiKey available
    return NextResponse.json({ ok: true });
  });
}
```

The middleware automatically delegates to `withUsageTracking`, so every API request authenticated through an API key is recorded in the usage analytics pipeline and rate-limit headers are appended to the response.
