// Polyfill Web Streams API first
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');

// Set global streams BEFORE importing Edge runtime
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;

// Now safe to import Edge runtime primitives
const { Headers: EdgeHeaders, Request: EdgeRequest, Response: EdgeResponse } = require('next/dist/compiled/@edge-runtime/primitives/fetch');

require('@testing-library/jest-dom');

// Set Edge runtime globals
if (typeof global.Headers === 'undefined') {
  global.Headers = EdgeHeaders;
}

if (typeof global.Request === 'undefined') {
  global.Request = EdgeRequest;
}

if (typeof global.Response === 'undefined') {
  global.Response = EdgeResponse;
}

process.env.SKIP_DB_TESTS = '1';

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock localStorage (allow spyOn)
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock();

// Mock sessionStorage (allow spyOn)
class SessionStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

global.sessionStorage = new SessionStorageMock();

// Mock window.location safely for jsdom
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

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  JWT_SECRET: 'test-secret',
  JWT_SECRET_KEY: 'test-secret',
};

// Setup test cleanup
afterEach(() => {
  jest.clearAllMocks();
  if (global.localStorage && global.localStorage.clear) {
    global.localStorage.clear();
  }
  if (global.sessionStorage && global.sessionStorage.clear) {
    global.sessionStorage.clear();
  }
});
