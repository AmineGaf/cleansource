import type { AuthUser } from '@cleansource/contracts';
import { create } from 'zustand';

import { secureStorage, StorageKeys } from '@/lib/storage';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  signIn: (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'guest',

  signIn: async (user, tokens) => {
    await secureStorage.set(StorageKeys.accessToken, tokens.accessToken);
    await secureStorage.set(StorageKeys.refreshToken, tokens.refreshToken);
    set({ user, status: 'authenticated' });
  },

  signOut: async () => {
    await secureStorage.remove(StorageKeys.accessToken);
    await secureStorage.remove(StorageKeys.refreshToken);
    set({ user: null, status: 'guest' });
  },
}));
