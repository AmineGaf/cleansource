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

  const status = useAuthStore((state) => state.status);

  // Restore the session from SecureStore once on launch.
  useEffect(() => {
    void useAuthStore.getState().bootstrap();
  }, []);

  // (Re-)register the device push token whenever a session becomes active.
  useEffect(() => {
    if (status === 'authenticated') void registerPushToken();
  }, [status]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
