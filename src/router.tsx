import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,   // 10 minutes cache in browser
        gcTime: 1000 * 60 * 60,      // Keep memory for 1 hour
        refetchOnWindowFocus: false, // Prevents reloading on tab switch
        refetchOnMount: false,       // Uses memory instantly
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1000 * 60 * 10,
  });

  return router;
};