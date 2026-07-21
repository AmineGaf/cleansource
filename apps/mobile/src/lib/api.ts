import { tokenPairSchema } from '@cleansource/contracts';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { z } from 'zod';

import { secureStorage, StorageKeys } from './storage';

/**
 * Minimal typed API client. Every call validates the response against a
 * zod schema from @cleansource/contracts, so the server can never silently
 * hand the app a shape it doesn't expect.
 *
 * On a 401 it transparently refreshes the token pair (single-flight) and
 * retries the request once; if the refresh fails the session is cleared.
 */

/**
 * Resolution order:
 * 1. EXPO_PUBLIC_API_URL (set it when pointing at staging/production);
 * 2. the Metro host — in dev the API almost always runs on the same
 *    machine as the bundler, which also works on physical devices;
 * 3. platform fallback (Android emulators reach the host via 10.0.2.2).
 */
function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (metroHost) return `http://${metroHost}:3000`;

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';
}

export const BASE_URL = `${resolveBaseUrl()}/api/v1`;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

/** Called when a refresh fails — the auth store hooks in to sign the user out. */
let onSessionExpired: (() => void) | undefined;
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler;
}

async function rawRequest(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions,
): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await secureStorage.get(StorageKeys.accessToken);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Single-flight refresh: concurrent 401s share one refresh round-trip. */
let refreshInFlight: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const refreshToken = await secureStorage.get(StorageKeys.refreshToken);
      if (!refreshToken) return false;

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;

      const pair = tokenPairSchema.parse(await response.json());
      await secureStorage.set(StorageKeys.accessToken, pair.accessToken);
      await secureStorage.set(StorageKeys.refreshToken, pair.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  let response = await rawRequest(path, options);

  if (response.status === 401 && (options.auth ?? true)) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      response = await rawRequest(path, options);
    } else {
      await secureStorage.remove(StorageKeys.accessToken);
      await secureStorage.remove(StorageKeys.refreshToken);
      onSessionExpired?.();
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new ApiError(response.status, extractMessage(text) || response.statusText);
  }

  const json: unknown = await response.json();
  return schema.parse(json);
}

/** Nest errors arrive as {"message": "...", ...} — surface just the message. */
function extractMessage(text: string): string {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && 'message' in parsed) {
      const message = (parsed as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
  } catch {
    // not JSON — fall through
  }
  return text;
}
