import type { Entity, ISODateString } from './common.types';
import type { MediaProvenance } from './media.types';
import type { Page, SiteTheme } from './site.types';

/** Attribution for a stock photo used on the site (rendered as a credit). */
export interface ImageCredit {
  author: string;
  source: MediaProvenance['source'];
  /** Provider page for the image. */
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

/** An immutable snapshot of a site's content at publish time. */
export interface PublishedSnapshot {
  version: number;
  publishedAt: ISODateString;
  name: string;
  theme: SiteTheme;
  pages: Page[];
  /** Stock-photo attributions captured at publish time. */
  credits?: ImageCredit[];
}

/** Published record per site (id === siteId). Versions are newest-first. */
export interface PublishedSite extends Entity {
  userId: string;
  subdomain: string;
  /** Whether the site is currently live (false after unpublish). */
  live: boolean;
  /** If set and in the future, the site stays hidden publicly until this time. */
  scheduledAt?: ISODateString;
  versions: PublishedSnapshot[];
}

/** Publish state for the editor dialog. */
export interface PublishStatus {
  versions: PublishedVersionMeta[];
  /** A future go-live time, or null when publishing immediately. */
  scheduledAt: ISODateString | null;
}

/** Public-facing shape served to the renderer (current live version). */
export interface PublicSite {
  id: string;
  name: string;
  subdomain: string;
  theme: SiteTheme;
  pages: Page[];
  credits?: ImageCredit[];
}

export interface PublishedVersionMeta {
  version: number;
  publishedAt: ISODateString;
}
