import type { FormSubmission } from '@buildr/types';
import { apiFetch } from './api-client';

export function getSubmissions(siteId: string): Promise<FormSubmission[]> {
  return apiFetch(`/sites/${siteId}/submissions`);
}

export function deleteSubmission(
  siteId: string,
  id: string,
): Promise<{ deleted: boolean }> {
  return apiFetch(`/sites/${siteId}/submissions/${id}`, { method: 'DELETE' });
}
