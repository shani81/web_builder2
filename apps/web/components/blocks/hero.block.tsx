import type { CSSProperties } from 'react';
import { linkAttrs, str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

export function HeroBlock({ props, blockId }: BlockComponentProps) {
  const headline = str(props.headline, 'Your big idea starts here');
  const subtext = str(
    props.subtext,
    'A clear, compelling subheading that explains what you offer.',
  );
  const cta = str(props.ctaLabel, 'Get started');
  const ctaHref = str(props.ctaHref, '#');
  const secondaryCta = str(props.secondaryCtaLabel, '');
  const secondaryCtaHref = str(props.secondaryCtaHref, '#');
  const align = str(props.align, 'center') as 'left' | 'center';
  const background = str(props.background, '#0F0F12');
  const textColor = str(props.textColor, '#FFFFFF');
  const backgroundImage = str(props.backgroundImage, '');

  const style: CSSProperties = {
    color: textColor,
    textAlign: align,
    background: backgroundImage
      ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${backgroundImage}) center/cover`
      : background,
  };

  return (
    <section style={style} className="px-8 py-24">
      <div
        className={`mx-auto flex max-w-3xl flex-col gap-5 ${
          align === 'center' ? 'items-center' : 'items-start'
        }`}
      >
        <InlineText
          as="h1"
          blockId={blockId}
          field="headline"
          value={headline}
          className="text-balance text-4xl font-bold sm:text-5xl"
        />
        <InlineText
          as="p"
          blockId={blockId}
          field="subtext"
          value={subtext}
          multiline
          className="max-w-xl text-lg opacity-80"
        />
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            {...linkAttrs(ctaHref)}
            className="rounded-lg bg-[var(--color-brand)] px-6 py-3 font-medium text-white"
          >
            <InlineText
              as="span"
              blockId={blockId}
              field="ctaLabel"
              value={cta}
            />
          </a>
          {secondaryCta ? (
            <a
              {...linkAttrs(secondaryCtaHref)}
              className="rounded-lg border border-current px-6 py-3 font-medium opacity-90"
            >
              <InlineText
                as="span"
                blockId={blockId}
                field="secondaryCtaLabel"
                value={secondaryCta}
              />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
