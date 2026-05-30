import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TTLCache } from './cache.js';

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a stored value before it expires', () => {
    const cache = new TTLCache<number>(1000);
    cache.set('a', 42);
    expect(cache.get('a')).toBe(42);
    vi.setSystemTime(999);
    expect(cache.get('a')).toBe(42);
  });

  it('expires entries once past the TTL', () => {
    const cache = new TTLCache<number>(1000);
    cache.set('a', 42);
    vi.setSystemTime(1001);
    expect(cache.get('a')).toBeUndefined();
  });

  it('returns undefined for unknown keys', () => {
    const cache = new TTLCache<string>(1000);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('refreshes expiry when a key is re-set', () => {
    const cache = new TTLCache<string>(1000);
    cache.set('a', 'one');
    vi.setSystemTime(500);
    cache.set('a', 'two'); // new expiry at 1500
    vi.setSystemTime(1400);
    expect(cache.get('a')).toBe('two');
  });

  it('keeps values independent per key', () => {
    const cache = new TTLCache<string>(1000);
    cache.set('a', 'x');
    cache.set('b', 'y');
    expect(cache.get('a')).toBe('x');
    expect(cache.get('b')).toBe('y');
  });
});
