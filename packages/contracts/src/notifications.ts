import { z } from 'zod';
import { localizedTextSchema } from './catalog';

export const notificationSchema = z.object({
  id: z.string(),
  title: localizedTextSchema,
  body: localizedTextSchema,
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

export const notificationsResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number().int(),
});
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
