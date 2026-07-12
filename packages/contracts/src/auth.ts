import { z } from 'zod';
import { saudiPhoneSchema } from './common';

export const requestOtpSchema = z.object({
  phone: saudiPhoneSchema,
});
export type RequestOtpDto = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: saudiPhoneSchema,
  code: z.string().regex(/^\d{4}$/, 'Code must be 4 digits'),
});
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

export const completeProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email().optional(),
});
export type CompleteProfileDto = z.infer<typeof completeProfileSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  phone: z.string(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  language: z.enum(['ar', 'en']),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
  isNewUser: z.boolean(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const otpRequestedSchema = z.object({
  sent: z.boolean(),
});
export type OtpRequested = z.infer<typeof otpRequestedSchema>;
