'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor.store';

/**
 * Editor keyboard shortcuts:
 *  - Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z (or Ctrl+Y) redo
 *  - Cmd/Ctrl+S save
 *  - Delete/Backspace removes the selected block (unless typing in a field)
 */
export function useEditorShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = Boolean(
        target?.closest('input, textarea, select, [contenteditable="true"]'),
      );
      const mod = e.metaKey || e.ctrlKey;
      const { undo, redo, save, selectedBlockId, removeBlock } =
        useEditorStore.getState();

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void save();
        return;
      }
      if (
        !isTyping &&
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedBlockId
      ) {
        e.preventDefault();
        removeBlock(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
