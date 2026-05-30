import { shortId } from '@buildr/utils';
import type {
  Page,
  Site,
  Template,
  TemplateCategory,
  TemplateSummary,
} from '@buildr/types';
import { TEMPLATES } from '../config/templates.js';
import { siteService } from './site.service.js';
import { AppError } from '../utils/response.js';

function toSummary(template: Template): TemplateSummary {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    thumbnailUrl: template.thumbnailUrl,
    isPremium: template.isPremium,
  };
}

export class TemplateService {
  list(category?: TemplateCategory): TemplateSummary[] {
    const items = category
      ? TEMPLATES.filter((t) => t.category === category)
      : TEMPLATES;
    return items.map(toSummary);
  }

  get(id: string): Template {
    const template = TEMPLATES.find((t) => t.id === id);
    if (!template) throw AppError.notFound('template');
    return template;
  }

  /** Clone a template (fresh page + block ids) into a new site for the user. */
  async use(userId: string, templateId: string): Promise<Site> {
    const template = this.get(templateId);
    const pages: Page[] = template.pages.map((page) => ({
      ...page,
      id: shortId('page'),
      siteId: '',
      blocks: page.blocks.map((block) => ({
        ...structuredClone(block),
        id: shortId('blk'),
      })),
    }));

    return siteService.createFromGeneration(userId, {
      name: template.name,
      theme: template.theme,
      pages,
    });
  }

  /**
   * Keyword-based recommendation: scores each template by how well the prompt
   * matches its category, tags, name, and description. Returns the best first.
   */
  recommend(prompt: string, limit = 4): TemplateSummary[] {
    const words = prompt
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);

    const scored = TEMPLATES.map((template) => {
      const haystack = [
        template.category,
        ...template.tags,
        template.name,
        template.description,
      ]
        .join(' ')
        .toLowerCase();
      let score = 0;
      for (const word of words) {
        if (template.category === word) score += 3;
        else if (template.tags.includes(word)) score += 2;
        else if (haystack.includes(word)) score += 1;
      }
      return { template, score };
    });

    const ranked = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    // Fall back to a default spread when nothing matches.
    const result = ranked.length > 0 ? ranked : scored;
    return result.slice(0, limit).map((s) => toSummary(s.template));
  }
}

export const templateService = new TemplateService();
