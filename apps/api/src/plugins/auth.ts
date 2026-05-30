import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import type { SessionPayload } from '@buildr/types';
import { COOKIE } from '../config/auth.js';
import { authService } from '../services/auth.service.js';
import { AppError } from '../utils/response.js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the `authenticate` preHandler on protected routes. */
    user?: SessionPayload;
  }
  interface FastifyInstance {
    /** preHandler that verifies the access cookie and attaches request.user. */
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

/**
 * Registers cookie parsing and the `authenticate` guard. Must be registered
 * before any routes that rely on `app.authenticate` or `request.cookies`.
 */
export async function registerAuth(app: FastifyInstance): Promise<void> {
  await app.register(fastifyCookie);

  app.decorateRequest('user', undefined);

  app.decorate('authenticate', async (request: FastifyRequest) => {
    const token = request.cookies[COOKIE.access];
    if (!token) throw AppError.unauthorized();
    request.user = authService.verifyAccess(token);
  });
}
