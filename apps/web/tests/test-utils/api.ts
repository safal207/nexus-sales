import { NextRequest, NextResponse } from 'next/server';

type RequestBody = unknown;

type CookieRecord = Record<string, string>;

export interface MockRequestInit {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: RequestBody;
  cookies?: CookieRecord;
}

const defaultUrl = 'http://localhost/api/test';

function serialiseCookies(store: Map<string, string>): string {
  return Array.from(store.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

export function createJsonRequest(init: MockRequestInit = {}): Request {
  const { method = 'GET', url = defaultUrl, headers = {}, body } = init;
  const headerBag = new Headers(headers);

  if (body !== undefined && !headerBag.has('content-type')) {
    headerBag.set('content-type', 'application/json');
  }

  let consumed = false;
  const resolveBody = async () => {
    if (consumed) {
      throw new Error('Body already consumed');
    }
    consumed = true;
    return body ?? {};
  };

  return {
    method,
    url,
    headers: headerBag,
    json: resolveBody,
    text: async () => {
      if (consumed) {
        throw new Error('Body already consumed');
      }
      consumed = true;
      if (typeof body === 'string') {
        return body;
      }
      return JSON.stringify(body ?? {});
    },
    clone: () => createJsonRequest(init),
  } as unknown as Request;
}

export function createMockNextRequest(init: MockRequestInit = {}): NextRequest {
  const { method = 'GET', url = defaultUrl, headers = {}, body, cookies } = init;

  const headerBag = new Headers(headers);
  const cookieStore = new Map<string, string>();

  if (cookies) {
    Object.entries(cookies).forEach(([name, value]) => {
      cookieStore.set(name, value);
    });
    if (cookieStore.size > 0) {
      headerBag.set('cookie', serialiseCookies(cookieStore));
    }
  }

  let consumed = false;

  const ensureBody = async (): Promise<RequestBody> => {
    if (consumed) {
      throw new Error('Body already consumed');
    }
    consumed = true;
    return body ?? {};
  };

  const mock: Partial<NextRequest> = {
    method,
    url,
    headers: headerBag,
    json: ensureBody,
    text: async () => {
      if (consumed) {
        throw new Error('Body already consumed');
      }
      consumed = true;
      if (typeof body === 'string') {
        return body;
      }
      return JSON.stringify(body ?? {});
    },
    clone: () => createMockNextRequest(init),
    cookies: {
      get: (name: string) => {
        const value = cookieStore.get(name);
        return value ? { name, value } : undefined;
      },
      getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
      has: (name: string) => cookieStore.has(name),
      set: (name: string, value: string) => {
        cookieStore.set(name, value);
        headerBag.set('cookie', serialiseCookies(cookieStore));
        return {
          get: (key: string) => {
            const value = cookieStore.get(key);
            return value ? { name: key, value } : undefined;
          },
          getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
          has: (name: string) => cookieStore.has(name),
          set: (name: string, value: string) => {
            cookieStore.set(name, value);
            headerBag.set('cookie', serialiseCookies(cookieStore));
          },
          delete: (name: string) => {
            cookieStore.delete(name);
            headerBag.set('cookie', serialiseCookies(cookieStore));
          },
          size: cookieStore.size,
          clear: () => {
            cookieStore.clear();
            headerBag.set('cookie', serialiseCookies(cookieStore));
          },
          [Symbol.iterator]: () => Array.from(cookieStore.entries()).map(([name, value]) => [name, { name, value }] as [string, any]).values(),
        } as any;
      },
      delete: (name: string) => {
        const existed = cookieStore.has(name);
        cookieStore.delete(name);
        headerBag.set('cookie', serialiseCookies(cookieStore));
        return existed;
      },
      size: cookieStore.size,
      clear: () => {
        cookieStore.clear();
        headerBag.set('cookie', serialiseCookies(cookieStore));
        return {
          get: (key: string) => {
            const value = cookieStore.get(key);
            return value ? { name: key, value } : undefined;
          },
          getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
          has: (name: string) => cookieStore.has(name),
          set: (name: string, value: string) => {
            cookieStore.set(name, value);
            headerBag.set('cookie', serialiseCookies(cookieStore));
          },
          delete: (name: string) => {
            cookieStore.delete(name);
            headerBag.set('cookie', serialiseCookies(cookieStore));
          },
          size: cookieStore.size,
          clear: () => {
            cookieStore.clear();
            headerBag.set('cookie', serialiseCookies(cookieStore));
          },
          [Symbol.iterator]: () => Array.from(cookieStore.entries()).map(([name, value]) => [name, { name, value }] as [string, any]).values(),
        } as any;
      },
      [Symbol.iterator]: () => Array.from(cookieStore.entries()).map(([name, value]) => [name, { name, value }] as [string, any]).values(),
    },
  };

  return mock as NextRequest;
}

export async function readJsonResponse<T = unknown>(response: NextResponse): Promise<{
  status: number;
  body: T;
  cookies: CookieRecord;
}> {
  const body = (await response.json()) as T;
  const cookies = Object.fromEntries(response.cookies.getAll().map(({ name, value }) => [name, value]));

  return {
    status: response.status,
    body,
    cookies,
  };
}
