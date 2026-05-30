import { now } from '@buildr/utils';
import type { MediaAsset, StockPhoto, StockSearchParams } from '@buildr/types';
import { mediaRepository } from '../repositories/media.repository.js';
import { authService } from './auth.service.js';
import { mediaService } from './media.service.js';
import {
  pixabayEnvKey,
  pixabayGetById,
  pixabaySearch,
} from './pixabay.service.js';
import { TTLCache } from '../utils/cache.js';
import { AppError } from '../utils/response.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const LICENSE = 'Pixabay Content License';
const LICENSE_URL = 'https://pixabay.com/service/license-summary/';

// Respect Pixabay's "cache responses for 24h" rule.
const searchCache = new TTLCache<StockPhoto[]>(ONE_DAY);

export class StockService {
  /** Resolve the Pixabay key to use: the user's own key, else the platform env key. */
  private async resolveKey(userId: string): Promise<string | null> {
    const own = (await authService.getStockKey(userId))?.trim();
    return own ? own : pixabayEnvKey();
  }

  /** The resolved key, or a 503 if neither a user key nor a platform key exists. */
  private async requireKey(userId: string): Promise<string> {
    const key = await this.resolveKey(userId);
    if (!key) {
      throw new AppError(
        503,
        'STOCK_DISABLED',
        'Stock photos are not configured. Add your Pixabay API key in Settings.',
      );
    }
    return key;
  }

  /** Whether stock search is available for this user (own key or platform key). */
  async enabled(userId: string): Promise<boolean> {
    return (await this.resolveKey(userId)) !== null;
  }

  async search(
    userId: string,
    params: StockSearchParams,
  ): Promise<StockPhoto[]> {
    const apiKey = await this.requireKey(userId);
    const q = params.q.trim();
    const orientation = params.orientation ?? 'all';
    const color = params.color ?? 'any';
    const order = params.order ?? 'popular';
    const key = `${q.toLowerCase()}|${orientation}|${color}|${order}`;
    const cached = searchCache.get(key);
    if (cached) return cached;

    const results = await pixabaySearch(apiKey, { q, orientation, color, order });
    searchCache.set(key, results);
    return results;
  }

  /**
   * Download a chosen photo to our storage and record it with provenance.
   * Per-user dedupe: if the same Pixabay image was already imported, reuse it.
   */
  async import(userId: string, pixabayId: string): Promise<MediaAsset> {
    const apiKey = await this.requireKey(userId);

    const existing = (await mediaRepository.findByUser(userId)).find(
      (m) =>
        m.provenance?.source === 'pixabay' &&
        m.provenance.sourceId === pixabayId,
    );
    if (existing) return existing;

    const hit = await pixabayGetById(apiKey, pixabayId);
    if (!hit) throw AppError.notFound('image');

    const res = await fetch(hit.largeImageURL);
    if (!res.ok) {
      throw new AppError(502, 'PIXABAY_ERROR', 'Could not download the image.');
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const alt = hit.tags.split(',').slice(0, 3).join(', ');

    return mediaService.importExternal(userId, buffer, alt, {
      source: 'pixabay',
      sourceId: pixabayId,
      author: hit.author,
      sourceUrl: hit.pageURL,
      license: LICENSE,
      licenseUrl: LICENSE_URL,
      retrievedAt: now(),
    });
  }
}

export const stockService = new StockService();
