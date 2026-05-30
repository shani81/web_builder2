import type { FastifyInstance } from 'fastify';
import type { Page, SiteGenerationChunk, SiteTheme } from '@buildr/types';
import {
  analyzeSeoSchema,
  chatSchema,
  generateSiteSchema,
  improveContentSchema,
} from '@buildr/schemas';
import {
  aiService,
  resolveUserAi,
  resolveUserApiKey,
} from '../../services/ai.service.js';
import { siteService } from '../../services/site.service.js';
import { pageService } from '../../services/page.service.js';
import { DEFAULT_THEME } from '../../config/site-defaults.js';
import { ok, AppError } from '../../utils/response.js';
import { streamSSE } from '../../utils/sse.js';

/** Resolve the user's API key + model, or fail with a clean disabled error. */
async function requireAi(
  userId: string,
): Promise<{ apiKey: string; model: string }> {
  const { apiKey, model } = await resolveUserAi(userId);
  if (!apiKey) {
    throw new AppError(
      503,
      'AI_DISABLED',
      'Add your Anthropic API key in Settings to enable AI features.',
    );
  }
  return { apiKey, model };
}

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', app.authenticate);

  app.get('/ai/status', async (request) =>
    ok({ enabled: Boolean(await resolveUserApiKey(request.user!.sub)) }),
  );

  // Streaming site generation → persists the site, then emits `created`.
  app.post('/ai/generate-site', async (request, reply) => {
    const userId = request.user!.sub;
    const { apiKey, model } = await requireAi(userId);
    const input = generateSiteSchema.parse(request.body);

    async function* run(): AsyncGenerator<SiteGenerationChunk> {
      let name = 'My Site';
      let theme: SiteTheme | undefined;
      const pages: Page[] = [];

      for await (const chunk of aiService.generateSite(apiKey, model, input.prompt, {
        language: input.language,
        category: input.category,
      })) {
        if (chunk.type === 'meta') name = chunk.name;
        if (chunk.type === 'theme') theme = chunk.theme;
        if (chunk.type === 'page') pages.push(chunk.page);
        yield chunk;
      }

      const site = await siteService.createFromGeneration(userId, {
        name,
        theme: theme ?? DEFAULT_THEME,
        pages,
      });
      yield {
        type: 'created',
        siteId: site.id,
        pageId: site.pages[0]?.id ?? '',
      };
    }

    await streamSSE(request, reply, run());
  });

  // Streaming content rewrite.
  app.post('/ai/improve-content', async (request, reply) => {
    const { apiKey, model } = await requireAi(request.user!.sub);
    const input = improveContentSchema.parse(request.body);

    async function* run(): AsyncGenerator<{ type: 'delta'; text: string }> {
      for await (const text of aiService.improveContent(
        apiKey,
        model,
        input.content,
        input.instruction,
      )) {
        yield { type: 'delta', text };
      }
    }

    await streamSSE(request, reply, run());
  });

  app.post('/ai/analyze-seo', async (request) => {
    const userId = request.user!.sub;
    const { apiKey } = await requireAi(userId);
    const { siteId, pageId } = analyzeSeoSchema.parse(request.body);
    const page = await pageService.getPage(siteId, pageId, userId);
    return ok(await aiService.analyzeSEO(apiKey, page));
  });

  // Streaming chat with editor context + optional actions.
  app.post('/ai/chat', async (request, reply) => {
    const userId = request.user!.sub;
    const { apiKey, model } = await requireAi(userId);
    const input = chatSchema.parse(request.body);

    const site = await siteService.getOwned(input.context.siteId, userId);
    const page = await pageService.getPage(
      input.context.siteId,
      input.context.pageId,
      userId,
    );

    const generator = aiService.chat(
      apiKey,
      model,
      input.message,
      {
        siteId: site.id,
        pageId: page.id,
        theme: site.theme,
        blocks: page.blocks.map((b) => ({ id: b.id, type: b.type })),
      },
      input.history,
    );

    await streamSSE(request, reply, generator);
  });
}
