'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMedia,
  listMedia,
  searchUnsplash,
  uploadMedia,
} from '@/lib/media';
import type { StockSearchParams } from '@buildr/types';
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}

export function useUnsplashSearch() {
  return useMutation({ mutationFn: searchUnsplash });
}

export function useStockStatus() {
  return useQuery({ queryKey: ['stock-status'], queryFn: stockStatus });
}

export function useStockSearch() {
  return useMutation({
    mutationFn: (params: StockSearchParams) => searchStock(params),
  });
}

export function useStockImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importStock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });
}
