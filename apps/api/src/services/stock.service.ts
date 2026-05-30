import { now } from '@buildr/utils';
import type {
  MediaAsset,
  StockPhoto,
  StockProviderName,
  StockSearchParams,
} from '@buildr/types';
import { mediaRepository } from '../repositories/media.repository.js';
import { mediaService } from './media.service.js';
import { pixabayProvider } from './stock/pixabay.provider.js';
import { unsplashProvider } from './stock/unsplash.provider.js';
import type { StockProvider } from './stock/provider.js';
import { TTLCache } from '../utils/cache.js';
import { perWindow, type RateLimiter } from '../utils/rate-limiter.js';
import { AppError } from '../utils/response.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

// Respect provider "cache responses for 24h" rules; keyed incl. provider + filters.
const searchCache = new TTLCache<StockPhoto[]>(ONE_DAY);

// Per-key throttles sized below each provider's documented quota, leaving margin.
const limiters: Record<StockProviderName, RateLimiter> = {
  pixabay: perWindow(90, ONE_MINUTE), // Pixabay: ~100/60s
  unsplash: perWindow(45, ONE_HOUR), // Unsplash demo: 50/hour
};

interface ProviderMetrics {
  searches: number;
  cacheHits: number;
  imports: number;
  throttled: number;
  errors: number;
}
const zero = (): ProviderMetrics => ({
  searches: 0,
  cacheHits: 0,
  imports: 0,
  throttled: 0,
  errors: 0,
});
const metrics: Record<StockProviderName, ProviderMetrics> = {
  pixabay: zero(),
  unsplash: zero(),
};

const DISABLED_MESSAGE: Record<StockProviderName, string> = {
  pixabay: 'Pixabay is not configured. Add your Pixabay API key in Settings.',
  unsplash: 'Unsplash is not configured. Add UNSPLASH_ACCESS_KEY on the server.',
};

export class StockService {
  private readonly providers: Record<StockProviderName, StockProvider> = {
    pixabay: pixabayProvider,
    unsplash: unsplashProvider,
  };

  private get(name: StockProviderName): StockProvider {
    return this.providers[name];
  }

  private async requireKey(
    userId: string,
    provider: StockProvider,
  ): Promise<string> {
    const key = await provider.resolveKey(userId);
    if (!key) {
      throw new AppError(503, 'STOCK_DISABLED', DISABLED_MESSAGE[provider.name]);
    }
    return key;
  }

  /** Guard an upstream provider call against our per-key quota. */
  private throttle(name: StockProviderName, apiKey: string): void {
    if (!limiters[name].take(`${name}:${apiKey}`)) {
      metrics[name].throttled += 1;
      throw new AppError(
        429,
        'RATE_LIMIT',
        'Image search is busy right now — please try again in a moment.',
      );
    }
  }

  /** Aggregate, non-sensitive usage counters per provider. */
  getMetrics(): Record<StockProviderName, ProviderMetrics> {
    return { pixabay: { ...metrics.pixabay }, unsplash: { ...metrics.unsplash } };
  }

  /** Availability of every provider for this user (own key or platform key). */
  async statuses(userId: string): Promise<Record<StockProviderName, boolean>> {
    const names = Object.keys(this.providers) as StockProviderName[];
    const entries = await Promise.all(
      names.map(
        async (n) =>
          [n, (await this.providers[n].resolveKey(userId)) !== null] as const,
      ),
    );
    return Object.fromEntries(entries) as Record<StockProviderName, boolean>;
  }

  async search(
    userId: string,
    name: StockProviderName,
    params: StockSearchParams,
  ): Promise<StockPhoto[]> {
    const provider = this.get(name);
    const apiKey = await this.requireKey(userId, provider);

    const q = params.q.trim();
    const orientation = params.orientation ?? 'all';
    const color = params.color ?? 'any';
    const order = params.order ?? 'popular';
    const cacheKey = `${name}|${q.toLowerCase()}|${orientation}|${color}|${order}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      metrics[name].cacheHits += 1;
      return cached;
    }

    this.throttle(name, apiKey);
    try {
      const results = await provider.search(apiKey, {
        q,
        orientation,
        color,
        order,
      });
      metrics[name].searches += 1;
      searchCache.set(cacheKey, results);
      return results;
    } catch (err) {
      metrics[name].errors += 1;
      throw err;
    }
  }

  /**
   * Download a chosen photo to our storage and record it with provenance.
   * Per-user dedupe: same provider image already imported ⇒ reuse it. The
   * media layer also dedupes by content hash across providers.
   */
  async import(
    userId: string,
    name: StockProviderName,
    id: string,
  ): Promise<MediaAsset> {
    const provider = this.get(name);
    const apiKey = await this.requireKey(userId, provider);

    const existing = (await mediaRepository.findByUser(userId)).find(
      (m) => m.provenance?.source === name && m.provenance.sourceId === id,
    );
    if (existing) return existing;

    this.throttle(name, apiKey);
    const hit = await provider.resolve(apiKey, id);
    if (!hit) throw AppError.notFound('image');

    const res = await fetch(hit.downloadUrl);
    if (!res.ok) {
      throw new AppError(502, 'STOCK_ERROR', 'Could not download the image.');
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    // Register the download with the provider (e.g. Unsplash ToS). Best-effort.
    hit.track?.();

    const asset = await mediaService.importExternal(
      userId,
      buffer,
      hit.altFallback,
      {
        source: name,
        sourceId: id,
        author: hit.author,
        sourceUrl: hit.sourceUrl,
        license: hit.license,
        licenseUrl: hit.licenseUrl,
        retrievedAt: now(),
      },
    );
    metrics[name].imports += 1;
    return asset;
  }
}

export const stockService = new StockService();
