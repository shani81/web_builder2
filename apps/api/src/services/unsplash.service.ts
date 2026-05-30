import type { StockPhoto, StockSearchParams } from '@buildr/types';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

const BASE = 'https://api.unsplash.com';

/** Platform Unsplash key from env, if configured. */
export function unsplashEnvKey(): string | null {
  const key = env.UNSPLASH_ACCESS_KEY?.trim();
  return key ? key : null;
}

interface UnsplashApiPhoto {
  id: string;
  width: number;
  height: number;
  urls: { thumb: string; small: string; regular: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string; download_location: string };
}

function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Client-ID ${apiKey}` };
}

// Unsplash uses its own orientation vocabulary.
function mapOrientation(o: StockSearchParams['orientation']): string | null {
  if (o === 'horizontal') return 'landscape';
  if (o === 'vertical') return 'portrait';
  return null;
}

function toStockPhoto(p: UnsplashApiPhoto): StockPhoto {
  return {
    id: p.id,
    thumbUrl: p.urls.thumb,
    previewUrl: p.urls.small,
    width: p.width,
    height: p.height,
    author: p.user.name,
    pageUrl: p.user.links.html,
    tags: p.alt_description ?? p.description ?? '',
  };
}

export async function unsplashSearch(
  apiKey: string,
  params: StockSearchParams,
): Promise<StockPhoto[]> {
  const query = new URLSearchParams({
    query: params.q,
    per_page: '24',
    content_filter: 'high',
  });
  const orientation = mapOrientation(params.orientation);
  if (orientation) query.set('orientation', orientation);

  const res = await fetch(`${BASE}/search/photos?${query.toString()}`, {
    headers: authHeaders(apiKey),
  });
  if (res.status === 429) {
    throw new AppError(
      429,
      'RATE_LIMIT',
      'Image search is busy right now — please try again in a moment.',
    );
  }
  if (!res.ok) {
    throw new AppError(502, 'UNSPLASH_ERROR', 'Image search failed.');
  }
  const data = (await res.json()) as { results?: UnsplashApiPhoto[] };
  return (data.results ?? []).map(toStockPhoto);
}

export interface UnsplashResolved {
  downloadUrl: string;
  author: string;
  sourceUrl: string;
  tags: string;
  /** Unsplash requires pinging this when a photo is downloaded/used. */
  downloadLocation: string;
}

export async function unsplashGetById(
  apiKey: string,
  id: string,
): Promise<UnsplashResolved | null> {
  const res = await fetch(`${BASE}/photos/${encodeURIComponent(id)}`, {
    headers: authHeaders(apiKey),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new AppError(502, 'UNSPLASH_ERROR', 'Could not load the image.');
  }
  const p = (await res.json()) as UnsplashApiPhoto;
  return {
    downloadUrl: p.urls.regular,
    author: p.user.name,
    sourceUrl: p.links.html,
    tags: p.alt_description ?? p.description ?? '',
    downloadLocation: p.links.download_location,
  };
}

/** Register a download with Unsplash (ToS requirement). Best-effort, never throws. */
export function unsplashTrackDownload(apiKey: string, location: string): void {
  if (!location) return;
  void fetch(location, { headers: authHeaders(apiKey) }).catch(() => {
    // Best-effort; the import already succeeded.
  });
}
