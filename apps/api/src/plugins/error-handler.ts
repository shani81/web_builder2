import type { FastifyError, FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError, fail } from '../utils/response.js';

/**
 * Global error handler. Translates known error types into the standard error
 * envelope; everything else becomes a 500 without leaking internals.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    reply
      .code(404)
      .send(fail('NOT_FOUND', `Route ${request.method} ${request.url} not found`));
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send(fail(error.code, error.message, error.details));
      return;
    }

    if (error instanceof ZodError) {
      reply.code(400).send(
        fail('VALIDATION_ERROR', 'Request validation failed', {
          issues: error.flatten().fieldErrors,
        }),
      );
      return;
    }

    // Fastify's built-in validation errors carry a statusCode.
    if (typeof error.statusCode === 'number' && error.statusCode < 500) {
      reply.code(error.statusCode).send(fail('BAD_REQUEST', error.message));
      return;
    }

    request.log.error(error);
    reply.code(500).send(fail('INTERNAL_ERROR', 'An unexpected error occurred'));
  });
}
