import type { CSSProperties } from 'react';
import { str, type BlockComponentProps } from './types';

export function TextBlock({ props }: BlockComponentProps) {
  const heading = str(props.heading, '');
  const content = str(
    props.content,
    'Write something meaningful here. Click to edit this text block.',
  );
  const align = str(props.align, 'left') as CSSProperties['textAlign'];

  return (
    <div className="px-8 py-12" style={{ textAlign: align }}>
      <div className="mx-auto max-w-2xl">
        {heading ? (
          <h2 className="mb-3 text-2xl font-semibold">{heading}</h2>
        ) : null}
        <p className="whitespace-pre-line leading-relaxed text-black/70">
          {content}
        </p>
      </div>
    </div>
  );
}
