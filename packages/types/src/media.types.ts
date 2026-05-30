import type { Entity } from './common.types';

/** Where a media asset came from + records kept for licensing/traceability. */
export interface MediaProvenance {
  source: 'upload' | 'pixabay' | 'unsplash';
  /** Provider's id for the asset (e.g. Pixabay image id). */
  sourceId?: string;
  author?: string;
  /** Link to the source/provider page. */
  sourceUrl?: string;
  license?: string;
  licenseUrl?: string;
  retrievedAt?: string;
}

export interface MediaAsset extends Entity {
  userId: string;
  filename: string;
  /** Absolute URL to the optimized image. */
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  /** SHA-256 of the stored (optimized) bytes — used to dedupe identical images. */
  contentHash?: string;
  /** Provenance for stock imports (absent ⇒ user upload). */
  provenance?: MediaProvenance;
}
