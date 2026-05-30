'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { MoreHorizontal } from 'lucide-react';
import type { SiteStatus, SiteSummary } from '@buildr/types';
import { timeAgo } from '@buildr/utils';
import { Menu } from '@/components/ui/menu';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { gradientFor } from '@/lib/gradient';
import {
  useDeleteSite,
  useDuplicateSite,
  usePublishSite,
  useUpdateSite,
} from '@/hooks/use-sites';

const STATUS_STYLES: Record<SiteStatus, string> = {
  draft: 'bg-black/5 text-black/60',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

export function SiteCard({ site }: { site: SiteSummary }) {
  const router = useRouter();
  const del = useDeleteSite();
  const duplicate = useDuplicateSite();
  const publish = usePublishSite();
  const update = useUpdateSite();

  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(site.name);

  const isPublished = site.status === 'published';
  const openEditor = () => router.push(`/editor/${site.id}` as Route);

  const submitRename = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== site.name) {
      await update.mutateAsync({ id: site.id, input: { name: trimmed } });
    }
    setRenameOpen(false);
  };

  const togglePublish = () => {
    if (isPublished) {
      update.mutate({ id: site.id, input: { status: 'draft' } });
    } else {
      publish.mutate(site.id);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white transition hover:shadow-sm">
        <button
          type="button"
          onClick={openEditor}
          aria-label={`Open ${site.name} in the editor`}
          className="block h-28 w-full cursor-pointer rounded-t-2xl"
          style={{ background: gradientFor(site.name) }}
        />
        <div className="flex items-start justify-between gap-2 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-medium">{site.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[site.status]}`}
              >
                {site.status}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-black/50">
              {site.subdomain}.buildr.app
            </p>
            <p className="mt-2 text-xs text-black/40">
              {site.pageCount} {site.pageCount === 1 ? 'page' : 'pages'} ·
              Updated {timeAgo(site.updatedAt)}
            </p>
          </div>

          <Menu
            trigger={<MoreHorizontal className="size-4" aria-hidden />}
            items={[
              { label: 'Open editor', onSelect: openEditor },
              { label: 'Rename', onSelect: () => setRenameOpen(true) },
              {
                label: isPublished ? 'Unpublish' : 'Publish',
                onSelect: togglePublish,
              },
              { label: 'Duplicate', onSelect: () => duplicate.mutate(site.id) },
              {
                label: 'Delete',
                destructive: true,
                onSelect: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
      </div>

      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename site"
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="Site name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRename} disabled={update.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete site?"
        description={`"${site.name}" and all its pages will be permanently deleted. This can't be undone.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={del.isPending}
            onClick={() => del.mutate(site.id, { onSuccess: () => setDeleteOpen(false) })}
          >
            {del.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
