'use client';

import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AppWindow,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Hash,
  Link2,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  Block,
  MenuItem,
  MenuLinkType,
  MenuOpenIn,
  Page,
} from '@buildr/types';
import { newMenuItem, parseMenu, serializeMenuToLinks } from '@buildr/utils';
import { useEditorStore } from '@/stores/editor.store';
import { MENU_ICONS, MENU_ICON_KEYS } from '@/components/blocks/menu-icons';
import { Button } from '@/components/ui/button';
import { CollapsibleGroup } from '@/components/editor/collapsible-group';

const LINK_TYPES: { value: MenuLinkType; label: string; icon: typeof Hash }[] =
  [
    { value: 'page', label: 'A page', icon: FileText },
    { value: 'url', label: 'A web address', icon: Link2 },
    { value: 'anchor', label: 'A section', icon: Hash },
  ];

const OPEN_INS: { value: MenuOpenIn; label: string; icon: typeof Hash }[] = [
  { value: 'same', label: 'This window', icon: ArrowRight },
  { value: 'newTab', label: 'New tab', icon: ExternalLink },
  { value: 'newWindow', label: 'New window', icon: AppWindow },
];

function makeItem(pages: Page[]): MenuItem {
  const home = pages[0];
  return home
    ? newMenuItem({
        linkType: 'page',
        pageId: home.id,
        pageSlug: home.slug,
        url: undefined,
      })
    : newMenuItem();
}

