'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from '@buildr/schemas';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Modal } from '@/components/ui/modal';
import { useAuthStore } from '@/stores/auth.store';
import { ApiClientError } from '@/lib/api-client';
import { AiKeySection } from '@/components/settings/ai-key-section';
import { StockKeySection } from '@/components/settings/stock-key-section';
import {
  apiChangePassword,
  apiDeleteAccount,
  apiUpdateProfile,
  setSessionHint,
} from '@/lib/auth';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-black/60">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '', timezone: user?.timezone ?? 'UTC' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    setFormError(null);
    try {
      const { user: updated } = await apiUpdateProfile(values);
      setUser(updated);
      setSaved(true);
    } catch (error) {
      setFormError(
        error instanceof ApiClientError ? error.message : 'Could not save.',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField label="Name" error={errors.name?.message} {...register('name')} />
      <TextField
        label="Timezone"
        error={errors.timezone?.message}
        {...register('timezone')}
      />
      <p className="text-sm text-black/50">
        Email: <span className="font-medium">{user?.email}</span>
      </p>
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      {saved ? <p className="text-sm text-green-600">Saved.</p> : null}
      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setDone(false);
    setFormError(null);
    try {
      await apiChangePassword(values);
      reset();
      setDone(true);
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Could not change password.',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      {done ? <p className="text-sm text-green-600">Password updated.</p> : null}
      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </div>
    </form>
  );
}

function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    setBusy(true);
    try {
      await apiDeleteAccount();
      setSessionHint(false);
      useAuthStore.setState({ user: null, status: 'unauthenticated' });
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
      <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
      <p className="mt-1 text-sm text-black/60">
        Permanently delete your account and all of your sites. This cannot be
        undone.
      </p>
      <Button variant="danger" className="mt-4" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        description="All your sites and data will be permanently removed."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={busy} onClick={deleteAccount}>
            {busy ? 'Deleting…' : 'Delete everything'}
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-8 flex flex-col gap-6">
        <Section title="Profile" description="Update your personal details.">
          <ProfileForm />
        </Section>
        <Section title="Password" description="Change your password.">
          <PasswordForm />
        </Section>
        <AiKeySection />
        <StockKeySection />
        <DangerZone />
      </div>
    </div>
  );
}
