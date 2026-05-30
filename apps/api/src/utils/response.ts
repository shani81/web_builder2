import type { ApiError, ApiSuccess, PaginationMeta } from '@buildr/types';

/** Build a standard success envelope. */
export function ok<T>(data: T, meta?: PaginationMeta): ApiSuccess<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

/** Build a standard error envelope. */
export function fail(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiError {
  return { success: false, error: { code, message, details } };
}

/**
 * Domain error carrying an HTTP status and a stable error code.
 * Thrown by services/repositories and translated by the global error handler.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(resource: string): AppError {
    return new AppError(404, `${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found`);
  }

  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have access to this resource'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static conflict(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(409, 'CONFLICT', message, details);
  }
}
