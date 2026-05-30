import { fetchPublicSite } from '@/lib/public';
import { env } from '@/lib/env';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subdomain: string }> },
) {
  const { subdomain } = await params;
  const site = await fetchPublicSite(subdomain);
  if (!site) return new Response('Not found', { status: 404 });

  const base = `${env.NEXT_PUBLIC_SITE_URL}/s/${site.subdomain}`;
  const urls = site.pages
    .filter((page) => !page.seo.noIndex)
    .map((page) => {
      const loc = page.isHome ? base : `${base}/${page.slug}`;
      return `  <url><loc>${loc}</loc><lastmod>${page.updatedAt}</lastmod></url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
