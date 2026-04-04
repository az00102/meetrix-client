"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 90_000,
            gcTime: 15 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { QueryProvider };
