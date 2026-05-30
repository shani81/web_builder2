'use client';

import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '@/lib/analytics';

export function useAnalytics(siteId: string | null) {
  return useQuery({
    queryKey: ['analytics', siteId] as const,
    queryFn: () => getAnalytics(siteId!),
    enabled: Boolean(siteId),
  });
}
