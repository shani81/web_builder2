import type { ReactNode } from 'react';
import type { Block } from '@buildr/types';
import { slugify } from '@buildr/utils';
import { getBlockDefinition } from './registry';
import { str } from './types';
import { blockAppearance } from './appearance';
import { SectionBlock } from './section.block';
import { ColumnBlock } from './column.block';
import { FeaturesBlock } from './features.block';

/** Renders a single block from its JSON data. Container blocks (section/column)
 * recurse into their children; everything else uses its registry component. */
export function BlockRenderer({
  block,
  linkBase,
}: {
  block: Block;
  /** Published site root for resolving internal page links (optional). */
  linkBase?: string;
}) {
  const children = (block.children ?? []).map((child) => (
    <BlockRenderer key={child.id} block={child} linkBase={linkBase} />
  ));

  let rendered: ReactNode;
  if (block.type === 'section') {
    rendered = <SectionBlock block={block}>{children}</SectionBlock>;
  } else if (block.type === 'column') {
    rendered = <ColumnBlock block={block}>{children}</ColumnBlock>;
  } else if (block.type === 'features') {
    // Container: renders its own feature-item children as cards.
    rendered = <FeaturesBlock block={block} linkBase={linkBase} />;
  } else {
    const def = getBlockDefinition(block.type);
    if (!def) {
      return (
        <div className="px-8 py-6 text-center text-sm text-black/40">
          Unsupported block: {block.type}
        </div>
      );
    }
    const { Component } = def;
    rendered = (
      <Component props={block.props} linkBase={linkBase} blockId={block.id} />
    );
  }

  // An optional anchor id makes the block a target for in-page "#id" links.
  // scroll-margin-top keeps it clear of a sticky navbar when scrolled to.
  // Optional appearance props (background, radius, width, spacing) wrap the
  // block too. When neither is set the block renders unwrapped, exactly as
  // before — so existing pages are unaffected.
  const anchorId = slugify(str(block.props.anchorId));
  const appearance = blockAppearance(block.props);
  if (!anchorId && !appearance.hasAny) return <>{rendered}</>;
  return (
    <div
      id={anchorId || undefined}
      style={{
        ...(anchorId ? { scrollMarginTop: '5rem' } : {}),
        ...appearance.style,
      }}
    >
      {rendered}
    </div>
  );
}
