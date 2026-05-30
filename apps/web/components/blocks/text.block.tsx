import type { CSSProperties } from 'react';
import { str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

export function TextBlock({ props, blockId }: BlockComponentProps) {
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
          <InlineText
            as="h2"
            blockId={blockId}
            field="heading"
            value={heading}
            className="mb-3 text-2xl font-semibold"
          />
        ) : null}
        <InlineText
          as="p"
          blockId={blockId}
          field="content"
          value={content}
          multiline
          className="whitespace-pre-line leading-relaxed text-black/70"
        />
      </div>
    </div>
  );
}
