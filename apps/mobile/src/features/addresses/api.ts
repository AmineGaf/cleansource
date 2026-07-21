import {
  addressListSchema,
  addressSchema,
  type CreateAddressDto,
  type UpdateAddressDto,
} from '@cleansource/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { apiRequest } from '@/lib/api';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => apiRequest('/addresses', addressListSchema),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAddressDto) =>
      apiRequest('/addresses', addressSchema, { method: 'POST', body: dto }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: UpdateAddressDto & { id: string }) =>
      apiRequest(`/addresses/${id}`, addressSchema, { method: 'PATCH', body: dto }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/addresses/${id}`, z.object({ ok: z.literal(true) }), {
        method: 'DELETE',
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
