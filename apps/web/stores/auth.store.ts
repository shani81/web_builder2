'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PublicUser } from '@buildr/types';
import type { LoginInput, RegisterInput } from '@buildr/schemas';
import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  setSessionHint,
} from '@/lib/auth';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
  setUser: (user: PublicUser) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Authoritative check against the API; hydrates or clears the session. */
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',

      setUser: (user) => set({ user }),

      login: async (input) => {
        set({ status: 'loading' });
        try {
          const { user } = await apiLogin(input);
          setSessionHint(true);
          set({ user, status: 'authenticated' });
        } catch (error) {
          set({ status: 'unauthenticated' });
          throw error;
        }
      },

      register: async (input) => {
        set({ status: 'loading' });
        try {
          const { user } = await apiRegister(input);
          setSessionHint(true);
          set({ user, status: 'authenticated' });
        } catch (error) {
          set({ status: 'unauthenticated' });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiLogout();
        } finally {
          setSessionHint(false);
          set({ user: null, status: 'unauthenticated' });
        }
      },

      loadSession: async () => {
        set({ status: 'loading' });
        try {
          const { user } = await apiMe();
          setSessionHint(true);
          set({ user, status: 'authenticated' });
        } catch {
          setSessionHint(false);
          set({ user: null, status: 'unauthenticated' });
        }
      },
    }),
    {
      name: 'buildr-auth',
      // Persist only the user for instant UI; status is recomputed at runtime.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
