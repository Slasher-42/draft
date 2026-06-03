"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 15,  // 15 min — navigating back to a page won't refetch
            gcTime: 1000 * 60 * 30,     // 30 min — keep data in memory
            retry: 3,
            // Exponential backoff: 2s → 4s → 8s instead of immediate retry on cold start
            retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 30_000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
