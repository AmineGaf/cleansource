import { notificationsResponseSchema } from '@cleansource/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiRequest } from '@/lib/api';

const okSchema = z.object({ ok: z.literal(true) });

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiRequest('/notifications', notificationsResponseSchema),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/notifications/${id}/read`, okSchema, { method: 'POST' }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest('/notifications/read-all', okSchema, { method: 'POST' }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
