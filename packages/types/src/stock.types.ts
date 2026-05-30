/** A stock photo search result (provider-agnostic; Pixabay in v1). */
export interface StockPhoto {
  id: string;
  /** Small thumbnail for the search grid (transient display only). */
  thumbUrl: string;
  /** Medium preview (transient display only — never persisted/hotlinked). */
  previewUrl: string;
  width: number;
  height: number;
  author: string;
  /** Link back to the source page (kept for provenance). */
  pageUrl: string;
  tags: string;
}

/** Supported stock-photo providers. */
export type StockProviderName = 'pixabay' | 'unsplash';

export type StockOrientation = 'all' | 'horizontal' | 'vertical';

/** Pixabay-supported color filters (plus 'any' to skip filtering). */
export type StockColor =
  | 'any'
  | 'grayscale'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'turquoise'
  | 'blue'
  | 'lilac'
  | 'pink'
  | 'white'
  | 'gray'
  | 'black'
  | 'brown';

export type StockOrder = 'popular' | 'latest';

/** Stock search request shape shared by client and server. */
export interface StockSearchParams {
  q: string;
  orientation?: StockOrientation;
  color?: StockColor;
  order?: StockOrder;
}
