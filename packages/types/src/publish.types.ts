import type { Entity, ISODateString } from './common.types';
import type { Page, SiteTheme } from './site.types';

/** An immutable snapshot of a site's content at publish time. */
export interface PublishedSnapshot {
  version: number;
  publishedAt: ISODateString;
  name: string;
  theme: SiteTheme;
  pages: Page[];
}

/** Published record per site (id === siteId). Versions are newest-first. */
export interface PublishedSite extends Entity {
  userId: string;
  subdomain: string;
  /** Whether the site is currently live (false after unpublish). */
  live: boolean;
  versions: PublishedSnapshot[];
}

/** Public-facing shape served to the renderer (current live version). */
export interface PublicSite {
  id: string;
  name: string;
  subdomain: string;
  theme: SiteTheme;
  pages: Page[];
}

export interface PublishedVersionMeta {
  version: number;
  publishedAt: ISODateString;
}
