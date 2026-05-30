import type { Page } from '@buildr/types';
import type { SavePageInput } from '@buildr/schemas';
import { apiFetch } from './api-client';

export function getPage(siteId: string, pageId: string): Promise<Page> {
  return apiFetch(`/sites/${siteId}/pages/${pageId}`);
}

export function savePage(
  siteId: string,
  pageId: string,
  input: SavePageInput,
): Promise<Page> {
  return apiFetch(`/sites/${siteId}/pages/${pageId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
