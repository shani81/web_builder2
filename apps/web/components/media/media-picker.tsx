'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, Upload, X } from 'lucide-react';
import type {
  StockColor,
  StockOrder,
  StockOrientation,
  StockPhoto,
  UnsplashPhoto,
} from '@buildr/types';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api-client';
import {
  useDeleteMedia,
  useMedia,
  useStockImport,
  useStockSearch,
  useStockStatus,
  useUnsplashSearch,
  useUploadMedia,
} from '@/hooks/use-media';

export interface PickedImage {
  url: string;
  alt?: string;
}

type Tab = 'library' | 'stock' | 'unsplash';

const ORIENTATIONS: { value: StockOrientation; label: string }[] = [
  { value: 'all', label: 'Any shape' },
  { value: 'horizontal', label: 'Landscape' },
  { value: 'vertical', label: 'Portrait' },
];
const ORDERS: { value: StockOrder; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'latest', label: 'Latest' },
];
const COLORS: { value: StockColor; label: string; swatch: string }[] = [
  { value: 'any', label: 'Any color', swatch: '' },
  { value: 'grayscale', label: 'Grayscale', swatch: 'linear-gradient(90deg,#fff,#000)' },
  { value: 'red', label: 'Red', swatch: '#ef4444' },
  { value: 'orange', label: 'Orange', swatch: '#f97316' },
  { value: 'yellow', label: 'Yellow', swatch: '#eab308' },
  { value: 'green', label: 'Green', swatch: '#22c55e' },
  { value: 'turquoise', label: 'Turquoise', swatch: '#14b8a6' },
  { value: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { value: 'lilac', label: 'Lilac', swatch: '#c4b5fd' },
  { value: 'pink', label: 'Pink', swatch: '#ec4899' },
  { value: 'white', label: 'White', swatch: '#ffffff' },
  { value: 'gray', label: 'Gray', swatch: '#9ca3af' },
  { value: 'black', label: 'Black', swatch: '#111827' },
  { value: 'brown', label: 'Brown', swatch: '#92400e' },
];

function errorText(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === 'STOCK_DISABLED') {
      return 'Stock photos aren’t set up yet. Add your Pixabay API key in Settings.';
    }
    if (error.code === 'UNSPLASH_DISABLED') {
      return 'Unsplash is disabled. Set UNSPLASH_ACCESS_KEY on the API server.';
    }
    return error.message;
  }
  return 'Something went wrong.';
}

