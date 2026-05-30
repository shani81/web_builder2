import type { CookieSerializeOptions } from '@fastify/cookie';
import { isProd } from './env.js';

/** Token lifetimes. Access is short-lived; refresh is long-lived. */
export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL = '7d';
export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // seconds
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // seconds

/** httpOnly cookie names carrying the JWTs. */
export const COOKIE = {
  access: 'buildr_at',
  refresh: 'buildr_rt',
} as const;

/** Refresh cookie is scoped to the auth routes so it isn't sent everywhere. */
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

const base = (): CookieSerializeOptions => ({
  httpOnly: true,
  // localhost:3000 -> localhost:4001 is same-site (registrable domain), so
  // Lax cookies are sent on these requests. Secure only in production (HTTPS).
  sameSite: 'lax',
  secure: isProd,
});

export function accessCookieOptions(): CookieSerializeOptions {
  return { ...base(), path: '/', maxAge: ACCESS_TOKEN_MAX_AGE };
}

export function refreshCookieOptions(persist: boolean): CookieSerializeOptions {
  return {
    ...base(),
    path: REFRESH_COOKIE_PATH,
    // When "remember me" is off, omit maxAge so it becomes a session cookie.
    ...(persist ? { maxAge: REFRESH_TOKEN_MAX_AGE } : {}),
  };
}

export function clearCookieOptions(path: string): CookieSerializeOptions {
  return { ...base(), path };
}
