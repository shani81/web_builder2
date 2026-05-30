'use client';

import { useId, useState, type CSSProperties } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { menuLinkAttrs, parseMenu } from '@buildr/utils';
import type { MenuItem } from '@buildr/types';
import { bool, linkAttrs, num, str, type BlockComponentProps } from './types';
import { MENU_ICONS } from './menu-icons';
import { brandFontStack } from './navbar-fonts';

/** Resolve a button's variant + colors into className + inline styles. An empty
 *  color falls back to the theme brand color, so unstyled buttons match the
 *  inspector's swatch preview. */
function ctaVisual(
  variant: string,
  bg: string,
  color: string,
): { className: string; style: CSSProperties } {
  const accent = bg || 'var(--color-brand)';
  if (variant === 'outline') {
    return {
      className: 'rounded-lg border px-4 py-2 text-sm font-medium transition',
      style: {
        borderColor: accent,
        color: color || accent,
        background: 'transparent',
      },
    };
  }
  if (variant === 'ghost') {
    return {
      className:
        'rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-black/5',
      style: { color: color || accent, background: 'transparent' },
    };
  }
  return {
    className: 'rounded-lg px-4 py-2 text-sm font-medium transition',
    style: { background: accent, color: color || '#FFFFFF' },
  };
}

/**
 * Responsive navbar. Below a 768px **container** width the inline links collapse
 * into a hamburger menu — using a container query (not a viewport media query)
 * so the editor's device preview and real phones behave identically. The links
 * + CTA live in `.nav-desktop` (shown on wide containers) and a togglable panel
 * (shown on narrow ones).
 */
export function NavbarBlock({ props, linkBase = '' }: BlockComponentProps) {
  const rawId = useId();
  const navId = `nav${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [open, setOpen] = useState(false);

  const brand = str(props.brand, 'Brand');
  const logo = str(props.logo);
  const logoHeight = Math.min(Math.max(num(props.logoHeight, 32), 16), 96);
  const brandColor = str(props.brandColor);
  const brandBg = str(props.brandBg);
  const decoration = [
    bool(props.brandUnderline) && 'underline',
    bool(props.brandStrike) && 'line-through',
  ]
    .filter(Boolean)
    .join(' ');
  const brandStyle: CSSProperties = {
    ...(brandFontStack(str(props.brandFont)) && {
      fontFamily: brandFontStack(str(props.brandFont)),
    }),
    ...(bool(props.brandBold) && { fontWeight: 700 }),
    ...(bool(props.brandItalic) && { fontStyle: 'italic' }),
    ...(decoration && { textDecoration: decoration }),
    ...(brandColor && { color: brandColor }),
    ...(brandBg && {
      background: brandBg,
      padding: '0.1em 0.4em',
      borderRadius: '0.375rem',
    }),
  };
  const cta = str(props.ctaLabel, 'Get started');
  const ctaHref = str(props.ctaHref, '#');
  const primaryCta = ctaVisual(
    str(props.ctaStyle, 'filled'),
    str(props.ctaBg),
    str(props.ctaColor),
  );
  const hasSecondary = bool(props.secondaryCtaEnabled);
  const cta2 = str(props.secondaryCtaLabel, 'Sign in');
  const cta2Href = str(props.secondaryCtaHref, '#');
  const secondaryCta = ctaVisual(
    str(props.secondaryCtaStyle, 'outline'),
    str(props.secondaryCtaBg),
    str(props.secondaryCtaColor),
  );
  const sticky = bool(props.sticky, false);
  const background = str(props.background, '#FFFFFF');
  const textColor = str(props.textColor, '#0F0F12');
  const items = parseMenu(props).filter((item) => item.visible !== false);

  const style: CSSProperties = {
    background,
    color: textColor,
    containerType: 'inline-size',
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 20,
  };

  const css = [
    `[data-nav="${navId}"] .nav-desktop{display:none;}`,
    `[data-nav="${navId}"] .nav-toggle{display:inline-flex;}`,
    `@container (min-width:768px){`,
    `[data-nav="${navId}"] .nav-desktop{display:flex;}`,
    `[data-nav="${navId}"] .nav-toggle{display:none;}`,
    `[data-nav="${navId}"] .nav-panel{display:none;}`,
    `}`,
  ].join('');

  const visibleChildren = (item: MenuItem) =>
    (item.children ?? []).filter((child) => child.visible !== false);

  return (
    <nav data-nav={navId} style={style} className="border-b border-black/10">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="flex items-center justify-between px-8 py-4">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={brand}
            style={{ height: `${logoHeight}px`, width: 'auto' }}
            className="block max-w-[60cqw] object-contain"
          />
        ) : (
          <span className="text-lg font-semibold" style={brandStyle}>
            {brand}
          </span>
        )}

        {/* Desktop: inline links + CTA */}
        <div className="nav-desktop items-center gap-6 text-sm opacity-80">
          {items.map((item) => {
            const Icon = item.icon ? MENU_ICONS[item.icon] : undefined;
            const kids = visibleChildren(item);
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
          <span className="flex items-center gap-2">
            {hasSecondary ? (
              <a
                {...linkAttrs(cta2Href)}
                className={secondaryCta.className}
                style={secondaryCta.style}
              >
                {cta2}
              </a>
            ) : null}
            <a
              {...linkAttrs(ctaHref)}
              className={primaryCta.className}
              style={primaryCta.style}
            >
              {cta}
            </a>
          </span>
        </div>

        {/* Mobile: hamburger toggle */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="nav-toggle size-9 items-center justify-center rounded-lg text-current transition hover:bg-black/5"
        >
          {open ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile: collapsible panel (hidden on wide containers via scoped CSS) */}
      {open ? (
        <div className="nav-panel border-t border-black/10 px-8 py-3">
          <div className="flex flex-col gap-1 text-sm">
            {items.map((item) => {
              const kids = visibleChildren(item);
              return (
                <div key={item.id}>
                  <a
                    {...menuLinkAttrs(item, linkBase)}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2 hover:bg-black/5"
                  >
                    {item.label}
                  </a>
                  {kids.map((child) => (
                    <a
                      key={child.id}
                      {...menuLinkAttrs(child, linkBase)}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-1.5 pl-5 opacity-70 hover:bg-black/5 hover:opacity-100"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              );
            })}
            {hasSecondary ? (
              <a
                {...linkAttrs(cta2Href)}
                onClick={() => setOpen(false)}
                className={`mt-2 text-center ${secondaryCta.className}`}
                style={secondaryCta.style}
              >
                {cta2}
              </a>
            ) : null}
            <a
              {...linkAttrs(ctaHref)}
              onClick={() => setOpen(false)}
              className={`${hasSecondary ? 'mt-1.5' : 'mt-2'} text-center ${primaryCta.className}`}
              style={primaryCta.style}
            >
              {cta}
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
