import type { CSSProperties } from 'react';
import { num, str, type BlockComponentProps } from './types';

/**
 * A horizontal divider ("section break"). Optionally shows a label, positioned
 * left / center / right, with lines filling the remaining space. Line color,
 * thickness, style, and the vertical spacing around it are all configurable.
 */
export function DividerBlock({ props }: BlockComponentProps) {
  const text = str(props.text);
  const position = str(props.position, 'center');
  const color = str(props.color, '#E5E7EB');
  const textColor = str(props.textColor, '#6B7280');
  const thickness = Math.min(Math.max(num(props.thickness, 1), 1), 12);
  const lineStyle = str(props.lineStyle, 'solid');
  const spacingY = Math.min(Math.max(num(props.spacingY, 24), 0), 160);

  const wrap: CSSProperties = {
    paddingTop: `${spacingY}px`,
    paddingBottom: `${spacingY}px`,
    paddingLeft: '2rem',
    paddingRight: '2rem',
  };
  const lineStyleCss: CSSProperties = {
    flex: 1,
    borderTop: `${thickness}px ${lineStyle} ${color}`,
  };

  if (!text) {
    return (
      <div style={wrap}>
        <div style={{ borderTop: `${thickness}px ${lineStyle} ${color}` }} />
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div className="flex items-center gap-3">
        {position !== 'left' ? <span aria-hidden style={lineStyleCss} /> : null}
        <span
          className="whitespace-nowrap text-sm font-medium"
          style={{ color: textColor }}
        >
          {text}
        </span>
        {position !== 'right' ? (
          <span aria-hidden style={lineStyleCss} />
        ) : null}
      </div>
    </div>
  );
}
