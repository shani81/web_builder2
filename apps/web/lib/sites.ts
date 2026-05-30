import type {
  PublishedVersionMeta,
  PublishStatus,
  Site,
  SiteSummary,
} from '@buildr/types';
import type { CreateSiteInput, UpdateSiteInput } from '@buildr/schemas';
import { apiFetch } from './api-client';

export function listSites(): Promise<SiteSummary[]> {
  return apiFetch('/sites');
}

export function getSite(id: string): Promise<Site> {
  return apiFetch(`/sites/${id}`);
}

export function createSite(input: CreateSiteInput): Promise<Site> {
  return apiFetch('/sites', { method: 'POST', body: JSON.stringify(input) });
}

export function updateSite(id: string, input: UpdateSiteInput): Promise<Site> {
  return apiFetch(`/sites/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteSite(id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/sites/${id}`, { method: 'DELETE' });
}

export function duplicateSite(id: string): Promise<Site> {
  return apiFetch(`/sites/${id}/duplicate`, { method: 'POST' });
}

export function publishSite(id: string, scheduledAt?: string): Promise<Site> {
  return apiFetch(`/sites/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify(scheduledAt ? { scheduledAt } : {}),
  });
}

export function getPublishStatus(id: string): Promise<PublishStatus> {
  return apiFetch(`/sites/${id}/publish-status`);
}

export function listSiteVersions(id: string): Promise<PublishedVersionMeta[]> {
  return apiFetch(`/sites/${id}/versions`);
}

export function rollbackSite(
  id: string,
  version: number,
): Promise<PublishedVersionMeta[]> {
  return apiFetch(`/sites/${id}/rollback`, {
    method: 'POST',
    body: JSON.stringify({ version }),
  });
}
