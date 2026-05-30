'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSite } from '@/hooks/use-sites';
import { useEditorStore } from '@/stores/editor.store';
import { Toolbar } from '@/components/editor/toolbar';
import { BlockPalette } from '@/components/editor/block-palette';
import { Canvas } from '@/components/editor/canvas';
import { Inspector } from '@/components/editor/inspector';
import { AIDrawer } from '@/components/editor/ai-drawer';
import { useAutoSave } from '@/hooks/use-autosave';
import { useEditorShortcuts } from '@/hooks/use-editor-shortcuts';

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-dvh place-items-center text-sm text-black/50">
      {children}
    </div>
  );
}

export default function EditorPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const { data: site, isLoading, isError } = useSite(siteId);

  const initialize = useEditorStore((s) => s.initialize);
  const activePageId = useEditorStore((s) => s.activePage?.id);

  useEffect(() => {
    if (!site) return;
    const page = site.pages.find((p) => p.id === pageId) ?? site.pages[0];
    if (page) initialize(site, page);
  }, [site, pageId, initialize]);

  useAutoSave();
  useEditorShortcuts();

  if (isLoading) return <CenteredMessage>Loading editor…</CenteredMessage>;
  if (isError || !site) {
    return <CenteredMessage>Couldn&apos;t load this site.</CenteredMessage>;
  }
  if (!activePageId) return <CenteredMessage>Preparing canvas…</CenteredMessage>;

  return (
    <div className="flex h-dvh flex-col">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <BlockPalette />
        <Canvas />
        <Inspector />
        <AIDrawer />
      </div>
    </div>
  );
}
