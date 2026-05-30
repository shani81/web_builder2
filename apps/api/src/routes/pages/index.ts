import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { savePageSchema } from '@buildr/schemas';
import { pageService } from '../../services/page.service.js';
import { ok } from '../../utils/response.js';

const pageParams = z.object({
  siteId: z.string().min(1),
  pageId: z.string().min(1),
});

/** Page read/save. All routes require auth and operate via the owning site. */
export async function pageRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/sites/:siteId/pages/:pageId', async (request) => {
    const { siteId, pageId } = pageParams.parse(request.params);
    const page = await pageService.getPage(siteId, pageId, request.user!.sub);
    return ok(page);
  });

  app.put('/sites/:siteId/pages/:pageId', async (request) => {
    const { siteId, pageId } = pageParams.parse(request.params);
    const input = savePageSchema.parse(request.body);
    const page = await pageService.savePage(
      siteId,
      pageId,
      request.user!.sub,
      input,
    );
    return ok(page);
  });
}
