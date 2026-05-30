import type { CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
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
          const kids = (item.children ?? []).filter(
            (child) => child.visible !== false,
          );
          const link = (
            <a
              {...menuLinkAttrs(item, linkBase)}
              className="inline-flex items-center gap-1.5 hover:opacity-100"
            >
              {Icon ? <Icon className="size-4" aria-hidden /> : null}
              {item.label}
              {kids.length > 0 ? (
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              ) : null}
            </a>
          );

          if (kids.length === 0) {
            return (
              <span key={item.id} className="inline-flex">
                {link}
              </span>
            );
          }

          // CSS-only dropdown so it works in static published HTML (hover +
          // keyboard focus). The panel keeps its own light theme for contrast.
          return (
            <div key={item.id} className="group relative inline-flex">
              {link}
              <div className="invisible absolute left-0 top-full z-30 min-w-44 -translate-y-1 rounded-lg border border-black/10 bg-white py-1 text-black opacity-0 shadow-lg transition-all duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {kids.map((child) => {
                  const ChildIcon = child.icon
                    ? MENU_ICONS[child.icon]
                    : undefined;
                  return (
                    <a
                      key={child.id}
                      {...menuLinkAttrs(child, linkBase)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-black/80 hover:bg-black/5"
                    >
                      {ChildIcon ? (
                        <ChildIcon className="size-4" aria-hidden />
                      ) : null}
                      {child.label}
                    </a>
                  );
                })}
              </div>
            </div>
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
