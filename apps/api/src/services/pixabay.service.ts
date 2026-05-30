import type { StockPhoto, StockSearchParams } from '@buildr/types';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

const BASE = 'https://pixabay.com/api/';

/** Platform-wide key from env, if configured (used as a fallback). */
export function pixabayEnvKey(): string | null {
  const key = env.PIXABAY_API_KEY?.trim();
  return key ? key : null;
}

interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
}

function toStockPhoto(hit: PixabayHit): StockPhoto {
  return {
    id: String(hit.id),
    thumbUrl: hit.previewURL,
    previewUrl: hit.webformatURL,
    width: hit.imageWidth,
    height: hit.imageHeight,
    author: hit.user,
    pageUrl: hit.pageURL,
    tags: hit.tags,
  };
}

async function call(
  apiKey: string,
  params: Record<string, string>,
): Promise<PixabayHit[]> {
  const query = new URLSearchParams({
    key: apiKey,
    ...params,
  }).toString();
  const res = await fetch(`${BASE}?${query}`);
  if (res.status === 429) {
    throw new AppError(
      429,
      'RATE_LIMIT',
      'Image search is busy right now — please try again in a moment.',
    );
  }
  if (!res.ok) {
    throw new AppError(502, 'PIXABAY_ERROR', 'Image search failed.');
  }
  const data = (await res.json()) as { hits?: PixabayHit[] };
  return data.hits ?? [];
}

/** Search photos (safesearch on, photos only for v1). */
export async function pixabaySearch(
  apiKey: string,
  params: StockSearchParams,
  perPage = 24,
): Promise<StockPhoto[]> {
  const { q, orientation = 'all', color = 'any', order = 'popular' } = params;
  const hits = await call(apiKey, {
    q,
    image_type: 'photo',
    safesearch: 'true',
    orientation,
    order,
    per_page: String(perPage),
    // Pixabay treats an absent `colors` param as "any".
    ...(color !== 'any' ? { colors: color } : {}),
  });
  return hits.map(toStockPhoto);
}

/** Fetch a single image by id (for download-on-pick). */
export async function pixabayGetById(
  apiKey: string,
  id: string,
): Promise<{
  largeImageURL: string;
  author: string;
  pageURL: string;
  tags: string;
} | null> {
  const hits = await call(apiKey, { id });
  const hit = hits[0];
  return hit
    ? {
        largeImageURL: hit.largeImageURL,
        author: hit.user,
        pageURL: hit.pageURL,
        tags: hit.tags,
      }
    : null;
}
