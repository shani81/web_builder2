import type {
  StockPhoto,
  StockProviderName,
  StockSearchParams,
} from '@buildr/types';

/** A resolved, downloadable image plus the metadata we persist as provenance. */
export interface DownloadablePhoto {
  /** Direct URL to the image bytes we download to our own storage. */
  downloadUrl: string;
  author: string;
  /** Provider page for the image (kept for provenance/attribution). */
  sourceUrl: string;
  /** Fallback alt text (e.g. tags/description) when vision alt-text is absent. */
  altFallback: string;
  license: string;
  licenseUrl: string;
  /** Best-effort provider-side download registration (e.g. Unsplash requires it). */
  track?: () => void;
}

/**
 * A stock-photo provider. Each provider owns its own key resolution so the
 * service layer stays provider-agnostic — it only knows the interface.
 */
export interface StockProvider {
  readonly name: StockProviderName;
  /** The usable API key for this user (own key → platform key), or null. */
  resolveKey(userId: string): Promise<string | null>;
  search(apiKey: string, params: StockSearchParams): Promise<StockPhoto[]>;
  /** Resolve one result by id into a downloadable image, or null if missing. */
  resolve(apiKey: string, id: string): Promise<DownloadablePhoto | null>;
}