/** Print-aware licensing notice shown on the stock tab. */
function StockNotice() {
  return (
    <p className="m-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
      Photos are free under the{' '}
      <a
        href="https://pixabay.com/service/license-summary/"
        target="_blank"
        rel="noreferrer"
        className="font-medium underline"
      >
        Pixabay License
      </a>
      , but <strong>you are responsible for how you use each image</strong> —
      especially for printing, merchandise, or products for sale. Some photos
      show people, logos, or brands that may need separate permission. BUILDR is
      not responsible; check the license for your specific use.
    </p>
  );
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  initialTab = 'library',
  initialQuery = '',
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (image: PickedImage) => void;
  initialTab?: Tab;
  initialQuery?: string;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [orientation, setOrientation] = useState<StockOrientation>('all');
  const [color, setColor] = useState<StockColor>('any');
  const [order, setOrder] = useState<StockOrder>('popular');
  const [importingId, setImportingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const media = useMedia();
  const upload = useUploadMedia();
  const del = useDeleteMedia();
  const unsplash = useUnsplashSearch();
  const stockStatusQuery = useStockStatus();
  const stockSearch = useStockSearch();
  const stockImport = useStockImport();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Auto-run the stock search when opened with a prefilled query (AI flow).
  useEffect(() => {
    if (open && initialTab === 'stock' && initialQuery.trim().length >= 2) {
      stockSearch.mutate({ q: initialQuery.trim(), orientation: 'all' });
    }
    // mount/open only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Re-run the stock search when a filter changes (only if there's a query).
  useEffect(() => {
    if (open && tab === 'stock' && query.trim().length >= 2) {
      stockSearch.mutate({ q: query.trim(), orientation, color, order });
    }
    // intentionally excludes `query`: typing shouldn't fire a request per keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, color, order]);

  if (!open) return null;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const asset = await upload.mutateAsync(file);
      onSelect({ url: asset.url, alt: asset.alt });
    } catch (e) {
      setError(errorText(e));
    }
  };

  const runUnsplash = async () => {
    if (query.trim().length < 2) return;
    setError(null);
    try {
      await unsplash.mutateAsync(query.trim());
    } catch (e) {
      setError(errorText(e));
    }
  };

  const runStock = async () => {
    if (query.trim().length < 2) return;
    setError(null);
    try {
      await stockSearch.mutateAsync({ q: query.trim(), orientation, color, order });
    } catch (e) {
      setError(errorText(e));
    }
  };

  const pickStock = async (photo: StockPhoto) => {
    setError(null);
    setImportingId(photo.id);
    try {
      const asset = await stockImport.mutateAsync(photo.id);
      onSelect({ url: asset.url, alt: asset.alt });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setImportingId(null);
    }
  };

  const unsplashResults: UnsplashPhoto[] = unsplash.data ?? [];
  const stockResults: StockPhoto[] = stockSearch.data ?? [];
  const stockEnabled = stockStatusQuery.data?.enabled ?? true;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'library', label: 'My media' },
    { id: 'stock', label: 'Stock photos' },
    { id: 'unsplash', label: 'Unsplash' },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media picker"
        className="flex h-[34rem] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div className="flex gap-1 text-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-md px-3 py-1.5 ${
                  tab === t.id ? 'bg-black/5 font-medium' : 'text-black/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-black/50 hover:bg-black/5"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        {error ? (
          <p className="m-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {tab === 'library' ? (
          <div className="flex min-h-0 flex-1 flex-col p-4">
            <div className="mb-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={upload.isPending}
              >
                <Upload className="size-4" aria-hidden />
                {upload.isPending ? 'Uploading…' : 'Upload image'}
              </Button>
            </div>

            <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {media.data && media.data.length > 0 ? (
                media.data.map((asset) => (
                  <div key={asset.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onSelect({ url: asset.url, alt: asset.alt })}
                      className="block aspect-square w-full overflow-hidden rounded-lg border border-black/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- user uploads on the API origin */}
                      <img
                        src={asset.url}
                        alt={asset.alt ?? ''}
                        className="size-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete image"
                      onClick={() => del.mutate(asset.id)}
                      className="absolute right-1 top-1 hidden size-7 place-items-center rounded-md bg-white/90 text-red-600 group-hover:grid"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                ))
              ) : (
                <p className="col-span-full py-10 text-center text-sm text-black/40">
                  {media.isLoading
                    ? 'Loading…'
                    : 'No images yet. Upload your first one.'}
                </p>
              )}
            </div>
          </div>
        ) : tab === 'stock' ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <StockNotice />
            {stockEnabled ? (
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
                <div className="mb-2 flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void runStock()}
                    placeholder="Search Pixabay photos…"
                    className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                  />
                  <Button
                    onClick={() => void runStock()}
                    disabled={stockSearch.isPending}
                  >
                    {stockSearch.isPending ? 'Searching…' : 'Search'}
                  </Button>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                  <select
                    aria-label="Orientation"
                    value={orientation}
                    onChange={(e) =>
                      setOrientation(e.target.value as StockOrientation)
                    }
                    className="rounded-lg border border-black/15 px-2 py-1.5 outline-none focus:border-[var(--color-brand)]"
                  >
                    {ORIENTATIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Color"
                    value={color}
                    onChange={(e) => setColor(e.target.value as StockColor)}
                    className="rounded-lg border border-black/15 px-2 py-1.5 outline-none focus:border-[var(--color-brand)]"
                  >
                    {COLORS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Sort order"
                    value={order}
                    onChange={(e) => setOrder(e.target.value as StockOrder)}
                    className="rounded-lg border border-black/15 px-2 py-1.5 outline-none focus:border-[var(--color-brand)]"
                  >
                    {ORDERS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {color !== 'any' ? (
                    <span
                      aria-hidden
                      className="size-5 rounded-full border border-black/15"
                      style={{
                        background: COLORS.find((c) => c.value === color)?.swatch,
                      }}
                    />
                  ) : null}
                </div>
                <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                  {stockResults.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      title={`Photo by ${photo.author}`}
                      disabled={importingId !== null}
                      onClick={() => void pickStock(photo)}
                      className="relative block aspect-square w-full overflow-hidden rounded-lg border border-black/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- transient remote thumbnail */}
                      <img
                        src={photo.thumbUrl}
                        alt={photo.tags}
                        className="size-full object-cover"
                      />
                      {importingId === photo.id ? (
                        <span className="absolute inset-0 grid place-items-center bg-white/70">
                          <Loader2
                            className="size-5 animate-spin text-black/60"
                            aria-hidden
                          />
                        </span>
                      ) : null}
                    </button>
                  ))}
                  {stockResults.length === 0 ? (
                    <p className="col-span-full py-10 text-center text-sm text-black/40">
                      Search Pixabay for free photos — picking one saves a copy
                      to your media.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="px-4 py-10 text-center text-sm text-black/40">
                Stock photos aren’t set up yet.
              </p>
            )}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col p-4">
            <div className="mb-3 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void runUnsplash()}
                placeholder="Search free photos…"
                className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
              />
              <Button
                onClick={() => void runUnsplash()}
                disabled={unsplash.isPending}
              >
                {unsplash.isPending ? 'Searching…' : 'Search'}
              </Button>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {unsplashResults.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  title={`Photo by ${photo.author}`}
                  onClick={() => onSelect({ url: photo.url, alt: photo.alt })}
                  className="block aspect-square w-full overflow-hidden rounded-lg border border-black/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Unsplash thumbnails */}
                  <img
                    src={photo.thumbUrl}
                    alt={photo.alt}
                    className="size-full object-cover"
                  />
                </button>
              ))}
              {unsplashResults.length === 0 ? (
                <p className="col-span-full py-10 text-center text-sm text-black/40">
                  Search Unsplash for free, high-quality photos.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
