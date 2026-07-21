import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { z } from 'zod';

import { apiRequest } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Asks for permission, fetches the Expo push token and registers it with the
 * API so the backend can send order-status updates. Safe to call on every
 * sign-in — it no-ops on simulators, denied permission, or missing EAS config.
 */
export async function registerPushToken(): Promise<void> {
  try {
    if (!Device.isDevice) return;
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    const permission = existing.granted
      ? existing
      : await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    // Available once the project is linked to EAS (eas init / eas build).
    const projectId: unknown =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (typeof projectId !== 'string' || !projectId) return;

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await apiRequest('/users/me/push-token', z.object({ ok: z.literal(true) }), {
      method: 'POST',
      body: { token, platform: Platform.OS },
    });
  } catch {
    // Push registration must never block the auth flow.
  }
}
