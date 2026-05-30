import type { StockPhoto, StockSearchParams } from '@buildr/types';
import { authService } from '../auth.service.js';
import {
  pixabayEnvKey,
  pixabayGetById,
  pixabaySearch,
} from '../pixabay.service.js';
import type { DownloadablePhoto, StockProvider } from './provider.js';

const LICENSE = 'Pixabay Content License';
const LICENSE_URL = 'https://pixabay.com/service/license-summary/';

export const pixabayProvider: StockProvider = {
  name: 'pixabay',

  async resolveKey(userId) {
    const own = (await authService.getStockKey(userId))?.trim();
    return own ? own : pixabayEnvKey();
  },

  search(apiKey, params: StockSearchParams): Promise<StockPhoto[]> {
    return pixabaySearch(apiKey, params);
  },

  async resolve(apiKey, id): Promise<DownloadablePhoto | null> {
    const hit = await pixabayGetById(apiKey, id);
    if (!hit) return null;
    return {
      downloadUrl: hit.largeImageURL,
      author: hit.author,
      sourceUrl: hit.pageURL,
      altFallback: hit.tags.split(',').slice(0, 3).join(', '),
      license: LICENSE,
      licenseUrl: LICENSE_URL,
    };
  },
};
