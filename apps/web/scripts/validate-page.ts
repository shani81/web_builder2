/**
 * Phase 2 — Page validator. Checks a page object against
 * builder-capabilities.json: only known components, known props, legal enum
 * values, and valid container nesting. Reads the manifest (no registry import)
 * so it runs anywhere — including the generation harness and CI.
 *
 * CLI: tsx validate-page.ts <page.json>
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MANIFEST = resolve(
  import.meta.dirname,
  '../../../builder-capabilities.json',
);

interface PropSpec {
  name: string;
  enum?: string[];
}
interface ComponentSpec {
  type: string;
  container: boolean;
  childType?: string;
  props: PropSpec[];
}
interface Manifest {
  components: ComponentSpec[];
}

export interface Violation {
  path: string;
  code:
    | 'unknown-component'
    | 'unknown-prop'
    | 'illegal-value'
    | 'illegal-child'
    | 'malformed';
  /**
   * `error` = page won't render correctly (unknown component, illegal enum
   * value, illegal nesting). `warning` = harmless (an extra/legacy prop the
   * renderer simply ignores) — does not fail validation.
   */
  severity: 'error' | 'warning';
  message: string;
}

/** Only errors fail a page; warnings are advisory. */
export function pageErrors(v: Violation[]): Violation[] {
  return v.filter((x) => x.severity === 'error');
}

type Block = {
  id?: string;
  type?: unknown;
  props?: Record<string, unknown>;
  children?: unknown;
};

// Props every block may carry regardless of component (appearance + inline fmt).
const isUniversalProp = (k: string) =>
  k === 'anchorId' || /^bx[A-Z]/.test(k) || /^fmt_/.test(k);

let cached: Manifest | null = null;
function manifest(): Manifest {
  if (!cached) cached = JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;
  return cached;
}

export function validatePage(page: { blocks?: unknown }): Violation[] {
  const m = manifest();
  const byType = new Map(m.components.map((c) => [c.type, c]));
  // feature-item is a valid child type even though it has no standalone entry.
  const childTypes = new Set(
    m.components.map((c) => c.childType).filter(Boolean) as string[],
  );
  const violations: Violation[] = [];

  const walk = (block: Block, path: string, parentType?: string) => {
    const type = typeof block.type === 'string' ? block.type : undefined;
    if (!type) {
      violations.push({
        path,
        code: 'malformed',
        severity: 'error',
        message: 'block has no type',
      });
      return;
    }
    const spec = byType.get(type);
    if (!spec) {
      // Allowed only if it's a declared child type (e.g. feature-item).
      if (!childTypes.has(type)) {
        violations.push({
          path,
          code: 'unknown-component',
          severity: 'error',
          message: `unknown component "${type}"`,
        });
        return;
      }
    }

    // Props
    const props = (block.props ?? {}) as Record<string, unknown>;
    if (spec) {
      const known = new Map(spec.props.map((p) => [p.name, p]));
      for (const [key, value] of Object.entries(props)) {
        if (isUniversalProp(key)) continue;
        const pspec = known.get(key);
        if (!pspec) {
          violations.push({
            path: `${path}.props.${key}`,
            code: 'unknown-prop',
            severity: 'warning',
            message: `"${type}" has no editor field "${key}" (extra/legacy prop — ignored by the renderer)`,
          });
          continue;
        }
        if (
          pspec.enum &&
          typeof value === 'string' &&
          !pspec.enum.includes(value)
        ) {
          violations.push({
            path: `${path}.props.${key}`,
            code: 'illegal-value',
            severity: 'error',
            message: `"${value}" not in [${pspec.enum.join(', ')}]`,
          });
        }
      }
    }

    // Children / nesting
    const children = Array.isArray(block.children)
      ? (block.children as Block[])
      : [];
    if (children.length) {
      const allowed = spec?.childType;
      children.forEach((child, i) => {
        if (
          allowed &&
          allowed !== 'any content block' &&
          typeof child.type === 'string' &&
          child.type !== allowed
        ) {
          violations.push({
            path: `${path}.children[${i}]`,
            code: 'illegal-child',
            severity: 'error',
            message: `"${type}" expects "${allowed}" children, got "${child.type}"`,
          });
        }
        walk(child, `${path}.children[${i}]`, type);
      });
    }
    void parentType;
  };

  const blocks = Array.isArray(page.blocks) ? (page.blocks as Block[]) : [];
  blocks.forEach((b, i) => walk(b, `blocks[${i}]`));
  return violations;
}

// --- CLI ---------------------------------------------------------------------
if (process.argv[1]?.replace(/\\/g, '/').endsWith('validate-page.ts')) {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: tsx validate-page.ts <page.json>');
    process.exit(2);
  }
  const page = JSON.parse(readFileSync(resolve(file), 'utf8'));
  const v = validatePage(page);
  const errors = pageErrors(v);
  for (const x of v) {
    const tag = x.severity === 'error' ? 'ERROR' : 'warn';
    console.error(`  [${tag}] ${x.code} ${x.path}: ${x.message}`);
  }
  if (errors.length === 0) {
    console.log(`✓ valid${v.length ? ` (${v.length} warning(s))` : ''}`);
  } else {
    console.error(`✗ ${errors.length} error(s)`);
    process.exit(1);
  }
}
