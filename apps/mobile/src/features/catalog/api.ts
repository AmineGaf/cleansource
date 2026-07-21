import { catalogResponseSchema } from '@cleansource/contracts';
import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: () => apiRequest('/catalog', catalogResponseSchema, { auth: false }),
    staleTime: 5 * 60_000,
  });
}
