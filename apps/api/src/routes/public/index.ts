import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { submitFormSchema } from '@buildr/schemas';
import { publishService } from '../../services/publish.service.js';
import { analyticsService } from '../../services/analytics.service.js';
import { submissionService } from '../../services/submission.service.js';
import { ok, AppError } from '../../utils/response.js';
import { env } from '../../config/env.js';

const subdomainParam = z.object({ subdomain: z.string().min(1).max(63) });
const trackSchema = z.object({
  path: z.string().max(256).optional(),
  new: z.boolean().optional(),
});

/** Public (unauthenticated) read access to published sites. */
export async function publicRoutes(app: FastifyInstance): Promise<void> {
  app.get('/public/sites/:subdomain', async (request) => {
    const { subdomain } = subdomainParam.parse(request.params);
    const site = await publishService.getPublic(subdomain.toLowerCase());
    if (!site) throw AppError.notFound('site');
    return ok(site);
  });

  app.get('/public/sites/:subdomain/sitemap.xml', async (request, reply) => {
    const { subdomain } = subdomainParam.parse(request.params);
    const site = await publishService.getPublic(subdomain.toLowerCase());
    if (!site) throw AppError.notFound('site');

    const base = `${env.SITE_URL}/s/${site.subdomain}`;
    const urls = site.pages
      .filter((page) => !page.seo.noIndex)
      .map((page) => {
        const loc = page.isHome ? base : `${base}/${page.slug}`;
        return `  <url><loc>${loc}</loc><lastmod>${page.updatedAt}</lastmod></url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    reply.header('Content-Type', 'application/xml').send(xml);
  });

  // Form submissions (contact / newsletter) from published sites.
  app.post('/public/sites/:subdomain/submit', async (request) => {
    const { subdomain } = subdomainParam.parse(request.params);
    const input = submitFormSchema.parse(request.body);
    await submissionService.submit(subdomain.toLowerCase(), input);
    return ok({ received: true });
  });

  // Anonymous page-view tracking from published sites.
  app.post('/public/sites/:subdomain/track', async (request, reply) => {
    const { subdomain } = subdomainParam.parse(request.params);
    const { path, new: isNew } = trackSchema.parse(request.body ?? {});
    await analyticsService.track(
      subdomain.toLowerCase(),
      path ?? '/',
      request.headers['user-agent'] ?? '',
      Boolean(isNew),
    );
    return reply.code(204).send();
  });
}
