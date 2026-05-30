import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { BlockProps, BlockType } from '@buildr/types';

export interface InspectorField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'color'
    | 'select'
    | 'toggle'
    | 'number'
    | 'image'
    | 'date'
    | 'menu'
    | 'section-columns'
    | 'section-layout'
    | 'column-actions';
  options?: { label: string; value: string }[];
  /** Helper text shown under the control (e.g. a line format). */
  hint?: string;
  /** Tuck this field into the inspector's collapsible "Advanced" group. */
  advanced?: boolean;
}

export interface BlockComponentProps {
  props: BlockProps;
  /**
   * Published-site root (e.g. "/s/acme") used to resolve internal page links.
   * Empty in the editor/preview, where links aren't navigated anyway.
   */
  linkBase?: string;
  /** The block's id — used to scope per-instance responsive CSS. */
  blockId?: string;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: 'layout' | 'content' | 'media' | 'advanced';
  icon: LucideIcon;
  defaultProps: BlockProps;
  fields: InspectorField[];
  Component: ComponentType<BlockComponentProps>;
}

/** Read a string prop with a fallback (props are loosely typed JSON). */
export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function num(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Parse a textarea of "a | b | c" lines into tuples — the convention used by
 * repeating blocks (features, testimonials) so the simple inspector can edit
 * lists without a nested array editor.
 */
export function parseLines(value: unknown): string[][] {
  return str(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((cell) => cell.trim()));
}

export interface LinkItem {
  label: string;
  href: string;
}

/**
 * Parse a list of links: comma- or newline-separated, each `"Label | URL"`.
 * A missing URL falls back to "#" so the link is still rendered.
 */
export function parseLinkList(value: unknown): LinkItem[] {
  return str(value)
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, href] = part.split('|').map((s) => s.trim());
      return { label: label ?? '', href: href || '#' };
    });
}

/** Safe anchor attributes — external URLs open in a new tab. */
export function linkAttrs(href: string): {
  href: string;
  target?: string;
  rel?: string;
} {
  return /^https?:\/\//.test(href)
    ? { href, target: '_blank', rel: 'noreferrer noopener' }
    : { href: href || '#' };
}
