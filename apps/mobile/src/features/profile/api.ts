import { authUserSchema, type UpdateProfileDto } from '@cleansource/contracts';
import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api';

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      apiRequest('/users/me', authUserSchema, { method: 'PATCH', body: dto }),
    onSuccess: (user) => setUser(user),
  });
}
