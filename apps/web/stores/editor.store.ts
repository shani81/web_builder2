'use client';

import { create } from 'zustand';
import { produce } from 'immer';
import type {
  Block,
  BlockProps,
  DevicePreview,
  EditorAction,
  Page,
  PageSEO,
  Site,
} from '@buildr/types';
import { shortId } from '@buildr/utils';
import { createBlock, createSection } from '@/components/blocks/registry';
import { savePage } from '@/lib/pages';

const MAX_HISTORY = 50;

type BlockLocation = { parent: Block[]; index: number };

/** Find the array + index holding `id`, searching nested children. */
function locateBlock(blocks: Block[], id: string): BlockLocation | null {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    if (block.id === id) return { parent: blocks, index: i };
    if (block.children) {
      const found = locateBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Find a block by id anywhere in the tree. */
export function findBlockInTree(
  blocks: Block[],
  id: string,
): Block | undefined {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockInTree(block.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/** Index of the top-level block that is, or contains, `id` (else -1). */
function topLevelIndexOf(blocks: Block[], id: string): number {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    if (block.id === id) return i;
    if (block.children && findBlockInTree(block.children, id)) return i;
  }
  return -1;
}

function idPrefix(type: Block['type']): string {
  return type === 'section' ? 'sec' : type === 'column' ? 'col' : 'blk';
}

/** Deep-clone a block subtree with fresh ids at every level. */
function cloneBlock(block: Block): Block {
  const copy = structuredClone(block);
  const reId = (b: Block) => {
    b.id = shortId(idPrefix(b.type));
    b.children?.forEach(reId);
  };
  reId(copy);
  return copy;
}
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

interface EditorState {
  site: Site | null;
  activePage: Page | null;

  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  /** When set, the next palette click inserts content into this column. */
  addTargetColumnId: string | null;
  devicePreview: DevicePreview;
  zoom: number;

  isSaving: boolean;
  isDirty: boolean;
  isAIPanelOpen: boolean;

  // History stacks of page snapshots.
  past: Page[];
  future: Page[];

  initialize: (site: Site, page: Page) => void;

  selectBlock: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  setDevicePreview: (device: DevicePreview) => void;
  setZoom: (zoom: number) => void;
  toggleAIPanel: (open?: boolean) => void;

  addBlock: (type: Block['type']) => void;
  /** Insert a Columns/Section preset (with empty columns) at the top level. */
  addSection: (layoutId: string) => void;
  /** Target a column for the next palette insertion (null clears it). */
  setAddTarget: (columnId: string | null) => void;
  removeBlock: (id: string) => void;
  updateBlockProps: (id: string, props: BlockProps) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  duplicateBlock: (id: string) => void;
  reorderBlocks: (orderedIds: string[]) => void;
  /** Apply an AI-proposed action to the page. */
  applyAiAction: (action: EditorAction) => void;
  /** Update the active page's title and/or SEO metadata. */
  updatePageMeta: (patch: { title?: string; seo?: Partial<PageSEO> }) => void;

  undo: () => void;
  redo: () => void;

  save: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => {
  /** Apply an immer mutation to the active page and record it in history. */
  const commit = (recipe: (page: Page) => void) => {
    const { activePage } = get();
    if (!activePage) return;
    const next = produce(activePage, recipe);
    if (next === activePage) return;
    set((state) => ({
      activePage: next,
      past: [...state.past, activePage].slice(-MAX_HISTORY),
      future: [],
      isDirty: true,
    }));
  };

  return {
    site: null,
    activePage: null,
    selectedBlockId: null,
    hoveredBlockId: null,
    addTargetColumnId: null,
    devicePreview: 'desktop',
    zoom: 1,
    isSaving: false,
    isDirty: false,
    isAIPanelOpen: false,
    past: [],
    future: [],

    initialize: (site, page) =>
      set({
        site,
        activePage: page,
        selectedBlockId: null,
        hoveredBlockId: null,
        addTargetColumnId: null,
        past: [],
        future: [],
        isDirty: false,
        isSaving: false,
      }),

    selectBlock: (id) => set({ selectedBlockId: id }),
    setHovered: (id) => set({ hoveredBlockId: id }),
    setDevicePreview: (device) => set({ devicePreview: device }),
    setZoom: (zoom) =>
      set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) }),
    toggleAIPanel: (open) =>
      set((state) => ({
        isAIPanelOpen: open ?? !state.isAIPanelOpen,
      })),

    addBlock: (type) => {
      const block = createBlock(type);
      const { addTargetColumnId, selectedBlockId } = get();
      commit((page) => {
        // Targeting a column's "+" inserts the content inside that column.
        if (addTargetColumnId) {
          const target = findBlockInTree(page.blocks, addTargetColumnId);
          if (target) {
            target.children ??= [];
            target.children.push(block);
            return;
          }
        }
        // Otherwise insert right after the selection (at its own level), or append.
        const loc = selectedBlockId
          ? locateBlock(page.blocks, selectedBlockId)
          : null;
        if (loc) loc.parent.splice(loc.index + 1, 0, block);
        else page.blocks.push(block);
      });
      set({ selectedBlockId: block.id, addTargetColumnId: null });
    },

    addSection: (layoutId) => {
      const section = createSection(layoutId);
      const { selectedBlockId } = get();
      commit((page) => {
        const i = selectedBlockId
          ? topLevelIndexOf(page.blocks, selectedBlockId)
          : -1;
        if (i >= 0) page.blocks.splice(i + 1, 0, section);
        else page.blocks.push(section);
      });
      set({ selectedBlockId: section.id, addTargetColumnId: null });
    },

    setAddTarget: (columnId) => set({ addTargetColumnId: columnId }),

    removeBlock: (id) => {
      commit((page) => {
        const loc = locateBlock(page.blocks, id);
        if (loc) loc.parent.splice(loc.index, 1);
      });
      if (get().selectedBlockId === id) set({ selectedBlockId: null });
    },

    updateBlockProps: (id, props) =>
      commit((page) => {
        const block = findBlockInTree(page.blocks, id);
        if (block) block.props = { ...block.props, ...props };
      }),

    moveBlock: (id, direction) =>
      commit((page) => {
        const loc = locateBlock(page.blocks, id);
        if (!loc) return;
        const target = direction === 'up' ? loc.index - 1 : loc.index + 1;
        if (target < 0 || target >= loc.parent.length) return;
        const [moved] = loc.parent.splice(loc.index, 1);
        loc.parent.splice(target, 0, moved!);
      }),

    duplicateBlock: (id) => {
      const source = findBlockInTree(get().activePage?.blocks ?? [], id);
      if (!source) return;
      const clone = cloneBlock(source);
      commit((page) => {
        const loc = locateBlock(page.blocks, id);
        if (loc) loc.parent.splice(loc.index + 1, 0, clone);
      });
      set({ selectedBlockId: clone.id });
    },

    reorderBlocks: (orderedIds) =>
      commit((page) => {
        const byId = new Map(page.blocks.map((b) => [b.id, b]));
        page.blocks = orderedIds
          .map((id) => byId.get(id))
          .filter((b): b is Block => Boolean(b));
      }),

    applyAiAction: (action) => {
      const payload = action.payload ?? {};
      // action.type is a model-supplied string; widen for comparison.
      const type = action.type as string;

      if (type === 'addBlock') {
        const blockType = (payload.blockType ?? payload.type) as
          | Block['type']
          | undefined;
        if (!blockType) return;
        get().addBlock(blockType);
        const newId = get().selectedBlockId;
        if (newId && payload.props && typeof payload.props === 'object') {
          get().updateBlockProps(newId, payload.props as BlockProps);
        }
        return;
      }

      if (type === 'removeBlock' && action.targetBlockId) {
        get().removeBlock(action.targetBlockId);
        return;
      }

      // updateBlock / updateText / changeColor all merge props into a block.
      if (
        action.targetBlockId &&
        payload.props &&
        typeof payload.props === 'object'
      ) {
        get().updateBlockProps(
          action.targetBlockId,
          payload.props as BlockProps,
        );
      }
    },

    updatePageMeta: (patch) =>
      set((state) => {
        if (!state.activePage) return {};
        return {
          activePage: {
            ...state.activePage,
            title: patch.title ?? state.activePage.title,
            seo: patch.seo
              ? { ...state.activePage.seo, ...patch.seo }
              : state.activePage.seo,
          },
          isDirty: true,
        };
      }),

    undo: () => {
      const { past, activePage } = get();
      if (past.length === 0 || !activePage) return;
      const previous = past[past.length - 1]!;
      set((state) => ({
        activePage: previous,
        past: state.past.slice(0, -1),
        future: [activePage, ...state.future],
        isDirty: true,
      }));
    },

    redo: () => {
      const { future, activePage } = get();
      if (future.length === 0 || !activePage) return;
      const next = future[0]!;
      set((state) => ({
        activePage: next,
        past: [...state.past, activePage],
        future: state.future.slice(1),
        isDirty: true,
      }));
    },

    save: async () => {
      const { site, activePage, isSaving } = get();
      if (!site || !activePage || isSaving) return;
      set({ isSaving: true });
      try {
        await savePage(site.id, activePage.id, {
          title: activePage.title,
          blocks: activePage.blocks,
          seo: activePage.seo,
        });
        set({ isDirty: false });
      } finally {
        set({ isSaving: false });
      }
    },
  };
});
