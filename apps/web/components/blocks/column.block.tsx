import type { CSSProperties, ReactNode } from 'react';
import type { Block } from '@buildr/types';
import { bool, num, str } from './types';

const VALIGN: Record<string, string> = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
};

/**
 * Presentational column (a box inside a Section). Holds stacked content blocks.
 * Padding / background / vertical alignment are read defensively. When
 * `hiddenMobile` is set the column is hidden below the mobile breakpoint (via a
 * container query against the parent section).
 */
export function ColumnBlock({
  block,
  children,
}: {
  block: Block;
  children: ReactNode;
}) {
  const padding = num(block.props.padding, 0);
  const background = str(block.props.background);
  const valign = str(block.props.verticalAlign, 'top');
  const hiddenMobile = bool(block.props.hiddenMobile, false);

  const style: CSSProperties = {
    ...(padding ? { padding } : {}),
    ...(background ? { background } : {}),
  };

  return (
    <div
      data-col={block.id}
      style={style}
      className={`flex min-w-0 flex-col gap-4 ${VALIGN[valign] ?? VALIGN.top}`}
    >
      {hiddenMobile ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `@container (max-width:767px){[data-col="${block.id}"]{display:none;}}`,
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
