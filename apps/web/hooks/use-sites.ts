'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateSiteInput } from '@buildr/schemas';
import {
  createSite,
  deleteSite,
  duplicateSite,
  getSite,
  listSites,
  publishSite,
  updateSite,
} from '@/lib/sites';

const SITES_KEY = ['sites'] as const;

export function useSites() {
  return useQuery({ queryKey: SITES_KEY, queryFn: listSites });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['sites', id] as const,
    queryFn: () => getSite(id),
    enabled: Boolean(id),
  });
}

/** Shared invalidation so any site mutation refreshes the list. */
function useSitesInvalidator() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SITES_KEY });
}

export function useCreateSite() {
  const invalidate = useSitesInvalidator();
  return useMutation({ mutationFn: createSite, onSuccess: invalidate });
}

export function useDeleteSite() {
  const invalidate = useSitesInvalidator();
  return useMutation({ mutationFn: deleteSite, onSuccess: invalidate });
}

export function useDuplicateSite() {
  const invalidate = useSitesInvalidator();
  return useMutation({ mutationFn: duplicateSite, onSuccess: invalidate });
}

export function usePublishSite() {
  const invalidate = useSitesInvalidator();
  return useMutation({
    mutationFn: (id: string) => publishSite(id),
    onSuccess: invalidate,
  });
}

export function useUpdateSite() {
  const invalidate = useSitesInvalidator();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateSiteInput }) =>
      updateSite(vars.id, vars.input),
    onSuccess: invalidate,
  });
}
