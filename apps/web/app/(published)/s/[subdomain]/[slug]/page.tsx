import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { fetchPublicSite, isLocked } from '@/lib/public';
import { PublishedRenderer } from '@/components/published/published-renderer';
import { PasswordGate } from '@/components/published/password-gate';
import { AnalyticsBeacon } from '@/components/published/analytics-beacon';

type Params = Promise<{ subdomain: string; slug: string }>;

async function unlockToken(subdomain: string): Promise<string | undefined> {
  return (await cookies()).get(`buildr_unlock_${subdomain}`)?.value;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const result = await fetchPublicSite(subdomain, await unlockToken(subdomain));
  if (!result) return { title: 'Page not found' };
  if (isLocked(result)) {
    return { title: result.name, robots: { index: false, follow: false } };
  }
  const page = result.pages.find((p) => p.slug === slug);
  if (!page) return { title: 'Page not found' };

  const title = page.seo.metaTitle || `${page.title} · ${result.name}`;
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
  const result = await fetchPublicSite(subdomain, await unlockToken(subdomain));
  if (!result) notFound();
  if (isLocked(result)) {
    return <PasswordGate subdomain={subdomain} name={result.name} />;
  }
  const page = result.pages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <>
      <PublishedRenderer
        theme={result.theme}
        page={page}
        linkBase={`/s/${subdomain}`}
        credits={result.credits}
      />
      <AnalyticsBeacon subdomain={subdomain} path={`/${slug}`} />
    </>
  );
}
