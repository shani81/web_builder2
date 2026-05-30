import type { MediaAsset, StockPhoto, StockSearchParams } from '@buildr/types';
import { apiFetch } from './api-client';

export type { StockSearchParams } from '@buildr/types';
export type StockOrientation = 'all' | 'horizontal' | 'vertical';

export function stockStatus(): Promise<{ enabled: boolean }> {
  return apiFetch('/media/stock/status');
}

export function searchStock(params: StockSearchParams): Promise<StockPhoto[]> {
  const query = new URLSearchParams({ q: params.q });
  if (params.orientation && params.orientation !== 'all') {
    query.set('orientation', params.orientation);
  }
  if (params.color && params.color !== 'any') query.set('color', params.color);
  if (params.order) query.set('order', params.order);
  return apiFetch(`/media/stock/search?${query.toString()}`);
}

/** Download + store a chosen stock photo; returns the new media asset. */
export function importStock(id: string): Promise<MediaAsset> {
  return apiFetch('/media/stock/import', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}
