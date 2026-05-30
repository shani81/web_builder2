import Fastify, { type FastifyInstance } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { env, isProd } from './config/env.js';
import { MAX_UPLOAD_BYTES, UPLOADS_DIR } from './config/media.js';
import { registerSecurity } from './plugins/security.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { registerAuth } from './plugins/auth.js';
import { registerBodyParser } from './plugins/body-parser.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth/index.js';
import { siteRoutes } from './routes/sites/index.js';
import { pageRoutes } from './routes/pages/index.js';
import { aiRoutes } from './routes/ai/index.js';
import { templateRoutes } from './routes/templates/index.js';
import { mediaRoutes } from './routes/media/index.js';
import { publicRoutes } from './routes/public/index.js';

const API_PREFIX = '/api/v1';

/**
 * Builds the Fastify instance with all plugins and routes wired up.
 * Separated from server startup so it can be imported directly in tests.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: isProd
      ? true
      : { transport: { target: 'pino-pretty' }, level: 'info' },
    disableRequestLogging: false,
  });

  registerBodyParser(app);
  await registerSecurity(app);
  await registerAuth(app);

  // Media: multipart uploads + static serving of optimized files at /uploads/*.
  await app.register(fastifyMultipart, {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  });
  await app.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
    decorateReply: false,
  });

  registerErrorHandler(app);

  // Feature routes are registered under the versioned prefix.
  await app.register(
    async (api) => {
      await api.register(healthRoutes);
      await api.register(authRoutes);
      await api.register(siteRoutes);
      await api.register(pageRoutes);
      await api.register(aiRoutes);
      await api.register(templateRoutes);
      await api.register(mediaRoutes);
      await api.register(publicRoutes);
    },
    { prefix: API_PREFIX },
  );

  return app;
}

export { env, API_PREFIX };
