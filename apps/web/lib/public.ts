import type { PublicSite } from '@buildr/types';
import { env } from './env';

/**
 * Server-side fetch of a published site by subdomain. Public (no credentials),
 * always fresh so edits appear immediately after a re-publish.
 */
export async function fetchPublicSite(
  subdomain: string,
): Promise<PublicSite | null> {
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/public/sites/${encodeURIComponent(subdomain)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return null;
  const body = await res.json();
  return body?.success ? (body.data as PublicSite) : null;
}
