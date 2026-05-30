import { LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-black/15 px-6 py-20 text-center">
      <div className="grid size-12 place-items-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
        <LayoutGrid className="size-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Create your first site</h2>
      <p className="mt-1 max-w-sm text-sm text-black/60">
        Start from scratch and design visually, or let AI generate a full draft
        from a sentence.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        Create a site
      </Button>
    </div>
  );
}
