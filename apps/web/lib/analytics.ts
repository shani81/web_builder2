import type { AnalyticsSummary } from '@buildr/types';
import { apiFetch } from './api-client';
import { env } from './env';

export function getAnalytics(siteId: string): Promise<AnalyticsSummary> {
  return apiFetch(`/sites/${siteId}/analytics`);
}

/** Best-effort, fire-and-forget page-view tracking from a published site. */
export function trackView(
  subdomain: string,
  path: string,
  isNew: boolean,
): void {
  const url = `${env.NEXT_PUBLIC_API_URL}/public/sites/${encodeURIComponent(
    subdomain,
  )}/track`;
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, new: isNew }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let analytics break the page.
  }
}
