import type {
  Site,
  Template,
  TemplateCategory,
  TemplateSummary,
} from '@buildr/types';
import { apiFetch } from './api-client';

export function listTemplates(
  category?: TemplateCategory,
): Promise<TemplateSummary[]> {
  const query = category ? `?category=${category}` : '';
  return apiFetch(`/templates${query}`);
}

export function getTemplate(id: string): Promise<Template> {
  return apiFetch(`/templates/${id}`);
}

export function useTemplateById(id: string): Promise<Site> {
  return apiFetch(`/templates/${id}/use`, { method: 'POST' });
}

export function recommendTemplates(
  prompt: string,
): Promise<TemplateSummary[]> {
  return apiFetch('/templates/recommend', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}
