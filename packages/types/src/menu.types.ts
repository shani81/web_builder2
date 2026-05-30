/** Where a menu item points. */
export type MenuLinkType = 'page' | 'url' | 'anchor';

/** How a menu item opens. New tab/window both render target=_blank. */
export type MenuOpenIn = 'same' | 'newTab' | 'newWindow';

/**
 * A structured navbar menu item. Stored on a navbar block as `props.menu`,
 * while `props.links` (the legacy "Label | url" string) is kept in sync for
 * backward compatibility.
 */
export interface MenuItem {
  id: string;
  label: string;
  linkType: MenuLinkType;
  /** When linkType === 'page'. */
  pageId?: string;
  /** Denormalized page slug, so render can build an href without site context. */
  pageSlug?: string;
  /** When linkType === 'url'. */
  url?: string;
  /** When linkType === 'anchor' (the part after '#'). */
  anchor?: string;
  openIn: MenuOpenIn;
  visible: boolean;
  /** Optional icon key (see the editor's icon set). */
  icon?: string;
  /** Optional nested sub-menu items (reserved; editor support is a follow-up). */
  children?: MenuItem[];
}
