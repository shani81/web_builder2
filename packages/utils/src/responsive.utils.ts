import type { DevicePreview } from '@buildr/types';

/** Canvas widths (px) used for each device preview mode in the editor. */
export const DEVICE_WIDTHS: Record<DevicePreview, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
};

/** Tailwind-aligned breakpoints (px). */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Resolve a device mode to its canvas pixel width. */
export function deviceWidth(device: DevicePreview): number {
  return DEVICE_WIDTHS[device];
}

/**
 * Merge a base prop object with device-specific overrides.
 * Later (more specific) overrides win; undefined values are ignored.
 */
export function resolveResponsiveProps<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T> | undefined,
): T {
  if (!override) return base;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
