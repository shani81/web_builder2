/**
 * In-memory token-bucket rate limiter. Protects upstream provider keys from
 * exceeding their quotas (e.g. Pixabay ~100 req/60s) by capping our own call
 * rate per key — so a busy shared key returns a friendly "try again" instead of
 * hammering the provider into a hard 429/ban. In-process only; a multi-instance
 * deployment should back this with Redis.
 */
interface Bucket {
  tokens: number;
  updated: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  /**
   * @param capacity   max burst (and starting tokens) per key
   * @param refillPerMs tokens regenerated per millisecond
   */
  constructor(
    private readonly capacity: number,
    private readonly refillPerMs: number,
  ) {}

  /** Consume one token for `key`; returns false when the bucket is empty. */
  take(key: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key) ?? {
      tokens: this.capacity,
      updated: now,
    };
    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + (now - bucket.updated) * this.refillPerMs,
    );
    bucket.updated = now;

    const allowed = bucket.tokens >= 1;
    if (allowed) bucket.tokens -= 1;
    this.buckets.set(key, bucket);
    return allowed;
  }
}

/** Build a limiter from a human-friendly "N requests per window" spec. */
export function perWindow(requests: number, windowMs: number): RateLimiter {
  return new RateLimiter(requests, requests / windowMs);
}
