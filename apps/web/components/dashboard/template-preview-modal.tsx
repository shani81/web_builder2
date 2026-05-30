'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import type { DevicePreview } from '@buildr/types';
import { deviceWidth } from '@buildr/utils';
import { useTemplate, useUseTemplate } from '@/hooks/use-templates';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import { Button } from '@/components/ui/button';

const DEVICES: { id: DevicePreview; icon: typeof Monitor; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function TemplatePreviewModal({
  templateId,
  onClose,
}: {
  templateId: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { data: template, isLoading } = useTemplate(templateId);
  const useTpl = useUseTemplate();
  const [device, setDevice] = useState<DevicePreview>('desktop');

  useEffect(() => {
    if (!templateId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [templateId, onClose]);

  if (!templateId) return null;
  const home = template?.pages[0];

  const handleUse = async () => {
    const site = await useTpl.mutateAsync(templateId);
    router.push(`/editor/${site.id}` as Route);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-black/10 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-black/60 hover:bg-black/5"
          >
            <X className="size-4" aria-hidden />
          </button>
          <span className="font-medium">{template?.name ?? 'Preview'}</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-black/5 p-1">
          {DEVICES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={device === id}
              onClick={() => setDevice(id)}
              className={`grid size-7 place-items-center rounded-md transition ${
                device === id
                  ? 'bg-white shadow-sm'
                  : 'text-black/50 hover:text-black'
              }`}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>

        <Button onClick={handleUse} disabled={useTpl.isPending || !template}>
          {useTpl.isPending ? 'Creating…' : 'Use this template'}
        </Button>
      </header>

      <div className="flex-1 overflow-auto bg-black/[0.06] p-8">
        {isLoading || !home ? (
          <div className="grid h-full place-items-center text-sm text-black/40">
            Loading preview…
          </div>
        ) : (
          <div
            className="mx-auto bg-white shadow-sm transition-all"
            style={{ width: deviceWidth(device) }}
          >
            {home.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
