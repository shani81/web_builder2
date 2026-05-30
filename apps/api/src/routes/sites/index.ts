import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import {
  createSiteSchema,
  idParamSchema,
  updateSiteSchema,
} from '@buildr/schemas';
import { siteService } from '../../services/site.service.js';
import { publishService } from '../../services/publish.service.js';
import { analyticsService } from '../../services/analytics.service.js';
import { submissionService } from '../../services/submission.service.js';
import { ok } from '../../utils/response.js';

const rollbackSchema = z.object({ version: z.number().int().positive() });
const publishSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
});
const passwordSchema = z.object({
  password: z.string().min(4).max(128).nullable(),
});

/**
 * Site CRUD. Every route in this plugin requires authentication and operates
 * only on sites owned by the current user (enforced in the service).
 */
export async function siteRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/sites', async (request) => {
    const sites = await siteService.listForUser(request.user!.sub);
    return ok(sites);
  });

  app.post('/sites', async (request, reply) => {
    const input = createSiteSchema.parse(request.body);
    const site = await siteService.create(request.user!.sub, input);
    return reply.code(201).send(ok(site));
  });

  app.get('/sites/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const site = await siteService.getOwned(id, request.user!.sub);
    return ok(site);
  });

  app.patch('/sites/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const input = updateSiteSchema.parse(request.body);
    const site = await siteService.update(id, request.user!.sub, input);
    return ok(site);
  });

  app.delete('/sites/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    await siteService.remove(id, request.user!.sub);
    return ok({ deleted: true });
  });

  app.post('/sites/:id/duplicate', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const site = await siteService.duplicate(id, request.user!.sub);
    return reply.code(201).send(ok(site));
  });

  app.post('/sites/:id/publish', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const { scheduledAt } = publishSchema.parse(request.body ?? {});
    const site = await publishService.publish(
      id,
      request.user!.sub,
      scheduledAt,
    );
    return ok(site);
  });

  app.get('/sites/:id/versions', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return ok(await publishService.listVersions(id, request.user!.sub));
  });

  app.get('/sites/:id/publish-status', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return ok(await publishService.status(id, request.user!.sub));
  });

  app.put('/sites/:id/publish-password', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const { password } = passwordSchema.parse(request.body);
    return ok(
      await publishService.setPassword(id, request.user!.sub, password),
    );
  });

  app.post('/sites/:id/rollback', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const { version } = rollbackSchema.parse(request.body);
    return ok(await publishService.rollback(id, request.user!.sub, version));
  });

  app.get('/sites/:id/analytics', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return ok(await analyticsService.getSummary(id, request.user!.sub));
  });

  app.get('/sites/:id/submissions', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return ok(await submissionService.list(id, request.user!.sub));
  });

  app.delete('/sites/:id/submissions/:submissionId', async (request) => {
    const { id, submissionId } = z
      .object({ id: z.string(), submissionId: z.string() })
      .parse(request.params);
    await submissionService.remove(id, submissionId, request.user!.sub);
    return ok({ deleted: true });
  });
}
