import type { AuthUser } from '@cleansource/contracts';
import { create } from 'zustand';

import { secureStorage, StorageKeys } from '@/lib/storage';

import { authApi } from './api';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  /** Restore the session from secure storage on app launch. */
  hydrate: () => Promise<void>;
  signIn: (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  setUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  hydrate: async () => {
    try {
      const token = await secureStorage.get(StorageKeys.accessToken);
      if (!token) {
        set({ status: 'guest' });
        return;
      }
      const user = await authApi.me();
      set({ user, status: 'authenticated' });
    } catch {
      // Expired/invalid token (or API unreachable) — fall back to guest.
      await secureStorage.remove(StorageKeys.accessToken);
      await secureStorage.remove(StorageKeys.refreshToken);
      set({ user: null, status: 'guest' });
    }
  },

  signIn: async (user, tokens) => {
    await secureStorage.set(StorageKeys.accessToken, tokens.accessToken);
    await secureStorage.set(StorageKeys.refreshToken, tokens.refreshToken);
    set({ user, status: 'authenticated' });
  },

  setUser: (user) => set({ user }),

  signOut: async () => {
    await secureStorage.remove(StorageKeys.accessToken);
    await secureStorage.remove(StorageKeys.refreshToken);
    set({ user: null, status: 'guest' });
  },
}));
