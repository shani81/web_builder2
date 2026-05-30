import type { CSSProperties } from 'react';
import type { Page, SiteTheme } from '@buildr/types';
import { BlockRenderer } from '@/components/blocks/block-renderer';

/**
 * Renders a published page. The site theme drives CSS variables so the shared
 * block components (which use `var(--color-brand)`) adopt the site's brand.
 * This is a server component — the same blocks used in the editor and previews.
 */
export function PublishedRenderer({
  theme,
  page,
  linkBase,
}: {
  theme: SiteTheme;
  page: Page;
  /** Published site root (e.g. "/s/acme") so internal page links resolve. */
  linkBase?: string;
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
    </div>
  );
}
