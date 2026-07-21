import {
  authResponseSchema,
  requestOtpResponseSchema,
} from '@cleansource/contracts';
import { useMutation } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

export function useRequestOtp() {
  return useMutation({
    mutationFn: (phone: string) =>
      apiRequest('/auth/otp/request', requestOtpResponseSchema, {
        method: 'POST',
        body: { phone },
        auth: false,
      }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (input: { phone: string; code: string }) =>
      apiRequest('/auth/otp/verify', authResponseSchema, {
        method: 'POST',
        body: input,
        auth: false,
      }),
  });
}
