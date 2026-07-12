import {
  authResponseSchema,
  authUserSchema,
  otpRequestedSchema,
  type AuthResponse,
  type AuthUser,
  type CompleteProfileDto,
  type OtpRequested,
} from '@cleansource/contracts';

import { apiRequest } from '@/lib/api';

export const authApi = {
  requestOtp: (phone: string): Promise<OtpRequested> =>
    apiRequest('/auth/otp/request', otpRequestedSchema, {
      method: 'POST',
      body: { phone },
      auth: false,
    }),

  verifyOtp: (phone: string, code: string): Promise<AuthResponse> =>
    apiRequest('/auth/otp/verify', authResponseSchema, {
      method: 'POST',
      body: { phone, code },
      auth: false,
    }),

  me: (): Promise<AuthUser> => apiRequest('/auth/me', authUserSchema),

  completeProfile: (dto: CompleteProfileDto): Promise<AuthUser> =>
    apiRequest('/users/me', authUserSchema, { method: 'PATCH', body: dto }),
};
