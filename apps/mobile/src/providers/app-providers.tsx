import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/features/auth/store';
import { registerPushToken } from '@/lib/notifications';

import '@/lib/i18n';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
          },
        },
      }),
  );

  // Session hydration happens in the root layout; here we only (re-)register
  // the device push token whenever a session becomes active.
  const status = useAuthStore((state) => state.status);
  useEffect(() => {
    if (status === 'authenticated') void registerPushToken();
  }, [status]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
