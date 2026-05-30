import type {
  MediaAsset,
  StockPhoto,
  StockProviderName,
  StockSearchParams,
} from '@buildr/types';
import { apiFetch } from './api-client';

export type { StockProviderName, StockSearchParams } from '@buildr/types';
export type StockOrientation = 'all' | 'horizontal' | 'vertical';

export type StockStatus = Record<StockProviderName, boolean>;

export function stockStatus(): Promise<StockStatus> {
  return apiFetch('/media/stock/status');
}

export function searchStock(
  provider: StockProviderName,
  params: StockSearchParams,
): Promise<StockPhoto[]> {
  const query = new URLSearchParams({ provider, q: params.q });
  if (params.orientation && params.orientation !== 'all') {
    query.set('orientation', params.orientation);
  }
  if (params.color && params.color !== 'any') query.set('color', params.color);
  if (params.order) query.set('order', params.order);
  return apiFetch(`/media/stock/search?${query.toString()}`);
}

/** Download + store a chosen stock photo; returns the new media asset. */
export function importStock(
  provider: StockProviderName,
  id: string,
): Promise<MediaAsset> {
  return apiFetch('/media/stock/import', {
    method: 'POST',
    body: JSON.stringify({ provider, id }),
  });
}
