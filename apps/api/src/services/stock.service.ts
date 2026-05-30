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
import { AppError } from '../utils/response.js';

const ONE_DAY = 24 * 60 * 60 * 1000;

// Respect provider "cache responses for 24h" rules; keyed incl. provider + filters.
const searchCache = new TTLCache<StockPhoto[]>(ONE_DAY);

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
    if (cached) return cached;

    const results = await provider.search(apiKey, {
      q,
      orientation,
      color,
      order,
    });
    searchCache.set(cacheKey, results);
    return results;
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

    const hit = await provider.resolve(apiKey, id);
    if (!hit) throw AppError.notFound('image');

    const res = await fetch(hit.downloadUrl);
    if (!res.ok) {
      throw new AppError(502, 'STOCK_ERROR', 'Could not download the image.');
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    // Register the download with the provider (e.g. Unsplash ToS). Best-effort.
    hit.track?.();

    return mediaService.importExternal(userId, buffer, hit.altFallback, {
      source: name,
      sourceId: id,
      author: hit.author,
      sourceUrl: hit.sourceUrl,
      license: hit.license,
      licenseUrl: hit.licenseUrl,
      retrievedAt: now(),
    });
  }
}

export const stockService = new StockService();
