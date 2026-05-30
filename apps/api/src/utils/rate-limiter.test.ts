import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter, perWindow } from './rate-limiter.js';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to capacity, then denies', () => {
    const rl = new RateLimiter(3, 0); // no refill
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(false);
  });

  it('refills over time', () => {
    const rl = new RateLimiter(2, 1 / 1000); // 1 token per second
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(false);

    vi.setSystemTime(1000); // +1s → +1 token
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(false);
  });

  it('never refills past capacity', () => {
    const rl = new RateLimiter(2, 1 / 1000);
    rl.take('k');
    rl.take('k'); // empty
    vi.setSystemTime(10_000); // +10s worth of tokens, but capped at 2
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(false);
  });

  it('isolates buckets per key', () => {
    const rl = new RateLimiter(1, 0);
    expect(rl.take('a')).toBe(true);
    expect(rl.take('a')).toBe(false);
    expect(rl.take('b')).toBe(true); // separate bucket, still full
  });
});

describe('perWindow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows N requests as a burst, then throttles', () => {
    const rl = perWindow(5, 60_000); // 5 per minute
    for (let i = 0; i < 5; i++) expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(false);
  });

  it('regenerates one slot after a proportional wait', () => {
    const rl = perWindow(60, 60_000); // 60/min → 1 per second
    for (let i = 0; i < 60; i++) rl.take('k');
    expect(rl.take('k')).toBe(false);
    vi.setSystemTime(1000); // 1s → exactly one token back
    expect(rl.take('k')).toBe(true);
    expect(rl.take('k')).toBe(false);
  });
});
