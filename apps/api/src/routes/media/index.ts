import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { idParamSchema, paginationSchema } from '@buildr/schemas';
import { mediaService } from '../../services/media.service.js';
import { stockService } from '../../services/stock.service.js';
import { ALLOWED_UPLOAD_MIME } from '../../config/media.js';
import { ok, AppError } from '../../utils/response.js';

const STOCK_COLORS = [
  'any',
  'grayscale',
  'red',
  'orange',
  'yellow',
  'green',
  'turquoise',
  'blue',
  'lilac',
  'pink',
  'white',
  'gray',
  'black',
  'brown',
] as const;
const PROVIDERS = ['pixabay', 'unsplash'] as const;
const providerSchema = z.enum(PROVIDERS).default('pixabay');
const stockSearchSchema = z.object({
  provider: providerSchema,
  q: z.string().min(1).max(100),
  orientation: z.enum(['all', 'horizontal', 'vertical']).optional(),
  color: z.enum(STOCK_COLORS).optional(),
  order: z.enum(['popular', 'latest']).optional(),
});
// Provider ids vary (Pixabay numeric, Unsplash slug) — keep this permissive.
const stockImportSchema = z.object({
  provider: providerSchema,
  id: z.string().min(1).max(64),
});

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.post('/media/upload', async (request, reply) => {
    const file = await request.file();
    if (!file) throw AppError.badRequest('No file was uploaded.');
    if (!ALLOWED_UPLOAD_MIME.has(file.mimetype)) {
      throw AppError.badRequest('Unsupported file type. Upload an image.');
    }

    const buffer = await file.toBuffer();
    if (file.file.truncated) {
      throw AppError.badRequest('That file is too large (max 8 MB).');
    }

    const asset = await mediaService.upload(request.user!.sub, buffer);
    return reply.code(201).send(ok(asset));
  });

  app.get('/media', async (request) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const { items, total } = await mediaService.list(
      request.user!.sub,
      page,
      limit,
    );
    return ok(items, { page, limit, total });
  });

  app.delete('/media/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    await mediaService.remove(id, request.user!.sub);
    return ok({ deleted: true });
  });

  // ── Stock photos (Pixabay + Unsplash, download-on-pick) ─────────────────
  app.get('/media/stock/status', async (request) =>
    ok(await stockService.statuses(request.user!.sub)),
  );

  app.get('/media/stock/search', async (request) => {
    const { provider, ...params } = stockSearchSchema.parse(request.query);
    return ok(await stockService.search(request.user!.sub, provider, params));
  });

  app.post('/media/stock/import', async (request, reply) => {
    const { provider, id } = stockImportSchema.parse(request.body);
    const asset = await stockService.import(request.user!.sub, provider, id);
    return reply.code(201).send(ok(asset));
  });
}

