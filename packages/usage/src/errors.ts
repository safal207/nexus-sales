import type { UsageSnapshot } from './types.js';

export class UsageTrackerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UsageTrackerError';
  }
}

export class UsageRepositoryError extends UsageTrackerError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'UsageRepositoryError';
  }
}

export class UsageLimitExceededError extends UsageTrackerError {
  constructor(public readonly snapshot: UsageSnapshot) {
    super('Usage limit exceeded');
    this.name = 'UsageLimitExceededError';
  }
}
