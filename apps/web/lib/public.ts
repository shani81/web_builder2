import type { LockedSite, PublicSite } from '@buildr/types';
import { env } from './env';

export type PublicSiteResult = PublicSite | LockedSite;

/** Type guard: the public read returned a "needs a password" marker. */
export function isLocked(result: PublicSiteResult): result is LockedSite {
  return 'locked' in result && result.locked === true;
}

/**
 * Server-side fetch of a published site by subdomain. Public (no credentials),
 * always fresh so edits appear immediately after a re-publish. When the site is
 * password-protected, pass the visitor's unlock token; without a valid one the
 * API returns a `locked` marker instead of the content.
 */
export async function fetchPublicSite(
  subdomain: string,
  unlockToken?: string,
): Promise<PublicSiteResult | null> {
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/public/sites/${encodeURIComponent(subdomain)}`,
    {
      cache: 'no-store',
      headers: unlockToken ? { 'x-unlock-token': unlockToken } : undefined,
    },
  );
  if (!res.ok) return null;
  const body = await res.json();
  return body?.success ? (body.data as PublicSiteResult) : null;
}
