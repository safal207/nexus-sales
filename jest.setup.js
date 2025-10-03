const { TextEncoder, TextDecoder } = require('util');
require('@testing-library/jest-dom');

class SimpleHeaders {
  constructor(init = {}) {
    this._map = new Map();

    if (init instanceof SimpleHeaders) {
      init.forEach((value, key) => this.set(key, value));
    } else if (init instanceof Map) {
      init.forEach((value, key) => this.set(key, value));
    } else if (Array.isArray(init)) {
      init.forEach(([key, value]) => this.set(key, value));
    } else {
      Object.entries(init).forEach(([key, value]) => this.set(key, value));
    }
  }

  set(key, value) {
    this._map.set(String(key).toLowerCase(), String(value));
  }

  get(key) {
    const value = this._map.get(String(key).toLowerCase());
    return value === undefined ? null : value;
  }

  has(key) {
    return this._map.has(String(key).toLowerCase());
  }

  delete(key) {
    this._map.delete(String(key).toLowerCase());
  }

  entries() {
    return this._map.entries();
  }

  forEach(callback) {
    for (const [key, value] of this._map.entries()) {
      callback(value, key, this);
    }
  }

  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
}

class SimpleRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method ?? 'GET';
    this.headers = new SimpleHeaders(init.headers ?? {});
    this._body = init.body ?? null;
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body ?? {};
  }

  async text() {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body ?? {});
  }

  clone() {
    return new SimpleRequest(this.url, {
      method: this.method,
      headers: Object.fromEntries(this.headers.entries()),
      body: this._body,
    });
  }
}

class SimpleResponse {
  constructor(body = null, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    this.statusText = init.statusText ?? 'OK';
    this.headers = new SimpleHeaders(init.headers ?? {});
  }

  async json() {
    return this._body;
  }

  static json(body, init) {
    return new SimpleResponse(body, init);
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = SimpleHeaders;
}

if (typeof global.Request === 'undefined') {
  global.Request = SimpleRequest;
}

if (typeof global.Response === 'undefined') {
  global.Response = SimpleResponse;
}

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class {};
}

if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = class {};
}

if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class {};
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

process.env.SKIP_DB_TESTS = '1';

global.fetch = jest.fn();

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.sessionStorage = sessionStorageMock;

const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
if (locationDescriptor?.configurable) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
  });
}

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
});

jest.mock('next/server');
