import type { CSSProperties } from 'react';
import { menuLinkAttrs, parseMenu } from '@buildr/utils';
import { bool, linkAttrs, str, type BlockComponentProps } from './types';
import { MENU_ICONS } from './menu-icons';

export function NavbarBlock({ props, linkBase = '' }: BlockComponentProps) {
  const brand = str(props.brand, 'Brand');
  const cta = str(props.ctaLabel, 'Get started');
  const ctaHref = str(props.ctaHref, '#');
  const sticky = bool(props.sticky, false);
  const background = str(props.background, '#FFFFFF');
  const textColor = str(props.textColor, '#0F0F12');
  // Structured menu (props.menu); falls back to the legacy "Label | url" string.
  const items = parseMenu(props).filter((item) => item.visible !== false);

  const style: CSSProperties = {
    background,
    color: textColor,
    // "sticky" within the scaled canvas previews the published behavior.
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 20,
  };

  return (
    <nav
      style={style}
      className="flex items-center justify-between border-b border-black/10 px-8 py-4"
    >
      <span className="text-lg font-semibold">{brand}</span>
      <div className="hidden items-center gap-6 text-sm opacity-80 md:flex">
        {items.map((item) => {
          const Icon = item.icon ? MENU_ICONS[item.icon] : undefined;
          return (
            <a
              key={item.id}
              {...menuLinkAttrs(item, linkBase)}
              className="inline-flex items-center gap-1.5 hover:opacity-100"
            >
              {Icon ? <Icon className="size-4" aria-hidden /> : null}
              {item.label}
            </a>
          );
        })}
      </div>
      <a
        {...linkAttrs(ctaHref)}
        className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white"
      >
        {cta}
      </a>
    </nav>
  );
}
