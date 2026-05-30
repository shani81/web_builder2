'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Monitor,
  Plus,
  Redo2,
  Search,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
} from 'lucide-react';
import type { DevicePreview } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { Button } from '@/components/ui/button';
import { PublishDialog } from './publish-dialog';
import { SeoDialog } from './seo-dialog';

const DEVICES: { id: DevicePreview; label: string; icon: typeof Monitor }[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

function SaveStatus() {
  const isSaving = useEditorStore((s) => s.isSaving);
  const isDirty = useEditorStore((s) => s.isDirty);

  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-black/50">
        <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
      </span>
    );
  }
  if (isDirty) {
    return <span className="text-xs text-amber-600">Unsaved changes</span>;
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-green-600">
      <Check className="size-3.5" aria-hidden /> All changes saved
    </span>
  );
}

export function Toolbar() {
  const site = useEditorStore((s) => s.site);
  const devicePreview = useEditorStore((s) => s.devicePreview);
  const setDevicePreview = useEditorStore((s) => s.setDevicePreview);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const save = useEditorStore((s) => s.save);
  const isSaving = useEditorStore((s) => s.isSaving);
  const toggleAIPanel = useEditorStore((s) => s.toggleAIPanel);
  const isAIPanelOpen = useEditorStore((s) => s.isAIPanelOpen);
  const [publishOpen, setPublishOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-black/10 bg-white px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="grid size-8 place-items-center rounded-lg text-black/60 transition hover:bg-black/5"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <span className="text-sm font-medium">{site?.name}</span>
        <button
          type="button"
          onClick={() => toggleAIPanel()}
          aria-pressed={isAIPanelOpen}
          className={`ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            isAIPanelOpen
              ? 'bg-[var(--color-brand)] text-white'
              : 'text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10'
          }`}
        >
          <Sparkles className="size-4" aria-hidden />
          AI
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-black/5 p-1">
        {DEVICES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={`${label} preview`}
            aria-pressed={devicePreview === id}
            onClick={() => setDevicePreview(id)}
            className={`grid size-7 place-items-center rounded-md transition ${
              devicePreview === id
                ? 'bg-white shadow-sm'
                : 'text-black/50 hover:text-black'
            }`}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            title="Zoom out"
            onClick={() => setZoom(zoom - 0.1)}
            className="grid size-7 place-items-center rounded-md text-black/60 transition hover:bg-black/5"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-10 text-center text-xs tabular-nums text-black/60">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            title="Zoom in"
            onClick={() => setZoom(zoom + 0.1)}
            className="grid size-7 place-items-center rounded-md text-black/60 transition hover:bg-black/5"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <div className="h-5 w-px bg-black/10" />

        <button
          type="button"
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={undo}
          className="grid size-7 place-items-center rounded-md text-black/60 transition hover:bg-black/5 disabled:opacity-30"
        >
          <Undo2 className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={redo}
          className="grid size-7 place-items-center rounded-md text-black/60 transition hover:bg-black/5 disabled:opacity-30"
        >
          <Redo2 className="size-4" aria-hidden />
        </button>

        <div className="h-5 w-px bg-black/10" />

        <button
          type="button"
          onClick={() => setSeoOpen(true)}
          aria-label="Page SEO"
          title="Page SEO"
          className="grid size-8 place-items-center rounded-md text-black/60 transition hover:bg-black/5"
        >
          <Search className="size-4" aria-hidden />
        </button>

        <SaveStatus />
        <Button
          variant="outline"
          size="sm"
          onClick={() => void save()}
          disabled={isSaving}
        >
          Save
        </Button>
        <Button size="sm" onClick={() => setPublishOpen(true)}>
          Publish
        </Button>
      </div>

      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} />
      <SeoDialog open={seoOpen} onClose={() => setSeoOpen(false)} />
    </header>
  );
}
