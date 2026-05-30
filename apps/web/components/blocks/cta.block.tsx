import type { CSSProperties } from 'react';
import { linkAttrs, str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

export function CtaBlock({ props, blockId }: BlockComponentProps) {
  const headline = str(props.headline, 'Ready to get started?');
  const subtext = str(
    props.subtext,
    'Join thousands of teams building with us.',
  );
  const cta = str(props.ctaLabel, 'Start free');
  const ctaHref = str(props.ctaHref, '#');
  const background = str(props.background, '#4F6EF7');
  const textColor = str(props.textColor, '#FFFFFF');
  const backgroundImage = str(props.backgroundImage, '');

  const style: CSSProperties = {
    color: textColor,
    background: backgroundImage
      ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage}) center/cover`
      : background,
  };

  return (
    <section style={style} className="px-8 py-20 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <InlineText
          as="h2"
          blockId={blockId}
          field="headline"
          value={headline}
          className="text-3xl font-bold"
        />
        <InlineText
          as="p"
          blockId={blockId}
          field="subtext"
          value={subtext}
          multiline
          className="opacity-85"
        />
        <a
          {...linkAttrs(ctaHref)}
          className="mt-2 rounded-lg bg-white px-6 py-3 font-medium text-[var(--color-sidebar)]"
        >
          <InlineText
            as="span"
            blockId={blockId}
            field="ctaLabel"
            value={cta}
          />
        </a>
      </div>
    </section>
  );
}
