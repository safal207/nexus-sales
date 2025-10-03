const cookieStoreSymbol = Symbol('cookies');

class MockNextResponse {
  constructor(body = null, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    this.statusText = init.statusText ?? 'OK';
    this.headers = new (global.Headers || Map)(init.headers ?? {});
    const store = new Map();
    this[cookieStoreSymbol] = store;
    this.cookies = {
      set: (name, value, options = {}) => {
        store.set(name, { name, value, options });
        const serialized = ${name}=;
        const existing = this.headers.get?.('set-cookie') ?? null;
        if (existing) {
          this.headers.set?.('set-cookie', ${existing}; );
        } else {
          this.headers.set?.('set-cookie', serialized);
        }
      },
      get: (name) => store.get(name) ?? null,
      getAll: () => Array.from(store.values()),
      delete: (name) => store.delete(name),
    };
  }

  async json() {
    return this._body;
  }

  static json(body, init) {
    return new MockNextResponse(body, init);
  }
}

class MockNextRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method ?? 'GET';
    this.headers = new (global.Headers || Map)(init.headers ?? {});
    this._body = init.body ?? null;
    this.cookies = {
      get: () => null,
      getAll: () => [],
    };
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body ?? {};
  }
}

module.exports = {
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest,
};
