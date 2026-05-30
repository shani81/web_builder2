import type { Block } from '@buildr/types';
import { slugify } from '@buildr/utils';
import { getBlockDefinition } from './registry';
import { str } from './types';

/** Renders a single block from its JSON data using the registry component. */
export function BlockRenderer({
  block,
  linkBase,
}: {
  block: Block;
  /** Published site root for resolving internal page links (optional). */
  linkBase?: string;
}) {
  const def = getBlockDefinition(block.type);
  if (!def) {
    return (
      <div className="px-8 py-6 text-center text-sm text-black/40">
        Unsupported block: {block.type}
      </div>
    );
  }
  const { Component } = def;
  const rendered = <Component props={block.props} linkBase={linkBase} />;

  // An optional anchor id makes the block a target for in-page "#id" links.
  // scroll-margin-top keeps it clear of a sticky navbar when scrolled to.
  const anchorId = slugify(str(block.props.anchorId));
  if (!anchorId) return rendered;
  return (
    <div id={anchorId} style={{ scrollMarginTop: '5rem' }}>
      {rendered}
    </div>
  );
}
