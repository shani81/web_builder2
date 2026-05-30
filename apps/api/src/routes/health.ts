import type { FastifyInstance } from 'fastify';
import { ok } from '../utils/response.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () =>
    ok({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
}
