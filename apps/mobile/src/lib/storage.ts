import * as SecureStore from 'expo-secure-store';

/** Keys are centralized so nothing scatters magic strings. */
export const StorageKeys = {
  accessToken: 'cs.accessToken',
  refreshToken: 'cs.refreshToken',
  language: 'cs.language',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export const secureStorage = {
  get: (key: StorageKey) => SecureStore.getItemAsync(key),
  set: (key: StorageKey, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: StorageKey) => SecureStore.deleteItemAsync(key),
};
