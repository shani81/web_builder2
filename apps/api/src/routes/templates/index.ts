import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { idParamSchema } from '@buildr/schemas';
import { templateService } from '../../services/template.service.js';
import { ok } from '../../utils/response.js';

const categorySchema = z
  .enum([
    'business',
    'portfolio',
    'restaurant',
    'ecommerce',
    'blog',
    'agency',
    'saas',
    'event',
    'medical',
    'education',
  ])
  .optional();

const listQuerySchema = z.object({ category: categorySchema });
const recommendSchema = z.object({ prompt: z.string().min(1).max(2000) });

export async function templateRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/templates', async (request) => {
    const { category } = listQuerySchema.parse(request.query);
    return ok(templateService.list(category));
  });

  app.post('/templates/recommend', async (request) => {
    const { prompt } = recommendSchema.parse(request.body);
    return ok(templateService.recommend(prompt));
  });

  app.get('/templates/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return ok(templateService.get(id));
  });

  app.post('/templates/:id/use', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const site = await templateService.use(request.user!.sub, id);
    return reply.code(201).send(ok(site));
  });
}
