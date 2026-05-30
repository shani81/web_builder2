import type { MenuItem, MenuLinkType, MenuOpenIn } from '@buildr/types';
import { shortId } from './id.utils';

const LINK_TYPES: MenuLinkType[] = ['page', 'url', 'anchor'];
const OPEN_INS: MenuOpenIn[] = ['same', 'newTab', 'newWindow'];

/** Create a menu item with sensible defaults. */
export function newMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: shortId('mi'),
    label: 'New menu item',
    linkType: 'url',
    url: '#',
    openIn: 'same',
    visible: true,
    ...overrides,
  };
}

/** Normalize a user-typed URL: bare domains get https://, paths/anchors kept. */
export function normalizeUrl(url: string): string {
  const u = (url ?? '').trim();
  if (!u) return '#';
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(u)) return u;
  return `https://${u}`;
}

/** Classify a raw href into structured link fields (used during migration). */
function hrefToLink(href: string): Pick<MenuItem, 'linkType' | 'url' | 'anchor'> {
  const h = (href ?? '').trim();
  if (h.startsWith('#')) return { linkType: 'anchor', anchor: h.slice(1) };
  return { linkType: 'url', url: h || '#' };
}

/**
 * Migrate the legacy `"Label | url, Label | url"` string into MenuItem[].
 * Tolerates extra spaces, missing urls, trailing/empty commas, and label-only
 * entries. Entries with no label are dropped.
 */
export function parseLinksString(value: string): MenuItem[] {
  if (typeof value !== 'string') return [];
  return value
    .split(/[\n,]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const pipe = segment.indexOf('|');
      const label = (pipe === -1 ? segment : segment.slice(0, pipe)).trim();
      const href = pipe === -1 ? '' : segment.slice(pipe + 1).trim();
      if (!label) return null;
      return newMenuItem({ label, ...hrefToLink(href) });
    })
    .filter((item): item is MenuItem => item !== null);
}

function sanitizeItem(raw: unknown): MenuItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  return {
    id: typeof r.id === 'string' ? r.id : shortId('mi'),
    label: typeof r.label === 'string' ? r.label : '',
    linkType: LINK_TYPES.includes(r.linkType as MenuLinkType)
      ? (r.linkType as MenuLinkType)
      : 'url',
    pageId: typeof r.pageId === 'string' ? r.pageId : undefined,
    pageSlug: typeof r.pageSlug === 'string' ? r.pageSlug : undefined,
    url: typeof r.url === 'string' ? r.url : undefined,
    anchor: typeof r.anchor === 'string' ? r.anchor : undefined,
    openIn: OPEN_INS.includes(r.openIn as MenuOpenIn)
      ? (r.openIn as MenuOpenIn)
      : 'same',
    visible: typeof r.visible === 'boolean' ? r.visible : true,
    icon: typeof r.icon === 'string' ? r.icon : undefined,
    children: Array.isArray(r.children)
      ? r.children
          .map(sanitizeItem)
          .filter((item): item is MenuItem => item !== null)
      : undefined,
  };
}

/**
 * Read a navbar's menu: the structured `menu` prop when present, otherwise
 * migrate the legacy `links` string. This is the on-load migration.
 */
export function parseMenu(props: Record<string, unknown>): MenuItem[] {
  const raw = props.menu;
  if (Array.isArray(raw)) {
    return raw.map(sanitizeItem).filter((item): item is MenuItem => item !== null);
  }
  return parseLinksString(typeof props.links === 'string' ? props.links : '');
}

/** Base-agnostic path, used for the legacy string and editor previews. */
function itemPath(item: MenuItem): string {
  switch (item.linkType) {
    case 'anchor':
      return `#${item.anchor ?? ''}`;
    case 'page':
      return item.pageSlug ? `/${item.pageSlug}` : '#';
    default:
      return normalizeUrl(item.url ?? '');
  }
}

/**
 * Render-ready href. `linkBase` is the published site root (e.g. `/s/acme`) so
 * internal page links resolve correctly; it's ignored for urls/anchors.
 */
export function menuItemHref(item: MenuItem, linkBase = ''): string {
  if (item.linkType === 'page') {
    return item.pageSlug ? `${linkBase}/${item.pageSlug}` : linkBase || '#';
  }
  return itemPath(item);
}

/** Anchor attributes for a menu item, honoring its "open in" choice. */
export function menuLinkAttrs(
  item: MenuItem,
  linkBase = '',
): { href: string; target?: string; rel?: string } {
  const href = menuItemHref(item, linkBase);
  return item.openIn === 'same'
    ? { href }
    : { href, target: '_blank', rel: 'noopener noreferrer' };
}

/** Serialize back to the legacy `links` string for backward-compatible readers. */
export function serializeMenuToLinks(items: MenuItem[]): string {
  return items
    .filter((item) => item.visible !== false)
    .map((item) => `${item.label} | ${itemPath(item)}`)
    .join('\n');
}
