import type { FastifyInstance } from 'fastify';

/**
 * Replace the default JSON body parser with one that tolerates an empty body.
 * Bodyless POSTs (e.g. /auth/logout, /auth/refresh) otherwise fail when a
 * client still sends `Content-Type: application/json`, which browsers commonly
 * do. Empty bodies parse to `undefined` instead of erroring.
 */
export function registerBodyParser(app: FastifyInstance): void {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_request, body, done) => {
      const text = (body as string).trim();
      if (text.length === 0) {
        done(null, undefined);
        return;
      }
      try {
        done(null, JSON.parse(text));
      } catch {
        const err = new Error('Invalid JSON in request body') as Error & {
          statusCode?: number;
        };
        err.statusCode = 400;
        done(err, undefined);
      }
    },
  );
}
