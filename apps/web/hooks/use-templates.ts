'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TemplateCategory } from '@buildr/types';
import {
  getTemplate,
  listTemplates,
  recommendTemplates,
  useTemplateById,
} from '@/lib/templates';

export function useTemplates(category?: TemplateCategory) {
  return useQuery({
    queryKey: ['templates', category ?? 'all'] as const,
    queryFn: () => listTemplates(category),
  });
}

export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['template', id] as const,
    queryFn: () => getTemplate(id!),
    enabled: Boolean(id),
  });
}

export function useUseTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: useTemplateById,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });
}

export function useRecommendTemplates() {
  return useMutation({ mutationFn: recommendTemplates });
}
