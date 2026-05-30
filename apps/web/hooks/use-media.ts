'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cleanupMedia,
  deleteMedia,
  listMedia,
  listUnusedMedia,
  uploadMedia,
} from '@/lib/media';
import type { StockProviderName, StockSearchParams } from '@buildr/types';
import { importStock, searchStock, stockStatus } from '@/lib/stock';

export function useMedia() {
  return useQuery({ queryKey: ['media'], queryFn: listMedia });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-unused'] });
    },
  });
}

export function useUnusedMedia() {
  return useQuery({ queryKey: ['media-unused'], queryFn: listUnusedMedia });
}

export function useCleanupMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cleanupMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-unused'] });
    },
  });
}

export function useStockStatus() {
  return useQuery({ queryKey: ['stock-status'], queryFn: stockStatus });
}

export function useStockSearch() {
  return useMutation({
    mutationFn: (vars: {
      provider: StockProviderName;
      params: StockSearchParams;
    }) => searchStock(vars.provider, vars.params),
  });
}

export function useStockImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { provider: StockProviderName; id: string }) =>
      importStock(vars.provider, vars.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}
