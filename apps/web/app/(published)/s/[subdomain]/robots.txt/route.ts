import { env } from '@/lib/env';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subdomain: string }> },
) {
  const { subdomain } = await params;
  const sitemap = `${env.NEXT_PUBLIC_SITE_URL}/s/${subdomain}/sitemap.xml`;
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
