import { QueryClient } from "@tanstack/react-query";

// One global QueryClient per JS bundle (HMR-safe)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid noisy re-fetches on every window focus during development
      refetchOnWindowFocus: false,
    },
  },
}); 