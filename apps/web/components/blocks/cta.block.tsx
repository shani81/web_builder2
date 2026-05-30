import type { CSSProperties } from 'react';
import { linkAttrs, str, type BlockComponentProps } from './types';

export function CtaBlock({ props }: BlockComponentProps) {
  const headline = str(props.headline, 'Ready to get started?');
  const subtext = str(props.subtext, 'Join thousands of teams building with us.');
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
        <h2 className="text-3xl font-bold">{headline}</h2>
        <p className="opacity-85">{subtext}</p>
        <a
          {...linkAttrs(ctaHref)}
          className="mt-2 rounded-lg bg-white px-6 py-3 font-medium text-[var(--color-sidebar)]"
        >
          {cta}
        </a>
      </div>
    </section>
  );
}
