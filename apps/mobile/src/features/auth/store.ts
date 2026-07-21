import { authUserSchema, type AuthUser } from '@cleansource/contracts';
import { create } from 'zustand';

import { ApiError, apiRequest, setOnSessionExpired } from '@/lib/api';
import { secureStorage, StorageKeys } from '@/lib/storage';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  /** Restores the session from SecureStore on app launch. */
  bootstrap: () => Promise<void>;
  signIn: (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  bootstrap: async () => {
    const token = await secureStorage.get(StorageKeys.accessToken);
    if (!token) {
      set({ status: 'guest' });
      return;
    }
    try {
      const user = await apiRequest('/users/me', authUserSchema);
      set({ user, status: 'authenticated' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({ user: null, status: 'guest' });
      } else {
        // Offline or server down — keep the session; data loads when back online.
        set({ status: 'authenticated' });
      }
    }
  },

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

  setUser: (user) => set({ user }),
}));

// When a token refresh fails mid-session, drop straight to the auth flow.
setOnSessionExpired(() => {
  void useAuthStore.getState().signOut();
});
