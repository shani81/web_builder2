'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteSubmission, getSubmissions } from '@/lib/submissions';

export function useSubmissions(siteId: string | null) {
  return useQuery({
    queryKey: ['submissions', siteId] as const,
    queryFn: () => getSubmissions(siteId!),
    enabled: Boolean(siteId),
  });
}

export function useDeleteSubmission(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubmission(siteId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['submissions', siteId] }),
  });
}
