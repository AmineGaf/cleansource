import {
  orderDetailSchema,
  orderListSchema,
  orderRatingSchema,
  type CancelOrderDto,
  type CreateOrderDto,
  type RateOrderDto,
} from '@cleansource/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiRequest('/orders', orderListSchema),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiRequest(`/orders/${id}`, orderDetailSchema),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) =>
      apiRequest('/orders', orderDetailSchema, { method: 'POST', body: dto }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useCancelOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CancelOrderDto) =>
      apiRequest(`/orders/${id}/cancel`, orderDetailSchema, {
        method: 'POST',
        body: dto,
      }),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', id], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useRateOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RateOrderDto) =>
      apiRequest(`/orders/${id}/rating`, orderRatingSchema, {
        method: 'POST',
        body: dto,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}
