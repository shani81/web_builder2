import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/templates',
  '/analytics',
  '/submissions',
  '/settings',
  '/editor',
];
const AUTH_PAGES = ['/login', '/register'];

// Hosts that are NOT a published-site subdomain.
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'buildr']);

/**
 * Extract a published-site subdomain from the Host header, e.g.
 * `acme.buildr.app` or `acme.localhost:3000` → "acme". Returns null for the
 * apex host or reserved names.
 */
function extractSubdomain(host: string): string | null {
  const hostname = host.split(':')[0] ?? '';
  const match = /^([a-z0-9-]+)\.(?:buildr\.app|localhost)$/.exec(hostname);
  const sub = match?.[1];
  if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}

/**
 * Two responsibilities:
 *  1. Subdomain routing: `{sub}.buildr.app/*` is rewritten to `/s/{sub}/*` so
 *     published sites render. (Path-based `/s/{sub}` also works directly.)
 *  2. Auth gating via the `buildr_session` hint cookie (redirect UX only).
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const sub = extractSubdomain(request.headers.get('host') ?? '');
  if (sub && !pathname.startsWith('/s/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/s/${sub}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  const isAuthed = request.cookies.get('buildr_session')?.value === '1';

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets, so subdomain
  // hosts can be rewritten on any path.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
