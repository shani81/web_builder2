'use client';

import { createContext, useContext } from 'react';

/**
 * Lets text-bearing blocks render an inline (on-canvas) editor when shown in
 * the builder, while staying plain text everywhere else. The editor canvas
 * provides `enabled: true` + a `commit` that writes back to the store; with no
 * provider (e.g. the published site) the default `enabled: false` means blocks
 * render their text as-is — so published output never contains contentEditable
 * or stored HTML.
 */
export interface InlineEdit {
  enabled: boolean;
  commit: (blockId: string, field: string, value: string) => void;
}

const InlineEditContext = createContext<InlineEdit>({
  enabled: false,
  commit: () => {},
});

export const InlineEditProvider = InlineEditContext.Provider;

export function useInlineEdit(): InlineEdit {
  return useContext(InlineEditContext);
}