/** Generic segmented radio control with icon + label. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string; icon: typeof Hash }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-3 gap-1 rounded-lg bg-black/5 p-1"
    >
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs transition ${
            value === v
              ? 'bg-white font-medium shadow-sm'
              : 'text-black/55 hover:text-black'
          }`}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]';

/** The link-target input (page / url / anchor) for the chosen link type. */
function LinkTargetField({
  item,
  pages,
  onChange,
}: {
  item: MenuItem;
  pages: Page[];
  onChange: (patch: Partial<MenuItem>) => void;
}) {
  const urlMissing = item.linkType === 'url' && !item.url?.trim();

  if (item.linkType === 'page') {
    return (
      <label className="flex flex-col gap-1 text-xs font-medium text-black/60">
        Page
        <select
          value={item.pageId ?? ''}
          onChange={(e) => {
            const page = pages.find((p) => p.id === e.target.value);
            onChange({ pageId: page?.id, pageSlug: page?.slug });
          }}
          className={inputCls}
        >
          {pages.length === 0 ? <option value="">No pages yet</option> : null}
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
              {p.isHome ? ' (home)' : ''}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (item.linkType === 'url') {
    return (
      <label className="flex flex-col gap-1 text-xs font-medium text-black/60">
        Web address
        <input
          value={item.url ?? ''}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="example.com"
          className={inputCls}
        />
        <span
          className={`text-[11px] font-normal ${
            urlMissing ? 'text-red-600' : 'text-black/40'
          }`}
        >
          {urlMissing
            ? 'Add a web address (e.g. example.com)'
            : 'We’ll add https:// for you if needed.'}
        </span>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-black/60">
      Section name
      <input
        value={item.anchor ?? ''}
        onChange={(e) => onChange({ anchor: e.target.value.replace(/^#/, '') })}
        placeholder="features"
        className={inputCls}
      />
      <span className="text-[11px] font-normal text-black/40">
        Jumps to a section with this name on the page.
      </span>
    </label>
  );
}

/** A compact editor row for a single sub-menu (child) item. */
function ChildItemRow({
  item,
  index,
  total,
  pages,
  onChange,
  onRemove,
  onMove,
}: {
  item: MenuItem;
  index: number;
  total: number;
  pages: Page[];
  onChange: (patch: Partial<MenuItem>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02]">
      <div className="flex items-center gap-1 p-1.5">
        <input
          aria-label="Sub-item label"
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Sub-item label"
          className="min-w-0 flex-1 rounded-md px-2 py-1 text-sm outline-none focus:bg-white"
        />
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove('up')}
            className="grid size-4 place-items-center rounded text-black/40 hover:bg-black/5 disabled:opacity-30"
          >
            <ChevronUp className="size-3" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === total - 1}
            onClick={() => onMove('down')}
            className="grid size-4 place-items-center rounded text-black/40 hover:bg-black/5 disabled:opacity-30"
          >
            <ChevronDown className="size-3" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          aria-label={open ? 'Collapse' : 'Edit link'}
          onClick={() => setOpen((v) => !v)}
          className="grid size-7 place-items-center rounded-md text-black/45 hover:bg-black/5"
        >
          <ChevronDown
            className={`size-3.5 transition ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        <button
          type="button"
          aria-label="Delete sub-item"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-red-500 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>
      {open ? (
        <div className="flex flex-col gap-2 border-t border-black/10 p-2">
          <Segmented
            ariaLabel="Link target"
            value={item.linkType}
            options={LINK_TYPES}
            onChange={(linkType) => onChange({ linkType })}
          />
          <LinkTargetField item={item} pages={pages} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
}

function MenuItemCard({
  item,
  index,
  total,
  pages,
  defaultOpen = false,
  onChange,
  onRemove,
  onMove,
}: {
  item: MenuItem;
  index: number;
  total: number;
  pages: Page[];
  defaultOpen?: boolean;
  onChange: (patch: Partial<MenuItem>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const [confirming, setConfirming] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [expanded, setExpanded] = useState(defaultOpen);

  const children = item.children ?? [];
  const setChildren = (next: MenuItem[]) =>
    onChange({ children: next.length ? next : undefined });
  const addChild = () =>
    setChildren([...children, newMenuItem({ label: 'Sub-item' })]);
  const updateChild = (cid: string, patch: Partial<MenuItem>) =>
    setChildren(children.map((c) => (c.id === cid ? { ...c, ...patch } : c)));
  const removeChild = (cid: string) =>
    setChildren(children.filter((c) => c.id !== cid));
  const moveChild = (cid: string, dir: 'up' | 'down') => {
    const from = children.findIndex((c) => c.id === cid);
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= children.length) return;
    const next = [...children];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    setChildren(next);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className={`group rounded-xl border bg-white ${
        item.visible === false
          ? 'border-dashed border-black/15'
          : 'border-black/10'
      }`}
    >
      {/* Header: drag, label, visibility, reorder, delete */}
      <div className="flex items-center gap-1.5 p-2.5">
        <button
          type="button"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
          className="grid size-8 shrink-0 cursor-grab place-items-center rounded-md text-black/40 hover:bg-black/5"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="grid size-6 shrink-0 place-items-center rounded text-black/40 hover:bg-black/5"
        >
          <ChevronDown
            className={`size-4 transition ${expanded ? '' : '-rotate-90'}`}
            aria-hidden
          />
        </button>

        <input
          aria-label="Menu item label"
          value={item.label}
          title={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Menu label"
          className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-sm font-medium outline-none focus:bg-black/[0.03]"
        />

        {item.visible === false ? (
          <EyeOff
            className="size-4 shrink-0 text-black/40"
            aria-label="Hidden"
          />
        ) : null}
      </div>

      {confirming ? (
        <div className="flex items-center justify-between gap-2 border-t border-black/10 bg-red-50/60 px-3 py-2 text-sm">
          <span className="text-red-700">Delete this item?</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={onRemove}>
              Delete
            </Button>
          </div>
        </div>
      ) : expanded ? (
        <div className="flex flex-col gap-3 border-t border-black/10 p-3">
          {/* Item actions: visibility, reorder, delete. */}
          <div className="flex items-center gap-1 border-b border-black/10 pb-2.5">
            <button
              type="button"
              aria-label={item.visible === false ? 'Show item' : 'Hide item'}
              aria-pressed={item.visible !== false}
              onClick={() => onChange({ visible: item.visible === false })}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-black/55 hover:bg-black/5"
            >
              {item.visible === false ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
              {item.visible === false ? 'Hidden' : 'Visible'}
            </button>
            <span className="flex-1" />
            <button
              type="button"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => onMove('up')}
              className="grid size-7 place-items-center rounded-md text-black/45 hover:bg-black/5 disabled:opacity-30"
            >
              <ChevronUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={index === total - 1}
              onClick={() => onMove('down')}
              className="grid size-7 place-items-center rounded-md text-black/45 hover:bg-black/5 disabled:opacity-30"
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Delete item"
              onClick={() => setConfirming(true)}
              className="grid size-7 place-items-center rounded-md text-red-500 hover:bg-red-50"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-black/60">
              Where should this link go?
            </p>
            <Segmented
              ariaLabel="Link target"
              value={item.linkType}
              options={LINK_TYPES}
              onChange={(linkType) => onChange({ linkType })}
            />
          </div>

          <LinkTargetField item={item} pages={pages} onChange={onChange} />

          <div>
            <p className="mb-1.5 text-xs font-medium text-black/60">Open in</p>
            <Segmented
              ariaLabel="Open in"
              value={item.openIn}
              options={OPEN_INS}
              onChange={(openIn) => onChange({ openIn })}
            />
          </div>

          <div className="border-t border-black/10 pt-3">
            <p className="mb-1.5 text-xs font-medium text-black/60">
              Sub-menu items
            </p>
            {children.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {children.map((child, ci) => (
                  <ChildItemRow
                    key={child.id}
                    item={child}
                    index={ci}
                    total={children.length}
                    pages={pages}
                    onChange={(patch) => updateChild(child.id, patch)}
                    onRemove={() => removeChild(child.id)}
                    onMove={(dir) => moveChild(child.id, dir)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-black/40">
                No sub-items. Add one to turn this into a dropdown.
              </p>
            )}
            <button
              type="button"
              onClick={addChild}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--color-brand)]"
            >
              <Plus className="size-3.5" aria-hidden />
              Add sub-item
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="flex items-center gap-1 self-start text-xs font-medium text-black/50 hover:text-black"
          >
            <ChevronDown
              className={`size-3.5 transition ${advanced ? 'rotate-180' : ''}`}
              aria-hidden
            />
            Advanced
          </button>

          {advanced ? (
            <div>
              <p className="mb-1.5 text-xs font-medium text-black/60">
                Icon (optional)
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  aria-label="No icon"
                  onClick={() => onChange({ icon: undefined })}
                  className={`grid size-8 place-items-center rounded-md border text-xs ${
                    !item.icon
                      ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                      : 'border-black/10 text-black/40'
                  }`}
                >
                  ✕
                </button>
                {MENU_ICON_KEYS.map((key) => {
                  const Icon = MENU_ICONS[key]!;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Icon ${key}`}
                      aria-pressed={item.icon === key}
                      onClick={() => onChange({ icon: key })}
                      className={`grid size-8 place-items-center rounded-md border ${
                        item.icon === key
                          ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                          : 'border-black/10 text-black/50 hover:bg-black/5'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Visual, structured editor for a navbar's menu links. */
export function MenuEditor({ block }: { block: Block }) {
  const pages = useEditorStore((s) => s.site?.pages ?? []);
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const items = parseMenu(block.props);
  // The most recently added item starts expanded so it can be edited at once.
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Persist to both `menu` (structured) and `links` (legacy string) for compat.
  const commit = (next: MenuItem[]) =>
    updateBlockProps(block.id, {
      menu: next,
      links: serializeMenuToLinks(next),
    });

  const update = (id: string, patch: Partial<MenuItem>) =>
    commit(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const remove = (id: string) => commit(items.filter((i) => i.id !== id));

  const add = () => {
    const created = makeItem(pages);
    setJustAddedId(created.id);
    commit([...items, created]);
  };

  const move = (id: string, dir: 'up' | 'down') => {
    const from = items.findIndex((i) => i.id === id);
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    commit(next);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    commit(next);
  };

  return (
    <CollapsibleGroup
      title="Menu links"
      summary={`${items.length} link${items.length === 1 ? '' : 's'}`}
    >
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 px-4 py-8 text-center">
          <p className="text-sm font-medium">No menu links yet</p>
          <p className="mt-1 text-xs text-black/50">
            Add your first link to build the menu.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  pages={pages}
                  defaultOpen={item.id === justAddedId}
                  onChange={(patch) => update(item.id, patch)}
                  onRemove={() => remove(item.id)}
                  onMove={(dir) => move(item.id, dir)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Button variant="outline" className="w-full" onClick={add}>
        <Plus className="size-4" aria-hidden />
        Add menu item
      </Button>
    </CollapsibleGroup>
  );
}
