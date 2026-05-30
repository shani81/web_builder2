'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQueryClient } from '@tanstack/react-query';
import { PenLine, Sparkles } from 'lucide-react';
import { createSiteSchema, type CreateSiteInput } from '@buildr/schemas';
import { slugify } from '@buildr/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ApiClientError } from '@/lib/api-client';
import { generateSite } from '@/lib/ai';
import { useCreateSite } from '@/hooks/use-sites';

function aiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.code === 'AI_DISABLED'
      ? 'AI is disabled. Set ANTHROPIC_API_KEY on the API server to enable it.'
      : error.message;
  }
  return 'Generation failed. Please try again.';
}

function BlankForm({ onClose }: { onClose: () => void }) {
  const createSite = useCreateSite();
  const [formError, setFormError] = useState<string | null>(null);
  const [subdomainTouched, setSubdomainTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: { name: '', subdomain: '' },
  });

  const nameField = register('name');
  const subdomainField = register('subdomain');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createSite.mutateAsync(values);
      onClose();
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.code === 'CONFLICT') {
          setError('subdomain', { message: error.message });
          return;
        }
        setFormError(error.message);
        return;
      }
      setFormError('Something went wrong. Please try again.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <TextField
        label="Site name"
        autoFocus
        error={errors.name?.message}
        {...nameField}
        onChange={(e) => {
          nameField.onChange(e);
          if (!subdomainTouched) {
            setValue('subdomain', slugify(e.target.value).slice(0, 63), {
              shouldValidate: true,
            });
          }
        }}
      />

      <div>
        <TextField
          label="Subdomain"
          error={errors.subdomain?.message}
          {...subdomainField}
          onChange={(e) => {
            setSubdomainTouched(true);
            subdomainField.onChange(e);
          }}
        />
        <p className="mt-1 text-xs text-black/50">
          Your site will be at{' '}
          <span className="font-medium">{'{subdomain}'}.buildr.app</span>
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create site'}
        </Button>
      </div>
    </form>
  );
}

function AIGenerateForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (prompt.trim().length < 10) {
      setError('Describe your site in a bit more detail (10+ characters).');
      return;
    }
    setError(null);
    setBusy(true);
    setStatus(['Starting…']);
    try {
      await generateSite({ prompt: prompt.trim() }, (event) => {
        if (event.type === 'progress') {
          setStatus((s) => [...s, event.message]);
        } else if (event.type === 'meta') {
          setStatus((s) => [...s, `Named it “${event.name}”`]);
        } else if (event.type === 'theme') {
          setStatus((s) => [...s, 'Chose a color theme']);
        } else if (event.type === 'page') {
          setStatus((s) => [...s, `Built ${event.page.blocks.length} blocks`]);
        } else if (event.type === 'created') {
          queryClient.invalidateQueries({ queryKey: ['sites'] });
          router.push(`/editor/${event.siteId}` as Route);
        }
      });
    } catch (e) {
      setError(aiError(e));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ai-prompt" className="text-sm font-medium">
          Describe your site
        </label>
        <textarea
          id="ai-prompt"
          rows={4}
          value={prompt}
          disabled={busy}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A modern website for an Italian restaurant in Stockholm with a menu, story, and reservations."
          className="resize-none rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
        />
      </div>

      {busy ? (
        <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-black/[0.03] p-3 text-sm text-black/60">
          {status.map((line, i) => (
            <li key={i}>• {line}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={() => void generate()} disabled={busy}>
          {busy ? 'Generating…' : 'Generate site'}
        </Button>
      </div>
    </div>
  );
}

export function CreateSiteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'blank' | 'ai'>('blank');

  const close = () => {
    setMode('blank');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create a new site"
      description="Start from scratch, or let AI build a first draft."
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('blank')}
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition ${
            mode === 'blank'
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5'
              : 'border-black/10 hover:bg-black/5'
          }`}
        >
          <PenLine className="size-4" aria-hidden />
          Start blank
        </button>
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition ${
            mode === 'ai'
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5'
              : 'border-black/10 hover:bg-black/5'
          }`}
        >
          <Sparkles className="size-4 text-[var(--color-brand)]" aria-hidden />
          Generate with AI
        </button>
      </div>

      {mode === 'blank' ? (
        <BlankForm onClose={close} />
      ) : (
        <AIGenerateForm onClose={close} />
      )}
    </Modal>
  );
}
