import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

const UNLOCK_MAX_AGE = 60 * 60 * 12; // 12h, matches the API token TTL

/**
 * Verify a visitor password via the API and, on success, set an httpOnly
 * unlock cookie on the web origin. The published page reads this cookie and
 * forwards the token to the API to authorize the protected content.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ subdomain: string }> },
): Promise<NextResponse> {
  const { subdomain } = await ctx.params;
  const { password } = (await request.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/public/sites/${encodeURIComponent(
      subdomain,
    )}/unlock`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    },
  );
  const body = await res.json().catch(() => null);
  const token = res.ok ? body?.data?.token : null;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`buildr_unlock_${subdomain}`, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: `/s/${subdomain}`,
    maxAge: UNLOCK_MAX_AGE,
  });
  return response;
}
