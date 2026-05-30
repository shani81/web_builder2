'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/dashboard/sidebar';

/**
 * Authenticated shell: dark sidebar + scrollable main content. Verifies the
 * session with the API on mount (the httpOnly auth cookie isn't readable here)
 * and redirects to /login if it isn't valid. The proxy handles the instant
 * pre-render redirect; this catches expired/invalid sessions.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-black/50">
        Loading your workspace…
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="h-dvh flex-1 overflow-y-auto bg-black/[0.02]">
        {children}
      </main>
    </div>
  );
}
