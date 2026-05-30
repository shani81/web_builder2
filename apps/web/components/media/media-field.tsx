'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaPicker, type PickedImage } from './media-picker';

/** Inspector control for image props: thumbnail + a Browse button → MediaPicker. */
export function MediaField({
  label,
  value,
  onPick,
  onClear,
}: {
  label: string;
  value: string;
  onPick: (image: PickedImage) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/60">{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary preview URL
        <img
          src={value}
          alt=""
          className="h-24 w-full rounded-lg border border-black/10 object-cover"
        />
      ) : (
        <div className="grid h-24 place-items-center rounded-lg border border-dashed border-black/15 text-black/30">
          <ImageIcon className="size-6" aria-hidden />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setOpen(true)}
        >
          Browse…
        </Button>
        {value ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(image) => {
          onPick(image);
          setOpen(false);
        }}
      />
    </div>
  );
}
