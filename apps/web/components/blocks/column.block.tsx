import type { CSSProperties, ReactNode } from 'react';
import type { Block } from '@buildr/types';
import { num, str } from './types';

const VALIGN: Record<string, string> = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
};

/**
 * Presentational column (a box inside a Section). Holds stacked content blocks.
 * Padding / background / vertical alignment are read defensively so Phase 3 can
 * expose them without changing the renderer.
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

  const style: CSSProperties = {
    ...(padding ? { padding } : {}),
    ...(background ? { background } : {}),
  };

  return (
    <div
      style={style}
      className={`flex min-w-0 flex-col gap-4 ${VALIGN[valign] ?? VALIGN.top}`}
    >
      {children}
    </div>
  );
}
