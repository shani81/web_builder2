/**
 * Phase 1 — Capture builder capabilities by introspecting the REAL code.
 *
 * Imports the live block registry + schemas and emits a canonical manifest
 * (builder-capabilities.json) plus a human summary (capabilities.md). The
 * manifest is the single source of truth the AI assistant is constrained by
 * and the page validator enforces. A content hash makes drift detectable.
 *
 * Run: pnpm sync:build   (or sync:check to verify the committed manifest)
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLOCK_REGISTRY, PALETTE_BLOCKS } from '@/components/blocks/registry';
import type { InspectorField } from '@/components/blocks/types';
import { blockTypeSchema, siteThemeSchema } from '@buildr/schemas';

const ROOT = resolve(import.meta.dirname, '../../..');

/** Container blocks hold child blocks; record what each accepts. */
const CONTAINER_CHILDREN: Record<string, string> = {
  section: 'column',
  column: 'any content block',
  features: 'feature-item',
};

interface PropSpec {
  name: string;
  control: InspectorField['type'];
  required: boolean;
  default: unknown;
  enum?: string[];
  hint?: string;
  group?: string;
  advanced?: boolean;
}

interface ComponentSpec {
  type: string;
  label: string;
  category: string;
  inPalette: boolean;
  container: boolean;
  childType?: string;
  props: PropSpec[];
}

const paletteTypes = new Set(PALETTE_BLOCKS.map((b) => b.type));

const components: ComponentSpec[] = Object.values(BLOCK_REGISTRY).map(
  (def) => ({
    type: def.type,
    label: def.label,
    category: def.category,
    inPalette: paletteTypes.has(def.type),
    container: def.type in CONTAINER_CHILDREN,
    childType: CONTAINER_CHILDREN[def.type],
    props: def.fields.map(
      (f): PropSpec => ({
        name: f.key,
        control: f.type,
        // The builder has no "required" concept — every prop has a default.
        required: false,
        default: def.defaultProps[f.key],
        ...(f.options ? { enum: f.options.map((o) => o.value) } : {}),
        ...(f.hint ? { hint: f.hint } : {}),
        ...(f.group ? { group: f.group } : {}),
        ...(f.advanced ? { advanced: true } : {}),
      }),
    ),
  }),
);

// Token enums introspected from the theme schema; colours are free hex values.
const themeShape = siteThemeSchema.shape;
const enumOf = (key: keyof typeof themeShape): string[] | undefined => {
  const s = themeShape[key] as { options?: string[] };
  return Array.isArray(s.options) ? s.options : undefined;
};

const tokens = {
  colors: {
    fields: [
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'backgroundColor',
      'textColor',
    ],
    format: 'hex (#rgb or #rrggbb)',
  },
  fonts: { fields: ['fontHeading', 'fontBody'], note: 'font family name' },
  borderRadius: enumOf('borderRadius'),
  spacing: enumOf('spacing'),
  defaults: {
    primaryColor: '#4F6EF7',
    secondaryColor: '#0F0F12',
    accentColor: '#22C55E',
    backgroundColor: '#FFFFFF',
    textColor: '#0F0F12',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    borderRadius: 'md',
    spacing: 'normal',
  },
  breakpoints: {
    note: 'container-query based',
    mobile: '<768px (1 column)',
    tablet: '768–1023px',
    desktop: '≥1024px',
  },
};

const pageSchema = {
  page: { title: 'string', blocks: 'Block[]', seo: 'optional' },
  block: {
    id: 'string',
    type: 'one of allowedBlockTypes',
    props: 'object (per component)',
    styles: 'Record<string, string|number>',
    children: 'Block[] (containers only)',
    locked: 'boolean',
    visible: 'boolean',
    responsive: '{ desktop:{}, tablet:{}, mobile:{} }',
  },
  allowedBlockTypes: blockTypeSchema.options,
};

const limits = {
  maxNesting: 'section → column → content (1 level of columns)',
  appearanceProps: 'bx* (bxBg, bxRadius, bxWidth, bxPadTop, bxPadBottom)',
  textFormatProps: 'fmt_<field> = { bold, italic, underline, color, align }',
};

const core = { components, tokens, pageSchema, limits };
const hash = createHash('sha256')
  .update(JSON.stringify(core))
  .digest('hex')
  .slice(0, 16);

const manifestPath = resolve(ROOT, 'builder-capabilities.json');

// `--check`: fail loudly if the live code drifted from the committed manifest.
if (process.argv.includes('--check')) {
  if (!existsSync(manifestPath)) {
    console.error(
      '✗ builder-capabilities.json is missing. Run `pnpm sync:build`.',
    );
    process.exit(1);
  }
  const existing = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    hash?: string;
  };
  if (existing.hash !== hash) {
    console.error(
      `✗ Capability drift: builder changed (manifest hash ${existing.hash} → live ${hash}).\n` +
        '  The registry/tokens no longer match the manifest. Run `pnpm sync:build` and review.',
    );
    process.exit(1);
  }
  console.log(`✓ In sync (hash ${hash}).`);
  process.exit(0);
}

const manifest = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  hash,
  ...core,
};

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// ---- Human-readable summary -------------------------------------------------
const md: string[] = [
  '# Builder Capabilities',
  '',
  `> Generated from the live registry + schemas. Hash \`${hash}\`. Do not edit by hand — run \`pnpm sync:build\`.`,
  '',
  `**Blocks:** ${components.length} (${
    components.filter((c) => c.inPalette).length
  } in palette). **Containers:** ${components
    .filter((c) => c.container)
    .map((c) => c.type)
    .join(', ')}.`,
  '',
  '## Components',
  '',
];
for (const c of components) {
  md.push(
    `### \`${c.type}\`${c.inPalette ? '' : ' _(not in palette)_'} — ${c.label} _(${c.category})_`,
  );
  if (c.container) md.push(`- container of: **${c.childType}**`);
  for (const p of c.props) {
    const enumStr = p.enum
      ? ` — one of: ${p.enum.map((e) => `\`${e || '(default)'}\``).join(', ')}`
      : '';
    const def =
      p.default === undefined || p.default === ''
        ? ''
        : ` _(default: \`${JSON.stringify(p.default)}\`)_`;
    md.push(`- \`${p.name}\` (${p.control})${enumStr}${def}`);
  }
  md.push('');
}
md.push('## Theme tokens', '');
md.push(`- Colors (hex): ${tokens.colors.fields.join(', ')}`);
md.push(`- Fonts: ${tokens.fonts.fields.join(', ')}`);
md.push(`- borderRadius: ${tokens.borderRadius?.join(', ')}`);
md.push(`- spacing: ${tokens.spacing?.join(', ')}`);
md.push('');
md.push('## Page schema', '');
md.push('```json');
md.push(JSON.stringify(pageSchema.block, null, 2));
md.push('```');
md.push(`Allowed block types: ${pageSchema.allowedBlockTypes.join(', ')}`);
md.push('');

writeFileSync(resolve(ROOT, 'capabilities.md'), md.join('\n'));

console.log(
  `Wrote builder-capabilities.json (${components.length} components, hash ${hash}) + capabilities.md`,
);
