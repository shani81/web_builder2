import type { CSSProperties } from 'react';
import type { ImageCredit, Page, SiteTheme } from '@buildr/types';
import { BlockRenderer } from '@/components/blocks/block-renderer';

// Unsplash asks that referral links carry UTM params; harmless for others.
function creditHref(credit: ImageCredit): string {
  if (credit.source !== 'unsplash' || !credit.sourceUrl) return credit.sourceUrl;
  const sep = credit.sourceUrl.includes('?') ? '&' : '?';
  return `${credit.sourceUrl}${sep}utm_source=buildr&utm_medium=referral`;
}

const PROVIDER_LABEL: Record<ImageCredit['source'], string> = {
  pixabay: 'Pixabay',
  unsplash: 'Unsplash',
  upload: '',
};

/** Attribution footer for stock photos used on the page. */
function PhotoCredits({ credits }: { credits: ImageCredit[] }) {
  if (credits.length === 0) return null;
  return (
    <footer
      className="px-8 py-6 text-center text-xs opacity-60"
      style={{ borderTop: '1px solid currentColor' }}
    >
      <span>Photos: </span>
      {credits.map((credit, i) => (
        <span key={`${credit.source}-${credit.author}-${i}`}>
          {i > 0 ? ', ' : ''}
          {credit.sourceUrl ? (
            <a
              href={creditHref(credit)}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              {credit.author}
            </a>
          ) : (
            credit.author
          )}
          {PROVIDER_LABEL[credit.source]
            ? ` on ${PROVIDER_LABEL[credit.source]}`
            : ''}
        </span>
      ))}
    </footer>
  );
}

/**
 * Renders a published page. The site theme drives CSS variables so the shared
 * block components (which use `var(--color-brand)`) adopt the site's brand.
 * This is a server component — the same blocks used in the editor and previews.
 */
export function PublishedRenderer({
  theme,
  page,
  linkBase,
  credits = [],
}: {
  theme: SiteTheme;
  page: Page;
  /** Published site root (e.g. "/s/acme") so internal page links resolve. */
  linkBase?: string;
  /** Stock-photo attributions to render as a footer credit. */
  credits?: ImageCredit[];
}) {
  const style = {
    '--color-brand': theme.primaryColor,
    background: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: `${theme.fontBody}, ui-sans-serif, system-ui, sans-serif`,
    minHeight: '100dvh',
  } as CSSProperties;

  return (
    <div style={style}>
      {page.blocks
        .filter((block) => block.visible !== false)
        .map((block) => (
          <BlockRenderer key={block.id} block={block} linkBase={linkBase} />
        ))}
      <PhotoCredits credits={credits} />
    </div>
  );
}
