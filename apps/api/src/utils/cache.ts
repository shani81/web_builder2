/**
 * Tiny in-memory TTL cache. Used to honor Pixabay's "cache responses for 24h"
 * rule and cut API calls. In-process only — a multi-instance deployment should
 * back this with Redis, but the 24h compliance is satisfied per process.
 */
export class TTLCache<T> {
  private store = new Map<string, { value: T; expires: number }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}
