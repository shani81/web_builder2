import type { ApiResponse } from '@buildr/types';
import { env } from './env';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Endpoints where a 401 is a genuine auth result, not an expired access token —
// attempting a silent refresh-and-retry on these makes no sense.
const NO_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

// The access token is short-lived (15m). When it expires, the API returns 401;
// a single shared refresh call rotates the cookies so concurrent 401s don't each
// fire their own refresh. Resolves true if the session was renewed.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/**
 * Thin fetch wrapper around the BUILDR API. Unwraps the standard response
 * envelope and throws a typed error on failure. On a 401 from an expired access
 * token it transparently refreshes the session once and retries. Server state
 * should be consumed through React Query using this client.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  retry = false,
): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      // Only declare a JSON body when we actually send one.
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    credentials: 'include',
  });

  if (
    res.status === 401 &&
    !retry &&
    !NO_REFRESH.some((p) => path.startsWith(p))
  ) {
    if (await refreshSession()) {
      return apiFetch<T>(path, init, true);
    }
  }

  const body = (await res.json()) as ApiResponse<T>;

  if (!body.success) {
    throw new ApiClientError(
      body.error.code,
      body.error.message,
      res.status,
      body.error.details,
    );
  }

  return body.data;
}
