'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  BarChart3,
  Inbox,
  LayoutGrid,
  LayoutTemplate,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const NAV: { href: Route; label: string; icon: typeof LayoutGrid }[] = [
  { href: '/dashboard', label: 'Sites', icon: LayoutGrid },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/submissions', label: 'Submissions', icon: Inbox },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <aside className="flex h-dvh w-60 flex-col bg-[var(--color-sidebar)] px-4 py-6 text-white">
      <Link href="/dashboard" className="px-2 text-xl font-semibold tracking-tight">
        BUILDR
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-white/10 font-medium'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <div className="px-3 text-sm">
          <p className="truncate font-medium">{user?.name}</p>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}
