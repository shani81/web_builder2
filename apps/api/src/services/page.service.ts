import { now } from '@buildr/utils';
import type { Page } from '@buildr/types';
import type { SavePageInput } from '@buildr/schemas';
import { siteRepository } from '../repositories/site.repository.js';
import { siteService } from './site.service.js';
import { AppError } from '../utils/response.js';

/**
 * Pages live inside their parent site document, so all access goes through the
 * owning site (which enforces ownership) and writes the whole site back.
 */
export class PageService {
  async getPage(siteId: string, pageId: string, userId: string): Promise<Page> {
    const site = await siteService.getOwned(siteId, userId);
    const page = site.pages.find((p) => p.id === pageId);
    if (!page) throw AppError.notFound('page');
    return page;
  }

  async savePage(
    siteId: string,
    pageId: string,
    userId: string,
    input: SavePageInput,
  ): Promise<Page> {
    const site = await siteService.getOwned(siteId, userId);
    const index = site.pages.findIndex((p) => p.id === pageId);
    if (index === -1) throw AppError.notFound('page');

    const current = site.pages[index]!;
    const updated: Page = {
      ...current,
      title: input.title ?? current.title,
      blocks: input.blocks as Page['blocks'],
      seo: input.seo ? { ...current.seo, ...input.seo } : current.seo,
      updatedAt: now(),
    };

    const pages = [...site.pages];
    pages[index] = updated;
    // Writing the site bumps site.updatedAt too (dashboard "last edited").
    await siteRepository.update(siteId, { pages });
    return updated;
  }
}

export const pageService = new PageService();
