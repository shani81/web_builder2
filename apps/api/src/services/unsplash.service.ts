import type { UnsplashPhoto } from '@buildr/types';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

export function unsplashEnabled(): boolean {
  return Boolean(env.UNSPLASH_ACCESS_KEY);
}

interface UnsplashApiPhoto {
  id: string;
  urls: { thumb: string; regular: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
}

/** Search Unsplash and map results to the simplified client shape. */
export async function searchUnsplash(query: string): Promise<UnsplashPhoto[]> {
  if (!env.UNSPLASH_ACCESS_KEY) {
    throw new AppError(
      503,
      'UNSPLASH_DISABLED',
      'Unsplash search requires an UNSPLASH_ACCESS_KEY on the server.',
    );
  }

  const url = `https://api.unsplash.com/search/photos?per_page=24&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` },
  });
  if (!res.ok) {
    throw new AppError(502, 'UNSPLASH_ERROR', 'Unsplash request failed.');
  }

  const data = (await res.json()) as { results?: UnsplashApiPhoto[] };
  return (data.results ?? []).map((p) => ({
    id: p.id,
    thumbUrl: p.urls.thumb,
    url: p.urls.regular,
    alt: p.alt_description ?? p.description ?? '',
    author: p.user.name,
    authorUrl: p.user.links.html,
  }));
}
