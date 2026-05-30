import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPublicSite } from '@/lib/public';
import { PublishedRenderer } from '@/components/published/published-renderer';
import { AnalyticsBeacon } from '@/components/published/analytics-beacon';

type Params = Promise<{ subdomain: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await fetchPublicSite(subdomain);
  if (!site) return { title: 'Site not found' };

  const page = site.pages.find((p) => p.isHome) ?? site.pages[0];
  const title = page?.seo.metaTitle || site.name;
  const description = page?.seo.metaDescription || undefined;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: page?.seo.ogImage ? [page.seo.ogImage] : undefined,
    },
    robots: page?.seo.noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function PublishedHome({ params }: { params: Params }) {
  const { subdomain } = await params;
  const site = await fetchPublicSite(subdomain);
  if (!site) notFound();

  const page = site.pages.find((p) => p.isHome) ?? site.pages[0];
  if (!page) notFound();

  return (
    <>
      <PublishedRenderer
        theme={site.theme}
        page={page}
        linkBase={`/s/${subdomain}`}
      />
      <AnalyticsBeacon subdomain={subdomain} path="/" />
    </>
  );
}
