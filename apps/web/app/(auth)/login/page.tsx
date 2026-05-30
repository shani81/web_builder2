'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@buildr/schemas';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { ApiClientError } from '@/lib/api-client';
import { TextField } from '@/components/ui/text-field';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      // The redirect param is arbitrary user-supplied text, so it falls
      // outside typedRoutes' known set — cast to satisfy the typed router.
      router.replace((params.get('redirect') ?? '/dashboard') as Route);
    } catch (error) {
      setFormError(
        error instanceof ApiClientError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-black/10 p-6"
      noValidate
    >
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-black/60">Log in to your account.</p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4" {...register('rememberMe')} />
        Remember me
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-center text-sm text-black/60">
        No account?{' '}
        <Link href="/register" className="font-medium text-[var(--color-brand)]">
          Create one
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  // useSearchParams must be inside a Suspense boundary.
  return (
    <Suspense fallback={<div className="h-64" />}>
      <LoginForm />
    </Suspense>
  );
}
