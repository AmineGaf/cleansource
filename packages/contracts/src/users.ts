import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().nullable().optional(),
  language: z.enum(['ar', 'en']).optional(),
});
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

/** Expo push token registration for order-status notifications. */
export const registerPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
});
export type RegisterPushTokenDto = z.infer<typeof registerPushTokenSchema>;
