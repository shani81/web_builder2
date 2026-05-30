import type { StockPhoto, StockSearchParams } from '@buildr/types';
import {
  unsplashEnvKey,
  unsplashGetById,
  unsplashSearch,
  unsplashTrackDownload,
} from '../unsplash.service.js';
import type { DownloadablePhoto, StockProvider } from './provider.js';

const LICENSE = 'Unsplash License';
const LICENSE_URL = 'https://unsplash.com/license';

export const unsplashProvider: StockProvider = {
  name: 'unsplash',

  // Unsplash uses a single platform key (no per-user keys in v1).
  resolveKey() {
    return Promise.resolve(unsplashEnvKey());
  },

  search(apiKey, params: StockSearchParams): Promise<StockPhoto[]> {
    return unsplashSearch(apiKey, params);
  },

  async resolve(apiKey, id): Promise<DownloadablePhoto | null> {
    const hit = await unsplashGetById(apiKey, id);
    if (!hit) return null;
    return {
      downloadUrl: hit.downloadUrl,
      author: hit.author,
      sourceUrl: hit.sourceUrl,
      altFallback: hit.tags,
      license: LICENSE,
      licenseUrl: LICENSE_URL,
      track: () => unsplashTrackDownload(apiKey, hit.downloadLocation),
    };
  },
};
