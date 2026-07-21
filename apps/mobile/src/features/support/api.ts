import {
  supportTicketListSchema,
  supportTicketSchema,
  type CreateSupportTicketDto,
} from '@cleansource/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

export function useSupportTickets() {
  return useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiRequest('/support/tickets', supportTicketListSchema),
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupportTicketDto) =>
      apiRequest('/support/tickets', supportTicketSchema, {
        method: 'POST',
        body: dto,
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
  });
}
