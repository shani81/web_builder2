'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor.store';

/** Auto-save the active page on an interval whenever it's dirty. */
export function useAutoSave(intervalMs = 30_000) {
  useEffect(() => {
    const id = setInterval(() => {
      const { isDirty, isSaving, save } = useEditorStore.getState();
      if (isDirty && !isSaving) void save();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
