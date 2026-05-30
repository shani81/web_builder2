import type { Block, DevicePreview, Page, Site } from './site.types';

/** Serializable description of a block available in the palette. */
export interface BlockDefinition {
  type: Block['type'];
  label: string;
  category: 'layout' | 'content' | 'media' | 'commerce' | 'advanced';
  /** Inline SVG markup used as the palette thumbnail. */
  thumbnailSvg: string;
  /** Factory-friendly default props for a freshly dropped block. */
  defaultProps: Block['props'];
}

export interface EditorSelection {
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
}

export interface EditorViewport {
  devicePreview: DevicePreview;
  zoom: number;
}

/** Shape of the persisted editor session — mirrors the Zustand store. */
export interface EditorSnapshot {
  site: Site | null;
  activePage: Page | null;
  selection: EditorSelection;
  viewport: EditorViewport;
  isDirty: boolean;
}
