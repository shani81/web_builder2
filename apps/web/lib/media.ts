import type { MediaAsset } from '@buildr/types';
import { apiFetch, ApiClientError } from './api-client';
import { env } from './env';

export async function uploadMedia(file: File): Promise<MediaAsset> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/media/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const body = await res.json();
  if (!body?.success) {
    throw new ApiClientError(
      body?.error?.code ?? 'UPLOAD_ERROR',
      body?.error?.message ?? 'Upload failed.',
      res.status,
    );
  }
  return body.data;
}

export function listMedia(): Promise<MediaAsset[]> {
  return apiFetch('/media');
}

export function deleteMedia(id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/media/${id}`, { method: 'DELETE' });
}
