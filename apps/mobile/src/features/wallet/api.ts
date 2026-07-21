import { walletSchema } from '@cleansource/contracts';
import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiRequest('/wallet', walletSchema),
  });
}
