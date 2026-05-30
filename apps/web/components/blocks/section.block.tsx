import type { CSSProperties, ReactNode } from 'react';
import type { Block } from '@buildr/types';
import { num, str } from './types';
import { sectionGridCss } from './section-layouts';

const WIDTH_CLASS: Record<string, string> = {
  contained: 'mx-auto w-full max-w-5xl',
  wide: 'mx-auto w-full max-w-7xl',
  full: 'w-full',
};

/** Column ratios from props, falling back to equal columns by child count. */
export function sectionColumns(block: Block): number[] {
  const raw = block.props.columns;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((n) => (typeof n === 'number' && n > 0 ? n : 1));
  }
  const count = block.children?.length ?? 1;
  return Array.from({ length: Math.max(1, count) }, () => 1);
}

/**
 * Presentational Columns/Section: a responsive grid whose cells (`children`)
 * auto-stack to one column on narrow containers. Used by the published
 * renderer and previews; the editor reuses it as the layout shell.
 */
export function SectionBlock({
  block,
  children,
}: {
  block: Block;
  children: ReactNode;
}) {
  const columns = sectionColumns(block);
  const gap = num(block.props.gap, 24);
  const width = str(block.props.width, 'contained');
  const paddingY = num(block.props.paddingY, 48);
  const background = str(block.props.background);

  const sectionStyle: CSSProperties = {
    containerType: 'inline-size',
    paddingTop: paddingY,
    paddingBottom: paddingY,
    ...(background ? { background } : {}),
  };

  return (
    <section style={sectionStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: sectionGridCss(block.id, columns, gap),
        }}
      />
      <div className={`px-6 ${WIDTH_CLASS[width] ?? WIDTH_CLASS.contained}`}>
        <div data-bsec={block.id}>{children}</div>
      </div>
    </section>
  );
}
