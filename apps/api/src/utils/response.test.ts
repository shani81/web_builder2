import { describe, it, expect } from 'vitest';
import { ok, fail, AppError } from './response.js';

describe('ok()', () => {
  it('wraps data without meta', () => {
    expect(ok({ x: 1 })).toEqual({ success: true, data: { x: 1 } });
  });

  it('includes meta when provided', () => {
    const meta = { page: 1, limit: 10, total: 3 };
    expect(ok([], meta)).toEqual({ success: true, data: [], meta });
  });
});

describe('fail()', () => {
  it('builds an error envelope', () => {
    expect(fail('X_CODE', 'bad thing')).toEqual({
      success: false,
      error: { code: 'X_CODE', message: 'bad thing' },
    });
  });

  it('carries details when given', () => {
    expect(fail('X', 'm', { field: 'q' }).error.details).toEqual({
      field: 'q',
    });
  });
});

describe('AppError factories', () => {
  it('notFound → 404 with an upper-cased code', () => {
    const e = AppError.notFound('media');
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(404);
    expect(e.code).toBe('MEDIA_NOT_FOUND');
    expect(e.message).toBe('media not found');
  });

  it('badRequest → 400 and keeps details', () => {
    const e = AppError.badRequest('nope', { field: 'q' });
    expect(e.statusCode).toBe(400);
    expect(e.code).toBe('BAD_REQUEST');
    expect(e.details).toEqual({ field: 'q' });
  });

  it('unauthorized defaults its message', () => {
    const e = AppError.unauthorized();
    expect(e.statusCode).toBe(401);
    expect(e.code).toBe('UNAUTHORIZED');
    expect(e.message).toBe('Authentication required');
  });

  it('forbidden → 403, conflict → 409', () => {
    expect(AppError.forbidden().statusCode).toBe(403);
    const c = AppError.conflict('duplicate');
    expect(c.statusCode).toBe(409);
    expect(c.code).toBe('CONFLICT');
  });
});
