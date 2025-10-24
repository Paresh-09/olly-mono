// app/providers/tanstack-provider.tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function TanStackProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 10_000,
          gcTime: 300_000,
          retry: 1,
          throwOnError: false,
          retryOnMount: true,
        },
        mutations: {
          retry: false,
          throwOnError: true,
        },
      },
    })
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom"
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </>
  );
}