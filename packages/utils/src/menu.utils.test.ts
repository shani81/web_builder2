import { describe, it, expect } from 'vitest';
import {
  menuItemHref,
  menuLinkAttrs,
  newMenuItem,
  normalizeUrl,
  parseLinksString,
  parseMenu,
  serializeMenuToLinks,
} from './menu.utils';

describe('parseLinksString (legacy migration)', () => {
  it('parses a basic comma-separated list', () => {
    const items = parseLinksString('Home | /, About | /about');
    expect(items.map((i) => i.label)).toEqual(['Home', 'About']);
    expect(items[0]!.url).toBe('/');
    expect(items[0]!.linkType).toBe('url');
  });

  it('trims extra spaces around labels and urls', () => {
    const items = parseLinksString('  Home  |  /  ,  About | /about ');
    expect(items[0]!.label).toBe('Home');
    expect(items[0]!.url).toBe('/');
    expect(items[1]!.label).toBe('About');
  });

  it('handles a missing url (defaults to #)', () => {
    const items = parseLinksString('Home | , About | /about');
    expect(items[0]!.url).toBe('#');
    expect(items[1]!.url).toBe('/about');
  });

  it('skips trailing and empty commas', () => {
    const items = parseLinksString('Home | /, , About | /about,');
    expect(items).toHaveLength(2);
  });

  it('drops entries with an empty label', () => {
    const items = parseLinksString('| /url, Home | /');
    expect(items).toHaveLength(1);
    expect(items[0]!.label).toBe('Home');
  });

  it('accepts label-only entries (no pipe)', () => {
    const items = parseLinksString('Home, About');
    expect(items).toHaveLength(2);
    expect(items[0]!.url).toBe('#');
  });

  it('classifies anchors and external urls', () => {
    const items = parseLinksString('Top | #hero, Docs | https://x.com');
    expect(items[0]!.linkType).toBe('anchor');
    expect(items[0]!.anchor).toBe('hero');
    expect(items[1]!.linkType).toBe('url');
    expect(items[1]!.url).toBe('https://x.com');
  });

  it('supports newline-separated input too', () => {
    expect(parseLinksString('Home | /\nAbout | /about')).toHaveLength(2);
  });

  it('returns [] for non-strings and blanks', () => {
    expect(parseLinksString('')).toEqual([]);
    expect(parseLinksString(undefined as unknown as string)).toEqual([]);
  });
});

describe('parseMenu', () => {
  it('prefers a structured menu over the legacy string', () => {
    const items = parseMenu({
      menu: [newMenuItem({ label: 'X', url: '/x' })],
      links: 'IGNORED | /',
    });
    expect(items.map((i) => i.label)).toEqual(['X']);
  });

  it('migrates the legacy links string when no menu is present', () => {
    expect(parseMenu({ links: 'Home | /' })).toHaveLength(1);
  });

  it('treats an empty menu array as an empty menu (not a fallback)', () => {
    expect(parseMenu({ menu: [], links: 'Home | /' })).toEqual([]);
  });

  it('sanitizes malformed stored items', () => {
    const items = parseMenu({
      menu: [{ label: 'OK', linkType: 'bogus', openIn: 'huh' }, null, 5],
    });
    expect(items).toHaveLength(1);
    expect(items[0]!.linkType).toBe('url');
    expect(items[0]!.openIn).toBe('same');
    expect(items[0]!.visible).toBe(true);
    expect(typeof items[0]!.id).toBe('string');
  });
});

describe('normalizeUrl', () => {
  it('prepends https:// to bare domains', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });
  it('keeps protocols, paths, and anchors as-is', () => {
    expect(normalizeUrl('https://x.com')).toBe('https://x.com');
    expect(normalizeUrl('/about')).toBe('/about');
    expect(normalizeUrl('#hero')).toBe('#hero');
    expect(normalizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com');
  });
  it('falls back to # for blanks', () => {
    expect(normalizeUrl('   ')).toBe('#');
  });
});

describe('menuItemHref / menuLinkAttrs', () => {
  it('builds a page href under the site base', () => {
    const item = newMenuItem({ linkType: 'page', pageSlug: 'about' });
    expect(menuItemHref(item, '/s/acme')).toBe('/s/acme/about');
  });
  it('opens external choices in a new tab with safe rel', () => {
    const item = newMenuItem({ url: 'https://x.com', openIn: 'newTab' });
    expect(menuLinkAttrs(item)).toEqual({
      href: 'https://x.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });
  it('keeps same-window links without target', () => {
    expect(menuLinkAttrs(newMenuItem({ url: '/x' })).target).toBeUndefined();
  });
});

describe('serializeMenuToLinks (backward-compatible output)', () => {
  it('serializes only visible items to the legacy string', () => {
    const items = parseLinksString('Home | /, Hidden | /h');
    items[1]!.visible = false;
    expect(serializeMenuToLinks(items)).toBe('Home | /');
  });

  it('round-trips a simple menu', () => {
    const round = serializeMenuToLinks(parseLinksString('A | /a\nB | #b'));
    expect(round).toBe('A | /a\nB | #b');
  });
});
