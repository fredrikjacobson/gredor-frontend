import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Backend-data (meddelanden, företagsuppgifter) ändras sällan under en
      // session; undvik onödiga omfrågningar.
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: 1,
    },
  },
});
