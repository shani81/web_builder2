import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPublicSite } from '@/lib/public';
import { PublishedRenderer } from '@/components/published/published-renderer';
import { AnalyticsBeacon } from '@/components/published/analytics-beacon';

type Params = Promise<{ subdomain: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const site = await fetchPublicSite(subdomain);
  const page = site?.pages.find((p) => p.slug === slug);
  if (!site || !page) return { title: 'Page not found' };

  const title = page.seo.metaTitle || `${page.title} · ${site.name}`;
  const description = page.seo.metaDescription || undefined;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: page.seo.ogImage ? [page.seo.ogImage] : undefined,
    },
    robots: page.seo.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function PublishedPage({ params }: { params: Params }) {
  const { subdomain, slug } = await params;
  const site = await fetchPublicSite(subdomain);
  const page = site?.pages.find((p) => p.slug === slug);
  if (!site || !page) notFound();

  return (
    <>
      <PublishedRenderer
        theme={site.theme}
        page={page}
        linkBase={`/s/${subdomain}`}
      />
      <AnalyticsBeacon subdomain={subdomain} path={`/${slug}`} />
    </>
  );
}
