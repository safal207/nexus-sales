export interface ApiKey {
  id: string;
  ecoId: string;
  label?: string;
  scopes: string[];
  testMode: boolean;
  rateLimit?: number;
}

export interface VerifyApiKeySuccess {
  ok: true;
  apiKey: ApiKey;
}

export interface VerifyApiKeyFailure {
  ok: false;
  status: number;
  error: string;
}

export type VerifyApiKeyResult = VerifyApiKeySuccess | VerifyApiKeyFailure;
