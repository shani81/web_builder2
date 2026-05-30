/**
 * Shared primitives used across every domain model.
 * Keeping these centralized avoids drift between API and web layers.
 */

/** ISO-8601 timestamp string (e.g. "2026-05-30T12:00:00.000Z"). */
export type ISODateString = string;

/** Every persisted entity carries an id and audit timestamps. */
export interface Entity {
  id: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Standard success envelope returned by the API. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/** Standard error envelope returned by the API. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
